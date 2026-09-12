import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:liotrip/presentation/features/flights/providers/flights_filter_provider.dart';
import 'package:liotrip/presentation/features/flights/providers/flight_search_results_provider.dart';
import 'flights_filters_sheet.dart';

class ActiveFilterChip {
  ActiveFilterChip({
    required this.label,
    required this.onClear,
  });

  final String label;
  final VoidCallback onClear;
}

class FlightsSearchFiltersRow extends ConsumerWidget {
  const FlightsSearchFiltersRow({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final filter = ref.watch(flightsFilterProvider);
    final notifier = ref.read(flightsFilterProvider.notifier);
    final isAr = Localizations.localeOf(context).languageCode == 'ar';
    final searchState = ref.watch(flightSearchStateProvider);

    double? defaultMinPrice;
    double? defaultMaxPrice;
    int? defaultMaxDuration;
    int? defaultMaxLayover;

    searchState.whenData((response) {
      if (response.offers.isNotEmpty) {
        final prices = response.offers.map((o) => o.displayPrice).toList();
        defaultMinPrice = prices.reduce((a, b) => a < b ? a : b);
        defaultMaxPrice = prices.reduce((a, b) => a > b ? a : b);
        if (defaultMinPrice == defaultMaxPrice) {
          defaultMaxPrice = defaultMinPrice! + 100;
        }

        final allDurations = response.offers
            .expand((o) => o.itineraries.map((it) => it.effectiveDurationMinutes))
            .toList();
        if (allDurations.isNotEmpty) {
          final maxDur = allDurations.reduce((a, b) => a > b ? a : b);
          defaultMaxDuration = maxDur > 360 ? maxDur : 360;
        }

        final allLayovers = response.offers
            .expand((o) => o.itineraries.map((it) => it.maxLayoverMinutes))
            .toList();
        if (allLayovers.isNotEmpty) {
          final maxLay = allLayovers.reduce((a, b) => a > b ? a : b);
          defaultMaxLayover = maxLay > 240 ? maxLay : 240;
        } else {
          defaultMaxLayover = 240;
        }
      }
    });

    final activeChips = <ActiveFilterChip>[];

    // 1. Popular Filters
    if (filter.nonStopOnly) {
      activeChips.add(
        ActiveFilterChip(
          label: isAr ? 'رحلات مباشرة' : 'Direct flights only',
          onClear: () => notifier.updateFilter(filter.copyWith(nonStopOnly: false)),
        ),
      );
    }
    if (filter.oneStopMax) {
      activeChips.add(
        ActiveFilterChip(
          label: isAr ? 'ترانزيت محطة واحدة' : '1 stop max',
          onClear: () => notifier.updateFilter(filter.copyWith(oneStopMax: false)),
        ),
      );
    }
    if (filter.seats5PlusOnly) {
      activeChips.add(
        ActiveFilterChip(
          label: isAr ? '5+ مقاعد متوفرة' : 'Seats 5+ only',
          onClear: () => notifier.updateFilter(filter.copyWith(seats5PlusOnly: false)),
        ),
      );
    }
    if (filter.checkedBag20kgPlus) {
      activeChips.add(
        ActiveFilterChip(
          label: isAr ? 'حقيبة مسجلة 20كغ+' : 'Checked bag 20kg+',
          onClear: () => notifier.updateFilter(filter.copyWith(checkedBag20kgPlus: false)),
        ),
      );
    }
    if (filter.redEyeOnly) {
      activeChips.add(
        ActiveFilterChip(
          label: isAr ? 'رحلات ليلية' : 'Red-eye flights',
          onClear: () => notifier.updateFilter(filter.copyWith(redEyeOnly: false)),
        ),
      );
    }

    // 2. Price Filter (Only show chips if filters are active and differ from default limits)
    // Min Price Chip
    if (filter.minPrice != null && (defaultMinPrice == null || filter.minPrice!.round() > defaultMinPrice!.round())) {
      activeChips.add(
        ActiveFilterChip(
          label: isAr ? 'السعر ≥ \$${filter.minPrice!.round()}' : 'Price ≥ \$${filter.minPrice!.round()}',
          onClear: () => notifier.updateFilter(filter.clearMinPrice()),
        ),
      );
    }
    // Max Price Chip
    if (filter.maxPrice != null && (defaultMaxPrice == null || filter.maxPrice!.round() < defaultMaxPrice!.round())) {
      activeChips.add(
        ActiveFilterChip(
          label: isAr ? 'السعر ≤ \$${filter.maxPrice!.round()}' : 'Price ≤ \$${filter.maxPrice!.round()}',
          onClear: () => notifier.updateFilter(filter.clearMaxPrice()),
        ),
      );
    }

    // 3. Duration Filter (Only show chip if duration is active AND less than the default maximum duration)
    if (filter.durationMax != null && (defaultMaxDuration == null || filter.durationMax! < defaultMaxDuration!)) {
      final hours = filter.durationMax! ~/ 60;
      final mins = filter.durationMax! % 60;
      final durationStr = hours > 0 ? '${hours}h ${mins}m' : '${mins}m';
      activeChips.add(
        ActiveFilterChip(
          label: isAr ? 'المدة ≤ $durationStr' : 'Duration ≤ $durationStr',
          onClear: () => notifier.updateFilter(filter.clearDurationMax()),
        ),
      );
    }

    // 4. Layover Duration Filter (Only show chip if layover is active AND less than the default maximum layover)
    if (filter.layoverMaxMinutes != null && (defaultMaxLayover == null || filter.layoverMaxMinutes! < defaultMaxLayover!)) {
      final hours = filter.layoverMaxMinutes! ~/ 60;
      final mins = filter.layoverMaxMinutes! % 60;
      final layoverStr = hours > 0 ? '${hours}h ${mins}m' : '${mins}m';
      activeChips.add(
        ActiveFilterChip(
          label: isAr ? 'الترانزيت ≤ $layoverStr' : 'Layover ≤ $layoverStr',
          onClear: () => notifier.updateFilter(filter.clearLayoverMaxMinutes()),
        ),
      );
    }

    // 4.5. Sort Option Filter
    if (filter.sort != 'recommended') {
      String sortLabel = '';
      if (filter.sort == 'price_asc') {
        sortLabel = isAr ? 'السعر: من الأقل للأعلى' : 'Price: Low to High';
      } else if (filter.sort == 'price_desc') {
        sortLabel = isAr ? 'السعر: من الأعلى للأقل' : 'Price: High to Low';
      } else if (filter.sort == 'duration_asc') {
        sortLabel = isAr ? 'المدة: الأقصر أولاً' : 'Duration: Shortest';
      } else if (filter.sort == 'depart_asc') {
        sortLabel = isAr ? 'وقت المغادرة: الأبكر أولاً' : 'Departure: Earliest';
      }

      if (sortLabel.isNotEmpty) {
        activeChips.add(
          ActiveFilterChip(
            label: sortLabel,
            onClear: () => notifier.updateFilter(filter.copyWith(sort: 'recommended')),
          ),
        );
      }
    }

    // 5. Selected Airlines
    for (final airlineKey in filter.selectedAirlines) {
      final airlineName = airlineKey
          .split('_')
          .map((word) => word.isNotEmpty
              ? '${word[0].toUpperCase()}${word.substring(1)}'
              : '')
          .join(' ');
      activeChips.add(
        ActiveFilterChip(
          label: airlineName,
          onClear: () {
            final updated = Set<String>.from(filter.selectedAirlines)..remove(airlineKey);
            notifier.updateFilter(filter.copyWith(selectedAirlines: updated));
          },
        ),
      );
    }

    // 6. Selected Cabins
    for (final cabin in filter.selectedCabins) {
      final cabinName = cabin.isNotEmpty
          ? '${cabin[0].toUpperCase()}${cabin.substring(1)}'
          : '';
      activeChips.add(
        ActiveFilterChip(
          label: cabinName,
          onClear: () {
            final updated = Set<String>.from(filter.selectedCabins)..remove(cabin);
            notifier.updateFilter(filter.copyWith(selectedCabins: updated));
          },
        ),
      );
    }

    // 7. Depart Windows
    for (final window in filter.departWindows) {
      final label = isAr
          ? 'إقلاع: ${_getDepartWindowAr(window)}'
          : 'Depart: ${window[0].toUpperCase()}${window.substring(1)}';
      activeChips.add(
        ActiveFilterChip(
          label: label,
          onClear: () {
            final updated = Set<String>.from(filter.departWindows)..remove(window);
            notifier.updateFilter(filter.copyWith(departWindows: updated));
          },
        ),
      );
    }

    // 8. Arrive Windows
    for (final window in filter.arriveWindows) {
      final label = isAr
          ? 'وصول: ${_getDepartWindowAr(window)}'
          : 'Arrive: ${window[0].toUpperCase()}${window.substring(1)}';
      activeChips.add(
        ActiveFilterChip(
          label: label,
          onClear: () {
            final updated = Set<String>.from(filter.arriveWindows)..remove(window);
            notifier.updateFilter(filter.copyWith(arriveWindows: updated));
          },
        ),
      );
    }

    // 9. From Airports
    for (final airport in filter.fromAirports) {
      activeChips.add(
        ActiveFilterChip(
          label: '${isAr ? 'من' : 'From'}: ${airport.toUpperCase()}',
          onClear: () {
            final updated = Set<String>.from(filter.fromAirports)..remove(airport);
            notifier.updateFilter(filter.copyWith(fromAirports: updated));
          },
        ),
      );
    }

    // 10. To Airports
    for (final airport in filter.toAirports) {
      activeChips.add(
        ActiveFilterChip(
          label: '${isAr ? 'إلى' : 'To'}: ${airport.toUpperCase()}',
          onClear: () {
            final updated = Set<String>.from(filter.toAirports)..remove(airport);
            notifier.updateFilter(filter.copyWith(toAirports: updated));
          },
        ),
      );
    }

    // 11. Layover Airports
    for (final airport in filter.layoverAirports) {
      activeChips.add(
        ActiveFilterChip(
          label: '${isAr ? 'ترانزيت' : 'Layover'}: ${airport.toUpperCase()}',
          onClear: () {
            final updated = Set<String>.from(filter.layoverAirports)..remove(airport);
            notifier.updateFilter(filter.copyWith(layoverAirports: updated));
          },
        ),
      );
    }

    return SizedBox(
      height: 40,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        children: [
          // Main Filters Sheet Trigger Button
          _MainFilterButton(isAr: isAr),

          // Dynamic Active Chips
          for (final chip in activeChips) ...[
            const SizedBox(width: 8),
            _ActiveChip(chip: chip),
          ],
        ],
      ),
    );
  }
}

class _MainFilterButton extends StatelessWidget {
  const _MainFilterButton({required this.isAr});

  final bool isAr;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => showFlightsFiltersSheet(context),
        borderRadius: BorderRadius.circular(999),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: Colors.white,
            border: Border.all(color: const Color(0xFFD1D5DB)),
            borderRadius: BorderRadius.circular(999),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.tune_rounded, size: 16, color: Color(0xFF374151)),
              const SizedBox(width: 6),
              Text(
                isAr ? 'الفلاتر' : 'Filters',
                style: Theme.of(context).textTheme.labelLarge?.copyWith(
                  color: const Color(0xFF1F2937),
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ActiveChip extends StatelessWidget {
  const _ActiveChip({required this.chip});

  final ActiveFilterChip chip;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: chip.onClear,
        borderRadius: BorderRadius.circular(999),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: const Color(0xFFEFF6FF), // Premium dynamic active light blue
            border: Border.all(color: const Color(0xFFBFDBFE)),
            borderRadius: BorderRadius.circular(999),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                chip.label,
                style: const TextStyle(
                  color: Color(0xFF1D4ED8), // Deep blue text
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                ),
              ),
              const SizedBox(width: 6),
              const Icon(
                Icons.close_rounded,
                size: 14,
                color: Color(0xFF1D4ED8),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

String _getDepartWindowAr(String window) {
  switch (window.toLowerCase()) {
    case 'morning':
      return 'الصباح';
    case 'afternoon':
      return 'الظهيرة';
    case 'evening':
      return 'المساء';
    case 'night':
      return 'الليل';
    default:
      return window;
  }
}
