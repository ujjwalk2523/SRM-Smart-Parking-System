package com.smartparking.repository;

import com.smartparking.model.Payment;
import com.smartparking.model.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository {
    Optional<Payment> findById(Long id);
    Optional<Payment> findByReference(String reference);
    List<Payment> findByBookingId(Long bookingId);
    List<Payment> findByUserId(Long userId);
    Payment save(Payment payment);
    int updateStatus(Long id, PaymentStatus status, String transactionId, LocalDateTime paidAt);
    BigDecimal calculateTotalRevenue();
}
