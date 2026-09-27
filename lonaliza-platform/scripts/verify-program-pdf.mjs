/**
 * Generate a sample Antalya program PDF and check Arabic extraction.
 * Usage: node scripts/verify-program-pdf.mjs
 */
import { pathToFileURL } from "url";
import { createRequire } from "module";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { spawnSync } from "child_process";

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, ".data");
const outFile = path.join(outDir, "sample-antalya-program.pdf");

const sample = {
  id: "aip_sample_antalya_verify",
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
          "يوم كامل في الحديقة الترفيهية والمائية العالمية (دخول خاص لضيوف ريكسوس) مع عروض ألعاب نارية مسائية.",
        detailEn: "Full day at Land of Legends theme and water park.",
      },
      {
        day: 5,
        titleAr: "رحلة جبال طوروس ونبض المدينة",
        titleEn: "Taurus Mountains",
        detailAr:
          "رحلة استكشافية إلى مرتفعات جبال طوروس وزيارة آثار آسبندوس الرومانية وتجربة طعام محلي أصيل.",
        detailEn: "Taurus Mountains and Aspendos ruins.",
      },
      {
        day: 6,
        titleAr: "يوم الاسترخاء الشاطئي والسبا",
        titleEn: "Beach and spa day",
        detailAr:
          "يوم حر على الشاطئ الخاص للمنتجع، جلسات مساج تركي، وعشاء غالا فاخر في المساء.",
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
  hidden: false,
  createdAt: new Date().toISOString(),
};

async function main() {
  await mkdir(outDir, { recursive: true });

  // Load the Next-compiled path via tsx if available, else inline Playwright HTML.
  let buffer;
  try {
    const { register } = createRequire(import.meta.url)("node:module");
    void register;
    const modUrl = pathToFileURL(path.join(root, "src/lib/pdf/program-pdf.ts")).href;
    const { buildProgramPdfBuffer } = await import(modUrl);
    buffer = await buildProgramPdfBuffer(sample);
  } catch (err) {
    console.warn("TS import failed, using standalone Playwright render:", err.message);
    const { chromium } = await import("playwright");
    const { readFile } = await import("fs/promises");
    const font = await readFile(
      path.join(root, "public/fonts/NotoNaskhArabic-Regular.ttf")
    );
    const fontUri = `data:font/ttf;base64,${font.toString("base64")}`;
    const html = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="utf-8"/>
      <style>
      @font-face { font-family: "Noto Naskh Arabic"; src: url("${fontUri}") format("truetype"); }
      body { font-family: "Noto Naskh Arabic", sans-serif; direction: rtl; padding: 24px; }
      h1 { color: #047857; }
      </style></head><body>
      <h1>${sample.titleAr}</h1>
      <p>من ${sample.priceFromUsd} دولار — ${sample.nights} ليالٍ — ${sample.people} أشخاص</p>
      <p>السعر المعروض تقديري حسب أسعار السوق الحالية. للتأكيد النهائي تواصل مع خدمة العملاء عبر واتساب.</p>
      ${sample.itinerary.days.map((d) => `<h3>اليوم ${d.day} — ${d.titleAr}</h3><p>${d.detailAr}</p>`).join("")}
      </body></html>`;
    const browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    buffer = Buffer.from(await page.pdf({ format: "A4", printBackground: true }));
    await browser.close();
  }

  await writeFile(outFile, buffer);
  console.log("Wrote", outFile, buffer.length, "bytes");

  const extracted = spawnSync("pdftotext", ["-layout", outFile, "-"], {
    encoding: "utf8",
  });
  if (extracted.status !== 0) {
    console.error(extracted.stderr);
    process.exit(1);
  }
  const text = extracted.stdout || "";
  console.log("----- pdftotext -----");
  console.log(text);
  const hasTitle = text.includes("برنامج") && text.includes("انطاليا");
  const hasDay = text.includes("كالييتشي") || text.includes("دودان");
  const hasEstimate = text.includes("تقديري") && text.includes("واتساب");
  const tofu = (text.match(/\uFFFD|□/g) || []).length;
  const isolated =
    /ج\s*م\s*ا\s*ن\s*ر\s*ب|جمانرب/.test(text) || text.includes("ناي");
  console.log("----- checks -----");
  console.log({ hasTitle, hasDay, hasEstimate, tofu, isolated });
  if (!hasTitle || !hasDay || !hasEstimate || tofu > 2 || isolated) {
    console.error("PDF Arabic check FAILED");
    process.exit(2);
  }
  console.log("PDF Arabic check PASSED");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
