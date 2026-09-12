import 'package:dio/dio.dart';

import '../../core/constants/app_constants.dart';
import '../../core/error/exception_handler.dart';
import '../../core/network/app_dio.dart';
import '../models/place_search_hit_model.dart';

const int _placeSearchLimitMax = 50;

final class PlaceSearchRemoteDataSource {
  PlaceSearchRemoteDataSource(this._client);

  final AppDioClient _client;
  CancelToken? _searchCancel;

  Future<List<PlaceSearchHitModel>> searchNominatim(
    String query, {
    int limit = 0,
  }) async {
    final q = query.trim();
    if (q.length < 2) {
      _searchCancel?.cancel();
      _searchCancel = null;
      return const [];
    }

    try {
      _searchCancel?.cancel();
      _searchCancel = CancelToken();
      final token = _searchCancel!;
      final effectiveLimit = limit <= 0
          ? _placeSearchLimitMax
          : limit.clamp(1, _placeSearchLimitMax);

      final response = await _client.get<dynamic>(
        AppConstants.placesSearchUrl,
        queryParameters: <String, dynamic>{
          'type': 'hotels',
          'q': q,
          'limit': effectiveLimit.toString(),
        },
        options: Options(responseType: ResponseType.json),
        cancelToken: token,
        includeAuth: false,
        receiveTimeout: const Duration(seconds: 8),
      );

      final raw = response.data;
      final listData = raw is List
          ? raw
          : raw is Map
          ? (raw['places'] as List? ?? const [])
          : const [];

      return listData
          .whereType<Map>()
          .map((m) => PlaceSearchHitModel.fromJson(Map<String, dynamic>.from(m)))
          .toList();
    } on DioException catch (e) {
      if (e.type == DioExceptionType.cancel) return const [];
      ExceptionHandler.handleDioException(e);
    }
  }
}
