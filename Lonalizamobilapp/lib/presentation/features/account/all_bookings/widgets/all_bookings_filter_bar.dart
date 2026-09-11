import 'package:flutter/material.dart';

import '../all_bookings_theme.dart';

/// Row: [Filters] outlined button + status chip (e.g. Refunding/Refunded).
class AllBookingsFilterBar extends StatelessWidget {
  const AllBookingsFilterBar({
    super.key,
    this.onFiltersTap,
    this.onStatusChipTap,
    this.statusLabel = 'Refunding/Refunded',
  });

  final VoidCallback? onFiltersTap;
  final VoidCallback? onStatusChipTap;
  final String statusLabel;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        OutlinedButton.icon(
          onPressed: onFiltersTap ?? () {},
          icon: Icon(Icons.tune_rounded, size: 18, color: Colors.grey.shade800),
          label: Text(
            'Filters',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Colors.grey.shade900,
            ),
          ),
          style: OutlinedButton.styleFrom(
            foregroundColor: Colors.black87,
            side: BorderSide(color: Colors.grey.shade300),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            minimumSize: const Size(0, 40),
          ),
        ),
        const SizedBox(width: 10),
        Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: onStatusChipTap ?? () {},
            borderRadius: BorderRadius.circular(8),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.grey.shade300),
                color: Colors.white,
              ),
              child: Text(statusLabel, style: AllBookingsTheme.chipLabel),
            ),
          ),
        ),
      ],
    );
  }
}
