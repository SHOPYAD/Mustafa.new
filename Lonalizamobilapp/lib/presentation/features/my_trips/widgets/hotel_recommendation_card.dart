import 'package:flutter/material.dart';

class HotelRecommendationCard extends StatelessWidget {
  const HotelRecommendationCard({
    super.key,
    required this.imagePath,
    required this.name,
    required this.stars,
    required this.score,
    required this.scoreContext,
    required this.price,
    required this.originalPrice,
    required this.discountOff,
  });

  final String imagePath;
  final String name;
  final int stars;
  final String score;
  final String scoreContext;
  final String price;
  final String originalPrice;
  final String discountOff;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 170,
      height: 265, // Absolute fixed height for all cards
      margin: const EdgeInsets.only(right: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Real Hotel Cover Image
          ClipRRect(
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(11),
              topRight: Radius.circular(11),
            ),
            child: Image.asset(
              imagePath,
              height: 110,
              width: double.infinity,
              fit: BoxFit.cover,
            ),
          ),
          
          // Card Details
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      height: 1.2,
                      color: Color(0xFF111827),
                    ),
                  ),
                  const SizedBox(height: 6),
                  
                  // Stars
                  Row(
                    children: List.generate(
                      stars,
                      (index) => const Icon(Icons.star_rounded, size: 14, color: Color(0xFFFFB020)),
                    ),
                  ),
                  const SizedBox(height: 6),
                  
                  // Score
                  Row(
                    children: [
                      Text(
                        score,
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF7C3AED)),
                      ),
                      const Text(
                        '/10',
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF7C3AED)),
                      ),
                      Text(
                        ' · $scoreContext',
                        style: const TextStyle(fontSize: 12, color: Color(0xFF4B5563)),
                      ),
                    ],
                  ),
                  
                  const Spacer(), // will push price text to bottom
                  
                  // Price
                  Align(
                    alignment: Alignment.centerRight,
                    child: Text(
                      price,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF111827),
                      ),
                    ),
                  ),
                
                // Discount & original price
                const SizedBox(height: 2),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Text(
                      originalPrice,
                      style: const TextStyle(
                        fontSize: 11,
                        color: Color(0xFF9CA3AF),
                        decoration: TextDecoration.lineThrough,
                      ),
                    ),
                    const SizedBox(width: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE11D48),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        discountOff,
                        style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                    ),
                  ],
                ),
              ], // ends children of inner column
            ), // ends inner column
          ), // ends padding
        ), // ends expanded
      ], // ends children of outer column
    ), // ends outer column
  ); // ends container
}
}
