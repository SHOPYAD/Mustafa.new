import { NextResponse } from "next/server";
import PocketBase from "pocketbase";
import { getPocketBaseUrl, tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import type { CustomerUser } from "@/lib/pocketbase/auth";

export type MobileCustomer = CustomerUser;

function bearerToken(req: Request): string | null {
  const header = req.headers.get("authorization") || "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  const token = match?.[1]?.trim();
  return token || null;
}

export async function requireMobileCustomer(
  req: Request
): Promise<NextResponse | { customer: MobileCustomer; token: string }> {
  if (req.headers.get("x-lonaliza-b2b-key")) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const token = bearerToken(req);
  if (!token) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const pb = new PocketBase(await getPocketBaseUrl());
    pb.autoCancellation(false);
    pb.authStore.save(token, null);
    const auth = await pb.collection("users").authRefresh();
    let name = String(auth.record.name || "");
    let email = String(auth.record.email || "");
    try {
      const adminPb = await tryCreateAdminPocketBase();
      if (adminPb) {
        const customer = await adminPb
          .collection("customers")
          .getFirstListItem(`user = "${auth.record.id}" || email = "${email}"`);
        name = String(customer.name || name);
        email = String(customer.email || email);
      }
    } catch {
      /* profile join is optional */
    }
    return {
      customer: { id: String(auth.record.id), email, name },
      token,
    };
  } catch {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
}

export function isMobileAuthDenied(
  value: NextResponse | { customer: MobileCustomer; token: string }
): value is NextResponse {
  return value instanceof NextResponse;
}
