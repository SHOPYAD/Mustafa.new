import 'package:dio/dio.dart';

import '../entities/flights/flight_offer.dart';
import '../entities/flights/catalog_location_suggestion.dart';
import '../entities/flights/flight_price_confirm_result.dart';
import '../../data/models/flights/flights_booking_draft_model.dart';

/// Interface for flight-related data operations.
abstract class FlightRepository {
  /// Searches for flights based on the provided [draft].
  /// Returns offers, airlines catalog, and loyalty promotions in one call.
  /// Provides an optional [cancelToken] to abort the request.
  Future<FlightSearchResponse> searchFlights(
    FlightsBookingDraftModel draft, {
    CancelToken? cancelToken,
  });

  /// Searches airports and cities in the catalog based on the [query].
  /// Provides an optional [locale] for translations and [cancelToken] to abort the request.
  Future<List<CatalogLocationSuggestion>> searchLocations(
    String query, {
    String? locale,
    CancelToken? cancelToken,
  });

  /// Confirms the current price and availability of a specific [offer] and its optional [variant] package.
  /// Provides an optional [cancelToken] to abort the request.
  Future<FlightPriceConfirmResult> confirmFlightPrice({
    required FlightOffer offer,
    FlightFareVariant? variant,
    CancelToken? cancelToken,
  });
}
