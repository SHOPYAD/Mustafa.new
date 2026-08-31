"use client";

import { useMemo, useState } from "react";
import { Plus, Search, Sparkles } from "lucide-react";
import { catalogSectionTypes, pickCopy, sectionLabel } from "@/lib/visual-editor/schema";
import { Input, ScrollArea } from "../ui";
import { useBuilderStore } from "@/lib/builder/editor-store";
import { cn } from "@/lib/builder/cn";
import { SectionPreview } from "./section-previews";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  catalogGroupLabel,
  catalogToneForType,
  groupCatalogTypes,
} from "@/lib/visual-editor/section-catalog-groups";

const PREVIEW_TONE: Record<string, string> = {
  hero: "navy",
  search: "sky",
  categories: "navy",
  destinations: "lime",
  banners: "lime",
  flashDeals: "rose",
  packages: "amber",
  hotels: "amber",
  cars: "emerald",
  transfers: "blue",
  visa: "sky",
  flightDeals: "sky",
  vipTours: "lime",
  coupons: "emerald",
  points: "emerald",
  affiliate: "navy",
  whyUs: "navy",
  stats: "blue",
  testimonials: "amber",
  trust: "emerald",
  partners: "slate",
  blog: "navy",
  newsletter: "sky",
  contact: "emerald",
  cta: "rose",
};

function SectionCard({
  type,
  label,
  tone,
  onAdd,
  addLabel,
}: {
  type: string;
  label: string;
  tone: string;
  onAdd: () => void;
  addLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onAdd}
      aria-label={`${addLabel} ${label}`}
      className={cn(
        "group relative flex w-full flex-col overflow-hidden rounded-xl border border-border bg-card text-left transition-all duration-300 ease-out",
        "hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-lg hover:shadow-foreground/5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
    >
      <div
        className="relative aspect-[16/10] w-full overflow-hidden transition-transform duration-500 group-hover:scale-[1.02]"
        style={{ background: `linear-gradient(180deg, var(--preview-${tone}-50, #eef3fb), hsl(var(--card)))` }}
      >
        <SectionPreview type={type} tone={tone} />
        <span
          aria-hidden="true"
          className="absolute left-2 top-2 h-1.5 w-1.5 rounded-full ring-2 ring-background/70"
          style={{ background: `var(--preview-${tone}-600, #051741)` }}
        />
        <span className="absolute right-2 top-2 rounded bg-background/85 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground ring-1 ring-border backdrop-blur-md">
          CORE
        </span>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-foreground/0 opacity-0 transition-all duration-300 group-hover:bg-foreground/15 group-hover:opacity-100">
          <span className="flex items-center gap-1 rounded-full bg-foreground px-2.5 py-1 text-[10px] font-semibold text-background shadow-md">
            <Plus className="h-3 w-3" />
            {addLabel}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-border px-2.5 py-2">
        <span className="flex-1 truncate text-xs font-medium text-foreground">{label}</span>
        <span
          className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors group-hover:scale-110"
          style={{
            background: `var(--preview-${tone}-100, #d1fae5)`,
            color: `var(--preview-${tone}-700, #047857)`,
          }}
          aria-hidden="true"
        >
          <Plus className="h-2.5 w-2.5" />
        </span>
      </div>
    </button>
  );
}

export function SectionsCatalogPanel() {
  const { t, locale } = useLocale();
  const [query, setQuery] = useState("");
  const addSection = useBuilderStore((s) => s.addSection);
  const selected = useBuilderStore((s) => s.selectedElement);
  const lq = query.trim().toLowerCase();

  const items = useMemo(() => {
    return catalogSectionTypes().filter((type) => {
      const label = pickCopy(sectionLabel(type), locale);
      return !lq || label.toLowerCase().includes(lq) || type.toLowerCase().includes(lq);
    });
  }, [locale, lq]);

  const groups = useMemo(() => groupCatalogTypes(items), [items]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.editor.searchSections}
            className="pl-8"
          />
          {lq ? (
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              {items.length}
            </span>
          ) : null}
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-5 p-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border p-8 text-center">
              <Search className="h-5 w-5 text-muted-foreground" />
              <div className="text-sm font-medium">{t.editor.noSections}</div>
            </div>
          ) : (
            groups.map((group) => (
              <section key={group.key}>
                <header className="mb-2 flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <span className="flex h-4 w-4 items-center justify-center rounded bg-emerald-100 text-emerald-700">
                      <Sparkles className="h-2.5 w-2.5" />
                    </span>
                    {catalogGroupLabel(group, locale, t.editor.sections)}
                  </div>
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {group.types.length}
                  </span>
                </header>
                <div className="grid grid-cols-2 gap-2.5">
                  {group.types.map((type) => (
                    <SectionCard
                      key={type}
                      type={type}
                      label={pickCopy(sectionLabel(type), locale)}
                      tone={catalogToneForType(type, PREVIEW_TONE[type])}
                      addLabel={t.editor.addSection}
                      onAdd={() => addSection(type, selected?.sectionInstanceId || undefined)}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
