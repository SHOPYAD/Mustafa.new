import 'package:flutter/material.dart';

/// Hotel card for one city stop in the confirm options page
class PackageConfirmHotelCard extends StatelessWidget {
  const PackageConfirmHotelCard({
    super.key,
    required this.checkIn,
    required this.nights,
    required this.checkOut,
    required this.city,
    required this.imagePath,
    required this.hotelName,
    required this.highlights,
    required this.location,
    required this.rating,
    required this.ratingCount,
    required this.roomType,
    required this.bedType,
    this.cancellationPolicy,
    this.warningText,
    this.promoText,
  });

  final String checkIn;
  final int nights;
  final String checkOut;
  final String city;
  final String imagePath;
  final String hotelName;
  final List<String> highlights;   // e.g. ["Easy to get around", "Close to metro"]
  final String location;
  final double rating;
  final String ratingCount;
  final String roomType;
  final String bedType;
  final String? cancellationPolicy;
  final String? warningText;
  final String? promoText;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 0),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Check-in / nights / check-out / city header
          Row(
            children: [
              Text(checkIn, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF111827))),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 6),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF3F4F6),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text('$nights nights',
                      style: const TextStyle(fontSize: 11, color: Color(0xFF6B7280), fontWeight: FontWeight.w500)),
                ),
              ),
              Text(checkOut, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF111827))),
              Text('  |  $city', style: const TextStyle(fontSize: 13, color: Color(0xFF6B7280))),
            ],
          ),
          const SizedBox(height: 12),

          // ── Hotel image + info row
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Image
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: Image.asset(imagePath, width: 90, height: 90, fit: BoxFit.cover),
              ),
              const SizedBox(width: 12),

              // Info column
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Hotel name with chevron
                    Text(hotelName,
                        style: const TextStyle(
                          fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF111827))),
                    const SizedBox(height: 4),

                    // Highlights (orange/amber text)
                    ...highlights.map((h) => Text('"$h"',
                        style: const TextStyle(fontSize: 12, color: Color(0xFFF59E0B), fontWeight: FontWeight.w500))),
                    const SizedBox(height: 4),

                    // Location
                    Text(location,
                        style: const TextStyle(fontSize: 11, color: Color(0xFF6B7280)),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis),
                    const SizedBox(height: 6),

                    // Star rating
                    Row(
                      children: [
                        ...List.generate(rating.floor(), (_) =>
                            const Icon(Icons.star_rounded, size: 14, color: Color(0xFFF59E0B))),
                        if (rating % 1 >= 0.5)
                          const Icon(Icons.star_half_rounded, size: 14, color: Color(0xFFF59E0B)),
                        Text('  $rating/5 ', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF111827))),
                        const Text('Hotel policies', style: TextStyle(fontSize: 11, color: Color(0xFF7C3AED))),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          const Divider(height: 1, thickness: 1, color: Color(0xFFF3F4F6)),
          const SizedBox(height: 8),

          // ── Room selection row
          Row(
            children: [
              const Icon(Icons.bed_outlined, size: 13, color: Color(0xFF7C3AED)),
              const SizedBox(width: 2),
              GestureDetector(
                onTap: () {},
                child: const Text('1 room  ∨', style: TextStyle(fontSize: 12, color: Color(0xFF7C3AED), fontWeight: FontWeight.w600)),
              ),
              const SizedBox(width: 10),
              GestureDetector(
                onTap: () {},
                child: Text('$roomType  ›',
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF111827))),
              ),
              const Spacer(),
              GestureDetector(
                onTap: () {},
                child: Row(
                  children: const [
                    Icon(Icons.swap_horiz_rounded, size: 14, color: Color(0xFF7C3AED)),
                    SizedBox(width: 2),
                    Text('Other room types', style: TextStyle(fontSize: 11, color: Color(0xFF7C3AED))),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(bedType, style: const TextStyle(fontSize: 12, color: Color(0xFF6B7280))),

          // ── Cancellation policy
          if (cancellationPolicy != null) ...[
            const SizedBox(height: 4),
            Text(cancellationPolicy!,
                style: const TextStyle(fontSize: 11, color: Color(0xFFEF4444))),
          ],

          // ── Warning text (e.g. "A max. of 3 rooms")
          if (warningText != null) ...[
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.info_outline_rounded, size: 13, color: Color(0xFFEF4444)),
                const SizedBox(width: 4),
                Text(warningText!, style: const TextStyle(fontSize: 11, color: Color(0xFFEF4444))),
              ],
            ),
          ],

          // ── Promo box
          if (promoText != null) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFFEFF6FF),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('🎁 ', style: TextStyle(fontSize: 13)),
                  Expanded(
                    child: Text(promoText!,
                        style: const TextStyle(fontSize: 12, color: Color(0xFF7C3AED), height: 1.4)),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
