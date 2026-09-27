import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { buildBuiltinTemplateRecords } from "@/lib/server/email/templates";
import type { EmailTemplateRecord } from "@/lib/server/email/types";

const STORE_FILE = path.join(process.cwd(), ".data", "email-templates.json");

type LocalStore = {
  customs: EmailTemplateRecord[];
};

async function readStore(): Promise<LocalStore> {
  try {
    const raw = await fs.readFile(STORE_FILE, "utf8");
    const parsed = JSON.parse(raw) as { customs?: EmailTemplateRecord[] };
    return { customs: Array.isArray(parsed.customs) ? parsed.customs : [] };
  } catch {
    return { customs: [] };
  }
}

async function writeStore(store: LocalStore): Promise<void> {
  await fs.mkdir(path.dirname(STORE_FILE), { recursive: true });
  await fs.writeFile(STORE_FILE, JSON.stringify(store, null, 2), { mode: 0o600 });
}

export async function listLocalTemplates(): Promise<EmailTemplateRecord[]> {
  const [builtins, store] = await Promise.all([buildBuiltinTemplateRecords(), readStore()]);
  const bySlug = new Map<string, EmailTemplateRecord>();
  for (const row of builtins) bySlug.set(row.slug, row);
  for (const row of store.customs) {
    if (!row.slug) continue;
    bySlug.set(row.slug, { ...row, is_builtin: false });
  }
  return [...bySlug.values()].sort((a, b) =>
    `${a.kind}${a.name}`.localeCompare(`${b.kind}${b.name}`, "ar")
  );
}

export async function getLocalTemplate(id: string): Promise<EmailTemplateRecord | null> {
  const all = await listLocalTemplates();
  const slug = id.startsWith("local:") ? id.slice(6) : "";
  return all.find((row) => row.id === id || row.slug === id || row.slug === slug) || null;
}

export async function saveLocalTemplate(
  input: Partial<EmailTemplateRecord> & { slug: string }
): Promise<EmailTemplateRecord> {
  const store = await readStore();
  const existing = store.customs.find((row) => row.slug === input.slug || row.id === input.id);
  const row: EmailTemplateRecord = {
    id: existing?.id || input.id || `local:${input.slug}`,
    slug: input.slug,
    kind: input.kind || existing?.kind || "custom",
    name: String(input.name || existing?.name || "قالب جديد").trim(),
    subject_ar: input.subject_ar ?? existing?.subject_ar ?? "",
    subject_en: input.subject_en ?? existing?.subject_en ?? "",
    html_ar: input.html_ar ?? existing?.html_ar ?? "",
    html_en: input.html_en ?? existing?.html_en ?? "",
    text_ar: input.text_ar ?? existing?.text_ar ?? "",
    text_en: input.text_en ?? existing?.text_en ?? "",
    is_builtin: false,
    source: input.source || existing?.source || "manual",
    variables: input.variables || existing?.variables || [
      "name",
      "company",
      "bookingId",
      "amount",
    ],
    document: input.document ?? existing?.document,
  };
  store.customs = store.customs.filter((item) => item.slug !== row.slug && item.id !== row.id);
  store.customs.push(row);
  await writeStore(store);
  return row;
}

export async function deleteLocalTemplate(id: string): Promise<void> {
  const store = await readStore();
  const slug = id.startsWith("local:") ? id.slice(6) : "";
  store.customs = store.customs.filter(
    (row) => row.id !== id && row.slug !== id && row.slug !== slug && !row.is_builtin
  );
  await writeStore(store);
}

export function newLocalSlug(hint?: string): string {
  const base =
    String(hint || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-|-$/g, "") || `tpl-${randomBytes(4).toString("hex")}`;
  return base;
}
