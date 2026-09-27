// src/data/visa.ts
export interface VisaSubType {
    name: string;
    duration: string;
    price: string;
    processingTime: string;
    features: string[];
}

export interface VisaCountry {
    id: string;
    country: string;
    flag: string;
    types: VisaSubType[];
    isActive?: boolean;
}

export const defaultVisaData: VisaCountry[] = [
    {
        id: "uae",
        country: "United Arab Emirates",
        flag: "🇦🇪",
        isActive: true,
        types: [
            {
                name: "Tourist Visa",
                duration: "30 Days",
                price: "AED 350",
                processingTime: "2-3 Working Days",
                features: ["Single Entry", "Valid for 60 days from issue"],
            },
            {
                name: "Tourist Visa",
                duration: "60 Days",
                price: "AED 650",
                processingTime: "2-3 Working Days",
                features: ["Single Entry", "Valid for 90 days from issue"],
            },
            {
                name: "Tourist Visa",
                duration: "90 Days",
                price: "AED 1200",
                processingTime: "3-5 Working Days",
                features: ["Multiple Entry", "Valid for 180 days from issue"],
            },
            {
                name: "Visa Change",
                duration: "Inside UAE",
                price: "AED 900",
                processingTime: "Same Day",
                features: ["No exit required", "All nationalities accepted"],
            },
        ],
    },
    {
        id: "schengen",
        country: "Schengen Countries",
        flag: "🇪🇺",
        isActive: true,
        types: [
            {
                name: "Tourist Visa",
                duration: "Short Stay",
                price: "AED 1500",
                processingTime: "15-20 Working Days",
                features: ["Up to 90 days", "26 European countries"],
            },
            {
                name: "Business Visa",
                duration: "Short Stay",
                price: "AED 2000",
                processingTime: "15-20 Working Days",
                features: ["Business meetings", "Conferences"],
            },
        ],
    },
    {
        id: "uk",
        country: "United Kingdom",
        flag: "🇬🇧",
        isActive: true,
        types: [
            {
                name: "Standard Visitor",
                duration: "6 Months",
                price: "AED 1200",
                processingTime: "15-20 Working Days",
                features: ["Multiple Entry", "Tourism & Business"],
            },
            {
                name: "Standard Visitor",
                duration: "2 Years",
                price: "AED 2500",
                processingTime: "15-20 Working Days",
                features: ["Multiple Entry", "Long validity"],
            },
        ],
    },
    {
        id: "usa",
        country: "United States",
        flag: "🇺🇸",
        isActive: true,
        types: [
            {
                name: "B1/B2 Visa",
                duration: "10 Years",
                price: "AED 1500",
                processingTime: "Interview Required",
                features: ["Multiple Entry", "Tourism & Business"],
            },
        ],
    },
];

export const VISA_STORAGE_KEY = "liotrip_visa";
export const LEGACY_VISA_STORAGE_KEY = "oktravel_visa";
const STORAGE_KEY = VISA_STORAGE_KEY;

export function getVisaData(): VisaCountry[] {
    if (typeof window === "undefined") return defaultVisaData;
    try {
        const stored =
            localStorage.getItem(STORAGE_KEY) ||
            localStorage.getItem(LEGACY_VISA_STORAGE_KEY);
        if (stored) return JSON.parse(stored);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultVisaData));
        return defaultVisaData;
    } catch {
        return defaultVisaData;
    }
}

export function getActiveVisaData(): VisaCountry[] {
    return getVisaData().filter((v) => v.isActive !== false);
}

export function saveVisaData(data: VisaCountry[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function addVisaCountry(country: Omit<VisaCountry, "id">): VisaCountry {
    const data = getVisaData();
    const newCountry: VisaCountry = {
        ...country,
        id: Date.now().toString(),
    };
    data.push(newCountry);
    saveVisaData(data);
    return newCountry;
}

export function updateVisaCountry(id: string, updates: Partial<VisaCountry>): VisaCountry | null {
    const data = getVisaData();
    const index = data.findIndex((d) => d.id === id);
    if (index === -1) return null;
    data[index] = { ...data[index], ...updates };
    saveVisaData(data);
    return data[index];
}

export function deleteVisaCountry(id: string): boolean {
    const data = getVisaData();
    const filtered = data.filter((d) => d.id !== id);
    if (filtered.length === data.length) return false;
    saveVisaData(filtered);
    return true;
}

export function resetVisaData(): VisaCountry[] {
    saveVisaData(defaultVisaData);
    return defaultVisaData;
}
