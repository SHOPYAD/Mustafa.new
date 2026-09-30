import { assertAdminApi } from "@/lib/server/admin-auth";
import { NextResponse } from "next/server";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const denied = await assertAdminApi(req);
  if (denied) return denied;
  try {
    const body = (await req.json()) as { text?: string; voice?: string };
    const text = body.text?.trim();
    const voice = body.voice || "ar-SA-HamedNeural";

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Clean text of markdown characters and formatting
    const cleanText = text
      .slice(0, 4000)
      .replace(/[\*\#\`\_\~\>]/g, "")
      .replace(/\s+/g, " ")
      .trim();

    // Split text into natural vocal chunks (maximum ~240 characters each) to prevent websocket timeouts
    const splitIntoVocalChunks = (raw: string, maxChars = 240): string[] => {
      // Split on sentence boundaries, list numbers, colons, semicolons, and periods
      const segments = raw.split(/(?<=[.!?:;\n]|\d\)\s+)/g).map((s) => s.trim()).filter(Boolean);
      const chunks: string[] = [];
      let current = "";

      for (const seg of segments) {
        if ((current + " " + seg).trim().length <= maxChars) {
          current = (current + " " + seg).trim();
        } else {
          if (current) chunks.push(current);
          if (seg.length > maxChars) {
            // Split further by Arabic/English commas
            const subSegments = seg.split(/(?<=[,،])\s+/g);
            let subCur = "";
            for (const sub of subSegments) {
              if ((subCur + " " + sub).trim().length <= maxChars) {
                subCur = (subCur + " " + sub).trim();
              } else {
                if (subCur) chunks.push(subCur);
                subCur = sub;
              }
            }
            current = subCur;
          } else {
            current = seg;
          }
        }
      }
      if (current) chunks.push(current);
      return chunks.length > 0 ? chunks : [raw];
    };

    const vocalChunks = splitIntoVocalChunks(cleanText, 240);

    const synthesizeChunk = async (chunkText: string): Promise<Buffer> => {
      const tts = new MsEdgeTTS();
      await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
      const { audioStream } = tts.toStream(chunkText);
      const buffers: Buffer[] = [];

      await new Promise<void>((resolve, reject) => {
        audioStream.on("data", (chunk: Buffer) =>
          buffers.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
        );
        audioStream.on("end", () => resolve());
        audioStream.on("error", (err: any) => reject(err));
      });

      tts.close();
      return Buffer.concat(buffers);
    };

    // Synthesize all chunks concurrently for lowest latency and full completion
    const chunkBuffers = await Promise.all(
      vocalChunks.map((chunk) =>
        synthesizeChunk(chunk).catch((err) => {
          console.warn("[VoiceTTS] Sub-chunk synthesis warning:", err?.message || err);
          return Buffer.alloc(0);
        })
      )
    );

    const audioBuffer = Buffer.concat(chunkBuffers.filter((b) => b.length > 0));

    if (audioBuffer.length === 0) {
      throw new Error("Zero audio bytes generated from synthesis chunks");
    }

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error: any) {
    console.warn("[VoiceTTS] Edge TTS synthesis failed, returning error for client fallback:", error?.message);
    return NextResponse.json(
      { error: "TTS synthesis failed", message: String(error?.message || error) },
      { status: 500 }
    );
  }
}
