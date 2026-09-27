import 'package:flutter/material.dart';

class HotelsShortcutsSheet extends StatelessWidget {
  const HotelsShortcutsSheet({super.key});

  static const _items = [
    (Icons.home_outlined, 'Home'),
    (Icons.mail_outline_rounded, 'Messages'),
    (Icons.calendar_month_outlined, 'All Bookings'),
    (Icons.smart_toy_outlined, 'TripGenie'),
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 18, 16, 18),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                children: [
                  const Spacer(),
                  Text(
                    'Shortcuts',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const Spacer(),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close_rounded),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  for (int index = 0; index < _items.length; index++) ...[
                    Expanded(
                      child: _ShortcutItem(
                        icon: _items[index].$1,
                        label: _items[index].$2,
                        showAiBadge: index == _items.length - 1,
                      ),
                    ),
                    if (index != _items.length - 1) const SizedBox(width: 8),
                  ],
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ShortcutItem extends StatelessWidget {
  const _ShortcutItem({
    required this.icon,
    required this.label,
    required this.showAiBadge,
  });

  final IconData icon;
  final String label;
  final bool showAiBadge;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 96,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFD1D5DB)),
      ),
      child: Stack(
        children: [
          Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(icon, size: 26, color: const Color(0xFF111827)),
                const SizedBox(height: 8),
                Text(
                  label,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.labelMedium?.copyWith(
                    color: const Color(0xFF1F2937),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
          if (showAiBadge)
            Positioned(
              top: 8,
              right: 8,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFFDBEAFE),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: const Text(
                  'AI',
                  style: TextStyle(
                    color: Color(0xFF2563EB),
                    fontSize: 11,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
