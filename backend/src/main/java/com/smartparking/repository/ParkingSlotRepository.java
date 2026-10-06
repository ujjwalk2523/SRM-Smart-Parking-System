package com.smartparking.repository;

import com.smartparking.model.ParkingSlot;
import com.smartparking.model.SlotStatus;
import com.smartparking.model.VehicleType;

import java.util.List;
import java.util.Optional;

public interface ParkingSlotRepository {
    Optional<ParkingSlot> findById(Long id);
    Optional<ParkingSlot> findByIdForUpdate(Long id);
    List<ParkingSlot> findByLotId(Long lotId);
    List<ParkingSlot> findAvailableSlots(Long lotId, VehicleType slotType);
    int updateStatus(Long slotId, SlotStatus status);
    ParkingSlot save(ParkingSlot slot);
    int update(ParkingSlot slot);
    int deleteById(Long id);
    long countByStatus(SlotStatus status);
    long countByLotAndStatus(Long lotId, SlotStatus status);
    long countTotal();
}
