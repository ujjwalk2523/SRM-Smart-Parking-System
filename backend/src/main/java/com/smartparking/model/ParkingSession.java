package com.smartparking.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ParkingSession {
    private Long id;
    private Long bookingId;
    private String sessionCode;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private SessionStatus status = SessionStatus.ACTIVE;
    private Integer totalDurationMinutes;
    private BigDecimal calculatedFare = BigDecimal.ZERO;
    private BigDecimal overstayPenalty = BigDecimal.ZERO;
    private String entryGate;
    private String exitGate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ParkingSession() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }

    public String getSessionCode() { return sessionCode; }
    public void setSessionCode(String sessionCode) { this.sessionCode = sessionCode; }

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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
