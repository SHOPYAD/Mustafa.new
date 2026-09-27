/**
 * Publish-engine chat agent. Never publishes; drafts stay unapproved.
 */

import { PROVIDER_LABEL_AR, PROVIDER_LABEL_EN } from "./constants";
import { createPost } from "./posts";
import { listPublicChannels } from "./store";
import type { PublishChannel, PublishPost } from "./types";

export const AGENT_QUESTION_REPLY_AR =
  "الجدولة تتم عبر الملحن والتقويم. اكتب المنشور هناك ثم اعتمده — هذا الوكيل لا ينشر مباشرة.";

export const AGENT_READY_REPLY_AR =
  "وكيل النشر جاهز للمسودات فقط. الجدولة النهائية من الملحن أو التقويم، ولن يُنشر شيء قبل الموافقة.";

const QUESTION_RE =
  /[؟?]|(^|\s)(هل|ماذا|ما هو|ما هي|ما هي|متى|كيف|أين|وين|لماذا|ليش|كم|من هو|وش|شنو)(\s|$|[؟?])/;
const SCHEDULE_RE =
  /جدول|جدولة|schedule|مسودة|انشر|أنشر|نشر هذا|post this/i;
const QUESTION_ONLY_HINTS = /كيف|هل يمكن|وين|أين|متى أقدر|ما الفرق|ماذا يعني/;

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function extractCaption(message: string): string {
  const text = String(message || "").trim();
  if (!text) return "";
  const quoted = text.match(/[«"“]([^»"”]+)[»"”]/);
  if (quoted?.[1]?.trim()) return quoted[1].trim();
  const labeled = text.match(
    /(?:كابشن|caption|النص|المحتوى|المنشور)\s*[:：]\s*(.+)$/im
  );
  if (labeled?.[1]?.trim()) return labeled[1].trim();
  return "";
}

export function isQuestionOnly(message: string): boolean {
  const text = String(message || "").trim();
  if (!text) return false;
  if (extractCaption(text)) return false;
  return /[؟?]\s*$/.test(text) || QUESTION_RE.test(text) || QUESTION_ONLY_HINTS.test(text);
}

function wantsSchedule(message: string): boolean {
  return SCHEDULE_RE.test(message);
}

function escapeRe(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matchChannels(message: string, channels: PublishChannel[]): PublishChannel[] {
  const enabled = channels.filter((row) => !row.disabled);
  const hits = enabled.filter((row) => {
    const parts = [row.provider, PROVIDER_LABEL_AR[row.provider], PROVIDER_LABEL_EN[row.provider], row.name]
      .map((part) => String(part || "").trim())
      .filter(Boolean);
    if (parts.length === 0) return false;
    try {
      return new RegExp(parts.map(escapeRe).join("|"), "i").test(message);
    } catch {
      return message.toLowerCase().includes(row.provider.toLowerCase());
    }
  });
  if (hits.length > 0) return hits;
  return enabled.slice(0, 1);
}

function captionFromSchedule(message: string): string {
  const quoted = extractCaption(message);
  if (quoted) return quoted;
  return message
    .replace(SCHEDULE_RE, " ")
    .replace(/\b(غداً|غدا|tomorrow|اليوم|today)\b/gi, " ")
    .replace(/\b\d{1,2}\s*(ص|م|am|pm)\b/gi, " ")
    .replace(/\b(على|في)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export type PublishAgentResult = {
  reply: string;
  posts: PublishPost[];
  approved: false;
};

export async function handlePublishAgentMessage(raw: unknown): Promise<PublishAgentResult> {
  const rec = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const message = asString(rec.message || rec.text || rec.content);
  if (!message) {
    return { reply: AGENT_READY_REPLY_AR, posts: [], approved: false };
  }

  if (isQuestionOnly(message)) {
    return { reply: AGENT_QUESTION_REPLY_AR, posts: [], approved: false };
  }

  if (!wantsSchedule(message)) {
    return { reply: AGENT_QUESTION_REPLY_AR, posts: [], approved: false };
  }

  const caption = captionFromSchedule(message);
  if (!caption || caption.length < 4) {
    return {
      reply:
        "لتجهيز مسودة، اذكر نص المنشور (الكابشن) والقناة. الجدولة النهائية من الملحن أو التقويم، ولن يُنشر شيء قبل الموافقة.",
      posts: [],
      approved: false,
    };
  }

  const channels = await listPublicChannels();
  const targets = matchChannels(message, channels);
  if (targets.length === 0) {
    return {
      reply: "لا توجد قنوات مربوطة. اربط قناة أولاً، ثم اطلب المسودة من هنا أو من الملحن.",
      posts: [],
      approved: false,
    };
  }

  const posts: PublishPost[] = [];
  for (const channel of targets) {
    const post = await createPost({
      channelId: channel.id,
      content: caption,
      state: "draft",
      approved: false,
      creationMethod: "agent",
      settings: { approved: false, source: "agent" },
    });
    posts.push(post);
  }

  const names = targets.map((row) => row.name || row.provider).join("، ");
  return {
    reply: `حُفظت مسودة غير معتمدة على: ${names}. لن تُنشر حتى توافق عليها من الملحن أو التقويم.`,
    posts,
    approved: false,
  };
}
