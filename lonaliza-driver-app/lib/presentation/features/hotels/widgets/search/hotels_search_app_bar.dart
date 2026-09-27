import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class HotelsSearchAppBar extends StatelessWidget {
  const HotelsSearchAppBar({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(8, 10, 12, 12),
      decoration: const BoxDecoration(
        color: Color(0xFF2563EB),
      ),
      child: SafeArea(
        bottom: false,
        child: Row(
          children: [
            IconButton(
              onPressed: () {
                if (context.canPop()) {
                  context.pop();
                } else {
                  context.go('/hotels');
                }
              },
              icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
            ),
            Expanded(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Apr 22',
                          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                            color: const Color(0xFF6B7280),
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        Text(
                          'Apr 23',
                          style: Theme.of(context).textTheme.labelSmall?.copyWith(
                            color: const Color(0xFF111827),
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ],
                    ),
                    const Icon(
                      Icons.arrow_drop_down_rounded,
                      color: Color(0xFF6B7280),
                    ),
                    const SizedBox(width: 6),
                    Container(width: 1, height: 24, color: const Color(0xFFE5E7EB)),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Al Wadi Al Gadid Desert, New Valley...',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.labelLarge?.copyWith(
                          color: const Color(0xFF111827),
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 10),
            Column(
              children: const [
                Icon(Icons.currency_exchange_rounded, color: Colors.white),
                SizedBox(height: 2),
                Text(
                  'USD',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
