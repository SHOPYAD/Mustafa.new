function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const n = samples.length;
  const buffer = new ArrayBuffer(44 + n * 2);
  const view = new DataView(buffer);
  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + n * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, n * 2, true);
  let offset = 44;
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }
  return new Blob([buffer], { type: "audio/wav" });
}

function mixToMono(buffer: AudioBuffer): Float32Array {
  const len = buffer.length;
  const out = new Float32Array(len);
  const channels = buffer.numberOfChannels;
  for (let c = 0; c < channels; c++) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < len; i++) out[i] += data[i] / channels;
  }
  return out;
}

export async function mediaBlobToWav(blob: Blob): Promise<Blob> {
  const ctx = new AudioContext();
  try {
    const raw = await blob.arrayBuffer();
    const decoded = await ctx.decodeAudioData(raw.slice(0));
    const sampleRate = 24000;
    const duration = Math.max(0.2, Math.min(25, decoded.duration || 0));
    const offline = new OfflineAudioContext(1, Math.ceil(duration * sampleRate), sampleRate);
    const mono = mixToMono(decoded);
    const srcBuf = offline.createBuffer(1, mono.length, decoded.sampleRate);
    (srcBuf as any).copyToChannel(mono, 0);
    const src = offline.createBufferSource();
    src.buffer = srcBuf;
    src.connect(offline.destination);
    src.start(0);
    const rendered = await offline.startRendering();
    return encodeWav(rendered.getChannelData(0), sampleRate);
  } finally {
    await ctx.close().catch(() => undefined);
  }
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("read failed"));
    reader.readAsDataURL(blob);
  });
}

/** Peak/RMS of a recorded clip so we can warn when the mic captured silence. */
export async function inspectVoiceBlob(blob: Blob): Promise<{ rms: number; peak: number; audible: boolean }> {
  try {
    const ctx = new AudioContext();
    try {
      const decoded = await ctx.decodeAudioData(await blob.arrayBuffer());
      const data = mixToMono(decoded);
      let peak = 0;
      let sum = 0;
      const step = Math.max(1, Math.floor(data.length / 8000));
      let n = 0;
      for (let i = 0; i < data.length; i += step) {
        const v = Math.abs(data[i]);
        if (v > peak) peak = v;
        sum += data[i] * data[i];
        n += 1;
      }
      const rms = Math.sqrt(sum / Math.max(1, n));
      return { rms, peak, audible: peak > 0.012 || rms > 0.004 };
    } finally {
      await ctx.close().catch(() => undefined);
    }
  } catch {
    return { rms: 1, peak: 1, audible: blob.size > 2500 };
  }
}
