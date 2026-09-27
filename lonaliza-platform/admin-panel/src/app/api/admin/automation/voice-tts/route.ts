import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/server/admin-auth";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const denied = await assertAdminApi(req); if (denied) return denied;
  if (req.headers.get("origin") !== new URL(req.url).origin) return NextResponse.json({error:"Origin denied"},{status:403});
  let tts: MsEdgeTTS | undefined;
  try {
    const raw = await req.text();
    if (Buffer.byteLength(raw) > 8192) return NextResponse.json({error:"Too large"},{status:413});
    const body = JSON.parse(raw) as { text?: string; voice?: string };
    if (typeof body.text !== "string") return NextResponse.json({error:"Invalid text"},{status:400});
    const text = body.text?.trim();
    const voice = body.voice || "ar-SA-HamedNeural";
    if (!["ar-SA-HamedNeural","ar-SA-ZariyahNeural"].includes(voice)) return NextResponse.json({error:"Invalid voice"},{status:400});

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Clean text of markdown characters
    const cleanText = text.slice(0, 450).replace(/[\*\#\`\_]/g, "").trim();

    tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const { audioStream } = tts.toStream(cleanText);

    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => { tts?.close(); reject(new Error("timeout")); }, 20000);
      audioStream.on("data", (chunk: Buffer) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
      audioStream.on("end", () => { clearTimeout(timer); resolve(); });
      audioStream.on("error", (err: unknown) => { clearTimeout(timer); reject(err); });
    });

    tts.close();
    const audioBuffer = Buffer.concat(chunks);

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    console.warn("[VoiceTTS] Edge TTS synthesis failed, returning error for client fallback:", error?.message);
    return NextResponse.json(
      { error: "TTS synthesis failed" },
      { status: 500 }
    );
  } finally { tts?.close(); }
}
