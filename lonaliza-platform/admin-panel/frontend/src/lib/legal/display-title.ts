/** Prefer locale-only legal titles; drop leftover Latin parentheticals in Arabic. */
export function displayLegalTitle(title: string | undefined, locale: string): string {
  const raw = (title || "").trim();
  if (!raw) return "";
  if (locale !== "ar") return raw;
  return raw
    .replace(/\s*\([^)]*[A-Za-zÜüŞşÇçĞğİıÖö][^)]*\)/g, "")
    .replace(/\s*\/\s*[A-Za-zÜüŞşÇçĞğİıÖö][A-Za-zÜüŞşÇçĞğİıÖö\s./-]*/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.،,])/g, "$1")
    .trim();
}
