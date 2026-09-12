import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../../core/constants/app_constants.dart';
import '../../../../providers/auth_session_provider.dart';
import '../../../../providers/dio_provider.dart';
import '../all_bookings_theme.dart';

class AllBookingsPage extends ConsumerWidget {
  const AllBookingsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final session = ref.watch(authSessionProvider);
    return Scaffold(
      backgroundColor: const Color(0xFFF9FAFB),
      appBar: AppBar(
        surfaceTintColor: Colors.transparent,
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded, size: 20, color: Colors.grey.shade900),
          onPressed: () => context.pop(),
        ),
        title: Text('All Bookings', style: AllBookingsTheme.appBarTitle),
        centerTitle: true,
      ),
      body: session == null
          ? Center(
              child: TextButton(
                onPressed: () => context.push('/auth'),
                child: const Text('سجّل الدخول لعرض حجوزاتك'),
              ),
            )
          : FutureBuilder<Map<String, dynamic>>(
              future: _load(ref),
              builder: (context, snapshot) {
                if (snapshot.connectionState != ConnectionState.done) {
                  return const Center(child: CircularProgressIndicator());
                }
                final hotels = (snapshot.data?['hotels'] as List?) ?? const [];
                final enquiries = (snapshot.data?['enquiries'] as List?) ?? const [];
                final flights = (snapshot.data?['flights'] as List?) ?? const [];
                if (hotels.isEmpty && enquiries.isEmpty && flights.isEmpty) {
                  return const Center(child: Text('لا حجوزات بعد'));
                }
                return ListView(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
                  children: [
                    for (final row in hotels)
                      _BookingTile(
                        title: (row is Map ? row['hotel_name'] : null)?.toString() ?? 'Hotel',
                        subtitle: (row is Map ? row['status'] : null)?.toString() ?? '',
                      ),
                    for (final row in enquiries)
                      _BookingTile(
                        title: (row is Map ? row['service_name'] : null)?.toString() ?? 'Booking',
                        subtitle: (row is Map ? row['status'] : null)?.toString() ?? '',
                      ),
                    for (final row in flights)
                      _BookingTile(
                        title: '${(row is Map ? row['origin'] : null) ?? ''} → ${(row is Map ? row['destination'] : null) ?? ''}',
                        subtitle: (row is Map ? row['status'] : null)?.toString() ?? '',
                      ),
                  ],
                );
              },
            ),
    );
  }

  Future<Map<String, dynamic>> _load(WidgetRef ref) async {
    final res = await ref.read(appDioClientProvider).get<Map<String, dynamic>>(
      AppConstants.accountBookingsUrl,
    );
    return res.data ?? const {};
  }
}

class _BookingTile extends StatelessWidget {
  const _BookingTile({required this.title, required this.subtitle});

  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(title: Text(title), subtitle: Text(subtitle)),
    );
  }
}
