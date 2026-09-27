/**
 * PocketBase collection names for Lonaliza's in-house social publish engine.
 * Names match migrations 1789332100–1789332113. Do not rename.
 *
 * Core record field aliases (PB schema → engine types):
 * - publish_channels.token / refreshToken / tokenExpiration / group / additionalSettings
 * - publish_posts.channel (relation) / publishDate (date)
 * - publish_errors.platform / post / body
 */
export const PUBLISH_COLLECTIONS = {
  channelGroups: "publish_channel_groups",
  channels: "publish_channels",
  posts: "publish_posts",
  media: "publish_media",
  tags: "publish_tags",
  sets: "publish_sets",
  signatures: "publish_signatures",
  postComments: "publish_post_comments",
  plugs: "publish_plugs",
  rssFeeds: "publish_rss_feeds",
  webhooks: "publish_webhooks",
  notifications: "publish_notifications",
  errors: "publish_errors",
  mentions: "publish_mentions",
} as const;

export type PublishCollection =
  (typeof PUBLISH_COLLECTIONS)[keyof typeof PUBLISH_COLLECTIONS];

export const PUBLISH_CHANNEL_COLLECTION = PUBLISH_COLLECTIONS.channels;
export const PUBLISH_POST_COLLECTION = PUBLISH_COLLECTIONS.posts;
export const PUBLISH_ERROR_COLLECTION = PUBLISH_COLLECTIONS.errors;

export function isMissingCollectionError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const row = err as {
    status?: unknown;
    message?: unknown;
    url?: unknown;
    data?: { message?: unknown };
    response?: { message?: unknown };
  };
  const status = Number(row.status || 0);
  const text = [
    row.message,
    row.url,
    row.data?.message,
    row.response?.message,
  ]
    .map((part) => (typeof part === "string" ? part : ""))
    .join(" ")
    .toLowerCase();

  if (
    /missing collection|failed to find collection|unknown collection|collection .* not found/.test(
      text
    )
  ) {
    return true;
  }

  if (status !== 404) return false;
  return /\/api\/collections\/[a-z0-9_]+\/?(\?|$)/.test(text) && !text.includes("/records");
}
