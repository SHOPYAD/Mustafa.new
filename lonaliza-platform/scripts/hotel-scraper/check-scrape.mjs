import fs from "fs";
const p = "src/data/scraping/hotels/booking-real.json";
if (!fs.existsSync(p)) {
  console.log("missing");
  process.exit(0);
}
const j = JSON.parse(fs.readFileSync(p, "utf8"));
const k = Object.keys(j);
let withDesc = 0;
let withReviews = 0;
let home = 0;
for (const x of k) {
  if ((j[x].description || "").length > 50) withDesc++;
  if ((j[x].reviews || []).length > 0) withReviews++;
  if (j[x].isHome) home++;
}
console.log(
  JSON.stringify({ hotels: k.length, withDesc, withReviews, homeRedirects: home }, null, 2)
);
