import { NextRequest, NextResponse } from "next/server";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import { appEnabledKeys, getChannelServices } from "@/lib/server/channel-services-store";
import { isMobileAuthDenied, requireMobileCustomer } from "@/lib/server/mobile/require-mobile-customer";

export const runtime = "nodejs";

const SERVICE_TO_CHANNEL: Record<string, string> = {
  cars: "cars",
  car: "cars",
  transfers: "transfers",
  transfer: "transfers",
  holiday: "holiday",
  package: "holiday",
  packages: "holiday",
  tours: "tours",
  tour: "tours",
};

export async function POST(req: NextRequest) {
  const auth = await requireMobileCustomer(req);
  if (isMobileAuthDenied(auth)) return auth;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const type = String(body.type || body.service || "").trim().toLowerCase();
  const channel = SERVICE_TO_CHANNEL[type];
  if (!channel) {
    return NextResponse.json({ ok: false, error: "unsupported_service" }, { status: 400 });
  }

  const channels = await getChannelServices();
  if (!(appEnabledKeys(channels) as readonly string[]).includes(channel)) {
    return NextResponse.json({ ok: false, error: "service_disabled" }, { status: 404 });
  }

  const pb = await tryCreateAdminPocketBase();
  if (!pb) return NextResponse.json({ ok: false, error: "PocketBase unavailable" }, { status: 503 });

  const incomingMeta =
    body.metadata && typeof body.metadata === "object"
      ? (body.metadata as Record<string, unknown>)
      : {};
  const quotedPrice = Number(body.price ?? body.quotedPrice ?? incomingMeta.quotedPrice ?? incomingMeta.price ?? 0);
  const currency = String(body.currency || incomingMeta.currency || "USD").toUpperCase();

  const created = await pb.collection("enquiry_bookings").create({
    type,
    status: "pending_payment",
    service_name: String(body.service_name || body.title || type),
    destination: String(body.destination || ""),
    customer_name: auth.customer.name,
    customer_email: auth.customer.email,
    customer_phone: String(body.customer_phone || ""),
    message: String(body.message || "").slice(0, 4000),
    user: auth.customer.id,
    metadata: {
      source: "mobile",
      quotedPrice: Number.isFinite(quotedPrice) ? quotedPrice : 0,
      currency,
      ...incomingMeta,
    },
  });

  return NextResponse.json({ ok: true, bookingId: created.id });
}
