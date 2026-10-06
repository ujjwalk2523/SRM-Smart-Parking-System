package com.smartparking.service;

import com.smartparking.dto.booking.CreateBookingRequest;
import com.smartparking.exception.BadRequestException;
import com.smartparking.exception.SlotUnavailableException;
import com.smartparking.model.*;
import com.smartparking.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class BookingConcurrencyIntegrationTest {

    @Autowired private BookingService bookingService;
    @Autowired private BookingRepository bookingRepository;
    @Autowired private ParkingSlotRepository slotRepository;
    @Autowired private VehicleRepository vehicleRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private ParkingLocationRepository locationRepository;
    @Autowired private ParkingLotRepository lotRepository;
    @Autowired private PricingRuleRepository pricingRuleRepository;

    private User testUser1;
    private User testUser2;
    private Vehicle user1Car;
    private Vehicle user1Bike;
    private Vehicle user2Car;
    private ParkingSlot testSlot;

    @BeforeEach
    void setup() {
        Role role = roleRepository.findByName("ROLE_CUSTOMER")
                .orElseGet(() -> roleRepository.save(new Role(null, "ROLE_CUSTOMER", "Customer")));

        testUser1 = userRepository.findByEmail("driver1@test.com").orElseGet(() -> {
            User u = new User();
            u.setRoleId(role.getId());
            u.setEmail("driver1@test.com");
            u.setPasswordHash("$2a$10$dummy");
            u.setFullName("Driver One");
            u.setPhoneNumber("+919000000001");
            return userRepository.save(u);
        });

        testUser2 = userRepository.findByEmail("driver2@test.com").orElseGet(() -> {
            User u = new User();
            u.setRoleId(role.getId());
            u.setEmail("driver2@test.com");
            u.setPasswordHash("$2a$10$dummy");
            u.setFullName("Driver Two");
            u.setPhoneNumber("+919000000002");
            return userRepository.save(u);
        });

        user1Car = vehicleRepository.findByLicensePlate("KA-05-AA-1111").orElseGet(() -> {
            Vehicle v = new Vehicle();
            v.setUserId(testUser1.getId());
            v.setLicensePlate("KA-05-AA-1111");
            v.setVehicleType(VehicleType.CAR);
            return vehicleRepository.save(v);
        });

        user1Bike = vehicleRepository.findByLicensePlate("KA-05-BB-2222").orElseGet(() -> {
            Vehicle v = new Vehicle();
            v.setUserId(testUser1.getId());
            v.setLicensePlate("KA-05-BB-2222");
            v.setVehicleType(VehicleType.BIKE);
            return vehicleRepository.save(v);
        });

        user2Car = vehicleRepository.findByLicensePlate("KA-05-CC-3333").orElseGet(() -> {
            Vehicle v = new Vehicle();
            v.setUserId(testUser2.getId());
            v.setLicensePlate("KA-05-CC-3333");
            v.setVehicleType(VehicleType.CAR);
            return vehicleRepository.save(v);
        });

        ParkingLocation location = locationRepository.findByCode("LOC-TEST-CC").orElseGet(() -> {
            ParkingLocation l = new ParkingLocation();
            l.setCode("LOC-TEST-CC");
            l.setName("Test Location");
            l.setAddress("Test Road");
            l.setPostalCode("560001");
            return locationRepository.save(l);
        });

        ParkingLot lot = lotRepository.findByLotCode("LOT-TEST-CC").orElseGet(() -> {
            ParkingLot pl = new ParkingLot();
            pl.setLocationId(location.getId());
            pl.setLotCode("LOT-TEST-CC");
            pl.setName("Test Lot");
            return lotRepository.save(pl);
        });

        pricingRuleRepository.findByLotIdAndVehicleType(lot.getId(), VehicleType.CAR).orElseGet(() -> {
            PricingRule pr = new PricingRule();
            pr.setLotId(lot.getId());
            pr.setVehicleType(VehicleType.CAR);
            pr.setBaseFare(BigDecimal.valueOf(20));
            pr.setHourlyRate(BigDecimal.valueOf(30));
            return pricingRuleRepository.save(pr);
        });

        testSlot = slotRepository.findByLotId(lot.getId()).stream()
                .filter(s -> s.getSlotNumber().equals("SLOT-CC-01"))
                .findFirst()
                .orElseGet(() -> {
                    ParkingSlot ps = new ParkingSlot();
                    ps.setLotId(lot.getId());
                    ps.setSlotNumber("SLOT-CC-01");
                    ps.setSlotType(VehicleType.CAR);
                    ps.setStatus(SlotStatus.AVAILABLE);
                    return slotRepository.save(ps);
                });
        slotRepository.updateStatus(testSlot.getId(), SlotStatus.AVAILABLE);
    }

    @Test
    @DisplayName("Immediate booking should mark slot reserved and compute fare")
    void testImmediateBooking() {
        CreateBookingRequest request = new CreateBookingRequest();
        request.setSlotId(testSlot.getId());
        request.setVehicleId(user1Car.getId());
        request.setIsImmediate(true);
        request.setDurationHours(2);

        var response = bookingService.createBooking(request, testUser1.getId());

        assertNotNull(response);
        assertNotNull(response.getBookingReference());
        assertEquals(BookingStatus.CONFIRMED, response.getStatus());

        ParkingSlot updatedSlot = slotRepository.findById(testSlot.getId()).orElseThrow();
        assertEquals(SlotStatus.RESERVED, updatedSlot.getStatus());
    }

    @Test
    @DisplayName("Concurrent interval overlap should be rejected with SlotUnavailableException")
    void testConflictingBookingRejected() {
        LocalDateTime start = LocalDateTime.now().plusDays(2).withHour(10).withMinute(0);
        LocalDateTime end = start.plusHours(2);

        CreateBookingRequest req1 = new CreateBookingRequest(testSlot.getId(), user1Car.getId(), start, end);
        var res1 = bookingService.createBooking(req1, testUser1.getId());
        assertNotNull(res1);

        // Conflicting booking for user 2 overlapping by 30 mins
        CreateBookingRequest req2 = new CreateBookingRequest(testSlot.getId(), user2Car.getId(), start.plusHours(1), end.plusHours(1));
        assertThrows(SlotUnavailableException.class, () -> {
            bookingService.createBooking(req2, testUser2.getId());
        });
    }

    @Test
    @DisplayName("Adjacent non-overlapping bookings on the same slot should both succeed")
    void testAdjacentBookingsSucceed() {
        LocalDateTime start1 = LocalDateTime.now().plusDays(3).withHour(9).withMinute(0);
        LocalDateTime end1 = start1.plusHours(2); // 9:00 - 11:00

        CreateBookingRequest req1 = new CreateBookingRequest(testSlot.getId(), user1Car.getId(), start1, end1);
        var res1 = bookingService.createBooking(req1, testUser1.getId());
        assertNotNull(res1);

        // Adjacent: 11:00 - 13:00
        CreateBookingRequest req2 = new CreateBookingRequest(testSlot.getId(), user2Car.getId(), end1, end1.plusHours(2));
        var res2 = bookingService.createBooking(req2, testUser2.getId());
        assertNotNull(res2);
    }

    @Test
    @DisplayName("Vehicle type mismatch with slot type should be rejected")
    void testVehicleTypeMismatch() {
        LocalDateTime start = LocalDateTime.now().plusDays(4).withHour(14).withMinute(0);
        LocalDateTime end = start.plusHours(1);

        // Car slot booked with a Bike
        CreateBookingRequest req = new CreateBookingRequest(testSlot.getId(), user1Bike.getId(), start, end);
        assertThrows(BadRequestException.class, () -> {
            bookingService.createBooking(req, testUser1.getId());
        });
    }

    @Test
    @DisplayName("Booking with vehicle belonging to another user must be rejected with AccessDeniedException")
    void testVehicleOwnershipValidation() {
        LocalDateTime start = LocalDateTime.now().plusDays(5).withHour(10).withMinute(0);
        LocalDateTime end = start.plusHours(1);

        // User 1 trying to book using User 2's car
        CreateBookingRequest req = new CreateBookingRequest(testSlot.getId(), user2Car.getId(), start, end);
        assertThrows(AccessDeniedException.class, () -> {
            bookingService.createBooking(req, testUser1.getId());
        });
    }

    @Test
    @DisplayName("Cancelling a booking releases slot to AVAILABLE")
    void testBookingCancellation() {
        ParkingSlot cancelSlot = slotRepository.findByLotId(testSlot.getLotId()).stream()
                .filter(s -> s.getSlotNumber().equals("SLOT-CC-CANCEL"))
                .findFirst()
                .orElseGet(() -> {
                    ParkingSlot ps = new ParkingSlot();
                    ps.setLotId(testSlot.getLotId());
                    ps.setSlotNumber("SLOT-CC-CANCEL");
                    ps.setSlotType(VehicleType.CAR);
                    ps.setStatus(SlotStatus.AVAILABLE);
                    return slotRepository.save(ps);
                });
        slotRepository.updateStatus(cancelSlot.getId(), SlotStatus.AVAILABLE);

        CreateBookingRequest request = new CreateBookingRequest();
        request.setSlotId(cancelSlot.getId());
        request.setVehicleId(user1Car.getId());
        request.setIsImmediate(true);

        var booking = bookingService.createBooking(request, testUser1.getId());
        assertEquals(SlotStatus.RESERVED, slotRepository.findById(cancelSlot.getId()).orElseThrow().getStatus());

        var cancelled = bookingService.cancelBooking(booking.getId(), testUser1.getId(), false, "Change of plans");
        assertEquals(BookingStatus.CANCELLED, cancelled.getStatus());
        assertEquals(SlotStatus.AVAILABLE, slotRepository.findById(cancelSlot.getId()).orElseThrow().getStatus());
    }

    @Test
    @DisplayName("Multithreaded simultaneous booking race condition test: exactly 1 succeeds, 1 fails safely")
    void testSimultaneousRaceCondition() throws Exception {
        LocalDateTime start = LocalDateTime.now().plusDays(6).withHour(10).withMinute(0);
        LocalDateTime end = start.plusHours(2);

        int threads = 2;
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CyclicBarrier barrier = new CyclicBarrier(threads);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger conflictCount = new AtomicInteger(0);

        Callable<Void> task1 = () -> {
            barrier.await();
            try {
                bookingService.createBooking(
                        new CreateBookingRequest(testSlot.getId(), user1Car.getId(), start, end),
                        testUser1.getId()
                );
                successCount.incrementAndGet();
            } catch (SlotUnavailableException e) {
                conflictCount.incrementAndGet();
            }
            return null;
        };

        Callable<Void> task2 = () -> {
            barrier.await();
            try {
                bookingService.createBooking(
                        new CreateBookingRequest(testSlot.getId(), user2Car.getId(), start, end),
                        testUser2.getId()
                );
                successCount.incrementAndGet();
            } catch (SlotUnavailableException e) {
                conflictCount.incrementAndGet();
            }
            return null;
        };

        Future<Void> f1 = executor.submit(task1);
        Future<Void> f2 = executor.submit(task2);

        f1.get(10, TimeUnit.SECONDS);
        f2.get(10, TimeUnit.SECONDS);
        executor.shutdown();

        assertEquals(1, successCount.get(), "Exactly one concurrent transaction should succeed");
        assertEquals(1, conflictCount.get(), "The concurrent conflicting transaction must fail with SlotUnavailableException");
    }
}
