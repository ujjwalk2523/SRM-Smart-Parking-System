package com.smartparking.repository.rowmapper;

import com.smartparking.model.Vehicle;
import com.smartparking.model.VehicleType;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;

public class VehicleRowMapper implements RowMapper<Vehicle> {

    @Override
    public Vehicle mapRow(ResultSet rs, int rowNum) throws SQLException {
        Vehicle vehicle = new Vehicle();
        vehicle.setId(rs.getLong("id"));
        vehicle.setUserId(rs.getLong("user_id"));
        vehicle.setLicensePlate(rs.getString("license_plate"));

        String typeStr = rs.getString("vehicle_type");
        if (typeStr != null) {
            vehicle.setVehicleType(VehicleType.valueOf(typeStr));
        }

        vehicle.setMake(rs.getString("make"));
        vehicle.setModel(rs.getString("model"));
        vehicle.setColor(rs.getString("color"));
        vehicle.setDefault(rs.getBoolean("is_default"));

        Timestamp created = rs.getTimestamp("created_at");
        if (created != null) {
            vehicle.setCreatedAt(created.toLocalDateTime());
        }

        Timestamp updated = rs.getTimestamp("updated_at");
        if (updated != null) {
            vehicle.setUpdatedAt(updated.toLocalDateTime());
        }

        return vehicle;
    }
}
