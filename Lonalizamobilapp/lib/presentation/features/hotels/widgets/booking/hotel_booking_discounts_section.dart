import 'package:flutter/material.dart';

class HotelBookingDiscountsSection extends StatelessWidget {
  const HotelBookingDiscountsSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Discounts & benefits',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w800,
                color: const Color(0xFF111827),
              ),
        ),
        const SizedBox(height: 8),
        const Divider(height: 1),
        ListTile(
          contentPadding: EdgeInsets.zero,
          leading: Icon(Icons.local_activity_outlined, color: Colors.grey.shade700),
          title: Text(
            'Promo Code',
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w700),
          ),
          subtitle: Text(
            'Please enter your promo code (0 available)',
            style: Theme.of(context).textTheme.bodySmall?.copyWith(color: const Color(0xFF6B7280)),
          ),
          trailing: Icon(Icons.chevron_right_rounded, color: Colors.grey.shade500),
          onTap: () {},
        ),
        const Divider(height: 1),
        ListTile(
          contentPadding: EdgeInsets.zero,
          leading: Container(
            width: 28,
            height: 28,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: const Color(0xFFF59E0B), width: 1.5),
            ),
            child: Text(
              'T',
              style: TextStyle(
                fontWeight: FontWeight.w800,
                color: Colors.amber.shade800,
                fontSize: 14,
              ),
            ),
          ),
          title: Text(
            'نقاط لوناليزا',
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w700),
          ),
          subtitle: Text.rich(
            TextSpan(
              style: Theme.of(context).textTheme.bodySmall?.copyWith(color: const Color(0xFF6B7280)),
              children: const [
                TextSpan(text: 'Earn '),
                TextSpan(
                  text: '106 نقاط لوناليزا (≈\$1.06)',
                  style: TextStyle(
                    color: Color(0xFFB45309),
                    fontWeight: FontWeight.w700,
                  ),
                ),
                TextSpan(text: ' after your stay.'),
              ],
            ),
          ),
          trailing: Icon(Icons.keyboard_arrow_down_rounded, color: Colors.grey.shade500),
          onTap: () {},
        ),
      ],
    );
  }
}
