import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import { isMobileAuthDenied, requireMobileCustomer } from "@/lib/server/mobile/require-mobile-customer";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const auth = await requireMobileCustomer(req);
  if (isMobileAuthDenied(auth)) return auth;

  const admin = await tryCreateAdminPocketBase();
  if (admin) {
    await admin.collection("users").update(auth.customer.id, {
      tokenKey: randomBytes(16).toString("hex"),
    });
  }

  return NextResponse.json({ ok: true });
}
