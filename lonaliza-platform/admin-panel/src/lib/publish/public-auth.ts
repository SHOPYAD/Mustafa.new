/**
 * Public publish API key gate — developer key from publish settings (`lzpub_`).
 */

import { NextResponse } from "next/server";
import { verifyPublishDevKey } from "./settings-store";

export function extractPublishApiKey(req: Request): string {
  const header =
    req.headers.get("x-api-key") ||
    req.headers.get("x-lonaliza-publish-key") ||
    "";
  if (header.trim()) return header.trim();
  const auth = req.headers.get("authorization") || "";
  if (/^Bearer\s+/i.test(auth)) {
    return auth.replace(/^Bearer\s+/i, "").trim();
  }
  try {
    return new URL(req.url).searchParams.get("apiKey")?.trim() || "";
  } catch {
    return "";
  }
}

export async function assertPublishPublicApi(
  req: Request
): Promise<NextResponse | null> {
  const key = extractPublishApiKey(req);
  if (!key) {
    return NextResponse.json(
      {
        ok: false,
        error: "مفتاح API مطلوب (Authorization Bearer أو x-api-key)",
      },
      { status: 401 }
    );
  }
  const valid = await verifyPublishDevKey(key);
  if (!valid) {
    return NextResponse.json(
      { ok: false, error: "مفتاح API غير صالح — ولّدوه من إعدادات النشر" },
      { status: 401 }
    );
  }
  return null;
}
