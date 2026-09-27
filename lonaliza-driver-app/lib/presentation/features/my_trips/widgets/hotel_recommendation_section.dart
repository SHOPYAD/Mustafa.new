import 'package:flutter/material.dart';
import 'hotel_recommendation_card.dart';

class HotelRecommendationSection extends StatelessWidget {
  const HotelRecommendationSection({
    super.key,
    required this.title,
    required this.cards,
  });

  final String title;
  final List<HotelRecommendationCard> cards;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              title,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w900,
                color: Color(0xFF111827),
                letterSpacing: -0.5,
              ),
            ),
          ),
          const SizedBox(height: 16),
          
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: cards,
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Action Buttons: Plan with AI & Explore on map
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                Expanded(
                  child: _OutlineButton(
                    icon: Icons.auto_awesome_rounded,
                    label: 'Plan a trip with AI',
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _OutlineButton(
                    icon: Icons.map_outlined,
                    label: 'Explore on map',
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

class _OutlineButton extends StatelessWidget {
  const _OutlineButton({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFFF9FAFB),
        borderRadius: BorderRadius.circular(24), // nicely rounded as in image
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 16, color: const Color(0xFF374151)),
          const SizedBox(width: 6),
          Text(
            label,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w500,
              color: Color(0xFF374151),
            ),
          ),
        ],
      ),
    );
  }
}
