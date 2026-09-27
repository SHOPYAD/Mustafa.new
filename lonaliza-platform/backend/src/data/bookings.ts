/** Shared booking types + client helpers (PocketBase-backed with local fallback). */

export type BookingType =
  | "flight"
  | "hotel"
  | "package"
  | "transfer"
  | "visa"
  | "tour"
  | "car"
  | "callback"
  | "contact"
  | "general";

export type BookingStatus = "new" | "in-progress" | "resolved";

export interface Booking {
  id: string;
  type: BookingType;
  /** Display name of package/service */
  packageName?: string;
  destination?: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: BookingStatus;
  createdAt: string;
  userId?: string | null;
  updatedAt?: string;
}

export type CreateBookingInput = {
  type: BookingType;
  packageName?: string;
  destination?: string;
  name: string;
  email?: string;
  phone?: string;
  message?: string;
  userId?: string | null;
  metadata?: Record<string, unknown>;
};

const LOCAL_STORAGE_KEY = "liotrip_bookings";
const LEGACY_LOCAL_STORAGE_KEY = "oktravel_bookings";

function mapApiBooking(row: Record<string, unknown>): Booking {
  return {
    id: String(row.id),
    type: (row.type as BookingType) || "general",
    packageName: (row.service_name as string) || (row.packageName as string) || undefined,
    destination: (row.destination as string) || undefined,
    name: String(row.customer_name || row.name || ""),
    email: String(row.customer_email || row.email || ""),
    phone: String(row.customer_phone || row.phone || ""),
    message: String(row.message || ""),
    status: (row.status as BookingStatus) || "new",
    createdAt: String(row.created_at || row.createdAt || new Date().toISOString()),
    userId: (row.user_id as string) || null,
    updatedAt: (row.updated_at as string) || undefined,
  };
}

function readLocal(): Booking[] {
  if (typeof window === "undefined") return [];
  try {
    const stored =
      localStorage.getItem(LOCAL_STORAGE_KEY) ||
      localStorage.getItem(LEGACY_LOCAL_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as Booking[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(bookings: Booking[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(bookings));
}

/** Create a booking via API (PocketBase). Falls back to localStorage if API unavailable. */
export async function createBooking(
  data: CreateBookingInput
): Promise<Booking> {
  try {
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: data.type,
        service_name: data.packageName || null,
        destination: data.destination || null,
        customer_name: data.name,
        customer_email: data.email || null,
        customer_phone: data.phone || null,
        message: data.message || null,
        user_id: data.userId || null,
        metadata: data.metadata || {},
      }),
    });
    const json = (await res.json().catch(() => ({}))) as {
      booking?: Record<string, unknown>;
    };
    if ((res.ok || res.status === 503) && json.booking) {
      const booking = mapApiBooking(json.booking);
      const local = readLocal();
      local.unshift(booking);
      writeLocal(local.slice(0, 200));
      return booking;
    }
  } catch {
    /* fall through */
  }

  const localBooking: Booking = {
    id: `local-${Date.now()}`,
    type: data.type,
    packageName: data.packageName,
    destination: data.destination,
    name: data.name,
    email: data.email || "",
    phone: data.phone || "",
    message: data.message || "",
    status: "new",
    createdAt: new Date().toISOString(),
  };
  const bookings = readLocal();
  bookings.unshift(localBooking);
  writeLocal(bookings);
  return localBooking;
}

/** @deprecated Prefer createBooking (async). Sync local-only write. */
export function addBooking(
  data: Omit<Booking, "id" | "status" | "createdAt">
): Booking {
  const localBooking: Booking = {
    ...data,
    id: `local-${Date.now()}`,
    status: "new",
    createdAt: new Date().toISOString(),
  };
  const bookings = readLocal();
  bookings.unshift(localBooking);
  writeLocal(bookings);
  // Fire-and-forget PocketBase persist
  void createBooking({
    type: data.type,
    packageName: data.packageName,
    destination: data.destination,
    name: data.name,
    email: data.email,
    phone: data.phone,
    message: data.message,
  });
  return localBooking;
}

export async function fetchBookings(params?: {
  type?: string;
  status?: string;
  customer?: string;
}): Promise<{ bookings: Booking[]; pocketbase?: boolean; error?: string }> {
  try {
    const qs = new URLSearchParams();
    if (params?.type && params.type !== "all") qs.set("type", params.type);
    if (params?.status && params.status !== "all") qs.set("status", params.status);
    if (params?.customer) qs.set("customer", params.customer);
    const res = await fetch(`/api/bookings?${qs.toString()}`, {
      cache: "no-store",
      credentials: "same-origin",
    });
    if (res.ok) {
      const json = (await res.json()) as {
        bookings: Record<string, unknown>[];
        pocketbase?: boolean;
      };
      return {
        bookings: (json.bookings || []).map(mapApiBooking),
        pocketbase: Boolean(json.pocketbase),
      };
    }
    const err = await res.json().catch(() => ({}));
    return {
      bookings: readLocal(),
      error: (err as { error?: string }).error || "Failed to load bookings",
    };
  } catch {
    return { bookings: readLocal(), error: "Network error" };
  }
}

export async function patchBookingStatus(
  id: string,
  status: BookingStatus
): Promise<boolean> {
  try {
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ status }),
    });
    if (res.ok) return true;
  } catch {
    /* local fallback */
  }
  const bookings = readLocal();
  const index = bookings.findIndex((b) => b.id === id);
  if (index !== -1) {
    bookings[index].status = status;
    writeLocal(bookings);
    return true;
  }
  return false;
}

export async function removeBooking(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/bookings/${id}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    if (res.ok) {
      writeLocal(readLocal().filter((b) => b.id !== id));
      return true;
    }
  } catch {
    /* local fallback */
  }
  writeLocal(readLocal().filter((b) => b.id !== id));
  return true;
}

/** Sync helpers used by legacy admin dashboard until fully async. */
export function getBookings(): Booking[] {
  return readLocal();
}

export function updateBookingStatus(id: string, status: BookingStatus): void {
  void patchBookingStatus(id, status);
}

export function deleteBooking(id: string): void {
  void removeBooking(id);
}

export function getNewBookingsCount(): number {
  return readLocal().filter((b) => b.status === "new").length;
}

export async function fetchNewBookingsCount(): Promise<number> {
  try {
    const res = await fetch("/api/admin/new-bookings-count", {
      cache: "no-store",
      credentials: "same-origin",
    });
    const json = (await res.json().catch(() => ({}))) as { count?: number };
    if (res.ok && typeof json.count === "number") return json.count;
  } catch {
    /* fall through */
  }
  return getNewBookingsCount();
}
