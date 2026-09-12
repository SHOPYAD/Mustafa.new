import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { clearOAuthCookieHeader } from "./oauth-state";
import { resolveSocialOrigin } from "./env";

export async function requireAdminForOAuth(req: Request): Promise<NextResponse | null> {
  const denied = await assertAdminApi(req);
  if (!denied) return null;
  const origin = await resolveSocialOrigin(req);
  return NextResponse.redirect(`${origin}/admin/login`, 302);
}

export async function redirectSocialAdmin(
  req: Request,
  params: Record<string, string>
): Promise<NextResponse> {
  const origin = await resolveSocialOrigin(req);
  const search = new URLSearchParams(params);
  const isError = Boolean(params.error);
  const provider = params.provider || "social";
  const connected = params.connected || "";

  // Dedicated HTML response for OAuth popup windows
  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${isError ? "خطأ في تسجيل الدخول" : "تم تسجيل الدخول بنجاح"}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      background: #090d16;
      color: #f8fafc;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      text-align: center;
      padding: 24px;
    }
    .card {
      background: #0f172a;
      border: 1px solid rgba(148, 163, 184, 0.15);
      border-radius: 24px;
      padding: 36px 28px;
      max-width: 420px;
      width: 100%;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.7);
    }
    .icon-badge {
      width: 64px;
      height: 64px;
      border-radius: 20px;
      margin: 0 auto 16px auto;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      background: ${isError ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)"};
      border: 1px solid ${isError ? "rgba(239, 68, 68, 0.3)" : "rgba(16, 185, 129, 0.3)"};
    }
    h2 { margin: 0 0 8px 0; font-size: 18px; font-weight: 800; color: #fff; }
    p { margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.6; }
    .status-badge {
      display: inline-block;
      margin-top: 14px;
      padding: 6px 14px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 700;
      background: ${isError ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)"};
      color: ${isError ? "#f87171" : "#34d399"};
      border: 1px solid ${isError ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)"};
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-badge">${isError ? "⚠️" : "✅"}</div>
    <h2>${isError ? "تعذر إتمام تسجيل الدخول" : "تم تسجيل الدخول والربط بنجاح!"}</h2>
    <p>${
      isError
        ? "حدث خطأ أثناء المصادقة أو لم يتم منح الصلاحيات المطلوبة."
        : "تم التحقق من الحساب وتفويض وكلاء الذكاء الاصطناعي بنجاح."
    }</p>
    <div class="status-badge">${isError ? "جاري الإغلاق..." : "جاري تحديث لوحة التحكم وإغلاق النافذة..."}</div>
  </div>
  <script>
    if (window.opener) {
      window.opener.postMessage({
        type: 'OAUTH_RESULT',
        ok: ${!isError},
        provider: '${provider}',
        connected: '${connected}',
        error: '${params.error || ""}'
      }, '*');
      setTimeout(() => { window.close(); }, ${isError ? 2800 : 1200});
    } else {
      window.location.href = '${origin}/admin/automation?tab=channels&${search.toString()}';
    }
  </script>
</body>
</html>`;

  const res = new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
  res.headers.append("Set-Cookie", clearOAuthCookieHeader(origin));
  return res;
}
