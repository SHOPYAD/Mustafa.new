import { NextRequest, NextResponse } from "next/server";
import { swarmEventBus, type SwarmStreamEvent } from "@/lib/swarm/swarm-events";
import { assertAdminApi } from "@/lib/server/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const denied = await assertAdminApi(request);
  if (denied) return denied;
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get("sessionId") || "live_global";

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Initial Handshake
      const initPayload = JSON.stringify({
        sessionId,
        type: "connected",
        data: { message: "SSE connected to Lonaliza Swarm Core", sessionId },
        timestamp: new Date().toISOString(),
      });
      controller.enqueue(encoder.encode(`data: ${initPayload}\n\n`));

      // 2. Subscribe to Event Bus
      const unsubscribe = swarmEventBus.subscribeToSession(sessionId, (event: SwarmStreamEvent) => {
        try {
          const payload = JSON.stringify(event);
          controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        } catch (err) {
          console.warn("[SSE] Controller push notice:", err);
        }
      });

      // 3. Heartbeat ping every 15s to keep connection healthy
      const heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 15000);

      // Cleanup on abort
      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeatInterval);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // ignore
        }
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
