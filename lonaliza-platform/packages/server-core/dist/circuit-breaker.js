const circuits = new Map();
function getRecord(name) {
    let rec = circuits.get(name);
    if (!rec) {
        rec = { state: "closed", failures: 0, openedAt: 0 };
        circuits.set(name, rec);
    }
    return rec;
}
export function circuitBreakerStatus(name) {
    return { ...getRecord(name) };
}
export async function withCircuitBreaker(options, fn) {
    const rec = getRecord(options.name);
    const now = Date.now();
    if (rec.state === "open") {
        if (now - rec.openedAt >= options.resetTimeoutMs) {
            rec.state = "half_open";
            rec.failures = 0;
        }
        else {
            throw new Error(`circuit_open:${options.name}`);
        }
    }
    try {
        const result = await fn();
        rec.state = "closed";
        rec.failures = 0;
        rec.lastError = undefined;
        return result;
    }
    catch (error) {
        rec.failures += 1;
        rec.lastError = error instanceof Error ? error.message : "unknown";
        if (rec.failures >= options.failureThreshold) {
            rec.state = "open";
            rec.openedAt = now;
        }
        throw error;
    }
}
export function resetCircuitBreakerForTests(name) {
    if (name)
        circuits.delete(name);
    else
        circuits.clear();
}
