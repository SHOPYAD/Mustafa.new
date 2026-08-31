import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { getServerEnv } from "@/lib/server/env-store";
import { updatePocketBaseSuperuser } from "@/lib/pocketbase/admin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as {
      email?: string;
      password?: string;
      passwordConfirm?: string;
    };
    const currentEmail = (await getServerEnv("POCKETBASE_ADMIN_EMAIL")).trim();
    const email = (body.email || "").trim() || currentEmail;
    const password = String(body.password || "");
    const passwordConfirm = String(body.passwordConfirm || "");

    if (!email) {
      return NextResponse.json(
        { ok: false, error: "أدخل البريد الإلكتروني" },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { ok: false, error: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" },
        { status: 400 }
      );
    }
    if (password !== passwordConfirm) {
      return NextResponse.json(
        { ok: false, error: "كلمتا المرور غير متطابقتين" },
        { status: 400 }
      );
    }

    const updated = await updatePocketBaseSuperuser({ email, password });
    return NextResponse.json({
      ok: true,
      email: updated.email,
      message: "تم تحديث حساب مشرف قاعدة البيانات",
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: e instanceof Error ? e.message : "تعذّر تحديث حساب المشرف",
      },
      { status: 500 }
    );
  }
}
