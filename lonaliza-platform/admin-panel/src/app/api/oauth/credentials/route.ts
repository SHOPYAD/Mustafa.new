import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { saveServerEnv } from "@/lib/server/env-store";
import { saveOAuthApp, saveTelegramBotTokenToApps } from "@/lib/social/oauth-apps";
import { getSocialCredentialsStatus } from "@/lib/social/env";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as Record<string, string | undefined>;
    const provider = (body.provider || "").trim();
    const updates: Record<string, string> = {};

    if (provider === "linkedin" || provider === "linkedin-page" || body.linkedinClientId || body.linkedinClientSecret) {
      if (body.linkedinClientId) updates.LINKEDIN_CLIENT_ID = body.linkedinClientId.trim();
      if (body.linkedinClientSecret) updates.LINKEDIN_CLIENT_SECRET = body.linkedinClientSecret.trim();
      if (updates.LINKEDIN_CLIENT_ID && updates.LINKEDIN_CLIENT_SECRET) {
        await saveOAuthApp("linkedin", {
          clientId: updates.LINKEDIN_CLIENT_ID,
          clientSecret: updates.LINKEDIN_CLIENT_SECRET,
        });
      }
    }

    if (provider === "threads" || body.threadsAppId || body.threadsAppSecret) {
      if (body.threadsAppId) updates.THREADS_APP_ID = body.threadsAppId.trim();
      if (body.threadsAppSecret) updates.THREADS_APP_SECRET = body.threadsAppSecret.trim();
      if (updates.THREADS_APP_ID && updates.THREADS_APP_SECRET) {
        await saveOAuthApp("threads", {
          clientId: updates.THREADS_APP_ID,
          clientSecret: updates.THREADS_APP_SECRET,
        });
      }
    }

    if (provider === "pinterest" || body.pinterestClientId || body.pinterestClientSecret) {
      if (body.pinterestClientId) updates.PINTEREST_CLIENT_ID = body.pinterestClientId.trim();
      if (body.pinterestClientSecret) updates.PINTEREST_CLIENT_SECRET = body.pinterestClientSecret.trim();
      if (updates.PINTEREST_CLIENT_ID && updates.PINTEREST_CLIENT_SECRET) {
        await saveOAuthApp("pinterest", {
          clientId: updates.PINTEREST_CLIENT_ID,
          clientSecret: updates.PINTEREST_CLIENT_SECRET,
        });
      }
    }

    if (provider === "gmb" || body.gmbClientId || body.gmbClientSecret) {
      if (body.gmbClientId) updates.GOOGLE_GMB_CLIENT_ID = body.gmbClientId.trim();
      if (body.gmbClientSecret) updates.GOOGLE_GMB_CLIENT_SECRET = body.gmbClientSecret.trim();
      if (updates.GOOGLE_GMB_CLIENT_ID && updates.GOOGLE_GMB_CLIENT_SECRET) {
        await saveOAuthApp("gmb", {
          clientId: updates.GOOGLE_GMB_CLIENT_ID,
          clientSecret: updates.GOOGLE_GMB_CLIENT_SECRET,
        });
      }
    }

    if (provider === "telegram" || body.telegramBotToken) {
      if (body.telegramBotToken) {
        updates.TELEGRAM_BOT_TOKEN = body.telegramBotToken.trim();
        await saveTelegramBotTokenToApps(updates.TELEGRAM_BOT_TOKEN);
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ ok: false, error: "لم يتم إرسال مفاتيح للحفظ" }, { status: 400 });
    }

    await saveServerEnv(updates);
    const credentials = await getSocialCredentialsStatus(req);
    return NextResponse.json({
      ok: true,
      message: "تم حفظ المفاتيح بنجاح",
      credentials,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "فشل حفظ المفاتيح" },
      { status: 500 }
    );
  }
}
