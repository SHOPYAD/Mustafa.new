/** Copy that must never appear in Alrayyan payment / policy UI. */
const PAY_AT_PROPERTY_RE =
  /لا حاجة لأي دفعة|ستدفع في مكان الإقامة|بدون دفع مقدم|الدفع في الفندق|الدفع عند الإقامة|pay at (the )?(property|hotel|stay)|no (need for )?(any )?(advance |upfront )?prepayment|no prepayment|pay later|ön ödeme yok|otelde öde|konaklamada öde/i;

export function isPayAtPropertyCopy(text: string): boolean {
  return PAY_AT_PROPERTY_RE.test(String(text || "").replace(/\s+/g, " ").trim());
}

export function rejectPayAtPropertyLines(lines: string[]): string[] {
  return lines.filter((line) => !isPayAtPropertyCopy(line));
}
