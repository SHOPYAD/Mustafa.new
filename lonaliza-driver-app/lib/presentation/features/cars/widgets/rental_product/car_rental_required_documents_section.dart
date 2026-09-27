import 'package:flutter/material.dart';

import '../../car_rental_product_theme.dart';

class CarRentalRequiredDocumentsSection extends StatelessWidget {
  const CarRentalRequiredDocumentsSection({super.key, this.onDetails});

  final VoidCallback? onDetails;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              const Expanded(
                child: Text(
                  'Required documents at pick-up',
                  style: CarRentalProductTheme.sectionTitle,
                ),
              ),
              TextButton(
                onPressed: onDetails ?? () {},
                child: const Text('Details >', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
              ),
            ],
          ),
          const SizedBox(height: 8),
          const Text(
            'All drivers must have held their driver\'s licenses for at least 12 months',
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: CarRentalProductTheme.titleDark, height: 1.4),
          ),
          const SizedBox(height: 16),
          const _DocRow(
            icon: Icons.badge_outlined,
            title: 'ID requirements',
            subtitle: 'A valid passport or national ID',
          ),
          const SizedBox(height: 14),
          const _DocRow(
            icon: Icons.credit_card_outlined,
            title: 'Driver\'s license requirements',
            subtitle:
                'Original Driving License + International Driving Permit or United States Driver\'s license',
          ),
        ],
      ),
    );
  }
}

class _DocRow extends StatelessWidget {
  const _DocRow({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 22, color: Colors.grey.shade700),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800)),
              const SizedBox(height: 4),
              Text(
                subtitle,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: CarRentalProductTheme.metaGrey,
                  height: 1.4,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
