import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

const DATA_DIR = path.join(process.cwd(), ".data");
const LOG_FILE = path.join(DATA_DIR, "seeru-webhook-events.jsonl");

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let body: any;
    try {
      body = JSON.parse(rawBody);
    } catch {
      body = { raw: rawBody };
    }

    const eventRecord = {
      timestamp: new Date().toISOString(),
      type: "hotels_webhook",
      headers: Object.fromEntries(req.headers.entries()),
      body,
    };

    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.appendFile(LOG_FILE, JSON.stringify(eventRecord) + "\n", "utf8");

    return NextResponse.json({ ok: true, received: true, timestamp: new Date().toISOString() });
  } catch (err: any) {
    console.error("[Seeru Hotels Webhook Error]:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, service: "seeru-hotels-webhook", status: "active" });
}
