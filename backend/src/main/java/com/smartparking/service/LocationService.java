package com.smartparking.service;

import com.smartparking.dto.location.ParkingLocationResponse;
import com.smartparking.dto.lot.ParkingLotResponse;
import com.smartparking.dto.pricing.PricingRuleResponse;
import com.smartparking.exception.ResourceNotFoundException;
import com.smartparking.model.ParkingLocation;
import com.smartparking.model.ParkingLot;
import com.smartparking.model.SlotStatus;
import com.smartparking.repository.ParkingLocationRepository;
import com.smartparking.repository.ParkingLotRepository;
import com.smartparking.repository.ParkingSlotRepository;
import com.smartparking.repository.PricingRuleRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Service managing parking location retrieval and hierarchy verification.
 */
@Service
public class LocationService {

    private final ParkingLocationRepository locationRepository;
    private final ParkingLotRepository lotRepository;
    private final ParkingSlotRepository slotRepository;
    private final PricingRuleRepository pricingRuleRepository;

    public LocationService(ParkingLocationRepository locationRepository,
                           ParkingLotRepository lotRepository,
                           ParkingSlotRepository slotRepository,
                           PricingRuleRepository pricingRuleRepository) {
        this.locationRepository = locationRepository;
        this.lotRepository = lotRepository;
        this.slotRepository = slotRepository;
        this.pricingRuleRepository = pricingRuleRepository;
    }

    public List<ParkingLocationResponse> getAllLocations() {
        List<ParkingLocation> locations = locationRepository.findAll(true);
        return locations.stream()
                .map(loc -> {
                    int count = lotRepository.findByLocationId(loc.getId(), true).size();
                    return ParkingLocationResponse.fromLocation(loc, count);
                })
                .toList();
    }

    public ParkingLocationResponse getLocationById(Long id) {
        ParkingLocation loc = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking location not found with id: " + id));

        int lotCount = lotRepository.findByLocationId(loc.getId(), true).size();
        return ParkingLocationResponse.fromLocation(loc, lotCount);
    }

    public void validateLocationExists(Long id) {
        if (locationRepository.findById(id).isEmpty()) {
            throw new ResourceNotFoundException("Parking location not found with id: " + id);
        }
    }

    public List<ParkingLotResponse> getLotsByLocationId(Long locationId) {
        validateLocationExists(locationId);

        List<ParkingLot> lots = lotRepository.findByLocationId(locationId, true);
        return lots.stream().map(this::mapToLotResponse).toList();
    }

    private ParkingLotResponse mapToLotResponse(ParkingLot lot) {
        long available = slotRepository.countByLotAndStatus(lot.getId(), SlotStatus.AVAILABLE);
        List<PricingRuleResponse> pricing = pricingRuleRepository.findByLotId(lot.getId())
                .stream()
                .map(PricingRuleResponse::fromPricingRule)
                .toList();

        return ParkingLotResponse.fromLot(lot, available, pricing);
    }
}
