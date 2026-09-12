import 'package:flutter/material.dart';

class FlightPromoCodeCard extends StatelessWidget {
  const FlightPromoCodeCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Text(
            'Promo codes',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w500,
              color: Color(0xFF1F2937),
            ),
          ),
          Row(
            children: [
              const Text('Select', style: TextStyle(fontSize: 15, color: Color(0xFF7C3AED))),
              const Icon(Icons.keyboard_arrow_right_rounded, size: 18, color: Color(0xFF7C3AED)),
            ],
          ),
        ],
      ),
    );
  }
}
