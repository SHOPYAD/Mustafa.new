"use client"

import { Globe } from "@/components/ui/cobe-globe"

const markers = [
  { id: "sf", location: [37.7595, -122.4367] as [number, number], label: "San Francisco" },
  { id: "nyc", location: [40.7128, -74.006] as [number, number], label: "New York" },
  { id: "tokyo", location: [35.6762, 139.6503] as [number, number], label: "Tokyo" },
  { id: "london", location: [51.5074, -0.1278] as [number, number], label: "London" },
  { id: "sydney", location: [-33.8688, 151.2093] as [number, number], label: "Sydney" },
  { id: "capetown", location: [-33.9249, 18.4241] as [number, number], label: "Cape Town" },
  { id: "dubai", location: [25.2048, 55.2708] as [number, number], label: "Dubai" },
  { id: "paris", location: [48.8566, 2.3522] as [number, number], label: "Paris" },
  { id: "saopaulo", location: [-23.5505, -46.6333] as [number, number], label: "São Paulo" },
  { id: "ist", location: [41.0082, 28.9784] as [number, number], label: "Istanbul (HQ)" },
]

const arcs = [
  {
    id: "sf-tokyo",
    from: [37.7595, -122.4367] as [number, number],
    to: [35.6762, 139.6503] as [number, number],
    label: "SF → Tokyo",
  },
  {
    id: "nyc-london",
    from: [40.7128, -74.006] as [number, number],
    to: [51.5074, -0.1278] as [number, number],
    label: "NYC → London",
  },
  {
    id: "dubai-ist",
    from: [25.2048, 55.2708] as [number, number],
    to: [41.0082, 28.9784] as [number, number],
    label: "DXB → IST",
  },
]

export default function GlobeDemo() {
  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-[#020b18] p-8 overflow-hidden">
      <div className="w-full max-w-lg">
        <Globe
          markers={markers}
          arcs={arcs}
          markerColor={[0, 0.94, 1]}
          baseColor={[0.02, 0.08, 0.16]}
          arcColor={[0, 0.85, 1]}
          glowColor={[0, 0.6, 1]}
          dark={1}
          mapBrightness={6}
          markerSize={0.035}
          markerElevation={0.015}
        />
      </div>
    </div>
  )
}
