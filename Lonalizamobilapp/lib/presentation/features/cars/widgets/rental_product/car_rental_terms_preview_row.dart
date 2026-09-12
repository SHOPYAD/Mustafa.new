import 'package:flutter/material.dart';

import '../../car_rental_product_theme.dart';
import '../car_offer_option_tile.dart';

/// Cancellation / policy heading + icon bullets + trailing chevron (tappable row).
class CarRentalTermsPreviewRow extends StatelessWidget {
  const CarRentalTermsPreviewRow({
    super.key,
    required this.heading,
    required this.bullets,
    this.onTap,
  });

  final String heading;
  final List<CarOfferBullet> bullets;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 8, 16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.only(right: 8),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(heading, style: CarRentalProductTheme.sectionTitle.copyWith(fontSize: 15)),
                    const SizedBox(height: 10),
                    ...bullets.map(
                      (b) => Padding(
                        padding: const EdgeInsets.only(bottom: 6),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Icon(b.icon, size: 18, color: CarRentalProductTheme.metaGrey),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                b.text,
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w500,
                                  color: CarRentalProductTheme.titleDark,
                                  height: 1.35,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Icon(Icons.chevron_right_rounded, color: Colors.grey.shade500, size: 28),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
