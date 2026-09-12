import 'dart:async';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:liotrip/domain/entities/flights/flight_offer.dart';
import 'package:liotrip/core/constants/app_constants.dart';
import 'airlines_notifier.dart';
import 'flight_repository_provider.dart';
import 'flights_booking_draft_notifier.dart';
import 'loyalty_notifier.dart';
import 'flights_filter_provider.dart';

final flightSearchStateProvider =
    NotifierProvider<FlightSearchNotifier, AsyncValue<FlightSearchResponse>>(
      FlightSearchNotifier.new,
    );

class FlightSearchNotifier extends Notifier<AsyncValue<FlightSearchResponse>> {
  CancelToken? _cancelToken;

  @override
  AsyncValue<FlightSearchResponse> build() {
    return const AsyncLoading();
  }

  void cancelSearch() {
    _cancelToken?.cancel('تم إلغاء البحث بسبب خروج المستخدم من الصفحة');
    ref.read(airlinesNotifierProvider.notifier).cancel();
  }

  void resetToLoading() {
    state = const AsyncLoading();
  }

  Future<void> search() async {
    if (_cancelToken != null && !_cancelToken!.isCancelled) {
      _cancelToken!.cancel();
    }
    _cancelToken = CancelToken();

    final draft = ref.read(flightsBookingDraftProvider);
    final repository = ref.read(flightRepositoryProvider);

    state = const AsyncLoading();

    try {
      final response = await repository.searchFlights(
        draft,
        cancelToken: _cancelToken,
      );

      // Seed the AirlinesNotifier cache directly from the search response
      if (response.airlines.isNotEmpty) {
        ref
            .read(airlinesNotifierProvider.notifier)
            .setAirlines(response.airlines);
      } else {
        ref.read(airlinesNotifierProvider.notifier).setAirlines([]);
      }

      // Seed the Loyalty Providers directly with safety checks
      try {
        final searchStrip = response.loyalty.searchStrip;
        ref
            .read(loyaltySearchStripProvider.notifier)
            .set(searchStrip.isNotEmpty ? searchStrip : []);

        final resultCardBadge = response.loyalty.resultCardBadge;
        ref
            .read(loyaltyResultCardBadgeProvider.notifier)
            .set(resultCardBadge.isNotEmpty ? resultCardBadge : []);
      } catch (_) {
        // Fallback in case of parsing errors or null values bypassing null-safety
        ref.read(loyaltySearchStripProvider.notifier).set([]);
        ref.read(loyaltyResultCardBadgeProvider.notifier).set([]);
      }

      // Mark the search as fully completed
      state = AsyncData(response);

      // Reset the countdown timer whenever a search successfully completes
      ref.read(searchCountdownProvider.notifier).reset();
    } catch (e, stackTrace) {
      if (e is DioException && e.type == DioExceptionType.cancel) return;
      state = AsyncError(e, stackTrace);
    }
  }
}

// Global, robust, and page-lifecycle-aware countdown timer provider
final searchCountdownProvider =
    NotifierProvider.autoDispose<SearchCountdownNotifier, int>(
      SearchCountdownNotifier.new,
    );

class SearchCountdownNotifier extends Notifier<int> {
  Timer? _timer;

  @override
  int build() {
    ref.onDispose(() {
      _timer?.cancel();
    });
    _startTimer();
    return AppConstants.flightSearchTimeoutSeconds;
  }

  void _startTimer() {
    _timer?.cancel();
    state = AppConstants.flightSearchTimeoutSeconds;
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (state > 0) {
        state--;
        if (state == 0) {
          _timer?.cancel();
        }
      }
    });
  }

  void reset() {
    _startTimer();
  }

  void triggerRefresh() {
    _startTimer();
    ref.read(flightSearchStateProvider.notifier).search();
  }
}
