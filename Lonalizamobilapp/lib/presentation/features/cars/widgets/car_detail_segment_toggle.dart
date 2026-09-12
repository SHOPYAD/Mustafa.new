import 'package:flutter/material.dart';

import '../car_detail_theme.dart';

/// Two-pill toggle (e.g. adults / children) matching tour Details reference.
class CarDetailSegmentToggle extends StatelessWidget {
  const CarDetailSegmentToggle({
    super.key,
    required this.leftLabel,
    required this.rightLabel,
    required this.leftSelected,
    required this.onChanged,
  });

  final String leftLabel;
  final String rightLabel;
  final bool leftSelected;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _Seg(
            label: leftLabel,
            selected: leftSelected,
            onTap: () => onChanged(true),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _Seg(
            label: rightLabel,
            selected: !leftSelected,
            onTap: () => onChanged(false),
          ),
        ),
      ],
    );
  }
}

class _Seg extends StatelessWidget {
  const _Seg({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: selected ? CarDetailTheme.primaryBlue : CarDetailTheme.metaGrey.withValues(alpha: 0.35),
              width: selected ? 2 : 1,
            ),
          ),
          child: Text(
            label,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: selected ? CarDetailTheme.primaryBlue : CarDetailTheme.metaGrey,
            ),
          ),
        ),
      ),
    );
  }
}
