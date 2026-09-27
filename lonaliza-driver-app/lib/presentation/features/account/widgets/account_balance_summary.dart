import 'package:flutter/material.dart';

import '../account_theme.dart';

class AccountBalanceSummary extends StatelessWidget {
  const AccountBalanceSummary({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AccountTheme.border),
      ),
      child: Row(
        children: [
          Expanded(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.monetization_on_rounded, color: AccountTheme.coinYellow, size: 26),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '≈\$0 (0 Trip Coins)',
                        style: AccountTheme.listTitle.copyWith(fontSize: 15),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Use Trip Coins to save more',
                        style: AccountTheme.listSubtitle.copyWith(fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Container(width: 1, height: 44, color: AccountTheme.border),
          const SizedBox(width: 10),
          Expanded(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.local_activity_outlined, color: AccountTheme.promoPink, size: 24),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    '0 Promo Codes',
                    style: AccountTheme.listTitle.copyWith(fontSize: 15),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
