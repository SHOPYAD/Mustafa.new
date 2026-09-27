import { describe, expect, it } from "vitest";
import {
  blossomSupportsPatch,
  bytesToHex,
  formatMediaUploadError,
  guessMediaMime,
  IncrementalSha256,
  mapUploadProgressPct,
  parseBlossomDescriptor,
  parseNip96UploadResponse,
  planUploadChunks,
  resolveMediaProtocol,
  sha256HexFromBlob,
  slicedBlob,
  sniffMediaMimeFromBytes,
  uploadTimeoutMs,
  WEBVIEW_CHUNK_BYTES,
} from "./media-upload-core";
import { composerUploadErrorMessage } from "@/lib/community/composer-media";
import { uploadToBlossom, type MediaUploadTransport, type MediaUploadResponse } from "./blossom-uploader";

describe("media upload core", () => {
  it("hashes blobs incrementally so WebView never needs a second full copy", async () => {
    const hasher = new IncrementalSha256();
    hasher.update(new TextEncoder().encode("abc"));
    expect(bytesToHex(hasher.digest())).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
    const payload = new Uint8Array(3000).map((_, i) => i % 256);
    const sliced = await sha256HexFromBlob(new Blob([payload]));
    const whole = bytesToHex(new Uint8Array(await crypto.subtle.digest("SHA-256", payload)));
    expect(sliced).toBe(whole);
  });

  it("gives videos a timeout well above the old 45s WebView cutoff", () => {
    expect(uploadTimeoutMs(20 * 1024 * 1024)).toBeGreaterThan(45_000);
    expect(uploadTimeoutMs(180 * 1024 * 1024)).toBeGreaterThan(120_000);
    expect(uploadTimeoutMs(200_000)).toBeGreaterThanOrEqual(60_000);
  });

  it("never reports 100% merely because the request body left the device", () => {
    expect(mapUploadProgressPct({ phase: "hash", ratio: 1 })).toBeLessThan(20);
    expect(mapUploadProgressPct({ phase: "send", loaded: 10_000_000, total: 10_000_000 })).toBe(95);
    expect(mapUploadProgressPct({ phase: "awaiting-response" })).toBe(98);
    expect(mapUploadProgressPct({ phase: "done" })).toBe(100);
  });

  it("sniffs Android WebView empty MIME from the file name", () => {
    expect(guessMediaMime({ type: "", name: "VID_20260914_120000.mp4" })).toBe("video/mp4");
    expect(guessMediaMime({ type: "application/octet-stream", name: "reel.mov" })).toBe(
      "video/quicktime",
    );
    expect(guessMediaMime({ type: "image/jpeg", name: "a.jpg" })).toBe("image/jpeg");
  });

  it("sniffs ftyp boxes so empty WebView MIME does not become octet-stream", () => {
    const ftyp = new Uint8Array([
      0, 0, 0, 24, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d, 0, 0, 2, 0,
    ]);
    expect(sniffMediaMimeFromBytes(ftyp, "application/octet-stream")).toBe("video/mp4");
    const wrapped = slicedBlob(new File([ftyp], "VID_1", { type: "" }), "video/mp4", 512);
    expect(wrapped.type).toBe("video/mp4");
  });

  it("plans WebView-sized slices and detects that Primal does not advertise PATCH", () => {
    const chunks = planUploadChunks(2_500_000, { webView: true });
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0]?.length).toBe(WEBVIEW_CHUNK_BYTES);
    expect(chunks.reduce((n, c) => n + c.length, 0)).toBe(2_500_000);
    expect(blossomSupportsPatch("GET, PUT, DELETE")).toBe(false);
    expect(blossomSupportsPatch("GET, PUT, PATCH, DELETE")).toBe(true);
  });

  it("treats nostr.build as NIP-96 and primal as Blossom PUT /upload", () => {
    expect(resolveMediaProtocol("https://blossom.primal.net")).toEqual({
      protocol: "blossom",
      origin: "https://blossom.primal.net",
    });
    expect(resolveMediaProtocol("https://nostr.build")).toEqual({
      protocol: "nip96",
      origin: "https://nostr.build",
    });
    expect(resolveMediaProtocol("https://nostr.build/upload")).toEqual({
      protocol: "nip96",
      origin: "https://nostr.build",
    });
  });

  it("parses Blossom BUD-02 descriptors and NIP-96 / NIP-94 upload JSON", () => {
    expect(
      parseBlossomDescriptor(
        '{"url":"https://blossom.primal.net/abc.mp4","sha256":"abc","size":16,"type":"video/mp4"}',
        "https://blossom.primal.net",
        "abc",
      )?.url,
    ).toBe("https://blossom.primal.net/abc.mp4");
    expect(
      parseNip96UploadResponse(
        JSON.stringify({
          status: "success",
          message: "Upload successful.",
          nip94_event: {
            tags: [
              ["url", "https://video.nostr.build/abc.mp4"],
              ["ox", "abc"],
              ["m", "video/mp4"],
            ],
          },
        }),
      )?.url,
    ).toBe("https://video.nostr.build/abc.mp4");
  });

  it("surfaces HTTP status and server body instead of a fake network string", () => {
    const blossom413 = formatMediaUploadError({
      server: "https://blossom.primal.net",
      status: 413,
      statusText: "Content Too Large",
      body: "File too large. Max allowed size is 100MB.",
    });
    expect(blossom413).toMatch(/413/);
    expect(blossom413).toMatch(/100MB/);
    expect(composerUploadErrorMessage(new Error(blossom413))).toMatch(/413/);
    expect(composerUploadErrorMessage(new Error(blossom413))).not.toMatch(/تحقق من الاتصال/);

    const timedOut = formatMediaUploadError({
      server: "https://blossom.primal.net",
      timeoutMs: 120_000,
      phase: "awaiting-response",
    });
    expect(timedOut).toMatch(/120/);
    expect(composerUploadErrorMessage(new Error(timedOut))).not.toMatch(/تحقق من الاتصال/);
  });
});

describe("uploadToBlossom WebView pipeline", () => {
  it("fails over from a 45s-style timeout to NIP-96 and returns the NIP-94 url", async () => {
    const calls: string[] = [];
    const file = new File([new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7])], "reel.mp4", {
      type: "video/mp4",
    });
    const transport: MediaUploadTransport = {
      async request(opts): Promise<MediaUploadResponse> {
        calls.push(`${opts.method} ${opts.url}`);
        if (opts.method === "OPTIONS" || opts.method === "HEAD") {
          return {
            status: 200,
            statusText: "OK",
            bodyText: "ok",
            headers: { allow: "GET, PUT, DELETE" },
          };
        }
        if (opts.url.endsWith("/upload") && opts.method === "PUT") {
          throw Object.assign(new Error("timeout"), { timeout: true, timeoutMs: 45_000 });
        }
        if (opts.url.includes("/.well-known/nostr/nip96.json")) {
          return {
            status: 200,
            statusText: "OK",
            bodyText: JSON.stringify({
              api_url: "https://nostr.build/api/v2/nip96/upload",
              download_url: "https://media.nostr.build",
            }),
            headers: {},
          };
        }
        if (opts.url.includes("/api/v2/nip96/upload")) {
          expect(opts.method).toBe("POST");
          expect(opts.body).toBeInstanceOf(FormData);
          return {
            status: 200,
            statusText: "OK",
            bodyText: JSON.stringify({
              status: "success",
              message: "Upload successful.",
              nip94_event: {
                tags: [["url", "https://video.nostr.build/reel.mp4"], ["ox", "deadbeef"]],
              },
            }),
            headers: {},
          };
        }
        throw new Error(`unexpected ${opts.method} ${opts.url}`);
      },
    };

    const percents: number[] = [];
    const result = await uploadToBlossom(file, {
      servers: ["https://blossom.primal.net", "https://nostr.build"],
      transport,
      onProgress: (pct) => percents.push(pct),
      signAuth: async (template) => ({ ...template, id: "1", sig: "2", pubkey: "ab" }),
    });

    expect(result.url).toBe("https://video.nostr.build/reel.mp4");
    expect(calls.some((c) => c.startsWith("PUT https://blossom.primal.net/upload"))).toBe(true);
    expect(calls.some((c) => c.includes("nip96/upload"))).toBe(true);
    expect(Math.max(0, ...percents.filter((p) => p < 100))).toBeLessThanOrEqual(98);
    expect(percents.at(-1)).toBe(100);
  });

  it("throws the Blossom HTTP body when every server rejects the blob", async () => {
    const file = new File([new Uint8Array([9, 9, 9])], "reel.mp4", { type: "video/mp4" });
    const transport: MediaUploadTransport = {
      async request(opts): Promise<MediaUploadResponse> {
        if (opts.method === "HEAD") {
          return { status: 200, statusText: "OK", bodyText: "", headers: {} };
        }
        return {
          status: 415,
          statusText: "Unsupported Media Type",
          bodyText: "unsupported media type: video/quicktime",
          headers: { "x-reason": "reels must be mp4" },
        };
      },
    };

    await expect(
      uploadToBlossom(file, {
        servers: ["https://blossom.primal.net"],
        transport,
        signAuth: async (template) => ({ ...template, id: "1", sig: "2", pubkey: "ab" }),
      }),
    ).rejects.toThrow(/415/);
  });
});
