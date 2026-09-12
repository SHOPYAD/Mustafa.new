import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../../core/constants/app_constants.dart';
import '../../../../../core/network/mobile_json.dart';
import '../../../../providers/auth_session_provider.dart';
import '../../../../providers/dio_provider.dart';

class MyCardsPage extends ConsumerWidget {
  const MyCardsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final session = ref.watch(authSessionProvider);
    return Scaffold(
      backgroundColor: const Color(0xFFF7F4FC),
      appBar: AppBar(title: const Text('بطاقاتي')),
      body: session == null
          ? Center(
              child: TextButton(
                onPressed: () => context.push('/auth'),
                child: const Text('سجّل الدخول'),
              ),
            )
          : FutureBuilder<List<Map<String, dynamic>>>(
              future: ref
                  .read(appDioClientProvider)
                  .get<Map<String, dynamic>>(AppConstants.accountCardsUrl)
                  .then((r) => mapList(r.data?['cards'])),
              builder: (context, snapshot) {
                if (snapshot.connectionState != ConnectionState.done) {
                  return const Center(child: CircularProgressIndicator());
                }
                final cards = snapshot.data ?? const [];
                if (cards.isEmpty) {
                  return const Center(child: Text('لا بطاقات محفوظة. أضف بطاقة عبر الدفع الحي.'));
                }
                return ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: cards.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 8),
                  itemBuilder: (context, index) {
                    final card = cards[index];
                    return Card(
                      child: ListTile(
                        title: Text(asText(card['brand'] ?? card['last4'], 'بطاقة')),
                        subtitle: Text(asText(card['last4'] ?? card['note'] ?? card['id'])),
                      ),
                    );
                  },
                );
              },
            ),
    );
  }
}
