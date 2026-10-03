import { createHash, randomUUID } from "crypto";
import { cacheGet, cacheSet } from "../../../../packages/server-core/src/distributed-cache";
import { withBulkhead } from "../../../../packages/server-core/src/bulkhead";
import { withCircuitBreaker } from "../../../../packages/server-core/src/circuit-breaker";
import { runFlightSearch } from "@/lib/server/flights-engine";

type FlightSearchInput = Parameters<typeof runFlightSearch>[0];

const JOB_TTL_MS = 5 * 60 * 1000;
const RESULT_PREFIX = "search:flight:job:";

export type FlightSearchJobStatus = "pending" | "complete" | "failed";

export type FlightSearchJobRecord = {
  jobId: string;
  status: FlightSearchJobStatus;
  createdAt: string;
  errorCode?: string;
  payload?: Record<string, unknown>;
};

function jobKey(jobId: string): string {
  return `${RESULT_PREFIX}${jobId}`;
}

export function flightSearchCacheKeyFromQuery(search: string): string {
  return createHash("sha256").update(search).digest("hex").slice(0, 32);
}

export async function enqueueFlightSearchJob(
  searchParams: string,
  input: FlightSearchInput
): Promise<{ jobId: string; cacheKey: string }> {
  const jobId = randomUUID();
  const cacheKey = flightSearchCacheKeyFromQuery(searchParams);
  const pending: FlightSearchJobRecord = {
    jobId,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  await cacheSet(jobKey(jobId), pending, JOB_TTL_MS);

  void processFlightSearchJob(jobId, cacheKey, input).catch(async (error) => {
    const failed: FlightSearchJobRecord = {
      jobId,
      status: "failed",
      createdAt: pending.createdAt,
      errorCode: error instanceof Error ? error.message : "search_failed",
    };
    await cacheSet(jobKey(jobId), failed, JOB_TTL_MS);
  });

  return { jobId, cacheKey };
}

async function processFlightSearchJob(
  jobId: string,
  cacheKey: string,
  input: FlightSearchInput
): Promise<void> {
  const result = await withBulkhead(
    { name: "flight-provider", maxConcurrent: Number(process.env.FLIGHT_SEARCH_CONCURRENCY || 12) },
    () =>
      withCircuitBreaker(
        {
          name: "flight-provider",
          failureThreshold: Number(process.env.FLIGHT_CIRCUIT_FAILURES || 5),
          resetTimeoutMs: Number(process.env.FLIGHT_CIRCUIT_RESET_MS || 60_000),
        },
        () => runFlightSearch(input)
      )
  );

  if (!result.ok) {
    const failed: FlightSearchJobRecord = {
      jobId,
      status: "failed",
      createdAt: new Date().toISOString(),
      errorCode: result.errorCode,
    };
    await cacheSet(jobKey(jobId), failed, JOB_TTL_MS);
    return;
  }

  const { session } = result;
  const payload = {
    ok: true,
    provider: "live",
    sessionId: session.sessionId,
    status: session.status,
    itineraries: session.itineraries,
    currency: session.currency,
    empty: session.itineraries.length === 0,
  };

  await cacheSet(`flights:v11:${cacheKey}`, payload, 2 * 60 * 1000);

  const complete: FlightSearchJobRecord = {
    jobId,
    status: "complete",
    createdAt: new Date().toISOString(),
    payload,
  };
  await cacheSet(jobKey(jobId), complete, JOB_TTL_MS);
}

export async function getFlightSearchJob(jobId: string): Promise<FlightSearchJobRecord | undefined> {
  return cacheGet<FlightSearchJobRecord>(jobKey(jobId));
}
