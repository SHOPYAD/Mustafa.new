import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../providers/router_providers.dart';

class FlightFareCard extends ConsumerWidget {
  const FlightFareCard({
    super.key,
    this.badgeText,
    required this.price,
    required this.originalPrice,
    required this.features,
    required this.cabinClass,
  });

  final String? badgeText;
  final String price;
  final String originalPrice;
  final List<FareFeature> features;
  final String cabinClass;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Stack(
        children: [
          if (badgeText != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: const BoxDecoration(
                color: Color(0xFFE6F4F1),
                borderRadius: BorderRadius.only(
                  topLeft: Radius.circular(12),
                  bottomRight: Radius.circular(12),
                ),
              ),
              child: Text(
                badgeText!,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF0E766E),
                ),
              ),
            ),
          Padding(
            padding: EdgeInsets.fromLTRB(16, badgeText != null ? 36 : 16, 16, 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          RichText(
                            text: TextSpan(
                              children: [
                                TextSpan(
                                  text: price,
                                  style: const TextStyle(
                                    fontSize: 24,
                                    fontWeight: FontWeight.w700,
                                    color: Color(0xFF2F60F5),
                                  ),
                                ),
                                const TextSpan(
                                  text: ' /person',
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: Color(0xFF6B7280),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            originalPrice,
                            style: const TextStyle(
                              fontSize: 14,
                              color: Color(0xFF9CA3AF),
                              decoration: TextDecoration.lineThrough,
                            ),
                          ),
                        ],
                      ),
                    ),
                    FilledButton(
                      onPressed: () {
                        ref.read(navigationRepositoryProvider).goFlightInfo();
                      },
                      style: FilledButton.styleFrom(
                        backgroundColor: const Color(0xFF2F60F5),
                        padding: const EdgeInsets.symmetric(horizontal: 24),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(6),
                        ),
                      ),
                      child: const Text('Select', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                ...features.map((feature) => Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: Row(
                        children: [
                          Icon(feature.icon, size: 18, color: const Color(0xFF0E766E)),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              feature.text,
                              style: const TextStyle(fontSize: 14, color: Color(0xFF1F2937)),
                            ),
                          ),
                        ],
                      ),
                    )),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Text(
                      cabinClass,
                      style: const TextStyle(fontSize: 14, color: Color(0xFF6B7280)),
                    ),
                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 6),
                      child: Text('|', style: TextStyle(color: Color(0xFFD1D5DB))),
                    ),
                    const Text(
                      'View details',
                      style: TextStyle(fontSize: 14, color: Color(0xFF6B7280)),
                    ),
                    const Icon(Icons.keyboard_arrow_right_rounded, size: 16, color: Color(0xFF6B7280)),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class FareFeature {
  const FareFeature({required this.icon, required this.text});
  final IconData icon;
  final String text;
}
