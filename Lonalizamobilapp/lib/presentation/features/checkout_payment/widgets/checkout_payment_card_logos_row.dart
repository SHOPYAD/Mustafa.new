import 'package:flutter/material.dart';

/// Small pseudo brand chips (Visa, MC, UnionPay, JCB, Amex, Discover).
class CheckoutPaymentCardLogosRow extends StatelessWidget {
  const CheckoutPaymentCardLogosRow({super.key});

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 4,
      runSpacing: 4,
      children: [
        _chip('VISA', const Color(0xFF1A1F71), Colors.white),
        _chip('MC', const Color(0xFFEB001B), Colors.white),
        _chip('UP', const Color(0xFF047857), Colors.white),
        _chip('JCB', const Color(0xFF0079C1), Colors.white),
        _chip('AMEX', const Color(0xFF2E77BC), Colors.white),
        _chip('DISC', const Color(0xFFE55C20), Colors.white),
        _chip('DC', const Color(0xFF0079C1), Colors.white),
      ],
    );
  }

  Widget _chip(String text, Color bg, Color fg) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 3),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(3),
        border: Border.all(color: Colors.black.withValues(alpha: 0.06)),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 8,
          fontWeight: FontWeight.w900,
          fontStyle: FontStyle.italic,
          color: fg,
          height: 1,
        ),
      ),
    );
  }
}
