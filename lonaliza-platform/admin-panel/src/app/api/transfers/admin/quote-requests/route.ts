// src/app/api/transfers/admin/quote-requests/route.ts
import { NextRequest, NextResponse } from "next/server";
import { transferStore } from "@/lib/transfers/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const list = transferStore.getQuoteRequests(status);
    return NextResponse.json({ ok: true, list });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === "update_quote") {
      const { id, quotedAmount, quotedCurrency, status, internalNote } = body;
      if (!id) return NextResponse.json({ ok: false, error: "المعرف مطلوب" }, { status: 400 });

      const updated = transferStore.updateQuoteRequest(id, {
        quotedAmount: quotedAmount !== undefined ? Number(quotedAmount) : undefined,
        quotedCurrency: quotedCurrency || "USD",
        status: status || "quoted",
        internalNote,
      });

      return NextResponse.json({ ok: true, quote: updated });
    }

    const created = transferStore.addQuoteRequest(body);
    return NextResponse.json({ ok: true, quote: created });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
