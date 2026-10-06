package com.smartparking.repository.rowmapper;

import com.smartparking.model.ParkingLocation;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;

public class ParkingLocationRowMapper implements RowMapper<ParkingLocation> {

    @Override
    public ParkingLocation mapRow(ResultSet rs, int rowNum) throws SQLException {
        ParkingLocation loc = new ParkingLocation();
        loc.setId(rs.getLong("id"));
        loc.setName(rs.getString("name"));
        loc.setCode(rs.getString("code"));
        loc.setAddress(rs.getString("address"));
        loc.setCity(rs.getString("city"));
        loc.setState(rs.getString("state"));
        loc.setPostalCode(rs.getString("postal_code"));
        loc.setLatitude(rs.getBigDecimal("latitude"));
        loc.setLongitude(rs.getBigDecimal("longitude"));
        loc.setImageUrl(rs.getString("image_url"));
        loc.setActive(rs.getBoolean("is_active"));

        Timestamp created = rs.getTimestamp("created_at");
        if (created != null) {
            loc.setCreatedAt(created.toLocalDateTime());
        }

        Timestamp updated = rs.getTimestamp("updated_at");
        if (updated != null) {
            loc.setUpdatedAt(updated.toLocalDateTime());
        }

        return loc;
    }
}
