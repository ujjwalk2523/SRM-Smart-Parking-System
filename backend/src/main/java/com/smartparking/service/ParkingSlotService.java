package com.smartparking.service;

import com.smartparking.dto.slot.ParkingSlotResponse;
import com.smartparking.exception.BadRequestException;
import com.smartparking.exception.ResourceNotFoundException;
import com.smartparking.exception.SlotUnavailableException;
import com.smartparking.model.ParkingSlot;
import com.smartparking.model.PricingRule;
import com.smartparking.model.SlotStatus;
import com.smartparking.model.VehicleType;
import com.smartparking.repository.ParkingLotRepository;
import com.smartparking.repository.ParkingSlotRepository;
import com.smartparking.repository.PricingRuleRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service managing parking slot layouts, filtering, and strict state checks (preventing selection of MAINTENANCE or DISABLED slots).
 */
@Service
public class ParkingSlotService {

    private final ParkingSlotRepository slotRepository;
    private final ParkingLotRepository lotRepository;
    private final PricingRuleRepository pricingRuleRepository;

    public ParkingSlotService(ParkingSlotRepository slotRepository,
                              ParkingLotRepository lotRepository,
                              PricingRuleRepository pricingRuleRepository) {
        this.slotRepository = slotRepository;
        this.lotRepository = lotRepository;
        this.pricingRuleRepository = pricingRuleRepository;
    }

    public List<ParkingSlotResponse> getSlotsByLotId(Long lotId,
                                                    VehicleType vehicleType,
                                                    Integer floorLevel,
                                                    SlotStatus status) {
        if (lotRepository.findById(lotId).isEmpty()) {
            throw new ResourceNotFoundException("Parking lot not found with id: " + lotId);
        }

        List<ParkingSlot> slots = slotRepository.findByLotId(lotId);
        List<PricingRule> pricingRules = pricingRuleRepository.findByLotId(lotId);

        Map<VehicleType, PricingRule> pricingMap = new HashMap<>();
        for (PricingRule pr : pricingRules) {
            pricingMap.put(pr.getVehicleType(), pr);
        }

        return slots.stream()
                .filter(s -> vehicleType == null || s.getSlotType() == vehicleType)
                .filter(s -> floorLevel == null || (s.getFloorLevel() != null && s.getFloorLevel().equals(floorLevel)))
                .filter(s -> status == null || s.getStatus() == status)
                .map(slot -> {
                    PricingRule pr = pricingMap.get(slot.getSlotType());
                    BigDecimal base = pr != null ? pr.getBaseFare() : BigDecimal.ZERO;
                    BigDecimal hourly = pr != null ? pr.getHourlyRate() : BigDecimal.ZERO;
                    return ParkingSlotResponse.fromSlot(slot, base, hourly);
                })
                .toList();
    }

    public ParkingSlotResponse getSlotById(Long slotId) {
        ParkingSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Parking slot not found with id: " + slotId));

        PricingRule pr = pricingRuleRepository.findByLotIdAndVehicleType(slot.getLotId(), slot.getSlotType())
                .orElse(null);
        BigDecimal base = pr != null ? pr.getBaseFare() : BigDecimal.ZERO;
        BigDecimal hourly = pr != null ? pr.getHourlyRate() : BigDecimal.ZERO;

        return ParkingSlotResponse.fromSlot(slot, base, hourly);
    }

    public void validateSlotBelongsToLot(Long slotId, Long lotId) {
        ParkingSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Parking slot not found with id: " + slotId));

        if (!slot.getLotId().equals(lotId)) {
            throw new BadRequestException("Parking slot " + slotId + " does not belong to lot " + lotId,
                    "INVALID_SLOT_LOT_ASSOCIATION");
        }
    }

    public void validateSlotBookable(Long slotId) {
        ParkingSlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Parking slot not found with id: " + slotId));

        if (!slot.isActive()) {
            throw new SlotUnavailableException("Parking slot " + slot.getSlotNumber() + " is inactive", "SLOT_INACTIVE");
        }

        switch (slot.getStatus()) {
            case MAINTENANCE -> throw new SlotUnavailableException(
                    "Parking slot " + slot.getSlotNumber() + " is under maintenance and cannot be selected",
                    "SLOT_IN_MAINTENANCE"
            );
            case DISABLED -> throw new SlotUnavailableException(
                    "Parking slot " + slot.getSlotNumber() + " is disabled and cannot be selected",
                    "SLOT_DISABLED"
            );
            case OCCUPIED -> throw new SlotUnavailableException(
                    "Parking slot " + slot.getSlotNumber() + " is currently occupied",
                    "SLOT_OCCUPIED"
            );
            case RESERVED -> throw new SlotUnavailableException(
                    "Parking slot " + slot.getSlotNumber() + " is already reserved",
                    "SLOT_RESERVED"
            );
            case AVAILABLE -> {
                // Bookable
            }
        }
    }
}
