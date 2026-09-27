import { NextResponse } from "next/server";
import { getRequestCustomer } from "@/lib/pocketbase/auth";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const user = await getRequestCustomer(req);
  if (!user) {
    return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  }

  const pb = await tryCreateAdminPocketBase();
  if (!pb) {
    return NextResponse.json({ ok: true, points: 0, usd: 0 });
  }

  try {
    const row = await pb
      .collection("customers")
      .getFirstListItem(`user = "${user.id}" || email = "${user.email}"`)
      .catch(() => null);

    let points = 0;
    let usd = 0;

    if (row) {
      if (typeof row.points === "number") points = row.points;
      if (typeof row.wallet_balance === "number") usd = row.wallet_balance;
      if (row.notes && typeof row.notes === "string" && row.notes.startsWith("{")) {
        try {
          const meta = JSON.parse(row.notes);
          if (typeof meta.loyaltyPoints === "number") points = meta.loyaltyPoints;
          if (typeof meta.walletBalance === "number") usd = meta.walletBalance;
        } catch {}
      }
    }

    return NextResponse.json({ ok: true, points, usd });
  } catch {
    return NextResponse.json({ ok: true, points: 0, usd: 0 });
  }
}
