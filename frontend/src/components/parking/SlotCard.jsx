import React from 'react';
import { motion } from 'framer-motion';
import { Car, Bike, Zap, ShieldAlert, Lock, Clock, Check, Bus, Radio, Wifi, Activity } from 'lucide-react';

export const SlotCard = ({ slot, isSelected, onSelect, showTelemetry = false }) => {
  const isAvailable = slot.status === 'AVAILABLE';
  const isOccupied = slot.status === 'OCCUPIED';
  const isReserved = slot.status === 'RESERVED';
  const isMaintenance = slot.status === 'MAINTENANCE' || slot.status === 'DISABLED';

  // Deterministic sensor telemetry values based on slot ID
  const nodeId = `US-${slot.slotNumber}`;
  const rssi = -55 - ((slot.id || 1) % 25);
  const batteryPct = 88 + ((slot.id || 1) % 12);
  const sensorDist = isOccupied 
    ? 32 + ((slot.id || 1) % 18) 
    : 240 + ((slot.id || 1) % 20);

  const getVehicleIcon = () => {
    switch (slot.slotType) {
      case 'BIKE': return <Bike className="w-4 h-4" />;
      case 'EV': return <Zap className="w-4 h-4 text-emerald-500" />;
      case 'BUS': return <Bus className="w-4 h-4 text-amber-500" />;
      default: return <Car className="w-4 h-4" />;
    }
  };

  const getStatusStyles = () => {
    if (isSelected) {
      return 'bg-blue-600 border-blue-500 text-white ring-2 ring-blue-400 shadow-md box-glow';
    }
    if (isAvailable) {
      return 'badge-available hover:border-emerald-500 hover:shadow-xs cursor-pointer box-glow-emerald';
    }
    if (isReserved) {
      return 'badge-reserved opacity-80 cursor-not-allowed';
    }
    if (isOccupied) {
      return 'badge-occupied opacity-75 cursor-not-allowed';
    }
    // Maintenance or Disabled
    return 'badge-neutral opacity-60 cursor-not-allowed';
  };

  const getStatusBadge = () => {
    if (isSelected) {
      return (
        <span className="text-[10px] font-bold text-[var(--accent-text)] flex items-center gap-0.5">
          <Check className="w-3 h-3" /> SELECTED
        </span>
      );
    }
    if (isAvailable) {
      return (
        <span className="text-[10px] font-bold text-[var(--success-text)] flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          AVAILABLE
        </span>
      );
    }
    if (isReserved) {
      return (
        <span className="text-[10px] font-semibold text-[var(--warning-text)] flex items-center gap-0.5">
          <Clock className="w-3 h-3" /> RESERVED
        </span>
      );
    }
    if (isOccupied) {
      return (
        <span className="text-[10px] font-semibold text-[var(--danger-text)] flex items-center gap-0.5">
          <Lock className="w-3 h-3" /> OCCUPIED
        </span>
      );
    }
    return (
      <span className="text-[10px] font-semibold text-[var(--text-muted)] flex items-center gap-0.5">
        <ShieldAlert className="w-3 h-3" /> OFFLINE
      </span>
    );
  };

  return (
    <motion.button
      type="button"
      whileHover={isAvailable ? { scale: 1.02, y: -2 } : {}}
      whileTap={isAvailable ? { scale: 0.98 } : {}}
      disabled={!isAvailable}
      onClick={() => isAvailable && onSelect(slot)}
      className={`relative p-3 rounded-xl border flex flex-col justify-between ${showTelemetry ? 'h-32' : 'h-28'} text-left transition-all duration-150 group ${getStatusStyles()}`}
    >
      {/* Top Header: Bay Number & Type Icon or Node ID */}
      <div className="flex items-center justify-between w-full">
        <div>
          <span className={`font-mono font-bold text-sm tracking-tight block leading-tight ${isSelected ? 'text-[var(--accent-text)]' : 'text-[var(--text-primary)]'}`}>
            {slot.slotNumber}
          </span>
          {showTelemetry && (
            <span className={`font-mono text-[9px] block ${isSelected ? 'text-[var(--accent-text)] opacity-80' : 'text-[var(--text-muted)]'}`}>
              {nodeId}
            </span>
          )}
        </div>

        <div className={`p-1 rounded-md border ${
          isSelected 
            ? 'bg-black/20 text-[var(--accent-text)] border-transparent' 
            : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)]'
        }`}>
          {showTelemetry ? (
            <Radio className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
          ) : (
            getVehicleIcon()
          )}
        </div>
      </div>

      {/* Center Visual Indicator: Standard vs IoT Telemetry */}
      {showTelemetry ? (
        <div className="space-y-0.5 my-auto w-full">
          <div className="flex items-center justify-between text-[10px]">
            <span className={isSelected ? 'text-[var(--accent-text)]' : 'text-[var(--text-muted)]'}>Ultrasonic:</span>
            <span className={`font-mono font-bold ${
              isSelected 
                ? 'text-[var(--accent-text)]' 
                : isOccupied 
                ? 'text-rose-600 dark:text-rose-400' 
                : 'text-emerald-600 dark:text-emerald-400'
            }`}>
              {sensorDist}cm {isOccupied ? '(Sensed)' : '(Clear)'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[9px]">
            <span className={isSelected ? 'text-[var(--accent-text)] opacity-80' : 'text-[var(--text-muted)]'}>
              {rssi}dBm • {batteryPct}% Batt
            </span>
            <span className="flex items-center gap-0.5 text-blue-500">
              <Wifi className="w-2.5 h-2.5" />
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center my-auto">
          <span className={`text-[11px] font-medium uppercase tracking-wider ${isSelected ? 'text-[var(--accent-text)] opacity-90' : 'text-[var(--text-muted)]'}`}>
            Lvl {slot.floorLevel} • {slot.slotType}
          </span>
        </div>
      )}

      {/* Bottom Status Pill */}
      <div className={`flex items-center justify-between w-full pt-1 border-t ${isSelected ? 'border-white/20' : 'border-[var(--border)]'}`}>
        {getStatusBadge()}
      </div>
    </motion.button>
  );
};
