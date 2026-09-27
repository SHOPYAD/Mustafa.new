/** JSON Shopping V8/V10 reject letter codes (Y/C/F/W). Official values: Economy, Business, First, Premium Economy. */
export function toPkfareCabin(cabin?: string): string {
  const c = String(cabin || "")
    .toUpperCase()
    .replace(/[\s_-]+/g, "_");
  if (c === "C" || c === "BUSINESS" || c === "J") return "Business";
  if (c === "F" || c === "FIRST") return "First";
  if (c === "W" || c === "PREMIUM_ECONOMY" || c === "PREMIUMECONOMY" || c === "PREMIUM") return "Premium Economy";
  return "Economy";
}
