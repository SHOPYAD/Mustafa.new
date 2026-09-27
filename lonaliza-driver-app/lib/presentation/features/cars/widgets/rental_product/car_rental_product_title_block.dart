import 'package:flutter/material.dart';

import '../../car_rental_product_theme.dart';

/// Title + rental dates (below hero / above tab strip).
class CarRentalProductTitleBlock extends StatelessWidget {
  const CarRentalProductTitleBlock({
    super.key,
    required this.title,
    required this.subtitle,
  });

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: CarRentalProductTheme.appBarTitle.copyWith(fontSize: 17)),
          const SizedBox(height: 4),
          Text(subtitle, style: CarRentalProductTheme.appBarSubtitle),
        ],
      ),
    );
  }
}
