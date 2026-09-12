import crypto from "crypto";
import { getAdapterCredentials } from "../common/credentials";
import { directFetch } from "@/lib/server/direct-network";
import { toPkfareCabin } from "./pkfareCabin";
import { toPkfareAirportIata, toPkfareCityIata } from "./pkfareIata";
import {
  BAGGAGE_UNKNOWN,
  deriveFareLabel,
  parseBaggageText,
  type AirOffer,
  type AirOfferLeg,
  type AirOfferSegment,
  type BaggageAllowanceState,
  type FareAttributeState,
  type FareBaggage,
  type FareOption,
  type FarePenalty,
} from "../common/types";

export interface PkfareSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults?: number;
  children?: number;
  infants?: number;
  cabinClass?: string;
  directOnly?: boolean;
  airline?: string;
  /** Send PAR/IST city codes the way the buyer portal does. */
  useCityCode?: boolean;
  allowedOrigins?: string[];
  allowedDestinations?: string[];
}

export interface PkfarePassenger {
  type: "ADT" | "CHD" | "INF";
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality?: string;
  passportNumber?: string;
  passportExpiry?: string;
}

export interface PkfareBookingInput {
  offerId: string;
  passengers: PkfarePassenger[];
  contactEmail: string;
  contactPhone: string;
  rawOfferData?: any;
  /** Idempotency key sent as buyerOrder (our booking id). */
  buyerOrder?: string;
}

/**
 * PKFARE `baggageMap` → tri-state baggage for the adult passenger.
 * Shape (V8/V10): `{ ADT: [{ segmentIndexList, baggageAmount: "1PC", baggageWeight: "23KG", carryOnAmount, carryOnWeight }] }`.
 * Anything PKFARE did not state stays "unknown" (resolved by precisePricing before booking).
 */
export function parsePkfareBaggageMap(baggageMap: any): FareBaggage {
  const rows: any[] = Array.isArray(baggageMap?.ADT) ? baggageMap.ADT : Array.isArray(baggageMap) ? baggageMap : baggageMap && typeof baggageMap === "object" && (baggageMap.baggageAmount || baggageMap.baggageWeight) ? [baggageMap] : [];
  let checked: BaggageAllowanceState = BAGGAGE_UNKNOWN;
  let cabin: BaggageAllowanceState = BAGGAGE_UNKNOWN;
  for (const row of rows) {
    const amount = String(row?.baggageAmount || "").trim();
    const weight = String(row?.baggageWeight || "").trim();
    if (amount || weight) {
      const pcs = parseBaggageText(amount);
      const kg = parseBaggageText(weight);
      let next: BaggageAllowanceState;
      if (pcs.status === "none" || kg.status === "none") next = { status: "none", text: [amount, weight].filter(Boolean).join(" ") };
      else if (pcs.status === "included" || kg.status === "included") {
        next = {
          status: "included",
          pieces: pcs.status === "included" ? pcs.pieces : undefined,
          kg: kg.status === "included" ? kg.kg : undefined,
          text: [amount, weight].filter(Boolean).join(" "),
        };
      } else next = BAGGAGE_UNKNOWN;
      // most restrictive across segments
      if (checked.status === "unknown" || next.status === "none") checked = next;
    }
    const cAmount = String(row?.carryOnAmount || "").trim();
    const cWeight = String(row?.carryOnWeight || "").trim();
    if (cAmount || cWeight) {
      const pcs = parseBaggageText(cAmount);
      const kg = parseBaggageText(cWeight);
      const next: BaggageAllowanceState =
        pcs.status === "none" || kg.status === "none"
          ? { status: "none", text: [cAmount, cWeight].filter(Boolean).join(" ") }
          : pcs.status === "included" || kg.status === "included"
            ? { status: "included", pieces: pcs.status === "included" ? pcs.pieces : undefined, kg: kg.status === "included" ? kg.kg : undefined, text: [cAmount, cWeight].filter(Boolean).join(" ") }
            : BAGGAGE_UNKNOWN;
      if (cabin.status === "unknown" || next.status === "none") cabin = next;
    }
  }
  return { checked, cabin };
}

function penaltyKindOf(r: any): FarePenalty["type"] {
  if (r?.noShow || Number(r?.penaltyType) === 3) return "no_show";
  const t = Number(r?.penaltyType);
  // V8: 0=refund, 1=change. V10 shopping also sends 2=reissue/change.
  if (t === 1 || t === 2) return "change";
  return "cancel";
}

function isPkfarePermitted(r: any): boolean | null {
  if (r?.cannotDo != null || r?.canNotDo != null || r?.notAllowed != null) {
    return !Boolean(r.cannotDo ?? r.canNotDo ?? r.notAllowed);
  }
  const flag = r?.isPermited ?? r?.isPermitted ?? r?.permitted;
  if (flag == null || flag === "") return null;
  if (flag === true || flag === "Y" || flag === "y") return true;
  if (flag === false || flag === "N" || flag === "n") return false;
  const n = Number(flag);
  if (Number.isFinite(n)) return n === 1;
  return null;
}

/**
 * PKFARE `miniRuleMap` → penalties + refund/change states.
 * V10 uses `isPermited` (0/1) and `penaltyFee`/`currencyCode`; V8 used `cannotDo` + `amount`.
 */
function collectMiniRuleGroups(miniRuleMap: any): any[] {
  if (!miniRuleMap) return [];
  if (Array.isArray(miniRuleMap)) return miniRuleMap;
  if (Array.isArray(miniRuleMap.ADT)) return miniRuleMap.ADT;
  if (Array.isArray(miniRuleMap.miniRules)) return [miniRuleMap];
  const out: any[] = [];
  for (const value of Object.values(miniRuleMap)) {
    if (Array.isArray(value)) out.push(...value);
    else if (value && typeof value === "object") out.push(value);
  }
  return out;
}

function mergeAttrState(a: FareAttributeState, b: FareAttributeState): FareAttributeState {
  if (a === "included" || b === "included") return "included";
  if (a === "chargeable" || b === "chargeable") return "chargeable";
  if (a === "not_available" || b === "not_available") return "not_available";
  return a === "unknown" ? b : a;
}

export function parsePkfareMiniRules(miniRuleMap: any, currencyFallback: string): { penalties: FarePenalty[]; refundable: FareAttributeState; changeable: FareAttributeState } {
  const groups: any[] = collectMiniRuleGroups(miniRuleMap);
  const penalties: FarePenalty[] = [];
  let refundable: FareAttributeState = "unknown";
  let changeable: FareAttributeState = "unknown";
  for (const g of groups) {
    const ruleList = Array.isArray(g?.miniRules) ? g.miniRules : g?.penaltyType != null || g?.isPermited != null || g?.cannotDo != null ? [g] : [];
    for (const r of ruleList) {
      const kind = penaltyKindOf(r);
      const when = r?.when != null ? (Number(r.when) === 0 ? "before departure" : Number(r.when) === 1 ? "after departure" : String(r.when)) : undefined;
      const permitted = isPkfarePermitted(r);
      const rawAmount = r?.amount ?? r?.penaltyAmount ?? r?.penalty ?? r?.penaltyFee ?? r?.conditions?.[0]?.amount ?? r?.conditions?.[0]?.penaltyFee;
      const hasAmount = rawAmount != null && rawAmount !== "";
      const amount = hasAmount ? Number(rawAmount) : undefined;
      const rawPercent = r?.percent ?? r?.conditions?.[0]?.percent;
      const percent = r?.isPercent || rawPercent != null ? Number(rawPercent ?? rawAmount) : undefined;
      const desc = String(r?.description || r?.refundRule || r?.reissueRule || r?.remark || "").trim();
      const freeText = /free of charge|without penalty|no penalty|مجانا/i.test(desc);
      const paidAmount = amount != null && Number.isFinite(amount) && amount > 0;
      const paidPercent = percent != null && Number.isFinite(percent) && percent > 0;
      let state: FareAttributeState = "unknown";
      if (freeText || amount === 0 || percent === 0) state = "included";
      else if (paidAmount || paidPercent) {
        // Cancel + explicitly forbidden stays non-refundable. Reissue/change with a fee is chargeable.
        state = kind === "cancel" && permitted === false ? "not_available" : "chargeable";
      } else if (permitted === true) state = "included";
      else if (permitted === false) state = "not_available";
      penalties.push({
        type: kind,
        amount: state === "chargeable" && paidAmount ? amount : state === "included" ? 0 : undefined,
        percent: state === "chargeable" && paidPercent ? percent : undefined,
        currency: String(r?.currency || r?.currencyCode || r?.penaltyCurrency || r?.conditions?.[0]?.currencyCode || currencyFallback),
        window: when,
        text:
          state === "not_available"
            ? kind === "cancel"
              ? "Non-refundable"
              : kind === "change"
                ? "Non-changeable"
                : "Not permitted"
            : state === "included"
              ? "Free"
              : desc || undefined,
      });
      if (kind === "cancel") refundable = mergeAttrState(refundable, state);
      if (kind === "change") changeable = mergeAttrState(changeable, state);
    }
  }
  return { penalties, refundable, changeable };
}

/** Parse Penalty API free-text rows ("Reissue: 131 USD") into structured fees. Never invents amounts. */
export function parsePkfarePenaltyTexts(rows: unknown, currencyFallback: string): FarePenalty[] {
  const list = Array.isArray(rows) ? rows : typeof rows === "string" ? [rows] : [];
  const out: FarePenalty[] = [];
  for (const raw of list) {
    const text = String(raw || "").replace(/\\n/g, "\n");
    if (!text || /refer to structured/i.test(text)) continue;
    for (const line of text.split(/\n+/).map((s) => s.trim()).filter(Boolean)) {
      const money =
        line.match(/(\d+(?:\.\d+)?)\s*(USD|EUR|GBP|TRY|AED|SAR)\b/i) ||
        line.match(/\b(USD|EUR|GBP|TRY|AED|SAR)\s*(\d+(?:\.\d+)?)/i);
      let amount: number | undefined;
      let currency = currencyFallback;
      if (money) {
        if (/^\d/.test(money[1])) {
          amount = Number(money[1]);
          currency = String(money[2] || currencyFallback).toUpperCase();
        } else {
          currency = String(money[1] || currencyFallback).toUpperCase();
          amount = Number(money[2]);
        }
      }
      const kind: FarePenalty["type"] = /reissue|change|revalid|تعديل|تغيير/i.test(line)
        ? "change"
        : /no[\s-]?show|عدم الحضور/i.test(line)
          ? "no_show"
          : /refund|cancel|استرداد|إلغاء/i.test(line)
            ? "cancel"
            : "change";
      const notAllowed = /non[\s-]?refundable|non[\s-]?changeable|not permitted|not allowed|غير قابل|غير مسموح/i.test(line);
      if (notAllowed && !(amount != null && Number.isFinite(amount) && amount > 0)) {
        out.push({
          type: kind,
          currency,
          text: kind === "cancel" ? "Non-refundable" : kind === "change" ? "Non-changeable" : "Not permitted",
        });
        continue;
      }
      if (amount != null && Number.isFinite(amount) && amount > 0) {
        out.push({ type: kind, amount, currency, text: line });
      }
    }
  }
  return out;
}

export type PkfarePaidBagOption = {
  id: string;
  ancillaryKey?: string;
  weightKg: number;
  pieces: number;
  label: string;
  supplierPrice: number;
  currency: string;
  payBaggageType?: number;
};

function kgFromAncillaryWeight(value: unknown): number {
  const raw = String(value || "");
  const match = raw.match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : Number(value) || 0;
}

/** Walk ancillaryPricing payloads for paid-bag rows. Never invents weights or prices. */
export function parsePkfareAncillaryBags(res: any): PkfarePaidBagOption[] {
  const ec = String(res?.errorCode ?? res?.code ?? "");
  if (ec === "B190") return [];
  const bags: PkfarePaidBagOption[] = [];
  const seen = new Set<string>();

  const visit = (node: any, depth: number) => {
    if (!node || depth > 10) return;
    if (Array.isArray(node)) {
      for (const item of node) visit(item, depth + 1);
      return;
    }
    if (typeof node !== "object") return;

    const weight = node.baggageWeight ?? node.bagWeight ?? node.weightKg ?? node.weight ?? node.description;
    const price = node.baggagePrice ?? node.ancillaryPrice ?? node.payPrice ?? node.price;
    const looksLikeBag =
      weight != null &&
      price != null &&
      (node.payBaggageType != null ||
        node.ancillaryKey != null ||
        node.baggagePiece != null ||
        node.baggageCurrency != null ||
        node.ancillaryType === 1 ||
        /kg|lb/i.test(String(weight)));
    if (looksLikeBag) {
      const kg = kgFromAncillaryWeight(weight);
      const supplierPrice = Number(price);
      if (kg > 0 && Number.isFinite(supplierPrice) && supplierPrice >= 0) {
        const rawPieces = Number(node.baggagePiece ?? node.pieces ?? 1);
        const pieces = Number.isFinite(rawPieces) && rawPieces > 0 ? rawPieces : 1;
        const currency = String(node.baggageCurrency || node.currency || "USD");
        const id = String(node.ancillaryKey || node.productKey || `${kg}-${pieces}-${supplierPrice}-${currency}`);
        if (!seen.has(id)) {
          seen.add(id);
          bags.push({
            id,
            ancillaryKey: node.ancillaryKey ? String(node.ancillaryKey) : undefined,
            weightKg: kg,
            pieces,
            label: String(node.description || `${pieces} × ${kg} kg`),
            supplierPrice,
            currency,
            payBaggageType: node.payBaggageType != null ? Number(node.payBaggageType) : undefined,
          });
        }
      }
    }

    for (const value of Object.values(node)) {
      if (value && typeof value === "object") visit(value, depth + 1);
    }
  };

  visit(res?.data ?? res, 0);
  return bags.sort((a, b) => a.weightKg - b.weightKg || a.supplierPrice - b.supplierPrice);
}

/** PKFare shopping V8/V10 misspell this as `segmengtIds`. Prefer that, then the correct spelling. */
export function pkfareFlightSegmentIds(flightObj: any): string[] {
  const raw = flightObj?.segmengtIds ?? flightObj?.segmentIds ?? flightObj?.segments;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((x: any) => (typeof x === "string" ? x : String(x?.segmentRef || x?.segmentId || x?.ref || "")))
    .filter(Boolean);
}

export function pkfareSolutionFlightRefs(sol: any): string[] {
  const journeys = sol?.journeys;
  if (Array.isArray(journeys)) {
    return journeys
      .flatMap((j: any) => {
        if (typeof j === "string") return [j];
        if (Array.isArray(j)) return j.map(String);
        if (Array.isArray(j?.flightIds)) return j.flightIds.map(String);
        if (Array.isArray(j?.flights)) {
          return j.flights.map((x: any) => (typeof x === "string" ? x : String(x?.flightRef || x?.flightId || "")));
        }
        return [];
      })
      .filter(Boolean);
  }
  if (journeys && typeof journeys === "object") {
    return Object.keys(journeys)
      .sort()
      .flatMap((k) => (Array.isArray(journeys[k]) ? journeys[k].map(String) : []))
      .filter(Boolean);
  }
  if (Array.isArray(sol?.flights)) {
    return sol.flights
      .map((x: any) => (typeof x === "string" ? x : String(x?.flightRef || x?.flightId || "")))
      .filter(Boolean);
  }
  return [];
}

export function pkfareShoppingHasSolutions(res: any): boolean {
  if (!res || typeof res !== "object") return false;
  const ec = String(res.errorCode ?? res.code ?? "");
  if (ec && ec !== "0" && ec !== "0000") return false;
  const data = res.data && typeof res.data === "object" ? res.data : null;
  return Boolean(data && Array.isArray(data.solutions) && data.solutions.length > 0);
}

function logPkfare(event: string, meta: Record<string, unknown>): void {
  console.info("[pkfare-search]", JSON.stringify({ event, ...meta }));
}

/** 0 = no suggested cap, same as PKFare buyer docs. A positive cap silently drops results. */
const PKFARE_SOLUTIONS_LIMIT = 0;

function expandPkfareSolutions(solutions: any[]): any[] {
  const out: any[] = [];
  for (const sol of solutions) {
    const nested = sol?.brandFares || sol?.brandFarePrices || sol?.fares || sol?.fareList;
    if (Array.isArray(nested) && nested.length) {
      for (const brand of nested) {
        out.push({
          ...sol,
          ...brand,
          brandName: brand.brandName || brand.brandFare || brand.fareBrand || sol.brandName,
          miniRuleMap: brand.miniRuleMap || sol.miniRuleMap,
          baggageMap: brand.baggageMap || sol.baggageMap,
          solutionId: brand.solutionId || sol.solutionId,
          solutionKey: brand.solutionKey || sol.solutionKey,
        });
      }
    } else {
      out.push(sol);
    }
  }
  return out;
}

function legacyBaggage(b: FareBaggage): { checkedBags?: number; weightKg?: number; cabinBags?: number; cabinDesc?: string } {
  const c = b.checked;
  const cab = b.cabin;
  return {
    checkedBags: c.status === "included" ? c.pieces ?? (c.kg ? 1 : undefined) : c.status === "none" ? 0 : undefined,
    weightKg: c.status === "included" ? c.kg : undefined,
    cabinBags: cab.status === "included" ? cab.pieces ?? 1 : cab.status === "none" ? 0 : undefined,
    cabinDesc: cab.status === "included" ? cab.text || (cab.kg ? `${cab.kg} kg` : undefined) : undefined,
  };
}

function hashKey(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = ((h << 5) + h + input.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

function normFlightNum(airline: string, num: string): string {
  const code = String(airline || "").trim().toUpperCase();
  let n = String(num || "").trim().toUpperCase().replace(/\s+/g, "");
  if (code && n.startsWith(code)) n = n.slice(code.length);
  n = n.replace(/^0+/, "") || n;
  return `${code}${n}`;
}

function physicalOfferKey(legs: AirOfferLeg[]): string {
  return legs
    .map((leg) =>
      (leg.segments || [])
        .map((s) =>
          [
            normFlightNum(s.airlineCode, s.flightNumber),
            s.departureAirport,
            s.arrivalAirport,
            String(s.departureTime || "").slice(0, 16),
          ].join("-")
        )
        .join(">")
    )
    .join("|");
}

export function parsePkfareShoppingData(
  res: any,
  ctx: { adults: number; children: number; infants: number; departureDate: string; cabinClass?: string }
): AirOffer[] {
  const data = res?.data && typeof res.data === "object" ? res.data : res;
  const solutions = expandPkfareSolutions(Array.isArray(data?.solutions) ? data.solutions : []);
  const flightsRaw = Array.isArray(data?.flights) ? data.flights : [];
  const segmentsRaw = Array.isArray(data?.segments) ? data.segments : [];
  const adults = ctx.adults;
  const children = ctx.children;
  const infants = ctx.infants;

  const flightsMap = new Map<string, any>();
  for (const f of flightsRaw) {
    const fRef = String(f.flightId || f.flightRef || f.ref || f.id || "");
    if (fRef) flightsMap.set(fRef, f);
  }

  const segmentsMap = new Map<string, any>();
  for (const s of segmentsRaw) {
    const sRef = String(s.segmentId || s.segmentRef || s.ref || s.id || "");
    if (sRef) segmentsMap.set(sRef, s);
  }

  type Built = { legs: AirOfferLeg[]; options: FareOption[]; solutions: any[] };
  const grouped = new Map<string, Built>();
  let droppedNoPrice = 0;
  let droppedNoLegs = 0;

  for (let i = 0; i < solutions.length; i++) {
    const sol = solutions[i];
    const solId = String(sol.solutionId || sol.solutionKey || `pk_${i}`);

    const adtFare = Number(sol.adtFare || 0);
    const adtTax = Number(sol.adtTax || 0);
    const chdFare = Number(sol.chdFare || 0);
    const chdTax = Number(sol.chdTax || 0);
    const infFare = Number(sol.infFare || 0);
    const infTax = Number(sol.infTax || 0);
    const fees = Number(sol.qCharge || 0) + Number(sol.tktFee || 0) + Number(sol.platformServiceFee || 0) + Number(sol.merchantFee || 0);

    const totalBase = adtFare * adults + chdFare * children + infFare * infants;
    const totalTax = adtTax * adults + chdTax * children + infTax * infants + fees;
    const total = totalBase + totalTax || Number(sol.totalPrice || 0);
    if (!(total > 0)) {
      droppedNoPrice += 1;
      continue;
    }
    const currency = String(sol.currency || "USD");
    const solFlightRefs = pkfareSolutionFlightRefs(sol);

    const baggage = parsePkfareBaggageMap(sol.baggageMap);
    const legBag = legacyBaggage(baggage);
    const legs: AirOfferLeg[] = [];

    for (let fIdx = 0; fIdx < solFlightRefs.length; fIdx++) {
      const fRef = solFlightRefs[fIdx];
      const flightObj = flightsMap.get(fRef) || {};
      const segRefs = pkfareFlightSegmentIds(flightObj);

      const legSegments: AirOfferSegment[] = [];
      for (let sIdx = 0; sIdx < segRefs.length; sIdx++) {
        const sRef = segRefs[sIdx];
        const segObj = segmentsMap.get(sRef) || {};
        const depAirport = String(segObj.departure || segObj.depAirport || segObj.from || "");
        const arrAirport = String(segObj.arrival || segObj.arrAirport || segObj.to || "");
        const depDate = String(segObj.strDepartureDate || segObj.departureDate || segObj.depDate || "");
        const depTime = String(segObj.strDepartureTime || segObj.departureTime || segObj.depTime || "");
        const arrDate = String(segObj.strArrivalDate || segObj.arrivalDate || segObj.arrDate || "");
        const arrTime = String(segObj.strArrivalTime || segObj.arrivalTime || segObj.arrTime || "");
        const iso = (d: string, t: string) => (d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? `${d}T${t.length === 5 ? t + ":00" : t || "00:00:00"}` : d || t);

        legSegments.push({
          segmentId: sRef || `${i}-${fIdx}-${sIdx}`,
          airlineCode: String(segObj.airline || segObj.marketingCarrier || flightObj.airline || ""),
          airlineName: String(segObj.airlineName || segObj.carrierName || ""),
          operatingCarrierCode: String(segObj.opFltAirline || segObj.operatingCarrier || segObj.operatingAirline || ""),
          flightNumber: String(segObj.flightNum || segObj.flightNumber || ""),
          departureAirport: depAirport,
          departureTerminal: String(segObj.departureTerminal || segObj.depTerminal || ""),
          departureTime: iso(depDate, depTime),
          arrivalAirport: arrAirport,
          arrivalTerminal: String(segObj.arrivalTerminal || segObj.arrTerminal || ""),
          arrivalTime: iso(arrDate, arrTime),
          durationMinutes: Number(segObj.flightTime || segObj.flightDuration || segObj.duration || 0),
          aircraftCode: String(segObj.equipment || segObj.aircraftCode || segObj.planeType || ""),
          cabinClass: String(segObj.cabinClass || segObj.cabin || "Economy"),
          bookingClass: String(segObj.bookingCode || segObj.subclass || ""),
          baggageAllowance: { checkedBags: legBag.checkedBags, weightKg: legBag.weightKg },
        });
      }

      if (!legSegments.length) continue;
      legs.push({
        origin: legSegments[0].departureAirport || "",
        destination: legSegments[legSegments.length - 1].arrivalAirport || "",
        departureDate: legSegments[0].departureTime || ctx.departureDate,
        arrivalDate: legSegments[legSegments.length - 1].arrivalTime || ctx.departureDate,
        carrierCode: legSegments[0].airlineCode,
        carrierName: legSegments[0].airlineName || "",
        flightNumber: legSegments[0].flightNumber || "",
        durationMinutes: Number(flightObj.journeyTime || 0) || legSegments.reduce((acc, s) => acc + (s.durationMinutes || 0), 0),
        stops: Number(flightObj.transferCount ?? Math.max(0, legSegments.length - 1)),
        segments: legSegments,
        baggageAllowance: legBag,
      });
    }

    if (!legs.length) {
      droppedNoLegs += 1;
      continue;
    }

    const rules = parsePkfareMiniRules(sol.miniRuleMap, currency);
    const realBrand = String(sol.brandName || sol.brandFare || sol.fareBrand || sol.tag || "").trim();
    const partial = { refundable: rules.refundable, changeable: rules.changeable, baggage };
    const option: FareOption = {
      id: `pk_${solId}`,
      supplier: "pkfare",
      brandName: realBrand || deriveFareLabel(partial, "ar"),
      brandCode: realBrand ? String(sol.tag || "") || undefined : undefined,
      nameSource: realBrand ? "supplier" : "derived",
      cabin: legs[0].segments?.[0]?.cabinClass || ctx.cabinClass || "Economy",
      baggage,
      refundable: rules.refundable,
      changeable: rules.changeable,
      penalties: rules.penalties,
      seatSelection: "unknown",
      meal: "unknown",
      priority: "unknown",
      price: { total, base: totalBase || total, taxes: totalTax, currency },
      supplierToken: solId,
      supplierContext: {
        solutionKey: String(sol.solutionKey || ""),
        shoppingKey: String(data?.shoppingKey || ""),
        tag: String(sol.tag || sol.brandFare || sol.brandName || ""),
        brandFare: String(sol.brandFare || sol.brandName || sol.tag || ""),
        fareType: String(sol.fareType || ""),
        lastTktTime: String(sol.lastTktTime || ""),
      },
      rulesText: String(sol.afterSaleRule || sol.ruleText || "") || undefined,
    };

    const key = physicalOfferKey(legs) || solFlightRefs.join("|");
    const entry = grouped.get(key) || { legs, options: [], solutions: [] };
    entry.options.push(option);
    entry.solutions.push(sol);
    grouped.set(key, entry);
  }

  const offers: AirOffer[] = [];
  for (const [key, entry] of grouped) {
    const options = entry.options.sort((a, b) => a.price.total - b.price.total);
    options.forEach((o, i) => (o.isBestPrice = i === 0));
    const best = options[0];
    offers.push({
      id: `pk_${hashKey(`${key}|${best.supplierToken}|${best.price.total}`)}`,
      provider: "pkfare",
      price: best.price,
      legs: entry.legs,
      validatingCarrier: String(entry.solutions[0]?.platingCarrier || entry.legs[0]?.carrierCode || ""),
      refundable: best.refundable === "included" || best.refundable === "chargeable",
      refundableInfo: best.rulesText,
      modifiable: best.changeable === "included" || best.changeable === "chargeable",
      ticketingDeadline: best.supplierContext?.lastTktTime || undefined,
      fareOptions: options,
      rawOfferData: {
        solution: entry.solutions[0],
        solutions: entry.solutions,
        flights: flightsRaw,
        segments: segmentsRaw,
        shoppingKey: data?.shoppingKey,
      },
    });
  }

  if (droppedNoPrice || droppedNoLegs || offers.length !== solutions.length) {
    logPkfare("parse", {
      solutions: solutions.length,
      offers: offers.length,
      fareOptions: offers.reduce((n, o) => n + (o.fareOptions?.length || 0), 0),
      droppedNoPrice,
      droppedNoLegs,
    });
  }

  return offers;
}

export class PkfareAirAdapter {
  private async getContext() {
    const { fields, mode } = await getAdapterCredentials("pkfare");
    const partnerId = fields.partnerId?.trim() || "";
    const partnerKey = fields.partnerKey?.trim() || "";
    if (!partnerId || !partnerKey) {
      throw new Error("بيانات اعتماد PKFARE مفقودة (partnerId أو partnerKey)");
    }
    const defaultBase = "https://api.pkfare.com";
    const apiBaseUrl = (fields.endpoint?.trim() || defaultBase)
      .replace(/\/+$/, "")
      .replace(/\/json$/i, "");
    return { partnerId, partnerKey, apiBaseUrl, mode };
  }

  private auth(partnerId: string, partnerKey: string) {
    const sign = crypto
      .createHash("md5")
      .update(`${partnerId}${partnerKey}`)
      .digest("hex");
    return { partnerId, sign };
  }

  private async postJson<T>(path: string, body: any): Promise<T> {
    const ctx = await this.getContext();
    const url = `${ctx.apiBaseUrl}/${path.replace(/^\/+/, "")}`;

    const res = await directFetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "LonalizaPKFare/1.0",
      },
      body: JSON.stringify(body),
    });

    const raw = await res.text();
    let json: any = null;
    try {
      json = JSON.parse(raw);
    } catch {
      json = null;
    }

    if (!res.ok) {
      const msg = json?.errorMsg || json?.msg || json?.message || raw.slice(0, 250);
      if (res.status === 404) {
        throw new Error(
          `PKFare ${path} HTTP 404: المسار غير موجود على ${ctx.apiBaseUrl}. واجهة الطيران تستخدم /json/shoppingV10 وليس /balance.`
        );
      }
      throw new Error(`PKFare ${path} HTTP ${res.status}: ${msg}`);
    }

    return json as T;
  }

  async testConnection(): Promise<{ ok: boolean; message: string; latencyMs: number }> {
    const started = Date.now();
    const ctx = await this.getContext();
    const authentication = this.auth(ctx.partnerId, ctx.partnerKey);
    const departureDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    // Official sandbox check is Shopping V10 — PKFare has no /balance API.
    // Documented test city pair: HKG–SIN (Apifox Flight Buyer API).
    const res = await this.postJson<any>("/json/shoppingV10", {
      authentication,
      search: {
        adults: 1,
        children: 0,
        infants: 0,
        nonstop: 0,
        airline: "",
        solutions: 5,
        searchAirLegs: [
          {
            origin: "HKG",
            destination: "SIN",
            departureDate,
            cabinClass: "Economy",
            airline: "",
          },
        ],
      },
    });

    const latencyMs = Date.now() - started;
    const ec = String(res?.errorCode ?? res?.code ?? "");
    const detail = String(res?.errorMsg || res?.msg || "").trim();
    if (ec === "B002" || ec === "B003") {
      throw new Error(
        `فشل مصادقة PKFare [${ec}]: ${detail || "partnerId أو التوقيع غير صالح"}`
      );
    }
    if (ec === "0" || ec === "0000" || res?.data) {
      const n = Array.isArray(res?.data?.solutions) ? res.data.solutions.length : 0;
      return {
        ok: true,
        message: `تم الاتصال بـ PKFare عبر /json/shoppingV10${n ? ` (${n} عرض)` : ""} (${latencyMs}ms)`,
        latencyMs,
      };
    }
    if (ec) {
      return {
        ok: true,
        message: `تم مصادقة PKFare عبر /json/shoppingV10 — رد المزود [${ec}] ${detail} (${latencyMs}ms)`,
        latencyMs,
      };
    }
    throw new Error("فشل اختبار PKFare: رد غير متوقع من /json/shoppingV10");
  }

  /**
   * Search Flights using official Shopping V10 with fallback to Shopping V8.
   * V10 `returnMultiTagPrice` / empty `multiTags` yield errorCode 0 with data:null — never send them.
   * V8 `returnTagPrice: "Y"` returns B070 Invalid Tag — omit it.
   */
  async searchFlights(params: PkfareSearchParams): Promise<AirOffer[]> {
    const ctx = await this.getContext();
    const authentication = this.auth(ctx.partnerId, ctx.partnerKey);

    const adults = Math.max(1, Number(params.adults || 1));
    const children = Math.max(0, Number(params.children || 0));
    const infants = Math.max(0, Number(params.infants || 0));
    const origin = params.useCityCode
      ? toPkfareCityIata(params.origin) || toPkfareAirportIata(params.origin)
      : toPkfareAirportIata(params.origin);
    const destination = params.useCityCode
      ? toPkfareCityIata(params.destination) || toPkfareAirportIata(params.destination)
      : toPkfareAirportIata(params.destination);

    if (!origin || !destination) {
      logPkfare("iata-missing", { origin: params.origin, destination: params.destination });
      return [];
    }
    if (origin !== String(params.origin || "").toUpperCase() || destination !== String(params.destination || "").toUpperCase()) {
      logPkfare("iata-mapped", {
        fromOrigin: params.origin,
        fromDest: params.destination,
        origin,
        destination,
      });
    }

    const searchAirLegs: any[] = [
      {
        origin,
        destination,
        departureDate: params.departureDate,
        cabinClass: toPkfareCabin(params.cabinClass),
        airline: "",
      },
    ];

    if (params.returnDate) {
      searchAirLegs.push({
        origin: destination,
        destination: origin,
        departureDate: params.returnDate,
        cabinClass: toPkfareCabin(params.cabinClass),
        airline: "",
      });
    }

    const sharedSearch = {
      adults,
      children,
      infants,
      nonstop: params.directOnly ? 1 : 0,
      airline: String(params.airline || "").trim(),
      solutions: PKFARE_SOLUTIONS_LIMIT,
      searchAirLegs,
    };

    let res: any = null;
    let source: "v10" | "v8" = "v10";
    try {
      res = await this.postJson<any>("/json/shoppingV10", {
        authentication,
        search: {
          ...sharedSearch,
          returnBrandFarePrice: "Y",
        },
      });
    } catch (err) {
      logPkfare("v10-http-error", { origin, destination, err: String(err).slice(0, 250) });
      res = null;
    }

    if (!pkfareShoppingHasSolutions(res)) {
      logPkfare("v10-unusable", {
        origin,
        destination,
        errorCode: res?.errorCode ?? res?.code ?? null,
        errorMsg: String(res?.errorMsg || res?.msg || "").slice(0, 200),
        hasData: Boolean(res?.data),
        solutions: Array.isArray(res?.data?.solutions) ? res.data.solutions.length : 0,
      });
      try {
        source = "v8";
        res = await this.postJson<any>("/json/shoppingV8", {
          authentication,
          search: sharedSearch,
        });
      } catch (err) {
        logPkfare("v8-http-error", { origin, destination, err: String(err).slice(0, 250) });
        return [];
      }
    }

    const ec = String(res?.errorCode ?? res?.code ?? "");
    if (ec !== "0" && ec !== "0000") {
      logPkfare("shopping-error", {
        origin,
        destination,
        source,
        errorCode: ec,
        errorMsg: String(res?.errorMsg || res?.msg || "").slice(0, 200),
      });
      return [];
    }

    const parsed = parsePkfareShoppingData(res, {
      adults,
      children,
      infants,
      departureDate: params.departureDate,
      cabinClass: params.cabinClass,
    });
    const allowedOrigins = (params.allowedOrigins || []).map((x) => String(x || "").toUpperCase()).filter(Boolean);
    const allowedDests = (params.allowedDestinations || []).map((x) => String(x || "").toUpperCase()).filter(Boolean);
    const offers = parsed.filter((offer) => {
      const first = offer.legs[0]?.origin || "";
      const last = offer.legs[offer.legs.length - 1]?.destination || "";
      if (allowedOrigins.length && !allowedOrigins.includes(first)) return false;
      if (allowedDests.length && !allowedDests.includes(last)) return false;
      if (!allowedOrigins.length && !allowedDests.length) return first === origin && last === destination;
      return true;
    });
    const rawCount = Array.isArray(res?.data?.solutions) ? res.data.solutions.length : 0;
    logPkfare("shopping-ok", {
      origin,
      destination,
      source,
      solutions: rawCount,
      offers: offers.length,
      droppedOffPair: parsed.length - offers.length,
    });
    return offers;
  }

  /**
   * Precise Pricing V12 / V10
   */
  /**
   * Builds the PKFARE `pricing.journeys` payload (journey_0/journey_1…) from a stored raw shopping solution.
   * Returns null when flights/segments cannot be resolved (never invents legs).
   */
  buildJourneysFromRaw(raw: any): Record<string, any[]> | null {
    const solution = raw?.solution || raw || {};
    const flightsMap = new Map<string, any>();
    for (const f of Array.isArray(raw?.flights) ? raw.flights : []) flightsMap.set(String(f?.flightId || f?.flightRef || ""), f);
    const segmentsMap = new Map<string, any>();
    for (const sg of Array.isArray(raw?.segments) ? raw.segments : []) segmentsMap.set(String(sg?.segmentId || sg?.segmentRef || ""), sg);
    const journeys = solution?.journeys && typeof solution.journeys === "object" ? solution.journeys : {};
    const out: Record<string, any[]> = {};
    for (const key of Object.keys(journeys).sort()) {
      const flightIds: string[] = Array.isArray(journeys[key]) ? journeys[key].map(String) : [];
      const segs: any[] = [];
      for (const fid of flightIds) {
        const flight = flightsMap.get(fid);
        if (!flight) return null;
        const segIds = pkfareFlightSegmentIds(flight);
        for (const sid of segIds) {
          const sg = segmentsMap.get(sid);
          if (!sg) return null;
          segs.push({
            airline: String(sg.airline || ""),
            flightNum: String(sg.flightNum || ""),
            departure: String(sg.departure || ""),
            departureDate: String(sg.strDepartureDate || ""),
            departureTime: String(sg.strDepartureTime || ""),
            arrival: String(sg.arrival || ""),
            arrivalDate: String(sg.strArrivalDate || ""),
            arrivalTime: String(sg.strArrivalTime || ""),
            bookingCode: String(sg.bookingCode || ""),
          });
        }
      }
      if (!segs.length) return null;
      out[key] = segs;
    }
    return Object.keys(out).length ? out : null;
  }

  /** Re-prices a stored solution (fare option) via precisePricing using the raw shopping data. */
  async priceFareOption(input: {
    solutionId: string;
    rawOfferData: any;
    adults?: number;
    children?: number;
    infants?: number;
    tag?: string;
  }): Promise<any | null> {
    const raw = input.rawOfferData || {};
    const solution = Array.isArray(raw.solutions)
      ? raw.solutions.find((sol: any) => String(sol?.solutionId || sol?.solutionKey || "") === input.solutionId) || raw.solution
      : raw.solution || raw;
    const journeys = this.buildJourneysFromRaw({ ...raw, solution });
    if (!journeys) return null;
    const brandFare = String(
      input.tag || solution?.brandFare || solution?.brandName || solution?.tag || ""
    ).trim();
    const priced = await this.precisePricing({
      solutionId: String(solution?.solutionId || input.solutionId),
      solutionKey: solution?.solutionKey ? String(solution.solutionKey) : undefined,
      journeys,
      adults: input.adults,
      children: input.children,
      infants: input.infants,
      brandFare: brandFare || undefined,
      tag: brandFare || undefined,
    });
    const ec = String(priced?.errorCode ?? priced?.code ?? "");
    if (ec === "0" || ec === "0000") return priced;
    // Shopping solutionId can expire or lose seats; PKFare docs allow "direct pricing".
    return this.precisePricing({
      solutionId: "direct pricing",
      solutionKey: solution?.solutionKey ? String(solution.solutionKey) : undefined,
      journeys,
      adults: input.adults,
      children: input.children,
      infants: input.infants,
      brandFare: brandFare || undefined,
      tag: brandFare || undefined,
    });
  }

  async precisePricing(input: {
    solutionId: string;
    solutionKey?: string;
    journeys: Record<string, any[]>;
    adults?: number;
    children?: number;
    infants?: number;
    cabin?: string;
    brandFare?: string;
    tag?: string;
  }): Promise<any> {
    const ctx = await this.getContext();
    const authentication = this.auth(ctx.partnerId, ctx.partnerKey);

    const pricing: Record<string, unknown> = {
      solutionId: input.solutionId,
      solutionKey: input.solutionKey,
      journeys: input.journeys,
      adults: Math.max(1, Number(input.adults || 1)),
      children: Math.max(0, Number(input.children || 0)),
      infants: Math.max(0, Number(input.infants || 0)),
    };
    if (input.cabin) pricing.cabin = input.cabin;
    const brandFare = String(input.brandFare || input.tag || "").trim();
    if (brandFare) pricing.brandFare = brandFare;

    try {
      return await this.postJson("/json/precisePricing_V12", { authentication, pricing });
    } catch {
      try {
        return await this.postJson("/json/precisePricing_V12", { Authentication: authentication, pricing });
      } catch {
        return this.postJson("/json/precisePricing_V10", { authentication, pricing });
      }
    }
  }

  /**
   * Penalty V4 / V3 Fare Rules & Penalties
   */
  async fetchPenalties(input: {
    solutionId: string;
    journeys: Record<string, any[]>;
    brandFare?: string;
    tag?: string;
  }): Promise<{ penalties?: string[]; remark?: string; errorCode: string; errorMsg: string }> {
    const ctx = await this.getContext();
    const authentication = this.auth(ctx.partnerId, ctx.partnerKey);

    const tag = String(input.brandFare || input.tag || "").trim();
    const penalty: Record<string, unknown> = {
      solutionId: input.solutionId,
      journeys: input.journeys,
    };
    if (tag) {
      penalty.tag = tag;
      penalty.brandFare = tag;
    }
    const payload = { authentication, penalty };

    try {
      return await this.postJson<{ penalties?: string[]; remark?: string; data?: { penalties?: string[] }; errorCode: string; errorMsg: string }>(
        "/json/penaltyV4",
        payload
      );
    } catch {
      return this.postJson<{ penalties?: string[]; remark?: string; data?: { penalties?: string[] }; errorCode: string; errorMsg: string }>(
        "/json/penaltyV3",
        payload
      );
    }
  }

  /**
   * Precise Booking V8
   */
  async createBooking(input: PkfareBookingInput): Promise<{
    ok: boolean;
    reservationId?: string;
    pnr?: string;
    status: string;
    error?: string;
    raw?: any;
  }> {
    const ctx = await this.getContext();
    const authentication = this.auth(ctx.partnerId, ctx.partnerKey);

    const rawSol = input.rawOfferData?.solution || input.rawOfferData || {};

    for (const p of input.passengers) {
      if (!p.firstName?.trim() || !p.lastName?.trim() || !p.dateOfBirth || !p.nationality || !p.passportNumber) {
        return { ok: false, status: "FAILED", error: "traveler_data_incomplete" };
      }
    }
    const passengers = input.passengers.map((p, idx) => ({
      psgType: p.type,
      sex: p.title === "MR" || p.title === "MASTER" ? "M" : "F",
      firstName: p.firstName,
      lastName: p.lastName,
      nationality: p.nationality,
      birthday: p.dateOfBirth,
      cardType: "P",
      cardNum: p.passportNumber || "",
      cardExpired: p.passportExpiry || "",
      passengerIndex: idx + 1,
    }));

    const contactName = `${input.passengers[0]?.firstName || ""}${input.passengers[0]?.lastName || ""}`.replace(/\s+/g, "");
    const phoneDigits = String(input.contactPhone || "").replace(/[^\d+]/g, "");
    const phoneMatch = phoneDigits.match(/^\+?(\d{1,3})(\d{6,})$/);
    const telCode = phoneMatch ? `+${phoneMatch[1]}` : "";
    const mobile = phoneMatch ? phoneMatch[2] : phoneDigits.replace(/^\+/, "");

    const bookingPayload = {
      Authentication: authentication,
      booking: {
        buyerOrder: input.buyerOrder || `LONA-${Date.now()}`,
        passengers,
        solution: rawSol,
        contact: {
          name: contactName,
          email: input.contactEmail,
          mobile,
          ...(telCode ? { telCode } : {}),
        },
      },
    };

    let res: any = null;
    try {
      res = await this.postJson<any>("/json/preciseBooking_V8", bookingPayload);
    } catch {
      res = await this.postJson<any>("/json/preciseBooking", bookingPayload);
    }

    const ec = String(res?.errorCode ?? res?.code ?? "");
    if (ec && ec !== "0" && ec !== "0000") {
      return {
        ok: false,
        status: "FAILED",
        error: res?.errorMsg || res?.msg || "فشل حجز تذاكر PKFare",
      };
    }

    const data = res?.data || res || {};
    const orderNum = String(data?.orderNum || data?.orderId || "").trim();
    if (!orderNum) {
      return { ok: false, status: "FAILED", error: res?.errorMsg || "PKFARE لم يُرجع رقم الطلب (orderNum)", raw: data };
    }
    const pnr = String(data?.airPnr || data?.pnr || "").trim() || orderNum;

    return {
      ok: true,
      reservationId: orderNum,
      pnr,
      status: "CONFIRMED",
      raw: data,
    };
  }

  /**
   * Order Pricing V6 (Mandatory pre-ticketing check)
   */
  async checkOrderPricing(orderNum: string): Promise<any> {
    const ctx = await this.getContext();
    const authentication = this.auth(ctx.partnerId, ctx.partnerKey);
    return this.postJson("/json/orderPricingV6", {
      Authentication: authentication,
      orderPricing: { orderNum: String(orderNum) },
    });
  }

  /**
   * Instant Payment & Ticketing Deduction (/json/ticketing)
   */
  async issueTicket(input: {
    orderNum: string;
    pnr: string;
    email: string;
    name: string;
    telNum: string;
  }): Promise<{ ok: boolean; error?: string; data?: any }> {
    const ctx = await this.getContext();
    const authentication = this.auth(ctx.partnerId, ctx.partnerKey);

    const payload = {
      authentication,
      ticketing: {
        orderNum: String(input.orderNum),
        PNR: input.pnr,
        email: input.email,
        name: input.name,
        telNum: input.telNum,
      },
    };

    const res = await this.postJson<any>("/json/ticketing", payload);
    const ec = String(res?.errorCode ?? res?.code ?? "");
    const ok = ec === "0" || ec === "0000";
    return { ok, error: ok ? undefined : res?.errorMsg, data: res?.data };
  }

  /**
   * Ticket Issuance Reminder / Notification (/json/requestTicketing)
   */
  async ticketBooking(orderNum: string): Promise<{ ok: boolean; error?: string }> {
    const ctx = await this.getContext();
    const authentication = this.auth(ctx.partnerId, ctx.partnerKey);

    const payload = {
      Authentication: authentication,
      data: {
        issuingOrdersPush: [String(orderNum)],
      },
    };

    let res: any = null;
    try {
      res = await this.postJson<any>("/json/requestTicketing", payload);
    } catch {
      res = await this.postJson<any>("/requestTicketing", payload);
    }

    const ec = String(res?.errorCode ?? res?.code ?? "");
    const ok = ec === "0" || ec === "0000" || res?.success === true;
    return { ok, error: ok ? undefined : res?.errorMsg || "فشل طلب إصدار التذاكر لـ PKFare" };
  }

  /** Order status / airline PNR / ticket numbers exactly as reported by orderDetail. */
  async orderState(orderNum: string): Promise<{ status: string; airPnr: string; tickets: string[]; raw: any }> {
    const raw = await this.fetchOrderDetails(orderNum).catch(() => null);
    const data = raw?.data || {};
    const tickets = new Set<string>();
    const pushTicket = (v: unknown) => {
      // Production numbers are 13-digit IATA numbers; the sandbox returns short alphanumeric stubs. Multiple
      // numbers per passenger are separated by "/".
      for (const part of String(v || "").split("/")) {
        const t = part.trim();
        if (/^[A-Za-z0-9]{6,14}$/.test(t)) tickets.add(t);
      }
    };
    for (const p of Array.isArray(data?.passengers) ? data.passengers : []) pushTicket(p?.ticketNum);
    for (const s of Array.isArray(data?.solutions) ? data.solutions : []) {
      for (const p of Array.isArray(s?.passengers) ? s.passengers : []) pushTicket(p?.ticketNum);
    }
    return {
      status: String(data?.orderStatus || "").toUpperCase(),
      airPnr: String(data?.airPnr || data?.pnr || "").trim(),
      tickets: [...tickets],
      raw,
    };
  }

  /**
   * Order Details V14 / V9
   */
  async fetchOrderDetails(orderNum: string): Promise<any> {
    const ctx = await this.getContext();
    const authentication = this.auth(ctx.partnerId, ctx.partnerKey);
    const payload = {
      Authentication: authentication,
      data: {
        orderNum: String(orderNum),
        includeFields: "passengers,journeys,solutions,ancillary,scheduleChange,checkinInfo",
        includeOrderTypes: ["O", "R", "C", "V"],
      },
    };

    try {
      return await this.postJson("/json/orderDetail/V14", payload);
    } catch {
      return this.postJson("/json/orderDetail/v9", payload);
    }
  }

  /**
   * Cancel Unpaid Order (/json/cancel)
   */
  async cancelBooking(orderNum: string, virtualPnr?: string): Promise<{ ok: boolean; error?: string }> {
    const ctx = await this.getContext();
    const authentication = this.auth(ctx.partnerId, ctx.partnerKey);
    const res = await this.postJson<any>("/json/cancel", {
      Authentication: authentication,
      cancel: { orderNum: String(orderNum), virtualPnr },
    });
    const ec = String(res?.errorCode ?? res?.code ?? "");
    const ok = ec === "0" || ec === "0000";
    return { ok, error: ok ? undefined : res?.errorMsg };
  }

  /**
   * Void Ticket V2 (/json/voiding/v2)
   */
  async voidTicket(orderNum: string, passengers: Array<{ lastName: string; firstName: string; birthday?: string; sex?: string }>): Promise<{ ok: boolean; error?: string }> {
    const ctx = await this.getContext();
    const authentication = this.auth(ctx.partnerId, ctx.partnerKey);
    const res = await this.postJson<any>("/json/voiding/v2", {
      Authentication: authentication,
      VoidRequest: {
        orderNum: String(orderNum),
        passenger: passengers,
      },
    });
    const ec = String(res?.errorCode ?? res?.code ?? "");
    const ok = ec === "0" || ec === "0000";
    return { ok, error: ok ? undefined : res?.errorMsg };
  }

  /**
   * Generate Refund Pricing (/json/refundPricing/generate)
   */
  async quoteRefund(input: {
    orderNum: string;
    ticketNums?: Array<{ ticketNum: string; firstName: string; lastName: string; birthday: string; sex: string }>;
    refundReason?: number;
    refundType?: number;
    pnrList?: any[];
  }): Promise<{ ok: boolean; refundPricingId?: string; data?: any; error?: string }> {
    const ctx = await this.getContext();
    const authentication = this.auth(ctx.partnerId, ctx.partnerKey);

    const payload = {
      Authentication: authentication,
      data: {
        orderNum: String(input.orderNum),
        ticketNums: input.ticketNums || [],
      },
    };

    const res = await this.postJson<any>("/json/refundPricing/generate", payload);
    const ec = String(res?.errorCode ?? res?.code ?? "");
    if (ec === "0" || ec === "0000") {
      return {
        ok: true,
        refundPricingId: res?.data?.refundPricingId || res?.data?.refundPriceId,
        data: res?.data,
      };
    }
    return { ok: false, error: res?.errorMsg || "فشل استعلام تسعير الاسترجاع" };
  }

  /**
   * Check Refund Pricing Status (/json/refundPricing/check)
   */
  async checkRefundPricing(refundPricingId: string): Promise<any> {
    const ctx = await this.getContext();
    const authentication = this.auth(ctx.partnerId, ctx.partnerKey);
    return this.postJson("/json/refundPricing/check", {
      Authentication: authentication,
      data: { refundPricingId },
    });
  }

  /**
   * Submit Refund Request (/json/refund-api/refundRequest)
   */
  async commitRefund(input: {
    refundPricingId?: string;
    orderNum: string;
    allPaxOfOrder?: number;
    pnrList?: any[];
    refundReason?: number;
    refundType?: number;
  }): Promise<{ ok: boolean; refundOrderId?: string; error?: string }> {
    const ctx = await this.getContext();
    const authentication = this.auth(ctx.partnerId, ctx.partnerKey);
    const payload = {
      Authentication: authentication,
      data: {
        refundPricingId: input.refundPricingId,
        orderNum: input.orderNum,
        allPaxOfOrder: input.allPaxOfOrder ?? 1,
        pnrList: input.pnrList || [],
        refundReason: input.refundReason ?? 0,
        refundType: input.refundType ?? 0,
      },
    };

    const res = await this.postJson<any>("/json/refund-api/refundRequest", payload);
    const ec = String(res?.errorCode ?? res?.code ?? "");
    if (ec === "0" || ec === "0000") {
      return { ok: true, refundOrderId: res?.data?.refundOrderId || res?.data?.refundOrderNum };
    }
    return { ok: false, error: res?.errorMsg || "فشل تقديم طلب الاسترجاع" };
  }

  /**
   * Check Refund Execution Status (/json/refund-api/checkRefund)
   */
  async checkRefund(refundOrderNum: string): Promise<any> {
    const ctx = await this.getContext();
    const authentication = this.auth(ctx.partnerId, ctx.partnerKey);
    return this.postJson("/json/refund-api/checkRefund", {
      Authentication: authentication,
      data: { refundOrderNum },
    });
  }

  /**
   * Ancillary Pricing V6 (/json/ancillaryPricingV6).
   * Docs require PrecisePricing first (30 min). ancillary: [1] = paid baggage.
   */
  async getAncillaryPricing(input: {
    solutionId: string;
    journeys: any;
    adults?: number;
    children?: number;
    infants?: number;
    solutionKey?: string;
    tag?: string;
  }): Promise<any> {
    const ctx = await this.getContext();
    const authentication = this.auth(ctx.partnerId, ctx.partnerKey);
    const pricing: Record<string, unknown> = {
      adults: Math.max(1, Number(input.adults || 1)),
      children: Math.max(0, Number(input.children || 0)),
      infants: Math.max(0, Number(input.infants || 0)),
      ancillary: [1],
      solutionId: input.solutionId,
      solutionKey: input.solutionKey || undefined,
      journeys: input.journeys,
    };
    if (input.tag) {
      pricing.tag = input.tag;
      pricing.brandFare = input.tag;
    }
    try {
      return await this.postJson("/json/ancillaryPricingV6", { authentication, pricing });
    } catch {
      return this.postJson("/json/ancillaryPricingV6", { Authentication: authentication, pricing });
    }
  }

  /**
   * Ancillary Booking V2 (/json/ancillaryBookingV2)
   */
  async bookAncillaries(input: {
    airOrderNum: string;
    buyerOrder?: string;
    ancillaryBooking: any;
  }): Promise<any> {
    const ctx = await this.getContext();
    const authentication = this.auth(ctx.partnerId, ctx.partnerKey);
    return this.postJson("/json/ancillaryBookingV2", {
      Authentication: authentication,
      ...input,
    });
  }

  /**
   * Change Reshop (/json/change/reshop)
   */
  async quoteChange(input: {
    orderNum: string;
    origin?: string;
    destination?: string;
    departureDate?: string;
  }): Promise<any> {
    const ctx = await this.getContext();
    const authentication = this.auth(ctx.partnerId, ctx.partnerKey);
    return this.postJson("/json/change/reshop", {
      Authentication: authentication,
      data: input,
    });
  }

  /**
   * Change Request (/json/change/changeRequest)
   */
  async commitChange(input: {
    orderNum: string;
    voluntaryType?: number;
    pnrList?: any[];
    changeSolutions?: any[];
  }): Promise<any> {
    const ctx = await this.getContext();
    const authentication = this.auth(ctx.partnerId, ctx.partnerKey);
    return this.postJson("/json/change/changeRequest", {
      Authentication: authentication,
      data: input,
    });
  }
}
