import 'package:flutter/material.dart';

import '../../car_rental_product_theme.dart';

/// Title row + "or similar …" + specs row (seats, bags, doors, transmission, fuel).
class CarRentalOverviewCard extends StatelessWidget {
  const CarRentalOverviewCard({
    super.key,
    required this.vehicleName,
    required this.similarClassLine,
    this.seats = 5,
    this.suitcases = 2,
    this.doors = 4,
    this.transmission = 'Automatic',
    this.fuelLabel = 'Fuel',
  });

  final String vehicleName;
  final String similarClassLine;
  final int seats;
  final int suitcases;
  final int doors;
  final String transmission;
  final String fuelLabel;

  @override
  Widget build(BuildContext context) {
    return Transform.translate(
      offset: const Offset(0, -12),
      child: Material(
        color: Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        elevation: 4,
        shadowColor: Colors.black12,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 20, 16, 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: RichText(
                      text: TextSpan(
                        style: CarRentalProductTheme.vehicleTitle,
                        children: [
                          TextSpan(text: vehicleName),
                          TextSpan(
                            text: ' $similarClassLine',
                            style: CarRentalProductTheme.vehicleTitle.copyWith(
                              fontWeight: FontWeight.w600,
                              fontSize: 15,
                              color: CarRentalProductTheme.metaGrey,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  IconButton(
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                    onPressed: () {},
                    icon: const Icon(Icons.info_outline_rounded, size: 20, color: CarRentalProductTheme.metaGrey),
                  ),
                ],
              ),
              const SizedBox(height: 14),
              Wrap(
                spacing: 14,
                runSpacing: 10,
                children: [
                  _Spec(icon: Icons.person_outline_rounded, text: '$seats seats'),
                  _Spec(icon: Icons.luggage_outlined, text: '$suitcases suitcases'),
                  _Spec(icon: Icons.door_front_door_outlined, text: '$doors doors'),
                  _Spec(icon: Icons.settings_outlined, text: transmission),
                  _Spec(icon: Icons.local_gas_station_outlined, text: fuelLabel),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Spec extends StatelessWidget {
  const _Spec({required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 18, color: Colors.grey.shade600),
        const SizedBox(width: 6),
        Text(
          text,
          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: CarRentalProductTheme.titleDark),
        ),
      ],
    );
  }
}
