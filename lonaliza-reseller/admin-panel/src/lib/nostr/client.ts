/**
 * Nostr Client Engine for Lonaliza Social Media & Reels
 * Connects to top decentralized relays, handles event publishing, signing,
 * and enforces 100% strict tourism content filtering.
 */

import { finalizeEvent } from "nostr-tools/pure";
import type {
  NostrEvent,
  NostrRelayConfig,
  ParsedTravelPost,
  TravelReelItem,
  TravelCategory,
} from "./types";
import { getOrCreateLocalNostrKey } from "./blossom-uploader";
import { resolveReelPoster, splitReelCopy } from "@/lib/community/reel-media";
import {
  eventToTravelInput,
  isTravelEligibleContent,
  isVerifiedSyndicationPubkey,
} from "@/lib/community/travel-content-filter";

function syndicationAllowlist(relays: NostrRelayConfig[]): string[] {
  const extra = (relays as Array<NostrRelayConfig & { verifiedPubkeys?: string[] }>)
    .flatMap((r) => r.verifiedPubkeys || []);
  return extra;
}

/**
 * Validates whether a Nostr event is travel-only (never #reels / beauty / dance).
 */
export function isStrictTourismContent(event: NostrEvent): boolean {
  return isTravelEligibleContent(eventToTravelInput(event, "relay"));
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.trim().toLowerCase();
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.substr(i * 2, 2), 16);
  }
  return bytes;
}

/**
 * Extracts media URLs from content and tags
 */
export function extractMediaUrls(event: NostrEvent): {
  images: string[];
  videos: string[];
  posters: string[];
} {
  const images: string[] = [];
  const videos: string[] = [];
  const posters: string[] = [];

  const pushUnique = (list: string[], url?: string) => {
    if (!url) return;
    if (!list.includes(url)) list.push(url);
  };

  const mediaRegex = /(https?:\/\/[^\s]+?\.(?:png|jpg|jpeg|webp|gif|mp4|webm|mov)(?:\?[^\s]*)?)/gi;
  const matches = event.content.match(mediaRegex) || [];

  for (const url of matches) {
    const clean = url.split("?")[0].toLowerCase();
    if (clean.endsWith(".mp4") || clean.endsWith(".webm") || clean.endsWith(".mov")) {
      pushUnique(videos, url);
    } else {
      pushUnique(images, url);
    }
  }

  for (const tag of event.tags || []) {
    if (tag[0] === "image" && tag[1]) pushUnique(images, tag[1]);
    if (tag[0] === "video" && tag[1]) pushUnique(videos, tag[1]);
    if (tag[0] === "thumb" && tag[1]) pushUnique(posters, tag[1]);
    if (tag[0] === "imeta") {
      for (let i = 1; i < tag.length; i++) {
        const part = tag[i];
        if (part.startsWith("url ")) {
          const u = part.substring(4).trim();
          if (u.match(/\.(mp4|webm|mov)/i)) pushUnique(videos, u);
          else pushUnique(images, u);
        } else if (part.startsWith("thumb ") || part.startsWith("image ")) {
          const u = part.replace(/^(thumb|image)\s+/i, "").trim();
          if (u) pushUnique(posters, u);
        }
      }
    }
  }

  return { images, videos, posters };
}

/**
 * Parses a raw Nostr event into a structured ParsedTravelPost
 */
export function parseTravelPost(event: NostrEvent, categories: TravelCategory[] = []): ParsedTravelPost | null {
  if (!isStrictTourismContent(event)) return null;

  const { images, videos, posters } = extractMediaUrls(event);
  const tags = event.tags || [];

  let category = "hotels";
  let destination = "تركيا";
  let rating: number | undefined;

  for (const tag of tags) {
    if (tag[0] === "c" || tag[0] === "category") category = tag[1] || category;
    if (tag[0] === "d" || tag[0] === "destination") destination = tag[1] || destination;
    if (tag[0] === "rating") rating = parseFloat(tag[1]);
  }

  // Find category title
  const catObj = categories.find((c) => c.slug === category);
  const categoryName = catObj ? (catObj.name?.ar || catObj.nameAr || category) : category;

  // Clean content of media links to show clean narrative text
  const cleanText = event.content
    .replace(/(https?:\/\/[^\s]+?\.(?:png|jpg|jpeg|webp|gif|mp4|webm|mov)(?:\?[^\s]*)?)/gi, "")
    .trim();

  return {
    id: event.id,
    pubkey: event.pubkey,
    content: cleanText || event.content,
    created_at: event.created_at,
    category,
    categoryName,
    destination,
    rating,
    images,
    videos,
    videoPoster: posters[0] || resolveReelPoster({ images, videoUrl: videos[0] }),
    likesCount: 0,
    commentsCount: 0,
    userHasLiked: false,
    author: {
      pubkey: event.pubkey,
      name: "مسافر لوناليزا",
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${event.pubkey.slice(0, 8)}`,
      tier: "Silver Explorer",
    },
  };
}

/**
 * Parses a vertical video reel from a Nostr event
 */
export function parseTravelReel(event: NostrEvent): TravelReelItem | null {
  if (!isStrictTourismContent(event)) return null;
  const { videos, images, posters } = extractMediaUrls(event);
  if (!videos.length) return null;

  const tags = event.tags || [];
  let category = "tours";
  let destination = "تركيا";

  for (const tag of tags) {
    if (tag[0] === "c" || tag[0] === "category") category = tag[1] || category;
    if (tag[0] === "d" || tag[0] === "destination") destination = tag[1] || destination;
  }

  const { title, description } = splitReelCopy(event.content);

  return {
    id: event.id,
    pubkey: event.pubkey,
    title,
    description,
    videoUrl: videos[0],
    posterUrl: resolveReelPoster({
      posterUrl: posters[0],
      images,
      videoUrl: videos[0],
    }),
    category,
    destination,
    likesCount: 0,
    commentsCount: 0,
    created_at: event.created_at,
    author: {
      pubkey: event.pubkey,
      name: "مسافر لوناليزا",
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${event.pubkey.slice(0, 8)}`,
    },
  };
}

function countTaggedEvents(
  relays: NostrRelayConfig[],
  eventIds: string[],
  kinds: number[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (!eventIds.length) return Promise.resolve(counts);

  const activeReadRelays = relays.filter(
    (r) => r.active && (r.read !== false && r.canRead !== false),
  );
  if (!activeReadRelays.length) return Promise.resolve(counts);

  const queryPromises = activeReadRelays.slice(0, 3).map((relay) => {
    return new Promise<void>((resolve) => {
      try {
        const ws = new WebSocket(relay.url);
        const subId = "eng_" + Math.random().toString(36).substring(2, 9);
        const timeout = setTimeout(() => {
          try {
            ws.close();
          } catch {}
          resolve();
        }, 3500);

        ws.onopen = () => {
          ws.send(
            JSON.stringify([
              "REQ",
              subId,
              { kinds, "#e": eventIds.slice(0, 40), limit: 400 },
            ]),
          );
        };

        ws.onmessage = (msg) => {
          try {
            const data = JSON.parse(msg.data);
            if (data[0] === "EVENT" && data[2]) {
              const ev = data[2] as NostrEvent;
              const eTag = (ev.tags || []).find((t) => t[0] === "e")?.[1];
              if (!eTag) return;
              counts.set(eTag, (counts.get(eTag) || 0) + 1);
            } else if (data[0] === "EOSE") {
              clearTimeout(timeout);
              try {
                ws.close();
              } catch {}
              resolve();
            }
          } catch {}
        };

        ws.onerror = () => {
          clearTimeout(timeout);
          resolve();
        };
      } catch {
        resolve();
      }
    });
  });

  return Promise.allSettled(queryPromises).then(() => counts);
}

/** NIP-25 likes (kind 7) + reply notes (kind 1) counted from relays. */
export async function fetchReelEngagement(
  relays: NostrRelayConfig[],
  eventIds: string[],
): Promise<Record<string, { likesCount: number; commentsCount: number }>> {
  const [likes, comments] = await Promise.all([
    countTaggedEvents(relays, eventIds, [7]),
    countTaggedEvents(relays, eventIds, [1, 1111]),
  ]);
  const out: Record<string, { likesCount: number; commentsCount: number }> = {};
  for (const id of eventIds) {
    out[id] = {
      likesCount: likes.get(id) || 0,
      commentsCount: comments.get(id) || 0,
    };
  }
  return out;
}

/**
 * Sign and publish an event to active relays
 */
export async function signAndPublishEvent(
  eventTemplate: {
    kind: number;
    content: string;
    tags: string[][];
  },
  relays: NostrRelayConfig[]
): Promise<NostrEvent> {
  const nowSec = Math.floor(Date.now() / 1000);
  const unsigned = {
    ...eventTemplate,
    created_at: nowSec,
  };

  let signedEvent: any = null;

  // 1. Try NIP-07 extension if installed in browser
  if (typeof window !== "undefined" && (window as any).nostr?.signEvent) {
    try {
      signedEvent = await (window as any).nostr.signEvent(unsigned);
    } catch {
      signedEvent = null;
    }
  }

  // 2. Fallback to client persistent key
  if (!signedEvent) {
    const { privkeyHex } = getOrCreateLocalNostrKey();
    if (!privkeyHex) throw new Error("تعذر توليد مفتاح النشر");
    signedEvent = finalizeEvent(unsigned, hexToBytes(privkeyHex));
  }

  // 3. Publish to active write relays via WebSocket
  const activeWriteRelays = relays.filter(
    (r) => r.active && (r.write !== false && r.canWrite !== false)
  );
  const publishPromises = activeWriteRelays.map((relay) => {
    return new Promise<void>((resolve) => {
      try {
        const ws = new WebSocket(relay.url);
        const timer = setTimeout(() => {
          try { ws.close(); } catch {}
          resolve();
        }, 5000);

        ws.onopen = () => {
          const msg = JSON.stringify(["EVENT", signedEvent]);
          ws.send(msg);
          setTimeout(() => {
            clearTimeout(timer);
            try { ws.close(); } catch {}
            resolve();
          }, 1000);
        };

        ws.onerror = () => {
          clearTimeout(timer);
          resolve();
        };
      } catch {
        resolve();
      }
    });
  });

  await Promise.allSettled(publishPromises);
  return signedEvent;
}

/**
 * Fetch tourism feed from active Nostr relays
 */
export async function fetchTourismFeed(
  relays: NostrRelayConfig[],
  categories: TravelCategory[] = [],
  options?: {
    category?: string;
    destination?: string;
    limit?: number;
    verifiedPubkeys?: string[];
  }
): Promise<ParsedTravelPost[]> {
  const allowlist = [...(options?.verifiedPubkeys || []), ...syndicationAllowlist(relays)];
  if (!allowlist.length) return [];

  const activeReadRelays = relays.filter(
    (r) => r.active && (r.read !== false && r.canRead !== false)
  );
  if (!activeReadRelays.length) return [];

  const limit = options?.limit || 40;
  const eventsMap = new Map<string, NostrEvent>();

  const filter: any = {
    kinds: [1],
    limit: limit * 2,
    "#t": ["lonaliza_travel", "travel", "tourism", "hotel", "flight", "سياحة", "سفر"],
  };

  if (options?.category) {
    filter["#c"] = [options.category];
  }

  const queryPromises = activeReadRelays.slice(0, 3).map((relay) => {
    return new Promise<void>((resolve) => {
      try {
        const ws = new WebSocket(relay.url);
        const subId = "feed_" + Math.random().toString(36).substring(2, 9);
        const timeout = setTimeout(() => {
          try { ws.close(); } catch {}
          resolve();
        }, 4500);

        ws.onopen = () => {
          ws.send(JSON.stringify(["REQ", subId, filter]));
        };

        ws.onmessage = (msg) => {
          try {
            const data = JSON.parse(msg.data);
            if (data[0] === "EVENT" && data[2]) {
              const ev = data[2] as NostrEvent;
              if (!isVerifiedSyndicationPubkey(ev.pubkey, allowlist)) return;
              eventsMap.set(ev.id, ev);
            } else if (data[0] === "EOSE") {
              clearTimeout(timeout);
              try { ws.close(); } catch {}
              resolve();
            }
          } catch {}
        };

        ws.onerror = () => {
          clearTimeout(timeout);
          resolve();
        };
      } catch {
        resolve();
      }
    });
  });

  await Promise.allSettled(queryPromises);

  const parsedPosts: ParsedTravelPost[] = [];
  for (const ev of eventsMap.values()) {
    const post = parseTravelPost(ev, categories);
    if (post) {
      if (options?.category && post.category !== options.category) continue;
      if (options?.destination && post.destination !== options.destination) continue;
      parsedPosts.push(post);
    }
  }

  parsedPosts.sort((a, b) => b.created_at - a.created_at);
  return parsedPosts.slice(0, limit);
}

/**
 * Fetch vertical travel reels from verified Lonaliza/partner pubkeys only.
 */
export async function fetchTourismReels(
  relays: NostrRelayConfig[],
  limit = 20,
  options?: { verifiedPubkeys?: string[] }
): Promise<TravelReelItem[]> {
  const allowlist = [...(options?.verifiedPubkeys || []), ...syndicationAllowlist(relays)];
  if (!allowlist.length) return [];

  const activeReadRelays = relays.filter(
    (r) => r.active && (r.read !== false && r.canRead !== false)
  );
  if (!activeReadRelays.length) return [];

  const reelsMap = new Map<string, TravelReelItem>();

  const filter: any = {
    kinds: [1, 34235],
    limit: limit * 2,
    "#t": ["lonaliza_travel", "travel", "tourism", "hotel", "flight", "سياحة", "سفر"],
  };

  const queryPromises = activeReadRelays.slice(0, 3).map((relay) => {
    return new Promise<void>((resolve) => {
      try {
        const ws = new WebSocket(relay.url);
        const subId = "reels_" + Math.random().toString(36).substring(2, 9);
        const timeout = setTimeout(() => {
          try { ws.close(); } catch {}
          resolve();
        }, 4500);

        ws.onopen = () => {
          ws.send(JSON.stringify(["REQ", subId, filter]));
        };

        ws.onmessage = (msg) => {
          try {
            const data = JSON.parse(msg.data);
            if (data[0] === "EVENT" && data[2]) {
              const ev = data[2] as NostrEvent;
              if (!isVerifiedSyndicationPubkey(ev.pubkey, allowlist)) return;
              const reel = parseTravelReel(ev);
              if (reel) reelsMap.set(reel.id, reel);
            } else if (data[0] === "EOSE") {
              clearTimeout(timeout);
              try { ws.close(); } catch {}
              resolve();
            }
          } catch {}
        };

        ws.onerror = () => {
          clearTimeout(timeout);
          resolve();
        };
      } catch {
        resolve();
      }
    });
  });

  await Promise.allSettled(queryPromises);

  const reels = Array.from(reelsMap.values());
  reels.sort((a, b) => b.created_at - a.created_at);
  return reels.slice(0, limit);
}
