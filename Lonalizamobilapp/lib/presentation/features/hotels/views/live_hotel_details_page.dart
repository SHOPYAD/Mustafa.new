import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/booking/live_checkout.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/network/mobile_json.dart';
import '../../../../core/theme/lonaliza_theme.dart';
import '../../../providers/auth_session_provider.dart';
import '../../../providers/dio_provider.dart';
import '../providers/hotels_booking_draft_notifier.dart';

class LiveHotelDetailsPage extends ConsumerStatefulWidget {
  const LiveHotelDetailsPage({super.key, this.hotel});

  final Map<String, dynamic>? hotel;

  @override
  ConsumerState<LiveHotelDetailsPage> createState() => _LiveHotelDetailsPageState();
}

class _LiveHotelDetailsPageState extends ConsumerState<LiveHotelDetailsPage> {
  late Future<Map<String, dynamic>> _future;

  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<Map<String, dynamic>> _load() async {
    final hotel = widget.hotel ?? const {};
    final draft = ref.read(hotelsBookingDraftProvider);
    final id = hotel['id']?.toString() ?? '';
    if (id.isEmpty) return {'rooms': []};
    final checkIn = hotel['checkIn']?.toString() ?? _isoDate(draft.checkIn, 1);
    final checkOut = hotel['checkOut']?.toString() ?? _isoDate(draft.checkOut, 3);
    final res = await ref.read(appDioClientProvider).get<Map<String, dynamic>>(
      AppConstants.hotelDetailsUrl,
      queryParameters: {
        'id': id,
        if (hotel['sessionId'] != null) 'sid': hotel['sessionId'],
        'checkIn': checkIn,
        'checkOut': checkOut,
        'adults': hotel['adults'] ?? draft.adultCount,
        'rooms': draft.roomCount,
        if (hotel['currency'] != null) 'currency': hotel['currency'],
      },
      includeAuth: false,
      receiveTimeout: const Duration(seconds: 90),
    );
    final payload = res.data ?? const {};
    final session = ref.read(authSessionProvider);
    if (session != null) {
      try {
        await ref.read(appDioClientProvider).post<Map<String, dynamic>>(
          AppConstants.accountRecentlyViewedUrl,
          data: {
            'kind': 'hotel',
            'refId': id,
            'title': hotel['name'] ?? payload['hotel']?['name'],
            'image': hotel['image'] ?? hotel['photo'],
            'price': hotel['price'] ?? hotel['totalStay'],
          },
        );
      } catch (_) {}
    }
    return payload;
  }

  @override
  Widget build(BuildContext context) {
    final seed = widget.hotel ?? const {};
    return Scaffold(
      backgroundColor: LonalizaColors.page,
      appBar: AppBar(title: Text(asText(seed['name'], 'فندق'))),
      body: FutureBuilder<Map<String, dynamic>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return const Center(child: Text('تعذر تحميل تفاصيل الفندق'));
          }
          final data = snapshot.data ?? const {};
          final hotel = data['hotel'] is Map
              ? Map<String, dynamic>.from(data['hotel'] as Map)
              : Map<String, dynamic>.from(seed);
          final photos = _photos(hotel);
          final amenities = (hotel['amenities'] as List?)?.map((e) => e.toString()).toList() ?? const [];
          final policies = (hotel['policies'] as List?)?.map((e) => e.toString()).toList() ?? const [];
          final rows = _rateRows(data);
          return ListView(
            padding: const EdgeInsets.only(bottom: 24),
            children: [
              if (photos.isNotEmpty)
                SizedBox(
                  height: 220,
                  child: PageView(
                    children: [
                      for (final url in photos)
                        Image.network(url, fit: BoxFit.cover, errorBuilder: (_, _, _) => const ColoredBox(color: Color(0xFFEDE7F6))),
                    ],
                  ),
                ),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(asText(hotel['name'], asText(seed['name'], 'فندق')), style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: LonalizaColors.royalPurple)),
                    const SizedBox(height: 6),
                    Text(asText(hotel['address'] ?? hotel['location'] ?? seed['location'])),
                    if (hotel['stars'] != null || hotel['starRating'] != null)
                      Text('★ ${hotel['stars'] ?? hotel['starRating']}'),
                    if (asText(hotel['description']).isNotEmpty) ...[
                      const SizedBox(height: 12),
                      Text(asText(hotel['description'])),
                    ],
                    if (amenities.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      const Text('المرافق', style: TextStyle(fontWeight: FontWeight.w800)),
                      Wrap(
                        spacing: 8,
                        children: [for (final a in amenities.take(16)) Chip(label: Text(a))],
                      ),
                    ],
                    if (policies.isNotEmpty) ...[
                      const SizedBox(height: 12),
                      const Text('السياسات', style: TextStyle(fontWeight: FontWeight.w800)),
                      for (final p in policies.take(8)) Text('• $p'),
                    ],
                    const SizedBox(height: 16),
                    const Text('الغرف والعروض', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 18)),
                    if (rows.isEmpty) const Padding(padding: EdgeInsets.only(top: 12), child: Text('لا توجد غرف حية لهذه التواريخ')),
                    for (final row in rows)
                      Card(
                        margin: const EdgeInsets.only(top: 10),
                        child: ListTile(
                          title: Text(row.name),
                          subtitle: Text([
                            if (row.board.isNotEmpty) row.board,
                            if (row.cancel.isNotEmpty) row.cancel,
                            if (row.payAtHotel) 'الدفع في الفندق',
                            '${row.currency} ${row.total}',
                          ].where((e) => e.toString().trim().isNotEmpty).join(' · ')),
                          trailing: const Icon(Icons.payment, color: LonalizaColors.primary),
                          onTap: () async {
                            try {
                              await LiveCheckout.hotel(
                                context,
                                ref,
                                hotelId: seed['id']?.toString() ?? hotel['id']?.toString() ?? '',
                                rateId: row.rateId,
                                supplierToken: row.supplierToken,
                                sessionId: seed['sessionId']?.toString() ?? hotel['sessionId']?.toString(),
                                checkIn: data['checkIn']?.toString() ?? seed['checkIn']?.toString(),
                                checkOut: data['checkOut']?.toString() ?? seed['checkOut']?.toString(),
                                adults: (seed['adults'] as num?)?.toInt() ?? ref.read(hotelsBookingDraftProvider).adultCount,
                                currency: row.currency,
                              );
                            } catch (e) {
                              if (context.mounted) {
                                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تعذر بدء الحجز')));
                              }
                            }
                          },
                        ),
                      ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _RateRow {
  const _RateRow({
    required this.name,
    required this.rateId,
    required this.supplierToken,
    required this.total,
    required this.currency,
    this.board = '',
    this.cancel = '',
    this.payAtHotel = false,
  });

  final String name;
  final String? rateId;
  final String? supplierToken;
  final Object? total;
  final String currency;
  final String board;
  final String cancel;
  final bool payAtHotel;
}

List<String> _photos(Map<String, dynamic> hotel) {
  final out = <String>[];
  for (final key in ['photos', 'images', 'gallery']) {
    final list = hotel[key];
    if (list is List) {
      for (final item in list) {
        if (item is String && item.startsWith('http')) out.add(item);
        if (item is Map && item['url'] != null) out.add(item['url'].toString());
      }
    }
  }
  final single = asText(hotel['image'] ?? hotel['photo'] ?? hotel['cover']);
  if (single.startsWith('http')) out.insert(0, single);
  return out.toSet().toList();
}

List<_RateRow> _rateRows(Map<String, dynamic>? payload) {
  final rooms = (payload?['rooms'] as List?) ?? const [];
  final rows = <_RateRow>[];
  for (final roomRaw in rooms) {
    if (roomRaw is! Map) continue;
    final room = Map<String, dynamic>.from(roomRaw);
    final rates = (room['rates'] as List?) ?? const [];
    if (rates.isEmpty) {
      rows.add(_RateRow(
        name: asText(room['name'], 'غرفة'),
        rateId: room['id']?.toString(),
        supplierToken: room['supplierToken']?.toString(),
        total: room['totalStay'] ?? room['price'],
        currency: asText(room['currency'], 'USD'),
        board: asText(room['board'] ?? room['boardName']),
        cancel: asText(room['cancellation'] ?? room['cancelPolicy']),
        payAtHotel: room['payAtHotel'] == true || room['payment'] == 'hotel',
      ));
      continue;
    }
    for (final rateRaw in rates) {
      if (rateRaw is! Map) continue;
      final rate = Map<String, dynamic>.from(rateRaw);
      rows.add(_RateRow(
        name: '${room['name'] ?? ''} · ${rate['label'] ?? rate['board'] ?? ''}'.trim(),
        rateId: rate['id']?.toString(),
        supplierToken: rate['supplierToken']?.toString(),
        total: rate['totalStay'] ?? rate['price'],
        currency: asText(rate['currency'] ?? room['currency'], 'USD'),
        board: asText(rate['board'] ?? rate['boardName']),
        cancel: asText(rate['cancellation'] ?? rate['cancelPolicy'] ?? rate['refundable']),
        payAtHotel: rate['payAtHotel'] == true || rate['payment'] == 'hotel',
      ));
    }
  }
  return rows;
}

String _isoDate(DateTime? value, int fallbackDays) {
  final d = value ?? DateTime.now().toUtc().add(Duration(days: fallbackDays));
  final y = d.year.toString().padLeft(4, '0');
  final m = d.month.toString().padLeft(2, '0');
  final day = d.day.toString().padLeft(2, '0');
  return '$y-$m-$day';
}
