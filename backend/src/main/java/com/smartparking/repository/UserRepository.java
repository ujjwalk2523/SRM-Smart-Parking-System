package com.smartparking.repository;

import com.smartparking.model.User;
import com.smartparking.model.UserStatus;

import java.util.List;
import java.util.Optional;

public interface UserRepository {
    Optional<User> findById(Long id);
    Optional<User> findByEmail(String email);
    Optional<User> findByPhoneNumber(String phoneNumber);
    List<User> findAll(int offset, int limit);
    long count();
    User save(User user);
    int update(User user);
    int updatePassword(Long id, String passwordHash);
    int updateStatus(Long id, UserStatus status);
    boolean existsByEmail(String email);
    boolean existsByPhoneNumber(String phoneNumber);
}
