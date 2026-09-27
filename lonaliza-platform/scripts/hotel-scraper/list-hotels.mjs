import fs from "fs";
const t = fs.readFileSync("src/data/hotels.ts", "utf8");
const re =
  /slug: "([^"]+)",\s*\n\s*nameAr: "([^"]+)",\s*\n\s*nameEn: "([^"]+)",\s*\n\s*city: "([^"]+)"/g;
let m;
while ((m = re.exec(t))) {
  console.log(`${m[1]}\t${m[3]}\t${m[4]}`);
}
