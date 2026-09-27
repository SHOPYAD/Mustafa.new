/* Agent C: copilot pipeline — Gemini function-calling for deep file edits */

import { runCopilotFs, type CopilotPatchOp } from "@/lib/server/copilot-fs";

export type GeminiFnDeclaration = {
  name: string;
  description: string;
  parameters: {
    type: "OBJECT";
    properties: Record<string, { type: string; description?: string; items?: unknown }>;
    required?: string[];
  };
};

export const HOMEPAGE_FILE_TOOLS: GeminiFnDeclaration[] = [
  {
    name: "resolveSectionSource",
    description: "Map a section type or Arabic name to real TSX/CSS files. Call before a from-scratch redesign.",
    parameters: {
      type: "OBJECT",
      properties: { query: { type: "STRING", description: "trust / تحجز بثقة / hero / …" } },
      required: ["query"],
    },
  },
  {
    name: "listProjectFiles",
    description: "List homepage source files under this project only.",
    parameters: {
      type: "OBJECT",
      properties: { path: { type: "STRING", description: "Directory, default src/components/home" } },
    },
  },
  {
    name: "readProjectFile",
    description: "Read a homepage template, CSS, or JS file.",
    parameters: {
      type: "OBJECT",
      properties: { path: { type: "STRING" } },
      required: ["path"],
    },
  },
  {
    name: "searchProjectFiles",
    description: "Search homepage source for a string.",
    parameters: {
      type: "OBJECT",
      properties: {
        query: { type: "STRING" },
        path: { type: "STRING" },
      },
      required: ["query"],
    },
  },
  {
    name: "applyProjectPatch",
    description:
      "Patch one or more project files. Prefer search_replace. write/delete need confirm=true.",
    parameters: {
      type: "OBJECT",
      properties: {
        patchesJson: {
          type: "STRING",
          description: 'JSON array [{path, action, oldString, newString, content, confirm}]',
        },
        confirm: { type: "BOOLEAN" },
      },
      required: ["patchesJson"],
    },
  },
  {
    name: "createHomepageSection",
    description: "Create a new section from scratch (TSX+CSS+html) and register it as type=copilot.",
    parameters: {
      type: "OBJECT",
      properties: {
        titleAr: { type: "STRING" },
        titleEn: { type: "STRING" },
        titleTr: { type: "STRING" },
        slug: { type: "STRING" },
        tsx: { type: "STRING" },
        css: { type: "STRING" },
        html: { type: "STRING" },
      },
      required: ["titleAr"],
    },
  },
];

export type GeminiToolCall = { name: string; args: Record<string, unknown> };

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function parsePatches(raw: unknown): CopilotPatchOp[] {
  if (Array.isArray(raw)) {
    return raw.filter((item): item is CopilotPatchOp => Boolean(item && typeof item === "object"));
  }
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return Array.isArray(parsed)
        ? parsed.filter((item): item is CopilotPatchOp => Boolean(item && typeof item === "object"))
        : [];
    } catch {
      return [];
    }
  }
  return [];
}

export async function executeGeminiBuilderTool(
  call: GeminiToolCall
): Promise<{
  text: string;
  changed: Array<{ path: string; action: string }>;
  createdSection?: { slug: string; html: string; css: string; titleAr: string; titleEn: string; titleTr: string };
}> {
  const args = call.args || {};
  switch (call.name) {
    case "resolveSectionSource": {
      const result = await runCopilotFs({ action: "resolve", query: asString(args.query) });
      return { text: JSON.stringify(result), changed: [] };
    }
    case "listProjectFiles": {
      const result = await runCopilotFs({ action: "list", path: asString(args.path) || "src/components/home" });
      return { text: JSON.stringify(result), changed: [] };
    }
    case "readProjectFile": {
      const result = await runCopilotFs({ action: "read", path: asString(args.path) });
      return { text: JSON.stringify(result), changed: [] };
    }
    case "searchProjectFiles": {
      const result = await runCopilotFs({
        action: "search",
        query: asString(args.query),
        path: asString(args.path) || undefined,
      });
      return { text: JSON.stringify(result), changed: [] };
    }
    case "applyProjectPatch": {
      const result = await runCopilotFs({
        action: "apply_patch",
        patches: parsePatches(args.patchesJson ?? args.patches),
        confirm: args.confirm === true,
      });
      return {
        text: JSON.stringify(result),
        changed: (result.changed || []).map((item) => ({ path: item.path, action: item.action })),
      };
    }
    case "createHomepageSection": {
      const result = await runCopilotFs({
        action: "create_section",
        titleAr: asString(args.titleAr),
        titleEn: asString(args.titleEn) || undefined,
        titleTr: asString(args.titleTr) || undefined,
        slug: asString(args.slug) || undefined,
        tsx: asString(args.tsx) || undefined,
        css: asString(args.css) || undefined,
        html: asString(args.html) || undefined,
      });
      return {
        text: JSON.stringify(result),
        changed: (result.changed || []).map((item) => ({ path: item.path, action: item.action })),
        createdSection: result.section
          ? {
              slug: result.section.slug,
              html: result.section.html,
              css: result.section.css,
              titleAr: result.section.titleAr,
              titleEn: result.section.titleEn,
              titleTr: result.section.titleTr,
            }
          : undefined,
      };
    }
    default:
      return { text: `Unknown tool ${call.name}`, changed: [] };
  }
}
