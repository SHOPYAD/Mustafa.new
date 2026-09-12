import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';

import '../../../domain/entities/flights/catalog_location_suggestion.dart';
import '../features/flights/providers/flight_repository_provider.dart';

/// Provider for flight specific catalog location suggestions search.
final flightsPlaceSearchNotifierProvider = AsyncNotifierProvider.autoDispose<
    FlightsPlaceSearchNotifier, List<CatalogLocationSuggestion>>(
  FlightsPlaceSearchNotifier.new,
);

class FlightsPlaceSearchNotifier
    extends AsyncNotifier<List<CatalogLocationSuggestion>> {
  int _generation = 0;
  bool _searchInFlight = false;
  String? _searchInFlightFor;
  CancelToken? _cancelToken;

  @override
  Future<List<CatalogLocationSuggestion>> build() async {
    ref.onDispose(() {
      _cancelToken?.cancel();
    });
    return const [];
  }

  Future<void> search(String query, {String? locale}) async {
    final q = query.trim();
    if (q.isEmpty || q.length < 2) {
      _generation++;
      _searchInFlight = false;
      _searchInFlightFor = null;
      _cancelToken?.cancel();
      _cancelToken = null;
      state = const AsyncData([]);
      return;
    }

    if (_searchInFlight && _searchInFlightFor == q) {
      return;
    }

    final gen = ++_generation;
    _searchInFlight = true;
    _searchInFlightFor = q;
    state = const AsyncLoading();

    _cancelToken?.cancel();
    _cancelToken = CancelToken();

    try {
      final repository = ref.read(flightRepositoryProvider);
      final results = await repository.searchLocations(
        q,
        locale: locale,
        cancelToken: _cancelToken,
      );

      if (!ref.mounted || gen != _generation) return;
      state = AsyncData(results);
    } catch (e, st) {
      if (!ref.mounted || gen != _generation) return;
      if (e is DioException && e.type == DioExceptionType.cancel) {
        return;
      }
      state = AsyncError(e, st);
    } finally {
      if (gen == _generation) {
        _searchInFlight = false;
        _searchInFlightFor = null;
      }
    }
  }
}
