export type BulkheadOptions = {
  name: string;
  maxConcurrent: number;
};

type BulkheadState = {
  running: number;
  queue: Array<() => void>;
};

const bulkheads = new Map<string, BulkheadState>();

function getState(name: string): BulkheadState {
  let state = bulkheads.get(name);
  if (!state) {
    state = { running: 0, queue: [] };
    bulkheads.set(name, state);
  }
  return state;
}

function drain(name: string): void {
  const state = getState(name);
  while (state.running < state.queue.length && state.queue.length > 0) {
    const next = state.queue.shift();
    if (!next) break;
    state.running += 1;
    next();
  }
}

export async function withBulkhead<T>(options: BulkheadOptions, fn: () => Promise<T>): Promise<T> {
  const state = getState(options.name);
  if (state.running >= options.maxConcurrent) {
    await new Promise<void>((resolve) => {
      state.queue.push(resolve);
    });
  }
  state.running += 1;
  try {
    return await fn();
  } finally {
    state.running = Math.max(0, state.running - 1);
    const waiter = state.queue.shift();
    if (waiter) waiter();
    drain(options.name);
  }
}

export function resetBulkheadForTests(name?: string): void {
  if (name) bulkheads.delete(name);
  else bulkheads.clear();
}
