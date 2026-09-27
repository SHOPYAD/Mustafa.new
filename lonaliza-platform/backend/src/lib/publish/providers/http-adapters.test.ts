import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NOT_APPROVED_AR } from "../constants";
import { createPublishRegistry } from "../registry";
import type { PublishContext, PublishPost, StoredPublishChannel } from "../types";
import { HTTP_ADAPTER_IDS } from "./http-adapters";
import type { ValidatingPublishHandler } from "./http-base";

const PNG_1x1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

function jsonResponse(body: unknown, status = 200, headers?: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function pngResponse(): Response {
  return new Response(PNG_1x1, {
    status: 200,
    headers: { "Content-Type": "image/png" },
  });
}

function fakeCtx(
  provider: string,
  patch: Partial<PublishContext> & {
    settings?: Record<string, unknown>;
    extra?: Record<string, unknown>;
  } = {}
): PublishContext {
  const post: PublishPost = {
    id: "p1",
    state: "queue",
    publishDate: new Date().toISOString(),
    channelId: "c1",
    content: patch.caption || "تجربة",
    delay: 0,
    group: "",
    settings: { approved: true, ...(patch.settings || {}) },
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
    extra: {
      externalId: "ext-1",
      pageId: "page-1",
      username: "lonaliza",
      ...(patch.extra || {}),
    },
  };
  return {
    post,
    channel,
    approved: patch.approved ?? true,
    caption: patch.caption ?? "تجربة",
    mediaUrls: patch.mediaUrls ?? [],
    accessToken: patch.accessToken === undefined ? "access-token" : patch.accessToken,
    refreshToken: patch.refreshToken,
    pageAccessToken: patch.pageAccessToken,
  };
}

describe("tourism-priority HTTP adapters", () => {
  const registry = createPublishRegistry();
  const originalFetch = globalThis.fetch;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    process.env.TELEGRAM_BOT_TOKEN = "tg-bot";
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    delete process.env.TELEGRAM_BOT_TOKEN;
    vi.restoreAllMocks();
  });

  it("registers real handlers with settings schema and maxLength", () => {
    for (const id of HTTP_ADAPTER_IDS) {
      const handler = registry.get(id) as ValidatingPublishHandler;
      expect(handler.implemented).toBe(true);
      expect(handler.maxLength).toBeGreaterThan(0);
      expect(handler.settingsSchema).toBeTruthy();
      expect(typeof handler.validate).toBe("function");
    }
  });

  it("does not call the network when approved is not true", async () => {
    for (const id of HTTP_ADAPTER_IDS) {
      const handler = registry.get(id);
      const result = await handler.publish(
        fakeCtx(id, {
          approved: false,
          settings: { board: "b1", topicType: "STANDARD" },
        })
      );
      expect(result.ok).toBe(false);
      expect(result.error?.code).toBe("not_approved");
      expect(result.error?.message).toBe(NOT_APPROVED_AR);
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns missing_credentials in Arabic when no token (no network)", async () => {
    const cases: Array<{
      id: string;
      settings?: Record<string, unknown>;
      mediaUrls?: string[];
      extra?: Record<string, unknown>;
    }> = [
      { id: "telegram", extra: { externalId: "", pageId: "" } },
      { id: "linkedin" },
      { id: "linkedin-page" },
      { id: "threads" },
      { id: "gmb" },
      {
        id: "pinterest",
        settings: { board: "111" },
        mediaUrls: ["https://cdn.example/photo.jpg"],
      },
    ];
    for (const row of cases) {
      const handler = registry.get(row.id);
      const result = await handler.publish(
        fakeCtx(row.id, {
          accessToken: "",
          settings: row.settings,
          mediaUrls: row.mediaUrls,
          extra: row.extra,
        })
      );
      expect(result.ok, row.id).toBe(false);
      expect(result.error?.code, row.id).toBe("missing_credentials");
      expect(result.error?.message, row.id).toMatch(/أعد ربط|لا يوجد/);
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("telegram: missing bot token is missing_credentials", async () => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    const result = await registry.get("telegram").publish(fakeCtx("telegram"));
    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe("missing_credentials");
    expect(result.error?.message).toMatch(/تيليغرام/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("telegram: uses pageAccessToken as bot token when env is empty", async () => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    fetchMock.mockResolvedValue(jsonResponse({ ok: true, result: { message_id: 7 } }));
    const result = await registry.get("telegram").publish(
      fakeCtx("telegram", {
        pageAccessToken: "channel-bot",
        extra: { externalId: "-10042", username: "offers" },
      })
    );
    expect(result.ok).toBe(true);
    expect(String(fetchMock.mock.calls[0]?.[0])).toMatch(/api\.telegram\.org\/botchannel-bot\/sendMessage/);
  });

  it("validates character limits without network", () => {
    const long = "س".repeat(600);
    const threads = registry.get("threads") as ValidatingPublishHandler;
    const issues = threads.validate(fakeCtx("threads", { caption: long }));
    expect(issues.some((row) => row.message.includes("500"))).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("linkedin: carousel needs 2+ images and comments are text-only", () => {
    const handler = registry.get("linkedin") as ValidatingPublishHandler;
    const carousel = handler.validate(
      fakeCtx("linkedin", {
        settings: { post_as_images_carousel: true },
        mediaUrls: ["https://cdn.example/a.jpg"],
      })
    );
    expect(carousel[0]?.message).toMatch(/كاروسيل/);

    const videoMix = handler.validate(
      fakeCtx("linkedin", {
        mediaUrls: ["https://cdn.example/a.mp4", "https://cdn.example/b.jpg"],
      })
    );
    expect(videoMix[0]?.message).toMatch(/فيديو/);

    const commentMedia = handler.validate(
      fakeCtx("linkedin", {
        settings: { firstComment: "تعليق", commentMediaUrls: ["https://cdn.example/c.jpg"] },
      })
    );
    expect(commentMedia[0]?.message).toMatch(/نص فقط/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("gmb: rejects video, extra images, and event without title", () => {
    const handler = registry.get("gmb") as ValidatingPublishHandler;
    expect(
      handler.validate(fakeCtx("gmb", { mediaUrls: ["https://cdn.example/a.mp4"] }))[0]?.message
    ).toMatch(/فيديو/);
    expect(
      handler.validate(
        fakeCtx("gmb", {
          mediaUrls: ["https://cdn.example/a.jpg", "https://cdn.example/b.jpg"],
        })
      )[0]?.message
    ).toMatch(/صورة واحدة/);
    expect(
      handler.validate(fakeCtx("gmb", { settings: { topicType: "EVENT" } }))[0]?.message
    ).toMatch(/عنوان/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("pinterest: board required and video needs a cover", () => {
    const handler = registry.get("pinterest") as ValidatingPublishHandler;
    const noBoard = handler.validate(fakeCtx("pinterest"));
    expect(noBoard[0]?.message).toMatch(/لوحة|board/);
    const videoOnly = handler.validate(
      fakeCtx("pinterest", {
        settings: { board: "99" },
        mediaUrls: ["https://cdn.example/clip.mp4"],
      })
    );
    expect(videoOnly[0]?.message).toMatch(/غلاف/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("telegram: publishes text via Bot API when approved", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ ok: true, result: { message_id: 42 } })
    );
    const result = await registry.get("telegram").publish(fakeCtx("telegram"));
    expect(result.ok).toBe(true);
    expect(result.releaseId).toBe("42");
    expect(result.releaseURL).toMatch(/t\.me/);
    expect(String(fetchMock.mock.calls[0]?.[0])).toMatch(/api\.telegram\.org\/bottg-bot\/sendMessage/);
  });

  it("linkedin: uploads image and creates a rest post", async () => {
    fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = (init?.method || "GET").toUpperCase();
      if (url.includes("/userinfo")) return jsonResponse({ sub: "person-9" });
      if (url.includes("initializeUpload")) {
        return jsonResponse({
          value: { uploadUrl: "https://www.linkedin.com/upload", image: "urn:li:image:1" },
        });
      }
      if (url.includes("www.linkedin.com/upload")) return new Response(null, { status: 201 });
      if (method === "POST" && url.endsWith("/posts")) {
        return new Response(null, { status: 201, headers: { "x-restli-id": "urn:li:share:99" } });
      }
      if (url.includes("/images/")) return pngResponse();
      if (url.endsWith(".jpg") || url.endsWith(".png")) return pngResponse();
      return jsonResponse({ status: "AVAILABLE" });
    });
    const result = await registry.get("linkedin").publish(
      fakeCtx("linkedin", {
        extra: { externalId: "person-9" },
        mediaUrls: ["https://cdn.example/photo.jpg"],
      })
    );
    expect(result.ok).toBe(true);
    expect(result.releaseId).toBe("urn:li:share:99");
    expect(result.releaseURL).toContain("linkedin.com/feed/update/");
  });

  it("linkedin: carousel of 2+ images uploads as a PDF document", async () => {
    fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = (init?.method || "GET").toUpperCase();
      if (url.includes("initializeUpload")) {
        expect(url).toContain("/documents?action=initializeUpload");
        return jsonResponse({
          value: { uploadUrl: "https://www.linkedin.com/upload", document: "urn:li:document:pdf" },
        });
      }
      if (url.includes("www.linkedin.com/upload")) return new Response(null, { status: 201 });
      if (method === "POST" && url.endsWith("/posts")) {
        const payload = JSON.parse(String(init?.body || "{}")) as {
          content?: { media?: { id?: string; title?: string } };
        };
        expect(payload.content?.media?.id).toBe("urn:li:document:pdf");
        expect(payload.content?.media?.title).toBe("رحلة إسطنبول");
        return new Response(null, { status: 201, headers: { "x-restli-id": "urn:li:share:carousel" } });
      }
      if (url.endsWith(".jpg") || url.endsWith(".png")) return pngResponse();
      return jsonResponse({ status: "AVAILABLE" });
    });
    const result = await registry.get("linkedin").publish(
      fakeCtx("linkedin", {
        extra: { externalId: "person-9" },
        settings: { post_as_images_carousel: true, carousel_name: "رحلة إسطنبول" },
        mediaUrls: ["https://cdn.example/a.jpg", "https://cdn.example/b.jpg"],
      })
    );
    expect(result.ok).toBe(true);
    expect(result.releaseId).toBe("urn:li:share:carousel");
  });

  it("linkedin-page: posts as organization", async () => {
    fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("initializeUpload")) {
        return jsonResponse({
          value: { uploadUrl: "https://www.linkedin.com/upload", image: "urn:li:image:2" },
        });
      }
      if (url.includes("/upload")) return new Response(null, { status: 201 });
      if ((init?.method || "GET").toUpperCase() === "POST" && url.endsWith("/posts")) {
        const body = JSON.parse(String(init?.body || "{}")) as { author?: string };
        expect(body.author).toBe("urn:li:organization:page-1");
        return new Response(null, { status: 201, headers: { "x-restli-id": "urn:li:share:page" } });
      }
      if (url.includes("api.linkedin.com/rest/images/")) {
        return jsonResponse({ status: "AVAILABLE" });
      }
      if (url.endsWith(".jpg") || url.endsWith(".png")) return pngResponse();
      return jsonResponse({ status: "AVAILABLE" });
    });
    const result = await registry.get("linkedin-page").publish(
      fakeCtx("linkedin-page", { mediaUrls: ["https://cdn.example/photo.jpg"] })
    );
    expect(result.ok).toBe(true);
    expect(result.releaseId).toBe("urn:li:share:page");
  });

  it("threads: creates and publishes a text container", async () => {
    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("threads_publish")) return jsonResponse({ id: "th-9" });
      if (url.includes("fields=id,permalink")) {
        return jsonResponse({ id: "th-9", permalink: "https://www.threads.net/@lonaliza/post/th-9" });
      }
      if (url.includes("/threads")) return jsonResponse({ id: "container-1" });
      if (url.includes("fields=status")) return jsonResponse({ status: "FINISHED" });
      return jsonResponse({});
    });
    const result = await registry.get("threads").publish(fakeCtx("threads"));
    expect(result.ok).toBe(true);
    expect(result.releaseId).toBe("th-9");
    expect(result.releaseURL).toContain("threads.net");
  });

  it("gmb: creates STANDARD / EVENT / OFFER local posts", async () => {
    fetchMock.mockImplementation(async () =>
      jsonResponse({ name: "accounts/1/locations/2/localPosts/3" })
    );
    const standard = await registry.get("gmb").publish(
      fakeCtx("gmb", { extra: { externalId: "accounts/1/locations/2" } })
    );
    expect(standard.ok).toBe(true);
    expect(standard.releaseId).toBe("accounts/1/locations/2/localPosts/3");

    const event = await registry.get("gmb").publish(
      fakeCtx("gmb", {
        extra: { externalId: "accounts/1/locations/2" },
        settings: {
          topicType: "EVENT",
          eventTitle: "عرض سياحي",
          eventStartDate: "2026-09-20",
        },
      })
    );
    expect(event.ok).toBe(true);
    const eventBody = JSON.parse(String(fetchMock.mock.calls.at(-1)?.[1]?.body || "{}")) as {
      topicType?: string;
      event?: { title?: string };
    };
    expect(eventBody.topicType).toBe("EVENT");
    expect(eventBody.event?.title).toBe("عرض سياحي");

    const offer = await registry.get("gmb").publish(
      fakeCtx("gmb", {
        extra: { externalId: "accounts/1/locations/2" },
        settings: { topicType: "OFFER", offerCouponCode: "VISIT20" },
      })
    );
    expect(offer.ok).toBe(true);
    const offerBody = JSON.parse(String(fetchMock.mock.calls.at(-1)?.[1]?.body || "{}")) as {
      offer?: { couponCode?: string };
    };
    expect(offerBody.offer?.couponCode).toBe("VISIT20");
  });

  it("pinterest: publishes an image pin to the required board", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: "pin-44" }));
    const result = await registry.get("pinterest").publish(
      fakeCtx("pinterest", {
        settings: { board: "555", title: "إسطنبول" },
        mediaUrls: ["https://cdn.example/photo.jpg"],
      })
    );
    expect(result.ok).toBe(true);
    expect(result.releaseId).toBe("pin-44");
    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body || "{}")) as {
      board_id?: string;
      media_source?: { source_type?: string };
    };
    expect(body.board_id).toBe("555");
    expect(body.media_source?.source_type).toBe("image_url");
  });

  it("pinterest video publishes with cover after media upload", async () => {
    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/v5/media") && !url.includes("/media/")) {
        return jsonResponse({
          upload_url: "https://pinterest-upload.example",
          media_id: "media-1",
          upload_parameters: { key: "abc" },
        });
      }
      if (url.includes("pinterest-upload")) return new Response(null, { status: 204 });
      if (url.includes("/v5/media/media-1")) return jsonResponse({ status: "succeeded" });
      if (url.includes("/v5/pins")) return jsonResponse({ id: "pin-video" });
      if (url.endsWith(".mp4")) {
        return new Response(Buffer.from("video"), {
          status: 200,
          headers: { "Content-Type": "video/mp4" },
        });
      }
      return jsonResponse({});
    });
    const result = await registry.get("pinterest").publish(
      fakeCtx("pinterest", {
        settings: { board: "555" },
        mediaUrls: ["https://cdn.example/clip.mp4", "https://cdn.example/cover.jpg"],
      })
    );
    expect(result.ok).toBe(true);
    expect(result.releaseId).toBe("pin-video");
  });

  it("maps 401 responses to needs_reauth without faking success", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ error: { message: "Invalid token" } }, 401));
    const result = await registry.get("threads").publish(fakeCtx("threads"));
    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe("needs_reauth");
    expect(result.error?.message).toMatch(/إعادة تحقق/);
  });
});
