import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { locationsApi } from '../api/locations';
import { CampusMapNavigator } from '../components/parking/CampusMapNavigator';
import { CampusParkingDirectory } from '../components/parking/CampusParkingDirectory';
import { HeroMetrics3D } from '../components/home/HeroMetrics3D';
import { 
  Car, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Search, 
  GraduationCap,
  Zap,
  Building,
  CalendarCheck,
  Compass,
  Sparkles,
  Bike,
  Bus,
  Layers
} from 'lucide-react';

const SRM_LOCATION_PHOTOS = {
  1: '/assets/srm/srm-tech-park.jpg',
  2: '/assets/srm/srm-clock-tower.jpg',
  3: '/assets/srm/srm-college-road.jpg',
  4: '/assets/srm/srm-potheri-gate.jpg',
  5: '/assets/srm/srm-hostels.jpg',
  6: '/assets/srm/srm-bus-terminal.jpg',
  'LOC-SRM-TP': '/assets/srm/srm-tech-park.jpg',
  'LOC-SRM-ICR': '/assets/srm/srm-clock-tower.jpg',
  'LOC-SRM-COL': '/assets/srm/srm-college-road.jpg',
  'LOC-SRM-NGR': '/assets/srm/srm-potheri-gate.jpg',
  'LOC-SRM-PKS': '/assets/srm/srm-hostels.jpg',
  'LOC-SRM-BUS': '/assets/srm/srm-bus-terminal.jpg',
};

export const LandingPage = () => {
  const [locations, setLocations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    locationsApi.getAll()
      .then((res) => {
        setLocations(res.data || []);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredLocations = locations.filter((loc) => 
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-16 pb-20">
      
      {/* 1. Hero Section - Realistic Transportation & Parking Product Hero */}
      <section className="pt-12 sm:pt-16 pb-12 border-b border-[var(--border)] bg-[var(--surface)] transition-colors relative overflow-hidden">
        
        {/* Subtle dynamic grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          {/* SRM KTR Campus Pill */}
          <motion.div 
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--surface-secondary)] border border-[var(--border)] text-[var(--text-secondary)] text-xs font-semibold mb-6 shadow-xs"
          >
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            <span className="font-mono-tech text-[11px] tracking-wider font-bold">SRM KTR CAMPUS MOBILITY GATEWAY</span>
          </motion.div>

          {/* Hero Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black tracking-tight text-[var(--text-primary)]"
          >
            Find. Park. Go.
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-4 text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed"
          >
            Real-time bay availability and hassle-free parking reservations across SRM KTR campus: Tech Park, Clock Tower, UB, Hostels, and Medical blocks.
          </motion.p>

          {/* Search Box with Box Glow */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-7 max-w-xl mx-auto"
          >
            <div className="relative flex items-center card-surface rounded-2xl border border-[var(--border)] box-glow">
              <Search className="absolute left-4 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campus zone (e.g. Tech Park, Intra College Road, Potheri)..."
                className="w-full pl-11 pr-4 py-3 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none text-xs sm:text-sm"
              />
            </div>
          </motion.div>

          {/* Quick CTA Actions */}
          <motion.div 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              to="/explore"
              className="btn-primary px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Interactive Campus Map</span>
            </Link>
            
            <Link
              to="/register"
              className="btn-secondary px-6 py-2.5 rounded-xl text-xs font-semibold shadow-xs"
            >
              Register Campus Vehicle
            </Link>
          </motion.div>

          {/* Vehicle Type Support Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--text-secondary)] font-medium"
          >
            <span className="text-[var(--text-muted)] font-semibold">Supported Transit:</span>
            <span className="flex items-center gap-1.5"><Car className="w-4 h-4 text-blue-500" /> Cars & Sedans</span>
            <span className="flex items-center gap-1.5"><Bike className="w-4 h-4 text-emerald-500" /> Two-Wheelers</span>
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-500" /> EV Charging</span>
            <span className="flex items-center gap-1.5"><Bus className="w-4 h-4 text-purple-500" /> University Buses</span>
          </motion.div>

          {/* 3D Animated Interactive Campus Metrics Cards */}
          <HeroMetrics3D />

        </div>
      </section>

      {/* 2. Interactive SRM KTR Campus Map Navigator */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CampusMapNavigator />
      </section>

      {/* 3. The Verified 14 SRM KTR Parking Areas Directory */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CampusParkingDirectory />
      </section>

      {/* 4. Campus Geographic Sectors Grid with Real Photos & Glowing Boxes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--surface-secondary)] text-[var(--text-secondary)] text-xs font-semibold mb-2 border border-[var(--border)]">
              <Building className="w-3.5 h-3.5 text-blue-500" />
              <span>Campus Geographic Sectors</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
              SRM KTR Campus Sectors
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Select a designated campus area to inspect real-time bay availability and reserve slots.
            </p>
          </div>
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)] hover:underline"
          >
            <span>All Campus Spots</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-[var(--surface-secondary)] animate-pulse rounded-2xl border border-[var(--border)]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLocations.map((loc, idx) => {
              const photo = SRM_LOCATION_PHOTOS[loc.id] || SRM_LOCATION_PHOTOS[loc.code] || loc.imageUrl || '/assets/srm/srm-tech-park.jpg';
              return (
                <motion.div
                  key={loc.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.04 }}
                  whileHover={{ y: -4 }}
                  className="card-surface card-surface-hover rounded-2xl overflow-hidden flex flex-col group border border-[var(--border)] box-glow"
                >
                  <div className="h-44 w-full relative overflow-hidden bg-black">
                    <img
                      src={photo}
                      alt={loc.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[11px] font-bold border border-white/20 shadow">
                      {loc.code}
                    </div>
                    
                    <div className="absolute bottom-3 right-3 bg-blue-600/90 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow">
                      {loc.lotCount} Parking {loc.lotCount === 1 ? 'Lot' : 'Lots'}
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="font-bold text-base text-[var(--text-primary)] group-hover:text-blue-500 transition-colors line-clamp-1">
                      {loc.name}
                    </h3>
                    
                    <div className="flex items-start gap-1.5 text-xs text-[var(--text-muted)] mt-2 flex-grow">
                      <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{loc.address}, {loc.city}</span>
                    </div>

                    <div className="mt-5 pt-4 border-t border-[var(--border)] flex items-center justify-between">
                      <span className="text-xs font-medium text-[var(--text-muted)]">
                        PIN: {loc.postalCode}
                      </span>
                      <Link
                        to={`/explore?locationId=${loc.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)] hover:underline"
                      >
                        <span>Inspect Bays</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. How Campus Parking Works with Glowing Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card-surface rounded-2xl p-8 sm:p-12 border border-[var(--border)] box-glow">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
              Campus Parking in Three Simple Steps
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Automated sensor bays and instant student/faculty verification make university parking effortless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ y: -3 }}
              className="flex flex-col items-center text-center p-6 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)]"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-600/15 text-blue-500 flex items-center justify-center font-black text-lg mb-4">
                1
              </div>
              <h3 className="font-bold text-base text-[var(--text-primary)] mb-2">
                Discover Zone & Telemetry
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Filter by vehicle type (bike, sedan, bus, EV) and check real-time open bay sensors across Tech Park or Hostels.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -3 }}
              className="flex flex-col items-center text-center p-6 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)]"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-600/15 text-emerald-500 flex items-center justify-center font-black text-lg mb-4">
                2
              </div>
              <h3 className="font-bold text-base text-[var(--text-primary)] mb-2">
                Pick Bay & Reserve Slot
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Choose an individual floor and slot (e.g. B1-04), select your vehicle, and reserve with 15-minute campus drop-off grace.
              </p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -3 }}
              className="flex flex-col items-center text-center p-6 rounded-2xl bg-[var(--surface-secondary)] border border-[var(--border)]"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-600/15 text-purple-500 flex items-center justify-center font-black text-lg mb-4">
                3
              </div>
              <h3 className="font-bold text-base text-[var(--text-primary)] mb-2">
                Drive In & Automated Check-In
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Drive into the campus boom barrier gate; automatic license plate recognition checks you in smoothly.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  );
};
