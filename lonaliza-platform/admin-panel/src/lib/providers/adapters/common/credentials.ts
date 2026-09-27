import { getProviderRuntime } from "@/lib/server/providers-registry-store";
import type { CatalogProviderId } from "@/lib/providers/types";

export async function getAdapterCredentials(providerId: CatalogProviderId): Promise<{
  enabled: boolean;
  mode: "sandbox" | "production";
  fields: Record<string, string>;
}> {
  const runtime = await getProviderRuntime(providerId);
  return {
    enabled: Boolean(runtime.enabled),
    mode: runtime.mode || "sandbox",
    fields: runtime.fields || {},
  };
}
