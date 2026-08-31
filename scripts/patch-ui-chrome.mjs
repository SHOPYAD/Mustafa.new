import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "src");

const replacements = [
  // DestinationMap
  {
    file: "components/home/DestinationMap.tsx",
    pairs: [
      ['{locale === "ar" ? "خريطة تركيا" : "Turkey map"}', "{t.admin.turkeyMap}"],
      ['{locale === "ar" ? "استكشف مدن تركيا" : "Explore Turkey cities"}', "{t.admin.exploreTurkeyCities}"],
    ],
  },
  {
    file: "components/home/BlogSection.tsx",
    pairs: [
      ['{locale === "ar" ? "اقرأ المزيد" : "Read More"}', "{t.admin.readMoreShort}"],
    ],
  },
  {
    file: "components/home/HeroAwwwards.tsx",
    pairs: [
      ['(locale === "ar" ? "استكشف الباقات" : "Explore Packages")', "(t.admin.explorePackages)"],
    ],
  },
  {
    file: "components/home/DestinationsShowcase.tsx",
    pairs: [
      ['(locale === "ar" ? "مدن تركيا مع الريان" : "Turkey cities with Alrayyan")', "(t.admin.turkeyCitiesWith)"],
    ],
  },
  {
    file: "app/(site)/ai-chat/page.tsx",
    pairs: [
      ['{locale === "ar" ? "الريان للسياحة" : "Alrayyan Tourism"}', "{t.admin.brandName}"],
    ],
  },
  {
    file: "components/chat/SalesOfferCards.tsx",
    pairs: [
      ['{locale === "ar" ? "طيران" : "Flight"}', "{t.admin.flightLabel}"],
    ],
  },
  {
    file: "app/(site)/package/[slug]/page.tsx",
    pairs: [
      ['{locale === "ar" ? "التوفر" : "Availability"}', "{t.admin.availability}"],
      ['{locale === "ar" ? "متاح" : "Available"}', "{t.admin.available}"],
    ],
  },
  {
    file: "app/(site)/transfers/[slug]/page.tsx",
    pairs: [
      ['{locale === "ar" ? "المسار" : "Route"}', "{t.admin.route}"],
      ['{locale === "ar" ? "برنامج الجولة" : "Tour program"}', "{t.admin.tourProgram}"],
      ['{locale === "ar" ? "خريطة المسار" : "Route map"}', "{t.admin.routeMap}"],
      ['{locale === "ar" ? "السائق" : "Driver"}', "{t.admin.driver}"],
      ['{locale === "ar" ? "أبرز المميزات" : "Highlights"}', "{t.admin.highlights}"],
      ['{locale === "ar" ? "يشمل" : "Includes"}', "{t.admin.includes}"],
      ['{locale === "ar" ? "لا يشمل" : "Not included"}', "{t.admin.notIncluded}"],
      ['{locale === "ar" ? "نصائح" : "Tips"}', "{t.admin.tips}"],
      ['{locale === "ar" ? "آراء العملاء" : "Guest reviews"}', "{t.admin.guestReviews}"],
      ['{locale === "ar" ? "من" : "From"}', "{t.common.from}"],
    ],
  },
  {
    file: "app/(site)/search/page.tsx",
    pairs: [
      ['${totalResults} ${locale === "ar" ? "نتيجة" : "results"}', "${totalResults} ${t.admin.results}"],
    ],
  },
  {
    file: "app/api/gemini/sales-chat/route.ts",
    pairs: [
      [
        'Preferred reply language: ${locale === "ar" ? "Arabic" : "English"}.',
        'Preferred reply language: ${locale === "ar" ? "Arabic" : locale === "tr" ? "Turkish" : "English"}.',
      ],
    ],
  },
];

for (const item of replacements) {
  const p = path.join(root, item.file);
  let src = fs.readFileSync(p, "utf8");
  let n = 0;
  for (const [from, to] of item.pairs) {
    if (src.includes(from)) {
      src = src.split(from).join(to);
      n++;
    } else {
      console.log("MISS", item.file, from.slice(0, 60));
    }
  }
  fs.writeFileSync(p, src);
  console.log(item.file, "replacements", n);
}

// SalesChatPanel: use dictionary templates
const chatPath = path.join(root, "components/chat/SalesChatPanel.tsx");
let chat = fs.readFileSync(chatPath, "utf8");
chat = chat.replace(
  /\{locale === "ar" \? `اليوم \$\{d\.day\}` : `Day \$\{d\.day\}`\}/g,
  '{t.admin.dayLabel.replace("{n}", String(d.day))}'
);
chat = chat.replace(
  /\{locale === "ar" \? "الإجمالي" : "Total"\}/g,
  "{t.admin.totalLabel}"
);
chat = chat.replace(
  /locale === "ar" \? "العروض:" : "Offers:"/g,
  "t.admin.offersLabel"
);
chat = chat.replace(
  /locale === "ar" \? "البرنامج" : "Itinerary"/g,
  "t.admin.itineraryLabel"
);
chat = chat.replace(
  /`\$\{locale === "ar" \? "الإجمالي" : "Total"\}: \$\{formatPrice/g,
  '`${t.admin.totalLabel}: ${formatPrice'
);
fs.writeFileSync(chatPath, chat);
console.log("SalesChatPanel patched");
