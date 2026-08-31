import { NextResponse } from "next/server";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import type { CustomerRecord } from "@/lib/pocketbase/records";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getRequestCustomer(req);
  if (!user) {
    return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  }
  const pb = await tryCreateAdminPocketBase();
  if (!pb) {
    return NextResponse.json({
      ok: true,
      profile: { name: user.name, email: user.email, phone: "" },
    });
  }
  try {
    const row = await pb
      .collection("customers")
      .getFirstListItem<CustomerRecord>(`user = "${user.id}"`);
    return NextResponse.json({
      ok: true,
      profile: {
        name: row.name || user.name,
        email: row.email || user.email,
        phone: row.phone || "",
      },
    });
  } catch {
    return NextResponse.json({
      ok: true,
      profile: { name: user.name, email: user.email, phone: "" },
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

  const name = String(body.name || "").trim().slice(0, 120);
  const phone = String(body.phone || "").trim().slice(0, 40);
  if (!name) {
    return NextResponse.json({ ok: false, error: "name_required" }, { status: 400 });
  }

  const pb = await tryCreateAdminPocketBase();
  if (!pb) {
    return NextResponse.json({ ok: false, error: "PocketBase unavailable" }, { status: 503 });
  }

  try {
    await pb.collection("users").update(user.id, { name });
  } catch {
    /* users.name optional */
  }

  try {
    const existing = await pb
      .collection("customers")
      .getFirstListItem<CustomerRecord>(`user = "${user.id}"`);
    await pb.collection("customers").update(existing.id, {
      name,
      phone,
      email: existing.email || user.email,
    });
  } catch {
    await pb.collection("customers").create({
      user: user.id,
      name,
      email: user.email,
      phone,
    });
  }

  return NextResponse.json({ ok: true, profile: { name, email: user.email, phone } });
}
