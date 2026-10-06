package com.smartparking.repository;

import com.smartparking.model.Booking;
import com.smartparking.model.BookingStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface BookingRepository {
    Optional<Booking> findById(Long id);
    Optional<Booking> findByReference(String reference);
    List<Booking> findByUserId(Long userId);
    Optional<Booking> findActiveBookingByUserId(Long userId);
    List<Booking> findUpcomingBookingsByUserId(Long userId);
    List<Booking> findPastBookingsByUserId(Long userId);
    long countConflictingBookings(Long slotId, LocalDateTime startTime, LocalDateTime endTime);
    Booking save(Booking booking);
    int updateStatus(Long id, BookingStatus status);
    int updateActualFare(Long id, BigDecimal actualFare);
    int cancelBooking(Long id, String reason, LocalDateTime cancelledAt);
    List<Booking> findAll(int offset, int limit);
    long count();
    long countByStatus(BookingStatus status);
    long countTodayBookings();
    BigDecimal calculateTodayRevenue();
    BigDecimal calculateMonthlyRevenue();
}
