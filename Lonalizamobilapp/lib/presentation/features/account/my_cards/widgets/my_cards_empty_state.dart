import 'package:flutter/material.dart';

import '../my_cards_theme.dart';

class MyCardsEmptyState extends StatelessWidget {
  const MyCardsEmptyState({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 28),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          SizedBox(
            width: 200,
            height: 200,
            child: Stack(
              alignment: Alignment.center,
              children: [
                Container(
                  width: 168,
                  height: 168,
                  decoration: const BoxDecoration(
                    color: Color(0xFFEFF6FF),
                    shape: BoxShape.circle,
                  ),
                ),
                Positioned(
                  top: 28,
                  left: 36,
                  child: Transform.rotate(
                    angle: -0.5,
                    child: Icon(Icons.eco_rounded, size: 28, color: Colors.amber.shade600),
                  ),
                ),
                Positioned(
                  top: 40,
                  right: 42,
                  child: Transform.rotate(
                    angle: 0.4,
                    child: Icon(Icons.eco_rounded, size: 22, color: Colors.amber.shade500),
                  ),
                ),
                Icon(
                  Icons.account_balance_wallet_outlined,
                  size: 72,
                  color: Colors.blue.shade400,
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Text('No Saved Cards', style: MyCardsTheme.emptyTitle),
          const SizedBox(height: 12),
          Text(
            'When paying, you can choose to save your bank card details for a more convenient payment experience next time.',
            textAlign: TextAlign.center,
            style: MyCardsTheme.emptyBody,
          ),
        ],
      ),
    );
  }
}
