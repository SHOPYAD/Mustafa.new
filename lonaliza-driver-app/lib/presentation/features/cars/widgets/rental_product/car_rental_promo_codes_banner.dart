import 'package:flutter/material.dart';

import '../../car_rental_product_theme.dart';

class CarRentalPromoCodesBanner extends StatelessWidget {
  const CarRentalPromoCodesBanner({
    super.key,
    this.discountLabel = '8% Off',
    this.onClaim,
  });

  final String discountLabel;
  final VoidCallback? onClaim;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 0),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: CarRentalProductTheme.promoBg,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(Icons.local_activity_outlined, color: CarRentalProductTheme.promoPink, size: 26),
          const SizedBox(width: 10),
          const Expanded(
            child: Text(
              'Promo codes',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: CarRentalProductTheme.titleDark),
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            margin: const EdgeInsets.only(right: 10),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(6),
              border: Border.all(color: CarRentalProductTheme.promoPink.withValues(alpha: 0.35)),
            ),
            child: Text(
              discountLabel,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w800,
                color: CarRentalProductTheme.promoPink,
              ),
            ),
          ),
          OutlinedButton(
            onPressed: onClaim ?? () {},
            style: OutlinedButton.styleFrom(
              foregroundColor: CarRentalProductTheme.promoPink,
              side: const BorderSide(color: CarRentalProductTheme.promoPink, width: 1.5),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              textStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
            ),
            child: const Text('Claim'),
          ),
        ],
      ),
    );
  }
}
