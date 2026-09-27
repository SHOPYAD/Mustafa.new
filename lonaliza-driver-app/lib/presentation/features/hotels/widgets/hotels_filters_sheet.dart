import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../domain/entities/hotels/hotels_booking_draft.dart';
import '../providers/hotels_booking_draft_notifier.dart';

class HotelsFiltersSheet extends ConsumerStatefulWidget {
  const HotelsFiltersSheet({super.key});

  @override
  ConsumerState<HotelsFiltersSheet> createState() => _HotelsFiltersSheetState();
}

class _HotelsFiltersSheetState extends ConsumerState<HotelsFiltersSheet> {
  /// Popular filter rows visible before "Show more".
  static const int _popularCollapsedCount = 3;

  bool _popularExpanded = false;

  static const _popularFilters = [
    ('Hotel', '1300+'),
    ('Breakfast included', '800+'),
    ('Free cancellation', '21'),
    ('Very Good 8+', '3900+'),
    ('2 beds', '2900+'),
  ];

  static const _starRatings = [
    ('⭐', '700+'),
    ('⭐⭐', '7300+'),
    ('⭐⭐⭐', '5100+'),
    ('⭐⭐⭐⭐', '1600+'),
    ('⭐⭐⭐⭐⭐', '200+'),
  ];

  static const _guestRatings = [
    ('Pleasant 6+', '5300+'),
    ('Good 7+', '4900+'),
    ('Very Good 8+', '3900+'),
    ('Great 9+', '2000+'),
  ];

  static const _guestRatingEnums = [
    HotelsGuestRatingFilter.pleasant6Plus,
    HotelsGuestRatingFilter.good7Plus,
    HotelsGuestRatingFilter.veryGood8Plus,
    HotelsGuestRatingFilter.great9Plus,
  ];

  @override
  Widget build(BuildContext context) {
    final filters = ref.watch(hotelsBookingDraftProvider).searchFilters;
    final notifier = ref.read(hotelsBookingDraftProvider.notifier);

    final needPopularToggle = _popularFilters.length > _popularCollapsedCount;
    final visiblePopular = needPopularToggle && !_popularExpanded
        ? _popularFilters.take(_popularCollapsedCount).toList(growable: false)
        : _popularFilters;

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 10, 12, 10),
              child: Row(
                children: [
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close_rounded),
                  ),
                  const Spacer(),
                  Text(
                    'Filter by',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: const Color(0xFF111827),
                    ),
                  ),
                  const Spacer(),
                  TextButton(
                    onPressed: () => notifier.resetSearchFilters(),
                    child: const Text('Reset'),
                  ),
                ],
              ),
            ),
            Divider(color: Colors.grey.shade200, height: 1),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(16, 18, 16, 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _SectionTitle(title: 'Popular Filters'),
                    const SizedBox(height: 12),
                    for (final filter in visiblePopular)
                      _PopularFilterTile(
                        label: filter.$1,
                        count: filter.$2,
                        filters: filters,
                        onChanged: notifier.updateSearchFilters,
                      ),
                    if (needPopularToggle)
                      Align(
                        alignment: Alignment.centerLeft,
                        child: TextButton(
                          onPressed: () => setState(
                            () => _popularExpanded = !_popularExpanded,
                          ),
                          child: Text(
                            _popularExpanded ? 'Show less' : 'Show more',
                          ),
                        ),
                      ),
                    const SizedBox(height: 12),
                    _SectionTitle(title: 'Budget (for 1 night)'),
                    const SizedBox(height: 8),
                    Text(
                      'Price per room per night (excl. taxes & fees)',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: const Color(0xFF4B5563),
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 18),
                    _BudgetSection(
                      filters: filters,
                      onChanged: notifier.updateSearchFilters,
                    ),
                    const SizedBox(height: 24),
                    _SectionTitle(
                      title: 'Star rating',
                      trailing: const Icon(
                        Icons.info_outline_rounded,
                        size: 18,
                        color: Color(0xFF6B7280),
                      ),
                    ),
                    const SizedBox(height: 12),
                    for (var i = 0; i < _starRatings.length; i++)
                      _FilterOptionTile(
                        label: _starRatings[i].$1,
                        count: _starRatings[i].$2,
                        selected: filters.minHotelStars == i + 1,
                        onTap: () => notifier.updateSearchFilters((f) {
                          final s = i + 1;
                          return f.copyWith(
                            minHotelStars: f.minHotelStars == s ? 0 : s,
                          );
                        }),
                      ),
                    const SizedBox(height: 20),
                    _SectionTitle(title: 'Guest Rating'),
                    const SizedBox(height: 12),
                    for (var i = 0; i < _guestRatings.length; i++)
                      _FilterOptionTile(
                        label: _guestRatings[i].$1,
                        count: _guestRatings[i].$2,
                        selected: filters.guestRating == _guestRatingEnums[i],
                        onTap: () => notifier.updateSearchFilters((f) {
                          final e = _guestRatingEnums[i];
                          return f.copyWith(
                            guestRating:
                                f.guestRating == e
                                    ? HotelsGuestRatingFilter.none
                                    : e,
                          );
                        }),
                      ),
                    const SizedBox(height: 20),
                    _SectionTitle(title: 'Payment & room type'),
                    const SizedBox(height: 12),
                    _FilterOptionTile(
                      label: 'Pay at Hotel',
                      count: '—',
                      selected: filters.payAtHotel,
                      onTap: () => notifier.updateSearchFilters(
                        (f) => f.copyWith(payAtHotel: !f.payAtHotel),
                      ),
                    ),
                    _FilterOptionTile(
                      label: '1 bedroom/studio',
                      count: '—',
                      selected: filters.oneBedroomStudio,
                      onTap: () => notifier.updateSearchFilters(
                        (f) => f.copyWith(oneBedroomStudio: !f.oneBedroomStudio),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            Container(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
              decoration: BoxDecoration(
                color: Colors.white,
                border: Border(top: BorderSide(color: Colors.grey.shade200)),
              ),
              child: FilledButton(
                onPressed: () => Navigator.of(context).pop(),
                style: FilledButton.styleFrom(
                  backgroundColor: const Color(0xFF2563EB),
                  foregroundColor: Colors.white,
                  minimumSize: const Size.fromHeight(50),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text(
                  'Show Results',
                  style: TextStyle(fontWeight: FontWeight.w700),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle({
    required this.title,
    this.trailing,
  });

  final String title;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(
          title,
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            fontSize: 18,
            fontWeight: FontWeight.w800,
            color: const Color(0xFF111827),
          ),
        ),
        const SizedBox(width: 6),
        ?trailing,
      ],
    );
  }
}

class _PopularFilterTile extends StatelessWidget {
  const _PopularFilterTile({
    required this.label,
    required this.count,
    required this.filters,
    required this.onChanged,
  });

  final String label;
  final String count;
  final HotelsSearchFilters filters;
  final void Function(HotelsSearchFilters Function(HotelsSearchFilters) fn)
      onChanged;

  bool get _selected => switch (label) {
        'Hotel' => filters.hotelOnly,
        'Breakfast included' => filters.breakfastIncluded,
        'Free cancellation' => filters.freeCancellation,
        'Very Good 8+' =>
          filters.guestRating == HotelsGuestRatingFilter.veryGood8Plus,
        '2 beds' => filters.doubleBed,
        _ => false,
      };

  void _onTap() {
    onChanged((f) {
      return switch (label) {
        'Hotel' => f.copyWith(hotelOnly: !f.hotelOnly),
        'Breakfast included' => f.copyWith(breakfastIncluded: !f.breakfastIncluded),
        'Free cancellation' => f.copyWith(freeCancellation: !f.freeCancellation),
        'Very Good 8+' => f.copyWith(
            guestRating:
                f.guestRating == HotelsGuestRatingFilter.veryGood8Plus
                    ? HotelsGuestRatingFilter.none
                    : HotelsGuestRatingFilter.veryGood8Plus,
          ),
        '2 beds' => f.copyWith(doubleBed: !f.doubleBed),
        _ => f,
      };
    });
  }

  @override
  Widget build(BuildContext context) {
    return _FilterOptionTile(
      label: label,
      count: count,
      selected: _selected,
      onTap: _onTap,
    );
  }
}

class _FilterOptionTile extends StatelessWidget {
  const _FilterOptionTile({
    required this.label,
    required this.count,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final String count;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Row(
          children: [
            Container(
              width: 22,
              height: 22,
              decoration: BoxDecoration(
                color: selected ? const Color(0xFF2563EB) : Colors.transparent,
                border: Border.all(
                  color:
                      selected ? const Color(0xFF2563EB) : const Color(0xFF9CA3AF),
                ),
                borderRadius: BorderRadius.circular(4),
              ),
              child: selected
                  ? const Icon(Icons.check_rounded, size: 16, color: Colors.white)
                  : null,
            ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              label,
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                color: const Color(0xFF374151),
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          Text(
            count,
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
              color: const Color(0xFF6B7280),
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    ),
    );
  }
}

class _BudgetSection extends StatelessWidget {
  const _BudgetSection({
    required this.filters,
    required this.onChanged,
  });

  final HotelsSearchFilters filters;
  final void Function(HotelsSearchFilters Function(HotelsSearchFilters) fn)
      onChanged;

  @override
  Widget build(BuildContext context) {
    final maxCap = HotelsSearchFilters.budgetRangeMax.toDouble();
    var low = filters.budgetMinPerNight
        .clamp(0, HotelsSearchFilters.budgetRangeMax)
        .toDouble();
    var high = filters.budgetMaxPerNight
        .clamp(0, HotelsSearchFilters.budgetRangeMax)
        .toDouble();
    if (high < low) high = low;
    final maxLabel = filters.budgetMaxPerNight >= HotelsSearchFilters.budgetRangeMax
        ? '\$${HotelsSearchFilters.budgetRangeMax}+'
        : '\$${filters.budgetMaxPerNight}';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        RangeSlider(
          values: RangeValues(low, high),
          min: 0,
          max: maxCap,
          divisions: 40,
          labels: RangeLabels(
            '\$${low.round()}',
            high >= maxCap
                ? '\$${HotelsSearchFilters.budgetRangeMax}+'
                : '\$${high.round()}',
          ),
          onChanged: (rv) {
            onChanged(
              (f) => f.copyWith(
                budgetMinPerNight: rv.start.round(),
                budgetMaxPerNight: rv.end.round(),
              ),
            );
          },
        ),
        const SizedBox(height: 8),
        Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Expanded(
              child: _BudgetField(
                label: 'Minimum',
                value: '\$${filters.budgetMinPerNight}',
              ),
            ),
            const SizedBox(width: 12),
            const Padding(
              padding: EdgeInsets.only(bottom: 16),
              child: Text(
                '—',
                style: TextStyle(
                  color: Color(0xFF9CA3AF),
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _BudgetField(
                label: 'Maximum',
                value: maxLabel,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _BudgetField extends StatelessWidget {
  const _BudgetField({
    required this.label,
    required this.value,
  });

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: double.infinity,
          padding: const EdgeInsets.fromLTRB(12, 8, 12, 10),
          decoration: BoxDecoration(
            border: Border.all(color: const Color(0xFFE5E7EB)),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: Theme.of(context).textTheme.labelMedium?.copyWith(
                  color: const Color(0xFF9CA3AF),
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  color: const Color(0xFF111827),
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
