/** Sandbox Checkout Form rejects price/paidPrice >= 100,000 (TRY after our FX). */
export const IYZICO_SANDBOX_PRICE_LIMIT = 100_000;

export const SANDBOX_AMOUNT_LIMIT_ERROR = "sandbox_amount_limit";

export function sandboxConvertedAmountBlocked(
  chargedAmount: number,
  mode: "sandbox" | "production"
): boolean {
  return mode === "sandbox" && Number.isFinite(chargedAmount) && chargedAmount >= IYZICO_SANDBOX_PRICE_LIMIT;
}

export function isSandboxPriceLimitError(error?: string, errorCode?: string): boolean {
  const text = `${error || ""} ${errorCode || ""}`.trim().toLowerCase();
  if (!text) return false;
  if (text.includes(SANDBOX_AMOUNT_LIMIT_ERROR)) return true;
  if (text.includes("price should not be equal or more than")) return true;
  return (
    text.includes("price") &&
    /100[,\s.]?000/.test(text) &&
    /(equal|more than|greater|at least|>=)/.test(text)
  );
}

export function mapGuestCheckoutError(error?: string, errorCode?: string): string {
  if (isSandboxPriceLimitError(error, errorCode)) return SANDBOX_AMOUNT_LIMIT_ERROR;
  const clean = String(error || "").trim();
  if (clean) return clean;
  return String(errorCode || "").trim() || "iyzico_init_failed";
}
