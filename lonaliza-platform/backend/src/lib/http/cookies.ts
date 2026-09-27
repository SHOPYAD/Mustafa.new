export function readRequestCookie(req: Request, name: string): string | null {
  const raw = req.headers.get("cookie") || "";
  const parts = raw.split(";");
  for (const part of parts) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("=") || "");
  }
  return null;
}

export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for") || "";
  const first = forwarded.split(",")[0]?.trim();
  if (first) return first;
  return req.headers.get("x-real-ip")?.trim() || "";
}
