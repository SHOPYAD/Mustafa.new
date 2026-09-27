import 'package:flutter/material.dart';

class HotelsSortSheet extends StatefulWidget {
  const HotelsSortSheet({super.key});

  static const List<String> sortOptions = [
    'Trip.com recommended',
    'Straight-line distance (near to far)',
    'Top reviewed',
    'Lowest price (incl. tax)',
    'Highest price (incl. tax)',
    'Star rating (high to low)',
  ];

  @override
  State<HotelsSortSheet> createState() => _HotelsSortSheetState();
}

class _HotelsSortSheetState extends State<HotelsSortSheet> {
  String _selected = HotelsSortSheet.sortOptions.first;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      child: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              child: Row(
                children: [
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close_rounded, size: 24, color: Color(0xFF374151)),
                  ),
                  Expanded(
                    child: Text(
                      'Sort by',
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontSize: 24,
                            fontWeight: FontWeight.w700,
                            height: 1.2,
                            letterSpacing: -0.2,
                            color: const Color(0xFF111827),
                          ) ??
                          const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w700,
                            height: 1.2,
                            letterSpacing: -0.2,
                            color: Color(0xFF111827),
                          ),
                    ),
                  ),
                  const SizedBox(width: 48),
                ],
              ),
            ),
            const Divider(height: 1),
            for (final option in HotelsSortSheet.sortOptions)
              _SortOptionTile(
                label: option,
                selected: option == _selected,
                onTap: () => setState(() => _selected = option),
              ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }
}

class _SortOptionTile extends StatelessWidget {
  const _SortOptionTile({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    const selectedBlue = Color(0xFF2563EB);
    final textStyle = Theme.of(context).textTheme.bodyMedium?.copyWith(
          fontSize: 17,
          height: 1.25,
          letterSpacing: -0.1,
          color: selected ? selectedBlue : const Color(0xFF374151),
          fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
        ) ??
        TextStyle(
          fontSize: 17,
          height: 1.25,
          letterSpacing: -0.1,
          color: selected ? selectedBlue : const Color(0xFF374151),
          fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
        );

    return InkWell(
      onTap: onTap,
      child: Container(
        height: 60,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        decoration: const BoxDecoration(
          border: Border(bottom: BorderSide(color: Color(0xFFE5E7EB))),
        ),
        child: Row(
          children: [
            Expanded(child: Text(label, style: textStyle)),
            if (selected) const Icon(Icons.check_rounded, color: selectedBlue, size: 20),
          ],
        ),
      ),
    );
  }
}
