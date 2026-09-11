import 'package:flutter/material.dart';

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
      borderRadius: BorderRadius.circular(14),
      child: Container(
        height: 188,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isHighlighted
                ? const Color(0xFF2563EB)
                : const Color(0xFFE5E7EB),
            width: isHighlighted ? 1.5 : 1,
          ),
        ),
        clipBehavior: Clip.antiAlias,
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            SizedBox(
              width: 130,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  imageUrl != null && imageUrl!.isNotEmpty
                      ? Image.network(imageUrl!, fit: BoxFit.cover)
                      : Image.asset(imageAsset, fit: BoxFit.cover),
                  const Positioned(
                    top: 6,
                    left: 6,
                    child: Icon(
                      Icons.favorite_border_rounded,
                      color: Colors.white,
                      size: 22,
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(10, 10, 10, 10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: Theme.of(context).textTheme.titleSmall?.copyWith(
                            color: const Color(0xFF111827),
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                      const SizedBox(width: 4),
                      const Icon(
                        Icons.star_rate_rounded,
                        size: 14,
                        color: Color(0xFF2563EB),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      for (int i = 0; i < rating; i++)
                        const Icon(
                          Icons.star_rounded,
                          size: 14,
                          color: Color(0xFFFFB400),
                        ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 6,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFF2563EB),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          score,
                          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        scoreLabel,
                        style: Theme.of(context).textTheme.labelMedium?.copyWith(
                          color: const Color(0xFF2563EB),
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    location,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: const Color(0xFF374151),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 6,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFFD1FAE5),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      tag,
                      style: Theme.of(context).textTheme.labelSmall?.copyWith(
                        color: const Color(0xFF047857),
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    description,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: const Color(0xFF111827),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(
                        Icons.info_outline_rounded,
                        size: 14,
                        color: Color(0xFF6B7280),
                      ),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          footerNote,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: Theme.of(context).textTheme.labelMedium?.copyWith(
                            color: const Color(0xFF6B7280),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
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
