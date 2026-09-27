import 'package:flutter/material.dart';

import '../car_search_results_theme.dart';

class CarResultVehicleCard extends StatelessWidget {
  const CarResultVehicleCard({
    super.key,
    this.onTap,
    required this.title,
    required this.subtitle,
    required this.passengers,
    required this.bags,
    required this.doors,
    required this.transmission,
    required this.shuttleLabel,
    required this.brandsLine,
    required this.pricePerDay,
    required this.totalLabel,
  });

  final VoidCallback? onTap;
  final String title;
  final String subtitle;
  final int passengers;
  final int bags;
  final int doors;
  final String transmission;
  final String shuttleLabel;
  final String brandsLine;
  final String pricePerDay;
  final String totalLabel;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 8),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Wrap(
                        spacing: 6,
                        runSpacing: 6,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: CarSearchResultsTheme.tealBadge,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Text(
                              'Top choice',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: Colors.white,
                              ),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: CarSearchResultsTheme.tealBadgeSoft,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              'Free cancellation included',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: CarSearchResultsTheme.tealBadge,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(title, style: CarSearchResultsTheme.cardTitle),
                      const SizedBox(height: 4),
                      Text(subtitle, style: CarSearchResultsTheme.cardSubtitle),
                      const SizedBox(height: 10),
                      Wrap(
                        spacing: 12,
                        runSpacing: 6,
                        children: [
                          _Spec(icon: Icons.person_outline_rounded, text: '$passengers'),
                          _Spec(icon: Icons.work_outline_rounded, text: '$bags'),
                          _Spec(icon: Icons.door_sliding_outlined, text: '$doors'),
                          _Spec(icon: Icons.settings_outlined, text: transmission),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          Icon(Icons.place_outlined, size: 16, color: Colors.grey.shade600),
                          const SizedBox(width: 4),
                          Text(shuttleLabel, style: CarSearchResultsTheme.cardSubtitle.copyWith(fontSize: 12)),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    width: 112,
                    height: 88,
                    color: const Color(0xFFF3F4F6),
                    child: Icon(Icons.directions_car_filled_rounded, size: 48, color: Colors.grey.shade400),
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1, thickness: 1, color: Color(0xFFF1F5F9)),
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 10, 14, 12),
            child: Row(
              children: [
                Expanded(
                  child: Text(
                    brandsLine,
                    style: CarSearchResultsTheme.cardSubtitle.copyWith(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: CarSearchResultsTheme.titleDark,
                    ),
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text.rich(
                      TextSpan(
                        style: CarSearchResultsTheme.priceFrom,
                        children: [
                          const TextSpan(text: 'From '),
                          TextSpan(text: pricePerDay, style: CarSearchResultsTheme.priceBold.copyWith(fontSize: 18)),
                          const TextSpan(text: '/day'),
                        ],
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(totalLabel, style: CarSearchResultsTheme.priceTotal),
                  ],
                ),
              ],
            ),
          ),
        ],
        ),
        ),
      ),
    );
  }
}

class _Spec extends StatelessWidget {
  const _Spec({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 16, color: Colors.grey.shade600),
        const SizedBox(width: 4),
        Text(text, style: CarSearchResultsTheme.cardSubtitle.copyWith(fontSize: 12)),
      ],
    );
  }
}
