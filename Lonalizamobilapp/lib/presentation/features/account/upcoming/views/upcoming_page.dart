import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../../core/constants/app_constants.dart';
import '../../../../../core/network/mobile_json.dart';
import '../../../../providers/auth_session_provider.dart';
import '../../../../providers/dio_provider.dart';

class UpcomingPage extends ConsumerWidget {
  const UpcomingPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final session = ref.watch(authSessionProvider);
    return Scaffold(
      backgroundColor: const Color(0xFFF7F4FC),
      appBar: AppBar(title: const Text('القادمة')),
      body: session == null
          ? Center(
              child: TextButton(
                onPressed: () => context.push('/auth'),
                child: const Text('سجّل الدخول'),
              ),
            )
          : FutureBuilder<Map<String, dynamic>>(
              future: ref
                  .read(appDioClientProvider)
                  .get<Map<String, dynamic>>(
                    AppConstants.accountBookingsUrl,
                    queryParameters: const {'filter': 'upcoming'},
                  )
                  .then((r) => r.data ?? const {}),
              builder: (context, snapshot) {
                if (snapshot.connectionState != ConnectionState.done) {
                  return const Center(child: CircularProgressIndicator());
                }
                final hotels = mapList(snapshot.data?['hotels']);
                final enquiries = mapList(snapshot.data?['enquiries']);
                final flights = mapList(snapshot.data?['flights']);
                if (hotels.isEmpty && enquiries.isEmpty && flights.isEmpty) {
                  return const Center(child: Text('لا حجوزات قادمة'));
                }
                return ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    for (final row in hotels)
                      Card(
                        child: ListTile(
                          title: Text(asText(row['hotel_name'] ?? row['name'], 'فندق')),
                          subtitle: Text(asText(row['status'])),
                        ),
                      ),
                    for (final row in enquiries)
                      Card(
                        child: ListTile(
                          title: Text(asText(row['service_name'], 'طلب')),
                          subtitle: Text(asText(row['status'])),
                        ),
                      ),
                    for (final row in flights)
                      Card(
                        child: ListTile(
                          title: Text('${asText(row['origin'])} → ${asText(row['destination'])}'),
                          subtitle: Text('${asText(row['currency'])} ${asText(row['price'])}'),
                        ),
                      ),
                  ],
                );
              },
            ),
    );
  }
}
