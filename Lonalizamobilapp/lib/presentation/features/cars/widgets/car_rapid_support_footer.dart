import 'package:flutter/material.dart';

import '../car_rentals_theme.dart';

/// Lightning + clock icon row under the search button.
class CarRapidSupportFooter extends StatelessWidget {
  const CarRapidSupportFooter({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.bolt_rounded, size: 18, color: CarRentalsTheme.supportCaption),
          const SizedBox(width: 4),
          Icon(Icons.schedule_rounded, size: 18, color: CarRentalsTheme.supportCaption),
          const SizedBox(width: 8),
          Text(
            'Rapid customer support',
            style: CarRentalsTheme.inputSecondary.copyWith(
              color: CarRentalsTheme.supportCaption,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}
