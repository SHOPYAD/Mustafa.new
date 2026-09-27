import type { BuilderCopilotToolName } from "@/lib/builder-agent/types";
import { BUILDER_COPILOT_TOOLS } from "@/lib/builder-agent/types";

export { BUILDER_COPILOT_TOOLS };
export type { BuilderCopilotToolName };

export function isBuilderCopilotTool(name: string): name is BuilderCopilotToolName {
  return (BUILDER_COPILOT_TOOLS as readonly string[]).includes(name);
}

export function builderToolLabel(name: BuilderCopilotToolName): string {
  switch (name) {
    case "rewriteSectionCSS":
      return "Rewriting section CSS";
    case "setSectionTheme":
      return "Setting section theme";
    case "replaceSectionLayout":
      return "Replacing section layout";
    case "setThemePreset":
      return "Applying theme preset";
    case "patchTexts":
      return "Patching texts";
    case "patchSectionSettings":
      return "Updating section settings";
    case "redesignSection":
      return "Redesigning section";
    case "hideSection":
      return "Hiding section";
    case "showSection":
      return "Showing section";
    case "reorderSection":
      return "Reordering section";
    case "applyBrandTokens":
      return "Applying brand tokens";
    case "listPages":
      return "Listing pages";
    case "openPage":
      return "Opening page";
    case "createCustomPage":
      return "Creating page";
    case "persistMemory":
      return "Saving memory";
    case "listProjectFiles":
      return "Listing project files";
    case "readProjectFile":
      return "Reading source file";
    case "searchProjectFiles":
      return "Searching source files";
    case "applyProjectPatch":
      return "Applying source patch";
    case "resolveSectionSource":
      return "Resolving section source";
    case "createHomepageSection":
      return "Creating section from scratch";
    case "addSection":
      return "Adding section";
    default: {
      const _never: never = name;
      return _never;
    }
  }
}

export function builderToolDoneLabel(name: BuilderCopilotToolName): string {
  switch (name) {
    case "rewriteSectionCSS":
      return "Section CSS rewritten";
    case "setSectionTheme":
      return "Section theme set";
    case "replaceSectionLayout":
      return "Section layout replaced";
    case "setThemePreset":
      return "Theme preset applied";
    case "patchTexts":
      return "Texts patched";
    case "patchSectionSettings":
      return "Section settings updated";
    case "redesignSection":
      return "Section redesigned";
    case "hideSection":
      return "Section hidden";
    case "showSection":
      return "Section shown";
    case "reorderSection":
      return "Section reordered";
    case "applyBrandTokens":
      return "Brand tokens applied";
    case "listPages":
      return "Pages listed";
    case "openPage":
      return "Page opened";
    case "createCustomPage":
      return "Page created";
    case "persistMemory":
      return "Memory saved";
    case "listProjectFiles":
      return "Files listed";
    case "readProjectFile":
      return "Source file read";
    case "searchProjectFiles":
      return "Search complete";
    case "applyProjectPatch":
      return "Source files patched";
    case "resolveSectionSource":
      return "Section source resolved";
    case "createHomepageSection":
      return "Section created from scratch";
    case "addSection":
      return "Section added";
    default: {
      const _never: never = name;
      return _never;
    }
  }
}

export function summariseBuilderTool(
  name: BuilderCopilotToolName,
  args: Record<string, unknown> | null
): string | null {
  if (!args) return null;
  switch (name) {
    case "rewriteSectionCSS":
      return typeof args.instanceId === "string" ? args.instanceId : null;
    case "setSectionTheme":
      return typeof args.background === "string" ? args.background : null;
    case "replaceSectionLayout":
      return typeof args.type === "string" ? args.type : null;
    case "setThemePreset":
      return typeof args.preset === "string" ? args.preset : null;
    case "patchTexts":
      return typeof args.field === "string" ? args.field : null;
    case "patchSectionSettings":
      return typeof args.instanceId === "string" ? args.instanceId : null;
    case "redesignSection":
      return typeof args.cardMotion === "string"
        ? args.cardMotion
        : typeof args.minHeight === "string"
          ? args.minHeight
          : typeof args.instanceId === "string"
            ? args.instanceId
            : null;
    case "hideSection":
    case "showSection":
    case "reorderSection":
      return typeof args.instanceId === "string" ? args.instanceId : null;
    case "applyBrandTokens":
      return [args.navy, args.emerald].filter(Boolean).join(" / ") || null;
    case "listPages":
      return null;
    case "openPage":
    case "createCustomPage":
      return typeof args.pageId === "string"
        ? args.pageId
        : typeof args.slug === "string"
          ? args.slug
          : null;
    case "persistMemory":
      return typeof args.note === "string" ? args.note.slice(0, 40) : null;
    case "listProjectFiles":
      return typeof args.path === "string" ? args.path : "src/components/home";
    case "readProjectFile":
      return typeof args.path === "string" ? args.path : null;
    case "searchProjectFiles":
      return typeof args.query === "string" ? args.query : null;
    case "applyProjectPatch":
      return typeof args.summary === "string"
        ? args.summary
        : typeof args.path === "string"
          ? args.path
          : "multi-file";
    case "resolveSectionSource":
      return typeof args.query === "string" ? args.query : null;
    case "createHomepageSection":
      return typeof args.slug === "string" ? args.slug : typeof args.titleAr === "string" ? args.titleAr : null;
    case "addSection":
      return typeof args.type === "string" ? args.type : null;
    default: {
      const _never: never = name;
      return _never;
    }
  }
}
