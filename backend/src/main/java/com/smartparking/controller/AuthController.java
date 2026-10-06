package com.smartparking.controller;

import com.smartparking.dto.ApiResponse;
import com.smartparking.dto.auth.AuthResponse;
import com.smartparking.dto.auth.LoginRequest;
import com.smartparking.dto.auth.RegisterRequest;
import com.smartparking.dto.auth.UserProfileResponse;
import com.smartparking.security.SecurityUtils;
import com.smartparking.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller handling user authentication, registration, logout, and token session retrieval.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest httpRequest) {
        AuthResponse response = authService.register(request, httpRequest);
        return new ResponseEntity<>(
                ApiResponse.success(response, "User registered successfully"),
                HttpStatus.CREATED
        );
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {
        AuthResponse response = authService.login(request, httpRequest);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest httpRequest) {
        Long userId = SecurityUtils.getCurrentUserPrincipal().map(p -> p.getId()).orElse(null);
        authService.logout(userId, httpRequest);
        return ResponseEntity.ok(ApiResponse.success(null, "Logged out successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getCurrentUser() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        UserProfileResponse profile = authService.getCurrentUser(currentUserId);
        return ResponseEntity.ok(ApiResponse.success(profile, "Current user profile retrieved successfully"));
    }
}
