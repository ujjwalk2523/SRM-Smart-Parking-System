package com.smartparking.repository;

import com.smartparking.model.ParkingLot;
import com.smartparking.repository.rowmapper.ParkingLotRowMapper;
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
public class JdbcParkingLotRepository implements ParkingLotRepository {

    private final JdbcTemplate jdbcTemplate;
    private final ParkingLotRowMapper rowMapper = new ParkingLotRowMapper();

    public JdbcParkingLotRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private static final String BASE_SELECT = """
            SELECT pl.id, pl.location_id, loc.name AS location_name, pl.lot_code, pl.name,
                   pl.total_capacity, pl.total_floors, pl.operating_hours, pl.contact_phone,
                   pl.image_url, pl.is_active, pl.created_at, pl.updated_at
            FROM parking_lots pl
            JOIN parking_locations loc ON pl.location_id = loc.id
            """;

    @Override
    public Optional<ParkingLot> findById(Long id) {
        String sql = BASE_SELECT + " WHERE pl.id = ?";
        try {
            ParkingLot lot = jdbcTemplate.queryForObject(sql, rowMapper, id);
            return Optional.ofNullable(lot);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public Optional<ParkingLot> findByLotCode(String lotCode) {
        String sql = BASE_SELECT + " WHERE pl.lot_code = ?";
        try {
            ParkingLot lot = jdbcTemplate.queryForObject(sql, rowMapper, lotCode);
            return Optional.ofNullable(lot);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public List<ParkingLot> findByLocationId(Long locationId, boolean onlyActive) {
        String sql = onlyActive ? BASE_SELECT + " WHERE pl.location_id = ? AND pl.is_active = TRUE ORDER BY pl.name ASC"
                                : BASE_SELECT + " WHERE pl.location_id = ? ORDER BY pl.id DESC";
        return jdbcTemplate.query(sql, rowMapper, locationId);
    }

    @Override
    public List<ParkingLot> findAll(boolean onlyActive) {
        String sql = onlyActive ? BASE_SELECT + " WHERE pl.is_active = TRUE ORDER BY loc.name ASC, pl.name ASC"
                                : BASE_SELECT + " ORDER BY pl.id DESC";
        return jdbcTemplate.query(sql, rowMapper);
    }

    @Override
    public ParkingLot save(ParkingLot lot) {
        String sql = """
                INSERT INTO parking_lots (location_id, lot_code, name, total_capacity, total_floors, operating_hours, contact_phone, image_url, is_active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(con -> {
            PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, lot.getLocationId());
            ps.setString(2, lot.getLotCode());
            ps.setString(3, lot.getName());
            ps.setInt(4, lot.getTotalCapacity());
            ps.setInt(5, lot.getTotalFloors());
            ps.setString(6, lot.getOperatingHours());
            ps.setString(7, lot.getContactPhone());
            ps.setString(8, lot.getImageUrl());
            ps.setBoolean(9, lot.isActive());
            return ps;
        }, keyHolder);

        Long generatedId = com.smartparking.util.GeneratedKeys.getGeneratedId(keyHolder);
        if (generatedId != null) {
            lot.setId(generatedId);
        }
        return lot;
    }

    @Override
    public int update(ParkingLot lot) {
        String sql = """
                UPDATE parking_lots
                SET name = ?, total_capacity = ?, total_floors = ?, operating_hours = ?,
                    contact_phone = ?, image_url = ?, is_active = ?
                WHERE id = ?
                """;
        return jdbcTemplate.update(sql,
                lot.getName(), lot.getTotalCapacity(), lot.getTotalFloors(), lot.getOperatingHours(),
                lot.getContactPhone(), lot.getImageUrl(), lot.isActive(), lot.getId());
    }

    @Override
    public int deleteById(Long id) {
        String sql = "DELETE FROM parking_lots WHERE id = ?";
        return jdbcTemplate.update(sql, id);
    }

    @Override
    public long count() {
        String sql = "SELECT COUNT(*) FROM parking_lots";
        Long count = jdbcTemplate.queryForObject(sql, Long.class);
        return count != null ? count : 0;
    }
}
