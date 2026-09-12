import 'package:flutter/material.dart';

class PackageBookingsRow extends StatelessWidget {
  const PackageBookingsRow({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        title: const Text(
          'My Bookings',
          style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Color(0xFF111827)),
        ),
        trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 16, color: Color(0xFF9CA3AF)),
        onTap: () {},
      ),
    );
  }
}
