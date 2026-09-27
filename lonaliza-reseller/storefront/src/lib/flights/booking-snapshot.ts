import type { FareFamily, FlightSearchQuery, Itinerary } from "@/components/flights/types";

/** Rich flight snapshot for invoices — itinerary only; extras are added by the booking funnel. */
export function buildFlightItinerarySnapshot(input: {
  itinerary: Itinerary;
  fare: FareFamily | null;
  query: FlightSearchQuery;
  fareClassLabel: string;
  routeLabel: string;
  paymentMethod: string;
}): Record<string, unknown> {
  const tripType = input.query.tripType;
  const legs = input.itinerary.legs.flatMap((leg, legIndex) => {
    const direction =
      tripType === "round-trip" ? (legIndex === 0 ? "outbound" : "return") : "outbound";
    const segments = leg.segments.length ? leg.segments : [null];
    return segments.map((seg, segIndex) => {
      const layover =
        segIndex < segments.length - 1 && leg.layovers[segIndex]
          ? {
              airport: leg.layovers[segIndex].airport,
              city: leg.layovers[segIndex].city,
              durationMinutes: leg.layovers[segIndex].durationInMinutes,
            }
          : undefined;
      return {
        origin: seg?.origin.displayCode || leg.origin.displayCode,
        originName: seg?.origin.name || leg.origin.name || "",
        originCity: seg?.origin.city || leg.origin.city || "",
        originTerminal: seg?.origin.terminal || "",
        destination: seg?.destination.displayCode || leg.destination.displayCode,
        destinationName: seg?.destination.name || leg.destination.name || "",
        destinationCity: seg?.destination.city || leg.destination.city || "",
        destinationTerminal: seg?.destination.terminal || "",
        departure: seg?.departure || leg.departure,
        arrival: seg?.arrival || leg.arrival,
        flightNumber: seg?.flightNumber || "",
        airline: seg?.marketingCarrier.name || leg.carriers[0]?.name || "",
        airlineCode: seg?.marketingCarrier.code || leg.carriers[0]?.code || "",
        airlineLogo: seg?.marketingCarrier.logoUrl || leg.carriers[0]?.logoUrl || "",
        aircraft: seg?.aircraft || "",
        durationMinutes: seg?.durationInMinutes || (segIndex === 0 ? leg.durationInMinutes : 0),
        direction,
        layover,
      };
    });
  });

  return {
    booking_type: "flight",
    itineraryId: input.itinerary.id,
    payment_method: input.paymentMethod,
    route: input.routeLabel,
    departDate: input.query.date,
    returnDate: input.query.returnDate || "",
    tripType,
    fareClass: input.fareClassLabel,
    baggage: input.fare?.baggage || "",
    cabinBaggage: "",
    checkedBaggage: input.fare?.baggage || "",
    flightNumbers: input.itinerary.legs
      .flatMap((leg) => leg.segments.map((seg) => seg.flightNumber))
      .filter(Boolean)
      .join(" · "),
    baseFare: input.fare?.price || input.itinerary.price,
    taxes: input.itinerary.taxes || 0,
    ticket_number: "PENDING",
    ticket_issued: false,
    legs,
  };
}
