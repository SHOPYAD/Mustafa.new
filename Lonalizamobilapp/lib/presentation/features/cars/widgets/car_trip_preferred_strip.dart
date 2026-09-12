import 'package:flutter/material.dart';

import '../car_offers_theme.dart';

class CarTripPreferredStrip extends StatelessWidget {
  const CarTripPreferredStrip({
    super.key,
    this.onTap,
  });

  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: CarOffersTheme.preferredBannerBg,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          child: Row(
            children: [
              Icon(Icons.emoji_events_outlined, size: 18, color: CarOffersTheme.preferredBannerText),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Trip Preferred · Excellent stores, great value',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: CarOffersTheme.preferredBannerText,
                    height: 1.25,
                  ),
                ),
              ),
              Icon(Icons.chevron_right_rounded, size: 20, color: CarOffersTheme.preferredBannerText),
            ],
          ),
        ),
      ),
    );
  }
}
