import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { listParasutInvoices } from "@/lib/server/parasut/parasut-invoices-store";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  try {
    const invoices = await listParasutInvoices();
    return NextResponse.json({ ok: true, invoices });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message, invoices: [] }, { status: 500 });
  }
}
