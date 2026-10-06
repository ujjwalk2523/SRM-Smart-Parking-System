package com.smartparking.controller;

import com.smartparking.dto.ApiResponse;
import com.smartparking.dto.lot.LotAvailabilityResponse;
import com.smartparking.dto.lot.ParkingLotResponse;
import com.smartparking.dto.slot.ParkingSlotResponse;
import com.smartparking.model.SlotStatus;
import com.smartparking.model.VehicleType;
import com.smartparking.service.ParkingLotService;
import com.smartparking.service.ParkingSlotService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller providing parking lot inspection, interactive slot layouts, and real-time availability breakdown.
 */
@RestController
@RequestMapping("/api/lots")
public class ParkingLotController {

    private final ParkingLotService lotService;
    private final ParkingSlotService slotService;

    public ParkingLotController(ParkingLotService lotService, ParkingSlotService slotService) {
        this.lotService = lotService;
        this.slotService = slotService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ParkingLotResponse>>> getAllLots(
            @RequestParam(required = false) Long locationId,
            @RequestParam(defaultValue = "true") boolean onlyActive) {
        List<ParkingLotResponse> lots = lotService.getAllLots(locationId, onlyActive);
        return ResponseEntity.ok(ApiResponse.success(lots, "Parking lots retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ParkingLotResponse>> getLotById(@PathVariable Long id) {
        ParkingLotResponse lot = lotService.getLotById(id);
        return ResponseEntity.ok(ApiResponse.success(lot, "Parking lot details retrieved successfully"));
    }

    @GetMapping("/{id}/slots")
    public ResponseEntity<ApiResponse<List<ParkingSlotResponse>>> getLotSlots(
            @PathVariable Long id,
            @RequestParam(required = false) VehicleType vehicleType,
            @RequestParam(required = false) Integer floorLevel,
            @RequestParam(required = false) SlotStatus status) {
        List<ParkingSlotResponse> slots = slotService.getSlotsByLotId(id, vehicleType, floorLevel, status);
        return ResponseEntity.ok(ApiResponse.success(slots, "Parking slots retrieved successfully"));
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<ApiResponse<LotAvailabilityResponse>> getLotAvailability(@PathVariable Long id) {
        LotAvailabilityResponse availability = lotService.getLotAvailability(id);
        return ResponseEntity.ok(ApiResponse.success(availability, "Parking lot availability retrieved successfully"));
    }
}
