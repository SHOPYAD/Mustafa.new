import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { generateEmailTemplateWithGemini } from "@/lib/server/email/gemini-template";
import { isEmailTemplateKind } from "@/lib/server/email/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = (await req.json()) as {
      prompt?: string;
      kind?: string;
      audienceHint?: string;
      currentDocument?: unknown;
    };
    const kind = body.kind && isEmailTemplateKind(body.kind) ? body.kind : "custom";
    const generated = await generateEmailTemplateWithGemini({
      prompt: String(body.prompt || ""),
      kind,
      audienceHint: String(body.audienceHint || "").slice(0, 2000),
      currentDocument: body.currentDocument,
    });
    if (!generated.ok) {
      return NextResponse.json({ ok: false, error: generated.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true, template: generated });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "فشل التوليد" },
      { status: 500 }
    );
  }
}
