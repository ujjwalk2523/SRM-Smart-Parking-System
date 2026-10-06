import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { bookingsApi } from '../api/bookings';
import { sessionsApi } from '../api/sessions';
import { vehiclesApi } from '../api/vehicles';
import { lotsApi } from '../api/lots';
import { 
  Car, 
  MapPin, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Plus, 
  RefreshCw,
  Search,
  Zap,
  GraduationCap,
  Radio,
  Cpu,
  Wifi
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '../utils/formatters';

export const Dashboard = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [activeSession, setActiveSession] = useState(null);
  const [activeBooking, setActiveBooking] = useState(null);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [popularLots, setPopularLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startingSessionId, setStartingSessionId] = useState(null);

  // Search & Filter state for history
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [
        sessionRes,
        activeBookingRes,
        upcomingRes,
        pastRes,
        vehiclesRes,
        lotsRes
      ] = await Promise.allSettled([
        sessionsApi.getActive(),
        bookingsApi.getActive(),
        bookingsApi.getUpcoming(),
        bookingsApi.getPast(),
        vehiclesApi.getAll(),
        lotsApi.getAll({ onlyActive: true })
      ]);

      if (sessionRes.status === 'fulfilled' && sessionRes.value.data) {
        setActiveSession(sessionRes.value.data);
      } else {
        setActiveSession(null);
      }

      if (activeBookingRes.status === 'fulfilled' && activeBookingRes.value.data) {
        setActiveBooking(activeBookingRes.value.data);
      } else {
        setActiveBooking(null);
      }

      if (upcomingRes.status === 'fulfilled' && upcomingRes.value.data) {
        setUpcomingBookings(upcomingRes.value.data);
      }

      if (pastRes.status === 'fulfilled' && pastRes.value.data) {
        setPastBookings(pastRes.value.data);
      }

      if (vehiclesRes.status === 'fulfilled' && vehiclesRes.value.data) {
        setVehicles(vehiclesRes.value.data);
      }

      if (lotsRes.status === 'fulfilled' && lotsRes.value.data) {
        setPopularLots(lotsRes.value.data.slice(0, 3));
      }
    } catch (err) {
      console.error(err);
      toastError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleStartSession = async (bookingId) => {
    setStartingSessionId(bookingId);
    try {
      await sessionsApi.startSession(bookingId);
      success('Vehicle checked in! Parking session started.');
      await loadDashboardData();
    } catch (err) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to start parking session.');
    } finally {
      setStartingSessionId(null);
    }
  };

  const filteredHistory = pastBookings.filter((b) => {
    const matchesSearch = 
      (b.bookingReference && b.bookingReference.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.lotName && b.lotName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.slotNumber && b.slotNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.licensePlate && b.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[var(--surface-secondary)] text-[var(--text-secondary)] border border-[var(--border)]">
              {user?.roleName === 'ROLE_ADMIN' ? 'SRM Administrator' : 'SRM KTR Campus Driver'}
            </span>
            <span className="text-xs text-[var(--text-muted)]">User ID #{user?.id}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            Welcome back, <span>{user?.fullName || 'Campus Driver'}</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Kattankulathur campus parking monitor, active bay telemetry, and digital barrier pass.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadDashboardData}
            className="btn-secondary flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
            <span>Sync Live</span>
          </button>
          <Link
            to="/explore"
            className="btn-primary flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Book Campus Bay</span>
          </Link>
        </div>
      </motion.div>

      {/* KPI Overview Cards with Box Glow */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Parking', value: activeSession ? '1 Bay Occupied' : 'None Active', icon: Zap, color: activeSession ? 'text-emerald-500' : 'text-[var(--text-muted)]', glow: activeSession ? 'box-glow-emerald' : 'box-glow' },
          { label: 'Upcoming Bookings', value: upcomingBookings.length, icon: Calendar, color: 'text-blue-500', glow: 'box-glow' },
          { label: 'Registered Vehicles', value: vehicles.length, icon: Car, color: 'text-indigo-500', glow: 'box-glow' },
          { label: 'Completed Visits', value: pastBookings.length, icon: CheckCircle2, color: 'text-emerald-500', glow: 'box-glow-emerald' },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={idx}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className={`p-4 rounded-xl card-surface card-surface-hover border border-[var(--border)] shadow-xs flex flex-col justify-between ${kpi.glow}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[var(--text-muted)]">{kpi.label}</span>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <div className="text-xl font-bold text-[var(--text-primary)]">{kpi.value}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Real-time In-Progress Banner (Active Session or Immediate Confirmed Booking) */}
      {activeSession ? (
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Zap className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-600 text-white flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    LIVE CAMPUS PARKING SESSION
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  Bay {activeSession.slotNumber || 'Bay'} • {activeSession.lotName || 'Parking Facility'}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1 flex flex-wrap items-center gap-2">
                  <span>Entry: {formatDateTime(activeSession.checkInTime)}</span>
                  <span>•</span>
                  <span>Vehicle: <strong>{activeSession.licensePlate}</strong></span>
                  <span>•</span>
                  <span>Code: <code className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{activeSession.sessionCode}</code></span>
                </p>
              </div>
            </div>

            <Link
              to="/active-session"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition shrink-0"
            >
              <span>Manage Session & Exit</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : activeBooking ? (
        <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/30 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-600 text-white">
                    RESERVATION READY FOR ENTRY
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  Slot {activeBooking.slotNumber} • {activeBooking.lotName}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1 flex flex-wrap items-center gap-2">
                  <span>Start: {formatDateTime(activeBooking.startTime)}</span>
                  <span>•</span>
                  <span>Vehicle: <strong>{activeBooking.licensePlate}</strong></span>
                  <span>•</span>
                  <span>Ref: <code className="font-mono text-blue-600 dark:text-blue-400 font-bold">{activeBooking.bookingReference}</code></span>
                </p>
              </div>
            </div>

            <button
              onClick={() => handleStartSession(activeBooking.id)}
              disabled={startingSessionId === activeBooking.id}
              className="btn-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              {startingSessionId === activeBooking.id ? (
                <div className="w-4 h-4 border-2 border-[var(--accent-text)]/20 border-t-[var(--accent-text)] rounded-full animate-spin" />
              ) : (
                <>
                  <span>Campus Gate Check-In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      ) : null}

      {/* Quick Action Hub with Box Glow */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { title: 'Campus Lots', desc: 'Browse SRM KTR parking', link: '/explore', icon: MapPin, color: 'text-blue-500' },
          { title: 'My Garage', desc: `${vehicles.length} vehicles registered`, link: '/vehicles', icon: Car, color: 'text-indigo-500' },
          { title: 'Gate Pass', desc: 'Active entry/exit session', link: '/active-session', icon: Zap, color: 'text-emerald-500' },
          { title: 'My Profile', desc: 'Driver profile & preferences', link: '/profile', icon: ShieldCheck, color: 'text-purple-500' },
        ].map((action, i) => {
          const Icon = action.icon;
          return (
            <Link
              key={i}
              to={action.link}
              className="card-surface card-surface-hover p-4 rounded-xl flex flex-col justify-between border border-[var(--border)] box-glow"
            >
              <div className="w-9 h-9 rounded-lg bg-[var(--surface-secondary)] flex items-center justify-center mb-3">
                <Icon className={`w-4 h-4 ${action.color}`} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">
                  {action.title}
                </h4>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{action.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Campus IoT Gateway & Telemetry Status Card with Box Glow */}
      <div className="p-4 sm:p-5 rounded-2xl card-surface border border-[var(--border)] space-y-3 box-glow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-500 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              SRM Campus IoT Telemetry Network
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Gateway Live
            </span>
          </div>
          <span className="text-[11px] text-[var(--text-muted)] font-mono">
            LoRaWAN 868MHz • 240 Bay Sensors Online
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
          <div className="p-3 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)]">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">Gateway Node</span>
            <span className="font-bold text-[var(--text-primary)]">Tech Park Central</span>
          </div>
          <div className="p-3 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)]">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">Sensor Latency</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">38ms Avg</span>
          </div>
          <div className="p-3 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)]">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">Boom Barriers</span>
            <span className="font-bold text-[var(--text-primary)]">6 / 6 Operational</span>
          </div>
          <div className="p-3 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)]">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">ANPR OCR Accuracy</span>
            <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">99.4% Verified</span>
          </div>
        </div>
      </div>

      {/* Upcoming Reservations */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>Upcoming Reservations</span>
          </h2>
          <span className="text-xs text-[var(--text-muted)] font-semibold">
            {upcomingBookings.length} scheduled
          </span>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className="p-6 rounded-xl card-surface border border-[var(--border)] text-center text-[var(--text-muted)] text-xs">
            No upcoming bookings scheduled. Explore campus lots to reserve ahead of class or duties.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingBookings.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-xl card-surface border border-[var(--border)] space-y-2.5 box-glow"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    Slot {b.slotNumber}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded badge-available">
                    {b.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">{b.lotName}</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span>{formatDateTime(b.startTime)} — {formatDateTime(b.endTime)}</span>
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] text-xs">
                  <span className="text-[var(--text-muted)] font-mono">{b.licensePlate}</span>
                  <span className="font-bold text-[var(--text-primary)]">{formatCurrency(b.estimatedFare)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Parking History with Filter & Search */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>Campus Parking History</span>
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reference or lot..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl app-input text-xs"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl app-input text-xs font-semibold"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="p-6 rounded-xl card-surface border border-[var(--border)] text-center text-[var(--text-muted)] text-xs">
            No past bookings match the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto app-table-container box-glow">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Lot & Bay</th>
                  <th>Vehicle</th>
                  <th>Date</th>
                  <th>Fare</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item) => (
                  <tr key={item.id}>
                    <td className="font-mono text-blue-600 dark:text-blue-400 font-semibold">
                      {item.bookingReference}
                    </td>
                    <td>
                      <div className="font-semibold text-[var(--text-primary)]">{item.lotName}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">Bay {item.slotNumber}</div>
                    </td>
                    <td className="font-mono text-[var(--text-secondary)]">
                      {item.licensePlate}
                    </td>
                    <td className="text-[var(--text-muted)]">
                      {formatDateTime(item.startTime)}
                    </td>
                    <td className="font-bold text-[var(--text-primary)]">
                      {formatCurrency(item.actualFare || item.estimatedFare)}
                    </td>
                    <td>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        item.status === 'COMPLETED'
                          ? 'badge-available'
                          : item.status === 'CANCELLED'
                          ? 'badge-occupied'
                          : 'badge-neutral'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
