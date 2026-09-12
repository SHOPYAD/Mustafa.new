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
        AccountMenuTile(icon: Icons.luggage_outlined, title: 'حجوزاتي والقادمة', dense: true, onTap: nav.goMyTrips),
        const Divider(height: 1, thickness: 1, color: AccountTheme.border),
        AccountMenuTile(icon: Icons.receipt_long_outlined, title: 'المدفوعات', dense: true, onTap: () => context.push('/account/payments')),
        const Divider(height: 1, thickness: 1, color: AccountTheme.border),
        AccountMenuTile(icon: Icons.account_balance_wallet_outlined, title: 'المحفظة والنقاط', dense: true, onTap: () => context.push('/account/wallet')),
        const Divider(height: 1, thickness: 1, color: AccountTheme.border),
        AccountMenuTile(icon: Icons.local_offer_outlined, title: 'الكوبونات', dense: true, onTap: () => context.push('/account/coupons')),
        const Divider(height: 1, thickness: 1, color: AccountTheme.border),
        AccountMenuTile(icon: Icons.share_outlined, title: 'التسويق بالعمولة', dense: true, onTap: () => context.push('/account/affiliate')),
        const Divider(height: 1, thickness: 1, color: AccountTheme.border),
        AccountMenuTile(icon: Icons.mail_outline, title: 'الرسائل', dense: true, onTap: () => context.go('/messages')),
        const Divider(height: 1, thickness: 1, color: AccountTheme.border),
        AccountMenuTile(icon: Icons.groups_outlined, title: 'المجتمع واللحظات', dense: true, onTap: () => context.push('/community')),
        const Divider(height: 1, thickness: 1, color: AccountTheme.border),
        AccountMenuTile(icon: Icons.smart_toy_outlined, title: 'المساعد والبرامج', dense: true, onTap: () => context.push('/ai')),
        const Divider(height: 1, thickness: 1, color: AccountTheme.border),
        AccountMenuTile(icon: Icons.card_giftcard_outlined, title: 'بطاقات الهدايا', dense: true, onTap: () => context.push('/gift-cards')),
        const Divider(height: 1, thickness: 1, color: AccountTheme.border),
        AccountMenuTile(icon: Icons.credit_card_outlined, title: 'بطاقاتي', dense: true, onTap: () => context.push('/account/my-cards')),
        const Divider(height: 1, thickness: 1, color: AccountTheme.border),
        AccountMenuTile(icon: Icons.history, title: 'شوهد مؤخراً', dense: true, onTap: () => context.push('/account/recently-viewed')),
        const Divider(height: 1, thickness: 1, color: AccountTheme.border),
        AccountMenuTile(icon: Icons.person_outline_rounded, title: 'الملف الشخصي', dense: true, onTap: nav.goAccountManage),
      ],
    );
  }
}
