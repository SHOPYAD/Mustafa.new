import 'package:flutter/material.dart';

import '../../car_rental_product_theme.dart';

/// Pick-up & drop-off: title, calendar row, car/location rows, local time note.
class CarRentalPickupDropoffSection extends StatelessWidget {
  const CarRentalPickupDropoffSection({
    super.key,
    required this.dateLine,
    required this.branchLine,
    required this.businessHoursLine,
  });

  final String dateLine;
  final String branchLine;
  final String businessHoursLine;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Pick-up & drop-off', style: CarRentalProductTheme.sectionTitle),
          const SizedBox(height: 12),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(Icons.calendar_today_outlined, size: 18, color: Colors.grey.shade600),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  dateLine,
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: CarRentalProductTheme.titleDark,
                    height: 1.35,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(Icons.directions_car_outlined, size: 18, color: Colors.grey.shade600),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      branchLine,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: CarRentalProductTheme.titleDark,
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      businessHoursLine,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: CarRentalProductTheme.metaGrey,
                        height: 1.35,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          const Text(
            'Note: All times are in local time',
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: CarRentalProductTheme.metaGrey),
          ),
        ],
      ),
    );
  }
}
