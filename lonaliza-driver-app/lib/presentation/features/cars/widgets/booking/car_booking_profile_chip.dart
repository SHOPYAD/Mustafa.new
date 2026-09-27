import 'package:flutter/material.dart';

import '../../car_booking_theme.dart';
import '../../car_booking_typography.dart';

/// Selected driver: **blue circle + white check** + uppercase blue label (Trip-style).
class CarBookingSelectedDriverChip extends StatelessWidget {
  const CarBookingSelectedDriverChip({
    super.key,
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
        borderRadius: BorderRadius.circular(8),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 9),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(
              color: selected ? CarBookingTheme.primaryBlue : const Color(0xFFE5E7EB),
              width: selected ? 2 : 1,
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (selected) ...[
                Container(
                  width: 18,
                  height: 18,
                  decoration: const BoxDecoration(
                    color: CarBookingTheme.primaryBlue,
                    shape: BoxShape.circle,
                  ),
                  alignment: Alignment.center,
                  child: const Icon(Icons.check_rounded, size: 12, color: Colors.white),
                ),
                const SizedBox(width: 8),
              ],
              Text(
                label.toUpperCase(),
                style: selected ? CarBookingTypography.chipSelected() : CarBookingTypography.chipUnselected(),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
