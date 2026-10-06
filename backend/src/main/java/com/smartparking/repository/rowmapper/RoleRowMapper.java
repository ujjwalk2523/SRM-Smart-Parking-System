package com.smartparking.repository.rowmapper;

import com.smartparking.model.Role;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;

public class RoleRowMapper implements RowMapper<Role> {
    @Override
    public Role mapRow(ResultSet rs, int rowNum) throws SQLException {
        Role role = new Role();
        role.setId(rs.getInt("id"));
        role.setName(rs.getString("name"));
        role.setDescription(rs.getString("description"));
        Timestamp ts = rs.getTimestamp("created_at");
        if (ts != null) {
            role.setCreatedAt(ts.toLocalDateTime());
        }
        return role;
    }
}
