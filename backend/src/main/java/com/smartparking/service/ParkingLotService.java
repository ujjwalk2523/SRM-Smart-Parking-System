package com.smartparking.service;

import com.smartparking.dto.lot.LotAvailabilityResponse;
import com.smartparking.dto.lot.ParkingLotResponse;
import com.smartparking.dto.pricing.PricingRuleResponse;
import com.smartparking.exception.BadRequestException;
import com.smartparking.exception.ResourceNotFoundException;
import com.smartparking.model.*;
import com.smartparking.repository.ParkingLocationRepository;
import com.smartparking.repository.ParkingLotRepository;
import com.smartparking.repository.ParkingSlotRepository;
import com.smartparking.repository.PricingRuleRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service managing parking lot operations, hierarchy checks, and real-time availability calculations.
 */
@Service
public class ParkingLotService {

    private final ParkingLotRepository lotRepository;
    private final ParkingLocationRepository locationRepository;
    private final ParkingSlotRepository slotRepository;
    private final PricingRuleRepository pricingRuleRepository;

    public ParkingLotService(ParkingLotRepository lotRepository,
                             ParkingLocationRepository locationRepository,
                             ParkingSlotRepository slotRepository,
                             PricingRuleRepository pricingRuleRepository) {
        this.lotRepository = lotRepository;
        this.locationRepository = locationRepository;
        this.slotRepository = slotRepository;
        this.pricingRuleRepository = pricingRuleRepository;
    }

    public List<ParkingLotResponse> getAllLots(Long locationId, boolean onlyActive) {
        List<ParkingLot> lots = (locationId != null)
                ? lotRepository.findByLocationId(locationId, onlyActive)
                : lotRepository.findAll(onlyActive);

        return lots.stream().map(lot -> {
            long available = slotRepository.countByLotAndStatus(lot.getId(), SlotStatus.AVAILABLE);
            List<PricingRuleResponse> pricing = pricingRuleRepository.findByLotId(lot.getId())
                    .stream()
                    .map(PricingRuleResponse::fromPricingRule)
                    .toList();
            return ParkingLotResponse.fromLot(lot, available, pricing);
        }).toList();
    }

    public ParkingLotResponse getLotById(Long id) {
        ParkingLot lot = lotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking lot not found with id: " + id));

        long available = slotRepository.countByLotAndStatus(lot.getId(), SlotStatus.AVAILABLE);
        List<PricingRuleResponse> pricing = pricingRuleRepository.findByLotId(lot.getId())
                .stream()
                .map(PricingRuleResponse::fromPricingRule)
                .toList();

        return ParkingLotResponse.fromLot(lot, available, pricing);
    }

    public void validateLotExists(Long id) {
        if (lotRepository.findById(id).isEmpty()) {
            throw new ResourceNotFoundException("Parking lot not found with id: " + id);
        }
    }

    public void validateLotBelongsToLocation(Long lotId, Long locationId) {
        ParkingLot lot = lotRepository.findById(lotId)
                .orElseThrow(() -> new ResourceNotFoundException("Parking lot not found with id: " + lotId));

        if (!lot.getLocationId().equals(locationId)) {
            throw new BadRequestException("Parking lot " + lotId + " does not belong to location " + locationId,
                    "INVALID_LOT_LOCATION_ASSOCIATION");
        }
    }

    public LotAvailabilityResponse getLotAvailability(Long lotId) {
        ParkingLot lot = lotRepository.findById(lotId)
                .orElseThrow(() -> new ResourceNotFoundException("Parking lot not found with id: " + lotId));

        List<ParkingSlot> slots = slotRepository.findByLotId(lotId);
        List<PricingRule> pricingRules = pricingRuleRepository.findByLotId(lotId);

        Map<VehicleType, PricingRule> pricingMap = new HashMap<>();
        for (PricingRule pr : pricingRules) {
            pricingMap.put(pr.getVehicleType(), pr);
        }

        LotAvailabilityResponse response = new LotAvailabilityResponse();
        response.setLotId(lot.getId());
        response.setLotName(lot.getName());
        response.setTotalCapacity(slots.size());

        int available = 0;
        int reserved = 0;
        int occupied = 0;
        int maintenance = 0;
        int disabled = 0;

        Map<VehicleType, int[]> typeStats = new HashMap<>();
        for (VehicleType vt : VehicleType.values()) {
            typeStats.put(vt, new int[4]); // [0]=total, [1]=available, [2]=reserved, [3]=occupied
        }

        for (ParkingSlot s : slots) {
            VehicleType vt = s.getSlotType() != null ? s.getSlotType() : VehicleType.CAR;
            int[] stats = typeStats.get(vt);
            stats[0]++;

            switch (s.getStatus()) {
                case AVAILABLE -> {
                    available++;
                    stats[1]++;
                }
                case RESERVED -> {
                    reserved++;
                    stats[2]++;
                }
                case OCCUPIED -> {
                    occupied++;
                    stats[3]++;
                }
                case MAINTENANCE -> maintenance++;
                case DISABLED -> disabled++;
            }
        }

        response.setAvailableCount(available);
        response.setReservedCount(reserved);
        response.setOccupiedCount(occupied);
        response.setMaintenanceCount(maintenance);
        response.setDisabledCount(disabled);

        Map<VehicleType, LotAvailabilityResponse.VehicleTypeAvailability> breakdown = new HashMap<>();
        for (VehicleType vt : VehicleType.values()) {
            int[] stats = typeStats.get(vt);
            if (stats[0] > 0 || pricingMap.containsKey(vt)) {
                PricingRule pr = pricingMap.get(vt);
                BigDecimal base = pr != null ? pr.getBaseFare() : BigDecimal.ZERO;
                BigDecimal hourly = pr != null ? pr.getHourlyRate() : BigDecimal.ZERO;

                breakdown.put(vt, new LotAvailabilityResponse.VehicleTypeAvailability(
                        vt, stats[0], stats[1], stats[2], stats[3], base, hourly
                ));
            }
        }
        response.setBreakdown(breakdown);

        return response;
    }
}
