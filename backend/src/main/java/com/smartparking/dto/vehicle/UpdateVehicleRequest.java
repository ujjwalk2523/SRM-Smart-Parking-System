package com.smartparking.dto.vehicle;

import com.smartparking.model.VehicleType;
import jakarta.validation.constraints.Size;

/**
 * Data transfer object for updating an existing vehicle.
 */
public class UpdateVehicleRequest {

    @Size(min = 2, max = 20, message = "License plate must be between 2 and 20 characters")
    private String licensePlate;

    private VehicleType vehicleType;

    @Size(max = 50, message = "Make cannot exceed 50 characters")
    private String make;

    @Size(max = 50, message = "Model cannot exceed 50 characters")
    private String model;

    @Size(max = 30, message = "Color cannot exceed 30 characters")
    private String color;

    private Boolean isDefault;

    public UpdateVehicleRequest() {}

    public UpdateVehicleRequest(String licensePlate, VehicleType vehicleType, String make, String model, String color, Boolean isDefault) {
        this.licensePlate = licensePlate;
        this.vehicleType = vehicleType;
        this.make = make;
        this.model = model;
        this.color = color;
        this.isDefault = isDefault;
    }

    public String getLicensePlate() {
        return licensePlate;
    }

    public void setLicensePlate(String licensePlate) {
        this.licensePlate = licensePlate;
    }

    public VehicleType getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(VehicleType vehicleType) {
        this.vehicleType = vehicleType;
    }

    public String getMake() {
        return make;
    }

    public void setMake(String make) {
        this.make = make;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public Boolean getIsDefault() {
        return isDefault;
    }

    public void setIsDefault(Boolean isDefault) {
        this.isDefault = isDefault;
    }
}
