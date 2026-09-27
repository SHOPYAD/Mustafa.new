import 'package:flutter/material.dart';

class FlightsQuickActionsRow extends StatelessWidget {
  const FlightsQuickActionsRow({super.key});

  static const _items = [
    (Icons.public_rounded, 'Anywhere'),
    (Icons.notifications_active_outlined, 'Price alerts'),
    (Icons.keyboard_arrow_down_rounded, 'More'),
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 14,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        children: [
          for (final item in _items)
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(
                      color: const Color(0xFFF3F7FF),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(item.$1, color: const Color(0xFF5A78F0)),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    item.$2,
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.labelLarge?.copyWith(
                      color: const Color(0xFF4B5563),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
