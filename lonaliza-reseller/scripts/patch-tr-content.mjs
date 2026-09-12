import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "src");

const typesPath = path.join(root, "lib/i18n/types.ts");
let types = fs.readFileSync(typesPath, "utf8");
types = types.replace(/\nsearchTabs:/g, "\n    searchTabs:");
fs.writeFileSync(typesPath, types);

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === "node_modules" || ent.name === ".next") continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, files);
    else if (/\.(tsx?|jsx?)$/.test(ent.name)) files.push(p);
  }
  return files;
}

const files = walk(root);
let changed = 0;
for (const f of files) {
  let src = fs.readFileSync(f, "utf8");
  const orig = src;

  src = src.replace(
    /locale === ["']ar["']\s*\?\s*([a-zA-Z0-9_?.[\]]+\.(?:[a-zA-Z0-9_]+Ar))\s*:\s*([a-zA-Z0-9_?.[\]]+\.(?:[a-zA-Z0-9_]+En))/g,
    '(locale === "ar" || locale === "tr") ? $1 : $2'
  );

  src = src.replace(
    /locale === ["']ar["']\s*\?\s*([a-zA-Z0-9_?.[\]]+\wAr(?:\s*\|\|\s*\[\])?)\s*:\s*([a-zA-Z0-9_?.[\]]+\wEn(?:\s*\|\|\s*\[\])?)/g,
    '(locale === "ar" || locale === "tr") ? $1 : $2'
  );

  src = src.replace(
    /locale === ["']ar["']\s*\?\s*["']ar-AE["']\s*:\s*["']en-(?:US|GB)["']/g,
    'locale === "ar" ? "ar-AE" : locale === "tr" ? "tr-TR" : "en-GB"'
  );

  src = src.replace(
    /locale === ["']ar["']\s*&&\s*([a-zA-Z0-9_?.]+)\.amenitiesAr/g,
    '(locale === "ar" || locale === "tr") && $1.amenitiesAr'
  );

  if (src !== orig) {
    fs.writeFileSync(f, src);
    changed++;
    console.log("patched", path.relative(root, f));
  }
}
console.log("files changed", changed);
