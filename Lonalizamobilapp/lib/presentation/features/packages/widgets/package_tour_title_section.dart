import 'package:flutter/material.dart';

/// Title, badge chips and "recently viewed" text section
class PackageTourTitleSection extends StatelessWidget {
  const PackageTourTitleSection({
    super.key,
    required this.title,
    required this.tags,
    this.recentlyViewedCount,
  });

  final String title;
  final List<String> tags;
  final int? recentlyViewedCount;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Tour title
          Text(
            title,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              color: Color(0xFF111827),
              height: 1.3,
              letterSpacing: -0.3,
            ),
          ),
          const SizedBox(height: 10),

          // Tag chips row
          Wrap(
            spacing: 8,
            runSpacing: 6,
            children: tags.map((tag) => _TagChip(label: tag)).toList(),
          ),

          if (recentlyViewedCount != null) ...[
            const SizedBox(height: 10),
            const Divider(height: 1, thickness: 1, color: Color(0xFFF3F4F6)),
            const SizedBox(height: 10),
            Row(
              children: [
                const Icon(Icons.remove_red_eye_outlined, size: 14, color: Color(0xFF6B7280)),
                const SizedBox(width: 6),
                Text(
                  'Recently viewed by $recentlyViewedCount travelers',
                  style: const TextStyle(fontSize: 12, color: Color(0xFF6B7280)),
                ),
              ],
            ),
          ],
          const SizedBox(height: 16),
          const Divider(height: 1, thickness: 1, color: Color(0xFFF3F4F6)),
        ],
      ),
    );
  }
}

class _TagChip extends StatelessWidget {
  const _TagChip({required this.label});
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: const Color(0xFFF3F4F6),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        label,
        style: const TextStyle(fontSize: 12, color: Color(0xFF374151), fontWeight: FontWeight.w500),
      ),
    );
  }
}
