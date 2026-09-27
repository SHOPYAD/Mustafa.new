import 'package:flutter/material.dart';

import '../recently_viewed_theme.dart';

/// One row: image + Stays badge, title + stars + heart, rating, optional area, dates + sold out.
class RecentlyViewedPropertyCard extends StatelessWidget {
  const RecentlyViewedPropertyCard({
    super.key,
    required this.imageAsset,
    required this.title,
    this.starCount = 4,
    this.ratingScore = '8.4',
    this.reviewCount = 156,
    this.areaLine,
    this.dateRange = 'Apr 23 - Apr 25',
    this.soldOut = false,
    this.badgeLabel = 'Stays',
    this.onFavoriteTap,
    this.onTap,
  });

  final String imageAsset;
  final String title;
  final int starCount;
  final String ratingScore;
  final int reviewCount;
  final String? areaLine;
  final String dateRange;
  final bool soldOut;
  final String badgeLabel;
  final VoidCallback? onFavoriteTap;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Material(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Ink(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: RecentlyViewedTheme.border),
            ),
            child: Padding(
              padding: const EdgeInsets.all(10),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _Thumb(imageAsset: imageAsset, badgeLabel: badgeLabel),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: _TitleWithStars(title: title, starCount: starCount),
                            ),
                            Material(
                              color: Colors.transparent,
                              child: InkWell(
                                onTap: onFavoriteTap ?? () {},
                                borderRadius: BorderRadius.circular(20),
                                child: Padding(
                                  padding: const EdgeInsets.only(left: 4, bottom: 4),
                                  child: Icon(
                                    Icons.favorite_border_rounded,
                                    size: 22,
                                    color: Colors.grey.shade700,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text.rich(
                          TextSpan(
                            children: [
                              TextSpan(text: '$ratingScore/10', style: RecentlyViewedTheme.ratingScore),
                              TextSpan(text: ' · $reviewCount reviews', style: RecentlyViewedTheme.ratingMeta),
                            ],
                          ),
                        ),
                        if (areaLine != null) ...[
                          const SizedBox(height: 4),
                          Text(areaLine!, style: RecentlyViewedTheme.subLocation),
                        ],
                        const SizedBox(height: 6),
                        Text(
                          soldOut ? '$dateRange, Sold Out' : dateRange,
                          style: RecentlyViewedTheme.datesLine,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _Thumb extends StatelessWidget {
  const _Thumb({required this.imageAsset, required this.badgeLabel});

  final String imageAsset;
  final String badgeLabel;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(10),
      child: SizedBox(
        width: 100,
        height: 100,
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.asset(imageAsset, fit: BoxFit.cover),
            Positioned(
              left: 6,
              top: 6,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                decoration: BoxDecoration(
                  color: RecentlyViewedTheme.badgeBg,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(badgeLabel, style: RecentlyViewedTheme.badge),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TitleWithStars extends StatelessWidget {
  const _TitleWithStars({required this.title, required this.starCount});

  final String title;
  final int starCount;

  @override
  Widget build(BuildContext context) {
    return Text.rich(
      TextSpan(
        children: [
          TextSpan(text: title, style: RecentlyViewedTheme.cardTitle),
          WidgetSpan(
            alignment: PlaceholderAlignment.middle,
            child: Padding(
              padding: const EdgeInsets.only(left: 4),
              child: _StarRow(count: starCount),
            ),
          ),
        ],
      ),
      maxLines: 3,
      overflow: TextOverflow.ellipsis,
    );
  }
}

class _StarRow extends StatelessWidget {
  const _StarRow({required this.count});

  final int count;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(
        count.clamp(0, 5),
        (_) => Icon(Icons.star_rounded, size: 14, color: RecentlyViewedTheme.star),
      ),
    );
  }
}
