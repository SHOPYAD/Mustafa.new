import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'hotels_search_result_card.dart';
import 'hotels_search_sold_out_card.dart';

class HotelsSearchResultsList extends StatelessWidget {
  const HotelsSearchResultsList({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 16, 12, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            '4 properties found',
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
              color: const Color(0xFF111827),
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 12),
          HotelsSearchResultCard(
            name: 'Prime Residence Golf Kattameya',
            rating: 4,
            score: '9.1/10',
            scoreLabel: 'Great',
            location:
                'Al Wadi Al Gadid Desert | 148.5 miles from center',
            tag: 'Laundry service (on-site)',
            description: 'Entire unit 1291 ft² · 2 bedrooms · 3 beds',
            imageAsset: 'assets/images/1.jpg',
            footerNote: 'Booking deadline for this hotel passed',
            isHighlighted: true,
            onTap: () => context.push('/hotels/details'),
          ),
          const SizedBox(height: 12),
          Center(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  'Less Sold Out Hotels',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    color: const Color(0xFF2563EB),
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(width: 4),
                const Icon(
                  Icons.keyboard_arrow_up_rounded,
                  color: Color(0xFF2563EB),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          const HotelsSearchSoldOutCard(
            name: 'Chill & Swim - 1BR October City',
            location: 'Al Wadi Al Gadid Desert | 148.5 miles from ...',
            description: 'Entire apartment · 1 bedroom · 1 bed',
            imageAsset: 'assets/images/2.jpg',
          ),
        ],
      ),
    );
  }
}
