import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/theme/lonaliza_theme.dart';
import '../../../providers/dio_provider.dart';

class TransfersPage extends ConsumerWidget {
  const TransfersPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: LonalizaColors.daytimeWhite,
      appBar: AppBar(title: const Text('Transfers')),
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: _load(ref),
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          final offers = snapshot.data ?? const [];
          if (offers.isEmpty) {
            return const Center(child: Text('لا توجد عروض نقل لهذه الوجهة حالياً'));
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: offers.length,
            separatorBuilder: (_, _) => const SizedBox(height: 8),
            itemBuilder: (context, index) {
              final offer = offers[index];
              return ListTile(
                tileColor: Colors.white,
                title: Text(offer['vehicle']?.toString() ?? offer['name']?.toString() ?? 'Transfer'),
                subtitle: Text('${offer['currency'] ?? ''} ${offer['price'] ?? ''}'),
              );
            },
          );
        },
      ),
    );
  }

  Future<List<Map<String, dynamic>>> _load(WidgetRef ref) async {
    final res = await ref.read(appDioClientProvider).get<Map<String, dynamic>>(
      AppConstants.transfersCatalogUrl,
      queryParameters: {'fromPlaceId': 'istanbul-airport'},
      includeAuth: false,
      receiveTimeout: const Duration(seconds: 60),
    );
    final raw = res.data?['offers'];
    if (raw is! List) return const [];
    return raw.whereType<Map>().map((row) => Map<String, dynamic>.from(row)).toList();
  }
}
