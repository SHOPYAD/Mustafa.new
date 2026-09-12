import 'package:flutter/material.dart';

/// A single highlight row (icon + title + optional subtitle + optional chevron)
class PackageTourHighlightRow extends StatelessWidget {
  const PackageTourHighlightRow({
    super.key,
    required this.icon,
    required this.label,
    this.sublabel,
    this.hasChevron = false,
    this.onTap,
  });

  final Widget icon;
  final String label;
  final String? sublabel;
  final bool hasChevron;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SizedBox(width: 34, child: Center(child: icon)),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF111827),
                    ),
                  ),
                  if (sublabel != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      sublabel!,
                      style: const TextStyle(fontSize: 12, color: Color(0xFF6B7280)),
                    ),
                  ],
                ],
              ),
            ),
            if (hasChevron)
              const Icon(Icons.chevron_right_rounded, color: Color(0xFF9CA3AF), size: 20),
          ],
        ),
      ),
    );
  }
}

/// Section of highlight rows with dividers between them
class PackageTourHighlightsSection extends StatelessWidget {
  const PackageTourHighlightsSection({super.key, required this.rows});
  final List<PackageTourHighlightRow> rows;

  @override
  Widget build(BuildContext context) {
    final children = <Widget>[];
    for (int i = 0; i < rows.length; i++) {
      children.add(rows[i]);
      if (i < rows.length - 1) {
        children.add(const Divider(height: 1, thickness: 1, indent: 62, endIndent: 16, color: Color(0xFFF3F4F6)));
      }
    }
    return Column(children: children);
  }
}
