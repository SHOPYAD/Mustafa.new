import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  deleteTemplate,
  getTemplate,
  updateTemplate,
} from "@/lib/server/email/campaigns";
import { compileVisualTemplateWithBrand } from "@/lib/server/email/compile-visual";
import { isEmailTemplateKind } from "@/lib/server/email/types";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const { id } = await ctx.params;
    const template = await getTemplate(id);
    return NextResponse.json({ ok: true, template });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "غير موجود" },
      { status: 404 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const { id } = await ctx.params;
    const body = (await req.json()) as Record<string, unknown>;
    const kind = body.kind != null ? String(body.kind) : undefined;
    let htmlAr = body.html_ar != null ? String(body.html_ar) : undefined;
    let htmlEn = body.html_en != null ? String(body.html_en) : undefined;
    let textAr = body.text_ar != null ? String(body.text_ar) : undefined;
    let textEn = body.text_en != null ? String(body.text_en) : undefined;
    let document = body.document;
    if (body.document) {
      const compiled = await compileVisualTemplateWithBrand(body.document);
      htmlAr = compiled.html;
      htmlEn = compiled.html;
      textAr = compiled.text;
      textEn = compiled.text;
      document = compiled.document;
    }
    const template = await updateTemplate(id, {
      name: body.name != null ? String(body.name) : undefined,
      kind: kind && isEmailTemplateKind(kind) ? kind : undefined,
      subject_ar: body.subject_ar != null ? String(body.subject_ar) : undefined,
      subject_en: body.subject_en != null ? String(body.subject_en) : undefined,
      html_ar: htmlAr,
      html_en: htmlEn,
      text_ar: textAr,
      text_en: textEn,
      document,
    });
    return NextResponse.json({ ok: true, template });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "تعذّر الحفظ" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const { id } = await ctx.params;
    await deleteTemplate(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "تعذّر الحذف" },
      { status: 400 }
    );
  }
}
