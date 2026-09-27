import 'package:flutter/material.dart';

import '../../all_bookings/all_bookings_theme.dart';

/// End-of-list footer for the Upcoming screen (same pattern as All Bookings).
class UpcomingListFooter extends StatelessWidget {
  const UpcomingListFooter({
    super.key,
    this.onSearchByEmailTap,
  });

  final VoidCallback? onSearchByEmailTap;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(child: Divider(color: Colors.grey.shade300, thickness: 1)),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: Text('No more upcoming trips', style: AllBookingsTheme.footerMuted),
            ),
            Expanded(child: Divider(color: Colors.grey.shade300, thickness: 1)),
          ],
        ),
        const SizedBox(height: 20),
        Text(
          "Can't find your booking?",
          style: AllBookingsTheme.footerMuted.copyWith(fontSize: 14),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 10),
        InkWell(
          onTap: onSearchByEmailTap ?? () {},
          borderRadius: BorderRadius.circular(8),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.manage_search_rounded, size: 20, color: AllBookingsTheme.blue),
                const SizedBox(width: 6),
                Text('Search by email or PIN', style: AllBookingsTheme.linkBlue),
              ],
            ),
          ),
        ),
        const SizedBox(height: 24),
      ],
    );
  }
}
