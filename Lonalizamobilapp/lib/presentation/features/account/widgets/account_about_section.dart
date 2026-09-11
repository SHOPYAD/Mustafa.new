import 'package:flutter/material.dart';

import '../account_theme.dart';
import 'account_menu_tile.dart';
import 'account_section_header.dart';

class AccountAboutSection extends StatelessWidget {
  const AccountAboutSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const AccountSectionHeader(title: 'About & terms'),
        AccountMenuTile(
          icon: Icons.info_outline_rounded,
          title: 'About Trip.com',
          iconColor: AccountTheme.textBody,
          dense: true,
          onTap: () {},
        ),
        const Divider(height: 1, thickness: 1, color: AccountTheme.border),
        AccountMenuTile(
          icon: Icons.star_outline_rounded,
          title: 'Rate This App',
          iconColor: AccountTheme.textBody,
          dense: true,
          onTap: () {},
        ),
        const Divider(height: 1, thickness: 1, color: AccountTheme.border),
        AccountMenuTile(
          icon: Icons.description_outlined,
          title: 'Terms & conditions',
          iconColor: AccountTheme.textBody,
          dense: true,
          onTap: () {},
        ),
      ],
    );
  }
}
