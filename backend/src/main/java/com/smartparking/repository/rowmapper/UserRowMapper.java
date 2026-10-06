package com.smartparking.repository.rowmapper;

import com.smartparking.model.User;
import com.smartparking.model.UserStatus;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.sql.Timestamp;

public class UserRowMapper implements RowMapper<User> {

    @Override
    public User mapRow(ResultSet rs, int rowNum) throws SQLException {
        User user = new User();
        user.setId(rs.getLong("id"));
        user.setRoleId(rs.getInt("role_id"));
        user.setEmail(rs.getString("email"));
        user.setPasswordHash(rs.getString("password_hash"));
        user.setFullName(rs.getString("full_name"));
        user.setPhoneNumber(rs.getString("phone_number"));

        String statusStr = rs.getString("status");
        if (statusStr != null) {
            user.setStatus(UserStatus.valueOf(statusStr));
        }

        Timestamp created = rs.getTimestamp("created_at");
        if (created != null) {
            user.setCreatedAt(created.toLocalDateTime());
        }

        Timestamp updated = rs.getTimestamp("updated_at");
        if (updated != null) {
            user.setUpdatedAt(updated.toLocalDateTime());
        }

        if (hasColumn(rs, "role_name")) {
            user.setRoleName(rs.getString("role_name"));
        }

        return user;
    }

    private boolean hasColumn(ResultSet rs, String columnName) {
        try {
            ResultSetMetaData meta = rs.getMetaData();
            int columns = meta.getColumnCount();
            for (int x = 1; x <= columns; x++) {
                if (columnName.equalsIgnoreCase(meta.getColumnLabel(x)) ||
                    columnName.equalsIgnoreCase(meta.getColumnName(x))) {
                    return true;
                }
            }
        } catch (SQLException ignored) {}
        return false;
    }
}
