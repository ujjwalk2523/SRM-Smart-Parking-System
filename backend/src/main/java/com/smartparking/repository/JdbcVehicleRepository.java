package com.smartparking.repository;

import com.smartparking.model.Vehicle;
import com.smartparking.repository.rowmapper.VehicleRowMapper;
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
public class JdbcVehicleRepository implements VehicleRepository {

    private final JdbcTemplate jdbcTemplate;
    private final VehicleRowMapper rowMapper = new VehicleRowMapper();

    public JdbcVehicleRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private static final String BASE_SELECT = """
            SELECT id, user_id, license_plate, vehicle_type, make, model, color, is_default, created_at, updated_at
            FROM vehicles
            """;

    @Override
    public Optional<Vehicle> findById(Long id) {
        String sql = BASE_SELECT + " WHERE id = ?";
        try {
            Vehicle v = jdbcTemplate.queryForObject(sql, rowMapper, id);
            return Optional.ofNullable(v);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public List<Vehicle> findByUserId(Long userId) {
        String sql = BASE_SELECT + " WHERE user_id = ? ORDER BY is_default DESC, id DESC";
        return jdbcTemplate.query(sql, rowMapper, userId);
    }

    @Override
    public Optional<Vehicle> findByLicensePlate(String licensePlate) {
        String sql = BASE_SELECT + " WHERE UPPER(license_plate) = UPPER(?)";
        try {
            Vehicle v = jdbcTemplate.queryForObject(sql, rowMapper, licensePlate);
            return Optional.ofNullable(v);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public Vehicle save(Vehicle vehicle) {
        String sql = "INSERT INTO vehicles (user_id, license_plate, vehicle_type, make, model, color, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(con -> {
            PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, vehicle.getUserId());
            ps.setString(2, vehicle.getLicensePlate().trim().toUpperCase());
            ps.setString(3, vehicle.getVehicleType().name());
            ps.setString(4, vehicle.getMake());
            ps.setString(5, vehicle.getModel());
            ps.setString(6, vehicle.getColor());
            ps.setBoolean(7, vehicle.isDefault());
            return ps;
        }, keyHolder);

        Long generatedId = com.smartparking.util.GeneratedKeys.getGeneratedId(keyHolder);
        if (generatedId != null) {
            vehicle.setId(generatedId);
        }
        return vehicle;
    }

    @Override
    public int update(Vehicle vehicle) {
        String sql = "UPDATE vehicles SET make = ?, model = ?, color = ?, vehicle_type = ? WHERE id = ? AND user_id = ?";
        return jdbcTemplate.update(sql, vehicle.getMake(), vehicle.getModel(), vehicle.getColor(),
                vehicle.getVehicleType().name(), vehicle.getId(), vehicle.getUserId());
    }

    @Override
    public int deleteById(Long id) {
        String sql = "DELETE FROM vehicles WHERE id = ?";
        return jdbcTemplate.update(sql, id);
    }

    @Override
    public void setDefaultVehicle(Long userId, Long vehicleId) {
        jdbcTemplate.update("UPDATE vehicles SET is_default = FALSE WHERE user_id = ?", userId);
        jdbcTemplate.update("UPDATE vehicles SET is_default = TRUE WHERE id = ? AND user_id = ?", vehicleId, userId);
    }

    @Override
    public boolean existsByLicensePlate(String licensePlate) {
        String sql = "SELECT COUNT(*) FROM vehicles WHERE UPPER(license_plate) = UPPER(?)";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, licensePlate);
        return count != null && count > 0;
    }
}
