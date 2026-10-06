import React from 'react';
import { motion } from 'framer-motion';

/**
 * Authentic Automotive Mobility Brand Identity for SRM Smart Parking & Transit.
 * Features:
 * - Precision-sculpted aerodynamic vehicle & telemetry hex-shield emblem (Zero generic P or graduation cap)
 * - Matrix LED laser headlight ray and live pulsing emerald node beacon
 * - Bespoke typography using Space Grotesk and JetBrains Mono
 */
export const BrandLogo = ({ size = 'md', showBadge = true, className = '' }) => {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  const iconSizes = isSm ? 'w-8 h-8' : isLg ? 'w-11 h-11' : 'w-9 h-9';
  const svgSizes = isSm ? 'w-4 h-4' : isLg ? 'w-6 h-6' : 'w-5 h-5';
  const titleSize = isSm ? 'text-sm' : isLg ? 'text-xl' : 'text-base';
  const subSize = isSm ? 'text-[8.5px]' : isLg ? 'text-[10px]' : 'text-[9.5px]';

  return (
    <div className={`flex items-center gap-3 select-none group ${className}`}>
      
      {/* 3D Automotive Hex-Shield Emblem */}
      <motion.div
        whileHover={{ scale: 1.08, rotate: 2 }}
        whileTap={{ scale: 0.94 }}
        className={`relative ${iconSizes} rounded-xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-blue-500/40 dark:border-blue-400/50 shadow-md flex items-center justify-center shrink-0 overflow-hidden cursor-pointer`}
      >
        {/* Holographic lens flare sheen */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/25 via-transparent to-cyan-400/30 pointer-events-none" />

        {/* Custom Aerodynamic Automotive Mobility Shield SVG */}
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${svgSizes} relative z-10 drop-shadow-[0_2px_8px_rgba(37,99,235,0.5)]`}
        >
          <defs>
            <linearGradient id="shieldGrad" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3b82f6" />
              <stop offset="0.5" stopColor="#1d4ed8" />
              <stop offset="1" stopColor="#0ea5e9" />
            </linearGradient>
            <linearGradient id="carGrad" x1="6" y1="11" x2="27" y2="18" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" />
              <stop offset="1" stopColor="#93c5fd" />
            </linearGradient>
          </defs>

          {/* Precision Automotive Hex-Shield Contour */}
          <path
            d="M16 2.5L27 7.5V17.5C27 23.5 22 28.5 16 30C10 28.5 5 23.5 5 17.5V7.5L16 2.5Z"
            stroke="url(#shieldGrad)"
            strokeWidth="1.6"
            strokeOpacity="0.7"
          />

          {/* Aerodynamic Sports Vehicle Roofline Profile */}
          <path
            d="M8 17.5C9.5 17.5 11 16.5 13 14C15.2 11.2 18 10.5 21.5 11C23.8 11.4 25.5 12.8 26.5 14.5L27.5 17.5H6.5L8 17.5Z"
            fill="url(#carGrad)"
          />

          {/* Wheel Arch Contours & Velocity Accents */}
          <circle cx="10.5" cy="18" r="2.2" stroke="#38bdf8" strokeWidth="1.5" />
          <circle cx="22.5" cy="18" r="2.2" stroke="#38bdf8" strokeWidth="1.5" />

          {/* Smart Telemetry Ground Horizon & Forward Beam */}
          <path
            d="M4 21.5H28"
            stroke="#38bdf8"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <path
            d="M11 25H21"
            stroke="#60a5fa"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeDasharray="2 3"
          />

          {/* Forward Matrix LED Headlight Ray */}
          <path
            d="M26 15.2L29.5 16.8"
            stroke="#38bdf8"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        {/* Live Active Telemetry Pulse LED Beacon */}
        <div className="absolute top-1 right-1 flex items-center justify-center">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping absolute opacity-75" />
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
        </div>
      </motion.div>

      {/* Wordmark Typography */}
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5">
          <span className={`font-display font-black tracking-[0.04em] ${titleSize} text-[var(--text-primary)] leading-tight`}>
            SRM<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-400">PARK</span>
          </span>

          {showBadge && (
            <span className="inline-flex items-center gap-1 text-[9px] font-mono-tech font-bold px-1.5 py-0.5 rounded-md bg-[var(--surface-secondary)] text-[var(--text-secondary)] border border-[var(--border)] tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              KTR CAMPUS
            </span>
          )}
        </div>

        <span className={`font-mono-tech ${subSize} tracking-[0.14em] text-[var(--text-muted)] font-semibold uppercase -mt-0.5`}>
          Smart Mobility & Transit
        </span>
      </div>

    </div>
  );
};
