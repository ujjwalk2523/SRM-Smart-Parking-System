package com.smartparking.service;

import com.smartparking.dto.vehicle.UpdateVehicleRequest;
import com.smartparking.dto.vehicle.VehicleRequest;
import com.smartparking.dto.vehicle.VehicleResponse;
import com.smartparking.exception.BadRequestException;
import com.smartparking.exception.ResourceNotFoundException;
import com.smartparking.model.Vehicle;
import com.smartparking.model.VehicleType;
import com.smartparking.repository.VehicleRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service managing user vehicles with strict owner verification to prevent IDOR attacks.
 */
@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    public List<VehicleResponse> getVehiclesByUserId(Long userId) {
        return vehicleRepository.findByUserId(userId)
                .stream()
                .map(VehicleResponse::fromVehicle)
                .toList();
    }

    public VehicleResponse getVehicleById(Long vehicleId, Long authenticatedUserId, boolean isAdmin) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + vehicleId, "VEHICLE_NOT_FOUND"));

        if (!isAdmin && !vehicle.getUserId().equals(authenticatedUserId)) {
            throw new AccessDeniedException("Access denied: You do not own this vehicle");
        }

        return VehicleResponse.fromVehicle(vehicle);
    }

    @Transactional
    public VehicleResponse createVehicle(Long authenticatedUserId, VehicleRequest request) {
        String plate = request.getLicensePlate().trim().toUpperCase();

        if (vehicleRepository.existsByLicensePlate(plate)) {
            throw new BadRequestException("Vehicle with license plate '" + plate + "' is already registered", "DUPLICATE_LICENSE_PLATE");
        }

        Vehicle vehicle = new Vehicle();
        vehicle.setUserId(authenticatedUserId);
        vehicle.setLicensePlate(plate);
        vehicle.setVehicleType(request.getVehicleType() != null ? request.getVehicleType() : VehicleType.CAR);
        vehicle.setMake(request.getMake());
        vehicle.setModel(request.getModel());
        vehicle.setColor(request.getColor());
        vehicle.setDefault(request.isDefault());

        vehicle = vehicleRepository.save(vehicle);

        if (request.isDefault()) {
            vehicleRepository.setDefaultVehicle(authenticatedUserId, vehicle.getId());
        }

        return VehicleResponse.fromVehicle(vehicle);
    }

    @Transactional
    public VehicleResponse updateVehicle(Long vehicleId, Long authenticatedUserId, UpdateVehicleRequest request, boolean isAdmin) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + vehicleId, "VEHICLE_NOT_FOUND"));

        if (!isAdmin && !vehicle.getUserId().equals(authenticatedUserId)) {
            throw new AccessDeniedException("Access denied: You do not own this vehicle");
        }

        if (request.getLicensePlate() != null && !request.getLicensePlate().isBlank()) {
            String newPlate = request.getLicensePlate().trim().toUpperCase();
            if (!newPlate.equalsIgnoreCase(vehicle.getLicensePlate()) && vehicleRepository.existsByLicensePlate(newPlate)) {
                throw new BadRequestException("License plate '" + newPlate + "' is already in use", "DUPLICATE_LICENSE_PLATE");
            }
            vehicle.setLicensePlate(newPlate);
        }

        if (request.getVehicleType() != null) {
            vehicle.setVehicleType(request.getVehicleType());
        }
        if (request.getMake() != null) {
            vehicle.setMake(request.getMake());
        }
        if (request.getModel() != null) {
            vehicle.setModel(request.getModel());
        }
        if (request.getColor() != null) {
            vehicle.setColor(request.getColor());
        }
        if (request.getIsDefault() != null) {
            vehicle.setDefault(request.getIsDefault());
            if (request.getIsDefault()) {
                vehicleRepository.setDefaultVehicle(authenticatedUserId, vehicle.getId());
            }
        }

        vehicleRepository.update(vehicle);
        return VehicleResponse.fromVehicle(vehicle);
    }

    @Transactional
    public void deleteVehicle(Long vehicleId, Long authenticatedUserId, boolean isAdmin) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + vehicleId, "VEHICLE_NOT_FOUND"));

        if (!isAdmin && !vehicle.getUserId().equals(authenticatedUserId)) {
            throw new AccessDeniedException("Access denied: You do not own this vehicle");
        }

        vehicleRepository.deleteById(vehicleId);
    }
}
