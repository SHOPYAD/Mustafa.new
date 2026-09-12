"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type OsmMapPoint = {
  lat: number;
  lng: number;
  label: string;
  description?: string;
  photo?: string;
  day?: number;
};

type Props = {
  points: OsmMapPoint[];
  className?: string;
  height?: number;
};

const markerIcon = L.divIcon({
  className: "",
  html: `<div style="width:28px;height:28px;border-radius:9999px;background:#0f172a;border:2px solid #d4a017;box-shadow:0 2px 8px rgba(0,0,0,.35);display:flex;align-items:center;justify-center;color:#fff;font:700 11px/1 system-ui;">●</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function FitBounds({ points }: { points: OsmMapPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
  }, [map, points]);
  return null;
}

export default function OsmRouteMap({ points, className, height = 360 }: Props) {
  const valid = useMemo(
    () => points.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng)),
    [points]
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
  const line = valid.map((p) => [p.lat, p.lng] as [number, number]);

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-slate-200 ${className || ""}`}
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={11}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={valid} />
        {valid.length > 1 && (
          <Polyline positions={line} pathOptions={{ color: "#b45309", weight: 4, opacity: 0.85 }} />
        )}
        {valid.map((p, i) => (
          <Marker key={`${p.lat}-${p.lng}-${i}`} position={[p.lat, p.lng]} icon={markerIcon}>
            <Popup>
              <div className="w-[220px]">
                {p.photo ? (
                  <img
                    src={p.photo}
                    alt={p.label}
                    className="mb-2 h-28 w-full rounded-lg object-cover"
                  />
                ) : null}
                <p className="text-sm font-bold text-slate-900">
                  {p.day != null ? `${p.day}. ${p.label}` : p.label}
                </p>
                {p.description ? (
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">{p.description}</p>
                ) : null}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
