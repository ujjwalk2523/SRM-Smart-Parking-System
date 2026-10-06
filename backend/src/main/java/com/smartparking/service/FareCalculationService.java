package com.smartparking.service;

import com.smartparking.model.PricingRule;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;

/**
 * Enterprise Fare Calculation Engine.
 * Resolves all legacy flaws:
 * 1. Handles calendar midnight and multi-day boundaries properly via Duration.between()
 * 2. Applies configured grace periods (e.g. 15 min free drop-off/pickup)
 * 3. Enforces minimum billable hours
 * 4. Applies ceiling rounding on partial hours (Math.ceil)
 * 5. Calculates vehicle-specific base fares, hourly tariffs, and overstay penalties
 */
@Service
public class FareCalculationService {

    private static final Logger log = LoggerFactory.getLogger(FareCalculationService.class);

    public record FareBreakdown(
            long totalDurationMinutes,
            long billableHours,
            BigDecimal baseFare,
            BigDecimal hourlyRate,
            BigDecimal standardFare,
            boolean isOverstay,
            long overstayMinutes,
            BigDecimal overstayPenalty,
            BigDecimal totalFare,
            boolean appliedGracePeriod
    ) {}

    /**
     * Computes the exact fare breakdown for a parking session.
     *
     * @param pricingRule Pricing parameters configured for the parking lot and vehicle type
     * @param checkInTime Timestamp when vehicle checked in
     * @param checkOutTime Timestamp when vehicle checked out
     * @param bookedEndTime Optional reservation expiration time to detect overstay
     * @return Detailed immutable FareBreakdown
     */
    public FareBreakdown calculateFare(PricingRule pricingRule,
                                       LocalDateTime checkInTime,
                                       LocalDateTime checkOutTime,
                                       LocalDateTime bookedEndTime) {
        if (checkInTime == null || checkOutTime == null) {
            throw new IllegalArgumentException("Check-in and check-out times must not be null");
        }
        if (checkOutTime.isBefore(checkInTime)) {
            throw new IllegalArgumentException("Check-out time cannot be earlier than check-in time");
        }

        long totalMinutes = Math.max(0, Duration.between(checkInTime, checkOutTime).toMinutes());

        int gracePeriodMins = (pricingRule != null && pricingRule.getGracePeriodMins() != null)
                ? pricingRule.getGracePeriodMins()
                : 15;

        // 1. Check if user exited within grace period
        if (totalMinutes <= gracePeriodMins) {
            log.info("Session duration ({} min) is within grace period ({} min). Fare waived.", totalMinutes, gracePeriodMins);
            return new FareBreakdown(
                    totalMinutes,
                    0,
                    BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP),
                    BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP),
                    BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP),
                    false,
                    0,
                    BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP),
                    BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP),
                    true
            );
        }

        BigDecimal baseFare = (pricingRule != null && pricingRule.getBaseFare() != null)
                ? pricingRule.getBaseFare()
                : BigDecimal.ZERO;

        BigDecimal hourlyRate = (pricingRule != null && pricingRule.getHourlyRate() != null)
                ? pricingRule.getHourlyRate()
                : BigDecimal.valueOf(40.00);

        int minHours = (pricingRule != null && pricingRule.getMinHours() != null)
                ? pricingRule.getMinHours()
                : 1;

        // 2. Compute billable hours with ceiling rounding
        long rawHours = (long) Math.ceil((double) totalMinutes / 60.0);
        long billableHours = Math.max(minHours, rawHours);

        BigDecimal standardFare = baseFare.add(hourlyRate.multiply(BigDecimal.valueOf(billableHours)))
                .setScale(2, RoundingMode.HALF_UP);

        // 3. Compute overstay penalty if user exceeded scheduled booking window
        boolean isOverstay = false;
        long overstayMinutes = 0;
        BigDecimal overstayPenalty = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

        if (bookedEndTime != null && checkOutTime.isAfter(bookedEndTime)) {
            overstayMinutes = Duration.between(bookedEndTime, checkOutTime).toMinutes();
            // 15-minute departure tolerance beyond booked end time
            if (overstayMinutes > 15) {
                isOverstay = true;
                long overstayHours = (long) Math.ceil((double) overstayMinutes / 60.0);

                BigDecimal penaltyRate = (pricingRule != null && pricingRule.getOverstayPenaltyRate() != null
                        && pricingRule.getOverstayPenaltyRate().compareTo(BigDecimal.ZERO) > 0)
                        ? pricingRule.getOverstayPenaltyRate()
                        : hourlyRate.multiply(BigDecimal.valueOf(1.5));

                overstayPenalty = penaltyRate.multiply(BigDecimal.valueOf(overstayHours))
                        .setScale(2, RoundingMode.HALF_UP);

                log.warn("Session exceeded booked window by {} mins. Overstay penalty: {}", overstayMinutes, overstayPenalty);
            }
        }

        BigDecimal totalFare = standardFare.add(overstayPenalty).setScale(2, RoundingMode.HALF_UP);

        return new FareBreakdown(
                totalMinutes,
                billableHours,
                baseFare.setScale(2, RoundingMode.HALF_UP),
                hourlyRate.setScale(2, RoundingMode.HALF_UP),
                standardFare,
                isOverstay,
                overstayMinutes,
                overstayPenalty,
                totalFare,
                false
        );
    }
}
