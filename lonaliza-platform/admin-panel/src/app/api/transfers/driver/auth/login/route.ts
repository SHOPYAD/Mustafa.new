// src/app/api/transfers/driver/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { transferStore } from "@/lib/transfers/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { ok: false, message: "يرجى إدخال البريد الإلكتروني" },
        { status: 400 }
      );
    }

    // Lookup supplier
    const suppliers = transferStore.getSuppliers(undefined, true);
    const supplier = suppliers.find(
      (s) => s.contactEmail.toLowerCase() === email
    );

    if (!supplier) {
      return NextResponse.json(
        { ok: false, message: "لم يتم العثور على حساب شريك مسجل بهذا البريد الإلكتروني" },
        { status: 404 }
      );
    }

    const token = `lona_drv_${Buffer.from(`${supplier.id}:${email}:${Date.now()}`).toString("base64url")}`;

    const ratingNumber =
      typeof supplier.rating === "object" && supplier.rating !== null
        ? Number((supplier.rating as any).avg ?? 5.0)
        : Number(supplier.rating || 5.0);

    return NextResponse.json({
      ok: true,
      supplierId: supplier.id,
      token,
      status: supplier.status || "active",
      profile: {
        id: supplier.id,
        legalName: supplier.legalName,
        tradeName: supplier.tradeName,
        email: supplier.contactEmail,
        phone: supplier.contactPhone,
        accountType: supplier.accountType,
        status: supplier.status || "active",
        rating: isNaN(ratingNumber) ? 5.0 : ratingNumber,
      },
    });
  } catch (err: any) {
    console.error("Driver auth login error:", err);
    return NextResponse.json(
      { ok: false, message: err.message || "فشل تسجيل الدخول" },
      { status: 500 }
    );
  }
}
