import 'package:flutter/material.dart';

class FlightsSearchSummaryRow extends StatelessWidget {
  const FlightsSearchSummaryRow({super.key});

  @override
  Widget build(BuildContext context) {
    return Text(
      'Average one-way price per passenger, taxes and fees included',
      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
            color: const Color(0xFF6B7280),
            fontWeight: FontWeight.w500,
          ),
    );
  }
}
