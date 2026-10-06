package com.smartparking.repository;

import com.smartparking.model.Vehicle;

import java.util.List;
import java.util.Optional;

public interface VehicleRepository {
    Optional<Vehicle> findById(Long id);
    List<Vehicle> findByUserId(Long userId);
    Optional<Vehicle> findByLicensePlate(String licensePlate);
    Vehicle save(Vehicle vehicle);
    int update(Vehicle vehicle);
    int deleteById(Long id);
    void setDefaultVehicle(Long userId, Long vehicleId);
    boolean existsByLicensePlate(String licensePlate);
}
