import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../../core/constants/app_constants.dart';
import '../../../../providers/dio_provider.dart';
import '../../providers/hotels_booking_draft_notifier.dart';
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
        if (snapshot.hasError) {
          return Padding(
            padding: const EdgeInsets.all(24),
            child: Text(snapshot.error.toString()),
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
                '${hotels.length} فندق متاح بنفس محرك الموقع',
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
    final draft = ref.read(hotelsBookingDraftProvider);
    final dest = draft.selectedDestination;
    final checkIn = _isoDate(draft.checkIn, 1);
    final checkOut = _isoDate(draft.checkOut, 3);
    final res = await ref.read(appDioClientProvider).get<Map<String, dynamic>>(
      AppConstants.hotelSearchUrl,
      queryParameters: {
        'q': dest?.name.isNotEmpty == true ? dest!.name : 'Istanbul',
        if (dest?.id.isNotEmpty == true) 'destId': dest!.id,
        'checkIn': checkIn,
        'checkOut': checkOut,
        'adults': draft.adultCount,
        'rooms': draft.roomCount,
      },
      includeAuth: false,
      receiveTimeout: const Duration(seconds: 90),
    );
    final raw = res.data?['hotels'];
    if (raw is! List) return const [];
    final sid = res.data?['sid'];
    return raw.whereType<Map>().map((row) {
      final hotel = Map<String, dynamic>.from(row);
      hotel['checkIn'] = hotel['checkIn'] ?? checkIn;
      hotel['checkOut'] = hotel['checkOut'] ?? checkOut;
      hotel['sessionId'] = hotel['sessionId'] ?? sid;
      hotel['adults'] = draft.adultCount;
      return hotel;
    }).toList();
  }
}

String _isoDate(DateTime? value, int fallbackDays) {
  final d = value ?? DateTime.now().toUtc().add(Duration(days: fallbackDays));
  final y = d.year.toString().padLeft(4, '0');
  final m = d.month.toString().padLeft(2, '0');
  final day = d.day.toString().padLeft(2, '0');
  return '$y-$m-$day';
}
