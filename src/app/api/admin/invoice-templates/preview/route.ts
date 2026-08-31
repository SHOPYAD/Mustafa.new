import { NextRequest, NextResponse } from "next/server";
import { isInvoiceService } from "@/lib/booking-service";
import { renderSampleInvoiceHtml } from "@/lib/pdf/invoice-assets";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { sanitizeInvoiceTemplate } from "@/lib/server/invoice-templates-store";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = (await req.json()) as { service?: string; template?: unknown };
    if (!isInvoiceService(body.service)) {
      return NextResponse.json({ ok: false, error: "service required" }, { status: 400 });
    }
    const draft = body.template
      ? sanitizeInvoiceTemplate(body.service, body.template)
      : null;
    const html = await renderSampleInvoiceHtml(body.service, draft);
    return NextResponse.json({ ok: true, html, service: body.service });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Preview failed" },
      { status: 500 }
    );
  }
}
