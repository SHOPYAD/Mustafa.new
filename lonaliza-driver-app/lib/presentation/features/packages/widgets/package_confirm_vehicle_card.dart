import 'package:flutter/material.dart';

/// Vehicle option card used in the "Vehicle options" section
class PackageConfirmVehicleCard extends StatelessWidget {
  const PackageConfirmVehicleCard({
    super.key,
    required this.label,
    required this.seats,
    required this.passengers,
    required this.luggage,
    required this.model,
    required this.extraPrice,
    required this.isSelected,
    required this.onTap,
  });

  final String label;       // e.g. "Comfort (5 seats)"
  final int seats;
  final int passengers;
  final int luggage;
  final String model;       // e.g. "Hongqi H5/Volkswagen Passat B5"
  final String extraPrice;  // e.g. "+\$0" or "+\$98.38"
  final bool isSelected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFEFF6FF) : Colors.white,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected ? const Color(0xFF2563EB) : const Color(0xFFE5E7EB),
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Car illustration placeholder
            Center(
              child: Container(
                height: 70,
                alignment: Alignment.center,
                child: Icon(
                  seats <= 5 ? Icons.directions_car_rounded : Icons.airport_shuttle_rounded,
                  size: 52,
                  color: const Color(0xFF9CA3AF),
                ),
              ),
            ),
            const SizedBox(height: 8),

            // Label
            Text(label,
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: Color(0xFF111827))),
            const SizedBox(height: 4),

            // Capacity icons
            Row(
              children: [
                const Icon(Icons.person_outline_rounded, size: 13, color: Color(0xFF6B7280)),
                Text(' $passengers', style: const TextStyle(fontSize: 12, color: Color(0xFF6B7280))),
                const SizedBox(width: 6),
                const Icon(Icons.luggage_outlined, size: 13, color: Color(0xFF6B7280)),
                Text(' $luggage', style: const TextStyle(fontSize: 12, color: Color(0xFF6B7280))),
                const SizedBox(width: 4),
                const Icon(Icons.info_outline_rounded, size: 12, color: Color(0xFF9CA3AF)),
              ],
            ),
            const SizedBox(height: 2),

            // Car model
            Text(model, style: const TextStyle(fontSize: 11, color: Color(0xFF9CA3AF))),
            const SizedBox(height: 8),

            // Price
            Text(extraPrice,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                  color: isSelected ? const Color(0xFF2563EB) : const Color(0xFF111827),
                )),
          ],
        ),
      ),
    );
  }
}
