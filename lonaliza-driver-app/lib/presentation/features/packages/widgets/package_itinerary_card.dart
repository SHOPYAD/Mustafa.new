import 'package:flutter/material.dart';

class PackageItineraryCard extends StatelessWidget {
  const PackageItineraryCard({
    super.key,
    required this.imagePath,
    required this.title,
    required this.subtitle,
    required this.duration,
    required this.price,
    required this.productId,
    required this.rating,
    required this.reviewCount,
    this.routeStops = const [],
  });

  final String imagePath;
  final String title;
  final String subtitle;
  final String duration;
  final String price;
  final String productId;
  final String rating;
  final int reviewCount;
  final List<String> routeStops;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 280,
      margin: const EdgeInsets.only(right: 12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(14),
        color: Colors.white,
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Image with overlaid info
          SizedBox(
            height: 160,
            child: Stack(
              fit: StackFit.expand,
              children: [
                Image.asset(imagePath, fit: BoxFit.cover),
                // Bottom-left overlay: title
                Positioned(
                  left: 12,
                  bottom: 40,
                  right: 80,
                  child: Text(
                    title,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      shadows: [Shadow(color: Colors.black54, blurRadius: 6)],
                    ),
                  ),
                ),
                // Subtitle (Recommended X days)
                Positioned(
                  left: 12,
                  bottom: 22,
                  child: Text(
                    subtitle,
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 12,
                      shadows: [Shadow(color: Colors.black54, blurRadius: 4)],
                    ),
                  ),
                ),
                // "Explore all →" chip top-right
                Positioned(
                  top: 10,
                  right: 10,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Row(
                      children: [
                        Text('Explore all', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF111827))),
                        SizedBox(width: 4),
                        Icon(Icons.arrow_forward_rounded, size: 12, color: Color(0xFF111827)),
                      ],
                    ),
                  ),
                ),
                // Route stops dots at bottom
                if (routeStops.isNotEmpty)
                  Positioned(
                    left: 12,
                    bottom: 6,
                    right: 12,
                    child: _RouteBar(stops: routeStops),
                  ),
              ],
            ),
          ),

          // ── Card bottom info
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Rating badge + duration + type
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFF2563EB),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Row(
                        children: [
                          Text(
                            rating,
                            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                          const SizedBox(width: 3),
                          const Icon(Icons.favorite_rounded, size: 10, color: Colors.white),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        '$duration · Private Tour · China + ...',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontSize: 12, color: Color(0xFF6B7280)),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                // Price row
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.baseline,
                      textBaseline: TextBaseline.alphabetic,
                      children: [
                        const Text('From ', style: TextStyle(fontSize: 12, color: Color(0xFF6B7280))),
                        Text(
                          price,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF2563EB),
                          ),
                        ),
                      ],
                    ),
                    Text(
                      'Product ID $productId',
                      style: const TextStyle(fontSize: 10, color: Color(0xFF9CA3AF)),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _RouteBar extends StatelessWidget {
  const _RouteBar({required this.stops});
  final List<String> stops;

  @override
  Widget build(BuildContext context) {
    // Build alternating: stop | line | stop | line | ...
    final items = <Widget>[];
    for (int i = 0; i < stops.length; i++) {
      final isLast = i == stops.length - 1;
      items.add(
        Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 6,
              height: 6,
              decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
            ),
            const SizedBox(height: 2),
            Text(
              stops[i],
              style: const TextStyle(color: Colors.white, fontSize: 8),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      );
      if (!isLast) {
        items.add(
          Expanded(
            child: Container(
              height: 1,
              color: Colors.white54,
              margin: const EdgeInsets.only(bottom: 14),
            ),
          ),
        );
      }
    }
    return Row(children: items);
  }
}
