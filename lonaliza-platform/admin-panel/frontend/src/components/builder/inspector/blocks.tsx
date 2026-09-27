"use client";

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  ArrowRight,
  Box as BoxIcon,
  Code2,
  Image as ImageIcon,
  Images,
  Italic,
  Layers,
  LayoutDashboard,
  Monitor,
  MousePointer,
  Palette,
  Smartphone,
  Smile,
  Sparkles,
  Square,
  Strikethrough,
  Tablet,
  Type,
  Underline,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/builder/cn";
import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui";
import { useBuilderStore, type SelectedElement } from "@/lib/builder/editor-store";
import {
  BorderBox,
  ColorControl,
  Field,
  NumberUnit,
  RadiusBox,
  SegmentedIcons,
  SpacingBox,
} from "./controls/index";
import { GradientBuilder, ShadowStack } from "./controls/effects";
import { FontFamilyCombobox, injectGoogleFontInIframe } from "./controls/font-family";
import { IconPicker, isEmojiValue } from "./controls/icon-picker";
import { PresetGrid } from "./controls/preset-grid";
import { BORDER_PRESETS } from "./controls/presets";
import type { ElementStyleApi } from "./use-element-style";
import {
  parseHeroPackages,
  pickCopy,
  sectionLabel,
  serializeHeroPackages,
} from "@/lib/visual-editor/schema";
import {
  iconSettingKeyForField,
  imageSettingKeyForField,
  looksLikeImageBinding,
  normalizeSearchTabField,
  unwrapCssUrl,
  withCacheBust,
} from "@/lib/visual-editor/live-bind";
import {
  parseLogoField,
  readLogoList,
  replaceLogoUrl,
  serializeLogoList,
  LOGO_LIST_SETTING,
} from "@/lib/visual-editor/logo-lists";
import { buildOverlayCss, parseOverlaySettings } from "@/lib/visual-editor/overlay-style";
import { MediaPicker } from "@/components/editor/MediaPicker";
import { CardDesignBlock } from "./card-design-block";
import { LogosBlock } from "./logos-block";
import { useLocale } from "@/lib/i18n/LocaleProvider";

function InspectorMediaField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#0b1220] p-2">
      <MediaPicker value={value} onChange={onChange} placeholder={placeholder} compact />
    </div>
  );
}

function looksLikeImageField(selected: SelectedElement): boolean {
  return looksLikeImageBinding(selected.field, selected.tagName, selected.src);
}

function BlockBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("space-y-3 px-3 pb-3 pt-1 group", className)}>{children}</div>;
}

export function IdentityBlock({
  selected,
  api,
}: {
  selected: SelectedElement;
  api: ElementStyleApi;
}) {
  const setSelectedElement = useBuilderStore((s) => s.setSelectedElement);
  const { t } = useLocale();
  return (
    <BlockBody>
      <div className="rounded-md border border-border bg-muted/30 p-2">
        <div className="flex items-center gap-1.5">
          <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-primary">
            {selected.tagName?.toLowerCase() || t.editor.inspectorElementFallback}
          </span>
          {selected.label ? (
            <span className="truncate text-xs font-medium">{selected.label}</span>
          ) : null}
          {api.isInstanceScoped ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                  {t.editor.inspectorInstance}
                </span>
              </TooltipTrigger>
              <TooltipContent>{t.editor.inspectorInstanceHint}</TooltipContent>
            </Tooltip>
          ) : null}
        </div>
        <div className="mt-1 truncate font-mono text-[10px] text-muted-foreground">{selected.id}</div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="text-[10px] text-muted-foreground">
          {api.hasAnyOverride ? t.editor.inspectorHasOverrides : t.editor.inspectorUsingDefaults}
        </div>
        <div className="flex items-center gap-1">
          {api.hasAnyOverride ? (
            <button
              type="button"
              onClick={api.clearAll}
              className="rounded border border-border bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground transition hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
            >
              {t.editor.inspectorResetAll}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setSelectedElement(null)}
            className="rounded border border-border bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            {t.editor.inspectorDeselect}
          </button>
        </div>
      </div>
    </BlockBody>
  );
}

export function ContentBlock({
  selected,
  api,
}: {
  selected: SelectedElement;
  api: ElementStyleApi;
}) {
  const { t } = useLocale();
  const theme = useBuilderStore((s) => s.theme);
  const locale = useBuilderStore((s) => s.locale);
  const setElementContent = useBuilderStore((s) => s.setElementContent);
  const tag = (selected.tagName || "").toLowerCase();
  const isPlaceholderField = tag === "input" || tag === "textarea";
  const section = theme.layout.find((item) => item.instanceId === selected.sectionInstanceId);
  /* Agent L2: live inspector bind — this node's field only, never a sibling */
  const boundField = normalizeSearchTabField(selected.field) || selected.field;
  const storeValue =
    boundField && section?.texts[boundField]
      ? pickCopy(section.texts[boundField], locale)
      : boundField && section?.texts[selected.field || ""]
        ? pickCopy(section.texts[selected.field || ""], locale)
        : "";
  const leafText = (selected.text || "").trim();

  if (isPlaceholderField) {
    const displayValue = api.hasBaseOverride("placeholder")
      ? api.readBase("placeholder")
      : selected.currentStyles?.placeholder || selected.text || "";
    return (
      <BlockBody>
        <Field label={t.editor.inspectorPlaceholderText} hint={t.editor.inspectorPlaceholderHint}>
          <Input
            value={displayValue}
            onChange={(e) => api.write("placeholder", e.target.value)}
            placeholder={selected.text || t.editor.inspectorEnterPlaceholder}
            className="h-8 text-xs"
          />
        </Field>
      </BlockBody>
    );
  }

  const persistText = (value: string) => {
    api.writeBase("content", value);
    if (selected.sectionInstanceId && boundField) {
      setElementContent(selected.sectionInstanceId, boundField, locale, value);
    }
  };

  if (looksLikeImageField(selected)) {
    return null;
  }

  const displayValue = storeValue || leafText || api.readBase("content") || "";

  return (
    <BlockBody>
      <Field
        label={t.editor.inspectorTextContent}
        hint={t.editor.inspectorInlineHint}
      >
        <Textarea
          value={displayValue}
          onChange={(e) => persistText(e.target.value)}
          placeholder={selected.text || t.editor.inspectorEnterText}
          className="min-h-[80px] text-xs"
        />
      </Field>
    </BlockBody>
  );
}

function gapLooksUnset(value: string): boolean {
  return !value || value === "normal" || value === "0px";
}

function isIconClassish(value: string): boolean {
  return /^(isax|fa-|fab |fas |far |fal |fad |bi |bx |ti |ph )/i.test(value.trim());
}

export function InlineContentBlock({
  api,
  selected,
}: {
  selected: SelectedElement;
  api: ElementStyleApi;
}) {
  const { t } = useLocale();
  const theme = useBuilderStore((s) => s.theme);
  const updateSectionSettings = useBuilderStore((s) => s.updateSectionSettings);
  const tag = (selected.tagName || "").toLowerCase();
  const isFormLabel =
    tag === "label" && /\bform-label\b/.test(String(selected.currentStyles?.className || ""));
  const flexDirection = api.read("flexDirection") || api.readComputed("flexDirection") || "row";
  const iconPosition = flexDirection === "row-reverse" ? "right" : "left";
  const direction = api.read("direction") || "";
  const gap =
    api.read("gap") || api.readComputed("gap") || (gapLooksUnset(api.readComputed("gap")) ? "8px" : "");
  const section = theme.layout.find((item) => item.instanceId === selected.sectionInstanceId);
  const iconKey = iconSettingKeyForField(selected.field);
  const settingIcon =
    iconKey && section && typeof section.settings[iconKey] === "string"
      ? String(section.settings[iconKey])
      : "";
  const cls = api.read("className") || "";
  const iconValue =
    settingIcon ||
    api.readBase("icon") ||
    (isIconClassish(cls) ? cls : "") ||
    api.readBase("content") ||
    "";

  const ensureFlex = () => {
    const display = api.read("display") || api.readComputed("display") || "";
    if (!/flex|inline-flex/.test(display)) {
      api.write("display", isFormLabel ? "inline-flex" : "flex");
    }
  };

  const persistIcon = (next: string) => {
    /* Agent L2: live inspector bind */
    if (isEmojiValue(next)) {
      api.write("icon", next);
      api.write("content", next);
    } else {
      api.write("icon", next);
      api.write("iconClass", next);
    }
    if (selected.sectionInstanceId && iconKey) {
      updateSectionSettings(selected.sectionInstanceId, { [iconKey]: next });
    }
  };

  return (
    <BlockBody>
      <Field label={t.editor.inspectorIcon} hint={t.editor.inspectorIconLibraryHint}>
        <IconPicker value={iconValue} onChange={persistIcon} />
      </Field>
      <Field label={t.editor.inspectorIconPosition}>
        <SegmentedIcons
          value={iconPosition}
          onChange={(v) => {
            ensureFlex();
            api.write("alignItems", "center");
            api.write("flexDirection", v === "right" ? "row-reverse" : "row");
          }}
          options={[
            { value: "left", label: t.editor.inspectorIconLeft, icon: <ArrowLeft className="h-3 w-3" /> },
            { value: "right", label: t.editor.inspectorIconRight, icon: <ArrowRight className="h-3 w-3" /> },
          ]}
        />
      </Field>
      <Field label={t.editor.inspectorTextDirection} hint={t.editor.inspectorRtlHint}>
        <Select value={direction || "auto"} onValueChange={(v) => api.write("direction", v === "auto" ? "" : v)}>
          <SelectTrigger className="h-7 text-xs">
            <SelectValue placeholder={t.editor.inspectorDirAuto} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">{t.editor.inspectorDirPageDefault}</SelectItem>
            <SelectItem value="ltr">{t.editor.inspectorDirLtr}</SelectItem>
            <SelectItem value="rtl">{t.editor.inspectorDirRtl}</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label={isFormLabel ? t.editor.inspectorIconLabelGap : t.editor.inspectorIconTextGap}>
        <NumberUnit
          value={gapLooksUnset(gap) ? "8px" : gap}
          onChange={(value) => {
            ensureFlex();
            api.write("gap", value);
          }}
          units={["px", "rem"]}
          min={0}
          max={64}
        />
      </Field>
    </BlockBody>
  );
}

export function IconBlock({
  selected,
  api,
}: {
  selected: SelectedElement;
  api: ElementStyleApi;
}) {
  const { t } = useLocale();
  const theme = useBuilderStore((s) => s.theme);
  const updateSectionSettings = useBuilderStore((s) => s.updateSectionSettings);
  const cls = api.read("className") || "";
  const txt = api.readBase("content") || "";
  const seedText = selected.text || "";
  const section = theme.layout.find((item) => item.instanceId === selected.sectionInstanceId);
  const iconKey = iconSettingKeyForField(selected.field);
  const settingIcon =
    iconKey && section && typeof section.settings[iconKey] === "string"
      ? String(section.settings[iconKey])
      : "";
  const pickerValue =
    settingIcon ||
    api.readBase("icon") ||
    (cls && !isEmojiValue(cls) ? cls : txt || (isEmojiValue(seedText) ? seedText : ""));
  return (
    <BlockBody>
      <Field label={t.editor.inspectorIcon} hint={t.editor.inspectorIconPickerHint}>
        <IconPicker
          value={pickerValue}
          onChange={(next) => {
            /* Agent L2: live inspector bind */
            if (!next) {
              api.write("className", "");
              api.write("content", "");
              api.write("icon", "");
              if (selected.sectionInstanceId && iconKey) {
                updateSectionSettings(selected.sectionInstanceId, { [iconKey]: "" });
              }
              return;
            }
            if (isEmojiValue(next)) {
              api.write("className", "");
              api.write("content", next);
              api.write("icon", next);
            } else {
              api.write("icon", next);
              api.write("iconClass", next);
              api.write("content", "");
            }
            if (selected.sectionInstanceId && iconKey) {
              updateSectionSettings(selected.sectionInstanceId, { [iconKey]: next });
            }
          }}
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label={t.editor.inspectorColor}>
          <ColorControl value={api.read("color")} onChange={(v) => api.write("color", v)} />
        </Field>
        <Field label={t.editor.inspectorSize}>
          <NumberUnit
            value={api.read("fontSize") || "16px"}
            onChange={(v) => api.write("fontSize", v)}
            units={["px", "rem", "em"]}
            min={8}
            max={120}
          />
        </Field>
      </div>
    </BlockBody>
  );
}

function splitBgLayers(value: string): { gradient: string; url: string } {
  if (!value) return { gradient: "", url: "" };
  const urlMatch = value.match(/url\(\s*['"]?([^)'"]+)['"]?\s*\)/);
  const url = urlMatch ? urlMatch[1] : "";
  const gradient = value
    .replace(/url\(\s*['"]?[^)'"]+['"]?\s*\)/g, "")
    .replace(/^[\s,]+|[\s,]+$/g, "")
    .trim();
  return { gradient, url };
}

function joinBgLayers({ gradient, url }: { gradient: string; url: string }): string {
  const parts: string[] = [];
  if (gradient) parts.push(gradient);
  if (url) parts.push(`url('${url}')`);
  return parts.join(", ");
}

export function ImageBlock({
  selected,
  api,
}: {
  selected: SelectedElement;
  api: ElementStyleApi;
}) {
  const { t } = useLocale();
  const theme = useBuilderStore((s) => s.theme);
  const locale = useBuilderStore((s) => s.locale);
  const updateSectionSettings = useBuilderStore((s) => s.updateSectionSettings);
  const setElementContent = useBuilderStore((s) => s.setElementContent);
  const section = theme.layout.find((item) => item.instanceId === selected.sectionInstanceId);
  const tag = (selected.tagName || "").toLowerCase();
  const isImg = tag === "img" || tag === "picture" || Boolean(selected.src);
  const bgRaw = api.read("backgroundImage") || "";
  const { url: computedBgUrl } = splitBgLayers(bgRaw);
  const hasElementSrc = isImg;
  const hasBgImage = Boolean(computedBgUrl);
  const imageKey = imageSettingKeyForField(selected.field, selected.tagName);
  const fromSettings =
    section && typeof section.settings[imageKey] === "string"
      ? unwrapCssUrl(String(section.settings[imageKey]))
      : "";
  const srcValue = unwrapCssUrl(
    fromSettings || api.read("src") || selected.src || ""
  );
  const bgValue = unwrapCssUrl(fromSettings || computedBgUrl);

  const persistImage = (raw: string, asBackground: boolean) => {
    const v = withCacheBust(unwrapCssUrl(raw));
    if (asBackground) {
      const { gradient } = splitBgLayers(bgRaw);
      api.write("backgroundImage", joinBgLayers({ gradient, url: v }));
    } else {
      api.write("src", v);
    }
    if (!selected.sectionInstanceId) return;
    const patch: Record<string, string> = { [imageKey]: v };
    if (
      selected.sectionType === "hero" &&
      (!selected.field || selected.field === "image" || selected.field === "src")
    ) {
      patch.image = v;
    }
    const logoRef = parseLogoField(selected.field);
    if (logoRef && section) {
      const items = replaceLogoUrl(readLogoList(section, logoRef.kind), logoRef.id, v);
      patch[LOGO_LIST_SETTING[logoRef.kind]] = serializeLogoList(items);
    }
    const pkg = selected.field?.match(/^hero-pkg-(.+)$/);
    if (pkg?.[1] && section) {
      const items = parseHeroPackages(section.settings).map((item) =>
        item.id === pkg[1] ? { ...item, image: v } : item
      );
      patch.heroPackagesJson = serializeHeroPackages(items);
    }
    updateSectionSettings(selected.sectionInstanceId, patch);
    if (selected.field && !logoRef) {
      setElementContent(selected.sectionInstanceId, selected.field, locale, v);
    }
  };

  return (
    <BlockBody>
      {hasElementSrc ? (
        <Field label={t.editor.inspectorElementImage} hint={t.editor.inspectorMediaHint}>
          <InspectorMediaField value={srcValue} onChange={(next) => persistImage(next, false)} />
        </Field>
      ) : null}
      {hasBgImage || !hasElementSrc ? (
        <Field label={t.editor.inspectorBackgroundImage} hint={t.editor.inspectorMediaHint}>
          <InspectorMediaField value={bgValue} onChange={(next) => persistImage(next, true)} />
        </Field>
      ) : null}
      <div className="grid grid-cols-2 gap-2">
        <Field label={t.editor.inspectorObjectFit}>
          <Select value={api.read("objectFit") || ""} onValueChange={(v) => api.write("objectFit", v)}>
            <SelectTrigger className="h-7 text-xs">
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cover">cover</SelectItem>
              <SelectItem value="contain">contain</SelectItem>
              <SelectItem value="fill">fill</SelectItem>
              <SelectItem value="none">none</SelectItem>
              <SelectItem value="scale-down">scale-down</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label={t.editor.inspectorObjectPosition}>
          <Input
            value={api.read("objectPosition") || ""}
            onChange={(e) => api.write("objectPosition", e.target.value)}
            placeholder="center"
            className="h-7 text-xs"
          />
        </Field>
      </div>
    </BlockBody>
  );
}

function fontWeightOptions(t: { editor: {
  inspectorWeightThin: string;
  inspectorWeightExtraLight: string;
  inspectorWeightLight: string;
  inspectorWeightRegular: string;
  inspectorWeightMedium: string;
  inspectorWeightSemibold: string;
  inspectorWeightBold: string;
  inspectorWeightExtraBold: string;
  inspectorWeightBlack: string;
} }) {
  return [
    { value: "100", label: t.editor.inspectorWeightThin },
    { value: "200", label: t.editor.inspectorWeightExtraLight },
    { value: "300", label: t.editor.inspectorWeightLight },
    { value: "400", label: t.editor.inspectorWeightRegular },
    { value: "500", label: t.editor.inspectorWeightMedium },
    { value: "600", label: t.editor.inspectorWeightSemibold },
    { value: "700", label: t.editor.inspectorWeightBold },
    { value: "800", label: t.editor.inspectorWeightExtraBold },
    { value: "900", label: t.editor.inspectorWeightBlack },
  ];
}

const TEXT_TRANSFORMS = [
  { value: "none", label: "Aa" },
  { value: "uppercase", label: "AA" },
  { value: "lowercase", label: "aa" },
  { value: "capitalize", label: "Ab" },
];

export function TypographyBlock({ api }: { selected: SelectedElement; api: ElementStyleApi }) {
  const { t } = useLocale();
  return (
    <BlockBody>
      <Field label={t.editor.inspectorFontFamily}>
        <FontFamilyCombobox
          value={api.read("fontFamily")}
          onChange={(v) => {
            api.write("fontFamily", v);
            if (v) injectGoogleFontInIframe(v);
          }}
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label={t.editor.inspectorSize}>
          <NumberUnit
            value={api.read("fontSize")}
            onChange={(v) => api.write("fontSize", v)}
            units={["px", "rem", "em"]}
            min={8}
            max={200}
          />
        </Field>
        <Field label={t.editor.inspectorLineHeight}>
          <NumberUnit
            value={api.read("lineHeight")}
            onChange={(v) => api.write("lineHeight", v)}
            units={["", "px", "em"]}
            min={0.8}
            max={3}
            step={0.05}
          />
        </Field>
      </div>
      <Field label={t.editor.inspectorWeight}>
        <Select value={api.read("fontWeight") || ""} onValueChange={(v) => api.write("fontWeight", v)}>
          <SelectTrigger className="h-7 text-xs">
            <SelectValue placeholder="—" />
          </SelectTrigger>
          <SelectContent>
            {fontWeightOptions(t).map((w) => (
              <SelectItem key={w.value} value={w.value}>
                {w.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label={t.editor.inspectorLetterSpacing}>
          <NumberUnit
            value={api.read("letterSpacing")}
            onChange={(v) => api.write("letterSpacing", v)}
            units={["px", "em"]}
            min={-5}
            max={20}
            step={0.1}
          />
        </Field>
        <Field label={t.editor.inspectorColor}>
          <ColorControl value={api.read("color")} onChange={(v) => api.write("color", v)} />
        </Field>
      </div>
      <Field label={t.editor.inspectorAlignment}>
        <SegmentedIcons
          value={(api.read("textAlign") as "left" | "center" | "right" | "justify" | "") || ""}
          onChange={(v) => api.write("textAlign", v)}
          options={[
            { value: "left", label: t.editor.inspectorAlignLeft, icon: <AlignLeft className="h-3 w-3" /> },
            { value: "center", label: t.editor.inspectorAlignCenter, icon: <AlignCenter className="h-3 w-3" /> },
            { value: "right", label: t.editor.inspectorAlignRight, icon: <AlignRight className="h-3 w-3" /> },
            { value: "justify", label: t.editor.inspectorAlignJustify, icon: <AlignJustify className="h-3 w-3" /> },
          ]}
        />
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label={t.editor.inspectorStyle}>
          <SegmentedIcons
            value={(api.read("fontStyle") as "italic" | "") || ""}
            onChange={(v) => api.write("fontStyle", v)}
            options={[{ value: "italic", label: t.editor.inspectorItalic, icon: <Italic className="h-3 w-3" /> }]}
          />
        </Field>
        <Field label={t.editor.inspectorDecoration}>
          <SegmentedIcons
            value={(api.read("textDecorationLine") as "underline" | "line-through" | "") || ""}
            onChange={(v) => api.write("textDecorationLine", v)}
            options={[
              { value: "underline", label: t.editor.inspectorUnderline, icon: <Underline className="h-3 w-3" /> },
              { value: "line-through", label: t.editor.inspectorStrike, icon: <Strikethrough className="h-3 w-3" /> },
            ]}
          />
        </Field>
      </div>
      <Field label={t.editor.inspectorTransform}>
        <SegmentedIcons
          value={(api.read("textTransform") as "none" | "uppercase" | "lowercase" | "capitalize" | "") || ""}
          onChange={(v) => api.write("textTransform", v)}
          options={TEXT_TRANSFORMS.map((t) => ({
            value: t.value as "none" | "uppercase" | "lowercase" | "capitalize",
            label: t.value,
            text: t.label,
          }))}
        />
      </Field>
    </BlockBody>
  );
}

export function BackgroundBlock({
  selected,
  api,
}: {
  selected: SelectedElement;
  api: ElementStyleApi;
}) {
  const { t } = useLocale();
  const theme = useBuilderStore((s) => s.theme);
  const updateSectionStyles = useBuilderStore((s) => s.updateSectionStyles);
  const updateSectionSettings = useBuilderStore((s) => s.updateSectionSettings);
  const section = theme.layout.find((item) => item.instanceId === selected.sectionInstanceId);
  const raw = api.read("backgroundImage") || "";
  const { gradient, url } = splitBgLayers(raw);
  const isOverlay = selected.field === "overlay" || selected.field === "decoOverlay";
  const overlay = parseOverlaySettings(section?.settings, section?.styles.overlay);

  const persistOverlay = (next: { color?: string; opacity?: number; image?: string }) => {
    if (!selected.sectionInstanceId || !section) return;
    const merged = {
      color: next.color ?? overlay.color,
      opacity: next.opacity ?? overlay.opacity,
      image: next.image ?? overlay.image,
    };
    const css = buildOverlayCss(merged);
    updateSectionSettings(selected.sectionInstanceId, {
      overlayColor: merged.color,
      overlayOpacity: String(merged.opacity),
      overlayImage: merged.image,
    });
    updateSectionStyles(selected.sectionInstanceId, { overlay: css });
    api.write("backgroundImage", css);
    api.write("backgroundColor", "transparent");
  };

  return (
    <BlockBody>
      {isOverlay ? (
        <>
          <Field label={t.editor.inspectorOverlayColor}>
            <ColorControl value={overlay.color} onChange={(v) => persistOverlay({ color: v })} />
          </Field>
          <Field label={t.editor.inspectorOverlayOpacity}>
            <NumberUnit
              value={String(overlay.opacity)}
              onChange={(v) => persistOverlay({ opacity: Number(String(v).replace(/[^\d.]/g, "")) })}
              units={[""]}
              min={0}
              max={1}
              step={0.05}
            />
          </Field>
          <Field label={t.editor.inspectorOverlayImage} hint={t.editor.inspectorMediaHint}>
            <InspectorMediaField
              value={overlay.image}
              onChange={(v) => persistOverlay({ image: unwrapCssUrl(v) })}
            />
          </Field>
        </>
      ) : (
        <>
          <Field label={t.editor.inspectorBackgroundColor}>
            <ColorControl value={api.read("backgroundColor")} onChange={(v) => api.write("backgroundColor", v)} />
          </Field>
          <Field label={t.editor.inspectorBackgroundImage}>
            <InspectorMediaField
              value={url}
              onChange={(v) => api.write("backgroundImage", joinBgLayers({ gradient, url: unwrapCssUrl(v) }))}
            />
          </Field>
          <Field label={t.editor.inspectorColorOverlay}>
            <GradientBuilder
              value={gradient}
              onChange={(v) => api.write("backgroundImage", joinBgLayers({ gradient: v, url }))}
            />
          </Field>
        </>
      )}
    </BlockBody>
  );
}

export function BoxBlock({ api }: { selected: SelectedElement; api: ElementStyleApi }) {
  const { t } = useLocale();
  return (
    <BlockBody>
      <div className="space-y-3">
        <div>
          <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t.editor.inspectorPadding}
          </Label>
          <SpacingBox prefix="padding" read={api.read} write={api.write} units={["px", "rem", "%"]} />
        </div>
        <div>
          <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t.editor.inspectorMargin}
          </Label>
          <SpacingBox prefix="margin" read={api.read} write={api.write} units={["px", "rem", "%"]} />
        </div>
      </div>
    </BlockBody>
  );
}

export function BorderBlock({ api }: { selected: SelectedElement; api: ElementStyleApi }) {
  const { t } = useLocale();
  return (
    <BlockBody>
      <details open>
        <summary className="flex cursor-pointer items-center justify-between rounded px-1 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">
          <span>{t.editor.inspectorPresets}</span>
        </summary>
        <PresetGrid
          className="mt-1.5"
          columns={3}
          items={BORDER_PRESETS.map((p) => ({
            id: p.id,
            label: p.label,
            swatch: (
              <span
                className="h-7 w-7 bg-card"
                style={{
                  borderWidth: p.borderWidth,
                  borderStyle: p.borderStyle as React.CSSProperties["borderStyle"],
                  borderColor: p.borderColor,
                  borderRadius: p.borderRadius,
                }}
              />
            ),
            hint: `${p.borderWidth} ${p.borderStyle} • ${p.borderRadius}`,
          }))}
          onSelect={(item) => {
            const next = BORDER_PRESETS.find((p) => p.id === item.id);
            if (!next) return;
            api.write("borderWidth", next.borderWidth);
            api.write("borderStyle", next.borderStyle);
            api.write("borderColor", next.borderColor);
            api.write("borderRadius", next.borderRadius);
          }}
        />
      </details>
      <div>
        <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t.editor.inspectorBorder}
        </Label>
        <BorderBox read={api.read} write={api.write} />
      </div>
      <div>
        <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t.editor.inspectorCornerRadius}
        </Label>
        <RadiusBox read={api.read} write={api.write} units={["px", "rem", "%"]} />
      </div>
    </BlockBody>
  );
}

function extractBlur(raw: string): string {
  const m = raw.match(/blur\(\s*([^)]+)\s*\)/);
  return m ? m[1].trim() : "";
}

export function EffectsBlock({ api }: { selected: SelectedElement; api: ElementStyleApi }) {
  const { t } = useLocale();
  return (
    <BlockBody>
      <Field label={t.editor.inspectorOpacity}>
        <NumberUnit
          value={api.read("opacity") || ""}
          onChange={(v) => api.write("opacity", v)}
          units={[""]}
          min={0}
          max={1}
          step={0.05}
        />
      </Field>
      <div>
        <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {t.editor.inspectorBoxShadow}
        </Label>
        <ShadowStack value={api.read("boxShadow") || ""} onChange={(v) => api.write("boxShadow", v)} />
      </div>
      <Field label={t.editor.inspectorBackdropBlur}>
        <NumberUnit
          value={extractBlur(api.read("backdropFilter") || "")}
          onChange={(v) => api.write("backdropFilter", v ? `blur(${v})` : "")}
          units={["px"]}
          min={0}
          max={64}
        />
      </Field>
    </BlockBody>
  );
}

export function LayoutBlock({
  selected,
  api,
}: {
  selected: SelectedElement;
  api: ElementStyleApi;
}) {
  const tag = (selected.tagName || "").toLowerCase();
  const display = api.read("display") || api.readComputed("display") || "";
  const isButtonLike =
    tag === "button" ||
    (tag === "a" && /\bbtn\b/.test(String(selected.currentStyles?.className || selected.id || "")));
  const isFlex = /flex|grid/.test(display) || isButtonLike;
  const { t } = useLocale();
  return (
    <BlockBody>
      <Field label={t.editor.inspectorDisplay}>
        <Select value={display} onValueChange={(v) => api.write("display", v)}>
          <SelectTrigger className="h-7 text-xs">
            <SelectValue placeholder="—" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="block">block</SelectItem>
            <SelectItem value="inline-block">inline-block</SelectItem>
            <SelectItem value="inline">inline</SelectItem>
            <SelectItem value="flex">flex</SelectItem>
            <SelectItem value="inline-flex">inline-flex</SelectItem>
            <SelectItem value="grid">grid</SelectItem>
            <SelectItem value="none">none</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      {isFlex ? (
        <>
          <div className="grid grid-cols-2 gap-2">
            <Field label={t.editor.inspectorFlexDirection}>
              <Select
                value={api.read("flexDirection") || "row"}
                onValueChange={(v) => api.write("flexDirection", v)}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="row">row</SelectItem>
                  <SelectItem value="row-reverse">row-reverse</SelectItem>
                  <SelectItem value="column">column</SelectItem>
                  <SelectItem value="column-reverse">column-reverse</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label={t.editor.inspectorGap}>
              <NumberUnit value={api.read("gap")} onChange={(v) => api.write("gap", v)} units={["px", "rem"]} />
            </Field>
          </div>
        </>
      ) : null}
      <div className="grid grid-cols-2 gap-2">
        <Field label={t.editor.inspectorWidth}>
          <NumberUnit value={api.read("width")} onChange={(v) => api.write("width", v)} units={["px", "%", "rem", "vw"]} allowAuto />
        </Field>
        <Field label={t.editor.inspectorHeight}>
          <NumberUnit value={api.read("height")} onChange={(v) => api.write("height", v)} units={["px", "%", "rem", "vh"]} allowAuto />
        </Field>
      </div>
    </BlockBody>
  );
}

export function PositionBlock({ api }: { selected: SelectedElement; api: ElementStyleApi }) {
  const { t } = useLocale();
  return (
    <BlockBody>
      <Field label={t.editor.inspectorPosition}>
        <Select value={api.read("position") || ""} onValueChange={(v) => api.write("position", v)}>
          <SelectTrigger className="h-7 text-xs">
            <SelectValue placeholder="static" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="static">static</SelectItem>
            <SelectItem value="relative">relative</SelectItem>
            <SelectItem value="absolute">absolute</SelectItem>
            <SelectItem value="fixed">fixed</SelectItem>
            <SelectItem value="sticky">sticky</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label={t.editor.inspectorZIndex}>
        <Input
          value={api.read("zIndex") || ""}
          onChange={(e) => api.write("zIndex", e.target.value)}
          placeholder="0"
          className="h-7 text-xs"
        />
      </Field>
    </BlockBody>
  );
}

export function AnimationBlock({ api }: { selected: SelectedElement; api: ElementStyleApi }) {
  const { t } = useLocale();
  return (
    <BlockBody>
      <Field label={t.editor.inspectorTransition}>
        <Input
          value={api.read("transition") || ""}
          onChange={(e) => api.write("transition", e.target.value)}
          placeholder="all 200ms ease"
          className="h-7 text-xs"
        />
      </Field>
      <Field label={t.editor.inspectorTransform}>
        <Input
          value={api.read("transform") || ""}
          onChange={(e) => api.write("transform", e.target.value)}
          placeholder="translateY(-4px)"
          className="h-7 text-xs"
        />
      </Field>
    </BlockBody>
  );
}

export function AdvancedBlock({
  selected,
  api,
}: {
  selected: SelectedElement;
  api: ElementStyleApi;
}) {
  const { t } = useLocale();
  const locale = useBuilderStore((s) => s.locale);
  const theme = useBuilderStore((s) => s.theme);
  const hideSection = useBuilderStore((s) => s.hideSection);
  const section = theme.layout.find((item) => item.instanceId === selected.sectionInstanceId);
  return (
    <BlockBody>
      <Field label={t.editor.inspectorVisibility} hint={t.editor.inspectorVisibilityHint}>
        <Select
          value={api.read("display") === "none" ? "hidden" : "visible"}
          onValueChange={(v) => api.write("display", v === "hidden" ? "none" : "")}
        >
          <SelectTrigger className="h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="visible">{t.editor.inspectorVisible}</SelectItem>
            <SelectItem value="hidden">{t.editor.inspectorHidden}</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      {section ? (
        <label className="flex items-center gap-2 text-xs text-foreground">
          <input
            type="checkbox"
            checked={!section.hidden}
            onChange={(e) => hideSection(section.instanceId, !e.target.checked)}
          />
          {t.editor.inspectorShowSection}
          {section.type ? ` (${pickCopy(sectionLabel(section.type), locale)})` : ""}
        </label>
      ) : null}
      <Field label={t.editor.inspectorCustomClass}>
        <Input
          value={api.read("className") || ""}
          onChange={(e) => api.write("className", e.target.value)}
          placeholder="rounded-xl shadow-md"
          className="h-7 font-mono text-xs"
          spellCheck={false}
        />
      </Field>
      <Field label={t.editor.inspectorCustomCss}>
        <Textarea
          value={api.read("customCss") || ""}
          onChange={(e) => api.write("customCss", e.target.value)}
          placeholder="filter: hue-rotate(45deg);"
          className="min-h-[60px] font-mono text-[11px]"
          spellCheck={false}
        />
      </Field>
    </BlockBody>
  );
}

export function ResponsiveHeader({ api }: { api: ElementStyleApi }) {
  const { t } = useLocale();
  const device = useBuilderStore((s) => s.device);
  const setDevice = useBuilderStore((s) => s.setDevice);
  void api;
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-border bg-card px-3 py-2">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        {t.editor.inspectorEditingLayer}
        <span className="builder-chip">{device}</span>
      </div>
      <div className="flex items-center rounded-md border border-border bg-background p-0.5">
        {(
          [
            { id: "desktop" as const, icon: <Monitor className="h-3 w-3" /> },
            { id: "tablet" as const, icon: <Tablet className="h-3 w-3" /> },
            { id: "mobile" as const, icon: <Smartphone className="h-3 w-3" /> },
          ] as const
        ).map((d) => {
          const active = device === d.id;
          return (
            <Tooltip key={d.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setDevice(d.id)}
                  className={cn(
                    "flex h-5 w-7 items-center justify-center rounded transition",
                    active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                  )}
                  aria-label={d.id}
                >
                  {d.icon}
                </button>
              </TooltipTrigger>
              <TooltipContent>{d.id}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}

export type BlockId =
  | "identity"
  | "content"
  | "inlineContent"
  | "icon"
  | "image"
  | "logos"
  | "typography"
  | "background"
  | "box"
  | "border"
  | "effects"
  | "layout"
  | "position"
  | "animation"
  | "advanced"
  | "cardDesign";

export interface BlockMeta {
  id: BlockId;
  label: string;
  icon: React.ReactNode;
  Component: React.FC<{ selected: SelectedElement; api: ElementStyleApi }>;
  defaultOpen?: boolean;
}

export const BLOCK_REGISTRY: BlockMeta[] = [
  { id: "identity", label: "Element", icon: <MousePointer className="h-3.5 w-3.5" />, Component: IdentityBlock, defaultOpen: true },
  { id: "cardDesign", label: "Cards & buttons", icon: <Square className="h-3.5 w-3.5" />, Component: CardDesignBlock, defaultOpen: true },
  { id: "content", label: "Content", icon: <Type className="h-3.5 w-3.5" />, Component: ContentBlock, defaultOpen: true },
  { id: "inlineContent", label: "Icon & text", icon: <AlignLeft className="h-3.5 w-3.5" />, Component: InlineContentBlock, defaultOpen: true },
  { id: "icon", label: "Icon", icon: <Smile className="h-3.5 w-3.5" />, Component: IconBlock },
  { id: "image", label: "Image", icon: <ImageIcon className="h-3.5 w-3.5" />, Component: ImageBlock },
  { id: "logos", label: "Logos", icon: <Images className="h-3.5 w-3.5" />, Component: LogosBlock, defaultOpen: true },
  { id: "typography", label: "Typography", icon: <Type className="h-3.5 w-3.5" />, Component: TypographyBlock },
  { id: "background", label: "Background", icon: <Palette className="h-3.5 w-3.5" />, Component: BackgroundBlock },
  { id: "box", label: "Spacing", icon: <BoxIcon className="h-3.5 w-3.5" />, Component: BoxBlock },
  { id: "border", label: "Border & radius", icon: <Square className="h-3.5 w-3.5" />, Component: BorderBlock },
  { id: "effects", label: "Effects", icon: <Sparkles className="h-3.5 w-3.5" />, Component: EffectsBlock },
  { id: "layout", label: "Layout", icon: <LayoutDashboard className="h-3.5 w-3.5" />, Component: LayoutBlock },
  { id: "position", label: "Position", icon: <Layers className="h-3.5 w-3.5" />, Component: PositionBlock },
  { id: "animation", label: "Animation", icon: <Wand2 className="h-3.5 w-3.5" />, Component: AnimationBlock },
  { id: "advanced", label: "Advanced", icon: <Code2 className="h-3.5 w-3.5" />, Component: AdvancedBlock },
];
