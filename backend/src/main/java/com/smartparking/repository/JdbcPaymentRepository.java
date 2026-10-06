package com.smartparking.repository;

import com.smartparking.model.Payment;
import com.smartparking.model.PaymentMethod;
import com.smartparking.model.PaymentStatus;
import com.smartparking.repository.rowmapper.PaymentRowMapper;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.sql.Types;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public class JdbcPaymentRepository implements PaymentRepository {

    private final JdbcTemplate jdbcTemplate;
    private final PaymentRowMapper rowMapper = new PaymentRowMapper();

    public JdbcPaymentRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private static final String BASE_SELECT = """
            SELECT id, payment_reference, booking_id, session_id, user_id, amount,
                   payment_method, payment_status, transaction_id, paid_at, created_at, updated_at
            FROM payments
            """;

    @Override
    public Optional<Payment> findById(Long id) {
        String sql = BASE_SELECT + " WHERE id = ?";
        try {
            Payment p = jdbcTemplate.queryForObject(sql, rowMapper, id);
            return Optional.ofNullable(p);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public Optional<Payment> findByReference(String reference) {
        String sql = BASE_SELECT + " WHERE payment_reference = ?";
        try {
            Payment p = jdbcTemplate.queryForObject(sql, rowMapper, reference);
            return Optional.ofNullable(p);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public List<Payment> findByBookingId(Long bookingId) {
        String sql = BASE_SELECT + " WHERE booking_id = ? ORDER BY id DESC";
        return jdbcTemplate.query(sql, rowMapper, bookingId);
    }

    @Override
    public List<Payment> findByUserId(Long userId) {
        String sql = BASE_SELECT + " WHERE user_id = ? ORDER BY id DESC";
        return jdbcTemplate.query(sql, rowMapper, userId);
    }

    @Override
    public Payment save(Payment payment) {
        String sql = """
                INSERT INTO payments (payment_reference, booking_id, session_id, user_id, amount,
                                     payment_method, payment_status, transaction_id, paid_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(con -> {
            PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, payment.getPaymentReference());
            ps.setLong(2, payment.getBookingId());
            if (payment.getSessionId() != null) {
                ps.setLong(3, payment.getSessionId());
            } else {
                ps.setNull(3, Types.BIGINT);
            }
            ps.setLong(4, payment.getUserId());
            ps.setBigDecimal(5, payment.getAmount());
            ps.setString(6, payment.getPaymentMethod() != null ? payment.getPaymentMethod().name() : PaymentMethod.UPI.name());
            ps.setString(7, payment.getPaymentStatus() != null ? payment.getPaymentStatus().name() : PaymentStatus.PENDING.name());
            ps.setString(8, payment.getTransactionId());
            if (payment.getPaidAt() != null) {
                ps.setTimestamp(9, Timestamp.valueOf(payment.getPaidAt()));
            } else {
                ps.setNull(9, Types.TIMESTAMP);
            }
            return ps;
        }, keyHolder);

        Long generatedId = com.smartparking.util.GeneratedKeys.getGeneratedId(keyHolder);
        if (generatedId != null) {
            payment.setId(generatedId);
        }
        return payment;
    }

    @Override
    public int updateStatus(Long id, PaymentStatus status, String transactionId, LocalDateTime paidAt) {
        String sql = "UPDATE payments SET payment_status = ?, transaction_id = ?, paid_at = ? WHERE id = ?";
        return jdbcTemplate.update(sql,
                status.name(),
                transactionId,
                paidAt != null ? Timestamp.valueOf(paidAt) : null,
                id);
    }

    @Override
    public BigDecimal calculateTotalRevenue() {
        String sql = "SELECT COALESCE(SUM(amount), 0) FROM payments WHERE payment_status = 'COMPLETED'";
        BigDecimal rev = jdbcTemplate.queryForObject(sql, BigDecimal.class);
        return rev != null ? rev : BigDecimal.ZERO;
    }
}
