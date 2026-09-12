import 'package:flutter/material.dart';

/// Top booking recap: dates, nights, room type, inclusions, instant confirmation strip.
class HotelBookingSummaryCard extends StatelessWidget {
  const HotelBookingSummaryCard({super.key});

  static const _accentTime = Color(0xFFB45309);
  static const _teal = Color(0xFF0F766E);
  static const _tealBg = Color(0xFFE6FFFA);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Check-in',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: const Color(0xFF6B7280),
                            fontWeight: FontWeight.w500,
                          ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Thu, Apr 23',
                      style: Theme.of(context).textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.w800,
                            color: const Color(0xFF111827),
                          ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '15:00 - 24:00',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: _accentTime,
                            fontWeight: FontWeight.w600,
                          ),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      'Check-out',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: const Color(0xFF6B7280),
                            fontWeight: FontWeight.w500,
                          ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Sat, Apr 25',
                      style: Theme.of(context).textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.w800,
                            color: const Color(0xFF111827),
                          ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '12:00 - 11:00',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: _accentTime,
                            fontWeight: FontWeight.w600,
                          ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Center(
            child: Text(
              '2 nights',
              style: Theme.of(context).textTheme.labelMedium?.copyWith(
                    color: const Color(0xFF6B7280),
                    fontWeight: FontWeight.w600,
                  ),
            ),
          ),
          const SizedBox(height: 8),
          Divider(height: 1, thickness: 1, color: Colors.grey.shade200),
          const SizedBox(height: 12),
          Text(
            'Capsule Cocoon | 1 Room',
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  fontWeight: FontWeight.w800,
                  color: const Color(0xFF111827),
                ),
          ),
          const SizedBox(height: 10),
          const _SummaryLine(icon: Icons.person_outline_rounded, text: 'Price for 1 Adult'),
          const _SummaryLine(icon: Icons.bed_outlined, text: '1 capsule bed'),
          const _SummaryLine(icon: Icons.smoke_free_outlined, text: 'Non-smoking'),
          const _SummaryLine(icon: Icons.restaurant_outlined, text: 'Meals not included'),
          const _SummaryLine(icon: Icons.info_outline_rounded, text: 'Non-refundable'),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: _tealBg,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.flash_on_rounded, size: 18, color: _teal),
                    const SizedBox(width: 8),
                    Text(
                      'Instant confirmation',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: _teal,
                            fontWeight: FontWeight.w600,
                          ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(Icons.local_offer_outlined, size: 18, color: _teal),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Mobile Only: Save \$12.81 on this room',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: _teal,
                              fontWeight: FontWeight.w600,
                              height: 1.25,
                            ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SummaryLine extends StatelessWidget {
  const _SummaryLine({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 18, color: const Color(0xFF6B7280)),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              text,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: const Color(0xFF111827),
                    fontWeight: FontWeight.w500,
                  ),
            ),
          ),
        ],
      ),
    );
  }
}
