package com.smartparking.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartparking.dto.auth.LoginRequest;
import com.smartparking.dto.auth.RegisterRequest;
import com.smartparking.dto.vehicle.VehicleRequest;
import com.smartparking.model.*;
import com.smartparking.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthSecurityIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository userRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private VehicleRepository vehicleRepository;
    @Autowired private ParkingLocationRepository locationRepository;
    @Autowired private ParkingLotRepository lotRepository;
    @Autowired private PricingRuleRepository pricingRuleRepository;
    @Autowired private ParkingSlotRepository slotRepository;
    @Autowired private BookingRepository bookingRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtTokenProvider tokenProvider;

    private Role adminRole;
    private Role customerRole;
    private User adminUser;
    private User userA;
    private User userB;
    private String adminToken;
    private String userAToken;
    private String userBToken;
    private Long userBBookingId;

    @BeforeEach
    void setUp() {
        adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseGet(() -> roleRepository.save(new Role(null, "ROLE_ADMIN", "Administrator")));
        customerRole = roleRepository.findByName("ROLE_CUSTOMER")
                .orElseGet(() -> roleRepository.save(new Role(null, "ROLE_CUSTOMER", "Customer")));

        // 1. Seed Admin
        adminUser = new User();
        adminUser.setRoleId(adminRole.getId());
        adminUser.setRoleName(adminRole.getName());
        adminUser.setEmail("admin.test@smartparking.com");
        adminUser.setPasswordHash(passwordEncoder.encode("AdminPass123!"));
        adminUser.setFullName("Super Admin");
        adminUser.setPhoneNumber("+919999900001");
        adminUser.setStatus(UserStatus.ACTIVE);
        adminUser = userRepository.save(adminUser);
        adminToken = tokenProvider.generateTokenFromUser(adminUser.getId(), adminUser.getEmail(), adminUser.getFullName(), adminUser.getRoleName());

        // 2. Seed User A
        userA = new User();
        userA.setRoleId(customerRole.getId());
        userA.setRoleName(customerRole.getName());
        userA.setEmail("usera@example.com");
        userA.setPasswordHash(passwordEncoder.encode("UserAPass123!"));
        userA.setFullName("Alice User");
        userA.setPhoneNumber("+919999900002");
        userA.setStatus(UserStatus.ACTIVE);
        userA = userRepository.save(userA);
        userAToken = tokenProvider.generateTokenFromUser(userA.getId(), userA.getEmail(), userA.getFullName(), userA.getRoleName());

        // 3. Seed User B
        userB = new User();
        userB.setRoleId(customerRole.getId());
        userB.setRoleName(customerRole.getName());
        userB.setEmail("userb@example.com");
        userB.setPasswordHash(passwordEncoder.encode("UserBPass123!"));
        userB.setFullName("Bob User");
        userB.setPhoneNumber("+919999900003");
        userB.setStatus(UserStatus.ACTIVE);
        userB = userRepository.save(userB);
        userBToken = tokenProvider.generateTokenFromUser(userB.getId(), userB.getEmail(), userB.getFullName(), userB.getRoleName());

        // 4. Seed booking owned by User B
        ParkingLocation loc = new ParkingLocation();
        loc.setName("Sec Loc");
        long seq = System.currentTimeMillis() % 10000000L;
        loc.setCode("LOC" + seq);
        loc.setAddress("42 Security Way");
        loc.setCity("Bangalore");
        loc.setState("Karnataka");
        loc.setPostalCode("560001");
        loc = locationRepository.save(loc);

        ParkingLot lot = new ParkingLot();
        lot.setLocationId(loc.getId());
        lot.setName("Sec Lot");
        lot.setLotCode("LOT" + seq);
        lot = lotRepository.save(lot);

        PricingRule pricing = new PricingRule();
        pricing.setLotId(lot.getId());
        pricing.setVehicleType(VehicleType.CAR);
        pricing.setBaseFare(new BigDecimal("50.00"));
        pricing.setHourlyRate(new BigDecimal("20.00"));
        pricing = pricingRuleRepository.save(pricing);

        ParkingSlot slot = new ParkingSlot();
        slot.setLotId(lot.getId());
        slot.setSlotNumber("B-99");
        slot.setSlotType(VehicleType.CAR);
        slot.setStatus(SlotStatus.RESERVED);
        slot = slotRepository.save(slot);

        Vehicle v = new Vehicle();
        v.setUserId(userB.getId());
        v.setLicensePlate("KA-SEC-" + (seq % 10000));
        v.setVehicleType(VehicleType.CAR);
        v = vehicleRepository.save(v);

        Booking booking = new Booking();
        booking.setBookingReference("BK" + seq);
        booking.setUserId(userB.getId());
        booking.setVehicleId(v.getId());
        booking.setSlotId(slot.getId());
        booking.setLotId(lot.getId());
        booking.setStartTime(LocalDateTime.now().plusHours(1));
        booking.setEndTime(LocalDateTime.now().plusHours(3));
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setEstimatedFare(new BigDecimal("100.00"));
        booking = bookingRepository.save(booking);

        userBBookingId = booking.getId();
    }

    @Test
    @DisplayName("1. Valid Login returns JWT token and user profile")
    void testValidLogin() throws Exception {
        LoginRequest loginRequest = new LoginRequest("usera@example.com", "UserAPass123!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.data.user.email").value("usera@example.com"))
                .andExpect(jsonPath("$.data.user.fullName").value("Alice User"));
    }

    @Test
    @DisplayName("2. Invalid Password returns 401 Unauthorized")
    void testInvalidPassword() throws Exception {
        LoginRequest badLogin = new LoginRequest("usera@example.com", "WrongPassword999!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badLogin)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("INVALID_CREDENTIALS"))
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    @DisplayName("3. Duplicate Email Registration returns 400 Bad Request with EMAIL_ALREADY_EXISTS")
    void testDuplicateRegistration() throws Exception {
        RegisterRequest dupRequest = new RegisterRequest(
                "usera@example.com", // existing email
                "BrandNewPass123!",
                "Another Alice",
                "+919999988888"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dupRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("EMAIL_ALREADY_EXISTS"))
                .andExpect(jsonPath("$.message").value("Email is already registered"));
    }

    @Test
    @DisplayName("4. Valid Registration successfully creates account and returns JWT token")
    void testSuccessfulRegistration() throws Exception {
        RegisterRequest newRequest = new RegisterRequest(
                "new.driver@example.com",
                "SecurePass123!",
                "New Driver",
                "+919876500099"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token").isNotEmpty())
                .andExpect(jsonPath("$.data.user.email").value("new.driver@example.com"))
                .andExpect(jsonPath("$.data.user.fullName").value("New Driver"));
    }

    @Test
    @DisplayName("5. Unauthorized API access without token returns 401 Unauthorized")
    void testUnauthorizedApiAccess() throws Exception {
        // Attempting to access protected /api/auth/me without token
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("UNAUTHORIZED"));

        // Attempting to access protected /api/vehicles without token
        mockMvc.perform(get("/api/vehicles"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("UNAUTHORIZED"));
    }

    @Test
    @DisplayName("6. IDOR Prevention: User A cannot access User B's booking by ID -> 403 Forbidden")
    void testIdorPreventedOnBookingById() throws Exception {
        // User A attempts to access booking belonging to User B
        mockMvc.perform(get("/api/bookings/" + userBBookingId)
                        .header("Authorization", "Bearer " + userAToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("ACCESS_DENIED"))
                .andExpect(jsonPath("$.message", containsString("cannot access another user's booking")));
    }

    @Test
    @DisplayName("7. IDOR Prevention: User A cannot access /api/users/{userB_id}/bookings -> 403 Forbidden")
    void testIdorPreventedOnUserBookingsEndpoint() throws Exception {
        mockMvc.perform(get("/api/users/" + userB.getId() + "/bookings")
                        .header("Authorization", "Bearer " + userAToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("ACCESS_DENIED"))
                .andExpect(jsonPath("$.message", containsString("cannot view another user's bookings")));
    }

    @Test
    @DisplayName("8. Owner can access their own booking and bookings list -> 200 OK")
    void testOwnerCanAccessOwnBooking() throws Exception {
        // User B accesses their own booking
        mockMvc.perform(get("/api/bookings/" + userBBookingId)
                        .header("Authorization", "Bearer " + userBToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(userBBookingId))
                .andExpect(jsonPath("$.data.userId").value(userB.getId()));

        // User B accesses their bookings list
        mockMvc.perform(get("/api/bookings/my")
                        .header("Authorization", "Bearer " + userBToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("9. Admin can access any user's booking -> 200 OK")
    void testAdminCanAccessAnyBooking() throws Exception {
        mockMvc.perform(get("/api/bookings/" + userBBookingId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(userBBookingId));
    }

    @Test
    @DisplayName("10. Admin access to administrative endpoint /api/admin/users -> 200 OK")
    void testAdminAccessToAdminEndpoint() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.users").isArray())
                .andExpect(jsonPath("$.data.total", greaterThanOrEqualTo(1)));

        mockMvc.perform(get("/api/admin/stats")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalUsers", greaterThanOrEqualTo(1)));
    }

    @Test
    @DisplayName("11. Normal User attempting admin endpoint /api/admin/users -> 403 Forbidden")
    void testNormalUserCannotAccessAdminEndpoint() throws Exception {
        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", "Bearer " + userAToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("ACCESS_DENIED"));

        mockMvc.perform(get("/api/admin/stats")
                        .header("Authorization", "Bearer " + userAToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("ACCESS_DENIED"));
    }

    @Test
    @DisplayName("12. Authenticated user can manage own vehicles safely")
    void testAuthenticatedUserVehicleManagement() throws Exception {
        VehicleRequest vehicleRequest = new VehicleRequest(
                "DL-01-AB-7777",
                VehicleType.CAR,
                "Maruti Suzuki",
                "Swift",
                "Red",
                true
        );

        // Create vehicle for User A
        MvcResult result = mockMvc.perform(post("/api/vehicles")
                        .header("Authorization", "Bearer " + userAToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(vehicleRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.licensePlate").value("DL-01-AB-7777"))
                .andExpect(jsonPath("$.data.userId").value(userA.getId()))
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        long newVehicleId = root.path("data").path("id").asLong();

        // Get own vehicles
        mockMvc.perform(get("/api/vehicles")
                        .header("Authorization", "Bearer " + userAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));

        // User B cannot delete User A's vehicle (IDOR check)
        mockMvc.perform(delete("/api/vehicles/" + newVehicleId)
                        .header("Authorization", "Bearer " + userBToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.errorCode").value("ACCESS_DENIED"));

        // User A can delete own vehicle
        mockMvc.perform(delete("/api/vehicles/" + newVehicleId)
                        .header("Authorization", "Bearer " + userAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("13. User Logout completes with audit logging and 200 OK")
    void testUserLogout() throws Exception {
        mockMvc.perform(post("/api/auth/logout")
                        .header("Authorization", "Bearer " + userAToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Logged out successfully"));
    }

    @Test
    @DisplayName("14. Input validation failure returns 400 with VALIDATION_FAILED")
    void testValidationFailure() throws Exception {
        RegisterRequest invalidRequest = new RegisterRequest(
                "not-an-email",
                "short",
                "",
                "123"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("VALIDATION_FAILED"))
                .andExpect(jsonPath("$.errors").isArray());
    }
}
