import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Layers, 
  Navigation, 
  MapPin, 
  Car, 
  Bike, 
  Bus, 
  Compass, 
  ZoomIn, 
  ZoomOut, 
  Crosshair,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Move
} from 'lucide-react';

// Default center: SRM Institute of Science & Technology, Kattankulathur
const SRM_KTR_CENTER = [12.8231, 80.0442];
const DEFAULT_ZOOM = 16;

// Major campus anchor coordinates for quick navigation
const CAMPUS_SECTORS = [
  { id: 'tp', name: 'Tech Park & UB', coords: [12.8231, 80.0442], zoom: 17 },
  { id: 'icr', name: 'Intra College Road', coords: [12.8245, 80.0455], zoom: 17 },
  { id: 'col', name: 'College Road / Quad', coords: [12.8258, 80.0468], zoom: 17 },
  { id: 'poth', name: 'Potheri Entry Gate', coords: [12.8210, 80.0415], zoom: 17 },
  { id: 'hostel', name: 'Hostels Perimeter', coords: [12.8195, 80.0480], zoom: 17 },
  { id: 'bus', name: 'Bus Terminal & Depo', coords: [12.8270, 80.0430], zoom: 17 },
];

export const ParkingMapView = ({ 
  lots = [], 
  selectedLot = null, 
  onSelectLot, 
  userLocation = null,
  onUserLocationChange
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const userMarkerRef = useRef(null);

  const [mapMode, setMapMode] = useState('street'); // 'street' | 'satellite'
  const [scrollMode, setScrollMode] = useState('pan'); // 'pan' | 'zoom'
  const [activeSector, setActiveSector] = useState(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent double initialization

    // 100% Free Public Street Tile Layer: Standard OpenStreetMap (No API key, No watermarks)
    const streetLayer = L.tileLayer(
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }
    );

    // High-Resolution True Satellite Tile Layer (Esri World Imagery)
    const satelliteLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: '&copy; Esri, Maxar, Earthstar Geographics',
        maxZoom: 19,
      }
    );

    const initialLayer = mapMode === 'satellite' ? satelliteLayer : streetLayer;

    const map = L.map(mapContainerRef.current, {
      center: SRM_KTR_CENTER,
      zoom: DEFAULT_ZOOM,
      layers: [initialLayer],
      zoomControl: false, // We render our own accessible zoom controls
      scrollWheelZoom: false, // Handled customly for smooth canvas panning & scrolling
      dragging: true,
      touchZoom: true,
      keyboard: true,
      keyboardPanDelta: 120,
      inertia: true,
      attributionControl: false,
    });

    // Store layer references on the map instance for switching
    map._streetLayer = streetLayer;
    map._satelliteLayer = satelliteLayer;
    mapInstanceRef.current = map;

    // Create a markers feature group
    const markersGroup = L.featureGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Layer Toggle (Street <-> Satellite)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (mapMode === 'satellite') {
      if (map.hasLayer(map._streetLayer)) map.removeLayer(map._streetLayer);
      if (!map.hasLayer(map._satelliteLayer)) map.addLayer(map._satelliteLayer);
    } else {
      if (map.hasLayer(map._satelliteLayer)) map.removeLayer(map._satelliteLayer);
      if (!map.hasLayer(map._streetLayer)) map.addLayer(map._streetLayer);
    }
  }, [mapMode]);

  // Mouse wheel and trackpad listener: smoothly pan/scroll map canvas in all directions
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      const map = mapInstanceRef.current;
      if (!map) return;
      e.preventDefault();

      if (scrollMode === 'zoom' || e.ctrlKey || e.metaKey) {
        // Zoom on Ctrl + Wheel or if in zoom mode
        if (e.deltaY < 0) {
          map.zoomIn(1);
        } else if (e.deltaY > 0) {
          map.zoomOut(1);
        }
      } else {
        // Smoothly scroll and pan the map canvas in all 4 directions (X & Y)
        map.panBy([e.deltaX || 0, e.deltaY || 0], { animate: false });
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [scrollMode]);

  // Update Markers when lots change or selectedLot changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

const LOT_PRESET_COORDINATES = {
  1: [12.8228, 80.0438], // LOT-TP-BIKE
  2: [12.8234, 80.0446], // LOT-TP-UNIV
  3: [12.8239, 80.0440], // LOT-UB-CAR
  4: [12.8243, 80.0452], // LOT-ICR-01
  5: [12.8248, 80.0458], // LOT-ICR-BIKE
  6: [12.8252, 80.0450], // LOT-ICR-2W
  7: [12.8256, 80.0464], // LOT-COL-GEN
  8: [12.8263, 80.0470], // LOT-COL-MAIN
  9: [12.8259, 80.0477], // LOT-COL-BIKE
  10: [12.8213, 80.0418], // LOT-NGR-02
  11: [12.8206, 80.0412], // LOT-NGR-2W
  12: [12.8198, 80.0478], // LOT-PKS-BIKE
  13: [12.8192, 80.0486], // LOT-HST-2W
  14: [12.8272, 80.0432], // LOT-BUS-01
  15: [12.8241, 80.0473], // LOT-MED-01
  'LOT-TP-BIKE': [12.8228, 80.0438],
  'LOT-TP-UNIV': [12.8234, 80.0446],
  'LOT-UB-CAR': [12.8239, 80.0440],
  'LOT-ICR-01': [12.8243, 80.0452],
  'LOT-ICR-BIKE': [12.8248, 80.0458],
  'LOT-ICR-2W': [12.8252, 80.0450],
  'LOT-COL-GEN': [12.8256, 80.0464],
  'LOT-COL-MAIN': [12.8263, 80.0470],
  'LOT-COL-BIKE': [12.8259, 80.0477],
  'LOT-NGR-02': [12.8213, 80.0418],
  'LOT-NGR-2W': [12.8206, 80.0412],
  'LOT-PKS-BIKE': [12.8198, 80.0478],
  'LOT-HST-2W': [12.8192, 80.0486],
  'LOT-BUS-01': [12.8272, 80.0432],
  'LOT-MED-01': [12.8241, 80.0473],
};

    lots.forEach((lot, index) => {
      // Determine coordinates: prefer exact landmark presets for distinct uncrowded positioning
      let lat = Number(lot.latitude);
      let lng = Number(lot.longitude);

      if (LOT_PRESET_COORDINATES[lot.id] || LOT_PRESET_COORDINATES[lot.lotCode]) {
        const preset = LOT_PRESET_COORDINATES[lot.id] || LOT_PRESET_COORDINATES[lot.lotCode];
        lat = preset[0];
        lng = preset[1];
      } else if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        const baseCoords = {
          1: [12.8231, 80.0442],
          2: [12.8245, 80.0455],
          3: [12.8258, 80.0468],
          4: [12.8210, 80.0415],
          5: [12.8195, 80.0480],
          6: [12.8270, 80.0430],
        }[lot.locationId] || SRM_KTR_CENTER;

        const offsetAngle = (index * (360 / Math.max(lots.length, 1))) * (Math.PI / 180);
        const radius = 0.00045;
        lat = baseCoords[0] + Math.sin(offsetAngle) * radius;
        lng = baseCoords[1] + Math.cos(offsetAngle) * radius;
      }

      const isSelected = selectedLot?.id === lot.id;
      const available = lot.availableSlots ?? (lot.totalCapacity ? Math.floor(lot.totalCapacity * 0.6) : 0);

      // Color coding & accessibility
      let statusColor = '#16a34a'; // Green: Available
      let statusClass = 'bg-emerald-600';
      let statusLabel = 'Available';

      if (available === 0) {
        statusColor = '#dc2626'; // Red: Full
        statusClass = 'bg-rose-600';
        statusLabel = 'Full';
      } else if (available <= 5) {
        statusColor = '#d97706'; // Amber: Limited
        statusClass = 'bg-amber-500';
        statusLabel = 'Limited';
      }

      // Create Custom HTML Marker Icon
      const markerHtml = `
        <div class="custom-parking-marker" style="position: relative; cursor: pointer;">
          <div style="
            position: relative;
            width: ${isSelected ? '38px' : '32px'};
            height: ${isSelected ? '38px' : '32px'};
            background-color: ${isSelected ? '#0f172a' : statusColor};
            border: 2px solid #ffffff;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 4px 12px rgba(0,0,0,0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          ">
            <span style="
              transform: rotate(45deg);
              color: #ffffff;
              font-size: ${isSelected ? '12px' : '10px'};
              font-weight: 800;
              font-family: sans-serif;
              text-align: center;
              line-height: 1;
            ">
              ${available}
            </span>
          </div>
          ${isSelected ? `
            <span style="
              position: absolute;
              inset: -6px;
              border-radius: 50%;
              border: 2px solid #3b82f6;
              animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
              pointer-events: none;
            "></span>
          ` : ''}
          <span style="
            position: absolute;
            bottom: -18px;
            left: 50%;
            transform: translateX(-50%);
            white-space: nowrap;
            background: rgba(15, 23, 42, 0.88);
            color: #ffffff;
            font-size: 9px;
            font-weight: 700;
            padding: 1px 5px;
            border-radius: 4px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            pointer-events: none;
          ">
            ${lot.lotCode || `Bay`}
          </span>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'parking-pin-div-icon',
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -38],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      // Popup Content
      const popupHtml = `
        <div style="min-width: 190px; padding: 2px;">
          <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 2px;">
            ${lot.lotCode || 'SRM KTR'} • ${lot.locationName || 'Campus Zone'}
          </div>
          <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 6px; line-height: 1.2;">
            ${lot.name}
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; margin-bottom: 6px; padding: 4px 6px; background: #f1f5f9; border-radius: 6px;">
            <span style="font-weight: 600; color: #334155;">Availability:</span>
            <span style="font-weight: 800; color: ${statusColor};">
              ${available} / ${lot.totalCapacity || 30} Bays
            </span>
          </div>
          <div style="font-size: 11px; color: #475569; display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Campus Fare:</span>
            <span style="font-weight: 700;">₹5 - ₹20/hr</span>
          </div>
          <button id="lot-select-btn-${lot.id}" style="
            width: 100%;
            background: #0f172a;
            color: #ffffff;
            border: none;
            border-radius: 8px;
            padding: 6px 10px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
          ">
            Select Parking Facility →
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        if (onSelectLot) onSelectLot(lot);
        map.flyTo([lat, lng], 17, { duration: 0.6 });
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`lot-select-btn-${lot.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onSelectLot) onSelectLot(lot);
            map.closePopup();
          };
        }
      });

      markersGroup.addLayer(marker);
    });
  }, [lots, selectedLot, onSelectLot]);

  // Center on selected lot when changed externally
  useEffect(() => {
    if (!selectedLot || !mapInstanceRef.current) return;
    const lat = Number(selectedLot.latitude);
    const lng = Number(selectedLot.longitude);
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      mapInstanceRef.current.flyTo([lat, lng], 17, { duration: 0.8 });
    }
  }, [selectedLot]);

  // User Geolocation Pin
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const coords = [latitude, longitude];

        if (onUserLocationChange) {
          onUserLocationChange({ latitude, longitude });
        }

        const map = mapInstanceRef.current;
        if (map) {
          if (userMarkerRef.current) {
            map.removeLayer(userMarkerRef.current);
          }

          const userIcon = L.divIcon({
            html: `
              <div style="position: relative; display: flex; align-items: center; justify-content: center;">
                <span style="position: absolute; width: 24px; height: 24px; background: rgba(59, 130, 246, 0.4); border-radius: 50%; animation: ping 1.5s infinite;"></span>
                <span style="width: 14px; height: 14px; background: #2563eb; border: 2.5px solid #ffffff; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></span>
              </div>
            `,
            className: 'user-location-pin',
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          const userMarker = L.marker(coords, { icon: userIcon }).addTo(map);
          userMarker.bindPopup('<strong>Your Current Position</strong>').openPopup();
          userMarkerRef.current = userMarker;

          map.flyTo(coords, 17, { duration: 1 });
        }
      },
      () => {
        // Fallback: zoom to SRM KTR Center
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo(SRM_KTR_CENTER, DEFAULT_ZOOM, { duration: 0.8 });
        }
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handlePan = (direction) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const STEP = 160;
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
        map.flyTo(SRM_KTR_CENTER, DEFAULT_ZOOM, { duration: 0.6 });
        break;
      default:
        break;
    }
  };

  const handleJumpToSector = (sector) => {
    setActiveSector(sector.id);
    mapInstanceRef.current?.flyTo(sector.coords, sector.zoom, { duration: 0.8 });
  };

  return (
    <div className="relative w-full h-full min-h-[540px] sm:min-h-[640px] rounded-2xl overflow-hidden card-surface border border-[var(--border)] shadow-md flex flex-col">
      
      {/* Top Map Floating Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Campus Sector Shortcuts */}
        <div className="flex items-center gap-1.5 p-1 bg-[var(--surface)]/95 backdrop-blur-md rounded-xl border border-[var(--border)] shadow-sm overflow-x-auto max-w-full pointer-events-auto scrollbar-none">
          <div className="flex items-center gap-1 px-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider shrink-0">
            <Compass className="w-3.5 h-3.5 text-blue-500" />
            <span>Sectors:</span>
          </div>
          {CAMPUS_SECTORS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => handleJumpToSector(sec)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeSector === sec.id
                  ? 'bg-[var(--accent)] text-[var(--accent-text)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {sec.name}
            </button>
          ))}
        </div>

        {/* Satellite / Road Map Mode Switcher & Google Maps Launch */}
        <div className="flex items-center gap-2 pointer-events-auto shrink-0">
          <div className="flex items-center p-1 bg-[var(--surface)]/95 backdrop-blur-md rounded-xl border border-[var(--border)] shadow-sm">
            <button
              onClick={() => setMapMode('street')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mapMode === 'street'
                  ? 'bg-[var(--accent)] text-[var(--accent-text)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span>Street (OSM)</span>
            </button>
            <button
              onClick={() => setMapMode('satellite')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mapMode === 'satellite'
                  ? 'bg-[var(--accent)] text-[var(--accent-text)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Satellite</span>
            </button>
          </div>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${selectedLot?.latitude || 12.8231},${selectedLot?.longitude || 80.0442}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 bg-[var(--surface)]/95 backdrop-blur-md rounded-xl border border-[var(--border)] hover:border-blue-500 shadow-sm text-xs font-bold text-[var(--text-primary)] hover:text-blue-500 transition-all cursor-pointer"
            title="Open real coordinates in Google Maps"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden sm:inline">Google Maps</span>
          </a>
        </div>

      </div>

      {/* Main Leaflet Map Container */}
      <div ref={mapContainerRef} className="w-full h-full flex-grow z-0 min-h-[500px]" />

      {/* Bottom Floating Controls: Scroll Mode, D-Pad, Zoom & Locate */}
      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col items-end gap-2 pointer-events-auto">
        
        {/* Scroll Mode Switcher */}
        <div className="flex items-center p-1 bg-[var(--surface)]/95 backdrop-blur-md rounded-xl border border-[var(--border)] shadow-md text-[11px] font-bold">
          <button
            onClick={() => setScrollMode('pan')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              scrollMode === 'pan'
                ? 'bg-[var(--accent)] text-[var(--accent-text)] shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
            title="Mouse wheel scrolls/pans the map canvas"
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
          {/* Pan North / Up */}
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

          {/* Pan South / Down */}
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

        {/* Locate User Button */}
        <button
          onClick={handleLocateUser}
          className="p-2.5 rounded-xl bg-[var(--surface)]/95 backdrop-blur-md text-[var(--text-primary)] hover:bg-[var(--surface-secondary)] border border-[var(--border)] shadow-md transition flex items-center justify-center cursor-pointer"
          title="Find My Location"
          aria-label="Locate User Position"
        >
          <Crosshair className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </button>
      </div>

      {/* Bottom Floating Legend & Gesture Helper */}
      <div className="absolute bottom-4 left-4 z-[1000] pointer-events-auto hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-[var(--surface)]/95 backdrop-blur-md border border-[var(--border)] shadow-sm text-xs font-semibold">
        <div className="flex items-center gap-1 text-[var(--text-muted)] text-[11px] pr-2 border-r border-[var(--border)]">
          <span>🖱️ Wheel scrolls map • Ctrl+Wheel zooms • Arrow keys pan</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Limited</span>
        </div>
        <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Full</span>
        </div>
      </div>

    </div>
  );
};
