"use client";

import { useEffect, useState, Suspense } from "react";
import FlightBookingFunnel from "@/components/flights/FlightBookingFunnel";
import { BOOKING_SESSION_KEY } from "@/components/flights/search-state";
import type { FlightSearchQuery, SelectedFare } from "@/components/flights/types";
import { Loader2 } from "lucide-react";

const MOCK_QUERY: FlightSearchQuery = {
  tripType: "round-trip",
  origin: {
    skyId: "RUH",
    entityId: "27544008",
    iata: "RUH",
    name: "مطار الملك خالد الدولي",
    city: "الرياض",
    country: "المملكة العربية السعودية",
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
  directOnly: true,
  baggage: "included",
};

const MOCK_SELECTION: SelectedFare = {
  itinerary: {
    id: "itin-sv-preview",
    price: 320,
    currency: "USD",
    formattedPrice: "$320.00",
    baseFare: 280,
    taxes: 40,
    isSelfTransfer: false,
    isRefundable: true,
    tags: ["best", "cheapest"],
    cabinBaggage: "حقيبة يد 7 كجم مشمولة",
    checkedBaggage: "2 × 23 كجم مشمولة مجاناً",
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
  fare: {
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
  extras: {
    extraBag: false,
    insurance: false,
    priorityBoarding: false,
    packageIds: [],
  },
};

function CheckoutContent() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      sessionStorage.setItem(
        BOOKING_SESSION_KEY,
        JSON.stringify({ query: MOCK_QUERY, selection: MOCK_SELECTION })
      );
    } catch {
      // ignore
    }
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return <FlightBookingFunnel />;
}

export default function PortalCheckoutPreview() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      }
    >
      <div className="min-h-screen bg-[#f4f1ea] -mx-4 -my-4 sm:-mx-6 sm:-my-6 p-4 sm:p-6">
        <CheckoutContent />
      </div>
    </Suspense>
  );
}
