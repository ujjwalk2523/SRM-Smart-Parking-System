package com.smartparking.repository;

import com.smartparking.model.Role;

import java.util.List;
import java.util.Optional;

public interface RoleRepository {
    Optional<Role> findById(Integer id);
    Optional<Role> findByName(String name);
    List<Role> findAll();
    Role save(Role role);
}
