import React, { useState, useEffect, useMemo } from 'react';
import { adminApi } from '../api/admin';
import { useToast } from '../context/ToastContext';
import { 
  ShieldCheck, 
  Users, 
  FileText, 
  TrendingUp, 
  Car, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  RefreshCw,
  Plus,
  Layers,
  DollarSign,
  Wrench,
  X,
  Search,
  Filter,
  Check,
  AlertTriangle
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '../utils/formatters';

export const AdminDashboard = () => {
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState('overview'); 
  // 'overview', 'users', 'locations', 'lots', 'slots', 'bookings', 'pricing', 'logs'

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [lots, setLots] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedLotId, setSelectedLotId] = useState('');
  const [bookings, setBookings] = useState([]);
  const [pricingRules, setPricingRules] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  // Search states for tables
  const [userSearch, setUserSearch] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('ALL');
  const [logSearch, setLogSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal States
  const [modalType, setModalType] = useState(null); 
  const [modalData, setModalData] = useState({});

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const [statsRes, usersRes, locRes, lotsRes, bookingsRes, logsRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getUsers({ limit: 100 }),
        adminApi.getLocations(),
        adminApi.getLots(),
        adminApi.getBookings({ limit: 100 }),
        adminApi.getAuditLogs({ limit: 100 }),
      ]);

      setStats(statsRes.data || null);
      setUsers(usersRes.data?.users || []);
      setLocations(locRes.data || []);
      const loadedLots = lotsRes.data || [];
      setLots(loadedLots);
      setBookings(bookingsRes.data || []);
      setAuditLogs(logsRes.data?.logs || []);

      if (loadedLots.length > 0 && !selectedLotId) {
        setSelectedLotId(loadedLots[0].id.toString());
      }
    } catch (err) {
      console.error(err);
      toastError('Failed to load administrative data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fetch slots & pricing rules whenever selected lot changes
  useEffect(() => {
    if (selectedLotId) {
      const fetchLotDetails = async () => {
        try {
          const [slotsRes, pricingRes] = await Promise.all([
            adminApi.getSlots(selectedLotId),
            adminApi.getPricing(selectedLotId),
          ]);
          setSlots(slotsRes.data || []);
          setPricingRules(pricingRes.data || []);
        } catch (err) {
          console.error(err);
        }
      };
      fetchLotDetails();
    }
  }, [selectedLotId]);

  // Handlers for Slot Status Toggle
  const handleToggleSlotStatus = async (slotId, currentStatus) => {
    let nextStatus = 'AVAILABLE';
    if (currentStatus === 'AVAILABLE') nextStatus = 'MAINTENANCE';
    else if (currentStatus === 'MAINTENANCE') nextStatus = 'DISABLED';
    else if (currentStatus === 'DISABLED') nextStatus = 'AVAILABLE';

    try {
      await adminApi.updateSlotStatus(slotId, nextStatus);
      success(`Slot status updated to ${nextStatus}`);
      const res = await adminApi.getSlots(selectedLotId);
      setSlots(res.data || []);
      const statsRes = await adminApi.getStats();
      setStats(statsRes.data || null);
    } catch (err) {
      console.error(err);
      toastError('Failed to update slot status.');
    }
  };

  // Handlers for Location Creation
  const handleCreateLocation = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createLocation(modalData);
      success('Location added successfully!');
      setModalType(null);
      setModalData({});
      await loadData(true);
    } catch (err) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to create location.');
    }
  };

  // Handlers for Lot Creation
  const handleCreateLot = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createLot({
        ...modalData,
        locationId: Number(modalData.locationId),
        totalCapacity: Number(modalData.totalCapacity || 20),
        totalFloors: Number(modalData.totalFloors || 1),
      });
      success('Parking lot added successfully!');
      setModalType(null);
      setModalData({});
      await loadData(true);
    } catch (err) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to create parking lot.');
    }
  };

  // Handlers for Slot Creation
  const handleCreateSlot = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createSlot({
        lotId: Number(selectedLotId),
        slotNumber: modalData.slotNumber,
        slotType: modalData.slotType || 'CAR',
        floorLevel: Number(modalData.floorLevel || 1),
        status: 'AVAILABLE',
      });
      success('Parking slot added successfully!');
      setModalType(null);
      setModalData({});
      const res = await adminApi.getSlots(selectedLotId);
      setSlots(res.data || []);
      const statsRes = await adminApi.getStats();
      setStats(statsRes.data || null);
    } catch (err) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to create slot.');
    }
  };

  // Handlers for Admin Cancellation of Booking
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking and free the slot?')) return;
    try {
      await adminApi.cancelBooking(bookingId, 'Admin administrative override');
      success('Booking cancelled and slot released.');
      await loadData(true);
    } catch (err) {
      console.error(err);
      toastError('Failed to cancel booking.');
    }
  };

  // Handlers for Pricing Rule Creation
  const handleCreatePricingRule = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createPricing({
        lotId: Number(selectedLotId),
        vehicleType: modalData.vehicleType || 'CAR',
        baseFare: Number(modalData.baseFare || 30),
        hourlyRate: Number(modalData.hourlyRate || 40),
        minHours: Number(modalData.minHours || 1),
        gracePeriodMins: Number(modalData.gracePeriodMins || 15),
        overstayPenaltyRate: Number(modalData.overstayPenaltyRate || 60),
      });
      success('Pricing rule registered successfully!');
      setModalType(null);
      setModalData({});
      const res = await adminApi.getPricing(selectedLotId);
      setPricingRules(res.data || []);
    } catch (err) {
      console.error(err);
      toastError(err.response?.data?.message || 'Failed to register pricing rule.');
    }
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.fullName?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phoneNumber?.toLowerCase().includes(userSearch.toLowerCase()) ||
      String(u.id).includes(userSearch)
    );
  }, [users, userSearch]);

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchSearch = 
        b.bookingReference?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        b.licensePlate?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        String(b.userId).includes(bookingSearch) ||
        String(b.slotNumber).includes(bookingSearch);

      const matchStatus = bookingStatusFilter === 'ALL' || b.status === bookingStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [bookings, bookingSearch, bookingStatusFilter]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter(l => 
      l.action?.toLowerCase().includes(logSearch.toLowerCase()) ||
      l.entityType?.toLowerCase().includes(logSearch.toLowerCase()) ||
      String(l.userId).includes(logSearch) ||
      (l.newValue && l.newValue.toLowerCase().includes(logSearch.toLowerCase()))
    );
  }, [auditLogs, logSearch]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[var(--text-muted)] font-semibold tracking-wider uppercase">
          Loading Administrative Controls & Metrics...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
        <div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Security & System Authority
          </span>
          <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">
            Administrator Command Center
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Real-time urban grid infrastructure, slot occupancy, tariffs, and security audits across SRM campus.
          </p>
        </div>

        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="btn-secondary flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-500' : ''}`} />
          <span>Sync State</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[var(--border)] text-xs font-semibold scrollbar-none">
        {[
          { id: 'overview', label: 'Dashboard KPI', icon: TrendingUp },
          { id: 'users', label: `Users (${users.length})`, icon: Users },
          { id: 'locations', label: `Locations (${locations.length})`, icon: MapPin },
          { id: 'lots', label: `Lots (${lots.length})`, icon: Layers },
          { id: 'slots', label: `Slots & Maintenance`, icon: Car },
          { id: 'bookings', label: `Bookings (${bookings.length})`, icon: Clock },
          { id: 'pricing', label: `Tariffs & Rules`, icon: DollarSign },
          { id: 'logs', label: `Audit Trail (${auditLogs.length})`, icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[var(--accent)] text-[var(--accent-text)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW KPI */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Registered Drivers', value: stats?.users ?? users.length, icon: Users, color: 'text-blue-500' },
              { label: 'Urban Locations', value: stats?.locations ?? locations.length, icon: MapPin, color: 'text-indigo-500' },
              { label: 'Parking Facilities', value: stats?.lots ?? lots.length, icon: Layers, color: 'text-purple-500' },
              { label: 'Total Physical Bays', value: stats?.slots ?? 0, icon: Car, color: 'text-blue-500' },
              { label: 'Available Bays', value: stats?.availableSlots ?? 0, icon: CheckCircle2, color: 'text-emerald-500' },
              { label: 'Occupied Bays', value: stats?.occupiedSlots ?? 0, icon: Car, color: 'text-rose-500' },
              { label: 'Under Maintenance', value: (stats?.maintenanceSlots || 0) + (stats?.disabledSlots || 0), icon: Wrench, color: 'text-amber-500' },
              { label: 'Monthly Revenue', value: formatCurrency(stats?.revenue ?? 0), icon: DollarSign, color: 'text-emerald-500' },
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <div key={i} className="p-5 rounded-2xl card-surface border border-[var(--border)] space-y-2">
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span>{card.label}</span>
                    <Icon className={`w-4 h-4 ${card.color}`} />
                  </div>
                  <div className="text-2xl font-black text-[var(--text-primary)]">{card.value}</div>
                </div>
              );
            })}
          </div>

          {/* Occupancy Ratio Visual */}
          <div className="p-6 rounded-2xl card-surface border border-[var(--border)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">Campus Bay Capacity Utilization</h3>
                <p className="text-xs text-[var(--text-muted)]">Real-time split of active grid states across Kattankulathur</p>
              </div>
              <span className="text-xs font-mono font-bold text-[var(--text-primary)]">
                {stats?.slots ? Math.round(((stats.occupiedSlots || 0) / stats.slots) * 100) : 0}% Occupancy
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-[var(--surface-secondary)] border border-[var(--border)] flex overflow-hidden">
              <div
                style={{ width: `${stats?.slots ? ((stats.availableSlots || 0) / stats.slots) * 100 : 50}%` }}
                className="bg-emerald-500 h-full"
                title="Available"
              />
              <div
                style={{ width: `${stats?.slots ? ((stats.reservedSlots || 0) / stats.slots) * 100 : 25}%` }}
                className="bg-amber-500 h-full"
                title="Reserved"
              />
              <div
                style={{ width: `${stats?.slots ? ((stats.occupiedSlots || 0) / stats.slots) * 100 : 20}%` }}
                className="bg-rose-500 h-full"
                title="Occupied"
              />
              <div
                style={{ width: `${stats?.slots ? (((stats.maintenanceSlots || 0) + (stats.disabledSlots || 0)) / stats.slots) * 100 : 5}%` }}
                className="bg-[var(--text-muted)] h-full opacity-60"
                title="Offline"
              />
            </div>

            <div className="flex flex-wrap gap-4 text-xs pt-1">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Available ({stats?.availableSlots || 0})
              </span>
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Reserved ({stats?.reservedSlots || 0})
              </span>
              <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Occupied ({stats?.occupiedSlots || 0})
              </span>
              <span className="flex items-center gap-1.5 text-[var(--text-muted)] font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--text-muted)] opacity-70" />
                Maintenance/Disabled ({(stats?.maintenanceSlots || 0) + (stats?.disabledSlots || 0)})
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USERS */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Registered System Users</h3>
              <p className="text-xs text-[var(--text-muted)]">Verified students, faculty, staff and campus drivers</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl app-input text-xs"
              />
            </div>
          </div>

          <div className="app-table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-[var(--text-muted)]">
                      No users match the search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td className="font-mono text-[var(--text-muted)]">#{u.id}</td>
                      <td className="font-bold text-[var(--text-primary)]">{u.fullName}</td>
                      <td className="font-mono text-[var(--text-secondary)]">{u.email}</td>
                      <td className="text-[var(--text-muted)]">{u.phoneNumber || 'N/A'}</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.roleName === 'ROLE_ADMIN'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                            : 'badge-neutral'
                        }`}>
                          {u.roleName}
                        </span>
                      </td>
                      <td>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold badge-available">
                          {u.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LOCATIONS */}
      {activeTab === 'locations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">SRM Campus Geographic Locations</h3>
              <p className="text-xs text-[var(--text-muted)]">Campus sectors housing multi-level and open ground parking facilities</p>
            </div>
            <button
              onClick={() => {
                setModalType('createLocation');
                setModalData({ code: '', name: '', address: '', city: 'Kattankulathur', postalCode: '603203' });
              }}
              className="btn-primary flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Location</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((loc) => (
              <div key={loc.id} className="p-5 rounded-2xl card-surface border border-[var(--border)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--surface-secondary)] text-[var(--text-primary)] border border-[var(--border)]">
                    {loc.code}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold badge-available">
                    {loc.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-[var(--text-primary)]">{loc.name}</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{loc.address}, {loc.city} - {loc.postalCode}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: LOTS */}
      {activeTab === 'lots' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Parking Facilities</h3>
              <p className="text-xs text-[var(--text-muted)]">Operational facilities and multi-level structures</p>
            </div>
            <button
              onClick={() => {
                setModalType('createLot');
                setModalData({
                  locationId: locations[0]?.id || '',
                  lotCode: '',
                  name: '',
                  totalCapacity: 30,
                  totalFloors: 1,
                  operatingHours: '24/7',
                  contactPhone: '+91 44 2745 2270',
                });
              }}
              className="btn-primary flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Parking Facility</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lots.map((lot) => (
              <div key={lot.id} className="p-5 rounded-2xl card-surface border border-[var(--border)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--surface-secondary)] text-[var(--text-primary)] border border-[var(--border)]">
                    {lot.lotCode}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">Floors: {lot.totalFloors} • Capacity: {lot.totalCapacity}</span>
                </div>
                <div>
                  <h4 className="text-base font-bold text-[var(--text-primary)]">{lot.name}</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Hours: {lot.operatingHours} • Contact: {lot.contactPhone}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SLOTS & MAINTENANCE CONTROLS */}
      {activeTab === 'slots' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Physical Slot & Bay Controls</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Click any slot to cycle maintenance state: AVAILABLE → MAINTENANCE → DISABLED → AVAILABLE
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedLotId}
                onChange={(e) => setSelectedLotId(e.target.value)}
                className="px-3 py-1.5 rounded-xl app-input text-xs font-semibold"
              >
                {lots.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.lotCode})
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  setModalType('createSlot');
                  setModalData({ slotNumber: `SLOT-${slots.length + 1}`, slotType: 'CAR', floorLevel: 1 });
                }}
                className="btn-primary flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Slot</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 p-4 rounded-2xl card-surface border border-[var(--border)]">
            {slots.map((s) => (
              <button
                key={s.id}
                onClick={() => handleToggleSlotStatus(s.id, s.status)}
                className={`p-3 rounded-xl border text-left transition space-y-1.5 cursor-pointer ${
                  s.status === 'AVAILABLE'
                    ? 'badge-available hover:border-emerald-500'
                    : s.status === 'MAINTENANCE'
                    ? 'badge-reserved hover:border-amber-500'
                    : s.status === 'DISABLED'
                    ? 'badge-occupied hover:border-rose-500'
                    : 'badge-neutral'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)]">
                  <span>{s.slotNumber}</span>
                  <span className="text-[10px] text-[var(--text-muted)] font-normal">{s.slotType}</span>
                </div>
                <div className="text-[10px] text-[var(--text-muted)]">Floor {s.floorLevel}</div>
                <div className="text-[10px] font-black uppercase tracking-wider">
                  {s.status}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Campus Booking Registry</h3>
              <p className="text-xs text-[var(--text-muted)]">{bookings.length} reservations logged across campus</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter reference or plate..."
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl app-input text-xs"
                />
              </div>

              <select
                value={bookingStatusFilter}
                onChange={(e) => setBookingStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl app-input text-xs font-semibold"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          <div className="app-table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>User & Vehicle</th>
                  <th>Slot</th>
                  <th>Timeframe</th>
                  <th>Status</th>
                  <th>Fare</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-[var(--text-muted)]">
                      No bookings found matching filter.
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr key={b.id}>
                      <td className="font-mono font-bold text-blue-600 dark:text-blue-400">{b.bookingReference}</td>
                      <td>
                        <div className="text-[var(--text-primary)] font-semibold">User #{b.userId}</div>
                        <div className="text-[10px] text-[var(--text-muted)] font-mono">{b.licensePlate || 'Vehicle'}</div>
                      </td>
                      <td className="font-bold text-[var(--text-primary)]">Bay {b.slotNumber || b.slotId}</td>
                      <td className="text-[var(--text-muted)]">
                        <div>{formatDateTime(b.startTime)}</div>
                      </td>
                      <td>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.status === 'CONFIRMED' || b.status === 'ACTIVE'
                            ? 'badge-available'
                            : b.status === 'COMPLETED'
                            ? 'badge-neutral'
                            : 'badge-occupied'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="font-bold text-[var(--text-primary)]">
                        {formatCurrency(b.actualFare || b.estimatedFare)}
                      </td>
                      <td>
                        {(b.status === 'CONFIRMED' || b.status === 'ACTIVE') && (
                          <button
                            onClick={() => handleCancelBooking(b.id)}
                            className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] font-bold transition cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: PRICING RULES */}
      {activeTab === 'pricing' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">Campus Parking Tariffs & Pricing Rules</h3>
              <p className="text-xs text-[var(--text-muted)]">Configured subsidized rates per vehicle category</p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedLotId}
                onChange={(e) => setSelectedLotId(e.target.value)}
                className="px-3 py-1.5 rounded-xl app-input text-xs font-semibold"
              >
                {lots.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  setModalType('createPricing');
                  setModalData({
                    vehicleType: 'CAR',
                    baseFare: 20,
                    hourlyRate: 20,
                    minHours: 1,
                    gracePeriodMins: 15,
                    overstayPenaltyRate: 40,
                  });
                }}
                className="btn-primary flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Tariff</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {pricingRules.map((pr) => (
              <div key={pr.id} className="p-5 rounded-2xl card-surface border border-[var(--border)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[var(--text-primary)] px-2.5 py-1 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)]">
                    {pr.vehicleType}
                  </span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Active</span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>Base Fare:</span>
                    <strong className="text-[var(--text-primary)]">{formatCurrency(pr.baseFare)}</strong>
                  </div>
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>Hourly Rate:</span>
                    <strong className="text-[var(--text-primary)]">{formatCurrency(pr.hourlyRate)}/hr</strong>
                  </div>
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>Grace Period:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">{pr.gracePeriodMins} mins</strong>
                  </div>
                  <div className="flex justify-between text-[var(--text-muted)]">
                    <span>Overstay Penalty:</span>
                    <strong className="text-rose-600 dark:text-rose-400">{formatCurrency(pr.overstayPenaltyRate)}/hr</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">System Security & Audit Trail</h3>
              <p className="text-xs text-[var(--text-muted)]">{auditLogs.length} audit events recorded</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search action or entity..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl app-input text-xs"
              />
            </div>
          </div>

          <div className="app-table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 text-[var(--text-muted)]">
                      No audit events match search query.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="font-mono text-[var(--text-muted)]">#{log.id}</td>
                      <td className="text-[var(--text-muted)]">{formatDateTime(log.createdAt)}</td>
                      <td>
                        <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          {log.action}
                        </span>
                      </td>
                      <td className="text-[var(--text-primary)] font-medium">{log.entityType} #{log.entityId}</td>
                      <td className="text-[var(--text-muted)] max-w-md truncate">{log.newValue || log.oldValue || 'N/A'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: ADD LOCATION */}
      {modalType === 'createLocation' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
          <div className="w-full max-w-md p-6 rounded-2xl modal-surface border border-[var(--border)] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <h3 className="text-base font-bold text-[var(--text-primary)]">Add Campus Location</h3>
              <button onClick={() => setModalType(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateLocation} className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--text-secondary)] mb-1">Location Code (e.g. LOC-SRM-NEW)</label>
                <input
                  type="text"
                  required
                  value={modalData.code}
                  onChange={(e) => setModalData({ ...modalData, code: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl app-input font-mono"
                />
              </div>
              <div>
                <label className="block text-[var(--text-secondary)] mb-1">Location Name</label>
                <input
                  type="text"
                  required
                  value={modalData.name}
                  onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl app-input"
                />
              </div>
              <div>
                <label className="block text-[var(--text-secondary)] mb-1">Address</label>
                <input
                  type="text"
                  value={modalData.address}
                  onChange={(e) => setModalData({ ...modalData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl app-input"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="btn-secondary px-4 py-2 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-4 py-2 rounded-xl font-bold"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD LOT */}
      {modalType === 'createLot' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
          <div className="w-full max-w-md p-6 rounded-2xl modal-surface border border-[var(--border)] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <h3 className="text-base font-bold text-[var(--text-primary)]">Add Parking Facility</h3>
              <button onClick={() => setModalType(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateLot} className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--text-secondary)] mb-1">Parent Location</label>
                <select
                  value={modalData.locationId}
                  onChange={(e) => setModalData({ ...modalData, locationId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl app-input font-medium"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name} ({loc.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[var(--text-secondary)] mb-1">Lot Code (e.g. LOT-TP-NEW)</label>
                <input
                  type="text"
                  required
                  value={modalData.lotCode}
                  onChange={(e) => setModalData({ ...modalData, lotCode: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl app-input font-mono"
                />
              </div>
              <div>
                <label className="block text-[var(--text-secondary)] mb-1">Lot Name</label>
                <input
                  type="text"
                  required
                  value={modalData.name}
                  onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl app-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1">Total Capacity</label>
                  <input
                    type="number"
                    value={modalData.totalCapacity}
                    onChange={(e) => setModalData({ ...modalData, totalCapacity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl app-input"
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1">Total Floors</label>
                  <input
                    type="number"
                    value={modalData.totalFloors}
                    onChange={(e) => setModalData({ ...modalData, totalFloors: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl app-input"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="btn-secondary px-4 py-2 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-4 py-2 rounded-xl font-bold"
                >
                  Save Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SLOT */}
      {modalType === 'createSlot' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
          <div className="w-full max-w-sm p-6 rounded-2xl modal-surface border border-[var(--border)] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <h3 className="text-base font-bold text-[var(--text-primary)]">Add Physical Bay</h3>
              <button onClick={() => setModalType(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateSlot} className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--text-secondary)] mb-1">Slot Number (e.g. TP-C-10)</label>
                <input
                  type="text"
                  required
                  value={modalData.slotNumber}
                  onChange={(e) => setModalData({ ...modalData, slotNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl app-input font-mono"
                />
              </div>
              <div>
                <label className="block text-[var(--text-secondary)] mb-1">Vehicle Classification</label>
                <select
                  value={modalData.slotType}
                  onChange={(e) => setModalData({ ...modalData, slotType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl app-input font-medium"
                >
                  <option value="CAR">CAR</option>
                  <option value="BIKE">BIKE</option>
                  <option value="SUV">SUV</option>
                  <option value="EV">EV (Charging)</option>
                  <option value="BUS">BUS</option>
                </select>
              </div>
              <div>
                <label className="block text-[var(--text-secondary)] mb-1">Floor Level</label>
                <input
                  type="number"
                  value={modalData.floorLevel}
                  onChange={(e) => setModalData({ ...modalData, floorLevel: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl app-input"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="btn-secondary px-4 py-2 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-4 py-2 rounded-xl font-bold"
                >
                  Create Bay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD PRICING */}
      {modalType === 'createPricing' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
          <div className="w-full max-w-sm p-6 rounded-2xl modal-surface border border-[var(--border)] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <h3 className="text-base font-bold text-[var(--text-primary)]">Add Vehicle Tariff Rule</h3>
              <button onClick={() => setModalType(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreatePricingRule} className="space-y-3 text-xs">
              <div>
                <label className="block text-[var(--text-secondary)] mb-1">Vehicle Classification</label>
                <select
                  value={modalData.vehicleType}
                  onChange={(e) => setModalData({ ...modalData, vehicleType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl app-input font-medium"
                >
                  <option value="CAR">CAR</option>
                  <option value="BIKE">BIKE</option>
                  <option value="SUV">SUV</option>
                  <option value="EV">EV</option>
                  <option value="BUS">BUS</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1">Base Fare (₹)</label>
                  <input
                    type="number"
                    value={modalData.baseFare}
                    onChange={(e) => setModalData({ ...modalData, baseFare: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl app-input"
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1">Hourly Rate (₹)</label>
                  <input
                    type="number"
                    value={modalData.hourlyRate}
                    onChange={(e) => setModalData({ ...modalData, hourlyRate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl app-input"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1">Grace Mins</label>
                  <input
                    type="number"
                    value={modalData.gracePeriodMins}
                    onChange={(e) => setModalData({ ...modalData, gracePeriodMins: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl app-input"
                  />
                </div>
                <div>
                  <label className="block text-[var(--text-secondary)] mb-1">Overstay Fee/hr (₹)</label>
                  <input
                    type="number"
                    value={modalData.overstayPenaltyRate}
                    onChange={(e) => setModalData({ ...modalData, overstayPenaltyRate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl app-input"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="btn-secondary px-4 py-2 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary px-4 py-2 rounded-xl font-bold"
                >
                  Save Tariff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
