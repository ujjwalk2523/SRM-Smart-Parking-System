import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

export const LotCard = ({ lot }) => {
  const availableSlots = lot.availableSlots ?? (lot.totalCapacity ? Math.floor(lot.totalCapacity * 0.6) : 0);
  const totalCapacity = lot.totalCapacity || 1;
  const occupancyPercent = Math.min(100, Math.round(((totalCapacity - availableSlots) / totalCapacity) * 100));

  const isLowAvailability = availableSlots <= 5 && availableSlots > 0;
  const isFull = availableSlots === 0;

  const SRM_LOCATION_PHOTOS = {
    1: '/assets/srm/srm-tech-park.jpg',
    2: '/assets/srm/srm-clock-tower.jpg',
    3: '/assets/srm/srm-college-road.jpg',
    4: '/assets/srm/srm-potheri-gate.jpg',
    5: '/assets/srm/srm-hostels.jpg',
    6: '/assets/srm/srm-bus-terminal.jpg',
  };

  // Fallback authentic SRM image
  const lotImg = lot.imageUrl || SRM_LOCATION_PHOTOS[lot.locationId] || '/assets/srm/srm-tech-park.jpg';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25 }}
      className="card-surface card-surface-hover rounded-2xl overflow-hidden flex flex-col group border border-[var(--border)] box-glow"
    >
      
      {/* Top Photo Banner */}
      <div className="relative h-44 overflow-hidden bg-[var(--surface-secondary)]">
        <img
          src={lotImg}
          alt={lot.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = '/assets/srm/srm-tech-park.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        
        {/* Availability Badge */}
        <div className="absolute top-3 right-3">
          {isFull ? (
            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-rose-600 text-white shadow-xs">
              Lot Full
            </span>
          ) : isLowAvailability ? (
            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-500 text-white shadow-xs">
              Only {availableSlots} Left
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-600 text-white shadow-xs">
              {availableSlots} Available
            </span>
          )}
        </div>

        {/* Operating Hours Tag */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs font-medium text-white bg-black/70 px-2.5 py-1 rounded-md backdrop-blur-xs border border-white/20">
          <Clock className="w-3.5 h-3.5 text-zinc-300" />
          <span>{lot.operatingHours || '24/7 Access'}</span>
        </div>
      </div>

      {/* Lot Details Body */}
      <div className="p-5 flex flex-col flex-grow justify-between gap-4">
        <div>
          <div className="flex items-center gap-1 text-xs text-[var(--text-muted)] font-bold mb-1">
            <MapPin className="w-3.5 h-3.5 text-blue-500" />
            <span className="line-clamp-1">{lot.locationName || lot.lotCode}</span>
          </div>

          <h3 className="font-bold text-base text-[var(--text-primary)] group-hover:text-[var(--brand-blue)] transition-colors line-clamp-1">
            {lot.name}
          </h3>

          <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-1">
            {lot.locationAddress || 'SRM KTR Campus Zone'}
          </p>

          {/* Capacity Progress Bar */}
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-xs text-[var(--text-secondary)] font-medium">
              <span>Occupancy</span>
              <span>{occupancyPercent}% ({totalCapacity - availableSlots}/{totalCapacity})</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--surface-secondary)] border border-[var(--border)] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  occupancyPercent > 85 ? 'bg-rose-500' : occupancyPercent > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${occupancyPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[var(--text-muted)] font-medium block">Campus Fare From</span>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold text-[var(--text-primary)]">₹5 - ₹20</span>
              <span className="text-xs text-[var(--text-muted)]">/hr</span>
            </div>
          </div>

          <Link
            to={`/lot/${lot.id}`}
            className="btn-primary flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition"
          >
            <span>Select Bay</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

    </motion.div>
  );
};
