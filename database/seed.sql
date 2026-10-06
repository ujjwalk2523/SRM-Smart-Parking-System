-- ============================================================================
-- Smart Parking Management & Booking System
-- SRM Institute of Science and Technology, Kattankulathur (SRM KTR)
-- Database Seed Data (MySQL 8+)
-- Incorporating all 14 Official Campus Parking Areas & Authentic Assets
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Clean existing data
TRUNCATE TABLE audit_logs;
TRUNCATE TABLE payments;
TRUNCATE TABLE parking_sessions;
TRUNCATE TABLE bookings;
TRUNCATE TABLE parking_slots;
TRUNCATE TABLE pricing_rules;
TRUNCATE TABLE parking_lots;
TRUNCATE TABLE parking_locations;
TRUNCATE TABLE vehicles;
TRUNCATE TABLE users;
TRUNCATE TABLE roles;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- 1. Seed Roles
-- ============================================================================
INSERT INTO roles (id, name, description) VALUES
(1, 'ROLE_ADMIN', 'SRM Campus Parking Administrator with full operational & audit control'),
(2, 'ROLE_CUSTOMER', 'SRM Student, Faculty, Staff or Campus Visitor');

-- ============================================================================
-- 2. Seed Users
-- ============================================================================
INSERT INTO users (id, role_id, email, password_hash, full_name, phone_number, status) VALUES
(1, 1, 'admin@srmist.edu.in', '$2a$10$V2qukXczgjjZpWanIUE/U.IgqhRiVRo/gVh0CqhLzSigoQL8oegdO', 'SRM Security & Transport Head', '+919876543210', 'ACTIVE'),
(2, 2, 'student.ktr@srmist.edu.in', '$2a$10$Dbdv13BSnjvRKrsKjYRuiep39Fba5t0/LCXpTvzrmQFD1h2Gotyyq', 'Aarav Sundaram (B.Tech CSE)', '+919876543211', 'ACTIVE'),
(3, 2, 'faculty.ktr@srmist.edu.in', '$2a$10$Dbdv13BSnjvRKrsKjYRuiep39Fba5t0/LCXpTvzrmQFD1h2Gotyyq', 'Dr. Priya Natarajan (Prof ECE)', '+919876543212', 'ACTIVE'),
(4, 2, 'visitor.ktr@example.com', '$2a$10$Dbdv13BSnjvRKrsKjYRuiep39Fba5t0/LCXpTvzrmQFD1h2Gotyyq', 'Campus Visitor / Guest Speaker', '+919876543213', 'ACTIVE'),
(5, 1, 'admin@smartparking.com', '$2a$10$V2qukXczgjjZpWanIUE/U.IgqhRiVRo/gVh0CqhLzSigoQL8oegdO', 'System Administrator', '+919876543215', 'ACTIVE'),
(6, 2, 'john.doe@example.com', '$2a$10$Dbdv13BSnjvRKrsKjYRuiep39Fba5t0/LCXpTvzrmQFD1h2Gotyyq', 'John Doe', '+919876543216', 'ACTIVE');

-- ============================================================================
-- 3. Seed Vehicles
-- ============================================================================
INSERT INTO vehicles (id, user_id, license_plate, vehicle_type, make, model, color, is_default) VALUES
(1, 2, 'TN-19-AX-4021', 'CAR', 'Honda', 'City', 'Silver Metallic', TRUE),
(2, 2, 'TN-19-BK-8822', 'BIKE', 'Royal Enfield', 'Hunter 350', 'Rebel Blue', FALSE),
(3, 3, 'TN-11-EV-2024', 'EV', 'Tata', 'Nexon EV Empowered', 'Teal Green', TRUE),
(4, 3, 'TN-19-MH-5566', 'CAR', 'Hyundai', 'i20 Asta', 'Polar White', FALSE),
(5, 4, 'TN-07-GH-7890', 'SUV', 'Toyota', 'Fortuner Legender', 'Attitude Black', TRUE),
(6, 4, 'TN-19-KT-3344', 'BIKE', 'KTM', 'Duke 250', 'Electronic Orange', FALSE);

-- ============================================================================
-- 4. Seed SRM KTR Campus Locations (6 Zones across Kattankulathur)
-- ============================================================================
INSERT INTO parking_locations (id, name, code, address, city, state, postal_code, latitude, longitude, image_url, is_active) VALUES
(1, 'SRM Tech Park & University Building (UB) Sector', 'LOC-SRM-TP', 'Tech Park Boulevard, Main Campus Road, SRM IST', 'Kattankulathur', 'Tamil Nadu', '603203', 12.82310000, 80.04420000, '/assets/srm/srm-tech-park.jpg', TRUE),
(2, 'SRM Intra College Road & Clock Tower Zone', 'LOC-SRM-ICR', 'Intra College Road, Near Central Clock Tower & Admin Quad', 'Kattankulathur', 'Tamil Nadu', '603203', 12.82450000, 80.04550000, '/assets/srm/srm-campus-map.jpg', TRUE),
(3, 'SRM College Road & Main Campus Boulevard', 'LOC-SRM-COL', 'College Road, Near Main Campus Gate & Food Court', 'Kattankulathur', 'Tamil Nadu', '603203', 12.82580000, 80.04680000, '/assets/srm/srm-campus-layout.jpg', TRUE),
(4, 'SRM Potheri & SRM Nagar Entry Gate', 'LOC-SRM-NGR', 'SRM Nagar Main Gate, Potheri Railway Station Cross Road', 'Kattankulathur', 'Tamil Nadu', '603203', 12.82100000, 80.04150000, '/assets/srm/srm-campus-map.jpg', TRUE),
(5, 'SRM Pillayar Koil Street & Hostels Perimeter', 'LOC-SRM-PKS', 'Pillayar Koil Street Area, Near Paari, Oori & Adhiyaman Hostels', 'Kattankulathur', 'Tamil Nadu', '603203', 12.81950000, 80.04800000, '/assets/srm/srm-campus-layout.jpg', TRUE),
(6, 'SRM Transit Terminal & Logistics Depo', 'LOC-SRM-BUS', 'SRM Transport Depo, GST Service Road, Kattankulathur', 'Kattankulathur', 'Tamil Nadu', '603203', 12.82700000, 80.04300000, '/assets/srm/srm-campus-layout.jpg', TRUE);

-- ============================================================================
-- 5. Seed All 14 Official SRM KTR Parking Areas
-- ============================================================================
INSERT INTO parking_lots (id, location_id, lot_code, name, total_capacity, total_floors, operating_hours, contact_phone, image_url, is_active) VALUES
(1, 1, 'LOT-TP-BIKE', 'tech park Bike Parking — Tech Park area', 40, 1, '24/7', '+914427452270', '/assets/srm/srm-tech-park.jpg', TRUE),
(2, 1, 'LOT-TP-UNIV', 'SRM University Parking — general parking', 50, 3, '24/7', '+914427452271', '/assets/srm/srm-tech-park.jpg', TRUE),
(3, 1, 'LOT-UB-CAR', 'Car parking — car parking (Tech Park / UB)', 30, 2, '06:00 - 23:00', '+914427417000', '/assets/srm/srm-tech-park.jpg', TRUE),
(4, 2, 'LOT-ICR-01', 'Parking Lot 1 — Intra College Road', 35, 1, '24/7', '+914427453388', '/assets/srm/srm-campus-map.jpg', TRUE),
(5, 2, 'LOT-ICR-BIKE', 'Bike Parking — Intra College Road', 40, 1, '24/7', '+914427453389', '/assets/srm/srm-campus-map.jpg', TRUE),
(6, 2, 'LOT-ICR-2W', 'Two Wheeler''s Parking — Intra College Road', 30, 1, '06:00 - 22:00', '+914427453390', '/assets/srm/srm-campus-map.jpg', TRUE),
(7, 3, 'LOT-COL-GEN', 'Parking lot — College Road', 35, 1, '24/7', '+914427451568', '/assets/srm/srm-campus-layout.jpg', TRUE),
(8, 3, 'LOT-COL-MAIN', 'Parking — general parking (College Road)', 40, 1, '24/7', '+914427451569', '/assets/srm/srm-campus-layout.jpg', TRUE),
(9, 3, 'LOT-COL-BIKE', 'Bike Parking — bike parking (College Road)', 35, 1, '24/7', '+914427451570', '/assets/srm/srm-campus-layout.jpg', TRUE),
(10, 4, 'LOT-NGR-02', 'Parking Lot 2 — Potheri/SRM Nagar', 35, 1, '24/7', '+914427454411', '/assets/srm/srm-campus-map.jpg', TRUE),
(11, 4, 'LOT-NGR-2W', 'Two Wheeler Parking — SRM Nagar', 45, 1, '24/7', '+914427454412', '/assets/srm/srm-campus-map.jpg', TRUE),
(12, 5, 'LOT-PKS-BIKE', 'Bike Parking — Pillayar Koil Street area', 35, 1, '24/7', '+914427455501', '/assets/srm/srm-campus-layout.jpg', TRUE),
(13, 5, 'LOT-HST-2W', 'SRM Parking — two-wheeler parking (Hostels)', 40, 1, '24/7', '+914427455502', '/assets/srm/srm-campus-layout.jpg', TRUE),
(14, 6, 'LOT-BUS-01', 'SRM bus parking — bus parking (Transport Depo)', 25, 1, '24/7', '+914427456600', '/assets/srm/srm-campus-layout.jpg', TRUE);

-- ============================================================================
-- 6. Seed Campus Subsidized Pricing Rules
-- ============================================================================
INSERT INTO pricing_rules (id, lot_id, vehicle_type, base_fare, hourly_rate, min_hours, grace_period_mins, overstay_penalty_rate, is_active) VALUES
(1, 1, 'BIKE', 5.00, 5.00, 1, 15, 10.00, TRUE),
(2, 1, 'EV', 10.00, 15.00, 1, 20, 25.00, TRUE),
(3, 2, 'CAR', 20.00, 20.00, 1, 15, 40.00, TRUE),
(4, 2, 'BIKE', 10.00, 10.00, 1, 15, 20.00, TRUE),
(5, 2, 'SUV', 30.00, 30.00, 1, 15, 50.00, TRUE),
(6, 2, 'EV', 15.00, 25.00, 1, 20, 40.00, TRUE),
(7, 3, 'CAR', 20.00, 20.00, 1, 15, 40.00, TRUE),
(8, 3, 'SUV', 30.00, 30.00, 1, 15, 50.00, TRUE),
(9, 3, 'EV', 15.00, 25.00, 1, 20, 40.00, TRUE),
(10, 4, 'CAR', 20.00, 20.00, 1, 15, 35.00, TRUE),
(11, 4, 'BIKE', 10.00, 10.00, 1, 15, 15.00, TRUE),
(12, 5, 'BIKE', 5.00, 5.00, 1, 15, 10.00, TRUE),
(13, 6, 'BIKE', 5.00, 5.00, 1, 15, 10.00, TRUE),
(14, 7, 'CAR', 20.00, 20.00, 1, 15, 35.00, TRUE),
(15, 7, 'BIKE', 10.00, 10.00, 1, 15, 15.00, TRUE),
(16, 8, 'CAR', 20.00, 20.00, 1, 15, 35.00, TRUE),
(17, 8, 'BIKE', 10.00, 10.00, 1, 15, 15.00, TRUE),
(18, 9, 'BIKE', 5.00, 5.00, 1, 15, 10.00, TRUE),
(19, 10, 'CAR', 15.00, 15.00, 1, 20, 30.00, TRUE),
(20, 10, 'BIKE', 5.00, 5.00, 1, 20, 10.00, TRUE),
(21, 11, 'BIKE', 5.00, 5.00, 1, 20, 10.00, TRUE),
(22, 12, 'BIKE', 5.00, 5.00, 1, 20, 10.00, TRUE),
(23, 13, 'BIKE', 5.00, 5.00, 1, 20, 10.00, TRUE),
(24, 14, 'BUS', 50.00, 50.00, 1, 30, 80.00, TRUE);

-- ============================================================================
-- 7. Seed SRM KTR Parking Slots
-- ============================================================================
INSERT INTO parking_slots (id, lot_id, slot_number, floor_level, slot_type, status, is_active) VALUES
-- Lot 1: tech park Bike Parking
(1, 1, 'TP-BK-01', 1, 'BIKE', 'AVAILABLE', TRUE),
(2, 1, 'TP-BK-02', 1, 'BIKE', 'AVAILABLE', TRUE),
(3, 1, 'TP-BK-03', 1, 'BIKE', 'OCCUPIED', TRUE),
(4, 1, 'TP-BK-04', 1, 'BIKE', 'AVAILABLE', TRUE),
-- Lot 2: SRM University Parking
(5, 2, 'UNIV-C-01', 1, 'CAR', 'AVAILABLE', TRUE),
(6, 2, 'UNIV-C-02', 1, 'CAR', 'OCCUPIED', TRUE),
(7, 2, 'UNIV-C-03', 1, 'CAR', 'RESERVED', TRUE),
(8, 2, 'UNIV-EV-01', 1, 'EV', 'AVAILABLE', TRUE),
(9, 2, 'UNIV-B-01', 2, 'BIKE', 'AVAILABLE', TRUE),
(10, 2, 'UNIV-S-01', 3, 'SUV', 'AVAILABLE', TRUE),
-- Lot 3: Car parking (UB)
(11, 3, 'UB-C-01', 1, 'CAR', 'AVAILABLE', TRUE),
(12, 3, 'UB-C-02', 1, 'CAR', 'AVAILABLE', TRUE),
(13, 3, 'UB-EV-01', 1, 'EV', 'AVAILABLE', TRUE),
-- Lot 4: Parking Lot 1 - Intra College Road
(14, 4, 'ICR-C-01', 1, 'CAR', 'AVAILABLE', TRUE),
(15, 4, 'ICR-C-02', 1, 'CAR', 'AVAILABLE', TRUE),
(16, 4, 'ICR-B-01', 1, 'BIKE', 'AVAILABLE', TRUE),
-- Lot 5: Bike Parking - Intra College Road
(17, 5, 'ICR-BK-01', 1, 'BIKE', 'AVAILABLE', TRUE),
(18, 5, 'ICR-BK-02', 1, 'BIKE', 'AVAILABLE', TRUE),
(19, 5, 'ICR-BK-03', 1, 'BIKE', 'OCCUPIED', TRUE),
-- Lot 6: Two Wheeler's Parking - Intra College Road
(20, 6, 'ICR-2W-01', 1, 'BIKE', 'AVAILABLE', TRUE),
(21, 6, 'ICR-2W-02', 1, 'BIKE', 'AVAILABLE', TRUE),
-- Lot 7: Parking lot - College Road
(22, 7, 'COL-C-01', 1, 'CAR', 'AVAILABLE', TRUE),
(23, 7, 'COL-C-02', 1, 'CAR', 'AVAILABLE', TRUE),
(24, 7, 'COL-B-01', 1, 'BIKE', 'AVAILABLE', TRUE),
-- Lot 8: Parking - general parking (College Road)
(25, 8, 'COL-G-01', 1, 'CAR', 'AVAILABLE', TRUE),
(26, 8, 'COL-G-02', 1, 'CAR', 'AVAILABLE', TRUE),
(27, 8, 'COL-G-03', 1, 'BIKE', 'AVAILABLE', TRUE),
-- Lot 9: Bike Parking - bike parking (College Road)
(28, 9, 'COL-BK-01', 1, 'BIKE', 'AVAILABLE', TRUE),
(29, 9, 'COL-BK-02', 1, 'BIKE', 'AVAILABLE', TRUE),
-- Lot 10: Parking Lot 2 - Potheri/SRM Nagar
(30, 10, 'NGR-C-01', 1, 'CAR', 'AVAILABLE', TRUE),
(31, 10, 'NGR-C-02', 1, 'CAR', 'AVAILABLE', TRUE),
(32, 10, 'NGR-B-01', 1, 'BIKE', 'AVAILABLE', TRUE),
-- Lot 11: Two Wheeler Parking - SRM Nagar
(33, 11, 'NGR-2W-01', 1, 'BIKE', 'AVAILABLE', TRUE),
(34, 11, 'NGR-2W-02', 1, 'BIKE', 'AVAILABLE', TRUE),
(35, 11, 'NGR-2W-03', 1, 'BIKE', 'AVAILABLE', TRUE),
-- Lot 12: Bike Parking - Pillayar Koil Street area
(36, 12, 'PKS-BK-01', 1, 'BIKE', 'AVAILABLE', TRUE),
(37, 12, 'PKS-BK-02', 1, 'BIKE', 'AVAILABLE', TRUE),
-- Lot 13: SRM Parking - two-wheeler parking (Hostels)
(38, 13, 'HST-2W-01', 1, 'BIKE', 'AVAILABLE', TRUE),
(39, 13, 'HST-2W-02', 1, 'BIKE', 'AVAILABLE', TRUE),
(40, 13, 'HST-2W-03', 1, 'BIKE', 'AVAILABLE', TRUE),
-- Lot 14: SRM bus parking - bus parking
(41, 14, 'BUS-01', 1, 'BUS', 'AVAILABLE', TRUE),
(42, 14, 'BUS-02', 1, 'BUS', 'AVAILABLE', TRUE);

-- ============================================================================
-- 8. Seed SRM Bookings
-- ============================================================================
INSERT INTO bookings (id, booking_reference, user_id, vehicle_id, slot_id, lot_id, start_time, end_time, status, estimated_fare, actual_fare, created_at) VALUES
(1, 'SRM-BK-20261006-0001', 2, 1, 6, 2, '2026-10-06 09:00:00', '2026-10-06 17:00:00', 'ACTIVE', 160.00, NULL, '2026-10-06 08:30:00'),
(2, 'SRM-BK-20261006-0002', 3, 3, 7, 2, '2026-10-06 10:00:00', '2026-10-06 14:00:00', 'CONFIRMED', 100.00, NULL, '2026-10-06 09:15:00'),
(3, 'SRM-BK-20261005-0003', 4, 5, 10, 2, '2026-10-05 11:00:00', '2026-10-05 13:00:00', 'COMPLETED', 60.00, 60.00, '2026-10-05 10:45:00'),
(4, 'SRM-BK-20261004-0004', 2, 2, 3, 1, '2026-10-04 08:30:00', '2026-10-04 12:30:00', 'CANCELLED', 40.00, 0.00, '2026-10-04 08:00:00');

-- ============================================================================
-- 9. Seed SRM Parking Sessions
-- ============================================================================
INSERT INTO parking_sessions (id, booking_id, session_code, check_in_time, check_out_time, status, total_duration_minutes, calculated_fare, overstay_penalty, entry_gate, exit_gate) VALUES
(1, 1, 'SRM-SES-20261006-0001', '2026-10-06 08:55:00', NULL, 'ACTIVE', NULL, 160.00, 0.00, 'GATE-TECH-PARK-NORTH', NULL),
(2, 3, 'SRM-SES-20261005-0003', '2026-10-05 10:58:00', '2026-10-05 12:59:00', 'COMPLETED', 121, 60.00, 0.00, 'GATE-MAIN-ARCH', 'GATE-EXIT-UB');

-- ============================================================================
-- 10. Seed SRM Payments
-- ============================================================================
INSERT INTO payments (id, payment_reference, booking_id, session_id, user_id, amount, payment_method, payment_status, transaction_id, paid_at) VALUES
(1, 'SRM-PAY-20261005-0001', 3, 2, 4, 60.00, 'UPI', 'COMPLETED', 'UPI-SRM-TXN-77889900', '2026-10-05 13:00:00'),
(2, 'SRM-PAY-20261006-0002', 2, NULL, 3, 100.00, 'CREDIT_CARD', 'COMPLETED', 'CC-SRM-AUTH-55443322', '2026-10-06 09:16:00');

-- ============================================================================
-- 11. Seed SRM Audit Logs
-- ============================================================================
INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, old_value, new_value, ip_address, user_agent) VALUES
(1, 1, 'CAMPUS_SYSTEM_INIT', 'SYSTEM', 1, NULL, '{"campus": "SRM_IST_KTR", "zones": 6, "lots": 14}', '127.0.0.1', 'SRM Campus Deployment Script'),
(2, 2, 'STUDENT_BOOKING_CREATE', 'BOOKING', 1, NULL, '{"ref": "SRM-BK-20261006-0001", "slot": "UNIV-C-02", "lot": "SRM University Parking"}', '192.168.1.55', 'SRM Portal WebApp');
