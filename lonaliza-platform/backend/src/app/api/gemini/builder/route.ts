import { NextRequest, NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { runGeminiBuilderChat } from "@/lib/server/gemini-builder";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = await req.json();
    const wantsStream =
      body.stream === true ||
      (req.headers.get("accept") || "").includes("text/event-stream");

    if (!wantsStream) {
      const result = await runGeminiBuilderChat(body);
      if (!result.ok) {
        return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
      }
      return NextResponse.json(result);
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: string, data: unknown) => {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        };
        try {
          const result = await runGeminiBuilderChat(body, (chunk) => {
            send("delta", { text: chunk });
          });
          if (!result.ok) {
            send("error", { ok: false, error: result.error });
          } else {
            send("result", result);
          }
        } catch (e) {
          send("error", {
            ok: false,
            error: e instanceof Error ? e.message : "Unknown error",
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
