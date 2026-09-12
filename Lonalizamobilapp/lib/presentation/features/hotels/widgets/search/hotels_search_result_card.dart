import 'package:flutter/material.dart';

import '../../../../../core/theme/lonaliza_theme.dart';

class HotelsSearchResultCard extends StatelessWidget {
  const HotelsSearchResultCard({
    super.key,
    required this.name,
    required this.rating,
    required this.score,
    required this.scoreLabel,
    required this.location,
    required this.tag,
    required this.description,
    this.imageAsset = 'assets/images/1.jpg',
    this.imageUrl,
    required this.footerNote,
    this.isHighlighted = false,
    this.onTap,
  });

  final String name;
  final int rating;
  final String score;
  final String scoreLabel;
  final String location;
  final String tag;
  final String description;
  final String imageAsset;
  final String? imageUrl;
  final String footerNote;
  final bool isHighlighted;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(22),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(
            color: isHighlighted ? LonalizaColors.primary : const Color(0xFFE8E0F5),
            width: isHighlighted ? 1.5 : 1,
          ),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF2E1065).withValues(alpha: 0.08),
              blurRadius: 16,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            SizedBox(
              height: 168,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  imageUrl != null && imageUrl!.isNotEmpty
                      ? Image.network(imageUrl!, fit: BoxFit.cover)
                      : Image.asset(imageAsset, fit: BoxFit.cover),
                  const DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [Colors.transparent, Color(0x99000000)],
                      ),
                    ),
                  ),
                  if (score.isNotEmpty)
                    Positioned(
                      top: 10,
                      right: 10,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: LonalizaColors.royalPurple,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          score,
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800),
                        ),
                      ),
                    ),
                  Positioned(
                    left: 12,
                    right: 12,
                    bottom: 10,
                    child: Text(
                      name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 18),
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 12, 14, 14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      for (int i = 0; i < rating.clamp(0, 5); i++)
                        const Icon(Icons.star_rounded, size: 16, color: Color(0xFFFFB400)),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          location,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(color: LonalizaColors.muted),
                        ),
                      ),
                    ],
                  ),
                  if (tag.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFD1FAE5),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        tag,
                        style: const TextStyle(color: Color(0xFF047857), fontWeight: FontWeight.w700, fontSize: 11),
                      ),
                    ),
                  ],
                  if (description.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Text(description, maxLines: 2, overflow: TextOverflow.ellipsis),
                  ],
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          scoreLabel.isNotEmpty ? scoreLabel : 'إلغاء مرن حسب الغرفة',
                          style: const TextStyle(color: LonalizaColors.muted, fontSize: 12),
                        ),
                      ),
                      Text(
                        footerNote,
                        style: const TextStyle(
                          color: Color(0xFFD97706),
                          fontWeight: FontWeight.w900,
                          fontSize: 18,
                        ),
                      ),
                    ],
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
