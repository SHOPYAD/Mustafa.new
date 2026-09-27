// src/app/api/transfers/driver/quote-requests/route.ts
import { NextRequest, NextResponse } from "next/server";
import { transferStore } from "@/lib/transfers/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const supplierId = searchParams.get("supplierId");

    const requests = transferStore.getQuoteRequests();

    // Baseline active requests if empty
    const defaultRequests = [
      {
        id: "qr-vip-001",
        passengerName: "الشيخ عبدالله (عائلة 6 أفراد)",
        pickupLocation: "مطار إسطنبول (IST)",
        dropoffLocation: "فندق فور سيزونز البسفور + جولة سبانجا يومين",
        date: new Date(Date.now() + 2 * 86400000).toISOString(),
        passengers: 6,
        luggage: 8,
        vehicleTypeRequired: "مرسيدس فيتو VIP أو مايباخ",
        budgetMax: 450,
        currency: "USD",
        notes: "نحتاج سيارة حديثة جداً مع مقاعد مساج وسائق هادئ يتحدث العربية بطلاقة",
        status: "open",
        bidsCount: 2,
      },
      {
        id: "qr-vip-002",
        passengerName: "عائلة آل سعود الكريمة",
        pickupLocation: "مطار طرابزون الدولي (TZX)",
        dropoffLocation: "أوزنجول ➔ هضبة أيدر ➔ ريزا (برنامج 4 أيام)",
        date: new Date(Date.now() + 4 * 86400000).toISOString(),
        passengers: 8,
        luggage: 10,
        vehicleTypeRequired: "مرسيدس سبرينتر VIP عائلي",
        budgetMax: 950,
        currency: "USD",
        notes: "برنامج سياحي شامل الجولات اليومية والاستقبال والتوديع في المطار",
        status: "open",
        bidsCount: 1,
      },
    ];

    const list = requests.length > 0 ? requests : defaultRequests;

    return NextResponse.json({
      ok: true,
      requests: list,
    });
  } catch (err: any) {
    console.error("Driver quote-requests error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { requestId, supplierId, proposedPrice, currency = "USD", vehicleId, notes } = body;

    if (!requestId || !supplierId || !proposedPrice) {
      return NextResponse.json({ ok: false, error: "بيانات العرض المالي غير مكتملة" }, { status: 400 });
    }

    const bid = {
      id: `bid-${Date.now()}`,
      requestId,
      supplierId,
      proposedPrice: Number(proposedPrice),
      currency,
      vehicleId,
      notes,
      submittedAt: new Date().toISOString(),
      status: "submitted",
    };

    return NextResponse.json({
      ok: true,
      bid,
      message: "تم تقديم عرض السعر بنجاح، سيتم إشعار العميل وإعلامك فور القبول",
    });
  } catch (err: any) {
    console.error("Submit quote bid error:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
