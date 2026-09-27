/**
 * Lonaliza Enterprise Multi-Agent Swarm Worker:
 * Standalone PM2 background worker processing BullMQ deliberation jobs decoupled
 * from HTTP request timeouts.
 */

import { Worker } from "bullmq";
import Redis from "ioredis";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from project root
dotenv.config({ path: path.join(__dirname, "..", ".env") });
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const REDIS_HOST = process.env.AUTOMATION_REDIS_HOST || process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = Number(process.env.AUTOMATION_REDIS_PORT || process.env.REDIS_PORT || 6380);
const REDIS_PASSWORD = process.env.AUTOMATION_REDIS_PASSWORD || process.env.REDIS_PASSWORD || undefined;

console.log(`[Swarm Worker] Starting up. Connecting to Redis on ${REDIS_HOST}:${REDIS_PORT}...`);

const redisConnection = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  lazyConnect: false,
  enableReadyCheck: false,
});

redisConnection.on("connect", () => {
  console.log("[Swarm Worker] Redis connection established successfully.");
});

redisConnection.on("error", (err) => {
  console.error("[Swarm Worker] Redis connection error:", err.message);
});

const QUEUE_NAME = "swarm-enterprise-deliberation";

// Dynamic import of deliberation engine via TS transpilation or direct API
const worker = new Worker(
  QUEUE_NAME,
  async (job) => {
    const { directive, source, budgetCeilingUsd, enqueuedAt } = job.data;
    console.log(`[Swarm Worker] Processing Job #${job.id}: "${directive}" from ${source}`);

    await job.updateProgress(10);

    // Call Next.js internal API or directly trigger execution
    const adminUrl = process.env.INTERNAL_ADMIN_URL || "http://127.0.0.1:3048";
    
    try {
      await job.updateProgress(30);

      // Trigger deliberation via admin-panel internal API endpoint
      const response = await fetch(`${adminUrl}/api/admin/automation/swarm-deliberate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          directive,
          source: source || "bullmq_worker",
          budgetCeilingUsd: budgetCeilingUsd || 500,
        }),
      });

      await job.updateProgress(85);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Deliberation API responded with ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      await job.updateProgress(100);

      console.log(`[Swarm Worker] Job #${job.id} completed successfully. Decision ID: ${result?.data?.decisionId || "generated"}`);
      return {
        ok: true,
        completedAt: new Date().toISOString(),
        jobId: job.id,
        decisionId: result?.data?.decisionId,
        consensusScore: result?.data?.consensusScore,
      };
    } catch (err) {
      console.error(`[Swarm Worker] Job #${job.id} failed:`, err);
      throw err;
    }
  },
  {
    connection: redisConnection,
    concurrency: 2,
    lockDuration: 60000,
  }
);

worker.on("completed", (job) => {
  console.log(`[Swarm Worker] Job #${job.id} marked as COMPLETED.`);
});

worker.on("failed", (job, err) => {
  console.error(`[Swarm Worker] Job #${job?.id} FAILED with error:`, err.message);
});

// Graceful shutdown
const shutdown = async () => {
  console.log("[Swarm Worker] Shutting down worker gracefully...");
  await worker.close();
  await redisConnection.quit();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
