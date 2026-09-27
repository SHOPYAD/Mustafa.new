import type { BlockId } from "./blocks";
import type { SelectedElement } from "@/lib/builder/editor-store";
import { isServiceCardSection } from "@/lib/visual-editor/card-design";
import { looksLikeImageBinding, looksLikeUrl } from "@/lib/visual-editor/live-bind";
import { logoListKindForSection, parseLogoField } from "@/lib/visual-editor/logo-lists";

const TEXT_TAGS = new Set([
  "p",
  "span",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "a",
  "button",
  "label",
  "li",
  "blockquote",
  "strong",
  "em",
  "small",
  "code",
]);

const ICON_TAGS = new Set(["i", "svg"]);
const VOID_NO_TEXT_TAGS = new Set(["img", "input", "video", "iframe"]);

export function getApplicableBlocks(selected: SelectedElement | null): Set<BlockId> {
  const applicable = new Set<BlockId>([
    "identity",
    "box",
    "border",
    "effects",
    "layout",
    "position",
    "animation",
    "advanced",
  ]);
  if (!selected) return applicable;

  const tag = (selected.tagName || "").toLowerCase();
  const id = selected.id || "";
  const computed = selected.currentStyles || {};
  const field = selected.field || "";

  const isImg = tag === "img" || tag === "picture";
  const isIcon =
    ICON_TAGS.has(tag) ||
    /Icon$/i.test(id) ||
    /\bisax\b|\bfa-(solid|regular|brands)\b|\blucide:/.test(id) ||
    /\bisax\b|\bfa-(solid|regular|brands)\b|\blucide:/.test(String(computed.className || ""));

  const isImageNode =
    looksLikeImageBinding(field, tag, selected.src) ||
    isImg ||
    looksLikeUrl(selected.src);

  const isTextHolder =
    TEXT_TAGS.has(tag) ||
    (!VOID_NO_TEXT_TAGS.has(tag) &&
      !isImg &&
      !isIcon &&
      !isImageNode &&
      !!(selected.text && selected.text.trim().length > 0));

  const isPlaceholderField = tag === "input" || tag === "textarea";
  const classHint = String(computed.className || id || "");
  const isFormLabel = tag === "label" && /\bform-label\b/.test(classHint);

  if ((isTextHolder || isPlaceholderField) && !isImageNode) applicable.add("content");

  const isButtonLike = tag === "button" || (tag === "a" && /\bbtn\b/.test(classHint));
  if (isButtonLike || isFormLabel || /^search\.tab\./.test(id) || /^tab\./.test(field)) {
    applicable.add("inlineContent");
    applicable.add("icon");
  }
  if (isTextHolder && !isImageNode) applicable.add("typography");
  if (isIcon) applicable.add("icon");
  if (isImageNode) applicable.add("image");
  if (!isImageNode && selected.field && !isTextHolder && !isPlaceholderField) {
    applicable.add("content");
  }
  if (!selected.isInsideButton) applicable.add("background");
  if (isServiceCardSection(selected.sectionType)) applicable.add("cardDesign");
  if (
    logoListKindForSection(selected.sectionType, field) ||
    parseLogoField(field) ||
    field === "marquee" ||
    field === "airlines" ||
    field === "hotels"
  ) {
    applicable.add("logos");
  }

  return applicable;
}

export function sortBlocks<T extends { id: BlockId }>(
  blocks: T[],
  applicable: Set<BlockId>
): { primary: T[]; hidden: T[] } {
  const primary: T[] = [];
  const hidden: T[] = [];
  for (const b of blocks) {
    if (applicable.has(b.id)) primary.push(b);
    else hidden.push(b);
  }
  return { primary, hidden };
}
