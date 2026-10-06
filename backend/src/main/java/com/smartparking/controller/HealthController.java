package com.smartparking.controller;

import com.smartparking.dto.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Health check endpoint verifying application uptime and JDBC database connectivity.
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {

    private static final Logger logger = LoggerFactory.getLogger(HealthController.class);
    private final JdbcTemplate jdbcTemplate;

    public HealthController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkHealth() {
        Map<String, Object> healthInfo = new HashMap<>();
        healthInfo.put("status", "UP");
        healthInfo.put("application", "Smart Parking Management System");
        healthInfo.put("version", "2.0.0");
        healthInfo.put("timestamp", LocalDateTime.now());

        boolean dbConnected = false;
        try {
            Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            if (result != null && result == 1) {
                dbConnected = true;
                healthInfo.put("database", "CONNECTED");
            } else {
                healthInfo.put("database", "UNKNOWN_RESPONSE");
            }
        } catch (Exception ex) {
            logger.warn("Database health check failed: {}", ex.getMessage());
            healthInfo.put("database", "DISCONNECTED");
            healthInfo.put("databaseError", ex.getMessage());
        }

        if (dbConnected) {
            return ResponseEntity.ok(ApiResponse.success(healthInfo, "System and database are healthy"));
        } else {
            ApiResponse<Map<String, Object>> response = ApiResponse.error(
                    "Application is running but database is unreachable",
                    "DATABASE_UNAVAILABLE"
            );
            response.setData(healthInfo);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
        }
    }
}
