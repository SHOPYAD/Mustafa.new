import 'package:flutter/material.dart';

class PlanWithAIBanner extends StatelessWidget {
  const PlanWithAIBanner({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Plan your next trip with AI',
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w900,
              color: Color(0xFF111827),
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 16),
          Container(
            width: double.infinity,
            decoration: BoxDecoration(
              color: const Color(0xFFF0F5FF),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Stack(
              children: [
                Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Build your dream trip in seconds. Share and\nplan together.',
                        style: TextStyle(
                          fontSize: 14,
                          color: Color(0xFF374151),
                          height: 1.4,
                        ),
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton.icon(
                        onPressed: () {},
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF2563EB),
                          foregroundColor: Colors.white,
                          elevation: 0,
                          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        icon: const Icon(Icons.auto_awesome_rounded, size: 18),
                        label: const Text('Start planning', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                      ),
                    ],
                  ),
                ),
                // Decorative Map graphic
                Positioned(
                  right: -10,
                  bottom: -10,
                  child: SizedBox(
                    width: 140,
                    height: 100,
                    child: Stack(
                      children: [
                        // Map base
                        Positioned(
                          bottom: 10,
                          right: 15,
                          child: Container(
                            width: 100,
                            height: 60,
                            decoration: BoxDecoration(
                              color: const Color(0xFFD1E4FF),
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                        ),
                        // Map marker
                        const Positioned(
                          top: 10,
                          right: 35,
                          child: Icon(Icons.location_on, size: 48, color: Color(0xFFFFC107)),
                        ),
                        // Map sparkles
                        const Positioned(
                          top: 5,
                          right: 20,
                          child: Icon(Icons.star_rounded, size: 20, color: Color(0xFFFFD54F)),
                        ),
                      ],
                    ),
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
