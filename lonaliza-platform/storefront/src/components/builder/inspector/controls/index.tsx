"use client";
/**
 * Reusable Inspector primitive controls. These are the building blocks
 * every block (Typography, Color, Spacing, Effects, …) composes — keep
 * them small, side-effect free, and styled with the builder primitives
 * so they slot into the right-dock without leaking storefront CSS.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus, Pipette, X } from "lucide-react";
import { cn } from "@/lib/builder/cn";
import {
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../ui";
import {
  composeColor,
  colorAlpha,
  CssUnit,
  parseValue,
  rangeForUnit,
  stringifyValue,
  toHexColor,
} from "./value-utils";

// -----------------------------------------------------------------------------
// Field — labelled wrapper used by every control. Keeps the dense-but-airy
// visual rhythm consistent (tiny uppercase label, control, optional hint).
// -----------------------------------------------------------------------------
export function Field({
  label,
  children,
  hint,
  reset,
  className,
}: {
  label: string;
  children: React.ReactNode;
  hint?: React.ReactNode;
  reset?: () => void;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          {label}
        </Label>
        {reset && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={reset}
                className="rounded p-0.5 text-muted-foreground opacity-0 transition hover:bg-muted hover:text-foreground group-hover:opacity-100"
                aria-label="Reset"
              >
                <X className="h-3 w-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Clear override</TooltipContent>
          </Tooltip>
        )}
      </div>
      {children}
      {hint && (
        <div className="text-[10px] text-muted-foreground">{hint}</div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// SegmentedIcons — Toggle group with icons + labels. Used everywhere we have
// a small enum to pick from (text-align, font-style, position, …).
// -----------------------------------------------------------------------------
export interface SegmentOption<T extends string> {
  value: T;
  label?: string;
  icon?: React.ReactNode;
  /** Display text inside the chip (overrides label). */
  text?: string;
}

export function SegmentedIcons<T extends string>({
  value,
  onChange,
  options,
  size = "md",
  allowClear = true,
  className,
}: {
  value: T | "";
  onChange: (next: T | "") => void;
  options: SegmentOption<T>[];
  size?: "sm" | "md";
  allowClear?: boolean;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      className={cn(
        "inline-flex rounded-md border border-border bg-background p-0.5",
        className,
      )}
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <Tooltip key={opt.value}>
            <TooltipTrigger asChild>
              <button
                role="radio"
                aria-checked={active}
                aria-label={opt.label || opt.value}
                onClick={() =>
                  onChange(active && allowClear ? "" : (opt.value as T))
                }
                className={cn(
                  "inline-flex items-center justify-center gap-1 rounded transition font-medium",
                  size === "sm"
                    ? "h-6 min-w-6 px-1.5 text-[10px]"
                    : "h-7 min-w-7 px-2 text-xs",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {opt.icon}
                {opt.text}
              </button>
            </TooltipTrigger>
            {opt.label && opt.label !== opt.text && (
              <TooltipContent>{opt.label}</TooltipContent>
            )}
          </Tooltip>
        );
      })}
    </div>
  );
}

// -----------------------------------------------------------------------------
// NumberUnit — Slider + Number input + Unit dropdown.
//
// This is THE workhorse control. Everywhere the inspector needs to set
// font-size, padding, width, height, opacity, … it goes through here so
// that:
//   - users get a slider for fast visual tweaking
//   - they get a numeric input for precision typing
//   - they can switch the unit (px / rem / % / vh / …) without having
//     to retype the number
//   - keyword values like "auto" / "none" are first-class (the slider
//     hides itself when a keyword is active)
// -----------------------------------------------------------------------------
export function NumberUnit({
  value,
  onChange,
  units = ["px", "rem", "em", "%"],
  allowAuto = false,
  allowNone = false,
  min,
  max,
  step,
  showSlider = true,
  placeholder,
}: {
  value: string;
  onChange: (next: string) => void;
  units?: CssUnit[];
  allowAuto?: boolean;
  allowNone?: boolean;
  min?: number;
  max?: number;
  step?: number;
  showSlider?: boolean;
  placeholder?: string;
}) {
  const parsed = parseValue(value);
  // Default to the first allowed unit when input is empty so unit switching
  // still works on a freshly cleared field.
  const unit: CssUnit = parsed.unit || units[0] || "px";
  const range = rangeForUnit(unit);
  const effMin = typeof min === "number" ? min : range.min;
  const effMax = typeof max === "number" ? max : range.max;
  const effStep = typeof step === "number" ? step : range.step;

  const isKeyword = parsed.isKeyword;
  const numForSlider =
    parsed.num != null
      ? Math.max(effMin, Math.min(effMax, parsed.num))
      : effMin;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => {
            // Empty field? Initialise from the iframe's computed value
            // (which `read` falls back to) instead of refusing the click.
            // Prior behaviour disabled the button entirely so the user
            // couldn't bootstrap a padding/margin/font-size that didn't
            // already have an override.
            const base = parsed.num ?? effMin ?? 0;
            onChange(stringifyValue(base - effStep, unit));
          }}
          aria-label="Decrement"
          className="flex h-7 w-6 items-center justify-center rounded border border-border bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-40"
        >
          <Minus className="h-3 w-3" />
        </button>
        <Input
          value={
            isKeyword
              ? (unit as string)
              : parsed.num != null
              ? String(parsed.num)
              : ""
          }
          onChange={(e) => {
            const raw = e.target.value.trim();
            if (raw === "") {
              onChange("");
              return;
            }
            // Allow the user to type "auto" / "none" directly.
            if (allowAuto && raw === "auto") {
              onChange("auto");
              return;
            }
            if (allowNone && raw === "none") {
              onChange("none");
              return;
            }
            const n = parseFloat(raw);
            if (Number.isNaN(n)) return;
            onChange(stringifyValue(n, unit));
          }}
          placeholder={placeholder ?? "0"}
          className="h-7 flex-1 px-2 text-xs"
          inputMode="decimal"
        />
        <button
          type="button"
          onClick={() => {
            const base = parsed.num ?? effMin ?? 0;
            onChange(stringifyValue(base + effStep, unit));
          }}
          aria-label="Increment"
          className="flex h-7 w-6 items-center justify-center rounded border border-border bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-40"
        >
          <Plus className="h-3 w-3" />
        </button>
        {/*
          Radix Select v2 throws if ANY <SelectItem> has value="" (it
          reserves "" for "no selection"). Some properties (line-height,
          opacity) are legitimately unitless, so we map "" → "unitless"
          for the option list and translate back on selection. Without
          this, opening Typography on an element that has line-height
          set crashes the entire Inspector with the error you saw in the
          screenshot ("A <Select.Item /> must have a value prop that is
          not an empty string").
        */}
        <Select
          value={(unit || "unitless") as string}
          onValueChange={(next) => {
            if (next === "auto") {
              onChange("auto");
              return;
            }
            if (next === "none") {
              onChange("none");
              return;
            }
            const realUnit = next === "unitless" ? "" : (next as CssUnit);
            // Keep the numeric value, swap the unit. If we had a keyword
            // before, default the number to 0 so the slider has something
            // to grab.
            const num = parsed.num ?? 0;
            onChange(stringifyValue(num, realUnit));
          }}
        >
          <SelectTrigger className="h-7 w-[68px] px-2 text-[11px]">
            <SelectValue placeholder="px" />
          </SelectTrigger>
          <SelectContent>
            {units.map((u) => (
              <SelectItem key={u || "unitless"} value={u || "unitless"}>
                {u || "—"}
              </SelectItem>
            ))}
            {allowAuto && <SelectItem value="auto">auto</SelectItem>}
            {allowNone && <SelectItem value="none">none</SelectItem>}
          </SelectContent>
        </Select>
      </div>
      {showSlider && !isKeyword && (
        <Slider
          value={[numForSlider]}
          min={effMin}
          max={effMax}
          step={effStep}
          onValueChange={(v) => {
            const n = Array.isArray(v) ? v[0] : (v as unknown as number);
            onChange(stringifyValue(n, unit));
          }}
          className="px-1"
        />
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// ColorControl — swatch button → popover with hex input, alpha slider,
// theme palette and a "transparent" shortcut. Native <input type=color>
// powers the actual picker so it stays cross-browser friendly without
// pulling in another color-picker dep.
// -----------------------------------------------------------------------------
export const DEFAULT_THEME_SWATCHES = [
  "#0F172A",
  "#1E293B",
  "#475569",
  "#94A3B8",
  "#E2E8F0",
  "#F8FAFC",
  "#FFFFFF",
  "#10B981", // editor emerald identity
  "#A855F7",
  "#EC4899",
  "#F43F5E",
  "#F97316",
  "#FACC15",
  "#22C55E",
  "#06B6D4",
  "#3B82F6",
];

export function ColorControl({
  value,
  onChange,
  allowAlpha = true,
  swatches = DEFAULT_THEME_SWATCHES,
}: {
  value: string;
  onChange: (next: string) => void;
  allowAlpha?: boolean;
  swatches?: string[];
}) {
  const hex = toHexColor(value);
  const alpha = colorAlpha(value);
  const isTransparent = !value || value === "transparent" || alpha === 0;

  const [draftHex, setDraftHex] = useState(hex);
  const [draftAlpha, setDraftAlpha] = useState(alpha);

  // Sync local state when the upstream value changes (e.g. selecting a
  // different element). Without this the popover would keep showing the
  // previous element's color.
  useEffect(() => {
    setDraftHex(hex);
    setDraftAlpha(alpha);
  }, [hex, alpha]);

  const commit = (nextHex: string, nextAlpha: number) => {
    onChange(allowAlpha ? composeColor(nextHex, nextAlpha) : nextHex);
  };

  const swatchStyle: React.CSSProperties = isTransparent
    ? {
        backgroundImage:
          "linear-gradient(45deg, #d1d5db 25%, transparent 25%), linear-gradient(-45deg, #d1d5db 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #d1d5db 75%), linear-gradient(-45deg, transparent 75%, #d1d5db 75%)",
        backgroundSize: "8px 8px",
        backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
      }
    : { backgroundColor: value || hex };

  return (
    <div className="flex items-center gap-1.5">
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Pick color"
            className="h-7 w-9 shrink-0 rounded border border-border transition hover:ring-2 hover:ring-primary/40"
            style={swatchStyle}
          />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={6}
          className="w-64 space-y-3 p-3"
        >
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={draftHex}
              onChange={(e) => {
                setDraftHex(e.target.value);
                commit(e.target.value, draftAlpha);
              }}
              className="h-9 w-12 cursor-pointer rounded border border-border bg-background"
            />
            <Input
              value={draftHex}
              onChange={(e) => {
                const v = e.target.value;
                setDraftHex(v);
                if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) {
                  commit(v, draftAlpha);
                }
              }}
              placeholder="#000000"
              className="h-8 flex-1 font-mono text-xs"
              spellCheck={false}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => commit("#00000000", 0)}
                  className="flex h-8 w-8 items-center justify-center rounded border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  aria-label="Transparent"
                >
                  <Pipette className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Transparent</TooltipContent>
            </Tooltip>
          </div>

          {allowAlpha && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Opacity
                </Label>
                <span className="text-[10px] tabular-nums text-muted-foreground">
                  {Math.round(draftAlpha * 100)}%
                </span>
              </div>
              <Slider
                value={[Math.round(draftAlpha * 100)]}
                min={0}
                max={100}
                step={1}
                onValueChange={(v) => {
                  const next = (Array.isArray(v) ? v[0] : v) / 100;
                  setDraftAlpha(next);
                  commit(draftHex, next);
                }}
              />
            </div>
          )}

          <div>
            <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Palette
            </Label>
            <div className="mt-1 grid grid-cols-8 gap-1">
              {swatches.map((sw) => (
                <button
                  key={sw}
                  type="button"
                  onClick={() => {
                    setDraftHex(sw);
                    setDraftAlpha(1);
                    commit(sw, 1);
                  }}
                  className="h-6 w-6 rounded border border-border transition hover:scale-110"
                  style={{ backgroundColor: sw }}
                  aria-label={sw}
                  title={sw}
                />
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Input
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder="transparent"
        className="h-7 flex-1 px-2 font-mono text-[11px]"
        spellCheck={false}
      />
    </div>
  );
}

// -----------------------------------------------------------------------------
// SpacingBox / RadiusBox / BorderBox — visual 4-side editors. They share
// the same chrome (a faux box with inputs at top/right/bottom/left + a
// link toggle that locks all four sides to the same value).
// -----------------------------------------------------------------------------
type Side = "top" | "right" | "bottom" | "left";
const SIDES: Side[] = ["top", "right", "bottom", "left"];

function FourSideEditor({
  values,
  onChange,
  units = ["px", "rem", "%"],
  variant = "spacing",
}: {
  values: Record<Side, string>;
  onChange: (next: Record<Side, string>) => void;
  units?: CssUnit[];
  variant?: "spacing" | "radius";
}) {
  // Linked editing — when on, changing any side updates all four. Default
  // to "linked" when all four sides match (covers fresh defaults like
  // padding: 16px).
  const allEqual = SIDES.every((s) => values[s] === values.top);
  const [linked, setLinked] = useState<boolean>(allEqual);

  useEffect(() => {
    if (allEqual && !linked) setLinked(true);
  }, [allEqual, linked]);

  const setSide = (side: Side, next: string) => {
    if (linked) {
      onChange({ top: next, right: next, bottom: next, left: next });
    } else {
      onChange({ ...values, [side]: next });
    }
  };

  // The four inputs are positioned around a faux box so the user gets
  // an at-a-glance spatial mental model (Figma / Webflow style). For
  // `spacing` we draw the standard "outer = margin, inner = padding"
  // layered preview that pro design tools use; the editor focuses on
  // ONE layer at a time (the parent block decides via `variant`).
  const isSpacing = variant === "spacing";
  return (
    <div className="space-y-2">
      <div className="relative mx-auto flex h-36 w-full max-w-[280px] select-none items-center justify-center">
        {/* Layered preview rectangles — gives the user the at-a-glance
            depth cue that Figma/Webflow use. The outer ring is dimmer so
            the eye lands on the inner box first. */}
        <div
          className={cn(
            "absolute inset-0 rounded border border-dashed",
            isSpacing
              ? "border-amber-400/50 bg-amber-500/5"
              : "border-border bg-muted/20",
          )}
        />
        <div
          className={cn(
            "relative flex h-20 w-44 items-center justify-center border border-dashed",
            isSpacing
              ? "border-sky-400/60 bg-sky-500/10"
              : "border-border bg-card/60",
            variant === "radius" && "rounded-md",
          )}
        >
          <button
            type="button"
            onClick={() => setLinked((v) => !v)}
            aria-pressed={linked}
            aria-label={linked ? "Unlink sides" : "Link sides"}
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold transition",
              linked
                ? "bg-primary text-primary-foreground shadow"
                : "bg-background text-muted-foreground border border-border hover:text-foreground",
            )}
            title={linked ? "Linked" : "Independent"}
          >
            {linked ? "⛓" : "⛓̸"}
          </button>
        </div>
        {/* Top */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2">
          <SideInput
            value={values.top}
            onChange={(v) => setSide("top", v)}
            units={units}
            label={variant === "radius" ? "Top-left" : "Top"}
          />
        </div>
        {/* Right */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          <SideInput
            value={values.right}
            onChange={(v) => setSide("right", v)}
            units={units}
            label={variant === "radius" ? "Top-right" : "Right"}
          />
        </div>
        {/* Bottom */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
          <SideInput
            value={values.bottom}
            onChange={(v) => setSide("bottom", v)}
            units={units}
            label={variant === "radius" ? "Bottom-right" : "Bottom"}
          />
        </div>
        {/* Left */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2">
          <SideInput
            value={values.left}
            onChange={(v) => setSide("left", v)}
            units={units}
            label={variant === "radius" ? "Bottom-left" : "Left"}
          />
        </div>
      </div>
      <div className="text-center text-[10px] text-muted-foreground">
        Tip — drag a value horizontally to scrub. Hold <kbd className="rounded border border-border bg-muted px-1">Shift</kbd> for ×10.
      </div>
    </div>
  );
}

function SideInput({
  value,
  onChange,
  units,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  units: CssUnit[];
  label: string;
}) {
  const parsed = parseValue(value);
  const unit: CssUnit = parsed.unit || units[0] || "px";

  // Pointer-driven scrub. Pointer-down captures the value at that
  // instant and tracks the dx in pixels, mapping 1px of horizontal
  // movement to 1 step of the field's natural unit (with Shift = ×10
  // for power users). We use a ref instead of state to keep the
  // movement loop cheap — we only call `onChange` when the integer
  // delta changes.
  const startRef = useRef<{
    pointerId: number;
    startX: number;
    startNum: number;
  } | null>(null);

  const stepForUnit = (u: CssUnit): number => {
    if (u === "rem" || u === "em") return 0.25;
    if (u === "%") return 1;
    return 1; // px / default
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // primary button only
    // Don't hijack the actual <input> when the user is trying to
    // type — only scrub from outside the input (the unit chip etc.)
    if ((e.target as HTMLElement).tagName === "INPUT") return;
    const startNum = parsed.num ?? 0;
    startRef.current = { pointerId: e.pointerId, startX: e.clientX, startNum };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!startRef.current) return;
    if (e.pointerId !== startRef.current.pointerId) return;
    const dx = e.clientX - startRef.current.startX;
    const step = stepForUnit(unit) * (e.shiftKey ? 10 : 1);
    const next = startRef.current.startNum + dx * step;
    const rounded =
      unit === "rem" || unit === "em"
        ? Math.round(next * 100) / 100
        : Math.round(next);
    onChange(stringifyValue(rounded, unit));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!startRef.current) return;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(
        startRef.current.pointerId,
      );
    } catch {
      /* ignore */
    }
    startRef.current = null;
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="flex cursor-ew-resize items-center rounded border border-border bg-background shadow-sm transition hover:border-primary/50"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <input
            value={parsed.num != null ? String(parsed.num) : ""}
            onChange={(e) => {
              const raw = e.target.value.trim();
              if (raw === "") {
                onChange("");
                return;
              }
              const n = parseFloat(raw);
              if (Number.isNaN(n)) return;
              onChange(stringifyValue(n, unit));
            }}
            placeholder="0"
            className="h-7 w-12 cursor-text bg-transparent px-1.5 text-center text-[11px] outline-none"
            inputMode="decimal"
            aria-label={label}
          />
          <span className="px-1 text-[9px] text-muted-foreground">
            {unit}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent>{label} — drag horizontally to scrub</TooltipContent>
    </Tooltip>
  );
}

export function SpacingBox({
  prefix,
  read,
  write,
  units,
}: {
  /** "padding" or "margin" — used to assemble per-side prop names. */
  prefix: "padding" | "margin";
  read: (prop: string) => string;
  write: (prop: string, value: string) => void;
  units?: CssUnit[];
}) {
  const values = useMemo(
    () => ({
      top: read(`${prefix}Top`),
      right: read(`${prefix}Right`),
      bottom: read(`${prefix}Bottom`),
      left: read(`${prefix}Left`),
    }),
    [prefix, read],
  );

  return (
    <FourSideEditor
      values={values}
      onChange={(next) => {
        write(`${prefix}Top`, next.top);
        write(`${prefix}Right`, next.right);
        write(`${prefix}Bottom`, next.bottom);
        write(`${prefix}Left`, next.left);
      }}
      units={units}
      variant="spacing"
    />
  );
}

export function RadiusBox({
  read,
  write,
  units,
}: {
  read: (prop: string) => string;
  write: (prop: string, value: string) => void;
  units?: CssUnit[];
}) {
  const values = useMemo(
    () => ({
      // CSS shorthand corner order is TL → TR → BR → BL.
      top: read("borderTopLeftRadius"),
      right: read("borderTopRightRadius"),
      bottom: read("borderBottomRightRadius"),
      left: read("borderBottomLeftRadius"),
    }),
    [read],
  );

  return (
    <FourSideEditor
      values={values}
      onChange={(next) => {
        write("borderTopLeftRadius", next.top);
        write("borderTopRightRadius", next.right);
        write("borderBottomRightRadius", next.bottom);
        write("borderBottomLeftRadius", next.left);
      }}
      units={units}
      variant="radius"
    />
  );
}

// -----------------------------------------------------------------------------
// BorderBox — width + style + color picker. We only surface the "all sides"
// case in a single block; per-side overrides are rare and easily added
// later if the user asks.
// -----------------------------------------------------------------------------
const BORDER_STYLES: Array<{ value: string; label: string }> = [
  { value: "none", label: "None" },
  { value: "solid", label: "Solid" },
  { value: "dashed", label: "Dashed" },
  { value: "dotted", label: "Dotted" },
  { value: "double", label: "Double" },
  { value: "groove", label: "Groove" },
  { value: "ridge", label: "Ridge" },
];

export function BorderBox({
  read,
  write,
}: {
  read: (prop: string) => string;
  write: (prop: string, value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Field label="Width">
        <NumberUnit
          value={read("borderWidth")}
          onChange={(v) => write("borderWidth", v)}
          units={["px", "rem", "em"]}
          min={0}
          max={32}
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Style">
          <Select
            value={read("borderStyle") || "none"}
            onValueChange={(v) => write("borderStyle", v)}
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              {BORDER_STYLES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Color">
          <ColorControl
            value={read("borderColor")}
            onChange={(v) => write("borderColor", v)}
          />
        </Field>
      </div>
    </div>
  );
}
