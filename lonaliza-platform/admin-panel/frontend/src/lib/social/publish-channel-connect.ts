import { createChannel, updateChannel } from "@/lib/publish/channels";
import { listStoredChannels } from "@/lib/publish/store";
import type { PublishChannel, PublishChannelExtra, StoredPublishChannel } from "@/lib/publish/types";
import type { PublishOAuthProvider } from "./types";

export function expiresAtFromSeconds(seconds?: number): string | undefined {
  if (!seconds || !Number.isFinite(seconds)) return undefined;
  return new Date(Date.now() + seconds * 1000).toISOString();
}

export type UpsertPublishOAuthInput = {
  provider: PublishOAuthProvider;
  name: string;
  picture?: string;
  accessToken: string;
  refreshToken?: string;
  pageAccessToken?: string;
  tokenExpiresAt?: string;
  extra: PublishChannelExtra;
};

function extraKeyOf(extra?: PublishChannelExtra): string {
  return (extra?.pageId || extra?.externalId || "").trim();
}

function findExisting(
  rows: StoredPublishChannel[],
  input: UpsertPublishOAuthInput
): StoredPublishChannel | undefined {
  const key = extraKeyOf(input.extra);
  if (key) {
    const byKey = rows.find(
      (row) =>
        row.provider === input.provider && extraKeyOf(row.extra) === key
    );
    if (byKey) return byKey;
  }
  return rows.find((row) => row.provider === input.provider && !row.disabled) ||
    rows.find((row) => row.provider === input.provider);
}

/**
 * Upsert a publish-engine channel for one of the six extra networks.
 * Tokens are encrypted by createChannel / updateChannel. Never saves without a token.
 */
export async function upsertPublishOAuthChannel(
  input: UpsertPublishOAuthInput
): Promise<PublishChannel> {
  const token = (input.accessToken || input.pageAccessToken || "").trim();
  if (!token) {
    throw new Error("لا يمكن حفظ قناة بلا رمز وصول");
  }
  const existing = findExisting(await listStoredChannels(), input);
  if (existing) {
    const updated = await updateChannel(existing.id, {
      name: input.name,
      picture: input.picture,
      disabled: false,
      refreshNeeded: false,
      accessToken: input.accessToken,
      refreshToken: input.refreshToken,
      pageAccessToken: input.pageAccessToken,
      tokenExpiresAt: input.tokenExpiresAt,
      extra: input.extra,
    });
    if (updated) return updated;
  }

  return createChannel({
    provider: input.provider,
    name: input.name,
    picture: input.picture,
    disabled: false,
    refreshNeeded: false,
    accessToken: input.accessToken,
    refreshToken: input.refreshToken,
    pageAccessToken: input.pageAccessToken,
    tokenExpiresAt: input.tokenExpiresAt,
    extra: input.extra,
  });
}
