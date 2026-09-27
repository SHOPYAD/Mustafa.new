import { decryptChannelSecrets, persistDecryptedSecrets } from "./channels";
import { recordPublishError } from "./store";
import { getPublishRegistry } from "./registry";
import type { PublishContext, StoredPublishChannel } from "./types";

export async function refreshChannelTokens(
  channel: StoredPublishChannel,
  ctx?: Pick<PublishContext, "post" | "approved" | "caption" | "mediaUrls">
): Promise<StoredPublishChannel> {
  const registry = getPublishRegistry();
  const handler = registry.get(channel.provider);
  if (!handler.implemented || !handler.refresh) {
    return channel;
  }
  const secrets = await decryptChannelSecrets(channel);
  const result = await handler.refresh({
    post: ctx?.post || {
      id: "",
      state: "draft",
      publishDate: new Date().toISOString(),
      channelId: channel.id,
      content: "",
      delay: 0,
      group: "",
      settings: {},
      creationMethod: "api",
    },
    channel,
    approved: ctx?.approved === true,
    caption: ctx?.caption || "",
    mediaUrls: ctx?.mediaUrls || [],
    accessToken: secrets.accessToken,
    refreshToken: secrets.refreshToken,
    pageAccessToken: secrets.pageAccessToken,
  });
  const saved = await persistDecryptedSecrets(channel.id, {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken,
    pageAccessToken: result.pageAccessToken,
    tokenExpiresAt: result.tokenExpiresAt,
    extra: result.extra,
    refreshNeeded: result.refreshNeeded,
  });
  return saved || channel;
}

export async function refreshChannelOrRecord(
  channel: StoredPublishChannel
): Promise<{ channel: StoredPublishChannel; error?: string }> {
  try {
    const next = await refreshChannelTokens(channel);
    return { channel: next };
  } catch (err) {
    const message = err instanceof Error ? err.message : "فشل تجديد الرمز";
    await persistDecryptedSecrets(channel.id, { refreshNeeded: true });
    await recordPublishError({
      channelId: channel.id,
      provider: channel.provider,
      code: "needs_reauth",
      message,
      retryable: true,
    });
    return { channel: { ...channel, refreshNeeded: true }, error: message };
  }
}
