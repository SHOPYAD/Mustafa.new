import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/server/rate-limit";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import {
  enquiryToApi,
  hotelBookingToEnquiry,
  type EnquiryBookingRecord,
  type HotelBookingRecord,
} from "@/lib/pocketbase/records";
import type { BookingType } from "@/types/database";
import { readRequestCookie } from "@/lib/http/cookies";
import {
  AFFILIATE_REF_COOKIE,
  createPendingConversion,
  isAffiliateService,
  normalizeRefCode,
} from "@/lib/affiliate/server";
import { createAdminNotification } from "@/lib/admin-notifications/server";
import { notifyEnquiryPlaced } from "@/lib/server/email/notify";
import { localeFromRequest, rememberCustomerLocale } from "@/lib/server/email/recipient-locale";
import { enquiryTypeToService, redeemOnBooking } from "@/lib/loyalty/server";

const ALLOWED_TYPES = new Set<BookingType>([
  "flight",
  "hotel",
  "package",
  "transfer",
  "visa",
  "tour",
  "car",
  "callback",
  "contact",
  "general",
]);

export async function GET(request: Request) {
  const denied = await assertAdminApi(request);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const customer = searchParams.get("customer")?.trim().toLowerCase();
  const page = Math.max(1, Number(searchParams.get("page") || 1) || 1);
  const perPage = Math.min(100, Math.max(10, Number(searchParams.get("perPage") || 50) || 50));

  const pb = await tryCreateAdminPocketBase();
  if (!pb) {
    return NextResponse.json({
      bookings: [],
      pocketbase: false,
      message: "PocketBase غير جاهز. افتح إعدادات PocketBase للربط.",
    });
  }

  try {
    const enquiryFilter: string[] = [];
    if (type && type !== "all" && type !== "hotel" && ALLOWED_TYPES.has(type as BookingType)) {
      enquiryFilter.push(`type = "${type}"`);
    }
    if (status && status !== "all") {
      enquiryFilter.push(`status = "${status.replace(/"/g, "")}"`);
    }
    const enquiryQuery = enquiryFilter.join(" && ");
    const [enquiries, hotels] = await Promise.all([
      type === "hotel"
        ? Promise.resolve({ items: [] as EnquiryBookingRecord[] })
        : pb.collection("enquiry_bookings").getList<EnquiryBookingRecord>(page, perPage, {
            sort: "-id",
            ...(enquiryQuery ? { filter: enquiryQuery } : {}),
          }),
      type && type !== "all" && type !== "hotel"
        ? Promise.resolve({ items: [] as HotelBookingRecord[] })
        : pb.collection("hotel_bookings").getList<HotelBookingRecord>(page, perPage, {
            sort: "-id",
            ...(status && status !== "all"
              ? { filter: `status = "${status.replace(/"/g, "")}"` }
              : {}),
          }),
    ]);

    let bookings = [
      ...enquiries.items.map(enquiryToApi),
      ...hotels.items.map(hotelBookingToEnquiry),
    ].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));

    if (type && type !== "all" && ALLOWED_TYPES.has(type as BookingType)) {
      bookings = bookings.filter((b) => b.type === type);
    }
    if (status && status !== "all") {
      bookings = bookings.filter((b) => b.status === status);
    }
    if (customer) {
      bookings = bookings.filter((b) =>
        `${b.customer_name} ${b.customer_email} ${b.customer_phone}`
          .toLowerCase()
          .includes(customer)
      );
    }

    return NextResponse.json({
      bookings,
      pocketbase: true,
    });
  } catch (e) {
    return NextResponse.json(
      {
        bookings: [],
        pocketbase: true,
        error: e instanceof Error ? e.message : "PocketBase query failed",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const limited = await rateLimit(`booking-post:${clientIp(request)}`, 8, 10 * 60 * 1000);
  if (!limited.ok) return rateLimitResponse(limited.retryAfterSec);

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const type = String(body.type || "general") as BookingType;
  if (!ALLOWED_TYPES.has(type)) {
    return NextResponse.json({ error: "Invalid booking type" }, { status: 400 });
  }

  const customer_name = String(body.customer_name || "").trim();
  if (!customer_name) {
    return NextResponse.json(
      { error: "customer_name is required" },
      { status: 400 }
    );
  }

  const user = await getRequestCustomer(request);
  const row = {
    type,
    status: "new" as const,
    service_name: body.service_name
      ? String(body.service_name).slice(0, 300)
      : null,
    destination: body.destination
      ? String(body.destination).slice(0, 300)
      : null,
    customer_name: customer_name.slice(0, 200),
    customer_email: body.customer_email
      ? String(body.customer_email).slice(0, 200)
      : null,
    customer_phone: body.customer_phone
      ? String(body.customer_phone).slice(0, 50)
      : null,
    message: body.message ? String(body.message).slice(0, 4000) : null,
    // الحساب من الجلسة فقط؛ لا يُقبل user_id من جسم الطلب.
    user_id: user?.id || null,
    metadata:
      body.metadata && typeof body.metadata === "object"
        ? (body.metadata as Record<string, unknown>)
        : {},
  };
  const locale = localeFromRequest(request, body);
  row.metadata = { ...row.metadata, locale };

  const pb = await tryCreateAdminPocketBase();
  if (!pb) {
    return NextResponse.json(
      {
        error: "PocketBase غير مهيأ",
        booking: {
          id: `local-${Date.now()}`,
          ...row,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        pocketbase: false,
      },
      { status: 503 }
    );
  }

  try {
    const refCode = normalizeRefCode(readRequestCookie(request, AFFILIATE_REF_COOKIE) || "");
    const created = await pb.collection("enquiry_bookings").create<EnquiryBookingRecord>({
      type: row.type,
      status: row.status,
      service_name: row.service_name || "",
      destination: row.destination || "",
      customer_name: row.customer_name,
      customer_email: row.customer_email || "",
      customer_phone: row.customer_phone || "",
      message: row.message || "",
      ...(row.user_id ? { user: row.user_id } : {}),
      metadata: row.metadata,
      ...(refCode ? { ref_code: refCode } : {}),
    });
    if (refCode && isAffiliateService(row.type)) {
      await createPendingConversion({
        code: refCode,
        service: row.type,
        bookingId: created.id,
        path: `/${row.type}`,
        notes: row.service_name || row.destination || row.type,
      });
    } else if (refCode) {
      await createPendingConversion({
        code: refCode,
        service: "other",
        bookingId: created.id,
        notes: row.service_name || row.type,
      });
    }
    await createAdminNotification({
      type: "booking",
      body_ar: [row.customer_name, row.service_name || row.type]
        .filter(Boolean)
        .join(" · "),
      href: "/admin/bookings",
      meta: {
        bookingId: created.id,
        name: row.customer_name,
        service: row.service_name || row.type,
        source: "enquiry",
      },
    });
    if (row.customer_email) {
      void rememberCustomerLocale(row.customer_email, locale, {
        name: row.customer_name,
        userId: row.user_id || undefined,
      });
    }
    void notifyEnquiryPlaced(created).catch(() => undefined);
    if (row.user_id) {
      void redeemOnBooking({
        userId: row.user_id,
        bookingId: created.id,
        service: enquiryTypeToService(row.type),
        amount: Number((row.metadata as { price?: number })?.price || 0),
        currency: String((row.metadata as { currency?: string })?.currency || "USD"),
        confirmEarn: false,
      }).catch(() => undefined);
    }
    return NextResponse.json(
      { booking: enquiryToApi(created), pocketbase: true },
      { status: 201 }
    );
  } catch (e) {
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : "Failed to create booking",
        pocketbase: true,
      },
      { status: 500 }
    );
  }
}
