import 'package:flutter/material.dart';

import '../car_offers_theme.dart';

class CarOfferBullet {
  const CarOfferBullet({required this.icon, required this.text});

  final IconData icon;
  final String text;
}

class CarOfferData {
  const CarOfferData({
    required this.heading,
    required this.headingIsTeal,
    required this.bullets,
    required this.pricePerDay,
    required this.totalLabel,
  });

  final String heading;
  final bool headingIsTeal;
  final List<CarOfferBullet> bullets;
  final String pricePerDay;
  final String totalLabel;
}

class CarOfferOptionTile extends StatelessWidget {
  const CarOfferOptionTile({
    super.key,
    required this.data,
    this.onSelect,
  });

  final CarOfferData data;
  final VoidCallback? onSelect;

  @override
  Widget build(BuildContext context) {
    final d = data;
    return Padding(
      padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            d.heading,
            style: d.headingIsTeal ? CarOffersTheme.offerHeadingTeal : CarOffersTheme.offerHeading,
          ),
          const SizedBox(height: 10),
          ...d.bullets.map(
            (b) => Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(b.icon, size: 18, color: CarOffersTheme.metaGrey),
                  const SizedBox(width: 8),
                  Expanded(child: Text(b.text, style: CarOffersTheme.bullet)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 10),
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(d.pricePerDay, style: CarOffersTheme.priceDay),
                    const SizedBox(height: 2),
                    Text(d.totalLabel, style: CarOffersTheme.priceTotal),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              FilledButton(
                onPressed: onSelect ?? () {},
                style: FilledButton.styleFrom(
                  backgroundColor: CarOffersTheme.primaryBlue,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  textStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14),
                ),
                child: const Text('Select'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
