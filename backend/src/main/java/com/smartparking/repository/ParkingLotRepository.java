package com.smartparking.repository;

import com.smartparking.model.ParkingLot;

import java.util.List;
import java.util.Optional;

public interface ParkingLotRepository {
    Optional<ParkingLot> findById(Long id);
    Optional<ParkingLot> findByLotCode(String lotCode);
    List<ParkingLot> findByLocationId(Long locationId, boolean onlyActive);
    List<ParkingLot> findAll(boolean onlyActive);
    ParkingLot save(ParkingLot lot);
    int update(ParkingLot lot);
    int deleteById(Long id);
    long count();
}
