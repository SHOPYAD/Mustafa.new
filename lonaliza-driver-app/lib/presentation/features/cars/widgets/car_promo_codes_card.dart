import 'package:flutter/material.dart';

import '../car_rentals_theme.dart';

/// Promo codes header + pink gradient banner with New user tag and Claim.
class CarPromoCodesCard extends StatelessWidget {
  const CarPromoCodesCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Material(
      elevation: 3,
      shadowColor: Colors.black.withValues(alpha: 0.08),
      borderRadius: BorderRadius.circular(14),
      color: Colors.white,
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 12, 10),
            child: Row(
              children: [
                Icon(Icons.local_activity_outlined, size: 20, color: CarRentalsTheme.promoPink),
                const SizedBox(width: 8),
                const Text('Promo codes', style: CarRentalsTheme.sectionHeader),
                const Spacer(),
                Text(
                  'Details',
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
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Stack(
                children: [
                  const DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.centerLeft,
                        end: Alignment.centerRight,
                        colors: [
                          CarRentalsTheme.promoBannerStart,
                          CarRentalsTheme.promoBannerEnd,
                        ],
                      ),
                    ),
                    child: SizedBox(height: 96, width: double.infinity),
                  ),
                  Positioned.fill(
                    child: IgnorePointer(
                      child: CustomPaint(
                        painter: _PromoPatternPainter(),
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: CarRentalsTheme.promoPink,
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: const Text(
                                  'New user',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    color: Colors.white,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 8),
                              Text(
                                '8% Off',
                                style: TextStyle(
                                  fontSize: 26,
                                  fontWeight: FontWeight.w900,
                                  color: CarRentalsTheme.promoPink,
                                  height: 1,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Book now and save',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: CarRentalsTheme.promoPink.withValues(alpha: 0.85),
                                ),
                              ),
                            ],
                          ),
                        ),
                        Material(
                          color: CarRentalsTheme.promoPink,
                          borderRadius: BorderRadius.circular(20),
                          child: InkWell(
                            onTap: () {},
                            borderRadius: BorderRadius.circular(20),
                            child: const Padding(
                              padding: EdgeInsets.symmetric(horizontal: 22, vertical: 10),
                              child: Text(
                                'Claim',
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  color: Colors.white,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _PromoPatternPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final p = Paint()..color = CarRentalsTheme.promoPink.withValues(alpha: 0.06);
    for (var i = 0; i < 6; i++) {
      canvas.drawCircle(Offset(size.width * 0.15 + i * 18.0, size.height * 0.75), 14, p);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
