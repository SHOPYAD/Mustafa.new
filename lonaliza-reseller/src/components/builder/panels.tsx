"use client";

/* Agent A: editor chrome only */

import Link from "next/link";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  catalogSectionTypes,
  pickCopy,
  sectionLabel,
  type HomepageSectionType,
} from "@/lib/visual-editor/schema";
import { useBuilderStore } from "@/lib/builder/editor-store";
import { cn } from "@/lib/builder/cn";
import { PagesPanel } from "./panels/pages-panel";
import { SectionsCatalogPanel } from "./panels/sections-catalog-panel";
import { HistoryPanel } from "./panels/history-panel";
import { InspectorPanel } from "./panels/inspector-panel";
import { EditorBrandingPanel } from "@/components/branding/EditorBrandingPanel";
import { EditorAgentSettingsPanel, EditorCopilotPanel } from "@/components/editor";
import { EditorCopilotSlot } from "@/components/visual-editor/copilot-slot";

export { PagesPanel, SectionsCatalogPanel, HistoryPanel, InspectorPanel };

function PanelChrome({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="ed-panel-chrome flex h-full min-h-0 flex-col">
      <div className="ed-panel-chrome-title px-4 py-3 text-sm font-bold">{title}</div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">{children}</div>
    </div>
  );
}

function LayoutPanel() {
  const { t, locale } = useLocale();
  const theme = useBuilderStore((s) => s.theme);
  const selected = useBuilderStore((s) => s.selectedElement);
  const setSelectedElement = useBuilderStore((s) => s.setSelectedElement);
  const reorderSection = useBuilderStore((s) => s.reorderSection);
  const hideSection = useBuilderStore((s) => s.hideSection);
  const removeSection = useBuilderStore((s) => s.removeSection);

  return (
    <PanelChrome title={t.editor.layout}>
      {theme.layout.map((item, index) => {
        const label = sectionLabel(item.type);
        const active = selected?.sectionInstanceId === item.instanceId;
        return (
          <div
            key={item.instanceId}
            className={cn(
              "rounded-xl border px-3 py-2",
              active ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-slate-50"
            )}
          >
            <button
              type="button"
              className="w-full text-start text-sm font-medium text-slate-900"
              onClick={() =>
                setSelectedElement({
                  id: item.instanceId,
                  sectionInstanceId: item.instanceId,
                  sectionType: item.type,
                  label: pickCopy(label, locale),
                })
              }
            >
              {pickCopy(label, locale)}
              {item.hidden ? <span className="ms-2 text-[10px] text-slate-400">{t.editor.hide}</span> : null}
            </button>
            <div className="mt-2 flex items-center gap-1">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => reorderSection(item.instanceId, index - 1)}
                className="rounded bg-white px-2 py-1 text-[11px] text-slate-600 disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                disabled={index === theme.layout.length - 1}
                onClick={() => reorderSection(item.instanceId, index + 1)}
                className="rounded bg-white px-2 py-1 text-[11px] text-slate-600 disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => hideSection(item.instanceId, !item.hidden)}
                className="rounded bg-white px-2 py-1 text-slate-600"
              >
                {item.hidden ? <EyeOff size={12} /> : <Eye size={12} />}
              </button>
              <button
                type="button"
                onClick={() => removeSection(item.instanceId)}
                className="ms-auto rounded bg-white px-2 py-1 text-red-500"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        );
      })}
    </PanelChrome>
  );
}

function DesignPanel() {
  const { t } = useLocale();
  return (
    <div className="flex h-full min-h-0 flex-col bg-[#0b1220]">
      <div className="border-b border-white/10 px-4 py-3 text-sm font-bold text-white">
        {t.editor.design}
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <EditorBrandingPanel compact />
        <p className="mt-4 px-1 text-[11px] leading-relaxed text-white/40">
          <Link href="/admin/media" className="text-emerald-300/90 underline-offset-2 hover:underline">
            {t.editor.mediaKeysHint}
          </Link>
        </p>
      </div>
    </div>
  );
}

export function AIPanel() {
  return <EditorCopilotPanel />;
}

export function PanelHost() {
  const activePanel = useBuilderStore((s) => s.activePanel);
  switch (activePanel) {
    case "pages":
      return <PagesPanel />;
    case "sections":
      return <SectionsCatalogPanel />;
    case "layout":
      return <LayoutPanel />;
    case "design":
      return <DesignPanel />;
    case "history":
      return <HistoryPanel />;
    case "ai":
      return <EditorCopilotSlot fallback={<AIPanel />} />;
    case "settings":
      return <EditorAgentSettingsPanel />;
    default: {
      const _never: never = activePanel;
      return _never;
    }
  }
}

export function catalogTypes(): HomepageSectionType[] {
  return catalogSectionTypes();
}
