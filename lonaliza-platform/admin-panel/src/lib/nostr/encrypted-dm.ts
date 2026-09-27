/**
 * Private DMs: NIP-44 v2 conversation keys + NIP-17 gift wrap (kind 1059).
 * Voice notes are AES-GCM encrypted before Blossom upload; the file key is
 * wrapped with NIP-44 so only the intended recipient can decrypt/play.
 */

import { getConversationKey, encrypt as nip44Encrypt, decrypt as nip44Decrypt } from "nostr-tools/nip44";
import { wrapEvent } from "nostr-tools/nip17";
import type { NostrEvent } from "./types";
import { getOrCreateLocalNostrKey } from "./blossom-uploader";

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.trim().toLowerCase();
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.substr(i * 2, 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function bytesToB64(bytes: Uint8Array): string {
  if (typeof btoa === "function") {
    let bin = "";
    bytes.forEach((b) => {
      bin += String.fromCharCode(b);
    });
    return btoa(bin);
  }
  return Buffer.from(bytes).toString("base64");
}

function b64ToBytes(b64: string): Uint8Array {
  if (typeof atob === "function") {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  return new Uint8Array(Buffer.from(b64, "base64"));
}

export function conversationKeyFor(recipientPubkey: string, privkeyHex?: string): Uint8Array {
  const priv = privkeyHex || getOrCreateLocalNostrKey().privkeyHex;
  if (!priv || !recipientPubkey) throw new Error("missing_nostr_keys");
  return getConversationKey(hexToBytes(priv), recipientPubkey);
}

export function encryptDmText(plaintext: string, recipientPubkey: string, privkeyHex?: string): string {
  const key = conversationKeyFor(recipientPubkey, privkeyHex);
  return nip44Encrypt(plaintext, key);
}

export function decryptDmText(cipher: string, theirPubkey: string, privkeyHex?: string): string {
  const key = conversationKeyFor(theirPubkey, privkeyHex);
  return nip44Decrypt(cipher, key);
}

export type VoiceWrap = {
  url: string;
  mime: string;
  durationMs: number;
  size: number;
  wrappedKey: string;
};

export async function encryptVoiceBytes(
  bytes: Uint8Array,
  recipientPubkey: string,
  privkeyHex?: string,
): Promise<{ ciphertext: Uint8Array; wrappedKey: string }> {
  const fileKey = crypto.getRandomValues(new Uint8Array(32));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cryptoKey = await crypto.subtle.importKey("raw", fileKey as unknown as BufferSource, "AES-GCM", false, ["encrypt"]);
  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv as unknown as BufferSource }, cryptoKey, bytes as unknown as BufferSource),
  );
  const wrappedKey = encryptDmText(
    JSON.stringify({ k: bytesToB64(fileKey), iv: bytesToB64(iv), v: "aes-gcm-256" }),
    recipientPubkey,
    privkeyHex,
  );
  return { ciphertext: encrypted, wrappedKey };
}

export async function decryptVoiceBytes(
  ciphertext: Uint8Array,
  wrappedKey: string,
  theirPubkey: string,
  privkeyHex?: string,
): Promise<Uint8Array> {
  const meta = JSON.parse(decryptDmText(wrappedKey, theirPubkey, privkeyHex)) as {
    k: string;
    iv: string;
  };
  const fileKey = b64ToBytes(meta.k);
  const iv = b64ToBytes(meta.iv);
  const cryptoKey = await crypto.subtle.importKey("raw", fileKey as unknown as BufferSource, "AES-GCM", false, ["decrypt"]);
  return new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv as unknown as BufferSource }, cryptoKey, ciphertext as unknown as BufferSource));
}

export function giftWrapText(
  plaintext: string,
  recipientPubkey: string,
  privkeyHex?: string,
): NostrEvent {
  const priv = privkeyHex || getOrCreateLocalNostrKey().privkeyHex;
  return wrapEvent(hexToBytes(priv), { publicKey: recipientPubkey }, plaintext) as NostrEvent;
}

export async function publishGiftWrap(event: NostrEvent, relayUrls: string[]): Promise<void> {
  await Promise.allSettled(
    relayUrls.slice(0, 4).map(
      (url) =>
        new Promise<void>((resolve) => {
          try {
            const ws = new WebSocket(url);
            const timer = setTimeout(() => {
              try {
                ws.close();
              } catch {
                /* ignore */
              }
              resolve();
            }, 4000);
            ws.onopen = () => {
              ws.send(JSON.stringify(["EVENT", event]));
              setTimeout(() => {
                clearTimeout(timer);
                try {
                  ws.close();
                } catch {
                  /* ignore */
                }
                resolve();
              }, 800);
            };
            ws.onerror = () => {
              clearTimeout(timer);
              resolve();
            };
          } catch {
            resolve();
          }
        }),
    ),
  );
}

export const DEFAULT_DM_RELAYS = [
  "wss://relay.primal.net",
  "wss://relay.damus.io",
  "wss://relay.nostr.band",
];

export function bytesToHexKey(bytes: Uint8Array): string {
  return bytesToHex(bytes);
}
