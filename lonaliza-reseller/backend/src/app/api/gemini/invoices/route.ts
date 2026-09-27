import { NextRequest, NextResponse } from "next/server";
import { isInvoiceService } from "@/lib/booking-service";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { generateInvoiceTemplateWithGemini } from "@/lib/server/invoice-gemini";
import { sanitizeInvoiceTemplate } from "@/lib/server/invoice-templates-store";

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = (await req.json()) as {
      service?: string;
      template?: unknown;
      messages?: ChatMessage[];
    };
    if (!isInvoiceService(body.service)) {
      return NextResponse.json({ ok: false, error: "service required" }, { status: 400 });
    }
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const current = sanitizeInvoiceTemplate(body.service, body.template);
    const generated = await generateInvoiceTemplateWithGemini({
      service: body.service,
      current,
      messages,
    });
    if (!generated.ok) {
      return NextResponse.json({ ok: false, error: generated.error }, { status: 400 });
    }
    return NextResponse.json({
      ok: true,
      reply: generated.reply,
      template: generated.template,
      patch: generated.patch,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "فشل التوليد" },
      { status: 500 }
    );
  }
}
