import { travelportRequest } from "./httpClient";
import { parseTravelportFareToken, type TravelportFareToken } from "./airAdapter";

/**
 * Travelport JSON Air v11 — booking & ticketing (Hold and Pay 1 workflow, GDS + NDC):
 *
 *   AirReservation: create workbench → add offer (reference payload, same selection as AirPrice)
 *                   → add travelers → commit  ⇒ held booking (Receipt/Confirmation/Locator)
 *   AirTicketing:   workbench from locator → add form of payment (cash/agency) → add payment for the
 *                   offer → commit ⇒ Receipt/ReceiptPayment/Document[DocumentTicket].Number
 *
 * Nothing is ever invented here: a missing workbench id, locator or ticket number is a failure.
 */

export interface PassengerInput {
  type: "ADT" | "CHD" | "INF";
  title: string;
  firstName: string;
  lastName: string;
  /** YYYY-MM-DD */
  dateOfBirth: string;
  gender?: "M" | "F";
  nationality?: string;
  passportNumber?: string;
  /** YYYY-MM-DD */
  passportExpiry?: string;
  passportCountry?: string;
}

export interface BookingInput {
  /** Serialised TravelportFareToken (FareOption.supplierToken) or the token object itself. */
  fareToken: string | TravelportFareToken;
  passengers: PassengerInput[];
  contactEmail: string;
  contactPhone: string;
}

export interface BookingOutput {
  ok: boolean;
  /** Workbench id used for the booking commit (diagnostics only). */
  reservationId?: string;
  /** GDS / aggregator locator (source 1G etc.). */
  pnr?: string;
  /** Carrier locators keyed by source (airline code). */
  carrierLocators?: Record<string, string>;
  /** Offer identifier inside the reservation — required for Add Payment at ticketing. */
  offerIdentifier?: string;
  /** Total price returned at commit (currency + amount) when present. */
  price?: { total: number; currency: string };
  status: "CONFIRMED" | "FAILED";
  error?: string;
  raw?: unknown;
}

type AnyRec = Record<string, any>;

function asArray<T = AnyRec>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : v ? [v as T] : [];
}

function workbenchIdOf(data: AnyRec | null): string {
  return String(data?.ReservationResponse?.Reservation?.Identifier?.value || data?.Reservation?.Identifier?.value || "").trim();
}

function resultError(data: AnyRec | null): string {
  const errors = asArray<AnyRec>(data?.ReservationResponse?.Result?.Error || data?.Result?.Error || data?.Error);
  const bad = errors.filter((e) => Number(e?.StatusCode || 0) >= 400 || (!e?.StatusCode && e?.Message));
  return bad.map((e) => String(e?.Message || e?.value || "")).filter(Boolean).join("; ");
}

function splitPhone(raw: string): { countryAccessCode: string; phoneNumber: string } {
  const digits = String(raw || "").replace(/[^\d+]/g, "");
  const m = digits.match(/^\+?(\d{1,3})(\d{6,})$/);
  if (m) return { countryAccessCode: m[1], phoneNumber: m[2] };
  return { countryAccessCode: "", phoneNumber: digits.replace(/^\+/, "") };
}

function genderOf(p: PassengerInput): "Male" | "Female" {
  if (p.gender === "F") return "Female";
  if (p.gender === "M") return "Male";
  const t = String(p.title || "").toUpperCase();
  return t === "MRS" || t === "MS" || t === "MISS" ? "Female" : "Male";
}

function buildTraveler(p: PassengerInput, idx: number, contact: { email: string; phone: string }): AnyRec {
  const phone = splitPhone(contact.phone);
  const gender = genderOf(p);
  const traveler: AnyRec = {
    "@type": "Traveler",
    id: `trav_${idx + 1}`,
    passengerTypeCode: p.type,
    birthDate: p.dateOfBirth,
    gender,
    PersonName: {
      "@type": "PersonNameDetail",
      ...(p.title ? { Prefix: p.title.toUpperCase() } : {}),
      Given: p.firstName.toUpperCase(),
      Surname: p.lastName.toUpperCase(),
    },
  };
  if (phone.phoneNumber) {
    traveler.Telephone = [
      {
        "@type": "Telephone",
        ...(phone.countryAccessCode ? { countryAccessCode: phone.countryAccessCode } : {}),
        phoneNumber: phone.phoneNumber,
        id: `telephone_${idx + 1}`,
        role: "Mobile",
      },
    ];
  }
  if (contact.email) traveler.Email = [{ value: contact.email }];
  if (p.passportNumber) {
    traveler.TravelDocument = [
      {
        "@type": "TravelDocument",
        docNumber: p.passportNumber,
        docType: "Passport",
        ...(p.passportExpiry ? { expireDate: p.passportExpiry } : {}),
        ...(p.passportCountry || p.nationality ? { issueCountry: p.passportCountry || p.nationality } : {}),
        birthDate: p.dateOfBirth,
        ...(p.nationality ? { Nationality: p.nationality } : {}),
        Gender: gender,
        PersonName: { "@type": "PersonName", Given: p.firstName.toUpperCase(), Surname: p.lastName.toUpperCase() },
      },
    ];
  }
  return traveler;
}

/** Locators from Receipt[ReceiptConfirmation]: the first non-carrier (1G/1P/1V) source is the PNR. */
function locatorsOf(reservation: AnyRec | null): { pnr: string; carrier: Record<string, string> } {
  const receipts = asArray<AnyRec>(reservation?.Receipt);
  let pnr = "";
  const carrier: Record<string, string> = {};
  for (const r of receipts) {
    const loc = r?.Confirmation?.Locator;
    const value = String(loc?.value || "").trim();
    if (!value) continue;
    const source = String(loc?.source || "").trim();
    if (!pnr && (/^1[GPV]$/i.test(source) || !source)) pnr = value;
    else if (source) carrier[source] = value;
  }
  if (!pnr) {
    const first = Object.values(carrier)[0];
    if (first) pnr = first;
  }
  return { pnr, carrier };
}

function ticketNumbersOf(reservation: AnyRec | null): string[] {
  const out: string[] = [];
  for (const r of asArray<AnyRec>(reservation?.Receipt)) {
    for (const d of asArray<AnyRec>(r?.Document)) {
      const num = String(d?.Number || "").trim();
      if (num && /^\d{10,14}$/.test(num) && !out.includes(num)) out.push(num);
    }
  }
  return out;
}

export class TravelportAirBookingAdapter {
  private async newWorkbench(): Promise<{ ok: boolean; id?: string; error?: string }> {
    const res = await travelportRequest<AnyRec>("11/air/book/session/reservationworkbench", {
      method: "POST",
      body: { ReservationID: {} },
      providerId: "travelport_flights",
    });
    if (!res.ok) return { ok: false, error: res.error || "travelport_workbench_failed" };
    const id = workbenchIdOf(res.data);
    if (!id) return { ok: false, error: resultError(res.data) || "travelport_workbench_missing_id" };
    return { ok: true, id };
  }

  private async workbenchFromLocator(locator: string): Promise<{ ok: boolean; id?: string; offerIdentifier?: string; price?: { total: number; currency: string }; error?: string }> {
    const res = await travelportRequest<AnyRec>(
      `11/air/book/session/reservationworkbench/buildfromlocator?Locator=${encodeURIComponent(locator)}`,
      { method: "POST", body: { ReservationID: {} }, providerId: "travelport_flights" }
    );
    if (!res.ok) return { ok: false, error: res.error || "travelport_workbench_from_locator_failed" };
    const reservation = res.data?.ReservationResponse?.Reservation || null;
    const id = workbenchIdOf(res.data);
    if (!id) return { ok: false, error: resultError(res.data) || "travelport_workbench_missing_id" };
    const offer = asArray<AnyRec>(reservation?.Offer)[0];
    const total = Number(offer?.Price?.TotalPrice);
    return {
      ok: true,
      id,
      offerIdentifier: String(offer?.Identifier?.value || "").trim() || undefined,
      price: Number.isFinite(total) && total > 0 ? { total, currency: String(offer?.Price?.CurrencyCode?.value || "") } : undefined,
    };
  }

  private async discardWorkbench(id: string): Promise<void> {
    await travelportRequest(`11/air/book/reservationworkbench/${encodeURIComponent(id)}`, { method: "DELETE", providerId: "travelport_flights" }).catch(() => undefined);
  }

  async createBooking(input: BookingInput): Promise<BookingOutput> {
    const token = typeof input.fareToken === "string" ? parseTravelportFareToken(input.fareToken) : input.fareToken;
    if (!token) return { ok: false, status: "FAILED", error: "travelport_fare_token_invalid" };
    if (!input.passengers.length) return { ok: false, status: "FAILED", error: "passengers_required" };
    for (const p of input.passengers) {
      if (!p.firstName?.trim() || !p.lastName?.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(p.dateOfBirth || "")) {
        return { ok: false, status: "FAILED", error: "traveler_data_incomplete" };
      }
    }

    // 1. Workbench
    const wb = await this.newWorkbench();
    if (!wb.ok || !wb.id) return { ok: false, status: "FAILED", error: wb.error };
    const wbId = wb.id;

    // 2. Add offer — exactly the products priced by AirPrice (reference payload).
    const addOffer = await travelportRequest<AnyRec>(
      `11/air/book/airoffer/reservationworkbench/${encodeURIComponent(wbId)}/offers/buildfromcatalogproductofferings`,
      {
        method: "POST",
        body: {
          OfferQueryBuildFromCatalogProductOfferings: {
            BuildFromCatalogProductOfferingsRequest: {
              "@type": "BuildFromCatalogProductOfferingsRequestAir",
              CatalogProductOfferingsIdentifier: { Identifier: { value: token.catalogId } },
              CatalogProductOfferingSelection: token.selections.map((s) => ({
                CatalogProductOfferingIdentifier: { Identifier: { value: s.offeringId } },
                ProductIdentifier: [{ Identifier: { value: s.productRef } }],
              })),
            },
          },
        },
        providerId: "travelport_flights",
      }
    );
    if (!addOffer.ok) {
      await this.discardWorkbench(wbId);
      return { ok: false, status: "FAILED", error: addOffer.error || resultError(addOffer.data) || "travelport_add_offer_failed", raw: addOffer.data };
    }
    const addOfferError = resultError(addOffer.data);
    if (addOfferError) {
      await this.discardWorkbench(wbId);
      return { ok: false, status: "FAILED", error: addOfferError, raw: addOffer.data };
    }

    // 3. Travelers
    const contact = { email: input.contactEmail, phone: input.contactPhone };
    const travelers = input.passengers.map((p, idx) => buildTraveler(p, idx, contact));
    const addTravelers =
      travelers.length === 1
        ? await travelportRequest<AnyRec>(`11/air/book/traveler/reservationworkbench/${encodeURIComponent(wbId)}/travelers`, {
            method: "POST",
            body: { Traveler: travelers[0] },
            providerId: "travelport_flights",
          })
        : await travelportRequest<AnyRec>(`11/air/book/traveler/reservationworkbench/${encodeURIComponent(wbId)}/travelers/list`, {
            method: "POST",
            body: { TravelerListRequest: { "@type": "TravelerListRequest", Traveler: travelers } },
            providerId: "travelport_flights",
          });
    if (!addTravelers.ok) {
      await this.discardWorkbench(wbId);
      return { ok: false, status: "FAILED", error: addTravelers.error || "travelport_add_travelers_failed", raw: addTravelers.data };
    }

    // 4. Commit ⇒ held booking
    const commit = await travelportRequest<AnyRec>(`11/air/book/reservation/reservations/${encodeURIComponent(wbId)}`, {
      method: "POST",
      providerId: "travelport_flights",
    });
    if (!commit.ok) return { ok: false, status: "FAILED", reservationId: wbId, error: commit.error || "travelport_commit_failed", raw: commit.data };
    const reservation = commit.data?.ReservationResponse?.Reservation || null;
    const commitError = resultError(commit.data);
    const { pnr, carrier } = locatorsOf(reservation);
    if (!pnr) {
      return { ok: false, status: "FAILED", reservationId: wbId, error: commitError || "travelport_commit_no_locator", raw: commit.data };
    }
    const offer = asArray<AnyRec>(reservation?.Offer)[0];
    const total = Number(offer?.Price?.TotalPrice);
    return {
      ok: true,
      status: "CONFIRMED",
      reservationId: wbId,
      pnr,
      carrierLocators: carrier,
      offerIdentifier: String(offer?.Identifier?.value || "").trim() || undefined,
      price: Number.isFinite(total) && total > 0 ? { total, currency: String(offer?.Price?.CurrencyCode?.value || "") } : undefined,
      raw: commit.data,
    };
  }

  /**
   * Tickets a held booking: workbench from locator → FOP (cash / agency account) → payment for the air offer
   * → commit. Returns only ticket numbers actually present in Receipt/ReceiptPayment/Document.
   */
  async issueTicket(locator: string): Promise<{ ok: boolean; ticketNumbers?: string[]; committed?: boolean; error?: string; raw?: unknown }> {
    if (!locator) return { ok: false, error: "locator_required" };
    const wb = await this.workbenchFromLocator(locator);
    if (!wb.ok || !wb.id) return { ok: false, error: wb.error };
    const wbId = wb.id;
    if (!wb.offerIdentifier) {
      await this.discardWorkbench(wbId);
      return { ok: false, error: "travelport_offer_identifier_missing" };
    }

    const fopId = "formOfPayment_1";
    const fop = await travelportRequest<AnyRec>(`11/air/payment/reservationworkbench/${encodeURIComponent(wbId)}/formofpayment`, {
      method: "POST",
      body: { FormOfPaymentCash: { "@type": "FormOfPaymentCash", id: fopId, FormOfPaymentRef: fopId } },
      providerId: "travelport_flights",
    });
    if (!fop.ok) {
      await this.discardWorkbench(wbId);
      return { ok: false, error: fop.error || "travelport_fop_failed", raw: fop.data };
    }
    const fopIdentifier = String(fop.data?.FormOfPaymentResponse?.Identifier?.value || fop.data?.Identifier?.value || "").trim();

    const payment = await travelportRequest<AnyRec>(`11/air/paymentoffer/reservationworkbench/${encodeURIComponent(wbId)}/payments`, {
      method: "POST",
      body: {
        Payment: {
          "@type": "Payment",
          id: "payment_1",
          ...(wb.price
            ? { Amount: { code: wb.price.currency, minorUnit: 2, currencySource: "Charged", approximateInd: true, value: wb.price.total } }
            : {}),
          FormOfPaymentIdentifier: {
            id: fopId,
            FormOfPaymentRef: fopId,
            ...(fopIdentifier ? { Identifier: { authority: "Travelport", value: fopIdentifier } } : {}),
          },
          OfferIdentifier: [{ id: "offer_1", offerRef: "offer_1", Identifier: { authority: "Travelport", value: wb.offerIdentifier } }],
        },
      },
      providerId: "travelport_flights",
    });
    if (!payment.ok) {
      await this.discardWorkbench(wbId);
      return { ok: false, error: payment.error || resultError(payment.data) || "travelport_payment_failed", raw: payment.data };
    }

    const commit = await travelportRequest<AnyRec>(`11/air/book/reservation/reservations/${encodeURIComponent(wbId)}`, {
      method: "POST",
      providerId: "travelport_flights",
    });
    if (!commit.ok) return { ok: false, error: commit.error || "travelport_ticket_commit_failed", raw: commit.data };
    const reservation = commit.data?.ReservationResponse?.Reservation || null;
    const tickets = ticketNumbersOf(reservation);
    const err = resultError(commit.data);
    if (!tickets.length) {
      // Commit accepted but no DocumentTicket yet (carrier delay) — caller keeps the ticket pending and re-reads later.
      return { ok: !err, committed: !err, ticketNumbers: [], error: err || undefined, raw: commit.data };
    }
    return { ok: true, committed: true, ticketNumbers: tickets, raw: commit.data };
  }

  /** @deprecated use issueTicket(locator) */
  async ticketBooking(_reservationId: string, locator?: string): Promise<{ ok: boolean; ticketNumbers?: string[]; error?: string }> {
    return this.issueTicket(locator || _reservationId);
  }

  async retrieveReservation(locator: string): Promise<AnyRec | null> {
    const res = await travelportRequest<AnyRec>(`11/air/book/reservation/reservations/${encodeURIComponent(locator)}`, {
      method: "GET",
      providerId: "travelport_flights",
    });
    return res.ok ? res.data : null;
  }

  /** Ticket numbers already issued on a reservation (Reservation Retrieve → Receipt/Document). */
  async ticketsOnReservation(locator: string): Promise<string[]> {
    const data = await this.retrieveReservation(locator);
    return ticketNumbersOf(data?.ReservationResponse?.Reservation || null);
  }

  async getTicketsByLocator(locator: string): Promise<{ ok: boolean; tickets?: AnyRec[]; error?: string }> {
    const res = await travelportRequest<AnyRec>("11/air/ticket/tickets/getbylocator", {
      method: "POST",
      body: { Locator: { value: locator } },
      providerId: "travelport_flights",
    });
    if (res.ok && res.data) return { ok: true, tickets: asArray<AnyRec>(res.data?.TicketListResponse?.Ticket) };
    return { ok: false, error: res.error };
  }

  async voidTicket(ticketNumber: string): Promise<{ ok: boolean; error?: string }> {
    const res = await travelportRequest<AnyRec>(`11/air/ticket/tickets/updatestatus/${encodeURIComponent(ticketNumber)}`, {
      method: "PUT",
      body: { Status: "Void" },
      providerId: "travelport_flights",
    });
    return { ok: res.ok, error: res.error };
  }

  /** Cancels a held (un-ticketed) GDS reservation. */
  async cancelBooking(locator: string): Promise<{ ok: boolean; error?: string }> {
    if (!locator) return { ok: false, error: "locator_required" };
    const res = await travelportRequest<AnyRec>(`11/air/receipt/reservations/${encodeURIComponent(locator)}/receipts`, {
      method: "POST",
      providerId: "travelport_flights",
    });
    if (res.ok) {
      const receipts = asArray<AnyRec>(res.data?.ReceiptListResponse?.ReceiptID);
      const cancelled = receipts.some((r) => /Cancellation/i.test(String(r?.["@type"] || "")));
      return cancelled ? { ok: true } : { ok: false, error: resultError(res.data) || "travelport_cancel_not_confirmed" };
    }
    return { ok: false, error: res.error || "travelport_cancel_failed" };
  }

  async checkExchangeEligibility(locator: string): Promise<AnyRec | null> {
    const res = await travelportRequest<AnyRec>("11/eligibility/ticketchangeeligibilities", {
      method: "POST",
      body: { Locator: locator },
      providerId: "travelport_flights",
    });
    return res.ok ? res.data : null;
  }
}
