export const MAX_AUDIENCE_ROWS = 5000;

export type AudiencePerson = {
  email: string;
  name: string;
  company: string;
  locale?: string;
};

export type AudienceRow = AudiencePerson & {
  valid: boolean;
  note: string;
  rawEmail: string;
  locale?: string;
};

export type AudienceParseResult = {
  rows: AudienceRow[];
  validCount: number;
  rejectedCount: number;
  fileName: string;
};

const EMAIL_HEADERS = new Set([
  "email",
  "e mail",
  "e-mail",
  "mail",
  "البريد",
  "البريد الالكتروني",
  "البريد الإلكتروني",
  "الايميل",
  "الإيميل",
  "ايميل",
  "إيميل",
]);

const NAME_HEADERS = new Set([
  "name",
  "full name",
  "fullname",
  "full_name",
  "الاسم",
  "الاسم الكامل",
  "اسم",
  "الاسم الثلاثي",
]);

const FIRST_NAME_HEADERS = new Set(["first name", "firstname", "first_name", "الاسم الاول", "الاسم الأول"]);
const LAST_NAME_HEADERS = new Set(["last name", "lastname", "last_name", "اسم العائلة", "اللقب"]);

const LOCALE_HEADERS = new Set([
  "locale",
  "language",
  "lang",
  "اللغة",
  "لغة",
]);

const COMPANY_HEADERS = new Set([
  "company",
  "company name",
  "company_name",
  "organization",
  "organisation",
  "org",
  "الشركة",
  "اسم الشركة",
  "جهة العمل",
  "المؤسسة",
]);

export function isLikelyEmail(value: string): boolean {
  const email = String(value || "").trim().toLowerCase();
  return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(email);
}

export function sanitizePersonField(value: unknown): string {
  return String(value ?? "")
    .replace(/<[^>]*>/g, "")
    .replace(/[{}]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200);
}

function normHeader(value: string): string {
  return String(value || "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[_./\\-]+/g, " ")
    .replace(/\s+/g, " ");
}

function detectDelimiter(text: string): string {
  const sample = text.slice(0, 4000);
  const firstLine = sample.split(/\r?\n/).find((line) => line.trim()) || "";
  const counts = {
    ",": (firstLine.match(/,/g) || []).length,
    ";": (firstLine.match(/;/g) || []).length,
    "\t": (firstLine.match(/\t/g) || []).length,
  };
  if (counts["\t"] > counts[","] && counts["\t"] >= counts[";"]) return "\t";
  if (counts[";"] > counts[","]) return ";";
  return ",";
}

export function parseCsvTable(raw: string): string[][] {
  const text = String(raw || "").replace(/^\uFEFF/, "");
  if (!text.trim()) return [];
  const delimiter = detectDelimiter(text);
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (!inQuotes && ch === delimiter) {
      row.push(cur.trim());
      cur = "";
      continue;
    }
    if (!inQuotes && (ch === "\n" || ch === "\r")) {
      if (ch === "\r" && text[i + 1] === "\n") i += 1;
      row.push(cur.trim());
      cur = "";
      if (row.some(Boolean)) rows.push(row);
      row = [];
      continue;
    }
    cur += ch;
  }
  row.push(cur.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

type HeaderMap = {
  email: number;
  name: number;
  company: number;
  firstName: number;
  lastName: number;
  locale: number;
};

function headerIndex(headers: string[], aliases: Set<string>): number {
  return headers.findIndex((h) => aliases.has(h));
}

function detectHeaderMap(cells: string[]): HeaderMap | null {
  const headers = cells.map(normHeader);
  const email = headerIndex(headers, EMAIL_HEADERS);
  if (email < 0) return null;
  return {
    email,
    name: headerIndex(headers, NAME_HEADERS),
    company: headerIndex(headers, COMPANY_HEADERS),
    firstName: headerIndex(headers, FIRST_NAME_HEADERS),
    lastName: headerIndex(headers, LAST_NAME_HEADERS),
    locale: headerIndex(headers, LOCALE_HEADERS),
  };
}

function cellAt(row: string[], index: number): string {
  if (index < 0) return "";
  return sanitizePersonField(row[index] || "");
}

function nameFromRow(row: string[], map: HeaderMap): string {
  const direct = cellAt(row, map.name);
  if (direct) return direct;
  const first = cellAt(row, map.firstName);
  const last = cellAt(row, map.lastName);
  return [first, last].filter(Boolean).join(" ").trim();
}

function noteForRow(rawEmail: string, email: string, seen: Set<string>, valid: boolean): string {
  if (!rawEmail) return "لا يوجد بريد";
  if (!valid) return "بريد غير صالح — لن يُرسل";
  if (seen.has(email)) return "بريد مكرر — لن يُرسل مرتين";
  return "";
}

export function normalizeAudienceTable(
  table: string[][],
  fileName = ""
): AudienceParseResult {
  const rows: AudienceRow[] = [];
  if (!table.length) {
    return { rows, validCount: 0, rejectedCount: 0, fileName };
  }

  const headerMap = detectHeaderMap(table[0]);
  const body = headerMap ? table.slice(1) : table;
  const map: HeaderMap = headerMap || {
    email: 0,
    name: 1,
    company: 2,
    firstName: -1,
    lastName: -1,
    locale: -1,
  };

  const seen = new Set<string>();
  for (const cells of body) {
    if (rows.length >= MAX_AUDIENCE_ROWS) break;
    const rawEmail = String(cells[map.email] || "").trim();
    if (!rawEmail && !cells.some((c) => String(c || "").trim())) continue;
    const email = rawEmail.toLowerCase();
    const valid = isLikelyEmail(email);
    const duplicate = valid && seen.has(email);
    const note = noteForRow(rawEmail, email, seen, valid);
    if (valid && !duplicate) seen.add(email);
    rows.push({
      email: valid ? email : rawEmail,
      name: nameFromRow(cells, map),
      company: cellAt(cells, map.company),
      locale: cellAt(cells, map.locale).toLowerCase(),
      valid: valid && !duplicate,
      note,
      rawEmail,
    });
  }

  return {
    rows,
    validCount: rows.filter((r) => r.valid).length,
    rejectedCount: rows.filter((r) => !r.valid).length,
    fileName,
  };
}

export function parseCsvAudienceFile(raw: string, fileName = ""): AudienceParseResult {
  return normalizeAudienceTable(parseCsvTable(raw), fileName);
}

export function validPeopleFromParse(result: AudienceParseResult): AudiencePerson[] {
  return result.rows
    .filter((row) => row.valid)
    .map((row) => ({
      email: row.email,
      name: row.name,
      company: row.company,
      locale: row.locale || "",
    }));
}

export function peopleFromUnknownList(input: unknown): AudiencePerson[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const people: AudiencePerson[] = [];
  for (const item of input) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const email = String(row.email || "")
      .trim()
      .toLowerCase();
    if (!isLikelyEmail(email) || seen.has(email)) continue;
    seen.add(email);
    people.push({
      email,
      name: sanitizePersonField(row.name || row.full_name || ""),
      company: sanitizePersonField(row.company || row.company_name || ""),
      locale: sanitizePersonField(row.locale || row.language || row.lang || "").toLowerCase(),
    });
    if (people.length >= MAX_AUDIENCE_ROWS) break;
  }
  return people;
}
