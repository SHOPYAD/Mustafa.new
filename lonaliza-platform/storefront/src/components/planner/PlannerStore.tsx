"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  PlannerIdea,
  PlannerIntake,
  PlannerStop,
  PlannerStyle,
  PlannerTransportMode,
  PlannerTrip,
} from "@/types/planner";
import type { SalesChatCard } from "@/types/sales-chat";
import { buildLegs, estimateMinutes, optimizeStops, uid } from "@/lib/planner/geo";

export type WorkspaceMode = "chat" | "planner";
export type PlannerView = "intake" | "workspace";
export type MobileTab = "chat" | "plan" | "map";
export type CenterTab = "itinerary" | "ideas";

type PlannerContextValue = {
  mode: WorkspaceMode;
  setMode: (m: WorkspaceMode) => void;
  view: PlannerView;
  setView: (v: PlannerView) => void;
  mobileTab: MobileTab;
  setMobileTab: (t: MobileTab) => void;
  centerTab: CenterTab;
  setCenterTab: (t: CenterTab) => void;
  trip: PlannerTrip | null;
  setTrip: (t: PlannerTrip | null) => void;
  generating: boolean;
  setGenerating: (v: boolean) => void;
  activeDay: number;
  setActiveDay: (d: number) => void;
  selectedIds: string[];
  toggleSelected: (id: string) => void;
  clearSelected: () => void;
  selectedStopId: string | null;
  setSelectedStopId: (id: string | null) => void;
  hoveredStopId: string | null;
  setHoveredStopId: (id: string | null) => void;
  mapLayer: PlannerStop["kind"] | "all";
  setMapLayer: (l: PlannerStop["kind"] | "all") => void;
  programsOpen: boolean;
  setProgramsOpen: (v: boolean) => void;
  applyTrip: (trip: PlannerTrip, opts?: { keepMode?: boolean }) => void;
  resetPlan: () => void;
  addStop: (stop: PlannerStop | PlannerIdea, day?: number) => void;
  removeStops: (ids: string[]) => void;
  updateStop: (id: string, patch: Partial<PlannerStop>) => void;
  moveStop: (id: string, day: number) => void;
  replaceStop: (id: string, next: PlannerStop | PlannerIdea) => void;
  setDayNotes: (day: number, notes: string) => void;
  setTripNotes: (notes: string) => void;
  setLegMode: (fromId: string, mode: PlannerTransportMode, all?: boolean) => void;
  optimizeDay: (day: number) => void;
  isOptimizing: boolean;
  addDay: () => void;
  setDepartDate: (iso: string) => void;
  addLater: (stop: PlannerStop) => void;
  promoteLater: (id: string, day?: number) => void;
  removeLater: (id: string) => void;
  setDiscover: (places: PlannerStop[]) => void;
  detailStop: PlannerStop | null;
  setDetailStop: (stop: PlannerStop | null) => void;
  refreshDayDirections: (
    day: number,
    override?: { fromId?: string; mode?: PlannerTransportMode; all?: boolean }
  ) => Promise<void>;
  defaultIntake: PlannerIntake;
  setIntakeDraft: (p: Partial<PlannerIntake>) => void;
  intakeDraft: PlannerIntake;
  offerCards: SalesChatCard[];
  offerTotal: number;
  offerCurrency: string;
  setOffers: (cards: SalesChatCard[], total?: number, currency?: string) => void;
};

const defaultPrefs = {
  companion: "family" as const,
  style: "cultural" as const,
  styles: ["cultural"] as PlannerStyle[],
  pace: "moderate" as const,
  stay: "premium" as const,
  rhythm: "early" as const,
  notes: "",
};

const PlannerContext = createContext<PlannerContextValue | null>(null);

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<WorkspaceMode>("chat");
  const [view, setView] = useState<PlannerView>("intake");
  const [mobileTab, setMobileTab] = useState<MobileTab>("chat");
  const [centerTab, setCenterTab] = useState<CenterTab>("itinerary");
  const [trip, setTrip] = useState<PlannerTrip | null>(null);
  const [generating, setGenerating] = useState(false);
  const [activeDay, setActiveDay] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [hoveredStopId, setHoveredStopId] = useState<string | null>(null);
  const [mapLayer, setMapLayer] = useState<PlannerStop["kind"] | "all">("all");
  const [programsOpen, setProgramsOpen] = useState(false);
  const [intakeDraft, setIntake] = useState<PlannerIntake>({
    origin: "",
    destination: "",
    durationDays: 7,
    radiusKm: 25,
    transportMode: "car",
    prefs: defaultPrefs,
  });
  const tripRef = useRef<PlannerTrip | null>(null);
  tripRef.current = trip;

  const [offerCards, setOfferCards] = useState<SalesChatCard[]>([]);
  const [offerTotal, setOfferTotal] = useState(0);
  const [offerCurrency, setOfferCurrency] = useState("USD");
  const [isOptimizing, setOptimizing] = useState(false);
  const [detailStop, setDetailStop] = useState<PlannerStop | null>(null);

  const applyTrip = useCallback((next: PlannerTrip, opts?: { keepMode?: boolean }) => {
    setTrip(next);
    setView("workspace");
    setActiveDay(1);
    setSelectedIds([]);
    if (!opts?.keepMode) setMode("planner");
    if (next.cards?.length) {
      setOfferCards(next.cards);
      setOfferTotal(
        typeof next.totalClientPrice === "number"
          ? next.totalClientPrice
          : next.cards.reduce((sum, c) => sum + (Number(c.clientPrice) || 0), 0)
      );
      if (next.currency) setOfferCurrency(next.currency);
    }
  }, []);

  const resetPlan = useCallback(() => {
    setTrip(null);
    setView("intake");
    setActiveDay(0);
    setSelectedIds([]);
    setSelectedStopId(null);
    setOfferCards([]);
    setOfferTotal(0);
    setGenerating(false);
    setDetailStop(null);
  }, []);

  const setOffers = useCallback((cards: SalesChatCard[], total?: number, currency?: string) => {
    setOfferCards(cards);
    if (typeof total === "number") setOfferTotal(total);
    else setOfferTotal(cards.reduce((sum, c) => sum + (Number(c.clientPrice) || 0), 0));
    if (currency) setOfferCurrency(currency);
  }, []);

  const mutateDay = useCallback((dayNum: number, fn: (stops: PlannerStop[]) => PlannerStop[]) => {
    setTrip((prev) => {
      if (!prev) return prev;
      const days = prev.days.map((d) => {
        if (d.day !== dayNum) return d;
        const stops = fn(d.stops).map((s, i) => ({ ...s, day: dayNum, order: i + 1 }));
        return { ...d, stops, legs: buildLegs(stops, prev.defaultMode) };
      });
      return { ...prev, days };
    });
  }, []);

  const refreshDayDirections = useCallback(
    async (
      dayNum: number,
      override?: { fromId?: string; mode?: PlannerTransportMode; all?: boolean }
    ) => {
      const current = tripRef.current;
      if (!current) return;
      const day = current.days.find((d) => d.day === dayNum);
      if (!day || day.stops.length < 2) return;
      const modes = day.stops.slice(0, -1).map((_, i) => {
        const existing = day.legs[i];
        if (override?.all && override.mode) return override.mode;
        if (override?.fromId && existing?.fromId === override.fromId && override.mode) {
          return override.mode;
        }
        return existing?.mode || current.defaultMode;
      });
      try {
        const res = await fetch("/internal/planner/route", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            points: day.stops.map((s) => ({ lat: s.lat, lng: s.lng })),
            modes,
          }),
        });
        const data = (await res.json()) as {
          ok?: boolean;
          legs?: Array<{
            durationMinutes?: number;
            distanceKm?: string;
            midpoint?: [number, number];
            polyline?: [number, number][];
            mode?: PlannerTransportMode;
            estimated?: boolean;
          }>;
        };
        if (!data.ok || !data.legs?.length) return;
        const legs = data.legs.map((leg, i) => ({
          fromId: day.stops[i].id,
          toId: day.stops[i + 1].id,
          mode: (leg.mode || modes[i] || current.defaultMode) as PlannerTransportMode,
          km: Number(leg.distanceKm || 0),
          minutes: Number(leg.durationMinutes || 1),
          polyline: leg.polyline,
          midpoint: leg.midpoint,
          estimated:
            Boolean(leg.estimated) ||
            (leg.mode || modes[i]) === "transit" ||
            (leg.mode || modes[i]) === "line",
        }));
        setTrip((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            days: prev.days.map((d) => (d.day === dayNum ? { ...d, legs } : d)),
          };
        });
      } catch {
        /* keep existing legs */
      }
    },
    []
  );

  const optimizeDay = useCallback(
    async (dayNum: number) => {
      const current = tripRef.current;
      const day = current?.days.find((d) => d.day === dayNum);
      if (!current || !day || day.stops.length < 3) {
        void refreshDayDirections(dayNum);
        return;
      }
      setOptimizing(true);
      try {
        const hotel = day.stops.find((s) => s.kind === "hotel");
        const rest = day.stops.filter((s) => s.kind !== "hotel");
        const sequence = hotel ? [hotel, ...rest] : day.stops;
        const res = await fetch("/internal/planner/optimize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            points: sequence.map((s) => ({ lat: s.lat, lng: s.lng })),
            roundtrip: Boolean(hotel),
          }),
        });
        const data = (await res.json()) as {
          ok?: boolean;
          optimizedIndices?: number[];
          legs?: Array<{
            durationMinutes?: number;
            distanceKm?: string;
            midpoint?: [number, number];
            polyline?: [number, number][];
          }>;
        };
        if (!data.ok || !data.optimizedIndices?.length) {
          mutateDay(dayNum, (stops) => optimizeStops(stops));
          void refreshDayDirections(dayNum);
          return;
        }
        const ordered = data.optimizedIndices.map((i) => sequence[i]).filter(Boolean);
        setTrip((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            days: prev.days.map((d) => {
              if (d.day !== dayNum) return d;
              const stops = ordered.map((s, i) => ({ ...s, day: dayNum, order: i + 1 }));
              const legs = (data.legs || []).map((leg, i) => ({
                fromId: stops[i]?.id || "",
                toId: stops[i + 1]?.id || "",
                mode: prev.defaultMode,
                km: Number(leg.distanceKm || 0),
                minutes: Number(leg.durationMinutes || 1),
                polyline: leg.polyline,
                midpoint: leg.midpoint,
              }));
              return { ...d, stops, legs, optimized: true };
            }),
          };
        });
      } finally {
        setOptimizing(false);
      }
    },
    [mutateDay, refreshDayDirections]
  );

  const selectDay = useCallback(
    (d: number) => {
      setActiveDay(d);
      if (d > 0) void refreshDayDirections(d);
    },
    [refreshDayDirections]
  );

  const setDiscover = useCallback((places: PlannerStop[]) => {
    setTrip((prev) => (prev ? { ...prev, discover: places } : prev));
  }, []);

  const addStop = useCallback(
    (stop: PlannerStop | PlannerIdea, day?: number) => {
      const target = day || (activeDay > 0 ? activeDay : 1);
      mutateDay(target, (stops) => {
        const hotel = stops.filter((s) => s.kind === "hotel");
        const rest = stops.filter((s) => s.kind !== "hotel");
        return [
          ...rest,
          {
            ...stop,
            id: uid("stop"),
            day: target,
            order: rest.length + 1,
            addedToDay: target,
          },
          ...hotel,
        ];
      });
    },
    [activeDay, mutateDay]
  );

  const updateStop = useCallback((id: string, patch: Partial<PlannerStop>) => {
    setTrip((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        days: prev.days.map((d) => ({
          ...d,
          stops: d.stops.map((s) => (s.id === id ? { ...s, ...patch, id: s.id, day: s.day } : s)),
        })),
      };
    });
  }, []);

  const moveStop = useCallback(
    (id: string, day: number) => {
      setTrip((prev) => {
        if (!prev) return prev;
        const from = prev.days.find((d) => d.stops.some((s) => s.id === id));
        const stop = from?.stops.find((s) => s.id === id);
        if (!stop) return prev;
        const days = prev.days.map((d) => {
          if (d.day === from?.day) {
            const stops = d.stops.filter((s) => s.id !== id);
            return { ...d, stops, legs: buildLegs(stops, prev.defaultMode) };
          }
          if (d.day === day) {
            const stops = [...d.stops, { ...stop, day, addedToDay: day }];
            return { ...d, stops, legs: buildLegs(stops, prev.defaultMode) };
          }
          return d;
        });
        return { ...prev, days };
      });
    },
    []
  );

  const replaceStop = useCallback((id: string, next: PlannerStop | PlannerIdea) => {
    setTrip((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        days: prev.days.map((d) => {
          const idx = d.stops.findIndex((s) => s.id === id);
          if (idx < 0) return d;
          const stops = d.stops.map((s, i) =>
            i === idx
              ? {
                  ...next,
                  id: s.id,
                  day: d.day,
                  order: s.order,
                  addedToDay: d.day,
                }
              : s
          );
          return { ...d, stops, legs: buildLegs(stops, prev.defaultMode) };
        }),
      };
    });
  }, []);

  const removeStops = useCallback(
    (ids: string[]) => {
      setTrip((prev) => {
        if (!prev) return prev;
        const days = prev.days.map((d) => {
          const stops = d.stops.filter((s) => !ids.includes(s.id));
          return { ...d, stops, legs: buildLegs(stops, prev.defaultMode) };
        });
        return { ...prev, days, later: prev.later.filter((s) => !ids.includes(s.id)) };
      });
      setSelectedIds([]);
    },
    []
  );

  const value = useMemo<PlannerContextValue>(
    () => ({
      mode,
      setMode,
      view,
      setView,
      mobileTab,
      setMobileTab,
      centerTab,
      setCenterTab,
      trip,
      setTrip,
      generating,
      setGenerating,
      activeDay,
      setActiveDay: selectDay,
      selectedIds,
      toggleSelected: (id) =>
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
      clearSelected: () => setSelectedIds([]),
      selectedStopId,
      setSelectedStopId,
      hoveredStopId,
      setHoveredStopId,
      mapLayer,
      setMapLayer,
      programsOpen,
      setProgramsOpen,
      applyTrip,
      resetPlan,
      addStop,
      removeStops,
      updateStop,
      moveStop,
      replaceStop,
      setDayNotes: (day, notes) =>
        setTrip((prev) =>
          prev ? { ...prev, days: prev.days.map((d) => (d.day === day ? { ...d, notes } : d)) } : prev
        ),
      setTripNotes: (notes) => setTrip((prev) => (prev ? { ...prev, notes } : prev)),
      setLegMode: (fromId, modeNext, all) => {
        setTrip((prev) => {
          if (!prev) return prev;
          const defaultMode = all ? modeNext : prev.defaultMode;
          const days = prev.days.map((d) => {
            const legs = d.legs.map((leg) => {
              if (!all && leg.fromId !== fromId) return leg;
              return {
                ...leg,
                mode: modeNext,
                minutes: estimateMinutes(leg.km, modeNext),
                estimated: modeNext === "transit" || modeNext === "line",
              };
            });
            return { ...d, legs };
          });
          return { ...prev, days, defaultMode };
        });
        const day = tripRef.current?.days.find((d) => d.legs.some((l) => l.fromId === fromId));
        if (day) void refreshDayDirections(day.day, { fromId, mode: modeNext, all });
      },
      promoteLater: (id, day) => {
        const current = tripRef.current;
        const stop = current?.later.find((s) => s.id === id);
        if (!stop) return;
        const target = day || (activeDay > 0 ? activeDay : 1);
        setTrip((prev) => (prev ? { ...prev, later: prev.later.filter((s) => s.id !== id) } : prev));
        addStop({ ...stop, day: target }, target);
      },
      removeLater: (id) =>
        setTrip((prev) => (prev ? { ...prev, later: prev.later.filter((s) => s.id !== id) } : prev)),
      setDiscover,
      detailStop,
      setDetailStop,
      optimizeDay,
      isOptimizing,
      refreshDayDirections,
      addDay: () =>
        setTrip((prev) => {
          if (!prev) return prev;
          const day = prev.days.length + 1;
          return {
            ...prev,
            durationDays: day,
            days: [
              ...prev.days,
              { day, titleAr: `اليوم ${day}`, titleEn: `Day ${day}`, notes: "", stops: [], legs: [] },
            ],
          };
        }),
      setDepartDate: (iso) => setTrip((prev) => (prev ? { ...prev, departureDate: iso } : prev)),
      addLater: (stop) =>
        setTrip((prev) => (prev ? { ...prev, later: [...prev.later, { ...stop, id: uid("later") }] } : prev)),
      defaultIntake: intakeDraft,
      setIntakeDraft: (p) => setIntake((prev) => ({ ...prev, ...p, prefs: { ...prev.prefs, ...(p.prefs || {}) } })),
      intakeDraft,
      offerCards,
      offerTotal,
      offerCurrency,
      setOffers,
    }),
    [
      mode,
      view,
      mobileTab,
      centerTab,
      trip,
      generating,
      activeDay,
      selectedIds,
      selectedStopId,
      mapLayer,
      programsOpen,
      applyTrip,
      resetPlan,
      addStop,
      removeStops,
      updateStop,
      moveStop,
      replaceStop,
      mutateDay,
      optimizeDay,
      isOptimizing,
      selectDay,
      intakeDraft,
      refreshDayDirections,
      offerCards,
      offerTotal,
      offerCurrency,
      setOffers,
      detailStop,
      setDiscover,
    ]
  );

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
}

export function usePlanner() {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error("usePlanner outside provider");
  return ctx;
}
