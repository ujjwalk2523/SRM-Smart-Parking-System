package com.smartparking.service;

import com.smartparking.model.PricingRule;
import com.smartparking.model.VehicleType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class FareCalculationServiceTest {

    private FareCalculationService fareService;
    private PricingRule carPricing;
    private PricingRule bikePricing;

    @BeforeEach
    void setUp() {
        fareService = new FareCalculationService();

        carPricing = new PricingRule();
        carPricing.setLotId(1L);
        carPricing.setVehicleType(VehicleType.CAR);
        carPricing.setBaseFare(BigDecimal.valueOf(30.00));
        carPricing.setHourlyRate(BigDecimal.valueOf(40.00));
        carPricing.setMinHours(1);
        carPricing.setGracePeriodMins(15);
        carPricing.setOverstayPenaltyRate(BigDecimal.valueOf(60.00));

        bikePricing = new PricingRule();
        bikePricing.setLotId(1L);
        bikePricing.setVehicleType(VehicleType.BIKE);
        bikePricing.setBaseFare(BigDecimal.valueOf(10.00));
        bikePricing.setHourlyRate(BigDecimal.valueOf(15.00));
        bikePricing.setMinHours(1);
        bikePricing.setGracePeriodMins(15);
        bikePricing.setOverstayPenaltyRate(BigDecimal.valueOf(25.00));
    }

    @Test
    @DisplayName("Exit within grace period (10 minutes) should waive all charges")
    void testGracePeriodExit() {
        LocalDateTime checkIn = LocalDateTime.of(2026, 10, 6, 10, 0);
        LocalDateTime checkOut = checkIn.plusMinutes(10);

        var breakdown = fareService.calculateFare(carPricing, checkIn, checkOut, checkIn.plusHours(2));

        assertTrue(breakdown.appliedGracePeriod());
        assertEquals(0, breakdown.billableHours());
        assertEquals(0, breakdown.totalFare().compareTo(BigDecimal.ZERO));
    }

    @Test
    @DisplayName("Parking for 45 minutes should charge base fare + 1 hour minimum")
    void testMinimumOneHourCharge() {
        LocalDateTime checkIn = LocalDateTime.of(2026, 10, 6, 10, 0);
        LocalDateTime checkOut = checkIn.plusMinutes(45);

        var breakdown = fareService.calculateFare(carPricing, checkIn, checkOut, checkIn.plusHours(2));

        assertFalse(breakdown.appliedGracePeriod());
        assertEquals(1, breakdown.billableHours());
        // 30 base + 40 * 1 hour = 70.00
        assertEquals(0, breakdown.totalFare().compareTo(BigDecimal.valueOf(70.00)));
    }

    @Test
    @DisplayName("Parking for 1 hour 15 minutes should ceiling-round to 2 billable hours")
    void testCeilingHourRounding() {
        LocalDateTime checkIn = LocalDateTime.of(2026, 10, 6, 10, 0);
        LocalDateTime checkOut = checkIn.plusMinutes(75);

        var breakdown = fareService.calculateFare(carPricing, checkIn, checkOut, checkIn.plusHours(2));

        assertEquals(2, breakdown.billableHours());
        // 30 base + 40 * 2 hours = 110.00
        assertEquals(0, breakdown.totalFare().compareTo(BigDecimal.valueOf(110.00)));
    }

    @Test
    @DisplayName("Parking across midnight boundary (23:30 to 02:15) correctly calculates duration and positive fare")
    void testMidnightBoundaryCross() {
        LocalDateTime checkIn = LocalDateTime.of(2026, 10, 6, 23, 30);
        LocalDateTime checkOut = LocalDateTime.of(2026, 10, 7, 2, 15); // 2 hours 45 mins -> 3 hours

        var breakdown = fareService.calculateFare(carPricing, checkIn, checkOut, null);

        assertEquals(165, breakdown.totalDurationMinutes());
        assertEquals(3, breakdown.billableHours());
        // 30 base + 40 * 3 hours = 150.00
        assertEquals(0, breakdown.totalFare().compareTo(BigDecimal.valueOf(150.00)));
    }

    @Test
    @DisplayName("Overstaying beyond booked end time incurs overstay penalty")
    void testOverstayPenalty() {
        LocalDateTime checkIn = LocalDateTime.of(2026, 10, 6, 10, 0);
        LocalDateTime bookedEnd = checkIn.plusHours(2); // 12:00
        LocalDateTime checkOut = checkIn.plusHours(3).plusMinutes(30); // 13:30 (1.5h overstay)

        var breakdown = fareService.calculateFare(carPricing, checkIn, checkOut, bookedEnd);

        assertTrue(breakdown.isOverstay());
        assertEquals(90, breakdown.overstayMinutes());
        // Standard: 3.5h ceil -> 4h. 30 base + 40 * 4 = 190.00
        // Overstay: 90 mins -> ceil 2h * 60 penalty rate = 120.00
        // Total: 190 + 120 = 310.00
        assertEquals(0, breakdown.overstayPenalty().compareTo(BigDecimal.valueOf(120.00)));
        assertEquals(0, breakdown.totalFare().compareTo(BigDecimal.valueOf(310.00)));
    }

    @Test
    @DisplayName("Bike pricing uses correct lower base and hourly tariff")
    void testBikeTariff() {
        LocalDateTime checkIn = LocalDateTime.of(2026, 10, 6, 10, 0);
        LocalDateTime checkOut = checkIn.plusHours(2); // 2 hours

        var breakdown = fareService.calculateFare(bikePricing, checkIn, checkOut, null);

        assertEquals(2, breakdown.billableHours());
        // 10 base + 15 * 2 = 40.00
        assertEquals(0, breakdown.totalFare().compareTo(BigDecimal.valueOf(40.00)));
    }
}
