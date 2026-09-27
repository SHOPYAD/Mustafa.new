import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  getHomepageTemplateFile,
  publishHomepageTemplate,
  resetHomepageTemplate,
  saveHomepageTemplateDraft,
} from "@/lib/server/homepage-template-store";
import type { HomepageTemplateDraft } from "@/lib/visual-editor/schema";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const store = await getHomepageTemplateFile();
  return NextResponse.json({ ok: true, ...store });
}

export async function PUT(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = (await req.json()) as {
      draft?: HomepageTemplateDraft;
      reset?: boolean;
      publish?: boolean;
    };
    if (body.reset) {
      const store = await resetHomepageTemplate();
      return NextResponse.json({ ok: true, ...store });
    }
    if (!body.draft) {
      return NextResponse.json({ ok: false, error: "draft required" }, { status: 400 });
    }
    const store = body.publish
      ? await publishHomepageTemplate(body.draft)
      : await saveHomepageTemplateDraft(body.draft);
    return NextResponse.json({ ok: true, ...store });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Save failed" },
      { status: 400 }
    );
  }
}
