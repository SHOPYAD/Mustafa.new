import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { refreshSocialAccount } from "@/lib/social/accounts";

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

  try {
    const account = await refreshSocialAccount(id);
    return NextResponse.json({ ok: true, account });
  } catch (err) {
    const message = err instanceof Error ? err.message : "فشل التحديث";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
