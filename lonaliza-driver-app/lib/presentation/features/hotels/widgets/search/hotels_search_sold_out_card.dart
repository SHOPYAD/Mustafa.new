import 'package:flutter/material.dart';

class HotelsSearchSoldOutCard extends StatelessWidget {
  const HotelsSearchSoldOutCard({
    super.key,
    required this.name,
    required this.location,
    required this.description,
    required this.imageAsset,
  });

  final String name;
  final String location;
  final String description;
  final String imageAsset;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 160,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE5E7EB)),
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
                Image.asset(imageAsset, fit: BoxFit.cover),
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
                  Text(
                    name,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      color: const Color(0xFF111827),
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: const [
                      Icon(Icons.circle, size: 8, color: Color(0xFFFFB400)),
                      SizedBox(width: 2),
                      Icon(Icons.circle, size: 8, color: Color(0xFFFFB400)),
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
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFF2563EB),
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: const [
                        Icon(Icons.map_outlined, size: 16, color: Colors.white),
                        SizedBox(width: 6),
                        Text(
                          'Map',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        SizedBox(width: 10),
                        Icon(
                          Icons.favorite_rounded,
                          size: 16,
                          color: Colors.white,
                        ),
                        SizedBox(width: 6),
                        Text(
                          'Saved',
                          style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    description,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      color: const Color(0xFF111827),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
