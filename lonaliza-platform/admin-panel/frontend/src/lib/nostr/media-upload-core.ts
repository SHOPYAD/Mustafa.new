/**
 * Pure helpers for Blossom BUD-02 / BUD-06, NIP-96, and NIP-94 media uploads.
 * Kept free of XHR so WebView timeout, MIME, progress, and error contracts are unit-tested.
 */

export const WEBVIEW_CHUNK_BYTES = 512 * 1024;
export const DESKTOP_CHUNK_BYTES = 2 * 1024 * 1024;
export const NIP96_FREE_MAX_BYTES = 20 * 1024 * 1024;

export type MediaProtocol = "blossom" | "nip96";

export type UploadChunk = { offset: number; length: number };

export function uploadTimeoutMs(size: number): number {
  const bytes = Math.max(0, Number(size) || 0);
  const at50KBpsMs = Math.ceil(bytes / (50 * 1024)) * 1000;
  const processingMs = 45_000;
  return Math.min(15 * 60_000, Math.max(120_000, at50KBpsMs + processingMs));
}

export function mapUploadProgressPct(
  evt:
    | { phase: "hash"; ratio: number }
    | { phase: "send"; loaded: number; total: number }
    | { phase: "awaiting-response" }
    | { phase: "done" },
): number {
  if (evt.phase === "hash") {
    return Math.min(12, Math.max(0, Math.round(evt.ratio * 12)));
  }
  if (evt.phase === "send") {
    const total = evt.total > 0 ? evt.total : 1;
    const sendRatio = Math.min(1, Math.max(0, evt.loaded / total));
    // Bytes leaving the device is not server acknowledgement — cap at 95%.
    return Math.min(95, 12 + Math.round(sendRatio * 83));
  }
  if (evt.phase === "awaiting-response") return 98;
  return 100;
}

const EXT_MIME: Record<string, string> = {
  mp4: "video/mp4",
  m4v: "video/x-m4v",
  mov: "video/quicktime",
  webm: "video/webm",
  mkv: "video/x-matroska",
  avi: "video/x-msvideo",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  heic: "image/heic",
  heif: "image/heif",
  bin: "application/octet-stream",
};

export function guessMediaMime(file: { type?: string; name?: string }): string {
  const type = (file.type || "").toLowerCase().trim();
  if (type && type !== "application/octet-stream" && type !== "application/download") {
    return type;
  }
  const ext = (file.name || "").split(".").pop()?.toLowerCase() || "";
  return EXT_MIME[ext] || type || "application/octet-stream";
}

/** Magic-byte sniff for Android WebView files that arrive with empty type and no extension. */
export function sniffMediaMimeFromBytes(bytes: Uint8Array, fallback = "application/octet-stream"): string {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return "image/png";
  }
  if (bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
    const tag = String.fromCharCode(bytes[8] || 0, bytes[9] || 0, bytes[10] || 0, bytes[11] || 0);
    if (tag === "WEBP") return "image/webp";
    if (tag === "AVI ") return "video/x-msvideo";
  }
  if (bytes.length >= 12 && bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) {
    const brand = String.fromCharCode(bytes[8] || 0, bytes[9] || 0, bytes[10] || 0, bytes[11] || 0);
    if (/qt|moov/i.test(brand)) return "video/mp4";
    return "video/mp4";
  }
  if (bytes.length >= 4 && bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) {
    return "video/webm";
  }
  return fallback;
}

export function planUploadChunks(
  size: number,
  opts?: { webView?: boolean; chunkSize?: number },
): UploadChunk[] {
  const total = Math.max(0, Math.floor(size) || 0);
  if (total === 0) return [{ offset: 0, length: 0 }];
  const chunkSize =
    opts?.chunkSize || (opts?.webView ? WEBVIEW_CHUNK_BYTES : DESKTOP_CHUNK_BYTES);
  const chunks: UploadChunk[] = [];
  for (let offset = 0; offset < total; offset += chunkSize) {
    chunks.push({ offset, length: Math.min(chunkSize, total - offset) });
  }
  return chunks;
}

export function blossomSupportsPatch(allowMethods: string | null | undefined): boolean {
  return /\bPATCH\b/i.test(String(allowMethods || ""));
}

export function resolveMediaProtocol(serverUrl: string): {
  protocol: MediaProtocol;
  origin: string;
} {
  const raw = String(serverUrl || "").trim();
  const withScheme = raw.includes("://") ? raw : `https://${raw}`;
  try {
    const url = new URL(withScheme);
    const origin = `${url.protocol}//${url.host}`;
    const host = url.hostname.toLowerCase();
    if (host === "nostr.build" || host.endsWith(".nostr.build")) {
      if (host === "blossom.nostr.build" || host.startsWith("blossom.")) {
        return { protocol: "blossom", origin };
      }
      return { protocol: "nip96", origin: "https://nostr.build" };
    }
    if (host.includes("nostrcheck")) {
      return { protocol: "nip96", origin };
    }
    return { protocol: "blossom", origin };
  } catch {
    return { protocol: "blossom", origin: raw.replace(/\/+$/, "") };
  }
}

export function slicedBlob(file: Blob, mime: string, chunkSize: number): Blob {
  const parts: Blob[] = [];
  if (file.size > chunkSize) {
    for (let offset = 0; offset < file.size; offset += chunkSize) {
      parts.push(file.slice(offset, Math.min(file.size, offset + chunkSize)));
    }
  } else {
    parts.push(file);
  }
  // Always re-wrap so Android WebView empty File.type cannot leak as octet-stream.
  return new Blob(parts, { type: mime || "application/octet-stream" });
}

export function encodeNostrAuthHeader(event: unknown): string {
  const json = JSON.stringify(event);
  if (typeof Buffer !== "undefined") {
    return `Nostr ${Buffer.from(json, "utf8").toString("base64")}`;
  }
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  return `Nostr ${btoa(binary)}`;
}

export function parseBlossomDescriptor(
  bodyText: string,
  origin: string,
  sha256: string,
): { url: string; sha256: string; size?: number; type?: string } | null {
  try {
    const parsed = JSON.parse(bodyText) as {
      url?: string;
      sha256?: string;
      size?: number;
      type?: string;
    };
    const url = String(parsed?.url || "").trim();
    if (url.startsWith("http")) {
      return {
        url,
        sha256: String(parsed.sha256 || sha256),
        size: parsed.size,
        type: parsed.type,
      };
    }
  } catch {
    /* HTML / empty bodies are not descriptors */
  }
  if (!bodyText.trim() || bodyText.trim().startsWith("<")) return null;
  return { url: `${origin.replace(/\/+$/, "")}/${sha256}`, sha256 };
}

export function parseNip96UploadResponse(
  bodyText: string,
): { url: string; sha256?: string; nip94Tags: string[][]; message?: string } | null {
  try {
    const parsed = JSON.parse(bodyText) as {
      status?: string;
      message?: string;
      nip94_event?: { tags?: string[][] };
    };
    if (parsed?.status && parsed.status !== "success") {
      return null;
    }
    const tags = parsed?.nip94_event?.tags || [];
    const url = tags.find((t) => t[0] === "url")?.[1] || "";
    const sha = tags.find((t) => t[0] === "ox" || t[0] === "x")?.[1];
    if (!url.startsWith("http")) return null;
    return { url, sha256: sha, nip94Tags: tags, message: parsed.message };
  } catch {
    return null;
  }
}

export function formatMediaUploadError(info: {
  server: string;
  status?: number;
  statusText?: string;
  body?: string;
  xReason?: string;
  timeoutMs?: number;
  phase?: string;
  cors?: boolean;
}): string {
  const host = String(info.server || "")
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "")
    .split("/")[0];
  if (info.timeoutMs) {
    const seconds = Math.round(info.timeoutMs / 1000);
    const phase =
      info.phase === "awaiting-response" ? "انتظار رد الخادم بعد اكتمال الإرسال" : info.phase || "الرفع";
    return `انتهت مهلة رفع الوسائط (${seconds}ث) على ${host} أثناء ${phase} — الملف قد يغادر الجهاز لكن الخادم لم يؤكد الحفظ.`;
  }
  if (info.status === 0 || info.cors) {
    return `تعذر إكمال الرفع إلى ${host} (HTTP 0 / CORS أو WebView). غالباً رفض MIME أو 4xx بدون Access-Control-Allow-Origin بعد اكتمال الإرسال، وليس انقطاع الإنترنت.`;
  }
  const reason = String(info.xReason || info.body || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 280);
  if (info.status) {
    return `فشل رفع الوسائط HTTP ${info.status}${info.statusText ? ` ${info.statusText}` : ""} على ${host}${reason ? `: ${reason}` : ""}`;
  }
  return `فشل رفع الوسائط إلى ${host}${reason ? `: ${reason}` : ""}`;
}

export function isLikelyEmbeddedWebView(ua?: string): boolean {
  const hay =
    ua ||
    (typeof navigator !== "undefined" ? navigator.userAgent : "") ||
    "";
  return /LonalizaApp|LonalizaMobileApp|; wv\)|WebView/i.test(hay);
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.trim().toLowerCase();
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
  }
  return bytes;
}

const SHA256_K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

function rotr(n: number, x: number): number {
  return (x >>> n) | (x << (32 - n));
}

/** Incremental SHA-256 so WebView never holds a second copy of a multi-MB reel. */
export class IncrementalSha256 {
  private h = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ]);
  private block = new Uint8Array(64);
  private blockLen = 0;
  private bytes = 0;

  update(chunk: Uint8Array): void {
    let offset = 0;
    this.bytes += chunk.length;
    while (offset < chunk.length) {
      const take = Math.min(64 - this.blockLen, chunk.length - offset);
      this.block.set(chunk.subarray(offset, offset + take), this.blockLen);
      this.blockLen += take;
      offset += take;
      if (this.blockLen === 64) {
        this.compress(this.block);
        this.blockLen = 0;
      }
    }
  }

  digest(): Uint8Array {
    const bitLenHi = Math.floor(this.bytes / 0x20000000);
    const bitLenLo = (this.bytes * 8) >>> 0;
    this.update(new Uint8Array([0x80]));
    if (this.blockLen > 56) {
      this.block.fill(0, this.blockLen);
      this.compress(this.block);
      this.blockLen = 0;
    }
    this.block.fill(0, this.blockLen);
    const view = new DataView(this.block.buffer);
    view.setUint32(56, bitLenHi);
    view.setUint32(60, bitLenLo);
    this.compress(this.block);
    const out = new Uint8Array(32);
    const outView = new DataView(out.buffer);
    for (let i = 0; i < 8; i++) outView.setUint32(i * 4, this.h[i]!);
    return out;
  }

  private compress(block: Uint8Array): void {
    const w = new Uint32Array(64);
    const view = new DataView(block.buffer, block.byteOffset, 64);
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(i * 4);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(7, w[i - 15]!) ^ rotr(18, w[i - 15]!) ^ (w[i - 15]! >>> 3);
      const s1 = rotr(17, w[i - 2]!) ^ rotr(19, w[i - 2]!) ^ (w[i - 2]! >>> 10);
      w[i] = (w[i - 16]! + s0 + w[i - 7]! + s1) >>> 0;
    }
    let a = this.h[0]!;
    let b = this.h[1]!;
    let c = this.h[2]!;
    let d = this.h[3]!;
    let e = this.h[4]!;
    let f = this.h[5]!;
    let g = this.h[6]!;
    let hh = this.h[7]!;
    for (let i = 0; i < 64; i++) {
      const S1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (hh + S1 + ch + SHA256_K[i]! + w[i]!) >>> 0;
      const S0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;
      hh = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }
    this.h[0] = (this.h[0]! + a) >>> 0;
    this.h[1] = (this.h[1]! + b) >>> 0;
    this.h[2] = (this.h[2]! + c) >>> 0;
    this.h[3] = (this.h[3]! + d) >>> 0;
    this.h[4] = (this.h[4]! + e) >>> 0;
    this.h[5] = (this.h[5]! + f) >>> 0;
    this.h[6] = (this.h[6]! + g) >>> 0;
    this.h[7] = (this.h[7]! + hh) >>> 0;
  }
}

export async function sha256HexFromBlob(
  blob: Blob,
  onRatio?: (ratio: number) => void,
): Promise<string> {
  const hasher = new IncrementalSha256();
  const chunkSize = 1024 * 1024;
  let offset = 0;
  while (offset < blob.size) {
    const end = Math.min(blob.size, offset + chunkSize);
    const buf = new Uint8Array(await blob.slice(offset, end).arrayBuffer());
    hasher.update(buf);
    offset = end;
    onRatio?.(blob.size ? offset / blob.size : 1);
  }
  if (blob.size === 0) onRatio?.(1);
  return bytesToHex(hasher.digest());
}
