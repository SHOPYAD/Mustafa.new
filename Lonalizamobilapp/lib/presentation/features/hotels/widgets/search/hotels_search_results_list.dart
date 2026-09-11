import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../../core/constants/app_constants.dart';
import '../../../../providers/dio_provider.dart';
import 'hotels_search_result_card.dart';

class HotelsSearchResultsList extends ConsumerWidget {
  const HotelsSearchResultsList({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return FutureBuilder<List<Map<String, dynamic>>>(
      future: _load(ref),
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const Padding(
            padding: EdgeInsets.all(32),
            child: Center(child: CircularProgressIndicator()),
          );
        }
        final hotels = snapshot.data ?? const [];
        if (hotels.isEmpty) {
          return const Padding(
            padding: EdgeInsets.all(24),
            child: Text('لا توجد فنادق متاحة لهذه الوجهة حالياً'),
          );
        }
        return Padding(
          padding: const EdgeInsets.fromLTRB(12, 16, 12, 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                '${hotels.length} properties found',
                style: Theme.of(context).textTheme.titleSmall?.copyWith(
                  color: const Color(0xFF111827),
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 12),
              for (final hotel in hotels) ...[
                HotelsSearchResultCard(
                  name: hotel['name']?.toString() ?? '',
                  rating: (hotel['stars'] as num?)?.toInt() ?? 0,
                  score: hotel['rating']?.toString() ?? '',
                  scoreLabel: hotel['cancellation']?.toString() ?? '',
                  location: hotel['locationText']?.toString() ?? hotel['city']?.toString() ?? '',
                  tag: hotel['roomType']?.toString() ?? '',
                  description: hotel['snippet']?.toString() ?? '',
                  imageUrl: hotel['image']?.toString(),
                  footerNote: hotel['currency'] == null
                      ? ''
                      : '${hotel['currency']} ${hotel['totalStay'] ?? hotel['priceFrom'] ?? ''}',
                  onTap: () => context.push('/hotels/details', extra: hotel),
                ),
                const SizedBox(height: 12),
              ],
            ],
          ),
        );
      },
    );
  }

  Future<List<Map<String, dynamic>>> _load(WidgetRef ref) async {
    final res = await ref.read(appDioClientProvider).get<Map<String, dynamic>>(
      AppConstants.hotelSearchUrl,
      queryParameters: {'q': 'Istanbul'},
      includeAuth: false,
      receiveTimeout: const Duration(seconds: 90),
    );
    final raw = res.data?['hotels'];
    if (raw is! List) return const [];
    return raw
        .whereType<Map>()
        .map((row) => Map<String, dynamic>.from(row))
        .toList();
  }
}
