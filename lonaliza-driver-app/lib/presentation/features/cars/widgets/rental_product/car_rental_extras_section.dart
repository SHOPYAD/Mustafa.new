import 'package:flutter/material.dart';

import '../../car_rental_product_theme.dart';

class CarRentalExtrasSection extends StatelessWidget {
  const CarRentalExtrasSection({
    super.key,
    this.onAdd,
  });

  final VoidCallback? onAdd;

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
                child: Text('Extras', style: CarRentalProductTheme.sectionTitle),
              ),
              TextButton(
                onPressed: onAdd ?? () {},
                child: const Text('Add >', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 14)),
              ),
            ],
          ),
          const SizedBox(height: 10),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _Chip(label: '1 additional driver'),
                const SizedBox(width: 8),
                _Chip(label: 'GPS'),
                const SizedBox(width: 8),
                _Chip(label: '…'),
              ],
            ),
          ),
          const SizedBox(height: 14),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(Icons.info_outline_rounded, size: 18, color: Colors.grey.shade600),
              const SizedBox(width: 8),
              const Expanded(
                child: Text(
                  'Please note that if you are traveling with a child, a car seat that meets legal requirements must be installed in the car.',
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: CarRentalProductTheme.metaGrey,
                    height: 1.4,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFFF3F4F6),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
    );
  }
}
