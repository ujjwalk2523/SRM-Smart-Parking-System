package com.smartparking.repository;

import com.smartparking.model.ParkingSession;
import com.smartparking.model.SessionStatus;
import com.smartparking.repository.rowmapper.ParkingSessionRowMapper;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public class JdbcParkingSessionRepository implements ParkingSessionRepository {

    private final JdbcTemplate jdbcTemplate;
    private final ParkingSessionRowMapper rowMapper = new ParkingSessionRowMapper();

    public JdbcParkingSessionRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private static final String BASE_SELECT = """
            SELECT id, booking_id, session_code, check_in_time, check_out_time, status,
                   total_duration_minutes, calculated_fare, overstay_penalty, entry_gate, exit_gate,
                   created_at, updated_at
            FROM parking_sessions
            """;

    @Override
    public Optional<ParkingSession> findById(Long id) {
        String sql = BASE_SELECT + " WHERE id = ?";
        try {
            ParkingSession session = jdbcTemplate.queryForObject(sql, rowMapper, id);
            return Optional.ofNullable(session);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public Optional<ParkingSession> findByBookingId(Long bookingId) {
        String sql = BASE_SELECT + " WHERE booking_id = ?";
        try {
            ParkingSession session = jdbcTemplate.queryForObject(sql, rowMapper, bookingId);
            return Optional.ofNullable(session);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public Optional<ParkingSession> findBySessionCode(String sessionCode) {
        String sql = BASE_SELECT + " WHERE session_code = ?";
        try {
            ParkingSession session = jdbcTemplate.queryForObject(sql, rowMapper, sessionCode);
            return Optional.ofNullable(session);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public Optional<ParkingSession> findActiveSessionByUserId(Long userId) {
        String sql = """
                SELECT ps.id, ps.booking_id, ps.session_code, ps.check_in_time, ps.check_out_time, ps.status,
                       ps.total_duration_minutes, ps.calculated_fare, ps.overstay_penalty, ps.entry_gate, ps.exit_gate,
                       ps.created_at, ps.updated_at
                FROM parking_sessions ps
                JOIN bookings b ON ps.booking_id = b.id
                WHERE b.user_id = ? AND ps.status = 'ACTIVE'
                ORDER BY ps.id DESC LIMIT 1
                """;
        try {
            ParkingSession session = jdbcTemplate.queryForObject(sql, rowMapper, userId);
            return Optional.ofNullable(session);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public ParkingSession save(ParkingSession session) {
        String sql = """
                INSERT INTO parking_sessions (booking_id, session_code, check_in_time, status,
                                             calculated_fare, overstay_penalty, entry_gate)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """;
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(con -> {
            PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, session.getBookingId());
            ps.setString(2, session.getSessionCode());
            ps.setTimestamp(3, Timestamp.valueOf(session.getCheckInTime()));
            ps.setString(4, session.getStatus() != null ? session.getStatus().name() : SessionStatus.ACTIVE.name());
            ps.setBigDecimal(5, session.getCalculatedFare() != null ? session.getCalculatedFare() : BigDecimal.ZERO);
            ps.setBigDecimal(6, session.getOverstayPenalty() != null ? session.getOverstayPenalty() : BigDecimal.ZERO);
            ps.setString(7, session.getEntryGate());
            return ps;
        }, keyHolder);

        Long generatedId = com.smartparking.util.GeneratedKeys.getGeneratedId(keyHolder);
        if (generatedId != null) {
            session.setId(generatedId);
        }
        return session;
    }

    @Override
    public int completeSession(Long id, LocalDateTime checkOutTime, Integer durationMinutes,
                               BigDecimal calculatedFare, BigDecimal overstayPenalty, String exitGate) {
        String sql = """
                UPDATE parking_sessions
                SET check_out_time = ?, status = 'COMPLETED', total_duration_minutes = ?,
                    calculated_fare = ?, overstay_penalty = ?, exit_gate = ?
                WHERE id = ?
                """;
        return jdbcTemplate.update(sql,
                Timestamp.valueOf(checkOutTime),
                durationMinutes,
                calculatedFare,
                overstayPenalty,
                exitGate,
                id);
    }

    @Override
    public long countByStatus(SessionStatus status) {
        String sql = "SELECT COUNT(*) FROM parking_sessions WHERE status = ?";
        Long count = jdbcTemplate.queryForObject(sql, Long.class, status.name());
        return count != null ? count : 0;
    }
}
