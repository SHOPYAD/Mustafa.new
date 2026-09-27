import 'package:flutter/material.dart';

class HotelsDealsSection extends StatelessWidget {
  const HotelsDealsSection({super.key});

  static const _deals = [
    ('Weekly Deals to Asia', 'assets/images/1.jpg'),
    ('Super Deals to Japan', 'assets/images/2.jpg'),
    ('Mountain Escape', 'assets/images/3.jpg'),
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch, 
      children: [
        Text(
          'Deals',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w800,
            color: const Color(0xFF1F2937),
          ),
        ),
        const SizedBox(height: 10),
        SizedBox(
          height: 72,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: _deals.length,
            separatorBuilder: (context, index) => const SizedBox(width: 10),
            itemBuilder: (context, index) {
              final deal = _deals[index];
              return _DealBannerCard(title: deal.$1, imageAsset: deal.$2);
            },
          ),
        ),
      ],
    );
  }
}

class _DealBannerCard extends StatelessWidget {
  const _DealBannerCard({
    required this.title,
    required this.imageAsset,
  });

  final String title;
  final String imageAsset;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 184,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: Stack(
          fit: StackFit.expand,
          children: [
            Image.asset(imageAsset, fit: BoxFit.cover),
            DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.centerLeft,
                  end: Alignment.centerRight,
                  colors: [
                    Colors.white.withValues(alpha: 0.92),
                    Colors.white.withValues(alpha: 0.45),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(10),
              child: Row(
                children: [
                  const Icon(
                    Icons.flight_takeoff_rounded,
                    color: Color(0xFF2563EB),
                    size: 20,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.labelLarge?.copyWith(
                        color: const Color(0xFF2563EB),
                        fontWeight: FontWeight.w800,
                        height: 1.1,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
