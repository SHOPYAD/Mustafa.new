import { getPwaSettings } from "@/lib/server/pwa-store";
import {
  buildWebManifest,
  manifestLocale,
  manifestResponse,
} from "@/lib/server/pwa-manifest";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const settings = await getPwaSettings();
  const locale = manifestLocale(request);
  return manifestResponse(
    buildWebManifest({
      settings,
      kind: "public",
      locale,
      enabled: settings.enabledPublic,
    })
  );
}
