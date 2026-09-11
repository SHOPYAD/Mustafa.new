import 'package:flutter/material.dart';

import '../recently_viewed_theme.dart';

class RecentlyViewedFooterNote extends StatelessWidget {
  const RecentlyViewedFooterNote({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 28),
      child: Text(
        'Viewing records from the past 30 days are displayed',
        style: RecentlyViewedTheme.footer,
        textAlign: TextAlign.center,
      ),
    );
  }
}
