#!/usr/bin/env node
/**
 * Import airline names + logo URLs into `.data/airlines/`.
 * Sources (public):
 * - amannuhman/airlines-and-logos (IATA names)
 * - imgmongelli/airlines-logos-dataset (ICAO logo filenames)
 * Logo CDN fallback: images.kiwi.com (IATA-based)
 */

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const OUT_DIR = path.join(ROOT, ".data", "airlines");

const SOURCES = {
  namesUrl: "https://raw.githubusercontent.com/amannuhman/airlines-and-logos/main/data/airlines.json",
  logosUrl: "https://raw.githubusercontent.com/imgmongelli/airlines-logos-dataset/master/airlines.json",
  logosBase: "https://raw.githubusercontent.com/imgmongelli/airlines-logos-dataset/master",
  kiwiCdn: "https://images.kiwi.com/airlines/64",
};

function fold(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/İ/g, "i")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function kiwiLogo(iata) {
  const code = String(iata || "").trim().toUpperCase();
  if (!/^[A-Z0-9]{2,3}$/.test(code)) return "";
  return `${SOURCES.kiwiCdn}/${code}.png`;
}

function githubLogo(relative) {
  const rel = String(relative || "").replace(/^\.\//, "");
  if (!rel || rel === "null") return "";
  return `${SOURCES.logosBase}/${rel}`;
}

async function fetchJson(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  if (!res.ok) throw new Error(`fetch failed ${url}: ${res.status}`);
  return res.json();
}

async function main() {
  const [namesRaw, logosRaw] = await Promise.all([
    fetchJson(SOURCES.namesUrl),
    fetchJson(SOURCES.logosUrl),
  ]);

  const logosByIata = new Map();
  const logosByIcao = new Map();
  const logoRows = Array.isArray(logosRaw?.data) ? logosRaw.data : [];
  for (const row of logoRows) {
    const iata = String(row.iata_code || "").trim().toUpperCase();
    const icao = String(row.icao_code || "").trim().toUpperCase();
    const logoUrl = githubLogo(row.logo) || (iata ? kiwiLogo(iata) : "");
    if (iata && logoUrl) logosByIata.set(iata, logoUrl);
    if (icao && logoUrl) logosByIcao.set(icao, logoUrl);
  }

  const names = Array.isArray(namesRaw) ? namesRaw : [];
  const byIata = new Map();

  for (const row of names) {
    const iata = String(row.iata || "").trim().toUpperCase();
    if (!iata) continue;
    const icao = String(row.icao || "").trim().toUpperCase();
    const name = String(row.name || "").trim();
    const logoUrl =
      logosByIata.get(iata) ||
      (icao ? logosByIcao.get(icao) : "") ||
      kiwiLogo(iata);
    byIata.set(iata, {
      iata,
      icao,
      name,
      country: String(row.country || "").trim(),
      logoUrl,
      aliases: [...new Set([fold(name), fold(name).replace(/\s+airlines?$/i, "")].filter(Boolean))],
    });
  }

  // Ensure common Middle East / Turkey carriers used in live search
  const extras = [
    { iata: "PC", icao: "PGT", name: "Pegasus Airlines", country: "Turkey" },
    { iata: "XY", icao: "KNE", name: "Flynas", country: "Saudi Arabia" },
    { iata: "F3", icao: "FAD", name: "flyadeal", country: "Saudi Arabia" },
    { iata: "SV", icao: "SVA", name: "Saudia", country: "Saudi Arabia" },
    { iata: "TK", icao: "THY", name: "Turkish Airlines", country: "Turkey" },
    { iata: "EK", icao: "UAE", name: "Emirates", country: "United Arab Emirates" },
    { iata: "QR", icao: "QTR", name: "Qatar Airways", country: "Qatar" },
    { iata: "FZ", icao: "FDB", name: "flydubai", country: "United Arab Emirates" },
  ];
  for (const row of extras) {
    if (byIata.has(row.iata)) continue;
    byIata.set(row.iata, {
      ...row,
      logoUrl: kiwiLogo(row.iata),
      aliases: [fold(row.name)],
    });
  }

  const airlines = Array.from(byIata.values()).sort((a, b) => a.iata.localeCompare(b.iata));
  const meta = {
    source: "amannuhman/airlines-and-logos + imgmongelli/airlines-logos-dataset",
    sourceUrls: [SOURCES.namesUrl, SOURCES.logosUrl],
    importedAt: new Date().toISOString(),
    airlineCount: airlines.length,
  };

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(path.join(OUT_DIR, "airlines.json"), JSON.stringify(airlines));
  await fs.writeFile(path.join(OUT_DIR, "meta.json"), JSON.stringify(meta, null, 2));
  console.log(`Imported ${airlines.length} airlines → ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
