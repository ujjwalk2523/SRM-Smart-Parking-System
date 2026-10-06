package com.smartparking.repository.rowmapper;

import com.smartparking.model.ParkingSession;
import com.smartparking.model.SessionStatus;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;

public class ParkingSessionRowMapper implements RowMapper<ParkingSession> {

    @Override
    public ParkingSession mapRow(ResultSet rs, int rowNum) throws SQLException {
        ParkingSession session = new ParkingSession();
        session.setId(rs.getLong("id"));
        session.setBookingId(rs.getLong("booking_id"));
        session.setSessionCode(rs.getString("session_code"));

        Timestamp checkIn = rs.getTimestamp("check_in_time");
        if (checkIn != null) {
            session.setCheckInTime(checkIn.toLocalDateTime());
        }

        Timestamp checkOut = rs.getTimestamp("check_out_time");
        if (checkOut != null) {
            session.setCheckOutTime(checkOut.toLocalDateTime());
        }

        String statusStr = rs.getString("status");
        if (statusStr != null) {
            session.setStatus(SessionStatus.valueOf(statusStr));
        }

        int duration = rs.getInt("total_duration_minutes");
        if (!rs.wasNull()) {
            session.setTotalDurationMinutes(duration);
        }

        session.setCalculatedFare(rs.getBigDecimal("calculated_fare"));
        session.setOverstayPenalty(rs.getBigDecimal("overstay_penalty"));
        session.setEntryGate(rs.getString("entry_gate"));
        session.setExitGate(rs.getString("exit_gate"));

        Timestamp created = rs.getTimestamp("created_at");
        if (created != null) {
            session.setCreatedAt(created.toLocalDateTime());
        }

        Timestamp updated = rs.getTimestamp("updated_at");
        if (updated != null) {
            session.setUpdatedAt(updated.toLocalDateTime());
        }

        return session;
    }
}
