import { biletbankRequest, getBiletbankContext } from "./biletbankClient";
import {
  BAGGAGE_UNKNOWN,
  boolToAttribute,
  deriveFareLabel,
  parseBaggageText,
  type AirOffer,
  type AirOfferLeg,
  type AirOfferSegment,
  type FareBaggage,
  type FareOption,
} from "../common/types";

export interface BiletbankFlightSearchInput {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults?: number;
  children?: number;
  infants?: number;
  cabinClass?: string;
  currency?: string;
}

export interface BiletbankPriceResult {
  ok: boolean;
  flightId?: string;
  baggage?: string;
  priceToken?: string;
  finalAmount?: number;
  currency?: string;
  error?: string;
}

export interface BiletbankBookInput {
  priceToken: string;
  passengers: Array<{
    firstName: string;
    lastName: string;
    gender?: string;
    birthDate?: string;
    citizenId?: string;
    passportNumber?: string;
  }>;
  contact: {
    email: string;
    phone: string;
  };
}

export interface BiletbankBookResult {
  ok: boolean;
  pnr?: string;
  timeLimit?: string;
  status?: string;
  totalAmount?: number;
  currency?: string;
  error?: string;
}

export interface BiletbankTicketResult {
  ok: boolean;
  pnr?: string;
  ticketNumbers?: string[];
  status?: string;
  error?: string;
}

export class BiletbankAirAdapter {
  async testConnection(): Promise<{ ok: boolean; message: string; latencyMs: number }> {
    const started = Date.now();
    const ctx = await getBiletbankContext();

    if (!ctx.clientKey && !ctx.username) {
      throw new Error("بيانات اعتماد Biletbank مفقودة (Client Key أو Username)");
    }

    // Ping the BiletBank flight endpoint with a minimal query to verify credentials and connectivity
    const res = await biletbankRequest<any>("/api/flight/search", {
      method: "POST",
      body: {
        origin: "IST",
        destination: "AYT",
        departureDate: new Date(Date.now() + 86400000 * 30).toISOString().slice(0, 10),
        adultCount: 1,
        cabinClass: "Economy",
      },
    });

    const latencyMs = Date.now() - started;

    if (!res.ok) {
      // If 401 or 403, credentials are wrong; if 200 or returns flights / empty search, connection works
      if (res.status === 401 || res.status === 403) {
        throw new Error(`فشل التحقق من مفاتيح Biletbank (HTTP ${res.status}): ${res.error}`);
      }
    }

    return {
      ok: true,
      message: `تم مصادقة Biletbank بنجاح مقابل ${ctx.apiBaseUrl} (${latencyMs}ms)`,
      latencyMs,
    };
  }

  async searchFlights(params: BiletbankFlightSearchInput): Promise<AirOffer[]> {
    const body = {
      origin: params.origin.toUpperCase().slice(0, 3),
      destination: params.destination.toUpperCase().slice(0, 3),
      departureDate: params.departureDate,
      returnDate: params.returnDate || undefined,
      adultCount: Math.max(1, Number(params.adults || 1)),
      childCount: Number(params.children || 0),
      infantCount: Number(params.infants || 0),
      cabinClass: params.cabinClass || "Economy",
    };

    const res = await biletbankRequest<{ flights?: any[]; Flights?: any[] }>("/api/flight/search", {
      method: "POST",
      body,
    });

    if (!res.ok || !res.data) {
      return [];
    }

    const rawFlights = res.data.flights || res.data.Flights || [];
    const offers: AirOffer[] = [];

    for (const fl of rawFlights) {
      try {
        const id = String(fl.flightId || fl.id || "");
        const airlineCode = String(fl.airline || fl.carrier || "").toUpperCase();
        const flightNumber = String(fl.flightNumber || fl.number || "");
        const totalAmount = Number(fl.fare?.totalAmount || fl.totalPrice || fl.price || 0);
        const currency = String(fl.fare?.currency || fl.currency || params.currency || "USD");
        // Offers without an id, a carrier, a flight number or a price are not sellable — skip, never invent.
        if (!id || !airlineCode || !flightNumber || !(totalAmount > 0)) continue;
        const airlineName = String(fl.airlineName || fl.carrierName || "");

        const depRaw = String(fl.departure || fl.departureTime || "");
        const arrRaw = String(fl.arrival || fl.arrivalTime || "");
        const toIso = (raw: string, fallbackDate: string): string => {
          if (!raw) return "";
          if (/^\d{4}-\d{2}-\d{2}T/.test(raw)) return raw;
          if (raw.includes(" ")) {
            const [d, t] = raw.split(" ");
            return `${d}T${t.length === 5 ? `${t}:00` : t}`;
          }
          if (/^\d{2}:\d{2}/.test(raw)) return `${fallbackDate}T${raw.length === 5 ? `${raw}:00` : raw}`;
          return raw;
        };
        const depIso = toIso(depRaw, params.departureDate);
        const arrIso = toIso(arrRaw, params.departureDate);
        if (!depIso || !arrIso) continue;
        const durationMinutes = Number(fl.duration || fl.durationMinutes || 0) || Math.max(0, Math.round((new Date(arrIso).getTime() - new Date(depIso).getTime()) / 60000));

        const baseAmount = Number(fl.fare?.baseAmount || fl.baseFare || 0);
        const taxAmount = Number(fl.fare?.taxAmount || fl.taxes || 0);
        const price = {
          total: totalAmount,
          base: baseAmount > 0 ? baseAmount : totalAmount - (taxAmount > 0 ? taxAmount : 0),
          taxes: taxAmount > 0 ? taxAmount : undefined,
          currency,
        };

        const baseBaggage: FareBaggage = {
          checked: fl.baggage ? parseBaggageText(fl.baggage) : BAGGAGE_UNKNOWN,
          cabin: fl.cabinBaggage ? parseBaggageText(fl.cabinBaggage) : BAGGAGE_UNKNOWN,
        };
        const refundable = boolToAttribute(typeof fl.refundable === "boolean" ? fl.refundable : undefined);
        const changeable = boolToAttribute(typeof fl.changeable === "boolean" ? fl.changeable : undefined);

        // Real supplier packages only. `packageOptions` may be strings or objects { name, code, price, baggage }.
        const rawPackages: any[] = Array.isArray(fl.packageOptions) ? fl.packageOptions : Array.isArray(fl.packages) ? fl.packages : [];
        const fareOptions: FareOption[] = rawPackages
          .map((pkg, pIdx): FareOption | null => {
            const name = typeof pkg === "string" ? pkg : String(pkg?.name || pkg?.packageName || pkg?.code || "");
            if (!name) return null;
            const pkgTotal = typeof pkg === "object" && pkg ? Number(pkg.totalAmount || pkg.price || pkg.amount || 0) : 0;
            const pkgBaggage: FareBaggage =
              typeof pkg === "object" && pkg && (pkg.baggage || pkg.cabinBaggage)
                ? { checked: pkg.baggage ? parseBaggageText(pkg.baggage) : baseBaggage.checked, cabin: pkg.cabinBaggage ? parseBaggageText(pkg.cabinBaggage) : baseBaggage.cabin }
                : baseBaggage;
            return {
              id: `bb_${id}::${typeof pkg === "object" && pkg?.code ? String(pkg.code) : name}`,
              supplier: "biletbank",
              brandName: name,
              brandCode: typeof pkg === "object" && pkg?.code ? String(pkg.code) : undefined,
              nameSource: "supplier",
              cabin: String(fl.cabinClass || params.cabinClass || "Economy"),
              baggage: pkgBaggage,
              refundable: typeof pkg === "object" && typeof pkg?.refundable === "boolean" ? boolToAttribute(pkg.refundable) : refundable,
              changeable: typeof pkg === "object" && typeof pkg?.changeable === "boolean" ? boolToAttribute(pkg.changeable) : changeable,
              penalties: [],
              seatSelection: "unknown",
              meal: "unknown",
              priority: "unknown",
              price: pkgTotal > 0 ? { ...price, total: pkgTotal, base: pkgTotal - (price.taxes || 0) } : price,
              supplierToken: id,
              supplierContext: { selectedPackage: typeof pkg === "object" && pkg?.code ? String(pkg.code) : name },
              isBestPrice: pIdx === 0,
            };
          })
          .filter((x): x is FareOption => Boolean(x));

        if (!fareOptions.length) {
          const partial = { refundable, changeable, baggage: baseBaggage };
          fareOptions.push({
            id: `bb_${id}`,
            supplier: "biletbank",
            brandName: deriveFareLabel(partial, "ar"),
            nameSource: "derived",
            cabin: String(fl.cabinClass || params.cabinClass || "Economy"),
            baggage: baseBaggage,
            refundable,
            changeable,
            penalties: [],
            seatSelection: "unknown",
            meal: "unknown",
            priority: "unknown",
            price,
            supplierToken: id,
            supplierContext: {},
            isBestPrice: true,
          });
        }
        fareOptions.sort((a, b) => a.price.total - b.price.total);
        fareOptions.forEach((o, i) => (o.isBestPrice = i === 0));

        const legacyBag = {
          checkedBags: baseBaggage.checked.status === "included" ? baseBaggage.checked.pieces ?? (baseBaggage.checked.kg ? 1 : undefined) : baseBaggage.checked.status === "none" ? 0 : undefined,
          weightKg: baseBaggage.checked.status === "included" ? baseBaggage.checked.kg : undefined,
        };

        const segment: AirOfferSegment = {
          flightNumber,
          airlineCode,
          airlineName,
          departureAirport: String(fl.origin || params.origin).toUpperCase().slice(0, 3),
          departureTime: depIso,
          arrivalAirport: String(fl.destination || params.destination).toUpperCase().slice(0, 3),
          arrivalTime: arrIso,
          durationMinutes,
          aircraftName: fl.aircraft ? String(fl.aircraft) : undefined,
          cabinClass: String(fl.cabinClass || params.cabinClass || "Economy"),
          baggageAllowance: legacyBag,
        };

        const leg: AirOfferLeg = {
          origin: segment.departureAirport || "",
          destination: segment.arrivalAirport || "",
          departureDate: depIso,
          arrivalDate: arrIso,
          carrierCode: airlineCode,
          carrierName: airlineName,
          flightNumber,
          durationMinutes,
          stops: Number(fl.stops || 0),
          segments: [segment],
          baggageAllowance: legacyBag,
        };

        offers.push({
          id: `bb_${id}`,
          provider: "biletbank",
          legs: [leg],
          price: fareOptions[0].price,
          refundable: refundable === "included" || refundable === "chargeable",
          modifiable: changeable === "included" || changeable === "chargeable",
          fareOptions,
          rawOfferData: { ...fl, flightId: id },
        });
      } catch {
        continue;
      }
    }

    return offers;
  }

  async checkFarePrice(input: {
    flightId: string;
    selectedPackage?: string;
  }): Promise<BiletbankPriceResult> {
    const cleanId = input.flightId.replace(/^bb_/, "");
    const res = await biletbankRequest<any>("/api/flight/price", {
      method: "POST",
      body: {
        flightId: cleanId,
        ...(input.selectedPackage ? { selectedPackage: input.selectedPackage } : {}),
      },
    });

    if (!res.ok || !res.data) {
      return {
        ok: false,
        error: res.error || "فشل التحقق من تسعير رحلة بيليت بانك",
      };
    }

    const priceToken = String(res.data.priceToken || "");
    const finalAmount = Number(res.data.finalAmount || res.data.totalPrice || 0);
    if (!priceToken || !(finalAmount > 0)) {
      return { ok: false, error: "Biletbank price response missing priceToken/finalAmount" };
    }
    return {
      ok: true,
      flightId: res.data.flightId || cleanId,
      baggage: res.data.baggage ? String(res.data.baggage) : undefined,
      priceToken,
      finalAmount,
      currency: res.data.currency || "USD",
    };
  }

  async createReservation(input: BiletbankBookInput): Promise<BiletbankBookResult> {
    for (const p of input.passengers) {
      if (!p.firstName?.trim() || !p.lastName?.trim() || !p.birthDate) return { ok: false, error: "traveler_data_incomplete" };
    }
    const res = await biletbankRequest<any>("/api/flight/book", {
      method: "POST",
      body: {
        priceToken: input.priceToken,
        passengers: input.passengers.map((p) => ({
          firstName: p.firstName,
          lastName: p.lastName,
          gender: p.gender || "M",
          birthDate: p.birthDate || "",
          citizenId: p.citizenId || "",
          passportNumber: p.passportNumber || "",
        })),
        contact: input.contact,
      },
    });

    if (!res.ok || !res.data) {
      return {
        ok: false,
        error: res.error || "فشل إنشاء حجز تذكرة بيليت بانك",
      };
    }

    const pnr = String(res.data.pnr || res.data.PNR || "").trim();
    if (!pnr) return { ok: false, error: "Biletbank لم يُرجع PNR للحجز" };
    return {
      ok: true,
      pnr,
      timeLimit: res.data.timeLimit ? String(res.data.timeLimit) : undefined,
      status: res.data.status || "Reserved",
      totalAmount: Number(res.data.totalAmount || res.data.totalPrice || 0),
      currency: res.data.currency || "USD",
    };
  }

  async ticketBooking(input: {
    pnr: string;
    paymentMethod?: string;
  }): Promise<BiletbankTicketResult> {
    const cleanPnr = input.pnr.replace(/^bb_/, "");
    const res = await biletbankRequest<any>("/api/flight/ticket", {
      method: "POST",
      body: {
        pnr: cleanPnr,
        paymentMethod: input.paymentMethod || "AgencyBalance",
      },
    });

    if (!res.ok || !res.data) {
      return {
        ok: false,
        error: res.error || "فشل إصدار تذكرة بيليت بانك",
      };
    }

    const tks: string[] = (Array.isArray(res.data.ticketNumbers) ? res.data.ticketNumbers : [res.data.ticketNumber])
      .map((t: unknown) => String(t || "").trim())
      .filter(Boolean);

    return {
      ok: true,
      pnr: cleanPnr,
      ticketNumbers: tks,
      status: res.data.status || "Ticketed",
    };
  }

  async cancelBooking(pnr: string): Promise<{ ok: boolean; error?: string }> {
    const cleanPnr = pnr.replace(/^bb_/, "");
    const res = await biletbankRequest<any>("/api/flight/cancel", {
      method: "POST",
      body: { pnr: cleanPnr },
    });
    return { ok: res.ok, error: res.error };
  }

  async voidTicket(pnr: string): Promise<{ ok: boolean; error?: string }> {
    const cleanPnr = pnr.replace(/^bb_/, "");
    const res = await biletbankRequest<any>("/api/flight/void", {
      method: "POST",
      body: { pnr: cleanPnr },
    });
    return { ok: res.ok, error: res.error };
  }
}
