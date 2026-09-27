import { newId, readJsonStore, writeJsonStore } from "@/lib/server/json-file-store";
import {
  companionDisplayName,
  companionsMatch,
  filterCompanionsByCity,
  normalizePlace,
} from "@/lib/travel-companions";

export type InboxType = "support" | "booking" | "buddy" | "system";

export type VoiceMedia = {
  kind: "voice";
  url: string;
  mime: string;
  durationMs: number;
  size: number;
  wrappedKey: string;
};

export type InboxMessage = {
  id: string;
  threadId: string;
  from: "customer" | "admin" | "system" | "peer";
  fromUserId?: string;
  text: string;
  encrypted?: boolean;
  cipherVersion?: "nip44-v2";
  preview?: string;
  nostrEventId?: string;
  giftWrapId?: string;
  media?: VoiceMedia;
  createdAt: string;
};

export type InboxThread = {
  id: string;
  userId: string;
  peerUserId?: string;
  participantIds?: string[];
  type: InboxType;
  title: string;
  peerName?: string;
  peerAvatar?: string;
  peerNostrPubkey?: string;
  bookingId?: string;
  unread: number;
  unreadBy?: Record<string, number>;
  lastPreview?: string;
  updatedAt: string;
  messages: InboxMessage[];
};

export type BuddyProfile = {
  id: string;
  userId: string;
  name: string;
  city?: string;
  destination: string;
  dateFrom?: string;
  dateTo?: string;
  language?: string;
  bio?: string;
  avatarUrl?: string;
  nostrPubkey?: string;
  createdAt: string;
};

export type BuddyRequest = {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
};

export type GiftCard = {
  id: string;
  code: string;
  amount: number;
  currency: string;
  purchaserId: string;
  recipientEmail?: string;
  status: "active" | "redeemed" | "void";
  redeemedBy?: string;
  createdAt: string;
};

export type RecentView = {
  id: string;
  userId: string;
  kind: "hotel" | "flight" | "tour" | "package" | "car";
  refId: string;
  title: string;
  image?: string;
  price?: number;
  viewedAt: string;
};

export type SavedCard = {
  id: string;
  userId: string;
  brand: string;
  last4: string;
  cardUserKey?: string;
  cardToken?: string;
  expireMonth?: string;
  expireYear?: string;
  binNumber?: string;
  cardAlias?: string;
  isDefault?: boolean;
  createdAt: string;
};

type Bundle = {
  threads: InboxThread[];
  buddies: BuddyProfile[];
  buddyRequests: BuddyRequest[];
  gifts: GiftCard[];
  recent: RecentView[];
  cards: SavedCard[];
};

const FILE = "lonaliza-social-commerce.json";

async function load(): Promise<Bundle> {
  return readJsonStore<Bundle>(FILE, {
    threads: [],
    buddies: [],
    buddyRequests: [],
    gifts: [],
    recent: [],
    cards: [],
  });
}

async function save(bundle: Bundle) {
  return writeJsonStore(FILE, bundle);
}

function threadParticipants(thread: InboxThread): string[] {
  const ids = new Set<string>([thread.userId, ...(thread.participantIds || [])]);
  if (thread.peerUserId) ids.add(thread.peerUserId);
  return [...ids].filter(Boolean);
}

function userInThread(thread: InboxThread, userId: string): boolean {
  return threadParticipants(thread).includes(userId);
}

function lastMessagePreview(thread: InboxThread): string {
  const last = thread.messages[thread.messages.length - 1];
  if (!last) return thread.lastPreview || "";
  if (last.media?.kind === "voice") return last.preview || "رسالة صوتية";
  if (last.encrypted) return last.preview || "رسالة مشفرة";
  return String(last.text || last.preview || "").slice(0, 140);
}

function unreadFor(thread: InboxThread, userId: string): number {
  if (thread.unreadBy && typeof thread.unreadBy[userId] === "number") return thread.unreadBy[userId];
  return thread.userId === userId ? thread.unread || 0 : 0;
}

export function summarizeThread(thread: InboxThread, viewerId: string) {
  const peerId =
    thread.peerUserId && thread.peerUserId !== viewerId
      ? thread.peerUserId
      : threadParticipants(thread).find((id) => id !== viewerId) || thread.peerUserId || "";
  return {
    id: thread.id,
    type: thread.type,
    title: thread.title,
    peerUserId: peerId,
    peerName: thread.peerName || thread.title,
    peerAvatar: thread.peerAvatar || "",
    peerNostrPubkey: thread.peerNostrPubkey || "",
    lastPreview: lastMessagePreview(thread),
    updatedAt: thread.updatedAt,
    unread: unreadFor(thread, viewerId),
    encrypted: thread.messages.some((m) => m.encrypted),
  };
}

export async function listInbox(userId: string) {
  const data = await load();
  return data.threads
    .filter((t) => userInThread(t, userId))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function listInboxSummaries(userId: string) {
  return (await listInbox(userId)).map((t) => summarizeThread(t, userId));
}

export async function getInboxThread(threadId: string, userId: string) {
  const data = await load();
  const thread = data.threads.find((t) => t.id === threadId && userInThread(t, userId));
  return thread || null;
}

export async function markThreadRead(threadId: string, userId: string) {
  const data = await load();
  const thread = data.threads.find((t) => t.id === threadId && userInThread(t, userId));
  if (!thread) return null;
  thread.unreadBy = { ...(thread.unreadBy || {}), [userId]: 0 };
  if (thread.userId === userId) thread.unread = 0;
  await save(data);
  return thread;
}

export async function unreadCounts(userId: string) {
  const threads = await listInbox(userId);
  const messages = threads.reduce((n, t) => n + unreadFor(t, userId), 0);
  const conversations = threads.filter((t) => unreadFor(t, userId) > 0).length;
  return { messages, conversations };
}

export async function createInboxThread(input: {
  userId: string;
  type: InboxType;
  title: string;
  text: string;
  bookingId?: string;
  peerUserId?: string;
  peerName?: string;
  peerAvatar?: string;
  peerNostrPubkey?: string;
  encrypted?: boolean;
  cipherVersion?: "nip44-v2";
  preview?: string;
  media?: VoiceMedia;
  nostrEventId?: string;
}) {
  const data = await load();
  const id = newId("th");
  const now = new Date().toISOString();
  const participants = [input.userId, input.peerUserId].filter(Boolean) as string[];
  const msg: InboxMessage | null = input.text
    ? {
        id: newId("msg"),
        threadId: id,
        from: "customer",
        fromUserId: input.userId,
        text: input.text,
        encrypted: input.encrypted,
        cipherVersion: input.cipherVersion,
        preview: input.preview,
        media: input.media,
        nostrEventId: input.nostrEventId,
        createdAt: now,
      }
    : null;
  const thread: InboxThread = {
    id,
    userId: input.userId,
    peerUserId: input.peerUserId,
    participantIds: participants,
    type: input.type,
    title: input.title,
    peerName: input.peerName,
    peerAvatar: input.peerAvatar,
    peerNostrPubkey: input.peerNostrPubkey,
    bookingId: input.bookingId,
    unread: 0,
    unreadBy: input.peerUserId ? { [input.peerUserId]: msg ? 1 : 0, [input.userId]: 0 } : { [input.userId]: 0 },
    lastPreview: msg ? lastMessagePreview({ messages: [msg], lastPreview: input.preview } as InboxThread) : "",
    updatedAt: now,
    messages: msg ? [msg] : [],
  };
  data.threads.unshift(thread);
  await save(data);
  return thread;
}

export async function getOrCreatePeerThread(input: {
  fromUserId: string;
  toUserId: string;
  title?: string;
  peerName?: string;
  peerAvatar?: string;
  peerNostrPubkey?: string;
}) {
  const data = await load();
  const existing = data.threads.find((t) => {
    if (t.type !== "buddy") return false;
    const ids = threadParticipants(t);
    return ids.includes(input.fromUserId) && ids.includes(input.toUserId);
  });
  if (existing) {
    if (input.peerName) existing.peerName = existing.peerName || input.peerName;
    if (input.peerNostrPubkey) existing.peerNostrPubkey = input.peerNostrPubkey;
    await save(data);
    return existing;
  }
  const toBuddy = data.buddies.find((b) => b.userId === input.toUserId);
  return createInboxThread({
    userId: input.fromUserId,
    peerUserId: input.toUserId,
    type: "buddy",
    title: input.title || companionDisplayName(toBuddy || { name: input.peerName, userId: input.toUserId }),
    text: "",
    peerName: input.peerName || toBuddy?.name,
    peerAvatar: input.peerAvatar || toBuddy?.avatarUrl,
    peerNostrPubkey: input.peerNostrPubkey || toBuddy?.nostrPubkey,
  });
}

export async function replyInbox(
  threadId: string,
  userId: string,
  text: string,
  from: InboxMessage["from"] = "customer",
  extra?: Partial<Pick<InboxMessage, "encrypted" | "cipherVersion" | "preview" | "media" | "nostrEventId" | "giftWrapId">>,
) {
  const data = await load();
  const thread = data.threads.find((t) => t.id === threadId && userInThread(t, userId));
  if (!thread) return null;
  const msg: InboxMessage = {
    id: newId("msg"),
    threadId,
    from,
    fromUserId: userId,
    text,
    encrypted: extra?.encrypted,
    cipherVersion: extra?.cipherVersion,
    preview: extra?.preview,
    media: extra?.media,
    nostrEventId: extra?.nostrEventId,
    giftWrapId: extra?.giftWrapId,
    createdAt: new Date().toISOString(),
  };
  thread.messages.push(msg);
  thread.updatedAt = msg.createdAt;
  thread.lastPreview = lastMessagePreview(thread);
  thread.unreadBy = thread.unreadBy || {};
  for (const id of threadParticipants(thread)) {
    if (id !== userId) {
      thread.unreadBy[id] = (thread.unreadBy[id] || 0) + 1;
      if (thread.userId === id) thread.unread = thread.unreadBy[id];
    }
  }
  await save(data);
  return thread;
}

export async function listBuddies() {
  return (await load()).buddies;
}

export async function getBuddy(userId: string) {
  return (await load()).buddies.find((b) => b.userId === userId) || null;
}

export async function registerBuddyPubkey(userId: string, nostrPubkey: string, name?: string, avatarUrl?: string) {
  const data = await load();
  const existing = data.buddies.find((b) => b.userId === userId);
  if (existing) {
    existing.nostrPubkey = nostrPubkey;
    if (name) existing.name = existing.name || name;
    if (avatarUrl) existing.avatarUrl = existing.avatarUrl || avatarUrl;
    await save(data);
    return existing;
  }
  const row: BuddyProfile = {
    id: newId("buddy"),
    userId,
    name: name || "مسافر",
    destination: "",
    nostrPubkey,
    avatarUrl,
    createdAt: new Date().toISOString(),
  };
  data.buddies.unshift(row);
  await save(data);
  return row;
}

export async function matchBuddies(input: {
  userId?: string;
  city?: string;
  destination?: string;
  cityQuery?: string;
}) {
  const all = await listBuddies();
  const me = input.userId ? all.find((b) => b.userId === input.userId) : undefined;
  const others = all.filter((b) => b.userId !== input.userId && (normalizePlace(b.city) || normalizePlace(b.destination)));
  const myPlaces = {
    city: input.city || me?.city || "",
    destination: input.destination || me?.destination || "",
  };
  const query = String(input.cityQuery || "").trim();
  let matches = query
    ? filterCompanionsByCity(query, others)
    : others.filter((b) => companionsMatch(myPlaces, b));
  if (!query && !normalizePlace(myPlaces.city) && !normalizePlace(myPlaces.destination)) {
    matches = [];
  }
  const data = await load();
  const withUnread = matches.map((b) => {
    const thread = data.threads.find((t) => {
      if (t.type !== "buddy" || !input.userId) return false;
      const ids = threadParticipants(t);
      return ids.includes(input.userId) && ids.includes(b.userId);
    });
    return {
      ...b,
      unread: thread && input.userId ? unreadFor(thread, input.userId) : 0,
      threadId: thread?.id,
    };
  });
  return { me: me || null, matches: withUnread, cityQuery: query };
}

export async function upsertBuddy(profile: Omit<BuddyProfile, "id" | "createdAt"> & { id?: string }) {
  const data = await load();
  const existing = data.buddies.find((b) => b.userId === profile.userId);
  if (existing) {
    Object.assign(existing, profile);
    existing.city = String(profile.city || existing.city || "").trim();
    existing.destination = String(profile.destination || existing.destination || "").trim();
    await save(data);
    return existing;
  }
  const row: BuddyProfile = { ...profile, id: newId("buddy"), createdAt: new Date().toISOString() };
  data.buddies.unshift(row);
  await save(data);
  return row;
}

export async function createBuddyRequest(fromUserId: string, toUserId: string) {
  const data = await load();
  const row: BuddyRequest = {
    id: newId("breq"),
    fromUserId,
    toUserId,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  data.buddyRequests.unshift(row);
  await save(data);
  return row;
}

export async function decideBuddyRequest(id: string, userId: string, status: "accepted" | "declined") {
  const data = await load();
  const req = data.buddyRequests.find((r) => r.id === id && r.toUserId === userId);
  if (!req) return null;
  req.status = status;
  if (status === "accepted") {
    await createInboxThread({
      userId,
      type: "buddy",
      title: "رفيق سفر",
      text: "تم قبول طلب الرفقة. يمكنك التنسيق من هنا.",
    });
  }
  await save(data);
  return req;
}

export async function listGifts(userId: string) {
  const data = await load();
  return data.gifts.filter((g) => g.purchaserId === userId || g.redeemedBy === userId);
}

export async function purchaseGift(input: { purchaserId: string; amount: number; currency?: string; recipientEmail?: string }) {
  const data = await load();
  const card: GiftCard = {
    id: newId("gift"),
    code: `LNZ-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    amount: input.amount,
    currency: input.currency || "USD",
    purchaserId: input.purchaserId,
    recipientEmail: input.recipientEmail,
    status: "active",
    createdAt: new Date().toISOString(),
  };
  data.gifts.unshift(card);
  await save(data);
  return card;
}

export async function listAllGifts() {
  return (await load()).gifts;
}

export async function voidGift(id: string) {
  const data = await load();
  const card = data.gifts.find((g) => g.id === id);
  if (!card) return null;
  card.status = "void";
  await save(data);
  return card;
}

export async function redeemGift(code: string, userId: string) {
  const data = await load();
  const card = data.gifts.find((g) => g.code.toUpperCase() === code.trim().toUpperCase());
  if (!card || card.status !== "active") return null;
  card.status = "redeemed";
  card.redeemedBy = userId;
  await save(data);
  return card;
}

export async function listRecent(userId: string) {
  return (await load()).recent.filter((r) => r.userId === userId).slice(0, 20);
}

export async function addRecent(view: Omit<RecentView, "id" | "viewedAt">) {
  const data = await load();
  data.recent = [
    { ...view, id: newId("rv"), viewedAt: new Date().toISOString() },
    ...data.recent.filter((r) => !(r.userId === view.userId && r.kind === view.kind && r.refId === view.refId)),
  ].slice(0, 80);
  await save(data);
  return data.recent[0];
}

export async function listCards(userId: string) {
  return (await load()).cards.filter((c) => c.userId === userId);
}

export async function getCardUserKey(userId: string): Promise<string> {
  const cards = await listCards(userId);
  return String(cards.find((c) => c.cardUserKey)?.cardUserKey || "").trim();
}

export async function findSavedCard(id: string, userId: string): Promise<SavedCard | null> {
  const cards = await listCards(userId);
  return cards.find((c) => c.id === id) || null;
}

export async function upsertSavedCard(
  input: Omit<SavedCard, "id" | "createdAt"> & { id?: string }
): Promise<SavedCard> {
  const data = await load();
  const last4 = String(input.last4 || "").replace(/\D/g, "").slice(-4);
  const token = String(input.cardToken || "").trim();
  const existing =
    data.cards.find((c) => c.id === input.id && c.userId === input.userId) ||
    data.cards.find(
      (c) =>
        c.userId === input.userId &&
        ((token && c.cardToken === token) || (last4 && c.last4 === last4 && c.brand === input.brand))
    );
  if (existing) {
    existing.brand = input.brand || existing.brand;
    existing.last4 = last4 || existing.last4;
    existing.cardUserKey = input.cardUserKey || existing.cardUserKey;
    existing.cardToken = token || existing.cardToken;
    existing.expireMonth = input.expireMonth || existing.expireMonth;
    existing.expireYear = input.expireYear || existing.expireYear;
    existing.binNumber = input.binNumber || existing.binNumber;
    existing.cardAlias = input.cardAlias || existing.cardAlias;
    existing.isDefault = input.isDefault ?? existing.isDefault;
    await save(data);
    return existing;
  }
  const row: SavedCard = {
    id: newId("card"),
    userId: input.userId,
    brand: input.brand || "Card",
    last4,
    cardUserKey: input.cardUserKey,
    cardToken: token,
    expireMonth: input.expireMonth,
    expireYear: input.expireYear,
    binNumber: input.binNumber,
    cardAlias: input.cardAlias,
    isDefault: input.isDefault,
    createdAt: new Date().toISOString(),
  };
  data.cards.unshift(row);
  await save(data);
  return row;
}

export async function deleteCard(id: string, userId: string) {
  const data = await load();
  const found = data.cards.find((c) => c.id === id && c.userId === userId) || null;
  data.cards = data.cards.filter((c) => !(c.id === id && c.userId === userId));
  await save(data);
  return found;
}

export async function creatorStats(userId: string, posts: Array<{ authorUserId?: string; likesCount?: number; commentsCount?: number; isReel?: boolean }>) {
  const mine = posts.filter((p) => p.authorUserId === userId);
  return {
    posts: mine.length,
    reels: mine.filter((p) => p.isReel).length,
    likes: mine.reduce((n, p) => n + (p.likesCount || 0), 0),
    comments: mine.reduce((n, p) => n + (p.commentsCount || 0), 0),
  };
}
