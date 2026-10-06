package com.smartparking.repository;

import com.smartparking.model.ParkingSlot;
import com.smartparking.model.SlotStatus;
import com.smartparking.model.VehicleType;
import com.smartparking.repository.rowmapper.ParkingSlotRowMapper;
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
public class JdbcParkingSlotRepository implements ParkingSlotRepository {

    private final JdbcTemplate jdbcTemplate;
    private final ParkingSlotRowMapper rowMapper = new ParkingSlotRowMapper();

    public JdbcParkingSlotRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private static final String BASE_SELECT = """
            SELECT id, lot_id, slot_number, floor_level, slot_type, status, is_active, created_at, updated_at
            FROM parking_slots
            """;

    @Override
    public Optional<ParkingSlot> findById(Long id) {
        String sql = BASE_SELECT + " WHERE id = ?";
        try {
            ParkingSlot slot = jdbcTemplate.queryForObject(sql, rowMapper, id);
            return Optional.ofNullable(slot);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public Optional<ParkingSlot> findByIdForUpdate(Long id) {
        String sql = BASE_SELECT + " WHERE id = ? FOR UPDATE";
        try {
            ParkingSlot slot = jdbcTemplate.queryForObject(sql, rowMapper, id);
            return Optional.ofNullable(slot);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public List<ParkingSlot> findByLotId(Long lotId) {
        String sql = BASE_SELECT + " WHERE lot_id = ? AND is_active = TRUE ORDER BY floor_level ASC, slot_number ASC";
        return jdbcTemplate.query(sql, rowMapper, lotId);
    }

    @Override
    public List<ParkingSlot> findAvailableSlots(Long lotId, VehicleType slotType) {
        String sql = BASE_SELECT + """
                WHERE lot_id = ?
                  AND slot_type = ?
                  AND status = 'AVAILABLE'
                  AND is_active = TRUE
                ORDER BY floor_level ASC, slot_number ASC
                """;
        return jdbcTemplate.query(sql, rowMapper, lotId, slotType.name());
    }

    @Override
    public int updateStatus(Long slotId, SlotStatus status) {
        String sql = "UPDATE parking_slots SET status = ? WHERE id = ?";
        return jdbcTemplate.update(sql, status.name(), slotId);
    }

    @Override
    public ParkingSlot save(ParkingSlot slot) {
        String sql = """
                INSERT INTO parking_slots (lot_id, slot_number, floor_level, slot_type, status, is_active)
                VALUES (?, ?, ?, ?, ?, ?)
                """;
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(con -> {
            PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, slot.getLotId());
            ps.setString(2, slot.getSlotNumber().trim());
            ps.setInt(3, slot.getFloorLevel());
            ps.setString(4, slot.getSlotType().name());
            ps.setString(5, slot.getStatus().name());
            ps.setBoolean(6, slot.isActive());
            return ps;
        }, keyHolder);

        Long generatedId = com.smartparking.util.GeneratedKeys.getGeneratedId(keyHolder);
        if (generatedId != null) {
            slot.setId(generatedId);
        }
        return slot;
    }

    @Override
    public int update(ParkingSlot slot) {
        String sql = """
                UPDATE parking_slots
                SET slot_number = ?, floor_level = ?, slot_type = ?, status = ?, is_active = ?
                WHERE id = ?
                """;
        return jdbcTemplate.update(sql,
                slot.getSlotNumber().trim(), slot.getFloorLevel(), slot.getSlotType().name(),
                slot.getStatus().name(), slot.isActive(), slot.getId());
    }

    @Override
    public int deleteById(Long id) {
        String sql = "DELETE FROM parking_slots WHERE id = ?";
        return jdbcTemplate.update(sql, id);
    }

    @Override
    public long countByStatus(SlotStatus status) {
        String sql = "SELECT COUNT(*) FROM parking_slots WHERE status = ?";
        Long count = jdbcTemplate.queryForObject(sql, Long.class, status.name());
        return count != null ? count : 0;
    }

    @Override
    public long countByLotAndStatus(Long lotId, SlotStatus status) {
        String sql = "SELECT COUNT(*) FROM parking_slots WHERE lot_id = ? AND status = ?";
        Long count = jdbcTemplate.queryForObject(sql, Long.class, lotId, status.name());
        return count != null ? count : 0;
    }

    @Override
    public long countTotal() {
        String sql = "SELECT COUNT(*) FROM parking_slots";
        Long count = jdbcTemplate.queryForObject(sql, Long.class);
        return count != null ? count : 0;
    }
}
