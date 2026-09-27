"use client";

import { useState, Suspense } from "react";
import FlightResultCard from "@/components/flights/FlightResultCard";
import FlightSearchBar from "@/components/flights/FlightSearchBar";
import FlightFilters from "@/components/flights/FlightFilters";
import FlightDatePriceSlider from "@/components/flights/FlightDatePriceSlider";
import { flightCopy } from "@/components/flights/copy";
import type {
  FlightFiltersState,
  FlightSearchQuery,
  Itinerary,
  SelectedFare,
} from "@/components/flights/types";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const MOCK_QUERY: FlightSearchQuery = {
  tripType: "round-trip",
  origin: {
    skyId: "RUH",
    entityId: "27544008",
    iata: "RUH",
    name: "مطار الملك خالد الدولي",
    city: "الرياض",
    country: "السعودية",
    kind: "airport",
  },
  destination: {
    skyId: "IST",
    entityId: "27541484",
    iata: "IST",
    name: "مطار إسطنبول الدولي",
    city: "إسطنبول",
    country: "تركيا",
    kind: "airport",
  },
  date: "2026-09-20",
  returnDate: "2026-09-27",
  multiLegs: [],
  adults: 2,
  childrens: 0,
  infants: 0,
  cabinClass: "economy",
  currency: "USD",
  directOnly: false,
  baggage: "included",
};

const MOCK_ITINERARIES: Itinerary[] = [
  {
    id: "itin-sv-101",
    price: 320,
    rawPrice: 320,
    currency: "USD",
    formattedPrice: "$320.00",
    isSelfTransfer: false,
    score: 9.8,
    tags: ["best", "cheapest"],
    cabinBaggage: "حقيبة يد 7 كجم مشمولة",
    checkedBaggage: "حقيبتان 23 كجم مشمولة مجاناً",
    fareFamilies: [
      {
        id: "fare-sv-basic",
        name: "الضيافة المرنة (Economy Flex)",
        price: 320,
        currency: "USD",
        cabinClass: "economy",
        baggage: "2 × 23 kg",
        refundable: true,
        changeable: true,
        features: ["وجبة ساخنة فاخرة", "شحن أمتعة 46 كجم", "اختيار المقعد مجاناً"],
      },
      {
        id: "fare-sv-business",
        name: "درجة الأعمال (Business)",
        price: 780,
        currency: "USD",
        cabinClass: "business",
        baggage: "2 × 32 kg",
        refundable: true,
        changeable: true,
        features: ["مقعد سرير منبسط", "دخول صالة الفرسان VIP", "أولوية الصعود"],
      },
    ],
    legs: [
      {
        id: "leg-1",
        origin: { displayCode: "RUH", name: "مطار الملك خالد", city: "الرياض", country: "السعودية", terminal: "T4" },
        destination: { displayCode: "IST", name: "مطار إسطنبول", city: "إسطنبول", country: "تركيا", terminal: "Main" },
        departure: "2026-09-20T08:30:00",
        arrival: "2026-09-20T12:15:00",
        durationInMinutes: 225,
        stopCount: 0,
        timeDeltaInDays: 0,
        carriers: [{ id: "SV", name: "الخطوط السعودية", code: "SV", logoUrl: "https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/SV.svg" }],
        segments: [
          {
            id: "seg-1",
            origin: { displayCode: "RUH", name: "مطار الملك خالد", city: "الرياض", country: "السعودية", terminal: "T4" },
            destination: { displayCode: "IST", name: "مطار إسطنبول", city: "إسطنبول", country: "تركيا", terminal: "Main" },
            departure: "2026-09-20T08:30:00",
            arrival: "2026-09-20T12:15:00",
            durationInMinutes: 225,
            flightNumber: "SV 258",
            marketingCarrier: { id: "SV", name: "الخطوط السعودية", code: "SV", logoUrl: "https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/SV.svg" },
          },
        ],
        layovers: [],
      },
      {
        id: "leg-2",
        origin: { displayCode: "IST", name: "مطار إسطنبول", city: "إسطنبول", country: "تركيا", terminal: "Main" },
        destination: { displayCode: "RUH", name: "مطار الملك خالد", city: "الرياض", country: "السعودية", terminal: "T4" },
        departure: "2026-09-27T14:40:00",
        arrival: "2026-09-27T18:20:00",
        durationInMinutes: 220,
        stopCount: 0,
        timeDeltaInDays: 0,
        carriers: [{ id: "SV", name: "الخطوط السعودية", code: "SV", logoUrl: "https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/SV.svg" }],
        segments: [
          {
            id: "seg-2",
            origin: { displayCode: "IST", name: "مطار إسطنبول", city: "إسطنبول", country: "تركيا", terminal: "Main" },
            destination: { displayCode: "RUH", name: "مطار الملك خالد", city: "الرياض", country: "السعودية", terminal: "T4" },
            departure: "2026-09-27T14:40:00",
            arrival: "2026-09-27T18:20:00",
            durationInMinutes: 220,
            flightNumber: "SV 259",
            marketingCarrier: { id: "SV", name: "الخطوط السعودية", code: "SV", logoUrl: "https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/SV.svg" },
          },
        ],
        layovers: [],
      },
    ],
  },
  {
    id: "itin-tk-202",
    price: 345,
    rawPrice: 345,
    currency: "USD",
    formattedPrice: "$345.00",
    isSelfTransfer: false,
    score: 9.6,
    tags: ["fastest"],
    cabinBaggage: "حقيبة يد 8 كجم",
    checkedBaggage: "30 كجم حقائب مسجلة",
    fareFamilies: [
      {
        id: "fare-tk-classic",
        name: "الدرجة السياحية (EcoFly)",
        price: 345,
        currency: "USD",
        cabinClass: "economy",
        baggage: "30 kg",
        refundable: true,
        changeable: true,
        features: ["وجبات ساخنة مميزة", "شاشات ترفيه فردية", "أمتعة 30 كجم"],
      },
    ],
    legs: [
      {
        id: "leg-tk-1",
        origin: { displayCode: "RUH", name: "مطار الملك خالد", city: "الرياض", country: "السعودية", terminal: "T2" },
        destination: { displayCode: "IST", name: "مطار إسطنبول", city: "إسطنبول", country: "تركيا", terminal: "Main" },
        departure: "2026-09-20T14:10:00",
        arrival: "2026-09-20T18:05:00",
        durationInMinutes: 235,
        stopCount: 0,
        timeDeltaInDays: 0,
        carriers: [{ id: "TK", name: "الخطوط التركية", code: "TK", logoUrl: "https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/TK.svg" }],
        segments: [
          {
            id: "seg-tk-1",
            origin: { displayCode: "RUH", name: "مطار الملك خالد", city: "الرياض", country: "السعودية", terminal: "T2" },
            destination: { displayCode: "IST", name: "مطار إسطنبول", city: "إسطنبول", country: "تركيا", terminal: "Main" },
            departure: "2026-09-20T14:10:00",
            arrival: "2026-09-20T18:05:00",
            durationInMinutes: 235,
            flightNumber: "TK 142",
            marketingCarrier: { id: "TK", name: "الخطوط التركية", code: "TK", logoUrl: "https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/TK.svg" },
          },
        ],
        layovers: [],
      },
    ],
  },
  {
    id: "itin-xy-303",
    price: 240,
    rawPrice: 240,
    currency: "USD",
    formattedPrice: "$240.00",
    isSelfTransfer: false,
    score: 9.1,
    tags: ["cheapest"],
    cabinBaggage: "حقيبة يد 7 كجم",
    checkedBaggage: "20 كجم حقائب مسجلة",
    fareFamilies: [
      {
        id: "fare-xy-value",
        name: "اقتصادي متميز (Value)",
        price: 240,
        currency: "USD",
        cabinClass: "economy",
        baggage: "20 kg",
        refundable: false,
        changeable: true,
        features: ["سعر اقتصادي منافس", "حقيبة 20 كجم", "رحلة ليلية مباشرة"],
      },
    ],
    legs: [
      {
        id: "leg-xy-1",
        origin: { displayCode: "RUH", name: "مطار الملك خالد", city: "الرياض", country: "السعودية", terminal: "T3" },
        destination: { displayCode: "SAW", name: "مطار صبيحة كوكجن", city: "إسطنبول", country: "تركيا", terminal: "Main" },
        departure: "2026-09-20T22:45:00",
        arrival: "2026-09-21T03:10:00",
        durationInMinutes: 265,
        stopCount: 0,
        timeDeltaInDays: 1,
        carriers: [{ id: "XY", name: "طيران ناس (flynas)", code: "XY", logoUrl: "https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/XY.svg" }],
        segments: [
          {
            id: "seg-xy-1",
            origin: { displayCode: "RUH", name: "مطار الملك خالد", city: "الرياض", country: "السعودية", terminal: "T3" },
            destination: { displayCode: "SAW", name: "مطار صبيحة كوكجن", city: "إسطنبول", country: "تركيا", terminal: "Main" },
            departure: "2026-09-20T22:45:00",
            arrival: "2026-09-21T03:10:00",
            durationInMinutes: 265,
            flightNumber: "XY 611",
            marketingCarrier: { id: "XY", name: "طيران ناس (flynas)", code: "XY", logoUrl: "https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/XY.svg" },
          },
        ],
        layovers: [],
      },
    ],
  },
];

const MOCK_AIRLINES_OPTS = [
  { name: "الخطوط السعودية", code: "SV", logoUrl: "https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/SV.svg", minPrice: 320, currency: "USD" },
  { name: "الخطوط التركية", code: "TK", logoUrl: "https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/TK.svg", minPrice: 280, currency: "USD" },
  { name: "طيران ناس (flynas)", code: "XY", logoUrl: "https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/XY.svg", minPrice: 240, currency: "USD" },
];

const MOCK_ORIGIN_AIRPORTS = [
  { code: "RUH", name: "مطار الملك خالد الدولي (الرياض)", count: 3 },
];

const MOCK_DEST_AIRPORTS = [
  { code: "IST", name: "مطار إسطنبول الدولي (IST)", count: 2 },
  { code: "SAW", name: "مطار صبيحة كوكجن (SAW)", count: 1 },
];

const INITIAL_FILTERS: FlightFiltersState = {
  directOnly: false,
  stops: [],
  airlines: [],
  originAirports: [],
  destAirports: [],
  layoverAirports: [],
  fareBrands: [],
  baggageKg: null,
  changeableOnly: false,
  overnightOnly: false,
  departStart: 0,
  departEnd: 24,
  arriveStart: 0,
  arriveEnd: 24,
  maxDuration: 600,
  cabinClass: "any",
  baggage: "any",
  priceMin: 0,
  priceMax: 1000,
  freeCancellation: false,
};

export const dynamic = "force-dynamic";

function FlightsContent() {
  const { locale } = useLocale();
  const copy = flightCopy(locale);

  const [query, setQuery] = useState<FlightSearchQuery>(MOCK_QUERY);
  const [filters, setFilters] = useState<FlightFiltersState>(INITIAL_FILTERS);
  const [itineraries, setItineraries] = useState<Itinerary[]>(MOCK_ITINERARIES);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Real Flight Search Bar Component */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm">
        <FlightSearchBar
          query={query}
          onChange={setQuery}
          onSubmit={() => {}}
          copy={copy}
          tone="brand"
        />
      </div>

      {/* Date Price Slider */}
      <div className="max-w-7xl mx-auto bg-white rounded-2xl p-3 border border-slate-200 shadow-xs">
        <FlightDatePriceSlider
          query={query}
          copy={copy}
          onSelectDate={(date) => setQuery((q) => ({ ...q, date }))}
        />
      </div>

      {/* Main Real Search Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Real Left Filters Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <FlightFilters
            copy={copy}
            filters={filters}
            onChange={setFilters}
            airlines={MOCK_AIRLINES_OPTS}
            originAirports={MOCK_ORIGIN_AIRPORTS}
            destAirports={MOCK_DEST_AIRPORTS}
            maxDuration={600}
            priceBounds={{ min: 240, max: 800, currency: "USD" }}
          />
        </div>

        {/* Real Right Results List with Real FlightResultCard */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between text-xs font-bold text-slate-700">
            <span>تم العثور على {itineraries.length} رحلات مباشرة عبر Amadeus & Sabre GDS</span>
            <span className="text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
              أسعار نهائية شاملة للضرائب
            </span>
          </div>

          {itineraries.map((itin) => (
            <FlightResultCard
              key={itin.id}
              item={itin}
              query={query}
              copy={copy}
              onSelect={(selection) => {
                alert(`تم اختيار الرحلة: ${selection.fare?.name || selection.itinerary.id} بقيمة $${selection.fare?.price || selection.itinerary.price}`);
              }}
              onOpenDetails={() => {}}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PortalFlightsPreview() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
        </div>
      }
    >
      <FlightsContent />
    </Suspense>
  );
}
