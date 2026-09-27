// src/app/api/transfers/driver/documents/route.ts
import { NextRequest, NextResponse } from "next/server";
import { transferStore } from "@/lib/transfers/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { supplierId, docs } = body;

    if (!supplierId || !Array.isArray(docs)) {
      return NextResponse.json(
        { ok: false, message: "بيانات المستندات غير صالحة" },
        { status: 400 }
      );
    }

    const supplier = transferStore.getSupplierById(supplierId);
    if (!supplier) {
      return NextResponse.json(
        { ok: false, message: "الشريك غير موجود في النظام" },
        { status: 404 }
      );
    }

    const formattedDocs = docs.map((d: any) => ({
      kind: d.kind || "operating_license",
      url: d.url || "",
      uploadedAt: new Date().toISOString(),
    }));

    supplier.documents = [...(supplier.documents || []), ...formattedDocs];
    transferStore.saveSupplier(supplier);

    return NextResponse.json({
      ok: true,
      message: "تم حفظ المستندات الرسمية للشريك بنجاح وهي قيد المراجعة",
      documents: supplier.documents,
    });
  } catch (err: any) {
    console.error("Driver documents save error:", err);
    return NextResponse.json(
      { ok: false, message: err.message || "فشل حفظ المستندات" },
      { status: 500 }
    );
  }
}
