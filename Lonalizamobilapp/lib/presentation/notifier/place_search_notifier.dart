import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/entities/place_search_hit.dart';
import '../providers/place_search_providers.dart';

/// Hotel destination search: async list + stale-response guard.
final placeSearchNotifierProvider =
    AsyncNotifierProvider.autoDispose<PlaceSearchNotifier, List<PlaceSearchHit>>(
  PlaceSearchNotifier.new,
);

class PlaceSearchNotifier extends AsyncNotifier<List<PlaceSearchHit>> {
  int _generation = 0;
  bool _searchInFlight = false;
  String? _searchInFlightFor;

  @override
  Future<List<PlaceSearchHit>> build() async => const [];

  /// Debounce should be applied by the caller (e.g. sheet timer).
  Future<void> search(String query) async {
    final q = query.trim();
    if (q.isEmpty || q.length < 3) {
      _generation++;
      _searchInFlight = false;
      _searchInFlightFor = null;
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

    try {
      final next = await AsyncValue.guard(() async {
        final repo = ref.read(placeSearchRepositoryProvider);
        return repo.searchPlaces(q);
      });

      if (!ref.mounted || gen != _generation) return;
      state = next;
    } finally {
      if (gen == _generation) {
        _searchInFlight = false;
        _searchInFlightFor = null;
      }
    }
  }
}
