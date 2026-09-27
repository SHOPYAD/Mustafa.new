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
        airline: "Turkish Airlines",
        airlineLogo: "TK",
        flightNumber: "TK0134",
        departure: { time: "18:30", city: "Istanbul", airport: "IST" },
        arrival: { time: "23:20", city: "Riyadh", airport: "RUH" },
        duration: "3h 50m",
        stops: 0,
        price: 340,
        amenities: ["wifi", "meals", "entertainment", "luggage_30kg"],
        isActive: true,
    },
    {
        id: "2",
        airline: "Turkish Airlines",
        airlineLogo: "TK",
        flightNumber: "TK0142",
        departure: { time: "01:15", city: "Istanbul", airport: "IST" },
        arrival: { time: "06:00", city: "Jeddah", airport: "JED" },
        duration: "3h 45m",
        stops: 0,
        price: 320,
        amenities: ["wifi", "meals", "entertainment", "luggage_30kg"],
        isActive: true,
    },
    {
        id: "3",
        airline: "Saudia",
        airlineLogo: "SV",
        flightNumber: "SV0256",
        departure: { time: "09:20", city: "Jeddah", airport: "JED" },
        arrival: { time: "13:15", city: "Istanbul", airport: "IST" },
        duration: "3h 55m",
        stops: 0,
        price: 310,
        amenities: ["wifi", "meals", "luggage_2x23kg"],
        isActive: true,
    },
    {
        id: "4",
        airline: "Saudia",
        airlineLogo: "SV",
        flightNumber: "SV0260",
        departure: { time: "14:00", city: "Riyadh", airport: "RUH" },
        arrival: { time: "18:10", city: "Istanbul", airport: "IST" },
        duration: "4h 10m",
        stops: 0,
        price: 330,
        amenities: ["wifi", "meals", "entertainment", "luggage_2x23kg"],
        isActive: true,
    },
    {
        id: "5",
        airline: "Pegasus Airlines",
        airlineLogo: "PC",
        flightNumber: "PC0690",
        departure: { time: "20:45", city: "Istanbul Sabiha", airport: "SAW" },
        arrival: { time: "01:25", city: "Riyadh", airport: "RUH" },
        duration: "3h 40m",
        stops: 0,
        price: 190,
        amenities: ["luggage_20kg", "cabin_bag"],
        isActive: true,
    },
    {
        id: "6",
        airline: "Pegasus Airlines",
        airlineLogo: "PC",
        flightNumber: "PC0692",
        departure: { time: "21:10", city: "Istanbul Sabiha", airport: "SAW" },
        arrival: { time: "01:45", city: "Jeddah", airport: "JED" },
        duration: "3h 35m",
        stops: 0,
        price: 185,
        amenities: ["luggage_20kg", "cabin_bag"],
        isActive: true,
    },
    {
        id: "7",
        airline: "Flynas",
        airlineLogo: "XY",
        flightNumber: "XY0612",
        departure: { time: "07:15", city: "Riyadh", airport: "RUH" },
        arrival: { time: "10:40", city: "Trabzon", airport: "TZX" },
        duration: "3h 25m",
        stops: 0,
        price: 280,
        amenities: ["meals", "luggage_20kg"],
        isActive: true,
    },
    {
        id: "8",
        airline: "Flynas",
        airlineLogo: "XY",
        flightNumber: "XY0614",
        departure: { time: "11:30", city: "Jeddah", airport: "JED" },
        arrival: { time: "15:00", city: "Trabzon", airport: "TZX" },
        duration: "3h 30m",
        stops: 0,
        price: 295,
        amenities: ["meals", "luggage_20kg"],
        isActive: true,
    },
    {
        id: "9",
        airline: "Turkish Airlines",
        airlineLogo: "TK",
        flightNumber: "TK4910",
        departure: { time: "06:00", city: "Istanbul", airport: "IST" },
        arrival: { time: "07:45", city: "Trabzon", airport: "TZX" },
        duration: "1h 45m",
        stops: 0,
        price: 75,
        amenities: ["meals", "luggage_20kg"],
        isActive: true,
    },
    {
        id: "10",
        airline: "Turkish Airlines",
        airlineLogo: "TK",
        flightNumber: "TK4922",
        departure: { time: "09:30", city: "Istanbul", airport: "IST" },
        arrival: { time: "10:50", city: "Antalya", airport: "AYT" },
        duration: "1h 20m",
        stops: 0,
        price: 65,
        amenities: ["meals", "luggage_20kg"],
        isActive: true,
    },
    {
        id: "11",
        airline: "Emirates",
        airlineLogo: "EK",
        flightNumber: "EK0121",
        departure: { time: "10:45", city: "Dubai", airport: "DXB" },
        arrival: { time: "14:30", city: "Istanbul", airport: "IST" },
        duration: "4h 45m",
        stops: 0,
        price: 420,
        amenities: ["wifi", "meals", "entertainment", "ice_system", "luggage_35kg"],
        isActive: true,
    },
    {
        id: "12",
        airline: "Flydubai",
        airlineLogo: "FZ",
        flightNumber: "FZ0751",
        departure: { time: "12:10", city: "Dubai", airport: "DXB" },
        arrival: { time: "15:00", city: "Trabzon", airport: "TZX" },
        duration: "3h 50m",
        stops: 0,
        price: 310,
        amenities: ["meals", "entertainment", "luggage_20kg"],
        isActive: true,
    },
    {
        id: "13",
        airline: "Flydubai",
        airlineLogo: "FZ",
        flightNumber: "FZ0753",
        departure: { time: "17:20", city: "Dubai", airport: "DXB" },
        arrival: { time: "20:50", city: "Istanbul Sabiha", airport: "SAW" },
        duration: "4h 30m",
        stops: 0,
        price: 260,
        amenities: ["meals", "luggage_20kg"],
        isActive: true,
    },
    {
        id: "14",
        airline: "Kuwait Airways",
        airlineLogo: "KU",
        flightNumber: "KU0153",
        departure: { time: "09:00", city: "Kuwait", airport: "KWI" },
        arrival: { time: "12:35", city: "Istanbul", airport: "IST" },
        duration: "3h 35m",
        stops: 0,
        price: 310,
        amenities: ["wifi", "meals", "luggage_2x23kg"],
        isActive: true,
    },
    {
        id: "15",
        airline: "Jazeera Airways",
        airlineLogo: "J9",
        flightNumber: "J90251",
        departure: { time: "13:40", city: "Kuwait", airport: "KWI" },
        arrival: { time: "16:55", city: "Trabzon", airport: "TZX" },
        duration: "3h 15m",
        stops: 0,
        price: 240,
        amenities: ["luggage_20kg"],
        isActive: true,
    },
    {
        id: "16",
        airline: "Qatar Airways",
        airlineLogo: "QR",
        flightNumber: "QR0241",
        departure: { time: "08:30", city: "Doha", airport: "DOH" },
        arrival: { time: "12:50", city: "Istanbul", airport: "IST" },
        duration: "4h 20m",
        stops: 0,
        price: 450,
        amenities: ["wifi", "meals", "oryx_one", "luggage_30kg"],
        isActive: true,
    },
    {
        id: "17",
        airline: "Pegasus Airlines",
        airlineLogo: "PC",
        flightNumber: "PC0702",
        departure: { time: "19:30", city: "Istanbul Sabiha", airport: "SAW" },
        arrival: { time: "00:25", city: "Dammam", airport: "DMM" },
        duration: "3h 55m",
        stops: 0,
        price: 195,
        amenities: ["luggage_20kg", "cabin_bag"],
        isActive: true,
    },
    {
        id: "18",
        airline: "Turkish Airlines",
        airlineLogo: "TK",
        flightNumber: "TK0150",
        departure: { time: "22:15", city: "Istanbul", airport: "IST" },
        arrival: { time: "03:15", city: "Dammam", airport: "DMM" },
        duration: "4h 00m",
        stops: 0,
        price: 350,
        amenities: ["wifi", "meals", "entertainment", "luggage_30kg"],
        isActive: true,
    },
    {
        id: "19",
        airline: "Pegasus Airlines",
        airlineLogo: "PC",
        flightNumber: "PC0710",
        departure: { time: "21:00", city: "Istanbul Sabiha", airport: "SAW" },
        arrival: { time: "01:30", city: "Kuwait", airport: "KWI" },
        duration: "3h 30m",
        stops: 0,
        price: 175,
        amenities: ["luggage_20kg"],
        isActive: true,
    },
    {
        id: "20",
        airline: "Turkish Airlines",
        airlineLogo: "TK",
        flightNumber: "TK4930",
        departure: { time: "11:15", city: "Istanbul", airport: "IST" },
        arrival: { time: "12:30", city: "Bodrum", airport: "BJV" },
        duration: "1h 15m",
        stops: 0,
        price: 70,
        amenities: ["meals", "luggage_20kg"],
        isActive: true,
    },
    {
        id: "21",
        airline: "Turkish Airlines",
        airlineLogo: "TK",
        flightNumber: "TK4940",
        departure: { time: "07:05", city: "Istanbul", airport: "IST" },
        arrival: { time: "08:20", city: "Cappadocia Nevşehir", airport: "NAV" },
        duration: "1h 15m",
        stops: 0,
        price: 80,
        amenities: ["meals", "luggage_20kg"],
        isActive: true,
    },
    {
        id: "22",
        airline: "Flynas",
        airlineLogo: "XY",
        flightNumber: "XY0620",
        departure: { time: "06:30", city: "Dammam", airport: "DMM" },
        arrival: { time: "10:10", city: "Trabzon", airport: "TZX" },
        duration: "3h 40m",
        stops: 0,
        price: 270,
        amenities: ["meals", "luggage_20kg"],
        isActive: true,
    },
    {
        id: "23",
        airline: "Oman Air",
        airlineLogo: "WY",
        flightNumber: "WY0165",
        departure: { time: "14:10", city: "Muscat", airport: "MCT" },
        arrival: { time: "18:25", city: "Istanbul", airport: "IST" },
        duration: "5h 15m",
        stops: 0,
        price: 360,
        amenities: ["wifi", "meals", "luggage_30kg"],
        isActive: true,
    },
    {
        id: "24",
        airline: "EgyptAir",
        airlineLogo: "MS",
        flightNumber: "MS0737",
        departure: { time: "10:00", city: "Cairo", airport: "CAI" },
        arrival: { time: "13:15", city: "Istanbul", airport: "IST" },
        duration: "2h 15m",
        stops: 0,
        price: 220,
        amenities: ["meals", "luggage_2x23kg"],
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
