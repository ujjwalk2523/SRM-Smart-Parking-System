package com.smartparking.repository.rowmapper;

import com.smartparking.model.Payment;
import com.smartparking.model.PaymentMethod;
import com.smartparking.model.PaymentStatus;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;

public class PaymentRowMapper implements RowMapper<Payment> {

    @Override
    public Payment mapRow(ResultSet rs, int rowNum) throws SQLException {
        Payment payment = new Payment();
        payment.setId(rs.getLong("id"));
        payment.setPaymentReference(rs.getString("payment_reference"));
        payment.setBookingId(rs.getLong("booking_id"));

        long sessId = rs.getLong("session_id");
        if (!rs.wasNull()) {
            payment.setSessionId(sessId);
        }

        payment.setUserId(rs.getLong("user_id"));
        payment.setAmount(rs.getBigDecimal("amount"));

        String methodStr = rs.getString("payment_method");
        if (methodStr != null) {
            payment.setPaymentMethod(PaymentMethod.valueOf(methodStr));
        }

        String statusStr = rs.getString("payment_status");
        if (statusStr != null) {
            payment.setPaymentStatus(PaymentStatus.valueOf(statusStr));
        }

        payment.setTransactionId(rs.getString("transaction_id"));

        Timestamp paid = rs.getTimestamp("paid_at");
        if (paid != null) {
            payment.setPaidAt(paid.toLocalDateTime());
        }

        Timestamp created = rs.getTimestamp("created_at");
        if (created != null) {
            payment.setCreatedAt(created.toLocalDateTime());
        }

        Timestamp updated = rs.getTimestamp("updated_at");
        if (updated != null) {
            payment.setUpdatedAt(updated.toLocalDateTime());
        }

        return payment;
    }
}
