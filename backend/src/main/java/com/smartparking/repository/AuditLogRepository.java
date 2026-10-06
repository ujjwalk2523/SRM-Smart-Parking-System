package com.smartparking.repository;

import com.smartparking.model.AuditLog;

import java.util.List;

public interface AuditLogRepository {
    AuditLog save(AuditLog log);
    List<AuditLog> findByUserId(Long userId, int limit);
    List<AuditLog> findByEntity(String entityType, Long entityId);
    List<AuditLog> findAll(int offset, int limit);
    long count();
}
