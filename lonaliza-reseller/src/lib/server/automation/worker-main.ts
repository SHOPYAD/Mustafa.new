/**
 * Long-running automation worker.
 *
 * Start (safe, does not touch other pm2 apps):
 *   node scripts/automation-worker.mjs
 *   pm2 start ecosystem.config.cjs --only lonaliza-automation
 *
 * The Next route POST /api/cron/automation is the primary tick.
 * This process: (1) starts a BullMQ worker when Redis :6380 is up,
 * (2) ticks due jobs every 60s as a fallback.
 */
import { tickAutomationEngine } from "./engine";
import { startAutomationWorker } from "./queue";
import { pingAutomationRedis } from "./redis";

const TICK_MS = 60_000;

async function main(): Promise<void> {
  const redis = await pingAutomationRedis();
  console.log(
    `[automation-worker] redis ${redis.ok ? "up" : "down"} ${redis.host}:${redis.port}` +
      (redis.error ? ` (${redis.error})` : "")
  );
  const bull = redis.ok ? await startAutomationWorker() : false;
  console.log(`[automation-worker] bullmq ${bull ? "listening" : "inline-tick only"}`);

  const tick = async () => {
    try {
      const result = await tickAutomationEngine("worker");
      if (result.due || result.errors) {
        console.log("[automation-worker] tick", JSON.stringify({ due: result.due, ran: result.ran, errors: result.errors }));
      }
    } catch (error) {
      console.error("[automation-worker] tick failed", error instanceof Error ? error.message : error);
    }
  };

  await tick();
  setInterval(() => {
    void tick();
  }, TICK_MS);
}

void main();
