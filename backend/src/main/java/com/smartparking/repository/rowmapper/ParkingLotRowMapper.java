package com.smartparking.repository.rowmapper;

import com.smartparking.model.ParkingLot;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Timestamp;

public class ParkingLotRowMapper implements RowMapper<ParkingLot> {

    @Override
    public ParkingLot mapRow(ResultSet rs, int rowNum) throws SQLException {
        ParkingLot lot = new ParkingLot();
        lot.setId(rs.getLong("id"));
        lot.setLocationId(rs.getLong("location_id"));
        lot.setLotCode(rs.getString("lot_code"));
        lot.setName(rs.getString("name"));
        lot.setTotalCapacity(rs.getInt("total_capacity"));
        lot.setTotalFloors(rs.getInt("total_floors"));
        lot.setOperatingHours(rs.getString("operating_hours"));
        lot.setContactPhone(rs.getString("contact_phone"));
        lot.setImageUrl(rs.getString("image_url"));
        lot.setActive(rs.getBoolean("is_active"));

        Timestamp created = rs.getTimestamp("created_at");
        if (created != null) {
            lot.setCreatedAt(created.toLocalDateTime());
        }

        Timestamp updated = rs.getTimestamp("updated_at");
        if (updated != null) {
            lot.setUpdatedAt(updated.toLocalDateTime());
        }

        if (hasColumn(rs, "location_name")) {
            lot.setLocationName(rs.getString("location_name"));
        }

        return lot;
    }

    private boolean hasColumn(ResultSet rs, String columnName) {
        try {
            ResultSetMetaData meta = rs.getMetaData();
            int count = meta.getColumnCount();
            for (int i = 1; i <= count; i++) {
                if (columnName.equalsIgnoreCase(meta.getColumnLabel(i)) ||
                    columnName.equalsIgnoreCase(meta.getColumnName(i))) {
                    return true;
                }
            }
        } catch (SQLException ignored) {}
        return false;
    }
}
