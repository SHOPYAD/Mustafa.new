import type { PublishPost } from "./types";
import { firePublishWebhooks } from "./webhooks";

export async function onPublishLifecycle(
  post: PublishPost,
  event: "published" | "error"
): Promise<void> {
  await firePublishWebhooks(post, event);
}
