import 'package:flutter/material.dart';

class FlightVipLoungeCard extends StatelessWidget {
  const FlightVipLoungeCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // Icon
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(0xFFE6F4F1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(Icons.chair_rounded, size: 28, color: Color(0xFF0D9488)),
          ),
          const SizedBox(width: 16),
          
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Text(
                      'VIP Lounge',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF1F2937),
                      ),
                    ),
                    const SizedBox(width: 6),
                    Icon(Icons.info_outline_rounded, size: 14, color: const Color(0xFF1F2937).withValues(alpha: 0.8)),
                  ],
                ),
                const SizedBox(height: 4),
                const Text(
                  'Relax in a cozy and quiet space',
                  style: TextStyle(fontSize: 13, color: Color(0xFF6B7280)),
                ),
                const SizedBox(height: 4),
                RichText(
                  text: const TextSpan(
                    children: [
                      TextSpan(text: 'From ', style: TextStyle(fontSize: 13, color: Color(0xFF6B7280))),
                      TextSpan(text: '\$30.10', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Color(0xFF2F60F5))),
                      TextSpan(text: '/person', style: TextStyle(fontSize: 13, color: Color(0xFF6B7280))),
                    ],
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Treat yourself and book a lounge for your 3 hours 30 minutes transfer',
                  style: TextStyle(fontSize: 13, color: Color(0xFF0D9488), height: 1.3),
                ),
              ],
            ),
          ),
          
          const SizedBox(width: 12),
          
          // Add button
          OutlinedButton(
            onPressed: () {},
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: Color(0xFF2F60F5)),
              foregroundColor: const Color(0xFF2F60F5),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              minimumSize: const Size(0, 32),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
            ),
            child: const Text('Add', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }
}
