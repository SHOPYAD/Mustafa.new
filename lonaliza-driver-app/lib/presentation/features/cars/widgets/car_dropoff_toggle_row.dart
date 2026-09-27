import 'package:flutter/material.dart';

import '../car_rentals_theme.dart';

class CarDropoffToggleRow extends StatelessWidget {
  const CarDropoffToggleRow({
    super.key,
    required this.value,
    required this.onChanged,
  });

  final bool value;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Row(
        children: [
          Expanded(
            child: Text(
              'Drop off at a different location',
              style: CarRentalsTheme.inputPrimary.copyWith(fontWeight: FontWeight.w500, fontSize: 14),
            ),
          ),
          Switch.adaptive(
            value: value,
            onChanged: onChanged,
            activeTrackColor: CarRentalsTheme.primaryBlue,
            activeThumbColor: Colors.white,
            inactiveTrackColor: const Color(0xFFE0E0E0),
            inactiveThumbColor: Colors.white,
            materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
          ),
        ],
      ),
    );
  }
}
