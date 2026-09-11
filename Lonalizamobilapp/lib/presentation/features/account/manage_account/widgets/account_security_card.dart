import 'package:flutter/material.dart';

import '../../account_theme.dart';
import '../manage_account_theme.dart';
import 'manage_account_icon_row.dart';

/// "Account Security" white card (linked email, phone, password, devices, history).
class AccountSecurityCard extends StatelessWidget {
  const AccountSecurityCard({super.key});

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
            child: Text('Account Security', style: ManageAccountTheme.sectionHeader),
          ),
          Divider(height: 1, thickness: 1, color: ManageAccountTheme.rowDivider),
          ManageAccountIconRow(
            icon: Icons.mail_outline_rounded,
            label: 'Linked Email',
            value: 'ahme*****ukh@gmail.com',
            showChevron: true,
            onTap: () {},
          ),
          Divider(height: 1, thickness: 1, color: ManageAccountTheme.rowDivider, indent: ManageAccountTheme.cardPad),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: ManageAccountTheme.cardPad, vertical: 12),
            child: Row(
              children: [
                Icon(Icons.phone_outlined, size: ManageAccountTheme.iconBox, color: Colors.grey.shade800),
                const SizedBox(width: 12),
                Expanded(child: Text('Linked Phone', style: ManageAccountTheme.rowLabel)),
                _LinkPillButton(label: 'Link', onPressed: () {}),
              ],
            ),
          ),
          Divider(height: 1, thickness: 1, color: ManageAccountTheme.rowDivider, indent: ManageAccountTheme.cardPad),
          ManageAccountIconRow(
            icon: Icons.lock_outline_rounded,
            label: 'Reset Password',
            value: '••••••',
            showChevron: true,
            onTap: () {},
          ),
          Divider(height: 1, thickness: 1, color: ManageAccountTheme.rowDivider, indent: ManageAccountTheme.cardPad),
          ManageAccountIconRow(
            icon: Icons.smartphone_outlined,
            label: 'Manage Devices',
            showChevron: true,
            onTap: () {},
          ),
          Divider(height: 1, thickness: 1, color: ManageAccountTheme.rowDivider, indent: ManageAccountTheme.cardPad),
          ManageAccountIconRow(
            icon: Icons.history_rounded,
            label: 'Sign-in history',
            showChevron: true,
            onTap: () {},
          ),
          const SizedBox(height: 4),
        ],
      ),
    );
  }
}

class _LinkPillButton extends StatelessWidget {
  const _LinkPillButton({required this.label, required this.onPressed});

  final String label;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AccountTheme.primaryBlueAlt,
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        onTap: onPressed,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
          child: Text(
            label,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Colors.white,
            ),
          ),
        ),
      ),
    );
  }
}
