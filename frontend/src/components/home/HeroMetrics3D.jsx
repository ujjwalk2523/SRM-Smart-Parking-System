import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { 
  Layers, 
  Radio, 
  Clock, 
  Zap, 
  CheckCircle2, 
  ArrowUpRight
} from 'lucide-react';

/**
 * Interactive 3D Cursor-Tracking Card.
 * Actively responds to mouse cursor position with:
 * - Real-time 3D rotation (rotateX & rotateY)
 * - Dynamic holographic spotlight glare that moves under the cursor
 * - Multi-layer 3D parallax depth (translateZ on child layers)
 * - Smooth spring-physics recoil on mouse leave
 */
const TiltCard3D = ({ card, idx }) => {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  // Raw normalized mouse coordinates (-0.5 to 0.5)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // High-fidelity spring physics
  const springConfig = { stiffness: 280, damping: 22 };
  const mouseXSpring = useSpring(x, springConfig);
  const mouseYSpring = useSpring(y, springConfig);

  // Dynamic 3D rotation angles mapped to mouse position
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [16, -16]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-16, 16]);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);

    setGlare({
      x: (mouseX / width) * 100,
      y: (mouseY / height) * 100,
      opacity: 0.65,
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  const Icon = card.icon;

  return (
    <div className="perspective-1200 w-full">
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={{
          y: isHovered ? -10 : card.floatY,
          scale: isHovered ? 1.04 : 1,
        }}
        transition={{
          y: isHovered 
            ? { duration: 0.25 }
            : {
                duration: 3.8 + idx * 0.4,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
                delay: card.delay,
              },
          scale: { duration: 0.2 },
        }}
        className={`relative rounded-2xl p-5 border border-[var(--border)] overflow-hidden cursor-pointer select-none transition-shadow duration-300 ${card.styleClass}`}
      >
        {/* Dynamic Holographic Specular Glare (tracks cursor in real time) */}
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-30"
          style={{
            background: `radial-gradient(circle 180px at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.22) 0%, transparent 80%)`,
            opacity: glare.opacity,
          }}
        />

        {/* Ambient colored backdrop glow */}
        <div 
          className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-40 transition-opacity duration-300"
          style={{ 
            backgroundColor: card.glowColor,
            opacity: isHovered ? 0.7 : 0.35,
          }}
        />

        {/* Top Rim Shimmer Line */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

        {/* --- 3D Parallax Layer 1: Header Badge & 3D Glass Pedestal (translateZ: 35px) --- */}
        <div 
          style={{ transform: 'translateZ(35px)' }} 
          className="flex items-center justify-between gap-2 mb-3.5 relative z-10"
        >
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[9.5px] font-mono-tech font-bold tracking-wider border ${card.badgeColor}`}>
            {card.isPulse && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            )}
            {card.badge}
          </span>

          {/* Floating 3D Icon Pedestal (elevated in Z space) */}
          <div 
            style={{ transform: 'translateZ(45px)' }}
            className={`w-9 h-9 rounded-xl ${card.iconBg} border flex items-center justify-center shrink-0 shadow-md transition-transform duration-200 group-hover:scale-110`}
          >
            <Icon className={`w-4 h-4 ${card.iconColor}`} />
          </div>
        </div>

        {/* --- 3D Parallax Layer 2: Big Display Number (translateZ: 40px) --- */}
        <div 
          style={{ transform: 'translateZ(40px)' }}
          className="flex items-baseline gap-1.5 relative z-10 mt-1"
        >
          <span className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-[var(--text-primary)]">
            {card.value}
          </span>
          <span className="font-mono-tech font-bold text-[11px] sm:text-xs text-[var(--text-muted)] tracking-wider">
            {card.unit}
          </span>
        </div>

        {/* --- 3D Parallax Layer 3: Title & Description (translateZ: 25px) --- */}
        <div 
          style={{ transform: 'translateZ(25px)' }}
          className="mt-1.5 relative z-10 text-left"
        >
          <h4 className="text-xs font-bold text-[var(--text-secondary)] tracking-tight">
            {card.label}
          </h4>
          <p className="text-[11px] text-[var(--text-muted)] line-clamp-1 mt-0.5">
            {card.subtext}
          </p>
        </div>

        {/* --- 3D Parallax Layer 4: Bottom Telemetry Pill (translateZ: 20px) --- */}
        <div 
          style={{ transform: 'translateZ(20px)' }}
          className="mt-3.5 pt-2.5 border-t border-[var(--border)]/70 flex items-center justify-between text-[10px] font-mono-tech text-[var(--text-muted)] relative z-10"
        >
          <span className="flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
            <span>{card.status}</span>
          </span>
          <span className="text-[9px] opacity-60 flex items-center gap-0.5">
            <span>SRM-KTR</span>
            <ArrowUpRight className="w-2.5 h-2.5 opacity-40" />
          </span>
        </div>

      </motion.div>
    </div>
  );
};

export const HeroMetrics3D = () => {
  const cards = [
    {
      id: 'lots',
      badge: 'SRM CAMPUS NETWORK',
      badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      value: '15',
      unit: 'HUBS',
      label: 'Designated Campus Lots',
      subtext: 'All KTR Academic, Admin & Hostel Enclaves',
      status: '100% Pinned',
      icon: Layers,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/15 border-blue-500/30',
      styleClass: 'card-3d-blue',
      glowColor: 'rgba(37, 99, 235, 0.45)',
      floatY: [0, -6, 0],
      delay: 0,
    },
    {
      id: 'telemetry',
      badge: 'LIVE IOT TELEMETRY',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      value: '< 0.4s',
      unit: 'LATENCY',
      label: 'Real-Time Bay Telemetry',
      subtext: 'Ultrasonic & Geomagnetic Sensor Grid',
      status: 'LoRaWAN 868MHz Active',
      icon: Radio,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/15 border-emerald-500/30',
      styleClass: 'card-3d-emerald',
      glowColor: 'rgba(16, 185, 129, 0.45)',
      floatY: [0, -8, 0],
      delay: 0.25,
      isPulse: true,
    },
    {
      id: 'grace',
      badge: 'COMPLIMENTARY PASS',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      value: '15',
      unit: 'MIN FREE',
      label: 'Drop-Off Grace Window',
      subtext: 'Quick Student Drop & Pickup Toll Waiver',
      status: 'Automated Boom Barrier',
      icon: Clock,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/15 border-amber-500/30',
      styleClass: 'card-3d-amber',
      glowColor: 'rgba(245, 158, 11, 0.45)',
      floatY: [0, -7, 0],
      delay: 0.5,
    },
    {
      id: 'rates',
      badge: 'SUBSIDIZED TARIFF',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
      value: '₹5 - ₹20',
      unit: '/ HOUR',
      label: 'Subsidized Campus Rates',
      subtext: 'Flat Tier for Two-Wheelers, EVs & Cars',
      status: 'RFID & UPI Instant',
      icon: Zap,
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/15 border-purple-500/30',
      styleClass: 'card-3d-purple',
      glowColor: 'rgba(168, 85, 247, 0.45)',
      floatY: [0, -6, 0],
      delay: 0.75,
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto mt-12 px-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {cards.map((card, idx) => (
          <TiltCard3D key={card.id} card={card} idx={idx} />
        ))}
      </div>
    </div>
  );
};
