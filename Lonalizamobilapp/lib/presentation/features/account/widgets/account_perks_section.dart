import 'package:flutter/material.dart';

import '../account_theme.dart';
import 'account_menu_tile.dart';
import 'account_section_header.dart';

class AccountPerksSection extends StatelessWidget {
  const AccountPerksSection({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const AccountSectionHeader(title: 'Perks'),
        AccountMenuTile(
          icon: Icons.person_add_alt_1_outlined,
          title: 'Invite & Earn',
          dense: true,
          onTap: () {},
        ),
        const Divider(height: 1, thickness: 1, color: AccountTheme.border),
        AccountMenuTile(
          icon: Icons.toll_outlined,
          title: 'Redeem نقاط لوناليزا',
          dense: true,
          onTap: () {},
        ),
        const Divider(height: 1, thickness: 1, color: AccountTheme.border),
        AccountMenuTile(
          icon: Icons.card_giftcard_outlined,
          title: 'Gift Cards',
          dense: true,
          onTap: () {},
        ),
      ],
    );
  }
}
