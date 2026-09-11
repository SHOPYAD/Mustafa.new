import 'package:flutter/material.dart';

import '../manage_account_theme.dart';

/// Full-width Sign Out pill + delete link + disclaimer (User Profile reference).
class SignOutDeleteSection extends StatelessWidget {
  const SignOutDeleteSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(ManageAccountTheme.cardRadius),
            border: Border.all(color: ManageAccountTheme.rowDivider),
            boxShadow: const [
              BoxShadow(color: ManageAccountTheme.cardShadow, blurRadius: 8, offset: Offset(0, 2)),
            ],
          ),
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: () {},
              borderRadius: BorderRadius.circular(ManageAccountTheme.cardRadius),
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 16),
                child: Center(
                  child: Text(
                    'Sign Out',
                    style: ManageAccountTheme.rowLabel.copyWith(fontWeight: FontWeight.w600),
                  ),
                ),
              ),
            ),
          ),
        ),
        const SizedBox(height: 20),
        Center(
          child: TextButton(
            onPressed: () {},
            child: Text(
              'Delete My Account',
              style: ManageAccountTheme.linkBlue.copyWith(fontSize: 16, fontWeight: FontWeight.w700),
            ),
          ),
        ),
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 12),
          child: Text(
            'Once deleted, all account information will be removed. You will not be able to recover this information.',
            textAlign: TextAlign.center,
            style: ManageAccountTheme.disclaimer,
          ),
        ),
      ],
    );
  }
}
