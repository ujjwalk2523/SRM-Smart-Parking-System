import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Bike, 
  Car, 
  Bus, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  Search,
  Filter,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const ALL_14_PARKING_AREAS = [
  {
    num: 1,
    id: 2,
    name: 'SRM University Parking',
    category: 'General Multi-Level Parking',
    zone: 'Tech Park & UB Sector',
    type: 'GENERAL',
    capacity: 50,
    available: 4,
    rate: '₹20/hr',
    image: '/assets/srm/srm-tech-park.jpg'
  },
  {
    num: 2,
    id: 13,
    name: 'SRM Parking',
    category: 'Two-Wheeler Student Parking',
    zone: 'Hostel Enclave (Paari/Oori)',
    type: 'BIKE',
    capacity: 40,
    available: 3,
    rate: '₹5/hr',
    image: '/assets/srm/srm-hostels.jpg'
  },
  {
    num: 3,
    id: 3,
    name: 'Car Parking (Tech Park / UB)',
    category: 'Faculty & Visitor Car Bays',
    zone: 'Tech Park / UB Plaza',
    type: 'CAR',
    capacity: 30,
    available: 3,
    rate: '₹20/hr',
    image: '/assets/srm/srm-tech-park.jpg'
  },
  {
    num: 4,
    id: 8,
    name: 'Parking — General Parking',
    category: 'Main Campus Quad General',
    zone: 'College Road Quad',
    type: 'GENERAL',
    capacity: 40,
    available: 3,
    rate: '₹20/hr',
    image: '/assets/srm/srm-college-road.jpg'
  },
  {
    num: 5,
    id: 9,
    name: 'Bike Parking — College Road',
    category: 'Main Boulevard Two-Wheeler',
    zone: 'College Road Bays',
    type: 'BIKE',
    capacity: 35,
    available: 2,
    rate: '₹5/hr',
    image: '/assets/srm/srm-college-road.jpg'
  },
  {
    num: 6,
    id: 7,
    name: 'Parking Lot — College Road',
    category: 'Main Gate Vehicle Depo',
    zone: 'College Road Main',
    type: 'CAR',
    capacity: 35,
    available: 3,
    rate: '₹20/hr',
    image: '/assets/srm/srm-college-road.jpg'
  },
  {
    num: 7,
    id: 4,
    name: 'Parking Lot 1 — Intra College Road',
    category: 'Central Clock Tower Plaza',
    zone: 'Intra College Road (Clock Tower)',
    type: 'GENERAL',
    capacity: 35,
    available: 3,
    rate: '₹20/hr',
    image: '/assets/srm/srm-clock-tower.jpg'
  },
  {
    num: 8,
    id: 10,
    name: 'Parking Lot 2 — Potheri Station Gate',
    category: 'SRM Nagar Station Transit',
    zone: 'Potheri / SRM Nagar Gate',
    type: 'CAR',
    capacity: 35,
    available: 3,
    rate: '₹15/hr',
    image: '/assets/srm/srm-potheri-gate.jpg'
  },
  {
    num: 9,
    id: 1,
    name: 'Tech Park Bike Parking',
    category: 'High-Rise Ground Two-Wheeler',
    zone: 'Tech Park High-Rise Ground',
    type: 'BIKE',
    capacity: 40,
    available: 3,
    rate: '₹5/hr',
    image: '/assets/srm/srm-tech-park.jpg'
  },
  {
    num: 10,
    id: 12,
    name: 'Bike Parking — Hostels Perimeter',
    category: 'Pillayar Koil Street Perimeter',
    zone: 'Pillayar Koil Street & Hostels',
    type: 'BIKE',
    capacity: 35,
    available: 2,
    rate: '₹5/hr',
    image: '/assets/srm/srm-hostels.jpg'
  },
  {
    num: 11,
    id: 5,
    name: 'Bike Parking — Intra College Road',
    category: 'Central Academic Two-Wheeler',
    zone: 'Intra College Road Staging',
    type: 'BIKE',
    capacity: 40,
    available: 2,
    rate: '₹5/hr',
    image: '/assets/srm/srm-clock-tower.jpg'
  },
  {
    num: 12,
    id: 6,
    name: 'Two-Wheeler\'s Parking — Admin Quad',
    category: 'South Quad Covered Parking',
    zone: 'Intra College Road South',
    type: 'BIKE',
    capacity: 30,
    available: 2,
    rate: '₹5/hr',
    image: '/assets/srm/srm-clock-tower.jpg'
  },
  {
    num: 13,
    id: 11,
    name: 'Two Wheeler Parking — SRM Nagar',
    category: 'Suburban Gateway Staging',
    zone: 'SRM Nagar Station Gateway',
    type: 'BIKE',
    capacity: 45,
    available: 3,
    rate: '₹5/hr',
    image: '/assets/srm/srm-potheri-gate.jpg'
  },
  {
    num: 14,
    id: 14,
    name: 'SRM Bus Parking & Transport Depo',
    category: 'University Transit Bus Fleet',
    zone: 'Transport Depo Terminal',
    type: 'BUS',
    capacity: 25,
    available: 2,
    rate: '₹25/hr',
    image: '/assets/srm/srm-bus-terminal.jpg'
  },
  {
    num: 15,
    id: 15,
    name: 'SRM Medical College & Global Hospital Parking',
    category: 'Hospital & Healthcare Staging',
    zone: 'Medical College & Hospital Boulevard',
    type: 'GENERAL',
    capacity: 45,
    available: 4,
    rate: '₹20/hr',
    image: '/assets/srm/srm-clock-tower.jpg'
  }
];

export const CampusParkingDirectory = () => {
  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAreas = ALL_14_PARKING_AREAS.filter((area) => {
    const matchFilter = 
      filterType === 'ALL' ||
      (filterType === 'BIKE' && area.type === 'BIKE') ||
      (filterType === 'CAR' && (area.type === 'CAR' || area.type === 'GENERAL')) ||
      (filterType === 'BUS' && area.type === 'BUS');

    const matchSearch = 
      searchTerm === '' ||
      area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.zone.toLowerCase().includes(searchTerm.toLowerCase());

    return matchFilter && matchSearch;
  });

  return (
    <div className="w-full space-y-6">
      
      {/* Title & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--surface-secondary)] text-[var(--text-secondary)] text-xs font-semibold mb-2 border border-[var(--border)]">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Complete 15 Official SRM KTR Parking Areas</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Campus Parking Directory & Real-Time Bays
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Real photos and sensor telemetry for all 15 designated campus parking facilities across SRM Kattankulathur.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'ALL', label: 'All 15 Areas' },
            { id: 'BIKE', label: 'Two-Wheeler / Bike' },
            { id: 'CAR', label: 'Cars & Multi-Level' },
            { id: 'BUS', label: 'Bus Terminal' },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilterType(btn.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterType === btn.id
                  ? 'bg-[var(--accent)] text-[var(--accent-text)] shadow-xs'
                  : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of 14 Areas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredAreas.map((area, index) => (
          <motion.div
            key={area.num}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.02 }}
            whileHover={{ y: -4 }}
            className="card-surface card-surface-hover rounded-2xl overflow-hidden flex flex-col justify-between group border border-[var(--border)] box-glow"
          >
            {/* Real SRM Campus Photo Header */}
            <div className="h-36 w-full relative overflow-hidden bg-black">
              <img
                src={area.image}
                alt={area.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Number Badge */}
              <div className="absolute top-2.5 left-2.5 w-6 h-6 rounded-md bg-black/75 backdrop-blur-md text-white font-black text-xs flex items-center justify-center border border-white/20 shadow">
                #{area.num}
              </div>

              {/* Category Pill */}
              <div className="absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-white border border-white/20 truncate max-w-[150px]">
                {area.category}
              </div>

              {/* Rate & Live Bays */}
              <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-xs">
                <span className="font-bold text-emerald-400 flex items-center gap-1 drop-shadow">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {area.available} Open
                </span>
                <span className="font-extrabold bg-blue-600/90 backdrop-blur-md px-2 py-0.5 rounded text-[11px] shadow">
                  {area.rate}
                </span>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-4 flex flex-col flex-grow justify-between">
              <div>
                <h3 className="font-bold text-sm text-[var(--text-primary)] group-hover:text-blue-500 transition-colors line-clamp-1">
                  {area.name}
                </h3>
                
                <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mt-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span className="line-clamp-1">{area.zone}</span>
                </div>
              </div>

              {/* Direct Reserve Action */}
              <div className="mt-4 pt-3 border-t border-[var(--border)]">
                <Link
                  to={`/lot/${area.id}`}
                  className="w-full py-2 px-3 rounded-xl text-xs font-semibold btn-secondary flex items-center justify-center gap-1.5 group-hover:bg-[var(--accent)] group-hover:text-[var(--accent-text)] transition"
                >
                  <span>Select & Reserve</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
};
