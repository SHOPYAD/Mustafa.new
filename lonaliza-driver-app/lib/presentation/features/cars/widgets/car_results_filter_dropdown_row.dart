import 'package:flutter/material.dart';

import '../car_search_results_theme.dart';

/// Row 1: Sort · Location · Seats · Filters — outlined pills; "Filter deals" only above Filters.
class CarResultsFilterDropdownRow extends StatelessWidget {
  const CarResultsFilterDropdownRow({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.fromLTRB(12, 0, 12, 0),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            const _DropdownPill(label: 'Sort'),
            const SizedBox(width: 8),
            const _DropdownPill(label: 'Location'),
            const SizedBox(width: 8),
            const _DropdownPill(label: 'Seats'),
            const SizedBox(width: 8),
            const _FiltersWithBadge(),
          ],
        ),
      ),
    );
  }
}

class _FiltersWithBadge extends StatelessWidget {
  const _FiltersWithBadge();

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
          decoration: BoxDecoration(
            color: CarSearchResultsTheme.promoPink.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(5),
            border: Border.all(color: CarSearchResultsTheme.promoPink.withValues(alpha: 0.45)),
          ),
          child: Text(
            'Filter deals',
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w800,
              color: CarSearchResultsTheme.promoPink,
              height: 1,
            ),
          ),
        ),
        const SizedBox(height: 5),
        const _DropdownPill(label: 'Filters'),
      ],
    );
  }
}

class _DropdownPill extends StatelessWidget {
  const _DropdownPill({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {},
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: CarSearchResultsTheme.pillBorder, width: 1),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                label,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: CarSearchResultsTheme.navy,
                  height: 1.2,
                ),
              ),
              const SizedBox(width: 1),
              Icon(
                Icons.keyboard_arrow_down_rounded,
                size: 18,
                color: CarSearchResultsTheme.navy.withValues(alpha: 0.85),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
