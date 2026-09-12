import 'package:flutter/material.dart';

import '../../../../core/theme/lonaliza_theme.dart';

class HomeOfferCard extends StatelessWidget {
  const HomeOfferCard({
    super.key,
    required this.title,
    required this.image,
    this.subtitle,
    this.price,
    this.currency = 'USD',
    this.badge,
    this.onTap,
    this.width = 212,
    this.height = 246,
  });

  final String title;
  final String image;
  final String? subtitle;
  final double? price;
  final String currency;
  final String? badge;
  final VoidCallback? onTap;
  final double width;
  final double height;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(22),
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(22),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF2E1065).withValues(alpha: 0.12),
              blurRadius: 18,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Stack(
          fit: StackFit.expand,
          children: [
            if (image.isNotEmpty)
              Image.network(image, fit: BoxFit.cover, errorBuilder: (_, _, _) {
                return const ColoredBox(color: LonalizaColors.royalPurple);
              })
            else
              const ColoredBox(color: LonalizaColors.royalPurple),
            const DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Colors.transparent, Color(0xCC1B0833)],
                ),
              ),
            ),
            if (badge != null && badge!.isNotEmpty)
              Positioned(
                top: 10,
                right: 10,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: LonalizaColors.amber,
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: Text(
                    badge!,
                    style: const TextStyle(
                      color: Color(0xFF1B0833),
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ),
            Positioned(
              left: 12,
              right: 12,
              bottom: 12,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w900,
                      fontSize: 15,
                      height: 1.25,
                    ),
                  ),
                  if (subtitle != null && subtitle!.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      subtitle!,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(color: Color(0xFFFDE68A), fontSize: 11),
                    ),
                  ],
                  if (price != null) ...[
                    const SizedBox(height: 6),
                    Text(
                      '$currency ${price!.toStringAsFixed(0)}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        fontSize: 16,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class HomeOfferRail extends StatelessWidget {
  const HomeOfferRail({
    super.key,
    required this.title,
    required this.items,
    this.onSeeAll,
  });

  final String title;
  final List<Widget> items;
  final VoidCallback? onSeeAll;

  @override
  Widget build(BuildContext context) {
    if (items.isEmpty) return const SizedBox.shrink();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              title,
              style: const TextStyle(
                fontWeight: FontWeight.w900,
                fontSize: 18,
                color: LonalizaColors.ink,
              ),
            ),
            const Spacer(),
            if (onSeeAll != null)
              TextButton(
                onPressed: onSeeAll,
                child: const Text('عرض الكل'),
              ),
          ],
        ),
        const SizedBox(height: 10),
        SizedBox(
          height: 246,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: items.length,
            separatorBuilder: (_, _) => const SizedBox(width: 12),
            itemBuilder: (_, index) => items[index],
          ),
        ),
      ],
    );
  }
}
