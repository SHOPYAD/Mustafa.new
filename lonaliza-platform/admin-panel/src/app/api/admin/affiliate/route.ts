import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import {
  computeCommission,
  getAffiliateSettings,
  isAffiliateService,
  saveAffiliateSettings,
} from "@/lib/affiliate/server";
import type {
  AffiliateConversion,
  AffiliateProfile,
  AffiliateService,
  AffiliateVisit,
  AffiliateWithdrawal,
} from "@/lib/affiliate/types";
import type { CustomerRecord } from "@/lib/pocketbase/records";

export const runtime = "nodejs";

async function userLabel(
  pb: Awaited<ReturnType<typeof tryCreateAdminPocketBase>>,
  userId: string
): Promise<{ name: string; email: string }> {
  if (!pb || !userId) return { name: "", email: "" };
  try {
    const customer = await pb
      .collection("customers")
      .getFirstListItem<CustomerRecord>(`user = "${userId}"`);
    return { name: customer.name || "", email: customer.email || "" };
  } catch {
    try {
      const user = await pb.collection("users").getOne(userId);
      return {
        name: String(user.name || ""),
        email: String(user.email || ""),
      };
    } catch {
      return { name: "", email: "" };
    }
  }
}

export async function GET(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const url = new URL(req.url);
  const tab = url.searchParams.get("tab") || "settings";
  const pb = await tryCreateAdminPocketBase();
  if (!pb) {
    return NextResponse.json({ ok: false, error: "PocketBase unavailable" }, { status: 503 });
  }

  if (tab === "settings") {
    const settings = await getAffiliateSettings(pb);
    return NextResponse.json({ ok: true, settings });
  }

  if (tab === "marketers") {
    const profiles = await pb.collection("affiliate_profiles").getFullList<AffiliateProfile>({
      sort: "-id",
    });
    const marketers = await Promise.all(
      profiles.map(async (p) => {
        const label = await userLabel(pb, p.user || "");
        const visits = await pb.collection("affiliate_visits").getList(1, 1, {
          filter: `code = "${p.code}"`,
        });
        return {
          ...p,
          name: label.name,
          email: label.email,
          visitCount: visits.totalItems,
        };
      })
    );
    return NextResponse.json({ ok: true, marketers });
  }

  if (tab === "visits") {
    const code = url.searchParams.get("code")?.trim() || "";
    const service = url.searchParams.get("service")?.trim() || "";
    const from = url.searchParams.get("from")?.trim() || "";
    const to = url.searchParams.get("to")?.trim() || "";
    const parts: string[] = [];
    if (code) parts.push(`code = "${code.replace(/"/g, "")}"`);
    if (service && isAffiliateService(service)) parts.push(`service = "${service}"`);
    if (from) parts.push(`created >= "${from} 00:00:00"`);
    if (to) parts.push(`created <= "${to} 23:59:59"`);
    const filter = parts.join(" && ");
    const page = Math.max(1, Number(url.searchParams.get("page") || 1));
    const list = await pb.collection("affiliate_visits").getList<AffiliateVisit>(page, 50, {
      sort: "-id",
      ...(filter ? { filter } : {}),
    });
    return NextResponse.json({
      ok: true,
      visits: list.items,
      total: list.totalItems,
      page: list.page,
    });
  }

  if (tab === "conversions") {
    const status = url.searchParams.get("status")?.trim() || "";
    const filter =
      status && ["pending", "approved", "rejected"].includes(status)
        ? `status = "${status}"`
        : "";
    const rows = await pb.collection("affiliate_conversions").getFullList<AffiliateConversion>({
      sort: "-id",
      ...(filter ? { filter } : {}),
    });
    const conversions = await Promise.all(
      rows.map(async (c) => {
        const label = await userLabel(pb, c.user || "");
        return { ...c, name: label.name, email: label.email };
      })
    );
    return NextResponse.json({ ok: true, conversions });
  }

  if (tab === "withdrawals") {
    const rows = await pb.collection("affiliate_withdrawals").getFullList<AffiliateWithdrawal>({
      sort: "-id",
    });
    const withdrawals = await Promise.all(
      rows.map(async (w) => {
        const label = await userLabel(pb, w.user || "");
        return { ...w, name: label.name, email: label.email };
      })
    );
    return NextResponse.json({ ok: true, withdrawals });
  }

  return NextResponse.json({ ok: false, error: "unknown_tab" }, { status: 400 });
}

export async function POST(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const pb = await tryCreateAdminPocketBase();
  if (!pb) {
    return NextResponse.json({ ok: false, error: "PocketBase unavailable" }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const action = String(body.action || "");

  if (action === "save_settings") {
    const settings = await saveAffiliateSettings({
      enabled: body.enabled !== false,
      cookie_days: Number(body.cookie_days || 30),
      min_withdraw: Number(body.min_withdraw || 100),
      commissions: body.commissions as never,
    });
    return NextResponse.json({ ok: true, settings });
  }

  if (action === "create_conversion") {
    const code = String(body.code || "").trim().toUpperCase();
    const serviceRaw = String(body.service || "other");
    const service: AffiliateService = isAffiliateService(serviceRaw)
      ? serviceRaw
      : "other";
    const settings = await getAffiliateSettings(pb);
    let profile: AffiliateProfile | null = null;
    try {
      profile = await pb
        .collection("affiliate_profiles")
        .getFirstListItem<AffiliateProfile>(`code = "${code.replace(/"/g, "")}"`);
    } catch {
      return NextResponse.json({ ok: false, error: "unknown_code" }, { status: 400 });
    }
    const amount = Number(body.booking_amount || 0);
    const commission =
      body.commission != null && body.commission !== ""
        ? Number(body.commission)
        : computeCommission(amount, settings.commissions[service]);
    const created = await pb.collection("affiliate_conversions").create({
      user: profile.user || "",
      code,
      service,
      status: "pending",
      booking_amount: amount,
      commission,
      notes: String(body.notes || "").slice(0, 2000),
      tp_ref: String(body.tp_ref || "").slice(0, 200),
      booking_id: String(body.booking_id || "").slice(0, 80),
      path: String(body.path || "").slice(0, 300),
    });
    return NextResponse.json({ ok: true, conversion: created }, { status: 201 });
  }

  return NextResponse.json({ ok: false, error: "unknown_action" }, { status: 400 });
}

export async function PATCH(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const pb = await tryCreateAdminPocketBase();
  if (!pb) {
    return NextResponse.json({ ok: false, error: "PocketBase unavailable" }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const kind = String(body.kind || "");
  const id = String(body.id || "");
  if (!id) {
    return NextResponse.json({ ok: false, error: "id_required" }, { status: 400 });
  }

  if (kind === "conversion") {
    const status = String(body.status || "");
    if (status !== "pending" && status !== "approved" && status !== "rejected") {
      return NextResponse.json({ ok: false, error: "bad_status" }, { status: 400 });
    }
    const patch: Record<string, unknown> = { status };
    if (body.commission != null) patch.commission = Number(body.commission);
    if (body.notes != null) patch.notes = String(body.notes).slice(0, 2000);
    if (body.tp_ref != null) patch.tp_ref = String(body.tp_ref).slice(0, 200);
    const updated = await pb.collection("affiliate_conversions").update(id, patch);
    return NextResponse.json({ ok: true, conversion: updated });
  }

  if (kind === "withdrawal") {
    const status = String(body.status || "");
    if (status !== "pending" && status !== "paid" && status !== "rejected") {
      return NextResponse.json({ ok: false, error: "bad_status" }, { status: 400 });
    }
    const updated = await pb.collection("affiliate_withdrawals").update(id, {
      status,
      note: body.note != null ? String(body.note).slice(0, 500) : undefined,
    });
    return NextResponse.json({ ok: true, withdrawal: updated });
  }

  if (kind === "marketer") {
    const status = String(body.status || "");
    if (status !== "active" && status !== "paused" && status !== "banned") {
      return NextResponse.json({ ok: false, error: "bad_status" }, { status: 400 });
    }
    const updated = await pb.collection("affiliate_profiles").update(id, { status });
    return NextResponse.json({ ok: true, profile: updated });
  }

  return NextResponse.json({ ok: false, error: "unknown_kind" }, { status: 400 });
}
