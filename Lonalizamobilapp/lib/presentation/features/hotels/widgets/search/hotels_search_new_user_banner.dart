import 'package:flutter/material.dart';

class HotelsSearchNewUserBanner extends StatelessWidget {
  const HotelsSearchNewUserBanner({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(12, 16, 12, 0),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF3F4),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  'New user benefits',
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    color: const Color(0xFFD4145A),
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              FilledButton(
                onPressed: () {},
                style: FilledButton.styleFrom(
                  backgroundColor: const Color(0xFF7C3AED),
                  foregroundColor: Colors.white,
                  minimumSize: const Size(0, 32),
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: const Text('Claim All'),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: const [
              Expanded(
                child: _BenefitTile(
                  title: 'Up to \$10 off',
                  subtitle: 'New user promo code',
                ),
              ),
              SizedBox(width: 8),
              Expanded(
                child: _BenefitTile(
                  title: 'Up to 20% off',
                  subtitle: 'First Booking Deal',
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _BenefitTile extends StatelessWidget {
  const _BenefitTile({required this.title, required this.subtitle});

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
              color: const Color(0xFFD4145A),
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            subtitle,
            style: Theme.of(context).textTheme.labelMedium?.copyWith(
              color: const Color(0xFFD4145A),
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
