import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/extensions/context_l10n.dart';

import '../../../../domain/entities/flights/flight_offer.dart';
import '../../../../domain/entities/flights/catalog_airline.dart';
import '../providers/airlines_notifier.dart';
import '../providers/flight_search_results_provider.dart';
import '../providers/flights_booking_draft_notifier.dart';
import '../providers/flights_filter_provider.dart';
import '../../../../domain/entities/flights/catalog_location_suggestion.dart';
import '../widgets/search/flights_search_app_bar.dart';
import '../widgets/search/flights_search_filters_row.dart';
import '../widgets/search/flights_search_results_list.dart';
import '../widgets/search/flights_search_skeleton.dart';
import '../widgets/search/flights_search_loading_banner.dart';
import '../widgets/search/flights_search_timeout_dialog.dart';
import '../../../widgets/app_error_view.dart';

class FlightsSearchResultsPage extends ConsumerStatefulWidget {
  const FlightsSearchResultsPage({super.key});

  @override
  ConsumerState<FlightsSearchResultsPage> createState() =>
      _FlightsSearchResultsPageState();
}

class _FlightsSearchResultsPageState
    extends ConsumerState<FlightsSearchResultsPage> {
  late final FlightSearchNotifier _notifier;
  static const _pageSize = 10;
  int _displayCount = _pageSize;
  bool _isTimeoutDialogOpen = false;

  void _showTimeoutDialog() {
    if (_isTimeoutDialogOpen) return;
    _isTimeoutDialogOpen = true;
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const FlightsSearchTimeoutDialog(),
    ).then((_) {
      _isTimeoutDialogOpen = false;
    });
  }

  @override
  void initState() {
    super.initState();
    _notifier = ref.read(flightSearchStateProvider.notifier);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _notifier.search();
    });
  }

  @override
  void dispose() {
    _notifier.cancelSearch();
    super.dispose();
  }

  String _formatDuration(int totalSeconds) {
    final minutes = totalSeconds ~/ 60;
    final seconds = totalSeconds % 60;
    final minutesStr = minutes.toString().padLeft(2, '0');
    final secondsStr = seconds.toString().padLeft(2, '0');
    return '$minutesStr:$secondsStr';
  }

  @override
  Widget build(BuildContext context) {
    final flightsAsync = ref.watch(filteredFlightsProvider);
    final airlinesAsync = ref.watch(airlinesNotifierProvider);
    final draft = ref.watch(flightsBookingDraftProvider);
    final isAr = Localizations.localeOf(context).languageCode == 'ar';

    // Watch the global, widget-lifecycle-immune Riverpod countdown provider
    final secondsRemaining = ref.watch(searchCountdownProvider);

    // Listen to countdown timer and show dialog when it reaches 0
    ref.listen<int>(searchCountdownProvider, (previous, next) {
      if (next == 0 &&
          mounted &&
          (ModalRoute.of(context)?.isCurrent ?? false)) {
        _showTimeoutDialog();
      }
    });

    // Also check on returning/rebuilding: if timer is already 0 and page is current, show the dialog
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted &&
          (ModalRoute.of(context)?.isCurrent ?? false) &&
          ref.read(searchCountdownProvider) == 0) {
        _showTimeoutDialog();
      }
    });

    final originCityName = draft.origin != null
        ? (isAr &&
                  draft.origin!.nameAr != null &&
                  draft.origin!.nameAr!.isNotEmpty
              ? draft.origin!.nameAr!
              : draft.origin!.city)
        : '';

    final originCode = draft.origin?.iata ?? '';

    final destCityName = draft.destination != null
        ? (isAr &&
                  draft.destination!.nameAr != null &&
                  draft.destination!.nameAr!.isNotEmpty
              ? draft.destination!.nameAr!
              : draft.destination!.city)
        : '';

    final destCode = draft.destination?.iata ?? '';

    final responseValue = flightsAsync.value;
    final totalResults = responseValue?.offers.length ?? 0;
    final showBottomBar = flightsAsync is AsyncData && totalResults > 0;
    final isLoading = flightsAsync is AsyncLoading;

    return Scaffold(
      backgroundColor: const Color(0xFFF3F4F6),
      appBar: FlightsSearchAppBar(
        originCity: originCityName,
        originCode: originCode,
        destinationCity: destCityName,
        destinationCode: destCode,
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: EdgeInsets.zero,
              children: [
                const FlightsSearchFiltersRow(),
                const SizedBox(height: 12),
                Padding(
                  padding: const EdgeInsets.fromLTRB(12, 0, 12, 16),
                  child: _buildBody(flightsAsync, airlinesAsync),
                ),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: isLoading
          ? const FlightsSearchLoadingBanner()
          : (showBottomBar
                ? Container(
                    color: const Color(0xFFF3F4F6),
                    child: SafeArea(
                      child: Container(
                        margin: const EdgeInsets.fromLTRB(12, 0, 12, 12),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 12,
                        ),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [
                              Color(0xFF0F172A),
                              Color(0xFF1E1B4B),
                              Color(0xFF312E81),
                            ],
                            begin: Alignment.centerLeft,
                            end: Alignment.centerRight,
                          ),
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.15),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            // Left: Icon + Text
                            Expanded(
                              child: Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(4),
                                    decoration: BoxDecoration(
                                      color: Colors.white.withOpacity(0.15),
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(
                                      Icons.check_rounded,
                                      color: Colors.white,
                                      size: 14,
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      isAr
                                          ? 'تم العثور على $totalResults نتائج • استمتع بحجزك'
                                          : 'Found $totalResults results • Enjoy your booking',
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 12,
                                        fontWeight: FontWeight.w700,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                            ),

                            // Right: Timer + Refresh
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  isAr
                                      ? 'تحديث خلال ${_formatDuration(secondsRemaining)}'
                                      : 'refresh in ${_formatDuration(secondsRemaining)}',
                                  style: TextStyle(
                                    color: Colors.white.withOpacity(0.9),
                                    fontSize: 11.5,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                GestureDetector(
                                  onTap: () {
                                    ref
                                        .read(searchCountdownProvider.notifier)
                                        .triggerRefresh();
                                  },
                                  child: Container(
                                    padding: const EdgeInsets.all(4),
                                    decoration: BoxDecoration(
                                      color: Colors.white.withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: const Icon(
                                      Icons.refresh_rounded,
                                      color: Colors.white,
                                      size: 16,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),
                  )
                : null),
    );
  }

  Widget _buildBody(
    AsyncValue<FlightSearchResponse> flightsAsync,
    AsyncValue<Map<String, CatalogAirline>> airlinesAsync,
  ) {
    if (flightsAsync is AsyncError) {
      return AppErrorView(
        error: (flightsAsync as AsyncError).error,
        onRetry: () => ref.read(flightSearchStateProvider.notifier).search(),
      );
    }

    if (flightsAsync is AsyncLoading) {
      return const FlightsSearchSkeletonList();
    }

    final response = (flightsAsync as AsyncData<FlightSearchResponse>).value;
    final airlinesMap = airlinesAsync.value ?? const {};
    final allOffers = response.offers;

    if (allOffers.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Text(context.l10n.noFlightsAvailable),
        ),
      );
    }

    final visible = allOffers.take(_displayCount).toList();
    final hasMore = _displayCount < allOffers.length;

    return Column(
      children: [
        FlightsSearchResultsList(offers: visible, airlinesMap: airlinesMap),
        if (hasMore)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 16),
            child: OutlinedButton.icon(
              onPressed: () => setState(() => _displayCount += _pageSize),
              icon: const Icon(Icons.expand_more_rounded),
              label: Text(
                context.l10n.showMoreFlights(allOffers.length - _displayCount),
              ),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 12,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
            ),
          ),
      ],
    );
  }
}
