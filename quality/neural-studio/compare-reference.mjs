import fs from "node:fs";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
const reference = PNG.sync.read(fs.readFileSync("../../docs/neural-studio/references/01-platform-neural-atlas.png"));
const actual = PNG.sync.read(fs.readFileSync("evidence/01-atlas-actual.png"));
if (reference.width !== actual.width || reference.height !== actual.height) throw new Error("Reference and actual capture dimensions differ");
const diff = new PNG({ width: actual.width, height: actual.height });
const changed = pixelmatch(reference.data, actual.data, diff.data, actual.width, actual.height, { threshold: 0, includeAA: true });
const report = {
  reference: "01-platform-neural-atlas.png", actual: "01-atlas-actual.png",
  width: actual.width, height: actual.height, differentPixels: changed,
  totalPixels: actual.width * actual.height, exactMatch: changed === 0,
  interpretation: "Exact pixel equality against original art, not a quality score. No automatic acceptance or baseline replacement.",
  remainingReferenceAudits: 19,
};
fs.writeFileSync("evidence/01-pixel-diff.png", PNG.sync.write(diff));
fs.writeFileSync("evidence/visual-audit.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
if (!report.exactMatch) process.exitCode = 1;
