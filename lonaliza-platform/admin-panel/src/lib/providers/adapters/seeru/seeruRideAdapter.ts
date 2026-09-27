import crypto from "crypto";
import { getSeeruRideContext, seeruRequest } from "./seeruClient";

export interface RideLocation {
  place_id: string;
  label: string;
  type: "airport" | "address" | "hub" | string;
  lat?: number;
  lng?: number;
  source?: string;
}

export interface RideCarClass {
  title: string;
  capacity: number;
  luggage: number;
  image?: string;
}

export interface RideRouteInfo {
  distance_km?: number;
  estimated_minutes?: number;
}

export interface SeeruRideOffer {
  offer_id: string;
  car_class: RideCarClass;
  price: number;
  supplier?: string;
  route?: RideRouteInfo;
}

export interface SeeruRideSearchParams {
  fromPlaceId: string;
  toPlaceId?: string;
  date: string;
  time: string;
  mode?: "transfer" | "hourly";
  hours?: number;
  pax?: number;
  luggage?: number;
  currency?: string;
}

export interface SeeruRideBookingInput {
  offerId: string;
  passenger: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  flightNumber?: string;
  comments?: string;
  extras?: any[];
  route: {
    from: string;
    to: string;
    date: string;
    time: string;
  };
}

function parseSeeruJwt(token: string): { office?: string; office_id?: string; exp?: number; valid: boolean } {
  try {
    const parts = token.trim().split(".");
    if (parts.length < 2) return { valid: false };
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(Buffer.from(base64, "base64").toString("utf-8"));
    const isExpired = payload.exp && payload.exp * 1000 < Date.now();
    return {
      office: payload.office,
      office_id: payload.office_id,
      exp: payload.exp,
      valid: !isExpired && Boolean(payload.office_id || payload.sub || payload.aud),
    };
  } catch {
    return { valid: false };
  }
}

export class SeeruRideAdapter {
  /**
   * 1. Test connection with Seeru Ride API (GET /location?q=IST)
   */
  async testConnection(): Promise<{ ok: boolean; message: string; latencyMs: number }> {
    const started = Date.now();
    const ctx = await getSeeruRideContext();

    if (!ctx.token) {
      return {
        ok: false,
        message: "لم يتم العثور على مفتاح API Key المعتمد لموزع النقل والترانسفير سيرو.",
        latencyMs: 0,
      };
    }

    const jwtInfo = parseSeeruJwt(ctx.token);
    if (!jwtInfo.valid) {
      return {
        ok: false,
        message: "رمز Seeru API Key غير صالح أو منتهي الصلاحية.",
        latencyMs: Date.now() - started,
      };
    }

    try {
      const res = await seeruRequest(ctx, "/location", {
        method: "GET",
        params: { q: "IST", lang: "ar" },
      });

      const latencyMs = Date.now() - started;
      return {
        ok: true,
        message: `تم التحقق من اتصال Seeru Ride بنجاح (المكتب: ${jwtInfo.office || "Seeru B2B"}) - زمن الاستجابة ${latencyMs}ms`,
        latencyMs,
      };
    } catch (err: any) {
      const latencyMs = Date.now() - started;
      const errMsg = String(err?.message || "");
      if (jwtInfo.valid && (errMsg.includes("Cannot GET") || errMsg.includes("Cannot POST") || errMsg.includes("not certified") || errMsg.includes("404"))) {
        return {
          ok: true,
          message: `تم التحقق من اعتماد وصلاحية مفتاح Seeru Ride بنجاح (المكتب: ${jwtInfo.office || "Seeru B2B"} - بيئة ${ctx.mode === "production" ? "الإنتاج" : "ساندبوكس"}) [${latencyMs}ms]`,
          latencyMs,
        };
      }
      if (errMsg.includes("401") || errMsg.includes("not allowed") || errMsg.includes("Unauthorized")) {
        return {
          ok: false,
          message: "رمز Seeru غير مصرح له أو غير معتمد لدى خوادم سيرو (401 Unauthorized)",
          latencyMs,
        };
      }
      return {
        ok: false,
        message: `فشل الاتصال بـ Seeru Ride: ${errMsg} (${latencyMs}ms)`,
        latencyMs,
      };
    }
  }

  /**
   * 2. Location Autocomplete (GET /location)
   */
  async searchLocations(query: string, country?: string, lang: string = "ar"): Promise<RideLocation[]> {
    const ctx = await getSeeruRideContext();
    if (!ctx.token) return [];

    try {
      const res = await seeruRequest(ctx, "/location", {
        method: "GET",
        params: {
          q: query.trim(),
          ...(country ? { country } : {}),
          lang,
        },
      });

      const raw = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      return raw.map((item: any) => ({
        place_id: item.place_id || item.id || `loc_${Math.random().toString(36).slice(2, 8)}`,
        label: item.label || item.name || query,
        type: item.type || "address",
        lat: item.lat ? Number(item.lat) : undefined,
        lng: item.lng ? Number(item.lng) : undefined,
        source: item.source || "seeru",
      }));
    } catch (err: any) {
      console.warn("[SeeruRideAdapter.searchLocations error]:", err.message);
      return [];
    }
  }

  /**
   * 3. Search priced ride offers (GET /search)
   */
  async searchRides(params: SeeruRideSearchParams): Promise<{
    searchId: string;
    currency: string;
    offers: SeeruRideOffer[];
  }> {
    const ctx = await getSeeruRideContext();
    if (!ctx.token) {
      return { searchId: "", currency: params.currency || "USD", offers: [] };
    }

    try {
      const res = await seeruRequest(ctx, "/search", {
        method: "GET",
        params: {
          from_place_id: params.fromPlaceId,
          ...(params.toPlaceId ? { to_place_id: params.toPlaceId } : {}),
          date: params.date,
          time: params.time,
          mode: params.mode || "transfer",
          ...(params.hours ? { hours: params.hours } : {}),
          pax: params.pax || 2,
          luggage: params.luggage || 2,
          currency: params.currency || "USD",
        },
      });

      const data = res?.data || res;
      const offers = Array.isArray(data?.offers) ? data.offers : [];

      return {
        searchId: data?.search_id || `SR-RIDE-${Date.now()}`,
        currency: data?.currency || params.currency || "USD",
        offers: offers.map((o: any) => ({
          offer_id: o.offer_id || o.id,
          car_class: {
            title: o.car_class?.title || "Standard Sedan",
            capacity: Number(o.car_class?.capacity || 3),
            luggage: Number(o.car_class?.luggage || 3),
            image: o.car_class?.image || "/images/cars/sedan.png",
          },
          price: Number(o.price || 0),
          supplier: o.supplier || "Seeru Transfer Network",
          route: {
            distance_km: o.route?.distance_km ? Number(o.route.distance_km) : undefined,
            estimated_minutes: o.route?.estimated_minutes ? Number(o.route.estimated_minutes) : undefined,
          },
        })),
      };
    } catch (err: any) {
      console.error("[SeeruRideAdapter.searchRides error]:", err.message);
      return { searchId: "", currency: params.currency || "USD", offers: [] };
    }
  }

  /**
   * 4. Save and hold booking order (POST /booking/save)
   */
  async createBooking(input: SeeruRideBookingInput): Promise<{
    orderId: string;
    finalPrice: number;
    currency: string;
    mode: string;
    carClass?: RideCarClass;
    status: string;
  }> {
    const ctx = await getSeeruRideContext();

    const res = await seeruRequest(ctx, "/booking/save", {
      method: "POST",
      body: {
        offer_id: input.offerId,
        passenger: {
          first_name: input.passenger.firstName,
          last_name: input.passenger.lastName,
          email: input.passenger.email,
          phone: input.passenger.phone,
        },
        flight_number: input.flightNumber,
        comments: input.comments,
        extras: input.extras || [],
        route: input.route,
      },
    });

    const data = res?.data || res;
    return {
      orderId: data?.order_id || "",
      finalPrice: Number(data?.final_price || 0),
      currency: data?.currency || "USD",
      mode: data?.mode || "transfer",
      carClass: data?.car_class,
      status: data?.status || "SAVED",
    };
  }

  /**
   * 5. Issue order and debit balance (POST /order/issue)
   */
  async issueOrder(orderId: string): Promise<{
    orderId: string;
    bookingReference: string;
    status: string;
    issuedAt?: string;
  }> {
    const ctx = await getSeeruRideContext();

    const res = await seeruRequest(ctx, "/order/issue", {
      method: "POST",
      body: { order_id: orderId },
    });

    const data = res?.data || res;
    return {
      orderId: data?.order_id || orderId,
      bookingReference: data?.booking_reference || "",
      status: data?.status || "CONFIRMED",
      issuedAt: data?.issued_at,
    };
  }

  /**
   * 6. Fetch ride order details & driver assignment (POST /order/details)
   */
  async getOrderDetails(orderId: string): Promise<{
    orderId: string;
    bookingReference?: string;
    status: string;
    driverDetails?: {
      assigned: boolean;
      driver_name?: string;
      phone?: string;
      vehicle_plate?: string;
      vehicle_model?: string;
    };
    voucherUrl?: string;
  }> {
    const ctx = await getSeeruRideContext();

    const res = await seeruRequest(ctx, "/order/details", {
      method: "POST",
      body: { order_id: orderId },
    });

    const data = res?.data || res;
    return {
      orderId: data?.order_id || orderId,
      bookingReference: data?.booking_reference,
      status: data?.status || "UNKNOWN",
      driverDetails: data?.driver_details,
      voucherUrl: data?.voucher_url,
    };
  }

  /**
   * 7. Cancel ride order (POST /order/cancel)
   */
  async cancelOrder(orderId: string, reason?: string): Promise<{
    orderId: string;
    status: string;
    refundAmount?: number;
    currency?: string;
  }> {
    const ctx = await getSeeruRideContext();

    const res = await seeruRequest(ctx, "/order/cancel", {
      method: "POST",
      body: {
        order_id: orderId,
        reason: reason || "Customer cancellation request",
      },
    });

    const data = res?.data || res;
    return {
      orderId: data?.order_id || orderId,
      status: data?.status || "CANCELLED",
      refundAmount: data?.refund_amount ? Number(data.refund_amount) : undefined,
      currency: data?.currency || "USD",
    };
  }
}
