import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { buildEditorPagesData, type EditorPagesData } from "@/lib/builder-pages";
import { createCustomPage, listCustomPages } from "@/lib/server/pages-store";
import type { CustomPageInput } from "@/types/custom-page";

export const runtime = "nodejs";

async function editorPagesPayload(): Promise<EditorPagesData> {
  const custom = await listCustomPages();
  return buildEditorPagesData(custom);
}

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const data = await editorPagesPayload();
  return NextResponse.json({ ok: true, ...data });
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const body = (await req.json()) as CustomPageInput;
    const result = await createCustomPage({
      ...body,
      published: body.published ?? false,
    });
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }
    const data = await editorPagesPayload();
    return NextResponse.json({ ok: true, page: result.page, ...data });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Create failed" },
      { status: 500 }
    );
  }
}
