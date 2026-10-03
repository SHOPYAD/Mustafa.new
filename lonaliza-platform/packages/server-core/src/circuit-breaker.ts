export type CircuitState = "closed" | "open" | "half_open";

export type CircuitBreakerOptions = {
  failureThreshold: number;
  resetTimeoutMs: number;
  name: string;
};

type CircuitRecord = {
  state: CircuitState;
  failures: number;
  openedAt: number;
  lastError?: string;
};

const circuits = new Map<string, CircuitRecord>();

function getRecord(name: string): CircuitRecord {
  let rec = circuits.get(name);
  if (!rec) {
    rec = { state: "closed", failures: 0, openedAt: 0 };
    circuits.set(name, rec);
  }
  return rec;
}

export function circuitBreakerStatus(name: string): CircuitRecord {
  return { ...getRecord(name) };
}

export async function withCircuitBreaker<T>(
  options: CircuitBreakerOptions,
  fn: () => Promise<T>
): Promise<T> {
  const rec = getRecord(options.name);
  const now = Date.now();

  if (rec.state === "open") {
    if (now - rec.openedAt >= options.resetTimeoutMs) {
      rec.state = "half_open";
      rec.failures = 0;
    } else {
      throw new Error(`circuit_open:${options.name}`);
    }
  }

  try {
    const result = await fn();
    rec.state = "closed";
    rec.failures = 0;
    rec.lastError = undefined;
    return result;
  } catch (error) {
    rec.failures += 1;
    rec.lastError = error instanceof Error ? error.message : "unknown";
    if (rec.failures >= options.failureThreshold) {
      rec.state = "open";
      rec.openedAt = now;
    }
    throw error;
  }
}

export function resetCircuitBreakerForTests(name?: string): void {
  if (name) circuits.delete(name);
  else circuits.clear();
}
