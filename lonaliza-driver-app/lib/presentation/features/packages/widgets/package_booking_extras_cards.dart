import 'package:flutter/material.dart';

/// Discount promo code card
class PackageBookingDiscountCard extends StatelessWidget {
  const PackageBookingDiscountCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 14, 16, 0),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 6, offset: const Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          const Row(
            children: [
              Text('🏷️', style: TextStyle(fontSize: 18)),
              SizedBox(width: 8),
              Text('Discount',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF111827))),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(height: 1, thickness: 1, color: Color(0xFFF3F4F6)),
          const SizedBox(height: 12),

          // Promo code row
          GestureDetector(
            onTap: () {},
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Enter promo code',
                    style: TextStyle(fontSize: 14, color: Color(0xFF6B7280))),
                Icon(Icons.chevron_right_rounded, size: 20, color: Color(0xFF9CA3AF)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Trip Coins info card
class PackageBookingTripCoinsCard extends StatelessWidget {
  const PackageBookingTripCoinsCard({super.key, required this.coins, required this.usdValue});
  final int coins;
  final String usdValue;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 14, 16, 0),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 6, offset: const Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Container(
                width: 22,
                height: 22,
                decoration: const BoxDecoration(color: Color(0xFFF59E0B), shape: BoxShape.circle),
                child: const Icon(Icons.monetization_on_rounded, size: 14, color: Colors.white),
              ),
              const SizedBox(width: 8),
              const Text('Trip Coins',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF111827))),
            ],
          ),
          const SizedBox(height: 10),
          const Divider(height: 1, thickness: 1, color: Color(0xFFF3F4F6)),
          const SizedBox(height: 12),

          // Earn row
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Earn  ',
                  style: TextStyle(fontSize: 13, color: Color(0xFF374151), fontWeight: FontWeight.w600)),
              Expanded(
                child: Text.rich(
                  TextSpan(children: [
                    TextSpan(
                      text: '$coins Trip Coins',
                      style: const TextStyle(
                          fontSize: 13, color: Color(0xFFF59E0B), fontWeight: FontWeight.w700),
                    ),
                    TextSpan(
                      text: ' (approx. $usdValue) after your trip',
                      style: const TextStyle(fontSize: 13, color: Color(0xFF374151)),
                    ),
                  ]),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          const Text(
            "For every US\$100 or equivalent spent, you'll earn 20 Trip Coins",
            style: TextStyle(fontSize: 12, color: Color(0xFF6B7280), height: 1.4),
          ),
        ],
      ),
    );
  }
}
