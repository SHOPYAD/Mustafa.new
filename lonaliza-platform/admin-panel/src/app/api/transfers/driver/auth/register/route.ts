// src/app/api/transfers/driver/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { transferStore } from "@/lib/transfers/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const email = (body.email || body.contactEmail || "").trim().toLowerCase();
    const legalName = (body.legalName || body.tradeName || "").trim();
    const tradeName = (body.tradeName || body.legalName || "").trim();

    if (!email || !legalName) {
      return NextResponse.json(
        { ok: false, message: "يرجى ملء كافة الحقول الأساسية: البريد الإلكتروني والاسم التجاري" },
        { status: 400 }
      );
    }

    // Check if supplier already exists
    const existing = transferStore.getSuppliers(undefined, true).find(
      (s) => s.contactEmail.toLowerCase() === email
    );

    const supplierId = existing ? existing.id : `sup-${Date.now()}`;
    const token = `lona_drv_${Buffer.from(`${supplierId}:${email}:${Date.now()}`).toString("base64url")}`;

    // Create / save supplier
    const supplier = transferStore.saveSupplier({
      id: supplierId,
      accountType: body.accountType || "owner_driver",
      legalName,
      tradeName,
      contactEmail: email,
      contactPhone: (body.contactPhone || body.phone || "").trim(),
      status: "pending", // Appears in admin under Suppliers & Moderation for approval
      serviceTypes: ["transfer", "daily_tour"],
      documents: Array.isArray(body.documents) ? body.documents : [],
      payoutDetails: body.payoutDetails || {
        iban: body.iban || "",
        bankName: body.bankName || "",
        accountHolder: body.accountHolder || legalName,
      },
    });

    // If initial vehicles were attached during registration, save them for moderation
    if (Array.isArray(body.vehicles) && body.vehicles.length > 0) {
      for (const v of body.vehicles) {
        if (v.plateNumber || v.vehicleClassId) {
          transferStore.saveSupplierVehicle({
            supplierId: supplier.id,
            vehicleClassId: v.vehicleClassId || "vc-vito-vip",
            make: v.make || "Mercedes-Benz",
            model: v.model || "Vito VIP",
            year: v.year || 2024,
            plateNumber: v.plateNumber || "34-VIP-001",
            color: v.color || "Black",
            moderationStatus: "pending", // Requires admin review
            isActive: true,
            driver: {
              name: v.driver?.name || legalName,
              phone: v.driver?.phone || body.contactPhone || "",
            },
            photos: Array.isArray(v.photos) ? v.photos : [],
          });
        }
      }
    }

    return NextResponse.json({
      ok: true,
      supplierId: supplier.id,
      token,
      status: supplier.status,
      message: "تم تسجيل حساب الشريك بنجاح وهو الآن قيد المراجعة والاعتماد في النظام",
      profile: {
        id: supplier.id,
        legalName: supplier.legalName,
        tradeName: supplier.tradeName,
        email: supplier.contactEmail,
        phone: supplier.contactPhone,
        accountType: supplier.accountType,
        status: supplier.status,
      },
    });
  } catch (err: any) {
    console.error("Driver auth register error:", err);
    return NextResponse.json(
      { ok: false, message: err.message || "حدث خطأ أثناء تسجيل السائق" },
      { status: 500 }
    );
  }
}
