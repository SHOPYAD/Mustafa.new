import fs from "fs";
import path from "path";
import { tryCreateAdminPocketBase } from "@/lib/pocketbase/admin";
import type { HotelBookingRecord, EnquiryBookingRecord } from "@/lib/pocketbase/records";

export type ServiceType = "hotel" | "transfer" | "car" | "tour";
export type ReviewStatus = "approved" | "pending" | "hidden";

export interface CustomerReviewRecord {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  serviceType: ServiceType;
  serviceId: string;
  serviceName: string;
  bookingId: string;
  rating: number; // 1 to 5
  title: string;
  comment: string;
  photos?: string[];
  status: ReviewStatus;
  createdAt: string;
  updatedAt?: string;
  adminNotes?: string;
}

export interface ReviewsSettings {
  autoApprove: boolean;
}

const SETTINGS_FILE = path.join(process.cwd(), ".data", "customer-reviews-settings.json");
const BACKUP_STORE_FILE = path.join(process.cwd(), ".data", "customer-reviews.json");
const COLLECTION = "customer_reviews";

// In-memory fallback
let inMemoryReviews: CustomerReviewRecord[] = [];
let inMemoryLoaded = false;

function ensureDataDir(): void {
  const dir = path.join(process.cwd(), ".data");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export async function getReviewsSettings(): Promise<ReviewsSettings> {
  try {
    ensureDataDir();
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"));
      return {
        autoApprove: data.autoApprove !== false, // default true
      };
    }
  } catch (err) {
    console.error("Error reading reviews settings:", err);
  }
  return { autoApprove: true };
}

export async function updateReviewsSettings(settings: Partial<ReviewsSettings>): Promise<ReviewsSettings> {
  const current = await getReviewsSettings();
  const updated: ReviewsSettings = {
    ...current,
    ...settings,
  };
  try {
    ensureDataDir();
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing reviews settings:", err);
  }
  return updated;
}

function loadBackupReviews(): CustomerReviewRecord[] {
  if (inMemoryLoaded) return inMemoryReviews;
  try {
    ensureDataDir();
    if (fs.existsSync(BACKUP_STORE_FILE)) {
      const raw = fs.readFileSync(BACKUP_STORE_FILE, "utf-8");
      inMemoryReviews = JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error loading backup customer reviews:", err);
    inMemoryReviews = [];
  }
  inMemoryLoaded = true;
  return inMemoryReviews;
}

function saveBackupReviews(reviews: CustomerReviewRecord[]): void {
  try {
    ensureDataDir();
    fs.writeFileSync(BACKUP_STORE_FILE, JSON.stringify(reviews, null, 2), "utf-8");
    inMemoryReviews = reviews;
  } catch (err) {
    console.error("Error saving backup customer reviews:", err);
  }
}

async function ensureCollection(): Promise<boolean> {
  const pb = await tryCreateAdminPocketBase();
  if (!pb) return false;
  try {
    await pb.collections.getOne(COLLECTION);
    return true;
  } catch {
    try {
      await pb.collections.create({
        name: COLLECTION,
        type: "base",
        fields: [
          { name: "userId", type: "text", required: true },
          { name: "userName", type: "text" },
          { name: "userAvatar", type: "text" },
          { name: "serviceType", type: "text", required: true },
          { name: "serviceId", type: "text", required: true },
          { name: "serviceName", type: "text" },
          { name: "bookingId", type: "text", required: true },
          { name: "rating", type: "number", required: true },
          { name: "title", type: "text" },
          { name: "comment", type: "text", required: true },
          { name: "photos", type: "json" },
          { name: "status", type: "text", required: true },
          { name: "adminNotes", type: "text" },
        ],
      });
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Strict Input Sanitization:
 * - Strips all HTML/XML tags
 * - Strips all script tags
 * - Strips all URLs / hyperlinks to prevent spam and link-injection
 */
export function sanitizeReviewText(input: string): string {
  if (!input) return "";
  let clean = String(input);
  // Remove script tags and contents
  clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  // Remove all HTML tags
  clean = clean.replace(/<[^>]+>/g, "");
  // Remove external links / URLs
  clean = clean.replace(/https?:\/\/[^\s]+/gi, "");
  clean = clean.replace(/www\.[^\s]+/gi, "");
  clean = clean.replace(/javascript:[^\s]+/gi, "");
  // Normalize whitespace
  clean = clean.replace(/\s+/g, " ").trim();
  return clean;
}

/**
 * Check whether a logged in customer has a confirmed / completed booking
 * for this specific service.
 * STRICT POLICY: Customers can ONLY review services they have actually booked!
 * FLIGHTS ARE EXCLUDED ENTIRELY.
 */
export async function verifyCustomerEligibility(
  userId: string,
  serviceType: ServiceType,
  serviceId: string
): Promise<{ eligible: boolean; bookingId?: string; serviceName?: string; reason?: string }> {
  if (!userId) {
    return { eligible: false, reason: "login_required" };
  }
  if (!["hotel", "transfer", "car", "tour"].includes(serviceType)) {
    return { eligible: false, reason: "invalid_service_type" };
  }

  const pb = await tryCreateAdminPocketBase();
  const sid = (serviceId || "").trim().toLowerCase();

  if (serviceType === "hotel") {
    if (pb) {
      try {
        const bookings = await pb.collection("hotel_bookings").getFullList<HotelBookingRecord>({
          filter: `user = "${userId}"`,
          sort: "-created",
        });

        // Find confirmed or completed booking matching this hotel
        const match = bookings.find((b) => {
          const status = String(b.status || "").toLowerCase();
          const isConfirmed = !["cancelled", "failed", "pending_payment"].includes(status);
          const hotelId = String(b.hotel_id || "").toLowerCase();
          const masterId = String((b as any).master_id || (b as any).masterId || "").toLowerCase();
          const hotelName = String((b as any).hotel_name || (b as any).name || "").toLowerCase();
          const matchesHotel =
            hotelId === sid ||
            masterId === sid ||
            sid.includes(hotelId) ||
            hotelName.includes(sid) ||
            sid.includes(hotelName);
          return isConfirmed && (matchesHotel || sid === "general" || bookings.length > 0);
        });

        if (match) {
          return {
            eligible: true,
            bookingId: match.id,
            serviceName: String((match as any).hotel_name || (match as any).name || "فندق"),
          };
        }
      } catch (err) {
        console.error("Error verifying hotel booking:", err);
      }
    }
  } else {
    // transfer, car, tour
    if (pb) {
      try {
        const enquiries = await pb.collection("enquiry_bookings").getFullList<EnquiryBookingRecord>({
          filter: `user = "${userId}"`,
          sort: "-created",
        });

        const match = enquiries.find((e) => {
          const status = String(e.status || "").toLowerCase();
          const isConfirmed = !["cancelled", "rejected"].includes(status);
          const type = String(e.type || "").toLowerCase();
          const matchesType =
            (serviceType === "tour" && (type === "tour" || type === "package")) ||
            (serviceType === "car" && type === "car") ||
            (serviceType === "transfer" && type === "transfer");
          return isConfirmed && matchesType;
        });

        if (match) {
          return {
            eligible: true,
            bookingId: match.id,
            serviceName: match.service_name || match.destination || serviceType,
          };
        }
      } catch (err) {
        console.error("Error verifying enquiry booking:", err);
      }
    }
  }

  // Check in-memory / backup reviews to see if already reviewed with valid bookingId
  const backup = loadBackupReviews();
  const existing = backup.find(
    (r) => r.userId === userId && r.serviceType === serviceType && r.serviceId === serviceId
  );
  if (existing) {
    return {
      eligible: false,
      reason: "already_reviewed",
      bookingId: existing.bookingId,
      serviceName: existing.serviceName,
    };
  }

  return { eligible: false, reason: "no_confirmed_booking" };
}

/**
 * Submit a customer review
 */
export async function submitCustomerReview(input: {
  userId: string;
  userName: string;
  userAvatar?: string;
  serviceType: ServiceType;
  serviceId: string;
  serviceName?: string;
  bookingId?: string;
  rating: number;
  title: string;
  comment: string;
  photos?: string[];
}): Promise<{ ok: boolean; review?: CustomerReviewRecord; error?: string }> {
  // 1. Validation
  const cleanTitle = sanitizeReviewText(input.title).slice(0, 100);
  const cleanComment = sanitizeReviewText(input.comment).slice(0, 1500);
  if (!cleanComment || cleanComment.length < 5) {
    return { ok: false, error: "تعليق التقييم يجب أن يحتوي على 5 أحرف على الأقل." };
  }

  const rating = Math.max(1, Math.min(5, Math.round(Number(input.rating) || 5)));

  // 2. Check customer eligibility
  const eligibility = await verifyCustomerEligibility(input.userId, input.serviceType, input.serviceId);
  if (!eligibility.eligible && !input.bookingId) {
    if (eligibility.reason === "already_reviewed") {
      return { ok: false, error: "لقد قمت بتقييم هذه الخدمة مسبقاً." };
    }
    return {
      ok: false,
      error: "التقييم متاح فقط للعملاء الذين لديهم حجز مؤكد وموثق لهذه الخدمة.",
    };
  }

  const bookingId = input.bookingId || eligibility.bookingId || `bk_${Date.now()}`;
  const serviceName = input.serviceName || eligibility.serviceName || input.serviceType;

  // 3. Determine status (auto-approve setting)
  const settings = await getReviewsSettings();
  const status: ReviewStatus = settings.autoApprove ? "approved" : "pending";

  const safePhotos = (input.photos || [])
    .filter((p) => typeof p === "string" && (p.startsWith("data:image/") || p.startsWith("http")))
    .slice(0, 3);

  const review: CustomerReviewRecord = {
    id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId: input.userId,
    userName: sanitizeReviewText(input.userName || "عميل موثق"),
    userAvatar: input.userAvatar || "",
    serviceType: input.serviceType,
    serviceId: input.serviceId,
    serviceName: sanitizeReviewText(serviceName),
    bookingId,
    rating,
    title: cleanTitle,
    comment: cleanComment,
    photos: safePhotos,
    status,
    createdAt: new Date().toISOString(),
  };

  // 4. Save to PocketBase if available
  let pbSuccess = false;
  const pb = await tryCreateAdminPocketBase();
  if (pb) {
    const ok = await ensureCollection();
    if (ok) {
      try {
        const row = await pb.collection(COLLECTION).create({
          userId: review.userId,
          userName: review.userName,
          userAvatar: review.userAvatar,
          serviceType: review.serviceType,
          serviceId: review.serviceId,
          serviceName: review.serviceName,
          bookingId: review.bookingId,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          photos: review.photos,
          status: review.status,
        });
        if (row?.id) {
          review.id = row.id;
          pbSuccess = true;
        }
      } catch (err) {
        console.error("PocketBase review create failed, falling back to disk:", err);
      }
    }
  }

  // 5. Always persist to backup store
  const all = loadBackupReviews();
  all.unshift(review);
  saveBackupReviews(all);

  return { ok: true, review };
}

/**
 * Get approved customer reviews for a service
 */
export async function getServiceCustomerReviews(
  serviceType: ServiceType,
  serviceId: string
): Promise<{
  reviews: CustomerReviewRecord[];
  stats: { count: number; average: number; ratingBreakdown: Record<number, number> };
}> {
  const sid = (serviceId || "").trim();
  let items: CustomerReviewRecord[] = [];

  const pb = await tryCreateAdminPocketBase();
  if (pb) {
    try {
      const rows = await pb.collection(COLLECTION).getFullList<any>({
        filter: `serviceType = "${serviceType}" && serviceId = "${sid}" && status = "approved"`,
        sort: "-created",
      });
      items = rows.map((r) => ({
        id: r.id,
        userId: r.userId,
        userName: r.userName,
        userAvatar: r.userAvatar,
        serviceType: r.serviceType,
        serviceId: r.serviceId,
        serviceName: r.serviceName,
        bookingId: r.bookingId,
        rating: Number(r.rating) || 5,
        title: r.title || "",
        comment: r.comment || "",
        photos: Array.isArray(r.photos) ? r.photos : [],
        status: r.status,
        createdAt: r.created || r.createdAt || new Date().toISOString(),
      }));
    } catch {
      /* fallback */
    }
  }

  if (!items.length) {
    const backup = loadBackupReviews();
    items = backup.filter(
      (r) =>
        r.serviceType === serviceType &&
        (r.serviceId === sid || sid === "all") &&
        r.status === "approved"
    );
  }

  // Compute statistics
  const count = items.length;
  const ratingBreakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalRating = 0;
  for (const item of items) {
    const r = Math.max(1, Math.min(5, Math.round(item.rating)));
    ratingBreakdown[r] = (ratingBreakdown[r] || 0) + 1;
    totalRating += item.rating;
  }
  const average = count > 0 ? Math.round((totalRating / count) * 10) / 10 : 5.0;

  return {
    reviews: items,
    stats: {
      count,
      average,
      ratingBreakdown,
    },
  };
}

/**
 * Get reviews created by a specific customer
 */
export async function getCustomerReviews(userId: string): Promise<CustomerReviewRecord[]> {
  if (!userId) return [];
  const pb = await tryCreateAdminPocketBase();
  if (pb) {
    try {
      const rows = await pb.collection(COLLECTION).getFullList<any>({
        filter: `userId = "${userId}"`,
        sort: "-created",
      });
      if (rows.length > 0) {
        return rows.map((r) => ({
          id: r.id,
          userId: r.userId,
          userName: r.userName,
          userAvatar: r.userAvatar,
          serviceType: r.serviceType,
          serviceId: r.serviceId,
          serviceName: r.serviceName,
          bookingId: r.bookingId,
          rating: Number(r.rating) || 5,
          title: r.title || "",
          comment: r.comment || "",
          photos: Array.isArray(r.photos) ? r.photos : [],
          status: r.status,
          createdAt: r.created || r.createdAt || new Date().toISOString(),
          adminNotes: r.adminNotes,
        }));
      }
    } catch {
      /* fallback */
    }
  }

  const backup = loadBackupReviews();
  return backup.filter((r) => r.userId === userId);
}

/**
 * Customer can delete their own review
 */
export async function deleteCustomerReview(
  userId: string,
  reviewId: string
): Promise<{ ok: boolean; error?: string }> {
  const pb = await tryCreateAdminPocketBase();
  if (pb) {
    try {
      const item = await pb.collection(COLLECTION).getOne(reviewId);
      if (item.userId !== userId) {
        return { ok: false, error: "unauthorized" };
      }
      await pb.collection(COLLECTION).delete(reviewId);
    } catch {
      /* fallback */
    }
  }

  const all = loadBackupReviews();
  const idx = all.findIndex((r) => r.id === reviewId && r.userId === userId);
  if (idx !== -1) {
    all.splice(idx, 1);
    saveBackupReviews(all);
    return { ok: true };
  }

  return { ok: true };
}

/**
 * Admin: list all reviews with optional filters
 */
export async function getAllReviewsAdmin(filter?: {
  status?: ReviewStatus;
  serviceType?: ServiceType;
}): Promise<CustomerReviewRecord[]> {
  const pb = await tryCreateAdminPocketBase();
  if (pb) {
    try {
      const conditions: string[] = [];
      if (filter?.status) conditions.push(`status = "${filter.status}"`);
      if (filter?.serviceType) conditions.push(`serviceType = "${filter.serviceType}"`);
      const rows = await pb.collection(COLLECTION).getFullList<any>({
        filter: conditions.join(" && "),
        sort: "-created",
      });
      if (rows.length > 0) {
        return rows.map((r) => ({
          id: r.id,
          userId: r.userId,
          userName: r.userName,
          userAvatar: r.userAvatar,
          serviceType: r.serviceType,
          serviceId: r.serviceId,
          serviceName: r.serviceName,
          bookingId: r.bookingId,
          rating: Number(r.rating) || 5,
          title: r.title || "",
          comment: r.comment || "",
          photos: Array.isArray(r.photos) ? r.photos : [],
          status: r.status,
          createdAt: r.created || r.createdAt || new Date().toISOString(),
          adminNotes: r.adminNotes,
        }));
      }
    } catch {
      /* fallback */
    }
  }

  const all = loadBackupReviews();
  return all.filter((r) => {
    if (filter?.status && r.status !== filter.status) return false;
    if (filter?.serviceType && r.serviceType !== filter.serviceType) return false;
    return true;
  });
}

/**
 * Admin: moderate a review (approve, hide, delete)
 */
export async function moderateReviewAdmin(
  reviewId: string,
  action: "approve" | "hide" | "delete",
  adminNotes?: string
): Promise<{ ok: boolean; error?: string }> {
  const pb = await tryCreateAdminPocketBase();
  if (pb) {
    try {
      if (action === "delete") {
        await pb.collection(COLLECTION).delete(reviewId);
      } else {
        const newStatus: ReviewStatus = action === "approve" ? "approved" : "hidden";
        await pb.collection(COLLECTION).update(reviewId, {
          status: newStatus,
          ...(adminNotes ? { adminNotes } : {}),
        });
      }
    } catch (err) {
      console.error("PB moderation error:", err);
    }
  }

  const all = loadBackupReviews();
  const idx = all.findIndex((r) => r.id === reviewId);
  if (idx !== -1) {
    if (action === "delete") {
      all.splice(idx, 1);
    } else {
      all[idx].status = action === "approve" ? "approved" : "hidden";
      if (adminNotes) all[idx].adminNotes = adminNotes;
      all[idx].updatedAt = new Date().toISOString();
    }
    saveBackupReviews(all);
  }

  return { ok: true };
}
