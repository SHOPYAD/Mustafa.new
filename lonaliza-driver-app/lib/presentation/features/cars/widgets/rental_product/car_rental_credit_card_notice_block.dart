import 'package:flutter/material.dart';

import '../../car_rental_product_theme.dart';

/// Credit card + deposit copy (documents tab extended content).
class CarRentalCreditCardNoticeBlock extends StatelessWidget {
  const CarRentalCreditCardNoticeBlock({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(Icons.credit_card_outlined, size: 22, color: Colors.grey.shade700),
              const SizedBox(width: 12),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'The credit card must be in the name of the main driver',
                      style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, height: 1.25),
                    ),
                    SizedBox(height: 6),
                    Text(
                      'Credit card/cards must have a chip. UnionPay credit cards (single brand and co-branded) are accepted',
                      style: TextStyle(
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
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: 'Mastercard Amex Visa Diners Discover JCB'
                .split(' ')
                .map((name) => _MiniBrand(name))
                .toList(),
          ),
          const SizedBox(height: 10),
          const Text(
            'The deposit is expected to be the rental fee + \$200.00-\$2,500.00',
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: CarRentalProductTheme.metaGrey, height: 1.4),
          ),
          const SizedBox(height: 16),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(Icons.article_outlined, size: 22, color: Colors.grey.shade700),
              const SizedBox(width: 12),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Pick-up voucher', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800)),
                    SizedBox(height: 6),
                    Text(
                      'Provided by Trip.com once your booking is confirmed.',
                      style: TextStyle(
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
          ),
        ],
      ),
    );
  }
}

class _MiniBrand extends StatelessWidget {
  const _MiniBrand(this.name);

  final String name;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        border: Border.all(color: const Color(0xFFE5E7EB)),
        borderRadius: BorderRadius.circular(4),
        color: Colors.white,
      ),
      child: Text(name, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700)),
    );
  }
}
