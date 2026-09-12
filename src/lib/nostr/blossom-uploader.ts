/**
 * Blossom BUD-01 & Nostr Media Uploader
 * Directly uploads media from browser to decentralized Blossom media servers
 * (blossom.primal.net & nostr.build).
 * Real-time upload progress, fast gigabit CDN ingest, and multi-server failover.
 * NO local server storage is used, saving 100% server disk space.
 */

import { generateSecretKey, getPublicKey, finalizeEvent } from "nostr-tools/pure";

export type BlossomUploadResult = {
  url: string;
  sha256: string;
  size: number;
  type: string;
};

// Fallback / default media servers (blossom.primal.net first for high-speed video reels)
const DEFAULT_BLOSSOM_SERVERS = [
  "https://blossom.primal.net",
  "https://nostr.build",
];

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.trim().toLowerCase();
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
  }
  return bytes;
}

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
    priv = bytesToHex(sk);
    localStorage.setItem("lonaliza_nostr_privkey", priv);
  }
  const pk = getPublicKey(hexToBytes(priv));
  localStorage.setItem("lonaliza_nostr_pubkey", pk);
  return { privkeyHex: priv, pubkey: pk };
}

/**
 * Upload a media file (image/video reel) directly to Blossom media servers with live progress
 */
export async function uploadToBlossom(
  file: File,
  options?: {
    servers?: string[];
    onProgress?: (pct: number) => void;
  }
): Promise<BlossomUploadResult> {
  const servers = options?.servers?.length ? options.servers : DEFAULT_BLOSSOM_SERVERS;

  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const sha256 = bytesToHex(new Uint8Array(hashBuffer));
  const blob = new Blob([arrayBuffer], { type: file.type || "application/octet-stream" });

  let lastError = "All blossom servers failed";

  for (const serverUrl of servers) {
    try {
      const cleanServerUrl = serverUrl.replace(/\/+$/, "");
      const uploadEndpoint = `${cleanServerUrl}/upload`;

      // 1. Prepare Blossom BUD-01 auth event (Kind 24242)
      const nowSec = Math.floor(Date.now() / 1000);
      const authEventTemplate = {
        kind: 24242,
        created_at: nowSec,
        content: "Upload " + file.name,
        tags: [
          ["t", "upload"],
          ["x", sha256],
          ["expiration", String(nowSec + 600)],
          ["u", cleanServerUrl],
        ],
      };

      let signedAuthEvent: any = null;

      // Check NIP-07 browser extension first
      if (typeof window !== "undefined" && (window as any).nostr?.signEvent) {
        try {
          signedAuthEvent = await (window as any).nostr.signEvent(authEventTemplate);
        } catch {
          signedAuthEvent = null;
        }
      }

      // Fallback to local persistent keypair
      if (!signedAuthEvent) {
        const { privkeyHex } = getOrCreateLocalNostrKey();
        if (privkeyHex) {
          signedAuthEvent = finalizeEvent(authEventTemplate, hexToBytes(privkeyHex));
        }
      }

      const headers: Record<string, string> = {
        "Content-Type": blob.type,
      };

      if (signedAuthEvent) {
        const authB64 = btoa(unescape(encodeURIComponent(JSON.stringify(signedAuthEvent))));
        headers["Authorization"] = `Nostr ${authB64}`;
      }

      // Upload via XMLHttpRequest with real-time upload progress and 45s timeout per server
      const uploadPromise = new Promise<{ url: string; size: number }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadEndpoint, true);
        xhr.timeout = 45000; // 45s timeout per server

        Object.entries(headers).forEach(([k, v]) => {
          xhr.setRequestHeader(k, v);
        });

        if (xhr.upload && options?.onProgress) {
          xhr.upload.onprogress = (evt) => {
            if (evt.lengthComputable && evt.total > 0) {
              const pct = Math.min(99, Math.round((evt.loaded / evt.total) * 100));
              options.onProgress?.(pct);
            }
          };
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const parsed = JSON.parse(xhr.responseText);
              resolve({
                url: parsed?.url || `${cleanServerUrl}/${sha256}`,
                size: file.size,
              });
            } catch {
              resolve({
                url: `${cleanServerUrl}/${sha256}`,
                size: file.size,
              });
            }
          } else {
            reject(new Error(`Server returned ${xhr.status}: ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during media upload"));
        xhr.ontimeout = () => reject(new Error("Media upload timed out on this server"));

        xhr.send(blob);
      });

      const res = await uploadPromise;
      options?.onProgress?.(100);

      return {
        url: res.url,
        sha256,
        size: res.size,
        type: file.type,
      };
    } catch (err: any) {
      lastError = err?.message || String(err);
      console.warn(`[Blossom] Server ${serverUrl} failed:`, lastError);
    }
  }

  throw new Error(`فشل رفع الوسائط إلى خوادم النوستر: ${lastError}`);
}
