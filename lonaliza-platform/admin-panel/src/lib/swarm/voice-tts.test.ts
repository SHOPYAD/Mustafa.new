import { describe, it, expect } from "vitest";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

describe("Sovereign Neural Arabic Voice Engine (msedge-tts)", () => {
  it("initializes and configures the Saudi Arabic Hamed neural voice", async () => {
    const tts = new MsEdgeTTS();
    await tts.setMetadata("ar-SA-HamedNeural", OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    expect(tts).toBeDefined();
  });

  it("synthesizes an Arabic voice stream with zero third-party API keys", async () => {
    const tts = new MsEdgeTTS();
    await tts.setMetadata("ar-SA-HamedNeural", OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    const { audioStream } = tts.toStream("تم تأكيد سلامة النواة السيادية.");
    expect(audioStream).toBeDefined();

    const receivedChunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      audioStream.on("data", (chunk: Buffer) => {
        receivedChunks.push(chunk);
      });
      audioStream.on("close", () => {
        resolve();
      });
      audioStream.on("error", (err: unknown) => {
        reject(err);
      });
    });

    const totalBuffer = Buffer.concat(receivedChunks);
    expect(totalBuffer.length).toBeGreaterThan(1000); // Verify audio bytes exist
  }, 10000);
});
