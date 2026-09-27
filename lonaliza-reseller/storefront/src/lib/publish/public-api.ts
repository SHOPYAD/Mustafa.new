/**
 * Public `/api/publish/v1` helpers — Postiz `/public/v1` subset.
 * Immediate publish requires `approved === true`.
 */

import { NOT_APPROVED_AR } from "./constants";
import { listChannels } from "./channels";
import { createPost } from "./posts";
import type { PublishChannel, PublishPost } from "./types";

export class PublicApiApprovalError extends Error {
  constructor(message = NOT_APPROVED_AR) {
    super(message);
    this.name = "PublicApiApprovalError";
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

export function wantsImmediatePublish(raw: unknown): boolean {
  const rec = asRecord(raw);
  if (rec.publishNow === true || rec.state === "published") return true;
  const settings = asRecord(rec.settings);
  return settings.intent === "now";
}

export type PublicIntegration = PublishChannel & {
  identifier: string;
};

export async function listPublicIntegrations(): Promise<{
  integrations: PublicIntegration[];
  store: Awaited<ReturnType<typeof listChannels>>["store"];
}> {
  const { channels, store } = await listChannels();
  return {
    integrations: channels.map((channel) => ({
      ...channel,
      identifier: channel.provider,
    })),
    store,
  };
}

export async function createPublicApiPost(raw: unknown): Promise<PublishPost> {
  const rec = asRecord(raw);
  const immediate = wantsImmediatePublish(rec);
  const approved = rec.approved === true;
  if (immediate && !approved) {
    throw new PublicApiApprovalError();
  }
  const channelId = String(
    rec.channelId || rec.channel || rec.integrationId || rec.integration || ""
  ).trim();
  const settings = asRecord(rec.settings);
  return createPost({
    ...rec,
    channelId,
    content: rec.content || rec.caption || rec.text,
    state: immediate ? "queue" : rec.state === "queue" ? "queue" : "draft",
    creationMethod: "api",
    settings: immediate ? { ...settings, intent: "now" } : rec.settings,
    ...(approved ? { approved: true } : {}),
  });
}
