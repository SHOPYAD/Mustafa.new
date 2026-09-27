import 'package:flutter/material.dart';

import '../car_rentals_theme.dart';

/// Grid of supplier placeholders + footer copy.
class CarTopBrandsCard extends StatelessWidget {
  const CarTopBrandsCard({super.key});

  static const _brands = [
    'Alamo',
    'Europcar',
    'Enterprise',
    'Sixt',
    'Avis',
    'Budget',
    'Dollar',
    'Hertz',
  ];

  @override
  Widget build(BuildContext context) {
    return Material(
      elevation: 2,
      shadowColor: Colors.black.withValues(alpha: 0.06),
      borderRadius: BorderRadius.circular(14),
      color: Colors.white,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Top brand services', style: CarRentalsTheme.sectionHeader),
            const SizedBox(height: 14),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 4,
                mainAxisSpacing: 10,
                crossAxisSpacing: 10,
                childAspectRatio: 1.35,
              ),
              itemCount: _brands.length,
              itemBuilder: (context, i) {
                return Container(
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    border: Border.all(color: CarRentalsTheme.brandGridBorder),
                    borderRadius: BorderRadius.circular(8),
                    color: const Color(0xFFFAFAFA),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 6),
                  child: Text(
                    _brands[i],
                    textAlign: TextAlign.center,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: CarRentalsTheme.primaryText,
                      height: 1.15,
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 14),
            Text.rich(
              TextSpan(
                style: CarRentalsTheme.inputSecondary.copyWith(fontSize: 12.5, height: 1.4),
                children: const [
                  TextSpan(text: 'Get to your destination across over '),
                  TextSpan(text: '190', style: TextStyle(fontWeight: FontWeight.w800, color: CarRentalsTheme.primaryText)),
                  TextSpan(text: ' countries with more than '),
                  TextSpan(text: '1,000', style: TextStyle(fontWeight: FontWeight.w800, color: CarRentalsTheme.primaryText)),
                  TextSpan(text: ' trusted suppliers'),
                ],
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
