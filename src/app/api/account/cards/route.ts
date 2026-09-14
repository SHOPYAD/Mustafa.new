import { NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { deleteIyzicoCard } from "@/lib/server/iyzico";
import { deleteCard, listCards } from "@/lib/server/lonaliza-social-commerce";

export const runtime = "nodejs";

function publicCard(card: Awaited<ReturnType<typeof listCards>>[number]) {
  return {
    id: card.id,
    brand: card.brand,
    last4: card.last4,
    expireMonth: card.expireMonth,
    expireYear: card.expireYear,
    cardAlias: card.cardAlias,
    isDefault: card.isDefault,
    createdAt: card.createdAt,
  };
}

export async function GET(req: Request) {
  const user = await getRequestCustomer(req);
  if (!user) return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  const cards = (await listCards(user.id)).filter((c) => Boolean(c.cardToken && c.cardUserKey) || Boolean(c.last4));
  return NextResponse.json({
    ok: true,
    cards: cards.map(publicCard),
    addViaPayment: true,
    note: "لا يُحفظ رقم البطاقة. الحفظ عبر ترميز iyzico فقط.",
  });
}

export async function DELETE(req: Request) {
  const user = await getRequestCustomer(req);
  if (!user) return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id") || "";
  if (!id) return NextResponse.json({ ok: false, error: "id_required" }, { status: 400 });
  const removed = await deleteCard(id, user.id);
  if (removed?.cardToken && removed.cardUserKey) {
    await deleteIyzicoCard({ cardToken: removed.cardToken, cardUserKey: removed.cardUserKey }).catch(() => undefined);
  }
  return NextResponse.json({ ok: true });
}
