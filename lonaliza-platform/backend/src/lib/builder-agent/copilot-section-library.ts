/* Agent C: copilot pipeline */

import { promises as fs } from "fs";
import path from "path";

export const COPILOT_SECTIONS_DIR = "src/components/home/template/copilot-sections";

export type CopilotSectionRecord = {
  slug: string;
  titleAr: string;
  titleEn: string;
  titleTr: string;
  templatePath: string;
  cssPath: string;
  html: string;
  css: string;
  createdAt: string;
  updatedAt: string;
};

export type CopilotSectionLibraryFile = {
  version: 1;
  sections: CopilotSectionRecord[];
  updatedAt: string;
};

function storePath(): string {
  return path.join(process.cwd(), ".data", "copilot-section-library.json");
}

function emptyLibrary(): CopilotSectionLibraryFile {
  return { version: 1, sections: [], updatedAt: new Date().toISOString() };
}

export async function readCopilotSectionLibrary(): Promise<CopilotSectionLibraryFile> {
  try {
    const raw = await fs.readFile(storePath(), "utf8");
    const parsed = JSON.parse(raw) as CopilotSectionLibraryFile;
    if (!parsed || !Array.isArray(parsed.sections)) return emptyLibrary();
    return parsed;
  } catch {
    return emptyLibrary();
  }
}

export async function upsertCopilotSection(
  input: Omit<CopilotSectionRecord, "createdAt" | "updatedAt"> & {
    createdAt?: string;
  }
): Promise<CopilotSectionRecord> {
  const now = new Date().toISOString();
  const library = await readCopilotSectionLibrary();
  const existing = library.sections.find((item) => item.slug === input.slug);
  const record: CopilotSectionRecord = {
    slug: input.slug,
    titleAr: input.titleAr,
    titleEn: input.titleEn,
    titleTr: input.titleTr,
    templatePath: input.templatePath,
    cssPath: input.cssPath,
    html: input.html,
    css: input.css,
    createdAt: existing?.createdAt || input.createdAt || now,
    updatedAt: now,
  };
  library.sections = [record, ...library.sections.filter((item) => item.slug !== record.slug)];
  library.updatedAt = now;
  await fs.mkdir(path.dirname(storePath()), { recursive: true });
  await fs.writeFile(storePath(), JSON.stringify(library, null, 2), "utf8");
  return record;
}

export async function getCopilotSection(slug: string): Promise<CopilotSectionRecord | null> {
  const library = await readCopilotSectionLibrary();
  return library.sections.find((item) => item.slug === slug) || null;
}
