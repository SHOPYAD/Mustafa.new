import 'package:flutter/material.dart';

import '../../home/widgets/home_promo_coupon_card.dart';

class HotelsNewUserBenefitsCard extends StatelessWidget {
  const HotelsNewUserBenefitsCard({super.key});

  static const _benefits = [
    ('New user promo code', 'Up to \$10 off'),
    ('First Booking Deal', 'Up to 20% off'),
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFFFF7F8),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFFFD8E1)),
      ),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                Text(
                  'New user benefits',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    color: const Color(0xFFE11D74),
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const Spacer(),
                FilledButton(
                  onPressed: () {},
                  style: FilledButton.styleFrom(
                    backgroundColor: const Color(0xFF2563EB),
                    foregroundColor: Colors.white,
                    minimumSize: const Size(0, 30),
                    padding: const EdgeInsets.symmetric(horizontal: 10),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: const Text('Claim All'),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                for (int index = 0; index < _benefits.length; index++) ...[
                  Expanded(
                    child: HomePromoCouponCard(
                      title: _benefits[index].$1,
                      subtitle: _benefits[index].$2,
                      isTrailingCut: false,
                      icon: Icons.local_offer_rounded,
                    ),
                  ),
                  if (index != _benefits.length - 1) const SizedBox(width: 8),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }
}
