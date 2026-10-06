package com.smartparking.controller;

import com.smartparking.dto.ApiResponse;
import com.smartparking.dto.location.ParkingLocationResponse;
import com.smartparking.dto.lot.ParkingLotResponse;
import com.smartparking.service.LocationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Public controller providing parking location discovery and hierarchy inspection.
 */
@RestController
@RequestMapping("/api/locations")
public class LocationController {

    private final LocationService locationService;

    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ParkingLocationResponse>>> getAllLocations() {
        List<ParkingLocationResponse> locations = locationService.getAllLocations();
        return ResponseEntity.ok(ApiResponse.success(locations, "Parking locations retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ParkingLocationResponse>> getLocationById(@PathVariable Long id) {
        ParkingLocationResponse location = locationService.getLocationById(id);
        return ResponseEntity.ok(ApiResponse.success(location, "Parking location details retrieved successfully"));
    }

    @GetMapping("/{id}/lots")
    public ResponseEntity<ApiResponse<List<ParkingLotResponse>>> getLotsByLocation(@PathVariable Long id) {
        List<ParkingLotResponse> lots = locationService.getLotsByLocationId(id);
        return ResponseEntity.ok(ApiResponse.success(lots, "Parking lots retrieved successfully"));
    }
}
