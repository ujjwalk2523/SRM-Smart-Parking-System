package com.smartparking.service;

import com.smartparking.dto.booking.BookingResponse;
import com.smartparking.dto.booking.CreateBookingRequest;
import com.smartparking.exception.BadRequestException;
import com.smartparking.exception.ResourceNotFoundException;
import com.smartparking.exception.SlotUnavailableException;
import com.smartparking.model.*;
import com.smartparking.repository.AuditLogRepository;
import com.smartparking.repository.BookingRepository;
import com.smartparking.repository.ParkingSlotRepository;
import com.smartparking.repository.PricingRuleRepository;
import com.smartparking.repository.VehicleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

/**
 * Service managing booking creation, cancellation, and retrieval with strict concurrency control.
 * Employs pessimistic row-locking (SELECT ... FOR UPDATE) and interval overlap validation
 * to completely eliminate double-booking race conditions under high concurrent load.
 */
@Service
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);

    private final BookingRepository bookingRepository;
    private final ParkingSlotRepository slotRepository;
    private final VehicleRepository vehicleRepository;
    private final PricingRuleRepository pricingRuleRepository;
    private final AuditLogRepository auditLogRepository;

    public BookingService(BookingRepository bookingRepository,
                          ParkingSlotRepository slotRepository,
                          VehicleRepository vehicleRepository,
                          PricingRuleRepository pricingRuleRepository,
                          AuditLogRepository auditLogRepository) {
        this.bookingRepository = bookingRepository;
        this.slotRepository = slotRepository;
        this.vehicleRepository = vehicleRepository;
        this.pricingRuleRepository = pricingRuleRepository;
        this.auditLogRepository = auditLogRepository;
    }

    /**
     * Concurrency-safe booking creation.
     * Uses Isolation.REPEATABLE_READ and pessimistic row locks on the target slot.
     */
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public BookingResponse createBooking(CreateBookingRequest request, Long userId) {
        if (request.getSlotId() == null) {
            throw new BadRequestException("Slot ID must not be null");
        }
        if (request.getVehicleId() == null) {
            throw new BadRequestException("Vehicle ID must not be null");
        }

        // 1. Verify vehicle existence and user ownership
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + request.getVehicleId(), "VEHICLE_NOT_FOUND"));

        if (!vehicle.getUserId().equals(userId)) {
            throw new AccessDeniedException("Access denied: You can only book with a vehicle you own");
        }

        // 2. Resolve start time and end time
        LocalDateTime startTime;
        LocalDateTime endTime;

        if (Boolean.TRUE.equals(request.getIsImmediate())) {
            startTime = LocalDateTime.now().truncatedTo(ChronoUnit.MINUTES);
            int hours = (request.getDurationHours() != null && request.getDurationHours() > 0)
                    ? request.getDurationHours()
                    : 2; // Default 2 hours for immediate parking
            endTime = startTime.plusHours(hours);
        } else {
            if (request.getStartTime() == null || request.getEndTime() == null) {
                throw new BadRequestException("Start time and end time are required for scheduled bookings");
            }
            startTime = request.getStartTime().truncatedTo(ChronoUnit.MINUTES);
            endTime = request.getEndTime().truncatedTo(ChronoUnit.MINUTES);

            if (!endTime.isAfter(startTime)) {
                throw new BadRequestException("End time must be strictly after start time");
            }

            // Allow 5 minutes clock skew tolerance
            if (startTime.isBefore(LocalDateTime.now().minusMinutes(5))) {
                throw new BadRequestException("Start time cannot be in the past");
            }
        }

        // 3. Acquire pessimistic write lock on the parking slot
        ParkingSlot slot = slotRepository.findByIdForUpdate(request.getSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found with id: " + request.getSlotId(), "SLOT_NOT_FOUND"));

        // 4. Verify slot physical operational status
        if (!slot.isActive() || slot.getStatus() == SlotStatus.MAINTENANCE || slot.getStatus() == SlotStatus.DISABLED) {
            throw new SlotUnavailableException("Parking slot " + slot.getSlotNumber() + " is currently undergoing maintenance or disabled");
        }

        // 5. Verify vehicle type compatibility with physical slot bay
        if (slot.getSlotType() != vehicle.getVehicleType()) {
            throw new BadRequestException("Slot " + slot.getSlotNumber() + " is designated for "
                    + slot.getSlotType() + ", but vehicle is " + vehicle.getVehicleType());
        }

        // 6. If immediate parking, check if currently occupied
        if (Boolean.TRUE.equals(request.getIsImmediate()) && slot.getStatus() == SlotStatus.OCCUPIED) {
            throw new SlotUnavailableException("Slot " + slot.getSlotNumber() + " is currently occupied by another vehicle");
        }

        // 7. Check for conflicting reservations overlapping the requested timeframe
        long conflictingCount = bookingRepository.countConflictingBookings(slot.getId(), startTime, endTime);
        if (conflictingCount > 0) {
            throw new SlotUnavailableException("Slot " + slot.getSlotNumber()
                    + " has an active reservation during the selected time interval");
        }

        // 8. Calculate estimated fare based on parking lot pricing rules
        BigDecimal estimatedFare = BigDecimal.ZERO;
        PricingRule pricingRule = pricingRuleRepository
                .findByLotIdAndVehicleType(slot.getLotId(), vehicle.getVehicleType())
                .orElse(null);

        if (pricingRule != null) {
            long durationMinutes = Math.max(0, Duration.between(startTime, endTime).toMinutes());
            long billableHours = Math.max(pricingRule.getMinHours(), (long) Math.ceil(durationMinutes / 60.0));
            estimatedFare = pricingRule.getBaseFare().add(
                    pricingRule.getHourlyRate().multiply(BigDecimal.valueOf(billableHours))
            );
        }

        // 9. Generate unique booking reference and persist
        String reference = "BK-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        Booking booking = new Booking();
        booking.setBookingReference(reference);
        booking.setUserId(userId);
        booking.setVehicleId(vehicle.getId());
        booking.setSlotId(slot.getId());
        booking.setLotId(slot.getLotId());
        booking.setStartTime(startTime);
        booking.setEndTime(endTime);
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setEstimatedFare(estimatedFare);

        Booking savedBooking = bookingRepository.save(booking);

        // Update slot status if immediate booking
        if (Boolean.TRUE.equals(request.getIsImmediate())) {
            slotRepository.updateStatus(slot.getId(), SlotStatus.RESERVED);
        }

        // 10. Audit log
        AuditLog auditLog = new AuditLog();
        auditLog.setUserId(userId);
        auditLog.setAction("BOOKING_CREATED");
        auditLog.setEntityType("Booking");
        auditLog.setEntityId(savedBooking.getId());
        auditLog.setNewValue("Created " + (Boolean.TRUE.equals(request.getIsImmediate()) ? "immediate" : "scheduled")
                + " booking " + reference + " for slot " + slot.getSlotNumber());
        auditLogRepository.save(auditLog);

        log.info("Booking created successfully: reference={}, userId={}, slotId={}, fare={}",
                reference, userId, slot.getId(), estimatedFare);

        return bookingRepository.findById(savedBooking.getId())
                .map(BookingResponse::fromBooking)
                .orElse(BookingResponse.fromBooking(savedBooking));
    }

    /**
     * Concurrency-safe booking cancellation.
     */
    @Transactional
    public BookingResponse cancelBooking(Long bookingId, Long authenticatedUserId, boolean isAdmin, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId, "BOOKING_NOT_FOUND"));

        // IDOR check
        if (!isAdmin && !booking.getUserId().equals(authenticatedUserId)) {
            throw new AccessDeniedException("Access denied: You cannot cancel another user's booking");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled");
        }
        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BadRequestException("Cannot cancel an already completed booking");
        }
        if (booking.getStatus() == BookingStatus.ACTIVE) {
            throw new BadRequestException("Active parking sessions cannot be cancelled; please complete checkout instead");
        }

        String cancellationReason = (reason != null && !reason.isBlank()) ? reason : "Cancelled by user";
        bookingRepository.cancelBooking(bookingId, cancellationReason, LocalDateTime.now());

        // Release slot if it was RESERVED
        slotRepository.findById(booking.getSlotId()).ifPresent(slot -> {
            if (slot.getStatus() == SlotStatus.RESERVED) {
                slotRepository.updateStatus(slot.getId(), SlotStatus.AVAILABLE);
            }
        });

        // Audit log
        AuditLog auditLog = new AuditLog();
        auditLog.setUserId(authenticatedUserId);
        auditLog.setAction("BOOKING_CANCELLED");
        auditLog.setEntityType("Booking");
        auditLog.setEntityId(bookingId);
        auditLog.setNewValue("Cancelled booking " + booking.getBookingReference() + ": " + cancellationReason);
        auditLogRepository.save(auditLog);

        log.info("Booking cancelled: id={}, reference={}, userId={}",
                bookingId, booking.getBookingReference(), authenticatedUserId);

        return bookingRepository.findById(bookingId)
                .map(BookingResponse::fromBooking)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found after cancellation", "BOOKING_NOT_FOUND"));
    }

    public List<BookingResponse> getBookingsByUserId(Long userId) {
        return bookingRepository.findByUserId(userId)
                .stream()
                .map(BookingResponse::fromBooking)
                .toList();
    }

    public BookingResponse getBookingById(Long bookingId, Long authenticatedUserId, boolean isAdmin) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId, "BOOKING_NOT_FOUND"));

        if (!isAdmin && !booking.getUserId().equals(authenticatedUserId)) {
            throw new AccessDeniedException("Access denied: You cannot access another user's booking");
        }

        return BookingResponse.fromBooking(booking);
    }

    public BookingResponse getBookingByReference(String reference, Long authenticatedUserId, boolean isAdmin) {
        Booking booking = bookingRepository.findByReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with reference: " + reference, "BOOKING_NOT_FOUND"));

        if (!isAdmin && !booking.getUserId().equals(authenticatedUserId)) {
            throw new AccessDeniedException("Access denied: You cannot access another user's booking");
        }

        return BookingResponse.fromBooking(booking);
    }

    public BookingResponse getActiveBookingByUserId(Long userId) {
        return bookingRepository.findActiveBookingByUserId(userId)
                .map(BookingResponse::fromBooking)
                .orElse(null);
    }

    public List<BookingResponse> getUpcomingBookingsByUserId(Long userId) {
        return bookingRepository.findUpcomingBookingsByUserId(userId)
                .stream()
                .map(BookingResponse::fromBooking)
                .toList();
    }

    public List<BookingResponse> getPastBookingsByUserId(Long userId) {
        return bookingRepository.findPastBookingsByUserId(userId)
                .stream()
                .map(BookingResponse::fromBooking)
                .toList();
    }
}
