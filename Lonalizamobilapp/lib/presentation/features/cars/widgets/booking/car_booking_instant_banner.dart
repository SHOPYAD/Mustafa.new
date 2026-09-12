import 'package:flutter/material.dart';

import '../../car_booking_theme.dart';
import '../../car_booking_typography.dart';

/// Full-width slim **Instant confirmation** strip (between summary and driver card).
class CarBookingInstantBanner extends StatelessWidget {
  const CarBookingInstantBanner({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
      child: DecoratedBox(
        decoration: BoxDecoration(
          color: CarBookingTheme.instantStripBg,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          child: Row(
            children: [
              const Icon(Icons.bolt_rounded, color: CarBookingTheme.instantStripIcon, size: 18),
              const SizedBox(width: 8),
              Expanded(
                child: Text('Instant confirmation', style: CarBookingTypography.instantBanner()),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
