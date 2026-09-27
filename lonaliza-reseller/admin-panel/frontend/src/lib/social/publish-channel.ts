import { createChannel, listStoredChannels, updateChannel } from "@/lib/publish/channels";
import type { PublishChannel, PublishChannelExtra } from "@/lib/publish/types";

export type UpsertPublishOAuthChannelInput = {
  provider: string;
  name: string;
  picture?: string;
  accessToken: string;
  refreshToken?: string;
  pageAccessToken?: string;
  tokenExpiresAt?: string;
  extra?: PublishChannelExtra;
};

/**
 * Store newly connected publish-engine networks into the publish channel store.
 * Does not copy or migrate legacy facebook/instagram/youtube/tiktok/x tokens.
 */
export async function upsertPublishOAuthChannel(
  input: UpsertPublishOAuthChannelInput
): Promise<PublishChannel> {
  const provider = input.provider.trim().toLowerCase();
  const externalId = (input.extra?.externalId || input.extra?.pageId || "").trim();
  const existing = (await listStoredChannels()).find((row) => {
    if (row.provider !== provider) return false;
    if (!externalId) return false;
    return (
      row.extra?.externalId === externalId ||
      row.extra?.pageId === externalId ||
      row.id === `${provider}_${externalId}`
    );
  });

  const payload = {
    provider,
    name: input.name.trim() || provider,
    picture: input.picture,
    disabled: false,
    refreshNeeded: false,
    accessToken: input.accessToken,
    refreshToken: input.refreshToken,
    pageAccessToken: input.pageAccessToken,
    tokenExpiresAt: input.tokenExpiresAt,
    extra: input.extra || {},
  };

  if (existing) {
    const updated = await updateChannel(existing.id, payload);
    if (updated) return updated;
  }
  return createChannel(payload);
}
