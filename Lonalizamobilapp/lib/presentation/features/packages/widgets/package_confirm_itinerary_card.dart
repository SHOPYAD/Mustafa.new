import 'package:flutter/material.dart';

/// "Your itinerary includes" summary card at the top
class PackageConfirmItineraryCard extends StatelessWidget {
  const PackageConfirmItineraryCard({
    super.key,
    required this.departure,
    required this.returnDate,
    required this.nights,
    required this.days,
  });

  final String departure;
  final String returnDate;
  final int nights;
  final int days;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.06), blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Your itinerary includes',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: Color(0xFF111827))),
          const SizedBox(height: 12),
          // Date range
          Row(
            children: [
              Text(departure, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF111827))),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 8),
                child: Icon(Icons.arrow_forward_rounded, size: 16, color: Color(0xFF6B7280)),
              ),
              Text(returnDate, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF111827))),
            ],
          ),
          const SizedBox(height: 10),
          // Night + day info
          Row(
            children: [
              const Icon(Icons.bed_outlined, size: 14, color: Color(0xFF6B7280)),
              const SizedBox(width: 4),
              Text('$nights-night stay', style: const TextStyle(fontSize: 13, color: Color(0xFF6B7280))),
              const SizedBox(width: 20),
              const Icon(Icons.play_circle_outline_rounded, size: 14, color: Color(0xFF6B7280)),
              const SizedBox(width: 4),
              Text('$days-day itinerary', style: const TextStyle(fontSize: 13, color: Color(0xFF6B7280))),
            ],
          ),
        ],
      ),
    );
  }
}
