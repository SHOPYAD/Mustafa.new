import { NextResponse } from "next/server";
import { getCommsSettings } from "@/lib/automation/comms-settings";
import { recordWhatsAppInbound } from "@/lib/automation/optin-store";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const settings = await getCommsSettings();
  if (mode === "subscribe" && token && settings.whatsappVerifyToken && token === settings.whatsappVerifyToken) {
    return new NextResponse(challenge || "", { status: 200 });
  }
  return NextResponse.json({ ok: false }, { status: 403 });
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: true });
  }
  const entries = Array.isArray(body.entry) ? body.entry : [];
  for (const entry of entries) {
    const rec = entry && typeof entry === "object" ? (entry as Record<string, unknown>) : {};
    const changes = Array.isArray(rec.changes) ? rec.changes : [];
    for (const change of changes) {
      const ch = change && typeof change === "object" ? (change as Record<string, unknown>) : {};
      const value = ch.value && typeof ch.value === "object" ? (ch.value as Record<string, unknown>) : {};
      const messages = Array.isArray(value.messages) ? value.messages : [];
      for (const message of messages) {
        const msg = message && typeof message === "object" ? (message as Record<string, unknown>) : {};
        const from = String(msg.from || "");
        if (from) await recordWhatsAppInbound(from);
      }
    }
  }
  return NextResponse.json({ ok: true });
}
