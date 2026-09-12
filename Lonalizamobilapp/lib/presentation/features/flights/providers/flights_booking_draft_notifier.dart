import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../data/models/flights/flights_booking_draft_model.dart';
import '../../../../domain/entities/flights/flights_booking_draft.dart';
import '../../../../domain/entities/flights/catalog_location_suggestion.dart';
import '../../../../domain/entities/flights/flight_offer.dart';

/// Provider for the active flight search configuration.
final flightsBookingDraftProvider =
    NotifierProvider<FlightsBookingDraftNotifier, FlightsBookingDraftModel>(
  FlightsBookingDraftNotifier.new,
);

class FlightsBookingDraftNotifier extends Notifier<FlightsBookingDraftModel> {
  @override
  FlightsBookingDraftModel build() {

    return const FlightsBookingDraftModel();
  }

  @override
  set state(FlightsBookingDraftModel value) {

    super.state = value;
  }

  /// Change the trip type (One-way, Round-trip, Multi-city).
  void setTripType(FlightTripType tripType) {
    var segments = List<FlightRouteSegment>.from(state.segments);

    switch (tripType) {
      case FlightTripType.oneWay:
        // Keep only the first segment
        if (segments.length > 1) {
          segments = [segments.first];
        }
        break;
      case FlightTripType.roundTrip:
        // Ensure at least two segments exist
        if (segments.isEmpty) {
          segments = [
            const FlightRouteSegmentModel(),
            const FlightRouteSegmentModel(),
          ];
        } else if (segments.length == 1) {
          final first = segments.first;
          segments.add(FlightRouteSegmentModel(
            origin: first.destination,
            destination: first.origin,
          ));
        } else if (segments.length > 2) {
          segments = segments.sublist(0, 2);
        }
        break;
      case FlightTripType.multiCity:
        // Ensure at least one segment exists
        if (segments.isEmpty) {
          segments = [const FlightRouteSegmentModel()];
        }
        break;
    }

    state = state.copyWith(
      tripType: tripType,
      segments: segments,
    );
  }

  /// Set the origin for the primary segment.
  void setOrigin(CatalogAirportSuggestion place) {
    final segments = List<FlightRouteSegment>.from(state.segments);
    if (segments.isEmpty) {
      segments.add(FlightRouteSegmentModel(origin: place));
    } else {
      final current = segments[0] as FlightRouteSegmentModel;
      segments[0] = current.copyWith(origin: place);
    }
    state = state.copyWith(segments: segments);
  }

  /// Set the destination for the primary segment.
  void setDestination(CatalogAirportSuggestion place) {
    final segments = List<FlightRouteSegment>.from(state.segments);
    if (segments.isEmpty) {
      segments.add(FlightRouteSegmentModel(destination: place));
    } else {
      final current = segments[0] as FlightRouteSegmentModel;
      segments[0] = current.copyWith(destination: place);
    }
    state = state.copyWith(segments: segments);
  }

  /// Swap the primary origin and destination.
  void swapOriginDestination() {
    if (state.segments.isEmpty) return;
    final first = state.segments[0] as FlightRouteSegmentModel;
    final currentOrigin = first.origin;
    final currentDestination = first.destination;

    final segments = List<FlightRouteSegment>.from(state.segments);
    segments[0] = first.copyWith(
      origin: currentDestination,
      destination: currentOrigin,
    );
    state = state.copyWith(segments: segments);
  }

  /// Set the departure date for the primary segment.
  void setDepartureDate(DateTime date) {
    final segments = List<FlightRouteSegment>.from(state.segments);
    if (segments.isEmpty) {
      segments.add(FlightRouteSegmentModel(departureDate: date));
    } else {
      final current = segments[0] as FlightRouteSegmentModel;
      segments[0] = current.copyWith(departureDate: date);
    }
    state = state.copyWith(segments: segments);
  }

  /// Set the return date (adds or updates the second segment for round trips).
  void setReturnDate(DateTime date) {
    final segments = List<FlightRouteSegment>.from(state.segments);
    
    // Ensure we have a first segment to copy origin/destination from
    if (segments.isEmpty) return; 
    
    final first = segments[0];

    if (segments.length == 1) {
      // Create the return segment by reversing origin/destination
      segments.add(
        FlightRouteSegmentModel(
          origin: first.destination,
          destination: first.origin,
          departureDate: date,
        ),
      );
    } else {
      // Update existing return segment
      final current = segments[1] as FlightRouteSegmentModel;
      segments[1] = current.copyWith(departureDate: date);
    }
    state = state.copyWith(segments: segments);
  }

  /// Update passengers configuration.
  void setPassengers({int? adults, int? children, int? infants}) {
    state = state.copyWith(
      adultCount: adults,
      childCount: children,
      infantCount: infants,
    );
  }

  /// Update cabin class.
  void setCabinClass(FlightCabinClass cabinClass) {
    state = state.copyWith(cabinClass: cabinClass);
  }

  /// Replace the entire segment list (useful for complex Multi-city edits).
  void setSegments(List<FlightRouteSegment> segments) {
    state = state.copyWith(segments: segments);
  }

  /// Add a new empty segment for Multi-city.
  void addMultiCitySegment() {
    final segments = List<FlightRouteSegment>.from(state.segments);
    CatalogAirportSuggestion? nextOrigin;
    if (segments.isNotEmpty) {
      nextOrigin = segments.last.destination;
    }
    segments.add(FlightRouteSegmentModel(origin: nextOrigin));
    state = state.copyWith(segments: segments);
  }

  /// Update a specific segment in a Multi-city trip.
  void updateMultiCitySegment(
    int index, {
    CatalogAirportSuggestion? origin,
    CatalogAirportSuggestion? destination,
    DateTime? departureDate,
  }) {
    if (index < 0 || index >= state.segments.length) return;
    final segments = List<FlightRouteSegment>.from(state.segments);
    final current = segments[index] as FlightRouteSegmentModel;
    segments[index] = current.copyWith(
      origin: origin ?? current.origin,
      destination: destination ?? current.destination,
      departureDate: departureDate ?? current.departureDate,
    );
    state = state.copyWith(segments: segments);
  }

  /// Remove a segment from Multi-city (minimum 1 segment required).
  void removeMultiCitySegment(int index) {
    if (state.segments.length <= 1) return;
    final segments = List<FlightRouteSegment>.from(state.segments);
    segments.removeAt(index);
    state = state.copyWith(segments: segments);
  }

  /// Sets the currently selected flight offer.
  void setSelectedFlightOffer(FlightOffer? offer) {
    state = state.copyWith(
      selectedOffer: offer,
      // If setting to null or a new offer, we might want to reset selectedVariant as well
      clearSelection: offer == null,
    );
  }

  /// Sets the currently selected fare variant of the selected offer.
  void setSelectedFlightFareVariant(FlightFareVariant? variant) {
    state = state.copyWith(selectedVariant: variant);
  }

  /// Clears the flight and fare selections.
  void clearFlightSelections() {
    state = state.copyWith(clearSelection: true);
  }
}
