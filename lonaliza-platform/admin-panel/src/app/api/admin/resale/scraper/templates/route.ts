import { NextResponse } from "next/server";
import { assertOriginOnly } from "@/lib/server/deployment-role";
import {
  getAllTemplates,
  saveTemplate,
  deleteTemplate,
} from "@/lib/server/gmaps-scraper/reseller-leads-store";
import type { B2BMarketingTemplate } from "@/lib/server/gmaps-scraper/types";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    assertOriginOnly("Reseller Templates API");
    const { searchParams } = new URL(req.url);
    const channel = searchParams.get("channel");

    let list = getAllTemplates();
    if (channel === "whatsapp" || channel === "email") {
      list = list.filter((t) => t.channel === channel);
    }

    return NextResponse.json({ ok: true, templates: list });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "تعذر جلب القوالب" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    assertOriginOnly("Reseller Save Template API");
    const body = (await req.json()) as Partial<B2BMarketingTemplate>;

    if (!body.title || !body.body || !body.channel) {
      return NextResponse.json(
        { ok: false, error: "عنوان القالب ومحتواه وقناته مطلوبة" },
        { status: 400 }
      );
    }

    const template: B2BMarketingTemplate = {
      id: body.id || `tmpl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      channel: body.channel,
      category: body.category || "custom",
      title: body.title,
      subject: body.subject || undefined,
      body: body.body,
      htmlBody: body.htmlBody || undefined,
      variables: body.variables || ["company_name", "city", "demo_url"],
      isAiGenerated: Boolean(body.isAiGenerated),
      createdAt: body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveTemplate(template);
    return NextResponse.json({ ok: true, template });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "خطأ أثناء حفظ القالب" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    assertOriginOnly("Reseller Delete Template API");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ ok: false, error: "معرف القالب مطلوب" }, { status: 400 });
    }

    const deleted = deleteTemplate(id);
    return NextResponse.json({ ok: deleted });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "خطأ أثناء حذف القالب" },
      { status: 500 }
    );
  }
}
