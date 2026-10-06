CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    status VARCHAR(30) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    license_plate VARCHAR(20) NOT NULL UNIQUE,
    vehicle_type VARCHAR(30) DEFAULT 'CAR',
    make VARCHAR(50),
    model VARCHAR(50),
    color VARCHAR(30),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS parking_locations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) DEFAULT 'Bangalore',
    state VARCHAR(100) DEFAULT 'Karnataka',
    postal_code VARCHAR(20) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS parking_lots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    location_id BIGINT NOT NULL,
    lot_code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    total_capacity INT DEFAULT 0,
    total_floors INT DEFAULT 1,
    operating_hours VARCHAR(100) DEFAULT '24/7',
    contact_phone VARCHAR(20),
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pricing_rules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lot_id BIGINT NOT NULL,
    vehicle_type VARCHAR(30) NOT NULL,
    base_fare DECIMAL(10, 2) DEFAULT 0.00,
    hourly_rate DECIMAL(10, 2) NOT NULL,
    min_hours INT DEFAULT 1,
    grace_period_mins INT DEFAULT 15,
    overstay_penalty_rate DECIMAL(10, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS parking_slots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lot_id BIGINT NOT NULL,
    slot_number VARCHAR(20) NOT NULL,
    floor_level INT DEFAULT 1,
    slot_type VARCHAR(30) DEFAULT 'CAR',
    status VARCHAR(30) DEFAULT 'AVAILABLE',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_reference VARCHAR(40) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    vehicle_id BIGINT NOT NULL,
    slot_id BIGINT NOT NULL,
    lot_id BIGINT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING',
    estimated_fare DECIMAL(10, 2) DEFAULT 0.00,
    actual_fare DECIMAL(10, 2),
    cancellation_reason VARCHAR(255),
    cancelled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS parking_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT NOT NULL UNIQUE,
    session_code VARCHAR(40) NOT NULL UNIQUE,
    check_in_time TIMESTAMP NOT NULL,
    check_out_time TIMESTAMP,
    status VARCHAR(30) DEFAULT 'ACTIVE',
    total_duration_minutes INT,
    calculated_fare DECIMAL(10, 2) DEFAULT 0.00,
    overstay_penalty DECIMAL(10, 2) DEFAULT 0.00,
    entry_gate VARCHAR(50),
    exit_gate VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_reference VARCHAR(40) NOT NULL UNIQUE,
    booking_id BIGINT NOT NULL,
    session_id BIGINT,
    user_id BIGINT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(30) DEFAULT 'UPI',
    payment_status VARCHAR(30) DEFAULT 'PENDING',
    transaction_id VARCHAR(100),
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT,
    old_value VARCHAR(1000),
    new_value VARCHAR(1000),
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
