package com.smartparking.exception;

import org.springframework.http.HttpStatus;

public class SlotUnavailableException extends AppException {
    public SlotUnavailableException(String message) {
        super(message, HttpStatus.CONFLICT, "SLOT_UNAVAILABLE");
    }

    public SlotUnavailableException() {
        super("Parking slot is unavailable for the selected timeframe", HttpStatus.CONFLICT, "SLOT_UNAVAILABLE");
    }

    public SlotUnavailableException(String message, String errorCode) {
        super(message, HttpStatus.CONFLICT, errorCode);
    }
}
