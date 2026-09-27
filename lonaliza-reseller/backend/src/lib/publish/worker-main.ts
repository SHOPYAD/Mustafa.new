/**
 * Long-running publish worker (optional).
 *
 * Start (safe, does not touch other pm2 apps):
 *   node scripts/publish-worker.mjs
 *   npx tsx src/lib/publish/worker-main.ts
 *
 * The Next route POST /api/admin/publish/tick is the primary tick.
 * This process: (1) starts BullMQ workers per provider when Redis :6380 is up,
 * (2) ticks due queue posts, RSS autopost, and plugs every 60s as a fallback.
 */
import { IMPLEMENTED_PROVIDERS } from "./constants";
import { startPublishWorkers } from "./queue";
import { pingPublishRedis } from "./redis";
import { tickPublishEngine } from "./tick";

const TICK_MS = Number(process.env.PUBLISH_TICK_MS || 60_000);

async function main(): Promise<void> {
  const redis = await pingPublishRedis();
  console.log(
    `[publish-worker] redis ${redis.ok ? "up" : "down"} ${redis.host}:${redis.port}` +
      (redis.error ? ` (${redis.error})` : "")
  );
  const bull = redis.ok ? await startPublishWorkers([...IMPLEMENTED_PROVIDERS]) : false;
  console.log(`[publish-worker] bullmq ${bull ? "listening" : "inline-tick only"}`);

  const tick = async () => {
    try {
      const result = await tickPublishEngine("worker");
      if (result.due || result.errors || result.rss?.fired || result.plugs?.fired || result.rss?.errors || result.plugs?.errors) {
        console.log(
          "[publish-worker] tick",
          JSON.stringify({
            due: result.due,
            ran: result.ran,
            skipped: result.skipped,
            enqueued: result.enqueued,
            errors: result.errors,
            rss: result.rss,
            plugs: result.plugs,
          })
        );
      }
    } catch (error) {
      console.error(
        "[publish-worker] tick failed",
        error instanceof Error ? error.message : error
      );
    }
  };

  await tick();
  setInterval(() => {
    void tick();
  }, TICK_MS);
}

void main();
