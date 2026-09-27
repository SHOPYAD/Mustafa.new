import { NextResponse } from "next/server";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      type = "package",
      service_name,
      destination,
      customer_name,
      customer_email,
      customer_phone,
      message,
      user_id,
      metadata = {},
    } = body;

    const payload = {
      type,
      service_name: service_name || null,
      destination: destination || null,
      customer_name: customer_name || "",
      customer_email: customer_email || null,
      customer_phone: customer_phone || null,
      message: message || null,
      user_id: user_id || null,
      metadata: typeof metadata === "object" ? metadata : {},
      status: "new",
      created_at: new Date().toISOString(),
    };

    const pb = await tryCreateAdminPocketBase();
    if (pb) {
      try {
        const record = await pb.collection("bookings").create(payload);
        return NextResponse.json({
          booking: {
            id: record.id,
            ...payload,
            created_at: record.created || payload.created_at,
          },
          pocketbase: true,
        });
      } catch (pbErr) {
        console.warn("PocketBase collection insert failed, returning fallback:", pbErr);
      }
    }

    // Return synthesized booking with local ID
    return NextResponse.json({
      booking: {
        id: `bk_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        ...payload,
      },
      pocketbase: false,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  const pb = await tryCreateAdminPocketBase();
  if (pb) {
    try {
      const records = await pb.collection("bookings").getList(1, 50, {
        sort: "-created",
      });
      return NextResponse.json({
        bookings: records.items,
        total: records.totalItems,
        pocketbase: true,
      });
    } catch {
      // ignore
    }
  }

  return NextResponse.json({
    bookings: [],
    total: 0,
    pocketbase: false,
  });
}
