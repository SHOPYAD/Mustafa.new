import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

for (const script of [
  "generate-hotel-real-part2.mjs",
  "_gen-part2-chunk2.mjs",
  "_gen-part2-chunk3.mjs",
  "_gen-part2-chunk4.mjs",
]) {
  const r = spawnSync(process.execPath, [path.join(__dirname, script)], { encoding: "utf8" });
  process.stdout.write(r.stdout || "");
  process.stderr.write(r.stderr || "");
  if (r.status !== 0) process.exit(r.status || 1);
}

const c1 = JSON.parse(fs.readFileSync(path.join(__dirname, "_part2-chunk1.json"), "utf8"));
const c2 = JSON.parse(fs.readFileSync(path.join(__dirname, "_part2-chunk2.json"), "utf8"));
const c3 = JSON.parse(fs.readFileSync(path.join(__dirname, "_part2-chunk3.json"), "utf8"));
const c4 = JSON.parse(fs.readFileSync(path.join(__dirname, "_part2-chunk4.json"), "utf8"));
const all = [...c1, ...c2, ...c3, ...c4];

const expected = [
  "four-seasons-bosphorus","shangri-la-bosphorus","peninsula-istanbul","swissotel-the-bosphorus",
  "cvk-park-bosphorus","pera-palace-hotel","ritz-carlton-istanbul","ajia-hotel-istanbul",
  "rixos-premium-belek","maxx-royal-kemer","akra-antalya","calista-luxury-resort",
  "regnum-carya","museum-hotel-cappadocia","argos-in-cappadocia","kayakapi-premium-caves",
  "cappadocia-cave-resort","zorlu-grand-trabzon","novotel-trabzon","radisson-blu-trabzon",
  "swissotel-uludag-bursa","kervansaray-bursa","holiday-inn-bursa","richmond-nua-wellness-spa",
  "ng-sapanca-wellness","ng-sapanca-enjoy","ayder-paradise-otel","yesilvadi",
];

const slugs = all.map((h) => h.slug);
if (slugs.length !== 28) {
  console.error("Expected 28, got", slugs.length, slugs);
  process.exit(1);
}
for (let i = 0; i < expected.length; i++) {
  if (slugs[i] !== expected[i]) {
    console.error("Order mismatch at", i, "want", expected[i], "got", slugs[i]);
    process.exit(1);
  }
}

const out = path.join(__dirname, "hotel-real-curated-part2.json");
fs.writeFileSync(out, JSON.stringify(all, null, 2));
const full = all.filter((h) => h.dataCompleteness === "full").length;
const partial = all.filter((h) => h.dataCompleteness === "partial").length;
console.log("Wrote", out);
console.log("hotels", all.length, "| full", full, "| partial", partial);
