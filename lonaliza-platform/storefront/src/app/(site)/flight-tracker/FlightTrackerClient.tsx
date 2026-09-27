"use client";

import React, { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Plane,
  Radar,
  Search,
  Share2,
  Copy,
  Check,
  MapPin,
  Clock,
  Gauge,
  Compass,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  PhoneCall,
  Calendar,
  Layers,
  Radio,
  RefreshCw,
  ExternalLink,
  Crosshair,
  ArrowUpRight,
  Globe2,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import type { FlightTelemetry, LiveAirspaceAircraft } from "@/components/flights/FlightRadarNativeMap";

// Dynamic import for Leaflet-based map to avoid SSR window errors
const FlightRadarNativeMap = dynamic(
  () => import("@/components/flights/FlightRadarNativeMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[560px] sm:h-[680px] w-full rounded-3xl bg-[#060913] border border-slate-800 flex flex-col items-center justify-center gap-3 text-amber-400 shadow-2xl">
        <Radar className="w-10 h-10 animate-spin text-amber-400" />
        <span className="text-sm font-bold text-slate-300">
          جاري تشغيل رادار الطيران التكتيكي المباشر (Flightradar24 Live ADS-B Engine)...
        </span>
      </div>
    ),
  }
);

interface AirborneHighlight {
  code: string;
  callsign: string;
  airline: string;
  origin: string;
  destination: string;
  model: string;
  label: string;
}

// Quick suggested regional airlines with logos
const POPULAR_QUICK_CHIPS = [
  { code: "6H567", label: "Israir", iata: "6H", route: "TLV ➔ ATH" },
  { code: "TK1872", label: "Turkish", iata: "TK", route: "IST ➔ SAW" },
  { code: "PC434", label: "Pegasus", iata: "PC", route: "SAW ➔ AYT" },
  { code: "SV261", label: "Saudia", iata: "SV", route: "JED ➔ IST" },
  { code: "EK123", label: "Emirates", iata: "EK", route: "DXB ➔ IST" },
  { code: "G9818", label: "Air Arabia", iata: "G9", route: "SHJ ➔ IST" },
];

// Error boundary for bulletproof resilience in Android WebView & mobile browsers
class FlightTrackerErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: any }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("FlightTracker caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#060913] text-slate-100 p-6 text-center" dir="rtl">
          <Radar className="w-12 h-12 text-amber-400 animate-spin mb-4" />
          <h2 className="text-lg font-bold text-white mb-2">رادار الطيران التكتيكي المباشر</h2>
          <p className="text-xs text-slate-400 mb-6 max-w-sm">جاري إعادة مزامنة وتوصيل رادار البث الحي للأقمار الصناعية...</p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              if (typeof window !== "undefined") window.location.reload();
            }}
            className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-lg hover:bg-amber-400 transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>إعادة تحميل الرادار</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function FlightTrackerClientInner() {
  const [flightInput, setFlightInput] = useState("TK1872");
  const [activeFlight, setActiveFlight] = useState<FlightTelemetry | null>(null);
  const [airspaceFlights, setAirspaceFlights] = useState<LiveAirspaceAircraft[]>([]);
  const [airborneHighlights, setAirborneHighlights] = useState<AirborneHighlight[]>([]);
  const [totalAirborneCount, setTotalAirborneCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEmbed, setIsEmbed] = useState(false);
  const [hudCollapsed, setHudCollapsed] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());
  const [isAirspaceMode, setIsAirspaceMode] = useState(false);

  const fetchFlight = useCallback(async (flightCode: string, silent = false) => {
    const code = flightCode.trim().toUpperCase() || "TK1872";
    if (silent) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await fetch(`/api/transfers/flight-tracker?flight=${encodeURIComponent(code)}&source=web`);
      const json = await res.json();
      if (json && json.ok) {
        if (json.flight) {
          setActiveFlight(json.flight);
        }
        if (Array.isArray(json.airspaceFlights)) {
          setAirspaceFlights(json.airspaceFlights);
        }
        if (Array.isArray(json.airborneHighlights) && json.airborneHighlights.length > 0) {
          setAirborneHighlights(json.airborneHighlights);
        }
        if (json.totalAirborneCount) {
          setTotalAirborneCount(json.totalAirborneCount);
        }
        setLastRefreshedAt(new Date());
      }
    } catch (e) {
      console.error("Failed to fetch flight telemetry:", e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const isEmbedParam =
        params.get("embed") === "true" ||
        params.get("app") === "true" ||
        params.get("mode") === "mobile" ||
        params.get("mode") === "airspace";
      setIsEmbed(isEmbedParam);

      const q = params.get("flight") || params.get("flightNumber");
      if (q) {
        setFlightInput(q.toUpperCase());
        fetchFlight(q.toUpperCase());
        return;
      }
    }
    fetchFlight("TK1872");
  }, [fetchFlight]);

  // Real-time live auto-polling every 6 seconds for ultra-fresh ADS-B sync
  useEffect(() => {
    if (!activeFlight?.flightNumber) return;
    const interval = setInterval(() => {
      fetchFlight(activeFlight.flightNumber, true);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeFlight?.flightNumber, fetchFlight]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (flightInput.trim()) {
      fetchFlight(flightInput.trim());
    }
  };

  const handleSelectAirborneFlight = (code: string) => {
    setFlightInput(code);
    fetchFlight(code);
  };

  const handleShareWhatsApp = () => {
    if (!activeFlight) return;
    const text = `✈️ تابع رحلة طيران عائلتي مباشرة على رادار الطيران:\nرحلة رقم: ${activeFlight.flightNumber} (${activeFlight.airline})\nمن: ${activeFlight.originAirport} (${activeFlight.originCode}) إلى: ${activeFlight.destinationAirport} (${activeFlight.destinationCode})\nالارتفاع: ${activeFlight.altitudeFeet.toLocaleString()} قدم | السرعة: ${activeFlight.groundSpeedKmH} كم/س\nالمتبقي للهبوط: ${activeFlight.remainingMinutes} دقيقة تقريباً\nالرابط المباشر للتعقب الحي:\nhttps://lonaliza.com/flight-tracker?flight=${activeFlight.flightNumber}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleCopyLink = () => {
    if (!activeFlight) return;
    const url = `https://lonaliza.com/flight-tracker?flight=${activeFlight.flightNumber}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Unit conversion helpers
  const altitudeMeters = activeFlight ? Math.round(activeFlight.altitudeFeet * 0.3048) : 0;
  const groundSpeedKnots = activeFlight ? Math.round(activeFlight.groundSpeedKmH / 1.852) : 0;
  const logoUrl = activeFlight?.airlineCode
    ? `https://images.kiwi.com/airlines/64x64/${activeFlight.airlineCode.toUpperCase()}.png`
    : "";

const DEFAULT_FALLBACK_FLIGHT: FlightTelemetry = {
  flightNumber: "TK1982",
  callsign: "THY1982",
  airline: "الخطوط الجوية التركية",
  airlineEn: "Turkish Airlines",
  airlineCode: "TK",
  isLive: true,
  status: "active",
  statusLabelAr: "في الأجواء مباشرة",
  statusLabelEn: "Airborne",
  coordinates: { lat: 41.0082, lng: 28.9784 },
  heading: 110,
  altitudeFeet: 35000,
  groundSpeedKmH: 860,
  aircraftModel: "Airbus A350-900",
  originAirport: "مطار إسطنبول الدولي",
  originCity: "إسطنبول",
  originCode: "IST",
  originCoordinates: { lat: 41.2753, lng: 28.7519 },
  destinationAirport: "مطار أنطاليا الدولي",
  destinationCity: "أنطاليا",
  destinationCode: "AYT",
  destinationCoordinates: { lat: 36.8987, lng: 30.8005 },
  totalDistanceKm: 480,
  flownDistanceKm: 260,
  remainingDistanceKm: 220,
  departureTime: new Date(Date.now() - 35 * 60000).toISOString(),
  estimatedArrival: new Date(Date.now() + 45 * 60000).toISOString(),
  elapsedMinutes: 35,
  remainingMinutes: 45,
  progressPct: 54,
};

  const displayFlight = activeFlight || DEFAULT_FALLBACK_FLIGHT;

  if (isEmbed) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col w-screen h-screen bg-[#060913] text-slate-100 overflow-hidden font-sans select-none" dir="rtl">
        {/* Full-bleed interactive map taking 100% of viewport */}
        <div className="flex-1 relative w-full h-full overflow-hidden">
          <FlightRadarNativeMap
            flight={displayFlight}
            airspaceFlights={airspaceFlights}
            onSelectFlight={handleSelectAirborneFlight}
            onRefresh={() => fetchFlight(displayFlight.flightNumber, true)}
            hideDrawer={true}
            className="w-full h-full !rounded-none !border-0"
          />

          {/* Airspace Mode Indicator Badge */}
          {isAirspaceMode && (
            <div className="absolute top-3 inset-x-0 flex justify-center z-[400] pointer-events-none">
              <div className="px-3.5 py-1.5 rounded-full bg-slate-950/90 border border-amber-500/50 backdrop-blur-md shadow-2xl flex items-center gap-2 text-xs font-bold text-amber-400">
                <Radar className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>رادار الأجواء المباشر • {airspaceFlights.length || totalAirborneCount || "1,500+"} طائرة نشطة</span>
                <span className="text-[10px] text-slate-400">(المس أي طائرة لتفاصيلها)</span>
              </div>
            </div>
          )}

          {/* Floating Collapsible Flight HUD Bar at Bottom */}
          <div className="absolute bottom-3 inset-x-3 z-[400] transition-all duration-300">
            <div
              onClick={() => setHudCollapsed(!hudCollapsed)}
              className="p-3 rounded-2xl bg-slate-900/95 border border-slate-700/70 backdrop-blur-xl shadow-2xl space-y-2 cursor-pointer hover:border-amber-500/40 transition-all"
            >
              {/* HUD Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {logoUrl && (
                    <img src={logoUrl} alt="" className="w-6 h-6 object-contain rounded bg-white/10 p-0.5" />
                  )}
                  <div>
                    <div className="text-xs font-black text-white flex items-center gap-1.5 font-mono">
                      <span>{displayFlight.flightNumber}</span>
                      <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {displayFlight.statusLabelAr || "في الجو"}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">{displayFlight.airline}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-amber-400 font-mono">
                    {displayFlight.remainingMinutes > 0 ? `متبقي ${displayFlight.remainingMinutes} د` : "وصلت"}
                  </span>
                  <button
                    onClick={() => setHudCollapsed(!hudCollapsed)}
                    className="p-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                  >
                    {hudCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Collapsible Details */}
              {!hudCollapsed && (
                <div className="space-y-2 pt-1 border-t border-slate-800/80">
                  {/* Route line */}
                  <div className="flex items-center justify-between text-xs font-bold px-1">
                    <div className="text-right">
                      <span className="text-amber-400 font-mono">{displayFlight.originCode}</span>
                      <span className="text-[10px] text-slate-400 mr-1.5">{displayFlight.originCity}</span>
                    </div>
                    <div className="text-slate-500 font-mono text-[10px] flex items-center gap-1">
                      <span>➔</span>
                      <span>{displayFlight.totalDistanceKm} كم</span>
                      <span>➔</span>
                    </div>
                    <div className="text-left">
                      <span className="text-[10px] text-slate-400 ml-1.5">{displayFlight.destinationCity}</span>
                      <span className="text-amber-400 font-mono">{displayFlight.destinationCode}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(5, displayFlight.progressPct))}%` }}
                    />
                  </div>

                  {/* Telemetry Micro Grid */}
                  <div className="grid grid-cols-4 gap-1.5 text-center pt-0.5">
                    <div className="p-1 rounded bg-slate-950/60 border border-slate-800/80">
                      <div className="text-[9px] text-slate-400">الارتفاع</div>
                      <div className="text-[10px] font-mono font-bold text-amber-400">{displayFlight.altitudeFeet.toLocaleString()} ft</div>
                    </div>
                    <div className="p-1 rounded bg-slate-950/60 border border-slate-800/80">
                      <div className="text-[9px] text-slate-400">السرعة</div>
                      <div className="text-[10px] font-mono font-bold text-sky-400">{displayFlight.groundSpeedKmH} km/h</div>
                    </div>
                    <div className="p-1 rounded bg-slate-950/60 border border-slate-800/80">
                      <div className="text-[9px] text-slate-400">الاتجاه</div>
                      <div className="text-[10px] font-mono font-bold text-emerald-400">{displayFlight.heading}°</div>
                    </div>
                    <div className="p-1 rounded bg-slate-950/60 border border-slate-800/80">
                      <div className="text-[9px] text-slate-400">المتبقي</div>
                      <div className="text-[10px] font-mono font-bold text-purple-400">{displayFlight.remainingDistanceKm} كم</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 selection:bg-amber-500 selection:text-slate-950 pt-24 sm:pt-32 pb-24 px-3 sm:px-6 lg:px-8" dir="rtl">
      {/* ── EXPANDED TACTICAL COCKPIT CONTAINER ── */}
      <div className="w-full max-w-[1720px] mx-auto space-y-6 sm:space-y-8">
        
        {/* ── HERO COCKPIT HEADER ────────────────────────────────────────── */}
        <div className="text-center space-y-3.5 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-md">
            <Radio className="w-4 h-4 animate-pulse text-amber-400" />
            <span className="tracking-wide">رادار تتبع الطيران المباشر الحقيقي — Flightradar24 Tactical ADS-B Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-sm">
            رادار تتبع رحلات الطيران المباشر
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-3xl mx-auto">
            تابع مسار أي طائرة مدنية في سماء تركيا والشرق الأوسط والعالم لحظة بلحظة عبر أجهزة بث الرادار الحية (ADS-B)،
            مع بيانات الارتفاع، السرعة الحقيقية، والوقت المتبقي للهبوط مجاناً وبدقة 100%.
          </p>
        </div>

        {/* ── SEARCH BOX & QUICK FLIGHT CHIPS (HIGH CONTRAST) ─────────────── */}
        <div className="max-w-3xl mx-auto space-y-4">
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center shadow-2xl rounded-2xl bg-slate-900/90 border-2 border-slate-700 p-2 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all backdrop-blur-xl"
          >
            <input
              type="text"
              value={flightInput}
              onChange={(e) => setFlightInput(e.target.value.toUpperCase())}
              placeholder="أدخل رقم الرحلة أو رمز النداء (مثال: 6H567, TK1872, PC434, G9818, SV261)..."
              className="w-full bg-transparent px-4 py-3 text-base sm:text-lg font-mono font-black text-white placeholder:text-slate-500 placeholder:font-normal focus:outline-none"
              dir="ltr"
            />
            <button
              type="submit"
              disabled={loading}
              className="shrink-0 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm sm:text-base flex items-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Radar className="w-4 h-4 animate-spin text-slate-950" />
                  <span>جاري الرصد...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-slate-950" />
                  <span>تعقب الرحلة</span>
                </>
              )}
            </button>
          </form>

          {/* Quick-Access Flight Chips with official airline logos & EXPLICIT VISIBLE CONTRAST */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="text-xs text-amber-400 font-bold flex items-center gap-1.5 px-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>رحلات نشطة في الأجواء الآن:</span>
            </span>

            {/* Curated or Live Airborne Highlights */}
            {(airborneHighlights.length > 0 ? airborneHighlights.slice(0, 6) : POPULAR_QUICK_CHIPS).map((item: any) => {
              const code = item.code;
              const iata = item.iata || code.slice(0, 2);
              const chipLogo = `https://images.kiwi.com/airlines/64x64/${iata.toUpperCase()}.png`;
              const isCurrent = activeFlight?.flightNumber === code;
              const routeLabel = item.route || (item.origin && item.destination ? `${item.origin}➔${item.destination}` : "");

              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleSelectAirborneFlight(code)}
                  style={{
                    backgroundColor: isCurrent ? "#fbbf24" : "rgba(15, 23, 42, 0.95)",
                    color: isCurrent ? "#020617" : "#f8fafc",
                    borderColor: isCurrent ? "#fbbf24" : "rgba(51, 65, 85, 0.9)",
                  }}
                  className={`text-xs px-3.5 py-1.5 rounded-xl border font-mono transition-all flex items-center gap-2 cursor-pointer shadow-md hover:border-amber-400 hover:scale-105 active:scale-95 ${
                    isCurrent ? "ring-2 ring-amber-400/50" : ""
                  }`}
                >
                  <img
                    src={chipLogo}
                    alt={iata}
                    className="w-4 h-4 rounded-sm object-contain bg-white p-0.5"
                    onError={(e) => ((e.target as HTMLElement).style.display = "none")}
                  />
                  <span style={{ color: isCurrent ? "#020617" : "#fbbf24", fontWeight: 900 }}>
                    {code}
                  </span>
                  {routeLabel && (
                    <span style={{ color: isCurrent ? "#0f172a" : "#cbd5e1", fontWeight: 700 }} className="text-[11px] font-sans">
                      ({routeLabel})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── ACTIVE FLIGHT COCKPIT HUD (OBSIDIAN TACTICAL GLASS) ─────────── */}
        {activeFlight && (
          <div className="p-5 sm:p-7 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6 backdrop-blur-xl">
            
            {/* Header: Airline Logo, Carrier Name, Flight # & Action Toolbar */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
              <div className="flex items-center gap-4">
                {/* Official Airline Brand Logo */}
                <div className="w-16 h-16 rounded-2xl bg-white border-2 border-amber-400/40 p-2 flex items-center justify-center shadow-lg overflow-hidden shrink-0">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={activeFlight.airline}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLElement;
                        target.style.display = "none";
                        if (target.parentElement) {
                          target.parentElement.innerHTML = `<span class="text-sm font-mono font-black text-amber-500">${activeFlight.airlineCode || "AIR"}</span>`;
                        }
                      }}
                    />
                  ) : (
                    <span className="text-sm font-mono font-black text-amber-500">{activeFlight.airlineCode || "AIR"}</span>
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                      {activeFlight.flightNumber}
                    </h2>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${
                        activeFlight.isLive
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      <span>{activeFlight.statusLabelAr}</span>
                    </span>
                    {activeFlight.callsign && activeFlight.callsign !== activeFlight.flightNumber && (
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[11px] font-mono font-bold text-slate-300">
                        نداء: {activeFlight.callsign}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1">
                    <strong className="text-amber-400 font-bold">{activeFlight.airline}</strong>
                    {activeFlight.airlineEn ? ` (${activeFlight.airlineEn})` : ""}
                    {" — "}طراز الطائرة:{" "}
                    <span className="font-mono font-bold text-sky-400">{activeFlight.aircraftModel}</span>
                    {activeFlight.registration ? ` — تسجيل: ${activeFlight.registration}` : ""}
                  </p>
                </div>
              </div>

              {/* Actions & WhatsApp Sharing Toolbar */}
              <div className="flex items-center gap-2.5 w-full lg:w-auto">
                <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-medium pl-3">
                  <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isRefreshing ? "animate-spin" : ""}`} />
                  <span>تحديث تلقائي كل 6 ثوانٍ</span>
                </div>

                {/* 100% VISIBLE WHATSAPP SHARE BUTTON */}
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  style={{ backgroundColor: "#25D366", color: "#ffffff" }}
                  className="flex-1 lg:flex-initial px-5 py-2.5 rounded-xl hover:brightness-110 text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer"
                >
                  <Share2 className="w-4 h-4 text-white" />
                  <span style={{ color: "#ffffff", fontWeight: 900 }}>مشاركة مع العائلة (واتساب)</span>
                </button>

                {/* COPY LINK BUTTON */}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  style={{ backgroundColor: "#1e293b", color: "#f8fafc", borderColor: "#475569" }}
                  className="px-3.5 py-2.5 rounded-xl border hover:bg-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  title="نسخ رابط التتبع الحي"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-300" />}
                  <span style={{ color: "#f8fafc", fontWeight: 700 }} className="hidden sm:inline">
                    {copied ? "تم النسخ!" : "نسخ الرابط"}
                  </span>
                </button>
              </div>
            </div>

            {/* ── FLIGHT ROUTE & PROGRESS COCKPIT CARDS ─────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-center">
              {/* Departure Airport Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-center lg:text-right">
                <div className="flex items-center justify-center lg:justify-start gap-1.5 text-xs font-bold text-sky-400">
                  <MapPin className="w-4 h-4" />
                  <span>مطار الإقلاع</span>
                  <span className="font-mono text-sm font-black text-white px-2 py-0.5 rounded bg-sky-600">
                    {activeFlight.originCode}
                  </span>
                </div>
                <h3 className="text-lg font-black text-white">{activeFlight.originCity}</h3>
                <p className="text-xs text-slate-400">{activeFlight.originAirport}</p>
                <div className="pt-1 text-[11px] font-mono text-slate-400">
                  الإقلاع: {new Date(activeFlight.departureTime).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>

              {/* Central Progress Bar & Dynamic ETA */}
              <div className="space-y-2.5 text-center px-2">
                <div className="flex items-center justify-between text-xs font-black">
                  <span className="text-slate-400">انقضى: {activeFlight.elapsedMinutes} دقيقة</span>
                  <span className="text-amber-400 font-extrabold text-sm">
                    متبقي للوصول: {activeFlight.remainingMinutes} دقيقة تقريباً
                  </span>
                </div>
                <div className="w-full h-3.5 rounded-full bg-slate-950 overflow-hidden p-0.5 border border-slate-800 shadow-inner">
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-amber-500 via-amber-400 to-emerald-400 transition-all duration-500 shadow-md"
                    style={{ width: `${Math.max(5, Math.min(100, activeFlight.progressPct))}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-slate-300 font-medium">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    موعد الهبوط المتوقع:{" "}
                    <strong className="text-white font-mono font-black text-sm">
                      {new Date(activeFlight.estimatedArrival).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Destination Airport Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5 text-center lg:text-right">
                <div className="flex items-center justify-center lg:justify-start gap-1.5 text-xs font-bold text-amber-400">
                  <MapPin className="w-4 h-4" />
                  <span>مطار الوصول</span>
                  <span className="font-mono text-sm font-black text-slate-950 px-2 py-0.5 rounded bg-amber-400">
                    {activeFlight.destinationCode}
                  </span>
                </div>
                <h3 className="text-lg font-black text-white">{activeFlight.destinationCity}</h3>
                <p className="text-xs text-slate-300">{activeFlight.destinationAirport}</p>
                <div className="flex items-center justify-center lg:justify-start gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded text-[11px] font-black bg-amber-500 text-slate-950">
                    {activeFlight.terminal || "صالة الوصول الدولية"}
                  </span>
                  {activeFlight.gate && (
                    <span className="text-xs font-mono text-emerald-400 font-bold">بوابة {activeFlight.gate}</span>
                  )}
                </div>
              </div>
            </div>

            {/* ── REAL-TIME TELEMETRY METRIC HUD (HIGH PRECISION INSTRUMENTS) ─── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Altitude */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-400">
                  <Gauge className="w-3.5 h-3.5 text-sky-400" />
                  <span>الارتفاع الجوي الحقيقي</span>
                </div>
                <div className="mt-1 font-mono text-lg sm:text-xl font-black text-sky-400">
                  {activeFlight.altitudeFeet.toLocaleString()}{" "}
                  <span className="text-xs font-sans text-slate-400 font-medium">قدم</span>
                </div>
                <div className="text-[10px] font-mono text-slate-500">
                  ({altitudeMeters.toLocaleString()} متر)
                </div>
              </div>

              {/* Ground Speed */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-400">
                  <Gauge className="w-3.5 h-3.5 text-amber-400" />
                  <span>السرعة الأرضية الحقيقية</span>
                </div>
                <div className="mt-1 font-mono text-lg sm:text-xl font-black text-amber-400">
                  {activeFlight.groundSpeedKmH}{" "}
                  <span className="text-xs font-sans text-slate-400 font-medium">كم/س</span>
                </div>
                <div className="text-[10px] font-mono text-slate-500">
                  ({groundSpeedKnots} عقدة / kts)
                </div>
              </div>

              {/* Heading */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-400">
                  <Compass className="w-3.5 h-3.5 text-emerald-400" />
                  <span>زاوية الاتجاه والبوصلة</span>
                </div>
                <div className="mt-1 font-mono text-lg sm:text-xl font-black text-emerald-400">
                  {activeFlight.heading}°
                </div>
                <div className="text-[10px] text-slate-400 font-bold truncate">
                  {activeFlight.statusLabelEn || "In Air"}
                </div>
              </div>

              {/* Distance Flown */}
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-slate-400">
                  <Globe2 className="w-3.5 h-3.5 text-purple-400" />
                  <span>مسافة الرحلة الكلية</span>
                </div>
                <div className="mt-1 font-mono text-lg sm:text-xl font-black text-purple-400">
                  {activeFlight.flownDistanceKm.toLocaleString()}{" "}
                  <span className="text-xs font-sans text-slate-400 font-medium">/ {activeFlight.totalDistanceKm.toLocaleString()} كم</span>
                </div>
                <div className="text-[10px] font-mono text-slate-500">
                  متبقي {activeFlight.remainingDistanceKm.toLocaleString()} كم
                </div>
              </div>
            </div>

            {/* ── NATIVE FLIGHTRADAR24 LEAFLET MAP (MULTI-AIRCRAFT SKY STREAM) ─── */}
            <div className="space-y-2.5 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Radar className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>رادار الأجواء المباشر (Flightradar24 Multi-Aircraft ADS-B Sky Radar)</span>
                </h3>
                <span className="text-xs text-slate-300 font-medium bg-slate-800/90 border border-slate-700 px-3 py-1 rounded-lg">
                  💡 تحكم حر وسريع 60fps — يمكنك تحريك الخريطة والتكبير دون أي انقطاع
                </span>
              </div>

              <FlightRadarNativeMap
                flight={activeFlight}
                airspaceFlights={airspaceFlights}
                onSelectFlight={handleSelectAirborneFlight}
                onRefresh={() => fetchFlight(activeFlight.flightNumber, true)}
              />
            </div>
          </div>
        )}

        {/* ── AIRPORT VIP TRANSFER PROMO BANNER (EXECUTIVE LUXURY DESIGN) ──── */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0c0a1d] via-[#14122d] to-[#0a0818] text-white border border-amber-500/30 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center lg:text-right">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black bg-amber-500 text-slate-950">
              <Sparkles className="w-3.5 h-3.5" />
              <span>استقبال VIP فاخر بالمطار — Mercedes-Benz Vito</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              هل تستقبل عائلتك في المطار؟ احجز سيارة خاصة مع سائق عربي محترف
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              استقبال رسمي باسم المسافر في صالة الوصول مع لوحة ترحيب رقمية، ومساعدة كاملة في الحقائب، وسيارة مرسيدس فيتو VIP
              مجهزة بشاشات وواي فاي حتى باب الفندق أو الفيلا.
            </p>
          </div>

          <Link
            href="/transfers"
            className="shrink-0 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm sm:text-base flex items-center gap-2.5 transition-all shadow-xl active:scale-95 cursor-pointer"
          >
            <span>احجز استقبال المطار VIP الآن</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </Link>
        </div>

        {/* ── AVIATION FAQ SECTION ────────────────────────────────────────── */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl">
          <div className="text-center space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-white">
              أسئلة شائعة حول تتبع رحلات الطيران في مطارات تركيا والشرق الأوسط
            </h3>
            <p className="text-xs text-slate-400">
              كل ما تحتاج لمعرفته حول دقة الرادار وكيفية تتبع رحلات العائلة والسياح
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h4 className="font-bold text-amber-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>كيف يمكنني تتبع رحلة طيران قادمة أو مغادرة؟</span>
              </h4>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                يكفي إدخال رقم الرحلة في مربع البحث (مثل 6H567 لطيران يسرائير، TK1872 للتركية، G9818 للعربية، PC434 لبيغاسوس، أو SV261 للسعودية)،
                أو النقر مباشرة على أي طائرة تظهر في خريطة الرادار الحية لمتابعتها لحظة بلحظة.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h4 className="font-bold text-amber-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>هل رادار الطيران مجاني ومباشر؟</span>
              </h4>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                نعم، خدمة تتبع الرحلات عبر لوناليزا مجانية 100% ولا تتطلب أي تسجيل أو اشتراك، وتعتمد على شبكة أجهزة استقبال ADS-B
                ورادارات الطيران العالمية الحقيقية المتصلة بـ Flightradar24.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h4 className="font-bold text-amber-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>هل يمكنني مشاركة مسار الطائرة مع الأسرة عبر الواتساب؟</span>
              </h4>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                نعم، بنقرة زر واحدة على «مشاركة مع العائلة (واتساب)» يتم إنشاء رسالة فورية باسم شركة الطيران وموعد الهبوط التقريبي
                ورابط مباشر لمتابعة الطائرة وهي تتحرك على الخريطة.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <h4 className="font-bold text-amber-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>ما هي المطارات المدعومة في الرادار؟</span>
              </h4>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                يدعم الرادار كافة مطارات تركيا (مطار إسطنبول الدولي IST، مطار صبيحة SAW، مطار طرابزون TZX، مطار أنطاليا AYT)،
                وكافة مطارات الخليج والشرق الأوسط والعالم (مطار تل أبيب TLV، مطار أثينا ATH، مطار الرياض RUH، مطار جدة JED، مطار دبي DXB وغيرها).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FlightTrackerClient() {
  return (
    <FlightTrackerErrorBoundary>
      <FlightTrackerClientInner />
    </FlightTrackerErrorBoundary>
  );
}
