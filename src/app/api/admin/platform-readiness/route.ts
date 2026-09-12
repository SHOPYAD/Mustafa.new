import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { auditPlatformReadiness, saveAndVerifyApiKey, getApiKeyGuidance } from "@/lib/server/mcp/servers/platform-admin";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const audit = await auditPlatformReadiness();
    return NextResponse.json({ ok: true, audit });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as {
      action: "save_key" | "get_guidance" | "refresh";
      service?: string;
      apiKey?: string;
      secretKey?: string;
    };

    if (body.action === "get_guidance" && body.service) {
      const guide = getApiKeyGuidance(body.service);
      return NextResponse.json({ ok: true, guide });
    }

    if (body.action === "save_key" && body.service && body.apiKey) {
      const result = await saveAndVerifyApiKey(body.service, body.apiKey, body.secretKey);
      const audit = await auditPlatformReadiness();
      return NextResponse.json({ ok: true, result, audit });
    }

    const audit = await auditPlatformReadiness();
    return NextResponse.json({ ok: true, audit });
  } catch (error) {
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
