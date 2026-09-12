"use client";
/**
 * Effects controls — currently:
 *   - ShadowStack    (multi-layer box-shadow editor)
 *   - GradientBuilder (linear / radial gradient stops)
 *
 * Both controls intentionally serialise their structured editing state
 * back into a single CSS string before calling `onChange`, so the rest
 * of the pipeline (`updateElementStyle` → `ThemeStyleEngine`) sees a
 * boring `box-shadow: …;` value and can keep its current CSS-emitting
 * code path.
 */
import { useEffect, useState } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/builder/cn";
import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../ui";
import { ColorControl, NumberUnit, Field } from "./index";
import { parseValue, stringifyValue } from "./value-utils";
import { useListDnd, moveItem } from "@/lib/builder/use-list-dnd";
import { PresetGrid } from "./preset-grid";
import { SHADOW_PRESETS, GRADIENT_PRESETS } from "./presets";

// -----------------------------------------------------------------------------
// ShadowStack
// Serialises to a comma-separated `box-shadow` string. Parser is
// intentionally lenient — anything we can't parse just appears as a raw
// "Custom" entry the user can still see, and edit as text via the
// fallback Input.
// -----------------------------------------------------------------------------
export interface ShadowLayer {
  inset: boolean;
  x: string;
  y: string;
  blur: string;
  spread: string;
  color: string;
}

const EMPTY_LAYER: ShadowLayer = {
  inset: false,
  x: "0px",
  y: "4px",
  blur: "12px",
  spread: "0px",
  color: "rgba(15, 23, 42, 0.18)",
};

function parseShadowList(value: string): ShadowLayer[] {
  const v = (value || "").trim();
  if (!v || v === "none") return [];
  // Split on commas that aren't inside parentheses (so rgba(...) survives).
  const parts: string[] = [];
  let depth = 0;
  let buf = "";
  for (const ch of v) {
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      parts.push(buf.trim());
      buf = "";
    } else {
      buf += ch;
    }
  }
  if (buf.trim()) parts.push(buf.trim());

  return parts.map((part): ShadowLayer => {
    const inset = /(^|\s)inset(\s|$)/i.test(part);
    const cleaned = part.replace(/(^|\s)inset(\s|$)/i, " ").trim();

    // Pull out the color first (anything matching #hex, rgb(), rgba(), hsl(),
    // or a named keyword at the end). Crude but works for the values our
    // engine actually emits.
    const colorMatch = cleaned.match(
      /(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)|[a-zA-Z]+)\s*$/,
    );
    const color = colorMatch ? colorMatch[0] : EMPTY_LAYER.color;
    const numericPart = colorMatch
      ? cleaned.slice(0, cleaned.length - colorMatch[0].length).trim()
      : cleaned;
    const tokens = numericPart.split(/\s+/).filter(Boolean);
    const [x = "0px", y = "0px", blur = "0px", spread = "0px"] = tokens;
    return { inset, x, y, blur, spread, color };
  });
}

function serializeShadowList(layers: ShadowLayer[]): string {
  if (layers.length === 0) return "none";
  return layers
    .map((l) =>
      [
        l.inset ? "inset" : "",
        l.x || "0px",
        l.y || "0px",
        l.blur || "0px",
        l.spread || "0px",
        l.color || "rgba(0,0,0,0)",
      ]
        .filter(Boolean)
        .join(" "),
    )
    .join(", ");
}

export function ShadowStack({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const [layers, setLayers] = useState<ShadowLayer[]>(() =>
    parseShadowList(value),
  );

  // Re-sync from upstream when the user picks a different element. We
  // only do this when the actual upstream string differs from what
  // we'd serialise so that mid-edit re-renders don't blow away their
  // intermediate slider state.
  useEffect(() => {
    const next = parseShadowList(value);
    if (serializeShadowList(next) !== serializeShadowList(layers)) {
      setLayers(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const commit = (next: ShadowLayer[]) => {
    setLayers(next);
    onChange(serializeShadowList(next));
  };

  const updateLayer = (idx: number, patch: Partial<ShadowLayer>) => {
    commit(layers.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  };

  const dnd = useListDnd<HTMLDivElement>((from, to) => {
    commit(moveItem(layers, from, to));
  });

  return (
    <div className="space-y-2">
      {/* Presets — instant looks. */}
      <details className="group/presets" open={layers.length === 0}>
        <summary className="flex cursor-pointer items-center justify-between rounded px-1 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">
          <span>Presets</span>
          <span className="text-[9px] font-normal text-muted-foreground">
            click to apply
          </span>
        </summary>
        <PresetGrid
          className="mt-1.5"
          columns={4}
          currentValue={value || ""}
          items={SHADOW_PRESETS.map((p) => ({
            id: p.id,
            label: p.label,
            matchKey: p.value,
            swatch:
              p.value === "none" ? (
                <span className="flex h-full w-full items-center justify-center text-[9px] font-medium text-muted-foreground">
                  —
                </span>
              ) : (
                <span
                  className="h-7 w-7 rounded border border-border bg-card"
                  style={{ boxShadow: p.value }}
                />
              ),
            hint: p.value,
          }))}
          onSelect={(item) => {
            const next = SHADOW_PRESETS.find((p) => p.id === item.id);
            if (!next) return;
            commit(parseShadowList(next.value));
          }}
        />
      </details>

      {layers.length === 0 && (
        <div className="rounded border border-dashed border-border bg-muted/30 px-3 py-4 text-center text-[11px] text-muted-foreground">
          No shadows. Pick a preset above or click{" "}
          <span className="font-semibold">Add shadow</span> to layer one in.
        </div>
      )}

      {layers.map((layer, idx) => (
        <div
          key={idx}
          {...dnd.itemRowProps(idx)}
          className={cn(
            "rounded border border-border bg-card/40 p-2 space-y-2 transition-all",
            dnd.draggingIndex === idx && "opacity-40",
            dnd.overIndex === idx &&
              dnd.draggingIndex !== idx &&
              !dnd.overAfter &&
              "border-t-2 border-t-primary",
            dnd.overIndex === idx &&
              dnd.draggingIndex !== idx &&
              dnd.overAfter &&
              "border-b-2 border-b-primary",
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span
                {...dnd.itemHandleProps(idx)}
                className="flex h-5 w-4 cursor-grab items-center justify-center text-muted-foreground transition hover:text-foreground active:cursor-grabbing"
                aria-label={`Drag to reorder shadow ${idx + 1}`}
                title="Drag to reorder"
              >
                <GripVertical className="h-3 w-3" />
              </span>
              <span
                className="h-4 w-6 rounded border border-border"
                style={{
                  boxShadow: `${layer.inset ? "inset " : ""}${layer.x} ${layer.y} ${layer.blur} ${layer.spread} ${layer.color}`,
                }}
              />
              <span className="text-[11px] font-semibold">
                Shadow {idx + 1}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Label className="text-[10px] text-muted-foreground">
                  Inset
                </Label>
                <Switch
                  checked={layer.inset}
                  onCheckedChange={(v) => updateLayer(idx, { inset: v })}
                />
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() =>
                      commit(layers.filter((_, i) => i !== idx))
                    }
                    className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Remove shadow"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Remove shadow</TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Field label="X">
              <NumberUnit
                value={layer.x}
                onChange={(v) => updateLayer(idx, { x: v })}
                units={["px", "rem"]}
                min={-200}
                max={200}
                showSlider={false}
              />
            </Field>
            <Field label="Y">
              <NumberUnit
                value={layer.y}
                onChange={(v) => updateLayer(idx, { y: v })}
                units={["px", "rem"]}
                min={-200}
                max={200}
                showSlider={false}
              />
            </Field>
            <Field label="Blur">
              <NumberUnit
                value={layer.blur}
                onChange={(v) => updateLayer(idx, { blur: v })}
                units={["px", "rem"]}
                min={0}
                max={200}
                showSlider={false}
              />
            </Field>
            <Field label="Spread">
              <NumberUnit
                value={layer.spread}
                onChange={(v) => updateLayer(idx, { spread: v })}
                units={["px", "rem"]}
                min={-100}
                max={100}
                showSlider={false}
              />
            </Field>
          </div>
          <Field label="Color">
            <ColorControl
              value={layer.color}
              onChange={(v) => updateLayer(idx, { color: v })}
            />
          </Field>
        </div>
      ))}

      <button
        type="button"
        onClick={() => commit([...layers, { ...EMPTY_LAYER }])}
        className="flex w-full items-center justify-center gap-1.5 rounded border border-dashed border-border bg-background px-2 py-1.5 text-[11px] font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
      >
        <Plus className="h-3 w-3" />
        Add shadow
      </button>
    </div>
  );
}

// -----------------------------------------------------------------------------
// GradientBuilder — edits a CSS background-image gradient. Supports the
// two formats users actually need (linear, radial) and gives them
// arbitrary stops with a colour picker per stop.
// -----------------------------------------------------------------------------
export interface GradientStop {
  color: string;
  position: string; // e.g. "0%", "100%"
}
export interface GradientValue {
  type: "linear" | "radial";
  angle: string; // for linear, e.g. "180deg"
  stops: GradientStop[];
}

const DEFAULT_GRADIENT: GradientValue = {
  type: "linear",
  angle: "180deg",
  stops: [
    { color: "rgba(124, 58, 237, 0.9)", position: "0%" },
    { color: "rgba(236, 72, 153, 0.9)", position: "100%" },
  ],
};

function parseGradient(raw: string): GradientValue | null {
  const v = (raw || "").trim();
  const linear = v.match(/^linear-gradient\s*\(([^)]+)\)$/i);
  const radial = v.match(/^radial-gradient\s*\(([^)]+)\)$/i);
  const inner = linear?.[1] ?? radial?.[1];
  if (!inner) return null;

  const tokens = splitTopLevel(inner, ",");
  let angle = "180deg";
  let startIdx = 0;
  if (tokens[0] && /\d+(deg|grad|rad|turn)\s*$/i.test(tokens[0].trim())) {
    angle = tokens[0].trim();
    startIdx = 1;
  } else if (
    tokens[0] &&
    /^(to\s+(top|bottom|left|right)(\s+(top|bottom|left|right))?)$/i.test(
      tokens[0].trim(),
    )
  ) {
    angle = tokens[0].trim();
    startIdx = 1;
  }

  const stops: GradientStop[] = tokens
    .slice(startIdx)
    .map((t) => {
      const trimmed = t.trim();
      const posMatch = trimmed.match(/(\S+)\s*(-?\d+(?:\.\d+)?(?:%|px|em|rem))$/);
      if (posMatch) {
        return { color: posMatch[1].trim(), position: posMatch[2] };
      }
      return { color: trimmed, position: "" };
    })
    .filter((s) => s.color);

  return { type: linear ? "linear" : "radial", angle, stops };
}

function splitTopLevel(s: string, sep: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let buf = "";
  for (const ch of s) {
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    if (ch === sep && depth === 0) {
      out.push(buf);
      buf = "";
    } else {
      buf += ch;
    }
  }
  if (buf) out.push(buf);
  return out;
}

function serializeGradient(g: GradientValue): string {
  const stops = g.stops
    .map((s) => `${s.color}${s.position ? ` ${s.position}` : ""}`)
    .join(", ");
  if (g.type === "linear") {
    return `linear-gradient(${g.angle}, ${stops})`;
  }
  return `radial-gradient(circle, ${stops})`;
}

export function GradientBuilder({
  value,
  onChange,
}: {
  /** Current `background-image` (or empty string for "no gradient"). */
  value: string;
  onChange: (next: string) => void;
}) {
  const initial = parseGradient(value) || DEFAULT_GRADIENT;
  const [g, setG] = useState<GradientValue>(initial);

  useEffect(() => {
    const parsed = parseGradient(value);
    if (parsed) setG(parsed);
  }, [value]);

  const commit = (next: GradientValue) => {
    setG(next);
    onChange(serializeGradient(next));
  };

  const previewCss = serializeGradient(g);
  const angleParsed = parseValue(g.angle);

  const stopDnd = useListDnd<HTMLDivElement>((from, to) => {
    commit({ ...g, stops: moveItem(g.stops, from, to) });
  });

  return (
    <div className="space-y-2">
      <div
        className="h-12 w-full rounded border border-border"
        style={{ backgroundImage: previewCss }}
        aria-label="Gradient preview"
      />

      {/* Presets — quick gradients. */}
      <details className="group/gpresets">
        <summary className="flex cursor-pointer items-center justify-between rounded px-1 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">
          <span>Presets</span>
          <span className="text-[9px] font-normal text-muted-foreground">
            click to apply
          </span>
        </summary>
        <PresetGrid
          className="mt-1.5"
          columns={5}
          currentValue={value || ""}
          items={GRADIENT_PRESETS.map((p) => ({
            id: p.id,
            label: p.label,
            matchKey: p.value,
            swatch: (
              <span
                className="h-7 w-full rounded border border-border"
                style={{ backgroundImage: p.value }}
              />
            ),
            hint: p.value,
          }))}
          onSelect={(item) => {
            const next = GRADIENT_PRESETS.find((p) => p.id === item.id);
            if (!next) return;
            const parsed = parseGradient(next.value);
            if (parsed) commit(parsed);
            else onChange(next.value);
          }}
        />
      </details>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Type">
          <Select
            value={g.type}
            onValueChange={(v) =>
              commit({ ...g, type: v as GradientValue["type"] })
            }
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="linear">Linear</SelectItem>
              <SelectItem value="radial">Radial</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        {g.type === "linear" && (
          <Field label="Angle">
            <NumberUnit
              value={
                angleParsed.unit === "deg"
                  ? g.angle
                  : stringifyValue(180, "deg")
              }
              onChange={(v) => commit({ ...g, angle: v || "180deg" })}
              units={["deg"]}
              min={0}
              max={360}
              showSlider
            />
          </Field>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            Stops
          </Label>
          <button
            type="button"
            onClick={() =>
              commit({
                ...g,
                stops: [
                  ...g.stops,
                  { color: "rgba(255,255,255,1)", position: "100%" },
                ],
              })
            }
            className="flex items-center gap-1 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <Plus className="h-3 w-3" /> Add stop
          </button>
        </div>

        {g.stops.map((stop, idx) => (
          <div
            key={idx}
            {...stopDnd.itemRowProps(idx)}
            className={cn(
              "flex items-center gap-1.5 rounded border border-border bg-card/40 p-1.5 transition-all",
              stopDnd.draggingIndex === idx && "opacity-40",
              stopDnd.overIndex === idx &&
                stopDnd.draggingIndex !== idx &&
                !stopDnd.overAfter &&
                "border-t-2 border-t-primary",
              stopDnd.overIndex === idx &&
                stopDnd.draggingIndex !== idx &&
                stopDnd.overAfter &&
                "border-b-2 border-b-primary",
            )}
          >
            <span
              {...stopDnd.itemHandleProps(idx)}
              className="flex h-5 w-3 cursor-grab items-center justify-center text-muted-foreground transition hover:text-foreground active:cursor-grabbing"
              aria-label={`Drag to reorder stop ${idx + 1}`}
              title="Drag to reorder"
            >
              <GripVertical className="h-3 w-3" />
            </span>
            <div className="flex-1">
              <ColorControl
                value={stop.color}
                onChange={(v) =>
                  commit({
                    ...g,
                    stops: g.stops.map((s, i) =>
                      i === idx ? { ...s, color: v } : s,
                    ),
                  })
                }
              />
            </div>
            <Input
              value={stop.position}
              onChange={(e) =>
                commit({
                  ...g,
                  stops: g.stops.map((s, i) =>
                    i === idx ? { ...s, position: e.target.value } : s,
                  ),
                })
              }
              placeholder="50%"
              className={cn("h-7 w-16 px-2 text-center text-xs")}
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() =>
                    commit({
                      ...g,
                      stops: g.stops.filter((_, i) => i !== idx),
                    })
                  }
                  className="flex h-7 w-7 items-center justify-center rounded text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Remove stop"
                  disabled={g.stops.length <= 2}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Remove stop</TooltipContent>
            </Tooltip>
          </div>
        ))}
      </div>
    </div>
  );
}
