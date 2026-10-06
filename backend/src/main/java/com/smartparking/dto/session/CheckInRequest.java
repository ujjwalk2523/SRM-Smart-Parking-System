package com.smartparking.dto.session;

import jakarta.validation.constraints.NotBlank;

/**
 * Request payload for vehicle check-in at entry barrier.
 */
public class CheckInRequest {

    @NotBlank(message = "Booking reference is required")
    private String bookingReference;

    private String entryGate = "Gate-1";

    public CheckInRequest() {}

    public CheckInRequest(String bookingReference, String entryGate) {
        this.bookingReference = bookingReference;
        this.entryGate = entryGate;
    }

    public String getBookingReference() { return bookingReference; }
    public void setBookingReference(String bookingReference) { this.bookingReference = bookingReference; }

    public String getEntryGate() { return entryGate; }
    public void setEntryGate(String entryGate) { this.entryGate = entryGate; }
}
