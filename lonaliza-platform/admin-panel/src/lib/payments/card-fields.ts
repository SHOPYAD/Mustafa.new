export type ParsedCardInput = {
  cardHolderName: string;
  cardNumber: string;
  expireMonth: string;
  expireYear: string;
  cvc: string;
};

export type PublicSavedCard = {
  id: string;
  brand: string;
  last4: string;
  expireMonth?: string;
  expireYear?: string;
  cardAlias?: string;
  isDefault?: boolean;
  createdAt?: string;
};

const SENSITIVE_KEYS = /^(cardNumber|cvc|cvv|pan|cardHolderName|expireMonth|expireYear)$/i;

export function digitsOnly(value: string): string {
  return String(value || "").replace(/\D/g, "");
}

export function formatCardNumberDisplay(value: string): string {
  return digitsOnly(value).slice(0, 19).replace(/(.{4})/g, "$1 ").trim();
}

export function luhnOk(pan: string): boolean {
  const digits = digitsOnly(pan);
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let n = Number(digits[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function detectCardBrand(pan: string): string {
  const d = digitsOnly(pan);
  if (/^4/.test(d)) return "Visa";
  if (/^3[47]/.test(d)) return "Amex";
  if (/^(5[1-5]|2[2-7])/.test(d)) return "Mastercard";
  if (/^9792|^979/.test(d)) return "Troy";
  if (/^6(?:011|5)/.test(d)) return "Discover";
  return "Card";
}

export function last4Of(pan: string): string {
  const d = digitsOnly(pan);
  return d.slice(-4);
}

export function parseExpiry(raw: string): { month: string; year: string } | null {
  const digits = digitsOnly(raw);
  if (digits.length === 4) {
    const month = digits.slice(0, 2);
    const year = `20${digits.slice(2, 4)}`;
    return { month, year };
  }
  if (digits.length === 6) {
    return { month: digits.slice(0, 2), year: digits.slice(2, 6) };
  }
  const parts = String(raw || "").split(/[/\s-]+/).filter(Boolean);
  if (parts.length >= 2) {
    const month = digitsOnly(parts[0]).padStart(2, "0").slice(-2);
    let year = digitsOnly(parts[1]);
    if (year.length === 2) year = `20${year}`;
    return { month, year };
  }
  return null;
}

export function expiryIsValid(month: string, year: string, now = new Date()): boolean {
  const m = Number(month);
  const y = Number(year);
  if (!Number.isInteger(m) || m < 1 || m > 12) return false;
  if (!Number.isInteger(y) || y < now.getFullYear() || y > now.getFullYear() + 25) return false;
  const end = new Date(y, m, 0, 23, 59, 59);
  return end.getTime() >= now.getTime();
}

export function parseCardForm(input: {
  cardHolderName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
}): { ok: true; card: ParsedCardInput } | { ok: false; error: string } {
  const cardHolderName = String(input.cardHolderName || "").replace(/\s+/g, " ").trim();
  if (cardHolderName.length < 2) return { ok: false, error: "cardholder_required" };
  const cardNumber = digitsOnly(input.cardNumber);
  if (!luhnOk(cardNumber)) return { ok: false, error: "card_number_invalid" };
  const exp = parseExpiry(input.expiry);
  if (!exp || !expiryIsValid(exp.month, exp.year)) return { ok: false, error: "expiry_invalid" };
  const cvc = digitsOnly(input.cvc);
  if (cvc.length < 3 || cvc.length > 4) return { ok: false, error: "cvc_invalid" };
  return {
    ok: true,
    card: {
      cardHolderName,
      cardNumber,
      expireMonth: exp.month,
      expireYear: exp.year,
      cvc,
    },
  };
}

/** Drop PAN/CVV so snapshots, logs, and JSON stores never persist raw card data. */
export function redactPaymentPayload<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => redactPaymentPayload(item)) as T;
  }
  if (!value || typeof value !== "object") return value;
  const out: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.test(key)) continue;
    out[key] = redactPaymentPayload(nested);
  }
  return out as T;
}

export function assertNoRawCardData(value: unknown): void {
  const json = JSON.stringify(value || {});
  if (/"cvc"\s*:\s*"\d{3,4}"/i.test(json) || /"cardNumber"\s*:\s*"\d{12,}"/i.test(json)) {
    throw new Error("raw_card_data_forbidden");
  }
}
