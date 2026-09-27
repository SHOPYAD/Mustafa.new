import 'package:flutter/material.dart';

import '../../car_booking_theme.dart';
import '../../car_booking_typography.dart';
import 'car_booking_profile_chip.dart';

/// Saved driver chips + **Add** (Trip: blue circle + white check when selected).
class CarBookingProfileSelector extends StatelessWidget {
  const CarBookingProfileSelector({
    super.key,
    required this.profiles,
    required this.selectedIndex,
    required this.onSelected,
    this.onAdd,
  });

  final List<String> profiles;
  final int selectedIndex;
  final ValueChanged<int> onSelected;
  final VoidCallback? onAdd;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          for (var i = 0; i < profiles.length; i++) ...[
            if (i > 0) const SizedBox(width: 8),
            CarBookingSelectedDriverChip(
              label: profiles[i],
              selected: i == selectedIndex,
              onTap: () => onSelected(i),
            ),
          ],
          const SizedBox(width: 8),
          Material(
            color: Colors.white,
            borderRadius: BorderRadius.circular(8),
            child: InkWell(
              onTap: onAdd ?? () {},
              borderRadius: BorderRadius.circular(8),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: CarBookingTheme.primaryBlue, width: 1.5),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.add_rounded, color: CarBookingTheme.primaryBlue, size: 20),
                    const SizedBox(width: 4),
                    Text('Add', style: CarBookingTypography.addButton()),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
