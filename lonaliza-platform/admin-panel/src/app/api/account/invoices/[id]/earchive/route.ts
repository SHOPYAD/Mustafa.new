import { NextRequest, NextResponse } from "next/server";
import { getParasutInvoicePdfBuffer } from "@/lib/server/parasut/parasut-invoices-store";

export const runtime = "nodejs";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: Props) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ ok: false, error: "missing_id" }, { status: 400 });
    }

    const file = await getParasutInvoicePdfBuffer(id);
    if (!file || !file.buffer) {
      return NextResponse.json(
        { ok: false, error: "لم يتم العثور على ملف فاتورة e-Arşiv الرسمية لهذا الحجز." },
        { status: 404 }
      );
    }

    return new NextResponse(new Uint8Array(file.buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${file.filename}"`,
        "Content-Length": String(file.buffer.length),
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (err: any) {
    console.error("[earchive-pdf-download-error]", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
