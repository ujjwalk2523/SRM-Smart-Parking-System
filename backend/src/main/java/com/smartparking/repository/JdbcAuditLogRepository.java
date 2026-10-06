package com.smartparking.repository;

import com.smartparking.model.AuditLog;
import com.smartparking.repository.rowmapper.AuditLogRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Types;
import java.util.List;

@Repository
public class JdbcAuditLogRepository implements AuditLogRepository {

    private final JdbcTemplate jdbcTemplate;
    private final AuditLogRowMapper rowMapper = new AuditLogRowMapper();

    public JdbcAuditLogRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private static final String BASE_SELECT = """
            SELECT a.id, a.user_id, u.email AS user_email, a.action, a.entity_type, a.entity_id,
                   a.old_value, a.new_value, a.ip_address, a.user_agent, a.created_at
            FROM audit_logs a
            LEFT JOIN users u ON a.user_id = u.id
            """;

    @Override
    public AuditLog save(AuditLog log) {
        String sql = """
                INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_value, new_value, ip_address, user_agent)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """;
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(con -> {
            PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            if (log.getUserId() != null) {
                ps.setLong(1, log.getUserId());
            } else {
                ps.setNull(1, Types.BIGINT);
            }
            ps.setString(2, log.getAction());
            ps.setString(3, log.getEntityType());
            if (log.getEntityId() != null) {
                ps.setLong(4, log.getEntityId());
            } else {
                ps.setNull(4, Types.BIGINT);
            }
            ps.setString(5, log.getOldValue());
            ps.setString(6, log.getNewValue());
            ps.setString(7, log.getIpAddress());
            ps.setString(8, log.getUserAgent());
            return ps;
        }, keyHolder);

        Long generatedId = com.smartparking.util.GeneratedKeys.getGeneratedId(keyHolder);
        if (generatedId != null) {
            log.setId(generatedId);
        }
        return log;
    }

    @Override
    public List<AuditLog> findByUserId(Long userId, int limit) {
        String sql = BASE_SELECT + " WHERE a.user_id = ? ORDER BY a.id DESC LIMIT ?";
        return jdbcTemplate.query(sql, rowMapper, userId, limit);
    }

    @Override
    public List<AuditLog> findByEntity(String entityType, Long entityId) {
        String sql = BASE_SELECT + " WHERE a.entity_type = ? AND a.entity_id = ? ORDER BY a.id DESC";
        return jdbcTemplate.query(sql, rowMapper, entityType, entityId);
    }

    @Override
    public List<AuditLog> findAll(int offset, int limit) {
        String sql = BASE_SELECT + " ORDER BY a.id DESC LIMIT ? OFFSET ?";
        return jdbcTemplate.query(sql, rowMapper, limit, offset);
    }

    @Override
    public long count() {
        String sql = "SELECT COUNT(*) FROM audit_logs";
        Long count = jdbcTemplate.queryForObject(sql, Long.class);
        return count != null ? count : 0;
    }
}
