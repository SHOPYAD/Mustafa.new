"use client";

import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { toast } from "sonner";
import { useBuilderStore } from "@/lib/builder/editor-store";
import {
  customPageIdFromSlug,
  findEditorPage,
  type EditorPagesData,
} from "@/lib/builder-pages";
import {
  defaultSectionForType,
  isHomepageSectionType,
  parseHeroPackages,
  pickCopy,
  sectionLabel,
  type HomepageSectionType,
} from "@/lib/visual-editor/schema";
import { THEME_PRESETS } from "@/lib/theme/presets";
import { BRAND_THEME_UPDATED_EVENT } from "@/lib/theme/tokens";
import type { Locale } from "@/lib/i18n/types";
import { HOMEPAGE_SECTION_SOURCE_MAP } from "@/lib/builder-agent/section-source-map";
import { callCopilotFs, formatFsResult } from "./copilot-fs-client"; /* Agent C: copilot pipeline */

function userAskedWholePage(flag?: boolean): boolean {
  return Boolean(flag);
}

function resolveSectionId(requested?: string, wholePage?: boolean): string | null {
  const store = useBuilderStore.getState();
  const selected = store.selectedElement?.sectionInstanceId;
  if (!userAskedWholePage(wholePage) && selected) return selected;
  if (typeof requested === "string" && requested.trim()) return requested.trim();
  return selected ?? null;
}

function findSection(instanceId: string) {
  return useBuilderStore.getState().theme.layout.find((item) => item.instanceId === instanceId);
}

function guardSearchWidget(instanceId: string, action: string): string | null {
  const section = findSection(instanceId);
  if (section?.type === "search") {
    return `Blocked: SearchWidget cannot be ${action}.`;
  }
  return null;
}

function parseCssMap(raw: unknown): Record<string, string> {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
      if (typeof value === "string" && value.trim()) out[key] = value.trim();
    }
    return out;
  }
  if (typeof raw !== "string" || !raw.trim()) return {};
  try {
    return parseCssMap(JSON.parse(raw));
  } catch {
    const out: Record<string, string> = {};
    for (const part of raw.split(";")) {
      const idx = part.indexOf(":");
      if (idx < 1) continue;
      const key = part.slice(0, idx).trim();
      const value = part.slice(idx + 1).trim();
      if (key && value) out[key] = value;
    }
    return out;
  }
}

function applyCssToSection(instanceId: string, css: Record<string, string>): string[] {
  const store = useBuilderStore.getState();
  const applied: string[] = [];
  const styleKeys = ["background", "accent", "textColor", "overlay"] as const;
  const sectionStyles: Partial<Record<(typeof styleKeys)[number], string>> = {};
  for (const [prop, value] of Object.entries(css)) {
    if ((styleKeys as readonly string[]).includes(prop)) {
      sectionStyles[prop as (typeof styleKeys)[number]] = value;
    } else {
      store.updateElementStyle(instanceId, instanceId, prop, value);
    }
    applied.push(`${prop}=${value}`);
  }
  if (Object.keys(sectionStyles).length) {
    store.updateSectionStyles(instanceId, sectionStyles);
  }
  return applied;
}

export function useEditorCopilotContext(): void {
  const theme = useBuilderStore((s) => s.theme);
  const selected = useBuilderStore((s) => s.selectedElement);
  const activePage = useBuilderStore((s) => s.activePage);
  const locale = useBuilderStore((s) => s.locale);
  const rtl = useBuilderStore((s) => s.rtl);
  const editorPages = useBuilderStore((s) => s.editorPages);
  const currentSectionId = selected?.sectionInstanceId || null;
  const current = currentSectionId ? findSection(currentSectionId) : null;

  useCopilotReadable({
    description:
      "Tagged section. Edits MUST use currentSectionId unless the user says whole page / site-wide.",
    value: {
      currentSectionId,
      currentSectionType: current?.type || selected?.sectionType || null,
      field: selected?.field || null,
      label: selected?.label || null,
    },
  });

  useCopilotReadable({
    description:
      "Homepage layout plus the real source files for each section. For deep redesigns, READ these files — do not stop at JSON tokens.",
    value: {
      activePage,
      locale,
      rtl,
      navy: theme.global.navy,
      emerald: theme.global.emerald,
      sections: theme.layout.map((item) => {
        const source = HOMEPAGE_SECTION_SOURCE_MAP.find((entry) => entry.type === item.type);
        return {
          instanceId: item.instanceId,
          type: item.type,
          hidden: item.hidden,
          textKeys: Object.keys(item.texts || {}),
          sourceFiles: source?.files || [],
        };
      }),
    },
  });

  useCopilotReadable({
    description:
      "Page registry from src/lib/builder-pages.ts (do not invent a second catalog).",
    value: editorPages.pages.map((page) => ({
      id: page.id,
      path: page.path,
      kind: page.kind,
      editable: page.editable,
      label: pickCopy(
        { ar: page.labelAr, en: page.labelEn, tr: page.labelTr },
        locale
      ),
    })),
  });
}

export function useEditorCopilotActions(): void {
  useCopilotAction({
    name: "rewriteSectionCSS",
    description:
      "Deep-redesign a section with CSS (display, grid/flex, gap, padding, type, overlay). Defaults to the tagged section.",
    parameters: [
      { name: "css", type: "string", required: true, description: "CSS object JSON or declarations." },
      { name: "instanceId", type: "string" },
      { name: "wholePage", type: "boolean" },
    ],
    handler: ({ css, instanceId, wholePage }: { css: string; instanceId?: string; wholePage?: boolean }) => {
      const target = resolveSectionId(instanceId, wholePage);
      if (!target) return "No section tagged. Select a section or pass instanceId / wholePage.";
      const blocked = guardSearchWidget(target, "restyled structurally");
      if (blocked && parseCssMap(css).display) return blocked;
      const applied = applyCssToSection(target, parseCssMap(css));
      return applied.length ? `CSS on ${target}: ${applied.join(", ")}` : "No CSS applied.";
    },
  });

  useCopilotAction({
    name: "setSectionTheme",
    description: "Set section theme colors (background, accent, textColor, overlay) on the tagged section.",
    parameters: [
      { name: "background", type: "string" },
      { name: "accent", type: "string" },
      { name: "textColor", type: "string" },
      { name: "overlay", type: "string" },
      { name: "instanceId", type: "string" },
      { name: "wholePage", type: "boolean" },
    ],
    handler: (args: {
      background?: string;
      accent?: string;
      textColor?: string;
      overlay?: string;
      instanceId?: string;
      wholePage?: boolean;
    }) => {
      const target = resolveSectionId(args.instanceId, args.wholePage);
      if (!target) return "No section tagged.";
      useBuilderStore.getState().updateSectionStyles(target, {
        background: args.background,
        accent: args.accent,
        textColor: args.textColor,
        overlay: args.overlay,
      });
      return `Theme updated on ${target}.`;
    },
  });

  useCopilotAction({
    name: "replaceSectionLayout",
    description:
      "Replace the tagged section’s structure with another homepage section type at the same index.",
    parameters: [
      { name: "type", type: "string", required: true },
      { name: "instanceId", type: "string" },
      { name: "wholePage", type: "boolean" },
    ],
    handler: ({ type, instanceId, wholePage }: { type: string; instanceId?: string; wholePage?: boolean }) => {
      if (!isHomepageSectionType(type)) return `Unknown section type ${type}.`;
      const target = resolveSectionId(instanceId, wholePage);
      if (!target) return "No section tagged.";
      const blocked = guardSearchWidget(target, "replaced");
      if (blocked) return blocked;
      const store = useBuilderStore.getState();
      const idx = store.theme.layout.findIndex((item) => item.instanceId === target);
      if (idx < 0) return `Section ${target} not found.`;
      const nextType = type as HomepageSectionType;
      const created = defaultSectionForType(nextType);
      store.setTheme((prev) => {
        const layout = [...prev.layout];
        const prevItem = layout[idx];
        if (!prevItem) return prev;
        layout[idx] = {
          ...created,
          instanceId: prevItem.instanceId,
          hidden: prevItem.hidden,
        };
        return { ...prev, layout };
      });
      return `Replaced ${target} with ${nextType} layout.`;
    },
  });

  useCopilotAction({
    name: "setThemePreset",
    description:
      "Apply a named site theme preset: emerald-coast, midnight-gold, mediterranean, desert-rose, arctic-graphite, royal-sapphire.",
    parameters: [{ name: "preset", type: "string", required: true }],
    handler: async ({ preset }: { preset: string }) => {
      const match = THEME_PRESETS.find((item) => item.id === preset);
      if (!match) return `Unknown preset ${preset}.`;
      const store = useBuilderStore.getState();
      store.updateGlobalToken("navy", match.theme.colors.accent || match.theme.colors.header);
      store.updateGlobalToken("emerald", match.theme.colors.primary);
      try {
        await fetch("/api/admin/theme", {
          method: "PUT",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ applyPresetId: match.id }),
        });
        window.dispatchEvent(new CustomEvent(BRAND_THEME_UPDATED_EVENT));
      } catch {
        /* local tokens still applied */
      }
      return `Applied preset ${match.id}.`;
    },
  });

  useCopilotAction({
    name: "patchTexts",
    description: "Patch localized texts on the tagged section. Prefer filling ar+en+tr together.",
    parameters: [
      { name: "field", type: "string", required: true },
      { name: "value", type: "string" },
      { name: "ar", type: "string" },
      { name: "en", type: "string" },
      { name: "tr", type: "string" },
      { name: "locale", type: "string" },
      { name: "instanceId", type: "string" },
      { name: "wholePage", type: "boolean" },
    ],
    handler: (args: {
      field: string;
      value?: string;
      ar?: string;
      en?: string;
      tr?: string;
      locale?: string;
      instanceId?: string;
      wholePage?: boolean;
    }) => {
      const target = resolveSectionId(args.instanceId, args.wholePage);
      if (!target) return "No section tagged.";
      const locale = (args.locale === "en" || args.locale === "tr" || args.locale === "ar"
        ? args.locale
        : useBuilderStore.getState().locale) as Locale;
      const texts: Record<string, { ar?: string; en?: string; tr?: string }> = {
        [args.field]: {
          ar: args.ar,
          en: args.en,
          tr: args.tr,
        },
      };
      if (args.value && !args.ar && !args.en && !args.tr) {
        texts[args.field] = { [locale]: args.value };
      }
      useBuilderStore.getState().applyPatch({
        updateSectionTexts: { instanceId: target, texts },
      });
      return `Patched ${args.field} on ${target}.`;
    },
  });

  useCopilotAction({
    name: "patchSectionSettings",
    description:
      "Patch settings on the tagged section (heroMinHeight, cardMotion, showSearch, image, etc.). Use cardMotion=slide-up for bottom-to-top card motion.",
    parameters: [
      { name: "settings", type: "string", required: true, description: "JSON object of settings." },
      { name: "instanceId", type: "string" },
      { name: "wholePage", type: "boolean" },
    ],
    handler: ({
      settings,
      instanceId,
      wholePage,
    }: {
      settings: string;
      instanceId?: string;
      wholePage?: boolean;
    }) => {
      const target = resolveSectionId(instanceId, wholePage);
      if (!target) return "No section tagged.";
      let parsed: Record<string, unknown> = {};
      try {
        parsed = typeof settings === "string" ? (JSON.parse(settings) as Record<string, unknown>) : {};
      } catch {
        return "settings must be a JSON object.";
      }
      if (!parsed || typeof parsed !== "object") return "settings must be a JSON object.";
      const next: Record<string, string | number | boolean> = {};
      for (const [key, value] of Object.entries(parsed)) {
        if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
          next[key] = value;
        }
      }
      if (!Object.keys(next).length) return "No settings applied.";
      useBuilderStore.getState().updateSectionSettings(target, next);
      return `Settings on ${target}: ${Object.keys(next).join(", ")}`;
    },
  });

  useCopilotAction({
    name: "redesignSection",
    description:
      "REQUIRED when the user asks to redesign a section. Mutates CSS, theme, height, and card motion on the tagged section. Never only describe the change.",
    parameters: [
      { name: "css", type: "string", description: "CSS object JSON or declarations." },
      { name: "minHeight", type: "string", description: "e.g. 92vh or 720px" },
      {
        name: "cardMotion",
        type: "string",
        description: "slide-up | bottom-to-top | none — hero offer cards.",
      },
      { name: "background", type: "string" },
      { name: "accent", type: "string" },
      { name: "textColor", type: "string" },
      { name: "overlay", type: "string" },
      { name: "instanceId", type: "string" },
      { name: "wholePage", type: "boolean" },
    ],
    handler: (args: {
      css?: string;
      minHeight?: string;
      cardMotion?: string;
      background?: string;
      accent?: string;
      textColor?: string;
      overlay?: string;
      instanceId?: string;
      wholePage?: boolean;
    }) => {
      const target = resolveSectionId(args.instanceId, args.wholePage);
      if (!target) return "No section tagged. Select a section or pass instanceId / wholePage.";
      const store = useBuilderStore.getState();
      const applied: string[] = [];
      const css = parseCssMap(args.css);
      if (args.minHeight) css["min-height"] = args.minHeight;
      const motion = (args.cardMotion || "").trim();
      if (motion === "slide-up" || motion === "bottom-to-top") {
        css["--hero-card-motion"] = "slide-up";
      }
      if (Object.keys(css).length) {
        applied.push(`css ${applyCssToSection(target, css).join(", ")}`);
      }
      const settings: Record<string, string | number | boolean> = {};
      if (args.minHeight) settings.heroMinHeight = args.minHeight;
      if (motion) settings.cardMotion = motion;
      if (Object.keys(settings).length) {
        store.updateSectionSettings(target, settings);
        applied.push(`settings ${Object.keys(settings).join(",")}`);
      }
      if (args.background || args.accent || args.textColor || args.overlay) {
        store.updateSectionStyles(target, {
          background: args.background,
          accent: args.accent,
          textColor: args.textColor,
          overlay: args.overlay,
        });
        applied.push("theme");
      }
      if (motion === "slide-up" || motion === "bottom-to-top") {
        const section = findSection(target);
        const cards = section ? parseHeroPackages(section.settings) : [];
        for (const card of cards) {
          const cardId = `${target}.hero-pkg-${card.id}`;
          store.updateElementStyle(cardId, target, "animation", "alrayyan-hero-card-up 0.7s ease both");
          store.updateElementStyle(cardId, target, "transform", "translateY(0)");
        }
        if (cards.length) applied.push(`cardMotion on ${cards.length} cards`);
      }
      return applied.length
        ? `Redesigned ${target}: ${applied.join("; ")}`
        : "No redesign applied — pass css, minHeight, cardMotion, or theme colors.";
    },
  });

  useCopilotAction({
    name: "hideSection",
    description: "Hide a section. Defaults to the tagged section. Cannot hide SearchWidget.",
    parameters: [
      { name: "instanceId", type: "string" },
      { name: "wholePage", type: "boolean" },
    ],
    handler: ({ instanceId, wholePage }: { instanceId?: string; wholePage?: boolean }) => {
      const target = resolveSectionId(instanceId, wholePage);
      if (!target) return "No section tagged.";
      const blocked = guardSearchWidget(target, "hidden");
      if (blocked) return blocked;
      useBuilderStore.getState().hideSection(target, true);
      return `Hidden ${target}.`;
    },
  });

  useCopilotAction({
    name: "showSection",
    description: "Show a previously hidden section.",
    parameters: [
      { name: "instanceId", type: "string" },
      { name: "wholePage", type: "boolean" },
    ],
    handler: ({ instanceId, wholePage }: { instanceId?: string; wholePage?: boolean }) => {
      const target = resolveSectionId(instanceId, wholePage);
      if (!target) return "No section tagged.";
      useBuilderStore.getState().hideSection(target, false);
      return `Shown ${target}.`;
    },
  });

  useCopilotAction({
    name: "reorderSection",
    description: "Move a section to a 0-based index. Defaults to the tagged section.",
    parameters: [
      { name: "newIndex", type: "number", required: true },
      { name: "instanceId", type: "string" },
      { name: "wholePage", type: "boolean" },
    ],
    handler: ({
      newIndex,
      instanceId,
      wholePage,
    }: {
      newIndex: number;
      instanceId?: string;
      wholePage?: boolean;
    }) => {
      const target = resolveSectionId(instanceId, wholePage);
      if (!target) return "No section tagged.";
      useBuilderStore.getState().reorderSection(target, Number(newIndex));
      return `Moved ${target} to ${newIndex}.`;
    },
  });

  useCopilotAction({
    name: "applyBrandTokens",
    description: "Apply navy + emerald brand tokens site-wide (homepage globals + persisted brand theme).",
    parameters: [
      { name: "navy", type: "string" },
      { name: "emerald", type: "string" },
    ],
    handler: async ({ navy, emerald }: { navy?: string; emerald?: string }) => {
      const store = useBuilderStore.getState();
      const nextNavy = navy || store.theme.global.navy || "#051741";
      const nextEmerald = emerald || store.theme.global.emerald || "#10b981";
      store.updateGlobalToken("navy", nextNavy);
      store.updateGlobalToken("emerald", nextEmerald);
      try {
        await fetch("/api/admin/theme", {
          method: "PUT",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            colors: {
              accent: nextNavy,
              header: nextNavy,
              primary: nextEmerald,
              button: nextEmerald,
            },
          }),
        });
        window.dispatchEvent(new CustomEvent(BRAND_THEME_UPDATED_EVENT));
      } catch {
        /* local tokens still applied */
      }
      return `Brand tokens set navy=${nextNavy} emerald=${nextEmerald}.`;
    },
  });

  useCopilotAction({
    name: "listPages",
    description: "List pages from the builder-pages registry (not a second catalog).",
    parameters: [],
    handler: () => {
      const { editorPages, locale, activePage } = useBuilderStore.getState();
      return JSON.stringify(
        editorPages.pages.map((page) => ({
          id: page.id,
          path: page.path,
          active: page.id === activePage,
          label: pickCopy({ ar: page.labelAr, en: page.labelEn, tr: page.labelTr }, locale),
        }))
      );
    },
  });

  useCopilotAction({
    name: "openPage",
    description: "Switch the builder canvas to a registry page id (does not leave the editor).",
    parameters: [{ name: "pageId", type: "string", required: true }],
    handler: ({ pageId }: { pageId: string }) => {
      const store = useBuilderStore.getState();
      const match =
        findEditorPage(store.editorPages.pages, pageId) ||
        store.editorPages.pages.find(
          (page) =>
            page.path === pageId ||
            page.slug === pageId ||
            page.labelEn.toLowerCase() === pageId.toLowerCase()
        );
      if (!match) return `Page ${pageId} is not in the builder-pages registry.`;
      store.setActivePage(match.id);
      return `Opened ${match.id} (${match.path}) in the canvas.`;
    },
  });

  useCopilotAction({
    name: "createCustomPage",
    description: "Create a custom /p/[slug] page via the existing builder-pages endpoint.",
    parameters: [
      { name: "titleAr", type: "string", required: true },
      { name: "titleEn", type: "string" },
      { name: "titleTr", type: "string" },
      { name: "slug", type: "string" },
    ],
    handler: async ({
      titleAr,
      titleEn,
      titleTr,
      slug,
    }: {
      titleAr: string;
      titleEn?: string;
      titleTr?: string;
      slug?: string;
    }) => {
      const res = await fetch("/api/admin/builder-pages", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titleAr, titleEn, titleTr, slug, published: false }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        page?: { slug?: string };
      } & Partial<EditorPagesData>;
      if (!data.ok) return data.error || "Could not create page.";
      const store = useBuilderStore.getState();
      if (Array.isArray(data.pages)) store.applyEditorPagesData(data);
      if (data.page?.slug) store.setActivePage(customPageIdFromSlug(data.page.slug));
      toast.success(data.page?.slug || titleAr);
      return `Created custom page ${data.page?.slug || titleAr}.`;
    },
  });

  useCopilotAction({
    name: "addSection",
    description:
      "Insert a homepage section type after the tagged section (or at the end). Use type=copilot after createHomepageSection.",
    parameters: [
      { name: "type", type: "string", required: true },
      { name: "afterInstanceId", type: "string" },
    ],
    handler: ({ type, afterInstanceId }: { type: string; afterInstanceId?: string }) => {
      if (!isHomepageSectionType(type)) return `Unknown section type ${type}.`;
      const store = useBuilderStore.getState();
      const after = afterInstanceId || store.selectedElement?.sectionInstanceId || undefined;
      store.addSection(type, after);
      return `Added ${type}${after ? ` after ${after}` : ""}.`;
    },
  });

  /* Agent C: copilot pipeline — deep file tools */
  useCopilotAction({
    name: "resolveSectionSource",
    description:
      "Map a section type or Arabic name (e.g. تحجز بثقة) to the real TSX/CSS files. Call this BEFORE a from-scratch redesign.",
    parameters: [{ name: "query", type: "string", required: true }],
    handler: async ({ query }: { query: string }) => {
      const data = await callCopilotFs({ action: "resolve", query });
      return formatFsResult(data);
    },
  });

  useCopilotAction({
    name: "listProjectFiles",
    description:
      "List homepage / visual-editor source files under this site root only (templates, CSS, JS).",
    parameters: [{ name: "path", type: "string", description: "Directory, default src/components/home" }],
    handler: async ({ path: dir }: { path?: string }) => {
      const data = await callCopilotFs({ action: "list", path: dir || "src/components/home" });
      return formatFsResult(data);
    },
  });

  useCopilotAction({
    name: "readProjectFile",
    description:
      "Read the actual source of a homepage template, CSS, or JS file. Required before applyProjectPatch.",
    parameters: [{ name: "path", type: "string", required: true }],
    handler: async ({ path: filePath }: { path: string }) => {
      const data = await callCopilotFs({ action: "read", path: filePath });
      return formatFsResult(data);
    },
  });

  useCopilotAction({
    name: "searchProjectFiles",
    description: "Search homepage source files for a symbol, class, or Arabic/English string.",
    parameters: [
      { name: "query", type: "string", required: true },
      { name: "path", type: "string" },
    ],
    handler: async ({ query, path: dir }: { query: string; path?: string }) => {
      const data = await callCopilotFs({ action: "search", query, path: dir });
      return formatFsResult(data);
    },
  });

  useCopilotAction({
    name: "applyProjectPatch",
    description:
      "Apply one or more file patches (search_replace / write / delete) on this project's homepage files. Use search_replace for edits. write+confirm for new files. delete+confirm for removals. Always list the files you changed in the chat.",
    parameters: [
      {
        name: "patchesJson",
        type: "string",
        required: true,
        description:
          'JSON array: [{path, action:"search_replace"|"write"|"delete", oldString?, newString?, content?, confirm?}]',
      },
      { name: "summary", type: "string", description: "Short list of files for the chat." },
      { name: "confirm", type: "boolean" },
    ],
    handler: async ({
      patchesJson,
      summary,
      confirm,
    }: {
      patchesJson: string;
      summary?: string;
      confirm?: boolean;
    }) => {
      let patches: unknown = [];
      try {
        patches = JSON.parse(patchesJson);
      } catch {
        return "patchesJson must be a JSON array.";
      }
      const data = await callCopilotFs({ action: "apply_patch", patches, confirm: Boolean(confirm) });
      if (!data.ok) return data.error || "Patch failed.";
      const files = (data.changed || []).map((item) => `${item.action} ${item.path}`).join("\n");
      return `${summary ? `${summary}\n` : ""}Files changed:\n${files || "(none)"}`;
    },
  });

  useCopilotAction({
    name: "createHomepageSection",
    description:
      "Create a new homepage section from scratch: writes TSX+CSS, registers it, and inserts type=copilot on the canvas with live html/css.",
    parameters: [
      { name: "titleAr", type: "string", required: true },
      { name: "titleEn", type: "string" },
      { name: "titleTr", type: "string" },
      { name: "slug", type: "string" },
      { name: "tsx", type: "string" },
      { name: "css", type: "string" },
      { name: "html", type: "string", description: "Live-preview HTML (no script tags)." },
      { name: "afterInstanceId", type: "string" },
    ],
    handler: async (args: {
      titleAr: string;
      titleEn?: string;
      titleTr?: string;
      slug?: string;
      tsx?: string;
      css?: string;
      html?: string;
      afterInstanceId?: string;
    }) => {
      const data = await callCopilotFs({
        action: "create_section",
        titleAr: args.titleAr,
        titleEn: args.titleEn,
        titleTr: args.titleTr,
        slug: args.slug,
        tsx: args.tsx,
        css: args.css,
        html: args.html,
      });
      if (!data.ok || !data.section) return data.error || "Could not create section.";
      const store = useBuilderStore.getState();
      const after = args.afterInstanceId || store.selectedElement?.sectionInstanceId || undefined;
      const before = new Set(store.theme.layout.map((item) => item.instanceId));
      store.addSection("copilot", after);
      const created = store.theme.layout.find((item) => item.type === "copilot" && !before.has(item.instanceId));
      if (created) {
        store.updateSectionSettings(created.instanceId, {
          copilotSlug: data.section.slug,
          html: data.section.html,
          css: data.section.css,
        });
        store.applyPatch({
          updateSectionTexts: {
            instanceId: created.instanceId,
            texts: {
              title: { ar: args.titleAr, en: args.titleEn || args.titleAr, tr: args.titleTr || args.titleEn || args.titleAr },
              subtitle: { ar: "", en: "", tr: "" },
            },
          },
        });
      }
      const files = (data.changed || []).map((item) => `${item.action} ${item.path}`).join("\n");
      return `Created ${data.section.slug} (${created?.instanceId || "copilot"}).\nFiles changed:\n${files}`;
    },
  });

  useCopilotAction({
    name: "persistMemory",
    description: "Persist a short note the agent should remember across sessions.",
    parameters: [{ name: "note", type: "string", required: true }],
    handler: async ({ note }: { note: string }) => {
      const res = await fetch("/api/admin/builder-agent", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "addMemory", note, scope: "editor" }),
      });
      const data = await res.json();
      return data.ok ? `Remembered: ${note}` : data.error || "Could not save memory.";
    },
  });
}

export function taggedSectionHint(locale: Locale): string {
  const selected = useBuilderStore.getState().selectedElement;
  if (!selected?.sectionType) return "";
  return pickCopy(sectionLabel(selected.sectionType), locale);
}
