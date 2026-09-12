import 'package:flutter/material.dart';

import '../checkout_payment_theme.dart';
import 'checkout_payment_card_logos_row.dart';

enum CheckoutPaymentMethodTileKind { newCard, paypal, giftCard }

class CheckoutPaymentMethodTile extends StatelessWidget {
  const CheckoutPaymentMethodTile({
    super.key,
    required this.kind,
    required this.selected,
    required this.onTap,
  });

  final CheckoutPaymentMethodTileKind kind;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
      child: Material(
        color: CheckoutPaymentTheme.cardBg,
        borderRadius: BorderRadius.circular(12),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Ink(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: CheckoutPaymentTheme.border),
            ),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: switch (kind) {
                CheckoutPaymentMethodTileKind.newCard => _newCardRow(context),
                CheckoutPaymentMethodTileKind.paypal => _paypalRow(context),
                CheckoutPaymentMethodTileKind.giftCard => _giftRow(context),
              },
            ),
          ),
        ),
      ),
    );
  }

  Widget _newCardRow(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: const Color(0xFFEFF6FF),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(Icons.add_card_rounded, size: 22, color: CheckoutPaymentTheme.blueAlt),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('New credit/debit card', style: CheckoutPaymentTheme.methodTitle),
              const SizedBox(height: 10),
              const CheckoutPaymentCardLogosRow(),
            ],
          ),
        ),
        const SizedBox(width: 8),
        Padding(
          padding: const EdgeInsets.only(top: 2),
          child: _trailingSelector(selected),
        ),
      ],
    );
  }

  Widget _paypalRow(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Padding(
          padding: const EdgeInsets.all(4),
          child: Icon(Icons.paypal, size: 28, color: Colors.blue.shade900),
        ),
        const SizedBox(width: 8),
        const Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('PayPal', style: CheckoutPaymentTheme.methodTitle),
              SizedBox(height: 2),
              Text('Pay Later may be available', style: CheckoutPaymentTheme.methodSubtitle),
            ],
          ),
        ),
        _trailingSelector(selected),
      ],
    );
  }

  Widget _giftRow(BuildContext context) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: const Color(0xFFEDE9FE),
            borderRadius: BorderRadius.circular(8),
          ),
          child: const Icon(Icons.card_giftcard_rounded, size: 22, color: Color(0xFF6B46C1)),
        ),
        const SizedBox(width: 12),
        const Expanded(
          child: Text.rich(
            TextSpan(
              children: [
                TextSpan(text: 'Gift Card ', style: CheckoutPaymentTheme.methodTitle),
                TextSpan(
                  text: '(Optional)',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: CheckoutPaymentTheme.textLight,
                  ),
                ),
              ],
            ),
          ),
        ),
        Icon(Icons.chevron_right_rounded, color: Colors.grey.shade400, size: 26),
      ],
    );
  }

  Widget _trailingSelector(bool isOn) {
    if (isOn) {
      return Container(
        width: 24,
        height: 24,
        decoration: const BoxDecoration(
          color: CheckoutPaymentTheme.blueAlt,
          shape: BoxShape.circle,
        ),
        alignment: Alignment.center,
        child: const Icon(Icons.check_rounded, size: 15, color: Colors.white),
      );
    }
    return Container(
      width: 24,
      height: 24,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: Colors.grey.shade400, width: 2),
      ),
    );
  }
}
