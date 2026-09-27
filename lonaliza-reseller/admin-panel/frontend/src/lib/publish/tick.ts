import { IMPLEMENTED_PROVIDERS } from "./constants";
import { runPublishPost } from "./engine";
import { runDuePlugs } from "./plugs";
import { enqueuePublishPost, startPublishWorkers } from "./queue";
import { pingPublishRedis } from "./redis";
import { runRssAutopost } from "./rss";
import { postApproved } from "./state";
import { getPublishStoreStatus, getStoredChannel, listDueQueuePosts } from "./store";
import type { PublishAutomationTickStats, PublishTickResult } from "./types";

const MAX_PER_TICK = 8;

const EMPTY_AUTO: PublishAutomationTickStats = {
  checked: 0,
  created: 0,
  fired: 0,
  skipped: 0,
  errors: 0,
};

function safeStats(row: PublishAutomationTickStats | null | undefined): PublishAutomationTickStats {
  return row || { ...EMPTY_AUTO };
}

export async function tickPublishEngine(source = "tick"): Promise<PublishTickResult> {
  const store = await getPublishStoreStatus();
  const duePosts = await listDueQueuePosts();
  const redis = await pingPublishRedis();
  let bullmq = false;
  if (redis.ok) {
    bullmq = await startPublishWorkers([...IMPLEMENTED_PROVIDERS]);
  }

  let ran = 0;
  let skipped = 0;
  let enqueued = 0;
  let errors = 0;

  for (const post of duePosts.slice(0, MAX_PER_TICK)) {
    const channel = await getStoredChannel(post.channelId);
    const provider = channel?.provider || "unknown";
    const approved = postApproved(post);

    if (!approved) {
      skipped += 1;
      continue;
    }

    if (bullmq) {
      const ok = await enqueuePublishPost(post, provider, { approved: true });
      if (ok) {
        enqueued += 1;
        continue;
      }
    }

    try {
      const { result } = await runPublishPost(post.id, { approved: true });
      ran += 1;
      if (!result.ok) errors += 1;
    } catch (err) {
      errors += 1;
      console.error(
        `[publish-engine] ${source} failed`,
        post.id,
        err instanceof Error ? err.message : err
      );
    }
  }

  let rss = { ...EMPTY_AUTO };
  let plugs = { ...EMPTY_AUTO };
  try {
    rss = safeStats(await runRssAutopost());
  } catch (err) {
    rss = { ...EMPTY_AUTO, errors: 1 };
    console.error(
      `[publish-engine] ${source} rss failed`,
      err instanceof Error ? err.message : err
    );
  }
  try {
    plugs = safeStats(await runDuePlugs());
  } catch (err) {
    plugs = { ...EMPTY_AUTO, errors: 1 };
    console.error(
      `[publish-engine] ${source} plugs failed`,
      err instanceof Error ? err.message : err
    );
  }

  return {
    due: duePosts.length,
    ran,
    skipped,
    enqueued,
    errors,
    store,
    bullmq,
    rss,
    plugs,
  };
}
