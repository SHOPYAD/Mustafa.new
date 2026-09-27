import 'package:flutter/material.dart';

import '../account_theme.dart';

class AccountTrustFooter extends StatelessWidget {
  const AccountTrustFooter({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          'Service you can rely on',
          style: AccountTheme.trustCaption.copyWith(fontSize: 12),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.verified_rounded, size: 18, color: AccountTheme.primaryBlue),
                  const SizedBox(width: 6),
                  Flexible(
                    child: Text(
                      'Support in approx. 30s',
                      style: AccountTheme.trustCaption,
                      textAlign: TextAlign.center,
                      maxLines: 2,
                    ),
                  ),
                ],
              ),
            ),
            Container(width: 1, height: 28, color: AccountTheme.border),
            Expanded(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.verified_rounded, size: 18, color: AccountTheme.primaryBlue),
                  const SizedBox(width: 6),
                  Flexible(
                    child: Text(
                      'Travel worry-free',
                      style: AccountTheme.trustCaption,
                      textAlign: TextAlign.center,
                      maxLines: 2,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }
}
