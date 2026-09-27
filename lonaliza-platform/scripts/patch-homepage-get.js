const fs = require("fs");
const p = "src/data/homepage.ts";
let s = fs.readFileSync(p, "utf8");
const hadCRLF = s.includes("\r\n");
s = s.replace(/\r\n/g, "\n");

// Update getHomepageContent to seed v2 and drop legacy
const oldFn = `export function getHomepageContent(): HomepageContent {
  if (typeof window === "undefined") return defaultHomepageContent;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    save(defaultHomepageContent);
    return defaultHomepageContent;
  }
  try {
    return normalizeHomepage(JSON.parse(raw));
  } catch {
    return defaultHomepageContent;
  }
}`;

const newFn = `export function getHomepageContent(): HomepageContent {
  if (typeof window === "undefined") return defaultHomepageContent;
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    save(defaultHomepageContent);
    return defaultHomepageContent;
  }
  try {
    const parsed = normalizeHomepage(JSON.parse(raw));
    // Force Turkey destinations if stale non-Turkey content was saved under v2
    const hasNonTurkey = parsed.destinations.some(
      (d) =>
        /dubai|maldives|bali|thailand|uae/i.test(d.nameEn) ||
        /dubai|maldives|bali|thailand|uae/i.test(d.href || "")
    );
    if (hasNonTurkey || (parsed.version || 0) < 2) {
      save(defaultHomepageContent);
      return defaultHomepageContent;
    }
    return parsed;
  } catch {
    return defaultHomepageContent;
  }
}`;

if (!s.includes(oldFn)) {
  console.log("oldFn not found exactly - trying softer patch");
  if (!s.includes("LEGACY_STORAGE_KEY")) {
    console.log("LEGACY key missing!");
  }
  if (!s.includes("removeItem(LEGACY_STORAGE_KEY)")) {
    s = s.replace(
      "export function getHomepageContent(): HomepageContent {\n  if (typeof window === \"undefined\") return defaultHomepageContent;\n  const raw = localStorage.getItem(STORAGE_KEY);",
      "export function getHomepageContent(): HomepageContent {\n  if (typeof window === \"undefined\") return defaultHomepageContent;\n  try { localStorage.removeItem(LEGACY_STORAGE_KEY); } catch { /* ignore */ }\n  const raw = localStorage.getItem(STORAGE_KEY);"
    );
  }
} else {
  s = s.replace(oldFn, newFn);
}

// CTA Turkey copy
s = s.replace(
  "Ready for your next adventure?",
  "Ready for your Turkey adventure?"
);
s = s.replace(
  "هل أنت مستعد لمغامرتك التالية؟",
  "هل أنت مستعد لرحلتك في تركيا؟"
);
s = s.replace(
  "destinationsTitleAr: \"وجهات مميزة\"",
  "destinationsTitleAr: \"مدن تركيا\""
);
s = s.replace(
  "destinationsTitleEn: \"Featured Destinations\"",
  "destinationsTitleEn: \"Turkey Cities\""
);

if (hadCRLF) s = s.replace(/\n/g, "\r\n");
fs.writeFileSync(p, s);
console.log("patched", s.includes("removeItem(LEGACY_STORAGE_KEY)"));
