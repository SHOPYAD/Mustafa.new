import { NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { addRecent, listRecent } from "@/lib/server/lonaliza-social-commerce";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getRequestCustomer(req);
  if (!user) return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  return NextResponse.json({ ok: true, items: await listRecent(user.id) });
}

export async function POST(req: Request) {
  const user = await getRequestCustomer(req);
  if (!user) return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const kind = String(body.kind || "");
  if (!["hotel", "flight", "tour", "package", "car"].includes(kind) || !body.refId || !body.title) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }
  const item = await addRecent({
    userId: user.id,
    kind: kind as "hotel" | "flight" | "tour" | "package" | "car",
    refId: String(body.refId),
    title: String(body.title),
    image: body.image ? String(body.image) : undefined,
    price: body.price != null ? Number(body.price) : undefined,
  });
  return NextResponse.json({ ok: true, item });
}
