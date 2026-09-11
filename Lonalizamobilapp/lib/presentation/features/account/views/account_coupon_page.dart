import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../providers/auth_session_provider.dart';
import '../../../providers/dio_provider.dart';

class AccountCouponPage extends ConsumerStatefulWidget {
  const AccountCouponPage({super.key});

  @override
  ConsumerState<AccountCouponPage> createState() => _AccountCouponPageState();
}

class _AccountCouponPageState extends ConsumerState<AccountCouponPage> {
  final _code = TextEditingController();
  String _message = '';

  @override
  void dispose() {
    _code.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Coupons')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: _code,
              decoration: const InputDecoration(labelText: 'Coupon code'),
            ),
            const SizedBox(height: 12),
            FilledButton(
              onPressed: () async {
                final session = ref.read(authSessionProvider);
                if (session == null) {
                  setState(() => _message = 'login_required');
                  return;
                }
                try {
                  final res = await ref.read(appDioClientProvider).post<Map<String, dynamic>>(
                    AppConstants.loyaltyApplyUrl,
                    data: {'code': _code.text.trim(), 'service': 'all'},
                    includeAuth: true,
                  );
                  setState(() => _message = 'applied ${res.data?['applied'] ?? ''}');
                } catch (e) {
                  setState(() => _message = e.toString());
                }
              },
              child: const Text('Apply'),
            ),
            const SizedBox(height: 12),
            Text(_message),
          ],
        ),
      ),
    );
  }
}
