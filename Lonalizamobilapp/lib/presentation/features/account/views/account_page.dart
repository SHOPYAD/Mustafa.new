import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../providers/router_providers.dart';
import '../widgets/account_about_section.dart';
import '../widgets/account_balance_summary.dart';
import '../widgets/account_main_menu_section.dart';
import '../widgets/account_membership_row.dart';
import '../widgets/account_my_posts_section.dart';
import '../widgets/account_page_header.dart';
import '../widgets/account_partner_banner.dart';
import '../widgets/account_perks_section.dart';
import '../widgets/account_trust_footer.dart';
import '../../home/widgets/home_bottom_nav.dart';

class AccountPage extends ConsumerWidget {
  const AccountPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final nav = ref.read(navigationRepositoryProvider);

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    AccountPageHeader(
                      onProfileTap: nav.goAuth,
                      onManageAccountTap: nav.goAccountManage,
                      onScanTap: () {},
                      onSupportTap: () {},
                      onSettingsTap: nav.goAccountSettings,
                    ),
                    const AccountMembershipRow(),
                    const SizedBox(height: 14),
                    const AccountBalanceSummary(),
                    const SizedBox(height: 20),
                    const AccountMainMenuSection(),
                    const SizedBox(height: 22),
                    const AccountPerksSection(),
                    const SizedBox(height: 22),
                    const AccountMyPostsSection(),
                    const SizedBox(height: 22),
                    const AccountAboutSection(),
                    const SizedBox(height: 20),
                    const AccountPartnerBanner(),
                    const SizedBox(height: 24),
                    const AccountTrustFooter(),
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: HomeBottomNav(
        currentIndex: 4,
        showBackToTop: false,
        onTap: (index) {
          if (index == 0) {
            context.go('/');
            return;
          }
          if (index == 1) {
            context.go('/messages');
            return;
          }
          if (index == 2) {
            context.go('/site?path=/community');
            return;
          }
          if (index == 3) {
            context.go('/my-trips');
            return;
          }
          if (index == 4) {
            return;
          }
        },
      ),
    );
  }
}
