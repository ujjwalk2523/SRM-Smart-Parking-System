package com.smartparking.dto.location;

import com.smartparking.model.ParkingLocation;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Clean data transfer object for parking locations.
 */
public class ParkingLocationResponse {

    private Long id;
    private String name;
    private String code;
    private String address;
    private String city;
    private String state;
    private String postalCode;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String imageUrl;
    private boolean isActive;
    private int lotCount;
    private LocalDateTime createdAt;

    public ParkingLocationResponse() {}

    public static ParkingLocationResponse fromLocation(ParkingLocation loc, int lotCount) {
        if (loc == null) return null;
        ParkingLocationResponse resp = new ParkingLocationResponse();
        resp.id = loc.getId();
        resp.name = loc.getName();
        resp.code = loc.getCode();
        resp.address = loc.getAddress();
        resp.city = loc.getCity();
        resp.state = loc.getState();
        resp.postalCode = loc.getPostalCode();
        resp.latitude = loc.getLatitude();
        resp.longitude = loc.getLongitude();
        resp.imageUrl = loc.getImageUrl();
        resp.isActive = loc.isActive();
        resp.lotCount = lotCount;
        resp.createdAt = loc.getCreatedAt();
        return resp;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getCode() {
        return code;
    }

    public String getAddress() {
        return address;
    }

    public String getCity() {
        return city;
    }

    public String getState() {
        return state;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public BigDecimal getLatitude() {
        return latitude;
    }

    public BigDecimal getLongitude() {
        return longitude;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public boolean isActive() {
        return isActive;
    }

    public int getLotCount() {
        return lotCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
