package com.smartparking.dto.slot;

import com.smartparking.model.ParkingSlot;
import com.smartparking.model.SlotStatus;
import com.smartparking.model.VehicleType;

import java.math.BigDecimal;

/**
 * Clean data transfer object for parking slots with explicit bookable flags.
 */
public class ParkingSlotResponse {

    private Long id;
    private Long lotId;
    private String slotNumber;
    private Integer floorLevel;
    private VehicleType slotType;
    private SlotStatus status;
    private boolean isBookable;
    private boolean isActive;
    private BigDecimal baseFare;
    private BigDecimal hourlyRate;

    public ParkingSlotResponse() {}

    public static ParkingSlotResponse fromSlot(ParkingSlot slot, BigDecimal baseFare, BigDecimal hourlyRate) {
        if (slot == null) return null;
        ParkingSlotResponse resp = new ParkingSlotResponse();
        resp.id = slot.getId();
        resp.lotId = slot.getLotId();
        resp.slotNumber = slot.getSlotNumber();
        resp.floorLevel = slot.getFloorLevel();
        resp.slotType = slot.getSlotType();
        resp.status = slot.getStatus();
        resp.isActive = slot.isActive();
        // A slot is bookable ONLY if status is AVAILABLE and isActive is true
        // Slots in MAINTENANCE, DISABLED, OCCUPIED, or RESERVED cannot be booked
        resp.isBookable = slot.isActive() && slot.getStatus() == SlotStatus.AVAILABLE;
        resp.baseFare = baseFare;
        resp.hourlyRate = hourlyRate;
        return resp;
    }

    public Long getId() {
        return id;
    }

    public Long getLotId() {
        return lotId;
    }

    public String getSlotNumber() {
        return slotNumber;
    }

    public Integer getFloorLevel() {
        return floorLevel;
    }

    public VehicleType getSlotType() {
        return slotType;
    }

    public SlotStatus getStatus() {
        return status;
    }

    public boolean isBookable() {
        return isBookable;
    }

    public boolean isActive() {
        return isActive;
    }

    public BigDecimal getBaseFare() {
        return baseFare;
    }

    public BigDecimal getHourlyRate() {
        return hourlyRate;
    }
}
