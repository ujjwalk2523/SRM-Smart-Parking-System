package com.smartparking.controller;

import com.smartparking.dto.ApiResponse;
import com.smartparking.dto.vehicle.UpdateVehicleRequest;
import com.smartparking.dto.vehicle.VehicleRequest;
import com.smartparking.dto.vehicle.VehicleResponse;
import com.smartparking.security.SecurityUtils;
import com.smartparking.service.VehicleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller managing customer vehicles with owner-only access controls.
 */
@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<VehicleResponse>>> getMyVehicles() {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        List<VehicleResponse> vehicles = vehicleService.getVehiclesByUserId(currentUserId);
        return ResponseEntity.ok(ApiResponse.success(vehicles, "Vehicles retrieved successfully"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<VehicleResponse>> createVehicle(
            @Valid @RequestBody VehicleRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        VehicleResponse response = vehicleService.createVehicle(currentUserId, request);
        return new ResponseEntity<>(
                ApiResponse.success(response, "Vehicle registered successfully"),
                HttpStatus.CREATED
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleResponse>> getVehicleById(@PathVariable Long id) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        boolean isAdmin = SecurityUtils.isCurrentUserAdmin();
        VehicleResponse response = vehicleService.getVehicleById(id, currentUserId, isAdmin);
        return ResponseEntity.ok(ApiResponse.success(response, "Vehicle retrieved successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleResponse>> updateVehicle(
            @PathVariable Long id,
            @Valid @RequestBody UpdateVehicleRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        boolean isAdmin = SecurityUtils.isCurrentUserAdmin();
        VehicleResponse response = vehicleService.updateVehicle(id, currentUserId, request, isAdmin);
        return ResponseEntity.ok(ApiResponse.success(response, "Vehicle updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteVehicle(@PathVariable Long id) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        boolean isAdmin = SecurityUtils.isCurrentUserAdmin();
        vehicleService.deleteVehicle(id, currentUserId, isAdmin);
        return ResponseEntity.ok(ApiResponse.success(null, "Vehicle deleted successfully"));
    }
}
