import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { bookingsApi } from '../../api/bookings';
import { vehiclesApi } from '../../api/vehicles';
import { lotsApi } from '../../api/lots';
import { 
  X, 
  Clock, 
  Calendar, 
  Zap, 
  ShieldCheck, 
  PlusCircle,
  CheckCircle2,
  Car,
  Check,
  ArrowRight,
  Receipt,
  AlertCircle
} from 'lucide-react';

export const BookingModal = ({ isOpen, onClose, slot, lot, onSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [bookingMode, setBookingMode] = useState('immediate'); // 'immediate' or 'scheduled'
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [durationHours, setDurationHours] = useState(2);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Initialize start & end time for scheduled mode
  useEffect(() => {
    if (isOpen) {
      setConfirmedBooking(null); // Reset confirmation state
      const now = new Date();
      now.setMinutes(0, 0, 0);
      now.setHours(now.getHours() + 1); // Next hour

      const later = new Date(now);
      later.setHours(later.getHours() + 2); // 2 hours window

      const formatDT = (d) => {
        const offset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - offset).toISOString().slice(0, 16);
      };

      setStartTime(formatDT(now));
      setEndTime(formatDT(later));
    }
  }, [isOpen]);

  // Fetch user's registered vehicles when modal opens
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      vehiclesApi.getMyVehicles()
        .then((res) => {
          const list = res.data || [];
          setVehicles(list);
          const matching = list.find((v) => v.vehicleType === slot?.slotType);
          if (matching) {
            setSelectedVehicleId(matching.id);
          } else if (list.length > 0) {
            setSelectedVehicleId(list[0].id);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [isOpen, isAuthenticated, slot]);

  // Pricing calculation preview (SRM Subsidized Rates: Car ₹20/hr, Bike ₹5-10/hr)
  const estimatedFare = useMemo(() => {
    const hourlyRate = slot?.slotType === 'BIKE' ? 10 : (slot?.slotType === 'EV' ? 25 : 20);
    const baseFare = slot?.slotType === 'BIKE' ? 10 : (slot?.slotType === 'EV' ? 15 : 20);

    let hours = durationHours;
    if (bookingMode === 'scheduled' && startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const diffMs = end - start;
      if (diffMs > 0) {
        hours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
      }
    }
    return baseFare + (hourlyRate * hours);
  }, [bookingMode, durationHours, startTime, endTime, slot]);

  const selectedVehicle = vehicles.find((v) => String(v.id) === String(selectedVehicleId));

  if (!isOpen || !slot) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!selectedVehicleId) {
      error('Please select or register a vehicle first.');
      return;
    }

    setLoading(true);
    try {
      // Re-verify availability from backend before confirming
      const verifyRes = await lotsApi.getSlots(lot.id);
      const freshSlots = verifyRes.data || [];
      const freshSlot = freshSlots.find(s => s.id === slot.id);
      if (!freshSlot || freshSlot.status !== 'AVAILABLE') {
        error(`Bay ${slot.slotNumber} was just taken by another driver. Please pick another slot.`);
        onClose();
        if (onSuccess) onSuccess();
        return;
      }

      const payload = {
        slotId: slot.id,
        vehicleId: Number(selectedVehicleId),
        isImmediate: bookingMode === 'immediate',
      };

      if (bookingMode === 'immediate') {
        payload.durationHours = durationHours;
      } else {
        payload.startTime = startTime;
        payload.endTime = endTime;
      }

      const res = await bookingsApi.create(payload);
      setConfirmedBooking(res.data);
      success(`Slot ${slot.slotNumber} reserved! Reference: ${res.data.bookingReference}`);
      if (onSuccess) onSuccess(res.data);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to complete booking. Slot may have been taken.';
      error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-in fade-in">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg rounded-2xl modal-surface shadow-2xl overflow-hidden border border-[var(--border)]"
      >
        
        {/* Header */}
        <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                {confirmedBooking ? 'Reservation Confirmed' : 'Reserve Campus Bay'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-lg font-bold bg-[var(--surface-secondary)] text-[var(--text-primary)] border border-[var(--border)] font-mono">
                Bay {slot.slotNumber}
              </span>
            </div>
            <h2 className="text-lg font-black text-[var(--text-primary)] mt-0.5">
              {lot?.name || 'SRM Parking Facility'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Confirmed Screen View */}
        {confirmedBooking ? (
          <div className="p-6 space-y-6 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-black text-[var(--text-primary)]">
                Reservation Confirmed!
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Your parking bay is reserved and ready for gate barrier check-in.
              </p>
            </div>

            {/* Ticket Card */}
            <div className="p-4 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-left space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Reference Number</span>
                <span className="font-mono font-bold text-[var(--text-primary)]">{confirmedBooking.bookingReference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Facility & Bay</span>
                <span className="font-bold text-[var(--text-primary)]">{lot?.name} • Bay {slot.slotNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Registered Vehicle</span>
                <span className="font-bold text-[var(--text-primary)]">{selectedVehicle?.licensePlate || 'TN Registered'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)]">Estimated Fare</span>
                <span className="font-bold text-[var(--text-primary)]">₹{confirmedBooking.estimatedFare || estimatedFare}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1 py-2.5 rounded-xl text-xs font-bold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/bookings');
                }}
                className="btn-primary flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <span>View Bookings</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <>
            {/* Mode Selector Tabs: Park Now vs Advanced Booking */}
            <div className="p-5 pb-0">
              <div className="grid grid-cols-2 p-1 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setBookingMode('immediate')}
                  className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                    bookingMode === 'immediate'
                      ? 'bg-[var(--accent)] text-[var(--accent-text)] shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  Park Now (Immediate)
                </button>

                <button
                  type="button"
                  onClick={() => setBookingMode('scheduled')}
                  className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                    bookingMode === 'scheduled'
                      ? 'bg-[var(--accent)] text-[var(--accent-text)] shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Pre-Schedule Slot
                </button>
              </div>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              
              {/* Vehicle Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[var(--text-secondary)]">
                    Select Vehicle ({slot.slotType} Bay)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      navigate('/vehicles');
                    }}
                    className="text-xs text-[var(--text-primary)] hover:underline flex items-center gap-1 font-bold"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Add Vehicle
                  </button>
                </div>

                {vehicles.length > 0 ? (
                  <select
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl app-input text-xs font-semibold"
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.licensePlate} ({v.make || ''} {v.model || ''}) — {v.vehicleType}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3.5 rounded-xl bg-[var(--surface-secondary)] border border-dashed border-[var(--border)] text-center">
                    <p className="text-xs text-[var(--text-muted)]">No registered vehicles found in garage.</p>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        navigate('/vehicles');
                      }}
                      className="mt-1 text-xs font-bold text-[var(--text-primary)] underline"
                    >
                      Register vehicle now
                    </button>
                  </div>
                )}
              </div>

              {/* Mode-Specific Time Selectors */}
              {bookingMode === 'immediate' ? (
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1.5">
                    Estimated Parking Duration
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 4, 8].map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setDurationHours(h)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          durationHours === h
                            ? 'bg-[var(--accent)] text-[var(--accent-text)] border-[var(--accent)] shadow-xs'
                            : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)]'
                        }`}
                      >
                        {h} {h === 1 ? 'Hour' : 'Hours'}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                      Start Time
                    </label>
                    <input
                      type="datetime-local"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                      className="w-full px-2.5 py-2 rounded-xl app-input text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                      End Time
                    </label>
                    <input
                      type="datetime-local"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                      className="w-full px-2.5 py-2 rounded-xl app-input text-xs font-medium"
                    />
                  </div>
                </div>
              )}

              {/* Clear Booking Summary Review */}
              <div className="p-3.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] space-y-1.5">
                <div className="flex justify-between text-xs text-[var(--text-muted)]">
                  <span>Selected Bay</span>
                  <span className="font-bold text-[var(--text-primary)]">{slot.slotNumber} (Floor {slot.floorLevel})</span>
                </div>
                <div className="flex justify-between text-xs text-[var(--text-muted)]">
                  <span>Campus Rate</span>
                  <span className="font-medium text-[var(--text-primary)]">SRM Subsidized Tariff</span>
                </div>
                <div className="pt-2 border-t border-[var(--border)] flex justify-between items-baseline">
                  <span className="text-xs font-bold text-[var(--text-primary)]">Estimated Total</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-[var(--text-primary)]">₹{estimatedFare}</span>
                    <span className="text-[11px] text-[var(--text-muted)]">(Incl. base fare)</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading || vehicles.length === 0}
                className="btn-primary w-full py-3 rounded-xl font-bold text-sm shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-[var(--accent-text)]/20 border-t-[var(--accent-text)] rounded-full animate-spin" />
                    Verifying & Reserving Bay...
                  </span>
                ) : (
                  <span>Confirm Campus Reservation</span>
                )}
              </motion.button>

            </form>
          </>
        )}

      </motion.div>
    </div>
  );
};
