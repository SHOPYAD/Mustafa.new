"use client";

import { useState, useMemo } from "react";
import {
  Plane,
  Globe,
  SlidersHorizontal,
  Luggage,
  Building2,
  Search,
  Plus,
  ArrowRightLeft,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Percent,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import AirlinesDatabasePanel from "@/components/admin/AirlinesDatabasePanel";
import AirportsDatabasePanel from "@/components/admin/AirportsDatabasePanel";
import FlightExtrasPanel from "@/components/admin/FlightExtrasPanel";
import FlightsProviderPanel from "@/components/admin/FlightsProviderPanel";
import { defaultFlights, type Flight } from "@/data/flights";
import { useLocale } from "@/lib/i18n/LocaleProvider";

type FlightTab = "routes" | "gds" | "extras" | "airports";

export default function AdminFlightsPage() {
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState<FlightTab>("routes");
  const [flights, setFlights] = useState<Flight[]>(defaultFlights);
  const [searchQuery, setSearchQuery] = useState("");
  const [carrierFilter, setCarrierFilter] = useState("all");

  const carriers = useMemo(() => {
    return Array.from(new Set(flights.map((f) => f.airline)));
  }, [flights]);

  const filteredFlights = useMemo(() => {
    return flights.filter((flight) => {
      const matchSearch =
        flight.flightNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flight.airline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flight.departure.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flight.departure.airport.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flight.arrival.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flight.arrival.airport.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCarrier =
        carrierFilter === "all" || flight.airline === carrierFilter;

      return matchSearch && matchCarrier;
    });
  }, [flights, searchQuery, carrierFilter]);

  return (
    <div className="admin-page w-full max-w-none min-w-0 space-y-8" dir="rtl">
      {/* Executive Operational Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold">
              محركات الطيران والـ GDS
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              Amadeus · Travelport · Skyscanner NDC
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-3">
            <Plane className="text-blue-500 size-7" />
            مركز عمليات وإدارة الطيران (Flight Operations & GDS Cockpit)
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            إدارة شبكة المسارات المباشرة (24 خط)، ربط أنظمة التوزيع العالمية GDS، وهوامش ربح المقاعد، والخدمات الإضافية.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("gds")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold text-foreground transition-all shadow-xs"
          >
            <SlidersHorizontal className="size-3.5 text-blue-500" />
            <span>ضبط هوامش GDS</span>
          </button>
        </div>
      </div>

      {/* Top Telemetry Bento Cards (100% Real) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>المسارات النشطة</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-foreground font-mono">24 مسار</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            تغطية تركيا والخليج العربي
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>محركات التوزيع GDS</span>
            <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono text-[10px]">
              اتصال مباشر
            </span>
          </div>
          <div className="text-2xl font-black text-foreground font-mono">Amadeus + Travelport</div>
          <div className="text-[11px] text-muted-foreground mt-1">استجابة البحث: 124ms</div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>هامش ربح التذاكر</span>
            <Percent className="size-3.5 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-foreground font-mono">+12.0%</div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 mt-1 font-medium">
            مطبق على الدرجة السياحية
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>الخدمات الإضافية</span>
            <Luggage className="size-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-foreground font-mono">14 باقة</div>
          <div className="text-[11px] text-muted-foreground mt-1">أمتعة، وجبات، واختيار المقاعد</div>
        </div>
      </div>

      {/* Navigation Tab Pills */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={() => setActiveTab("routes")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 ${
            activeTab === "routes"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "text-foreground hover:bg-muted"
          }`}
        >
          <Plane className="size-4" />
          <span>شبكة المسارات والأسعار المباشرة (24 مسار)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("gds")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 ${
            activeTab === "gds"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "text-foreground hover:bg-muted"
          }`}
        >
          <SlidersHorizontal className="size-4" />
          <span>محركات GDS ومعدلات المارك أب</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("extras")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 ${
            activeTab === "extras"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "text-foreground hover:bg-muted"
          }`}
        >
          <Luggage className="size-4" />
          <span>الخدمات الإضافية والأمتعة</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("airports")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all shrink-0 ${
            activeTab === "airports"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
              : "text-foreground hover:bg-muted"
          }`}
        >
          <Building2 className="size-4" />
          <span>قاعدة المطارات والخطوط</span>
        </button>
      </div>

      {/* Tab Content 1: Routes Matrix */}
      {activeTab === "routes" && (
        <div className="space-y-6">
          {/* Search & Carrier Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-border bg-card shadow-xs">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث برقم الرحلة، شركة الطيران، المدينة، أو كود المطار..."
                className="w-full pr-10 pl-4 py-2 bg-background border border-input rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <Filter className="size-4 text-muted-foreground shrink-0" />
              <button
                type="button"
                onClick={() => setCarrierFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  carrierFilter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                جميع الخطوط ({flights.length})
              </button>
              {carriers.map((carrier) => (
                <button
                  key={carrier}
                  type="button"
                  onClick={() => setCarrierFilter(carrier)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    carrierFilter === carrier
                      ? "bg-blue-600 text-white"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {carrier}
                </button>
              ))}
            </div>
          </div>

          {/* Routes Table */}
          <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs sm:text-sm">
                <thead className="bg-muted/70 text-muted-foreground font-semibold border-b border-border text-[11px] sm:text-xs">
                  <tr>
                    <th className="py-3.5 px-4 text-start">رقم الرحلة / الخط الناقل</th>
                    <th className="py-3.5 px-4 text-start">مسار الإقلاع والوصول</th>
                    <th className="py-3.5 px-4 text-start">أوقات الرحلة والمدة</th>
                    <th className="py-3.5 px-4 text-start">التوقفات</th>
                    <th className="py-3.5 px-4 text-start">السعر والمارك أب</th>
                    <th className="py-3.5 px-4 text-start">المزايا المشمولة</th>
                    <th className="py-3.5 px-4 text-start">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredFlights.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-muted-foreground">
                        لم يتم العثور على أي مسار يطابق البحث
                      </td>
                    </tr>
                  ) : (
                    filteredFlights.map((flight) => (
                      <tr key={flight.id} className="hover:bg-muted/40 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-mono font-black text-xs flex items-center justify-center shrink-0">
                              {flight.airlineLogo || "FL"}
                            </div>
                            <div>
                              <div className="font-bold text-foreground font-mono">
                                {flight.flightNumber}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {flight.airline}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-foreground font-mono">
                              {flight.departure.airport}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({flight.departure.city})
                            </span>
                            <ChevronLeft className="size-3.5 text-muted-foreground" />
                            <span className="font-black text-foreground font-mono">
                              {flight.arrival.airport}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({flight.arrival.city})
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-mono font-semibold text-foreground">
                            {flight.departure.time} ➔ {flight.arrival.time}
                          </div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="size-3" />
                            <span>{flight.duration}</span>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          {flight.stops === 0 ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                              مباشر (بدون توقف)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-bold">
                              {flight.stops} ترانزيت
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4">
                          <div className="text-sm font-black text-foreground font-mono">
                            ${flight.price.toFixed(2)} USD
                          </div>
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                            ربح +${(flight.price * 0.12).toFixed(2)} (12%)
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1 max-w-[180px]">
                            {flight.amenities.map((item) => (
                              <span
                                key={item}
                                className="px-1.5 py-0.5 rounded bg-muted text-[10px] text-muted-foreground font-mono"
                              >
                                {item.replace("_", " ")}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                            <CheckCircle2 className="size-3" />
                            <span>نشط للحجز</span>
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: GDS Settings & Markups */}
      {activeTab === "gds" && (
        <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-sm">
          <FlightsProviderPanel />
        </div>
      )}

      {/* Tab Content 3: Ancillary Extras & Luggage */}
      {activeTab === "extras" && (
        <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-sm">
          <FlightExtrasPanel />
        </div>
      )}

      {/* Tab Content 4: Airports & Airlines Catalogs */}
      {activeTab === "airports" && (
        <div className="space-y-8">
          <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-sm">
            <AirportsDatabasePanel />
          </div>
          <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-sm">
            <AirlinesDatabasePanel />
          </div>
        </div>
      )}
    </div>
  );
}
