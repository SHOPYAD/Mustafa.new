// src/data/flights.ts

export interface Flight {
    id: string;
    airline: string;
    airlineLogo: string;
    flightNumber: string;
    departure: {
        time: string;
        city: string;
        airport: string;
    };
    arrival: {
        time: string;
        city: string;
        airport: string;
    };
    duration: string;
    stops: number;
    price: number;
    amenities: string[];
    isActive: boolean;
}

export const defaultFlights: Flight[] = [
    {
        id: "1",
        airline: "Emirates",
        airlineLogo: "🛫",
        flightNumber: "EK500",
        departure: { time: "08:00", city: "Dubai", airport: "DXB" },
        arrival: { time: "12:30", city: "London", airport: "LHR" },
        duration: "7h 30m",
        stops: 0,
        price: 2500,
        amenities: ["wifi", "meals", "entertainment"],
        isActive: true,
    },
    {
        id: "2",
        airline: "Etihad Airways",
        airlineLogo: "✈️",
        flightNumber: "EY019",
        departure: { time: "10:15", city: "Abu Dhabi", airport: "AUH" },
        arrival: { time: "14:45", city: "London", airport: "LHR" },
        duration: "7h 30m",
        stops: 0,
        price: 2350,
        amenities: ["wifi", "meals"],
        isActive: true,
    },
    {
        id: "3",
        airline: "Qatar Airways",
        airlineLogo: "🌍",
        flightNumber: "QR007",
        departure: { time: "02:30", city: "Doha", airport: "DOH" },
        arrival: { time: "08:15", city: "London", airport: "LHR" },
        duration: "7h 45m",
        stops: 0,
        price: 2200,
        amenities: ["wifi", "meals", "entertainment"],
        isActive: true,
    },
    {
        id: "4",
        airline: "Flydubai",
        airlineLogo: "🔵",
        flightNumber: "FZ003",
        departure: { time: "14:00", city: "Dubai", airport: "DXB" },
        arrival: { time: "20:30", city: "London", airport: "STN" },
        duration: "9h 30m",
        stops: 1,
        price: 1800,
        amenities: ["meals"],
        isActive: true,
    },
];

export const FLIGHTS_STORAGE_KEY = "liotrip_flights";
const STORAGE_KEY = FLIGHTS_STORAGE_KEY;
const LEGACY_STORAGE_KEY = "oktravel_flights";

// Get all flights from localStorage (falls back to defaults)
export function getFlights(): Flight[] {
    if (typeof window === "undefined") return defaultFlights;
    try {
        const stored =
            localStorage.getItem(STORAGE_KEY) ||
            localStorage.getItem(LEGACY_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
        // Initialize with defaults
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultFlights));
        return defaultFlights;
    } catch {
        return defaultFlights;
    }
}

// Get only active flights (for public page)
export function getActiveFlights(): Flight[] {
    return getFlights().filter((f) => f.isActive);
}

// Save all flights
export function saveFlights(flights: Flight[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flights));
}

// Add a new flight
export function addFlight(flight: Omit<Flight, "id">): Flight {
    const flights = getFlights();
    const newFlight: Flight = {
        ...flight,
        id: Date.now().toString(),
    };
    flights.push(newFlight);
    saveFlights(flights);
    return newFlight;
}

// Update an existing flight
export function updateFlight(id: string, updates: Partial<Flight>): Flight | null {
    const flights = getFlights();
    const index = flights.findIndex((f) => f.id === id);
    if (index === -1) return null;
    flights[index] = { ...flights[index], ...updates };
    saveFlights(flights);
    return flights[index];
}

// Delete a flight
export function deleteFlight(id: string): boolean {
    const flights = getFlights();
    const filtered = flights.filter((f) => f.id !== id);
    if (filtered.length === flights.length) return false;
    saveFlights(filtered);
    return true;
}

// Reset to defaults
export function resetFlights(): Flight[] {
    saveFlights(defaultFlights);
    return defaultFlights;
}
