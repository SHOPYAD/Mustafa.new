import 'package:flutter/material.dart';

/// Rich hotel info block (title, reviews, highlights, location snippets, amenities).
/// Layout tuned to match common OTA detail pages — no internal scroll.
class HotelDetailsPropertySummary extends StatelessWidget {
  const HotelDetailsPropertySummary({super.key});

  static const _blue = Color(0xFF7C3AED);

  @override
  Widget build(BuildContext context) {
    final body = Theme.of(context).textTheme.bodyMedium;
    final titleSm = Theme.of(context).textTheme.titleSmall;

    return Container(
      padding: const EdgeInsets.fromLTRB(16, 18, 16, 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  'Holiday Inn Express LONDON - SOUTHWARK by IHG',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontSize: 20,
                        height: 1.25,
                        color: const Color(0xFF111827),
                        fontWeight: FontWeight.w700,
                      ),
                ),
              ),
              const SizedBox(width: 8),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  for (int i = 0; i < 3; i++)
                    const Padding(
                      padding: EdgeInsets.only(top: 2),
                      child: Icon(Icons.star_rounded, color: Color(0xFFFFC107), size: 20),
                    ),
                  const SizedBox(width: 4),
                  const Padding(
                    padding: EdgeInsets.only(top: 1),
                    child: Icon(Icons.thumb_up_alt_outlined, color: Color(0xFFFFC107), size: 20),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Text(
                  '103-109 Southwark St, Southwark, London, SE1 0JQ, United Kingdom',
                  style: body?.copyWith(
                    fontSize: 14,
                    height: 1.35,
                    color: const Color(0xFF6B7280),
                    fontWeight: FontWeight.w400,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              GestureDetector(
                onTap: () {},
                child: Text(
                  'View on map',
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                        color: _blue,
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        decoration: TextDecoration.underline,
                        decorationColor: _blue,
                      ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          const _HairlineDivider(),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            crossAxisAlignment: WrapCrossAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: _blue,
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  '8.8/10',
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                      ),
                ),
              ),
              Text(
                'Very good',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: _blue,
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                    ),
              ),
              GestureDetector(
                onTap: () {},
                child: Text(
                  '178 reviews',
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: _blue,
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        decoration: TextDecoration.underline,
                        decorationColor: _blue,
                      ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            '“Excellent location with a beautiful surrounding environment.”',
            style: body?.copyWith(
              fontSize: 14,
              height: 1.4,
              color: const Color(0xFF374151),
              fontStyle: FontStyle.italic,
            ),
          ),
          const SizedBox(height: 14),
          const _HairlineDivider(),
          const SizedBox(height: 14),
          Text(
            'Highlights',
            style: titleSm?.copyWith(
              fontSize: 16,
              fontWeight: FontWeight.w800,
              color: const Color(0xFF111827),
            ),
          ),
          const SizedBox(height: 12),
          const _TwoColGrid(
            children: [
              _HighlightTile(icon: Icons.graphic_eq_rounded, label: 'Quiet room'),
              _HighlightTile(icon: Icons.free_breakfast_outlined, label: 'Varied breakfast'),
              _HighlightTile(icon: Icons.cleaning_services_outlined, label: 'Sparkling clean'),
              _HighlightTile(icon: Icons.bed_outlined, label: 'Comfy rooms'),
            ],
          ),
          const SizedBox(height: 16),
          const _HairlineDivider(),
          const SizedBox(height: 14),
          Text(
            'Great Location',
            style: titleSm?.copyWith(
              fontSize: 16,
              fontWeight: FontWeight.w800,
              color: const Color(0xFF111827),
            ),
          ),
          const SizedBox(height: 10),
          const _LocationDistanceRow(
            icon: Icons.landscape_outlined,
            label: 'Attraction: London Eye',
            distance: '4101 ft',
          ),
          const SizedBox(height: 10),
          const _LocationDistanceRow(
            icon: Icons.train_outlined,
            label: 'Train: Waterloo East Station',
            distance: '1673 ft',
          ),
          const SizedBox(height: 10),
          const _LocationDistanceRow(
            icon: Icons.landscape_outlined,
            label: 'Attraction: The Shard',
            distance: '3642 ft',
          ),
          const SizedBox(height: 16),
          const _HairlineDivider(),
          const SizedBox(height: 14),
          Text(
            'Popular amenities',
            style: titleSm?.copyWith(
              fontSize: 16,
              fontWeight: FontWeight.w800,
              color: const Color(0xFF111827),
            ),
          ),
          const SizedBox(height: 12),
          const _AmenitiesGrid(),
          const SizedBox(height: 8),
        ],
      ),
    );
  }
}

class _HairlineDivider extends StatelessWidget {
  const _HairlineDivider();

  @override
  Widget build(BuildContext context) {
    return Divider(height: 1, thickness: 1, color: Colors.grey.shade200);
  }
}

class _HighlightTile extends StatelessWidget {
  const _HighlightTile({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 20, color: const Color(0xFF374151)),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            label,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontSize: 14,
                  color: const Color(0xFF111827),
                  fontWeight: FontWeight.w500,
                  height: 1.25,
                ),
          ),
        ),
      ],
    );
  }
}

class _TwoColGrid extends StatelessWidget {
  const _TwoColGrid({required this.children});

  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, c) {
        final half = (c.maxWidth - 16) / 2;
        final tileW = half > 0 ? half : (c.maxWidth / 2);
        return Wrap(
          spacing: 16,
          runSpacing: 12,
          children: [
            for (final w in children) SizedBox(width: tileW, child: w),
          ],
        );
      },
    );
  }
}

class _LocationDistanceRow extends StatelessWidget {
  const _LocationDistanceRow({
    required this.icon,
    required this.label,
    required this.distance,
  });

  final IconData icon;
  final String label;
  final String distance;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 20, color: const Color(0xFF4B5563)),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            label,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: const Color(0xFF111827),
                ),
          ),
        ),
        Text(
          distance,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                fontSize: 13,
                color: const Color(0xFF6B7280),
                fontWeight: FontWeight.w500,
              ),
        ),
      ],
    );
  }
}

class _AmenitiesGrid extends StatelessWidget {
  const _AmenitiesGrid();

  static const _items = [
    (Icons.local_parking_outlined, 'Private parking'),
    (Icons.luggage_outlined, 'Luggage storage'),
    (Icons.local_bar_outlined, 'Bar'),
    (Icons.restaurant_outlined, 'Restaurant'),
    (Icons.business_center_outlined, 'Business center'),
    (Icons.alarm_outlined, 'Wake-up call'),
  ];

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, c) {
        final w = (c.maxWidth - 12) / 2;
        return Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            for (final item in _items)
              SizedBox(
                width: w,
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(item.$1, size: 20, color: const Color(0xFF374151)),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        item.$2,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              fontSize: 14,
                              color: const Color(0xFF111827),
                              fontWeight: FontWeight.w500,
                              height: 1.25,
                            ),
                      ),
                    ),
                  ],
                ),
              ),
          ],
        );
      },
    );
  }
}
