import { NextRequest, NextResponse } from "next/server";
import { assertPublishPublicApi } from "@/lib/publish/public-auth";
import { uploadFromUrlSchema } from "@/lib/publish/schemas";
import { uploadFromUrl } from "@/lib/publish/upload";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const denied = await assertPublishPublicApi(req);
  if (denied) return denied;
  try {
    const body = uploadFromUrlSchema.parse(await req.json());
    const result = await uploadFromUrl(body.url);
    return NextResponse.json(
      {
        ok: result.ok,
        stub: result.stub,
        url: result.url,
        relativePath: result.relativePath,
        bytes: result.bytes,
        contentType: result.contentType,
        error: result.error,
      },
      { status: result.ok ? 200 : 400 }
    );
  } catch (err) {
    return NextResponse.json(
      { ok: false, stub: true, error: err instanceof Error ? err.message : "رابط غير صالح" },
      { status: 400 }
    );
  }
}
