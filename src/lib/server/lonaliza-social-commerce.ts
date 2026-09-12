import { newId, readJsonStore, writeJsonStore } from "@/lib/server/json-file-store";

export type InboxType = "support" | "booking" | "buddy" | "system";

export type InboxMessage = {
  id: string;
  threadId: string;
  from: "customer" | "admin" | "system";
  text: string;
  createdAt: string;
};

export type InboxThread = {
  id: string;
  userId: string;
  type: InboxType;
  title: string;
  bookingId?: string;
  unread: number;
  updatedAt: string;
  messages: InboxMessage[];
};

export type BuddyProfile = {
  id: string;
  userId: string;
  name: string;
  destination: string;
  dateFrom?: string;
  dateTo?: string;
  language?: string;
  bio?: string;
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

export async function listInbox(userId: string) {
  const data = await load();
  return data.threads.filter((t) => t.userId === userId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function createInboxThread(input: {
  userId: string;
  type: InboxType;
  title: string;
  text: string;
  bookingId?: string;
}) {
  const data = await load();
  const id = newId("th");
  const msg: InboxMessage = {
    id: newId("msg"),
    threadId: id,
    from: "customer",
    text: input.text,
    createdAt: new Date().toISOString(),
  };
  const thread: InboxThread = {
    id,
    userId: input.userId,
    type: input.type,
    title: input.title,
    bookingId: input.bookingId,
    unread: 0,
    updatedAt: msg.createdAt,
    messages: [msg],
  };
  data.threads.unshift(thread);
  await save(data);
  return thread;
}

export async function replyInbox(threadId: string, userId: string, text: string, from: InboxMessage["from"] = "customer") {
  const data = await load();
  const thread = data.threads.find((t) => t.id === threadId && t.userId === userId);
  if (!thread) return null;
  const msg: InboxMessage = {
    id: newId("msg"),
    threadId,
    from,
    text,
    createdAt: new Date().toISOString(),
  };
  thread.messages.push(msg);
  thread.updatedAt = msg.createdAt;
  if (from !== "customer") thread.unread += 1;
  await save(data);
  return thread;
}

export async function listBuddies() {
  return (await load()).buddies;
}

export async function upsertBuddy(profile: Omit<BuddyProfile, "id" | "createdAt"> & { id?: string }) {
  const data = await load();
  const existing = data.buddies.find((b) => b.userId === profile.userId);
  if (existing) {
    Object.assign(existing, profile);
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

export async function deleteCard(id: string, userId: string) {
  const data = await load();
  data.cards = data.cards.filter((c) => !(c.id === id && c.userId === userId));
  await save(data);
  return true;
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
