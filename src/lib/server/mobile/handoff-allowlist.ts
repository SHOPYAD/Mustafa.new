export const MOBILE_HANDOFF_PATHS = ["/ai-chat", "/community", "/community/reels"] as const;

export function isHandoffPath(raw: string): raw is (typeof MOBILE_HANDOFF_PATHS)[number] {
  const path = raw.trim().split("?")[0]?.split("#")[0] || "";
  return (MOBILE_HANDOFF_PATHS as readonly string[]).includes(path);
}

export function isEmbeddedWebViewUserAgent(ua: string): boolean {
  const value = ua.toLowerCase();
  return (
    value.includes("; wv)") ||
    value.includes(" wv)") ||
    value.includes("webview") ||
    value.includes("fbav") ||
    value.includes("instagram")
  );
}
