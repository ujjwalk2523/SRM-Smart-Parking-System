package com.smartparking.repository;

import com.smartparking.model.PricingRule;
import com.smartparking.model.VehicleType;
import com.smartparking.repository.rowmapper.PricingRuleRowMapper;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Optional;

@Repository
public class JdbcPricingRuleRepository implements PricingRuleRepository {

    private final JdbcTemplate jdbcTemplate;
    private final PricingRuleRowMapper rowMapper = new PricingRuleRowMapper();

    public JdbcPricingRuleRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private static final String BASE_SELECT = """
            SELECT id, lot_id, vehicle_type, base_fare, hourly_rate, min_hours, grace_period_mins,
                   overstay_penalty_rate, is_active, created_at, updated_at
            FROM pricing_rules
            """;

    @Override
    public Optional<PricingRule> findById(Long id) {
        String sql = BASE_SELECT + " WHERE id = ?";
        try {
            PricingRule rule = jdbcTemplate.queryForObject(sql, rowMapper, id);
            return Optional.ofNullable(rule);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public List<PricingRule> findByLotId(Long lotId) {
        String sql = BASE_SELECT + " WHERE lot_id = ? AND is_active = TRUE ORDER BY vehicle_type ASC";
        return jdbcTemplate.query(sql, rowMapper, lotId);
    }

    @Override
    public Optional<PricingRule> findByLotIdAndVehicleType(Long lotId, VehicleType vehicleType) {
        String sql = BASE_SELECT + " WHERE lot_id = ? AND vehicle_type = ? AND is_active = TRUE";
        try {
            PricingRule rule = jdbcTemplate.queryForObject(sql, rowMapper, lotId, vehicleType.name());
            return Optional.ofNullable(rule);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public PricingRule save(PricingRule rule) {
        String sql = """
                INSERT INTO pricing_rules (lot_id, vehicle_type, base_fare, hourly_rate, min_hours, grace_period_mins, overstay_penalty_rate, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """;
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(con -> {
            PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, rule.getLotId());
            ps.setString(2, rule.getVehicleType().name());
            ps.setBigDecimal(3, rule.getBaseFare());
            ps.setBigDecimal(4, rule.getHourlyRate());
            ps.setInt(5, rule.getMinHours());
            ps.setInt(6, rule.getGracePeriodMins());
            ps.setBigDecimal(7, rule.getOverstayPenaltyRate());
            ps.setBoolean(8, rule.isActive());
            return ps;
        }, keyHolder);

        Long generatedId = com.smartparking.util.GeneratedKeys.getGeneratedId(keyHolder);
        if (generatedId != null) {
            rule.setId(generatedId);
        }
        return rule;
    }

    @Override
    public int update(PricingRule rule) {
        String sql = """
                UPDATE pricing_rules
                SET base_fare = ?, hourly_rate = ?, min_hours = ?, grace_period_mins = ?,
                    overstay_penalty_rate = ?, is_active = ?
                WHERE id = ?
                """;
        return jdbcTemplate.update(sql,
                rule.getBaseFare(), rule.getHourlyRate(), rule.getMinHours(), rule.getGracePeriodMins(),
                rule.getOverstayPenaltyRate(), rule.isActive(), rule.getId());
    }

    @Override
    public int deleteById(Long id) {
        String sql = "DELETE FROM pricing_rules WHERE id = ?";
        return jdbcTemplate.update(sql, id);
    }
}
