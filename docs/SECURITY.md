# Smart Parking System — Security Architecture & Threat Defense Specification

## 1. Overview & Threat Model

The Smart Parking System handles critical customer data, financial transactions, vehicle identifiers, and physical parking slot allocations. In legacy architectures, common vulnerabilities like Insecure Direct Object References (IDOR), SQL injection, unhashed credential leaks, and session hijacking plagued parking management systems.

This document formalizes the defensive engineering measures, cryptographic controls, and authentication mechanisms built into the modern Spring Boot + Spring JDBC + MySQL platform.

---

## 2. Stateless Authentication Architecture (JWT)

Authentication is completely stateless, powered by JSON Web Tokens (JJWT 0.12.6) and Spring Security filter chains.

### 2.1 Token Lifecycle & Payload
- **Algorithm**: HMAC-SHA256 (`HmacSHA256`) with a 256+ bit cryptographic key (`Keys.hmacShaKeyFor`).
- **Subject**: User primary email address (`sub`).
- **Custom Claims**:
  - `userId`: Numeric identifier (`Long`) for resource ownership checks.
  - `email`: Normalized lowercase email string.
  - `role`: Canonical role name (`ROLE_CUSTOMER` or `ROLE_ADMIN`).
  - `fullName`: Display name.
- **Expiration (`exp`)**: 24 hours (86,400,000 ms) in production, configurable via `smartparking.jwt.expiration-ms`.
- **Issued At (`iat`)**: Unix timestamp at token generation time.

```
Client                  AuthController                 JwtTokenProvider         CustomUserDetailsService
  │                           │                               │                         │
  │─── POST /api/auth/login ─>│                               │                         │
  │    (email, password)      │─── loadUserByUsername() ───────────────────────────────>│
  │                           │<── returns UserPrincipal ───────────────────────────────│
  │                           │─── passwordEncoder.matches() ──┐                        │
  │                           │    (BCrypt verify)             │                        │
  │                           │─── generateTokenFromUser() ──>│                         │
  │                           │<── signed JWT token ──────────│                         │
  │<── 200 OK + AuthResponse ─│                                                         │
  │    (token, user profile)  │                                                         │
```

### 2.2 Token Interception & Request Validation
1. Every incoming HTTP request passes through [`JwtAuthenticationFilter`](file:///d:/Smart-Parking-System-master/backend/src/main/java/com/smartparking/security/JwtAuthenticationFilter.java).
2. The filter extracts the `Authorization: Bearer <token>` header.
3. [`JwtTokenProvider.validateToken()`](file:///d:/Smart-Parking-System-master/backend/src/main/java/com/smartparking/security/JwtTokenProvider.java) verifies:
   - Valid signature (rejects forged/tampered tokens).
   - Valid expiration (rejects expired tokens via `ExpiredJwtException`).
   - Valid structure (rejects malformed tokens via `MalformedJwtException`).
4. On validation success, `CustomUserDetailsService` loads the principal to verify the user account is currently `ACTIVE` (revoking tokens immediately if an account is suspended).
5. The `SecurityContextHolder` is populated with a `UsernamePasswordAuthenticationToken`.

---

## 3. Password Hashing Policy (BCrypt)

- Plaintext passwords are **never** logged, cached, transmitted in plain text, or stored in the database.
- Hashes are generated using Spring Security's `BCryptPasswordEncoder` (adaptive cost factor of 10).
- BCrypt incorporates a cryptographically random 128-bit salt into each hash string (`$2a$10$...`), defeating rainbow table attacks and precomputed dictionary lookups.
- Passwords are validated upon registration:
  - Minimum 8 characters, maximum 64 characters.
  - Regex enforcement: Must contain at least one letter and at least one digit (`^(?=.*[0-9])(?=.*[a-zA-Z]).{8,64}$`).

---

## 4. Role-Based Access Control (RBAC)

The system supports two primary tiers of authorization:

| Role | Scope | Accessible Routes |
|---|---|---|
| **ROLE_CUSTOMER** (`USER`) | Standard driver / customer | Search locations, view lots/slots, register/manage own vehicles, book slots, view own bookings, view/update own profile. |
| **ROLE_ADMIN** | System administrator | All customer capabilities + manage locations, lots, slots, pricing rules, view all users, view audit logs, access system metrics (`/api/admin/**`). |

### Authority Mapping
In [`UserPrincipal`](file:///d:/Smart-Parking-System-master/backend/src/main/java/com/smartparking/security/UserPrincipal.java), roles are mapped bidirectionally between `ROLE_CUSTOMER` and `ROLE_USER` so that both `@PreAuthorize("hasRole('USER')")` and `@PreAuthorize("hasRole('CUSTOMER')")` resolve seamlessly.

---

## 5. Insecure Direct Object Reference (IDOR) Defenses

A common failure mode in legacy parking applications was accepting target user IDs or booking IDs from request parameters without checking if the caller actually owned the resource.

### Rule 1: Never Trust User IDs from Frontend
When fetching personal data, endpoints **do not accept user IDs in request parameters or bodies**. Instead, the authenticated user ID is resolved exclusively from the server-side security context:
```java
Long currentUserId = SecurityUtils.getCurrentUserId();
```

### Rule 2: Strict Resource Ownership Checks
When an endpoint operates on a specific resource ID (e.g., `GET /api/bookings/{id}`, `DELETE /api/vehicles/{id}`, `GET /api/users/{userId}`):
1. The repository loads the entity from the database.
2. The service performs an explicit ownership verification:
```java
if (!isAdmin && !resource.getUserId().equals(currentUserId)) {
    throw new AccessDeniedException("Access denied: You cannot access another user's resource");
}
```
3. If an unauthorized user attempts to access or mutate another user's record, Spring Security immediately halts execution and returns HTTP `403 Forbidden` (`ACCESS_DENIED`).

---

## 6. CORS & CSRF Defense Posture

### CORS (Cross-Origin Resource Sharing)
- Configured in [`SecurityConfig.java`](file:///d:/Smart-Parking-System-master/backend/src/main/java/com/smartparking/config/SecurityConfig.java) and [`WebConfig.java`](file:///d:/Smart-Parking-System-master/backend/src/main/java/com/smartparking/config/WebConfig.java).
- Origins restricted to configured white-list (defaulting to React development environments: `http://localhost:5173`, `http://localhost:3000`, `http://127.0.0.1:5173`).
- Allowed methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`.
- Explicit pre-flight caching (`maxAge(3600)`).
- Pre-flight `OPTIONS` requests are permitted through `requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()` without requiring an Authorization header.

### CSRF (Cross-Site Request Forgery)
- Since the application uses stateless JWT bearer tokens stored on the client (not session cookies automatically submitted by browsers), CSRF protection is disabled in accordance with modern stateless REST standards (`csrf(AbstractHttpConfigurer::disable)`).

---

## 7. Input Validation & Data Normalization

All request bodies are strictly validated at the controller boundary using JSR-380 Bean Validation annotations (`@Valid`):

- **Email**: Truncated, normalized to lowercase, validated via `@Email` and length checks (`@Size(max = 150)`).
- **Phone Number**: Validated against international E.164 formats (`@Pattern(regexp = "^\\+?[0-9]{10,15}$")`).
- **Names & Strings**: Trimmed of leading/trailing whitespace, length bounded to avoid buffer issues or denial-of-service payloads.
- **Plate Numbers**: Normalized to uppercase and trimmed before saving.

---

## 8. Security Audit Trails (`audit_logs`)

All security-sensitive operations are recorded synchronously into the `audit_logs` database table via [`AuditLogRepository`](file:///d:/Smart-Parking-System-master/backend/src/main/java/com/smartparking/repository/JdbcAuditLogRepository.java):

| Event Action | Trigger | Captured Metadata |
|---|---|---|
| `USER_REGISTER` | New account created | User ID, email, client IP, User-Agent, timestamp |
| `USER_LOGIN` | Successful authentication | User ID, email, client IP, User-Agent, timestamp |
| `LOGIN_FAILED` | Bad password or unknown email | Attempted email, client IP, User-Agent, timestamp |
| `USER_LOGOUT` | User session ended | User ID, client IP, User-Agent, timestamp |

Administrators can inspect these events at any time via `GET /api/admin/audit-logs`.

---

## 9. Sensitive Information Protection & Error Masking

1. **Stack Trace Insulation**: [`GlobalExceptionHandler`](file:///d:/Smart-Parking-System-master/backend/src/main/java/com/smartparking/exception/GlobalExceptionHandler.java) intercepts all exceptions, logging the stack trace internally on the server while returning sanitized JSON responses to clients:
   ```json
   {
     "success": false,
     "message": "An unexpected error occurred. Please contact support.",
     "errorCode": "INTERNAL_SERVER_ERROR"
   }
   ```
2. **Database Secrets**: MySQL credentials and JWT secrets are configured via environment variables (`DB_PASSWORD`, `JWT_SECRET`) with `.env.example` templates. No production secrets exist in the git history.
3. **Password Hash Redaction**: User DTOs (`UserProfileResponse`, `AuthResponse`) deliberately omit `passwordHash` fields, ensuring hashes are never sent across the wire.

---

## 10. Verification & Test Evidence

The security implementation is verified through [`AuthSecurityIntegrationTest.java`](file:///d:/Smart-Parking-System-master/backend/src/test/java/com/smartparking/security/AuthSecurityIntegrationTest.java) using Spring MockMvc against an isolated in-memory MySQL-mode database:

| # | Test Scenario | Verified Endpoint | Expected Status | Result |
|---|---|---|---|---|
| 1 | Valid Login | `POST /api/auth/login` | `200 OK` (JWT + Profile) | **PASS** |
| 2 | Invalid Password | `POST /api/auth/login` | `401 Unauthorized` (`INVALID_CREDENTIALS`) | **PASS** |
| 3 | Duplicate Registration (Email) | `POST /api/auth/register` | `400 Bad Request` (`EMAIL_ALREADY_EXISTS`) | **PASS** |
| 4 | Valid Registration | `POST /api/auth/register` | `201 Created` (Token returned) | **PASS** |
| 5 | Unauthorized API Access (No Token) | `GET /api/auth/me`, `GET /api/vehicles` | `401 Unauthorized` (`UNAUTHORIZED`) | **PASS** |
| 6 | IDOR Attempt on Booking by ID | `GET /api/bookings/{userB_id}` | `403 Forbidden` (`ACCESS_DENIED`) | **PASS** |
| 7 | IDOR Attempt on User Bookings List | `GET /api/users/{userB_id}/bookings` | `403 Forbidden` (`ACCESS_DENIED`) | **PASS** |
| 8 | Owner Accessing Own Booking | `GET /api/bookings/{userB_id}`, `GET /api/bookings/my` | `200 OK` | **PASS** |
| 9 | Admin Accessing Any Booking | `GET /api/bookings/{userB_id}` | `200 OK` | **PASS** |
| 10 | Admin Access to Admin Endpoints | `GET /api/admin/users`, `GET /api/admin/stats` | `200 OK` | **PASS** |
| 11 | Customer Attempting Admin Endpoint | `GET /api/admin/users`, `GET /api/admin/stats` | `403 Forbidden` (`ACCESS_DENIED`) | **PASS** |
| 12 | Ownership Enforcement on Vehicles | `POST`, `GET`, `DELETE /api/vehicles/{id}` | `200/201 OK`, `403` on cross-tenant delete | **PASS** |
| 13 | Secure Logout | `POST /api/auth/logout` | `200 OK` + Audit Entry | **PASS** |
| 14 | Input Validation Failure | `POST /api/auth/register` (malformed input) | `400 Bad Request` (`VALIDATION_FAILED`) | **PASS** |

### Test Execution Output
```text
[INFO] Running com.smartparking.security.AuthSecurityIntegrationTest
[INFO] Tests run: 14, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 4.690 s
[INFO] Running com.smartparking.GlobalExceptionHandlerTest
[INFO] Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.smartparking.HealthControllerTest
[INFO] Tests run: 2, Failures: 0, Errors: 0, Skipped: 0
[INFO] Running com.smartparking.repository.RepositoryIntegrationTest
[INFO] Tests run: 5, Failures: 0, Errors: 0, Skipped: 0
[INFO] Results:
[INFO] Tests run: 24, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```
