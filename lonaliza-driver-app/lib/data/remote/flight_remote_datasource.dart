import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';

import '../../core/constants/app_constants.dart';
import '../../core/error/exception_handler.dart';
import '../../core/error/exceptions.dart';
import '../../core/network/app_dio.dart';
import '../../core/network/n8n_response_normalizer.dart';
import '../models/flights/flight_offer_model.dart';
import '../models/flights/flights_booking_draft_model.dart';
import '../../domain/entities/flights/flight_search_loyalty.dart';
import 'package:lonaliza_driver/domain/entities/flights/flight_offer.dart';
import 'package:lonaliza_driver/domain/entities/flights/flight_price_confirm_result.dart';
import '../models/flights/flight_price_confirm_result_model.dart';

import '../models/flights/catalog_location_suggestion_model.dart';

/// Raw HTTP access to the flight search webhook.
final class FlightRemoteDataSource {
  FlightRemoteDataSource(this._client);

  final AppDioClient _client;
  CancelToken? _locationSearchCancel;

  /// Calls the flight search webhook via GET and returns the response model.
  /// Throws [AppException] via [ExceptionHandler] if it fails.
  Future<FlightSearchResponseModel> searchFlights(
    FlightsBookingDraftModel draft, {
    CancelToken? cancelToken,
  }) async {
    try {
      final response = await _client.get<dynamic>(
        AppConstants.flightSearchUrl,
        queryParameters: draft.toJson(),
        cancelToken: cancelToken,
        options: Options(responseType: ResponseType.json),
        includeAuth: false,
        receiveTimeout: const Duration(seconds: 300),
      );

      // Extract List[0].data.searchFlights using the shared normalizer
      final sf = N8nResponseNormalizer.extractOr<Map>(
        response.data,
        'searchFlights',
        const <String, dynamic>{},
      );

      final parsedResponse = FlightSearchResponseModel.fromJson(
        sf.cast<String, dynamic>(),
      );

      return parsedResponse;
    } on DioException catch (e) {
      if (e.type == DioExceptionType.cancel) {
        return const FlightSearchResponseModel(
          source: '',
          meta: FlightSearchMetaModel(
            totalResults: 0,
            searchDurationMs: 0,
            traceId: '',
          ),
          offers: [],
          airlines: [],
          loyalty: FlightSearchLoyalty.empty(),
        );
      }
      ExceptionHandler.handleDioException(e);
    } catch (e) {
      ExceptionHandler.handleGenericException(e);
    }
  }

  /// Searches airports and cities in the catalog.
  /// Throws [AppException] via [ExceptionHandler] if it fails.
  Future<List<CatalogLocationSuggestionModel>> searchLocations(
    String query, {
    String? locale,
    CancelToken? cancelToken,
  }) async {
    final q = query.trim();
    if (q.length < 2) {
      _locationSearchCancel?.cancel();
      _locationSearchCancel = null;
      return const [];
    }

    try {
      if (cancelToken == null) {
        _locationSearchCancel?.cancel();
        _locationSearchCancel = CancelToken();
      }
      final effectiveToken = cancelToken ?? _locationSearchCancel!;

      final response = await _client.get<dynamic>(
        AppConstants.catalogLocationSearchUrl,
        queryParameters: <String, dynamic>{
          'q': q,
          if (locale != null) 'locale': locale,
        },
        options: Options(responseType: ResponseType.json),
        cancelToken: effectiveToken,
        includeAuth: false,
        receiveTimeout: const Duration(seconds: 8),
      );

      // Extract raw suggestions list using response normalizer
      final listData = N8nResponseNormalizer.extractOr<List>(
        response.data,
        'catalogLocationSuggestions',
        const [],
      );

      return listData
          .whereType<Map<dynamic, dynamic>>()
          .map(
            (m) => CatalogLocationSuggestionModel.fromJson(
              Map<String, dynamic>.from(m),
            ),
          )
          .toList();
    } on DioException catch (e) {
      if (e.type == DioExceptionType.cancel) return const [];
      ExceptionHandler.handleDioException(e);
    } catch (e) {
      ExceptionHandler.handleGenericException(e);
    }
  }

  /// Calls the flight price confirmation webhook and returns the updated FlightOfferModel.
  /// Throws [AppException] via [ExceptionHandler] if it fails.
  /// Calls the flight price confirmation webhook and returns the FlightPriceConfirmResult.
  /// Throws [AppException] via [ExceptionHandler] if it fails.
  Future<FlightPriceConfirmResult> confirmFlightPrice({
    required FlightOffer offer,
    FlightFareVariant? variant,
    CancelToken? cancelToken,
  }) async {
    try {
      final response = await _client.get<dynamic>(
        AppConstants.flightConfirmPriceUrl,
        queryParameters: <String, dynamic>{
          'offerCacheId': variant?.bookingOfferCacheId ?? offer.id,
          'providerCode': offer.providerCode ?? 'amadeus-air',
          if (variant?.fareKey != null) 'providerFareKey': variant!.fareKey,
          'currency': variant?.pricing.currency ?? offer.pricing.currency,
        },
        cancelToken: cancelToken,
        options: Options(responseType: ResponseType.json),
        includeAuth: false,
        receiveTimeout: const Duration(seconds: 30),
      );

      // Extract verified verifyFlightOfferPrice using the shared normalizer
      final fo = N8nResponseNormalizer.extractOr<Map>(
        response.data,
        'verifyFlightOfferPrice',
        const <String, dynamic>{},
      );

      final parsedResponse = FlightPriceConfirmResultModel.fromJson(
        fo.cast<String, dynamic>(),
      );

      return parsedResponse;
    } on DioException catch (e) {
      if (e.type == DioExceptionType.cancel) {
        throw e; // Let the caller handle cancellation
      }
      ExceptionHandler.handleDioException(e);
    } catch (e) {
      ExceptionHandler.handleGenericException(e);
    }
  }
}
