/** Rounded client-facing money — never raw IEEE floats like 517.688999999999. */
export function formatClientPrice(amount: number, currency = "USD", locale = "en"): string {
  const n = Number(amount);
  const safe = Number.isFinite(n) ? n : 0;
  const rounded = Math.round(safe * 100) / 100;
  const loc = locale === "ar" ? "en-US" : locale === "tr" ? "tr-TR" : "en-US";
  const whole = Number.isInteger(rounded);
  const formatted = rounded.toLocaleString(loc, {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  });
  const mark =
    currency === "USD" || !currency
      ? "$"
      : currency === "EUR"
        ? "€"
        : currency === "GBP"
          ? "£"
          : `${currency} `;
  return `${mark}${formatted}`;
}

export function roundedClientTotal(amount?: number): number {
  const n = Number(amount);
  return Number.isFinite(n) ? Math.round(n) : 0;
}
