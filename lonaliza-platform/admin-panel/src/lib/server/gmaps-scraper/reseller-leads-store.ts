import * as fs from "fs";
import * as path from "path";
import type {
  ScraperJob,
  ScrapedBusinessLead,
  B2BMarketingTemplate,
  B2BCampaign,
  LeadsFilterOptions,
} from "./types";
import { DEFAULT_WHATSAPP_TEMPLATES, DEFAULT_EMAIL_TEMPLATES } from "./templates-library";

const DATA_DIR = path.join(process.cwd(), ".data", "reseller-leads");
const LEADS_FILE = path.join(DATA_DIR, "leads.json");
const JOBS_FILE = path.join(DATA_DIR, "jobs.json");
const TEMPLATES_FILE = path.join(DATA_DIR, "templates.json");
const CAMPAIGNS_FILE = path.join(DATA_DIR, "campaigns.json");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    ensureDir();
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), "utf-8");
      return fallback;
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`[reseller-leads-store] Error reading ${filePath}:`, err);
    return fallback;
  }
}

function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    ensureDir();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error(`[reseller-leads-store] Error writing ${filePath}:`, err);
  }
}

// ── LEADS OPERATIONS ──────────────────────────────────────────────

export function getAllLeads(): ScrapedBusinessLead[] {
  return readJsonFile<ScrapedBusinessLead[]>(LEADS_FILE, []);
}

export function saveLeads(leads: ScrapedBusinessLead[]): void {
  writeJsonFile(LEADS_FILE, leads);
}

export function upsertLeads(newLeads: ScrapedBusinessLead[]): { added: number; updated: number } {
  const existing = getAllLeads();
  let added = 0;
  let updated = 0;

  // Build lookup keys
  const map = new Map<string, ScrapedBusinessLead>();
  for (const l of existing) {
    const key = l.placeId || (l.whatsappPhone ? `phone_${l.whatsappPhone}` : `title_${l.title.toLowerCase()}_${l.city.toLowerCase()}`);
    map.set(key, l);
  }

  for (const lead of newLeads) {
    const key = lead.placeId || (lead.whatsappPhone ? `phone_${lead.whatsappPhone}` : `title_${lead.title.toLowerCase()}_${lead.city.toLowerCase()}`);
    if (map.has(key)) {
      const old = map.get(key)!;
      // Merge smartly preserving outreach status and manual notes
      map.set(key, {
        ...lead,
        id: old.id,
        outreachStatus: old.outreachStatus || lead.outreachStatus,
        notes: old.notes || lead.notes,
        lastContactedAt: old.lastContactedAt || lead.lastContactedAt,
        tags: Array.from(new Set([...(old.tags || []), ...(lead.tags || [])])),
        updatedAt: new Date().toISOString(),
      });
      updated++;
    } else {
      map.set(key, lead);
      added++;
    }
  }

  const merged = Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  saveLeads(merged);
  return { added, updated };
}

export function deleteLead(leadId: string): boolean {
  const existing = getAllLeads();
  const filtered = existing.filter((l) => l.id !== leadId);
  if (filtered.length !== existing.length) {
    saveLeads(filtered);
    return true;
  }
  return false;
}

export function deleteLeadsBatch(leadIds: string[]): number {
  const idSet = new Set(leadIds);
  const existing = getAllLeads();
  const filtered = existing.filter((l) => !idSet.has(l.id));
  const count = existing.length - filtered.length;
  if (count > 0) {
    saveLeads(filtered);
  }
  return count;
}

export function filterLeads(options: LeadsFilterOptions = {}): {
  leads: ScrapedBusinessLead[];
  total: number;
} {
  let list = getAllLeads();

  if (options.search) {
    const q = options.search.toLowerCase().trim();
    list = list.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q) ||
        l.country.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q)
    );
  }

  if (options.country) {
    list = list.filter((l) => l.country.toLowerCase() === options.country!.toLowerCase());
  }

  if (options.city) {
    list = list.filter((l) => l.city.toLowerCase() === options.city!.toLowerCase());
  }

  if (options.category) {
    list = list.filter((l) => l.category.toLowerCase().includes(options.category!.toLowerCase()));
  }

  if (typeof options.minRating === "number" && options.minRating > 0) {
    list = list.filter((l) => l.reviewRating >= options.minRating!);
  }

  if (options.hasPhone) {
    list = list.filter((l) => Boolean(l.phone && l.phone.length > 5));
  }

  if (options.hasWhatsapp) {
    list = list.filter((l) => Boolean(l.hasWhatsapp && l.whatsappPhone));
  }

  if (options.hasEmail) {
    list = list.filter((l) => Boolean(l.email && l.email.includes("@")));
  }

  if (options.hasWebsite) {
    list = list.filter((l) => Boolean(l.website && l.website.startsWith("http")));
  }

  if (options.hasSocials) {
    list = list.filter((l) => Boolean(l.instagram || l.facebook || l.linkedin));
  }

  if (options.outreachStatus) {
    list = list.filter((l) => l.outreachStatus === options.outreachStatus);
  }

  if (options.jobId) {
    list = list.filter((l) => l.jobId === options.jobId);
  }

  const total = list.length;
  const offset = options.offset || 0;
  const limit = options.limit || 50;
  const paginated = list.slice(offset, offset + limit);

  return { leads: paginated, total };
}

export function updateLeadOutreachStatus(
  leadId: string,
  status: ScrapedBusinessLead["outreachStatus"],
  notes?: string
): ScrapedBusinessLead | null {
  const list = getAllLeads();
  const index = list.findIndex((l) => l.id === leadId);
  if (index === -1) return null;

  const current = list[index];
  current.outreachStatus = status;
  current.updatedAt = new Date().toISOString();
  if (notes) current.notes = notes;
  if (status.startsWith("contacted_")) {
    current.lastContactedAt = new Date().toISOString();
  }

  list[index] = current;
  saveLeads(list);
  return current;
}

export function getLeadsStatistics(): {
  totalLeads: number;
  totalWithWhatsapp: number;
  totalWithEmail: number;
  totalWithWebsite: number;
  totalWithSocials: number;
  totalContacted: number;
  totalQualified: number;
  citiesCount: Record<string, number>;
  categoriesCount: Record<string, number>;
} {
  const list = getAllLeads();
  const citiesCount: Record<string, number> = {};
  const categoriesCount: Record<string, number> = {};

  let totalWithWhatsapp = 0;
  let totalWithEmail = 0;
  let totalWithWebsite = 0;
  let totalWithSocials = 0;
  let totalContacted = 0;
  let totalQualified = 0;

  for (const l of list) {
    if (l.hasWhatsapp && l.whatsappPhone) totalWithWhatsapp++;
    if (l.email) totalWithEmail++;
    if (l.website) totalWithWebsite++;
    if (l.instagram || l.facebook || l.linkedin) totalWithSocials++;
    if (l.outreachStatus.startsWith("contacted_") || l.lastContactedAt) totalContacted++;
    if (l.outreachStatus === "qualified" || l.outreachStatus === "converted") totalQualified++;

    const cityKey = l.city || "غير محدد";
    citiesCount[cityKey] = (citiesCount[cityKey] || 0) + 1;

    const catKey = l.category || "أخرى";
    categoriesCount[catKey] = (categoriesCount[catKey] || 0) + 1;
  }

  return {
    totalLeads: list.length,
    totalWithWhatsapp,
    totalWithEmail,
    totalWithWebsite,
    totalWithSocials,
    totalContacted,
    totalQualified,
    citiesCount,
    categoriesCount,
  };
}

// ── JOBS OPERATIONS ──────────────────────────────────────────────

export function getAllJobs(): ScraperJob[] {
  return readJsonFile<ScraperJob[]>(JOBS_FILE, []);
}

export function saveJobs(jobs: ScraperJob[]): void {
  writeJsonFile(JOBS_FILE, jobs);
}

export function saveJob(job: ScraperJob): void {
  const jobs = getAllJobs();
  const index = jobs.findIndex((j) => j.id === job.id);
  if (index >= 0) {
    jobs[index] = job;
  } else {
    jobs.unshift(job);
  }
  saveJobs(jobs);
}

export function getJobById(jobId: string): ScraperJob | null {
  const jobs = getAllJobs();
  return jobs.find((j) => j.id === jobId) || null;
}

export function deleteJob(jobId: string): boolean {
  const jobs = getAllJobs();
  const filtered = jobs.filter((j) => j.id !== jobId);
  if (filtered.length !== jobs.length) {
    saveJobs(filtered);
    return true;
  }
  return false;
}

export function deleteAllJobs(): void {
  saveJobs([]);
}

// ── TEMPLATES OPERATIONS ─────────────────────────────────────────

export function getAllTemplates(): B2BMarketingTemplate[] {
  const initial = [...DEFAULT_WHATSAPP_TEMPLATES, ...DEFAULT_EMAIL_TEMPLATES];
  return readJsonFile<B2BMarketingTemplate[]>(TEMPLATES_FILE, initial);
}

export function saveTemplate(template: B2BMarketingTemplate): void {
  const templates = getAllTemplates();
  const index = templates.findIndex((t) => t.id === template.id);
  if (index >= 0) {
    templates[index] = template;
  } else {
    templates.unshift(template);
  }
  writeJsonFile(TEMPLATES_FILE, templates);
}

export function deleteTemplate(templateId: string): boolean {
  const templates = getAllTemplates();
  const filtered = templates.filter((t) => t.id !== templateId);
  if (filtered.length !== templates.length) {
    writeJsonFile(TEMPLATES_FILE, filtered);
    return true;
  }
  return false;
}

// ── CAMPAIGNS OPERATIONS ─────────────────────────────────────────

export function getAllCampaigns(): B2BCampaign[] {
  return readJsonFile<B2BCampaign[]>(CAMPAIGNS_FILE, []);
}

export function saveCampaign(campaign: B2BCampaign): void {
  const campaigns = getAllCampaigns();
  const index = campaigns.findIndex((c) => c.id === campaign.id);
  if (index >= 0) {
    campaigns[index] = campaign;
  } else {
    campaigns.unshift(campaign);
  }
  writeJsonFile(CAMPAIGNS_FILE, campaigns);
}

// ── EXPORT GENERATORS ────────────────────────────────────────────

export function generateLeadsCsv(leads: ScrapedBusinessLead[]): string {
  const headers = [
    "اسم الشركة",
    "الفئة",
    "الدولة",
    "المدينة",
    "الهاتف",
    "رقم الواتساب",
    "البريد الإلكتروني",
    "الموقع الإلكتروني",
    "التقييم",
    "عدد التقييمات",
    "العنوان الكامل",
    "انستغرام",
    "فيسبوك",
    "لينكدإن",
    "حالة التواصل",
    "ملاحظات",
  ];

  const escapeCsv = (val: unknown) => {
    const s = String(val ?? "").replace(/"/g, '""');
    return `"${s}"`;
  };

  const rows = leads.map((l) => [
    escapeCsv(l.title),
    escapeCsv(l.category),
    escapeCsv(l.country),
    escapeCsv(l.city),
    escapeCsv(l.phone),
    escapeCsv(l.whatsappPhone ? `+${l.whatsappPhone}` : ""),
    escapeCsv(l.email),
    escapeCsv(l.website),
    escapeCsv(l.reviewRating),
    escapeCsv(l.reviewCount),
    escapeCsv(l.address || l.completeAddress),
    escapeCsv(l.instagram),
    escapeCsv(l.facebook),
    escapeCsv(l.linkedin),
    escapeCsv(l.outreachStatus),
    escapeCsv(l.notes),
  ]);

  return "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
}

export function generateLeadsMarkdown(leads: ScrapedBusinessLead[]): string {
  let md = `# تقرير رادار الشركات السياحية (Google Maps Leads)\n\n`;
  md += `**تاريخ الاستخراج:** ${new Date().toLocaleDateString("ar-SA")} | **إجمالي الشركات:** ${leads.length}\n\n`;
  md += `| الشركة | المدينة | الهاتف / واتساب | البريد الإلكتروني | التقييم | الموقع والحسابات |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;

  for (const l of leads) {
    const wa = l.whatsappPhone ? `[واتساب (+${l.whatsappPhone})](https://wa.me/${l.whatsappPhone})` : l.phone || "—";
    const mail = l.email ? `[${l.email}](mailto:${l.email})` : "—";
    const stars = l.reviewRating ? `⭐ ${l.reviewRating} (${l.reviewCount})` : "—";
    const web = l.website ? `[موقع](${l.website})` : "—";
    const socials = [
      l.instagram ? `[IG](${l.instagram})` : "",
      l.facebook ? `[FB](${l.facebook})` : "",
      l.linkedin ? `[IN](${l.linkedin})` : "",
    ].filter(Boolean).join(" ");

    md += `| **${l.title.replace(/\|/g, "-")}** | ${l.city || l.country} | ${wa} | ${mail} | ${stars} | ${web} ${socials} |\n`;
  }

  return md;
}

export function generateLeadsPrintableHtml(leads: ScrapedBusinessLead[]): string {
  const rows = leads
    .map(
      (l, i) => `
    <tr style="border-bottom: 1px solid #e2e8f0; font-size: 12px;">
      <td style="padding: 8px 10px; font-weight: bold; color: #0f172a;">${i + 1}. ${l.title}</td>
      <td style="padding: 8px 10px; color: #475569;">${l.city} - ${l.country}</td>
      <td style="padding: 8px 10px; color: #059669; font-weight: bold;" dir="ltr">${l.whatsappPhone ? "+" + l.whatsappPhone : l.phone || "—"}</td>
      <td style="padding: 8px 10px; color: #2563eb;" dir="ltr">${l.email || "—"}</td>
      <td style="padding: 8px 10px; color: #d97706;">⭐ ${l.reviewRating || "—"} (${l.reviewCount || 0})</td>
      <td style="padding: 8px 10px; color: #64748b;">${l.category || "سياحة"}</td>
    </tr>
  `
    )
    .join("");

  return `
  <!DOCTYPE html>
  <html dir="rtl" lang="ar">
  <head>
    <meta charset="utf-8">
    <title>تقرير رادار الشركات B2B - منصة لوناليزا</title>
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 25px; color: #1e293b; }
      .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f766e; padding-bottom: 15px; margin-bottom: 20px; }
      .title { font-size: 20px; font-weight: 900; color: #0f766e; margin: 0; }
      .meta { font-size: 12px; color: #64748b; }
      table { width: 100%; border-collapse: collapse; text-align: right; }
      th { background-color: #f8fafc; padding: 10px; font-size: 13px; color: #334155; border-bottom: 2px solid #cbd5e1; }
      @media print {
        @page { size: A4 landscape; margin: 15mm; }
        body { margin: 0; }
      }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <h1 class="title">تقرير رادار واستخبارات الشركات السياحية B2B</h1>
        <p class="meta">منصة لوناليزا (Lonaliza Reseller Intelligence Platform)</p>
      </div>
      <div style="text-align: left;">
        <p class="meta"><strong>تاريخ التقرير:</strong> ${new Date().toLocaleDateString("ar-SA")}</p>
        <p class="meta"><strong>عدد الشركات المشمولة:</strong> ${leads.length}</p>
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>اسم المنشأة</th>
          <th>المدينة / الدولة</th>
          <th>الهاتف / واتساب</th>
          <th>البريد الإلكتروني</th>
          <th>التقييم</th>
          <th>التصنيف</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
    <script>window.onload = function() { window.print(); }</script>
  </body>
  </html>
  `;
}
