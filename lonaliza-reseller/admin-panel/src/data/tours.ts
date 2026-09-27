// src/data/tours.ts
import migratedTours from "./migrated/tours.json";
export interface Tour {
    id: string;
    title: string;
    image: string;
    duration: string;
    timing: "morning" | "afternoon" | "evening";
    rating: number;
    reviewCount: number;
    price: number;
    originalPrice?: number;
    highlights: string[];
    category: string;
    popular?: boolean;
    isActive?: boolean;
}

/** Prices are approximate 2024–2026 Turkey day-tour / hotel-from rates in USD. */
export const defaultTours: Tour[] = migratedTours as Tour[];

const STORAGE_KEY = "alrayyan_tours_v3_approx_prices";
const OLD_STORAGE_KEYS = [
    "oktravel_tours_v2_migrated",
    "oktravel_tours_v2",
    "oktravel_tours",
];

function clearLegacyTourKeys() {
    for (const key of OLD_STORAGE_KEYS) {
        try {
            localStorage.removeItem(key);
        } catch {
            /* ignore */
        }
    }
}

export function getTours(): Tour[] {
    if (typeof window === "undefined") return defaultTours;
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
        clearLegacyTourKeys();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultTours));
        return defaultTours;
    } catch {
        return defaultTours;
    }
}

export function getActiveTours(): Tour[] {
    return getTours().filter((t) => t.isActive !== false);
}

export function saveTours(tours: Tour[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tours));
}

export function addTour(tour: Omit<Tour, "id">): Tour {
    const tours = getTours();
    const newTour: Tour = { ...tour, id: Date.now().toString() };
    tours.push(newTour);
    saveTours(tours);
    return newTour;
}

export function updateTour(id: string, updates: Partial<Tour>): Tour | null {
    const tours = getTours();
    const index = tours.findIndex((t) => t.id === id);
    if (index === -1) return null;
    tours[index] = { ...tours[index], ...updates };
    saveTours(tours);
    return tours[index];
}

export function deleteTour(id: string): boolean {
    const tours = getTours();
    const filtered = tours.filter((t) => t.id !== id);
    if (filtered.length === tours.length) return false;
    saveTours(filtered);
    return true;
}

export function resetTours(): Tour[] {
    saveTours(defaultTours);
    return defaultTours;
}

export async function fetchTours(): Promise<Tour[]> {
    try {
        const res = await fetch("/api/tours", { cache: "no-store" });
        const data = (await res.json()) as { ok?: boolean; tours?: Tour[] };
        if (data.ok && Array.isArray(data.tours) && data.tours.length) {
            const byId = new Map(data.tours.map((t) => [t.id, t]));
            for (const tour of getTours()) {
                if (!byId.has(tour.id)) byId.set(tour.id, tour);
            }
            return Array.from(byId.values());
        }
    } catch {
        /* local */
    }
    return getTours();
}

export async function fetchAdminTours(): Promise<Tour[]> {
    try {
        const res = await fetch("/api/admin/tours", { cache: "no-store" });
        const data = (await res.json()) as { ok?: boolean; tours?: Tour[] };
        if (data.ok && Array.isArray(data.tours) && data.tours.length) {
            const byId = new Map(data.tours.map((t) => [t.id, t]));
            for (const tour of getTours()) {
                if (!byId.has(tour.id)) byId.set(tour.id, tour);
            }
            return Array.from(byId.values());
        }
    } catch {
        /* local */
    }
    return getTours();
}
