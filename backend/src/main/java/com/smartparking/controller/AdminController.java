package com.smartparking.controller;

import com.smartparking.dto.ApiResponse;
import com.smartparking.dto.auth.UserProfileResponse;
import com.smartparking.model.*;
import com.smartparking.repository.AuditLogRepository;
import com.smartparking.service.AdminService;
import com.smartparking.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller strictly reserved for system administrators (ROLE_ADMIN).
 * Exposes full management over infrastructure, slot operational states, bookings, and pricing.
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final AuditLogRepository auditLogRepository;
    private final AdminService adminService;

    public AdminController(UserService userService,
                           AuditLogRepository auditLogRepository,
                           AdminService adminService) {
        this.userService = userService;
        this.auditLogRepository = auditLogRepository;
        this.adminService = adminService;
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminStats() {
        Map<String, Object> stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats, "Admin statistics retrieved successfully"));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllUsers(
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "20") int limit) {
        List<UserProfileResponse> users = userService.getAllUsers(offset, limit);
        long total = userService.countUsers();

        Map<String, Object> data = new HashMap<>();
        data.put("users", users);
        data.put("total", total);
        data.put("offset", offset);
        data.put("limit", limit);

        return ResponseEntity.ok(ApiResponse.success(data, "Users retrieved successfully"));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAuditLogs(
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "50") int limit) {
        List<AuditLog> logs = auditLogRepository.findAll(offset, limit);
        long total = auditLogRepository.count();

        Map<String, Object> data = new HashMap<>();
        data.put("logs", logs);
        data.put("total", total);
        data.put("offset", offset);
        data.put("limit", limit);

        return ResponseEntity.ok(ApiResponse.success(data, "Audit logs retrieved successfully"));
    }

    // ------------------------------------------------------------------------
    // Location Management
    // ------------------------------------------------------------------------

    @GetMapping("/locations")
    public ResponseEntity<ApiResponse<List<ParkingLocation>>> getAllLocations() {
        List<ParkingLocation> locations = adminService.getAllLocations();
        return ResponseEntity.ok(ApiResponse.success(locations, "Locations retrieved successfully"));
    }

    @PostMapping("/locations")
    public ResponseEntity<ApiResponse<ParkingLocation>> createLocation(@RequestBody ParkingLocation location) {
        ParkingLocation saved = adminService.createLocation(location);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(saved, "Parking location created successfully"));
    }

    @PutMapping("/locations/{id}")
    public ResponseEntity<ApiResponse<ParkingLocation>> updateLocation(
            @PathVariable Long id,
            @RequestBody ParkingLocation location) {
        ParkingLocation updated = adminService.updateLocation(id, location);
        return ResponseEntity.ok(ApiResponse.success(updated, "Parking location updated successfully"));
    }

    @DeleteMapping("/locations/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLocation(@PathVariable Long id) {
        adminService.deleteLocation(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Parking location deleted successfully"));
    }

    // ------------------------------------------------------------------------
    // Parking Lot Management
    // ------------------------------------------------------------------------

    @GetMapping("/lots")
    public ResponseEntity<ApiResponse<List<ParkingLot>>> getAllLots() {
        List<ParkingLot> lots = adminService.getAllLots();
        return ResponseEntity.ok(ApiResponse.success(lots, "Parking lots retrieved successfully"));
    }

    @PostMapping("/lots")
    public ResponseEntity<ApiResponse<ParkingLot>> createLot(@RequestBody ParkingLot lot) {
        ParkingLot saved = adminService.createLot(lot);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(saved, "Parking lot created successfully"));
    }

    @PutMapping("/lots/{id}")
    public ResponseEntity<ApiResponse<ParkingLot>> updateLot(
            @PathVariable Long id,
            @RequestBody ParkingLot lot) {
        ParkingLot updated = adminService.updateLot(id, lot);
        return ResponseEntity.ok(ApiResponse.success(updated, "Parking lot updated successfully"));
    }

    @DeleteMapping("/lots/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLot(@PathVariable Long id) {
        adminService.deleteLot(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Parking lot deleted successfully"));
    }

    // ------------------------------------------------------------------------
    // Slot Management & Maintenance Controls
    // ------------------------------------------------------------------------

    @GetMapping("/slots")
    public ResponseEntity<ApiResponse<List<ParkingSlot>>> getSlotsByLot(@RequestParam Long lotId) {
        List<ParkingSlot> slots = adminService.getSlotsByLot(lotId);
        return ResponseEntity.ok(ApiResponse.success(slots, "Parking slots retrieved successfully"));
    }

    @PostMapping("/slots")
    public ResponseEntity<ApiResponse<ParkingSlot>> createSlot(@RequestBody ParkingSlot slot) {
        ParkingSlot saved = adminService.createSlot(slot);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(saved, "Parking slot created successfully"));
    }

    @PutMapping("/slots/{id}/status")
    public ResponseEntity<ApiResponse<ParkingSlot>> updateSlotStatus(
            @PathVariable Long id,
            @RequestParam SlotStatus status) {
        ParkingSlot updated = adminService.updateSlotStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(updated, "Slot status updated to " + status));
    }

    @DeleteMapping("/slots/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSlot(@PathVariable Long id) {
        adminService.deleteSlot(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Parking slot deleted successfully"));
    }

    // ------------------------------------------------------------------------
    // Bookings Management
    // ------------------------------------------------------------------------

    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<List<Booking>>> getAllBookings(
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "50") int limit) {
        List<Booking> bookings = adminService.getAllBookings(offset, limit);
        return ResponseEntity.ok(ApiResponse.success(bookings, "Bookings retrieved successfully"));
    }

    @PutMapping("/bookings/{id}/cancel")
    public ResponseEntity<ApiResponse<Booking>> cancelBooking(
            @PathVariable Long id,
            @RequestParam(defaultValue = "Admin cancelled") String reason) {
        Booking cancelled = adminService.cancelBooking(id, reason);
        return ResponseEntity.ok(ApiResponse.success(cancelled, "Booking cancelled by admin"));
    }

    // ------------------------------------------------------------------------
    // Pricing Rules Management
    // ------------------------------------------------------------------------

    @GetMapping("/pricing")
    public ResponseEntity<ApiResponse<List<PricingRule>>> getPricingRules(@RequestParam Long lotId) {
        List<PricingRule> rules = adminService.getPricingRulesByLot(lotId);
        return ResponseEntity.ok(ApiResponse.success(rules, "Pricing rules retrieved successfully"));
    }

    @PostMapping("/pricing")
    public ResponseEntity<ApiResponse<PricingRule>> createPricingRule(@RequestBody PricingRule rule) {
        PricingRule saved = adminService.createPricingRule(rule);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(saved, "Pricing rule created successfully"));
    }

    @PutMapping("/pricing/{id}")
    public ResponseEntity<ApiResponse<PricingRule>> updatePricingRule(
            @PathVariable Long id,
            @RequestBody PricingRule rule) {
        PricingRule updated = adminService.updatePricingRule(id, rule);
        return ResponseEntity.ok(ApiResponse.success(updated, "Pricing rule updated successfully"));
    }

    @DeleteMapping("/pricing/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePricingRule(@PathVariable Long id) {
        adminService.deletePricingRule(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Pricing rule deleted successfully"));
    }
}
