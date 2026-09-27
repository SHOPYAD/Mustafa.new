import 'package:flutter/material.dart';

class FlightTripCoinsCard extends StatelessWidget {
  const FlightTripCoinsCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Text(
                          'Trip Coins',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF1F2937),
                          ),
                        ),
                        const SizedBox(width: 6),
                        Icon(Icons.info_outline_rounded, size: 16, color: const Color(0xFF1F2937).withValues(alpha: 0.8)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    RichText(
                      text: const TextSpan(
                        style: TextStyle(fontSize: 14, color: Color(0xFF4B5563)),
                        children: [
                          TextSpan(text: "You'll earn "),
                          TextSpan(text: '141 Trip Coins (approx. \$1.41)', style: TextStyle(color: Color(0xFFD97706), fontWeight: FontWeight.w600)),
                          TextSpan(text: ' after your trip'),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 48), // Space for absolute positioned coin
            ],
          ),
          Positioned(
            right: -8,
            top: -8,
            child: Container(
              width: 36,
              height: 36,
              decoration: const BoxDecoration(
                color: Color(0xFFFBBF24),
                shape: BoxShape.circle,
              ),
              alignment: Alignment.center,
              child: const Text('T', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900)),
            ),
          ),
          Positioned(
            right: 28,
            top: 20,
            child: Container(
              width: 14,
              height: 14,
              decoration: BoxDecoration(
                color: const Color(0xFFFBBF24).withOpacity(0.5),
                shape: BoxShape.circle,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
