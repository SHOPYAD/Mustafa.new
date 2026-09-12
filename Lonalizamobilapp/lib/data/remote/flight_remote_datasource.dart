import 'package:dio/dio.dart';

import '../../core/constants/app_constants.dart';
import '../../core/error/exception_handler.dart';
import '../../core/network/app_dio.dart';
import '../models/flights/flight_offer_model.dart';
import '../models/flights/flights_booking_draft_model.dart';
import '../../domain/entities/flights/flight_search_loyalty.dart';
import 'package:liotrip/domain/entities/flights/flight_offer.dart';
import 'package:liotrip/domain/entities/flights/flight_price_confirm_result.dart';
import '../models/flights/flight_price_confirm_result_model.dart';

import '../models/flights/catalog_location_suggestion_model.dart';

final class FlightRemoteDataSource {
  FlightRemoteDataSource(this._client);

  final AppDioClient _client;
  CancelToken? _locationSearchCancel;

  Future<FlightSearchResponseModel> searchFlights(
    FlightsBookingDraftModel draft, {
    CancelToken? cancelToken,
  }) async {
    try {
      final origin = draft.origin?.iata.split(',').first.trim() ?? '';
      final destination = draft.destination?.iata.split(',').first.trim() ?? '';
      final date = draft.departureDate;
      final dateIso = date == null
          ? ''
          : '${date.year.toString().padLeft(4, '0')}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';
      final returnDate = draft.returnDate;
      final returnIso = returnDate == null
          ? null
          : '${returnDate.year.toString().padLeft(4, '0')}-${returnDate.month.toString().padLeft(2, '0')}-${returnDate.day.toString().padLeft(2, '0')}';

      final response = await _client.get<dynamic>(
        AppConstants.flightSearchUrl,
        queryParameters: <String, dynamic>{
          'origin': origin,
          'destination': destination,
          'date': dateIso,
          if (returnIso != null) 'returnDate': returnIso,
          'adults': draft.adultCount,
          'children': draft.childCount,
          'infants': draft.infantCount,
          'cabinClass': draft.cabinClass.name,
        },
        cancelToken: cancelToken,
        options: Options(responseType: ResponseType.json),
        includeAuth: false,
        receiveTimeout: const Duration(seconds: 300),
      );

      final raw = response.data;
      if (raw is Map) {
        return FlightSearchResponseModel.fromJson(Map<String, dynamic>.from(raw));
      }
      return const FlightSearchResponseModel(
        source: 'lonaliza',
        meta: FlightSearchMetaModel(totalResults: 0, searchDurationMs: 0, traceId: ''),
        offers: [],
        airlines: [],
        loyalty: FlightSearchLoyalty.empty(),
      );
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
        AppConstants.placesSearchUrl,
        queryParameters: <String, dynamic>{
          'type': 'airports',
          'q': q,
          if (locale != null) 'locale': locale,
        },
        options: Options(responseType: ResponseType.json),
        cancelToken: effectiveToken,
        includeAuth: false,
        receiveTimeout: const Duration(seconds: 8),
      );

      final raw = response.data;
      final listData = raw is Map ? (raw['locations'] as List? ?? const []) : const [];

      return listData
          .whereType<Map>()
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

  Future<FlightPriceConfirmResult> confirmFlightPrice({
    required FlightOffer offer,
    FlightFareVariant? variant,
    CancelToken? cancelToken,
  }) async {
    try {
      final response = await _client.get<dynamic>(
        AppConstants.flightConfirmPriceUrl,
        queryParameters: <String, dynamic>{
          'itineraryId': variant?.bookingOfferCacheId ?? offer.id,
          'quotedPrice': variant?.pricing.total ?? offer.pricing.total,
          'currency': variant?.pricing.currency ?? offer.pricing.currency,
        },
        cancelToken: cancelToken,
        options: Options(responseType: ResponseType.json),
        includeAuth: false,
        receiveTimeout: const Duration(seconds: 30),
      );

      final raw = response.data;
      final map = raw is Map ? Map<String, dynamic>.from(raw) : <String, dynamic>{};
      final result = FlightPriceConfirmResultModel.fromJson(map);
      if (result.verifiedTotal <= 0) {
        throw Exception('quote_failed');
      }
      return result;
    } on DioException catch (e) {
      if (e.type == DioExceptionType.cancel) {
        throw e;
      }
      ExceptionHandler.handleDioException(e);
    } catch (e) {
      ExceptionHandler.handleGenericException(e);
    }
  }
}
