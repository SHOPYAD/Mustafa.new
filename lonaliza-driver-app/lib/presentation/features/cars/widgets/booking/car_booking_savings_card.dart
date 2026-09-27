import 'package:flutter/material.dart';

import '../../car_booking_theme.dart';

/// Booking savings + promo strip with **Add >**.
class CarBookingSavingsCard extends StatelessWidget {
  const CarBookingSavingsCard({super.key, this.onAddPromo});

  final VoidCallback? onAddPromo;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      padding: const EdgeInsets.fromLTRB(14, 14, 14, 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text('Booking savings', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900, color: CarBookingTheme.navyTitle)),
          const SizedBox(height: 12),
          Material(
            color: CarBookingTheme.promoStripBg,
            borderRadius: BorderRadius.circular(10),
            child: InkWell(
              onTap: onAddPromo ?? () {},
              borderRadius: BorderRadius.circular(10),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                child: Row(
                  children: [
                    Icon(Icons.local_offer_outlined, color: Colors.pink.shade400, size: 22),
                    const SizedBox(width: 10),
                    const Expanded(
                      child: Text('Promo code', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800)),
                    ),
                    const Text('Add', style: TextStyle(fontWeight: FontWeight.w800, color: CarBookingTheme.primaryBlue)),
                    Icon(Icons.chevron_right_rounded, color: CarBookingTheme.primaryBlue, size: 20),
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
