import 'package:flutter/material.dart';

import '../../car_rental_product_theme.dart';

class CarRentalProductBottomBar extends StatelessWidget {
  const CarRentalProductBottomBar({
    super.key,
    required this.totalLabel,
    required this.paymentNote,
    this.onContinue,
  });

  final String totalLabel;
  final String paymentNote;
  final VoidCallback? onContinue;

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
                          child: Text(
                            totalLabel,
                            style: const TextStyle(
                              fontSize: 17,
                              fontWeight: FontWeight.w900,
                              color: CarRentalProductTheme.titleDark,
                            ),
                          ),
                        ),
                        const SizedBox(width: 4),
                        Icon(Icons.info_outline_rounded, size: 18, color: CarRentalProductTheme.metaGrey),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      paymentNote,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: CarRentalProductTheme.metaGrey,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              FilledButton(
                onPressed: onContinue ?? () {},
                style: FilledButton.styleFrom(
                  backgroundColor: CarRentalProductTheme.primaryBlue,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  textStyle: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15),
                ),
                child: const Text('Continue'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
