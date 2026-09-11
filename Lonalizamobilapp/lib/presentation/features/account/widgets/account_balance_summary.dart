import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../providers/auth_session_provider.dart';
import '../../../providers/dio_provider.dart';
import '../account_theme.dart';

class AccountBalanceSummary extends ConsumerWidget {
  const AccountBalanceSummary({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final session = ref.watch(authSessionProvider);
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AccountTheme.border),
      ),
      child: Row(
        children: [
          Expanded(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.monetization_on_rounded, color: AccountTheme.coinYellow, size: 26),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      FutureBuilder<String>(
                        future: session == null
                            ? Future.value('سجّل الدخول للنقاط')
                            : ref
                                .read(appDioClientProvider)
                                .get<Map<String, dynamic>>(AppConstants.accountWalletUrl, includeAuth: true)
                                .then((r) => '≈\$${r.data?['usd'] ?? 0} (${r.data?['points'] ?? 0} points)'),
                        builder: (context, snapshot) => Text(
                          snapshot.data ?? '…',
                          style: AccountTheme.listTitle.copyWith(fontSize: 15),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Use Trip Coins to save more',
                        style: AccountTheme.listSubtitle.copyWith(fontSize: 12),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Container(width: 1, height: 44, color: AccountTheme.border),
          const SizedBox(width: 10),
          Expanded(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Icon(Icons.local_activity_outlined, color: AccountTheme.promoPink, size: 24),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    '0 Promo Codes',
                    style: AccountTheme.listTitle.copyWith(fontSize: 15),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
