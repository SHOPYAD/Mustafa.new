import 'package:flutter/material.dart';

import '../account_theme.dart';

class AccountSectionHeader extends StatelessWidget {
  const AccountSectionHeader({
    super.key,
    required this.title,
    this.showTrailingChevron = false,
    this.onTap,
  });

  final String title;
  final bool showTrailingChevron;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final row = Row(
      children: [
        Expanded(
          child: Text(title, style: AccountTheme.sectionTitle),
        ),
        if (showTrailingChevron)
          Icon(Icons.chevron_right_rounded, color: Colors.grey.shade400, size: 26),
      ],
    );

    if (onTap != null) {
      return InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.only(bottom: 10, top: 4),
          child: row,
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 10, top: 4),
      child: row,
    );
  }
}
