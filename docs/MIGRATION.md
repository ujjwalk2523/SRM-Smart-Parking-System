# Modernization & Migration Architecture Blueprint: Smart Parking System

## Executive Overview
This document specifies the comprehensive migration roadmap to transform the legacy **Smart Parking System** from an outdated Eclipse/Tomcat/Servlet application into an enterprise-grade, full-stack platform:
- **Frontend**: React 18+ (JavaScript / JSX only, strictly NO TypeScript), Vite, Tailwind CSS, Lucide React, Axios.
- **Backend**: Java 21+ / Spring Boot 3, Spring JDBC (`JdbcTemplate` / `NamedParameterJdbcTemplate`), BCrypt security, REST APIs.
- **Database**: MySQL 8+ with 3NF relational normalization, foreign key constraints, indexes, and transactional locking.

---

## 1. Architectural Transformation

```
+--------------------------------------------------------------------------------------------------+
|                                        LEGACY ARCHITECTURE                                       |
|                                                                                                  |
|   HTML Forms & JQuery 1.11 ---> Raw Java Servlets (Default Package) ---> Raw JDBC (DriverManager) |
|   - Synchronous Page Reloads    - Servlets generate HTML via PrintWriter  - Hardcoded root/root   |
|   - Thread-unsafe Instance Vars - Singletons mutate shared state          - No connection pool    |
|   - In-memory Table Scan Auth   - Blind INSERT, no locking                - Full data loss on exit|
+--------------------------------------------------------------------------------------------------+
                                                 |
                                                 | MIGRATION PATH
                                                 v
+--------------------------------------------------------------------------------------------------+
|                                        TARGET ARCHITECTURE                                       |
|                                                                                                  |
|   +------------------------------------------------------------------------------------------+   |
|   | FRONTEND: React 18 (JavaScript / JSX) + Vite + Tailwind CSS + Lucide Icons + Axios       |   |
|   | - Single Page Application (SPA) with responsive desktop/mobile layouts                   |   |
|   | - Interactive parking slot matrix with accessible multi-state badges                     |   |
|   | - Token-based authentication, Axios interceptors, toast notifications, loading skeletons |   |
|   +--------------------------------------------+---------------------------------------------+   |
|                                                | JSON REST APIs (JWT Auth)                       |
|   +--------------------------------------------v---------------------------------------------+   |
|   | BACKEND: Java 21+ / Spring Boot 3 (Clean Layered Architecture)                           |   |
|   | - Controller: Handles HTTP, input validation (@Valid), JSON DTOs                         |   |
|   | - Service: Business logic, state transitions, fare engine, @Transactional boundaries     |   |
|   | - Repository: Pure Spring JDBC (JdbcTemplate), RowMappers, custom SQL                    |   |
|   | - Security: Spring Security, BCryptPasswordEncoder, JwtAuthenticationFilter              |   |
|   | - Exception Handling: Global @RestControllerAdvice with uniform error responses          |   |
|   +--------------------------------------------+---------------------------------------------+   |
|                                                | HikariCP Connection Pool / JDBC                 |
|   +--------------------------------------------v---------------------------------------------+   |
|   | DATABASE: MySQL 8+ (Normalized 3NF Relational Engine)                                    |   |
|   | - Foreign key constraints, unique constraints, check constraints, indexes               |   |
|   | - Concurrency protection: SELECT ... FOR UPDATE pessimistic row-locking                  |   |
|   | - Complete historical retention: bookings, sessions, payments, audit logs               |   |
|   +------------------------------------------------------------------------------------------+   |
+--------------------------------------------------------------------------------------------------+
```

---

## 2. Component Migration Mapping Matrix

| Legacy Artifact | Legacy Role & Defects | Modern Backend Target (Spring Boot) | Modern Frontend Target (React / JS) |
|---|---|---|---|
| `Sign_up_customer.html` & `Sign_up_cust_servlet.java` | Registration form, stores plaintext password, race condition via `SELECT MAX(customer_id)`. | `AuthController.register()`<br>`UserService.registerUser()`<br>`UserRepository.save()` | `pages/Register.jsx`<br>`components/auth/RegisterForm.jsx` |
| `Sign_in_customer.html` & `Sign_in_Customer.java` | In-memory table-scan login; redirects to spot or location list. | `AuthController.login()`<br>`JwtTokenProvider`<br>`CustomUserDetailsService` | `pages/Login.jsx`<br>`context/AuthContext.jsx` |
| `LogoutServlet.java` & `link.html` | Session invalidation and static HTML message. | `AuthController.logout()`<br>(Client clears JWT token) | `components/layout/Navbar.jsx`<br>(Logout action) |
| `index.html` | Static marketing landing page with jQuery carousel & gallery. | Static content served by frontend; live counts from `/api/public/stats` | `pages/LandingPage.jsx`<br>`components/landing/Hero.jsx`<br>`components/landing/LocationGallery.jsx` |
| `Locations_spot_info.java` | Renders lot list for a location; servlet instance field race condition. | `LocationController.getAll()`<br>`LocationController.getLots()`<br>`LocationService` | `pages/FindParking.jsx`<br>`pages/LocationDetails.jsx`<br>`components/parking/LotCard.jsx` |
| `Parking_spot_info.java` | Visual green/orange/red slot button matrix; instance field race condition. | `ParkingSlotController.getLotSlots()`<br>`ParkingSlotService.getAvailability()` | `pages/ParkingLotDetails.jsx`<br>`components/parking/SlotGrid.jsx`<br>`components/parking/SlotCard.jsx` |
| `Select_spot_car.java` & `Select_spot_bike.java` | Immediate "Park Now" vs scheduled booking selector; duplicated logic. | Unified DTO:<br>`CreateBookingRequest`<br>(handles immediate & scheduled) | `components/booking/BookingModal.jsx`<br>`pages/InteractiveSlotSelection.jsx` |
| `Final_Car_Book.java` & `Final_Bike_Book.java` | Blind insert into `parking_spot_info`; no concurrency lock; forces logout. | `BookingController.create()`<br>`BookingService.createBooking()` (with `FOR UPDATE` lock) | `pages/BookingConfirmation.jsx`<br>`pages/CurrentBooking.jsx` |
| `Leave_Customer.java` | Cancellation or checkout; naive hour subtraction; permanently destroys record. | `BookingController.cancel()`<br>`SessionController.checkOut()`<br>`FareCalculationService` | `pages/ParkingSession.jsx`<br>`pages/FareCheckout.jsx`<br>`pages/BookingHistory.jsx` |
| N/A (Missing in legacy) | Administrative management was non-existent. | `AdminDashboardController`<br>`AdminManagementController`<br>`AdminPricingController` | `pages/admin/AdminDashboard.jsx`<br>`pages/admin/SlotManagement.jsx`<br>`pages/admin/UserManagement.jsx` |

---

## 3. Database Schema Evolution

### Legacy Model (4 Implicit Tables)
- Flat, unconstrained tables with hard deletions and zero historical records:
  - `customer_info` (1 user = 1 vehicle, plaintext passwords)
  - `locations` (minimal attributes)
  - `parking_lot_info` (rigid column positions)
  - `parking_spot_info` (transient active spot; destroyed upon checkout)

### Target Normalized Relational Schema (11 Tables)
```
[roles] 1 ─── * [users] 1 ─── * [vehicles]
                   │                  │
                   │                  *
                   │           [bookings] * ─── 1 [parking_slots]
                   │                │                  │
                   │                │                  *
                   │                │            [parking_lots] * ─── 1 [parking_locations]
                   │                │                  │
                   │                1                  *
                   │        [parking_sessions]   [pricing_rules]
                   │                │
                   │                1
                   └─────────── [payments]
                   │
                   *
              [audit_logs]
```

### Key Structural Enhancements
1. **Primary & Foreign Keys**: All tables have auto-increment surrogate keys (`BIGINT AUTO_INCREMENT PRIMARY KEY`) with explicit cascading constraints.
2. **Multi-Vehicle Support**: Separate `vehicles` entity allowing users to manage multiple cars, bikes, SUVs, and EVs.
3. **Physical Slot Modeling**: Physical parking slots (`parking_slots`) exist permanently, supporting statuses: `AVAILABLE`, `OCCUPIED`, `RESERVED`, `MAINTENANCE`, `DISABLED`.
4. **Lifecycle State Machine**: Bookings transition through: `PENDING` → `CONFIRMED` → `ACTIVE` → `COMPLETED` / `CANCELLED` / `EXPIRED`.
5. **Session & History Preservation**: Parking sessions (`parking_sessions`) and payments (`payments`) are permanently retained for auditing and revenue reporting.
6. **Configurable Pricing**: `pricing_rules` defines vehicle-specific base fares, hourly rates, and minimum hours per parking lot.

---

## 4. Double-Booking Concurrency Strategy

### The Problem in Legacy Code
In `Final_Car_Book.java` and `Final_Bike_Book.java`, the application executed a blind `INSERT INTO parking_spot_info` without checking if another thread had already claimed that spot. Two concurrent users booking the same slot at the same second resulted in duplicate claims.

### The Solution: Pessimistic Row Locking + Interval Overlap Checks
In `BookingService.java`, the booking operation executes under `@Transactional(isolation = Isolation.REPEATABLE_READ)`:
1. **Pessimistic Slot Lock**:
   ```sql
   SELECT id, lot_id, slot_type, status 
   FROM parking_slots 
   WHERE id = :slotId 
   FOR UPDATE;
   ```
2. **Conflict Overlap Check**:
   ```sql
   SELECT COUNT(*) 
   FROM bookings 
   WHERE slot_id = :slotId 
     AND status IN ('CONFIRMED', 'ACTIVE') 
     AND (:startTime < end_time AND :endTime > start_time);
   ```
3. If `conflict_count > 0`, transaction throws `SlotAlreadyBookedException` and rolls back.
4. If clear, inserts booking with status `CONFIRMED`.
5. Database engine holds the row lock until commit, forcing concurrent requests to queue and fail safely.

---

## 5. Modern Fare Engine Architecture

### Legacy Flaw
Naive hour integer subtraction: `float bill = (h - time_booked) * cost;`. Produces negative values across midnight boundaries, ignores dates, ignores minutes, and has no minimum charge.

### Modern Fare Engine Algorithm (`FareCalculationService`)
1. Compute exact duration: `Duration.between(checkInTime, checkOutTime).toMinutes()`.
2. Apply grace period: If duration <= 15 minutes, charge is 0 or base rate.
3. Compute billable hours with ceil rounding:
   ```java
   long billableHours = Math.max(pricingRule.getMinHours(), (long) Math.ceil(durationMinutes / 60.0));
   ```
4. Compute base fare + hourly charge + vehicle multiplier + overstay penalty.
5. Create immutable `Payment` record and transition session to `COMPLETED`.

---

## 6. Migration Execution Roadmap

| Phase | Description | Key Deliverables |
|---|---|---|
| **Phase 1** | Complete Project Audit | `docs/PROJECT_ANALYSIS.md`, `docs/MIGRATION.md` |
| **Phase 2** | Database Design & Scripts | `database/schema.sql`, `database/seed.sql`, `database/README.md` |
| **Phase 3** | Backend Skeleton Setup | Maven pom.xml, Spring Boot 3 structure, global config, exception handler |
| **Phase 4** | JDBC Repository Layer | Spring JDBC repositories (`JdbcTemplate`) for all 11 domain entities |
| **Phase 5** | Authentication & Security | BCrypt password hashing, JWT token provider, security filter, auth APIs |
| **Phase 6** | Discovery APIs | Location, Lot, Slot layout & availability endpoints |
| **Phase 7** | Concurrency-Safe Booking Engine | Transactional booking service with pessimistic locking, `docs/BOOKING_CONCURRENCY.md` |
| **Phase 8** | Sessions & Fare Calculation | Check-in, check-out, duration rounding, payment generation |
| **Phase 9** | Modern React Setup | Vite scaffold, Tailwind CSS configuration, Lucide icons, Axios client |
| **Phase 10** | Auth & Profile UI | Login, Register, Profile, and Vehicle Management screens |
| **Phase 11** | Discovery & Slot Selection UI | Search, Lot details, Interactive SVG/Grid Slot selection component |
| **Phase 12** | Booking & Session UI | Current booking, Upcoming bookings, History, Active session & Checkout UI |
| **Phase 13** | Admin Dashboard & Control Center | KPI metrics, Slot maintenance toggles, User/Booking management |
| **Phase 14** | Mobile & Responsive Polish | Full testing across 320px mobile to 1440px desktop screens |
| **Phase 15** | Automated Testing | Backend JUnit tests, Concurrency tests, API integration tests |
| **Phase 16** | Comprehensive Documentation | `README.md`, `docs/API.md`, `docs/DATABASE.md`, `docs/ARCHITECTURE.md`, `docs/TESTING.md`, `.env.example` |
