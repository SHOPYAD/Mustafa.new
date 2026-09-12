import 'package:flutter/material.dart';

import '../car_rentals_theme.dart';

class CarMyBookingsRow extends StatelessWidget {
  const CarMyBookingsRow({super.key});

  @override
  Widget build(BuildContext context) {
    return Material(
      elevation: 2,
      shadowColor: Colors.black.withValues(alpha: 0.06),
      borderRadius: BorderRadius.circular(14),
      color: Colors.white,
      child: InkWell(
        onTap: () {},
        borderRadius: BorderRadius.circular(14),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
          child: Row(
            children: [
              Text(
                'My bookings',
                style: CarRentalsTheme.sectionHeader.copyWith(fontSize: 15),
              ),
              const Spacer(),
              Text(
                'View',
                style: CarRentalsTheme.inputPrimary.copyWith(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: CarRentalsTheme.linkBlue,
                ),
              ),
              Icon(Icons.chevron_right_rounded, size: 20, color: CarRentalsTheme.linkBlue),
            ],
          ),
        ),
      ),
    );
  }
}
