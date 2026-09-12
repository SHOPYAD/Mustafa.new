import 'package:flutter/material.dart';

class HotelDetailsBottomActionBar extends StatelessWidget {
  const HotelDetailsBottomActionBar({super.key});

  static const _blue = Color(0xFF7C3AED);

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      child: Container(
        color: Colors.white,
        padding: const EdgeInsets.fromLTRB(12, 8, 12, 10),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.baseline,
                    textBaseline: TextBaseline.alphabetic,
                    children: [
                      Text(
                        '\$138',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                              color: _blue,
                              fontWeight: FontWeight.w800,
                              fontSize: 22,
                            ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '\$146',
                        style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              decoration: TextDecoration.lineThrough,
                              color: const Color(0xFF9CA3AF),
                              fontSize: 13,
                            ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '1 room × 2 nights incl. taxes & fees',
                    style: Theme.of(context).textTheme.bodySmall?.copyWith(
                          color: const Color(0xFF6B7280),
                          fontSize: 11,
                        ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 10),
            FilledButton(
              onPressed: () {},
              style: FilledButton.styleFrom(
                backgroundColor: _blue,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: const Text(
                'Select Rooms',
                style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
