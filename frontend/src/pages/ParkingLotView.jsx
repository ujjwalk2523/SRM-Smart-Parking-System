import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { lotsApi } from '../api/lots';
import { SlotMatrix } from '../components/parking/SlotMatrix';
import { BookingModal } from '../components/booking/BookingModal';
import { 
  MapPin, 
  Clock, 
  ArrowLeft, 
  ShieldCheck, 
  RefreshCw,
  GraduationCap,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export const ParkingLotView = () => {
  const { id } = useParams();

  const [lot, setLot] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadLotAndSlots = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const [lotRes, slotsRes] = await Promise.all([
        lotsApi.getById(id),
        lotsApi.getSlots(id),
      ]);
      setLot(lotRes.data);
      setSlots(slotsRes.data || []);
    } catch (err) {
      console.error('Failed to load parking lot view:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLotAndSlots();
  }, [id]);

  const handleSelectSlot = (slot) => {
    if (selectedSlot?.id === slot.id) {
      setSelectedSlot(null); // Deselect toggle
    } else {
      setSelectedSlot(slot);
    }
  };

  const handleOpenBookingModal = async () => {
    if (!selectedSlot) return;
    try {
      const res = await lotsApi.getSlots(lot.id);
      const latestSlots = res.data || [];
      const currentSlot = latestSlots.find((s) => s.id === selectedSlot.id);
      if (!currentSlot || currentSlot.status !== 'AVAILABLE') {
        alert(`Bay ${selectedSlot.slotNumber} is no longer available. Grid refreshed.`);
        setSlots(latestSlots);
        setSelectedSlot(null);
        return;
      }
      setSlots(latestSlots);
      setBookingModalOpen(true);
    } catch (err) {
      setBookingModalOpen(true);
    }
  };

  const handleBookingSuccess = () => {
    setSelectedSlot(null);
    loadLotAndSlots(true); // Refresh slots immediately
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-8 h-8 border-3 border-[var(--text-primary)] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[var(--text-muted)] font-semibold tracking-wider uppercase">
          Loading Campus Bay Matrix & Telemetry...
        </p>
      </div>
    );
  }

  if (!lot) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Campus Parking Facility Not Found</h2>
        <Link to="/explore" className="inline-block text-xs font-semibold text-[var(--text-primary)] underline">
          Return to Campus Zones
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/explore"
          className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Campus Lots</span>
        </Link>

        <button
          onClick={() => loadLotAndSlots(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg card-surface text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] transition-colors shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[var(--text-primary)]' : ''}`} />
          <span>Sync Status</span>
        </button>
      </div>

      {/* Lot Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-surface p-6 sm:p-8 rounded-2xl relative overflow-hidden border border-[var(--border)]"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-[var(--surface-secondary)] text-[var(--text-secondary)] border border-[var(--border)]">
                {lot.lotCode}
              </span>
              <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-500" />
                {lot.locationName}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
              {lot.name}
            </h1>

            <p className="text-xs text-[var(--text-muted)] flex items-center gap-3 pt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {lot.operatingHours || '24/7 Access'}
              </span>
              <span>•</span>
              <span>Capacity: {lot.totalCapacity} bays</span>
              <span>•</span>
              <span>{lot.totalFloors} Floor Levels</span>
            </p>
          </div>

          {/* Tariffs Card */}
          <div className="p-4 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] space-y-2 shrink-0 md:w-64">
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-bold block">
              Subsidized Campus Rates
            </span>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--text-secondary)]">Car / SUV / EV:</span>
              <span className="font-bold text-[var(--text-primary)]">₹20 base + ₹20/hr</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--text-secondary)]">Student 2-Wheeler:</span>
              <span className="font-bold text-[var(--text-primary)]">₹5-10 base + ₹5/hr</span>
            </div>
            <div className="pt-1.5 border-t border-[var(--border)] text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> 15-Min Free Campus Drop-Off
            </div>
          </div>
        </div>
      </motion.div>

      {/* Interactive Slot Matrix */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            Select an Available Parking Bay
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Click on any green <span className="font-semibold text-emerald-600 dark:text-emerald-400">AVAILABLE</span> slot to reserve.
          </p>
        </div>

        <SlotMatrix
          slots={slots}
          selectedSlot={selectedSlot}
          onSelectSlot={handleSelectSlot}
          totalFloors={lot.totalFloors}
          onSlotUpdated={(slotId, newStatus) => {
            setSlots((prev) =>
              prev.map((s) => (s.id === slotId ? { ...s, status: newStatus } : s))
            );
            loadLotAndSlots(true);
          }}
        />
      </div>

      {/* Sticky Bottom Booking Bar when Slot Selected */}
      <AnimatePresence>
        {selectedSlot && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-xl px-4"
          >
            <div className="card-surface p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 border border-[var(--border-secondary)] bg-[var(--surface)]/95 backdrop-blur-md">
              <div>
                <div className="text-xs text-[var(--text-muted)] font-medium">Selected Bay</div>
                <div className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <span>{selectedSlot.slotNumber}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[var(--surface-secondary)] text-[var(--text-secondary)] border border-[var(--border)]">
                    Floor {selectedSlot.floorLevel} • {selectedSlot.slotType}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSlot(null)}
                  className="px-3 py-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleOpenBookingModal}
                  className="btn-primary px-5 py-2 text-xs font-bold rounded-xl shadow-sm transition"
                >
                  Continue to Reserve
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Modal */}
      {bookingModalOpen && selectedSlot && (
        <BookingModal
          lot={lot}
          slot={selectedSlot}
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          onSuccess={handleBookingSuccess}
        />
      )}

    </div>
  );
};
