import { describe, expect, it } from "vitest";
import { IMPLEMENTED_PROVIDERS, STUB_PROVIDERS } from "./constants";
import {
  createPublishRegistry,
  dispatchProvider,
  listProviderCatalog,
} from "./registry";
import { HTTP_ADAPTER_IDS } from "./providers/http-adapters";
import { stubHandler } from "./providers/stubs";
import type { PublishContext, PublishProviderHandler, PublishPost, StoredPublishChannel } from "./types";

function fakeCtx(provider: string): PublishContext {
  const post: PublishPost = {
    id: "p1",
    state: "queue",
    publishDate: new Date().toISOString(),
    channelId: "c1",
    content: "تجربة",
    delay: 0,
    group: "",
    settings: { approved: true },
    creationMethod: "web",
  };
  const channel: StoredPublishChannel = {
    id: "c1",
    provider,
    name: "test",
    disabled: false,
    refreshNeeded: false,
    accessTokenEnc: "",
    refreshTokenEnc: "",
    pageAccessTokenEnc: "",
    extra: {},
  };
  return {
    post,
    channel,
    approved: true,
    caption: "تجربة",
    mediaUrls: [],
    accessToken: "token",
  };
}

const HTTP_IDS = new Set<string>(HTTP_ADAPTER_IDS);
const STILL_STUBBED = STUB_PROVIDERS.filter((id) => !HTTP_IDS.has(id));

describe("publish provider registry", () => {
  const registry = createPublishRegistry();

  it("marks the five existing social platforms as implemented", () => {
    for (const id of IMPLEMENTED_PROVIDERS) {
      const handler = registry.get(id);
      expect(handler.implemented).toBe(true);
      expect(handler.id).toBe(id);
    }
  });

  it("marks tourism-priority HTTP adapters as implemented", () => {
    for (const id of HTTP_ADAPTER_IDS) {
      const handler = registry.get(id);
      expect(handler.implemented).toBe(true);
      expect(handler.id).toBe(id);
    }
  });

  it("has no leftover Postiz stubs once HTTP adapters are registered", () => {
    expect(STILL_STUBBED).toEqual([]);
    for (const id of STUB_PROVIDERS) {
      expect(registry.get(id).implemented).toBe(true);
    }
  });

  it("unknown ids are stubs so the UI can list them later", async () => {
    const handler = registry.get("nostr_custom");
    expect(handler.implemented).toBe(false);
    const result = await dispatchProvider("nostr_custom", fakeCtx("nostr_custom"), registry);
    expect(result.error?.code).toBe("not_implemented");
  });

  it("catalog includes implemented + stub ids", () => {
    const catalog = listProviderCatalog(registry);
    const ids = catalog.map((row) => row.id);
    expect(ids).toEqual(expect.arrayContaining([...IMPLEMENTED_PROVIDERS, ...STUB_PROVIDERS]));
    expect(catalog.find((row) => row.id === "facebook")?.implemented).toBe(true);
    expect(catalog.find((row) => row.id === "linkedin")?.implemented).toBe(true);
    expect(catalog.find((row) => row.id === "linkedin")?.labelAr).toBe("لينكدإن");
    expect(catalog.find((row) => row.id === "telegram")?.implemented).toBe(true);
    expect(catalog.find((row) => row.id === "threads")?.implemented).toBe(true);
    expect(catalog.find((row) => row.id === "gmb")?.implemented).toBe(true);
    expect(catalog.find((row) => row.id === "pinterest")?.implemented).toBe(true);
    expect(catalog.find((row) => row.id === "wrapcast")?.implemented).toBe(true);
    expect(catalog.find((row) => row.id === "wrapcast")?.labelAr).toBe("فاركاستر");
  });

  it("extra handlers override defaults (for tests, no live network)", async () => {
    let called = 0;
    const fake: PublishProviderHandler = {
      ...stubHandler("facebook"),
      implemented: true,
      publish: async () => {
        called += 1;
        return { ok: true, provider: "facebook", releaseId: "local-1" };
      },
    };
    const custom = createPublishRegistry([fake]);
    const result = await custom.get("facebook").publish(fakeCtx("facebook"));
    expect(called).toBe(1);
    expect(result.ok).toBe(true);
    expect(result.releaseId).toBe("local-1");
  });
});
