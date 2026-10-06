import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  Layers, 
  ZoomIn, 
  Building, 
  Navigation, 
  Compass, 
  Car, 
  Bike,
  Bus,
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Info,
  ExternalLink,
  Globe,
  Camera,
  Zap,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ZoomOut,
  RotateCcw,
  Move
} from 'lucide-react';

const SRM_KTR_CENTER = [12.8231, 80.0442];

// Complete 15 Official SRM KTR Parking Facilities
const ALL_15_CAMPUS_LOTS = [
  {
    num: 1,
    id: 1,
    lotId: 1,
    lotCode: 'LOT-TP-BIKE',
    name: 'Tech Park Bike Parking',
    zone: 'Tech Park & UB Sector',
    category: 'High-Rise Ground Two-Wheeler',
    lat: 12.8228,
    lng: 80.0438,
    top: '32%',
    left: '50%',
    image: '/assets/srm/srm-tech-park.jpg',
    type: 'BIKE',
    capacity: 40,
    available: 3,
    rate: '₹5/hr',
    description: 'Ground-level covered bike bays adjacent to the 15-floor Tech Park main entrance with ultrasonic sensors.',
  },
  {
    num: 2,
    id: 2,
    lotId: 2,
    lotCode: 'LOT-TP-UNIV',
    name: 'SRM University Parking',
    zone: 'Tech Park & UB Sector',
    category: 'General Multi-Level Facility',
    lat: 12.8234,
    lng: 80.0446,
    top: '34%',
    left: '54%',
    image: '/assets/srm/srm-tech-park.jpg',
    type: 'GENERAL',
    capacity: 50,
    available: 4,
    rate: '₹20/hr',
    description: '3-tier multi-level parking deck accommodating cars, bikes, and student SUVs with ANPR boom barriers.',
  },
  {
    num: 3,
    id: 3,
    lotId: 3,
    lotCode: 'LOT-UB-CAR',
    name: 'Car Parking (Tech Park / UB)',
    zone: 'Tech Park / UB Plaza',
    category: 'Faculty & Executive Car Bays',
    lat: 12.8239,
    lng: 80.0440,
    top: '30%',
    left: '52%',
    image: '/assets/srm/srm-tech-park.jpg',
    type: 'CAR',
    capacity: 30,
    available: 3,
    rate: '₹20/hr',
    description: 'Dedicated car parking area facing the University Building plaza with EV charging spots.',
  },
  {
    num: 4,
    id: 4,
    lotId: 4,
    lotCode: 'LOT-ICR-01',
    name: 'Parking Lot 1 — Intra College Road',
    zone: 'Intra College Road (Clock Tower)',
    category: 'Central Clock Tower Staging',
    lat: 12.8243,
    lng: 80.0452,
    top: '46%',
    left: '46%',
    image: '/assets/srm/srm-clock-tower.jpg',
    type: 'GENERAL',
    capacity: 35,
    available: 3,
    rate: '₹20/hr',
    description: 'Central campus artery parking lot directly opposite the Central Library and Admin Quadrangle.',
  },
  {
    num: 5,
    id: 5,
    lotId: 5,
    lotCode: 'LOT-ICR-BIKE',
    name: 'Bike Parking — Intra College Road',
    zone: 'Intra College Road Staging',
    category: 'Central Academic Two-Wheeler',
    lat: 12.8248,
    lng: 80.0458,
    top: '48%',
    left: '48%',
    image: '/assets/srm/srm-clock-tower.jpg',
    type: 'BIKE',
    capacity: 40,
    available: 2,
    rate: '₹5/hr',
    description: 'Designated two-wheeler bays serving students attending lectures in Bio-Tech and Mechanical blocks.',
  },
  {
    num: 6,
    id: 6,
    lotId: 6,
    lotCode: 'LOT-ICR-2W',
    name: "Two-Wheeler's Parking — Admin Quad",
    zone: 'Intra College Road South',
    category: 'South Quad Covered Bays',
    lat: 12.8252,
    lng: 80.0450,
    top: '50%',
    left: '45%',
    image: '/assets/srm/srm-clock-tower.jpg',
    type: 'BIKE',
    capacity: 30,
    available: 2,
    rate: '₹5/hr',
    description: 'Covered canopy bike bays situated near university administrative headquarters and auditorium.',
  },
  {
    num: 7,
    id: 7,
    lotId: 7,
    lotCode: 'LOT-COL-GEN',
    name: 'Parking Lot — College Road',
    zone: 'College Road Main Corridor',
    category: 'Main Gate Vehicle Depo',
    lat: 12.8256,
    lng: 80.0464,
    top: '62%',
    left: '40%',
    image: '/assets/srm/srm-college-road.jpg',
    type: 'CAR',
    capacity: 35,
    available: 3,
    rate: '₹20/hr',
    description: 'Main boulevard corridor lot situated near campus food courts and banking facilities.',
  },
  {
    num: 8,
    id: 8,
    lotId: 8,
    lotCode: 'LOT-COL-MAIN',
    name: 'Parking — General Parking (College Road)',
    zone: 'College Road Quad',
    category: 'Main Campus Quad General',
    lat: 12.8263,
    lng: 80.0470,
    top: '65%',
    left: '38%',
    image: '/assets/srm/srm-college-road.jpg',
    type: 'GENERAL',
    capacity: 40,
    available: 3,
    rate: '₹20/hr',
    description: 'Spacious ground-level parking near university main archway entry gate on GST Road connector.',
  },
  {
    num: 9,
    id: 9,
    lotId: 9,
    lotCode: 'LOT-COL-BIKE',
    name: 'Bike Parking — College Road',
    zone: 'College Road Bays',
    category: 'Main Boulevard Two-Wheeler',
    lat: 12.8259,
    lng: 80.0477,
    top: '64%',
    left: '42%',
    image: '/assets/srm/srm-college-road.jpg',
    type: 'BIKE',
    capacity: 35,
    available: 2,
    rate: '₹5/hr',
    description: 'High-turnover short-stay bike parking bays along College Road boulevard for rapid student drop-offs.',
  },
  {
    num: 10,
    id: 10,
    lotId: 10,
    lotCode: 'LOT-NGR-02',
    name: 'Parking Lot 2 — Potheri Station Gate',
    zone: 'Potheri / SRM Nagar Gate',
    category: 'SRM Nagar Station Transit',
    lat: 12.8213,
    lng: 80.0418,
    top: '76%',
    left: '44%',
    image: '/assets/srm/srm-potheri-gate.jpg',
    type: 'CAR',
    capacity: 35,
    available: 3,
    rate: '₹15/hr',
    description: 'Suburban train commuter parking facility connecting Potheri railway station crossroad to campus.',
  },
  {
    num: 11,
    id: 11,
    lotId: 11,
    lotCode: 'LOT-NGR-2W',
    name: 'Two Wheeler Parking — SRM Nagar',
    zone: 'SRM Nagar Station Gateway',
    category: 'Suburban Gateway Staging',
    lat: 12.8206,
    lng: 80.0412,
    top: '80%',
    left: '42%',
    image: '/assets/srm/srm-potheri-gate.jpg',
    type: 'BIKE',
    capacity: 45,
    available: 3,
    rate: '₹5/hr',
    description: 'Subsidized day-rate two-wheeler staging area directly at the SRM Nagar gate entry barrier.',
  },
  {
    num: 12,
    id: 12,
    lotId: 12,
    lotCode: 'LOT-PKS-BIKE',
    name: 'Bike Parking — Hostels Perimeter',
    zone: 'Pillayar Koil Street & Hostels',
    category: 'Pillayar Koil Street Perimeter',
    lat: 12.8198,
    lng: 80.0478,
    top: '24%',
    left: '38%',
    image: '/assets/srm/srm-hostels.jpg',
    type: 'BIKE',
    capacity: 35,
    available: 2,
    rate: '₹5/hr',
    description: 'Perimeter bike parking adjacent to student dining mess and hostel recreation grounds.',
  },
  {
    num: 13,
    id: 13,
    lotId: 13,
    lotCode: 'LOT-HST-2W',
    name: 'SRM Parking — Hostels (Paari / Oori)',
    zone: 'Hostel Enclave (Paari/Oori)',
    category: 'Two-Wheeler Student Residential',
    lat: 12.8192,
    lng: 80.0486,
    top: '20%',
    left: '40%',
    image: '/assets/srm/srm-hostels.jpg',
    type: 'BIKE',
    capacity: 40,
    available: 3,
    rate: '₹5/hr',
    description: 'Secure student hostel resident parking with 24/7 RFID boom barrier control and CCTV monitoring.',
  },
  {
    num: 14,
    id: 14,
    lotId: 14,
    lotCode: 'LOT-BUS-01',
    name: 'SRM Bus Parking & Transport Depo',
    zone: 'Transport Depo Terminal',
    category: 'University Transit Bus Fleet',
    lat: 12.8272,
    lng: 80.0432,
    top: '15%',
    left: '28%',
    image: '/assets/srm/srm-bus-terminal.jpg',
    type: 'BUS',
    capacity: 25,
    available: 2,
    rate: '₹25/hr',
    description: 'Central logistics hub managing university transit bus fleet and inter-campus shuttle services.',
  },
  {
    num: 15,
    id: 15,
    lotId: 15,
    lotCode: 'LOT-MED-01',
    name: 'SRM Medical College & Global Hospital Parking',
    zone: 'Medical College & Hospital Boulevard',
    category: 'Hospital & Healthcare Staging',
    lat: 12.8241,
    lng: 80.0473,
    top: '52%',
    left: '58%',
    image: '/assets/srm/srm-clock-tower.jpg',
    type: 'GENERAL',
    capacity: 45,
    available: 4,
    rate: '₹20/hr',
    description: 'Dedicated parking facility serving SRM Global Hospitals, Medical College, and emergency healthcare visitors.',
  }
];

export const CampusMapNavigator = () => {
  const [activeTab, setActiveTab] = useState('interactive'); // 'interactive' | 'masterplan' | 'gallery'
  const [mapMode, setMapMode] = useState('street'); // 'street' | 'satellite'
  const [scrollMode, setScrollMode] = useState('pan'); // 'pan' | 'zoom'
  const [selectedLot, setSelectedLot] = useState(ALL_15_CAMPUS_LOTS[0]);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

  const miniMapContainerRef = useRef(null);
  const miniMapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);

  // Initialize or handle Leaflet Map with ALL 15 PARKING PINS & Pan/Scroll support
  useEffect(() => {
    if (activeTab !== 'interactive') {
      if (miniMapInstanceRef.current) {
        miniMapInstanceRef.current.remove();
        miniMapInstanceRef.current = null;
      }
      return;
    }

    if (!miniMapContainerRef.current) return;
    if (miniMapInstanceRef.current) return;

    // Standard OpenStreetMap (100% Free, Zero API key, Zero Watermarks)
    const streetLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    });

    // Esri World Imagery (High-Resolution Satellite)
    const satelliteLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: '&copy; Esri, Maxar',
        maxZoom: 19,
      }
    );

    const initialLayer = mapMode === 'satellite' ? satelliteLayer : streetLayer;

    const map = L.map(miniMapContainerRef.current, {
      center: SRM_KTR_CENTER,
      zoom: 16,
      layers: [initialLayer],
      zoomControl: false,
      scrollWheelZoom: false, // Handled by our custom wheel listener for smooth scrolling/panning
      dragging: true,
      touchZoom: true,
      keyboard: true,
      keyboardPanDelta: 120,
      inertia: true,
      attributionControl: false,
    });

    map._streetLayer = streetLayer;
    map._satelliteLayer = satelliteLayer;
    miniMapInstanceRef.current = map;

    // Create marker group
    const markersGroup = L.featureGroup().addTo(map);
    markersGroupRef.current = markersGroup;

    // Render ALL 15 Markers
    renderAll15Markers(map, markersGroup, selectedLot.id);

    return () => {
      if (miniMapInstanceRef.current) {
        miniMapInstanceRef.current.remove();
        miniMapInstanceRef.current = null;
      }
    };
  }, [activeTab]);

  // Mouse wheel and trackpad listener: smoothly pan/scroll map in all directions
  useEffect(() => {
    if (activeTab !== 'interactive') return;
    const container = miniMapContainerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      const map = miniMapInstanceRef.current;
      if (!map) return;
      e.preventDefault();

      if (scrollMode === 'zoom' || e.ctrlKey || e.metaKey) {
        // Zoom mode or standard Ctrl + Wheel zooming
        if (e.deltaY < 0) {
          map.zoomIn(1);
        } else if (e.deltaY > 0) {
          map.zoomOut(1);
        }
      } else {
        // Scroll / pan map canvas smoothly in all 4 directions (X & Y)
        map.panBy([e.deltaX || 0, e.deltaY || 0], { animate: false });
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [activeTab, scrollMode]);

  // 4-Way Directional Pan handlers
  const handlePan = (direction) => {
    const map = miniMapInstanceRef.current;
    if (!map) return;
    const STEP = 150;
    switch (direction) {
      case 'up':
        map.panBy([0, -STEP], { animate: true, duration: 0.25 });
        break;
      case 'down':
        map.panBy([0, STEP], { animate: true, duration: 0.25 });
        break;
      case 'left':
        map.panBy([-STEP, 0], { animate: true, duration: 0.25 });
        break;
      case 'right':
        map.panBy([STEP, 0], { animate: true, duration: 0.25 });
        break;
      case 'center':
        map.flyTo(SRM_KTR_CENTER, 16, { duration: 0.6 });
        break;
      default:
        break;
    }
  };

  const handleZoomIn = () => miniMapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => miniMapInstanceRef.current?.zoomOut();

  const renderAll15Markers = (map, group, currentSelectedId) => {
    if (!group) return;
    group.clearLayers();

    ALL_15_CAMPUS_LOTS.forEach((lot) => {
      const isSelected = lot.id === currentSelectedId;
      
      const markerHtml = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          transform: translate(-50%, -100%);
          transition: transform 0.2s ease;
        ">
          <!-- Number Pin Bubble -->
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${isSelected ? '36px' : '30px'};
            height: ${isSelected ? '36px' : '30px'};
            border-radius: 50%;
            background: ${isSelected ? '#2563eb' : '#0f172a'};
            color: #ffffff;
            font-weight: 800;
            font-size: ${isSelected ? '12px' : '11px'};
            box-shadow: 0 0 ${isSelected ? '20px rgba(37,99,235,0.9)' : '10px rgba(0,0,0,0.5)'};
            border: 2px solid #ffffff;
            position: relative;
          ">
            #${lot.num}
            <!-- Available count badge -->
            <span style="
              position: absolute;
              top: -6px;
              right: -6px;
              background: #10b981;
              color: white;
              font-size: 9px;
              font-weight: 900;
              padding: 1px 4px;
              border-radius: 8px;
              border: 1.5px solid #ffffff;
              box-shadow: 0 1px 3px rgba(0,0,0,0.4);
            ">${lot.available}</span>
          </div>

          <!-- Pin Tail -->
          <div style="
            width: 0;
            height: 0;
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-top: 6px solid ${isSelected ? '#2563eb' : '#0f172a'};
          "></div>

          <!-- Lot Code Label Tag -->
          <div style="
            margin-top: 2px;
            background: rgba(15, 23, 42, 0.9);
            color: #ffffff;
            font-size: 9px;
            font-weight: 700;
            padding: 1px 5px;
            border-radius: 4px;
            white-space: nowrap;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 2px 4px rgba(0,0,0,0.5);
          ">
            ${lot.lotCode}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-srm-lot-marker',
        html: markerHtml,
        iconSize: [60, 50],
        iconAnchor: [30, 40],
      });

      const marker = L.marker([lot.lat, lot.lng], { icon: customIcon }).addTo(group);
      
      marker.on('click', () => {
        setSelectedLot(lot);
        map.flyTo([lot.lat, lot.lng], 17, { duration: 0.6 });
        renderAll15Markers(map, group, lot.id);
      });
    });
  };

  // Re-render markers and fly when selectedLot changes
  useEffect(() => {
    const map = miniMapInstanceRef.current;
    const group = markersGroupRef.current;
    if (map && group && selectedLot) {
      renderAll15Markers(map, group, selectedLot.id);
      map.flyTo([selectedLot.lat, selectedLot.lng], 17, { duration: 0.6 });
    }
  }, [selectedLot.id]);

  // Handle Layer Toggle in Mini Map
  useEffect(() => {
    const map = miniMapInstanceRef.current;
    if (!map) return;

    if (mapMode === 'satellite') {
      if (map.hasLayer(map._streetLayer)) map.removeLayer(map._streetLayer);
      if (!map.hasLayer(map._satelliteLayer)) map.addLayer(map._satelliteLayer);
    } else {
      if (map.hasLayer(map._satelliteLayer)) map.removeLayer(map._satelliteLayer);
      if (!map.hasLayer(map._streetLayer)) map.addLayer(map._streetLayer);
    }
  }, [mapMode]);

  return (
    <div className="w-full space-y-6">
      
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-secondary)] text-[var(--text-secondary)] text-xs font-semibold mb-2 border border-[var(--border)]">
            <Globe className="w-3.5 h-3.5 text-blue-500" />
            <span>All 15 Official SRM KTR Parking Facilities</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Campus Masterplan & All 15 Parking Facilities
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 max-w-2xl">
            Live interactive navigation across all 15 designated campus parking facilities at SRM Kattankulathur with real-time bay telemetry.
          </p>
        </div>

        {/* Tab Switcher: Live Map vs Masterplan Blueprint vs Real Photos */}
        <div className="flex items-center gap-1.5 p-1 bg-[var(--surface-secondary)] rounded-xl border border-[var(--border)] overflow-x-auto shadow-xs">
          {[
            { id: 'interactive', label: 'All 15 Facilities Map', icon: Globe },
            { id: 'masterplan', label: 'Campus Blueprint', icon: Building },
            { id: 'gallery', label: 'Real Campus Gallery', icon: Camera }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'text-[var(--text-primary)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeMapTab"
                    className="absolute inset-0 bg-[var(--surface)] rounded-lg shadow-xs border border-[var(--border)]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="w-3.5 h-3.5 relative z-10 text-blue-500" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Map Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Stage: Live Map with All 15 Pins */}
        <div className="lg:col-span-8 card-surface rounded-2xl overflow-hidden relative group border border-[var(--border)] box-glow">
          
          {/* Top Control Bar */}
          <div className="px-4 py-3 bg-[var(--surface-secondary)] border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-2 z-20">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
              <span className="w-5 h-5 rounded-md bg-blue-600 text-white font-black text-[11px] flex items-center justify-center">
                #{selectedLot.num}
              </span>
              <span className="font-bold">{selectedLot.name}</span>
              <span className="text-[var(--text-muted)] font-mono text-[11px] hidden sm:inline">• {selectedLot.lotCode}</span>
            </div>

            <div className="flex items-center gap-2">
              {activeTab === 'interactive' && (
                <div className="flex items-center p-0.5 bg-[var(--surface)] rounded-lg border border-[var(--border)] text-xs font-semibold">
                  <button
                    onClick={() => setMapMode('street')}
                    className={`px-2.5 py-1 rounded-md text-[11px] transition ${
                      mapMode === 'street' ? 'bg-[var(--accent)] text-[var(--accent-text)]' : 'text-[var(--text-muted)]'
                    }`}
                  >
                    Street
                  </button>
                  <button
                    onClick={() => setMapMode('satellite')}
                    className={`px-2.5 py-1 rounded-md text-[11px] transition flex items-center gap-1 ${
                      mapMode === 'satellite' ? 'bg-[var(--accent)] text-[var(--accent-text)]' : 'text-[var(--text-muted)]'
                    }`}
                  >
                    <Layers className="w-3 h-3" />
                    Satellite
                  </button>
                </div>
              )}

              {/* Direct Open in Google Maps */}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${selectedLot.lat},${selectedLot.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold btn-secondary cursor-pointer hover:text-blue-500"
                title="Open selected facility in Google Maps"
              >
                <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                <span className="hidden sm:inline">Google Maps</span>
              </a>

              <button
                onClick={() => setIsZoomModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold btn-secondary cursor-pointer"
                title="Full View"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Full Photo</span>
              </button>
            </div>
          </div>

          {/* Interactive Stage Viewport */}
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-black flex items-center justify-center overflow-hidden">
            
            {/* 1. Live Interactive Leaflet Map with ALL 15 PINS */}
            {activeTab === 'interactive' && (
              <div ref={miniMapContainerRef} className="w-full h-full z-0" />
            )}

            {/* 2. Campus Blueprint Masterplan with ALL 15 PINS */}
            {activeTab === 'masterplan' && (
              <div className="relative w-full h-full bg-black/90 flex items-center justify-center">
                <img
                  src="/assets/srm/srm-campus-layout.jpg"
                  alt="SRM Campus Masterplan"
                  className="w-full h-full object-contain"
                />

                {/* Overlaid Interactive Pins for all 15 lots */}
                <div className="absolute inset-0 pointer-events-none">
                  {ALL_15_CAMPUS_LOTS.map((lot) => {
                    const isSelected = selectedLot.id === lot.id;
                    return (
                      <div
                        key={lot.id}
                        style={{ top: lot.top, left: lot.left }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                      >
                        <motion.button
                          whileHover={{ scale: 1.25 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setSelectedLot(lot)}
                          className={`relative flex items-center justify-center p-1.5 rounded-full cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-blue-600 text-white shadow-xl ring-4 ring-blue-500/40'
                              : 'bg-[var(--surface)] text-[var(--text-primary)] shadow-md border border-[var(--border)]'
                          }`}
                          title={lot.name}
                        >
                          <span className="text-[10px] font-black w-5 h-5 flex items-center justify-center">
                            #{lot.num}
                          </span>
                        </motion.button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Real SRM Campus Gallery */}
            {activeTab === 'gallery' && (
              <div className="relative w-full h-full bg-black flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedLot.id}
                    src={selectedLot.image}
                    alt={selectedLot.name}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-4 left-4 right-4 pointer-events-none text-white">
                  <div className="inline-block px-2.5 py-1 rounded-lg bg-blue-600 text-[11px] font-bold mb-1 shadow">
                    #{selectedLot.num} • {selectedLot.lotCode}
                  </div>
                  <h4 className="text-lg font-bold drop-shadow">{selectedLot.name}</h4>
                  <p className="text-xs text-white/80 line-clamp-1 drop-shadow">{selectedLot.description}</p>
                </div>
              </div>
            )}

            {/* Bottom floating helper badge */}
            <div className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-auto bg-black/85 backdrop-blur-md px-3.5 py-2 rounded-xl text-white text-xs flex items-center gap-2 border border-white/10 shadow-lg pointer-events-none z-10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="font-medium text-[11px] sm:text-xs">
                🖱️ Scroll / Swipe to pan canvas • Ctrl + Scroll to zoom • Use D-Pad or Arrow keys to pan
              </span>
            </div>

            {/* Floating 4-Way Directional Pan (D-Pad) & Zoom Controller */}
            {activeTab === 'interactive' && (
              <div className="absolute top-3 right-3 z-[1000] flex flex-col items-end gap-2 pointer-events-auto">
                {/* Scroll Mode Switcher */}
                <div className="flex items-center p-1 bg-[var(--surface)]/95 backdrop-blur-md rounded-xl border border-[var(--border)] shadow-md text-[11px] font-bold">
                  <button
                    onClick={() => setScrollMode('pan')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      scrollMode === 'pan'
                        ? 'bg-[var(--accent)] text-[var(--accent-text)] shadow-xs'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                    title="Mouse wheel / trackpad scrolls and pans the map"
                  >
                    <Move className="w-3 h-3" />
                    <span>Scroll: Pan</span>
                  </button>
                  <button
                    onClick={() => setScrollMode('zoom')}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all cursor-pointer ${
                      scrollMode === 'zoom'
                        ? 'bg-[var(--accent)] text-[var(--accent-text)] shadow-xs'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                    title="Mouse wheel zooms in/out"
                  >
                    <ZoomIn className="w-3 h-3" />
                    <span>Zoom</span>
                  </button>
                </div>

                {/* 4-Way Pan D-Pad & Zoom Controls */}
                <div className="flex flex-col items-center p-1.5 bg-[var(--surface)]/95 backdrop-blur-md rounded-2xl border border-[var(--border)] shadow-xl">
                  {/* Pan Up / North */}
                  <button
                    onClick={() => handlePan('up')}
                    className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition cursor-pointer"
                    title="Scroll North / Up"
                    aria-label="Scroll North"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>

                  {/* Middle Row: West, Center, East */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handlePan('left')}
                      className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition cursor-pointer"
                      title="Scroll West / Left"
                      aria-label="Scroll West"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handlePan('center')}
                      className="p-1.5 rounded-lg text-blue-500 hover:text-blue-600 hover:bg-[var(--surface-secondary)] transition cursor-pointer"
                      title="Recenter SRM Campus View"
                      aria-label="Recenter Campus View"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handlePan('right')}
                      className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition cursor-pointer"
                      title="Scroll East / Right"
                      aria-label="Scroll East"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Pan Down / South */}
                  <button
                    onClick={() => handlePan('down')}
                    className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition cursor-pointer"
                    title="Scroll South / Down"
                    aria-label="Scroll South"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  <div className="w-full h-px bg-[var(--border)] my-1" />

                  {/* Zoom In & Out */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleZoomIn}
                      className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition cursor-pointer"
                      title="Zoom In"
                      aria-label="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleZoomOut}
                      className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] transition cursor-pointer"
                      title="Zoom Out"
                      aria-label="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Stage: Detailed Information for Selected Lot */}
        <div className="lg:col-span-4 space-y-4">
          
          <motion.div 
            key={selectedLot.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-surface rounded-2xl overflow-hidden border border-[var(--border)] box-glow"
          >
            {/* Real SRM Campus Photo Header */}
            <div className="relative h-44 w-full overflow-hidden bg-zinc-900">
              <img
                src={selectedLot.image}
                alt={selectedLot.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-md bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow">
                  #{selectedLot.num}
                </span>
                <span className="bg-black/70 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[10px] font-bold border border-white/20">
                  {selectedLot.lotCode}
                </span>
              </div>

              <div className="absolute bottom-3 left-3 right-3 text-white">
                <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mb-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {selectedLot.available} Open Bays Available
                </div>
                <h3 className="text-sm font-bold truncate drop-shadow">
                  {selectedLot.name}
                </h3>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-blue-500 uppercase tracking-wider">
                  {selectedLot.zone}
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {selectedLot.description}
                </p>
              </div>

              {/* Lot Specs & Telemetry */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border)] text-xs">
                <div className="p-2.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)]">
                  <span className="text-[10px] text-[var(--text-muted)] block">Capacity</span>
                  <span className="font-bold text-[var(--text-primary)]">{selectedLot.capacity} Bays</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border)]">
                  <span className="text-[10px] text-[var(--text-muted)] block">Rate</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedLot.rate}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to={`/lot/${selectedLot.lotId}`}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold btn-primary flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>Select Bay & Reserve (#{selectedLot.num})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedLot.lat},${selectedLot.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-xl text-xs font-semibold btn-secondary flex items-center justify-center gap-1.5 text-[var(--text-secondary)] hover:text-blue-500"
                >
                  <Navigation className="w-3.5 h-3.5 text-blue-500" />
                  <span>Navigate with Google Maps</span>
                </a>
              </div>
            </div>
          </motion.div>

          {/* Quick Facility Selector: All 15 Buttons */}
          <div className="card-surface rounded-2xl p-4 space-y-2.5 border border-[var(--border)] box-glow">
            <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
              <span>All 15 Facilities</span>
              <span className="text-[10px] text-[var(--text-muted)]">Click to pinpoint</span>
            </div>
            
            <div className="grid grid-cols-3 gap-1.5 max-h-[220px] overflow-y-auto pr-1">
              {ALL_15_CAMPUS_LOTS.map((lot) => (
                <button
                  key={lot.id}
                  onClick={() => setSelectedLot(lot)}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-bold text-left truncate transition cursor-pointer ${
                    selectedLot.id === lot.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-[var(--surface-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]'
                  }`}
                  title={`${lot.name} (${lot.lotCode})`}
                >
                  #{lot.num} {lot.lotCode.replace('LOT-', '')}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Fullscreen Zoom Modal */}
      <AnimatePresence>
        {isZoomModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col p-4 sm:p-6"
            onClick={() => setIsZoomModalOpen(false)}
          >
            <div className="flex items-center justify-between pb-4 text-white">
              <div>
                <h3 className="text-lg font-bold">#{selectedLot.num} • {selectedLot.name}</h3>
                <p className="text-xs text-zinc-400">{selectedLot.lotCode} • {selectedLot.zone}</p>
              </div>
              <button
                onClick={() => setIsZoomModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 text-xs font-semibold cursor-pointer"
              >
                Close (ESC)
              </button>
            </div>
            
            <div 
              className="flex-grow flex items-center justify-center overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedLot.image}
                alt={selectedLot.name}
                className="max-h-[85vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
