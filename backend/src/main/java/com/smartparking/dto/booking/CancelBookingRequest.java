package com.smartparking.dto.booking;

import jakarta.validation.constraints.Size;

/**
 * DTO for cancelling an existing booking.
 */
public class CancelBookingRequest {

    @Size(max = 255, message = "Cancellation reason cannot exceed 255 characters")
    private String reason;

    public CancelBookingRequest() {}

    public CancelBookingRequest(String reason) {
        this.reason = reason;
    }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
