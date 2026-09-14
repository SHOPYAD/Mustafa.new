import { NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { unreadCounts } from "@/lib/server/lonaliza-social-commerce";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getRequestCustomer(req);
  if (!user) return NextResponse.json({ ok: true, messages: 0, conversations: 0 });
  const counts = await unreadCounts(user.id);
  return NextResponse.json({ ok: true, ...counts });
}
