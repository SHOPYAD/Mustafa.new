import 'package:flutter/material.dart';

import 'home_quick_actions_row.dart';
import 'home_search_bar.dart';

/// Trip.com–style blue app bar (flat bottom edge — the curved “card” is the white sheet on [HomePage]).
///
/// [bottomSheetOverlap]: bottom strip kept transparent so the white sheet can paint
/// under the pinned sliver (handled on [HomePage], not here).
class HomeHeader extends StatelessWidget {
  const HomeHeader({
    super.key,
    required this.appName,
    this.onProfileTap,
    this.bottomSheetOverlap = 0,
    this.collapseProgress = 0,
    this.showSearch = false,
    this.showActions = false,
  });

  final String appName;
  final VoidCallback? onProfileTap;

  final double bottomSheetOverlap;
  final double collapseProgress;
  final bool showSearch;
  final bool showActions;

  static const Color brandBlue = Color(0xFF0068E0);
  static const Color _accentYellow = Color(0xFFFFC107);

  @override
  Widget build(BuildContext context) {
    final progress = collapseProgress.clamp(0.0, 1.0);
    final isCollapsed = progress > 0;
    final backgroundColor = isCollapsed ? Colors.white : brandBlue;
    final titleColor = isCollapsed ? brandBlue : Colors.white;
    final dividerColor = isCollapsed
        ? Colors.black.withValues(alpha: 0.1)
        : Colors.transparent;
    final titleStyle = Theme.of(context).textTheme.titleLarge?.copyWith(
          color: titleColor,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.2,
        );

    return Stack(
      fit: StackFit.expand,
      clipBehavior: Clip.none,
      children: [
        Positioned(
          top: 0,
          left: 0,
          right: 0,
          bottom: bottomSheetOverlap,
          child: DecoratedBox(
            decoration: BoxDecoration(
              color: backgroundColor,
              border: Border(bottom: BorderSide(color: dividerColor)),
            ),
          ),
        ),
        SafeArea(
          bottom: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(12, 4, 12, 4),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                AnimatedSwitcher(
                  duration: const Duration(milliseconds: 180),
                  child: showSearch
                      ? const SizedBox.shrink()
                      : Row(
                          children: [
                            Text(appName, style: titleStyle),
                            const SizedBox(width: 6),
                            Container(
                              width: 6,
                              height: 6,
                              decoration: const BoxDecoration(
                                color: _accentYellow,
                                shape: BoxShape.circle,
                              ),
                            ),
                            const Spacer(),
                            Material(
                              color: _accentYellow,
                              shape: const CircleBorder(),
                              clipBehavior: Clip.antiAlias,
                              child: InkWell(
                                onTap: onProfileTap,
                                customBorder: const CircleBorder(),
                                child: const SizedBox(
                                  width: 36,
                                  height: 36,
                                  child: Center(
                                    child: Text(
                                      'T',
                                      style: TextStyle(
                                        fontWeight: FontWeight.w800,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                ),
                AnimatedSwitcher(
                  duration: const Duration(milliseconds: 220),
                  child: showSearch
                      ? Padding(
                          padding: const EdgeInsets.only(top: 1),
                          child: const HomeSearchBar(compact: true),
                        )
                      : const SizedBox(height: 0),
                ),
                AnimatedSwitcher(
                  duration: const Duration(milliseconds: 220),
                  child: showActions
                      ? Padding(
                          padding: const EdgeInsets.only(top: 4),
                          child: const HomeQuickActionsRow(
                            compactChipStyle: true,
                          ),
                        )
                      : const SizedBox(height: 0),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
