package com.smartparking.service;

import com.smartparking.exception.BadRequestException;
import com.smartparking.exception.ResourceNotFoundException;
import com.smartparking.model.*;
import com.smartparking.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service orchestrating administrative oversight, CRUD on infrastructure,
 * slot maintenance toggles, and high-level revenue and facility utilization metrics.
 */
@Service
public class AdminService {

    private final UserRepository userRepository;
    private final ParkingLocationRepository locationRepository;
    private final ParkingLotRepository lotRepository;
    private final ParkingSlotRepository slotRepository;
    private final BookingRepository bookingRepository;
    private final PricingRuleRepository pricingRuleRepository;
    private final AuditLogRepository auditLogRepository;

    public AdminService(UserRepository userRepository,
                        ParkingLocationRepository locationRepository,
                        ParkingLotRepository lotRepository,
                        ParkingSlotRepository slotRepository,
                        BookingRepository bookingRepository,
                        PricingRuleRepository pricingRuleRepository,
                        AuditLogRepository auditLogRepository) {
        this.userRepository = userRepository;
        this.locationRepository = locationRepository;
        this.lotRepository = lotRepository;
        this.slotRepository = slotRepository;
        this.bookingRepository = bookingRepository;
        this.pricingRuleRepository = pricingRuleRepository;
        this.auditLogRepository = auditLogRepository;
    }

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        long users = userRepository.count();
        long locations = locationRepository.count();
        long lots = lotRepository.count();
        long slots = slotRepository.countTotal();

        long availableSlots = slotRepository.countByStatus(SlotStatus.AVAILABLE);
        long occupiedSlots = slotRepository.countByStatus(SlotStatus.OCCUPIED);
        long reservedSlots = slotRepository.countByStatus(SlotStatus.RESERVED);
        long maintenanceSlots = slotRepository.countByStatus(SlotStatus.MAINTENANCE);
        long disabledSlots = slotRepository.countByStatus(SlotStatus.DISABLED);

        long activeBookings = bookingRepository.countByStatus(BookingStatus.ACTIVE);
        long confirmedBookings = bookingRepository.countByStatus(BookingStatus.CONFIRMED);
        long totalBookings = bookingRepository.count();

        BigDecimal todayRev = bookingRepository.calculateTodayRevenue();
        BigDecimal monthlyRev = bookingRepository.calculateMonthlyRevenue();
        long totalAuditLogs = auditLogRepository.count();

        stats.put("users", users);
        stats.put("totalUsers", users);
        stats.put("locations", locations);
        stats.put("lots", lots);
        stats.put("slots", slots);
        stats.put("availableSlots", availableSlots);
        stats.put("occupiedSlots", occupiedSlots);
        stats.put("reservedSlots", reservedSlots);
        stats.put("maintenanceSlots", maintenanceSlots);
        stats.put("disabledSlots", disabledSlots);
        stats.put("activeBookings", activeBookings);
        stats.put("confirmedBookings", confirmedBookings);
        stats.put("totalBookings", totalBookings);
        stats.put("revenue", monthlyRev);
        stats.put("todayRevenue", todayRev);
        stats.put("monthlyRevenue", monthlyRev);
        stats.put("totalAuditLogs", totalAuditLogs);

        return stats;
    }

    // ------------------------------------------------------------------------
    // Location Management
    // ------------------------------------------------------------------------

    public List<ParkingLocation> getAllLocations() {
        return locationRepository.findAll(false);
    }

    public ParkingLocation createLocation(ParkingLocation location) {
        if (location.getCode() == null || location.getCode().isBlank()) {
            throw new BadRequestException("Location code is required");
        }
        if (location.getName() == null || location.getName().isBlank()) {
            throw new BadRequestException("Location name is required");
        }
        location.setActive(true);
        return locationRepository.save(location);
    }

    public ParkingLocation updateLocation(Long id, ParkingLocation update) {
        ParkingLocation existing = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking location not found with id: " + id));

        if (update.getName() != null) existing.setName(update.getName());
        if (update.getAddress() != null) existing.setAddress(update.getAddress());
        if (update.getCity() != null) existing.setCity(update.getCity());
        if (update.getState() != null) existing.setState(update.getState());
        if (update.getPostalCode() != null) existing.setPostalCode(update.getPostalCode());
        if (update.getLatitude() != null) existing.setLatitude(update.getLatitude());
        if (update.getLongitude() != null) existing.setLongitude(update.getLongitude());
        if (update.getImageUrl() != null) existing.setImageUrl(update.getImageUrl());
        existing.setActive(update.isActive());

        locationRepository.update(existing);
        return existing;
    }

    public void deleteLocation(Long id) {
        locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking location not found with id: " + id));
        locationRepository.deleteById(id);
    }

    // ------------------------------------------------------------------------
    // Lot Management
    // ------------------------------------------------------------------------

    public List<ParkingLot> getAllLots() {
        return lotRepository.findAll(false);
    }

    public ParkingLot createLot(ParkingLot lot) {
        if (lot.getLocationId() == null) {
            throw new BadRequestException("Location ID is required");
        }
        if (lot.getLotCode() == null || lot.getLotCode().isBlank()) {
            throw new BadRequestException("Lot code is required");
        }
        locationRepository.findById(lot.getLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Parent location not found: " + lot.getLocationId()));

        lot.setActive(true);
        return lotRepository.save(lot);
    }

    public ParkingLot updateLot(Long id, ParkingLot update) {
        ParkingLot existing = lotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking lot not found with id: " + id));

        if (update.getName() != null) existing.setName(update.getName());
        if (update.getTotalCapacity() != null) existing.setTotalCapacity(update.getTotalCapacity());
        if (update.getTotalFloors() != null) existing.setTotalFloors(update.getTotalFloors());
        if (update.getOperatingHours() != null) existing.setOperatingHours(update.getOperatingHours());
        if (update.getContactPhone() != null) existing.setContactPhone(update.getContactPhone());
        if (update.getImageUrl() != null) existing.setImageUrl(update.getImageUrl());
        existing.setActive(update.isActive());

        lotRepository.update(existing);
        return existing;
    }

    public void deleteLot(Long id) {
        lotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking lot not found with id: " + id));
        lotRepository.deleteById(id);
    }

    // ------------------------------------------------------------------------
    // Slot Management (including Maintenance & Disabled toggles)
    // ------------------------------------------------------------------------

    public List<ParkingSlot> getSlotsByLot(Long lotId) {
        return slotRepository.findByLotId(lotId);
    }

    public ParkingSlot createSlot(ParkingSlot slot) {
        if (slot.getLotId() == null) {
            throw new BadRequestException("Lot ID is required for slot creation");
        }
        if (slot.getSlotNumber() == null || slot.getSlotNumber().isBlank()) {
            throw new BadRequestException("Slot number is required");
        }
        lotRepository.findById(slot.getLotId())
                .orElseThrow(() -> new ResourceNotFoundException("Lot not found: " + slot.getLotId()));

        if (slot.getStatus() == null) {
            slot.setStatus(SlotStatus.AVAILABLE);
        }
        slot.setActive(true);
        return slotRepository.save(slot);
    }

    @Transactional
    public ParkingSlot updateSlotStatus(Long slotId, SlotStatus status) {
        ParkingSlot existing = slotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found with id: " + slotId));

        slotRepository.updateStatus(slotId, status);
        existing.setStatus(status);
        return existing;
    }

    public void deleteSlot(Long slotId) {
        slotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found with id: " + slotId));
        slotRepository.deleteById(slotId);
    }

    // ------------------------------------------------------------------------
    // Bookings Management
    // ------------------------------------------------------------------------

    public List<Booking> getAllBookings(int offset, int limit) {
        return bookingRepository.findAll(offset, limit);
    }

    @Transactional
    public Booking cancelBooking(Long bookingId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BadRequestException("Cannot cancel booking with current status: " + booking.getStatus());
        }

        bookingRepository.cancelBooking(bookingId, reason, LocalDateTime.now());
        slotRepository.updateStatus(booking.getSlotId(), SlotStatus.AVAILABLE);
        booking.setStatus(BookingStatus.CANCELLED);
        return booking;
    }

    // ------------------------------------------------------------------------
    // Pricing Rules Management
    // ------------------------------------------------------------------------

    public List<PricingRule> getPricingRulesByLot(Long lotId) {
        return pricingRuleRepository.findByLotId(lotId);
    }

    public PricingRule createPricingRule(PricingRule rule) {
        if (rule.getLotId() == null) {
            throw new BadRequestException("Lot ID is required for pricing rule");
        }
        if (rule.getVehicleType() == null) {
            throw new BadRequestException("Vehicle type is required for pricing rule");
        }
        rule.setActive(true);
        return pricingRuleRepository.save(rule);
    }

    public PricingRule updatePricingRule(Long id, PricingRule update) {
        PricingRule existing = pricingRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pricing rule not found with id: " + id));

        if (update.getBaseFare() != null) existing.setBaseFare(update.getBaseFare());
        if (update.getHourlyRate() != null) existing.setHourlyRate(update.getHourlyRate());
        if (update.getMinHours() != null) existing.setMinHours(update.getMinHours());
        if (update.getGracePeriodMins() != null) existing.setGracePeriodMins(update.getGracePeriodMins());
        if (update.getOverstayPenaltyRate() != null) existing.setOverstayPenaltyRate(update.getOverstayPenaltyRate());
        existing.setActive(update.isActive());

        pricingRuleRepository.update(existing);
        return existing;
    }

    public void deletePricingRule(Long id) {
        pricingRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pricing rule not found with id: " + id));
        pricingRuleRepository.deleteById(id);
    }
}
