import 'package:flutter/material.dart';

class HotelBookingTermsSection extends StatelessWidget {
  const HotelBookingTermsSection({super.key});

  @override
  Widget build(BuildContext context) {
    final base = Theme.of(context).textTheme.bodySmall?.copyWith(
          color: const Color(0xFF6B7280),
          height: 1.45,
        );
    final link = Theme.of(context).textTheme.bodySmall?.copyWith(
          color: const Color(0xFF7C3AED),
          fontWeight: FontWeight.w700,
          decoration: TextDecoration.underline,
          decorationColor: const Color(0xFF7C3AED),
        );

    return Wrap(
      crossAxisAlignment: WrapCrossAlignment.center,
      spacing: 0,
      runSpacing: 4,
      children: [
        Text(
          'By submitting this booking, I acknowledge that I have read and agree to Lonaliza\'s ',
          style: base,
        ),
        InkWell(
          onTap: () {},
          child: Text('Terms & Conditions', style: link),
        ),
        Text(' and ', style: base),
        InkWell(
          onTap: () {},
          child: Text('Privacy Statement', style: link),
        ),
        Text('.', style: base),
      ],
    );
  }
}
