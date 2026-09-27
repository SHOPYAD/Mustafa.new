import 'package:flutter/material.dart';

class HotelBookingFinePrintSection extends StatelessWidget {
  const HotelBookingFinePrintSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Fine Print',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w800,
                color: const Color(0xFF111827),
              ),
        ),
        const SizedBox(height: 8),
        Text(
          'No air conditioning, Hot water (not available 24 hours)',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: const Color(0xFF374151),
                height: 1.4,
              ),
        ),
        const SizedBox(height: 6),
        Text(
          'Children are not permitted at this hotel.',
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: const Color(0xFF374151),
                height: 1.4,
              ),
        ),
        const SizedBox(height: 8),
        GestureDetector(
          onTap: () {},
          child: Text(
            'Learn More',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  fontWeight: FontWeight.w800,
                  decoration: TextDecoration.underline,
                  color: const Color(0xFF111827),
                ),
          ),
        ),
      ],
    );
  }
}
