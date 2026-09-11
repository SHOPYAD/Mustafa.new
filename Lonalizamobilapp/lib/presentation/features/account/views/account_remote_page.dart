import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../providers/auth_session_provider.dart';
import '../../../providers/dio_provider.dart';

class AccountRemotePage extends ConsumerWidget {
  const AccountRemotePage({
    super.key,
    required this.title,
    required this.path,
    this.listKey,
  });

  final String title;
  final String path;
  final String? listKey;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final session = ref.watch(authSessionProvider);
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: session == null
          ? Center(
              child: TextButton(
                onPressed: () => context.push('/auth'),
                child: const Text('سجّل الدخول'),
              ),
            )
          : FutureBuilder<Map<String, dynamic>>(
              future: ref.read(appDioClientProvider).get<Map<String, dynamic>>(path, includeAuth: true).then((r) => r.data ?? {}),
              builder: (context, snapshot) {
                if (snapshot.connectionState != ConnectionState.done) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError) {
                  return Center(child: Text(snapshot.error.toString()));
                }
                final data = snapshot.data ?? const {};
                final rows = listKey != null && data[listKey] is List
                    ? (data[listKey] as List)
                    : data.entries.where((e) => e.value is! Map && e.value is! List).toList();
                if (rows.isEmpty) {
                  return const Center(child: Text('لا بيانات بعد'));
                }
                return ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: rows.length,
                  separatorBuilder: (_, _) => const Divider(),
                  itemBuilder: (context, index) {
                    final row = rows[index];
                    if (row is Map) {
                      return ListTile(
                        title: Text('${row['title'] ?? row['code'] ?? row['name'] ?? row['hotel_name'] ?? row['id'] ?? ''}'),
                        subtitle: Text('${row['status'] ?? row['amount'] ?? row['usd'] ?? row['points'] ?? ''}'),
                      );
                    }
                    if (row is MapEntry) {
                      return ListTile(title: Text('${row.key}'), subtitle: Text('${row.value}'));
                    }
                    return ListTile(title: Text('$row'));
                  },
                );
              },
            ),
    );
  }
}
