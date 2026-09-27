import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  generateDevKey,
  getPublishSettingsPayload,
} from "@/lib/publish/settings-store";
import { getPublishStoreStatus } from "@/lib/publish/store";

export const runtime = "nodejs";

function wantsGenerate(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const rec = body as Record<string, unknown>;
  return (
    rec.generateApiKey === true ||
    rec.generateKey === true ||
    rec.action === "generate-key" ||
    rec.action === "generateApiKey" ||
    rec.action === "generateKey"
  );
}

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const [payload, store] = await Promise.all([
    getPublishSettingsPayload(),
    getPublishStoreStatus(),
  ]);
  return NextResponse.json({
    ok: true,
    ...payload,
    store,
  });
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  if (!wantsGenerate(body)) {
    return NextResponse.json(
      { ok: false, error: "أرسل generateApiKey: true لتوليد مفتاح المطورين" },
      { status: 400 }
    );
  }
  try {
    const generated = await generateDevKey();
    const payload = await getPublishSettingsPayload();
    return NextResponse.json({
      ok: true,
      ...payload,
      apiKey: generated.apiKey,
      apiKeyMasked: generated.apiKeyMasked,
      hasApiKey: true,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "تعذّر توليد المفتاح" },
      { status: 400 }
    );
  }
}
