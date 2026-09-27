import 'package:flutter/material.dart';

import '../car_detail_theme.dart';

class CarDetailBottomBar extends StatelessWidget {
  const CarDetailBottomBar({
    super.key,
    required this.priceLine,
    required this.subnote,
    this.onCustomize,
    this.onCheckAvailability,
  });

  final String priceLine;
  final String subnote;
  final VoidCallback? onCustomize;
  final VoidCallback? onCheckAvailability;

  @override
  Widget build(BuildContext context) {
    return Material(
      elevation: 8,
      shadowColor: Colors.black26,
      color: Colors.white,
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Text(priceLine, style: CarDetailTheme.bottomPrice),
                  const SizedBox(width: 6),
                  Icon(Icons.info_outline_rounded, size: 16, color: CarDetailTheme.metaGrey),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      subnote,
                      style: CarDetailTheme.accordionBody.copyWith(fontSize: 12),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: onCustomize ?? () {},
                      icon: const Icon(Icons.chat_bubble_outline_rounded, size: 18),
                      label: const Text('Customize trip'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: CarDetailTheme.primaryBlue,
                        side: const BorderSide(color: CarDetailTheme.primaryBlue, width: 1.5),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        textStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    flex: 2,
                    child: FilledButton(
                      onPressed: onCheckAvailability ?? () {},
                      style: FilledButton.styleFrom(
                        backgroundColor: CarDetailTheme.primaryBlue,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        textStyle: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15),
                      ),
                      child: const Text('Check availability'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
