import { NOT_IMPLEMENTED_AR, PROVIDER_LABEL_AR, PROVIDER_LABEL_EN, STUB_PROVIDERS } from "../constants";
import type { PublishContext, PublishProviderHandler, PublishProviderResult } from "../types";

export function stubHandler(id: string): PublishProviderHandler {
  return {
    id,
    label: PROVIDER_LABEL_EN[id] || id,
    labelAr: PROVIDER_LABEL_AR[id] || id,
    implemented: false,
    publish: async (): Promise<PublishProviderResult> => ({
      ok: false,
      provider: id,
      error: {
        code: "not_implemented",
        message: `${NOT_IMPLEMENTED_AR} (${id})`,
        retryable: false,
      },
    }),
  };
}

export function stubHandlers(): PublishProviderHandler[] {
  return STUB_PROVIDERS.map((id) => stubHandler(id));
}

export function notImplementedResult(
  provider: string,
  _ctx?: PublishContext
): PublishProviderResult {
  return {
    ok: false,
    provider,
    error: {
      code: "not_implemented",
      message: `${NOT_IMPLEMENTED_AR} (${provider})`,
      retryable: false,
    },
  };
}
