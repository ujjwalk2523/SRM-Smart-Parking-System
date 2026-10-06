import React, { useState, useMemo } from 'react';
import { SlotCard } from './SlotCard';
import { IoTSensorSimulatorModal } from '../iot/IoTSensorSimulatorModal';
import { Layers, Radio, Cpu, Activity, Sparkles, RefreshCw } from 'lucide-react';

export const SlotMatrix = ({ slots = [], selectedSlot, onSelectSlot, onSlotUpdated }) => {
  const [activeFloor, setActiveFloor] = useState(1);
  const [vehicleFilter, setVehicleFilter] = useState('ALL');
  const [showTelemetry, setShowTelemetry] = useState(false);
  const [simulatorOpen, setSimulatorOpen] = useState(false);

  // Compute distinct floors from slots
  const floors = useMemo(() => {
    const floorSet = new Set(slots.map((s) => s.floorLevel || 1));
    return Array.from(floorSet).sort((a, b) => a - b);
  }, [slots]);

  // Filter slots by active floor and vehicle type
  const filteredSlots = useMemo(() => {
    return slots.filter((slot) => {
      const matchFloor = slot.floorLevel === activeFloor;
      const matchType = vehicleFilter === 'ALL' || slot.slotType === vehicleFilter;
      return matchFloor && matchType;
    });
  }, [slots, activeFloor, vehicleFilter]);

  // Status counts for current floor
  const stats = useMemo(() => {
    const floorSlots = slots.filter((s) => s.floorLevel === activeFloor);
    return {
      available: floorSlots.filter((s) => s.status === 'AVAILABLE').length,
      occupied: floorSlots.filter((s) => s.status === 'OCCUPIED').length,
      reserved: floorSlots.filter((s) => s.status === 'RESERVED').length,
      total: floorSlots.length,
    };
  }, [slots, activeFloor]);

  return (
    <div className="space-y-6">
      
      {/* IoT Gateway Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
          <span className="font-bold text-[var(--text-primary)]">
            SRM LoRaWAN Gateway Node KTR-01
          </span>
          <span className="text-[var(--text-muted)] hidden sm:inline">•</span>
          <span className="text-[var(--text-muted)] font-mono hidden sm:inline">
            868.1 MHz • 99.8% Packet Delivery • 42ms Latency
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Telemetry View Toggle */}
          <button
            type="button"
            onClick={() => setShowTelemetry(!showTelemetry)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              showTelemetry
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${showTelemetry ? 'animate-pulse' : ''}`} />
            <span>{showTelemetry ? 'Hide Telemetry' : 'Show Sensor Telemetry'}</span>
          </button>

          {/* IoT Sensor Simulator Trigger */}
          <button
            type="button"
            onClick={() => setSimulatorOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] font-bold hover:bg-[var(--surface-hover)] transition-all cursor-pointer shadow-xs"
            title="Simulate ultrasonic sensor pulses for bay testing"
          >
            <Cpu className="w-3.5 h-3.5 text-blue-500" />
            <span>Simulate Sensor</span>
          </button>
        </div>
      </div>

      {/* Controls: Floors & Vehicle Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl card-surface border border-[var(--border)]">
        
        {/* Floor Level Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[var(--surface-secondary)] rounded-xl border border-[var(--border)]">
          <div className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-[var(--text-muted)]">
            <Layers className="w-3.5 h-3.5" /> Floor:
          </div>
          {(floors.length > 0 ? floors : [1]).map((fl) => (
            <button
              key={fl}
              type="button"
              onClick={() => setActiveFloor(fl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFloor === fl
                  ? 'bg-[var(--accent)] text-[var(--accent-text)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Lvl {fl}
            </button>
          ))}
        </div>

        {/* Vehicle Category Filters */}
        <div className="flex items-center gap-1 p-1 bg-[var(--surface-secondary)] rounded-xl border border-[var(--border)] flex-wrap">
          {['ALL', 'CAR', 'BIKE', 'EV', 'SUV', 'BUS'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setVehicleFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                vehicleFilter === type
                  ? 'bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

      </div>

      {/* Legend & Availability Counters */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-1 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Available ({stats.available})</span>
          </div>
          <div className="flex items-center gap-1.5 text-[var(--text-primary)] font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--text-primary)]" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Reserved ({stats.reserved})</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Occupied ({stats.occupied})</span>
          </div>
        </div>

        <div className="text-[var(--text-muted)] font-medium">
          Showing <span className="font-bold text-[var(--text-primary)]">{filteredSlots.length}</span> bays on Floor {activeFloor}
        </div>
      </div>

      {/* Interactive Slot Grid */}
      {filteredSlots.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 p-4 rounded-2xl card-surface border border-[var(--border)]">
          {filteredSlots.map((slot) => (
            <SlotCard
              key={slot.id}
              slot={slot}
              isSelected={selectedSlot?.id === slot.id}
              onSelect={onSelectSlot}
              showTelemetry={showTelemetry}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl card-surface border border-dashed border-[var(--border)]">
          <p className="text-[var(--text-muted)] text-sm">
            No parking bays found matching the selected category ({vehicleFilter}) on Floor {activeFloor}.
          </p>
        </div>
      )}

      {/* IoT Hardware Pulse Simulator Modal */}
      {simulatorOpen && (
        <IoTSensorSimulatorModal
          isOpen={simulatorOpen}
          onClose={() => setSimulatorOpen(false)}
          slots={slots}
          onSlotUpdated={onSlotUpdated}
        />
      )}

    </div>
  );
};
