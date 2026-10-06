package com.smartparking.service;

import com.smartparking.dto.session.CheckInRequest;
import com.smartparking.dto.session.CheckOutRequest;
import com.smartparking.dto.session.ParkingSessionResponse;
import com.smartparking.exception.BadRequestException;
import com.smartparking.exception.ResourceNotFoundException;
import com.smartparking.model.*;
import com.smartparking.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Service managing the real-time physical parking lifecycle:
 * Check-In -> Occupancy Tracking -> Check-Out & Fare Engine -> Payment Settlement -> Bay Release.
 */
@Service
public class ParkingSessionService {

    private static final Logger log = LoggerFactory.getLogger(ParkingSessionService.class);

    private final ParkingSessionRepository sessionRepository;
    private final BookingRepository bookingRepository;
    private final ParkingSlotRepository slotRepository;
    private final PaymentRepository paymentRepository;
    private final PricingRuleRepository pricingRuleRepository;
    private final FareCalculationService fareCalculationService;
    private final AuditLogRepository auditLogRepository;

    public ParkingSessionService(ParkingSessionRepository sessionRepository,
                                 BookingRepository bookingRepository,
                                 ParkingSlotRepository slotRepository,
                                 PaymentRepository paymentRepository,
                                 PricingRuleRepository pricingRuleRepository,
                                 FareCalculationService fareCalculationService,
                                 AuditLogRepository auditLogRepository) {
        this.sessionRepository = sessionRepository;
        this.bookingRepository = bookingRepository;
        this.slotRepository = slotRepository;
        this.paymentRepository = paymentRepository;
        this.pricingRuleRepository = pricingRuleRepository;
        this.fareCalculationService = fareCalculationService;
        this.auditLogRepository = auditLogRepository;
    }

    /**
     * Executes vehicle check-in at barrier gate.
     * Transitions Booking to ACTIVE, sets Slot to OCCUPIED, and opens a new ParkingSession.
     */
    @Transactional
    public ParkingSessionResponse checkIn(CheckInRequest request, Long userId) {
        Booking booking = bookingRepository.findByReference(request.getBookingReference())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with reference: "
                        + request.getBookingReference(), "BOOKING_NOT_FOUND"));

        if (!booking.getUserId().equals(userId)) {
            throw new AccessDeniedException("Access denied: You cannot check in to another user's booking");
        }

        if (booking.getStatus() == BookingStatus.ACTIVE) {
            // Check if active session already exists
            return sessionRepository.findByBookingId(booking.getId())
                    .map(existing -> ParkingSessionResponse.fromSession(existing, booking, null))
                    .orElseThrow(() -> new BadRequestException("Booking is already active but session could not be located"));
        }

        if (booking.getStatus() != BookingStatus.CONFIRMED && booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Cannot check in with booking status: " + booking.getStatus());
        }

        // Mark slot as OCCUPIED
        slotRepository.updateStatus(booking.getSlotId(), SlotStatus.OCCUPIED);

        // Transition booking to ACTIVE
        bookingRepository.updateStatus(booking.getId(), BookingStatus.ACTIVE);

        // Create new parking session
        String sessionCode = "SES-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        ParkingSession session = new ParkingSession();
        session.setBookingId(booking.getId());
        session.setSessionCode(sessionCode);
        session.setCheckInTime(LocalDateTime.now());
        session.setStatus(SessionStatus.ACTIVE);
        session.setEntryGate(request.getEntryGate() != null ? request.getEntryGate() : "Gate-1");

        ParkingSession savedSession = sessionRepository.save(session);

        // Audit log
        AuditLog auditLog = new AuditLog();
        auditLog.setUserId(userId);
        auditLog.setAction("SESSION_CHECK_IN");
        auditLog.setEntityType("ParkingSession");
        auditLog.setEntityId(savedSession.getId());
        auditLog.setNewValue("Checked in vehicle " + booking.getLicensePlate() + " at " + session.getEntryGate());
        auditLogRepository.save(auditLog);

        log.info("Check-in successful: sessionCode={}, bookingRef={}, slot={}",
                sessionCode, booking.getBookingReference(), booking.getSlotNumber());

        return ParkingSessionResponse.fromSession(savedSession, booking, null);
    }

    /**
     * Executes vehicle check-out and fare settlement.
     * Computes bill via FareCalculationService, generates payment record, releases bay to AVAILABLE.
     */
    @Transactional
    public ParkingSessionResponse checkOut(Long sessionId, CheckOutRequest request, Long userId, boolean isAdmin) {
        ParkingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Parking session not found with id: " + sessionId, "SESSION_NOT_FOUND"));

        if (session.getStatus() == SessionStatus.COMPLETED) {
            throw new BadRequestException("Parking session is already completed");
        }

        Booking booking = bookingRepository.findById(session.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found for session: " + sessionId, "BOOKING_NOT_FOUND"));

        if (!isAdmin && !booking.getUserId().equals(userId)) {
            throw new AccessDeniedException("Access denied: You cannot checkout another user's session");
        }

        // Fetch pricing rule for this parking lot & vehicle type
        PricingRule pricingRule = pricingRuleRepository
                .findByLotIdAndVehicleType(booking.getLotId(), booking.getVehicleType())
                .orElse(null);

        LocalDateTime checkOutTime = LocalDateTime.now();
        FareCalculationService.FareBreakdown breakdown = fareCalculationService.calculateFare(
                pricingRule, session.getCheckInTime(), checkOutTime, booking.getEndTime()
        );

        String exitGate = (request != null && request.getExitGate() != null) ? request.getExitGate() : "Exit-1";
        PaymentMethod paymentMethod = (request != null && request.getPaymentMethod() != null)
                ? request.getPaymentMethod()
                : PaymentMethod.UPI;

        // 1. Complete session record
        sessionRepository.completeSession(
                sessionId,
                checkOutTime,
                (int) breakdown.totalDurationMinutes(),
                breakdown.totalFare(),
                breakdown.overstayPenalty(),
                exitGate
        );

        // 2. Complete booking record with actual fare
        bookingRepository.updateStatus(booking.getId(), BookingStatus.COMPLETED);
        bookingRepository.updateActualFare(booking.getId(), breakdown.totalFare());

        // 3. Release slot back to AVAILABLE
        slotRepository.updateStatus(booking.getSlotId(), SlotStatus.AVAILABLE);

        // 4. Generate immutable payment transaction record
        String paymentRef = "PAY-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        String txnId = "TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();

        Payment payment = new Payment();
        payment.setPaymentReference(paymentRef);
        payment.setBookingId(booking.getId());
        payment.setSessionId(sessionId);
        payment.setUserId(userId);
        payment.setAmount(breakdown.totalFare());
        payment.setPaymentMethod(paymentMethod);
        payment.setPaymentStatus(PaymentStatus.COMPLETED);
        payment.setTransactionId(txnId);
        payment.setPaidAt(checkOutTime);

        Payment savedPayment = paymentRepository.save(payment);

        // 5. Audit log
        AuditLog auditLog = new AuditLog();
        auditLog.setUserId(userId);
        auditLog.setAction("SESSION_CHECK_OUT");
        auditLog.setEntityType("ParkingSession");
        auditLog.setEntityId(sessionId);
        auditLog.setNewValue("Checked out session " + session.getSessionCode() + ". Amount: " + breakdown.totalFare() + " via " + paymentMethod);
        auditLogRepository.save(auditLog);

        log.info("Check-out completed: sessionId={}, duration={}m, fare={}, txnId={}",
                sessionId, breakdown.totalDurationMinutes(), breakdown.totalFare(), txnId);

        ParkingSession completedSession = sessionRepository.findById(sessionId).orElse(session);
        return ParkingSessionResponse.fromSession(completedSession, booking, savedPayment);
    }

    public ParkingSessionResponse getActiveSessionByUserId(Long userId) {
        return sessionRepository.findActiveSessionByUserId(userId)
                .map(session -> {
                    Booking booking = bookingRepository.findById(session.getBookingId()).orElse(null);
                    return ParkingSessionResponse.fromSession(session, booking, null);
                })
                .orElse(null);
    }

    public ParkingSessionResponse getSessionById(Long sessionId, Long userId, boolean isAdmin) {
        ParkingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with id: " + sessionId, "SESSION_NOT_FOUND"));

        Booking booking = bookingRepository.findById(session.getBookingId()).orElse(null);
        if (booking != null && !isAdmin && !booking.getUserId().equals(userId)) {
            throw new AccessDeniedException("Access denied: You cannot inspect another user's session");
        }

        Payment payment = paymentRepository.findByBookingId(session.getBookingId()).stream().findFirst().orElse(null);
        return ParkingSessionResponse.fromSession(session, booking, payment);
    }

    public ParkingSessionResponse getSessionByBookingId(Long bookingId, Long userId, boolean isAdmin) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId, "BOOKING_NOT_FOUND"));

        if (!isAdmin && !booking.getUserId().equals(userId)) {
            throw new AccessDeniedException("Access denied: You cannot inspect another user's session");
        }

        ParkingSession session = sessionRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("No parking session found for booking id: " + bookingId, "SESSION_NOT_FOUND"));

        Payment payment = paymentRepository.findByBookingId(bookingId).stream().findFirst().orElse(null);
        return ParkingSessionResponse.fromSession(session, booking, payment);
    }

    @Transactional
    public ParkingSessionResponse startSession(Long bookingId, Long userId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId, "BOOKING_NOT_FOUND"));

        if (!booking.getUserId().equals(userId)) {
            throw new AccessDeniedException("Access denied: You cannot start a session for another user's booking");
        }

        CheckInRequest request = new CheckInRequest(booking.getBookingReference(), "Gate-Main");
        return checkIn(request, userId);
    }

    @Transactional
    public ParkingSessionResponse endSession(Long sessionId, CheckOutRequest request, Long userId, boolean isAdmin) {
        return checkOut(sessionId, request, userId, isAdmin);
    }
}
