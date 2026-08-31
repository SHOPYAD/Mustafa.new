import type { StudioNotifyPayload } from "@/lib/studio/creative/types";

/**
 * Thin helper for STUDIO-CHAT / Telegram.
 * Does not send messages — only returns file paths and public URLs.
 */
export function studioNotifyPaths(input: {
  title: string;
  paths: string[];
  urls: string[];
}): StudioNotifyPayload {
  return {
    channel: "paths-only",
    message: input.title,
    paths: input.paths,
    urls: input.urls,
  };
}
