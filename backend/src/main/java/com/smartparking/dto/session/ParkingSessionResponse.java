package com.smartparking.dto.session;

import com.smartparking.model.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Detailed representation of a parking session, including vehicle, slot, lot, and payment status.
 */
public class ParkingSessionResponse {

    private Long id;
    private Long bookingId;
    private String bookingReference;
    private String sessionCode;
    private Long lotId;
    private String lotName;
    private Long slotId;
    private String slotNumber;
    private Long vehicleId;
    private String licensePlate;
    private VehicleType vehicleType;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private SessionStatus status;
    private Integer totalDurationMinutes;
    private BigDecimal calculatedFare;
    private BigDecimal overstayPenalty;
    private String entryGate;
    private String exitGate;

    // Payment details if completed
    private Long paymentId;
    private String paymentReference;
    private BigDecimal paidAmount;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private String transactionId;
    private LocalDateTime paidAt;

    public ParkingSessionResponse() {}

    public static ParkingSessionResponse fromSession(ParkingSession session, Booking booking, Payment payment) {
        ParkingSessionResponse response = new ParkingSessionResponse();
        response.id = session.getId();
        response.bookingId = session.getBookingId();
        response.sessionCode = session.getSessionCode();
        response.checkInTime = session.getCheckInTime();
        response.checkOutTime = session.getCheckOutTime();
        response.status = session.getStatus();
        response.totalDurationMinutes = session.getTotalDurationMinutes();
        response.calculatedFare = session.getCalculatedFare();
        response.overstayPenalty = session.getOverstayPenalty();
        response.entryGate = session.getEntryGate();
        response.exitGate = session.getExitGate();

        if (booking != null) {
            response.bookingReference = booking.getBookingReference();
            response.lotId = booking.getLotId();
            response.lotName = booking.getLotName();
            response.slotId = booking.getSlotId();
            response.slotNumber = booking.getSlotNumber();
            response.vehicleId = booking.getVehicleId();
            response.licensePlate = booking.getLicensePlate();
            response.vehicleType = booking.getVehicleType();
        }

        if (payment != null) {
            response.paymentId = payment.getId();
            response.paymentReference = payment.getPaymentReference();
            response.paidAmount = payment.getAmount();
            response.paymentMethod = payment.getPaymentMethod();
            response.paymentStatus = payment.getPaymentStatus();
            response.transactionId = payment.getTransactionId();
            response.paidAt = payment.getPaidAt();
        }

        return response;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public String getBookingReference() { return bookingReference; }
    public void setBookingReference(String bookingReference) { this.bookingReference = bookingReference; }

    public String getSessionCode() { return sessionCode; }
    public void setSessionCode(String sessionCode) { this.sessionCode = sessionCode; }

    public Long getLotId() { return lotId; }
    public void setLotId(Long lotId) { this.lotId = lotId; }

    public String getLotName() { return lotName; }
    public void setLotName(String lotName) { this.lotName = lotName; }

    public Long getSlotId() { return slotId; }
    public void setSlotId(Long slotId) { this.slotId = slotId; }

    public String getSlotNumber() { return slotNumber; }
    public void setSlotNumber(String slotNumber) { this.slotNumber = slotNumber; }

    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }

    public String getLicensePlate() { return licensePlate; }
    public void setLicensePlate(String licensePlate) { this.licensePlate = licensePlate; }

    public VehicleType getVehicleType() { return vehicleType; }
    public void setVehicleType(VehicleType vehicleType) { this.vehicleType = vehicleType; }

    public LocalDateTime getCheckInTime() { return checkInTime; }
    public void setCheckInTime(LocalDateTime checkInTime) { this.checkInTime = checkInTime; }

    public LocalDateTime getCheckOutTime() { return checkOutTime; }
    public void setCheckOutTime(LocalDateTime checkOutTime) { this.checkOutTime = checkOutTime; }

    public SessionStatus getStatus() { return status; }
    public void setStatus(SessionStatus status) { this.status = status; }

    public Integer getTotalDurationMinutes() { return totalDurationMinutes; }
    public void setTotalDurationMinutes(Integer totalDurationMinutes) { this.totalDurationMinutes = totalDurationMinutes; }

    public BigDecimal getCalculatedFare() { return calculatedFare; }
    public void setCalculatedFare(BigDecimal calculatedFare) { this.calculatedFare = calculatedFare; }

    public BigDecimal getOverstayPenalty() { return overstayPenalty; }
    public void setOverstayPenalty(BigDecimal overstayPenalty) { this.overstayPenalty = overstayPenalty; }

    public String getEntryGate() { return entryGate; }
    public void setEntryGate(String entryGate) { this.entryGate = entryGate; }

    public String getExitGate() { return exitGate; }
    public void setExitGate(String exitGate) { this.exitGate = exitGate; }

    public Long getPaymentId() { return paymentId; }
    public void setPaymentId(Long paymentId) { this.paymentId = paymentId; }

    public String getPaymentReference() { return paymentReference; }
    public void setPaymentReference(String paymentReference) { this.paymentReference = paymentReference; }

    public BigDecimal getPaidAmount() { return paidAmount; }
    public void setPaidAmount(BigDecimal paidAmount) { this.paidAmount = paidAmount; }

    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }

    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }
}
