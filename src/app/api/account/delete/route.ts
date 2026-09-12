import { NextResponse } from "next/server";
import { getRequestCustomer, clearPbAuthCookieHeader } from "@/lib/pocketbase/auth";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import { recordDeletionRequest } from "@/lib/server/deletion-requests-store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getRequestCustomer(req);
  if (!user) {
    return NextResponse.json({ ok: false, error: "login_required" }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    /* ignore */
  }

  // Register in deletion requests store for admin review & retention management
  try {
    await recordDeletionRequest({
      userId: user.id,
      customerName: user.name || "عضو مسجل",
      email: user.email || "",
      phone: (user as any).phone || "",
      reason: typeof body.reason === "string" ? body.reason : "طلب حذف الحساب ومحو البيانات (GDPR)",
      retentionDays: 30,
    });
  } catch {
    /* ignore error */
  }

  const pb = await tryCreateAdminPocketBase();
  if (pb) {
    try {
      // Soft-delete or anonymize customer record according to GDPR
      const cust = await pb.collection("customers").getFirstListItem(`user = "${user.id}"`);
      await pb.collection("customers").update(cust.id, {
        name: "DELETED_USER",
        phone: "",
        notes: JSON.stringify({
          deletedAt: new Date().toISOString(),
          reason: body.reason || "gdpr_erasure_request",
        }),
      });
    } catch {
      /* ignore */
    }

    try {
      // Deactivate user account
      await pb.collection("users").update(user.id, {
        name: "DELETED_USER",
        email: `deleted_${Date.now()}@lonaliza.local`,
      });
    } catch {
      /* ignore */
    }
  }

  const res = NextResponse.json({
    ok: true,
    message: "account_deleted",
    farewell: "نحن حزينون جداً لفقدانك... كانت رحلتك معنا تجربة نعتز بها كثيراً ونتمنى عودتك لنا في أقرب وقت.",
  });

  // Clear auth cookie
  res.headers.set("Set-Cookie", clearPbAuthCookieHeader());
  return res;
}
