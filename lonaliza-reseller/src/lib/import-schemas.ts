/** Shared import-service type labels (safe for client + server). */

export const IMPORT_SERVICE_TYPES = [
  "hotel",
  "transfer",
  "flight",
  "package",
  "tour",
  "visa",
] as const;

export type ImportServiceType = (typeof IMPORT_SERVICE_TYPES)[number];

export function importSchemaPrompt(type: ImportServiceType): string {
  const schemas: Record<ImportServiceType, string> = {
    hotel: `HotelInput (بدون id):
{
  "slug": "kebab-case",
  "nameAr": "", "nameEn": "",
  "city": "", "country": "",
  "neighborhoodAr": "", "neighborhoodEn": "",
  "stars": 5, "rating": 4.7, "reviewCount": 1000,
  "addressAr": "", "addressEn": "",
  "descriptionAr": "", "descriptionEn": "",
  "highlightsAr": [""], "highlightsEn": [""],
  "images": ["https://..."],
  "amenities": ["WiFi","Pool"],
  "rooms": [{
    "id": "r1", "nameAr": "", "nameEn": "",
    "descriptionAr": "", "descriptionEn": "",
    "beds": "1 King", "capacity": 2, "sizeSqm": 40,
    "price": 300, "currency": "USD",
    "amenities": [], "images": ["https://..."],
    "breakfastIncluded": true, "freeCancellation": true
  }],
  "lat": 25.1, "lng": 55.2,
  "checkIn": "15:00", "checkOut": "12:00",
  "policiesAr": [], "policiesEn": [],
  "whatsappNumber": "905321796763",
  "whatsappMessageAr": "", "whatsappMessageEn": "",
  "phone": "", "website": "",
  "isFeatured": false, "isActive": true
}`,
    transfer: `TransferInput (بدون id):
{
  "slug": "kebab-case",
  "type": "transfer" | "vip_tour",
  "titleAr": "", "titleEn": "",
  "descriptionAr": "", "descriptionEn": "",
  "vehicleName": "", "vehicleType": "Sedan", "vehicleClass": "Luxury",
  "seats": 3, "luggage": 3,
  "price": 65, "currency": "USD", "durationHours": 1,
  "routeFrom": "", "routeTo": "", "routeFromAr": "", "routeToAr": "",
  "highlightsAr": [], "highlightsEn": [],
  "includesAr": [], "includesEn": [],
  "images": ["https://..."],
  "whatsappNumber": "905321796763",
  "whatsappMessageAr": "", "whatsappMessageEn": "",
  "isFeatured": false, "isActive": true
}`,
    flight: `Flight (بدون id):
{
  "airline": "", "airlineLogo": "🛫", "flightNumber": "",
  "departure": { "time": "08:00", "city": "", "airport": "" },
  "arrival": { "time": "12:00", "city": "", "airport": "" },
  "duration": "7h 30m", "stops": 0, "price": 900,
  "amenities": ["wifi","meals"], "isActive": true
}`,
    package: `HolidayPackage (بدون id):
{
  "slug": "", "title": "", "destination": "", "country": "",
  "durationDays": 5, "price": 1299, "currency": "USD", "rating": 4.8,
  "images": [{ "url": "https://...", "alt": "", "width": 800, "height": 600 }],
  "amenities": [], "isFeatured": true,
  "description": "", "inclusions": [], "exclusions": [],
  "itinerary": [{ "day": 1, "title": "", "description": "" }]
}`,
    tour: `Tour (بدون id):
{
  "slug": "", "title": "", "destination": "Dubai",
  "duration": "8 hours", "price": 99, "currency": "USD",
  "images": ["https://..."], "highlights": [], "description": "",
  "isActive": true, "isFeatured": false
}`,
    visa: `VisaCountry:
{
  "id": "uae", "country": "United Arab Emirates", "flag": "🇦🇪", "isActive": true,
  "types": [{
    "name": "Tourist Visa", "duration": "30 Days", "price": "AED 350",
    "processingTime": "2-3 Working Days",
    "features": ["Single Entry"]
  }]
}`,
  };
  return schemas[type];
}
