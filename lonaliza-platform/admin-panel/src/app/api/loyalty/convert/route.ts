import { NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { getLoyaltySettings } from "@/lib/loyalty/store";
import { convertPointsToVoucher, walletSummary } from "@/lib/loyalty/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getRequestCustomer(req);
  if (!user) {
    return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  }
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const result = await convertPointsToVoucher(user.id, Number(body.points));
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }
  const settings = await getLoyaltySettings();
  return NextResponse.json({
    ok: true,
    voucher: result.voucher,
    ...walletSummary(result.wallet, settings),
  });
}
