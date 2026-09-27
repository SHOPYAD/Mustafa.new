import '../../../domain/entities/flights/flights_booking_draft.dart';
import '../../../domain/entities/flights/catalog_location_suggestion.dart';
import '../../../domain/entities/flights/flight_offer.dart';

class FlightRouteSegmentModel extends FlightRouteSegment {
  const FlightRouteSegmentModel({
    super.origin,
    super.destination,
    super.departureDate,
  });

  FlightRouteSegmentModel copyWith({
    CatalogAirportSuggestion? origin,
    CatalogAirportSuggestion? destination,
    DateTime? departureDate,
  }) {
    return FlightRouteSegmentModel(
      origin: origin ?? this.origin,
      destination: destination ?? this.destination,
      departureDate: departureDate ?? this.departureDate,
    );
  }
}

/// Data model for FlightsBookingDraft that contains business logic (copyWith, getters)
/// keeping the domain entity pure.
class FlightsBookingDraftModel extends FlightsBookingDraft {
  const FlightsBookingDraftModel({
    super.tripType = FlightTripType.oneWay,
    super.segments = const [FlightRouteSegmentModel()],
    super.cabinClass = FlightCabinClass.economy,
    super.adultCount = 1,
    super.childCount = 0,
    super.infantCount = 0,
    super.selectedOffer,
    super.selectedVariant,
  });

  int get totalPassengers => adultCount + childCount + infantCount;

  // ── Convenience Helpers ──

  /// Gets the primary origin (first segment).
  CatalogAirportSuggestion? get origin =>
      segments.isNotEmpty ? segments.first.origin : null;

  /// Gets the primary destination (first segment).
  CatalogAirportSuggestion? get destination =>
      segments.isNotEmpty ? segments.first.destination : null;

  /// Gets the initial departure date.
  DateTime? get departureDate =>
      segments.isNotEmpty ? segments.first.departureDate : null;

  /// Gets the return date (only valid for round trips with a second segment).
  DateTime? get returnDate {
    if (tripType == FlightTripType.roundTrip && segments.length > 1) {
      return segments[1].departureDate;
    }
    return null;
  }

  FlightsBookingDraftModel copyWith({
    FlightTripType? tripType,
    List<FlightRouteSegment>? segments,
    FlightCabinClass? cabinClass,
    int? adultCount,
    int? childCount,
    int? infantCount,
    FlightOffer? selectedOffer,
    FlightFareVariant? selectedVariant,
    bool clearSelection = false,
  }) {
    return FlightsBookingDraftModel(
      tripType: tripType ?? this.tripType,
      segments: segments ?? this.segments,
      cabinClass: cabinClass ?? this.cabinClass,
      adultCount: adultCount ?? this.adultCount,
      childCount: childCount ?? this.childCount,
      infantCount: infantCount ?? this.infantCount,
      selectedOffer: clearSelection
          ? null
          : (selectedOffer ?? this.selectedOffer),
      selectedVariant: clearSelection
          ? null
          : (selectedVariant ?? this.selectedVariant),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'tripType': tripType.name,
      'cabinClass': cabinClass.name,
      'adultCount': adultCount,
      'childCount': childCount,
      'infantCount': infantCount,
      'segments': segments.map((s) {
        return {
          'origin': s.origin?.city ?? s.origin?.name,
          'originCode': s.origin?.iata ?? '',
          'destination': s.destination?.city ?? s.destination?.name,
          'destinationCode': s.destination?.iata ?? '',
          'date': s.departureDate?.toIso8601String(),
        };
      }).toList(),
    };
  }
}
