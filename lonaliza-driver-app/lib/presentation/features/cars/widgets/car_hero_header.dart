import 'package:flutter/material.dart';

import '../car_rentals_theme.dart';

/// Hero strip under the [AppBar]: gradient, watermark, **Car Rentals** title in content area (not navbar).
class CarHeroHeader extends StatelessWidget {
  const CarHeroHeader({super.key});

  static const double expandedHeight = 210;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: expandedHeight,
      width: double.infinity,
      child: Stack(
        fit: StackFit.expand,
        children: [
          DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  CarRentalsTheme.heroBlue,
                  CarRentalsTheme.heroGradientEnd.withValues(alpha: 0.95),
                  CarRentalsTheme.heroOrange.withValues(alpha: 0.55),
                ],
                stops: const [0.0, 0.55, 1.0],
              ),
            ),
            child: Align(
              alignment: Alignment.bottomRight,
              child: Padding(
                padding: const EdgeInsets.only(right: 12, bottom: 56),
                child: Icon(
                  Icons.directions_car_filled_rounded,
                  size: 120,
                  color: Colors.white.withValues(alpha: 0.08),
                ),
              ),
            ),
          ),
          Positioned(
            left: 20,
            right: 20,
            bottom: 48,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Flexible(
                  child: Text(
                    'Car Rentals',
                    style: CarRentalsTheme.heroTitle.copyWith(fontSize: 26, height: 1.1),
                  ),
                ),
                const SizedBox(width: 6),
                Padding(
                  padding: const EdgeInsets.only(bottom: 9),
                  child: Container(
                    width: 7,
                    height: 7,
                    decoration: BoxDecoration(
                      color: CarRentalsTheme.dotOrange,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
