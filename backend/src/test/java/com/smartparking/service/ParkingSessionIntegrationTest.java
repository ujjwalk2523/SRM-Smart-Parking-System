package com.smartparking.service;

import com.smartparking.dto.booking.CreateBookingRequest;
import com.smartparking.dto.session.CheckInRequest;
import com.smartparking.dto.session.CheckOutRequest;
import com.smartparking.model.*;
import com.smartparking.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class ParkingSessionIntegrationTest {

    @Autowired private ParkingSessionService sessionService;
    @Autowired private BookingService bookingService;
    @Autowired private ParkingSlotRepository slotRepository;
    @Autowired private VehicleRepository vehicleRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private ParkingLocationRepository locationRepository;
    @Autowired private ParkingLotRepository lotRepository;
    @Autowired private PricingRuleRepository pricingRuleRepository;

    private User driver;
    private Vehicle car;
    private ParkingSlot slot;

    @BeforeEach
    void setUp() {
        Role role = roleRepository.findByName("ROLE_CUSTOMER")
                .orElseGet(() -> roleRepository.save(new Role(null, "ROLE_CUSTOMER", "Customer")));

        driver = userRepository.findByEmail("session.driver@test.com").orElseGet(() -> {
            User u = new User();
            u.setRoleId(role.getId());
            u.setEmail("session.driver@test.com");
            u.setPasswordHash("$2a$10$dummy");
            u.setFullName("Session Driver");
            u.setPhoneNumber("+919000000088");
            return userRepository.save(u);
        });

        car = vehicleRepository.findByLicensePlate("KA-05-SS-8888").orElseGet(() -> {
            Vehicle v = new Vehicle();
            v.setUserId(driver.getId());
            v.setLicensePlate("KA-05-SS-8888");
            v.setVehicleType(VehicleType.CAR);
            return vehicleRepository.save(v);
        });

        ParkingLocation location = locationRepository.findByCode("LOC-TEST-SS").orElseGet(() -> {
            ParkingLocation l = new ParkingLocation();
            l.setCode("LOC-TEST-SS");
            l.setName("Session Test Loc");
            l.setAddress("Session St");
            l.setPostalCode("560002");
            return locationRepository.save(l);
        });

        ParkingLot lot = lotRepository.findByLotCode("LOT-TEST-SS").orElseGet(() -> {
            ParkingLot pl = new ParkingLot();
            pl.setLocationId(location.getId());
            pl.setLotCode("LOT-TEST-SS");
            pl.setName("Session Test Lot");
            return lotRepository.save(pl);
        });

        pricingRuleRepository.findByLotIdAndVehicleType(lot.getId(), VehicleType.CAR).orElseGet(() -> {
            PricingRule pr = new PricingRule();
            pr.setLotId(lot.getId());
            pr.setVehicleType(VehicleType.CAR);
            pr.setBaseFare(BigDecimal.valueOf(25));
            pr.setHourlyRate(BigDecimal.valueOf(35));
            pr.setMinHours(1);
            pr.setGracePeriodMins(15);
            return pricingRuleRepository.save(pr);
        });

        slot = slotRepository.findByLotId(lot.getId()).stream()
                .filter(s -> s.getSlotNumber().equals("SLOT-SS-01"))
                .findFirst()
                .orElseGet(() -> {
                    ParkingSlot ps = new ParkingSlot();
                    ps.setLotId(lot.getId());
                    ps.setSlotNumber("SLOT-SS-01");
                    ps.setSlotType(VehicleType.CAR);
                    ps.setStatus(SlotStatus.AVAILABLE);
                    return slotRepository.save(ps);
                });
        slotRepository.updateStatus(slot.getId(), SlotStatus.AVAILABLE);
    }

    @Test
    @DisplayName("Complete lifecycle: Booking -> Check-in -> Occupied -> Checkout -> Fare -> Available")
    void testFullParkingLifecycle() {
        // 1. Create immediate booking
        CreateBookingRequest bookingReq = new CreateBookingRequest();
        bookingReq.setSlotId(slot.getId());
        bookingReq.setVehicleId(car.getId());
        bookingReq.setIsImmediate(true);

        var booking = bookingService.createBooking(bookingReq, driver.getId());
        assertNotNull(booking.getBookingReference());

        // 2. Check-in at entry gate
        CheckInRequest checkInReq = new CheckInRequest(booking.getBookingReference(), "Gate-North");
        var session = sessionService.checkIn(checkInReq, driver.getId());

        assertNotNull(session);
        assertEquals(SessionStatus.ACTIVE, session.getStatus());
        assertEquals("Gate-North", session.getEntryGate());

        // Slot must now be OCCUPIED
        ParkingSlot occupiedSlot = slotRepository.findById(slot.getId()).orElseThrow();
        assertEquals(SlotStatus.OCCUPIED, occupiedSlot.getStatus());

        // Active session lookup must return this session
        var activeSession = sessionService.getActiveSessionByUserId(driver.getId());
        assertNotNull(activeSession);
        assertEquals(session.getId(), activeSession.getId());

        // 3. Check-out at exit gate
        CheckOutRequest checkOutReq = new CheckOutRequest("Gate-South", PaymentMethod.UPI);
        var completed = sessionService.checkOut(session.getId(), checkOutReq, driver.getId(), false);

        assertNotNull(completed);
        assertEquals(SessionStatus.COMPLETED, completed.getStatus());
        assertNotNull(completed.getCheckOutTime());
        assertNotNull(completed.getPaymentId());
        assertEquals(PaymentStatus.COMPLETED, completed.getPaymentStatus());
        assertEquals(PaymentMethod.UPI, completed.getPaymentMethod());

        // Slot must now be released back to AVAILABLE
        ParkingSlot releasedSlot = slotRepository.findById(slot.getId()).orElseThrow();
        assertEquals(SlotStatus.AVAILABLE, releasedSlot.getStatus());
    }
}
