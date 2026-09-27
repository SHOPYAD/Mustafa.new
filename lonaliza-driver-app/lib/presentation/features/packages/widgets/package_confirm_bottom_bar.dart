import 'package:flutter/material.dart';

/// Fixed bottom bar for the confirm options page
class PackageConfirmBottomBar extends StatelessWidget {
  const PackageConfirmBottomBar({
    super.key,
    required this.totalPrice,
    required this.discount,
    required this.tripCoins,
    required this.onNext,
    this.onSupport,
  });

  final String totalPrice;
  final String discount;
  final String tripCoins;
  final VoidCallback onNext;
  final VoidCallback? onSupport;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 10, 16, 24),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Color(0xFFE5E7EB))),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // ── Top row: discount badge + total + support + next
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Left: price block
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Discount badge
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFF4B6E),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Text('Total discount',
                              style: TextStyle(fontSize: 11, color: Colors.white, fontWeight: FontWeight.w600)),
                          const SizedBox(width: 6),
                          Text(discount,
                              style: const TextStyle(fontSize: 11, color: Colors.white, fontWeight: FontWeight.w800)),
                        ],
                      ),
                    ),
                    const SizedBox(height: 4),

                    // Total price
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.baseline,
                      textBaseline: TextBaseline.alphabetic,
                      children: [
                        Text(totalPrice,
                            style: const TextStyle(
                                fontSize: 22, fontWeight: FontWeight.w900, color: Color(0xFF2563EB))),
                        const SizedBox(width: 4),
                        const Icon(Icons.info_outline_rounded, size: 14, color: Color(0xFF9CA3AF)),
                      ],
                    ),
                    const Text('(incl. taxes & fees)',
                        style: TextStyle(fontSize: 10, color: Color(0xFF9CA3AF))),

                    // Trip coins
                    const SizedBox(height: 3),
                    Row(
                      children: [
                        Container(
                          width: 14,
                          height: 14,
                          decoration: const BoxDecoration(color: Color(0xFFF59E0B), shape: BoxShape.circle),
                          child: const Icon(Icons.monetization_on_rounded, size: 10, color: Colors.white),
                        ),
                        const SizedBox(width: 4),
                        Text('Earn $tripCoins in Trip Coins',
                            style: const TextStyle(fontSize: 11, color: Color(0xFF374151))),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 10),

              // Right: support icon + Next button
              Column(
                children: [
                  Row(
                    children: [
                      // Support icon
                      GestureDetector(
                        onTap: onSupport,
                        child: Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: const Color(0xFFF3F4F6),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(Icons.headset_mic_outlined, color: Color(0xFF374151), size: 22),
                        ),
                      ),
                      const SizedBox(width: 8),

                      // Next button
                      GestureDetector(
                        onTap: onNext,
                        child: Container(
                          width: 110,
                          height: 48,
                          decoration: BoxDecoration(
                            color: const Color(0xFF2563EB),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          alignment: Alignment.center,
                          child: const Text('Next',
                              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white)),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}
