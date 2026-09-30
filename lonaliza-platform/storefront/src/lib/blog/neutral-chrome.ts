/** On a non-Turkey blog article, chrome labels must not say تركيا. */
export function neutralBlogLabel(label: string, pathname: string | null): string {
  if (!pathname?.includes("/blog/")) return label;
  const slug = decodeURIComponent(pathname.split("/blog/")[1] || "").split(/[?#]/)[0].toLowerCase();
  if (/turkey|trabzon|istanbul|guide-turkey|طرابزون|اسطنبول|إسطنبول/.test(slug)) return label;
  if (!label.includes("تركيا")) return label;
  return label
    .replace(/تركيا/g, "")
    .replace(/\s+/g, " ")
    .replace("جولات اليومية", "جولات يومية")
    .replace(/،\s*$/g, "")
    .trim();
}
