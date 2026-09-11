import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../manage_account_theme.dart';
import '../widgets/account_security_card.dart';
import '../widgets/manage_account_profile_header.dart';
import '../widgets/manage_accounts_card.dart';
import '../widgets/member_profile_rewards_card.dart';
import '../widgets/payment_settings_card.dart';
import '../widgets/personal_info_card.dart';
import '../widgets/sign_out_delete_section.dart';

/// User profile / manage account (composite of security, payment, profile, social, sign-out).
class ManageAccountPage extends StatelessWidget {
  const ManageAccountPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: ManageAccountTheme.pageBg,
      appBar: AppBar(
        surfaceTintColor: Colors.transparent,
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          padding: EdgeInsets.zero,
          alignment: Alignment.center,
          icon: Icon(Icons.arrow_back_ios_new_rounded, size: 18, color: Colors.grey.shade900),
          onPressed: () => context.pop(),
        ),
        title: const Text('User Profile', style: ManageAccountTheme.appBarTitle),
        centerTitle: true,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Divider(height: 1, thickness: 1, color: Colors.grey.shade200),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
        children: const [
          ManageAccountProfileHeader(),
          SizedBox(height: 16),
          AccountSecurityCard(),
          SizedBox(height: 14),
          PaymentSettingsCard(),
          SizedBox(height: 14),
          MemberProfileRewardsCard(),
          SizedBox(height: 14),
          PersonalInfoCard(),
          SizedBox(height: 14),
          ManageAccountsCard(),
          SizedBox(height: 18),
          SignOutDeleteSection(),
        ],
      ),
    );
  }
}
