package com.smartparking.exception;

import org.springframework.http.HttpStatus;

public class UnauthorizedException extends AppException {
    public UnauthorizedException(String message) {
        super(message, HttpStatus.UNAUTHORIZED, "UNAUTHORIZED");
    }

    public UnauthorizedException() {
        super("Authentication required to access this resource", HttpStatus.UNAUTHORIZED, "UNAUTHORIZED");
    }
}
