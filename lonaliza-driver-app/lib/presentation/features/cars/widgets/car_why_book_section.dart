import 'package:flutter/material.dart';

import '../car_rentals_theme.dart';
import 'car_why_book_feature_tile.dart';

class CarWhyBookSection extends StatelessWidget {
  const CarWhyBookSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(4, 8, 4, 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Why book with Trip.com?',
            style: CarRentalsTheme.sectionHeader.copyWith(fontSize: 18),
          ),
          const SizedBox(height: 18),
          CarWhyBookFeatureTile(
            icon: Icons.sell_outlined,
            iconColor: const Color(0xFFFF8A00),
            title: 'Flyer/hotel guest exclusive offers',
            subtitle:
                'Unlock exclusive car rental prices for your booked flights or hotels',
          ),
          CarWhyBookFeatureTile(
            icon: Icons.schedule_rounded,
            iconColor: const Color(0xFF0D9488),
            title: 'Flexible rentals',
            subtitle: 'Flexible cancellation policy - plan your trip with ease',
          ),
          CarWhyBookFeatureTile(
            icon: Icons.verified_user_outlined,
            iconColor: const Color(0xFF0D9488),
            title: 'Transport booking guarantee',
            subtitle:
                'If the flight, train, or bus you booked with a rental car on Trip.com is delayed or canceled, '
                'you can contact us for free assistance to either keep or cancel your rental car',
          ),
          CarWhyBookFeatureTile(
            icon: Icons.bolt_rounded,
            iconColor: const Color(0xFF2563EB),
            iconBackground: const Color(0xFFFFF176),
            title: 'Rapid customer support',
            subtitle:
                'We usually answer your call within 30 seconds, ensuring reliable support throughout your car rental journey',
          ),
        ],
      ),
    );
  }
}
