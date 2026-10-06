package com.smartparking.dto.lot;

import com.smartparking.dto.pricing.PricingRuleResponse;
import com.smartparking.model.ParkingLot;

import java.util.ArrayList;
import java.util.List;

/**
 * Clean data transfer object for parking lots.
 */
public class ParkingLotResponse {

    private Long id;
    private Long locationId;
    private String locationName;
    private String lotCode;
    private String name;
    private Integer totalCapacity;
    private Integer totalFloors;
    private String operatingHours;
    private String contactPhone;
    private String imageUrl;
    private boolean isActive;
    private long availableSlots;
    private List<PricingRuleResponse> pricingRules = new ArrayList<>();

    public ParkingLotResponse() {}

    public static ParkingLotResponse fromLot(ParkingLot lot, long availableSlots, List<PricingRuleResponse> pricingRules) {
        if (lot == null) return null;
        ParkingLotResponse resp = new ParkingLotResponse();
        resp.id = lot.getId();
        resp.locationId = lot.getLocationId();
        resp.locationName = lot.getLocationName();
        resp.lotCode = lot.getLotCode();
        resp.name = lot.getName();
        resp.totalCapacity = lot.getTotalCapacity();
        resp.totalFloors = lot.getTotalFloors();
        resp.operatingHours = lot.getOperatingHours();
        resp.contactPhone = lot.getContactPhone();
        resp.imageUrl = lot.getImageUrl();
        resp.isActive = lot.isActive();
        resp.availableSlots = availableSlots;
        resp.pricingRules = pricingRules != null ? pricingRules : new ArrayList<>();
        return resp;
    }

    public Long getId() {
        return id;
    }

    public Long getLocationId() {
        return locationId;
    }

    public String getLocationName() {
        return locationName;
    }

    public String getLotCode() {
        return lotCode;
    }

    public String getName() {
        return name;
    }

    public Integer getTotalCapacity() {
        return totalCapacity;
    }

    public Integer getTotalFloors() {
        return totalFloors;
    }

    public String getOperatingHours() {
        return operatingHours;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public boolean isActive() {
        return isActive;
    }

    public long getAvailableSlots() {
        return availableSlots;
    }

    public List<PricingRuleResponse> getPricingRules() {
        return pricingRules;
    }
}
