import 'package:flutter/material.dart';

import '../recently_viewed_theme.dart';

/// Second row: location chips (e.g. All cities, London, …) — scrollable row.
class RecentlyViewedCityChipsBar extends StatelessWidget {
  const RecentlyViewedCityChipsBar({
    super.key,
    required this.labels,
    required this.selectedIndex,
    required this.onChanged,
  });

  final List<String> labels;
  final int selectedIndex;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 0),
      child: Row(
        children: List.generate(labels.length, (i) {
          final selected = i == selectedIndex;
          return Padding(
            padding: EdgeInsets.only(right: i == labels.length - 1 ? 0 : 8),
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: () => onChanged(i),
                borderRadius: BorderRadius.circular(8),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 160),
                  curve: Curves.easeOutCubic,
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: selected ? RecentlyViewedTheme.cityChipActiveBg : Colors.white,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: selected ? const Color(0xFFBFDBFE) : RecentlyViewedTheme.cityChipInactiveBorder,
                      width: 1,
                    ),
                  ),
                  child: Text(
                    labels[i],
                    style: selected ? RecentlyViewedTheme.cityChipActive : RecentlyViewedTheme.cityChipInactive,
                  ),
                ),
              ),
            ),
          );
        }),
      ),
    );
  }
}
