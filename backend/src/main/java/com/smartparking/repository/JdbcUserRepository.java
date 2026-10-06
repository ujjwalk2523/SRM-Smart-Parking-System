package com.smartparking.repository;

import com.smartparking.model.User;
import com.smartparking.model.UserStatus;
import com.smartparking.repository.rowmapper.UserRowMapper;
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
public class JdbcUserRepository implements UserRepository {

    private final JdbcTemplate jdbcTemplate;
    private final UserRowMapper rowMapper = new UserRowMapper();

    public JdbcUserRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private static final String BASE_SELECT = """
            SELECT u.id, u.role_id, r.name AS role_name, u.email, u.password_hash,
                   u.full_name, u.phone_number, u.status, u.created_at, u.updated_at
            FROM users u
            JOIN roles r ON u.role_id = r.id
            """;

    @Override
    public Optional<User> findById(Long id) {
        String sql = BASE_SELECT + " WHERE u.id = ?";
        try {
            User user = jdbcTemplate.queryForObject(sql, rowMapper, id);
            return Optional.ofNullable(user);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public Optional<User> findByEmail(String email) {
        String sql = BASE_SELECT + " WHERE LOWER(u.email) = LOWER(?)";
        try {
            User user = jdbcTemplate.queryForObject(sql, rowMapper, email);
            return Optional.ofNullable(user);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public Optional<User> findByPhoneNumber(String phoneNumber) {
        String sql = BASE_SELECT + " WHERE u.phone_number = ?";
        try {
            User user = jdbcTemplate.queryForObject(sql, rowMapper, phoneNumber);
            return Optional.ofNullable(user);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public List<User> findAll(int offset, int limit) {
        String sql = BASE_SELECT + " ORDER BY u.id DESC LIMIT ? OFFSET ?";
        return jdbcTemplate.query(sql, rowMapper, limit, offset);
    }

    @Override
    public long count() {
        String sql = "SELECT COUNT(*) FROM users";
        Long count = jdbcTemplate.queryForObject(sql, Long.class);
        return count != null ? count : 0;
    }

    @Override
    public User save(User user) {
        String sql = "INSERT INTO users (role_id, email, password_hash, full_name, phone_number, status) VALUES (?, ?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(con -> {
            PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setInt(1, user.getRoleId());
            ps.setString(2, user.getEmail().trim().toLowerCase());
            ps.setString(3, user.getPasswordHash());
            ps.setString(4, user.getFullName().trim());
            ps.setString(5, user.getPhoneNumber().trim());
            ps.setString(6, user.getStatus() != null ? user.getStatus().name() : UserStatus.ACTIVE.name());
            return ps;
        }, keyHolder);

        Long generatedId = com.smartparking.util.GeneratedKeys.getGeneratedId(keyHolder);
        if (generatedId != null) {
            user.setId(generatedId);
        }
        return user;
    }

    @Override
    public int update(User user) {
        String sql = "UPDATE users SET full_name = ?, phone_number = ? WHERE id = ?";
        return jdbcTemplate.update(sql, user.getFullName().trim(), user.getPhoneNumber().trim(), user.getId());
    }

    @Override
    public int updatePassword(Long id, String passwordHash) {
        String sql = "UPDATE users SET password_hash = ? WHERE id = ?";
        return jdbcTemplate.update(sql, passwordHash, id);
    }

    @Override
    public int updateStatus(Long id, UserStatus status) {
        String sql = "UPDATE users SET status = ? WHERE id = ?";
        return jdbcTemplate.update(sql, status.name(), id);
    }

    @Override
    public boolean existsByEmail(String email) {
        String sql = "SELECT COUNT(*) FROM users WHERE LOWER(email) = LOWER(?)";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, email);
        return count != null && count > 0;
    }

    @Override
    public boolean existsByPhoneNumber(String phoneNumber) {
        String sql = "SELECT COUNT(*) FROM users WHERE phone_number = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, phoneNumber);
        return count != null && count > 0;
    }
}
