import { NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { listBuddies, upsertBuddy } from "@/lib/server/lonaliza-social-commerce";

export const runtime = "nodejs";

export async function GET() {
  const buddies = await listBuddies();
  return NextResponse.json({ ok: true, buddies });
}

export async function POST(req: Request) {
  const user = await getRequestCustomer(req);
  if (!user) return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const profile = await upsertBuddy({
    userId: user.id,
    name: String(body.name || user.name || "مسافر"),
    destination: String(body.destination || "").trim(),
    dateFrom: body.dateFrom ? String(body.dateFrom) : undefined,
    dateTo: body.dateTo ? String(body.dateTo) : undefined,
    language: body.language ? String(body.language) : undefined,
    bio: body.bio ? String(body.bio) : undefined,
  });
  return NextResponse.json({ ok: true, profile });
}
