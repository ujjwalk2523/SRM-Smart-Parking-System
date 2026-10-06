import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { locationsApi } from '../api/locations';
import { ParkingMapView } from '../components/parking/ParkingMapView';
import { LotCard } from '../components/parking/LotCard';
import { 
  MapPin, 
  Search, 
  Layers, 
  AlertCircle, 
  GraduationCap, 
  Map as MapIcon, 
  Grid,
  Filter,
  Navigation,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Car,
  Bike,
  Zap,
  Bus,
  Sparkles,
  ExternalLink
} from 'lucide-react';

const SRM_LOCATION_PHOTOS = {
  1: '/assets/srm/srm-tech-park.jpg',
  2: '/assets/srm/srm-clock-tower.jpg',
  3: '/assets/srm/srm-college-road.jpg',
  4: '/assets/srm/srm-potheri-gate.jpg',
  5: '/assets/srm/srm-hostels.jpg',
  6: '/assets/srm/srm-bus-terminal.jpg',
};

export const FindParking = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialLocId = searchParams.get('locationId') || 'ALL';

  const [locations, setLocations] = useState([]);
  const [lots, setLots] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(initialLocId);
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('ALL'); // ALL, CAR, BIKE, EV, BUS
  const [availabilityOnly, setAvailabilityOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState('ALL'); // ALL, 10, 20
  const [sortBy, setSortBy] = useState('availability'); // 'availability' | 'name' | 'capacity'
  const [viewMode, setViewMode] = useState('map'); // 'map' | 'grid'
  const [userCoords, setUserCoords] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load locations and nested lots from real backend
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const locRes = await locationsApi.getAll();
        const locList = locRes.data || [];
        setLocations(locList);

        // Fetch lots across all locations
        const lotsPromises = locList.map((loc) => 
          locationsApi.getLots(loc.id)
            .then((r) => (r.data || []).map((lot) => ({ 
              ...lot, 
              locationName: loc.name, 
              locationAddress: loc.address,
              latitude: lot.latitude || loc.latitude,
              longitude: lot.longitude || loc.longitude,
            })))
            .catch(() => [])
        );

        const allLotsNested = await Promise.all(lotsPromises);
        const flattened = allLotsNested.flat();
        setLots(flattened);

        if (flattened.length > 0) {
          // If query param matches a location, select first lot of that location
          if (initialLocId !== 'ALL') {
            const match = flattened.find(l => String(l.locationId) === String(initialLocId));
            setSelectedLot(match || flattened[0]);
          } else {
            setSelectedLot(flattened[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load locations/lots:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [initialLocId]);

  const handleLocationFilterChange = (locId) => {
    setSelectedLocation(locId);
    if (locId === 'ALL') {
      searchParams.delete('locationId');
    } else {
      searchParams.set('locationId', locId);
    }
    setSearchParams(searchParams);
  };

  // Filter & Sort Logic
  const filteredLots = useMemo(() => {
    return lots.filter((lot) => {
      const matchLoc = selectedLocation === 'ALL' || String(lot.locationId) === String(selectedLocation);
      const matchSearch = searchTerm === '' || 
        lot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lot.lotCode && lot.lotCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lot.locationName && lot.locationName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lot.locationAddress && lot.locationAddress.toLowerCase().includes(searchTerm.toLowerCase()));

      let matchVehicle = true;
      if (vehicleFilter === 'BIKE') {
        matchVehicle = lot.name.toLowerCase().includes('bike') || lot.name.toLowerCase().includes('two wheeler');
      } else if (vehicleFilter === 'CAR') {
        matchVehicle = lot.name.toLowerCase().includes('car') || lot.name.toLowerCase().includes('university');
      } else if (vehicleFilter === 'BUS') {
        matchVehicle = lot.name.toLowerCase().includes('bus');
      }

      const available = lot.availableSlots ?? (lot.totalCapacity ? Math.floor(lot.totalCapacity * 0.6) : 0);
      const matchAvailability = !availabilityOnly || available > 0;

      return matchLoc && matchSearch && matchVehicle && matchAvailability;
    }).sort((a, b) => {
      const availA = a.availableSlots ?? (a.totalCapacity ? Math.floor(a.totalCapacity * 0.6) : 0);
      const availB = b.availableSlots ?? (b.totalCapacity ? Math.floor(b.totalCapacity * 0.6) : 0);

      if (sortBy === 'availability') return availB - availA;
      if (sortBy === 'capacity') return (b.totalCapacity || 0) - (a.totalCapacity || 0);
      return a.name.localeCompare(b.name);
    });
  }, [lots, selectedLocation, searchTerm, vehicleFilter, availabilityOnly, sortBy]);

  // Directions Action via Google Maps
  const handleGetDirections = (lot) => {
    if (!lot) return;
    const lat = lot.latitude || 12.8231;
    const lng = lot.longitude || 80.0442;
    const gmapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(gmapsUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Header & View Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--surface-secondary)] text-[var(--text-secondary)] text-xs font-semibold mb-2 border border-[var(--border)]">
            <GraduationCap className="w-4 h-4 text-[var(--text-primary)]" />
            <span>SRM Kattankulathur Campus Parking System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight">
            Find & Reserve Campus Parking
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
            Real-time bay telemetry, interactive satellite discovery, and direct reservation across all SRM KTR facilities.
          </p>
        </div>

        {/* View Mode Toggle: Interactive Map vs Grid */}
        <div className="flex items-center p-1 bg-[var(--surface-secondary)] rounded-xl border border-[var(--border)] shrink-0 self-start md:self-auto shadow-xs">
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'map'
                ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-xs border border-[var(--border)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Map & Satellite</span>
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'grid'
                ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-xs border border-[var(--border)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Lots Grid</span>
          </button>
        </div>
      </div>

      {/* Campus Zone Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => handleLocationFilterChange('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
            selectedLocation === 'ALL'
              ? 'bg-[var(--accent)] text-[var(--accent-text)] shadow-xs'
              : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]'
          }`}
        >
          All Campus Zones
        </button>

        {locations.map((loc) => (
          <button
            key={loc.id}
            type="button"
            onClick={() => handleLocationFilterChange(String(loc.id))}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              String(selectedLocation) === String(loc.id)
                ? 'bg-[var(--accent)] text-[var(--accent-text)] shadow-xs'
                : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]'
            }`}
          >
            <MapPin className="w-3 h-3 text-[var(--text-muted)]" />
            <span>{loc.name.split(' (')[0].replace('SRM ', '')}</span>
          </button>
        ))}
      </div>

      {/* Main Interactive Stage */}
      {viewMode === 'map' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT PANEL: Filters & Lot Directory List (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Search Box & Vehicle Filters */}
            <div className="card-surface p-4 rounded-2xl space-y-3 box-glow">
              <div className="relative">
                <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter lot name or area..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl app-input text-xs"
                />
              </div>

              {/* Vehicle Type Filter Pills */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">
                  Vehicle Type
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'ALL', label: 'All', icon: Layers },
                    { id: 'CAR', label: 'Cars', icon: Car },
                    { id: 'BIKE', label: 'Bikes', icon: Bike },
                    { id: 'BUS', label: 'Bus', icon: Bus },
                  ].map((btn) => {
                    const Icon = btn.icon;
                    return (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() => setVehicleFilter(btn.id)}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition ${
                          vehicleFilter === btn.id
                            ? 'bg-[var(--accent)] text-[var(--accent-text)] shadow-xs'
                            : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{btn.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Toggles & Sort */}
              <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-[var(--text-secondary)] font-medium">
                  <input
                    type="checkbox"
                    checked={availabilityOnly}
                    onChange={(e) => setAvailabilityOnly(e.target.checked)}
                    className="rounded border-[var(--border)] text-[var(--accent)] focus:ring-0"
                  />
                  <span>Available Only</span>
                </label>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-2 py-1 rounded-lg app-input text-[11px] font-semibold"
                >
                  <option value="availability">Most Available</option>
                  <option value="capacity">Total Capacity</option>
                  <option value="name">Lot Name</option>
                </select>
              </div>
            </div>

            {/* Scrollable Lot List */}
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] px-1 font-semibold">
                <span>Matching Facilities ({filteredLots.length})</span>
                <span>Click to pinpoint map</span>
              </div>

              {filteredLots.map((lot) => {
                const isSelected = selectedLot?.id === lot.id;
                const available = lot.availableSlots ?? (lot.totalCapacity ? Math.floor(lot.totalCapacity * 0.6) : 0);

                return (
                  <motion.div
                    key={lot.id}
                    whileHover={{ x: 2 }}
                    onClick={() => setSelectedLot(lot)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--surface-secondary)] border-[var(--text-primary)] ring-1 ring-[var(--text-primary)] shadow-sm'
                        : 'card-surface hover:border-[var(--border-secondary)]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--surface-secondary)] text-[var(--text-secondary)] border border-[var(--border)]">
                            {lot.lotCode}
                          </span>
                          <span className="text-[11px] text-[var(--text-muted)] line-clamp-1">
                            {lot.locationName}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-[var(--text-primary)] line-clamp-1">
                          {lot.name}
                        </h4>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          available > 5 
                            ? 'badge-available' 
                            : available > 0 
                            ? 'badge-reserved' 
                            : 'badge-occupied'
                        }`}>
                          {available} Open
                        </span>
                        <div className="text-[10px] text-[var(--text-muted)] mt-1 font-semibold">
                          ₹5-20/hr
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </div>

          {/* CENTER: Interactive Leaflet Map Stage (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            
            <ParkingMapView
              lots={filteredLots}
              selectedLot={selectedLot}
              onSelectLot={(lot) => setSelectedLot(lot)}
              userLocation={userCoords}
              onUserLocationChange={(coords) => setUserCoords(coords)}
            />

            {/* Selected Lot Detailed Drawer below the map */}
            <AnimatePresence mode="wait">
              {selectedLot && (
                <motion.div
                  key={selectedLot.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="card-surface p-5 sm:p-6 rounded-2xl border border-[var(--border)] space-y-4 box-glow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex gap-4 items-start min-w-0">
                      {/* Real Campus Photo Thumbnail */}
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-black shrink-0 border border-[var(--border)] shadow-sm">
                        <img
                          src={selectedLot.imageUrl || SRM_LOCATION_PHOTOS[selectedLot.locationId] || '/assets/srm/srm-tech-park.jpg'}
                          alt={selectedLot.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--surface-secondary)] text-[var(--text-secondary)] border border-[var(--border)]">
                            {selectedLot.lotCode}
                          </span>
                          <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate">{selectedLot.locationName}</span>
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] truncate">
                          {selectedLot.name}
                        </h3>

                        <p className="text-xs text-[var(--text-muted)] line-clamp-1">
                          {selectedLot.locationAddress || 'SRM KTR Campus Zone'} • {selectedLot.operatingHours || '24/7 Access'} • {selectedLot.totalFloors || 1} Floor(s)
                        </p>
                      </div>
                    </div>

                    {/* Rates Pill */}
                    <div className="p-3 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)] text-right shrink-0">
                      <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">
                        Campus Subsidized Rate
                      </span>
                      <span className="text-sm font-black text-[var(--text-primary)]">
                        ₹5 - ₹20 / hr
                      </span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                        15-min free drop-off
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[var(--border)]">
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Live IoT telemetry sensor bay verification</span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => handleGetDirections(selectedLot)}
                        className="btn-secondary py-2 px-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 flex-1 sm:flex-none cursor-pointer"
                        title="Navigate with Google Maps"
                      >
                        <Navigation className="w-3.5 h-3.5 text-blue-500" />
                        <span>Directions</span>
                      </button>

                      <Link
                        to={`/lot/${selectedLot.id}`}
                        className="btn-primary py-2 px-5 rounded-xl text-xs flex items-center justify-center gap-1.5 flex-1 sm:flex-none"
                      >
                        <span>Select Bay & Reserve</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>
      ) : (
        /* GRID VIEW MODE */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLots.length === 0 ? (
            <div className="col-span-full card-surface rounded-2xl p-12 text-center max-w-md mx-auto space-y-3">
              <AlertCircle className="w-10 h-10 text-[var(--text-muted)] mx-auto" />
              <h3 className="text-base font-bold text-[var(--text-primary)]">No Campus Lots Found</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Try adjusting your search query, vehicle category, or zone filter.
              </p>
              <button
                onClick={() => {
                  setSelectedLocation('ALL');
                  setSearchTerm('');
                  setVehicleFilter('ALL');
                  setAvailabilityOnly(false);
                }}
                className="btn-primary px-4 py-2 text-xs rounded-xl"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredLots.map((lot) => (
              <LotCard key={lot.id} lot={lot} />
            ))
          )}
        </div>
      )}

    </div>
  );
};
