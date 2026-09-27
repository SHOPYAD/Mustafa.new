import { getOrCreateLocalNostrKey } from "@/lib/nostr/blossom-uploader";

export async function registerLocalNostrPubkey(name?: string) {
  if (typeof window === "undefined") return "";
  try {
    const { pubkey } = getOrCreateLocalNostrKey();
    if (!pubkey) return "";
    await fetch("/api/account/nostr-pubkey", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ nostrPubkey: pubkey, name: name || "" }),
    });
    return pubkey;
  } catch {
    return "";
  }
}
