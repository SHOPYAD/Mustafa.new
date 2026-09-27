// src/app/api/transfers/catalog/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { TransferService } from "@/types/transfer";
import { DEFAULT_SITE_WHATSAPP } from "@/data/site-contact";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATA_DIR = path.resolve(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "lonaliza_transfers_v1.json");

export async function GET() {
  try {
    if (!fs.existsSync(STORE_FILE)) {
      return NextResponse.json({ ok: false, error: "Store not found" }, { status: 404 });
    }

    const raw = JSON.parse(fs.readFileSync(STORE_FILE, "utf-8"));
    const vehicleClasses = new Map<string, any>((raw.vehicleClasses || []).map((vc: any) => [vc.id, vc]));
    const zones = new Map<string, any>((raw.zones || []).map((z: any) => [z.id, z]));

    const DEFAULT_WA = DEFAULT_SITE_WHATSAPP || "+90 534 231 12 34";

    // 1. Convert Routes to TransferService
    const routes: TransferService[] = (raw.routes || [])
      .filter((r: any) => r.isActive !== false)
      .map((r: any) => {
        const fromZone = zones.get(r.fromZoneId);
        const toZone = zones.get(r.toZoneId);
        const vc = vehicleClasses.get(r.vehicleClassId);

        const fromAr = fromZone?.name?.ar || r.fromZoneId;
        const toAr = toZone?.name?.ar || r.toZoneId;
        const fromEn = fromZone?.name?.en || r.fromZoneId;
        const toEn = toZone?.name?.en || r.toZoneId;

        const vcNameAr = vc?.name?.ar || "مرسيدس فيتو VIP";
        const vcNameEn = vc?.name?.en || "Mercedes-Benz Vito VIP";
        const vcTier = vc?.tier || "vip";
        const seats = vc?.capacity?.passengers || 6;
        const luggage = vc?.capacity?.luggageLarge || 6;
        const images = (vc?.images || []).map((img: any) => img.url).filter(Boolean);

        if (images.length === 0) {
          images.push("https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1600&q=80");
        }

        const durationHours = Math.max(1, Math.ceil((r.estimatedDurationMinutes || 45) / 60));

        return {
          id: r.id,
          slug: r.id,
          type: "transfer",
          titleAr: `ترانسفير ${fromAr} ← ${toAr} (${vcNameAr})`,
          titleEn: `Transfer ${fromEn} → ${toEn} (${vcNameEn})`,
          descriptionAr: `توصيل واستقبال خاص ومريح بين ${fromAr} و ${toAr} بسيارة ${vcNameAr} مع سائق محترف، تتبع للرحلة، وخدمة راقية لكافة الضيوف.`,
          descriptionEn: `Private chauffeur transfer between ${fromEn} and ${toEn} in a luxurious ${vcNameEn} with flight tracking and premium service.`,
          vehicleName: vcNameEn,
          vehicleType: vcTier === "group" ? "VIP Minibus" : "VIP Van",
          vehicleClass: vcNameAr,
          seats,
          luggage,
          price: r.basePrice || 65,
          currency: r.currency || "USD",
          durationHours,
          routeFrom: fromEn,
          routeTo: toEn,
          routeFromAr: fromAr,
          routeToAr: toAr,
          highlightsAr: vc?.amenities || [
            "استقبال في المطار مع لوحة الاسم",
            "تتبع الرحلة في الوقت الفعلي",
            "مياه معدنية وواي فاي فائق السرعة",
            "سائق يتحدث العربية والإنجليزية",
          ],
          highlightsEn: [
            "Airport meet & greet with name sign",
            "Real-time flight tracking",
            "Complimentary bottled water & fast WiFi",
            "Multilingual professional chauffeur",
          ],
          includesAr: [
            `سيارة ${vcNameAr} فاخرة ونظيفة تماماً`,
            "سائق مرخص ومحترف",
            "رسوم الطرق السريعة والجسور والأنفاق",
            "المساعدة في حمل وتفريغ الأمتعة",
          ],
          includesEn: [
            `Late-model ${vcNameEn}`,
            "Professional licensed chauffeur",
            "Toll roads, bridge & tunnel fees included",
            "Full luggage assistance",
          ],
          images,
          whatsappNumber: DEFAULT_WA,
          whatsappMessageAr: `مرحباً لوناليزا، أود حجز ترانسفير من ${fromAr} إلى ${toAr} بسيارة ${vcNameAr}.`,
          whatsappMessageEn: `Hello Lonaliza, I would like to book a transfer from ${fromEn} to ${toEn} with ${vcNameEn}.`,
          isFeatured: true,
          isActive: true,
        };
      });

    // 2. Convert Tours to TransferService
    const tours: TransferService[] = (raw.tours || [])
      .filter((t: any) => t.isActive !== false)
      .map((t: any) => {
        const titleAr = t.title?.ar || "جولة سياحية خاصة";
        const titleEn = t.title?.en || "Private VIP Tour";
        const descAr = t.description?.ar || t.summary?.ar || "جولة يومية بسيارة وسائق خاص.";
        const descEn = t.description?.en || t.summary?.en || "Full day private tour with chauffeur.";
        const durationHours = t.durationHours || 10;
        const price = t.prices?.[0]?.price || 180;
        const currency = t.prices?.[0]?.currency || "USD";

        const images = (t.images || []).map((img: any) => img.url).filter(Boolean);
        if (images.length === 0) {
          images.push(t.coverImage || "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1600&q=80");
        }

        const highlightsAr = (t.itinerary || []).map((it: any) => it.name?.ar).filter(Boolean);
        const highlightsEn = (t.itinerary || []).map((it: any) => it.name?.en).filter(Boolean);

        return {
          id: t.id,
          slug: t.slug || t.id,
          type: "vip_tour",
          titleAr,
          titleEn,
          descriptionAr: descAr,
          descriptionEn: descEn,
          vehicleName: "Mercedes-Benz Vito VIP / Maybach",
          vehicleType: "VIP Chauffeur & Tour",
          vehicleClass: "VIP",
          seats: 6,
          luggage: 6,
          price,
          currency,
          durationHours,
          routeFrom: t.hubCity || "Istanbul",
          routeTo: titleEn,
          routeFromAr: t.hubCity === "Istanbul" ? "إسطنبول" : t.hubCity,
          routeToAr: titleAr,
          highlightsAr: highlightsAr.length ? highlightsAr : ["جولة شاملة", "سائق خاص طوال اليوم", "واي فاي ومشروبات ضيافة"],
          highlightsEn: highlightsEn.length ? highlightsEn : ["Comprehensive tour", "Private chauffeur all day", "WiFi & chilled drinks"],
          includesAr: t.inclusions || ["سيارة خاصة ومكيفة", "سائق خاص", "الوقود ورسوم المرور ومواقف السيارات", "مياه معدنية"],
          includesEn: ["Private air-conditioned vehicle", "Chauffeur", "Fuel & parking tolls included", "Bottled water"],
          images,
          whatsappNumber: DEFAULT_WA,
          whatsappMessageAr: `مرحباً لوناليزا، أود حجز ${titleAr}.`,
          whatsappMessageEn: `Hello Lonaliza, I would like to book ${titleEn}.`,
          isFeatured: (t.popularityRank || 0) >= 70,
          isActive: true,
        };
      });

    const list = [...routes, ...tours];
    return NextResponse.json(
      { ok: true, list, total: list.length },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
