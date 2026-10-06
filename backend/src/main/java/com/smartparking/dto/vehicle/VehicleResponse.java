package com.smartparking.dto.vehicle;

import com.smartparking.model.Vehicle;
import com.smartparking.model.VehicleType;

import java.time.LocalDateTime;

/**
 * Data transfer object for vehicle details.
 */
public class VehicleResponse {

    private Long id;
    private Long userId;
    private String licensePlate;
    private VehicleType vehicleType;
    private String make;
    private String model;
    private String color;
    private boolean isDefault;
    private LocalDateTime createdAt;

    public VehicleResponse() {}

    public VehicleResponse(Long id, Long userId, String licensePlate, VehicleType vehicleType,
                           String make, String model, String color, boolean isDefault,
                           LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.licensePlate = licensePlate;
        this.vehicleType = vehicleType;
        this.make = make;
        this.model = model;
        this.color = color;
        this.isDefault = isDefault;
        this.createdAt = createdAt;
    }

    public static VehicleResponse fromVehicle(Vehicle vehicle) {
        return new VehicleResponse(
                vehicle.getId(),
                vehicle.getUserId(),
                vehicle.getLicensePlate(),
                vehicle.getVehicleType(),
                vehicle.getMake(),
                vehicle.getModel(),
                vehicle.getColor(),
                vehicle.isDefault(),
                vehicle.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getLicensePlate() {
        return licensePlate;
    }

    public VehicleType getVehicleType() {
        return vehicleType;
    }

    public String getMake() {
        return make;
    }

    public String getModel() {
        return model;
    }

    public String getColor() {
        return color;
    }

    public boolean isDefault() {
        return isDefault;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
