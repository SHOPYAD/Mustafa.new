import 'package:flutter/material.dart';

/// Fixed bottom bar with price + action buttons
class PackageTourBottomBar extends StatelessWidget {
  const PackageTourBottomBar({
    super.key,
    required this.price,
    this.onCustomize,
    this.onCheckAvailability,
  });

  final String price;
  final VoidCallback? onCustomize;
  final VoidCallback? onCheckAvailability;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 20),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Color(0xFFE5E7EB), width: 1)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Price line
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                price,
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  color: Color(0xFF7C3AED),
                ),
              ),
              const Text(
                '/person',
                style: TextStyle(fontSize: 13, color: Color(0xFF6B7280)),
              ),
              const SizedBox(width: 6),
              const Icon(Icons.info_outline_rounded, size: 14, color: Color(0xFF9CA3AF)),
              const SizedBox(width: 4),
              const Text(
                '(incl. taxes & fees)',
                style: TextStyle(fontSize: 11, color: Color(0xFF9CA3AF)),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Action buttons
          Row(
            children: [
              // Customize trip – outlined
              Expanded(
                child: GestureDetector(
                  onTap: onCustomize,
                  child: Container(
                    height: 48,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFF7C3AED), width: 1.5),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.chat_bubble_outline_rounded, size: 16, color: Color(0xFF7C3AED)),
                        SizedBox(width: 6),
                        Text(
                          'Customize trip',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF7C3AED)),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              // Check availability – filled
              Expanded(
                child: GestureDetector(
                  onTap: onCheckAvailability,
                  child: Container(
                    height: 48,
                    decoration: BoxDecoration(
                      color: const Color(0xFF7C3AED),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    alignment: Alignment.center,
                    child: const Text(
                      'Check availability',
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Colors.white),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
