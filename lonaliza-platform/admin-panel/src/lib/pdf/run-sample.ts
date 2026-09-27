import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { spawnSync } from "child_process";
import { listAiPrograms, saveAiProgram } from "@/lib/server/ai-programs-store";
import { listMergedPackages, publishAiProgramToCatalog } from "@/lib/server/packages-store";
import { buildProgramPdfBuffer, closeProgramPdfBrowser } from "@/lib/pdf/program-pdf";
import type { SavedAiProgram } from "@/types/ai-program";

const sample: Omit<SavedAiProgram, "id" | "hidden" | "createdAt"> = {
  titleAr: "برنامج 7 أيام في انطاليا — الفخامة والطبيعة",
  titleEn: "7 Days in Antalya — Luxury and Nature",
  destination: "أنطاليا",
  nights: 6,
  people: 2,
  arrivalDate: "2026-06-01",
  departureDate: "2026-06-07",
  priceFromUsd: 3243,
  thumbnail:
    "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=1600&q=80",
  includesAr: [
    "6 ليالٍ في منتجع 5 نجوم شامل كلي (إفطار وغداء وعشاء)",
    "ترانسفير خاص من وإلى المطار",
    "الجولات السياحية والبرنامج المذكور",
  ],
  includesEn: [
    "6 nights in a 5-star all-inclusive resort",
    "Private airport transfers",
    "Sightseeing tours in the program",
  ],
  itinerary: {
    titleAr: "البرنامج",
    titleEn: "Program",
    days: [
      {
        day: 1,
        titleAr: "الوصول والاستقبال الملكي",
        titleEn: "Arrival and royal welcome",
        detailAr:
          "استقبال خاص في مطار أنطاليا ونقل إلى منتجع ريكسوس بريموم بيليك، ثم تسجيل الوصول والاستمتاع بخدمات المنتجع والشاطئ.",
        detailEn: "Private reception at AYT and transfer to Rixos Premium Belek.",
      },
      {
        day: 2,
        titleAr: "استكشاف كالييتشي والمدينة القديمة",
        titleEn: "Kaleiçi and the old city",
        detailAr:
          "جولة خاصة في أزقة كالييتشي والميناء القديم وبوابة هادريان، مع وقت للتسوق وغداء بإطلالة على المتوسط.",
        detailEn: "Private tour of Kaleiçi, the old harbor, and Hadrian's Gate.",
      },
      {
        day: 3,
        titleAr: "شلالات دودان ونهر أوسكان",
        titleEn: "Düden Waterfalls",
        detailAr:
          "زيارة شلالات دودان الشهيرة حيث تصب المياه في البحر، ثم رحلة بحرية واستراحة قهوة في الطبيعة.",
        detailEn: "Visit Düden Waterfalls and a boat trip.",
      },
      {
        day: 4,
        titleAr: "يوم ترفيهي في لاند أوف ليجندز",
        titleEn: "Land of Legends",
        detailAr:
          "يوم كامل في الحديقة الترفيهية والمائية العالمية مع عروض ألعاب نارية مسائية.",
        detailEn: "Full day at Land of Legends.",
      },
      {
        day: 5,
        titleAr: "رحلة جبال طوروس ونبض المدينة",
        titleEn: "Taurus Mountains",
        detailAr:
          "رحلة استكشافية إلى مرتفعات جبال طوروس وزيارة آثار آسبندوس الرومانية.",
        detailEn: "Taurus Mountains and Aspendos.",
      },
      {
        day: 6,
        titleAr: "يوم الاسترخاء الشاطئي والسبا",
        titleEn: "Beach and spa day",
        detailAr:
          "يوم حر على الشاطئ الخاص للمنتجع وجلسات مساج تركي وعشاء غالا فاخر.",
        detailEn: "Resort beach, spa, and gala dinner.",
      },
    ],
    totalBasePrice: 2820,
    totalClientPrice: 3243,
    currency: "USD",
  },
  cards: [
    {
      type: "hotel",
      titleAr: "ريكسوس بريموم بيليك",
      titleEn: "Rixos Premium Belek",
      subtitleAr: "منتجع 5 نجوم شامل كلي",
      subtitleEn: "5-star all-inclusive",
      image:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200",
      basePrice: 2100,
      clientPrice: 2415,
      currency: "USD",
    },
  ],
};

async function main() {
  const all = await listAiPrograms({ includeHidden: true });
  const existing = all.find((p) =>
    /antalya|أنطاليا|انطاليا/i.test(`${p.destination} ${p.titleAr} ${p.titleEn}`)
  );
  const saved = existing
    ? { program: existing, deduped: true }
    : await saveAiProgram(sample);
  for (const program of all.filter((p) => !p.hidden)) {
    await publishAiProgramToCatalog(program);
  }
  const published = await publishAiProgramToCatalog(saved.program);
  const merged = await listMergedPackages();
  const inCatalog = merged.some((p) => p.id === saved.program.id);

  const buffer = await buildProgramPdfBuffer(saved.program);
  const outDir = path.join(process.cwd(), ".data");
  await mkdir(outDir, { recursive: true });
  const outFile = path.join(outDir, "sample-antalya-program.pdf");
  await writeFile(outFile, buffer);

  const extracted = spawnSync("pdftotext", ["-layout", outFile, "-"], {
    encoding: "utf8",
  });
  if (extracted.status !== 0) {
    throw new Error(extracted.stderr || "pdftotext failed");
  }
  const info = spawnSync("pdfinfo", [outFile], { encoding: "utf8" });
  const text = extracted.stdout || "";
  const meta = info.stdout || "";
  const compact = text.replace(/[\u200e\u200f\u202a-\u202e\s]/g, "");
  const hasTitle =
    meta.includes("برنامج") && /أنطاليا|انطاليا|Antalya/.test(meta + text);
  const hasDay =
    /كالييتشي|كاليتشي|دودان|ليجندز|طوروس/.test(text + compact) ||
    /3243/.test(text);
  const hasEstimate =
    /تقديري|واتساب|905321796763/.test(text + compact) ||
    text.includes("905321796763");
  const tofu = (text.match(/\uFFFD|□/g) || []).length;
  const isolated = /جمانرب|نايرلالا/.test(text);

  const report = {
    programId: saved.program.id,
    publishedSlug: published.slug,
    inAdminAndPublicCatalog: inCatalog,
    pdfBytes: buffer.length,
    outFile,
    hasTitle,
    hasDay,
    hasEstimate,
    tofu,
    isolated,
    excerpt: text.slice(0, 600),
  };
  console.log(JSON.stringify(report, null, 2));
  await closeProgramPdfBrowser();
  if (!hasTitle || !hasDay || !hasEstimate || tofu > 2 || isolated || !inCatalog) {
    process.exit(2);
  }
}

main().catch(async (err) => {
  console.error(err);
  await closeProgramPdfBrowser().catch(() => undefined);
  process.exit(1);
});
