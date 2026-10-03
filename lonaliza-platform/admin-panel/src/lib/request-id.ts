export function resolveRequestId(incoming: string | null | undefined): string {
  const trimmed = (incoming || "").trim();
  if (trimmed.length >= 8 && trimmed.length <= 128) return trimmed.slice(0, 128);
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export const REQUEST_ID_HEADER = "x-request-id";
