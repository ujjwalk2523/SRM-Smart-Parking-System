package com.smartparking.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PricingRule {
    private Long id;
    private Long lotId;
    private VehicleType vehicleType = VehicleType.CAR;
    private BigDecimal baseFare = BigDecimal.ZERO;
    private BigDecimal hourlyRate = BigDecimal.ZERO;
    private Integer minHours = 1;
    private Integer gracePeriodMins = 15;
    private BigDecimal overstayPenaltyRate = BigDecimal.ZERO;
    private boolean isActive = true;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public PricingRule() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getLotId() { return lotId; }
    public void setLotId(Long lotId) { this.lotId = lotId; }

    public VehicleType getVehicleType() { return vehicleType; }
    public void setVehicleType(VehicleType vehicleType) { this.vehicleType = vehicleType; }

    public BigDecimal getBaseFare() { return baseFare; }
    public void setBaseFare(BigDecimal baseFare) { this.baseFare = baseFare; }

    public BigDecimal getHourlyRate() { return hourlyRate; }
    public void setHourlyRate(BigDecimal hourlyRate) { this.hourlyRate = hourlyRate; }

    public Integer getMinHours() { return minHours; }
    public void setMinHours(Integer minHours) { this.minHours = minHours; }

    public Integer getGracePeriodMins() { return gracePeriodMins; }
    public void setGracePeriodMins(Integer gracePeriodMins) { this.gracePeriodMins = gracePeriodMins; }

    public BigDecimal getOverstayPenaltyRate() { return overstayPenaltyRate; }
    public void setOverstayPenaltyRate(BigDecimal overstayPenaltyRate) { this.overstayPenaltyRate = overstayPenaltyRate; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
