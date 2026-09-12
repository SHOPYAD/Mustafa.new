import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/network/mobile_json.dart';
import '../../../../core/theme/lonaliza_theme.dart';
import '../../../providers/auth_session_provider.dart';
import '../../../providers/dio_provider.dart';
import '../../home/widgets/home_bottom_nav.dart';

class MyTripsPage extends ConsumerStatefulWidget {
  const MyTripsPage({super.key});

  @override
  ConsumerState<MyTripsPage> createState() => _MyTripsPageState();
}

class _MyTripsPageState extends ConsumerState<MyTripsPage> {
  Map<String, dynamic> _data = const {};
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    if (ref.read(authSessionProvider) == null) {
      setState(() => _loading = false);
      return;
    }
    try {
      final res = await ref.read(appDioClientProvider).get<Map<String, dynamic>>(
        AppConstants.accountBookingsUrl,
        queryParameters: const {'filter': 'upcoming'},
      );
      if (!mounted) return;
      setState(() {
        _data = res.data ?? const {};
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final session = ref.watch(authSessionProvider);
    final hotels = mapList(_data['hotels']);
    final enquiries = mapList(_data['enquiries']);
    final flights = mapList(_data['flights']);
    final empty = hotels.isEmpty && enquiries.isEmpty && flights.isEmpty;

    return Scaffold(
      backgroundColor: LonalizaColors.page,
      appBar: AppBar(title: const Text('حجوزاتي')),
      body: session == null
          ? Center(
              child: TextButton(
                onPressed: () => context.push('/auth'),
                child: const Text('سجّل الدخول لعرض حجوزاتك'),
              ),
            )
          : _loading
              ? const Center(child: CircularProgressIndicator())
              : empty
                  ? const Center(child: Text('لا حجوزات قادمة'))
                  : ListView(
                      padding: const EdgeInsets.all(16),
                      children: [
                        for (final row in hotels)
                          _card(
                            asText(row['hotel_name'] ?? row['name'], 'فندق'),
                            asText(row['status']),
                            asText(row['check_in'] ?? row['checkIn']),
                          ),
                        for (final row in enquiries)
                          _card(
                            asText(row['service_name'] ?? row['title'], 'طلب'),
                            asText(row['status']),
                            asText(row['destination']),
                          ),
                        for (final row in flights)
                          _card(
                            '${asText(row['origin'], 'رحلة')} → ${asText(row['destination'])}',
                            asText(row['status']),
                            '${asText(row['currency'])} ${asText(row['price'])}',
                          ),
                      ],
                    ),
      bottomNavigationBar: const HomeBottomNav(currentIndex: 1),
    );
  }

  Widget _card(String title, String subtitle, String meta) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        title: Text(title),
        subtitle: Text([subtitle, meta].where((e) => e.isNotEmpty).join(' · ')),
      ),
    );
  }
}
