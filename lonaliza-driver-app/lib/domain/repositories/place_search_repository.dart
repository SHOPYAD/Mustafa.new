import '../entities/place_search_hit.dart';

/// Looks up cities / regions / countries by free text (e.g. OpenStreetMap data).
abstract class PlaceSearchRepository {
  /// Returns an empty list when [query] is blank or no matches.
  ///
  /// [limit] `0` means as many results as the upstream API allows per request.
  /// Language for upstream APIs is set on [Dio] ([Accept-Language] from app locale).
  Future<List<PlaceSearchHit>> searchPlaces(
    String query, {
    int limit = 0,
  });
}
