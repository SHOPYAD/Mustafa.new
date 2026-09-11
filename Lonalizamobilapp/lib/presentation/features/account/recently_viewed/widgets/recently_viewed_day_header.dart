import 'package:flutter/material.dart';

import '../recently_viewed_theme.dart';

class RecentlyViewedDayHeader extends StatelessWidget {
  const RecentlyViewedDayHeader({super.key, this.label = 'Today'});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(4, 18, 0, 10),
      child: Text(label, style: RecentlyViewedTheme.dayHeader),
    );
  }
}
