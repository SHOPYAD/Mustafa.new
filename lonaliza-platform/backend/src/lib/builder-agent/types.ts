export const COPILOT_SCOPES = [
  "editor",
  "articles",
  "services",
  "invoices",
  "email",
  "pages",
] as const;

export type CopilotScope = (typeof COPILOT_SCOPES)[number];

export const BUILDER_COPILOT_TOOLS = [
  "rewriteSectionCSS",
  "setSectionTheme",
  "replaceSectionLayout",
  "setThemePreset",
  "patchTexts",
  "patchSectionSettings",
  "redesignSection",
  "hideSection",
  "showSection",
  "reorderSection",
  "applyBrandTokens",
  "listPages",
  "openPage",
  "createCustomPage",
  "persistMemory",
  "listProjectFiles",
  "readProjectFile",
  "searchProjectFiles",
  "applyProjectPatch",
  "resolveSectionSource",
  "createHomepageSection",
  "addSection",
] as const;

export type BuilderCopilotToolName = (typeof BUILDER_COPILOT_TOOLS)[number];

export type BuilderAgentSkill = {
  id: string;
  title: string;
  markdown: string;
  enabled: boolean;
  source: "manual" | "github";
  scope: CopilotScope;
  repoUrl?: string;
  filePath?: string;
  createdAt: string;
  updatedAt: string;
};

export type BuilderAgentRule = {
  id: string;
  title: string;
  markdown: string;
  enabled: boolean;
  scope: CopilotScope;
  createdAt: string;
  updatedAt: string;
};

export type BuilderAgentMemoryNote = {
  id: string;
  note: string;
  scope: CopilotScope;
  createdAt: string;
  updatedAt: string;
};

export type BuilderAgentPack = {
  skills: BuilderAgentSkill[];
  rules: BuilderAgentRule[];
  memory: BuilderAgentMemoryNote[];
};

export type BuilderAgentStoreFile = {
  version: 2;
  defaultsVersion?: number;
  packs: Record<CopilotScope, BuilderAgentPack>;
  updatedAt: string;
};

export function isCopilotScope(value: unknown): value is CopilotScope {
  return (COPILOT_SCOPES as readonly string[]).includes(String(value));
}

export function parseCopilotScope(value: unknown): CopilotScope {
  return isCopilotScope(value) ? value : "editor";
}

export function emptyPack(): BuilderAgentPack {
  return { skills: [], rules: [], memory: [] };
}
