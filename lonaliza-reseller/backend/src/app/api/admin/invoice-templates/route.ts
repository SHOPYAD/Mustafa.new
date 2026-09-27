import { NextRequest, NextResponse } from "next/server";
import { isInvoiceService } from "@/lib/booking-service";
import { assertAdminApi } from "@/lib/server/admin-auth";
import {
  getInvoiceTemplates,
  resetInvoiceTemplate,
  saveInvoiceTemplate,
} from "@/lib/server/invoice-templates-store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  const store = await getInvoiceTemplates();
  return NextResponse.json({ ok: true, ...store });
}

export async function PUT(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = (await req.json()) as {
      service?: string;
      template?: unknown;
      reset?: boolean;
    };
    if (!isInvoiceService(body.service)) {
      return NextResponse.json({ ok: false, error: "service required" }, { status: 400 });
    }
    const store = body.reset
      ? await resetInvoiceTemplate(body.service)
      : await saveInvoiceTemplate(body.service, (body.template || {}) as object);
    return NextResponse.json({ ok: true, ...store, template: store.templates[body.service] });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Save failed" },
      { status: 400 }
    );
  }
}
