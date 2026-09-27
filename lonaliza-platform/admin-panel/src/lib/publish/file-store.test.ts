import { describe, expect, it } from "vitest";
import { sanitizeChannel, sanitizeError, sanitizePost } from "./file-store";

describe("publish PocketBase field mapping", () => {
  it("reads channel tokens from migration field names", () => {
    const channel = sanitizeChannel({
      id: "abcdefghijklmno",
      provider: "facebook",
      name: "صفحة",
      token: "enc-access",
      refreshToken: "enc-refresh",
      tokenExpiration: "2026-12-01 00:00:00.000Z",
      group: "groupid11111111",
      additionalSettings: { pageAccessTokenEnc: "enc-page", pageId: "99" },
      disabled: false,
      refreshNeeded: false,
    });
    expect(channel?.accessTokenEnc).toBe("enc-access");
    expect(channel?.refreshTokenEnc).toBe("enc-refresh");
    expect(channel?.pageAccessTokenEnc).toBe("enc-page");
    expect(channel?.groupId).toBe("groupid11111111");
    expect(channel?.extra.pageId).toBe("99");
    expect(channel?.tokenExpiresAt).toMatch(/^2026-12-01/);
  });

  it("reads post.channel relation as channelId", () => {
    const post = sanitizePost({
      id: "postid111111111",
      state: "queue",
      publishDate: "2026-09-14 10:00:00.000Z",
      channel: "chanid111111111",
      content: "مرحبا",
      delay: 0,
      group: "g1",
      creationMethod: "web",
      settings: {},
    });
    expect(post?.channelId).toBe("chanid111111111");
    expect(post?.state).toBe("queue");
    expect(post?.content).toBe("مرحبا");
  });

  it("reads errors.platform / post / body", () => {
    const err = sanitizeError({
      id: "errid1111111111",
      message: "فشل",
      platform: "x",
      post: "postid111111111",
      body: { code: "publish_failed", retryable: true, channelId: "c1" },
      created: "2026-09-14T10:00:00.000Z",
    });
    expect(err?.provider).toBe("x");
    expect(err?.postId).toBe("postid111111111");
    expect(err?.code).toBe("publish_failed");
    expect(err?.retryable).toBe(true);
  });
});
