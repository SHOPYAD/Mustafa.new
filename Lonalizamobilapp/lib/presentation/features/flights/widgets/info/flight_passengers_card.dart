import 'package:flutter/material.dart';

class FlightPassengersCard extends StatelessWidget {
  const FlightPassengersCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'Selected: 1 adult',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: Color(0xFF1F2937),
            ),
          ),
          const SizedBox(height: 12),
          
          // ID notice
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFFF9FAFB),
              borderRadius: BorderRadius.circular(6),
            ),
            child: const Row(
              children: [
                Text('ID notice', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF374151))),
                SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Names must match ID  ·  6-month Validity',
                    style: TextStyle(fontSize: 13, color: Color(0xFF4B5563)),
                  ),
                ),
                Icon(Icons.play_arrow_rounded, size: 12, color: Color(0xFF6B7280)),
              ],
            ),
          ),
          
          const SizedBox(height: 12),
          
          // Selected passenger box
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border.all(color: const Color(0xFF7C3AED), width: 1.5),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 20,
                      height: 20,
                      decoration: BoxDecoration(
                        color: const Color(0xFF7C3AED),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Icon(Icons.check, size: 14, color: Colors.white),
                    ),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Text(
                        'AHMED KEMOUKH',
                        style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Color(0xFF1F2937)),
                      ),
                    ),
                    const Icon(Icons.edit_outlined, size: 18, color: Color(0xFF6B7280)),
                  ],
                ),
                const SizedBox(height: 12),
                Padding(
                  padding: const EdgeInsets.only(left: 32),
                  child: Row(
                    children: [
                      const Text(
                        'Add frequent flyer details',
                        style: TextStyle(fontSize: 13, color: Color(0xFF7C3AED)),
                      ),
                      const Icon(Icons.keyboard_arrow_right_rounded, size: 16, color: Color(0xFF7C3AED)),
                      const SizedBox(width: 12),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE6F4F1),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.layers, size: 12, color: Color(0xFF0E766E)),
                            SizedBox(width: 4),
                            Text('4,055 miles', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF0E766E))),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                Container(
                  margin: const EdgeInsets.only(left: 32),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF3F4F6),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: RichText(
                          text: const TextSpan(
                            style: TextStyle(fontSize: 13, color: Color(0xFF4B5563), height: 1.4),
                            children: [
                              TextSpan(text: 'Visa requirements ', style: TextStyle(color: Color(0xFFD97706), fontWeight: FontWeight.w600)),
                              TextSpan(text: 'For citizens of Algeria who are transferring in Qatar, a visa or tran...'),
                            ],
                          ),
                        ),
                      ),
                      const Icon(Icons.keyboard_arrow_right_rounded, size: 16, color: Color(0xFF9CA3AF)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 16),
          
          // More Passengers Button
          Center(
            child: InkWell(
              onTap: () {},
              child: const Padding(
                padding: EdgeInsets.symmetric(vertical: 8),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.add_circle_outline, size: 20, color: Color(0xFF7C3AED)),
                    SizedBox(width: 8),
                    Text(
                      'More Passengers',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Color(0xFF7C3AED)),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
