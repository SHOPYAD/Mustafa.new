/**
 * Swarm Realtime Event Bus:
 * Distributes live deliberation pulses, terminal logs, consensus updates, and tool calls
 * to connected SSE clients and HUD studio visualizers.
 */

import { EventEmitter } from "events";

export interface SwarmStreamEvent {
  sessionId: string;
  type: "log" | "pulse" | "consensus" | "proposal" | "critique" | "decision" | "connected" | "heartbeat";
  data: Record<string, unknown>;
  timestamp: string;
}

class SwarmEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(100);
  }

  emitSwarmEvent(event: SwarmStreamEvent) {
    this.emit(`swarm:${event.sessionId}`, event);
    this.emit("swarm:broadcast", event);
  }

  subscribeToSession(sessionId: string, listener: (event: SwarmStreamEvent) => void): () => void {
    const channel = `swarm:${sessionId}`;
    this.on(channel, listener);
    this.on("swarm:broadcast", listener);
    return () => {
      this.off(channel, listener);
      this.off("swarm:broadcast", listener);
    };
  }
}

// Global singleton across hot reloads in Next.js
const globalForSwarmEvents = globalThis as unknown as {
  __swarmEventBusInstance?: SwarmEventBus;
};

export const swarmEventBus =
  globalForSwarmEvents.__swarmEventBusInstance || new SwarmEventBus();

if (process.env.NODE_ENV !== "production") {
  globalForSwarmEvents.__swarmEventBusInstance = swarmEventBus;
}

export function broadcastSwarmLog(
  sessionId: string,
  log: {
    id: string;
    sender: string;
    senderNameAr: string;
    role: string;
    contentAr: string;
    type: "directive" | "proposal" | "critique" | "consensus" | "decision" | "tool";
  }
) {
  swarmEventBus.emitSwarmEvent({
    sessionId,
    type: "log",
    data: log,
    timestamp: new Date().toISOString(),
  });
}

export function broadcastSwarmPulse(
  sessionId: string,
  agentId: string,
  activity: "thinking" | "active" | "tool_call" | "consensus"
) {
  swarmEventBus.emitSwarmEvent({
    sessionId,
    type: "pulse",
    data: { agentId, activity },
    timestamp: new Date().toISOString(),
  });
}
