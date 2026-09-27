import { promises as fs } from "fs";
import path from "path";
import {
  BUILDER_DEFAULTS_VERSION,
  RETIRED_DEFAULT_IDS,
  defaultAllPacks,
  defaultPack,
  defaultRuleIds,
  defaultSkillIds,
} from "@/lib/builder-agent/defaults";
import {
  COPILOT_SCOPES,
  emptyPack,
  isCopilotScope,
  parseCopilotScope,
  type BuilderAgentMemoryNote,
  type BuilderAgentPack,
  type BuilderAgentRule,
  type BuilderAgentSkill,
  type BuilderAgentStoreFile,
  type CopilotScope,
} from "@/lib/builder-agent/types";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "builder-agent.json");

function isServerlessHosting(): boolean {
  return (
    process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME != null
  );
}

function getStoreFile(): string {
  if (isServerlessHosting()) {
    return path.join("/tmp", "alrayyan-builder-agent.json");
  }
  return STORE_FILE;
}

async function ensureDir() {
  await fs.mkdir(path.dirname(getStoreFile()), { recursive: true });
}

function nowIso(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function emptyStore(): BuilderAgentStoreFile {
  return {
    version: 2,
    defaultsVersion: BUILDER_DEFAULTS_VERSION,
    packs: defaultAllPacks(),
    updatedAt: nowIso(),
  };
}

function mergeDefaultPack(existing: BuilderAgentPack, scope: CopilotScope): BuilderAgentPack {
  const next = defaultPack(scope);
  const skillIds = defaultSkillIds(scope);
  const ruleIds = defaultRuleIds(scope);
  const userSkills = existing.skills.filter(
    (item) => !skillIds.has(item.id) && !RETIRED_DEFAULT_IDS.has(item.id)
  );
  const userRules = existing.rules.filter(
    (item) => !ruleIds.has(item.id) && !RETIRED_DEFAULT_IDS.has(item.id)
  );
  return {
    skills: [...next.skills, ...userSkills],
    rules: [...next.rules, ...userRules],
    memory: existing.memory.map((item) => ({ ...item })),
  };
}

function withCurrentDefaults(store: BuilderAgentStoreFile): BuilderAgentStoreFile {
  if (store.defaultsVersion === BUILDER_DEFAULTS_VERSION) return store;
  return {
    ...store,
    defaultsVersion: BUILDER_DEFAULTS_VERSION,
    packs: Object.fromEntries(
      COPILOT_SCOPES.map((scope) => [scope, mergeDefaultPack(packOf(store, scope), scope)])
    ) as Record<CopilotScope, BuilderAgentPack>,
    updatedAt: nowIso(),
  };
}

function asSkill(value: unknown, fallbackScope: CopilotScope): BuilderAgentSkill | null {
  if (!value || typeof value !== "object") return null;
  const rec = value as Record<string, unknown>;
  if (typeof rec.id !== "string" || typeof rec.title !== "string") return null;
  return {
    id: rec.id,
    title: rec.title,
    markdown: typeof rec.markdown === "string" ? rec.markdown : "",
    enabled: rec.enabled !== false,
    source: rec.source === "github" ? "github" : "manual",
    scope: isCopilotScope(rec.scope) ? rec.scope : fallbackScope,
    repoUrl: typeof rec.repoUrl === "string" ? rec.repoUrl : undefined,
    filePath: typeof rec.filePath === "string" ? rec.filePath : undefined,
    createdAt: typeof rec.createdAt === "string" ? rec.createdAt : nowIso(),
    updatedAt: typeof rec.updatedAt === "string" ? rec.updatedAt : nowIso(),
  };
}

function asRule(value: unknown, fallbackScope: CopilotScope): BuilderAgentRule | null {
  if (!value || typeof value !== "object") return null;
  const rec = value as Record<string, unknown>;
  if (typeof rec.id !== "string" || typeof rec.title !== "string") return null;
  return {
    id: rec.id,
    title: rec.title,
    markdown: typeof rec.markdown === "string" ? rec.markdown : "",
    enabled: rec.enabled !== false,
    scope: isCopilotScope(rec.scope) ? rec.scope : fallbackScope,
    createdAt: typeof rec.createdAt === "string" ? rec.createdAt : nowIso(),
    updatedAt: typeof rec.updatedAt === "string" ? rec.updatedAt : nowIso(),
  };
}

function asMemory(value: unknown, fallbackScope: CopilotScope): BuilderAgentMemoryNote | null {
  if (!value || typeof value !== "object") return null;
  const rec = value as Record<string, unknown>;
  if (typeof rec.id !== "string" || typeof rec.note !== "string") return null;
  return {
    id: rec.id,
    note: rec.note,
    scope: isCopilotScope(rec.scope) ? rec.scope : fallbackScope,
    createdAt: typeof rec.createdAt === "string" ? rec.createdAt : nowIso(),
    updatedAt: typeof rec.updatedAt === "string" ? rec.updatedAt : nowIso(),
  };
}

function normalizePack(value: unknown, scope: CopilotScope): BuilderAgentPack {
  if (!value || typeof value !== "object") return defaultPack(scope);
  const rec = value as Record<string, unknown>;
  const skills = Array.isArray(rec.skills)
    ? rec.skills.map((item) => asSkill(item, scope)).filter((item): item is BuilderAgentSkill => item != null)
    : [];
  const rules = Array.isArray(rec.rules)
    ? rec.rules.map((item) => asRule(item, scope)).filter((item): item is BuilderAgentRule => item != null)
    : [];
  const memory = Array.isArray(rec.memory)
    ? rec.memory.map((item) => asMemory(item, scope)).filter((item): item is BuilderAgentMemoryNote => item != null)
    : [];
  if (!skills.length && !rules.length && !memory.length && !("skills" in rec)) {
    return defaultPack(scope);
  }
  return {
    skills: skills.map((item) => ({ ...item, scope })),
    rules: rules.map((item) => ({ ...item, scope })),
    memory: memory.map((item) => ({ ...item, scope })),
  };
}

function migrateLegacyV1(parsed: Record<string, unknown>): BuilderAgentStoreFile {
  const packs = defaultAllPacks();
  const editorSkills = Array.isArray(parsed.skills)
    ? parsed.skills.map((item) => asSkill(item, "editor")).filter((item): item is BuilderAgentSkill => item != null)
    : [];
  const editorRules = Array.isArray(parsed.rules)
    ? parsed.rules.map((item) => asRule(item, "editor")).filter((item): item is BuilderAgentRule => item != null)
    : [];
  const editorMemory = Array.isArray(parsed.memory)
    ? parsed.memory.map((item) => asMemory(item, "editor")).filter((item): item is BuilderAgentMemoryNote => item != null)
    : [];
  packs.editor = {
    skills: editorSkills.length ? editorSkills.map((item) => ({ ...item, scope: "editor" })) : defaultPack("editor").skills,
    rules: editorRules.length ? editorRules.map((item) => ({ ...item, scope: "editor" })) : defaultPack("editor").rules,
    memory: editorMemory.map((item) => ({ ...item, scope: "editor" })),
  };
  return {
    version: 2,
    defaultsVersion: 0,
    packs,
    updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : nowIso(),
  };
}

function normalizeStore(raw: unknown): BuilderAgentStoreFile {
  if (!raw || typeof raw !== "object") return emptyStore();
  const parsed = raw as Record<string, unknown>;
  if (parsed.version !== 2 || !parsed.packs || typeof parsed.packs !== "object") {
    return migrateLegacyV1(parsed);
  }
  const source = parsed.packs as Record<string, unknown>;
  const packs = Object.fromEntries(
    COPILOT_SCOPES.map((scope) => [scope, normalizePack(source[scope], scope)])
  ) as Record<CopilotScope, BuilderAgentPack>;
  return {
    version: 2,
    defaultsVersion: typeof parsed.defaultsVersion === "number" ? parsed.defaultsVersion : 0,
    packs,
    updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : nowIso(),
  };
}

async function readStore(): Promise<BuilderAgentStoreFile> {
  try {
    const raw = await fs.readFile(getStoreFile(), "utf8");
    return normalizeStore(JSON.parse(raw));
  } catch {
    return emptyStore();
  }
}

async function writeStore(next: BuilderAgentStoreFile): Promise<BuilderAgentStoreFile> {
  await ensureDir();
  const payload: BuilderAgentStoreFile = {
    ...next,
    version: 2,
    defaultsVersion: next.defaultsVersion ?? BUILDER_DEFAULTS_VERSION,
    updatedAt: nowIso(),
  };
  await fs.writeFile(getStoreFile(), JSON.stringify(payload, null, 2), { mode: 0o600 });
  return payload;
}

function withPack(
  store: BuilderAgentStoreFile,
  scope: CopilotScope,
  pack: BuilderAgentPack
): BuilderAgentStoreFile {
  return {
    ...store,
    packs: {
      ...store.packs,
      [scope]: pack,
    },
  };
}

export function packOf(store: BuilderAgentStoreFile, scope: CopilotScope): BuilderAgentPack {
  return store.packs[scope] || emptyPack();
}

export async function getBuilderAgentStore(): Promise<BuilderAgentStoreFile> {
  const raw = await readStore();
  const store = withCurrentDefaults(raw);
  try {
    await fs.access(getStoreFile());
  } catch {
    return writeStore(store);
  }
  if (raw.defaultsVersion !== BUILDER_DEFAULTS_VERSION) {
    return writeStore(store);
  }
  return store;
}

export async function getBuilderAgentPack(scope: CopilotScope): Promise<BuilderAgentPack> {
  const store = await getBuilderAgentStore();
  return packOf(store, scope);
}

export async function upsertSkill(
  scope: CopilotScope,
  input: Partial<BuilderAgentSkill> & { title: string; markdown: string }
): Promise<BuilderAgentStoreFile> {
  const store = await getBuilderAgentStore();
  const pack = packOf(store, scope);
  const ts = nowIso();
  const id = input.id?.trim() || newId("skill");
  const existing = pack.skills.find((item) => item.id === id);
  const next: BuilderAgentSkill = {
    id,
    title: input.title.trim(),
    markdown: input.markdown,
    enabled: input.enabled ?? existing?.enabled ?? true,
    source: input.source || existing?.source || "manual",
    scope,
    repoUrl: input.repoUrl ?? existing?.repoUrl,
    filePath: input.filePath ?? existing?.filePath,
    createdAt: existing?.createdAt || ts,
    updatedAt: ts,
  };
  const skills = existing
    ? pack.skills.map((item) => (item.id === id ? next : item))
    : [...pack.skills, next];
  return writeStore(withPack(store, scope, { ...pack, skills }));
}

export async function setSkillEnabled(
  scope: CopilotScope,
  id: string,
  enabled: boolean
): Promise<BuilderAgentStoreFile> {
  const store = await getBuilderAgentStore();
  const pack = packOf(store, scope);
  return writeStore(
    withPack(store, scope, {
      ...pack,
      skills: pack.skills.map((item) =>
        item.id === id ? { ...item, enabled, updatedAt: nowIso() } : item
      ),
    })
  );
}

export async function deleteSkill(scope: CopilotScope, id: string): Promise<BuilderAgentStoreFile> {
  const store = await getBuilderAgentStore();
  const pack = packOf(store, scope);
  return writeStore(
    withPack(store, scope, {
      ...pack,
      skills: pack.skills.filter((item) => item.id !== id),
    })
  );
}

export async function upsertRule(
  scope: CopilotScope,
  input: Partial<BuilderAgentRule> & { title: string; markdown: string }
): Promise<BuilderAgentStoreFile> {
  const store = await getBuilderAgentStore();
  const pack = packOf(store, scope);
  const ts = nowIso();
  const id = input.id?.trim() || newId("rule");
  const existing = pack.rules.find((item) => item.id === id);
  const next: BuilderAgentRule = {
    id,
    title: input.title.trim(),
    markdown: input.markdown,
    enabled: input.enabled ?? existing?.enabled ?? true,
    scope,
    createdAt: existing?.createdAt || ts,
    updatedAt: ts,
  };
  const rules = existing
    ? pack.rules.map((item) => (item.id === id ? next : item))
    : [...pack.rules, next];
  return writeStore(withPack(store, scope, { ...pack, rules }));
}

export async function setRuleEnabled(
  scope: CopilotScope,
  id: string,
  enabled: boolean
): Promise<BuilderAgentStoreFile> {
  const store = await getBuilderAgentStore();
  const pack = packOf(store, scope);
  return writeStore(
    withPack(store, scope, {
      ...pack,
      rules: pack.rules.map((item) =>
        item.id === id ? { ...item, enabled, updatedAt: nowIso() } : item
      ),
    })
  );
}

export async function deleteRule(scope: CopilotScope, id: string): Promise<BuilderAgentStoreFile> {
  const store = await getBuilderAgentStore();
  const pack = packOf(store, scope);
  return writeStore(
    withPack(store, scope, {
      ...pack,
      rules: pack.rules.filter((item) => item.id !== id),
    })
  );
}

export async function addMemoryNote(scope: CopilotScope, note: string): Promise<BuilderAgentStoreFile> {
  const store = await getBuilderAgentStore();
  const pack = packOf(store, scope);
  const ts = nowIso();
  const entry: BuilderAgentMemoryNote = {
    id: newId("mem"),
    note: note.trim(),
    scope,
    createdAt: ts,
    updatedAt: ts,
  };
  return writeStore(
    withPack(store, scope, {
      ...pack,
      memory: [entry, ...pack.memory].slice(0, 80),
    })
  );
}

export async function deleteMemoryNote(scope: CopilotScope, id: string): Promise<BuilderAgentStoreFile> {
  const store = await getBuilderAgentStore();
  const pack = packOf(store, scope);
  return writeStore(
    withPack(store, scope, {
      ...pack,
      memory: pack.memory.filter((item) => item.id !== id),
    })
  );
}

export async function importSkills(
  scope: CopilotScope,
  skills: BuilderAgentSkill[]
): Promise<BuilderAgentStoreFile> {
  const store = await getBuilderAgentStore();
  const pack = packOf(store, scope);
  const byKey = new Map(
    pack.skills.map((item) => [`${item.repoUrl || ""}::${item.filePath || item.title}`, item])
  );
  const next = [...pack.skills];
  for (const skill of skills) {
    const stamped = { ...skill, scope };
    const key = `${stamped.repoUrl || ""}::${stamped.filePath || stamped.title}`;
    const existing = byKey.get(key);
    if (existing) {
      const idx = next.findIndex((item) => item.id === existing.id);
      if (idx >= 0) {
        next[idx] = {
          ...existing,
          title: stamped.title,
          markdown: stamped.markdown,
          updatedAt: nowIso(),
          source: "github",
          scope,
          repoUrl: stamped.repoUrl,
          filePath: stamped.filePath,
        };
      }
    } else {
      next.push(stamped);
    }
  }
  return writeStore(withPack(store, scope, { ...pack, skills: next }));
}

export { parseCopilotScope };
