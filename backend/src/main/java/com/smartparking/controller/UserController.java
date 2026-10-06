package com.smartparking.controller;

import com.smartparking.dto.ApiResponse;
import com.smartparking.dto.auth.UpdateProfileRequest;
import com.smartparking.dto.auth.UserProfileResponse;
import com.smartparking.dto.booking.BookingResponse;
import com.smartparking.security.SecurityUtils;
import com.smartparking.service.BookingService;
import com.smartparking.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller managing user profiles and bookings with strict IDOR prevention.
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final BookingService bookingService;

    public UserController(UserService userService, BookingService bookingService) {
        this.userService = userService;
        this.bookingService = bookingService;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getMyProfile() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        UserProfileResponse profile = userService.getProfile(currentUserId);
        return ResponseEntity.ok(ApiResponse.success(profile, "Profile retrieved successfully"));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateMyProfile(
            @Valid @RequestBody UpdateProfileRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        UserProfileResponse profile = userService.updateProfile(currentUserId, request);
        return ResponseEntity.ok(ApiResponse.success(profile, "Profile updated successfully"));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getUserById(@PathVariable Long userId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        boolean isAdmin = SecurityUtils.isCurrentUserAdmin();
        UserProfileResponse profile = userService.getUserById(userId, currentUserId, isAdmin);
        return ResponseEntity.ok(ApiResponse.success(profile, "User details retrieved successfully"));
    }

    @GetMapping("/{userId}/bookings")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getUserBookings(@PathVariable Long userId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        boolean isAdmin = SecurityUtils.isCurrentUserAdmin();

        // Enforce IDOR protection: User A cannot access User B's bookings
        if (!isAdmin && !userId.equals(currentUserId)) {
            throw new AccessDeniedException("Access denied: You cannot view another user's bookings");
        }

        List<BookingResponse> bookings = bookingService.getBookingsByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(bookings, "User bookings retrieved successfully"));
    }
}
