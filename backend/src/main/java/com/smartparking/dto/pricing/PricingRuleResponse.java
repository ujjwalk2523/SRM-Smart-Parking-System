package com.smartparking.dto.pricing;

import com.smartparking.model.PricingRule;
import com.smartparking.model.VehicleType;

import java.math.BigDecimal;

/**
 * Data transfer object representing a pricing rule.
 */
public class PricingRuleResponse {

    private Long id;
    private Long lotId;
    private VehicleType vehicleType;
    private BigDecimal baseFare;
    private BigDecimal hourlyRate;
    private Integer minHours;
    private Integer gracePeriodMins;
    private BigDecimal overstayPenaltyRate;
    private boolean isActive;

    public PricingRuleResponse() {}

    public static PricingRuleResponse fromPricingRule(PricingRule rule) {
        if (rule == null) return null;
        PricingRuleResponse response = new PricingRuleResponse();
        response.id = rule.getId();
        response.lotId = rule.getLotId();
        response.vehicleType = rule.getVehicleType();
        response.baseFare = rule.getBaseFare();
        response.hourlyRate = rule.getHourlyRate();
        response.minHours = rule.getMinHours();
        response.gracePeriodMins = rule.getGracePeriodMins();
        response.overstayPenaltyRate = rule.getOverstayPenaltyRate();
        response.isActive = rule.isActive();
        return response;
    }

    public Long getId() {
        return id;
    }

    public Long getLotId() {
        return lotId;
    }

    public VehicleType getVehicleType() {
        return vehicleType;
    }

    public BigDecimal getBaseFare() {
        return baseFare;
    }

    public BigDecimal getHourlyRate() {
        return hourlyRate;
    }

    public Integer getMinHours() {
        return minHours;
    }

    public Integer getGracePeriodMins() {
        return gracePeriodMins;
    }

    public BigDecimal getOverstayPenaltyRate() {
        return overstayPenaltyRate;
    }

    public boolean isActive() {
        return isActive;
    }
}
