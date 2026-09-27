/* Agent C: copilot pipeline — project-scoped file sandbox for the homepage builder agent. */

import { promises as fs } from "fs";
import path from "path";
import { resolveSectionSource, SHARED_HOMEPAGE_FILES } from "@/lib/builder-agent/section-source-map";
import {
  COPILOT_SECTIONS_DIR,
  upsertCopilotSection,
  type CopilotSectionRecord,
} from "@/lib/builder-agent/copilot-section-library";

const SITE_ROOT = path.resolve(process.cwd());

const ALLOWED_PREFIXES = [
  "src/components/home/",
  "src/components/ui/TrustBadges.tsx",
  "src/components/search/SearchWidget.tsx",
  "src/lib/visual-editor/",
  "src/lib/builder-agent/",
  "src/app/globals.css",
  "src/styles/",
];

const DENY_SUBSTRINGS = [
  ".env",
  "secret",
  "credential",
  "gemini.ts",
  "env-store",
  "admin-auth",
  "iyzico",
  "pocketbase",
  "node_modules",
  ".git/",
  ".data/",
];

const SEARCH_WIDGET_WRITE_BLOCK = "src/components/search/SearchWidget.tsx";

const TEXT_EXT = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".css",
  ".scss",
  ".json",
  ".md",
  ".html",
  ".svg",
]);

const MAX_READ_BYTES = 220_000;
const MAX_WRITE_BYTES = 400_000;
const MAX_SEARCH_HITS = 40;
const MAX_LIST = 200;

export type CopilotFsAction =
  | "list"
  | "read"
  | "search"
  | "apply_patch"
  | "resolve"
  | "create_section";

export type CopilotPatchOp = {
  path: string;
  action: "search_replace" | "write" | "delete";
  oldString?: string;
  newString?: string;
  content?: string;
  confirm?: boolean;
};

export type CopilotFsRequest = {
  action: CopilotFsAction;
  path?: string;
  query?: string;
  glob?: string;
  patches?: CopilotPatchOp[];
  confirm?: boolean;
  slug?: string;
  titleAr?: string;
  titleEn?: string;
  titleTr?: string;
  tsx?: string;
  css?: string;
  html?: string;
};

export type CopilotFsFileChange = {
  path: string;
  action: "created" | "updated" | "deleted";
};

export type CopilotFsResult = {
  ok: boolean;
  error?: string;
  files?: Array<{ path: string; type: "file" | "dir" }>;
  path?: string;
  content?: string;
  truncated?: boolean;
  matches?: Array<{ path: string; line: number; text: string }>;
  changed?: CopilotFsFileChange[];
  section?: CopilotSectionRecord;
  sources?: ReturnType<typeof resolveSectionSource>;
};

function toPosix(rel: string): string {
  return rel.replace(/\\/g, "/");
}

function isDenied(rel: string): boolean {
  const lower = rel.toLowerCase();
  return DENY_SUBSTRINGS.some((item) => lower.includes(item));
}

function isAllowed(rel: string): boolean {
  if (!rel || rel.startsWith("..") || path.isAbsolute(rel)) return false;
  if (isDenied(rel)) return false;
  return ALLOWED_PREFIXES.some((prefix) => rel === prefix || rel.startsWith(prefix));
}

function resolveInsideRoot(relRaw: string): { ok: true; abs: string; rel: string } | { ok: false; error: string } {
  const rel = toPosix(relRaw.trim().replace(/^\/+/, ""));
  if (!rel) return { ok: false, error: "path required" };
  if (!isAllowed(rel)) {
    return {
      ok: false,
      error: `Blocked: ${rel} is outside the homepage / visual-editor allow-list for this project.`,
    };
  }
  const abs = path.resolve(SITE_ROOT, rel);
  const rootWithSep = SITE_ROOT.endsWith(path.sep) ? SITE_ROOT : `${SITE_ROOT}${path.sep}`;
  if (abs !== SITE_ROOT && !abs.startsWith(rootWithSep)) {
    return { ok: false, error: "Blocked: path escapes the site root." };
  }
  return { ok: true, abs, rel };
}

function isTextFile(filePath: string): boolean {
  return TEXT_EXT.has(path.extname(filePath).toLowerCase());
}

async function walkDir(absDir: string, relDir: string, out: Array<{ path: string; type: "file" | "dir" }>) {
  if (out.length >= MAX_LIST) return;
  const entries = await fs.readdir(absDir, { withFileTypes: true }).catch(() => []);
  for (const entry of entries) {
    if (out.length >= MAX_LIST) return;
    const rel = toPosix(path.join(relDir, entry.name));
    if (isDenied(rel)) continue;
    if (!isAllowed(rel) && !ALLOWED_PREFIXES.some((prefix) => prefix.startsWith(`${rel}/`))) continue;
    if (entry.isDirectory()) {
      out.push({ path: `${rel}/`, type: "dir" });
      await walkDir(path.join(absDir, entry.name), rel, out);
    } else if (entry.isFile() && isTextFile(entry.name)) {
      out.push({ path: rel, type: "file" });
    }
  }
}

async function listFiles(relDir?: string): Promise<CopilotFsResult> {
  const start = relDir?.trim() ? resolveInsideRoot(relDir) : { ok: true as const, abs: path.join(SITE_ROOT, "src/components/home"), rel: "src/components/home" };
  if (!start.ok) return { ok: false, error: start.error };
  const files: Array<{ path: string; type: "file" | "dir" }> = [];
  const stat = await fs.stat(start.abs).catch(() => null);
  if (!stat) return { ok: false, error: `Not found: ${start.rel}` };
  if (stat.isFile()) return { ok: true, files: [{ path: start.rel, type: "file" }] };
  await walkDir(start.abs, start.rel, files);
  return { ok: true, files };
}

async function readFile(relPath: string): Promise<CopilotFsResult> {
  const resolved = resolveInsideRoot(relPath);
  if (!resolved.ok) return { ok: false, error: resolved.error };
  const stat = await fs.stat(resolved.abs).catch(() => null);
  if (!stat || !stat.isFile()) return { ok: false, error: `File not found: ${resolved.rel}` };
  if (!isTextFile(resolved.abs)) return { ok: false, error: "Only text source files can be read." };
  if (stat.size > MAX_READ_BYTES) {
    const handle = await fs.open(resolved.abs, "r");
    const buf = Buffer.alloc(MAX_READ_BYTES);
    await handle.read(buf, 0, MAX_READ_BYTES, 0);
    await handle.close();
    return {
      ok: true,
      path: resolved.rel,
      content: buf.toString("utf8"),
      truncated: true,
    };
  }
  const content = await fs.readFile(resolved.abs, "utf8");
  return { ok: true, path: resolved.rel, content, truncated: false };
}

async function searchFiles(query: string, globPrefix?: string): Promise<CopilotFsResult> {
  const q = query.trim();
  if (!q) return { ok: false, error: "query required" };
  const listed = await listFiles(globPrefix || "src/components/home");
  if (!listed.ok) return listed;
  const matches: Array<{ path: string; line: number; text: string }> = [];
  const needle = q.toLowerCase();
  for (const item of listed.files || []) {
    if (item.type !== "file") continue;
    const read = await readFile(item.path);
    if (!read.ok || !read.content) continue;
    const lines = read.content.split("\n");
    lines.forEach((line, index) => {
      if (matches.length >= MAX_SEARCH_HITS) return;
      if (line.toLowerCase().includes(needle)) {
        matches.push({ path: item.path, line: index + 1, text: line.trim().slice(0, 240) });
      }
    });
    if (matches.length >= MAX_SEARCH_HITS) break;
  }
  return { ok: true, matches };
}

async function applyOnePatch(op: CopilotPatchOp): Promise<CopilotFsFileChange | { error: string }> {
  const resolved = resolveInsideRoot(op.path);
  if (!resolved.ok) return { error: resolved.error };
  if (resolved.rel === SEARCH_WIDGET_WRITE_BLOCK) {
    return { error: "SearchWidget writes are blocked." };
  }

  if (op.action === "delete") {
    if (!op.confirm) return { error: "Destructive delete requires confirm=true." };
    await fs.unlink(resolved.abs).catch(() => null);
    return { path: resolved.rel, action: "deleted" };
  }

  if (op.action === "write") {
    const content = typeof op.content === "string" ? op.content : "";
    if (Buffer.byteLength(content, "utf8") > MAX_WRITE_BYTES) {
      return { error: `Write too large for ${resolved.rel}` };
    }
    const exists = await fs.stat(resolved.abs).catch(() => null);
    if (exists && !op.confirm && exists.isFile()) {
      return { error: `Overwriting ${resolved.rel} requires confirm=true. Prefer search_replace.` };
    }
    await fs.mkdir(path.dirname(resolved.abs), { recursive: true });
    await fs.writeFile(resolved.abs, content, "utf8");
    return { path: resolved.rel, action: exists ? "updated" : "created" };
  }

  if (op.action === "search_replace") {
    const oldString = op.oldString ?? "";
    const newString = op.newString ?? "";
    if (!oldString) return { error: "search_replace needs oldString." };
    const exists = await fs.stat(resolved.abs).catch(() => null);
    if (!exists) return { error: `File not found: ${resolved.rel}` };
    const current = await fs.readFile(resolved.abs, "utf8");
    if (!current.includes(oldString)) {
      return { error: `oldString not found in ${resolved.rel}` };
    }
    const next = current.split(oldString).join(newString);
    if (Buffer.byteLength(next, "utf8") > MAX_WRITE_BYTES) {
      return { error: `Patched file too large: ${resolved.rel}` };
    }
    await fs.writeFile(resolved.abs, next, "utf8");
    return { path: resolved.rel, action: "updated" };
  }

  return { error: `Unknown patch action` };
}

function slugify(value: string): string {
  const ascii = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return ascii || `section-${Date.now().toString(36)}`;
}

function defaultTsx(slug: string, titleAr: string): string {
  return `"use client";

/* Agent C: copilot pipeline — generated homepage section ${slug} */
import type { HomepageSectionInstance } from "@/lib/visual-editor/schema";
import { EditableText, SectionFrame } from "../primitives";
import {
  InteractiveHeading,
  ServiceSurface,
  serviceTitleClass,
  serviceTitleStyle,
} from "../surfaces";
import "./${slug}.css";

type SectionProps = {
  instance: HomepageSectionInstance;
  editorMode: boolean;
  selectedId?: string | null;
};

export function CopilotGeneratedSection({ instance, editorMode, selectedId }: SectionProps) {
  return (
    <SectionFrame instance={instance} editorMode={editorMode} selectedId={selectedId}>
      <ServiceSurface kind="neutral" className="copilot-section-${slug}">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className={serviceTitleClass("neutral")} style={serviceTitleStyle("neutral")}>
            <InteractiveHeading>
              <EditableText instance={instance} field="title" editorMode={editorMode} as="span" />
            </InteractiveHeading>
          </h2>
          <p className="mt-3 max-w-2xl text-slate-600">
            <EditableText instance={instance} field="subtitle" editorMode={editorMode} as="span" />
          </p>
        </div>
      </ServiceSurface>
    </SectionFrame>
  );
}

export default CopilotGeneratedSection;
`;
}

function defaultCss(slug: string): string {
  return `/* Agent C: copilot pipeline — ${slug} */
.copilot-section-${slug} {
  background:
    radial-gradient(1200px 400px at 10% 0%, color-mix(in srgb, #10b981 14%, transparent), transparent),
    #f8fafc;
}
.copilot-section-${slug} h2 {
  letter-spacing: -0.03em;
}
`;
}

function defaultHtml(titleAr: string, subtitle: string): string {
  return `<section class="copilot-live-section">
  <div class="copilot-live-inner">
    <p class="copilot-live-eyebrow">لوناليزا</p>
    <h2>${escapeHtml(titleAr)}</h2>
    <p class="copilot-live-sub">${escapeHtml(subtitle)}</p>
  </div>
</section>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function createSection(req: CopilotFsRequest): Promise<CopilotFsResult> {
  const slug = slugify(req.slug || req.titleEn || req.titleAr || "custom");
  const titleAr = (req.titleAr || "قسم جديد").trim();
  const titleEn = (req.titleEn || titleAr).trim();
  const titleTr = (req.titleTr || titleEn).trim();
  const tsx = req.tsx?.trim() || defaultTsx(slug, titleAr);
  const css = req.css?.trim() || defaultCss(slug);
  const html = req.html?.trim() || defaultHtml(titleAr, titleEn);

  const tsxRel = `${COPILOT_SECTIONS_DIR}/${slug}.tsx`;
  const cssRel = `${COPILOT_SECTIONS_DIR}/${slug}.css`;
  const writeTsx = await applyOnePatch({ path: tsxRel, action: "write", content: tsx, confirm: true });
  if ("error" in writeTsx) return { ok: false, error: writeTsx.error };
  const writeCss = await applyOnePatch({ path: cssRel, action: "write", content: css, confirm: true });
  if ("error" in writeCss) return { ok: false, error: writeCss.error };

  const record = await upsertCopilotSection({
    slug,
    titleAr,
    titleEn,
    titleTr,
    templatePath: tsxRel,
    cssPath: cssRel,
    html,
    css,
  });

  return {
    ok: true,
    section: record,
    changed: [writeTsx, writeCss],
  };
}

export async function runCopilotFs(req: CopilotFsRequest): Promise<CopilotFsResult> {
  switch (req.action) {
    case "list":
      return listFiles(req.path || req.glob);
    case "read":
      if (!req.path) return { ok: false, error: "path required" };
      return readFile(req.path);
    case "search":
      if (!req.query) return { ok: false, error: "query required" };
      return searchFiles(req.query, req.path || req.glob);
    case "resolve":
      return {
        ok: true,
        sources: resolveSectionSource(req.query || req.path || "*"),
        files: SHARED_HOMEPAGE_FILES.map((item) => ({ path: item, type: "file" as const })),
      };
    case "apply_patch": {
      const patches = Array.isArray(req.patches) ? req.patches : [];
      if (!patches.length) return { ok: false, error: "patches required" };
      const changed: CopilotFsFileChange[] = [];
      for (const op of patches) {
        const next = await applyOnePatch({ ...op, confirm: op.confirm || req.confirm });
        if ("error" in next) return { ok: false, error: next.error, changed };
        changed.push(next);
      }
      return { ok: true, changed };
    }
    case "create_section":
      return createSection(req);
    default: {
      const _never: never = req.action;
      return { ok: false, error: `Unknown action ${String(_never)}` };
    }
  }
}

export function copilotFsAllowList(): string[] {
  return [...ALLOWED_PREFIXES];
}
