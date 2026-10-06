package com.smartparking.repository;

import com.smartparking.model.ParkingSession;
import com.smartparking.model.SessionStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

public interface ParkingSessionRepository {
    Optional<ParkingSession> findById(Long id);
    Optional<ParkingSession> findByBookingId(Long bookingId);
    Optional<ParkingSession> findBySessionCode(String sessionCode);
    Optional<ParkingSession> findActiveSessionByUserId(Long userId);
    ParkingSession save(ParkingSession session);
    int completeSession(Long id, LocalDateTime checkOutTime, Integer durationMinutes,
                        BigDecimal calculatedFare, BigDecimal overstayPenalty, String exitGate);
    long countByStatus(SessionStatus status);
}
