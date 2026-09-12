import 'package:flutter/material.dart';

/// Trip summary card at the top of Confirm Booking
class PackageBookingTripSummary extends StatelessWidget {
  const PackageBookingTripSummary({
    super.key,
    required this.title,
    required this.departCity,
    required this.dateRange,
    required this.adults,
  });

  final String title;
  final String departCity;
  final String dateRange;
  final int adults;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 6, offset: const Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title,
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Color(0xFF111827))),
          const SizedBox(height: 10),
          _Row(icon: Icons.flag_outlined, text: 'Depart from $departCity'),
          const SizedBox(height: 6),
          _Row(icon: Icons.calendar_today_outlined, text: dateRange),
          const SizedBox(height: 6),
          _Row(icon: Icons.person_outline_rounded, text: '$adults adults'),
        ],
      ),
    );
  }
}

class _Row extends StatelessWidget {
  const _Row({required this.icon, required this.text});
  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 14, color: const Color(0xFF6B7280)),
        const SizedBox(width: 6),
        Text(text, style: const TextStyle(fontSize: 13, color: Color(0xFF374151))),
      ],
    );
  }
}
