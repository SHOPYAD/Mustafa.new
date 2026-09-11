import 'package:flutter/material.dart';

import '../recently_viewed_theme.dart';

/// Horizontally scrollable category tabs with blue underline on the active tab.
class RecentlyViewedCategoryTabs extends StatelessWidget {
  const RecentlyViewedCategoryTabs({
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
      padding: const EdgeInsets.only(left: 4, right: 16),
      child: Row(
        children: List.generate(labels.length, (i) {
          final selected = i == selectedIndex;
          return Padding(
            padding: const EdgeInsets.only(right: 8),
            child: IntrinsicWidth(
              child: InkWell(
                onTap: () => onChanged(i),
                borderRadius: BorderRadius.circular(6),
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(10, 10, 10, 0),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Text(
                        labels[i],
                        textAlign: TextAlign.center,
                        style: selected ? RecentlyViewedTheme.tabActive : RecentlyViewedTheme.tabInactive,
                      ),
                      const SizedBox(height: 8),
                      AnimatedContainer(
                        duration: const Duration(milliseconds: 180),
                        curve: Curves.easeOutCubic,
                        height: 3,
                        decoration: BoxDecoration(
                          color: selected ? RecentlyViewedTheme.blue : Colors.transparent,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ],
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
