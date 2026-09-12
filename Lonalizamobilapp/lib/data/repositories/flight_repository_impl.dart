import 'package:dio/dio.dart';

import '../../domain/repositories/flight_repository.dart';
import '../../domain/entities/flights/flight_offer.dart';
import '../../domain/entities/flights/catalog_location_suggestion.dart';
import '../../domain/entities/flights/flight_price_confirm_result.dart';
import '../models/flights/flights_booking_draft_model.dart';
import '../remote/flight_remote_datasource.dart';
import '../../core/network/app_dio.dart';

/// Implementation of [FlightRepository] using [FlightRemoteDataSource].
final class FlightRepositoryImpl implements FlightRepository {
  FlightRepositoryImpl(AppDioClient client)
    : _remote = FlightRemoteDataSource(client);

  final FlightRemoteDataSource _remote;

  @override
  Future<FlightSearchResponse> searchFlights(
    FlightsBookingDraftModel draft, {
    CancelToken? cancelToken,
  }) async {
    return await _remote.searchFlights(draft, cancelToken: cancelToken);
  }

  @override
  Future<List<CatalogLocationSuggestion>> searchLocations(
    String query, {
    String? locale,
    CancelToken? cancelToken,
  }) async {
    return await _remote.searchLocations(
      query,
      locale: locale,
      cancelToken: cancelToken,
    );
  }

  @override
  Future<FlightPriceConfirmResult> confirmFlightPrice({
    required FlightOffer offer,
    FlightFareVariant? variant,
    CancelToken? cancelToken,
  }) async {
    return await _remote.confirmFlightPrice(
      offer: offer,
      variant: variant,
      cancelToken: cancelToken,
    );
  }
}
