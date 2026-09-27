"use client";
/**
 * IconPicker — searchable grid of Iconsax + Font Awesome icons with an
 * optional Emoji mode (toggle in the header).
 *
 * Icon fonts (`isax`, `fontawesome`) are imported globally by the
 * builder's layout via the bundler — no runtime CDN fetches, so tiles
 * never render as blank squares even on first paint.
 *
 * The picker reports its choice as a CSS class string for icons
 * ("isax isax-airplane", "fa-solid fa-plane") and as a raw glyph for
 * emojis ("✈️"). Consumers detect emoji values by the absence of the
 * `isax`/`fa-` prefix and render them as text instead of <i/>.
 */
import { useEffect, useMemo, useState } from "react";
import { Search, Smile, Sparkles, Trash2 } from "lucide-react";
import { cn } from "@/lib/builder/cn";
import {
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
  Tabs,
  TabsList,
  TabsTrigger,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../ui";
import { ICON_CATALOG } from "./icon-catalog";
import { EMOJI_CATALOG, EMOJI_GROUPS } from "./emoji-catalog";

type Mode = "icon" | "emoji";

/**
 * Heuristic used by the storefront preview + IconBlock to decide whether
 * the saved value is a CSS class or a raw emoji glyph.
 *
 * Exported so other inspector blocks can use the same rule.
 */
export function isEmojiValue(v: string | undefined | null): boolean {
  if (!v) return false;
  const s = String(v).trim();
  if (!s) return false;
  // CSS class strings always start with one of these prefixes.
  return !/^(isax|fa-|fab |fas |far |fal |fad |bi |bx |ti |ph )/i.test(s);
}

export function IconPicker({
  value,
  onChange,
  placeholder = "Choose icon",
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>(() =>
    isEmojiValue(value) ? "emoji" : "icon",
  );
  const [query, setQuery] = useState("");
  const [emojiGroup, setEmojiGroup] = useState<string>("Travel");

  // Re-sync mode if the parent swaps the value externally (e.g. via AI).
  useEffect(() => {
    setMode(isEmojiValue(value) ? "emoji" : "icon");
  }, [value]);

  const filteredIcons = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ICON_CATALOG;
    return ICON_CATALOG.filter(
      (ic) =>
        ic.name.toLowerCase().includes(q) ||
        ic.tags.toLowerCase().includes(q) ||
        ic.cls.toLowerCase().includes(q),
    );
  }, [query]);

  const filteredEmojis = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? EMOJI_CATALOG
      : EMOJI_CATALOG.filter((e) => e.group === emojiGroup);
    if (!q) return base;
    return EMOJI_CATALOG.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.tags.toLowerCase().includes(q),
    );
  }, [query, emojiGroup]);

  return (
    <div className="flex items-center gap-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-border bg-background transition hover:bg-muted"
            aria-label={value || "Pick icon"}
          >
            {value ? (
              isEmojiValue(value) ? (
                <span className="text-base leading-none">{value}</span>
              ) : (
                <i className={cn(value, "text-base")} />
              )
            ) : (
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[380px] max-h-[80vh] overflow-hidden p-0"
          align="start"
          sideOffset={4}
        >
          <div className="border-b border-border p-2">
            <div className="mb-2 flex items-center justify-between gap-2">
              {/*
                Mode toggle — `ToggleGroup` is a Radix-backed segmented
                control. `type="single"` ensures exactly one is active.
              */}
              <ToggleGroup
                type="single"
                value={mode}
                onValueChange={(v) => {
                  if (v) setMode(v as Mode);
                }}
                className="h-7"
              >
                <ToggleGroupItem
                  value="icon"
                  className="h-7 gap-1 px-2 text-[11px]"
                >
                  <Sparkles className="h-3 w-3" /> Icons
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="emoji"
                  className="h-7 gap-1 px-2 text-[11px]"
                >
                  <Smile className="h-3 w-3" /> Emoji
                </ToggleGroupItem>
              </ToggleGroup>
              <span className="text-[10px] text-muted-foreground">
                {mode === "icon"
                  ? `${filteredIcons.length} icons`
                  : `${filteredEmojis.length} emoji`}
              </span>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  mode === "icon" ? "Search icons…" : "Search emoji…"
                }
                className="h-7 pl-7 text-xs"
              />
            </div>
            {mode === "emoji" && !query.trim() && (
              <Tabs
                value={emojiGroup}
                onValueChange={setEmojiGroup}
                className="mt-2"
              >
                <TabsList className="flex w-full flex-wrap gap-0.5 bg-muted/40 p-0.5">
                  {EMOJI_GROUPS.map((g) => (
                    <TabsTrigger
                      key={g}
                      value={g}
                      className="h-6 flex-1 px-1.5 text-[10px]"
                    >
                      {g}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}
          </div>
          {/*
            Fixed height (NOT max-height) so Radix `ScrollArea`'s viewport
            (which uses `h-full`) actually clips and shows a scrollbar.
            Same fix we applied to the MediaPicker.
          */}
          <ScrollArea className="h-[22rem]">
            {mode === "icon" ? (
              <div className="grid grid-cols-8 gap-1 p-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => {
                        onChange("");
                        setOpen(false);
                      }}
                      className={cn(
                        "flex aspect-square items-center justify-center rounded border transition",
                        !value
                          ? "border-primary bg-primary/10"
                          : "border-border bg-background hover:bg-muted",
                      )}
                    >
                      <Trash2 className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Remove icon</TooltipContent>
                </Tooltip>
                {filteredIcons.map((ic) => {
                  const active = value === ic.cls;
                  return (
                    <Tooltip key={ic.cls}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => {
                            onChange(ic.cls);
                            setOpen(false);
                          }}
                          className={cn(
                            "flex aspect-square items-center justify-center rounded border transition",
                            active
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-transparent bg-background text-foreground hover:bg-muted",
                          )}
                        >
                          <i className={cn(ic.cls, "text-sm")} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>{ic.name}</TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-8 gap-1 p-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => {
                        onChange("");
                        setOpen(false);
                      }}
                      className={cn(
                        "flex aspect-square items-center justify-center rounded border transition",
                        !value
                          ? "border-primary bg-primary/10"
                          : "border-border bg-background hover:bg-muted",
                      )}
                    >
                      <Trash2 className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Remove emoji</TooltipContent>
                </Tooltip>
                {filteredEmojis.map((e) => {
                  const active = value === e.ch;
                  return (
                    <Tooltip key={`${e.group}-${e.ch}-${e.name}`}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => {
                            onChange(e.ch);
                            setOpen(false);
                          }}
                          className={cn(
                            "flex aspect-square items-center justify-center rounded border text-base leading-none transition",
                            active
                              ? "border-primary bg-primary/10"
                              : "border-transparent bg-background hover:bg-muted",
                          )}
                        >
                          <span className="text-base">{e.ch}</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>{e.name}</TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-7 flex-1 font-mono text-[11px]"
        spellCheck={false}
      />
    </div>
  );
}
