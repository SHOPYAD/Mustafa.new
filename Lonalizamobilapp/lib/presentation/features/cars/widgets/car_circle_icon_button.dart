import 'package:flutter/material.dart';

import '../car_rentals_theme.dart';

/// Semi-transparent circular control on hero (back, support, menu).
class CarCircleIconButton extends StatelessWidget {
  const CarCircleIconButton({
    super.key,
    required this.icon,
    required this.onPressed,
  });

  final IconData icon;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: CarRentalsTheme.toolbarCircleFill,
      shape: const CircleBorder(),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onPressed,
        child: SizedBox(
          width: 40,
          height: 40,
          child: Icon(icon, size: 22, color: Colors.white.withValues(alpha: 0.95)),
        ),
      ),
    );
  }
}
