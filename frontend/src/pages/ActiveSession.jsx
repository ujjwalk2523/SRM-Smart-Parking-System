import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { sessionsApi } from '../api/sessions';
import { useToast } from '../context/ToastContext';
import { ReceiptModal } from '../components/booking/ReceiptModal';
import { Clock, LogOut, CheckCircle2, ShieldCheck, ArrowRight, Zap, AlertCircle } from 'lucide-react';

export const ActiveSession = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [receiptSession, setReceiptSession] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  const { success, error } = useToast();

  const loadActiveSession = async () => {
    setLoading(true);
    try {
      const res = await sessionsApi.getActive();
      setSession(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveSession();
  }, []);

  // Live seconds ticker
  useEffect(() => {
    if (!session || !session.checkInTime) return;

    const checkInMs = new Date(session.checkInTime).getTime();
    const updateElapsed = () => {
      const nowMs = Date.now();
      const diff = Math.max(0, Math.floor((nowMs - checkInMs) / 1000));
      setElapsedSeconds(diff);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [session]);

  const formatElapsed = (totalSecs) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCheckOut = async () => {
    if (!session) return;

    setCheckingOut(true);
    try {
      const res = await sessionsApi.checkOut(session.id, {
        exitGate: 'Exit-Main',
        paymentMethod,
      });
      success('Vehicle checked out! Bay released to grid.');
      setReceiptSession(res.data);
      setReceiptModalOpen(true);
      setSession(null); // Clear active session
    } catch (err) {
      error(err.message || 'Checkout failed. Please notify parking attendant.');
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-8 h-8 border-3 border-[var(--text-primary)] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[var(--text-muted)] font-semibold tracking-wider uppercase">
          Inspecting Live Bay Session...
        </p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--text-muted)] flex items-center justify-center mx-auto shadow-sm">
          <Clock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-[var(--text-primary)]">No Active Parking Session</h2>
        <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto">
          You do not currently have a vehicle parked in any bay. Check in from your reservations or book a new bay.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            to="/bookings"
            className="btn-secondary px-5 py-2.5 rounded-xl text-xs font-bold"
          >
            My Reservations
          </Link>
          <Link
            to="/explore"
            className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold"
          >
            Find Parking
          </Link>
        </div>

        {/* Receipt Modal for recently checked-out session */}
        <ReceiptModal
          isOpen={receiptModalOpen}
          onClose={() => setReceiptModalOpen(false)}
          session={receiptSession}
        />
      </div>
    );
  }

  // Live estimated tariff preview
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const baseRate = session.vehicleType === 'BIKE' ? 10 : 20;
  const hourlyRate = session.vehicleType === 'BIKE' ? 10 : 20;
  const billableHours = Math.max(1, Math.ceil(elapsedMinutes / 60));
  const liveEstimatedFare = elapsedMinutes <= 15 ? 0 : baseRate + (hourlyRate * billableHours);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
        <div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Live Physical Parking Session
          </span>
          <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">
            Bay {session.slotNumber} Occupied
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {session.lotName} • Session Code: <span className="font-mono text-[var(--text-primary)] font-semibold">{session.sessionCode}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] font-mono">
            {session.licensePlate} ({session.vehicleType})
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Timer & Details */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Big Live Elapsed Timer Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] text-center space-y-4 shadow-xl relative overflow-hidden"
          >
            <span className="text-xs uppercase font-extrabold tracking-widest text-[var(--text-muted)]">
              Elapsed Duration
            </span>

            <div className="font-mono text-5xl sm:text-6xl font-black text-[var(--text-primary)] tracking-wider">
              {formatElapsed(elapsedSeconds)}
            </div>

            <div className="flex justify-center items-center gap-4 text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border)]">
              <span>Checked in: {new Date(session.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span>•</span>
              <span>Gate: {session.entryGate || 'Gate-1'}</span>
            </div>
          </motion.div>

          {/* Running Fare Card */}
          <div className="card-surface p-6 rounded-2xl border border-[var(--border)] space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                Current Accrued Fare
              </span>
              <span className="text-2xl font-black text-[var(--text-primary)]">
                ₹{liveEstimatedFare}
              </span>
            </div>

            <div className="text-xs text-[var(--text-muted)] space-y-1 pt-2 border-t border-[var(--border)]">
              <p>• 15-minute free campus drop-off grace period active.</p>
              <p>• Current billable hours: {billableHours} hour(s) at ₹{hourlyRate}/hr (+₹{baseRate} base fare).</p>
            </div>
          </div>

          {/* IoT Gate Barrier & Telemetry Station */}
          <div className="card-surface p-6 rounded-2xl border border-[var(--border)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-xs uppercase font-extrabold tracking-wider text-[var(--text-primary)]">
                  Gate Barrier IoT & ANPR Telemetry
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--surface-secondary)] text-[var(--text-secondary)] border border-[var(--border)]">
                Node: GATE-SRM-01
              </span>
            </div>

            {/* Visual Boom Barrier Diagram */}
            <div className="p-4 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Barrier Arm Graphic */}
                <div className="relative w-16 h-12 flex items-end">
                  <div className="w-3 h-8 bg-slate-700 rounded-t-sm" />
                  <motion.div 
                    animate={checkingOut ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="h-2 w-14 bg-amber-500 rounded-sm origin-bottom-left shadow-xs border border-amber-600 -ml-1"
                  />
                  <div className={`absolute top-0 right-0 w-2.5 h-2.5 rounded-full ${checkingOut ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}`} />
                </div>

                <div>
                  <div className="text-xs font-bold text-[var(--text-primary)]">
                    {checkingOut ? 'Barrier Raised • Exit Open' : 'Barrier Armed • Secured'}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">
                    {checkingOut ? 'Motor cycle 90° complete • Loop #2 active' : 'Ground inductive coil sensing vehicle in bay'}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${
                  checkingOut 
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                    : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                }`}>
                  {checkingOut ? 'CLEAR TO EXIT' : 'ACTIVE MONITOR'}
                </span>
              </div>
            </div>

            {/* Telemetry Sensor Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px]">
              <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] space-y-0.5">
                <span className="text-[10px] text-[var(--text-muted)] block">ANPR Recognition</span>
                <span className="font-bold text-[var(--text-primary)] font-mono">{session.licensePlate}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] space-y-0.5">
                <span className="text-[10px] text-[var(--text-muted)] block">Bay Ultrasonic Sensor</span>
                <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">38cm (Locked)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] space-y-0.5 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-[var(--text-muted)] block">FASTag / RFID Transceiver</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">865MHz Sync</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Col: Exit Gate Checkout & Settlement */}
        <div className="card-surface p-6 rounded-2xl border border-[var(--border)] space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Exit Barrier Checkout
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Ready to leave? Select payment method and proceed to release the parking bay to the campus grid.
            </p>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">
                Payment Method
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'UPI', label: 'UPI / QR' },
                  { id: 'CREDIT_CARD', label: 'Card' },
                  { id: 'WALLET', label: 'Wallet' },
                  { id: 'CASH', label: 'Cash Exit' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-left cursor-pointer ${
                      paymentMethod === m.id
                        ? 'bg-[var(--accent)] text-[var(--accent-text)] border-[var(--accent)] shadow-xs'
                        : 'bg-[var(--surface-secondary)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-secondary)]'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCheckOut}
            disabled={checkingOut}
            className="btn-primary w-full py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {checkingOut ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-[var(--accent-text)]/20 border-t-[var(--accent-text)] rounded-full animate-spin" />
                Settling Fare...
              </span>
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                <span>Complete Checkout & Exit</span>
              </>
            )}
          </motion.button>
        </div>

      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        session={receiptSession}
      />

    </div>
  );
};
