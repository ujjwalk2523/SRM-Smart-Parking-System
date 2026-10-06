package com.smartparking.util;

import org.springframework.jdbc.support.KeyHolder;

import java.util.Map;

/**
 * Utility for safely extracting auto-generated primary keys from Spring KeyHolder
 * when multiple default columns (e.g. id, created_at, updated_at) are returned by the driver.
 */
public final class GeneratedKeys {

    private GeneratedKeys() {}

    public static Long getGeneratedId(KeyHolder keyHolder) {
        if (keyHolder == null || keyHolder.getKeyList() == null || keyHolder.getKeyList().isEmpty()) {
            return null;
        }

        Map<String, Object> keys = keyHolder.getKeys();
        if (keys != null) {
            for (Map.Entry<String, Object> entry : keys.entrySet()) {
                if ("id".equalsIgnoreCase(entry.getKey()) && entry.getValue() instanceof Number num) {
                    return num.longValue();
                }
            }
            for (Object val : keys.values()) {
                if (val instanceof Number num) {
                    return num.longValue();
                }
            }
        }

        try {
            Number key = keyHolder.getKey();
            return key != null ? key.longValue() : null;
        } catch (Exception ignored) {
            return null;
        }
    }

    public static Integer getGeneratedIntegerId(KeyHolder keyHolder) {
        Long id = getGeneratedId(keyHolder);
        return id != null ? id.intValue() : null;
    }
}
