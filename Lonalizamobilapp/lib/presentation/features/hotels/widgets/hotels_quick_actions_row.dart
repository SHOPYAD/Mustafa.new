import 'package:flutter/material.dart';

class HotelsQuickActionsRow extends StatelessWidget {
  const HotelsQuickActionsRow({super.key});

  static const _items = [
    (Icons.favorite_rounded, 'Saved'),
    (Icons.receipt_long_rounded, 'Bookings'),
    (Icons.local_offer_rounded, 'My offers'),
    (Icons.notifications_active_outlined, 'Price Alerts'),
  ];

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceAround,
      children: [
        for (final item in _items)
          Expanded(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: const Color(0xFFEAF2FF),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(item.$1, color: const Color(0xFF7C3AED)),
                ),
                const SizedBox(height: 8),
                Text(
                  item.$2,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.labelMedium?.copyWith(
                    color: const Color(0xFF4B5563),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }
}
