import { NextResponse } from "next/server";
import PocketBase from "pocketbase";
import { getPocketBaseUrl, tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import { getRequestCustomer } from "@/lib/pocketbase/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getRequestCustomer(req);
  if (!user || !user.email) {
    return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const currentPassword = String(body.currentPassword || "").trim();
  const newPassword = String(body.newPassword || "").trim();
  const confirmPassword = String(body.confirmPassword || "").trim();

  if (!currentPassword) {
    return NextResponse.json({ ok: false, error: "missing_current_password" }, { status: 400 });
  }
  if (!newPassword || newPassword.length < 8) {
    return NextResponse.json({ ok: false, error: "password_min_length" }, { status: 400 });
  }
  if (newPassword !== confirmPassword) {
    return NextResponse.json({ ok: false, error: "password_mismatch" }, { status: 400 });
  }

  try {
    const pbUrl = await getPocketBaseUrl();
    const pbAuth = new PocketBase(pbUrl);
    pbAuth.autoCancellation(false);

    // Verify current password by authenticating
    try {
      await pbAuth.collection("users").authWithPassword(user.email, currentPassword);
    } catch {
      return NextResponse.json({ ok: false, error: "invalid_current_password" }, { status: 400 });
    }

    // Now update password via admin instance or user instance
    const pbAdmin = await tryCreateAdminPocketBase();
    if (pbAdmin) {
      await pbAdmin.collection("users").update(user.id, {
        password: newPassword,
        passwordConfirm: newPassword,
      });
    } else {
      await pbAuth.collection("users").update(user.id, {
        oldPassword: currentPassword,
        password: newPassword,
        passwordConfirm: newPassword,
      });
    }

    return NextResponse.json({ ok: true, message: "password_changed_success" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "failed_to_update_password";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
