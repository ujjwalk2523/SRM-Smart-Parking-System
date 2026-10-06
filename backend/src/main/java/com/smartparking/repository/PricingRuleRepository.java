package com.smartparking.repository;

import com.smartparking.model.PricingRule;
import com.smartparking.model.VehicleType;

import java.util.List;
import java.util.Optional;

public interface PricingRuleRepository {
    Optional<PricingRule> findById(Long id);
    List<PricingRule> findByLotId(Long lotId);
    Optional<PricingRule> findByLotIdAndVehicleType(Long lotId, VehicleType vehicleType);
    PricingRule save(PricingRule rule);
    int update(PricingRule rule);
    int deleteById(Long id);
}
