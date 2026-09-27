import 'package:flutter/material.dart';

import '../../car_rental_product_theme.dart';

/// Trip Preferred strip + supplier mark + rating pill + reviews + chain tag.
class CarRentalSupplierTrustBlock extends StatelessWidget {
  const CarRentalSupplierTrustBlock({
    super.key,
    required this.supplierName,
    required this.ratingLabel,
    required this.reviewsLine,
    required this.chainTag,
    this.onPreferredTap,
  });

  final String supplierName;
  final String ratingLabel;
  final String reviewsLine;
  final String chainTag;
  final VoidCallback? onPreferredTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Material(
            color: CarRentalProductTheme.preferredStripBg,
            borderRadius: BorderRadius.circular(8),
            child: InkWell(
              onTap: onPreferredTap,
              borderRadius: BorderRadius.circular(8),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                child: Row(
                  children: [
                    Icon(Icons.star_rounded, size: 18, color: CarRentalProductTheme.preferredStripText),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        'Trip Preferred · Excellent stores, quality service',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: CarRentalProductTheme.preferredStripText,
                        ),
                      ),
                    ),
                    Icon(Icons.chevron_right_rounded, size: 20, color: CarRentalProductTheme.preferredStripText),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 14),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _SupplierMark(name: supplierName),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: CarRentalProductTheme.primaryBlue,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  ratingLabel,
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 12),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            reviewsLine,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: CarRentalProductTheme.primaryBlue,
              decoration: TextDecoration.underline,
              decorationColor: CarRentalProductTheme.primaryBlue,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            chainTag,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: CarRentalProductTheme.metaGrey),
          ),
        ],
      ),
    );
  }
}

class _SupplierMark extends StatelessWidget {
  const _SupplierMark({required this.name});

  final String name;

  @override
  Widget build(BuildContext context) {
    if (name.toUpperCase() == 'SIXT') {
      return RichText(
        text: TextSpan(
          style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w900, letterSpacing: 1),
          children: const [
            TextSpan(text: 'S', style: TextStyle(color: CarRentalProductTheme.sixtOrange)),
            TextSpan(text: 'IX', style: TextStyle(color: CarRentalProductTheme.titleDark)),
            TextSpan(text: 'T', style: TextStyle(color: CarRentalProductTheme.sixtOrange)),
          ],
        ),
      );
    }
    return Text(
      name,
      style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: CarRentalProductTheme.titleDark),
    );
  }
}
