"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useBuilderStore, type SelectedElement } from "@/lib/builder/editor-store";
import { MediaPicker } from "@/components/editor/MediaPicker";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  addLogoItem,
  logoField,
  logoListKindForSection,
  LOGO_LIST_SETTING,
  moveLogoItem,
  parseLogoField,
  readLogoList,
  removeLogoItem,
  replaceLogoUrl,
  serializeLogoList,
  type LogoListKind,
} from "@/lib/visual-editor/logo-lists";
import { unwrapCssUrl, withCacheBust } from "@/lib/visual-editor/live-bind";
import type { ElementStyleApi } from "./use-element-style";
import { Field } from "./controls/index";
import { Input } from "../ui";

function listLabel(
  t: { editor: { inspectorPartnerLogos: string; inspectorAirlineLogos: string; inspectorHotelLogos: string } },
  kind: LogoListKind
): string {
  switch (kind) {
    case "partners":
      return t.editor.inspectorPartnerLogos;
    case "airlines":
      return t.editor.inspectorAirlineLogos;
    case "hotels":
      return t.editor.inspectorHotelLogos;
    default: {
      const _never: never = kind;
      return _never;
    }
  }
}

export function LogosBlock({
  selected,
}: {
  selected: SelectedElement;
  api: ElementStyleApi;
}) {
  const { t } = useLocale();
  const theme = useBuilderStore((s) => s.theme);
  const updateSectionSettings = useBuilderStore((s) => s.updateSectionSettings);
  const section = theme.layout.find((item) => item.instanceId === selected.sectionInstanceId);
  const kinds: LogoListKind[] = [];
  const parsed = parseLogoField(selected.field);
  if (parsed) kinds.push(parsed.kind);
  else if (selected.sectionType === "partners") kinds.push("partners");
  else if (selected.sectionType === "trust") {
    if (selected.field === "hotels") kinds.push("hotels");
    else if (selected.field === "airlines") kinds.push("airlines");
    else kinds.push("airlines", "hotels");
  } else {
    const inferred = logoListKindForSection(selected.sectionType, selected.field);
    if (inferred) kinds.push(inferred);
  }

  if (!section || !selected.sectionInstanceId || !kinds.length) {
    return (
      <div className="px-3 pb-3 text-[11px] text-muted-foreground">{t.editor.inspectorNoMatch}</div>
    );
  }

  const instanceId = selected.sectionInstanceId;

  return (
    <div className="space-y-4 px-3 pb-3 pt-1">
      {kinds.map((kind) => {
        const items = readLogoList(section, kind);
        const write = (next: typeof items) => {
          updateSectionSettings(instanceId, {
            [LOGO_LIST_SETTING[kind]]: serializeLogoList(next),
          });
        };
        return (
          <div key={kind} className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {listLabel(t, kind)}
              </div>
              <button
                type="button"
                onClick={() => write(addLogoItem(items, kind))}
                className="inline-flex items-center gap-1 rounded border border-border bg-background px-2 py-0.5 text-[10px] font-medium hover:bg-muted"
              >
                <Plus className="h-3 w-3" />
                {t.editor.inspectorAddLogo}
              </button>
            </div>
            <div className="space-y-2">
              {items.map((item, index) => {
                const active = parsed?.kind === kind && parsed.id === item.id;
                return (
                  <div
                    key={item.id}
                    className={`rounded-lg border p-2 ${
                      active ? "border-primary/60 bg-primary/5" : "border-border bg-muted/20"
                    }`}
                  >
                    <Field label={t.editor.inspectorLogoName}>
                      <Input
                        value={item.name}
                        onChange={(e) =>
                          write(
                            items.map((row) =>
                              row.id === item.id ? { ...row, name: e.target.value } : row
                            )
                          )
                        }
                        className="h-7 text-xs"
                      />
                    </Field>
                    <Field label={t.editor.inspectorElementImage}>
                      <MediaPicker
                        compact
                        value={item.logoUrl}
                        onChange={(next) =>
                          write(replaceLogoUrl(items, item.id, withCacheBust(unwrapCssUrl(next))))
                        }
                      />
                    </Field>
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {logoField(kind, item.id)}
                      </span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => write(moveLogoItem(items, item.id, -1))}
                          className="rounded border border-border p-0.5 disabled:opacity-30"
                          aria-label={t.editor.sectionMoveUp}
                        >
                          <ChevronUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          disabled={index === items.length - 1}
                          onClick={() => write(moveLogoItem(items, item.id, 1))}
                          className="rounded border border-border p-0.5 disabled:opacity-30"
                          aria-label={t.editor.sectionMoveDown}
                        >
                          <ChevronDown className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => write(removeLogoItem(items, item.id))}
                          className="rounded border border-destructive/40 p-0.5 text-destructive"
                          aria-label={t.editor.inspectorRemoveLogo}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
