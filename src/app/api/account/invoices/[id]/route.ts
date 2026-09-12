import { NextRequest, NextResponse } from "next/server";
import { resolveOfficialInvoice } from "@/lib/server/invoice-resolver";
import { authorizeBookingDocument } from "@/lib/server/booking-document-access";

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

    const access = await authorizeBookingDocument(req, id);
    if (!access.ok) {
      return NextResponse.json({ ok: false, error: access.error }, { status: access.status });
    }
    const invoice = await resolveOfficialInvoice(id);
    if (!invoice) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      invoice,
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "server_error" }, { status: 500 });
  }
}
