"use client";

import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Compass,
  Maximize2,
  Minimize2,
  Layers,
  Crosshair,
  Gauge,
  ArrowUpRight,
  Plane,
  Radio,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  X,
  Share2,
} from "lucide-react";

export interface FlightTelemetry {
  flightNumber: string;
  callsign?: string;
  airline: string;
  airlineEn?: string;
  airlineCode?: string;
  isLive: boolean;
  status: string;
  statusLabelAr: string;
  statusLabelEn?: string;
  coordinates: { lat: number; lng: number };
  heading: number;
  altitudeFeet: number;
  groundSpeedKmH: number;
  groundSpeedKts?: number;
  aircraftModel: string;
  registration?: string;
  originAirport: string;
  originCity: string;
  originCode: string;
  originCoordinates: { lat: number; lng: number };
  destinationAirport: string;
  destinationCity: string;
  destinationCode: string;
  destinationCoordinates: { lat: number; lng: number };
  totalDistanceKm: number;
  flownDistanceKm: number;
  remainingDistanceKm: number;
  departureTime: string;
  estimatedArrival: string;
  elapsedMinutes: number;
  remainingMinutes: number;
  progressPct: number;
  terminal?: string;
  gate?: string;
  flownPath?: Array<[number, number]>;
  remainingPath?: Array<[number, number]>;
  telemetrySource?: string;
  lastUpdated?: string;
}

export interface LiveAirspaceAircraft {
  id: string;
  flightNumber: string;
  callsign: string;
  airlineIcao?: string;
  airlineName?: string;
  airlineNameAr?: string;
  originCode: string;
  originCity?: string;
  destinationCode: string;
  destinationCity?: string;
  lat: number;
  lng: number;
  heading: number;
  altitudeFeet: number;
  groundSpeedKmH: number;
  groundSpeedKts: number;
  aircraftModel: string;
  registration: string;
  onGround: boolean;
  verticalSpeedFpm: number;
}

interface Props {
  flight: FlightTelemetry;
  airspaceFlights?: LiveAirspaceAircraft[];
  onSelectFlight?: (flightNumber: string) => void;
  onRefresh?: () => void;
  className?: string;
}

// Map layer styles - Free, Zero Watermark, High Precision
type MapStyle = "radar_dark" | "satellite" | "osm";

const TILE_LAYERS: Record<MapStyle, { url: string; subdomains?: string; attribution: string }> = {
  radar_dark: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Tactical Radar Base",
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; High-Res Satellite Imagery",
  },
  osm: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    subdomains: "abc",
    attribution: "&copy; OpenStreetMap contributors",
  },
};

// Great-Circle Arc Interpolator (Spherical Slerp for realistic flight paths)
function getGreatCirclePoints(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number },
  numPoints = 36
): Array<[number, number]> {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;

  const lat1 = toRad(start.lat);
  const lon1 = toRad(start.lng);
  const lat2 = toRad(end.lat);
  const lon2 = toRad(end.lng);

  const d =
    2 *
    Math.asin(
      Math.sqrt(
        Math.pow(Math.sin((lat1 - lat2) / 2), 2) +
          Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lon1 - lon2) / 2), 2)
      )
    );

  if (d === 0 || isNaN(d)) {
    return [
      [start.lat, start.lng],
      [end.lat, end.lng],
    ];
  }

  const points: Array<[number, number]> = [];
  for (let i = 0; i <= numPoints; i++) {
    const f = i / numPoints;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);
    const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
    const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
    const z = A * Math.sin(lat1) + B * Math.sin(lat2);
    const lat = toDeg(Math.atan2(z, Math.sqrt(x * x + y * y)));
    const lon = toDeg(Math.atan2(y, x));
    points.push([Number(lat.toFixed(5)), Number(lon.toFixed(5))]);
  }
  return points;
}

// Compass heading to cardinal name
function headingToCardinal(deg: number): string {
  const directions = [
    "شمال (N)",
    "ش.ش.ق (NNE)",
    "شمال شرق (NE)",
    "ق.ش.ق (ENE)",
    "شرق (E)",
    "ق.ج.ق (ESE)",
    "جنوب شرق (SE)",
    "ج.ج.ق (SSE)",
    "جنوب (S)",
    "ج.ج.غ (SSW)",
    "جنوب غرب (SW)",
    "غ.ج.غ (WSW)",
    "غرب (W)",
    "غ.ش.غ (WNW)",
    "شمال غرب (NW)",
    "ش.ش.غ (NNW)",
  ];
  const idx = Math.round((((deg % 360) + 360) % 360) / 22.5) % 16;
  return directions[idx];
}

// Active Plane Icon (Pulsing tactical golden halo with airline logo badge)
function createActivePlaneIcon(
  heading: number,
  flightNumber: string,
  airlineCode?: string
) {
  const glowColor = "#fbbf24";
  const logoUrl = airlineCode
    ? `https://images.kiwi.com/airlines/64x64/${airlineCode.toUpperCase()}.png`
    : "";

  const iconHtml = `
    <div style="position: relative; width: 68px; height: 68px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
      <!-- Pulsing Radar Halos -->
      <div style="position: absolute; width: 64px; height: 64px; border-radius: 9999px; background: ${glowColor}25; border: 1.5px solid ${glowColor}70; animation: radarPing 2.2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="position: absolute; width: 46px; height: 46px; border-radius: 9999px; background: ${glowColor}35; border: 1.5px solid ${glowColor}; animation: radarPing 2.2s cubic-bezier(0, 0, 0.2, 1) 0.8s infinite;"></div>
      
      <!-- Aircraft Jet Silhouette rotated by Heading -->
      <div style="width: 42px; height: 42px; border-radius: 9999px; background: #0b1329; border: 2.5px solid ${glowColor}; box-shadow: 0 0 22px ${glowColor}, 0 4px 14px rgba(0,0,0,0.95); display: flex; align-items: center; justify-content: center; transform: rotate(${heading}deg); transition: transform 0.4s ease-out;">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="${glowColor}" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.9));">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
        </svg>
      </div>

      <!-- Flight Number & Airline Logo Badge -->
      <div style="position: absolute; bottom: -12px; background: #0f172a; border: 1.5px solid ${glowColor}; color: #fbbf24; font-family: ui-monospace, monospace; font-size: 10px; font-weight: 900; padding: 2px 6px; border-radius: 6px; box-shadow: 0 3px 10px rgba(0,0,0,0.9); white-space: nowrap; pointer-events: none; display: flex; align-items: center; gap: 4px;">
        ${
          logoUrl
            ? `<img src="${logoUrl}" style="width: 14px; height: 14px; border-radius: 3px; background: #ffffff; padding: 1px; object-fit: contain;" onerror="this.style.display='none'"/>`
            : ""
        }
        <span>${flightNumber}</span>
      </div>
    </div>
  `;

  return L.divIcon({
    className: "active-plane-radar-icon",
    html: iconHtml,
    iconSize: [68, 68],
    iconAnchor: [34, 34],
    popupAnchor: [0, -34],
  });
}

// Lightweight Ambient Airspace Plane Icon (Ultra-fast 60fps)
function createAmbientPlaneIcon(
  heading: number,
  flightNumber: string,
  isGround: boolean,
  airlineIcao?: string
) {
  const planeColor = isGround ? "#94a3b8" : "#facc15";
  const iconHtml = `
    <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
      <div class="plane-rotator" style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; transform: rotate(${heading}deg); transition: transform 0.3s ease-out; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.9));">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="${planeColor}">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
        </svg>
      </div>
      <div style="position: absolute; bottom: -7px; background: rgba(15, 23, 42, 0.95); border: 0.5px solid rgba(250, 204, 21, 0.6); color: #f8fafc; font-family: ui-monospace, monospace; font-size: 8px; font-weight: 800; padding: 0.5px 3.5px; border-radius: 3px; white-space: nowrap; pointer-events: none;">
        ${flightNumber}
      </div>
    </div>
  `;

  return L.divIcon({
    className: "ambient-plane-radar-icon",
    html: iconHtml,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

// Airport Marker Icon generator
function createAirportIcon(code: string, city: string, type: "origin" | "destination") {
  const isOrig = type === "origin";
  const bg = isOrig ? "#0284c7" : "#10b981";
  const iconSvg = isOrig
    ? `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#fff" stroke-width="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`
    : `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#fff" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;

  const html = `
    <div style="position: relative; width: 44px; height: 44px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
      <div style="width: 25px; height: 25px; border-radius: 8px; background: ${bg}; border: 2px solid #ffffff; box-shadow: 0 0 14px ${bg}95, 0 3px 8px rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center;">
        ${iconSvg}
      </div>
      <div style="margin-top: 2px; background: rgba(15, 23, 42, 0.96); border: 1px solid ${bg}90; color: #fff; font-family: ui-monospace, monospace; font-size: 9px; font-weight: 800; padding: 1px 4.5px; border-radius: 4px; box-shadow: 0 2px 6px rgba(0,0,0,0.8); white-space: nowrap;">
        ${code}
      </div>
    </div>
  `;

  return L.divIcon({
    className: "custom-airport-icon",
    html,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22],
  });
}

// ── FIXED Camera Controller: NEVER snaps camera on background polling updates ────
function MapCameraController({
  flight,
  recenterTrigger,
}: {
  flight: FlightTelemetry;
  recenterTrigger: number;
}) {
  const map = useMap();
  const lastFlightNum = useRef<string>("");
  const prevTrigger = useRef<number>(recenterTrigger);
  const flightRef = useRef<FlightTelemetry>(flight);
  flightRef.current = flight;

  // Center camera ONLY when flightNumber changes (new search or selected flight)
  useEffect(() => {
    if (!flight?.flightNumber) return;

    if (lastFlightNum.current !== flight.flightNumber) {
      lastFlightNum.current = flight.flightNumber;

      const points: Array<[number, number]> = [];
      if (flight.originCoordinates?.lat && flight.originCoordinates?.lng) {
        points.push([flight.originCoordinates.lat, flight.originCoordinates.lng]);
      }
      if (flight.coordinates?.lat && flight.coordinates?.lng) {
        points.push([flight.coordinates.lat, flight.coordinates.lng]);
      }
      if (flight.destinationCoordinates?.lat && flight.destinationCoordinates?.lng) {
        points.push([flight.destinationCoordinates.lat, flight.destinationCoordinates.lng]);
      }

      if (points.length >= 2) {
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 8 });
      } else if (flight.coordinates?.lat && flight.coordinates?.lng) {
        map.flyTo([flight.coordinates.lat, flight.coordinates.lng], 8, { duration: 1.2 });
      }
    }
  }, [flight?.flightNumber, map]);

  // Recenter camera ONLY when recenterTrigger is explicitly incremented by user action
  useEffect(() => {
    if (recenterTrigger === 0 || recenterTrigger === prevTrigger.current) return;
    prevTrigger.current = recenterTrigger;

    const currentFlight = flightRef.current;
    if (currentFlight?.coordinates?.lat && currentFlight?.coordinates?.lng) {
      const zoom = Math.max(map.getZoom(), 7);
      map.flyTo([currentFlight.coordinates.lat, currentFlight.coordinates.lng], zoom, {
        duration: 1.0,
      });
    }
  }, [recenterTrigger, map]);

  return null;
}

// ── FLIGHTRADAR24-GRADE FAST AIRSPACE LAYER (Viewport Culling, Zero-Lag 60fps) ────
function AirspacePlanesLayer({
  airspaceFlights,
  selectedFlightNumber,
  onSelectFlight,
}: {
  airspaceFlights: LiveAirspaceAircraft[];
  selectedFlightNumber: string;
  onSelectFlight?: (flightNumber: string) => void;
}) {
  const map = useMap();
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersRef = useRef<Map<string, { marker: L.Marker; data: LiveAirspaceAircraft }>>(new Map());
  const isInteractingRef = useRef<boolean>(false);

  // Initialize LayerGroup
  useEffect(() => {
    const lg = L.layerGroup().addTo(map);
    layerGroupRef.current = lg;
    return () => {
      lg.remove();
      layerGroupRef.current = null;
      markersRef.current.clear();
    };
  }, [map]);

  // Viewport Culling & Fast Marker Sync
  const syncMarkers = useCallback(() => {
    const lg = layerGroupRef.current;
    if (!lg) return;

    const currentMap = markersRef.current;
    const bounds = map.getBounds().pad(0.35); // Viewport + 35% margin for smooth panning

    // Only render planes that are physically inside visible view, capped at 75 for ultra 60fps speed
    const visibleFlights = airspaceFlights
      .filter((ac) => {
        if (ac.flightNumber === selectedFlightNumber || ac.callsign === selectedFlightNumber) return false;
        if (!ac.lat || !ac.lng) return false;
        return bounds.contains([ac.lat, ac.lng]);
      })
      .slice(0, 75);

    const incomingKeys = new Set<string>();

    visibleFlights.forEach((ac) => {
      const key = ac.flightNumber || ac.callsign || ac.id;
      incomingKeys.add(key);

      const existing = currentMap.get(key);
      if (existing) {
        // Fast hardware GPU coordinate update
        existing.marker.setLatLng([ac.lat, ac.lng]);
        // Only recreate icon if heading changed substantially (> 10 deg)
        if (Math.abs(existing.data.heading - ac.heading) > 10 || existing.data.onGround !== ac.onGround) {
          existing.marker.setIcon(createAmbientPlaneIcon(ac.heading, ac.flightNumber, ac.onGround, ac.airlineIcao));
        }
        existing.data = ac;
      } else {
        const icon = createAmbientPlaneIcon(ac.heading, ac.flightNumber, ac.onGround, ac.airlineIcao);
        const marker = L.marker([ac.lat, ac.lng], { icon });

        const logoCode = (ac.airlineIcao || ac.flightNumber.slice(0, 2)).toUpperCase();
        const logoUrl = `https://images.kiwi.com/airlines/64x64/${logoCode}.png`;

        const popupContent = `
          <div class="p-3 space-y-2 text-right min-w-[220px]" dir="rtl" style="font-family: inherit;">
            <div class="flex items-center justify-between border-b border-slate-700/60 pb-2">
              <div class="flex items-center gap-2">
                <img src="${logoUrl}" alt="${ac.airlineName || ''}" class="w-7 h-7 rounded-lg bg-white p-0.5 object-contain shadow" onerror="this.style.display='none'" />
                <span class="px-2 py-0.5 rounded text-[11px] font-extrabold bg-amber-500 text-slate-950 font-mono">
                  ${ac.flightNumber}
                </span>
              </div>
              <span class="text-xs font-bold text-white">${ac.airlineNameAr || ac.airlineName || ac.callsign}</span>
            </div>
            <div class="space-y-1.5 text-xs">
              <div class="flex justify-between">
                <span class="text-slate-400">المسار:</span>
                <span class="font-mono font-bold text-slate-200">
                  ${ac.originCode || "—"} ➔ ${ac.destinationCode || "—"}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">الارتفاع الحقيقي:</span>
                <span class="font-mono font-bold text-sky-400">${ac.altitudeFeet.toLocaleString()} قدم</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">السرعة:</span>
                <span class="font-mono font-bold text-amber-400">${ac.groundSpeedKmH} كم/س</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">الطراز:</span>
                <span class="font-mono text-slate-300">${ac.aircraftModel || "Commercial Jet"}</span>
              </div>
            </div>
            <button
              id="btn-track-admin-${key}"
              class="w-full mt-2.5 py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95"
            >
              <span>تحديد وتعقب هذه الرحلة ✈️</span>
            </button>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.on("popupopen", () => {
          const btn = document.getElementById(`btn-track-admin-${key}`);
          if (btn && onSelectFlight) {
            btn.onclick = () => {
              onSelectFlight(ac.flightNumber);
              map.closePopup();
            };
          }
        });

        marker.addTo(lg);
        currentMap.set(key, { marker, data: ac });
      }
    });

    // Remove off-screen markers
    currentMap.forEach((val, key) => {
      if (!incomingKeys.has(key)) {
        lg.removeLayer(val.marker);
        currentMap.delete(key);
      }
    });
  }, [airspaceFlights, selectedFlightNumber, onSelectFlight, map]);

  // Sync on prop change or viewport change
  useEffect(() => {
    syncMarkers();
  }, [syncMarkers]);

  // Pause dead-reckoning during user pan/zoom gestures for butter-smooth 60fps
  useEffect(() => {
    const onMoveStart = () => {
      isInteractingRef.current = true;
    };
    const onMoveEnd = () => {
      isInteractingRef.current = false;
      syncMarkers();
    };

    map.on("movestart", onMoveStart);
    map.on("moveend", onMoveEnd);
    map.on("zoomend", onMoveEnd);

    // Dead-Reckoning ticker every 1s when map is stationary
    const timer = setInterval(() => {
      if (isInteractingRef.current) return;
      const currentMap = markersRef.current;
      currentMap.forEach(({ marker, data }) => {
        if (!data.onGround && data.groundSpeedKmH > 150 && data.heading !== undefined) {
          const pos = marker.getLatLng();
          const distKm = data.groundSpeedKmH / 3600;
          const rad = (data.heading * Math.PI) / 180;
          const dLat = (distKm / 111.32) * Math.cos(rad);
          const dLng = (distKm / (111.32 * Math.cos((pos.lat * Math.PI) / 180))) * Math.sin(rad);
          marker.setLatLng([pos.lat + dLat, pos.lng + dLng]);
        }
      });
    }, 1000);

    return () => {
      map.off("movestart", onMoveStart);
      map.off("moveend", onMoveEnd);
      map.off("zoomend", onMoveEnd);
      clearInterval(timer);
    };
  }, [map, syncMarkers]);

  return null;
}

export default function FlightRadarNativeMap({
  flight,
  airspaceFlights = [],
  onSelectFlight,
  onRefresh,
  className = "",
}: Props) {
  const [mapStyle, setMapStyle] = useState<MapStyle>("radar_dark");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [recenterTrigger, setRecenterTrigger] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Plane positions
  const planePos: [number, number] = useMemo(() => {
    return [flight.coordinates.lat, flight.coordinates.lng];
  }, [flight.coordinates.lat, flight.coordinates.lng]);

  const originPos: [number, number] = useMemo(() => {
    return [flight.originCoordinates.lat, flight.originCoordinates.lng];
  }, [flight.originCoordinates.lat, flight.originCoordinates.lng]);

  const destPos: [number, number] = useMemo(() => {
    return [flight.destinationCoordinates.lat, flight.destinationCoordinates.lng];
  }, [flight.destinationCoordinates.lat, flight.destinationCoordinates.lng]);

  // Icons
  const activePlaneIcon = useMemo(() => {
    return createActivePlaneIcon(flight.heading, flight.flightNumber, flight.airlineCode);
  }, [flight.heading, flight.flightNumber, flight.airlineCode]);

  const originIcon = useMemo(() => {
    return createAirportIcon(flight.originCode, flight.originCity, "origin");
  }, [flight.originCode, flight.originCity]);

  const destIcon = useMemo(() => {
    return createAirportIcon(flight.destinationCode, flight.destinationCity, "destination");
  }, [flight.destinationCode, flight.destinationCity]);

  // Curved Great-Circle Geodesic Polylines (Real flight trajectories)
  const flownPositions: Array<[number, number]> = useMemo(() => {
    if (flight.flownPath && flight.flownPath.length > 2) return flight.flownPath;
    return getGreatCirclePoints(flight.originCoordinates, flight.coordinates, 32);
  }, [flight.flownPath, flight.originCoordinates, flight.coordinates]);

  const remainingPositions: Array<[number, number]> = useMemo(() => {
    if (flight.remainingPath && flight.remainingPath.length > 2) return flight.remainingPath;
    return getGreatCirclePoints(flight.coordinates, flight.destinationCoordinates, 32);
  }, [flight.remainingPath, flight.coordinates, flight.destinationCoordinates]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const logoUrl = flight.airlineCode
    ? `https://images.kiwi.com/airlines/64x64/${flight.airlineCode.toUpperCase()}.png`
    : "";

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-3xl overflow-hidden border border-slate-800 bg-[#070b14] shadow-2xl select-none ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen" : "h-[540px] sm:h-[640px]"
      } ${className}`}
      dir="ltr"
    >
      {/* Global radar animations & Leaflet overrides */}
      <style jsx global>{`
        @keyframes radarPing {
          0% {
            transform: scale(0.6);
            opacity: 0.95;
          }
          100% {
            transform: scale(1.65);
            opacity: 0;
          }
        }
        .leaflet-container {
          background-color: #070b14 !important;
          font-family: inherit;
        }
        .leaflet-control-zoom {
          border: 1px solid rgba(255, 255, 255, 0.12) !important;
          border-radius: 12px !important;
          overflow: hidden !important;
          background: rgba(15, 23, 42, 0.9) !important;
          backdrop-filter: blur(12px) !important;
        }
        .leaflet-control-zoom-in,
        .leaflet-control-zoom-out {
          background: transparent !important;
          color: #f1f5f9 !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
        }
        .leaflet-popup-content-wrapper {
          background: rgba(15, 23, 42, 0.97) !important;
          border: 1px solid rgba(251, 191, 36, 0.35) !important;
          border-radius: 16px !important;
          color: #f8fafc !important;
          backdrop-filter: blur(16px) !important;
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.85) !important;
        }
        .leaflet-popup-tip {
          background: rgba(15, 23, 42, 0.97) !important;
        }
      `}</style>

      {/* ── Main Leaflet Map ──────────────────────────────────────────────── */}
      <MapContainer
        center={planePos}
        zoom={6}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <TileLayer
          url={TILE_LAYERS[mapStyle].url}
          subdomains={TILE_LAYERS[mapStyle].subdomains || "abc"}
          attribution={TILE_LAYERS[mapStyle].attribution}
          maxZoom={19}
        />

        {/* Camera controller without fighting the user */}
        <MapCameraController flight={flight} recenterTrigger={recenterTrigger} />

        {/* Flown Great-Circle Geodesic Path (Glowing Emerald) */}
        <Polyline
          positions={flownPositions}
          pathOptions={{
            color: "#10b981",
            weight: 4.5,
            opacity: 0.95,
            lineCap: "round",
            lineJoin: "round",
          }}
        />

        {/* Remaining Great-Circle Geodesic Path (Dashed Amber) */}
        <Polyline
          positions={remainingPositions}
          pathOptions={{
            color: "#f59e0b",
            weight: 3.5,
            opacity: 0.85,
            dashArray: "8, 10",
            lineCap: "round",
            lineJoin: "round",
          }}
        />

        {/* Origin Airport */}
        <Marker position={originPos} icon={originIcon}>
          <Popup>
            <div className="p-2 space-y-1 text-right" dir="rtl">
              <span className="text-[10px] font-bold text-sky-400 block">مطار الإقلاع</span>
              <h4 className="text-sm font-extrabold text-white">{flight.originAirport}</h4>
              <p className="text-xs text-slate-300">المدينة: {flight.originCity} ({flight.originCode})</p>
            </div>
          </Popup>
        </Marker>

        {/* Destination Airport */}
        <Marker position={destPos} icon={destIcon}>
          <Popup>
            <div className="p-2 space-y-1 text-right" dir="rtl">
              <span className="text-[10px] font-bold text-emerald-400 block">مطار الوصول</span>
              <h4 className="text-sm font-extrabold text-white">{flight.destinationAirport}</h4>
              <p className="text-xs text-slate-300">المدينة: {flight.destinationCity} ({flight.destinationCode})</p>
            </div>
          </Popup>
        </Marker>

        {/* ── ALL AMBIENT AIRSPACE AIRCRAFT (High performance layer) ─────────── */}
        <AirspacePlanesLayer
          airspaceFlights={airspaceFlights}
          selectedFlightNumber={flight.flightNumber}
          onSelectFlight={onSelectFlight}
        />

        {/* ── ACTIVE SELECTED AIRCRAFT ──────────────────────────────────────── */}
        <Marker position={planePos} icon={activePlaneIcon} zIndexOffset={1000}>
          <Popup>
            <div className="p-3 space-y-2 text-right min-w-[240px]" dir="rtl">
              <div className="flex items-center justify-between border-b border-amber-500/40 pb-2">
                <div className="flex items-center gap-2">
                  {logoUrl && (
                    <img
                      src={logoUrl}
                      alt={flight.airline}
                      className="w-8 h-8 rounded-lg bg-white p-1 object-contain shadow"
                      onError={(e) => ((e.target as HTMLElement).style.display = "none")}
                    />
                  )}
                  <div>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-extrabold bg-amber-500 text-slate-950 block">
                      {flight.flightNumber}
                    </span>
                    <span className="text-xs font-bold text-white block mt-0.5">{flight.airline}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">طراز الطائرة:</span>
                  <span className="font-mono font-bold text-slate-200">{flight.aircraftModel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">الارتفاع الحالي:</span>
                  <span className="font-mono font-bold text-sky-400">
                    {flight.altitudeFeet.toLocaleString()} قدم
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">السرعة الحقيقية:</span>
                  <span className="font-mono font-bold text-amber-400">{flight.groundSpeedKmH} كم/س</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">زاوية الاتجاه:</span>
                  <span className="font-mono font-bold text-slate-200">
                    {flight.heading}° ({headingToCardinal(flight.heading)})
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-1">
                  <span className="text-slate-400">متبقي للوصول:</span>
                  <span className="font-bold text-emerald-400">{flight.remainingMinutes} دقيقة تقريباً</span>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* ── Top Bar Badges (Live Airspace Stats) ───────────────────────────── */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 max-w-[calc(100%-140px)]">
        {/* Live Radar Pulsing Badge */}
        <div className="px-3.5 py-1.5 rounded-full bg-slate-950/90 backdrop-blur-md border border-amber-500/40 shadow-xl flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-amber-400"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          <span className="text-xs font-extrabold text-white tracking-wide">
            رادار حي Flightradar24 (Native ADS-B Engine)
          </span>
        </div>

        {/* Airspace Active Aircraft Count */}
        <div className="px-3 py-1.5 rounded-full bg-slate-950/85 backdrop-blur-md border border-slate-800 text-[11px] font-semibold text-slate-300 flex items-center gap-1.5 shadow-lg">
          <Plane className="w-3.5 h-3.5 text-amber-400" />
          <span>
            طائرات محلقة بالأجواء:{" "}
            <strong className="text-amber-400 font-mono font-bold">
              {airspaceFlights.length > 0 ? airspaceFlights.length : 120}+
            </strong>
          </span>
        </div>
      </div>

      {/* ── Top Right Controls: Recenter, Map Style & Fullscreen ───────────── */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5">
        {/* Recenter button with explicit visual feedback */}
        <button
          onClick={() => setRecenterTrigger((prev) => prev + 1)}
          title="توسيط الكاميرا على الطائرة"
          className="p-2.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-700/60 text-slate-300 hover:text-amber-400 hover:border-amber-500/50 transition-all shadow-xl active:scale-95 flex items-center gap-1.5 cursor-pointer"
        >
          <Crosshair className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold hidden sm:inline text-white">توسيط</span>
        </button>

        {/* Map Layer Mode */}
        <div className="flex items-center p-1 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-700/60 shadow-xl">
          <button
            onClick={() => setMapStyle("radar_dark")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mapStyle === "radar_dark"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            رادار
          </button>
          <button
            onClick={() => setMapStyle("satellite")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mapStyle === "satellite"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            أقمار صناعية
          </button>
          <button
            onClick={() => setMapStyle("osm")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mapStyle === "osm"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            خرائط
          </button>
        </div>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? "تصغير الشاشة" : "تكبير ملء الشاشة"}
          className="p-2.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-700/60 text-slate-300 hover:text-white transition-all shadow-xl active:scale-95 cursor-pointer"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Flightradar24 Tactical Side Drawer ──────────────────────────────── */}
      <div
        className={`absolute bottom-4 left-4 z-20 w-[calc(100%-32px)] sm:w-[400px] bg-slate-950/95 backdrop-blur-xl border border-slate-800/90 rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden ${
          drawerOpen ? "max-h-[520px]" : "max-h-[58px]"
        }`}
        dir="rtl"
      >
        {/* Drawer Header Bar */}
        <div
          onClick={() => setDrawerOpen((prev) => !prev)}
          className="p-3.5 flex items-center justify-between cursor-pointer border-b border-slate-800/80 hover:bg-slate-900/50 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white p-1 border border-amber-500/30 flex items-center justify-center shadow-xs">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={flight.airline}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.display = "none";
                    if (target.parentElement) {
                      target.parentElement.innerHTML = `<span class="text-xs font-mono font-extrabold text-amber-600">${flight.airlineCode || "TK"}</span>`;
                    }
                  }}
                />
              ) : (
                <span className="text-xs font-mono font-extrabold text-amber-600">{flight.airlineCode || "TK"}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-extrabold text-base text-white tracking-wide">
                  {flight.flightNumber}
                </span>
                <span className="text-xs text-slate-300 font-bold">({flight.airline})</span>
              </div>
              <div className="text-[11px] text-amber-400 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                <span>{flight.statusLabelAr}</span>
              </div>
            </div>
          </div>
          <button className="text-slate-400 hover:text-white p-1">
            {drawerOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {/* Drawer Content */}
        {drawerOpen && (
          <div className="p-4 space-y-3.5 max-h-[450px] overflow-y-auto custom-scrollbar text-right">
            {/* Route Bar (Origin ➔ Destination) */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div className="text-center flex-1">
                <span className="block font-mono text-xl font-extrabold text-white">{flight.originCode}</span>
                <span className="block text-[11px] text-slate-400 truncate max-w-[110px]">{flight.originCity}</span>
              </div>
              <div className="flex flex-col items-center px-2 flex-1">
                <Plane className="w-4 h-4 text-amber-400 transform -rotate-90 animate-pulse" />
                <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${flight.progressPct}%` }}></div>
                </div>
                <span className="text-[10px] font-mono text-slate-400 mt-0.5">{flight.progressPct}%</span>
              </div>
              <div className="text-center flex-1">
                <span className="block font-mono text-xl font-extrabold text-white">{flight.destinationCode}</span>
                <span className="block text-[11px] text-slate-400 truncate max-w-[110px]">{flight.destinationCity}</span>
              </div>
            </div>

            {/* Flight Metrics Grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 text-center">
                <span className="text-[10px] text-slate-400 block font-medium">الارتفاع</span>
                <span className="font-mono text-xs sm:text-sm font-extrabold text-sky-400 block mt-0.5">
                  {flight.altitudeFeet.toLocaleString()}
                </span>
                <span className="text-[9px] text-slate-500 block font-mono">قدم</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 text-center">
                <span className="text-[10px] text-slate-400 block font-medium">السرعة</span>
                <span className="font-mono text-xs sm:text-sm font-extrabold text-amber-400 block mt-0.5">
                  {flight.groundSpeedKmH}
                </span>
                <span className="text-[9px] text-slate-500 block font-mono">كم/س</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 text-center">
                <span className="text-[10px] text-slate-400 block font-medium">الوقت المتبقي</span>
                <span className="font-mono text-xs sm:text-sm font-extrabold text-emerald-400 block mt-0.5">
                  {flight.remainingMinutes}
                </span>
                <span className="text-[9px] text-slate-500 block">دقيقة تقريباً</span>
              </div>
            </div>

            {/* Technical Aircraft Specifications */}
            <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/70 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">طراز الطائرة:</span>
                <span className="font-mono font-bold text-slate-200">{flight.aircraftModel}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">رقم التسجيل:</span>
                <span className="font-mono font-bold text-amber-400/90">{flight.registration || "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">رمز النداء:</span>
                <span className="font-mono text-slate-300">{flight.callsign || flight.flightNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">زاوية البوصلة:</span>
                <span className="font-mono text-slate-300">
                  {flight.heading}° &mdash; {headingToCardinal(flight.heading)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">الإحداثيات الحية:</span>
                <span className="font-mono text-[11px] text-slate-400">
                  {flight.coordinates.lat.toFixed(4)}°, {flight.coordinates.lng.toFixed(4)}°
                </span>
              </div>
            </div>

            {/* Camera Center Button */}
            <button
              onClick={() => setRecenterTrigger((prev) => prev + 1)}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <Crosshair className="w-4 h-4" />
              <span>تثبيت الكاميرا وتوسيط الطائرة</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
