package com.smartparking.repository;

import com.smartparking.model.ParkingLocation;
import com.smartparking.repository.rowmapper.ParkingLocationRowMapper;
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
public class JdbcParkingLocationRepository implements ParkingLocationRepository {

    private final JdbcTemplate jdbcTemplate;
    private final ParkingLocationRowMapper rowMapper = new ParkingLocationRowMapper();

    public JdbcParkingLocationRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private static final String BASE_SELECT = """
            SELECT id, name, code, address, city, state, postal_code, latitude, longitude, image_url, is_active, created_at, updated_at
            FROM parking_locations
            """;

    @Override
    public Optional<ParkingLocation> findById(Long id) {
        String sql = BASE_SELECT + " WHERE id = ?";
        try {
            ParkingLocation loc = jdbcTemplate.queryForObject(sql, rowMapper, id);
            return Optional.ofNullable(loc);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public Optional<ParkingLocation> findByCode(String code) {
        String sql = BASE_SELECT + " WHERE code = ?";
        try {
            ParkingLocation loc = jdbcTemplate.queryForObject(sql, rowMapper, code);
            return Optional.ofNullable(loc);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public List<ParkingLocation> findAll(boolean onlyActive) {
        String sql = onlyActive ? BASE_SELECT + " WHERE is_active = TRUE ORDER BY name ASC"
                                : BASE_SELECT + " ORDER BY id DESC";
        return jdbcTemplate.query(sql, rowMapper);
    }

    @Override
    public ParkingLocation save(ParkingLocation location) {
        String sql = """
                INSERT INTO parking_locations (name, code, address, city, state, postal_code, latitude, longitude, image_url, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(con -> {
            PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, location.getName());
            ps.setString(2, location.getCode());
            ps.setString(3, location.getAddress());
            ps.setString(4, location.getCity());
            ps.setString(5, location.getState());
            ps.setString(6, location.getPostalCode());
            ps.setBigDecimal(7, location.getLatitude());
            ps.setBigDecimal(8, location.getLongitude());
            ps.setString(9, location.getImageUrl());
            ps.setBoolean(10, location.isActive());
            return ps;
        }, keyHolder);

        Long generatedId = com.smartparking.util.GeneratedKeys.getGeneratedId(keyHolder);
        if (generatedId != null) {
            location.setId(generatedId);
        }
        return location;
    }

    @Override
    public int update(ParkingLocation location) {
        String sql = """
                UPDATE parking_locations
                SET name = ?, address = ?, city = ?, state = ?, postal_code = ?,
                    latitude = ?, longitude = ?, image_url = ?, is_active = ?
                WHERE id = ?
                """;
        return jdbcTemplate.update(sql,
                location.getName(), location.getAddress(), location.getCity(), location.getState(),
                location.getPostalCode(), location.getLatitude(), location.getLongitude(),
                location.getImageUrl(), location.isActive(), location.getId());
    }

    @Override
    public int deleteById(Long id) {
        String sql = "DELETE FROM parking_locations WHERE id = ?";
        return jdbcTemplate.update(sql, id);
    }

    @Override
    public long count() {
        String sql = "SELECT COUNT(*) FROM parking_locations";
        Long count = jdbcTemplate.queryForObject(sql, Long.class);
        return count != null ? count : 0;
    }
}
