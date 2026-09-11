import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

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
        AccountMenuTile(icon: Icons.dashboard_outlined, title: 'Overview', dense: true, onTap: () => context.push('/account/wallet')),
        const Divider(height: 1, thickness: 1, color: AccountTheme.border),
        AccountMenuTile(icon: Icons.calendar_month_rounded, title: 'Bookings', dense: true, onTap: nav.goAccountAllBookings),
        const Divider(height: 1, thickness: 1, color: AccountTheme.border),
        AccountMenuTile(icon: Icons.receipt_long_outlined, title: 'Payments', dense: true, onTap: () => context.push('/account/payments')),
        const Divider(height: 1, thickness: 1, color: AccountTheme.border),
        AccountMenuTile(icon: Icons.account_balance_wallet_outlined, title: 'Wallet & points', dense: true, onTap: () => context.push('/account/wallet')),
        const Divider(height: 1, thickness: 1, color: AccountTheme.border),
        AccountMenuTile(icon: Icons.local_offer_outlined, title: 'Coupons', dense: true, onTap: () => context.push('/account/coupons')),
        const Divider(height: 1, thickness: 1, color: AccountTheme.border),
        AccountMenuTile(icon: Icons.share_outlined, title: 'Affiliate', dense: true, onTap: () => context.push('/account/affiliate')),
        const Divider(height: 1, thickness: 1, color: AccountTheme.border),
        AccountMenuTile(icon: Icons.workspace_premium_outlined, title: 'Tiers', dense: true, onTap: () => context.push('/account/wallet')),
        const Divider(height: 1, thickness: 1, color: AccountTheme.border),
        AccountMenuTile(icon: Icons.groups_outlined, title: 'Social profile', dense: true, onTap: () => context.push('/site?path=${Uri.encodeQueryComponent('/account?tab=social')}')),
        const Divider(height: 1, thickness: 1, color: AccountTheme.border),
        AccountMenuTile(icon: Icons.chat_outlined, title: 'Chats', dense: true, onTap: () => context.push('/site?path=${Uri.encodeQueryComponent('/account?tab=chats')}')),
        const Divider(height: 1, thickness: 1, color: AccountTheme.border),
        AccountMenuTile(icon: Icons.menu_book_outlined, title: 'Programs', dense: true, onTap: () => context.push('/site?path=${Uri.encodeQueryComponent('/account?tab=programs')}')),
        const Divider(height: 1, thickness: 1, color: AccountTheme.border),
        AccountMenuTile(icon: Icons.person_outline_rounded, title: 'Profile', dense: true, onTap: nav.goAccountManage),
        const Divider(height: 1, thickness: 1, color: AccountTheme.border),
        AccountMenuTile(icon: Icons.article_outlined, title: 'Blog & legal', dense: true, onTap: () => context.push('/site?path=/blog')),
      ],
    );
  }
}
