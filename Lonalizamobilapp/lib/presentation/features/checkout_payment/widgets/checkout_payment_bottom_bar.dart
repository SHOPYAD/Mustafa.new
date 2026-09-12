import 'package:flutter/material.dart';

import '../checkout_payment_theme.dart';

class CheckoutPaymentBottomBar extends StatelessWidget {
  const CheckoutPaymentBottomBar({
    super.key,
    required this.buttonLabel,
    required this.onPrimaryPressed,
  });

  final String buttonLabel;
  final VoidCallback onPrimaryPressed;

  @override
  Widget build(BuildContext context) {
    final bottom = MediaQuery.paddingOf(context).bottom;
    return Material(
      elevation: 12,
      color: Colors.white,
      child: Padding(
        padding: EdgeInsets.fromLTRB(16, 14, 16, 14 + bottom),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(
              width: double.infinity,
              height: 50,
              child: FilledButton(
                onPressed: onPrimaryPressed,
                style: FilledButton.styleFrom(
                  backgroundColor: CheckoutPaymentTheme.blueAlt,
                  foregroundColor: Colors.white,
                  elevation: 0,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: Text(buttonLabel, style: CheckoutPaymentTheme.payButton),
              ),
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.verified_rounded, size: 15, color: Colors.teal.shade600),
                const SizedBox(width: 4),
                Text('Multiple ways to pay', style: CheckoutPaymentTheme.trustFoot),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  child: Text('|', style: TextStyle(color: Colors.grey.shade300, fontSize: 12)),
                ),
                Icon(Icons.verified_rounded, size: 15, color: Colors.teal.shade600),
                const SizedBox(width: 4),
                Text('Worldwide coverage', style: CheckoutPaymentTheme.trustFoot),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
