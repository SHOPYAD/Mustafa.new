import 'catalog_location_suggestion.dart';
import 'flight_offer.dart';

/// The type of flight itinerary.
enum FlightTripType {
  oneWay,
  roundTrip,
  multiCity,
}

/// The cabin class for the flight.
enum FlightCabinClass {
  economy,
  premiumEconomy,
  business,
  first,
}

/// A single leg/route in a flight search (used universally for all trip types).
class FlightRouteSegment {
  const FlightRouteSegment({
    this.origin,
    this.destination,
    this.departureDate,
  });

  final CatalogAirportSuggestion? origin;
  final CatalogAirportSuggestion? destination;
  final DateTime? departureDate;
}


/// In-progress flights search / booking selections (domain only, no Flutter).
///
/// Pure entity: no logic, no copyWith, no getters.
class FlightsBookingDraft {
  const FlightsBookingDraft({
    required this.tripType,
    required this.segments,
    required this.cabinClass,
    required this.adultCount,
    required this.childCount,
    required this.infantCount,
    this.selectedOffer,
    this.selectedVariant,
  });

  final FlightTripType tripType;
  final List<FlightRouteSegment> segments;
  final FlightCabinClass cabinClass;
  final int adultCount;
  final int childCount;
  final int infantCount;
  final FlightOffer? selectedOffer;
  final FlightFareVariant? selectedVariant;
}


