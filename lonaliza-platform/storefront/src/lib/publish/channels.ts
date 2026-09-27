import { decryptSecret, encryptSecret } from "./crypto";
import {
  deleteStoredChannel,
  encryptChannelSecrets,
  getPublishStoreStatus,
  getStoredChannel,
  listPublicChannels,
  listStoredChannels,
  newPublishId,
  saveStoredChannel,
  toPublicChannel,
} from "./store";
import type {
  PublishChannel,
  PublishChannelExtra,
  PublishChannelSecrets,
  PublishStoreStatus,
  StoredPublishChannel,
} from "./types";

export async function listChannels(): Promise<{
  channels: PublishChannel[];
  store: PublishStoreStatus;
}> {
  try {
    const [channels, store] = await Promise.all([
      listPublicChannels(),
      getPublishStoreStatus(),
    ]);
    return { channels, store };
  } catch (err) {
    return {
      channels: [],
      store: {
        backend: "none",
        available: false,
        missingCollections: [],
        error: err instanceof Error ? err.message : "تعذّر قراءة القنوات",
      },
    };
  }
}

export async function getChannel(id: string): Promise<StoredPublishChannel | null> {
  return getStoredChannel(id);
}

export async function createChannel(input: {
  provider: string;
  name: string;
  picture?: string;
  disabled?: boolean;
  refreshNeeded?: boolean;
  groupId?: string;
  postingTimes?: { time: number }[];
  accessToken?: string;
  refreshToken?: string;
  pageAccessToken?: string;
  tokenExpiresAt?: string;
  extra?: PublishChannelExtra;
}): Promise<PublishChannel> {
  const enc = await encryptChannelSecrets(input);
  const channel: StoredPublishChannel = {
    id: newPublishId("c"),
    provider: input.provider.trim().toLowerCase(),
    name: input.name.trim(),
    picture: input.picture?.trim() || undefined,
    disabled: Boolean(input.disabled),
    refreshNeeded: Boolean(input.refreshNeeded),
    groupId: input.groupId?.trim() || undefined,
    postingTimes: input.postingTimes,
    accessTokenEnc: enc.accessTokenEnc,
    refreshTokenEnc: enc.refreshTokenEnc,
    pageAccessTokenEnc: enc.pageAccessTokenEnc,
    tokenExpiresAt: input.tokenExpiresAt,
    extra: input.extra || {},
  };
  const saved = await saveStoredChannel(channel, true);
  return toPublicChannel(saved);
}

export async function updateChannel(
  id: string,
  patch: Partial<{
    name: string;
    picture: string;
    disabled: boolean;
    refreshNeeded: boolean;
    groupId: string;
    postingTimes: { time: number }[];
    accessToken: string;
    refreshToken: string;
    pageAccessToken: string;
    tokenExpiresAt: string;
    extra: PublishChannelExtra;
    provider: string;
  }>
): Promise<PublishChannel | null> {
  const current = await getStoredChannel(id);
  if (!current) return null;
  const next: StoredPublishChannel = {
    ...current,
    name: patch.name?.trim() || current.name,
    picture: patch.picture !== undefined ? patch.picture.trim() || undefined : current.picture,
    disabled: patch.disabled ?? current.disabled,
    refreshNeeded: patch.refreshNeeded ?? current.refreshNeeded,
    groupId: patch.groupId !== undefined ? patch.groupId.trim() || undefined : current.groupId,
    postingTimes: patch.postingTimes ?? current.postingTimes,
    tokenExpiresAt: patch.tokenExpiresAt ?? current.tokenExpiresAt,
    extra: patch.extra ? { ...current.extra, ...patch.extra } : current.extra,
    provider: patch.provider?.trim().toLowerCase() || current.provider,
  };
  if (patch.accessToken !== undefined) {
    next.accessTokenEnc = await encryptSecret(patch.accessToken);
  }
  if (patch.refreshToken !== undefined) {
    next.refreshTokenEnc = await encryptSecret(patch.refreshToken);
  }
  if (patch.pageAccessToken !== undefined) {
    next.pageAccessTokenEnc = await encryptSecret(patch.pageAccessToken);
  }
  const saved = await saveStoredChannel(next, false);
  return toPublicChannel(saved);
}

export async function deleteChannel(id: string): Promise<boolean> {
  return deleteStoredChannel(id);
}

export async function decryptChannelSecrets(
  channel: StoredPublishChannel
): Promise<Required<Pick<PublishChannelSecrets, "accessToken" | "refreshToken" | "pageAccessToken">> & {
  tokenExpiresAt?: string;
  extra: PublishChannelExtra;
}> {
  return {
    accessToken: await decryptSecret(channel.accessTokenEnc),
    refreshToken: await decryptSecret(channel.refreshTokenEnc),
    pageAccessToken: await decryptSecret(channel.pageAccessTokenEnc),
    tokenExpiresAt: channel.tokenExpiresAt,
    extra: channel.extra || {},
  };
}

export async function persistDecryptedSecrets(
  channelId: string,
  secrets: PublishChannelSecrets & { refreshNeeded?: boolean }
): Promise<StoredPublishChannel | null> {
  const current = await getStoredChannel(channelId);
  if (!current) return null;
  const next: StoredPublishChannel = { ...current };
  if (secrets.accessToken !== undefined) {
    next.accessTokenEnc = await encryptSecret(secrets.accessToken);
  }
  if (secrets.refreshToken !== undefined) {
    next.refreshTokenEnc = await encryptSecret(secrets.refreshToken);
  }
  if (secrets.pageAccessToken !== undefined) {
    next.pageAccessTokenEnc = await encryptSecret(secrets.pageAccessToken);
  }
  if (secrets.tokenExpiresAt !== undefined) next.tokenExpiresAt = secrets.tokenExpiresAt;
  if (secrets.extra) next.extra = { ...current.extra, ...secrets.extra };
  if (secrets.refreshNeeded !== undefined) next.refreshNeeded = secrets.refreshNeeded;
  return saveStoredChannel(next, false);
}

export { listStoredChannels };
