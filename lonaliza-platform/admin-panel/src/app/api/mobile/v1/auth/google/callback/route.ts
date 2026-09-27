import { NextRequest, NextResponse } from "next/server";
import { MOBILE_APP_SCHEME } from "@/app/api/mobile/v1/auth/google/route";

export const runtime = "nodejs";

/**
 * Google cannot redirect to lonaliza://. It hits this https URL, then we open the app.
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const target = new URL(MOBILE_APP_SCHEME);
  for (const key of ["code", "state", "error", "error_description"]) {
    const value = q.get(key);
    if (value) target.searchParams.set(key, value);
  }
  const href = target.toString();
  const html = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>لوناليزا</title>
  <meta http-equiv="refresh" content="0;url=${href}" />
</head>
<body style="font-family:sans-serif;padding:32px;text-align:center;background:#F7F4FC;color:#2E1065">
  <p>جارٍ إعادتك إلى تطبيق لوناليزا…</p>
  <p><a href="${href}" style="color:#7C3AED;font-weight:700">افتح التطبيق</a></p>
  <script>location.replace(${JSON.stringify(href)});</script>
</body>
</html>`;
  return new NextResponse(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
