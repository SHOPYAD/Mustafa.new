import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "lib", "i18n", "dictionaries");

function keys(file) {
  const s = fs.readFileSync(path.join(root, file), "utf8");
  const lines = s.split(/\n/);
  const stack = [];
  const out = [];
  for (const line of lines) {
    const open = line.match(/^(\s*)(\w+):\s*\{/);
    if (open) {
      stack.push(open[2]);
      continue;
    }
    if (/^\s*\},?\s*$/.test(line)) {
      if (stack.length) stack.pop();
      continue;
    }
    const kv = line.match(/^\s*(\w+):\s*"/);
    if (kv) out.push([...stack, kv[1]].join("."));
  }
  return out;
}

const en = keys("en.ts");
const ar = keys("ar.ts");
const tr = keys("tr.ts");
const es = new Set(en);
const as = new Set(ar);
const ts = new Set(tr);
console.log("counts", en.length, ar.length, tr.length);
console.log("missing ar", en.filter((k) => !as.has(k)));
console.log("missing tr", en.filter((k) => !ts.has(k)));
console.log("extra ar", ar.filter((k) => !es.has(k)));
console.log("extra tr", tr.filter((k) => !es.has(k)));
