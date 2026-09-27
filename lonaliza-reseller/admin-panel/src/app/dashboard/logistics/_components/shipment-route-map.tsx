"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation } from "lucide-react";

export function ShipmentRouteMap() {
  return (
    <Card className="shadow-xs overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Navigation className="size-5 text-primary" />
          <CardTitle className="text-base font-semibold">Global Shipment Routes</CardTitle>
        </div>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          14 Active Routes
        </span>
      </CardHeader>
      <CardContent className="p-4">
        <div className="relative h-72 w-full rounded-xl border border-border/60 bg-muted/20 flex items-center justify-center overflow-hidden">
          {/* Visual SVG Map Graphic */}
          <svg viewBox="0 0 800 400" className="w-full h-full opacity-70">
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.8" />
                <stop offset="100%" stopColor="var(--chart-2)" stopOpacity="0.8" />
              </linearGradient>
            </defs>
            {/* World land outlines stylized */}
            <path
              d="M150 120 Q 200 80 280 110 T 350 180 T 250 260 T 150 200 Z"
              fill="currentColor"
              className="text-muted/40"
            />
            <path
              d="M420 90 Q 550 70 650 110 T 720 220 T 580 280 T 450 200 Z"
              fill="currentColor"
              className="text-muted/40"
            />
            <path
              d="M200 280 Q 250 260 280 320 T 240 380 Z"
              fill="currentColor"
              className="text-muted/40"
            />

            {/* Flight & Shipment Paths */}
            <path
              d="M 220 140 Q 380 70 540 160"
              fill="none"
              stroke="url(#routeGradient)"
              strokeWidth="2.5"
              strokeDasharray="4,4"
              className="animate-pulse"
            />
            <path
              d="M 260 220 Q 420 240 600 190"
              fill="none"
              stroke="url(#routeGradient)"
              strokeWidth="2.5"
            />
            <path
              d="M 520 130 Q 580 200 620 250"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="2"
              strokeDasharray="3,3"
            />

            {/* Nodes */}
            <circle cx="220" cy="140" r="6" className="fill-primary ring-4 ring-primary/20" />
            <circle cx="540" cy="160" r="7" className="fill-chart-2" />
            <circle cx="260" cy="220" r="5" className="fill-primary" />
            <circle cx="600" cy="190" r="6" className="fill-primary" />
            <circle cx="620" cy="250" r="5" className="fill-chart-3" />
          </svg>

          {/* Floating Shipment Badges */}
          <div className="absolute bottom-3 left-3 flex gap-2">
            <div className="rounded-lg border border-border bg-card/90 px-3 py-1.5 shadow-xs backdrop-blur-xs text-xs">
              <span className="font-semibold text-foreground">IST → DXB:</span>{" "}
              <span className="text-primary font-medium">In Transit (84%)</span>
            </div>
            <div className="rounded-lg border border-border bg-card/90 px-3 py-1.5 shadow-xs backdrop-blur-xs text-xs">
              <span className="font-semibold text-foreground">LHR → IST:</span>{" "}
              <span className="text-emerald-600 font-medium">Delivered</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
export default ShipmentRouteMap;
