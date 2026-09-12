import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { timingSafeEqual } from "crypto";
import { applySupplierWebhook } from "@/lib/server/flights-bookings";

export const runtime = "nodejs";

const DATA_DIR = path.join(process.cwd(), ".data");
const LOG_FILE = path.join(DATA_DIR, "pkfare-webhook-events.jsonl");

/**
 * PKFARE TicketIssuanceNotify_V2 — pushes ticket numbers / airline PNR when tickets are issued, or a
 * rejection reason. Optional shared secret via `?key=` (PKFARE_WEBHOOK_KEY) since PKFARE does not sign.
 * PKFARE ignores our response body; we always answer `{errorCode:"0"}` once the event is logged.
 */
function keyOk(req: NextRequest): boolean {
  const expected = String(process.env.PKFARE_WEBHOOK_KEY || "").trim();
  if (!expected) return true;
  const given = String(req.nextUrl.searchParams.get("key") || req.headers.get("x-webhook-key") || "");
  if (given.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  let body: Record<string, any> = {};
  try {
    body = JSON.parse(rawBody);
  } catch {
    body = { raw: rawBody };
  }
  const authorized = keyOk(req);
  const orderNum = String(body?.orderNum || body?.refOrderNum || "").trim();
  const status = String(body?.status || "").toUpperCase();
  const tickets: string[] = [];
  for (const p of Array.isArray(body?.passengers) ? body.passengers : []) {
    for (const part of String(p?.ticketNum || "").split("/")) if (part.trim()) tickets.push(part.trim());
  }
  for (const row of Array.isArray(body?.pnrList) ? body.pnrList : []) {
    for (const t of Array.isArray(row?.ticketNums) ? row.ticketNums : []) if (t?.ticketNum) tickets.push(String(t.ticketNum));
  }
  const mapped = status === "ISSUED" ? "ticketed" : status === "REJECTED" ? "rejected" : status === "VOIDED" ? "voided" : status === "CHANGED" ? "changed" : status.toLowerCase();

  let result: { matched: boolean; bookingId?: string } = { matched: false };
  if (authorized && orderNum) {
    result = await applySupplierWebhook({
      supplier: "pkfare",
      orderId: orderNum,
      status: mapped,
      reservationNo: String(body?.airPnr || "").split("|")[0] || undefined,
      reason: body?.rejectReason ? String(body.rejectReason) : body?.remark ? String(body.remark) : undefined,
      ticketNumbers: [...new Set(tickets)],
    }).catch(() => ({ matched: false }));
  }

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.appendFile(LOG_FILE, JSON.stringify({ timestamp: new Date().toISOString(), authorized, orderNum, status, result, body }) + "\n", "utf8");
  } catch {
    /* log best-effort */
  }
  if (!authorized) return NextResponse.json({ errorCode: "401", errorMsg: "unauthorized" }, { status: 401 });
  return NextResponse.json({ errorCode: "0", errorMsg: "ok", matched: result.matched });
}

export async function GET() {
  return NextResponse.json({ ok: true, service: "pkfare-webhook", status: "active" });
}
