import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { createHotelQuote, getHotelQuote, quoteIsUsable, toPublicQuote } from "@/lib/server/hotels/quote-service";

export const runtime = "nodejs";

const bodySchema = z
  .object({
    rateId: z.string().trim().min(1).max(200).optional(),
    hotelId: z.string().trim().min(1).max(120).optional(),
    supplierToken: z.string().trim().min(1).max(4000).optional(),
    supplierContext: z.record(z.string(), z.string().max(500)).optional(),
    checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    adults: z.coerce.number().int().min(1).max(12).optional(),
    rooms: z.coerce.number().int().min(1).max(8).optional(),
    childrenAges: z.array(z.coerce.number().int().min(0).max(17)).max(8).optional(),
    currency: z.string().trim().toUpperCase().regex(/^[A-Z]{3}$/).optional(),
    expectedTotal: z.coerce.number().min(0).optional(),
    sessionId: z.string().trim().regex(/^[a-f0-9]{0,40}$/i).optional(),
    masterId: z.string().trim().regex(/^[a-z0-9_]{0,40}$/i).optional(),
    lang: z.enum(["ar", "en", "tr"]).optional(),
  })
  .refine((v) => Boolean(v.rateId) || Boolean(v.hotelId && v.supplierToken && v.checkIn && v.checkOut), { message: "rateId or hotelId+supplierToken+dates required" });

const ERROR_COPY: Record<string, { ar: string; en: string }> = {
  not_found: { ar: "انتهت صلاحية هذا السعر، يرجى العودة لصفحة الفندق واختيار الغرفة مجدداً.", en: "This rate has expired. Please go back to the hotel page and pick the room again." },
  unavailable: { ar: "لم تعد هذه الغرفة متاحة بهذا السعر لدى الفندق.", en: "This room is no longer available at this rate." },
  supplier_error: { ar: "تعذّر التحقق من السعر مع الفندق حالياً، حاول مرة أخرى.", en: "We could not verify the price with the hotel right now. Please try again." },
  invalid: { ar: "طلب غير صالح.", en: "Invalid request." },
};

export async function POST(req: NextRequest) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_input", issues: parsed.error.issues.map((i) => i.message) }, { status: 400 });
  }
  const input = parsed.data;
  const user = await getRequestCustomer(req).catch(() => null);
  const result = await createHotelQuote({ ...input, userId: user?.id });
  if (!result.ok) {
    const copy = ERROR_COPY[result.code] || ERROR_COPY.supplier_error;
    return NextResponse.json({ ok: false, error: input.lang === "en" ? copy.en : copy.ar, errorCode: result.code, detail: result.error }, { status: result.code === "invalid" ? 400 : result.code === "not_found" ? 404 : 409 });
  }
  return NextResponse.json({ ok: true, quote: toPublicQuote(result.quote) });
}

export async function GET(req: NextRequest) {
  const id = (req.nextUrl.searchParams.get("id") || "").trim();
  if (!id) return NextResponse.json({ ok: false, error: "missing_id" }, { status: 400 });
  const quote = await getHotelQuote(id);
  if (!quote) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  const user = await getRequestCustomer(req).catch(() => null);
  if (quote.user && user?.id !== quote.user) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  const usable = quoteIsUsable(quote);
  return NextResponse.json({ ok: true, quote: toPublicQuote(quote), usable: usable.ok, reason: usable.ok ? undefined : usable.reason });
}
