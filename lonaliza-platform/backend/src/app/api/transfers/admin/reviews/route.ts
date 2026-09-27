// src/app/api/transfers/admin/reviews/route.ts
import { NextRequest, NextResponse } from "next/server";
import { transferStore } from "@/lib/transfers/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const serviceType = searchParams.get("serviceType") || undefined;
    const status = searchParams.get("status") || undefined;

    const list = transferStore.getReviews(serviceType, status);
    return NextResponse.json({ ok: true, list });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, adminReply } = body;

    if (!id || !status) {
      return NextResponse.json({ ok: false, error: "المعرف والحالة مطلوبان" }, { status: 400 });
    }

    const updated = transferStore.moderateReview(id, status, adminReply);
    return NextResponse.json({ ok: true, review: updated });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
