import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { getParasutConfig } from "@/lib/server/parasut/parasut-store";
import { ParasutClient } from "@/lib/server/parasut/parasut-client";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = await req.json().catch(() => ({}));
    const current = await getParasutConfig();
    const config = {
      ...current,
      ...(body.clientId ? { clientId: String(body.clientId).trim() } : {}),
      ...(body.client_id ? { clientId: String(body.client_id).trim() } : {}),
      ...(body.clientSecret && !body.clientSecret.includes("••••") ? { clientSecret: String(body.clientSecret).trim() } : {}),
      ...(body.client_secret && !body.client_secret.includes("••••") ? { clientSecret: String(body.client_secret).trim() } : {}),
      ...(body.username ? { username: String(body.username).trim() } : {}),
      ...(body.password && !body.password.includes("••••") ? { password: String(body.password).trim() } : {}),
      ...(body.companyId ? { companyId: String(body.companyId).trim() } : {}),
      ...(body.company_id ? { companyId: String(body.company_id).trim() } : {}),
      ...(body.environment ? { environment: body.environment } : {}),
    };

    if (!config.clientId || !config.clientSecret || !config.username || !config.password) {
      return NextResponse.json({
        ok: false,
        message: "يرجى ملء جميع بيانات المصادقة لباراشوت أولاً (ClientId, ClientSecret, Username, Password).",
        latencyMs: 0,
      });
    }

    const client = new ParasutClient(config);
    const result = await client.testConnection();
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      message: `خطأ أثناء فحص الاتصال بباراشوت: ${err.message || String(err)}`,
      latencyMs: 0,
    });
  }
}
