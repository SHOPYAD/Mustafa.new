import 'package:flutter/material.dart';

import '../../car_booking_theme.dart';

/// Invoice note + terms acknowledgement + privacy blurb (grey).
class CarBookingLegalSection extends StatelessWidget {
  const CarBookingLegalSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 100),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Invoice: An e-invoice for reimbursement will be provided after payment where applicable.',
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: CarBookingTheme.metaGrey, height: 1.45),
          ),
          const SizedBox(height: 14),
          Wrap(
            crossAxisAlignment: WrapCrossAlignment.center,
            spacing: 0,
            runSpacing: 4,
            children: [
              Text(
                'I acknowledge that I have read and agree to Lonaliza\'s ',
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: Colors.grey.shade700, height: 1.45),
              ),
              TextButton(
                onPressed: () {},
                style: TextButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  foregroundColor: CarBookingTheme.primaryBlue,
                ),
                child: const Text('Terms and conditions', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 12)),
              ),
              Text(' and ', style: TextStyle(fontSize: 12, color: Colors.grey.shade700, height: 1.45)),
              TextButton(
                onPressed: () {},
                style: TextButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  foregroundColor: CarBookingTheme.primaryBlue,
                ),
                child: const Text('Privacy statement', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 12)),
              ),
              Text('.', style: TextStyle(fontSize: 12, color: Colors.grey.shade700)),
            ],
          ),
          const SizedBox(height: 14),
          const Text(
            'Frequent traveler and contact information are saved to your account when you choose to save as default.',
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: CarBookingTheme.metaGrey, height: 1.45),
          ),
        ],
      ),
    );
  }
}
