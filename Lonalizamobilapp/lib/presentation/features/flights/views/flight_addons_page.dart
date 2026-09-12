import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/network/mobile_json.dart';
import '../../../providers/dio_provider.dart';
import '../providers/flight_search_results_provider.dart';
import '../providers/flights_booking_draft_notifier.dart';
import '../widgets/addons/flight_addons_bottom_bar.dart';
import '../widgets/info/flight_booking_stepper.dart';

class FlightAddonsPage extends ConsumerStatefulWidget {
  const FlightAddonsPage({super.key});

  @override
  ConsumerState<FlightAddonsPage> createState() => _FlightAddonsPageState();
}

class _FlightAddonsPageState extends ConsumerState<FlightAddonsPage> {
  List<Map<String, dynamic>> _extras = const [];
  List<Map<String, dynamic>> _baggage = const [];
  final _selected = <String>{};

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  Future<void> _load() async {
    final client = ref.read(appDioClientProvider);
    final draft = ref.read(flightsBookingDraftProvider);
    final search = ref.read(flightSearchStateProvider).asData?.value;
    final extrasRes = await client.get<Map<String, dynamic>>(
      AppConstants.flightExtrasUrl,
      queryParameters: const {'service': 'flights'},
    );
    List<Map<String, dynamic>> baggage = const [];
    final sessionId = search?.meta.traceId ?? '';
    final itineraryId = draft.selectedVariant?.bookingOfferCacheId ?? draft.selectedOffer?.id ?? '';
    if (sessionId.isNotEmpty && itineraryId.isNotEmpty) {
      try {
        final ancillary = await client.post<Map<String, dynamic>>(
          AppConstants.flightAncillaryUrl,
          data: {
            'sessionId': sessionId,
            'itineraryId': itineraryId,
            'adults': draft.adultCount,
            'children': draft.childCount,
            'infants': draft.infantCount,
            'currency': draft.selectedOffer?.pricing.currency,
          },
        );
        baggage = mapList(ancillary.data?['options']);
      } catch (_) {}
    }
    if (!mounted) return;
    setState(() {
      _extras = mapList(extrasRes.data?['extras']);
      _baggage = baggage;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F4FC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1F2937),
        elevation: 0,
        title: const Text('إضافات الرحلة', style: TextStyle(fontWeight: FontWeight.w700)),
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: 16),
            child: FlightBookingStepper(currentStep: 2, totalSteps: 3),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(12, 8, 12, 24),
        children: [
          const Text('خدمات لوناليزا', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
          const SizedBox(height: 8),
          if (_extras.isEmpty) const Text('لا إضافات متاحة من الخادم حالياً'),
          for (final extra in _extras)
            _AddonTile(
              title: asText(extra['titleAr'] ?? extra['titleEn'] ?? extra['title'], 'إضافة'),
              subtitle: asText(extra['descAr'] ?? extra['descEn'] ?? extra['description']),
              price: asDouble(extra['priceValue'] ?? extra['price']),
              selected: _selected.contains(asText(extra['id'])),
              onTap: () {
                final id = asText(extra['id']);
                setState(() {
                  if (_selected.contains(id)) {
                    _selected.remove(id);
                  } else {
                    _selected.add(id);
                  }
                });
              },
            ),
          const SizedBox(height: 16),
          const Text('الأمتعة', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
          const SizedBox(height: 8),
          if (_baggage.isEmpty) const Text('لا خيارات أمتعة إضافية من الخادم'),
          for (final option in _baggage)
            _AddonTile(
              title: asText(option['title'] ?? option['name'] ?? option['weight'], 'أمتعة'),
              subtitle: asText(option['description'] ?? option['passenger']),
              price: asDouble(option['price'] ?? option['amount'] ?? option['clientPrice']),
              selected: _selected.contains(asText(option['id'] ?? option['code'])),
              onTap: () {
                final id = asText(option['id'] ?? option['code']);
                setState(() {
                  if (_selected.contains(id)) {
                    _selected.remove(id);
                  } else {
                    _selected.add(id);
                  }
                });
              },
            ),
        ],
      ),
      bottomNavigationBar: const FlightAddonsBottomBar(),
    );
  }
}

class _AddonTile extends StatelessWidget {
  const _AddonTile({
    required this.title,
    required this.subtitle,
    required this.price,
    required this.selected,
    required this.onTap,
  });

  final String title;
  final String subtitle;
  final double? price;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        title: Text(title),
        subtitle: Text(subtitle),
        trailing: Text(price == null ? '' : price!.toStringAsFixed(0)),
        selected: selected,
        onTap: onTap,
      ),
    );
  }
}
