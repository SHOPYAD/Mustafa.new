import 'package:flutter/material.dart';

import '../../car_rental_product_theme.dart';

class CarRentalPoliciesNotesSection extends StatelessWidget {
  const CarRentalPoliciesNotesSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text('Policies & notes', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
          const SizedBox(height: 12),
          _PolicyRow(
            title: 'Cross-border policy',
            trailing: 'Select >',
            body:
                'Please select the countries you will be driving to, and check the relevant policies and fees in advance.',
            onTap: () {},
          ),
          const SizedBox(height: 16),
          const Text(
            'Interstate policy',
            style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 6),
          const Text(
            'Interstate travel permitted (with conditions): Vehicles rented at most SIXT locations in the contiguous United States may be driven across state lines. Additional fees or restrictions may apply.',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: CarRentalProductTheme.metaGrey,
              height: 1.45,
            ),
          ),
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFF3F4F6),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.error_outline_rounded, size: 20, color: Colors.red.shade600),
                const SizedBox(width: 10),
                const Expanded(
                  child: Text(
                    'If you plan to cross regions, please inform the staff in advance. Additional charges may apply.',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: CarRentalProductTheme.titleDark,
                      height: 1.4,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          const Text('More policies', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w900)),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _PolicyChip('Branch notice', () {}),
              _PolicyChip('Contract Amount Check', () {}),
              _PolicyChip('Keep a record of vehicle condition', () {}),
              _PolicyChip('Early/late pick-up & drop-off', () {}),
              _PolicyChip('Management fee', () {}),
            ],
          ),
          const SizedBox(height: 14),
          Center(
            child: OutlinedButton(
              onPressed: () {},
              style: OutlinedButton.styleFrom(
                foregroundColor: CarRentalProductTheme.primaryBlue,
                side: const BorderSide(color: CarRentalProductTheme.primaryBlue, width: 1.5),
                padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              child: const Text('Show all', style: TextStyle(fontWeight: FontWeight.w800)),
            ),
          ),
        ],
      ),
    );
  }
}

class _PolicyRow extends StatelessWidget {
  const _PolicyRow({
    required this.title,
    required this.trailing,
    required this.body,
    this.onTap,
  });

  final String title;
  final String trailing;
  final String body;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Expanded(child: Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800))),
            TextButton(
              onPressed: onTap,
              child: Text(trailing, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          body,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w500,
            color: CarRentalProductTheme.metaGrey,
            height: 1.4,
          ),
        ),
      ],
    );
  }
}

class _PolicyChip extends StatelessWidget {
  const _PolicyChip(this.label, this.onTap);

  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: const Color(0xFFF3F4F6),
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 200),
                child: Text(
                  label,
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                ),
              ),
              const SizedBox(width: 4),
              const Icon(Icons.chevron_right_rounded, size: 18),
            ],
          ),
        ),
      ),
    );
  }
}
