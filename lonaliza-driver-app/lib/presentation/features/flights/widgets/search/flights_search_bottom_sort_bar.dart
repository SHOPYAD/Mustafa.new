import 'package:flutter/material.dart';

class FlightsSearchBottomSortBar extends StatelessWidget {
  const FlightsSearchBottomSortBar({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Color(0xFFE5E7EB))),
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          child: Row(
            children: const [
              _SortItem(label: 'Recommended', isActive: true),
              _SortDivider(),
              _SortItem(label: 'Nonstop first'),
              _SortDivider(),
              _SortItem(
                label: 'Sort By',
                trailing: Icons.keyboard_arrow_up_rounded,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SortItem extends StatelessWidget {
  const _SortItem({
    required this.label,
    this.isActive = false,
    this.trailing,
  });

  final String label;
  final bool isActive;
  final IconData? trailing;

  @override
  Widget build(BuildContext context) {
    final labelStyle = Theme.of(context).textTheme.titleSmall?.copyWith(
          color: isActive ? const Color(0xFF2F60F5) : const Color(0xFF111827),
          fontWeight: FontWeight.w600,
        );

    return Expanded(
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(label, style: labelStyle),
          if (trailing != null) ...[
            const SizedBox(width: 4),
            Icon(trailing, size: 18, color: const Color(0xFF111827)),
          ],
        ],
      ),
    );
  }
}

class _SortDivider extends StatelessWidget {
  const _SortDivider();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 1,
      height: 16,
      color: const Color(0xFFE5E7EB),
    );
  }
}
