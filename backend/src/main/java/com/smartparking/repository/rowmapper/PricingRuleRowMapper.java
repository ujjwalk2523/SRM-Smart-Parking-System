package com.smartparking.repository.rowmapper;

import com.smartparking.model.PricingRule;
import com.smartparking.model.VehicleType;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;

public class PricingRuleRowMapper implements RowMapper<PricingRule> {

    @Override
    public PricingRule mapRow(ResultSet rs, int rowNum) throws SQLException {
        PricingRule rule = new PricingRule();
        rule.setId(rs.getLong("id"));
        rule.setLotId(rs.getLong("lot_id"));

        String typeStr = rs.getString("vehicle_type");
        if (typeStr != null) {
            rule.setVehicleType(VehicleType.valueOf(typeStr));
        }

        rule.setBaseFare(rs.getBigDecimal("base_fare"));
        rule.setHourlyRate(rs.getBigDecimal("hourly_rate"));
        rule.setMinHours(rs.getInt("min_hours"));
        rule.setGracePeriodMins(rs.getInt("grace_period_mins"));
        rule.setOverstayPenaltyRate(rs.getBigDecimal("overstay_penalty_rate"));
        rule.setActive(rs.getBoolean("is_active"));

        Timestamp created = rs.getTimestamp("created_at");
        if (created != null) {
            rule.setCreatedAt(created.toLocalDateTime());
        }

        Timestamp updated = rs.getTimestamp("updated_at");
        if (updated != null) {
            rule.setUpdatedAt(updated.toLocalDateTime());
        }

        return rule;
    }
}
