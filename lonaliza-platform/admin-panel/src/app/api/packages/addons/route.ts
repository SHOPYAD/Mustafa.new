import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export interface VipAddon {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  priceUsd: number;
  icon: "car" | "guide" | "shield" | "vip" | "yacht" | "camera";
  isActive: boolean;
}

const DEFAULT_ADDONS: VipAddon[] = [
  {
    id: "vip_vito_roundtrip",
    titleAr: "ترقية VIP شاملة: مرسيدس فيتو مع سائق خاص طوال الرحلة",
    titleEn: "VIP Vito Chauffeur throughout entire tour",
    descAr: "سيارة مرسيدس فيتو فارهة مع سائق خاص يتحدث العربية، شامل الوقود ورسوم الطرق ومواقف السيارات 24/7.",
    descEn: "Mercedes-Benz Vito luxury van with private multilingual chauffeur, fuel and toll fees included.",
    priceUsd: 140,
    icon: "car",
    isActive: true,
  },
  {
    id: "bosphorus_private_yacht",
    titleAr: "كروز يخت خاص VIP لمدة ساعتين مع ضيافة فاخرة",
    titleEn: "2-Hour Private VIP Luxury Yacht Cruise with Hospitality",
    descAr: "إبحار خاص وحصري في مضيق البوسفور بيخت فاخر مع طاقم خاص ومشروبات باردة وساخنة وفواكه طازجة.",
    descEn: "Private Bosphorus luxury yacht cruise with crew, complimentary refreshments and scenic sunset views.",
    priceUsd: 220,
    icon: "yacht",
    isActive: true,
  },
  {
    id: "vip_photoshoot",
    titleAr: "جلسة تصوير احترافية وفيديو تذكاري بدقة 4K",
    titleEn: "Professional VIP 4K Photoshoot & Cinematic Video",
    descAr: "مصور فوتوغرافي محترف يرافقكم لأبرز معالم المدينة لتخليد أجمل اللحظات مع تسليم الصور المعدلة وفيديو سينمائي.",
    descEn: "Dedicated professional photographer capturing high-res edited photos and a 4K cinematic reel.",
    priceUsd: 150,
    icon: "camera",
    isActive: true,
  },
  {
    id: "private_guide",
    titleAr: "مرشد سياحي مرخص خاص يتحدث العربية",
    titleEn: "Licensed Arabic & English Tour Guide",
    descAr: "مرافق سياحي خاص ومرخص لجميع المعالم التاريخية والتسوق لمنحكم تجربة ثقافية أصيلة ومريحة.",
    descEn: "Private professional guide for all historical sights and personalized market walkthroughs.",
    priceUsd: 180,
    icon: "guide",
    isActive: true,
  },
  {
    id: "travel_insurance",
    titleAr: "تأمين سفر شامل وتغطية طبية لجميع المسافرين",
    titleEn: "Comprehensive Travel & Medical Insurance",
    descAr: "تأمين سفر دولي معتمد يغطي الطوارئ الطبية وتأخر الأمتعة وإلغاء الرحلات المفاجئ.",
    descEn: "International travel insurance covering medical emergencies, luggage delays, and trip cancellation.",
    priceUsd: 45,
    icon: "shield",
    isActive: true,
  },
  {
    id: "airport_fasttrack",
    titleAr: "خدمة المسار السريع واستراحة كبار الشخصيات بالمطار (Fast-Track)",
    titleEn: "Airport Fast-Track & VIP Lounge Pass",
    descAr: "أولوية الجوازات واستقبال رسمي مع دخول صالة كبار الشخصيات الفاخرة في المطار.",
    descEn: "Priority passport control & lounge access upon arrival and departure.",
    priceUsd: 75,
    icon: "vip",
    isActive: true,
  },
];

const STORE_PATH = path.join(process.cwd(), ".data", "vip-addons.json");

async function readAddons(): Promise<VipAddon[]> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {}
  return DEFAULT_ADDONS;
}

async function writeAddons(addons: VipAddon[]): Promise<void> {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(addons, null, 2), "utf8");
}

export async function GET() {
  const addons = await readAddons();
  return NextResponse.json(
    { ok: true, addons },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (Array.isArray(body?.addons)) {
      await writeAddons(body.addons);
      return NextResponse.json({ ok: true, addons: body.addons });
    }
    const current = await readAddons();
    if (body?.addon) {
      const idx = current.findIndex((a) => a.id === body.addon.id);
      if (idx >= 0) {
        current[idx] = { ...current[idx], ...body.addon };
      } else {
        current.push(body.addon);
      }
      await writeAddons(current);
      return NextResponse.json({ ok: true, addons: current });
    }
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
