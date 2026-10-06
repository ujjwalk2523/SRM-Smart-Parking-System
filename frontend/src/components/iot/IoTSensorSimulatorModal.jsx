import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { adminApi } from '../../api/admin';
import { 
  X, 
  Cpu, 
  Radio, 
  Wifi, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Car, 
  LogOut, 
  Wrench,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export const IoTSensorSimulatorModal = ({ isOpen, onClose, slots = [], onSlotUpdated }) => {
  const { isAdmin } = useAuth();
  const { success, error, info } = useToast();

  const [selectedSlotId, setSelectedSlotId] = useState(slots[0]?.id || '');
  const [targetStatus, setTargetStatus] = useState('OCCUPIED');
  const [transmitting, setTransmitting] = useState(false);

  if (!isOpen) return null;

  const currentSlot = slots.find((s) => String(s.id) === String(selectedSlotId)) || slots[0];

  const simulatedDistance = targetStatus === 'OCCUPIED' ? 38.4 : targetStatus === 'AVAILABLE' ? 245.0 : 0.0;
  const simulatedRssi = -64;
  const simulatedBattery = 96;

  const telemetryPacket = {
    gateway: 'SRM-KTR-LORAWAN-GW01',
    nodeId: currentSlot ? `US-${currentSlot.slotNumber}` : 'US-NODE-01',
    frequency: '868.1 MHz',
    sensorModel: 'HC-SR04_GEOMAG_DUAL_V2',
    targetBay: currentSlot?.slotNumber || 'A-101',
    reportedStatus: targetStatus,
    ultrasonicDistanceCm: simulatedDistance,
    geomagneticReading: targetStatus === 'OCCUPIED' ? 'ANOMALY_CONFIRMED' : 'NORMAL_FIELD',
    rssi: `${simulatedRssi} dBm`,
    snr: '9.2 dB',
    batteryPct: `${simulatedBattery}%`,
    timestamp: new Date().toISOString(),
  };

  const handleTransmitTelemetry = async () => {
    if (!currentSlot) return;

    setTransmitting(true);
    try {
      if (isAdmin) {
        // Real backend database update via Admin slot status API
        await adminApi.updateSlotStatus(currentSlot.id, targetStatus);
        success(`Sensor pulse acknowledged! Bay ${currentSlot.slotNumber} set to ${targetStatus}`);
      } else {
        // Demo simulation feedback for student / non-admin role
        info(`Telemetry broadcast simulated for Bay ${currentSlot.slotNumber} (${targetStatus}). Log in as Admin for live database commit.`);
      }

      if (onSlotUpdated) {
        onSlotUpdated(currentSlot.id, targetStatus);
      }
      onClose();
    } catch (err) {
      error(err.response?.data?.message || err.message || 'Failed to transmit sensor pulse to gateway.');
    } finally {
      setTransmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-in fade-in">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-xl rounded-2xl modal-surface border border-[var(--border)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-[var(--border)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-[var(--text-primary)]">
                  IoT Bay Sensor Telemetry Simulator
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  LoRaWAN 868MHz
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                Emulate ultrasonic hardware pulses from physical parking bay nodes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          
          {/* Target Slot Selection */}
          <div>
            <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1.5">
              Select Target Parking Bay Node
            </label>
            <select
              value={selectedSlotId}
              onChange={(e) => setSelectedSlotId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl app-input text-xs font-semibold"
            >
              {slots.map((s) => (
                <option key={s.id} value={s.id}>
                  Bay {s.slotNumber} (Floor {s.floorLevel} • {s.slotType}) — Currently: {s.status}
                </option>
              ))}
            </select>
          </div>

          {/* Action Simulation Buttons */}
          <div>
            <label className="text-xs font-bold text-[var(--text-secondary)] block mb-1.5">
              Simulate Physical Hardware Event
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { 
                  id: 'OCCUPIED', 
                  label: 'Car Arrives (< 50cm)', 
                  desc: 'Ultrasonic detected vehicle in bay',
                  icon: Car, 
                  color: 'hover:border-rose-500' 
                },
                { 
                  id: 'AVAILABLE', 
                  label: 'Car Leaves (> 200cm)', 
                  desc: 'Ultrasonic beam cleared to ground',
                  icon: LogOut, 
                  color: 'hover:border-emerald-500' 
                },
                { 
                  id: 'RESERVED', 
                  label: 'Lock Engaged', 
                  desc: 'Driver booked slot / barrier raised',
                  icon: ShieldCheck, 
                  color: 'hover:border-amber-500' 
                },
                { 
                  id: 'MAINTENANCE', 
                  label: 'Sensor Fault (0x0F)', 
                  desc: 'Diagnostic or maintenance mode',
                  icon: Wrench, 
                  color: 'hover:border-orange-500' 
                },
              ].map((ev) => {
                const Icon = ev.icon;
                const isSelected = targetStatus === ev.id;
                return (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => setTargetStatus(ev.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--surface-secondary)] border-[var(--border-focus)] ring-2 ring-blue-500/50 shadow-sm'
                        : 'card-surface border-[var(--border)] hover:bg-[var(--surface-secondary)]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4 text-blue-500" />
                      <span className="font-bold text-[var(--text-primary)]">{ev.label}</span>
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)]">{ev.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Raw LoRa Telemetry Packet Payload Display */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-[var(--text-secondary)] flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-blue-500" />
                Raw LoRaWAN Sensor Payload Telemetry
              </span>
              <span className="text-[10px] text-[var(--text-muted)] font-mono">
                Port: 8 • FPort: 1
              </span>
            </div>

            <pre className="p-3 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-[11px] font-mono text-[var(--text-primary)] overflow-x-auto leading-relaxed">
              {JSON.stringify(telemetryPacket, null, 2)}
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border)] flex items-center justify-between gap-3 bg-[var(--surface-secondary)] shrink-0">
          <div className="text-[11px] text-[var(--text-muted)]">
            {isAdmin ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Admin Mode: Commits directly to backend
              </span>
            ) : (
              <span>Tip: Admin demo button on Login enables real database writes.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary px-4 py-2 rounded-xl font-semibold cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={transmitting}
              onClick={handleTransmitTelemetry}
              className="btn-primary px-5 py-2 rounded-xl font-bold flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              {transmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Broadcasting Pulse...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit Sensor Pulse</span>
                </>
              )}
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
};
