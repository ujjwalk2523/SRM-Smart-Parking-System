package com.smartparking.repository;

import com.smartparking.model.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class RepositoryIntegrationTest {

    @Autowired private RoleRepository roleRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private VehicleRepository vehicleRepository;
    @Autowired private ParkingLocationRepository locationRepository;
    @Autowired private ParkingLotRepository lotRepository;
    @Autowired private PricingRuleRepository pricingRuleRepository;
    @Autowired private ParkingSlotRepository slotRepository;
    @Autowired private BookingRepository bookingRepository;
    @Autowired private ParkingSessionRepository sessionRepository;
    @Autowired private PaymentRepository paymentRepository;
    @Autowired private AuditLogRepository auditLogRepository;

    @Test
    @DisplayName("Test RoleRepository CRUD operations")
    void testRoleRepository() {
        Role role = new Role(null, "ROLE_MANAGER", "Facility manager");
        role = roleRepository.save(role);
        assertNotNull(role.getId());

        Optional<Role> found = roleRepository.findById(role.getId());
        assertTrue(found.isPresent());
        assertEquals("ROLE_MANAGER", found.get().getName());

        Optional<Role> byName = roleRepository.findByName("ROLE_MANAGER");
        assertTrue(byName.isPresent());

        List<Role> all = roleRepository.findAll();
        assertFalse(all.isEmpty());
    }

    @Test
    @DisplayName("Test UserRepository CRUD operations")
    void testUserRepository() {
        Role role = roleRepository.save(new Role(null, "ROLE_TEST_USER", "Test role"));

        User user = new User();
        user.setRoleId(role.getId());
        user.setEmail("testuser@example.com");
        user.setPasswordHash("$2a$10$dummyHashValue");
        user.setFullName("Test User");
        user.setPhoneNumber("+919999988888");
        user.setStatus(UserStatus.ACTIVE);

        user = userRepository.save(user);
        assertNotNull(user.getId());

        assertTrue(userRepository.existsByEmail("testuser@example.com"));
        assertTrue(userRepository.existsByPhoneNumber("+919999988888"));

        Optional<User> byEmail = userRepository.findByEmail("testuser@example.com");
        assertTrue(byEmail.isPresent());
        assertEquals("Test User", byEmail.get().getFullName());

        user.setFullName("Updated User Name");
        userRepository.update(user);
        assertEquals("Updated User Name", userRepository.findById(user.getId()).orElseThrow().getFullName());

        userRepository.updateStatus(user.getId(), UserStatus.SUSPENDED);
        assertEquals(UserStatus.SUSPENDED, userRepository.findById(user.getId()).orElseThrow().getStatus());
    }

    @Test
    @DisplayName("Test VehicleRepository CRUD and default vehicle toggling")
    void testVehicleRepository() {
        Role role = roleRepository.save(new Role(null, "ROLE_VEH_OWNER", "Owner"));
        User user = new User();
        user.setRoleId(role.getId());
        user.setEmail("owner@example.com");
        user.setPasswordHash("hash");
        user.setFullName("Vehicle Owner");
        user.setPhoneNumber("+919111122222");
        user = userRepository.save(user);

        Vehicle v1 = new Vehicle();
        v1.setUserId(user.getId());
        v1.setLicensePlate("KA-01-AA-1111");
        v1.setVehicleType(VehicleType.CAR);
        v1.setMake("Honda");
        v1.setModel("City");
        v1.setColor("Red");
        v1.setDefault(true);
        v1 = vehicleRepository.save(v1);
        assertNotNull(v1.getId());

        Vehicle v2 = new Vehicle();
        v2.setUserId(user.getId());
        v2.setLicensePlate("KA-01-BB-2222");
        v2.setVehicleType(VehicleType.BIKE);
        v2.setMake("Yamaha");
        v2.setModel("R15");
        v2.setColor("Blue");
        v2.setDefault(false);
        v2 = vehicleRepository.save(v2);

        List<Vehicle> userVehicles = vehicleRepository.findByUserId(user.getId());
        assertEquals(2, userVehicles.size());

        vehicleRepository.setDefaultVehicle(user.getId(), v2.getId());
        assertTrue(vehicleRepository.findById(v2.getId()).orElseThrow().isDefault());
        assertFalse(vehicleRepository.findById(v1.getId()).orElseThrow().isDefault());
    }

    @Test
    @DisplayName("Test ParkingLocation, ParkingLot, PricingRule, and ParkingSlot repositories")
    void testLocationLotSlotAndPricingRepositories() {
        // Location
        ParkingLocation loc = new ParkingLocation();
        loc.setName("Test Location Indiranagar");
        loc.setCode("LOC-TEST-01");
        loc.setAddress("100ft Road");
        loc.setCity("Bangalore");
        loc.setState("Karnataka");
        loc.setPostalCode("560038");
        loc.setActive(true);
        loc = locationRepository.save(loc);
        assertNotNull(loc.getId());

        // Lot
        ParkingLot lot = new ParkingLot();
        lot.setLocationId(loc.getId());
        lot.setLotCode("LOT-TEST-01");
        lot.setName("Grand Plaza Lot");
        lot.setTotalCapacity(50);
        lot.setTotalFloors(2);
        lot.setActive(true);
        lot = lotRepository.save(lot);
        assertNotNull(lot.getId());

        // Pricing Rule
        PricingRule rule = new PricingRule();
        rule.setLotId(lot.getId());
        rule.setVehicleType(VehicleType.CAR);
        rule.setBaseFare(new BigDecimal("30.00"));
        rule.setHourlyRate(new BigDecimal("40.00"));
        rule.setMinHours(1);
        rule.setGracePeriodMins(15);
        rule = pricingRuleRepository.save(rule);
        assertNotNull(rule.getId());

        Optional<PricingRule> foundRule = pricingRuleRepository.findByLotIdAndVehicleType(lot.getId(), VehicleType.CAR);
        assertTrue(foundRule.isPresent());
        assertEquals(new BigDecimal("40.00"), foundRule.get().getHourlyRate());

        // Slot
        ParkingSlot slot = new ParkingSlot();
        slot.setLotId(lot.getId());
        slot.setSlotNumber("A-101");
        slot.setFloorLevel(1);
        slot.setSlotType(VehicleType.CAR);
        slot.setStatus(SlotStatus.AVAILABLE);
        slot.setActive(true);
        slot = slotRepository.save(slot);
        assertNotNull(slot.getId());

        // Test pessimistic lock query
        Optional<ParkingSlot> lockedSlot = slotRepository.findByIdForUpdate(slot.getId());
        assertTrue(lockedSlot.isPresent());
        assertEquals("A-101", lockedSlot.get().getSlotNumber());

        List<ParkingSlot> avail = slotRepository.findAvailableSlots(lot.getId(), VehicleType.CAR);
        assertEquals(1, avail.size());

        slotRepository.updateStatus(slot.getId(), SlotStatus.OCCUPIED);
        assertEquals(SlotStatus.OCCUPIED, slotRepository.findById(slot.getId()).orElseThrow().getStatus());
    }

    @Test
    @DisplayName("Test Booking, Session, Payment, and AuditLog lifecycle")
    void testBookingSessionPaymentAndAuditRepositories() {
        // Setup prerequisites
        Role role = roleRepository.save(new Role(null, "ROLE_TESTER", "Tester"));
        User user = new User();
        user.setRoleId(role.getId());
        user.setEmail("bkgtester@example.com");
        user.setPasswordHash("pass");
        user.setFullName("Booking Tester");
        user.setPhoneNumber("+919777766666");
        user = userRepository.save(user);

        Vehicle vehicle = new Vehicle();
        vehicle.setUserId(user.getId());
        vehicle.setLicensePlate("KA-05-ZZ-9999");
        vehicle.setVehicleType(VehicleType.CAR);
        vehicle = vehicleRepository.save(vehicle);

        ParkingLocation loc = new ParkingLocation();
        loc.setName("Yeshwantpur Hub");
        loc.setCode("LOC-YSH-TEST");
        loc.setAddress("Station Road");
        loc.setPostalCode("560022");
        loc = locationRepository.save(loc);

        ParkingLot lot = new ParkingLot();
        lot.setLocationId(loc.getId());
        lot.setLotCode("LOT-YSH-TEST");
        lot.setName("Metro Station Lot");
        lot.setTotalCapacity(20);
        lot = lotRepository.save(lot);

        ParkingSlot slot = new ParkingSlot();
        slot.setLotId(lot.getId());
        slot.setSlotNumber("P-01");
        slot.setFloorLevel(1);
        slot.setSlotType(VehicleType.CAR);
        slot.setStatus(SlotStatus.AVAILABLE);
        slot = slotRepository.save(slot);

        LocalDateTime start = LocalDateTime.now().plusHours(1);
        LocalDateTime end = start.plusHours(3);

        // Verify conflict count before booking
        assertEquals(0, bookingRepository.countConflictingBookings(slot.getId(), start, end));

        // Create booking
        Booking booking = new Booking();
        booking.setBookingReference("BKG-TEST-12345");
        booking.setUserId(user.getId());
        booking.setVehicleId(vehicle.getId());
        booking.setSlotId(slot.getId());
        booking.setLotId(lot.getId());
        booking.setStartTime(start);
        booking.setEndTime(end);
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setEstimatedFare(new BigDecimal("150.00"));
        booking = bookingRepository.save(booking);
        assertNotNull(booking.getId());

        // Verify conflict detection
        assertEquals(1, bookingRepository.countConflictingBookings(slot.getId(), start, end));
        assertEquals(1, bookingRepository.countConflictingBookings(slot.getId(), start.plusMinutes(30), end.plusMinutes(30)));

        // Create Parking Session
        ParkingSession session = new ParkingSession();
        session.setBookingId(booking.getId());
        session.setSessionCode("SES-TEST-12345");
        session.setCheckInTime(LocalDateTime.now());
        session.setStatus(SessionStatus.ACTIVE);
        session.setCalculatedFare(new BigDecimal("150.00"));
        session.setEntryGate("GATE-1");
        session = sessionRepository.save(session);
        assertNotNull(session.getId());

        // Complete Session
        sessionRepository.completeSession(session.getId(), LocalDateTime.now().plusHours(2), 120,
                new BigDecimal("150.00"), BigDecimal.ZERO, "EXIT-1");
        assertEquals(SessionStatus.COMPLETED, sessionRepository.findById(session.getId()).orElseThrow().getStatus());

        // Payment
        Payment payment = new Payment();
        payment.setPaymentReference("PAY-TEST-99999");
        payment.setBookingId(booking.getId());
        payment.setSessionId(session.getId());
        payment.setUserId(user.getId());
        payment.setAmount(new BigDecimal("150.00"));
        payment.setPaymentMethod(PaymentMethod.UPI);
        payment.setPaymentStatus(PaymentStatus.COMPLETED);
        payment.setTransactionId("UPI-TXN-123456");
        payment.setPaidAt(LocalDateTime.now());
        payment = paymentRepository.save(payment);
        assertNotNull(payment.getId());

        assertTrue(paymentRepository.calculateTotalRevenue().compareTo(BigDecimal.ZERO) > 0);

        // Audit Log
        AuditLog log = new AuditLog();
        log.setUserId(user.getId());
        log.setAction("COMPLETE_SESSION");
        log.setEntityType("SESSION");
        log.setEntityId(session.getId());
        log.setNewValue("{\"status\":\"COMPLETED\"}");
        log.setIpAddress("127.0.0.1");
        log = auditLogRepository.save(log);
        assertNotNull(log.getId());

        List<AuditLog> logs = auditLogRepository.findByEntity("SESSION", session.getId());
        assertFalse(logs.isEmpty());
    }
}
