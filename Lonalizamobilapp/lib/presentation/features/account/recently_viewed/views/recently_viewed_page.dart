import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../../core/constants/app_constants.dart';
import '../../../../../core/network/mobile_json.dart';
import '../../../../providers/auth_session_provider.dart';
import '../../../../providers/dio_provider.dart';

class RecentlyViewedPage extends ConsumerWidget {
  const RecentlyViewedPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final session = ref.watch(authSessionProvider);
    return Scaffold(
      backgroundColor: const Color(0xFFF7F4FC),
      appBar: AppBar(title: const Text('شوهد مؤخراً')),
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
                  .get<Map<String, dynamic>>(AppConstants.accountRecentlyViewedUrl)
                  .then((r) => mapList(r.data?['items'])),
              builder: (context, snapshot) {
                if (snapshot.connectionState != ConnectionState.done) {
                  return const Center(child: CircularProgressIndicator());
                }
                final items = snapshot.data ?? const [];
                if (items.isEmpty) return const Center(child: Text('لا عناصر بعد'));
                return ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: items.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 8),
                  itemBuilder: (context, index) {
                    final item = items[index];
                    return Card(
                      child: ListTile(
                        leading: item['image'] != null
                            ? Image.network(item['image'].toString(), width: 56, height: 56, fit: BoxFit.cover)
                            : const Icon(Icons.history),
                        title: Text(asText(item['title'])),
                        subtitle: Text('${asText(item['kind'])} ${asText(item['price'])}'),
                      ),
                    );
                  },
                );
              },
            ),
    );
  }
}
