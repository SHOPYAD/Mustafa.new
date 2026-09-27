/**
 * Blossom BUD-02 / BUD-06 & NIP-96 / NIP-94 media uploader.
 *
 * Direct browser → CDN ingest (no local disk). WebView-safe:
 * - never copies the whole reel via File.arrayBuffer() before send
 * - timeout scales with size (the old 45s cutoff aborted after progress looked done)
 * - PUT /upload on Blossom; NIP-96 FormData on nostr.build (PUT /upload there is HTML)
 * - PATCH chunks when the server advertises Allow: PATCH; otherwise sliced Blob streaming
 */

import { generateSecretKey, getPublicKey, finalizeEvent } from "nostr-tools/pure";
import {
  blossomSupportsPatch,
  encodeNostrAuthHeader,
  formatMediaUploadError,
  guessMediaMime,
  hexToBytes,
  isLikelyEmbeddedWebView,
  mapUploadProgressPct,
  NIP96_FREE_MAX_BYTES,
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

export type BlossomUploadResult = {
  url: string;
  sha256: string;
  size: number;
  type: string;
  nip94Tags?: string[][];
};

export type MediaUploadResponse = {
  status: number;
  statusText: string;
  bodyText: string;
  headers: Record<string, string>;
};

export type MediaUploadRequest = {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: Blob | File | FormData | null;
  timeoutMs: number;
  onProgress?: (loaded: number, total: number) => void;
};

export type MediaUploadTransport = {
  request: (opts: MediaUploadRequest) => Promise<MediaUploadResponse>;
};

export type BlossomAuthTemplate = {
  kind: number;
  created_at: number;
  content: string;
  tags: string[][];
};

const DEFAULT_MEDIA_SERVERS = ["https://blossom.primal.net", "https://nostr.build"];

const nip96Cache = new Map<string, { apiUrl: string; downloadUrl?: string; fetchedAt: number }>();

export { getPublicKey };

/**
 * Get or create local Nostr key for anonymous/authenticated tourists
 */
export function getOrCreateLocalNostrKey(): { privkeyHex: string; pubkey: string } {
  if (typeof window === "undefined") {
    return { privkeyHex: "", pubkey: "" };
  }
  let priv = localStorage.getItem("lonaliza_nostr_privkey");
  if (!priv || priv.length !== 64) {
    const sk = generateSecretKey();
    priv = Array.from(sk)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    localStorage.setItem("lonaliza_nostr_privkey", priv);
  }
  const pk = getPublicKey(hexToBytes(priv));
  localStorage.setItem("lonaliza_nostr_pubkey", pk);
  return { privkeyHex: priv, pubkey: pk };
}

function xhrTransport(): MediaUploadTransport {
  return {
    request(opts) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(opts.method, opts.url, true);
        xhr.timeout = Math.max(0, opts.timeoutMs || 0);
        xhr.responseType = "text";
        for (const [key, value] of Object.entries(opts.headers || {})) {
          if (value) xhr.setRequestHeader(key, value);
        }
        if (xhr.upload && opts.onProgress) {
          xhr.upload.onprogress = (evt) => {
            if (evt.lengthComputable && evt.total > 0) {
              opts.onProgress?.(evt.loaded, evt.total);
            }
          };
        }
        xhr.onload = () => {
          const headers: Record<string, string> = {};
          const reason = xhr.getResponseHeader("X-Reason") || xhr.getResponseHeader("x-reason");
          if (reason) headers["x-reason"] = reason;
          const allow = xhr.getResponseHeader("Allow") || xhr.getResponseHeader("access-control-allow-methods");
          if (allow) headers["allow"] = allow;
          resolve({
            status: xhr.status,
            statusText: xhr.statusText,
            bodyText: typeof xhr.responseText === "string" ? xhr.responseText : "",
            headers,
          });
        };
        xhr.onerror = () =>
          reject(Object.assign(new Error("xhr_network"), { status: 0, cors: true }));
        xhr.ontimeout = () =>
          reject(Object.assign(new Error("timeout"), { timeout: true, timeoutMs: opts.timeoutMs }));
        try {
          xhr.send(opts.body ?? null);
        } catch (err) {
          reject(err);
        }
      });
    },
  };
}

async function defaultSignAuth(template: BlossomAuthTemplate): Promise<unknown> {
  const win = typeof window !== "undefined" ? (window as unknown as { nostr?: { signEvent?: (e: unknown) => Promise<unknown> } }) : undefined;
  if (win?.nostr?.signEvent) {
    try {
      return await win.nostr.signEvent(template);
    } catch {
      /* fall through to local key */
    }
  }
  const { privkeyHex } = getOrCreateLocalNostrKey();
  if (!privkeyHex) {
    throw new Error("تعذر توقيع رفع الوسائط: لا يوجد مفتاح نوستر محلي.");
  }
  return finalizeEvent(template, hexToBytes(privkeyHex));
}

function isTimeoutError(err: unknown): boolean {
  return Boolean(err && typeof err === "object" && "timeout" in err && (err as { timeout?: boolean }).timeout);
}

function isCorsError(err: unknown): boolean {
  return Boolean(err && typeof err === "object" && "cors" in err && (err as { cors?: boolean }).cors);
}

async function discoverNip96(
  origin: string,
  transport: MediaUploadTransport,
): Promise<{ apiUrl: string; downloadUrl?: string }> {
  const cached = nip96Cache.get(origin);
  if (cached && Date.now() - cached.fetchedAt < 10 * 60_000) {
    return cached;
  }
  const res = await transport.request({
    method: "GET",
    url: `${origin}/.well-known/nostr/nip96.json`,
    headers: { Accept: "application/json" },
    timeoutMs: 12_000,
  });
  if (res.status < 200 || res.status >= 300) {
    throw new Error(
      formatMediaUploadError({
        server: origin,
        status: res.status,
        statusText: res.statusText,
        body: res.bodyText || "missing /.well-known/nostr/nip96.json",
      }),
    );
  }
  const parsed = JSON.parse(res.bodyText) as {
    api_url?: string;
    download_url?: string;
    delegated_to_url?: string;
  };
  const apiUrl = String(parsed.api_url || "").replace(/\/+$/, "");
  if (!apiUrl) {
    throw new Error(`NIP-96 api_url missing on ${origin}`);
  }
  const entry = { apiUrl, downloadUrl: parsed.download_url, fetchedAt: Date.now() };
  nip96Cache.set(origin, entry);
  return entry;
}

async function probePatchSupport(
  origin: string,
  transport: MediaUploadTransport,
): Promise<boolean> {
  try {
    const res = await transport.request({
      method: "OPTIONS",
      url: `${origin}/upload`,
      headers: {},
      timeoutMs: 8_000,
    });
    return blossomSupportsPatch(res.headers.allow || "");
  } catch {
    return false;
  }
}

/**
 * Upload a media file (image/video reel) to Blossom and/or NIP-96 servers with live progress.
 */
export async function uploadToBlossom(
  file: File,
  options?: {
    servers?: string[];
    onProgress?: (pct: number) => void;
    transport?: MediaUploadTransport;
    signAuth?: (template: BlossomAuthTemplate) => Promise<unknown>;
    webView?: boolean;
  },
): Promise<BlossomUploadResult> {
  const servers = options?.servers?.length ? options.servers : DEFAULT_MEDIA_SERVERS;
  const transport = options?.transport || xhrTransport();
  const signAuth = options?.signAuth || defaultSignAuth;
  const webView = options?.webView ?? isLikelyEmbeddedWebView();
  let mime = guessMediaMime(file);
  if (!mime || mime === "application/octet-stream") {
    try {
      const head = new Uint8Array(await file.slice(0, 32).arrayBuffer());
      mime = sniffMediaMimeFromBytes(head, mime || "application/octet-stream");
    } catch {
      /* keep guessed mime */
    }
  }
  const timeoutMs = uploadTimeoutMs(file.size);
  const chunkSize = webView ? WEBVIEW_CHUNK_BYTES : 2 * 1024 * 1024;

  const report = (pct: number) => options?.onProgress?.(pct);

  const sha256 = await sha256HexFromBlob(file, (ratio) =>
    report(mapUploadProgressPct({ phase: "hash", ratio })),
  );

  const errors: string[] = [];

  for (const serverUrl of servers) {
    const { protocol, origin } = resolveMediaProtocol(serverUrl);
    try {
      if (protocol === "nip96") {
        if (file.size > NIP96_FREE_MAX_BYTES) {
          errors.push(
            formatMediaUploadError({
              server: origin,
              status: 413,
              statusText: "Payload Too Large",
              body: `NIP-96 free plan max ${NIP96_FREE_MAX_BYTES} bytes`,
            }),
          );
          continue;
        }
        const result = await uploadViaNip96({
          file,
          mime,
          sha256,
          origin,
          transport,
          signAuth,
          timeoutMs,
          report,
        });
        report(100);
        return result;
      }

      const result = await uploadViaBlossom({
        file,
        mime,
        sha256,
        origin,
        transport,
        signAuth,
        timeoutMs,
        chunkSize,
        webView,
        report,
      });
      report(100);
      return result;
    } catch (err: unknown) {
      let message: string;
      if (isTimeoutError(err)) {
        message = formatMediaUploadError({
          server: origin,
          timeoutMs: (err as { timeoutMs?: number }).timeoutMs || timeoutMs,
          phase: "awaiting-response",
        });
      } else if (isCorsError(err)) {
        message = formatMediaUploadError({ server: origin, status: 0, cors: true });
      } else {
        message = err instanceof Error ? err.message : String(err);
      }
      errors.push(message);
      console.warn(`[media-upload] ${origin} failed:`, message);
    }
  }

  throw new Error(errors.filter(Boolean).join(" | ") || "فشل رفع الوسائط إلى خوادم النوستر");
}

async function blossomAuth(
  origin: string,
  sha256: string,
  fileName: string,
  signAuth: (template: BlossomAuthTemplate) => Promise<unknown>,
): Promise<string> {
  const nowSec = Math.floor(Date.now() / 1000);
  const template: BlossomAuthTemplate = {
    kind: 24242,
    created_at: nowSec,
    content: `Upload ${fileName || "media"}`,
    tags: [
      ["t", "upload"],
      ["x", sha256],
      ["expiration", String(nowSec + 60 * 30)],
      ["u", origin],
    ],
  };
  const signed = await signAuth(template);
  return encodeNostrAuthHeader(signed);
}

async function uploadViaBlossom(opts: {
  file: File;
  mime: string;
  sha256: string;
  origin: string;
  transport: MediaUploadTransport;
  signAuth: (template: BlossomAuthTemplate) => Promise<unknown>;
  timeoutMs: number;
  chunkSize: number;
  webView: boolean;
  report: (pct: number) => void;
}): Promise<BlossomUploadResult> {
  const auth = await blossomAuth(opts.origin, opts.sha256, opts.file.name, opts.signAuth);

  // Skip BUD-06 HEAD in embedded WebViews: X-SHA-256 / X-Content-* trigger a
  // preflight that Primal answers as `Authorization, *`, which older WebView
  // CORS parsers reject even though PUT with Content-Type succeeds.
  if (!opts.webView) try {
    const head = await opts.transport.request({
      method: "HEAD",
      url: `${opts.origin}/upload`,
      headers: {
        Authorization: auth,
        "X-SHA-256": opts.sha256,
        "X-Content-Length": String(opts.file.size),
        "X-Content-Type": opts.mime,
      },
      timeoutMs: 12_000,
    });
    if (head.status && head.status !== 200 && head.status !== 201) {
      throw new Error(
        formatMediaUploadError({
          server: opts.origin,
          status: head.status,
          statusText: head.statusText,
          body: head.bodyText,
          xReason: head.headers["x-reason"],
        }),
      );
    }
  } catch (err) {
    if (err instanceof Error && /HTTP (4|5)\d\d/.test(err.message)) throw err;
    /* BUD-06 is optional; skip CORS / 404 HEAD */
  }

  const canPatch = opts.file.size > opts.chunkSize && (await probePatchSupport(opts.origin, opts.transport));
  if (canPatch) {
    try {
      return await putBlossomPatches(opts, auth);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (!/HTTP 405|HTTP 501/.test(message)) throw err;
    }
  }

  opts.report(mapUploadProgressPct({ phase: "send", loaded: 0, total: opts.file.size || 1 }));
  const body = slicedBlob(opts.file, opts.mime, opts.chunkSize);
  const res = await opts.transport.request({
    method: "PUT",
    url: `${opts.origin}/upload`,
    headers: {
      Authorization: auth,
      "Content-Type": opts.mime,
    },
    body,
    timeoutMs: opts.timeoutMs,
    onProgress: (loaded, total) => {
      opts.report(mapUploadProgressPct({ phase: "send", loaded, total: total || opts.file.size }));
    },
  });
  opts.report(mapUploadProgressPct({ phase: "awaiting-response" }));
  if (res.status < 200 || res.status >= 300) {
    throw new Error(
      formatMediaUploadError({
        server: opts.origin,
        status: res.status,
        statusText: res.statusText,
        body: res.bodyText,
        xReason: res.headers["x-reason"],
      }),
    );
  }
  const parsed = parseBlossomDescriptor(res.bodyText, opts.origin, opts.sha256);
  if (!parsed?.url) {
    throw new Error(
      formatMediaUploadError({
        server: opts.origin,
        status: res.status,
        statusText: res.statusText,
        body: res.bodyText || "Blossom response was not a blob descriptor (HTML/empty)",
      }),
    );
  }
  return {
    url: parsed.url,
    sha256: parsed.sha256 || opts.sha256,
    size: opts.file.size,
    type: opts.mime,
  };
}

async function putBlossomPatches(
  opts: {
    file: File;
    mime: string;
    sha256: string;
    origin: string;
    transport: MediaUploadTransport;
    timeoutMs: number;
    chunkSize: number;
    webView: boolean;
    report: (pct: number) => void;
  },
  auth: string,
): Promise<BlossomUploadResult> {
  const chunks = planUploadChunks(opts.file.size, {
    webView: opts.webView,
    chunkSize: opts.chunkSize,
  });
  let last: MediaUploadResponse | null = null;
  for (const chunk of chunks) {
    const slice = opts.file.slice(chunk.offset, chunk.offset + chunk.length);
    last = await opts.transport.request({
      method: "PATCH",
      url: `${opts.origin}/upload`,
      headers: {
        Authorization: auth,
        "Content-Type": "application/octet-stream",
        "X-SHA-256": opts.sha256,
        "Upload-Length": String(opts.file.size),
        "Upload-Offset": String(chunk.offset),
        "Upload-Type": opts.mime,
      },
      body: slice,
      timeoutMs: uploadTimeoutMs(chunk.length),
      onProgress: (loaded) => {
        opts.report(
          mapUploadProgressPct({
            phase: "send",
            loaded: chunk.offset + loaded,
            total: opts.file.size,
          }),
        );
      },
    });
    if (last.status === 405 || last.status === 501) {
      throw new Error(`HTTP ${last.status}`);
    }
    const lastChunk = chunk.offset + chunk.length >= opts.file.size;
    if (lastChunk) {
      if (last.status < 200 || last.status >= 300) {
        throw new Error(
          formatMediaUploadError({
            server: opts.origin,
            status: last.status,
            statusText: last.statusText,
            body: last.bodyText,
            xReason: last.headers["x-reason"],
          }),
        );
      }
      break;
    }
    if (last.status !== 204 && last.status !== 200 && last.status !== 201) {
      throw new Error(
        formatMediaUploadError({
          server: opts.origin,
          status: last.status,
          statusText: last.statusText,
          body: last.bodyText,
          xReason: last.headers["x-reason"],
        }),
      );
    }
  }
  opts.report(mapUploadProgressPct({ phase: "awaiting-response" }));
  const parsed = parseBlossomDescriptor(last?.bodyText || "", opts.origin, opts.sha256);
  if (!parsed?.url) {
    throw new Error(
      formatMediaUploadError({
        server: opts.origin,
        status: last?.status,
        body: last?.bodyText || "PATCH upload finished without a blob descriptor",
      }),
    );
  }
  return {
    url: parsed.url,
    sha256: parsed.sha256 || opts.sha256,
    size: opts.file.size,
    type: opts.mime,
  };
}

async function uploadViaNip96(opts: {
  file: File;
  mime: string;
  sha256: string;
  origin: string;
  transport: MediaUploadTransport;
  signAuth: (template: BlossomAuthTemplate) => Promise<unknown>;
  timeoutMs: number;
  report: (pct: number) => void;
}): Promise<BlossomUploadResult> {
  const discovered = await discoverNip96(opts.origin, opts.transport);
  const nowSec = Math.floor(Date.now() / 1000);
  const template: BlossomAuthTemplate = {
    kind: 27235,
    created_at: nowSec,
    content: "",
    tags: [
      ["u", discovered.apiUrl],
      ["method", "POST"],
      ["payload", opts.sha256],
    ],
  };
  const signed = await opts.signAuth(template);
  const named = new File(
    [slicedBlob(opts.file, opts.mime, 1024 * 1024)],
    opts.file.name || "reel.mp4",
    { type: opts.mime },
  );
  const form = new FormData();
  form.set("file", named, named.name);
  form.set("size", String(opts.file.size));
  form.set("content_type", opts.mime);
  form.set("no_transform", "true");
  opts.report(mapUploadProgressPct({ phase: "send", loaded: 0, total: opts.file.size || 1 }));
  const res = await opts.transport.request({
    method: "POST",
    url: discovered.apiUrl,
    headers: {
      Authorization: encodeNostrAuthHeader(signed),
      Accept: "application/json",
    },
    body: form,
    timeoutMs: opts.timeoutMs,
    onProgress: (loaded, total) => {
      opts.report(mapUploadProgressPct({ phase: "send", loaded, total: total || opts.file.size }));
    },
  });
  opts.report(mapUploadProgressPct({ phase: "awaiting-response" }));
  if (res.status < 200 || res.status >= 300) {
    throw new Error(
      formatMediaUploadError({
        server: discovered.apiUrl,
        status: res.status,
        statusText: res.statusText,
        body: res.bodyText,
      }),
    );
  }
  const parsed = parseNip96UploadResponse(res.bodyText);
  if (!parsed?.url) {
    throw new Error(
      formatMediaUploadError({
        server: discovered.apiUrl,
        status: res.status,
        statusText: res.statusText,
        body: res.bodyText || "NIP-96 response missing nip94_event url",
      }),
    );
  }
  return {
    url: parsed.url,
    sha256: parsed.sha256 || opts.sha256,
    size: opts.file.size,
    type: opts.mime,
    nip94Tags: parsed.nip94Tags,
  };
}
