/**
 * Swarm BullMQ Durable Workflow Queue:
 * Guarantees fault-tolerant, resilient background execution of long-running multi-agent
 * tasks, scraping pipelines, and deliberation workflows.
 */

import { Queue, Worker, type Job } from "bullmq";
import Redis from "ioredis";

const REDIS_HOST = process.env.AUTOMATION_REDIS_HOST || process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = Number(process.env.AUTOMATION_REDIS_PORT || process.env.REDIS_PORT || 6380);
const REDIS_PASSWORD = process.env.AUTOMATION_REDIS_PASSWORD || process.env.REDIS_PASSWORD || undefined;

let redisConnection: Redis | null = null;

export function getSwarmRedisConnection(): Redis {
  if (!redisConnection) {
    redisConnection = new Redis({
      host: REDIS_HOST,
      port: REDIS_PORT,
      password: REDIS_PASSWORD,
      maxRetriesPerRequest: null,
      lazyConnect: true,
      enableReadyCheck: false,
    });
  }
  return redisConnection;
}

export const SWARM_DELIBERATION_QUEUE_NAME = "swarm-enterprise-deliberation";

let deliberationQueue: Queue | null = null;

export function getDeliberationQueue(): Queue {
  if (!deliberationQueue) {
    deliberationQueue = new Queue(SWARM_DELIBERATION_QUEUE_NAME, {
      connection: getSwarmRedisConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
        removeOnComplete: {
          count: 500,
          age: 86400, // 24 hours
        },
        removeOnFail: {
          count: 200,
        },
      },
    });
  }
  return deliberationQueue;
}

export interface EnqueueDeliberationOptions {
  directive: string;
  source?: "director_voice" | "director_hud" | "cron_trigger" | "telegram";
  budgetCeilingUsd?: number;
  priorityAgentId?: string;
}

export async function enqueueDeliberationJob(
  options: EnqueueDeliberationOptions
): Promise<{ jobId: string; queuedAt: string }> {
  const queue = getDeliberationQueue();
  const job = await queue.add(
    "run-swarm-cycle",
    {
      directive: options.directive,
      source: options.source || "director_hud",
      budgetCeilingUsd: options.budgetCeilingUsd || 500,
      priorityAgentId: options.priorityAgentId,
      enqueuedAt: new Date().toISOString(),
    },
    {
      priority: options.source === "director_voice" ? 1 : 2,
    }
  );

  return {
    jobId: job.id || `job_${Date.now()}`,
    queuedAt: new Date().toISOString(),
  };
}

export async function getDeliberationJobStatus(jobId: string): Promise<{
  state: string;
  progress?: number;
  result?: unknown;
  failedReason?: string;
} | null> {
  try {
    const queue = getDeliberationQueue();
    const job = await queue.getJob(jobId);
    if (!job) return null;
    const state = await job.getState();
    return {
      state,
      progress: (job.progress as number) || 0,
      result: job.returnvalue,
      failedReason: job.failedReason,
    };
  } catch {
    return null;
  }
}
