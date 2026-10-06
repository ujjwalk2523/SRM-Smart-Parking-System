package com.smartparking.repository;

import com.smartparking.model.Booking;
import com.smartparking.model.BookingStatus;
import com.smartparking.repository.rowmapper.BookingRowMapper;
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
import java.util.List;
import java.util.Optional;

@Repository
public class JdbcBookingRepository implements BookingRepository {

    private final JdbcTemplate jdbcTemplate;
    private final BookingRowMapper rowMapper = new BookingRowMapper();

    public JdbcBookingRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private static final String BASE_SELECT = """
            SELECT b.id, b.booking_reference, b.user_id, u.email AS user_email, u.full_name AS user_full_name,
                   b.vehicle_id, v.license_plate, v.vehicle_type,
                   b.slot_id, s.slot_number,
                   b.lot_id, pl.name AS lot_name,
                   b.start_time, b.end_time, b.status, b.estimated_fare, b.actual_fare,
                   b.cancellation_reason, b.cancelled_at, b.created_at, b.updated_at
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN vehicles v ON b.vehicle_id = v.id
            JOIN parking_slots s ON b.slot_id = s.id
            JOIN parking_lots pl ON b.lot_id = pl.id
            """;

    @Override
    public Optional<Booking> findById(Long id) {
        String sql = BASE_SELECT + " WHERE b.id = ?";
        try {
            Booking booking = jdbcTemplate.queryForObject(sql, rowMapper, id);
            return Optional.ofNullable(booking);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public Optional<Booking> findByReference(String reference) {
        String sql = BASE_SELECT + " WHERE b.booking_reference = ?";
        try {
            Booking booking = jdbcTemplate.queryForObject(sql, rowMapper, reference);
            return Optional.ofNullable(booking);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public List<Booking> findByUserId(Long userId) {
        String sql = BASE_SELECT + " WHERE b.user_id = ? ORDER BY b.id DESC";
        return jdbcTemplate.query(sql, rowMapper, userId);
    }

    @Override
    public Optional<Booking> findActiveBookingByUserId(Long userId) {
        String sql = BASE_SELECT + " WHERE b.user_id = ? AND b.status = 'ACTIVE' LIMIT 1";
        try {
            Booking booking = jdbcTemplate.queryForObject(sql, rowMapper, userId);
            return Optional.ofNullable(booking);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public List<Booking> findUpcomingBookingsByUserId(Long userId) {
        String sql = BASE_SELECT + " WHERE b.user_id = ? AND b.status = 'CONFIRMED' AND b.start_time >= NOW() ORDER BY b.start_time ASC";
        return jdbcTemplate.query(sql, rowMapper, userId);
    }

    @Override
    public List<Booking> findPastBookingsByUserId(Long userId) {
        String sql = BASE_SELECT + " WHERE b.user_id = ? AND b.status IN ('COMPLETED', 'CANCELLED', 'EXPIRED') ORDER BY b.id DESC";
        return jdbcTemplate.query(sql, rowMapper, userId);
    }

    @Override
    public long countConflictingBookings(Long slotId, LocalDateTime startTime, LocalDateTime endTime) {
        String sql = """
                SELECT COUNT(*) FROM bookings
                WHERE slot_id = ?
                  AND status IN ('CONFIRMED', 'ACTIVE')
                  AND (? < end_time AND ? > start_time)
                """;
        Long count = jdbcTemplate.queryForObject(sql, Long.class,
                slotId,
                Timestamp.valueOf(startTime),
                Timestamp.valueOf(endTime));
        return count != null ? count : 0;
    }

    @Override
    public Booking save(Booking booking) {
        String sql = """
                INSERT INTO bookings (booking_reference, user_id, vehicle_id, slot_id, lot_id,
                                      start_time, end_time, status, estimated_fare, actual_fare)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(con -> {
            PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, booking.getBookingReference());
            ps.setLong(2, booking.getUserId());
            ps.setLong(3, booking.getVehicleId());
            ps.setLong(4, booking.getSlotId());
            ps.setLong(5, booking.getLotId());
            ps.setTimestamp(6, Timestamp.valueOf(booking.getStartTime()));
            ps.setTimestamp(7, Timestamp.valueOf(booking.getEndTime()));
            ps.setString(8, booking.getStatus() != null ? booking.getStatus().name() : BookingStatus.PENDING.name());
            ps.setBigDecimal(9, booking.getEstimatedFare() != null ? booking.getEstimatedFare() : BigDecimal.ZERO);
            ps.setBigDecimal(10, booking.getActualFare());
            return ps;
        }, keyHolder);

        Long generatedId = com.smartparking.util.GeneratedKeys.getGeneratedId(keyHolder);
        if (generatedId != null) {
            booking.setId(generatedId);
        }
        return booking;
    }

    @Override
    public int updateStatus(Long id, BookingStatus status) {
        String sql = "UPDATE bookings SET status = ? WHERE id = ?";
        return jdbcTemplate.update(sql, status.name(), id);
    }

    @Override
    public int updateActualFare(Long id, BigDecimal actualFare) {
        String sql = "UPDATE bookings SET actual_fare = ? WHERE id = ?";
        return jdbcTemplate.update(sql, actualFare, id);
    }

    @Override
    public int cancelBooking(Long id, String reason, LocalDateTime cancelledAt) {
        String sql = "UPDATE bookings SET status = 'CANCELLED', cancellation_reason = ?, cancelled_at = ? WHERE id = ?";
        return jdbcTemplate.update(sql, reason, Timestamp.valueOf(cancelledAt), id);
    }

    @Override
    public List<Booking> findAll(int offset, int limit) {
        String sql = BASE_SELECT + " ORDER BY b.id DESC LIMIT ? OFFSET ?";
        return jdbcTemplate.query(sql, rowMapper, limit, offset);
    }

    @Override
    public long count() {
        String sql = "SELECT COUNT(*) FROM bookings";
        Long count = jdbcTemplate.queryForObject(sql, Long.class);
        return count != null ? count : 0;
    }

    @Override
    public long countByStatus(BookingStatus status) {
        String sql = "SELECT COUNT(*) FROM bookings WHERE status = ?";
        Long count = jdbcTemplate.queryForObject(sql, Long.class, status.name());
        return count != null ? count : 0;
    }

    @Override
    public long countTodayBookings() {
        String sql = "SELECT COUNT(*) FROM bookings WHERE DATE(created_at) = CURRENT_DATE()";
        Long count = jdbcTemplate.queryForObject(sql, Long.class);
        return count != null ? count : 0;
    }

    @Override
    public BigDecimal calculateTodayRevenue() {
        String sql = "SELECT COALESCE(SUM(actual_fare), 0) FROM bookings WHERE status = 'COMPLETED' AND DATE(updated_at) = CURRENT_DATE()";
        BigDecimal rev = jdbcTemplate.queryForObject(sql, BigDecimal.class);
        return rev != null ? rev : BigDecimal.ZERO;
    }

    @Override
    public BigDecimal calculateMonthlyRevenue() {
        String sql = "SELECT COALESCE(SUM(actual_fare), 0) FROM bookings WHERE status = 'COMPLETED' AND MONTH(updated_at) = MONTH(CURRENT_DATE()) AND YEAR(updated_at) = YEAR(CURRENT_DATE())";
        BigDecimal rev = jdbcTemplate.queryForObject(sql, BigDecimal.class);
        return rev != null ? rev : BigDecimal.ZERO;
    }
}
