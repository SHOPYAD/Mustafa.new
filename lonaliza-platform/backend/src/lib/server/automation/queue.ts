import { AUTOMATION_QUEUE_NAME, resolveAutomationRedisConfig } from "./redis";
import { runAutomationJobById } from "./runner";

const HEARTBEAT_KEY = "worker:heartbeat";
const HEARTBEAT_TTL_SEC = 90;

type QueueMod = typeof import("bullmq");
type RedisMod = typeof import("ioredis");

let workerStarted = false;

async function loadQueueLibs(): Promise<{ Queue: QueueMod["Queue"]; Worker: QueueMod["Worker"]; Redis: RedisMod["default"] } | null> {
  try {
    const [bull, ioredis] = await Promise.all([import("bullmq"), import("ioredis")]);
    return { Queue: bull.Queue, Worker: bull.Worker, Redis: ioredis.default };
  } catch {
    return null;
  }
}

async function connectionOpts() {
  const cfg = await resolveAutomationRedisConfig();
  return {
    host: cfg.host,
    port: cfg.port,
    password: cfg.password,
    maxRetriesPerRequest: null as null,
  };
}

export async function enqueueAutomationJob(
  jobId: string,
  options?: { dryRun?: boolean }
): Promise<boolean> {
  const libs = await loadQueueLibs();
  if (!libs) return false;
  try {
    const connection = await connectionOpts();
    const queue = new libs.Queue(AUTOMATION_QUEUE_NAME, {
      connection,
      prefix: "{lonaliza-automation}",
    });
    await queue.add(
      "run",
      { jobId, dryRun: options?.dryRun === true },
      { removeOnComplete: 50, removeOnFail: 50, jobId: `${jobId}-${Date.now()}` }
    );
    await queue.close();
    return true;
  } catch {
    return false;
  }
}

export async function isAutomationWorkerAlive(): Promise<boolean> {
  const libs = await loadQueueLibs();
  if (!libs) return false;
  try {
    const cfg = await resolveAutomationRedisConfig();
    const redis = new libs.Redis({
      host: cfg.host,
      port: cfg.port,
      password: cfg.password,
      keyPrefix: cfg.prefix,
      connectTimeout: 1500,
      maxRetriesPerRequest: 1,
      lazyConnect: true,
    });
    await redis.connect();
    const value = await redis.get(HEARTBEAT_KEY);
    await redis.quit();
    return Boolean(value);
  } catch {
    return false;
  }
}

async function writeHeartbeat(): Promise<void> {
  const libs = await loadQueueLibs();
  if (!libs) return;
  try {
    const cfg = await resolveAutomationRedisConfig();
    const redis = new libs.Redis({
      host: cfg.host,
      port: cfg.port,
      password: cfg.password,
      keyPrefix: cfg.prefix,
      maxRetriesPerRequest: 1,
    });
    await redis.set(HEARTBEAT_KEY, String(Date.now()), "EX", HEARTBEAT_TTL_SEC);
    await redis.quit();
  } catch {
    /* heartbeat is optional */
  }
}

export async function startAutomationWorker(): Promise<boolean> {
  if (workerStarted) return true;
  const libs = await loadQueueLibs();
  if (!libs) return false;
  try {
    const connection = await connectionOpts();
    const worker = new libs.Worker(
      AUTOMATION_QUEUE_NAME,
      async (job) => {
        const jobId = String((job.data as { jobId?: string }).jobId || "");
        if (!jobId) throw new Error("Missing jobId");
        const dryRun = Boolean((job.data as { dryRun?: boolean }).dryRun);
        return runAutomationJobById(jobId, { dryRun, source: "worker" });
      },
      {
        connection,
        prefix: "{lonaliza-automation}",
        concurrency: 2,
      }
    );
    worker.on("failed", (job, err) => {
      console.error("[automation-worker] job failed", job?.id, err instanceof Error ? err.message : err);
    });
    workerStarted = true;
    await writeHeartbeat();
    setInterval(() => {
      void writeHeartbeat();
    }, 30_000);
    return true;
  } catch (error) {
    console.error("[automation-worker] BullMQ start failed", error instanceof Error ? error.message : error);
    return false;
  }
}
