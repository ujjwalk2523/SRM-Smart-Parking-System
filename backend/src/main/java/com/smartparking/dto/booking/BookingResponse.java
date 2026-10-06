package com.smartparking.dto.booking;

import com.smartparking.model.Booking;
import com.smartparking.model.BookingStatus;
import com.smartparking.model.VehicleType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Data transfer object representing a booking record.
 */
public class BookingResponse {

    private Long id;
    private String bookingReference;
    private Long userId;
    private String userEmail;
    private Long vehicleId;
    private String licensePlate;
    private VehicleType vehicleType;
    private Long slotId;
    private String slotNumber;
    private Long lotId;
    private String lotName;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BookingStatus status;
    private BigDecimal estimatedFare;
    private BigDecimal actualFare;
    private String cancellationReason;
    private LocalDateTime cancelledAt;
    private LocalDateTime createdAt;

    public BookingResponse() {}

    public static BookingResponse fromBooking(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.id = booking.getId();
        response.bookingReference = booking.getBookingReference();
        response.userId = booking.getUserId();
        response.userEmail = booking.getUserEmail();
        response.vehicleId = booking.getVehicleId();
        response.licensePlate = booking.getLicensePlate();
        response.vehicleType = booking.getVehicleType();
        response.slotId = booking.getSlotId();
        response.slotNumber = booking.getSlotNumber();
        response.lotId = booking.getLotId();
        response.lotName = booking.getLotName();
        response.startTime = booking.getStartTime();
        response.endTime = booking.getEndTime();
        response.status = booking.getStatus();
        response.estimatedFare = booking.getEstimatedFare();
        response.actualFare = booking.getActualFare();
        response.cancellationReason = booking.getCancellationReason();
        response.cancelledAt = booking.getCancelledAt();
        response.createdAt = booking.getCreatedAt();
        return response;
    }

    public Long getId() {
        return id;
    }

    public String getBookingReference() {
        return bookingReference;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public Long getVehicleId() {
        return vehicleId;
    }

    public String getLicensePlate() {
        return licensePlate;
    }

    public VehicleType getVehicleType() {
        return vehicleType;
    }

    public Long getSlotId() {
        return slotId;
    }

    public String getSlotNumber() {
        return slotNumber;
    }

    public Long getLotId() {
        return lotId;
    }

    public String getLotName() {
        return lotName;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public BigDecimal getEstimatedFare() {
        return estimatedFare;
    }

    public BigDecimal getActualFare() {
        return actualFare;
    }

    public String getCancellationReason() {
        return cancellationReason;
    }

    public LocalDateTime getCancelledAt() {
        return cancelledAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
