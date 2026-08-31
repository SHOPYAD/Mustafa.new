import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  createAdminPocketBase,
  serializeSuperuserRecord,
} from "@/lib/pocketbase/admin";
import { createHandoff, publicHandoffUrl } from "@/lib/pocketbase/handoff-store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const pb = await createAdminPocketBase();
    const token = pb.authStore.token;
    if (!token) {
      return NextResponse.json(
        { ok: false, error: "تعذّر الحصول على رمز الدخول" },
        { status: 500 }
      );
    }

    const nonce = await createHandoff(token, serializeSuperuserRecord(pb));
    const dest = publicHandoffUrl(nonce);
    return new NextResponse(null, {
      status: 302,
      headers: {
        Location: dest,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: e instanceof Error ? e.message : "تعذّر فتح قاعدة البيانات",
      },
      { status: 500 }
    );
  }
}
