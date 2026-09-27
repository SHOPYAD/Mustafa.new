import 'package:flutter/material.dart';

class HotelsWhyBookSection extends StatelessWidget {
  const HotelsWhyBookSection({super.key});

  static const _items = [
    (
      Icons.verified_rounded,
      Color(0xFF22C1D6),
      'We price match',
      'We aim to offer you the best possible price. If you find a cheaper option elsewhere, we\'ll refund the difference.',
    ),
    (
      Icons.workspace_premium_rounded,
      Color(0xFFFFC107),
      'Get rewarded for traveling',
      'Get money-saving rewards with every booking, with no limits to how you spend them.',
    ),
    (
      Icons.verified_rounded,
      Color(0xFF22C1D6),
      'Support in approx. 30s',
      'We usually answer phone calls within 30 seconds',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Why book with Trip.com?',
          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
            fontSize: 18,
            color: const Color(0xFF111827),
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: 14),
        for (int index = 0; index < _items.length; index++) ...[
          _WhyBookItem(
            icon: _items[index].$1,
            iconColor: _items[index].$2,
            title: _items[index].$3,
            description: _items[index].$4,
          ),
          if (index != _items.length - 1) const SizedBox(height: 14),
        ],
      ],
    );
  }
}

class _WhyBookItem extends StatelessWidget {
  const _WhyBookItem({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.description,
  });

  final IconData icon;
  final Color iconColor;
  final String title;
  final String description;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(top: 2),
          child: Icon(icon, color: iconColor, size: 18),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  color: const Color(0xFF111827),
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 4),
              RichText(
                text: TextSpan(
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: const Color(0xFF6B7280),
                    height: 1.35,
                  ),
                  children: [
                    TextSpan(text: '$description '),
                    TextSpan(
                      text: 'Learn More',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: const Color(0xFF2563EB),
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
