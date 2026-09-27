import 'package:flutter/material.dart';

class FlightBaggageProtectionCard extends StatelessWidget {
  const FlightBaggageProtectionCard({super.key});

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
            'Checked baggage protection',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: Color(0xFF1F2937),
            ),
          ),
          const SizedBox(height: 12),
          RichText(
            text: const TextSpan(
              style: TextStyle(fontSize: 14, color: Color(0xFF4B5563), height: 1.4),
              children: [
                TextSpan(text: "Your checked baggage will be protected throughout your flight. If your baggage is lost, please report it within 24 hours of your flight's arrival. We'll track your lost baggage for 96 hours. If we are unable to find it, you'll be compensated "),
                TextSpan(text: '\$1,000.00.', style: TextStyle(color: Color(0xFF0E766E), fontWeight: FontWeight.w600)),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              const Text('Learn More', style: TextStyle(fontSize: 13, color: Color(0xFF2F60F5))),
              const Icon(Icons.play_arrow, size: 12, color: Color(0xFF2F60F5)),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: const Color(0xFFF9FAFB),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                RichText(
                  text: const TextSpan(
                    children: [
                      TextSpan(text: '\$5', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Color(0xFF1F2937))),
                      TextSpan(text: '/person', style: TextStyle(fontSize: 13, color: Color(0xFF6B7280))),
                    ],
                  ),
                ),
                ElevatedButton(
                  onPressed: () {},
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF2F60F5),
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                    minimumSize: const Size(0, 36),
                  ),
                  child: const Text('Select', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.white)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
