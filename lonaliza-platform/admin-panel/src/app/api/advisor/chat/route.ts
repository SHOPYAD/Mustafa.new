import { NextRequest } from "next/server";
import { POST as salesChatPost } from "@/app/api/gemini/sales-chat/route";

type UiPart = { type?: string; text?: string };
type UiMessage = {
  role?: string;
  content?: unknown;
  text?: unknown;
  parts?: UiPart[];
};

function textFromUiMessage(msg: UiMessage): string {
  if (typeof msg.content === "string" && msg.content.trim()) return msg.content;
  if (typeof msg.text === "string" && msg.text.trim()) return msg.text;
  const parts = Array.isArray(msg.parts) ? msg.parts : [];
  return parts
    .filter((part) => part?.type === "text")
    .map((part) => String(part.text || ""))
    .join("\n")
    .trim();
}

function sseChunk(data: unknown): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
}

/**
 * AI SDK UI-message stream for @assistant-ui/ai-sdk useChatRuntime.
 * Wraps the live Gemini sales-chat + GDS tools (flights/hotels/cars/transfers).
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const uiMessages = Array.isArray(body.messages) ? (body.messages as UiMessage[]) : [];
  const nested =
    body.body && typeof body.body === "object"
      ? (body.body as Record<string, unknown>)
      : {};
  const locale = String(body.locale || nested.locale || "ar");
  const attachments = Array.isArray(body.attachments)
    ? body.attachments
    : Array.isArray(nested.attachments)
      ? nested.attachments
      : [];
  const audioBase64 = String(body.audioBase64 || nested.audioBase64 || "");
  const audioMime = String(body.audioMime || nested.audioMime || "audio/webm");
  const messages = uiMessages
    .map((msg) => ({
      role:
        msg.role === "assistant" || msg.role === "model" ? "assistant" : "user",
      content: textFromUiMessage(msg),
    }))
    .filter((msg) => msg.content);

  const inner = new NextRequest(new URL("/api/gemini/sales-chat", req.url), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie: req.headers.get("cookie") || "",
      authorization: req.headers.get("authorization") || "",
    },
    body: JSON.stringify({
      messages,
      locale,
      stream: false,
      attachments,
      audioBase64,
      audioMime,
    }),
  });

  const res = await salesChatPost(inner);
  const payload = ((await res.json().catch(() => ({
    ok: false,
    error: "advisor_failed",
  }))) || {}) as Record<string, unknown>;
  let reply = String(payload.reply || "");
  if (!reply) {
    const rawErr = String(payload.error || "");
    const isTechnical =
      rawErr.includes("high demand") ||
      rawErr.includes("Gemini") ||
      rawErr.includes("503") ||
      rawErr.includes("429") ||
      rawErr.includes("quota") ||
      rawErr.includes("capacity") ||
      rawErr.includes("UNAVAILABLE");

    if (isTechnical || !rawErr) {
      reply =
        locale === "ar"
          ? "مرحباً بك! يقوم خبراؤنا ومحرك الذكاء الاصطناعي بتجهيز وترتيب خيارات الرحلة الفاخرة بدقة متناهية. يرجى إعادة المحاولة بعد لحظات، أو التواصل المباشر مع فريق كونسيرج لوناليزا عبر واتساب للمساعدة الفورية وتأكيد حجزك."
          : "Welcome! Our travel designers are curating your luxury itinerary. Please try again in a moment, or contact our WhatsApp VIP Concierge for instant assistance.";
    } else {
      reply = rawErr;
    }
  }
  const textId = "txt-1";

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(sseChunk({ type: "start" }));
      controller.enqueue(sseChunk({ type: "text-start", id: textId }));
      if (reply) {
        controller.enqueue(
          sseChunk({ type: "text-delta", id: textId, delta: reply })
        );
      }
      controller.enqueue(sseChunk({ type: "text-end", id: textId }));
      if (payload.ok) {
        controller.enqueue(sseChunk({ type: "data-offers", data: payload }));
        {
          const itinerary = payload.itinerary as { destination?: string } | null;
          const destination = String(
            payload.destination || itinerary?.destination || ""
          ).trim();
          if (destination || itinerary) {
            controller.enqueue(
              sseChunk({
                type: "data-planner-trip",
                data: {
                  itinerary: payload.itinerary || null,
                  destination,
                  cards: payload.cards || [],
                },
              })
            );
          }
        }
      }
      controller.enqueue(sseChunk({ type: "finish" }));
      controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
      controller.close();
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
}
