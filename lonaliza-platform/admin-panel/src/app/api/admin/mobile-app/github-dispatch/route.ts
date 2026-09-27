import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { getMobileAppStudioSettings } from "@/lib/server/mobile-app-studio-store";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const settings = await getMobileAppStudioSettings();
  if (!settings.githubRepo || !settings.githubToken) {
    return NextResponse.json(
      { ok: false, error: "يرجى إدخال اسم المستودع (owner/repo) ورمز الوصول (Personal Access Token) في إعدادات GitHub أولاً." },
      { status: 400 }
    );
  }

  const body = (await req.json().catch(() => ({}))) as { target?: "android" | "ios" };
  const target = body.target || "android";
  const workflowFile = target === "ios" ? settings.githubWorkflowIos : settings.githubWorkflowAndroid;

  try {
    const ghRes = await fetch(
      `https://api.github.com/repos/${settings.githubRepo}/actions/workflows/${workflowFile}/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${settings.githubToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Lonaliza-Mobile-App-Studio",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ref: settings.githubBranch || "main",
        }),
      }
    );

    if (ghRes.status === 204) {
      return NextResponse.json({
        ok: true,
        message: `تم إطلاق مسار بناء ${target === "ios" ? "iOS" : "Android"} بنجاح على GitHub Actions.`,
      });
    }

    const errData = await ghRes.json().catch(() => ({}));
    return NextResponse.json(
      {
        ok: false,
        error: (errData as { message?: string }).message || `تعذر تشغيل GitHub Actions (رمز الحالة: ${ghRes.status})`,
      },
      { status: 400 }
    );
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "GitHub dispatch failed" },
      { status: 500 }
    );
  }
}
