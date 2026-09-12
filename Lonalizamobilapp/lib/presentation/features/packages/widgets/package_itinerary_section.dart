import 'package:flutter/material.dart';
import 'package:liotrip/presentation/features/packages/widgets/package_itinerary_card.dart';

class PackageItinerarySection extends StatelessWidget {
  const PackageItinerarySection({
    super.key,
    required this.title,
    required this.cards,
  });

  final String title;
  final List<PackageItineraryCard> cards;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 20, 16, 12),
          child: Text(
            title,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w800,
              color: Color(0xFF111827),
              letterSpacing: -0.4,
            ),
          ),
        ),
        SizedBox(
          height: 260,
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            children: cards,
          ),
        ),
      ],
    );
  }
}
