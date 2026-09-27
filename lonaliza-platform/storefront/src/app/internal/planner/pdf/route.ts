import { NextRequest, NextResponse } from "next/server";
import { programCost } from "@/lib/planner/cost";
import { writeDayNarrative } from "@/lib/planner/day-copy";
import { tripToProgramInput } from "@/lib/planner/to-program";
import { buildProgramPdfBuffer } from "@/lib/pdf/program-pdf";
import type { PlannerTrip } from "@/types/planner";
import type { SavedAiProgram } from "@/types/ai-program";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as { trip?: PlannerTrip; locale?: string };
    const trip = body.trip;
    if (!trip?.days?.length) {
      return NextResponse.json({ ok: false, error: "no_trip" }, { status: 400 });
    }
    const slim: PlannerTrip = {
      ...trip,
      discover: [],
      later: [],
      days: trip.days.map((day) => ({
        ...day,
        notes: day.notes || writeDayNarrative(day, trip.durationDays, trip.destination, body.locale === "en" ? "en" : body.locale === "tr" ? "tr" : body.locale === "fr" ? "fr" : "ar"),
        legs: [],
      })),
    };
    const input = tripToProgramInput(slim);
    const cost = programCost(slim.cards || [], slim.durationDays, slim.currency);
    const program: SavedAiProgram = {
      id: slim.id,
      titleAr: slim.titleAr,
      titleEn: slim.titleEn,
      destination: slim.destination,
      nights: Math.max(1, slim.durationDays - 1),
      arrivalDate: slim.arrivalDate,
      departureDate: slim.departureDate,
      priceFromUsd: cost.total || input.itinerary.totalClientPrice,
      thumbnail: slim.days.flatMap((d) => d.stops || []).find((s) => s.image)?.image,
      includesAr: [
        cost.flight ? `طيران من ${Math.round(cost.flight)} دولار` : "طيران حسب التوفر",
        cost.hotel ? `إقامة من ${Math.round(cost.hotel)} دولار` : "إقامة حسب التوفر",
        cost.transfer ? `ترانسفير ${Math.round(cost.transfer)} دولار` : "ترانسفير حسب التوفر",
        ...(slim.tipsAr?.slice(0, 4) || []),
      ],
      includesEn: [
        cost.flight ? `Flight tickets from $${Math.round(cost.flight)}` : "Flights subject to live rates",
        cost.hotel ? `5-Star Hotel stay from $${Math.round(cost.hotel)}` : "Luxury hotel accommodation included",
        cost.transfer ? `Private VIP Mercedes Vito van from $${Math.round(cost.transfer)}` : "Airport VIP transfer included",
        ...(slim.tipsEn?.slice(0, 4) || []),
      ],
      itinerary: {
        ...input.itinerary,
        totalClientPrice: cost.total || input.itinerary.totalClientPrice,
      },
      cards: slim.cards,
      hidden: false,
      createdAt: new Date().toISOString(),
    };
    const pdf = await buildProgramPdfBuffer(program, body.locale);
    const asciiName = "lonaliza-program.pdf";
    const utfName = encodeURIComponent(`lonaliza-${slim.destination || "program"}-program.pdf`.replace(/\s+/g, "-"));
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${asciiName}"; filename*=UTF-8''${utfName}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "pdf_failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
