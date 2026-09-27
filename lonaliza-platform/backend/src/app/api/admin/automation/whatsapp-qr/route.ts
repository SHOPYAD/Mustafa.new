import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  getAllWhatsAppSlotsStatus,
  getWhatsAppSlotStatus,
  logoutWhatsAppSlotSession,
  sendMultiQrWhatsAppMessage,
  startWhatsAppSlotSession,
  updateWhatsAppSlotConfig,
} from "@/lib/server/whatsapp-qr/multi-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const slots = await getAllWhatsAppSlotsStatus();
  const defaultSlot = slots.find((s) => s.isDefault) || slots[0];
  return NextResponse.json({ ok: true, status: defaultSlot, slots });
}

export async function POST(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const slotId = Math.max(1, Math.min(5, Number(body.slotId) || 1));
  const action = String(body.action || "status");

  if (action === "start") {
    const status = await startWhatsAppSlotSession(slotId);
    const slots = await getAllWhatsAppSlotsStatus();
    return NextResponse.json({ ok: true, status, slots });
  }

  if (action === "logout") {
    const status = await logoutWhatsAppSlotSession(slotId);
    const slots = await getAllWhatsAppSlotsStatus();
    return NextResponse.json({ ok: true, status, slots });
  }

  if (action === "update_config") {
    const label = body.label !== undefined ? String(body.label).trim() : undefined;
    const aiEnabled = body.aiEnabled !== undefined ? Boolean(body.aiEnabled) : undefined;
    const aiTrack = body.aiTrack === "b2b" || body.aiTrack === "b2c" || body.aiTrack === "auto" ? body.aiTrack : undefined;
    const isDefault = body.isDefault !== undefined ? Boolean(body.isDefault) : undefined;

    const status = await updateWhatsAppSlotConfig(slotId, {
      ...(label !== undefined ? { label } : {}),
      ...(aiEnabled !== undefined ? { aiEnabled } : {}),
      ...(aiTrack !== undefined ? { aiTrack } : {}),
      ...(isDefault !== undefined ? { isDefault } : {}),
    });
    const slots = await getAllWhatsAppSlotsStatus();
    return NextResponse.json({ ok: true, status, slots });
  }

  if (action === "test") {
    const to = String(body.to || "").trim();
    const message = String(body.message || "🎉 تجربة اتصال واتساب المباشر بنجاح من منصة لوناليزا (Lonaliza)!").trim();
    if (!to) {
      return NextResponse.json({ ok: false, error: "رقم الهاتف المستلم مطلوب" }, { status: 400 });
    }
    const result = await sendMultiQrWhatsAppMessage({ slotId, to, body: message });
    const slots = await getAllWhatsAppSlotsStatus();
    return NextResponse.json({ ok: result.ok, result, slots, error: result.error });
  }

  const status = await getWhatsAppSlotStatus(slotId);
  const slots = await getAllWhatsAppSlotsStatus();
  return NextResponse.json({ ok: true, status, slots });
}

