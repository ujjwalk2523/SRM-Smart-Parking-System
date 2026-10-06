package com.smartparking.repository.rowmapper;

import com.smartparking.model.Booking;
import com.smartparking.model.BookingStatus;
import com.smartparking.model.VehicleType;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Timestamp;

public class BookingRowMapper implements RowMapper<Booking> {

    @Override
    public Booking mapRow(ResultSet rs, int rowNum) throws SQLException {
        Booking booking = new Booking();
        booking.setId(rs.getLong("id"));
        booking.setBookingReference(rs.getString("booking_reference"));
        booking.setUserId(rs.getLong("user_id"));
        booking.setVehicleId(rs.getLong("vehicle_id"));
        booking.setSlotId(rs.getLong("slot_id"));
        booking.setLotId(rs.getLong("lot_id"));

        Timestamp startTs = rs.getTimestamp("start_time");
        if (startTs != null) {
            booking.setStartTime(startTs.toLocalDateTime());
        }

        Timestamp endTs = rs.getTimestamp("end_time");
        if (endTs != null) {
            booking.setEndTime(endTs.toLocalDateTime());
        }

        String statusStr = rs.getString("status");
        if (statusStr != null) {
            booking.setStatus(BookingStatus.valueOf(statusStr));
        }

        booking.setEstimatedFare(rs.getBigDecimal("estimated_fare"));
        booking.setActualFare(rs.getBigDecimal("actual_fare"));
        booking.setCancellationReason(rs.getString("cancellation_reason"));

        Timestamp cancelTs = rs.getTimestamp("cancelled_at");
        if (cancelTs != null) {
            booking.setCancelledAt(cancelTs.toLocalDateTime());
        }

        Timestamp created = rs.getTimestamp("created_at");
        if (created != null) {
            booking.setCreatedAt(created.toLocalDateTime());
        }

        Timestamp updated = rs.getTimestamp("updated_at");
        if (updated != null) {
            booking.setUpdatedAt(updated.toLocalDateTime());
        }

        // Optional joined fields
        if (hasColumn(rs, "user_email")) {
            booking.setUserEmail(rs.getString("user_email"));
        }
        if (hasColumn(rs, "user_full_name")) {
            booking.setUserFullName(rs.getString("user_full_name"));
        }
        if (hasColumn(rs, "license_plate")) {
            booking.setLicensePlate(rs.getString("license_plate"));
        }
        if (hasColumn(rs, "vehicle_type")) {
            String vTypeStr = rs.getString("vehicle_type");
            if (vTypeStr != null) {
                booking.setVehicleType(VehicleType.valueOf(vTypeStr));
            }
        }
        if (hasColumn(rs, "slot_number")) {
            booking.setSlotNumber(rs.getString("slot_number"));
        }
        if (hasColumn(rs, "lot_name")) {
            booking.setLotName(rs.getString("lot_name"));
        }

        return booking;
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
