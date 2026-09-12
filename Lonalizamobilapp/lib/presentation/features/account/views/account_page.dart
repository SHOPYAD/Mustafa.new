import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/network/mobile_json.dart';
import '../../../../core/theme/lonaliza_theme.dart';
import '../../../providers/auth_session_provider.dart';
import '../../../providers/dio_provider.dart';
import '../../../providers/router_providers.dart';
import '../../home/widgets/home_bottom_nav.dart';
import '../widgets/account_about_section.dart';
import '../widgets/account_main_menu_section.dart';
import '../widgets/account_membership_row.dart';
import '../widgets/account_page_header.dart';
import '../widgets/account_perks_section.dart';
import '../widgets/account_trust_footer.dart';

class AccountPage extends ConsumerStatefulWidget {
  const AccountPage({super.key});

  @override
  ConsumerState<AccountPage> createState() => _AccountPageState();
}

class _AccountPageState extends ConsumerState<AccountPage> {
  Map<String, dynamic> _profile = const {};
  Map<String, dynamic> _wallet = const {};
  Map<String, dynamic> _bookings = const {};

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() async {
    if (ref.read(authSessionProvider) == null) return;
    final client = ref.read(appDioClientProvider);
    try {
      final results = await Future.wait([
        client.get<Map<String, dynamic>>(AppConstants.accountProfileUrl),
        client.get<Map<String, dynamic>>(AppConstants.accountWalletUrl),
        client.get<Map<String, dynamic>>(AppConstants.accountBookingsUrl),
      ]);
      if (!mounted) return;
      setState(() {
        _profile = Map<String, dynamic>.from(results[0].data?['profile'] as Map? ?? results[0].data ?? const {});
        _wallet = results[1].data ?? const {};
        _bookings = results[2].data ?? const {};
      });
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final nav = ref.read(navigationRepositoryProvider);
    final session = ref.watch(authSessionProvider);
    final name = asText(_profile['name'] ?? session?.user.name, 'مسافر لوناليزا');
    final email = asText(_profile['email'] ?? session?.user.email);
    final points = asText(_wallet['points'] ?? _wallet['loyaltyPoints'], '0');
    final bookings = mapList(_bookings['hotels']).length + mapList(_bookings['flights']).length + mapList(_bookings['enquiries']).length;

    return Scaffold(
      backgroundColor: LonalizaColors.page,
      body: SafeArea(
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
          children: [
            AccountPageHeader(
              greeting: session == null ? 'مرحباً في لوناليزا' : 'مرحباً، $name',
              manageLabel: session == null ? 'سجّل الدخول' : 'إدارة حسابي',
              onProfileTap: session == null ? nav.goAuth : nav.goAccountManage,
              onManageAccountTap: session == null ? nav.goAuth : nav.goAccountManage,
              onSupportTap: () => context.go('/messages'),
              onSettingsTap: nav.goAccountSettings,
            ),
            Container(
              margin: const EdgeInsets.only(bottom: 16),
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1b0833), Color(0xFF2E1065), Color(0xFF4C1D95)],
                ),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Row(
                children: [
                  _kpi('المحفظة', asText(_wallet['usd'] ?? _wallet['balance'], '0')),
                  _kpi('النقاط', points),
                  _kpi('الحجوزات', '$bookings'),
                ],
              ),
            ),
            if (email.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Text(email, style: const TextStyle(color: LonalizaColors.muted)),
              ),
            const AccountMembershipRow(),
            const SizedBox(height: 8),
            const AccountMainMenuSection(),
            const SizedBox(height: 18),
            const AccountPerksSection(),
            const SizedBox(height: 18),
            const AccountAboutSection(),
            const SizedBox(height: 18),
            const AccountTrustFooter(),
          ],
        ),
      ),
      bottomNavigationBar: const HomeBottomNav(currentIndex: 4),
    );
  }

  Widget _kpi(String label, String value) {
    return Expanded(
      child: Column(
        children: [
          Text(label, style: const TextStyle(color: Color(0xFFFDE68A), fontSize: 11, fontWeight: FontWeight.w700)),
          const SizedBox(height: 4),
          Text(value, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900)),
        ],
      ),
    );
  }
}
