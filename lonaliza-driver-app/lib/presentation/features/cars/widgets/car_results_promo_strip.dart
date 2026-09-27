import 'package:flutter/material.dart';

import '../car_search_results_theme.dart';

class CarResultsPromoStrip extends StatelessWidget {
  const CarResultsPromoStrip({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: CarSearchResultsTheme.promoBg,
          borderRadius: BorderRadius.circular(10),
        ),
        child: Row(
          children: [
            Text(
              'Promo codes',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: Colors.grey.shade800,
              ),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: CarSearchResultsTheme.promoPink.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                '8% Off',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                  color: CarSearchResultsTheme.promoPink,
                ),
              ),
            ),
            const Spacer(),
            OutlinedButton(
              onPressed: () {},
              style: OutlinedButton.styleFrom(
                foregroundColor: CarSearchResultsTheme.promoPink,
                side: BorderSide(color: CarSearchResultsTheme.promoPink.withValues(alpha: 0.7)),
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 6),
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              ),
              child: const Text('Claim', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
            ),
          ],
        ),
      ),
    );
  }
}
