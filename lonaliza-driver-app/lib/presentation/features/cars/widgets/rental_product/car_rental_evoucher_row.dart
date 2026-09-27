import 'package:flutter/material.dart';

import '../../car_rental_product_theme.dart';

class CarRentalEvoucherRow extends StatelessWidget {
  const CarRentalEvoucherRow({super.key, this.label = 'E-voucher'});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 4, 16, 8),
      child: Row(
        children: [
          Icon(Icons.check_circle_rounded, size: 18, color: CarRentalProductTheme.tealPositive),
          const SizedBox(width: 8),
          Text(
            label,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: CarRentalProductTheme.titleDark,
            ),
          ),
        ],
      ),
    );
  }
}
