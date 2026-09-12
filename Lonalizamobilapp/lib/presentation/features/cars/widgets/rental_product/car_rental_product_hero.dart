import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../car_rental_product_theme.dart';

/// Hero: gradient-style area, circular back, car visual, disclaimer.
class CarRentalProductHero extends StatelessWidget {
  const CarRentalProductHero({super.key});

  void _back(BuildContext context) {
    if (context.canPop()) {
      context.pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.only(bottom: 12),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0xFFF8FAFC), Color(0xFFEFF2F7)],
        ),
      ),
      child: SafeArea(
        bottom: false,
        child: Column(
          children: [
            Align(
              alignment: Alignment.centerLeft,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(12, 8, 16, 0),
                child: Material(
                  color: Colors.white,
                  shape: const CircleBorder(),
                  elevation: 2,
                  shadowColor: Colors.black26,
                  child: InkWell(
                    customBorder: const CircleBorder(),
                    onTap: () => _back(context),
                    child: const Padding(
                      padding: EdgeInsets.all(10),
                      child: Icon(Icons.arrow_back_rounded, size: 20, color: CarRentalProductTheme.titleDark),
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 8),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: AspectRatio(
                aspectRatio: 16 / 9,
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.06),
                        blurRadius: 16,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: ColoredBox(
                      color: const Color(0xFFF8FAFC),
                      child: Center(
                        child: Icon(Icons.directions_car_filled_rounded, size: 120, color: Colors.grey.shade400),
                      ),
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 8),
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 20),
              child: Text(
                'Actual cars provided by the supplier may vary.',
                textAlign: TextAlign.center,
                style: CarRentalProductTheme.heroDisclaimer,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
