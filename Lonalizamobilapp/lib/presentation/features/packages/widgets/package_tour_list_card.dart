import 'package:flutter/material.dart';

class PackageTourListCard extends StatelessWidget {
  const PackageTourListCard({
    super.key,
    required this.imagePath,
    required this.imageLabel,
    required this.rating,
    required this.title,
    required this.language,
    required this.transferIncluded,
    required this.departFrom,
    required this.price,
    this.reviewScore,
    this.reviewCount,
    this.bookedCount,
    this.visitingDays,
    this.freeCancellation = false,
    this.departureGuaranteed = false,
    this.freeEsim = false,
    this.saleLabel,
    this.saleOff,
    this.onTap,
  });

  final String imagePath;
  final String imageLabel;     // e.g. "Private Tours"
  final String rating;         // e.g. "4" or "5"
  final String title;
  final String language;       // e.g. "English/Mandarin | Tour guide included"
  final String transferIncluded;
  final String departFrom;
  final String price;          // e.g. "\$1,686"
  final String? reviewScore;   // e.g. "5.0/5"
  final int? reviewCount;
  final int? bookedCount;
  final String? visitingDays;  // e.g. "3 days visiting Beijing"
  final bool freeCancellation;
  final bool departureGuaranteed;
  final bool freeEsim;
  final String? saleLabel;     // e.g. "Limited-time sale"
  final String? saleOff;       // e.g. "\$6 off >"
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.06),
              blurRadius: 10,
              offset: const Offset(0, 3),
            )
          ],
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Left: Image with label
            ClipRRect(
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(14),
                bottomLeft: Radius.circular(14),
              ),
              child: SizedBox(
                width: 110,
                height: 165,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    Image.asset(imagePath, fit: BoxFit.cover),
                    // Gradient overlay
                    Container(
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [Colors.transparent, Color(0x99000000)],
                          stops: [0.55, 1.0],
                        ),
                      ),
                    ),
                    // "Private Tours" label at the bottom
                    Positioned(
                      left: 6,
                      bottom: 7,
                      child: Text(
                        imageLabel,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          shadows: [Shadow(color: Colors.black54, blurRadius: 4)],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // ── Right: Details
            Expanded(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(10, 10, 10, 10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Rating badge + title
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Blue badge
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFF7C3AED),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(rating,
                                  style: const TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.white)),
                              const SizedBox(width: 2),
                              const Icon(Icons.favorite_rounded, size: 9, color: Colors.white),
                            ],
                          ),
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            title,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF111827),
                              height: 1.3,
                            ),
                          ),
                        ),
                      ],
                    ),

                    // Review score row (optional)
                    if (reviewScore != null) ...[
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Text(
                            reviewScore!,
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                              color: Color(0xFF111827),
                            ),
                          ),
                          if (reviewCount != null)
                            Text(
                              '  ${reviewCount} reviews',
                              style: const TextStyle(fontSize: 11, color: Color(0xFF6B7280)),
                            ),
                          if (bookedCount != null)
                            Text(
                              '  |  $bookedCount booked',
                              style: const TextStyle(fontSize: 11, color: Color(0xFF6B7280)),
                            ),
                        ],
                      ),
                    ],

                    const SizedBox(height: 5),

                    // Language
                    _InfoRow(icon: Icons.article_outlined, text: language),
                    const SizedBox(height: 3),
                    // Visiting days (optional)
                    if (visitingDays != null) ...[
                      _InfoRow(icon: Icons.location_on_outlined, text: visitingDays!, highlight: true),
                      const SizedBox(height: 3),
                    ],
                    // Transfer
                    _InfoRow(icon: Icons.directions_bus_outlined, text: transferIncluded),
                    const SizedBox(height: 3),
                    // Depart from
                    _InfoRow(icon: Icons.play_circle_outline_rounded, text: departFrom),

                    const SizedBox(height: 6),

                    // Tags row
                    Wrap(
                      spacing: 6,
                      runSpacing: 4,
                      children: [
                        if (freeCancellation)
                          _Tag(label: 'Free cancellation', color: const Color(0xFF10B981)),
                        if (departureGuaranteed)
                          _Tag(label: 'Departure guaranteed', color: const Color(0xFF6B7280)),
                        if (freeEsim)
                          _Tag(label: 'Free eSIM card', color: const Color(0xFF6B7280)),
                      ],
                    ),

                    // Sale badge row (optional)
                    if (saleLabel != null) ...[
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          Text(
                            saleLabel!,
                            style: const TextStyle(fontSize: 10, color: Color(0xFFEC4899), fontWeight: FontWeight.w600),
                          ),
                          if (saleOff != null) ...[
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFFEC4899),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                saleOff!,
                                style: const TextStyle(fontSize: 10, color: Colors.white, fontWeight: FontWeight.bold),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ],

                    const SizedBox(height: 8),

                    // Price aligned right
                    Align(
                      alignment: Alignment.centerRight,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            crossAxisAlignment: CrossAxisAlignment.baseline,
                            textBaseline: TextBaseline.alphabetic,
                            children: [
                              const Text(
                                'From ',
                                style: TextStyle(fontSize: 12, color: Color(0xFF6B7280)),
                              ),
                              Text(
                                price,
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.w800,
                                  color: Color(0xFF7C3AED),
                                ),
                              ),
                            ],
                          ),
                          const Text(
                            '(incl. taxes & fees)',
                            style: TextStyle(fontSize: 9, color: Color(0xFF9CA3AF)),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Small info row with icon
class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.icon, required this.text, this.highlight = false});
  final IconData icon;
  final String text;
  final bool highlight;

  @override
  Widget build(BuildContext context) {
    final color = highlight ? const Color(0xFF7C3AED) : const Color(0xFF6B7280);
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 12, color: color),
        const SizedBox(width: 4),
        Expanded(
          child: Text(
            text,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(fontSize: 11, color: color, fontWeight: highlight ? FontWeight.w600 : FontWeight.w400),
          ),
        ),
      ],
    );
  }
}

// ── Small coloured tag chip
class _Tag extends StatelessWidget {
  const _Tag({required this.label, required this.color});
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Text(
      label,
      style: TextStyle(
        fontSize: 10,
        fontWeight: FontWeight.w600,
        color: color,
      ),
    );
  }
}
