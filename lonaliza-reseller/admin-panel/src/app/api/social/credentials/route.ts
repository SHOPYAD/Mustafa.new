import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { saveServerEnv } from "@/lib/server/env-store";
import { listSocialDashboard } from "@/lib/social/accounts";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as {
      provider?: string;
      metaAppId?: string;
      metaAppSecret?: string;
      youtubeClientId?: string;
      youtubeClientSecret?: string;
      tiktokClientKey?: string;
      tiktokClientSecret?: string;
      xClientId?: string;
      xClientSecret?: string;
    };

    const updates: Record<string, string> = {};

    if (body.provider === "meta" || (body.metaAppId !== undefined && body.metaAppSecret !== undefined)) {
      if (body.metaAppId !== undefined) updates.META_APP_ID = body.metaAppId.trim();
      if (body.metaAppSecret !== undefined) updates.META_APP_SECRET = body.metaAppSecret.trim();
    }

    if (body.provider === "youtube" || (body.youtubeClientId !== undefined && body.youtubeClientSecret !== undefined)) {
      if (body.youtubeClientId !== undefined) updates.GOOGLE_YOUTUBE_CLIENT_ID = body.youtubeClientId.trim();
      if (body.youtubeClientSecret !== undefined) updates.GOOGLE_YOUTUBE_CLIENT_SECRET = body.youtubeClientSecret.trim();
    }

    if (body.provider === "tiktok" || (body.tiktokClientKey !== undefined && body.tiktokClientSecret !== undefined)) {
      if (body.tiktokClientKey !== undefined) updates.TIKTOK_CLIENT_KEY = body.tiktokClientKey.trim();
      if (body.tiktokClientSecret !== undefined) updates.TIKTOK_CLIENT_SECRET = body.tiktokClientSecret.trim();
    }

    if (body.provider === "x" || (body.xClientId !== undefined && body.xClientSecret !== undefined)) {
      if (body.xClientId !== undefined) {
        updates.X_CLIENT_ID = body.xClientId.trim();
        updates.TWITTER_CLIENT_ID = body.xClientId.trim();
      }
      if (body.xClientSecret !== undefined) {
        updates.X_CLIENT_SECRET = body.xClientSecret.trim();
        updates.TWITTER_CLIENT_SECRET = body.xClientSecret.trim();
      }
    }

    if (Object.keys(updates).length > 0) {
      await saveServerEnv(updates);
    }

    const dashboard = await listSocialDashboard(req);
    return NextResponse.json({
      ok: true,
      message: "تم حفظ المفاتيح بنجاح",
      credentials: dashboard.credentials,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "فشل حفظ المفاتيح" },
      { status: 500 }
    );
  }
}
