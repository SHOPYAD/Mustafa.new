/**
 * Lonaliza in-house publish ENGINE types.
 * Capability clone of Postiz scheduling — not an embed of Postiz.
 */

export type PublishState = "draft" | "queue" | "published" | "error";

export type PublishCreationMethod = "web" | "mcp" | "api" | "autopost" | "agent";

export type PublishChannel = {
  id: string;
  provider: string;
  name: string;
  picture?: string;
  disabled: boolean;
  refreshNeeded: boolean;
  groupId?: string;
  postingTimes?: { time: number }[];
};

export type PublishPost = {
  id: string;
  state: PublishState;
  publishDate: string; // ISO
  channelId: string;
  content: string;
  delay: number;
  group: string;
  title?: string;
  settings: Record<string, unknown>;
  releaseId?: string;
  releaseURL?: string;
  intervalInDays?: number;
  error?: string;
  parentPostId?: string;
  creationMethod: PublishCreationMethod;
};

export type PublishChannelExtra = {
  externalId?: string;
  username?: string;
  pageId?: string;
  instagramUserId?: string;
  scopes?: string[];
};

export type StoredPublishChannel = PublishChannel & {
  accessTokenEnc: string;
  refreshTokenEnc: string;
  pageAccessTokenEnc: string;
  tokenExpiresAt?: string;
  extra: PublishChannelExtra;
};

export type PublishChannelSecrets = {
  accessToken?: string;
  refreshToken?: string;
  pageAccessToken?: string;
  tokenExpiresAt?: string;
  extra?: PublishChannelExtra;
};

export type PublishErrorRecord = {
  id: string;
  postId?: string;
  channelId?: string;
  provider: string;
  code: string;
  message: string;
  retryable: boolean;
  createdAt: string;
};

export type PublishProviderError = {
  code: string;
  message: string;
  retryable?: boolean;
};

export type PublishProviderResult = {
  ok: boolean;
  provider: string;
  releaseId?: string;
  releaseURL?: string;
  error?: PublishProviderError;
};

export type PublishContext = {
  post: PublishPost;
  channel: StoredPublishChannel;
  approved: boolean;
  caption: string;
  title?: string;
  mediaUrls: string[];
  accessToken: string;
  refreshToken?: string;
  pageAccessToken?: string;
};

export type PublishProviderHandler = {
  id: string;
  label: string;
  labelAr: string;
  implemented: boolean;
  publish: (ctx: PublishContext) => Promise<PublishProviderResult>;
  refresh?: (ctx: PublishContext) => Promise<{
    accessToken?: string;
    refreshToken?: string;
    pageAccessToken?: string;
    tokenExpiresAt?: string;
    extra?: PublishChannelExtra;
    refreshNeeded?: boolean;
  }>;
};

export type PublishStoreStatus = {
  backend: "pocketbase" | "file" | "none";
  available: boolean;
  missingCollections: string[];
  error?: string;
};

export type PublishAutomationTickStats = {
  checked: number;
  created: number;
  fired: number;
  skipped: number;
  errors: number;
};

export type PublishTickResult = {
  due: number;
  ran: number;
  skipped: number;
  enqueued: number;
  errors: number;
  store: PublishStoreStatus;
  bullmq: boolean;
  /** RSS hourly poll on this tick (active feeds only). */
  rss: PublishAutomationTickStats;
  /** Activated plugs vs published posts (likes → repost/comment). */
  plugs: PublishAutomationTickStats;
};
