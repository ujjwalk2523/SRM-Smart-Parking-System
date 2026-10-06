package com.smartparking.controller;

import com.smartparking.dto.ApiResponse;
import com.smartparking.dto.booking.BookingResponse;
import com.smartparking.dto.booking.CancelBookingRequest;
import com.smartparking.dto.booking.CreateBookingRequest;
import com.smartparking.security.SecurityUtils;
import com.smartparking.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller providing booking creation, cancellation, and retrieval with IDOR protection.
 */
@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(@Valid @RequestBody CreateBookingRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        BookingResponse booking = bookingService.createBooking(request, currentUserId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(booking, "Booking created successfully"));
    }

    @RequestMapping(value = "/{id}/cancel", method = {RequestMethod.POST, RequestMethod.PUT})
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @PathVariable Long id,
            @RequestBody(required = false) CancelBookingRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        boolean isAdmin = SecurityUtils.isCurrentUserAdmin();
        String reason = (request != null) ? request.getReason() : null;
        BookingResponse cancelledBooking = bookingService.cancelBooking(id, currentUserId, isAdmin, reason);
        return ResponseEntity.ok(ApiResponse.success(cancelledBooking, "Booking cancelled successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getAllMyBookings() {
        return getMyBookings();
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMyBookings() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        List<BookingResponse> bookings = bookingService.getBookingsByUserId(currentUserId);
        return ResponseEntity.ok(ApiResponse.success(bookings, "My bookings retrieved successfully"));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<BookingResponse>> getActiveBooking() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        BookingResponse active = bookingService.getActiveBookingByUserId(currentUserId);
        return ResponseEntity.ok(ApiResponse.success(active, "Active booking retrieved successfully"));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getUpcomingBookings() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        List<BookingResponse> upcoming = bookingService.getUpcomingBookingsByUserId(currentUserId);
        return ResponseEntity.ok(ApiResponse.success(upcoming, "Upcoming bookings retrieved successfully"));
    }

    @GetMapping("/past")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getPastBookings() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        List<BookingResponse> past = bookingService.getPastBookingsByUserId(currentUserId);
        return ResponseEntity.ok(ApiResponse.success(past, "Past bookings retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(@PathVariable Long id) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        boolean isAdmin = SecurityUtils.isCurrentUserAdmin();
        BookingResponse booking = bookingService.getBookingById(id, currentUserId, isAdmin);
        return ResponseEntity.ok(ApiResponse.success(booking, "Booking retrieved successfully"));
    }

    @GetMapping("/reference/{reference}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingByReference(@PathVariable String reference) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        boolean isAdmin = SecurityUtils.isCurrentUserAdmin();
        BookingResponse booking = bookingService.getBookingByReference(reference, currentUserId, isAdmin);
        return ResponseEntity.ok(ApiResponse.success(booking, "Booking retrieved successfully"));
    }
}
