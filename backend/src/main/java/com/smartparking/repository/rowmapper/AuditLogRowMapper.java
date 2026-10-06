package com.smartparking.repository.rowmapper;

import com.smartparking.model.AuditLog;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Timestamp;

public class AuditLogRowMapper implements RowMapper<AuditLog> {

    @Override
    public AuditLog mapRow(ResultSet rs, int rowNum) throws SQLException {
        AuditLog log = new AuditLog();
        log.setId(rs.getLong("id"));

        long uid = rs.getLong("user_id");
        if (!rs.wasNull()) {
            log.setUserId(uid);
        }

        log.setAction(rs.getString("action"));
        log.setEntityType(rs.getString("entity_type"));

        long entityId = rs.getLong("entity_id");
        if (!rs.wasNull()) {
            log.setEntityId(entityId);
        }

        log.setOldValue(rs.getString("old_value"));
        log.setNewValue(rs.getString("new_value"));
        log.setIpAddress(rs.getString("ip_address"));
        log.setUserAgent(rs.getString("user_agent"));

        Timestamp created = rs.getTimestamp("created_at");
        if (created != null) {
            log.setCreatedAt(created.toLocalDateTime());
        }

        if (hasColumn(rs, "user_email")) {
            log.setUserEmail(rs.getString("user_email"));
        }

        return log;
    }

    private boolean hasColumn(ResultSet rs, String columnName) {
        try {
            ResultSetMetaData meta = rs.getMetaData();
            int count = meta.getColumnCount();
            for (int i = 1; i <= count; i++) {
                if (columnName.equalsIgnoreCase(meta.getColumnLabel(i)) ||
                    columnName.equalsIgnoreCase(meta.getColumnName(i))) {
                    return true;
                }
            }
        } catch (SQLException ignored) {}
        return false;
    }
}
