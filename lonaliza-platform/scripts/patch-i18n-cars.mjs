import fs from "fs";
import path from "path";

const root = path.resolve("src/lib/i18n");

function patchTypes() {
  const p = path.join(root, "types.ts");
  let c = fs.readFileSync(p, "utf8");
  if (!c.includes("cars: string")) {
    c = c.replace(
      /tours: string;\n(\s+)insurance: string;/,
      "tours: string;\n$1cars: string;\n$1insurance: string;"
    );
  }
  if (!c.includes("time: string")) {
    c = c.replace(
      /date: string;\n(\s+)guests: string;/,
      "date: string;\n$1time: string;\n$1guests: string;"
    );
  }
  if (!c.includes("dailyTour: string")) {
    c = c.replace(
      /multiCity: string;\n(\s+)trustSecure: string;/,
      "multiCity: string;\n$1dailyTour: string;\n$1dailyTourHint: string;\n$1trustSecure: string;"
    );
  }
  fs.writeFileSync(p, c);
  console.log("types ok");
}

function patchDict(file, cars, time, dailyTour, dailyTourHint) {
  const p = path.join(root, "dictionaries", file);
  let c = fs.readFileSync(p, "utf8");
  if (!c.includes('cars:')) {
    c = c.replace(
      /tours: "([^"]*)",\n(\s+)insurance:/,
      `tours: "$1",\n$2cars: "${cars}",\n$2insurance:`
    );
  }
  if (!c.includes("time:")) {
    c = c.replace(
      /date: "([^"]*)",\n(\s+)guests:/,
      `date: "$1",\n$2time: "${time}",\n$2guests:`
    );
  }
  if (!c.includes("dailyTour:")) {
    c = c.replace(
      /multiCity: "([^"]*)",\n(\s+)trustSecure:/,
      `multiCity: "$1",\n$2dailyTour: "${dailyTour}",\n$2dailyTourHint: "${dailyTourHint}",\n$2trustSecure:`
    );
  }
  fs.writeFileSync(p, c);
  console.log(file, "ok");
}

patchTypes();
patchDict(
  "en.ts",
  "Cars / Transfers",
  "Time",
  "Daily tour",
  "Show private Vito / VIP day tours only"
);
patchDict(
  "ar.ts",
  "السيارات / الترانسفير",
  "الساعة",
  "تور يومي",
  "عرض جولات فيتو / VIP اليومية فقط"
);
patchDict(
  "tr.ts",
  "Araçlar / Transfer",
  "Saat",
  "Günlük tur",
  "Yalnızca özel Vito / VIP günlük turları göster"
);
