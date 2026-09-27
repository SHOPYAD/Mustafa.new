import 'package:flutter/material.dart';

class HotelsSearchFilterChipsRow extends StatelessWidget {
  const HotelsSearchFilterChipsRow({
    super.key,
    this.onSortTap,
    this.onFiltersTap,
  });

  final VoidCallback? onSortTap;
  final VoidCallback? onFiltersTap;

  static const _chips = [
    ('Sort', Icons.swap_vert_rounded),
    ('Filters', Icons.tune_rounded),
    ('Location', Icons.location_on_outlined),
    ('Popular Filters', Icons.keyboard_arrow_down_rounded),
    ('More', null),
  ];

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF2563EB),
      padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            for (final chip in _chips) ...[
              _SearchHeaderChip(
                label: chip.$1,
                icon: chip.$2,
                onTap: switch (chip.$1) {
                  'Sort' => onSortTap,
                  'Filters' => onFiltersTap,
                  _ => null,
                },
              ),
              const SizedBox(width: 8),
            ],
          ],
        ),
      ),
    );
  }
}

class _SearchHeaderChip extends StatelessWidget {
  const _SearchHeaderChip({
    required this.label,
    this.icon,
    this.onTap,
  });

  final String label;
  final IconData? icon;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(999),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: const Color(0xFF2563EB),
          borderRadius: BorderRadius.circular(999),
          border: Border.all(color: Colors.white.withValues(alpha: 0.8)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[
              Icon(icon, size: 16, color: Colors.white),
              const SizedBox(width: 6),
            ],
            Text(
              label,
              style: Theme.of(context).textTheme.labelMedium?.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
