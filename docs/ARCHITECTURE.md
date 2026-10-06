# System Architecture & Technical Specifications: Smart Parking System

## 1. High-Level Architectural Topology

```
+---------------------------------------------------------------------------------------+
|                                    CLIENT LAYER                                       |
|                                                                                       |
|   React 18 SPA (JavaScript / JSX) • Vite Bundler • Tailwind CSS • Lucide Icons       |
|   - Interactive Multi-Floor Bay Matrix (SVG/Grid)                                     |
|   - Real-Time Check-In QR / Elapsed Parking Duration Live Ticker                      |
|   - JWT Token Session Storage & Axios Interceptors                                    |
+-------------------------------------------+-------------------------------------------+
                                            │ HTTP / JSON REST APIs (Bearer JWT)
                                            ▼
+---------------------------------------------------------------------------------------+
|                             API GATEWAY & SECURITY LAYER                             |
|                                                                                       |
|   Spring Security 6.x                                                                 |
|   - JwtAuthenticationFilter (Stateless Authorization)                                 |
|   - BCryptPasswordEncoder (Strength: 10)                                              |
|   - CORS Configuration & Pre-Flight Options Filtering                                 |
|   - Global Exception Advice (@RestControllerAdvice) -> Uniform ApiResponse<T>        |
+-------------------------------------------+-------------------------------------------+
                                            │
                                            ▼
+---------------------------------------------------------------------------------------+
|                                APPLICATION SERVICES LAYER                             |
|                                                                                       |
|   - AuthService: User registration, BCrypt credential check, JWT minting              |
|   - BookingService: Concurrency-safe slot reservation with REPEATABLE_READ isolation   |
|   - ParkingSessionService: Physical vehicle check-in, duration tracking & bay release |
|   - FareCalculationService: Grace period, ceiling rounding, and overstay calculation  |
|   - LocationService & ParkingLotService: Facility discovery & live capacity counters  |
|   - VehicleService: Multi-vehicle garage management & default toggles                 |
+-------------------------------------------+-------------------------------------------+
                                            │
                                            ▼
+---------------------------------------------------------------------------------------+
|                              DATA PERSISTENCE LAYER (JDBC)                            |
|                                                                                       |
|   Pure Spring JDBC (JdbcTemplate & NamedParameterJdbcTemplate)                        |
|   - 11 Domain Repositories with custom Type-Safe RowMappers                           |
|   - Concurrency Control: SELECT ... FOR UPDATE Pessimistic Row Locking                |
|   - Zero ORM Bloat: Full query visibility and optimal index utilization               |
|   - HikariCP High-Throughput Connection Pool (Min: 5, Max: 20)                        |
+-------------------------------------------+-------------------------------------------+
                                            │ TCP Socket / MySQL Protocol
                                            ▼
+---------------------------------------------------------------------------------------+
|                              DATABASE ENGINE (MySQL 8+)                               |
|                                                                                       |
|   Normalized 3NF Relational Model (InnoDB Engine, utf8mb4)                            |
|   - Foreign Keys (ON UPDATE CASCADE / ON DELETE RESTRICT)                             |
|   - Composite Temporal Indexes (slot_id, status, start_time, end_time)                |
|   - Full Historical Retention (audit_logs, payments, parking_sessions)                |
+---------------------------------------------------------------------------------------+
```

---

## 2. Layer Responsibilities & Design Patterns

### 2.1 Presentation Layer (React 18 + Vite)
- **Component Architecture**: Atomic design separating common UI atoms (Badges, Modals, Spinners), compound layout organisms (SlotMatrix, SlotCard, LotCard), and full-page views.
- **State Management**:
  - `AuthContext`: Centralizes authentication lifecycle, local storage tokens, and role permissions (`ROLE_ADMIN` vs `ROLE_CUSTOMER`).
  - `ToastContext`: Dispatches non-blocking, accessible notifications with automatic timeout dismissal.
- **Zero TypeScript Policy**: Built purely in idiomatic modern JavaScript (ESNext / JSX) with explicit validation and responsive styling.

### 2.2 Controller Layer (Spring Boot 3)
- Controllers handle strictly HTTP parsing, request serialization, and `@Valid` validation constraints.
- All endpoints wrap responses in a standardized envelope:
  ```json
  {
    "success": true,
    "message": "Operation completed successfully",
    "data": { ... },
    "errorCode": null,
    "timestamp": "2026-10-06T16:50:00Z"
  }
  ```

### 2.3 Service Layer & Transaction Boundaries
- Business logic is strictly isolated in dedicated `@Service` beans.
- State changes (Booking creation, Session checkout) are encapsulated within `@Transactional` boundaries.
- The booking creation method specifies `isolation = Isolation.REPEATABLE_READ` to guarantee deterministic reads during interval conflict checks.

### 2.4 Data Access Layer (Spring JDBC)
- Replaces legacy raw `DriverManager` calls with Spring's `JdbcTemplate` and HikariCP connection pooling.
- Replaces rigid position-based column lookups with explicit `RowMapper<T>` implementations that extract data by column name, tolerating schema changes.

---

## 3. Database Normalization & Integrity
The relational model has been structured into 11 3NF normalized tables:
1. `roles`: Access control authority definitions.
2. `users`: Credentials, status, and contact info.
3. `vehicles`: Multi-vehicle garage for each driver.
4. `parking_locations`: Geographic city hubs.
5. `parking_lots`: Physical multi-level parking facilities.
6. `pricing_rules`: Configurable vehicle-specific tariffs per facility.
7. `parking_slots`: Physical parking bays with status lifecycle.
8. `bookings`: Reservations linking users, vehicles, and slots.
9. `parking_sessions`: Physical barrier check-in and check-out tracking.
10. `payments`: Immutable financial transaction records.
11. `audit_logs`: System-wide security and event audit records.
