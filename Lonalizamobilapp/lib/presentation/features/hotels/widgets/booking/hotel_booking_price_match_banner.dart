import 'package:flutter/material.dart';

class HotelBookingPriceMatchBanner extends StatelessWidget {
  const HotelBookingPriceMatchBanner({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 10),
      decoration: const BoxDecoration(
        color: Color(0xFFE0F2FE),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.verified_rounded, size: 18, color: Colors.teal.shade600),
          const SizedBox(width: 6),
          Text(
            'We price match',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: const Color(0xFF0F766E),
                  fontWeight: FontWeight.w700,
                ),
          ),
        ],
      ),
    );
  }
}
