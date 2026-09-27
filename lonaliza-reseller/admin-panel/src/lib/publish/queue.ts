import { PUBLISH_BULLMQ_PREFIX, PUBLISH_QUEUE_PREFIX } from "./constants";
import { runPublishPost } from "./engine";
import { resolvePublishRedisConfig } from "./redis";
import type { PublishPost } from "./types";

type QueueMod = typeof import("bullmq");
type RedisMod = typeof import("ioredis");

let workerStarted = false;
const startedProviders = new Set<string>();

async function loadQueueLibs(): Promise<{
  Queue: QueueMod["Queue"];
  Worker: QueueMod["Worker"];
  Redis: RedisMod["default"];
} | null> {
  try {
    const [bull, ioredis] = await Promise.all([import("bullmq"), import("ioredis")]);
    return { Queue: bull.Queue, Worker: bull.Worker, Redis: ioredis.default };
  } catch {
    return null;
  }
}

async function connectionOpts() {
  const cfg = await resolvePublishRedisConfig();
  return {
    host: cfg.host,
    port: cfg.port,
    password: cfg.password,
    maxRetriesPerRequest: null as null,
  };
}

export function publishQueueName(provider: string): string {
  const clean = String(provider || "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "unknown";
  return `${PUBLISH_QUEUE_PREFIX}${clean}`;
}

export type PublishJobData = {
  postId: string;
  channelId: string;
  provider: string;
  approved: boolean;
};

export async function enqueuePublishPost(
  post: PublishPost,
  provider: string,
  options?: { approved?: boolean }
): Promise<boolean> {
  const libs = await loadQueueLibs();
  if (!libs) return false;
  try {
    const connection = await connectionOpts();
    const queue = new libs.Queue(publishQueueName(provider), {
      connection,
      prefix: PUBLISH_BULLMQ_PREFIX,
    });
    const at = Date.parse(post.publishDate);
    const delayMs = Number.isFinite(at)
      ? Math.max(0, at - Date.now()) + Math.max(0, post.delay || 0) * 1000
      : Math.max(0, post.delay || 0) * 1000;
    await queue.add(
      "publish",
      {
        postId: post.id,
        channelId: post.channelId,
        provider,
        approved: options?.approved === true,
      } satisfies PublishJobData,
      {
        delay: delayMs,
        removeOnComplete: 50,
        removeOnFail: 50,
        jobId: `${post.id}-${Date.parse(post.publishDate) || Date.now()}`,
      }
    );
    await queue.close();
    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/already exists|duplicat/i.test(msg)) return true;
    return false;
  }
}

async function ensureProviderWorker(provider: string): Promise<boolean> {
  if (startedProviders.has(provider)) return true;
  const libs = await loadQueueLibs();
  if (!libs) return false;
  try {
    const connection = await connectionOpts();
    const worker = new libs.Worker(
      publishQueueName(provider),
      async (job) => {
        const data = job.data as PublishJobData;
        if (!data?.postId) throw new Error("Missing postId");
        return runPublishPost(data.postId, { approved: data.approved === true });
      },
      {
        connection,
        prefix: PUBLISH_BULLMQ_PREFIX,
        concurrency: 1,
      }
    );
    worker.on("failed", (job, err) => {
      console.error(
        "[publish-worker] job failed",
        job?.id,
        err instanceof Error ? err.message : err
      );
    });
    startedProviders.add(provider);
    return true;
  } catch (error) {
    console.error(
      "[publish-worker] BullMQ start failed",
      provider,
      error instanceof Error ? error.message : error
    );
    return false;
  }
}

export async function startPublishWorkers(providers: string[]): Promise<boolean> {
  workerStarted = true;
  const results = await Promise.all(providers.map((p) => ensureProviderWorker(p)));
  return results.some(Boolean);
}

export function publishWorkersStarted(): boolean {
  return workerStarted && startedProviders.size > 0;
}
