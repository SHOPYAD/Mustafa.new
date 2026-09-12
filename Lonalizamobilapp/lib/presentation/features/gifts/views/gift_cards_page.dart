import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/network/mobile_json.dart';
import '../../../../core/theme/lonaliza_theme.dart';
import '../../../providers/auth_session_provider.dart';
import '../../../providers/dio_provider.dart';

class GiftCardsPage extends ConsumerStatefulWidget {
  const GiftCardsPage({super.key});

  @override
  ConsumerState<GiftCardsPage> createState() => _GiftCardsPageState();
}

class _GiftCardsPageState extends ConsumerState<GiftCardsPage> {
  List<Map<String, dynamic>> _cards = const [];
  bool _loading = true;
  final _amount = TextEditingController(text: '50');
  final _email = TextEditingController();
  final _code = TextEditingController();

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _amount.dispose();
    _email.dispose();
    _code.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    if (ref.read(authSessionProvider) == null) {
      setState(() => _loading = false);
      return;
    }
    try {
      final res = await ref.read(appDioClientProvider).get<Map<String, dynamic>>(AppConstants.giftCardsUrl);
      if (!mounted) return;
      setState(() {
        _cards = mapList(res.data?['cards']);
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loading = false);
    }
  }

  Future<void> _purchase() async {
    final amount = asDouble(_amount.text) ?? 0;
    await ref.read(appDioClientProvider).post<Map<String, dynamic>>(
      AppConstants.giftCardsUrl,
      data: {
        'amount': amount,
        'currency': 'USD',
        if (_email.text.trim().isNotEmpty) 'recipientEmail': _email.text.trim(),
      },
    );
    await _load();
  }

  Future<void> _redeem() async {
    await ref.read(appDioClientProvider).post<Map<String, dynamic>>(
      AppConstants.giftCardsRedeemUrl,
      data: {'code': _code.text.trim()},
    );
    await _load();
  }

  @override
  Widget build(BuildContext context) {
    final session = ref.watch(authSessionProvider);
    return Scaffold(
      backgroundColor: LonalizaColors.page,
      appBar: AppBar(title: const Text('بطاقات الهدايا')),
      body: session == null
          ? Center(
              child: TextButton(
                onPressed: () => context.push('/auth'),
                child: const Text('سجّل الدخول لإدارة الهدايا'),
              ),
            )
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                TextField(
                  controller: _amount,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(labelText: 'المبلغ', border: OutlineInputBorder()),
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: _email,
                  decoration: const InputDecoration(labelText: 'بريد المستلم (اختياري)', border: OutlineInputBorder()),
                ),
                const SizedBox(height: 8),
                ElevatedButton(onPressed: _purchase, child: const Text('شراء بطاقة')),
                const SizedBox(height: 16),
                TextField(
                  controller: _code,
                  decoration: const InputDecoration(labelText: 'رمز الاسترداد', border: OutlineInputBorder()),
                ),
                const SizedBox(height: 8),
                OutlinedButton(onPressed: _redeem, child: const Text('استرداد')),
                const SizedBox(height: 20),
                if (_loading) const Center(child: CircularProgressIndicator()),
                for (final card in _cards)
                  Card(
                    child: ListTile(
                      title: Text(asText(card['code'] ?? card['id'], 'بطاقة')),
                      subtitle: Text('${asText(card['currency'], 'USD')} ${asText(card['amount'] ?? card['balance'], '0')}'),
                    ),
                  ),
              ],
            ),
    );
  }
}
