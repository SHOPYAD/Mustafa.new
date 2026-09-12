import 'package:flutter/material.dart';

import '../car_rentals_theme.dart';

class CarWhyBookFeatureTile extends StatelessWidget {
  const CarWhyBookFeatureTile({
    super.key,
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.subtitle,
    this.iconBackground,
  });

  final IconData icon;
  final Color iconColor;
  final String title;
  final String subtitle;
  final Color? iconBackground;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 18),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: iconBackground ?? iconColor.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: iconColor, size: 24),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: CarRentalsTheme.whyFeatureTitle),
                const SizedBox(height: 6),
                Text(subtitle, style: CarRentalsTheme.whyFeatureBody),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
