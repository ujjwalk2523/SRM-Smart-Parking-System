package com.smartparking.model;

import java.time.LocalDateTime;

public class ParkingSlot {
    private Long id;
    private Long lotId;
    private String slotNumber;
    private Integer floorLevel = 1;
    private VehicleType slotType = VehicleType.CAR;
    private SlotStatus status = SlotStatus.AVAILABLE;
    private boolean isActive = true;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ParkingSlot() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getLotId() { return lotId; }
    public void setLotId(Long lotId) { this.lotId = lotId; }

    public String getSlotNumber() { return slotNumber; }
    public void setSlotNumber(String slotNumber) { this.slotNumber = slotNumber; }

    public Integer getFloorLevel() { return floorLevel; }
    public void setFloorLevel(Integer floorLevel) { this.floorLevel = floorLevel; }

    public VehicleType getSlotType() { return slotType; }
    public void setSlotType(VehicleType slotType) { this.slotType = slotType; }

    public SlotStatus getStatus() { return status; }
    public void setStatus(SlotStatus status) { this.status = status; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
