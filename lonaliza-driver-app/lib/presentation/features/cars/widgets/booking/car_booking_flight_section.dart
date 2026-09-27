import 'package:flutter/material.dart';

import '../../car_booking_theme.dart';

/// Flight number (optional) + notice row with chevron.
class CarBookingFlightSection extends StatelessWidget {
  const CarBookingFlightSection({
    super.key,
    required this.flightController,
    this.onNoticeTap,
  });

  final TextEditingController flightController;
  final VoidCallback? onNoticeTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 12, 16, 0),
      padding: const EdgeInsets.fromLTRB(14, 14, 14, 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Expanded(
                child: Row(
                  children: [
                    Text('Flight number', style: CarBookingTheme.sectionTitle.copyWith(fontSize: 16)),
                    const SizedBox(width: 4),
                    Text(
                      '(Optional)',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                        color: Colors.grey.shade700,
                      ),
                    ),
                  ],
                ),
              ),
              IconButton(
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                onPressed: () {},
                icon: const Icon(Icons.info_outline_rounded, size: 20, color: CarBookingTheme.metaGrey),
              ),
            ],
          ),
          const SizedBox(height: 10),
          TextFormField(
            controller: flightController,
            decoration: const InputDecoration(
              hintText: 'Flight number',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 10),
          InkWell(
            onTap: onNoticeTap,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Expanded(
                  child: Text(
                    'If your flight is delayed, your car will be held until 11:00 AM on the day of pick-up',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: CarBookingTheme.metaGrey, height: 1.35),
                  ),
                ),
                Icon(Icons.chevron_right_rounded, color: Colors.grey.shade500),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
