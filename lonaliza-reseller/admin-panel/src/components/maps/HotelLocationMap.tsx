"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { HotelNearbyPlace } from "@/types/hotel";
import type { Locale } from "@/lib/i18n/types";

export type NearbyHotelPin = {
  lat: number;
  lng: number;
  label: string;
  price?: number;
  currency?: string;
  href?: string;
};

export type HotelMapPoint = {
  lat: number;
  lng: number;
  label: string;
  kind: "hotel" | "poi" | "nearby";
  category?: string;
  price?: number;
  currency?: string;
  href?: string;
};

type Props = {
  hotelLat: number;
  hotelLng: number;
  hotelLabel: string;
  nearbyPlaces?: HotelNearbyPlace[];
  nearbyHotels?: NearbyHotelPin[];
  locale: Locale;
  className?: string;
  height?: number;
};

function makeIcon(kind: "hotel" | "poi" | "nearby", category?: string) {
  const bg =
    kind === "hotel" ? "#0f172a" : kind === "nearby" ? "#b45309" : category === "transport" ? "#0369a1" : "#047857";
  const border = kind === "hotel" ? "#d4a017" : kind === "nearby" ? "#fbbf24" : "#6ee7b7";
  const size = kind === "hotel" ? 34 : 26;
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${bg};border:2px solid ${border};box-shadow:0 2px 8px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;color:#fff;font:700 ${kind === "hotel" ? 12 : 10}px/1 system-ui;">${kind === "hotel" ? "★" : "•"}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function FitBounds({ points }: { points: HotelMapPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    const bounds = L.latLngBounds(
      points.map((p) => [p.lat, p.lng] as [number, number])
    );
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 });
  }, [map, points]);
  return null;
}

export default function HotelLocationMap({
  hotelLat,
  hotelLng,
  hotelLabel,
  nearbyPlaces = [],
  nearbyHotels = [],
  locale,
  className,
  height = 360,
}: Props) {
  const points = useMemo((): HotelMapPoint[] => {
    const list: HotelMapPoint[] = [
      { lat: hotelLat, lng: hotelLng, label: hotelLabel, kind: "hotel" },
    ];
    for (const p of nearbyPlaces) {
      if (!Number.isFinite(p.lat) || !Number.isFinite(p.lng)) continue;
      const label =
        locale === "ar" || locale === "tr"
          ? p.nameAr || p.nameEn
          : p.nameEn || p.nameAr;
      list.push({
        lat: p.lat,
        lng: p.lng,
        label,
        kind: "poi",
        category: p.category,
      });
    }
    for (const h of nearbyHotels) {
      if (!Number.isFinite(h.lat) || !Number.isFinite(h.lng)) continue;
      list.push({
        lat: h.lat,
        lng: h.lng,
        label: h.label,
        kind: "nearby",
        price: h.price,
        currency: h.currency,
        href: h.href,
      });
    }
    return list;
  }, [hotelLat, hotelLng, hotelLabel, nearbyPlaces, nearbyHotels, locale]);

  const valid = points.filter(
    (p) =>
      Number.isFinite(p.lat) &&
      Number.isFinite(p.lng) &&
      !(p.lat === 0 && p.lng === 0) &&
      Math.abs(p.lat) <= 90 &&
      Math.abs(p.lng) <= 180
  );

  if (valid.length === 0) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl bg-slate-100 text-slate-500 text-sm ${className || ""}`}
        style={{ height }}
      >
        Map unavailable
      </div>
    );
  }

  const center: [number, number] = [valid[0].lat, valid[0].lng];

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-slate-200 ${className || ""}`}
      style={{ height }}
      dir="ltr"
    >
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={valid} />
        {valid.map((p, i) => (
          <Marker
            key={`${p.lat}-${p.lng}-${p.kind}-${i}`}
            position={[p.lat, p.lng]}
            icon={makeIcon(p.kind, p.category)}
          >
            <Popup>
              <span className="font-semibold text-slate-900">{p.label}</span>
              {p.price != null ? (
                <span className="block text-sm text-amber-700">
                  {p.currency || "USD"} {p.price}
                </span>
              ) : null}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
