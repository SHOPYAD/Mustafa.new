// src/app/api/transfers/driver/fleet/new-class/route.ts
import { NextRequest, NextResponse } from "next/server";
import { transferStore } from "@/lib/transfers/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supplierId = body.supplierId || req.headers.get("x-supplier-id") || "sup-lonaliza-official";

    const code = (body.code || `vc_custom_${Date.now()}`).toLowerCase().replace(/[^a-z0-9_]/g, "_");
    const nameAr = body.nameI18n?.ar || body.name?.ar || body.nameAr || "سيارة سياحية فاخرة VIP";
    const nameEn = body.nameI18n?.en || body.name?.en || body.nameEn || "VIP Luxury Tourer";
    const nameTr = body.nameI18n?.tr || body.name?.tr || body.nameTr || "VIP Lüks Transfer";

    const descAr = body.descriptionI18n?.ar || body.description?.ar || body.descriptionAr || "سيارة سياحية فاخرة مع سائق محترف وضيافة وخدمات VIP";
    const descEn = body.descriptionI18n?.en || body.description?.en || body.descriptionEn || "Luxury VIP transfer vehicle with professional chauffeur and amenities";
    const descTr = body.descriptionI18n?.tr || body.description?.tr || body.descriptionTr || "Profesyonel şoför ve VIP olanaklarla lüks transfer aracı";

    const rawImages = body.images || body.ownImages || body.exampleModels || [];
    const formattedImages = rawImages.map((img: any, idx: number) => {
      if (typeof img === "string") return { url: img, isCover: idx === 0 };
      return { url: img.url || "", isCover: img.isCover ?? idx === 0 };
    }).filter((img: any) => Boolean(img.url));

    if (formattedImages.length === 0) {
      formattedImages.push({
        url: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1200&q=80",
        isCover: true,
      });
    }

    const passengers = Number(body.capacity?.passengers || body.passengers) || 6;
    const luggageLarge = Number(body.capacity?.luggageLarge || body.luggageLarge) || passengers;
    const luggageSmall = Number(body.capacity?.luggageSmall || body.luggageSmall) || Math.floor(passengers * 0.75);

    const vehicleClass = transferStore.saveVehicleClass({
      code,
      name: { ar: nameAr, en: nameEn, tr: nameTr },
      description: { ar: descAr, en: descEn, tr: descTr },
      images: formattedImages,
      capacity: {
        passengers,
        luggageLarge,
        luggageSmall,
      },
      amenities: Array.isArray(body.amenities) && body.amenities.length > 0 ? body.amenities : [
        "واي فاي 5G فائق السرعة",
        "مقصورة عازلة للصوت بالكامل",
        "مقاعد جلدية VIP مع مساج وتبريد",
        "ثلاجة ومشروبات وضيافة مجانية",
        "شواحن هواتف ومنافذ كهرباء 220V",
        "تكييف هواء مركزي مزدوج",
        "سائق محترف متعدد اللغات",
      ],
      specs: {
        doors: Number(body.specs?.doors) || 5,
        transmission: body.specs?.transmission || "automatic",
        fuelType: body.specs?.fuelType || "diesel",
      },
      tier: body.tier || "vip",
      serviceTypes: ["transfer", "daily_tour"],
      origin: "supplier_submission",
      moderationStatus: "approved",
      isActive: true,
    });

    const registeredVehicle = transferStore.saveSupplierVehicle({
      supplierId,
      vehicleClassId: vehicleClass.id,
      plateNumber: (body.plateNumber || "34 VIP 000").toUpperCase(),
      make: body.make || "Mercedes-Benz",
      model: nameAr,
      year: Number(body.year) || 2024,
      color: body.color || "Black",
      cleanlinessRating: 98,
      ownImages: formattedImages,
      driver: {
        name: body.driverName || "سائق معتمد",
        phone: body.driverPhone || "",
        languages: ["ar", "tr", "en"],
      },
      isActive: true,
      moderationStatus: "approved",
    });

    return NextResponse.json({
      ok: true,
      message: "تم حفظ الفئة والمركبة وإدراجها بالأسطول بنجاح",
      vehicleClass,
      vehicle: registeredVehicle,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
