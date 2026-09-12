import { NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { deleteCard, listCards } from "@/lib/server/lonaliza-social-commerce";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getRequestCustomer(req);
  if (!user) return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  return NextResponse.json({
    ok: true,
    cards: await listCards(user.id),
    addViaPayment: true,
    note: "لا يُحفظ رقم البطاقة. أضف بطاقة عبر دفع iyzico عند تفعيل حفظ البطاقات.",
  });
}

export async function DELETE(req: Request) {
  const user = await getRequestCustomer(req);
  if (!user) return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id") || "";
  if (!id) return NextResponse.json({ ok: false, error: "id_required" }, { status: 400 });
  await deleteCard(id, user.id);
  return NextResponse.json({ ok: true });
}
