import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { disconnectSocialAccount } from "@/lib/social/accounts";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  let body: { accountId?: string; id?: string } = {};
  try {
    body = (await req.json()) as { accountId?: string; id?: string };
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid_json" },
      { status: 400 }
    );
  }

  const id = String(body.accountId || body.id || "").trim();
  if (!id) {
    return NextResponse.json(
      { ok: false, error: "accountId مطلوب" },
      { status: 400 }
    );
  }

  const removed = await disconnectSocialAccount(id);
  if (!removed) {
    return NextResponse.json(
      { ok: false, error: "الحساب غير موجود" },
      { status: 404 }
    );
  }
  return NextResponse.json({ ok: true });
}
