import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../providers/router_providers.dart';
import '../account_theme.dart';
import 'account_menu_tile.dart';

class AccountMainMenuSection extends ConsumerWidget {
  const AccountMainMenuSection({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final nav = ref.read(navigationRepositoryProvider);

    return Column(
      children: [
        AccountMenuTile(
          icon: Icons.calendar_month_rounded,
          title: 'All bookings',
          dense: true,
          onTap: nav.goAccountAllBookings,
        ),
        const Divider(height: 1, thickness: 1, color: AccountTheme.border),
        AccountMenuTile(
          icon: Icons.work_outline_rounded,
          title: 'Upcoming',
          dense: true,
          onTap: nav.goAccountUpcoming,
        ),
        const Divider(height: 1, thickness: 1, color: AccountTheme.border),
        AccountMenuTile(
          icon: Icons.history_rounded,
          title: 'Recently viewed',
          dense: true,
          onTap: nav.goAccountRecentlyViewed,
        ),
        const Divider(height: 1, thickness: 1, color: AccountTheme.border),
        AccountMenuTile(
          icon: Icons.credit_card_outlined,
          title: 'My cards',
          dense: true,
          onTap: nav.goAccountMyCards,
        ),
        const Divider(height: 1, thickness: 1, color: AccountTheme.border),
        AccountMenuTile(
          icon: Icons.person_outline_rounded,
          title: 'Frequent info',
          dense: true,
          onTap: () {},
        ),
        const Divider(height: 1, thickness: 1, color: AccountTheme.border),
        AccountMenuTile(
          icon: Icons.favorite_outline_rounded,
          title: 'Saved',
          dense: true,
          onTap: () {},
        ),
      ],
    );
  }
}
