import 'package:dio/dio.dart';

import '../../core/constants/app_constants.dart';
import '../../core/error/exception_handler.dart';
import '../../core/network/app_dio.dart';
import '../models/place_search_hit_model.dart';

/// Nominatim search caps results per request (public instance: 50).
const int _nominatimSearchLimitMax = 50;

/// Raw HTTP access to a geocode search API (default: Nominatim).
///
/// Cancels any in-flight Nominatim search on this instance when a new [searchNominatim] runs.
final class PlaceSearchRemoteDataSource {
  PlaceSearchRemoteDataSource(this._client);

  final AppDioClient _client;
  CancelToken? _searchCancel;

  /// Calls Nominatim `search` and returns models. Throws [AppException] via [ExceptionHandler].
  Future<List<PlaceSearchHitModel>> searchNominatim(
    String query, {
    int limit = 0,
  }) async {
    final q = query.trim();
    if (q.length < 3) {
      _searchCancel?.cancel();
      _searchCancel = null;
      return const [];
    }

    try {
      _searchCancel?.cancel();
      _searchCancel = CancelToken();
      final token = _searchCancel!;

      final effectiveLimit = limit <= 0
          ? _nominatimSearchLimitMax
          : limit.clamp(1, _nominatimSearchLimitMax);

      final response = await _client.get<dynamic>(
        AppConstants.nominatimSearchUrl,
        queryParameters: <String, dynamic>{
          'q': q,
          'format': 'json',
          'addressdetails': '1',
          'limit': effectiveLimit.toString(),
        },
        options: Options(responseType: ResponseType.json),
        cancelToken: token,
        includeAuth: false,
        receiveTimeout: const Duration(seconds: 5),
      );

      // بما أننا نعلم يقيناً أن الداتا دائماً عبارة عن قائمة (List)
      final List<dynamic> listData = response.data as List<dynamic>? ?? [];

      return listData
          .whereType<Map<dynamic, dynamic>>()
          .map((m) => PlaceSearchHitModel.fromJson(Map<String, dynamic>.from(m)))
          .toList();
    } on DioException catch (e) {
      if (e.type == DioExceptionType.cancel) return const [];
      ExceptionHandler.handleDioException(e);
    }
  }
}
