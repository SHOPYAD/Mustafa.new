import 'package:flutter/material.dart';

/// Property policies only (no tab bar). Safe inside [CustomScrollView].
class HotelDetailsPoliciesSection extends StatelessWidget {
  const HotelDetailsPoliciesSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
          child: Text(
            'Property policies',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: const Color(0xFF111827),
                ),
          ),
        ),
        const SizedBox(height: 12),
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16),
          child: _PolicyItem(
            icon: Icons.access_time_rounded,
            title: 'Check in/Check out',
            detail: 'Check-in: 13:00–23:00\nCheck-out: 11:00–12:00',
          ),
        ),
        const SizedBox(height: 12),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
          child: Row(
            children: [
              const Icon(Icons.child_care_outlined, color: Color(0xFF4B5563)),
              const SizedBox(width: 10),
              Text(
                'Child policies',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: const Color(0xFF111827),
                      fontWeight: FontWeight.w700,
                    ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _PolicyItem extends StatelessWidget {
  const _PolicyItem({
    required this.icon,
    required this.title,
    required this.detail,
  });

  final IconData icon;
  final String title;
  final String detail;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: const Color(0xFF4B5563), size: 22),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.w700,
                        color: const Color(0xFF111827),
                      ),
                ),
                const SizedBox(height: 10),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF3F4F8),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    detail,
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          height: 1.5,
                          color: const Color(0xFF1F2937),
                        ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
