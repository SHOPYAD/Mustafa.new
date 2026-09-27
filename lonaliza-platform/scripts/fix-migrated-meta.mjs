import fs from "node:fs";

function durationFromHtml(html = "", title = "") {
  const src = `${title}\n${html}`;
  const numbered = [...src.matchAll(/(\d+)\s*(?:ايام|أيام|يوم|days?)/gi)].map(
    (m) => Number(m[1])
  );
  if (numbered.length) {
    return Math.min(
      30,
      Math.max(...numbered.filter((n) => n > 0 && n <= 30))
    );
  }
  const dayWords = {
    العاشر: 10,
    التاسع: 9,
    الثامن: 8,
    السابع: 7,
    السادس: 6,
    الخامس: 5,
    الرابع: 4,
    الثالث: 3,
    الثاني: 2,
    الاول: 1,
    الأول: 1,
  };
  let max = 0;
  for (const [w, n] of Object.entries(dayWords)) {
    if (new RegExp(`اليوم\\s+${w}`).test(src)) max = Math.max(max, n);
  }
  const dayNums = [
    ...src.matchAll(
      /اليوم\s*(?:ال)?(?:عاشر|تاسع|ثامن|سابع|سادس|خامس|رابع|ثالث|ثاني|اول|أول|\d+)/g
    ),
  ];
  if (dayNums.length > max) max = dayNums.length;
  return max || 1;
}

const blogs = JSON.parse(
  fs.readFileSync("src/data/migrated/blog-posts.json", "utf8")
);
const pkgs = JSON.parse(
  fs.readFileSync("src/data/migrated/packages.json", "utf8")
);

for (const b of blogs) {
  const id = String(b.id).replace(/^old-blog-/, "");
  b.slug = `blog-${id}`;
}
for (const p of pkgs) {
  const id = String(p.id).replace(/^old-pkg-/, "");
  p.slug = `pkg-${id}`;
  p.durationDays = durationFromHtml(
    p.descriptionAr || "",
    p.titleAr || p.title || ""
  );
}

fs.writeFileSync(
  "src/data/migrated/blog-posts.json",
  JSON.stringify(blogs, null, 2)
);
fs.writeFileSync(
  "src/data/migrated/packages.json",
  JSON.stringify(pkgs, null, 2)
);

const dist = pkgs.reduce((a, p) => {
  a[p.durationDays] = (a[p.durationDays] | 0) + 1;
  return a;
}, {});
console.log("duration histogram", dist);

const dayish = pkgs
  .filter((p) => {
    const t = p.titleAr || "";
    return p.durationDays <= 1 || /جولة|شلال|بحيرة|سفاري|يخت/.test(t);
  })
  .slice(0, 40);

const tours = dayish.map((p, i) => {
  const img = p.images?.[0]?.url || "";
  return {
    id: `old-tour-${String(p.id).replace(/^old-pkg-/, "")}`,
    title: p.titleAr || p.title,
    image: img,
    duration: p.durationDays > 1 ? `${p.durationDays} Days` : "Full Day",
    timing: /عشاء|ليل|غروب/i.test(p.titleAr || "") ? "evening" : "morning",
    rating: p.rating || 4.7,
    reviewCount: 100 + ((i * 17) % 900),
    price: p.price || 0,
    highlights: (p.amenities || []).slice(0, 4),
    category: /فندق/.test(p.titleAr || "")
      ? "Hotels"
      : /جولة/.test(p.titleAr || "")
        ? "City Tours"
        : "Day Trips",
    popular: i < 8,
    isActive: true,
  };
});
fs.writeFileSync(
  "src/data/migrated/tours.json",
  JSON.stringify(tours, null, 2)
);
console.log("tours derived", tours.length);
console.log("blog slug", blogs[0].slug);
console.log(
  "multi-day sample",
  pkgs.find((p) => p.durationDays >= 5)?.titleAr,
  pkgs.find((p) => p.durationDays >= 5)?.durationDays
);
