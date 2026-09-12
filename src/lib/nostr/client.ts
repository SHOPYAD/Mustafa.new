/**
 * Nostr Client Engine for Lonaliza Social Media & Reels
 * Connects to top decentralized relays, handles event publishing, signing,
 * and enforces 100% strict tourism content filtering.
 */

import { generateSecretKey, getPublicKey, finalizeEvent } from "nostr-tools/pure";
import type {
  NostrEvent,
  NostrRelayConfig,
  ParsedTravelPost,
  TravelReelItem,
  TravelCategory,
} from "./types";
import { getOrCreateLocalNostrKey } from "./blossom-uploader";

// High-confidence tourism keywords in Arabic, English, Turkish, French
const TOURISM_KEYWORDS = [
  // Arabic
  "سياحة", "سفر", "فندق", "فنادق", "رحلة", "رحلات", "جولة", "منتجع", "طيران", "تذكرة",
  "اسطنبول", "إسطنبول", "طرابزون", "بورصة", "أنطاليا", "كابادوكيا", "صبنجة", "معالم",
  "مطعم", "شاطئ", "طبيعة", "مضيق البوسفور", "بحيرة", "تلفريك", "أكواخ", "سيارة مع سائق",
  "مرشد سياحي", "حجز", "لوناليزا", "إقامة", "فيلا", "شلال", "مطار",
  // English
  "travel", "tourism", "hotel", "resort", "trip", "tour", "vacation", "holiday",
  "flight", "airline", "destination", "istanbul", "trabzon", "antalya", "turkey",
  "cappadocia", "bursa", "sapanca", "sightseeing", "beach", "explore", "wanderlust",
  "guide", "lonaliza", "booking", "suite", "transfer", "chalet", "lake", "view",
  // Turkish
  "gezi", "seyahat", "tatil", "otel", "tur", "turizm", "istanbul", "trabzon",
  "antalya", "bursa", "kapadokya", "sapanca", "konaklama", "uçak", "villa", "manzara",
  // French
  "voyage", "tourisme", "hôtel", "vacances", "séjour", "visite", "istanbul", "turquie"
];

// Anti-spam / Blacklist keywords (political, NSFW, adult, spam)
const BLACKLIST_KEYWORDS = [
  "crypto", "airdrop", "giveaway", "casino", "gambling", "betting", "porn", "xxx",
  "sex", "nude", "onlyfans", "forex", "binary options", "pump and dump", "free btc",
  "داعش", "سياسة", "قمار", "إباحي", "جنس"
];

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.trim().toLowerCase();
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.substr(i * 2, 2), 16);
  }
  return bytes;
}

/**
 * Validates whether a Nostr event is 100% relevant to tourism and travel
 */
export function isStrictTourismContent(event: NostrEvent): boolean {
  if (!event || !event.content) return false;
  const content = event.content.toLowerCase();

  // 1. Immediate rejection of blacklisted terms
  for (const bad of BLACKLIST_KEYWORDS) {
    if (content.includes(bad)) return false;
  }

  // 2. Check tags for tourism markers
  const tags = event.tags || [];
  let hasTourismTag = false;
  let hasLonalizaTag = false;

  for (const tag of tags) {
    const key = tag[0]?.toLowerCase();
    const val = tag[1]?.toLowerCase() || "";
    if (val === "lonaliza") hasLonalizaTag = true;
    if (key === "c" || key === "d" || key === "category" || key === "destination") {
      hasTourismTag = true;
      break;
    }
    if (key === "t") {
      if (
        TOURISM_KEYWORDS.some((kw) => val.includes(kw.toLowerCase())) ||
        val === "travel" ||
        val === "tourism" ||
        val === "hotels" ||
        val === "tours" ||
        val === "reels" ||
        val === "travelreels"
      ) {
        hasTourismTag = true;
        break;
      }
    }
  }

  if (hasLonalizaTag || hasTourismTag) return true;

  // 3. Keyword density check in text
  let matchCount = 0;
  for (const kw of TOURISM_KEYWORDS) {
    if (content.includes(kw.toLowerCase())) {
      matchCount++;
      if (matchCount >= 2) return true;
    }
  }

  return false;
}

/**
 * Extracts media URLs from content and tags
 */
export function extractMediaUrls(event: NostrEvent): { images: string[]; videos: string[] } {
  const images: string[] = [];
  const videos: string[] = [];

  const mediaRegex = /(https?:\/\/[^\s]+?\.(?:png|jpg|jpeg|webp|gif|mp4|webm|mov)(?:\?[^\s]*)?)/gi;
  const matches = event.content.match(mediaRegex) || [];

  for (const url of matches) {
    const clean = url.split("?")[0].toLowerCase();
    if (clean.endsWith(".mp4") || clean.endsWith(".webm") || clean.endsWith(".mov")) {
      if (!videos.includes(url)) videos.push(url);
    } else {
      if (!images.includes(url)) images.push(url);
    }
  }

  // Check tags for imeta or url
  for (const tag of event.tags || []) {
    if (tag[0] === "image" && tag[1] && !images.includes(tag[1])) {
      images.push(tag[1]);
    }
    if (tag[0] === "video" && tag[1] && !videos.includes(tag[1])) {
      videos.push(tag[1]);
    }
    if (tag[0] === "imeta") {
      for (let i = 1; i < tag.length; i++) {
        if (tag[i].startsWith("url ")) {
          const u = tag[i].substring(4).trim();
          if (u.match(/\.(mp4|webm|mov)/i)) {
            if (!videos.includes(u)) videos.push(u);
          } else {
            if (!images.includes(u)) images.push(u);
          }
        }
      }
    }
  }

  return { images, videos };
}

/**
 * Parses a raw Nostr event into a structured ParsedTravelPost
 */
export function parseTravelPost(event: NostrEvent, categories: TravelCategory[] = []): ParsedTravelPost | null {
  if (!isStrictTourismContent(event)) return null;

  const { images, videos } = extractMediaUrls(event);
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
  const { videos } = extractMediaUrls(event);
  if (!videos.length) return null;

  const tags = event.tags || [];
  let category = "tours";
  let destination = "تركيا";

  for (const tag of tags) {
    if (tag[0] === "c" || tag[0] === "category") category = tag[1] || category;
    if (tag[0] === "d" || tag[0] === "destination") destination = tag[1] || destination;
  }

  return {
    id: event.id,
    pubkey: event.pubkey,
    title: event.content.slice(0, 60),
    description: event.content,
    videoUrl: videos[0],
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
  }
): Promise<ParsedTravelPost[]> {
  const activeReadRelays = relays.filter(
    (r) => r.active && (r.read !== false && r.canRead !== false)
  );
  if (!activeReadRelays.length) return [];

  const limit = options?.limit || 40;
  const eventsMap = new Map<string, NostrEvent>();

  const filter: any = {
    kinds: [1],
    limit: limit * 2,
    "#t": ["lonaliza", "travel", "tourism", "hotel", "tours", "turkey", "istanbul", "trabzon", "سياحة", "سفر"],
  };

  if (options?.category) {
    filter["#c"] = [options.category];
  }

  // Connect and query relays in parallel
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

  // Parse, filter strictly, and sort by date descending
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
 * Fetch vertical travel reels from active Nostr relays
 */
export async function fetchTourismReels(
  relays: NostrRelayConfig[],
  limit = 20
): Promise<TravelReelItem[]> {
  const activeReadRelays = relays.filter(
    (r) => r.active && (r.read !== false && r.canRead !== false)
  );
  if (!activeReadRelays.length) return [];

  const reelsMap = new Map<string, TravelReelItem>();

  const filter: any = {
    kinds: [1, 34235],
    limit: limit * 2,
    "#t": ["reels", "travelreels", "travel", "lonaliza", "vlog", "tourism"],
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
