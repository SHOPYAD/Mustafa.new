import type { Locale } from "@/lib/i18n/types";
import {
  cloneDraft,
  defaultSectionForType,
  emptyCopy,
  generateInstanceId,
  isHomepageSectionType,
  type HomepageSectionInstance,
  type HomepageSectionType,
  type HomepageTemplateDraft,
  type LocalizedCopy,
  type SectionStyles,
} from "./schema";

export type TemplatePatch = {
  updateSectionText?: {
    instanceId: string;
    field: string;
    locale?: Locale;
    value?: string;
    ar?: string;
    en?: string;
    tr?: string;
  };
  updateSectionTexts?: {
    instanceId: string;
    texts: Record<string, Partial<LocalizedCopy>>;
  };
  updateSectionStyles?: {
    instanceId: string;
    styles: Partial<SectionStyles>;
  };
  updateSectionSettings?: {
    instanceId: string;
    settings: Record<string, string | number | boolean>;
  };
  hideSection?: string;
  showSection?: string;
  removeSection?: string;
  reorder?: string[];
  addSection?: { type: HomepageSectionType; afterInstanceId?: string };
  setGlobal?: { navy?: string; emerald?: string };
  updateMany?: Array<{
    instanceId: string;
    texts?: Record<string, Partial<LocalizedCopy>>;
    styles?: Partial<SectionStyles>;
    settings?: Record<string, string | number | boolean>;
    hidden?: boolean;
  }>;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function mergeCopy(current: LocalizedCopy | undefined, patch: Partial<LocalizedCopy>): LocalizedCopy {
  const rec = asRecord(patch) || {};
  const base = current || emptyCopy();
  return {
    ar: typeof rec.ar === "string" ? rec.ar : base.ar,
    en: typeof rec.en === "string" ? rec.en : base.en,
    tr: typeof rec.tr === "string" ? rec.tr : base.tr,
  };
}

function mapSection(
  draft: HomepageTemplateDraft,
  instanceId: string,
  updater: (section: HomepageSectionInstance) => HomepageSectionInstance
): HomepageTemplateDraft {
  return {
    ...draft,
    layout: draft.layout.map((item) => (item.instanceId === instanceId ? updater(item) : item)),
  };
}

export function applyTemplatePatch(
  current: HomepageTemplateDraft,
  patch: TemplatePatch
): HomepageTemplateDraft {
  let next = cloneDraft(current);

  if (patch.setGlobal) {
    next.global = {
      navy: patch.setGlobal.navy || next.global.navy,
      emerald: patch.setGlobal.emerald || next.global.emerald,
    };
  }

  const text = patch.updateSectionText;
  if (text?.instanceId && text.field) {
    next = mapSection(next, text.instanceId, (section) => {
      const prev = section.texts[text.field] || emptyCopy();
      const locale = text.locale;
      const nextCopy = { ...prev };
      if (text.ar !== undefined) nextCopy.ar = text.ar;
      if (text.en !== undefined) nextCopy.en = text.en;
      if (text.tr !== undefined) nextCopy.tr = text.tr;
      if (text.value !== undefined && locale) {
        nextCopy[locale] = text.value;
      }
      return {
        ...section,
        texts: { ...section.texts, [text.field]: nextCopy },
      };
    });
  }

  if (patch.updateSectionTexts) {
    const { instanceId } = patch.updateSectionTexts;
    const texts = asRecord(patch.updateSectionTexts.texts);
    if (instanceId && texts) {
      next = mapSection(next, instanceId, (section) => {
        const merged = { ...section.texts };
        for (const [field, value] of Object.entries(texts)) {
          merged[field] = mergeCopy(merged[field], value as Partial<LocalizedCopy>);
        }
        return { ...section, texts: merged };
      });
    }
  }

  if (patch.updateSectionStyles) {
    const { instanceId } = patch.updateSectionStyles;
    const styles = asRecord(patch.updateSectionStyles.styles);
    if (instanceId && styles) {
      next = mapSection(next, instanceId, (section) => ({
        ...section,
        styles: { ...section.styles, ...(styles as Partial<SectionStyles>) },
      }));
    }
  }

  if (patch.updateSectionSettings) {
    const { instanceId } = patch.updateSectionSettings;
    const settings = asRecord(patch.updateSectionSettings.settings);
    if (instanceId && settings) {
      next = mapSection(next, instanceId, (section) => ({
        ...section,
        settings: {
          ...section.settings,
          ...(settings as Record<string, string | number | boolean>),
        },
      }));
    }
  }

  if (patch.hideSection) {
    next = mapSection(next, patch.hideSection, (section) => ({ ...section, hidden: true }));
  }
  if (patch.showSection) {
    next = mapSection(next, patch.showSection, (section) => ({ ...section, hidden: false }));
  }
  if (patch.removeSection) {
    next.layout = next.layout.filter((item) => item.instanceId !== patch.removeSection);
  }

  if (patch.reorder && patch.reorder.length) {
    const byId = new Map(next.layout.map((item) => [item.instanceId, item]));
    const ordered: HomepageSectionInstance[] = [];
    for (const id of patch.reorder) {
      const item = byId.get(id);
      if (item) {
        ordered.push(item);
        byId.delete(id);
      }
    }
    ordered.push(...byId.values());
    next.layout = ordered;
  }

  if (patch.addSection && isHomepageSectionType(patch.addSection.type)) {
    const created = defaultSectionForType(patch.addSection.type);
    created.instanceId = generateInstanceId(patch.addSection.type);
    const after = patch.addSection.afterInstanceId;
    const index = after ? next.layout.findIndex((item) => item.instanceId === after) : -1;
    if (index >= 0) {
      next.layout = [
        ...next.layout.slice(0, index + 1),
        created,
        ...next.layout.slice(index + 1),
      ];
    } else {
      next.layout = [...next.layout, created];
    }
  }

  if (patch.updateMany) {
    for (const item of patch.updateMany) {
      if (!item?.instanceId) continue;
      next = mapSection(next, item.instanceId, (section) => {
        const texts = { ...section.texts };
        const incomingTexts = asRecord(item.texts);
        if (incomingTexts) {
          for (const [field, value] of Object.entries(incomingTexts)) {
            texts[field] = mergeCopy(texts[field], value as Partial<LocalizedCopy>);
          }
        }
        const incomingStyles = asRecord(item.styles);
        const incomingSettings = asRecord(item.settings);
        return {
          ...section,
          hidden: item.hidden !== undefined ? item.hidden : section.hidden,
          texts,
          styles: incomingStyles
            ? { ...section.styles, ...(incomingStyles as Partial<SectionStyles>) }
            : section.styles,
          settings: incomingSettings
            ? {
                ...section.settings,
                ...(incomingSettings as Record<string, string | number | boolean>),
              }
            : section.settings,
        };
      });
    }
  }

  return next;
}
