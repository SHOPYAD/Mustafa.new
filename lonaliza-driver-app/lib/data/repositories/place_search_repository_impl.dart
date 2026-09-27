import '../../core/network/app_dio.dart';
import '../../domain/entities/place_search_hit.dart';
import '../../domain/repositories/place_search_repository.dart';
import '../remote/place_search_remote_datasource.dart';

/// [PlaceSearchRemoteDataSource] is built from [AppDioClient].
final class PlaceSearchRepositoryImpl implements PlaceSearchRepository {
  PlaceSearchRepositoryImpl(AppDioClient client) : _remote = PlaceSearchRemoteDataSource(client);

  final PlaceSearchRemoteDataSource _remote;

  @override
  Future<List<PlaceSearchHit>> searchPlaces(
    String query, {
    int limit = 0,
  }) async {
    final q = query.trim();
    if (q.isEmpty) return const [];

    final models = await _remote.searchNominatim(
      q,
      limit: limit,
    );
    return List<PlaceSearchHit>.from(models);
  }
}
