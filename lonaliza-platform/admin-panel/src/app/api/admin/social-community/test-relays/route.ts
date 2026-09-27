import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { getNostrSocialSettings } from "@/lib/server/nostr-social-store";

export const runtime = "nodejs";

async function pingRelay(url: string, timeoutMs = 4000): Promise<{ ok: boolean; latency: number; error?: string }> {
  try {
    const { default: WebSocket } = await import("ws");
    return new Promise((resolve) => {
      const t0 = Date.now();
      let finished = false;
      const ws = new WebSocket(url);

      const timer = setTimeout(() => {
        if (!finished) {
          finished = true;
          try {
            ws.close();
          } catch {}
          resolve({ ok: false, latency: timeoutMs, error: "Connection timed out" });
        }
      }, timeoutMs);

      ws.on("open", () => {
        if (!finished) {
          finished = true;
          clearTimeout(timer);
          const latency = Date.now() - t0;
          try {
            ws.close();
          } catch {}
          resolve({ ok: true, latency });
        }
      });

      ws.on("error", (err: Error) => {
        if (!finished) {
          finished = true;
          clearTimeout(timer);
          try {
            ws.close();
          } catch {}
          resolve({ ok: false, latency: Date.now() - t0, error: err?.message || "Relay error" });
        }
      });
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "WebSocket error";
    return { ok: false, latency: -1, error: msg };
  }
}

export async function POST(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;

  const settings = await getNostrSocialSettings();
  const results = await Promise.all(
    settings.relays.map(async (r) => {
      const res = await pingRelay(r.url);
      return {
        url: r.url,
        name: r.name,
        active: r.active,
        ok: res.ok,
        latency: res.latency,
        error: res.error,
      };
    })
  );

  return NextResponse.json({ ok: true, results });
}
