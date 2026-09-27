import { NextRequest, NextResponse } from "next/server";
import {
  getWhiteLabelSettings,
  verifyB2BPartnerKey,
} from "@/lib/server/reseller-whitelabel-store";

export const runtime = "nodejs";

function extractKey(req: Request): string {
  const header = req.headers.get("x-lonaliza-b2b-key") || req.headers.get("x-api-key") || "";
  if (header) return header.trim();
  const auth = req.headers.get("authorization") || "";
  if (auth.startsWith("Bearer ")) return auth.slice(7).trim();
  const url = new URL(req.url);
  return url.searchParams.get("apiKey") || "";
}

export async function GET(req: NextRequest) {
  const apiKey = extractKey(req);
  const check = await verifyB2BPartnerKey(apiKey);

  if (!check.ok || !check.company) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: check.errorCode || "unauthorized",
        errorMessage: check.errorMessage || "المفتاح البرمجي غير مصرح له أو رصيد الديبوزيت غير كافٍ.",
      },
      { status: 403 }
    );
  }

  const q = req.nextUrl.searchParams;
  const pickup = (q.get("pickup") || "Istanbul Airport (IST)").trim();
  const dropoff = (q.get("dropoff") || "Taksim / Sultanahmet").trim();
  const date = q.get("date") || "";

  const settings = await getWhiteLabelSettings();
  const markupMultiplier = 1 + (settings.transfersMarkupPercent || 10) / 100;

  const fleet = [
    {
      id: "trf_mercedes_vito",
      name: "Mercedes-Benz Vito VIP Edition",
      category: "VIP Minivan",
      capacityPassengers: 6,
      capacityLuggage: 6,
      image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&q=80",
      features: ["VIP Leather Reclining Seats", "Free High-Speed Wi-Fi", "Cold Refreshments & Water", "Flight Tracking Meet & Greet"],
      basePrice: 65,
    },
    {
      id: "trf_mercedes_sprinter",
      name: "Mercedes-Benz Sprinter Executive",
      category: "Executive Minibus",
      capacityPassengers: 14,
      capacityLuggage: 14,
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80",
      features: ["Spacious High Roof", "Luggage Storage Vault", "USB Charging Ports", "Air Conditioning"],
      basePrice: 120,
    },
    {
      id: "trf_mercedes_eclass",
      name: "Mercedes-Benz E-Class Sedan",
      category: "Business Luxury Sedan",
      capacityPassengers: 3,
      capacityLuggage: 3,
      image: "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=800&q=80",
      features: ["Executive Business Sedan", "Suit Luggage Space", "Chauffeur in Uniform", "English & Arabic Speaking"],
      basePrice: 85,
    },
  ];

  const brandedFleet = fleet.map((v) => {
    const finalPrice = Math.round(v.basePrice * markupMultiplier * 100) / 100;
    return {
      ...v,
      basePrice: undefined,
      provider: "Lonaliza Transfers",
      channel: "Lonaliza Chauffeur & Fleet Network",
      pickup,
      dropoff,
      date,
      price: finalPrice,
      currency: "USD",
      freeWaitingMinutes: 60,
      instantConfirmation: true,
    };
  });

  return NextResponse.json({
    ok: true,
    channel: "Lonaliza Transfers Redistribution",
    pickup,
    dropoff,
    partnerCompany: check.company.companyName,
    markupAppliedPercent: settings.transfersMarkupPercent,
    vehicles: brandedFleet,
    count: brandedFleet.length,
  });
}
