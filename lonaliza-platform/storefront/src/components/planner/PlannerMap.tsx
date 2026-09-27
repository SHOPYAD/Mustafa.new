"use client";

import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, Polyline, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Clock, Hotel, Landmark, Plane, Plus, Satellite, ShoppingBag, Star, UtensilsCrossed } from "lucide-react";
import type { PlannerStop, PlannerStopKind } from "@/types/planner";
import { uid, validLatLng } from "@/lib/planner/geo";
import { plannerCopy } from "@/lib/planner/copy";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { usePlanner } from "./PlannerStore";
import { KindMark, kindLabel } from "./KindMark";
import { cn } from "@/lib/utils";

const DAY_COLORS = ["#7C3AED", "#0ea5e9", "#16a34a", "#f59e0b", "#e11d48", "#0891b2", "#4f46e5"];

function pinIcon(n: number, color: string, isHovered = false, isSelected = false) {
  const size = isHovered || isSelected ? 40 : 32;
  const shadow = isHovered || isSelected
    ? `0 0 22px ${color}99, 0 8px 24px rgba(26,20,56,0.45)`
    : `0 4px 14px rgba(26,20,56,.32)`;
  const scale = isHovered || isSelected ? "transform: scale(1.22) translateY(-4px);" : "";

  return L.divIcon({
    className: `lonaliza-planner-pin ${isHovered ? "lonaliza-pin-active" : ""}`,
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;${scale}transition:all 0.25s cubic-bezier(0.34,1.56,0.64,1);cursor:pointer;">
        ${isHovered ? `<div style="position:absolute;inset:-6px;border-radius:9999px;border:2.5px solid ${color};opacity:0.85;animation:ping 1.2s cubic-bezier(0,0,0.2,1) infinite;"></div>` : ""}
        <div style="width:100%;height:100%;border-radius:9999px;background:linear-gradient(135deg,#ffffff 0%,#fbfaff 100%);border:3.5px solid ${color};box-shadow:${shadow};display:flex;align-items:center;justify-content:center;color:${color};font:900 ${size > 34 ? 15 : 13}px/1 'IBM Plex Sans Arabic',system-ui,sans-serif;">
          ${n}
        </div>
        <div style="position:absolute;bottom:-5px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid ${color};filter:drop-shadow(0 2px 2px rgba(0,0,0,0.2));"></div>
      </div>
    `,
    iconSize: [size, size + 6],
    iconAnchor: [size / 2, size + 6],
    popupAnchor: [0, -(size + 10)],
  });
}

function discoverIcon() {
  return L.divIcon({
    className: "lonaliza-planner-pin",
    html: `<div style="width:18px;height:18px;border-radius:9999px;background:#fff;border:2.5px solid #7C3AED;box-shadow:0 4px 10px rgba(46,16,101,.25)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function laterIcon() {
  return L.divIcon({
    className: "lonaliza-planner-pin",
    html: `<div style="width:22px;height:22px;border-radius:6px;background:#F59E0B;border:2px solid #fff;box-shadow:0 4px 10px rgba(180,83,9,.35)"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

function Fit({
  points,
  zoomWorld,
}: {
  points: Array<{ lat: number; lng: number }>;
  zoomWorld?: boolean;
}) {
  const map = useMap();
  useEffect(() => {
    if (zoomWorld && points.length === 0) {
      map.setView([30, 20], 2);
      return;
    }
    if (!points.length) return;
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 13);
      return;
    }
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [70, 70], maxZoom: 14 });
  }, [map, points, zoomWorld]);
  return null;
}

function FlyTo({ lat, lng }: { lat?: number; lng?: number }) {
  const map = useMap();
  useEffect(() => {
    if (!validLatLng(lat, lng)) return;
    map.flyTo([lat as number, lng as number], Math.max(map.getZoom(), 14), { duration: 0.6 });
  }, [lat, lng, map]);
  return null;
}

function badgeIcon(label: string) {
  return L.divIcon({
    className: "lonaliza-leg-badge",
    html: `<div style="background:#fff;color:#1A1438;border:1px solid #E4DFF3;border-radius:999px;padding:4px 8px;font:800 11px/1 'IBM Plex Sans Arabic',system-ui;box-shadow:0 6px 16px -10px rgba(46,16,101,.55);white-space:nowrap">${label}</div>`,
    iconSize: [90, 22],
    iconAnchor: [45, 11],
  });
}

export default function PlannerMap({ compact }: { compact?: boolean }) {
  const { locale } = useLocale();
  const c = plannerCopy(locale);
  const {
    trip,
    activeDay,
    centerTab,
    mapLayer,
    setMapLayer,
    addStop,
    addLater,
    selectedStopId,
    setSelectedStopId,
    hoveredStopId,
    setHoveredStopId,
    setDetailStop,
    setDiscover,
    setLegMode,
    intakeDraft,
  } = usePlanner();
  const [sat, setSat] = useState(true);

  const destPreview =
    !trip && intakeDraft.destLat && intakeDraft.destLng
      ? [{ lat: intakeDraft.destLat, lng: intakeDraft.destLng }]
      : [];

  const visibleStops = useMemo(() => {
    if (!trip) return [];
    const days = activeDay === 0 ? trip.days : trip.days.filter((d) => d.day === activeDay);
    return days
      .flatMap((d) => d.stops)
      .filter((s) => validLatLng(s.lat, s.lng) && (mapLayer === "all" || s.kind === mapLayer));
  }, [trip, activeDay, mapLayer]);

  const selected = visibleStops.find((s) => s.id === selectedStopId);

  const badges = useMemo(() => {
    if (!trip || activeDay === 0) return [];
    const day = trip.days.find((d) => d.day === activeDay);
    if (!day) return [];
    return day.legs
      .map((leg) => {
        const mid = leg.midpoint;
        if (!mid || !validLatLng(mid[0], mid[1])) return null;
        return {
          id: `${leg.fromId}-${leg.toId}`,
          lat: mid[0],
          lng: mid[1],
          label:
            locale === "ar"
              ? `${leg.minutes} د • ${leg.km} كم${leg.estimated ? " • تقديري" : ""}`
              : `${leg.minutes} min • ${leg.km} km${leg.estimated ? " • est." : ""}`,
          fromId: leg.fromId,
        };
      })
      .filter(Boolean) as Array<{ id: string; lat: number; lng: number; label: string; fromId: string }>;
  }, [trip, activeDay, locale]);

  useEffect(() => {
    if (!trip || !validLatLng(trip.center.lat, trip.center.lng)) return;
    const category =
      mapLayer === "hotel" ? "hotels" : mapLayer === "food" ? "food" : mapLayer === "shopping" ? "shopping" : "attractions";
    const t = window.setTimeout(() => {
      void fetch("/internal/planner/nearby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: trip.center.lat, lng: trip.center.lng, category }),
      })
        .then((r) => r.json())
        .then((d) => {
          const taken = new Set(
            [...trip.days.flatMap((day) => day.stops), ...trip.later].map((s) => s.titleEn.toLowerCase())
          );
          const places = ((d.places || []) as Array<{
            titleAr: string;
            titleEn: string;
            lat: number;
            lng: number;
            kind?: PlannerStopKind;
            image?: string;
            hours?: string;
            detailEn?: string;
          }>)
            .filter((p) => validLatLng(p.lat, p.lng) && !taken.has(p.titleEn.toLowerCase()))
            .slice(0, 80)
            .map((p, i) => ({
              id: uid("disc"),
              day: 0,
              order: i + 1,
              kind: p.kind || "attraction",
              titleAr: p.titleAr,
              titleEn: p.titleEn,
              lat: p.lat,
              lng: p.lng,
              image: p.image,
              hours: p.hours,
              detailEn: p.detailEn,
            }));
          setDiscover(places);
        })
        .catch(() => undefined);
    }, 450);
    return () => window.clearTimeout(t);
  }, [trip?.center.lat, trip?.center.lng, trip?.id, mapLayer, activeDay, setDiscover, trip?.days.length, trip?.later.length]);

  const lines = useMemo(() => {
    if (!trip) return [];
    const days = activeDay === 0 ? trip.days : trip.days.filter((d) => d.day === activeDay);
    return days.map((d) => {
      const poly = d.legs.flatMap((leg) => leg.polyline || []);
      return {
        day: d.day,
        color: DAY_COLORS[(d.day - 1) % DAY_COLORS.length],
        path: (poly.length > 1 ? poly : d.stops.map((s) => [s.lat, s.lng] as [number, number])).filter(
          (p) => validLatLng(p[0], p[1])
        ),
        label: locale === "ar" ? `اليوم ${d.day}` : `Day ${d.day}`,
      };
    });
  }, [trip, activeDay, locale]);

  const layers: Array<{ id: PlannerStop["kind"] | "all"; label: string; icon: typeof Landmark }> = [
    { id: "all", label: c.all, icon: Landmark },
    { id: "attraction", label: c.attractions, icon: Landmark },
    { id: "hotel", label: c.hotels, icon: Hotel },
    { id: "food", label: c.food, icon: UtensilsCrossed },
    { id: "shopping", label: c.shopping, icon: ShoppingBag },
    { id: "airport", label: c.airports, icon: Plane },
  ];
  const discoverStops = (centerTab === "ideas" ? trip?.discover || [] : []).filter(
    (s) => validLatLng(s.lat, s.lng) && (mapLayer === "all" || s.kind === mapLayer)
  );
  const laterStops = (trip?.later || []).filter((s) => validLatLng(s.lat, s.lng));

  const rawCenter = destPreview[0] || trip?.center;
  const center = validLatLng(rawCenter?.lat, rawCenter?.lng) ? rawCenter! : { lat: 20, lng: 10 };
  const fitPoints = visibleStops.length ? visibleStops : destPreview.filter((p) => validLatLng(p.lat, p.lng));

  return (
    <div className="relative h-full min-h-[280px] w-full">
      <div
        className={cn(
          "absolute start-3 top-3 z-[20] flex max-w-[92%] gap-1.5",
          compact ? "flex-nowrap overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" : "flex-wrap"
        )}
      >
        {layers.map((layer) => {
          const Icon = layer.icon;
          return (
            <button
              key={layer.id}
              type="button"
              onClick={() => setMapLayer(layer.id)}
              className={
                mapLayer === layer.id
                  ? "inline-flex h-11 shrink-0 items-center gap-1 rounded-xl bg-[#2E1065] px-3 text-[12px] font-bold text-white shadow-lg"
                  : "inline-flex h-11 shrink-0 items-center gap-1 rounded-xl bg-white/95 px-3 text-[12px] font-bold text-[#4B4568] shadow"
              }
            >
              <Icon size={15} />
              {layer.label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setSat((v) => !v)}
          className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-white/95 px-3 text-[13px] font-bold text-[#2E1065] shadow"
          aria-label={c.layerHint}
        >
          <Satellite size={15} />
          {sat ? c.satellite : c.streets}
        </button>
      </div>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={trip || destPreview.length ? 12 : 2}
        scrollWheelZoom
        className="h-full w-full"
        style={{ height: "100%", width: "100%" }}
      >
        {sat ? (
          <TileLayer
            attribution="Tiles &copy; Esri"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}
        <Fit points={fitPoints} zoomWorld={!trip && destPreview.length === 0} />
        <FlyTo lat={selected?.lat} lng={selected?.lng} />
        {lines.map((line) =>
          line.path.length > 1 ? (
            <Polyline
              key={line.day}
              positions={line.path}
              pathOptions={{
                color: activeDay === 0 ? line.color : DAY_COLORS[(line.day - 1) % DAY_COLORS.length],
                weight: 6,
                opacity: 0.92,
                lineCap: "round",
              }}
            />
          ) : null
        )}
        {visibleStops.map((stop, i) => {
          const isHov = hoveredStopId === stop.id;
          const isSel = selectedStopId === stop.id;
          const pinColor = stop.kind === "hotel" ? "#F59E0B" : DAY_COLORS[(stop.day - 1) % DAY_COLORS.length];
          return (
            <Marker
              key={stop.id}
              position={[stop.lat, stop.lng]}
              zIndexOffset={isHov || isSel ? 1000 : 0}
              icon={pinIcon(stop.order || i + 1, pinColor, isHov, isSel)}
              eventHandlers={{
                click: (e) => {
                  setSelectedStopId(stop.id);
                  const m = e.target._map;
                  if (m && validLatLng(stop.lat, stop.lng)) {
                    m.panTo([stop.lat, stop.lng], { animate: true, duration: 0.35 });
                  }
                },
                mouseover: () => setHoveredStopId(stop.id),
                mouseout: () => setHoveredStopId(null),
              }}
            >
              <Popup
                maxWidth={320}
                minWidth={280}
                autoPan={true}
                autoPanPadding={new L.Point(70, 70)}
                offset={[0, -12]}
                className="lonaliza-planner-popup"
              >
                <MapPopup
                  stop={stop}
                  onAdd={() => addStop(stop, activeDay || stop.day || 1)}
                  onLater={() => addLater(stop)}
                  onDetails={() => setDetailStop(stop)}
                  added={c.added}
                  add={c.add}
                  later={c.addToLater}
                  details={c.details}
                  book={c.book}
                  locale={locale}
                  visit={c.visit}
                  min={c.min}
                  open={c.open}
                  reviews={c.reviews}
                  free={c.free}
                />
              </Popup>
            </Marker>
          );
        })}
        {discoverStops.map((stop) => (
          <Marker
            key={stop.id}
            position={[stop.lat, stop.lng]}
            icon={discoverIcon()}
            eventHandlers={{ click: () => setSelectedStopId(stop.id) }}
          >
            <Popup maxWidth={300} minWidth={260}>
              <MapPopup
                stop={stop}
                onAdd={() => addStop(stop, activeDay || 1)}
                onLater={() => addLater(stop)}
                onDetails={() => setDetailStop(stop)}
                added={c.added}
                add={c.add}
                later={c.addToLater}
                details={c.details}
                book={c.book}
                locale={locale}
                visit={c.visit}
                min={c.min}
                open={c.open}
                reviews={c.reviews}
                free={c.free}
              />
            </Popup>
          </Marker>
        ))}
        {laterStops.map((stop) => (
          <Marker key={stop.id} position={[stop.lat, stop.lng]} icon={laterIcon()}>
            <Popup maxWidth={300} minWidth={260}>
              <MapPopup
                stop={stop}
                onAdd={() => addStop(stop, activeDay || 1)}
                onLater={() => undefined}
                onDetails={() => setDetailStop(stop)}
                added={c.added}
                add={c.add}
                later={c.addToLater}
                details={c.details}
                book={c.book}
                locale={locale}
                visit={c.visit}
                min={c.min}
                open={c.open}
                reviews={c.reviews}
                free={c.free}
              />
            </Popup>
          </Marker>
        ))}
        {badges.map((b) => (
          <Marker
            key={b.id}
            position={[b.lat, b.lng]}
            icon={badgeIcon(b.label)}
            eventHandlers={{ click: () => setLegMode(b.fromId, "drive") }}
          />
        ))}
        {destPreview.map((p) => (
          <Marker key="dest-preview" position={[p.lat, p.lng]} icon={pinIcon(1, "#7C3AED")} />
        ))}
      </MapContainer>
      {selectedStopId ? <p className="sr-only">{selectedStopId}</p> : null}
    </div>
  );
}

function MapPopup({
  stop,
  onAdd,
  onLater,
  onDetails,
  added,
  add,
  later,
  details,
  book,
  locale,
  visit,
  min,
  open,
  reviews,
  free,
}: {
  stop: PlannerStop;
  onAdd: () => void;
  onLater: () => void;
  onDetails: () => void;
  added: string;
  add: string;
  later: string;
  details: string;
  book: string;
  locale: string;
  visit: string;
  min: string;
  open: string;
  reviews: string;
  free: string;
}) {
  const title = locale === "ar" ? stop.titleAr : stop.titleEn;
  const detail = locale === "ar" ? stop.detailAr : stop.detailEn;
  return (
    <div className="w-[260px] text-start">
      <div className="mb-2 h-36 overflow-hidden rounded-xl bg-[#F3E8FF]">
        {stop.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={stop.image} alt={title} className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full items-center justify-center">
            <KindMark kind={stop.kind} size={22} />
          </span>
        )}
      </div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-[#6B6584]">
        {kindLabel(stop.kind, locale === "ar")}
      </p>
      <p className="mt-0.5 text-[15px] font-black leading-snug text-[#1A1438]">{title}</p>
      {detail ? <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-[#5B5674]">{detail}</p> : null}
      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[12px] font-semibold text-[#4B4568]">
        {stop.rating ? (
          <span className="inline-flex items-center gap-0.5 text-[#B45309]">
            <Star size={12} className="fill-[#F59E0B] text-[#F59E0B]" />
            {stop.rating}
            {stop.reviews ? ` (${stop.reviews.toLocaleString()} ${reviews})` : ""}
          </span>
        ) : null}
        {stop.visitMinutes ? (
          <span className="inline-flex items-center gap-1">
            <Clock size={12} />
            {visit} {stop.visitMinutes} {min}
          </span>
        ) : null}
        {stop.hours ? (
          <span>
            {open}: {stop.hours}
          </span>
        ) : null}
        {stop.free ? <span className="font-bold text-emerald-700">{free}</span> : null}
      </div>
      {stop.addedToDay ? (
        <p className="mt-1 text-[12px] font-bold text-emerald-700">
          {added} {stop.addedToDay}
        </p>
      ) : null}
      <div className="mt-2.5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex h-11 flex-1 cursor-pointer items-center justify-center gap-1 rounded-xl bg-[#7C3AED] text-[13px] font-bold text-white"
        >
          <Plus size={14} />
          {add}
        </button>
        <button
          type="button"
          onClick={onLater}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-[#FEF3C7] px-3 text-[13px] font-bold text-[#B45309]"
        >
          {later}
        </button>
        <button
          type="button"
          onClick={onDetails}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-[#F4F2FA] px-3 text-[13px] font-bold text-[#2E1065]"
        >
          {details}
        </button>
        {stop.href ? (
          <a
            href={stop.href}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#F4F2FA] px-3 text-[13px] font-bold text-[#2E1065]"
          >
            {book}
          </a>
        ) : null}
      </div>
    </div>
  );
}
