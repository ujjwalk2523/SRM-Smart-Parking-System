package com.smartparking.dto.lot;

import com.smartparking.model.VehicleType;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

/**
 * Clean data transfer object for real-time parking lot availability.
 */
public class LotAvailabilityResponse {

    private Long lotId;
    private String lotName;
    private int totalCapacity;
    private int availableCount;
    private int reservedCount;
    private int occupiedCount;
    private int maintenanceCount;
    private int disabledCount;
    private Map<VehicleType, VehicleTypeAvailability> breakdown = new HashMap<>();

    public LotAvailabilityResponse() {}

    public static class VehicleTypeAvailability {
        private VehicleType vehicleType;
        private int total;
        private int available;
        private int reserved;
        private int occupied;
        private BigDecimal baseFare;
        private BigDecimal hourlyRate;

        public VehicleTypeAvailability() {}

        public VehicleTypeAvailability(VehicleType vehicleType, int total, int available, int reserved,
                                       int occupied, BigDecimal baseFare, BigDecimal hourlyRate) {
            this.vehicleType = vehicleType;
            this.total = total;
            this.available = available;
            this.reserved = reserved;
            this.occupied = occupied;
            this.baseFare = baseFare;
            this.hourlyRate = hourlyRate;
        }

        public VehicleType getVehicleType() { return vehicleType; }
        public int getTotal() { return total; }
        public int getAvailable() { return available; }
        public int getReserved() { return reserved; }
        public int getOccupied() { return occupied; }
        public BigDecimal getBaseFare() { return baseFare; }
        public BigDecimal getHourlyRate() { return hourlyRate; }
    }

    public Long getLotId() { return lotId; }
    public void setLotId(Long lotId) { this.lotId = lotId; }

    public String getLotName() { return lotName; }
    public void setLotName(String lotName) { this.lotName = lotName; }

    public int getTotalCapacity() { return totalCapacity; }
    public void setTotalCapacity(int totalCapacity) { this.totalCapacity = totalCapacity; }

    public int getAvailableCount() { return availableCount; }
    public void setAvailableCount(int availableCount) { this.availableCount = availableCount; }

    public int getReservedCount() { return reservedCount; }
    public void setReservedCount(int reservedCount) { this.reservedCount = reservedCount; }

    public int getOccupiedCount() { return occupiedCount; }
    public void setOccupiedCount(int occupiedCount) { this.occupiedCount = occupiedCount; }

    public int getMaintenanceCount() { return maintenanceCount; }
    public void setMaintenanceCount(int maintenanceCount) { this.maintenanceCount = maintenanceCount; }

    public int getDisabledCount() { return disabledCount; }
    public void setDisabledCount(int disabledCount) { this.disabledCount = disabledCount; }

    public Map<VehicleType, VehicleTypeAvailability> getBreakdown() { return breakdown; }
    public void setBreakdown(Map<VehicleType, VehicleTypeAvailability> breakdown) { this.breakdown = breakdown; }
}
