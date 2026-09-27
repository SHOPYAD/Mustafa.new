/** Re-export engine contract; UI-only types stay here. Import from `types.ts` so client bundles never pull BullMQ. */

export type {
  PublishChannel,
  PublishCreationMethod,
  PublishPost,
  PublishState,
} from "@/lib/publish/types";

export type PublishMediaItem = {
  id: string;
  name: string;
  url?: string;
  thumbnail?: string;
  type?: string;
  mime?: string;
  size?: number;
  alt?: string;
  createdAt?: string;
};

export type PublishSignature = {
  id: string;
  name: string;
  content: string;
  autoAdd?: boolean;
};

export type PublishSet = {
  id: string;
  name: string;
  channelIds: string[];
};

export type PublishSettingsPayload = {
  signatures?: PublishSignature[];
  sets?: PublishSet[];
  apiKeyMasked?: string;
  hasApiKey?: boolean;
};

export type CalendarView = "day" | "week" | "month" | "list";

export type ComposeIntent = "draft" | "queue" | "now";

export type ThreadPart = {
  content: string;
  delaySec: number;
};

export type ChannelComposeSettings = {
  overrideEnabled: boolean;
  overrideContent: string;
  firstComment: string;
  commentDelaySec: number;
  content_posting_method: "DIRECT_POST" | "UPLOAD";
  privacy_level: string;
  post_type: "post" | "story";
  is_trial_reel: boolean;
  graduation_strategy: "MANUAL" | "SS_PERFORMANCE";
  ytTitle: string;
  ytPrivacy: "public" | "unlisted" | "private";
  selfDeclaredMadeForKids: "yes" | "no";
  topicType: "STANDARD" | "EVENT" | "OFFER";
  callToActionType: string;
  callToActionUrl: string;
  eventTitle: string;
  board: string;
  pinTitle: string;
  pinLink: string;
  post_as_images_carousel: boolean;
  carousel_name: string;
};

export function emptyChannelSettings(): ChannelComposeSettings {
  return {
    overrideEnabled: false,
    overrideContent: "",
    firstComment: "",
    commentDelaySec: 0,
    content_posting_method: "DIRECT_POST",
    privacy_level: "PUBLIC_TO_EVERYONE",
    post_type: "post",
    is_trial_reel: false,
    graduation_strategy: "MANUAL",
    ytTitle: "",
    ytPrivacy: "public",
    selfDeclaredMadeForKids: "no",
    topicType: "STANDARD",
    callToActionType: "NONE",
    callToActionUrl: "",
    eventTitle: "",
    board: "",
    pinTitle: "",
    pinLink: "",
    post_as_images_carousel: false,
    carousel_name: "",
  };
}

export type PublishPlugField = { name: string; value: string };

export type PublishPlug = {
  id: string;
  channelId: string;
  plugFunction: string;
  data: PublishPlugField[];
  activated: boolean;
};

export type PublishPlugCatalogField = {
  name: string;
  type: "number" | "richtext";
  placeholder: string;
  description: string;
  descriptionAr: string;
};

export type PublishPlugDefinition = {
  identifier: string;
  methodName: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  kind: "repost" | "comment";
  fields: PublishPlugCatalogField[];
};

export type PublishPlugCatalog = {
  identifier: string;
  name: string;
  nameAr: string;
  plugs: PublishPlugDefinition[];
};

export type PublishRssFeed = {
  id: string;
  title: string;
  content: string;
  onSlot: boolean;
  syncLast: boolean;
  url: string;
  lastUrl: string;
  active: boolean;
  addPicture: boolean;
  generateContent: boolean;
  integrations: Array<{ id: string }>;
};

export type PublishWebhook = {
  id: string;
  name: string;
  url: string;
  channelIds: string[];
};

export type PublishAnalyticsPoint = { total: number; date: string };

export type PublishAnalyticsSeries = {
  label: string;
  labelAr: string;
  average?: boolean;
  data: PublishAnalyticsPoint[];
};

export type PublishChannelAnalytics = {
  channelId: string;
  provider: string;
  name: string;
  status: string;
  source: string;
  live: boolean;
  reconnectUrl?: string;
  messageAr: string;
  windows: number[];
  range?: { days: number };
  series: PublishAnalyticsSeries[];
};

export type PublishPostAnalytics = {
  postId: string;
  channelId: string;
  provider: string;
  releaseId?: string;
  status: string;
  live: boolean;
  reconnectUrl?: string;
  messageAr: string;
  series: PublishAnalyticsSeries[];
  missingReleaseId?: boolean;
};

export type PublishAnalyticsOverview = {
  date: number;
  reconnectUrl: string;
  liveProviders: string[];
  placeholderProviders: string[];
  catalog: Array<{ id: string; nameAr: string; windows: number[]; live: boolean }>;
  channels: PublishChannelAnalytics[];
};

export type PublishVideoOption = {
  identifier: string;
  title: string;
  titleAr: string;
  description: string;
  available: boolean;
  reasonAr?: string;
};
