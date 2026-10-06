package com.smartparking.controller;

import com.smartparking.dto.ApiResponse;
import com.smartparking.dto.session.CheckInRequest;
import com.smartparking.dto.session.CheckOutRequest;
import com.smartparking.dto.session.ParkingSessionResponse;
import com.smartparking.security.SecurityUtils;
import com.smartparking.service.ParkingSessionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller handling real-time parking entry check-in, exit checkout, and active session queries.
 */
@RestController
@RequestMapping("/api/sessions")
public class ParkingSessionController {

    private final ParkingSessionService sessionService;

    public ParkingSessionController(ParkingSessionService sessionService) {
        this.sessionService = sessionService;
    }

    @PostMapping("/check-in")
    public ResponseEntity<ApiResponse<ParkingSessionResponse>> checkIn(@Valid @RequestBody CheckInRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        ParkingSessionResponse response = sessionService.checkIn(request, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Vehicle checked in successfully"));
    }

    @PostMapping("/{bookingId}/start")
    public ResponseEntity<ApiResponse<ParkingSessionResponse>> startSession(@PathVariable Long bookingId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        ParkingSessionResponse response = sessionService.startSession(bookingId, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Parking session started successfully"));
    }

    @PostMapping("/{id}/check-out")
    public ResponseEntity<ApiResponse<ParkingSessionResponse>> checkOut(
            @PathVariable Long id,
            @RequestBody(required = false) CheckOutRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        boolean isAdmin = SecurityUtils.isCurrentUserAdmin();
        ParkingSessionResponse response = sessionService.checkOut(id, request, currentUserId, isAdmin);
        return ResponseEntity.ok(ApiResponse.success(response, "Vehicle checked out successfully"));
    }

    @PostMapping("/{sessionId}/end")
    public ResponseEntity<ApiResponse<ParkingSessionResponse>> endSession(
            @PathVariable Long sessionId,
            @RequestBody(required = false) CheckOutRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        boolean isAdmin = SecurityUtils.isCurrentUserAdmin();
        ParkingSessionResponse response = sessionService.endSession(sessionId, request, currentUserId, isAdmin);
        return ResponseEntity.ok(ApiResponse.success(response, "Parking session ended successfully"));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<ParkingSessionResponse>> getActiveSession() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        ParkingSessionResponse response = sessionService.getActiveSessionByUserId(currentUserId);
        return ResponseEntity.ok(ApiResponse.success(response, "Active session retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ParkingSessionResponse>> getSessionById(@PathVariable Long id) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        boolean isAdmin = SecurityUtils.isCurrentUserAdmin();
        ParkingSessionResponse response = sessionService.getSessionById(id, currentUserId, isAdmin);
        return ResponseEntity.ok(ApiResponse.success(response, "Session details retrieved successfully"));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<ApiResponse<ParkingSessionResponse>> getSessionByBookingId(@PathVariable Long bookingId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        boolean isAdmin = SecurityUtils.isCurrentUserAdmin();
        ParkingSessionResponse response = sessionService.getSessionByBookingId(bookingId, currentUserId, isAdmin);
        return ResponseEntity.ok(ApiResponse.success(response, "Session retrieved successfully"));
    }
}
