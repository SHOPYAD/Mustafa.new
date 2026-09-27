import type {
  CreateScraperJobInput,
  ScraperJob,
  ScrapedBusinessLead,
} from "./types";
import {
  saveJob,
  getJobById,
  getAllJobs,
  upsertLeads,
} from "./reseller-leads-store";

const BASE_URL = process.env.GMAPS_SCRAPER_URL || "http://127.0.0.1:8085";
const USER_AGENT = "lonaliza-scraper-agent/1.0 (https://lonaliza.com)";

// Pre-configured coordinates for popular Middle East & European tourism hubs
const CITY_COORDS_CACHE: Record<string, { lat: string; lon: string; country: string }> = {
  istanbul: { lat: "41.0082", lon: "28.9784", country: "تركيا" },
  إسطنبول: { lat: "41.0082", lon: "28.9784", country: "تركيا" },
  trabzon: { lat: "40.9839", lon: "39.7168", country: "تركيا" },
  طرابزون: { lat: "40.9839", lon: "39.7168", country: "تركيا" },
  antalya: { lat: "36.8969", lon: "30.7133", country: "تركيا" },
  أنطاليا: { lat: "36.8969", lon: "30.7133", country: "تركيا" },
  bursa: { lat: "40.1885", lon: "29.0610", country: "تركيا" },
  بورصة: { lat: "40.1885", lon: "29.0610", country: "تركيا" },
  dubai: { lat: "25.2048", lon: "55.2708", country: "الإمارات" },
  دبي: { lat: "25.2048", lon: "55.2708", country: "الإمارات" },
  riyadh: { lat: "24.7136", lon: "46.6753", country: "السعودية" },
  الرياض: { lat: "24.7136", lon: "46.6753", country: "السعودية" },
  jeddah: { lat: "21.4858", lon: "39.1925", country: "السعودية" },
  جدة: { lat: "21.4858", lon: "39.1925", country: "السعودية" },
  cairo: { lat: "30.0444", lon: "31.2357", country: "مصر" },
  القاهرة: { lat: "30.0444", lon: "31.2357", country: "مصر" },
  doha: { lat: "25.2854", lon: "51.5310", country: "قطر" },
  الدوحة: { lat: "25.2854", lon: "51.5310", country: "قطر" },
  kuwait: { lat: "29.3759", lon: "47.9774", country: "الكويت" },
  الكويت: { lat: "29.3759", lon: "47.9774", country: "الكويت" },
  amman: { lat: "31.9454", lon: "35.9284", country: "الأردن" },
  عمان: { lat: "31.9454", lon: "35.9284", country: "الأردن" },
  manama: { lat: "26.2285", lon: "50.5860", country: "البحرين" },
  المنامة: { lat: "26.2285", lon: "50.5860", country: "البحرين" },
  muscat: { lat: "23.5880", lon: "58.3829", country: "عمان" },
  مسقط: { lat: "23.5880", lon: "58.3829", country: "عمان" },
};

export async function geocodeCity(place: string): Promise<{ lat: string; lon: string; country: string } | null> {
  const clean = place.trim().toLowerCase();
  if (CITY_COORDS_CACHE[clean]) {
    return CITY_COORDS_CACHE[clean];
  }

  // Fallback to OpenStreetMap Nominatim
  try {
    const q = encodeURIComponent(place);
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${q}`, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const data = (await res.json()) as { lat: string; lon: string; display_name?: string }[];
      if (Array.isArray(data) && data.length > 0) {
        const parts = (data[0].display_name || "").split(",");
        const country = parts[parts.length - 1]?.trim() || "غير محدد";
        return { lat: String(data[0].lat), lon: String(data[0].lon), country };
      }
    }
  } catch (err) {
    console.error(`[gmaps-scraper] Geocoding error for "${place}":`, err);
  }

  // Default fallback Istanbul
  return { lat: "41.0082", lon: "28.9784", country: "تركيا" };
}

export function normalizePhoneForWhatsapp(phone: string, defaultCountry = "تركيا"): {
  e164: string;
  hasWhatsapp: boolean;
} {
  if (!phone) return { e164: "", hasWhatsapp: false };
  let digits = phone.replace(/\D/g, "");

  // If starts with 00, replace with nothing
  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  // Handle local Turkish numbers: e.g. 0532xxxxxxx -> 90532xxxxxxx
  if (digits.startsWith("05") && digits.length === 11) {
    digits = "90" + digits.slice(1);
  } else if (digits.startsWith("5") && digits.length === 10 && (defaultCountry.includes("تركيا") || defaultCountry.toLowerCase().includes("turk"))) {
    digits = "90" + digits;
  }

  // Handle local Saudi numbers: e.g. 05xxxxxxx -> 9665xxxxxxx
  if (digits.startsWith("05") && digits.length === 10 && (defaultCountry.includes("سعود") || defaultCountry.toLowerCase().includes("saud"))) {
    digits = "966" + digits.slice(1);
  }

  // Mobile check (length typically 10 to 15 digits)
  const isValidMobile = digits.length >= 10 && digits.length <= 15;
  return { e164: digits, hasWhatsapp: isValidMobile };
}

const SOCIAL_RE = {
  instagram: /https?:\/\/(?:www\.)?instagram\.com\/([A-Za-z0-9_.]+)/i,
  facebook: /https?:\/\/(?:www\.|m\.|web\.)?facebook\.com\/([A-Za-z0-9_.\-]+)/i,
  linkedin: /https?:\/\/(?:[a-z]{2,3}\.)?linkedin\.com\/(?:company|in|school)\/([A-Za-z0-9_.\-%]+)/i,
};

export async function extractSocialsFromWebsite(websiteUrl: string): Promise<{
  instagram?: string;
  facebook?: string;
  linkedin?: string;
}> {
  if (!websiteUrl || !websiteUrl.startsWith("http")) return {};
  try {
    const res = await fetch(websiteUrl, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return {};
    const html = (await res.text()).slice(0, 300_000);
    const out: { instagram?: string; facebook?: string; linkedin?: string } = {};

    const igMatch = html.match(SOCIAL_RE.instagram);
    if (igMatch && !["p", "reel", "explore", "about"].includes(igMatch[1].toLowerCase())) {
      out.instagram = igMatch[0].replace(/\\/g, "").replace(/["']/g, "");
    }

    const fbMatch = html.match(SOCIAL_RE.facebook);
    if (fbMatch && !["sharer", "share.php", "login"].includes(fbMatch[1].toLowerCase())) {
      out.facebook = fbMatch[0].replace(/\\/g, "").replace(/["']/g, "");
    }

    const inMatch = html.match(SOCIAL_RE.linkedin);
    if (inMatch) {
      out.linkedin = inMatch[0].replace(/\\/g, "").replace(/["']/g, "");
    }

    return out;
  } catch {
    return {};
  }
}

export async function checkScraperHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/jobs`, {
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function launchScrapeJob(input: CreateScraperJobInput): Promise<{
  ok: boolean;
  job?: ScraperJob;
  error?: string;
}> {
  const healthy = await checkScraperHealth();
  if (!healthy) {
    return {
      ok: false,
      error: "خدمة السكرابر المحلية غير متصلة عبر المنفذ 8085. تأكد من تشغيل حاوية Docker.",
    };
  }

  // Resolve coordinates
  let lat = input.lat;
  let lon = input.lon;
  let country = input.country || "";

  if (!lat || !lon) {
    const geo = await geocodeCity(input.city || input.keywords[0] || "Istanbul");
    if (geo) {
      lat = geo.lat;
      lon = geo.lon;
      country = country || geo.country;
    }
  }

  if (!lat || !lon) {
    lat = "41.0082";
    lon = "28.9784";
  }

  // Format keywords with location baked in
  const formattedKeywords = input.keywords.map((k) => {
    const clean = k.trim();
    if (input.city && !clean.toLowerCase().includes(input.city.toLowerCase())) {
      return `${clean} in ${input.city}`;
    }
    return clean;
  });

  const payload = {
    name: `job_${Date.now()}`,
    keywords: formattedKeywords,
    lang: input.language || "en",
    lat: String(lat),
    lon: String(lon),
    zoom: 14,
    fast_mode: false,
    radius: input.radius || 15000,
    depth: input.depth || 5,
    email: input.email !== false,
    max_time: input.maxTimeSeconds || 600,
    proxies: input.proxies || [],
  };

  try {
    const res = await fetch(`${BASE_URL}/api/v1/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": USER_AGENT },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { ok: false, error: `فشل إنشاء المهمة في المحرك: (${res.status}) ${errText}` };
    }

    const data = (await res.json()) as { id: string };
    const jobId = data.id;

    const jobRecord: ScraperJob = {
      id: jobId,
      name: payload.name,
      keywords: input.keywords,
      city: input.city,
      country: country || "تركيا",
      lat: String(lat),
      lon: String(lon),
      depth: payload.depth,
      emailEnabled: payload.email,
      socialsEnabled: input.socials !== false,
      radius: payload.radius,
      status: "working",
      progressPercent: 10,
      totalFound: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveJob(jobRecord);

    // Trigger asynchronous background polling
    void pollAndProcessJob(jobId, jobRecord);

    return { ok: true, job: jobRecord };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "خطأ غير متوقع" };
  }
}

export async function pollAndProcessJob(jobId: string, initialJob?: ScraperJob): Promise<void> {
  const maxAttempts = 120; // 120 * 5s = 10 minutes max
  let currentJob = initialJob || getJobById(jobId);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((r) => setTimeout(r, 6000));

    try {
      const res = await fetch(`${BASE_URL}/api/v1/jobs/${jobId}`, {
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) continue;

      const data = (await res.json()) as { Status: string };
      const status = data.Status;

      if (!currentJob) currentJob = getJobById(jobId);
      if (!currentJob) break;

      if (status === "working") {
        const estProgress = Math.min(85, 10 + attempt * 2);
        currentJob.status = "working";
        currentJob.progressPercent = estProgress;
        currentJob.updatedAt = new Date().toISOString();
        saveJob(currentJob);
      } else if (status === "ok") {
        currentJob.status = "ok";
        currentJob.progressPercent = 90;
        saveJob(currentJob);

        // Fetch CSV results
        await downloadAndSaveResults(jobId, currentJob);
        break;
      } else if (status === "failed") {
        currentJob.status = "ok";
        currentJob.progressPercent = 90;
        await downloadAndSaveResults(jobId, currentJob);
        break;
      }
    } catch (err) {
      console.error(`[gmaps-scraper] Polling attempt ${attempt} error for job ${jobId}:`, err);
    }
  }
}

async function downloadAndSaveResults(jobId: string, job: ScraperJob): Promise<void> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/jobs/${jobId}/download`, {
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) {
      job.status = "failed";
      job.error = "تعذر تحميل ملف نتائج الـ CSV من المحرك.";
      saveJob(job);
      return;
    }

    const csvText = await res.text();
    const rows = parseSimpleCsv(csvText);

    const parsedLeads: ScrapedBusinessLead[] = [];

    for (const r of rows) {
      const title = r.title || r.name || "";
      if (!title.trim()) continue;

      const phoneRaw = r.phone || "";
      const { e164, hasWhatsapp } = normalizePhoneForWhatsapp(phoneRaw, job.country);

      let emailsList: string[] = [];
      if (r.emails) {
        emailsList = r.emails
          .split(/[\s,;]+/)
          .map((e: string) => e.trim())
          .filter((e: string) => e.includes("@") && e.length > 5);
      }

      const website = r.website || "";

      parsedLeads.push({
        id: `lead_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
        jobId,
        title,
        category: r.category || "سياحة وسفر",
        address: r.address || "",
        completeAddress: r.complete_address || r.address || "",
        city: job.city,
        country: job.country,
        phone: phoneRaw,
        whatsappPhone: e164,
        hasWhatsapp,
        email: emailsList[0] || "",
        emailsList,
        website,
        reviewRating: parseFloat(r.review_rating) || 0,
        reviewCount: parseInt(r.review_count, 10) || 0,
        placeId: r.place_id || r.cid || `${title}_${job.city}`,
        cid: r.cid || "",
        latitude: r.latitude || "",
        longitude: r.longitude || "",
        thumbnail: r.thumbnail || "",
        images: r.images ? r.images.split(",").map((s: string) => s.trim()) : [],
        outreachStatus: "new",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Optional social enrichment if website exists
    if (job.socialsEnabled && parsedLeads.length > 0) {
      // Enrich first 25 businesses in parallel to keep turnaround fast
      const toEnrich = parsedLeads.filter((l) => l.website).slice(0, 30);
      await Promise.allSettled(
        toEnrich.map(async (lead) => {
          const socials = await extractSocialsFromWebsite(lead.website);
          if (socials.instagram) lead.instagram = socials.instagram;
          if (socials.facebook) lead.facebook = socials.facebook;
          if (socials.linkedin) lead.linkedin = socials.linkedin;
        })
      );
    }

    const { added, updated } = upsertLeads(parsedLeads);

    job.progressPercent = 100;
    job.totalFound = parsedLeads.length;
    job.status = "ok";
    job.updatedAt = new Date().toISOString();
    saveJob(job);

    console.log(`[gmaps-scraper] Job ${jobId} finished: ${parsedLeads.length} leads extracted (${added} added, ${updated} updated).`);
  } catch (err) {
    console.error(`[gmaps-scraper] Error in downloadAndSaveResults for ${jobId}:`, err);
    job.status = "failed";
    job.error = err instanceof Error ? err.message : "خطأ أثناء معالجة النتائج";
    saveJob(job);
  }
}

/** Lightweight robust RFC 4180 CSV parser */
function parseSimpleCsv(text: string): Record<string, string>[] {
  const lines: string[] = [];
  let row = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      inQuotes = !inQuotes;
      row += c;
    } else if (c === "\n" && !inQuotes) {
      lines.push(row);
      row = "";
    } else {
      row += c;
    }
  }
  if (row.trim()) lines.push(row);

  if (lines.length === 0) return [];

  const parseLine = (l: string): string[] => {
    const cols: string[] = [];
    let cur = "";
    let q = false;
    for (let i = 0; i < l.length; i++) {
      const ch = l[i];
      if (ch === '"') {
        if (q && l[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          q = !q;
        }
      } else if (ch === "," && !q) {
        cols.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    cols.push(cur.trim());
    return cols;
  };

  const header = parseLine(lines[0]);
  const results: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseLine(lines[i]);
    const obj: Record<string, string> = {};
    for (let h = 0; h < header.length; h++) {
      obj[header[h]] = values[h] || "";
    }
    results.push(obj);
  }

  return results;
}
