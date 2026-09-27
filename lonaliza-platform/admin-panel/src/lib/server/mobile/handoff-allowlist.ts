export {
  MOBILE_HANDOFF_PATHS,
  isHandoffPath,
} from "@/lib/server/mobile/app-surfaces";

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
