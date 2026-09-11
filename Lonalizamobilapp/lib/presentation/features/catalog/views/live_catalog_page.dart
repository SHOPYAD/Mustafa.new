import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../providers/dio_provider.dart';

class LiveCatalogPage extends ConsumerWidget {
  const LiveCatalogPage({
    super.key,
    required this.title,
    required this.url,
    required this.listKey,
  });

  final String title;
  final String url;
  final String listKey;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: _load(ref),
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          final items = snapshot.data ?? const [];
          if (items.isEmpty) {
            return const Center(child: Text('لا توجد نتائج من الكتالوج الحي'));
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: items.length,
            separatorBuilder: (_, _) => const SizedBox(height: 8),
            itemBuilder: (context, index) {
              final item = items[index];
              return ListTile(
                tileColor: Colors.white,
                title: Text('${item['name'] ?? item['title'] ?? item['id'] ?? ''}'),
                subtitle: Text('${item['price'] ?? item['currency'] ?? item['destination'] ?? ''}'),
              );
            },
          );
        },
      ),
    );
  }

  Future<List<Map<String, dynamic>>> _load(WidgetRef ref) async {
    final res = await ref.read(appDioClientProvider).get<Map<String, dynamic>>(
      url,
      includeAuth: false,
      receiveTimeout: const Duration(seconds: 60),
    );
    final raw = res.data?[listKey];
    if (raw is! List) return const [];
    return raw.whereType<Map>().map((row) => Map<String, dynamic>.from(row)).toList();
  }
}
