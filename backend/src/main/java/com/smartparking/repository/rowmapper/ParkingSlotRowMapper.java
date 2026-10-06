package com.smartparking.repository.rowmapper;

import com.smartparking.model.ParkingSlot;
import com.smartparking.model.SlotStatus;
import com.smartparking.model.VehicleType;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;

public class ParkingSlotRowMapper implements RowMapper<ParkingSlot> {

    @Override
    public ParkingSlot mapRow(ResultSet rs, int rowNum) throws SQLException {
        ParkingSlot slot = new ParkingSlot();
        slot.setId(rs.getLong("id"));
        slot.setLotId(rs.getLong("lot_id"));
        slot.setSlotNumber(rs.getString("slot_number"));
        slot.setFloorLevel(rs.getInt("floor_level"));

        String typeStr = rs.getString("slot_type");
        if (typeStr != null) {
            slot.setSlotType(VehicleType.valueOf(typeStr));
        }

        String statusStr = rs.getString("status");
        if (statusStr != null) {
            slot.setStatus(SlotStatus.valueOf(statusStr));
        }

        slot.setActive(rs.getBoolean("is_active"));

        Timestamp created = rs.getTimestamp("created_at");
        if (created != null) {
            slot.setCreatedAt(created.toLocalDateTime());
        }

        Timestamp updated = rs.getTimestamp("updated_at");
        if (updated != null) {
            slot.setUpdatedAt(updated.toLocalDateTime());
        }

        return slot;
    }
}
