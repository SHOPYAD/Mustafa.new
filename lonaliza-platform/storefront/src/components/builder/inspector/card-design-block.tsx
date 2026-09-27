"use client";

/* Agent E: settings panel + card design */

import { useBuilderStore, type SelectedElement } from "@/lib/builder/editor-store";
import type { CardStyleKey, SectionStyles } from "@/lib/visual-editor/schema";
import { ColorControl, Field, NumberUnit } from "./controls/index";
import { Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui";
import type { ElementStyleApi } from "./use-element-style";

const BORDER_STYLES = ["solid", "dashed", "dotted", "double", "none"] as const;

function readStyle(styles: SectionStyles, key: CardStyleKey): string {
  const value = styles[key];
  return typeof value === "string" ? value : "";
}

export function CardDesignBlock({
  selected,
}: {
  selected: SelectedElement;
  api: ElementStyleApi;
}) {
  const theme = useBuilderStore((s) => s.theme);
  const updateSectionStyles = useBuilderStore((s) => s.updateSectionStyles);
  const instanceId = selected.sectionInstanceId;
  const section = theme.layout.find((item) => item.instanceId === instanceId);
  if (!instanceId || !section) {
    return (
      <div className="px-3 pb-3 text-[11px] text-muted-foreground">
        Select a service section to edit card design. Live titles, prices, and images stay in the
        control panel.
      </div>
    );
  }

  const write = (key: CardStyleKey, value: string) => {
    updateSectionStyles(instanceId, { [key]: value });
  };

  const styles = section.styles;

  return (
    <div className="space-y-3 px-3 pb-3 pt-1">
      <p className="text-[10px] leading-relaxed text-muted-foreground">
        Visual tokens only. Card content (title, price, image, airport code) still comes from the
        admin catalog.
      </p>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Card width">
          <NumberUnit
            value={readStyle(styles, "cardWidth")}
            onChange={(v) => write("cardWidth", v)}
            units={["%", "px", "rem"]}
            allowAuto
          />
        </Field>
        <Field label="Min height">
          <NumberUnit
            value={readStyle(styles, "cardMinHeight")}
            onChange={(v) => write("cardMinHeight", v)}
            units={["px", "rem"]}
            min={0}
            max={640}
          />
        </Field>
      </div>

      <Field label="Cards per row (desktop)">
        <Select
          value={readStyle(styles, "cardColumns") || "4"}
          onValueChange={(v) => write("cardColumns", v)}
        >
          <SelectTrigger className="h-7 text-xs">
            <SelectValue placeholder="4" />
          </SelectTrigger>
          <SelectContent>
            {["1", "2", "3", "4", "5", "6"].map((n) => (
              <SelectItem key={n} value={n}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Card background">
        <ColorControl
          value={readStyle(styles, "cardBackground")}
          onChange={(v) => write("cardBackground", v)}
        />
      </Field>

      <div>
        <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Border
        </Label>
        <div className="mt-1.5 grid grid-cols-2 gap-2">
          <NumberUnit
            value={readStyle(styles, "cardBorderWidth") || "1px"}
            onChange={(v) => write("cardBorderWidth", v)}
            units={["px"]}
            min={0}
            max={12}
          />
          <Select
            value={readStyle(styles, "cardBorderStyle") || "solid"}
            onValueChange={(v) => write("cardBorderStyle", v)}
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BORDER_STYLES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="mt-2">
          <ColorControl
            value={readStyle(styles, "cardBorderColor")}
            onChange={(v) => write("cardBorderColor", v)}
          />
        </div>
      </div>

      <Field label="Radius">
        <NumberUnit
          value={readStyle(styles, "cardRadius") || "16px"}
          onChange={(v) => write("cardRadius", v)}
          units={["px", "rem", "%"]}
          min={0}
          max={48}
        />
      </Field>

      <Field label="Padding">
        <NumberUnit
          value={readStyle(styles, "cardPadding")}
          onChange={(v) => write("cardPadding", v)}
          units={["px", "rem"]}
          min={0}
          max={64}
        />
      </Field>

      <Field label="Shadow">
        <Input
          value={readStyle(styles, "cardShadow")}
          onChange={(e) => write("cardShadow", e.target.value)}
          placeholder="0 16px 40px -28px rgba(5,23,65,.35)"
          className="h-7 font-mono text-[11px]"
        />
      </Field>

      <Field label="Image height">
        <NumberUnit
          value={readStyle(styles, "cardImageHeight") || "176px"}
          onChange={(v) => write("cardImageHeight", v)}
          units={["px", "rem"]}
          min={80}
          max={420}
        />
      </Field>

      <div className="grid grid-cols-3 gap-2">
        <Field label="Title">
          <NumberUnit
            value={readStyle(styles, "cardTitleSize") || "16px"}
            onChange={(v) => write("cardTitleSize", v)}
            units={["px", "rem"]}
            min={10}
            max={40}
          />
        </Field>
        <Field label="Desc">
          <NumberUnit
            value={readStyle(styles, "cardDescSize") || "14px"}
            onChange={(v) => write("cardDescSize", v)}
            units={["px", "rem"]}
            min={10}
            max={28}
          />
        </Field>
        <Field label="Price">
          <NumberUnit
            value={readStyle(styles, "cardPriceSize") || "14px"}
            onChange={(v) => write("cardPriceSize", v)}
            units={["px", "rem"]}
            min={10}
            max={32}
          />
        </Field>
      </div>

      <div className="border-t border-border pt-3">
        <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Buttons
        </Label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Field label="Radius">
            <NumberUnit
              value={readStyle(styles, "buttonRadius") || "12px"}
              onChange={(v) => write("buttonRadius", v)}
              units={["px", "rem"]}
              min={0}
              max={40}
            />
          </Field>
          <Field label="Padding">
            <Input
              value={readStyle(styles, "buttonPadding")}
              onChange={(e) => write("buttonPadding", e.target.value)}
              placeholder="10px 20px"
              className="h-7 text-xs"
            />
          </Field>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Field label="Background">
            <ColorControl value={readStyle(styles, "buttonBg")} onChange={(v) => write("buttonBg", v)} />
          </Field>
          <Field label="Text">
            <ColorControl
              value={readStyle(styles, "buttonColor")}
              onChange={(v) => write("buttonColor", v)}
            />
          </Field>
        </div>
        <Field label="Border" className="mt-2">
          <Input
            value={readStyle(styles, "buttonBorder")}
            onChange={(e) => write("buttonBorder", e.target.value)}
            placeholder="1px solid transparent"
            className="h-7 font-mono text-[11px]"
          />
        </Field>
        <Field label="Hover background" className="mt-2">
          <ColorControl
            value={readStyle(styles, "buttonHoverBg")}
            onChange={(v) => write("buttonHoverBg", v)}
          />
        </Field>
      </div>
    </div>
  );
}
