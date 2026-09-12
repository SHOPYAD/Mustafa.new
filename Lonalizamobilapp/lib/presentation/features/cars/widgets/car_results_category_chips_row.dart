import 'package:flutter/material.dart';

import '../car_search_results_theme.dart';

/// Row 2: outlined size chips + SUV (reference: grey border, navy icons/text).
class CarResultsCategoryChipsRow extends StatelessWidget {
  const CarResultsCategoryChipsRow({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.fromLTRB(12, 0, 12, 0),
        child: Row(
          children: [
            _SizeChip(icon: Icons.directions_car_outlined, iconSize: 16, label: 'Small'),
            const SizedBox(width: 8),
            _SizeChip(icon: Icons.directions_car_outlined, iconSize: 18, label: 'Medium'),
            const SizedBox(width: 8),
            _SizeChip(icon: Icons.directions_car_outlined, iconSize: 20, label: 'Large'),
            const SizedBox(width: 8),
            _SuvChip(),
          ],
        ),
      ),
    );
  }
}

class _SizeChip extends StatelessWidget {
  const _SizeChip({
    required this.icon,
    required this.iconSize,
    required this.label,
  });

  final IconData icon;
  final double iconSize;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {},
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: CarSearchResultsTheme.chipBorder),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: iconSize, color: CarSearchResultsTheme.navy),
              const SizedBox(width: 6),
              Text(
                label,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: CarSearchResultsTheme.navy,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SuvChip extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {},
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: CarSearchResultsTheme.chipBorder),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.airport_shuttle_outlined, size: 20, color: CarSearchResultsTheme.navy),
              const SizedBox(width: 4),
              Icon(Icons.keyboard_arrow_down_rounded, size: 18, color: CarSearchResultsTheme.navy.withValues(alpha: 0.85)),
            ],
          ),
        ),
      ),
    );
  }
}
