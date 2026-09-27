import { NextResponse } from "next/server";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { text?: string; voice?: string };
    const text = body.text?.trim();
    const voice = body.voice || "ar-SA-HamedNeural";

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    // Clean text of markdown characters
    const cleanText = text.slice(0, 450).replace(/[\*\#\`\_]/g, "").trim();

    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const { audioStream } = tts.toStream(cleanText);

    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      audioStream.on("data", (chunk: Buffer) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
      audioStream.on("end", () => resolve());
      audioStream.on("error", (err: any) => reject(err));
    });

    tts.close();
    const audioBuffer = Buffer.concat(chunks);

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
