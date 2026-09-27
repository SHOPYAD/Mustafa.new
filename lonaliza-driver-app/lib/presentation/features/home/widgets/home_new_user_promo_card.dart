import 'package:flutter/material.dart';

import 'home_promo_coupon_card.dart';

/// New-user discounts card + horizontal coupon list.
class HomeNewUserPromoCard extends StatelessWidget {
  const HomeNewUserPromoCard({super.key});

  static const _coupons = [
    ('Hotels', '10% off'),
    ('Tours & tickets', '5% off'),
    ('Flights', '\$15 off'),
  ];

  @override
  Widget build(BuildContext context) {
    const blue = Color(0xFF0068E0);
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE8E8E8)),
      ),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                Container(
                  width: 24,
                  height: 24,
                  decoration: const BoxDecoration(
                    color: Color(0xFFFFF3D4),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.card_giftcard_rounded,
                    size: 15,
                    color: Color(0xFFFFB300),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'New User Discounts Available',
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.w800,
                          color: const Color(0xFF1F2937),
                        ),
                  ),
                ),
                FilledButton(
                  onPressed: () {},
                  style: FilledButton.styleFrom(
                    backgroundColor: blue,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    minimumSize: const Size(0, 32),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    textStyle: Theme.of(context).textTheme.labelMedium?.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                  ),
                  child: const Text('Claim All'),
                ),
              ],
            ),
            const SizedBox(height: 10),
            SizedBox(
              height: 86,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: _coupons.length,
                separatorBuilder: (context, index) => const SizedBox(width: 8),
                itemBuilder: (context, index) {
                  final coupon = _coupons[index];
                  return HomePromoCouponCard(
                    title: coupon.$1,
                    subtitle: coupon.$2,
                    isTrailingCut: index != _coupons.length - 1,
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
