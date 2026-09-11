import 'package:flutter/material.dart';

import '../account_theme.dart';

/// One row: leading icon, title, optional subtitle, trailing chevron.
class AccountMenuTile extends StatelessWidget {
  const AccountMenuTile({
    super.key,
    required this.icon,
    required this.title,
    this.subtitle,
    this.iconColor = AccountTheme.primaryBlueAlt,
    this.onTap,
    this.dense = false,
  });

  final IconData icon;
  final String title;
  final String? subtitle;
  final Color iconColor;
  final VoidCallback? onTap;
  final bool dense;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: EdgeInsets.symmetric(vertical: dense ? 10 : 14, horizontal: 0),
          child: Row(
            children: [
              Icon(icon, size: dense ? 22 : 24, color: iconColor),
              const SizedBox(width: 14),
              Expanded(
                child: subtitle == null
                    ? Text(title, style: AccountTheme.listTitle)
                    : Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(title, style: AccountTheme.listTitle),
                          const SizedBox(height: 2),
                          Text(subtitle!, style: AccountTheme.listSubtitle),
                        ],
                      ),
              ),
              Icon(Icons.chevron_right_rounded, color: Colors.grey.shade400, size: 26),
            ],
          ),
        ),
      ),
    );
  }
}
