import { NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { listUserAiPrograms, deleteUserAiProgram, saveUserAiProgram } from "@/lib/ai-programs-pb";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getRequestCustomer(req);
  if (!user) {
    return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  }
  const programs = await listUserAiPrograms(user.id);
  return NextResponse.json({ ok: true, programs });
}

export async function DELETE(req: Request) {
  const user = await getRequestCustomer(req);
  if (!user) {
    return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  }
  const url = new URL(req.url);
  const id = url.searchParams.get("id") || "";
  if (!id) {
    return NextResponse.json({ ok: false, error: "id_required" }, { status: 400 });
  }
  const deleted = await deleteUserAiProgram(user.id, id);
  if (!deleted) {
    return NextResponse.json({ ok: false, error: "delete_failed" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, deleted: true });
}

export async function POST(req: Request) {
  const user = await getRequestCustomer(req);
  if (!user) {
    return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const program = body.program as any;
  if (!program || (!program.titleAr && !program.titleEn && !program.title && !program.destination)) {
    return NextResponse.json({ ok: false, error: "invalid_program" }, { status: 400 });
  }
  const savedId = await saveUserAiProgram(user.id, {
    id: program.id || `fav-${Date.now()}`,
    titleAr: program.titleAr || program.title || program.destination || "",
    titleEn: program.titleEn || program.title || program.destination || "",
    destination: program.destination || "",
    nights: Number(program.nights) || 1,
    people: program.people ? Number(program.people) : 2,
    arrivalDate: program.arrivalDate,
    departureDate: program.departureDate,
    priceFromUsd: Number(program.priceFromUsd || program.price || 0),
    thumbnail: program.thumbnail || program.image || "",
    includesAr: program.includesAr || [],
    includesEn: program.includesEn || [],
    itinerary: program.itinerary || {
      titleAr: program.titleAr || program.title || "",
      titleEn: program.titleEn || program.title || "",
      days: [],
      totalBasePrice: 0,
      totalClientPrice: Number(program.priceFromUsd || program.price || 0),
      currency: "USD",
    },
    cards: program.cards,
    flightHref: program.flightHref,
    transferHref: program.transferHref,
    carsHref: program.carsHref,
    hidden: false,
    createdAt: new Date().toISOString(),
  }, body.cards);

  return NextResponse.json({ ok: true, id: savedId });
}

