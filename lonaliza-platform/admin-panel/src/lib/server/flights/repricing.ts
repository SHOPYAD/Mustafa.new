/**
 * Mandatory re-pricing of one selected fare before payment (and again at fulfilment).
 *
 *   Travelport → AirPrice (reference payload) on the exact products of the cached search
 *   Seeru      → booking/fare on the stored variant (returns the verified booking row used by booking/save)
 *   PKFARE     → precisePricing with the real journeys of the stored solution
 *   Biletbank  → /price for the selected package (priceToken, short-lived)
 *
 * Only the supplier's own numbers are returned; when a supplier does not answer, the quote fails —
 * we never fall back to the cached search price to "keep the funnel moving".
 */

import {
  BiletbankAirAdapter,
  PkfareAirAdapter,
  SeeruAirAdapter,
  TravelportAirAdapter,
} from "@/lib/providers/adapters";
import { parseTravelportFareToken } from "@/lib/providers/adapters/travelport/airAdapter";
import { applyFlightMarkup, type FlightMarkupRule } from "@/lib/flights-config";
import { convertAmountSafe } from "@/lib/server/fx-service";
import {
  markupContextFromLegs,
  roundFlightPrice,
  type PublicFlightLeg,
  type StoredFareToken,
} from "@/lib/server/flights-engine";

export const FLIGHT_QUOTE_TTL_MS = 15 * 60 * 1000;

export type FlightBaggageQuote = { checked?: string; cabin?: string };

export type FlightRepriceOk = {
  ok: true;
  supplier: StoredFareToken["supplier"];
  /** Supplier total for all passengers in the supplier currency. */
  supplierTotal: number;
  supplierCurrency: string;
  /** Selling price after admin markup, in the supplier currency. */
  sellingTotal: number;
  /** Selling price converted to the guest currency. */
  clientTotal: number;
  clientCurrency: string;
  /** Supplier ticketing / payment deadline when reported. */
  paymentTimeLimit?: string;
  baggage?: FlightBaggageQuote;
  /** Supplier payload that must be reused at booking time (Seeru verified row, PKFARE priced solution, Biletbank priceToken). */
  verifiedPayload?: Record<string, unknown>;
  raw: unknown;
};

export type FlightRepriceFail = {
  ok: false;
  code: "token_missing" | "fare_unavailable" | "supplier_error";
  error: string;
};

export type FlightRepriceResult = FlightRepriceOk | FlightRepriceFail;

type AnyRec = Record<string, any>;

function num(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function asArray<T = AnyRec>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : v ? [v as T] : [];
}

/* ------------------------------------------------------------------------------------------------ */

function travelportPrice(data: AnyRec | null): { total: number; currency: string; paymentTimeLimit?: string; baggage?: FlightBaggageQuote; error?: string } {
  const list = data?.OfferListResponse || data;
  const errors = asArray<AnyRec>(list?.Result?.Error).filter((e) => num(e?.StatusCode) >= 400);
  const offer = asArray<AnyRec>(list?.OfferID || list?.Offer)[0];
  if (!offer) return { total: 0, currency: "", error: errors.map((e) => String(e?.Message || "")).join("; ") || "travelport_no_offer" };
  const price = offer?.Price || {};
  const total = num(price?.TotalPrice);
  const currency = String(price?.CurrencyCode?.value || "").toUpperCase();
  const tcs = [
    ...asArray<AnyRec>(offer?.TermsAndConditionsFull),
    ...asArray<AnyRec>(list?.ReferenceList).flatMap((r) => asArray<AnyRec>(r?.TermsAndConditions)),
  ];
  const paymentTimeLimit = tcs.map((t) => String(t?.PaymentTimeLimit || "")).find(Boolean);
  let checked: string | undefined;
  for (const tc of tcs) {
    for (const ba of asArray<AnyRec>(tc?.BaggageAllowance)) {
      const items = asArray<AnyRec>(ba?.BaggageItem);
      const first = items[0];
      if (!first) continue;
      const qty = num(first?.quantity);
      const measure = asArray<AnyRec>(first?.Measurement)[0];
      const text = String(first?.Text || "").trim();
      if (qty > 0 && measure?.value) checked = `${qty} × ${measure.value} ${String(measure?.unit || "kg").toLowerCase()}`;
      else if (qty > 0) checked = `${qty} pc`;
      else if (text) checked = text;
      if (checked) break;
    }
    if (checked) break;
  }
  return { total, currency, paymentTimeLimit, baggage: checked ? { checked } : undefined };
}

function pkfareTotals(solution: AnyRec, pax: { adults: number; children: number; infants: number }): { total: number; currency: string } {
  const fees = num(solution?.qCharge) + num(solution?.tktFee) + num(solution?.platformServiceFee) + num(solution?.merchantFee);
  const base = num(solution?.adtFare) * pax.adults + num(solution?.chdFare) * pax.children + num(solution?.infFare) * pax.infants;
  const tax = num(solution?.adtTax) * pax.adults + num(solution?.chdTax) * pax.children + num(solution?.infTax) * pax.infants;
  const total = base + tax + fees || num(solution?.totalPrice);
  return { total, currency: String(solution?.currency || "").toUpperCase() };
}

function seeruBaggage(row: AnyRec): FlightBaggageQuote | undefined {
  const pick = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : "");
  const checked =
    pick(row?.baggage) ||
    pick(row?.bags) ||
    pick(row?.checked_baggage) ||
    pick(asArray<AnyRec>(row?.legs)[0]?.bags) ||
    pick(asArray<AnyRec>(asArray<AnyRec>(row?.legs)[0]?.segments)[0]?.bags) ||
    pick(row?.price_breakdowns?.ADT?.bags);
  const cabin = pick(row?.cabin_baggage) || pick(asArray<AnyRec>(asArray<AnyRec>(row?.legs)[0]?.segments)[0]?.cabin_bags);
  if (!checked && !cabin) return undefined;
  return { ...(checked ? { checked } : {}), ...(cabin ? { cabin } : {}) };
}

/* ------------------------------------------------------------------------------------------------ */

export async function repriceStoredFare(input: {
  token: StoredFareToken;
  rawOffer: unknown;
  passengers: { adults: number; children: number; infants: number };
  legs: PublicFlightLeg[];
  markupRules: FlightMarkupRule[];
  guestCurrency: string;
}): Promise<FlightRepriceResult> {
  const { token } = input;
  const pax = {
    adults: Math.max(1, num(input.passengers.adults) || 1),
    children: Math.max(0, num(input.passengers.children)),
    infants: Math.max(0, num(input.passengers.infants)),
  };
  let supplierTotal = 0;
  let supplierCurrency = "";
  let paymentTimeLimit: string | undefined;
  let baggage: FlightBaggageQuote | undefined;
  let verifiedPayload: Record<string, unknown> | undefined;
  let raw: unknown = null;

  try {
    if (token.supplier === "travelport") {
      const parsed = parseTravelportFareToken(token.supplierToken);
      if (!parsed) return { ok: false, code: "token_missing", error: "travelport_fare_token_invalid" };
      const res = await new TravelportAirAdapter().priceFareOption(parsed);
      if (!res.ok) return { ok: false, code: "supplier_error", error: res.error || "travelport_price_failed" };
      const p = travelportPrice(res.data as AnyRec);
      if (p.error || !(p.total > 0)) return { ok: false, code: "fare_unavailable", error: p.error || "travelport_price_empty" };
      supplierTotal = p.total;
      supplierCurrency = p.currency || token.price.currency;
      paymentTimeLimit = p.paymentTimeLimit;
      baggage = p.baggage;
      raw = res.data;
    } else if (token.supplier === "seeru") {
      const res = await new SeeruAirAdapter().priceFareOption({
        fareKey: token.supplierToken,
        offerId: token.offerId,
        rawOfferData: input.rawOffer,
        adults: pax.adults,
        children: pax.children,
        infants: pax.infants,
      });
      const status = String(res?.status || "").toLowerCase();
      if (!res || status === "not_found" || status === "error" || status === "failed") {
        return { ok: false, code: "fare_unavailable", error: res?.message || "seeru_fare_not_found" };
      }
      const row = (res.booking || {}) as AnyRec;
      // Seeru: `price` is the fare, `tax` the taxes — the total is their sum (same as the search adapter).
      const total = num(row?.price) + num(row?.tax);
      if (!(total > 0)) return { ok: false, code: "fare_unavailable", error: "seeru_fare_price_missing" };
      supplierTotal = total;
      supplierCurrency = String(row?.currency || token.price.currency || "").toUpperCase();
      baggage = seeruBaggage(row);
      verifiedPayload = row;
      raw = res;
    } else if (token.supplier === "pkfare") {
      const res = await new PkfareAirAdapter().priceFareOption({
        solutionId: token.supplierToken,
        rawOfferData: input.rawOffer,
        adults: pax.adults,
        children: pax.children,
        infants: pax.infants,
        tag: token.supplierContext?.tag,
      });
      if (!res) return { ok: false, code: "token_missing", error: "pkfare_journeys_unresolved" };
      const ec = String(res?.errorCode ?? res?.code ?? "");
      if (ec && ec !== "0" && ec !== "0000") return { ok: false, code: "fare_unavailable", error: res?.errorMsg || res?.msg || `pkfare_${ec}` };
      const solution = (res?.data?.solution || res?.solution) as AnyRec | undefined;
      if (!solution) return { ok: false, code: "fare_unavailable", error: "pkfare_solution_missing" };
      const totals = pkfareTotals(solution, pax);
      if (!(totals.total > 0)) return { ok: false, code: "fare_unavailable", error: "pkfare_price_missing" };
      supplierTotal = totals.total;
      supplierCurrency = totals.currency || token.price.currency;
      paymentTimeLimit = solution?.lastTktTime ? String(solution.lastTktTime) : undefined;
      const bag = solution?.baggageMap?.ADT?.[0] || asArray<AnyRec>(solution?.baggages)[0];
      if (bag) {
        const pieces = num(bag?.baggageAmount ?? bag?.pieces);
        const weight = num(bag?.baggageWeight ?? bag?.weight);
        const text = pieces > 0 && weight > 0 ? `${pieces} × ${weight} kg` : pieces > 0 ? `${pieces} pc` : weight > 0 ? `${weight} kg` : "";
        if (text) baggage = { checked: text };
      }
      verifiedPayload = { solution };
      raw = res;
    } else if (token.supplier === "biletbank") {
      const res = await new BiletbankAirAdapter().checkFarePrice({
        flightId: token.supplierToken,
        selectedPackage: token.supplierContext?.selectedPackage || undefined,
      });
      if (!res.ok || !res.priceToken) return { ok: false, code: "fare_unavailable", error: res.error || "biletbank_price_failed" };
      supplierTotal = num(res.finalAmount);
      supplierCurrency = String(res.currency || token.price.currency || "").toUpperCase();
      if (res.baggage) baggage = { checked: res.baggage };
      verifiedPayload = { priceToken: res.priceToken, flightId: res.flightId || token.supplierToken, selectedPackage: token.supplierContext?.selectedPackage || "" };
      raw = res;
    } else {
      return { ok: false, code: "token_missing", error: "supplier_not_supported" };
    }
  } catch (err) {
    return { ok: false, code: "supplier_error", error: err instanceof Error ? err.message : String(err) };
  }

  if (!(supplierTotal > 0) || !supplierCurrency) {
    return { ok: false, code: "fare_unavailable", error: "supplier_price_missing" };
  }

  const markup = applyFlightMarkup(supplierTotal, input.markupRules, { ...markupContextFromLegs(input.legs), currency: supplierCurrency });
  const sellingTotal = roundFlightPrice(markup.price || supplierTotal);
  const guest = String(input.guestCurrency || supplierCurrency).toUpperCase();
  const clientTotal = roundFlightPrice(guest === supplierCurrency ? sellingTotal : await convertAmountSafe(sellingTotal, supplierCurrency, guest));

  return {
    ok: true,
    supplier: token.supplier,
    supplierTotal: roundFlightPrice(supplierTotal),
    supplierCurrency,
    sellingTotal,
    clientTotal,
    clientCurrency: guest,
    paymentTimeLimit,
    baggage,
    verifiedPayload,
    raw,
  };
}

/** Relative price difference that still counts as "same price" (FX rounding / supplier fee noise). */
export function priceChanged(previous: number, next: number, tolerance = 0.005): boolean {
  if (!(previous > 0) || !(next > 0)) return false;
  return Math.abs(next - previous) / previous > tolerance;
}
