import 'package:flutter/material.dart';

import '../../car_booking_theme.dart';
import '../../car_booking_typography.dart';

/// Sticky footer: total + prepay note + **Pay** button.
class CarBookingPayBottomBar extends StatelessWidget {
  const CarBookingPayBottomBar({
    super.key,
    required this.totalLabel,
    required this.paymentNote,
    this.onPay,
  });

  final String totalLabel;
  final String paymentNote;
  final VoidCallback? onPay;

  @override
  Widget build(BuildContext context) {
    return Material(
      elevation: 12,
      shadowColor: Colors.black26,
      color: Colors.white,
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(totalLabel, style: CarBookingTypography.payTotal()),
                        ),
                        const SizedBox(width: 4),
                        const Icon(Icons.info_outline_rounded, size: 18, color: CarBookingTheme.metaGrey),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(paymentNote, style: CarBookingTypography.paySub()),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              FilledButton(
                onPressed: onPay ?? () {},
                style: FilledButton.styleFrom(
                  backgroundColor: CarBookingTheme.primaryBlue,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  textStyle: CarBookingTypography.payButton(),
                ),
                child: Text('Pay', style: CarBookingTypography.payButton()),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
