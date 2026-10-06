import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { bookingsApi } from '../api/bookings';
import { sessionsApi } from '../api/sessions';
import { useToast } from '../context/ToastContext';
import { 
  CalendarCheck, 
  Clock, 
  MapPin, 
  Car, 
  AlertCircle, 
  XCircle, 
  LogIn, 
  CheckCircle2, 
  Calendar,
  ArrowRight
} from 'lucide-react';

export const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'ACTIVE', 'PAST'
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [checkingInId, setCheckingInId] = useState(null);

  const { success, error } = useToast();
  const navigate = useNavigate();

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingsApi.getMy();
      setBookings(res.data || []);
    } catch (err) {
      console.error(err);
      error('Failed to load your reservations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation? The slot will be released.')) {
      return;
    }

    setCancellingId(bookingId);
    try {
      await bookingsApi.cancel(bookingId, 'Cancelled by user via dashboard');
      success('Booking cancelled successfully. Bay released to grid.');
      loadBookings();
    } catch (err) {
      error(err.message || 'Failed to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  const handleCheckIn = async (booking) => {
    setCheckingInId(booking.id);
    try {
      await sessionsApi.checkIn({
        bookingReference: booking.bookingReference,
        entryGate: 'Gate-1',
      });
      success(`Checked in at Bay ${booking.slotNumber}!`);
      navigate('/active-session');
    } catch (err) {
      error(err.message || 'Check-in failed. Please verify with gate attendant.');
    } finally {
      setCheckingInId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'ACTIVE') return b.status === 'CONFIRMED' || b.status === 'ACTIVE';
    if (filter === 'PAST') return b.status === 'COMPLETED' || b.status === 'CANCELLED' || b.status === 'EXPIRED';
    return true;
  });

  const formatDateTime = (dt) => {
    if (!dt) return 'N/A';
    return new Date(dt).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1 animate-pulse"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ACTIVE NOW</span>;
      case 'CONFIRMED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold badge-available">CONFIRMED</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold badge-neutral">COMPLETED</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold badge-occupied">CANCELLED</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold badge-neutral">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[var(--border)]">
        <div>
          <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest block mb-1">
            Reservation History
          </span>
          <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">
            My Parking Bookings
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Track current and scheduled reservations, initiate barrier check-in, or review past receipts.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 p-1 bg-[var(--surface-secondary)] rounded-xl border border-[var(--border)] shadow-xs">
          {[
            { label: 'All Bookings', value: 'ALL' },
            { label: 'Upcoming / Active', value: 'ACTIVE' },
            { label: 'Completed / Past', value: 'PAST' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === tab.value
                  ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-xs border border-[var(--border)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)]" />
          ))}
        </div>
      ) : filteredBookings.length > 0 ? (
        <div className="space-y-4">
          {filteredBookings.map((b, idx) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.03 }}
              className="card-surface p-5 sm:p-6 rounded-2xl border border-[var(--border)] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              {/* Left Column: Lot & Slot */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[var(--text-primary)] bg-[var(--surface-secondary)] px-2 py-0.5 rounded-md border border-[var(--border)]">
                    {b.bookingReference}
                  </span>
                  {getStatusBadge(b.status)}
                </div>

                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {b.lotName} — Bay <span className="font-mono">{b.slotNumber}</span>
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)]">
                  <span className="flex items-center gap-1">
                    <Car className="w-3.5 h-3.5" /> {b.licensePlate} ({b.vehicleType})
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDateTime(b.startTime)} → {formatDateTime(b.endTime)}
                  </span>
                </div>
              </div>

              {/* Right Column: Fare & Actions */}
              <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start sm:items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-[var(--border)]">
                <div className="text-left md:text-right">
                  <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">
                    {b.status === 'COMPLETED' ? 'Settled Fare' : 'Estimated Tariff'}
                  </span>
                  <span className="text-lg font-black text-[var(--text-primary)]">
                    ₹{b.actualFare != null ? b.actualFare : b.estimatedFare}
                  </span>
                </div>

                {/* Contextual Action Buttons */}
                <div className="flex items-center gap-2">
                  {b.status === 'CONFIRMED' && (
                    <>
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleCheckIn(b)}
                        disabled={checkingInId === b.id}
                        className="btn-primary px-4 py-2 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>{checkingInId === b.id ? 'Checking In...' : 'Check In'}</span>
                      </motion.button>

                      <button
                        onClick={() => handleCancel(b.id)}
                        disabled={cancellingId === b.id}
                        className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                      >
                        {cancellingId === b.id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    </>
                  )}

                  {b.status === 'ACTIVE' && (
                    <Link
                      to="/active-session"
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex items-center gap-1.5 transition-all"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Live Session</span>
                    </Link>
                  )}
                </div>
              </div>

            </motion.div>
          ))}
        </div>
      ) : (
        <div className="p-16 text-center rounded-2xl card-surface border border-dashed border-[var(--border)] space-y-3">
          <CalendarCheck className="w-10 h-10 text-[var(--text-muted)] mx-auto" />
          <h3 className="text-base font-bold text-[var(--text-primary)]">No reservations found</h3>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
            You don't have any reservations under the "{filter.toLowerCase()}" filter.
          </p>
          <Link
            to="/explore"
            className="btn-primary inline-block mt-2 px-5 py-2.5 rounded-xl text-xs font-bold"
          >
            Find a Parking Bay
          </Link>
        </div>
      )}

    </div>
  );
};
