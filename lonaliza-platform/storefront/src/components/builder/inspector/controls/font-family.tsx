"use client";
/**
 * FontFamilyCombobox — pick a font family from a curated 300-strong
 * Google Fonts catalog and inject the chosen family into the preview
 * iframe so the user sees the right typeface live, not just the right
 * name.
 *
 * Architecture:
 *   - The data lives in `font-catalog.ts` (FONT_GROUPS, ALL_FONTS,
 *     FONT_BY_VALUE) so the picker stays slim and other inspector
 *     controls can reuse the same metadata.
 *   - The picker exposes language/style tabs (System / Latin / Serif /
 *     Display / Mono / Arabic / Turkish) so authors can scope the list
 *     instead of scrolling 300 unrelated families.
 *   - Each option is previewed with its own `font-family`, and Arabic /
 *     Turkish options use script-appropriate sample text so the user
 *     can judge readability at-a-glance.
 *   - Auto-injects the Google Fonts stylesheet into the preview iframe
 *     when a Google Font is chosen (idempotent — multiple writes for
 *     the same family don't pile up `<link>` tags).
 */
import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/builder/cn";
import {
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
} from "../../ui";
import { loadGoogleSlug } from "@/lib/fonts/load-font";
import {
  ALL_FONTS,
  FONT_BY_VALUE,
  FONT_GROUPS,
  type FontCategory,
  type FontEntry,
} from "./font-catalog";

const TAB_ALL: { id: "all"; label: string } = { id: "all", label: "All" };

/**
 * Inject a `<link rel=stylesheet>` into the preview iframe so the chosen
 * Google Font actually loads. Idempotent — multiple calls with the same
 * family don't add multiple link tags. We target the iframe (not the
 * builder UI itself) on purpose so the editor chrome stays light and we
 * don't pull a 300-font CSS request on every editor load.
 */
export function injectGoogleFontInIframe(value: string) {
  if (typeof document === "undefined") return;
  const meta = FONT_BY_VALUE.get(value);
  if (!meta || !meta.gf) return;
  const iframe = document.querySelector<HTMLIFrameElement>(
    "[data-builder-preview='1']",
  );
  const targetDoc = iframe?.contentDocument;
  if (!targetDoc) return;
  const subset = meta.category === "arabic" ? "arabic" : "latin-ext";
  loadGoogleSlug(meta.gf, subset, targetDoc);
}

export function FontFamilyCombobox({
  value,
  onChange,
  placeholder = "Inherit",
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FontCategory | "all">("all");

  const tabs = useMemo(
    () => [
      TAB_ALL,
      ...FONT_GROUPS.map((g) => ({ id: g.id, label: g.label })),
    ],
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base: FontEntry[] =
      activeTab === "all"
        ? ALL_FONTS
        : FONT_GROUPS.find((g) => g.id === activeTab)?.entries || [];
    if (!q) return base;
    return base.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.value.toLowerCase().includes(q),
    );
  }, [query, activeTab]);

  // Auto-inject the font when the value changes externally too (e.g.
  // the user just opened the inspector and the existing override is
  // already a Google Font).
  useEffect(() => {
    if (value) injectGoogleFontInIframe(value);
  }, [value]);

  const selected = ALL_FONTS.find((o) => o.value === value);
  const display = selected?.label || value || placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-7 w-full items-center justify-between rounded border border-border bg-background px-2 text-xs transition hover:bg-muted/50"
          style={value ? { fontFamily: value } : undefined}
        >
          <span className="truncate">{display}</span>
          <ChevronsUpDown className="h-3 w-3 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start" sideOffset={4}>
        <div className="border-b border-border p-2">
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 300+ fonts…"
            className="h-7 text-xs"
          />
          <div className="mt-2 flex flex-wrap gap-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setActiveTab(tab.id as FontCategory | "all")
                  }
                  className={cn(
                    "rounded border px-2 py-0.5 text-[10px] font-medium transition",
                    isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:bg-muted",
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
        <ScrollArea className="h-72">
          <div className="p-1">
            {filtered.length === 0 && (
              <div className="px-2 py-3 text-center text-[11px] text-muted-foreground">
                No matching fonts in this tab.
              </div>
            )}
            {filtered.map((opt) => {
              const active = opt.value === value;
              return (
                <button
                  key={opt.label + opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                    setQuery("");
                  }}
                  // RTL hint when previewing Arabic samples so shaping
                  // looks right (otherwise mirrored punctuation breaks
                  // the visual cue).
                  dir={opt.category === "arabic" ? "rtl" : "ltr"}
                  className={cn(
                    "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs transition",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted",
                  )}
                  style={
                    opt.value
                      ? { fontFamily: opt.value }
                      : undefined
                  }
                >
                  <Check
                    className={cn(
                      "h-3 w-3 shrink-0",
                      active ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-medium">{opt.label}</span>
                    {opt.sample && (
                      <span className="truncate text-[11px] text-muted-foreground">
                        {opt.sample}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
