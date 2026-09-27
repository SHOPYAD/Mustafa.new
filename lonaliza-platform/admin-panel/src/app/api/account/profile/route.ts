import { NextResponse } from "next/server";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import type { CustomerRecord } from "@/lib/pocketbase/records";

export const runtime = "nodejs";

function parseMeta(notes?: string): {
  avatarUrl?: string;
  whatsappOptInOtp?: boolean;
  whatsappOptInBooking?: boolean;
  whatsappOptInMarketing?: boolean;
} {
  if (!notes || !notes.startsWith("{")) return {};
  try {
    return JSON.parse(notes);
  } catch {
    return {};
  }
}

export async function GET(req: Request) {
  const user = await getRequestCustomer(req);
  if (!user) {
    return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  }
  const pb = await tryCreateAdminPocketBase();
  if (!pb) {
    return NextResponse.json({
      ok: true,
      profile: {
        name: user.name,
        email: user.email,
        phone: "",
        avatarUrl: "",
        whatsappConnected: false,
        whatsappOptInOtp: true,
        whatsappOptInBooking: true,
        whatsappOptInMarketing: false,
      },
    });
  }
  try {
    const row = await pb
      .collection("customers")
      .getFirstListItem<CustomerRecord>(`user = "${user.id}" || email = "${user.email}"`);
    const phone = row.phone || "";
    const meta = parseMeta(row.notes);
    return NextResponse.json({
      ok: true,
      profile: {
        name: row.name || user.name,
        email: row.email || user.email,
        phone,
        avatarUrl: meta.avatarUrl || "",
        whatsappConnected: Boolean(phone && phone.trim().length >= 8),
        whatsappOptInOtp: meta.whatsappOptInOtp !== false,
        whatsappOptInBooking: meta.whatsappOptInBooking !== false,
        whatsappOptInMarketing: meta.whatsappOptInMarketing === true,
      },
    });
  } catch {
    return NextResponse.json({
      ok: true,
      profile: {
        name: user.name,
        email: user.email,
        phone: "",
        avatarUrl: "",
        whatsappConnected: false,
        whatsappOptInOtp: true,
        whatsappOptInBooking: true,
        whatsappOptInMarketing: false,
      },
    });
  }
}

export async function PATCH(req: Request) {
  const user = await getRequestCustomer(req);
  if (!user) {
    return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  }
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const action = String(body.action || "save");
  const pb = await tryCreateAdminPocketBase();
  if (!pb) {
    return NextResponse.json({ ok: false, error: "PocketBase unavailable" }, { status: 503 });
  }

  if (action === "disconnect_whatsapp") {
    try {
      const existing = await pb
        .collection("customers")
        .getFirstListItem<CustomerRecord>(`user = "${user.id}"`);
      await pb.collection("customers").update(existing.id, { phone: "" });
    } catch {
      // ignore
    }
    return NextResponse.json({
      ok: true,
      profile: { name: user.name, email: user.email, phone: "", whatsappConnected: false },
    });
  }

  const name = String(body.name || user.name || "").trim().slice(0, 120);
  const phone = body.phone !== undefined ? String(body.phone || "").trim().slice(0, 40) : undefined;
  const avatarUrl = body.avatarUrl !== undefined ? String(body.avatarUrl || "").trim() : undefined;

  if (name) {
    try {
      await pb.collection("users").update(user.id, { name });
    } catch {
      /* users.name optional */
    }
  }

  let existingRecord: CustomerRecord | null = null;
  try {
    existingRecord = await pb
      .collection("customers")
      .getFirstListItem<CustomerRecord>(`user = "${user.id}" || email = "${user.email}"`);
  } catch {
    // not found
  }

  const prevMeta = parseMeta(existingRecord?.notes);
  const nextMeta = {
    ...prevMeta,
    ...(avatarUrl !== undefined ? { avatarUrl } : {}),
    ...(body.whatsappOptInOtp !== undefined ? { whatsappOptInOtp: Boolean(body.whatsappOptInOtp) } : {}),
    ...(body.whatsappOptInBooking !== undefined ? { whatsappOptInBooking: Boolean(body.whatsappOptInBooking) } : {}),
    ...(body.whatsappOptInMarketing !== undefined ? { whatsappOptInMarketing: Boolean(body.whatsappOptInMarketing) } : {}),
  };

  const finalPhone = phone !== undefined ? phone : existingRecord?.phone || "";

  if (existingRecord) {
    await pb.collection("customers").update(existingRecord.id, {
      name: name || existingRecord.name,
      phone: finalPhone,
      email: existingRecord.email || user.email,
      notes: JSON.stringify(nextMeta),
    });
  } else {
    await pb.collection("customers").create({
      user: user.id,
      name,
      email: user.email,
      phone: finalPhone,
      notes: JSON.stringify(nextMeta),
    });
  }

  return NextResponse.json({
    ok: true,
    profile: {
      name: name || user.name,
      email: user.email,
      phone: finalPhone,
      avatarUrl: nextMeta.avatarUrl || "",
      whatsappConnected: Boolean(finalPhone && finalPhone.trim().length >= 8),
      whatsappOptInOtp: nextMeta.whatsappOptInOtp !== false,
      whatsappOptInBooking: nextMeta.whatsappOptInBooking !== false,
      whatsappOptInMarketing: nextMeta.whatsappOptInMarketing === true,
    },
  });
}
