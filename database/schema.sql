-- ============================================================================
-- Smart Parking Management & Booking System
-- Database Schema Definition (MySQL 8+)
-- Character Set: utf8mb4, Collation: utf8mb4_unicode_ci, Storage Engine: InnoDB
-- ============================================================================

-- Disable foreign key checks during schema re-creation
SET FOREIGN_KEY_CHECKS = 0;

-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS parking_sessions;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS parking_slots;
DROP TABLE IF EXISTS pricing_rules;
DROP TABLE IF EXISTS parking_lots;
DROP TABLE IF EXISTS parking_locations;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- 1. Table: roles
-- Defines system authority levels (e.g., ROLE_USER, ROLE_ADMIN)
-- ============================================================================
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_roles_name UNIQUE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- 2. Table: users
-- Core user accounts with BCrypt-hashed passwords and status management
-- ============================================================================
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    email VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    status ENUM('ACTIVE', 'SUSPENDED', 'DEACTIVATED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_users_email UNIQUE (email),
    CONSTRAINT uk_users_phone UNIQUE (phone_number),
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) 
        REFERENCES roles (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_users_status ON users (status);
CREATE INDEX idx_users_role_id ON users (role_id);

-- ============================================================================
-- 3. Table: vehicles
-- User-registered vehicles supporting multiple vehicle categories
-- ============================================================================
CREATE TABLE vehicles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    license_plate VARCHAR(20) NOT NULL,
    vehicle_type ENUM('CAR', 'BIKE', 'SUV', 'EV', 'TRUCK') NOT NULL DEFAULT 'CAR',
    make VARCHAR(50) NULL,
    model VARCHAR(50) NULL,
    color VARCHAR(30) NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_vehicles_license_plate UNIQUE (license_plate),
    CONSTRAINT fk_vehicles_user FOREIGN KEY (user_id) 
        REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_vehicles_user_id ON vehicles (user_id);
CREATE INDEX idx_vehicles_type ON vehicles (vehicle_type);

-- ============================================================================
-- 4. Table: parking_locations
-- Geographic regions / districts (e.g. Yeshwantpur, Indiranagar)
-- ============================================================================
CREATE TABLE parking_locations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT 'Bangalore',
    state VARCHAR(100) NOT NULL DEFAULT 'Karnataka',
    postal_code VARCHAR(20) NOT NULL,
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    image_url VARCHAR(255) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_parking_locations_code UNIQUE (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_locations_city ON parking_locations (city);
CREATE INDEX idx_locations_is_active ON parking_locations (is_active);

-- ============================================================================
-- 5. Table: parking_lots
-- Physical facilities situated inside parking locations
-- ============================================================================
CREATE TABLE parking_lots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    location_id BIGINT NOT NULL,
    lot_code VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    total_capacity INT NOT NULL DEFAULT 0,
    total_floors INT NOT NULL DEFAULT 1,
    operating_hours VARCHAR(100) NOT NULL DEFAULT '24/7',
    contact_phone VARCHAR(20) NULL,
    image_url VARCHAR(255) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_parking_lots_code UNIQUE (lot_code),
    CONSTRAINT chk_parking_lots_capacity CHECK (total_capacity >= 0),
    CONSTRAINT chk_parking_lots_floors CHECK (total_floors >= 1),
    CONSTRAINT fk_parking_lots_location FOREIGN KEY (location_id) 
        REFERENCES parking_locations (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_parking_lots_location ON parking_lots (location_id);
CREATE INDEX idx_parking_lots_active ON parking_lots (is_active);

-- ============================================================================
-- 6. Table: pricing_rules
-- Vehicle-specific tariffs configured per parking lot
-- ============================================================================
CREATE TABLE pricing_rules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lot_id BIGINT NOT NULL,
    vehicle_type ENUM('CAR', 'BIKE', 'SUV', 'EV', 'TRUCK') NOT NULL,
    base_fare DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    hourly_rate DECIMAL(10, 2) NOT NULL,
    min_hours INT NOT NULL DEFAULT 1,
    grace_period_mins INT NOT NULL DEFAULT 15,
    overstay_penalty_rate DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_lot_vehicle_pricing UNIQUE (lot_id, vehicle_type),
    CONSTRAINT chk_pricing_base_fare CHECK (base_fare >= 0.00),
    CONSTRAINT chk_pricing_hourly_rate CHECK (hourly_rate >= 0.00),
    CONSTRAINT chk_pricing_min_hours CHECK (min_hours >= 1),
    CONSTRAINT chk_pricing_grace_period CHECK (grace_period_mins >= 0),
    CONSTRAINT chk_pricing_penalty CHECK (overstay_penalty_rate >= 0.00),
    CONSTRAINT fk_pricing_lot FOREIGN KEY (lot_id) 
        REFERENCES parking_lots (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_pricing_lot ON pricing_rules (lot_id);
CREATE INDEX idx_pricing_type ON pricing_rules (vehicle_type);

-- ============================================================================
-- 7. Table: parking_slots
-- Individual physical parking bays with status lifecycle
-- Statuses: AVAILABLE, RESERVED, OCCUPIED, MAINTENANCE, DISABLED
-- ============================================================================
CREATE TABLE parking_slots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lot_id BIGINT NOT NULL,
    slot_number VARCHAR(20) NOT NULL,
    floor_level INT NOT NULL DEFAULT 1,
    slot_type ENUM('CAR', 'BIKE', 'SUV', 'EV', 'TRUCK') NOT NULL DEFAULT 'CAR',
    status ENUM('AVAILABLE', 'RESERVED', 'OCCUPIED', 'MAINTENANCE', 'DISABLED') NOT NULL DEFAULT 'AVAILABLE',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_lot_slot_number UNIQUE (lot_id, slot_number),
    CONSTRAINT fk_parking_slots_lot FOREIGN KEY (lot_id) 
        REFERENCES parking_lots (id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_parking_slots_lot_status ON parking_slots (lot_id, status);
CREATE INDEX idx_parking_slots_lot_type_status ON parking_slots (lot_id, slot_type, status);
CREATE INDEX idx_parking_slots_status ON parking_slots (status);

-- ============================================================================
-- 8. Table: bookings
-- Reservations made by users for specific slots
-- Statuses: PENDING, CONFIRMED, ACTIVE, COMPLETED, CANCELLED, EXPIRED
-- ============================================================================
CREATE TABLE bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_reference VARCHAR(40) NOT NULL,
    user_id BIGINT NOT NULL,
    vehicle_id BIGINT NOT NULL,
    slot_id BIGINT NOT NULL,
    lot_id BIGINT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
    estimated_fare DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    actual_fare DECIMAL(10, 2) NULL,
    cancellation_reason VARCHAR(255) NULL,
    cancelled_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_bookings_reference UNIQUE (booking_reference),
    CONSTRAINT chk_bookings_time_order CHECK (end_time > start_time),
    CONSTRAINT chk_bookings_est_fare CHECK (estimated_fare >= 0.00),
    CONSTRAINT chk_bookings_act_fare CHECK (actual_fare IS NULL OR actual_fare >= 0.00),
    CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) 
        REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_bookings_vehicle FOREIGN KEY (vehicle_id) 
        REFERENCES vehicles (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_bookings_slot FOREIGN KEY (slot_id) 
        REFERENCES parking_slots (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_bookings_lot FOREIGN KEY (lot_id) 
        REFERENCES parking_lots (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Core indexes for booking lookups and double-booking concurrency checks
CREATE INDEX idx_bookings_slot_status_interval ON bookings (slot_id, status, start_time, end_time);
CREATE INDEX idx_bookings_user_status ON bookings (user_id, status);
CREATE INDEX idx_bookings_lot_status ON bookings (lot_id, status);
CREATE INDEX idx_bookings_start_time ON bookings (start_time);
CREATE INDEX idx_bookings_status ON bookings (status);

-- ============================================================================
-- 9. Table: parking_sessions
-- Real-time physical check-in and check-out tracking
-- Statuses: ACTIVE, COMPLETED, OVERSTAY
-- ============================================================================
CREATE TABLE parking_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL,
    session_code VARCHAR(40) NOT NULL,
    check_in_time DATETIME NOT NULL,
    check_out_time DATETIME NULL,
    status ENUM('ACTIVE', 'COMPLETED', 'OVERSTAY') NOT NULL DEFAULT 'ACTIVE',
    total_duration_minutes INT NULL,
    calculated_fare DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    overstay_penalty DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    entry_gate VARCHAR(50) NULL,
    exit_gate VARCHAR(50) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_sessions_booking UNIQUE (booking_id),
    CONSTRAINT uk_sessions_code UNIQUE (session_code),
    CONSTRAINT chk_sessions_duration CHECK (total_duration_minutes IS NULL OR total_duration_minutes >= 0),
    CONSTRAINT chk_sessions_fare CHECK (calculated_fare >= 0.00),
    CONSTRAINT chk_sessions_penalty CHECK (overstay_penalty >= 0.00),
    CONSTRAINT fk_sessions_booking FOREIGN KEY (booking_id) 
        REFERENCES bookings (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_sessions_status ON parking_sessions (status);
CREATE INDEX idx_sessions_check_in ON parking_sessions (check_in_time);

-- ============================================================================
-- 10. Table: payments
-- Financial ledger tracking fee payments, methods, and status
-- Statuses: PENDING, COMPLETED, FAILED, REFUNDED
-- ============================================================================
CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_reference VARCHAR(40) NOT NULL,
    booking_id BIGINT NOT NULL,
    session_id BIGINT NULL,
    user_id BIGINT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NET_BANKING', 'CASH', 'WALLET') NOT NULL DEFAULT 'UPI',
    payment_status ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    transaction_id VARCHAR(100) NULL,
    paid_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uk_payments_reference UNIQUE (payment_reference),
    CONSTRAINT chk_payments_amount CHECK (amount >= 0.00),
    CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id) 
        REFERENCES bookings (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_payments_session FOREIGN KEY (session_id) 
        REFERENCES parking_sessions (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_payments_user FOREIGN KEY (user_id) 
        REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_payments_booking ON payments (booking_id);
CREATE INDEX idx_payments_user_status ON payments (user_id, payment_status);
CREATE INDEX idx_payments_status ON payments (payment_status);

-- ============================================================================
-- 11. Table: audit_logs
-- Immutable security, state transition, and operational audit trail
-- ============================================================================
CREATE TABLE audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NULL,
    old_value JSON NULL,
    new_value JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) 
        REFERENCES users (id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_audit_logs_user ON audit_logs (user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs (created_at);
