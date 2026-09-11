import { NextRequest, NextResponse } from "next/server";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import type { CustomerRecord } from "@/lib/pocketbase/records";
import { isMobileAuthDenied, requireMobileCustomer } from "@/lib/server/mobile/require-mobile-customer";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = await requireMobileCustomer(req);
  if (isMobileAuthDenied(auth)) return auth;

  const pb = await tryCreateAdminPocketBase();
  if (!pb) {
    return NextResponse.json({
      ok: true,
      profile: { name: auth.customer.name, email: auth.customer.email, phone: "" },
    });
  }

  try {
    const row = await pb
      .collection("customers")
      .getFirstListItem<CustomerRecord>(`user = "${auth.customer.id}" || email = "${auth.customer.email}"`);
    return NextResponse.json({
      ok: true,
      profile: {
        name: row.name || auth.customer.name,
        email: row.email || auth.customer.email,
        phone: row.phone || "",
      },
    });
  } catch {
    return NextResponse.json({
      ok: true,
      profile: { name: auth.customer.name, email: auth.customer.email, phone: "" },
    });
  }
}
