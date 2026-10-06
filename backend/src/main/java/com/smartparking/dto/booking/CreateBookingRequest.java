package com.smartparking.dto.booking;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

/**
 * DTO for creating a new parking booking.
 * Supports both immediate ("Park Now") and scheduled ("Advanced Booking") workflows.
 */
public class CreateBookingRequest {

    @NotNull(message = "Slot ID is required")
    private Long slotId;

    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Integer durationHours;

    private Boolean isImmediate = false;

    public CreateBookingRequest() {}

    public CreateBookingRequest(Long slotId, Long vehicleId, LocalDateTime startTime, LocalDateTime endTime) {
        this.slotId = slotId;
        this.vehicleId = vehicleId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.isImmediate = false;
    }

    public Long getSlotId() { return slotId; }
    public void setSlotId(Long slotId) { this.slotId = slotId; }

    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public Integer getDurationHours() { return durationHours; }
    public void setDurationHours(Integer durationHours) { this.durationHours = durationHours; }

    public Boolean getIsImmediate() { return isImmediate; }
    public void setIsImmediate(Boolean immediate) { isImmediate = immediate; }
}
