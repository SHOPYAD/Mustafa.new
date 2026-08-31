import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { EMAIL_VISUAL_VARIABLES } from "@/lib/email/visual-doc";
import {
  createTemplate,
  listTemplates,
} from "@/lib/server/email/campaigns";
import { compileVisualTemplateWithBrand } from "@/lib/server/email/compile-visual";
import { getEmailBrand } from "@/lib/server/email/brand";
import { listLocalTemplates } from "@/lib/server/email/local-store";
import { isEmailTemplateKind } from "@/lib/server/email/types";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const [templates, brand] = await Promise.all([listTemplates(), getEmailBrand()]);
    return NextResponse.json({ ok: true, templates, brand });
  } catch (e) {
    const templates = await listLocalTemplates().catch(() => []);
    const brand = await getEmailBrand().catch(() => null);
    if (templates.length > 0) {
      return NextResponse.json({
        ok: true,
        templates,
        brand,
        warning: e instanceof Error ? e.message : "",
      });
    }
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "تعذّر تحميل القوالب" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const kind = String(body.kind || "custom");
    let htmlAr = String(body.html_ar || "");
    let htmlEn = String(body.html_en || "");
    let textAr = String(body.text_ar || "");
    let textEn = String(body.text_en || "");
    let document = body.document;
    if (body.document) {
      const compiled = await compileVisualTemplateWithBrand(body.document);
      htmlAr = compiled.html;
      htmlEn = compiled.html;
      textAr = compiled.text;
      textEn = compiled.text;
      document = compiled.document;
    }
    const template = await createTemplate({
      slug: String(body.slug || ""),
      kind: isEmailTemplateKind(kind) ? kind : "custom",
      name: String(body.name || ""),
      subject_ar: String(body.subject_ar || ""),
      subject_en: String(body.subject_en || ""),
      html_ar: htmlAr,
      html_en: htmlEn,
      text_ar: textAr,
      text_en: textEn,
      source: body.source === "gemini" ? "gemini" : "manual",
      variables: Array.isArray(body.variables)
        ? body.variables.map((v) => String(v))
        : [...EMAIL_VISUAL_VARIABLES],
      document,
    });
    return NextResponse.json({ ok: true, template }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "تعذّر إنشاء القالب" },
      { status: 500 }
    );
  }
}
