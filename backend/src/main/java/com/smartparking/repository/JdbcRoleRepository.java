package com.smartparking.repository;

import com.smartparking.model.Role;
import com.smartparking.repository.rowmapper.RoleRowMapper;
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
public class JdbcRoleRepository implements RoleRepository {

    private final JdbcTemplate jdbcTemplate;
    private final RoleRowMapper rowMapper = new RoleRowMapper();

    public JdbcRoleRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public Optional<Role> findById(Integer id) {
        String sql = "SELECT id, name, description, created_at FROM roles WHERE id = ?";
        try {
            Role role = jdbcTemplate.queryForObject(sql, rowMapper, id);
            return Optional.ofNullable(role);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public Optional<Role> findByName(String name) {
        String sql = "SELECT id, name, description, created_at FROM roles WHERE name = ?";
        try {
            Role role = jdbcTemplate.queryForObject(sql, rowMapper, name);
            return Optional.ofNullable(role);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public List<Role> findAll() {
        String sql = "SELECT id, name, description, created_at FROM roles ORDER BY id ASC";
        return jdbcTemplate.query(sql, rowMapper);
    }

    @Override
    public Role save(Role role) {
        if (role.getId() == null) {
            String sql = "INSERT INTO roles (name, description) VALUES (?, ?)";
            KeyHolder keyHolder = new GeneratedKeyHolder();
            jdbcTemplate.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
                ps.setString(1, role.getName());
                ps.setString(2, role.getDescription());
                return ps;
            }, keyHolder);

            Integer generatedId = com.smartparking.util.GeneratedKeys.getGeneratedIntegerId(keyHolder);
            if (generatedId != null) {
                role.setId(generatedId);
            }
        } else {
            String sql = "UPDATE roles SET name = ?, description = ? WHERE id = ?";
            jdbcTemplate.update(sql, role.getName(), role.getDescription(), role.getId());
        }
        return role;
    }
}
