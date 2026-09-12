import 'package:flutter/material.dart';

import '../car_detail_theme.dart';

class CarDetailExpandableItem extends StatelessWidget {
  const CarDetailExpandableItem({
    super.key,
    required this.title,
    required this.body,
    required this.expanded,
    required this.onToggle,
    this.previewWhenCollapsed,
  });

  final String title;
  final String body;
  final bool expanded;
  final VoidCallback onToggle;
  final String? previewWhenCollapsed;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        InkWell(
          onTap: onToggle,
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 14),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.check_circle_rounded, size: 22, color: CarDetailTheme.tealCheck),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(title, style: CarDetailTheme.accordionTitle),
                      if (!expanded && previewWhenCollapsed != null) ...[
                        const SizedBox(height: 4),
                        Text(
                          previewWhenCollapsed!,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: CarDetailTheme.accordionBody.copyWith(fontSize: 13),
                        ),
                      ],
                    ],
                  ),
                ),
                Icon(
                  expanded ? Icons.keyboard_arrow_up_rounded : Icons.keyboard_arrow_down_rounded,
                  color: Colors.grey.shade600,
                ),
              ],
            ),
          ),
        ),
        if (expanded)
          Padding(
            padding: const EdgeInsets.only(left: 34, bottom: 8),
            child: Text(body, style: CarDetailTheme.accordionBody),
          ),
        Divider(height: 1, thickness: 1, color: Colors.grey.shade200),
      ],
    );
  }
}
