import { ALL_PROVIDER_IDS, PROVIDER_LABEL_AR, PROVIDER_LABEL_EN } from "./constants";
import { httpAdapterHandlers } from "./providers/http-adapters";
import { socialAdapterHandlers } from "./providers/social-adapter";
import { stubHandler, stubHandlers } from "./providers/stubs";
import type { PublishContext, PublishProviderHandler, PublishProviderResult } from "./types";

export type PublishRegistry = {
  get: (id: string) => PublishProviderHandler;
  list: () => PublishProviderHandler[];
  ids: () => string[];
};

export function createPublishRegistry(
  extra: PublishProviderHandler[] = []
): PublishRegistry {
  const map = new Map<string, PublishProviderHandler>();
  for (const handler of [
    ...stubHandlers(),
    ...socialAdapterHandlers(),
    ...httpAdapterHandlers(),
    ...extra,
  ]) {
    map.set(handler.id, handler);
  }
  return {
    get(id: string) {
      return map.get(id) || stubHandler(id);
    },
    list() {
      const known = ALL_PROVIDER_IDS.map((id) => map.get(id) || stubHandler(id));
      const extras = [...map.values()].filter((h) => !ALL_PROVIDER_IDS.includes(h.id as never));
      return [...known, ...extras];
    },
    ids() {
      return this.list().map((h) => h.id);
    },
  };
}

let defaultRegistry: PublishRegistry | null = null;

export function getPublishRegistry(): PublishRegistry {
  if (!defaultRegistry) defaultRegistry = createPublishRegistry();
  return defaultRegistry;
}

/** Test helper: replace the singleton. */
export function setPublishRegistryForTests(registry: PublishRegistry | null): void {
  defaultRegistry = registry;
}

export async function dispatchProvider(
  provider: string,
  ctx: PublishContext,
  registry = getPublishRegistry()
): Promise<PublishProviderResult> {
  const handler = registry.get(provider);
  return handler.publish(ctx);
}

export function listProviderCatalog(registry = getPublishRegistry()): Array<{
  id: string;
  label: string;
  labelAr: string;
  implemented: boolean;
}> {
  return registry.list().map((h) => ({
    id: h.id,
    label: h.label || PROVIDER_LABEL_EN[h.id] || h.id,
    labelAr: h.labelAr || PROVIDER_LABEL_AR[h.id] || h.id,
    implemented: h.implemented,
  }));
}
