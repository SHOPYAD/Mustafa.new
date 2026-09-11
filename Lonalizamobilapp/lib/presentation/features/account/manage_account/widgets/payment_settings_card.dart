import 'package:flutter/material.dart';

import '../manage_account_theme.dart';
import 'manage_account_icon_row.dart';

/// "Payment Settings" card with Security PIN row.
class PaymentSettingsCard extends StatelessWidget {
  const PaymentSettingsCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(ManageAccountTheme.cardRadius),
        boxShadow: const [
          BoxShadow(color: ManageAccountTheme.cardShadow, blurRadius: 10, offset: Offset(0, 2)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Padding(
            padding: EdgeInsets.fromLTRB(
              ManageAccountTheme.cardPad,
              ManageAccountTheme.cardPad,
              ManageAccountTheme.cardPad,
              4,
            ),
            child: Text('Payment Settings', style: ManageAccountTheme.sectionHeader),
          ),
          Divider(height: 1, thickness: 1, color: ManageAccountTheme.rowDivider),
          ManageAccountIconRow(
            icon: Icons.shield_outlined,
            label: 'Security PIN Code',
            value: 'Not set',
            showChevron: true,
            onTap: () {},
          ),
          const SizedBox(height: 4),
        ],
      ),
    );
  }
}
