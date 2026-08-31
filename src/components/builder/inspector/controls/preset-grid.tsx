"use client";
/**
 * Reusable swatch-grid for one-click style presets.
 *
 * The grid is intentionally generic — each preset just renders into a
 * small <button> with whatever swatch the caller chooses. We use it to
 * present box-shadow, gradient, and border preset libraries with the
 * same visual language so users build muscle memory.
 *
 * Selection detection is a string compare against the preset's `value`
 * (or, for borders, the bundle's `borderRadius` since exact CSS-string
 * equality is too brittle). Callers can opt out of `active` styling by
 * leaving `currentValue` undefined.
 */
import { Check } from "lucide-react";
import { cn } from "@/lib/builder/cn";

export interface PresetGridItem {
  id: string;
  label: string;
  /** What renders inside the swatch tile. */
  swatch: React.ReactNode;
  /** Used to highlight the active preset (best-effort string compare). */
  matchKey?: string;
  /** Tooltip / hover hint shown via `title=""`. */
  hint?: string;
}

export function PresetGrid({
  items,
  currentValue,
  onSelect,
  columns = 4,
  className,
}: {
  items: PresetGridItem[];
  currentValue?: string;
  onSelect: (item: PresetGridItem) => void;
  columns?: 3 | 4 | 5 | 6;
  className?: string;
}) {
  const gridCls =
    columns === 3
      ? "grid-cols-3"
      : columns === 5
        ? "grid-cols-5"
        : columns === 6
          ? "grid-cols-6"
          : "grid-cols-4";

  return (
    <div className={cn("grid gap-1.5", gridCls, className)}>
      {items.map((item) => {
        const active =
          currentValue !== undefined &&
          item.matchKey !== undefined &&
          item.matchKey === currentValue;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item)}
            title={item.hint || item.label}
            aria-label={item.label}
            aria-pressed={active}
            className={cn(
              "group relative flex flex-col items-center gap-1 rounded-md border border-border bg-card p-1.5 transition-all",
              "hover:border-primary/60 hover:bg-primary/5",
              "focus:outline-none focus:ring-2 focus:ring-primary/40",
              active &&
                "border-primary ring-2 ring-primary/30 bg-primary/10",
            )}
          >
            <span className="relative flex h-9 w-full items-center justify-center overflow-hidden rounded">
              {item.swatch}
              {active && (
                <span className="absolute right-0.5 top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                  <Check className="h-2.5 w-2.5" />
                </span>
              )}
            </span>
            <span className="text-[9px] font-medium text-muted-foreground group-hover:text-foreground truncate max-w-full">
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
