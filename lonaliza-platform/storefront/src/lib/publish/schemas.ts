import { z } from "zod";
import { PUBLISH_CREATION_METHODS, PUBLISH_STATES } from "./constants";

export const publishStateSchema = z.enum(
  PUBLISH_STATES as unknown as [string, ...string[]]
);

export const creationMethodSchema = z.enum(
  PUBLISH_CREATION_METHODS as unknown as [string, ...string[]]
);

export const postingTimeSchema = z.object({
  time: z.number(),
});

export const createChannelSchema = z.object({
  provider: z.string().min(1, "المنصة مطلوبة"),
  name: z.string().min(1, "اسم القناة مطلوب"),
  picture: z.string().optional(),
  disabled: z.boolean().optional(),
  refreshNeeded: z.boolean().optional(),
  groupId: z.string().optional(),
  postingTimes: z.array(postingTimeSchema).optional(),
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  pageAccessToken: z.string().optional(),
  tokenExpiresAt: z.string().optional(),
  extra: z
    .object({
      externalId: z.string().optional(),
      username: z.string().optional(),
      pageId: z.string().optional(),
      instagramUserId: z.string().optional(),
      scopes: z.array(z.string()).optional(),
    })
    .optional(),
});

export const updateChannelSchema = createChannelSchema.partial().extend({
  id: z.string().optional(),
});

export const createPostSchema = z.object({
  channelId: z.string().min(1, "القناة مطلوبة"),
  content: z.string().optional().default(""),
  publishDate: z.string().optional(),
  state: z.enum(["draft", "queue"]).optional(),
  delay: z.number().optional(),
  group: z.string().optional(),
  title: z.string().optional(),
  settings: z.record(z.unknown()).optional(),
  intervalInDays: z.number().optional(),
  parentPostId: z.string().optional(),
  creationMethod: creationMethodSchema.optional(),
  mediaUrls: z.array(z.string()).optional(),
  approved: z.boolean().optional(),
});

export const updatePostSchema = createPostSchema.partial().extend({
  id: z.string().optional(),
  state: publishStateSchema.optional(),
  releaseId: z.string().optional(),
  releaseURL: z.string().optional(),
  error: z.string().optional(),
});

export const changeStatusSchema = z.object({
  state: z.enum(["draft", "queue"]),
  publishDate: z.string().optional(),
  approved: z.boolean().optional(),
});

export const publishNowSchema = z.object({
  approved: z.boolean(),
});

export const uploadFromUrlSchema = z.object({
  url: z.string().url("رابط غير صالح"),
});

export const listPostsQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  state: z.string().optional(),
  channelId: z.string().optional(),
});
