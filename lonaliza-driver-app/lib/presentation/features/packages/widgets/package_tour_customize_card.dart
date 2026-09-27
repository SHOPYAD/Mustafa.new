import 'package:flutter/material.dart';

/// "Need to adjust your itinerary?" card with action chips and contact button
class PackageTourCustomizeCard extends StatelessWidget {
  const PackageTourCustomizeCard({super.key});

  static const _chips = [
    'Change the number of days in the itinerary?',
    'Change hotels?',
    'Change attractions?',
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Need to adjust your itinerary? Feel free to do so.',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF111827), height: 1.4),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _chips.map((chip) => _ActionChip(label: chip)).toList(),
          ),
          const SizedBox(height: 14),
          GestureDetector(
            onTap: () {},
            child: const Row(
              children: [
                Icon(Icons.chat_bubble_outline_rounded, size: 16, color: Color(0xFF2563EB)),
                SizedBox(width: 6),
                Text(
                  'Contact Tour Operator',
                  style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF2563EB)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ActionChip extends StatelessWidget {
  const _ActionChip({required this.label});
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFFF3F4F6),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(label, style: const TextStyle(fontSize: 12, color: Color(0xFF374151))),
    );
  }
}
