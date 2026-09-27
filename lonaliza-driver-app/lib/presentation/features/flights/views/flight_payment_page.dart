import 'package:flutter/material.dart';

import '../../checkout_payment/views/checkout_payment_page.dart';

class FlightPaymentPage extends StatelessWidget {
  const FlightPaymentPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const CheckoutPaymentPage(totalAmountLabel: 'USD619.30');
  }
}
