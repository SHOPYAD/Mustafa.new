import 'package:flutter/material.dart';

import '../car_rentals_theme.dart';

/// One line in the search card: leading icon, primary + optional secondary text.
class CarSearchInputRow extends StatelessWidget {
  const CarSearchInputRow({
    super.key,
    required this.icon,
    required this.primary,
    this.secondary,
    this.onTap,
    this.showChevron = true,
  });

  final IconData icon;
  final String primary;
  final String? secondary;
  final VoidCallback? onTap;
  final bool showChevron;

  @override
  Widget build(BuildContext context) {
    final child = Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 22, color: Colors.grey.shade800),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(primary, style: CarRentalsTheme.inputPrimary),
                if (secondary != null) ...[
                  const SizedBox(height: 4),
                  Text(secondary!, style: CarRentalsTheme.inputSecondary),
                ],
              ],
            ),
          ),
          if (showChevron)
            Icon(Icons.chevron_right_rounded, size: 22, color: Colors.grey.shade400),
        ],
      ),
    );

    return Material(
      color: Colors.transparent,
      child: InkWell(onTap: onTap ?? () {}, child: child),
    );
  }
}
