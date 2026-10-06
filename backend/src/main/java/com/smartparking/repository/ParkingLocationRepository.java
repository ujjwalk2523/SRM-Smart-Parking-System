package com.smartparking.repository;

import com.smartparking.model.ParkingLocation;

import java.util.List;
import java.util.Optional;

public interface ParkingLocationRepository {
    Optional<ParkingLocation> findById(Long id);
    Optional<ParkingLocation> findByCode(String code);
    List<ParkingLocation> findAll(boolean onlyActive);
    ParkingLocation save(ParkingLocation location);
    int update(ParkingLocation location);
    int deleteById(Long id);
    long count();
}
