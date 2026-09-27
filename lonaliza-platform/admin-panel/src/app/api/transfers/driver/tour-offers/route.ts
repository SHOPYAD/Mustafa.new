// src/app/api/transfers/driver/tour-offers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { transferStore } from "@/lib/transfers/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const supplierId = searchParams.get("supplierId") || req.headers.get("x-supplier-id") || "sup-lonaliza-official";
    const requestedCity = searchParams.get("city")?.toLowerCase().trim();

    const tours = transferStore.getTours(undefined, undefined, true);
    const vehicleClasses = transferStore.getVehicleClasses(true);
    const supplierOffers = transferStore.getSupplierTourOffers(supplierId);

    const filteredTours = tours.filter((tour) => {
      if (!requestedCity || requestedCity === "all" || requestedCity === "الكل") return true;
      const hCity = (tour.hubCity || (tour as any).destination || (tour as any).city || "").toLowerCase();
      return hCity === requestedCity || (requestedCity === "aegean" && (hCity === "bodrum" || hCity === "fethiye" || hCity === "marmaris"));
    });

    const result = filteredTours.map((tour) => {
      const offers = (tour.prices || []).map((tp) => {
        const vClass = vehicleClasses.find((vc) => vc.id === tp.vehicleClassId || vc.code === tp.vehicleClassId);
        const existingCustom = supplierOffers.find(
          (so) => so.tourId === tour.id && (!so.vehicleClassId || so.vehicleClassId === tp.vehicleClassId)
        );

        return {
          vehicleClassId: tp.vehicleClassId,
          vehicleClass: vClass || null,
          catalogPrice: tp.price,
          catalogCurrency: tp.currency || "USD",
          customPrice: existingCustom?.price ?? tp.price,
          customCurrency: existingCustom?.currency ?? tp.currency ?? "USD",
          isActive: existingCustom ? existingCustom.isActive : true,
        };
      });

      const effectiveOffers =
        offers.length > 0
          ? offers
          : [
              {
                vehicleClassId: "vc-vito-vip",
                vehicleClass: null,
                catalogPrice: 180,
                catalogCurrency: "USD",
                customPrice: 180,
                customCurrency: "USD",
                isActive: true,
              },
            ];

      return {
        tour: {
          ...tour,
          _id: tour.id,
          hubCity: (tour.hubCity || (tour as any).destination || "istanbul").toLowerCase(),
        },
        offers: effectiveOffers,
      };
    });

    return NextResponse.json({
      ok: true,
      offers: result,
      list: result,
      count: result.length,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supplierId = body.supplierId || req.headers.get("x-supplier-id") || "sup-lonaliza-official";

    let tourId = body.tourId;
    const price = Number(body.customPrice ?? body.price) || 180;
    const vehicleClassId = body.vehicleClassId || "vc-vito-vip";

    if (!tourId || body.isNewTour) {
      if (!body.titleAr && !body.title) {
        return NextResponse.json({ ok: false, error: "عنوان الجولة السياحية مطلوب" }, { status: 400 });
      }
      const titleAr = body.titleAr || (typeof body.title === "object" ? body.title.ar : body.title);
      const titleEn = body.titleEn || (typeof body.title === "object" ? body.title.en : titleAr);
      const hubCity = (body.hubCity || body.city || body.destination || "istanbul").toLowerCase();
      const slug = `tour-${Date.now()}`;
      const newTour = transferStore.saveTour({
        slug,
        title: { ar: titleAr, en: titleEn, tr: titleEn },
        summary: { ar: titleAr, en: titleEn, tr: titleEn },
        description: { ar: titleAr, en: titleEn, tr: titleEn },
        hubCity,
        durationHours: Number(body.durationHours) || 10,
        itinerary: body.itinerary || [],
        prices: [{ vehicleClassId, price, currency: body.currency || "USD" }],
        isActive: true,
      });
      tourId = newTour.id;
    }

    const offer = transferStore.saveSupplierTourOffer({
      supplierId,
      tourId,
      vehicleClassId,
      price,
      currency: body.currency || "USD",
      isActive: body.isActive !== false,
    });

    return NextResponse.json({
      ok: true,
      message: "تم حفظ عرض الجولة بنجاح",
      offer,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
