import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/booking/live_checkout.dart';
import '../../../../core/constants/app_constants.dart';
import '../../../../core/network/mobile_json.dart';
import '../../../../core/theme/lonaliza_theme.dart';
import '../../../providers/dio_provider.dart';

class TransfersPage extends ConsumerStatefulWidget {
  const TransfersPage({super.key});

  @override
  ConsumerState<TransfersPage> createState() => _TransfersPageState();
}

class _TransfersPageState extends ConsumerState<TransfersPage> {
  final _from = TextEditingController();
  final _to = TextEditingController();
  String _fromPlaceId = '';
  String _toPlaceId = '';
  bool _editingFrom = true;
  DateTime _date = DateTime.now().add(const Duration(days: 1));
  TimeOfDay _time = const TimeOfDay(hour: 12, minute: 0);
  int _pax = 2;
  int _luggage = 2;
  String _mode = 'transfer';
  bool _searching = false;
  String? _error;
  List<Map<String, dynamic>> _places = const [];
  List<Map<String, dynamic>> _offers = const [];

  @override
  void dispose() {
    _from.dispose();
    _to.dispose();
    super.dispose();
  }

  Future<void> _suggest(String query, {required bool from}) async {
    if (query.trim().length < 2) {
      setState(() => _places = const []);
      return;
    }
    final res = await ref.read(appDioClientProvider).get<Map<String, dynamic>>(
      AppConstants.placesSearchUrl,
      queryParameters: {'type': 'transfers', 'q': query.trim()},
    );
    setState(() {
      _editingFrom = from;
      _places = mapList(res.data?['locations'] ?? res.data?['places']);
    });
  }

  Future<void> _search() async {
    if (_fromPlaceId.isEmpty || _toPlaceId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('اختر الانطلاق والوصول من القائمة المنسدلة')),
      );
      return;
    }
    setState(() {
      _searching = true;
      _error = null;
      _offers = const [];
    });
    try {
      final res = await ref.read(appDioClientProvider).get<Map<String, dynamic>>(
        AppConstants.transfersCatalogUrl,
        queryParameters: {
          'fromPlaceId': _fromPlaceId,
          'toPlaceId': _toPlaceId,
          'date': _iso(_date),
          'time': '${_time.hour.toString().padLeft(2, '0')}:${_time.minute.toString().padLeft(2, '0')}',
          'pax': _pax,
          'luggage': _luggage,
          'mode': _mode,
        },
        receiveTimeout: const Duration(seconds: 60),
      );
      setState(() => _offers = mapList(res.data?['offers']));
    } catch (_) {
      setState(() => _error = 'تعذر جلب عروض النقل الآن');
    } finally {
      if (mounted) setState(() => _searching = false);
    }
  }

  String _iso(DateTime d) =>
      '${d.year.toString().padLeft(4, '0')}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: LonalizaColors.page,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 168,
            pinned: true,
            backgroundColor: LonalizaColors.royalPurple,
            flexibleSpace: const FlexibleSpaceBar(
              title: Text('النقل الخاص', style: TextStyle(fontWeight: FontWeight.w900)),
              background: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFF2E1065), Color(0xFF7C3AED)],
                    begin: Alignment.topRight,
                    end: Alignment.bottomLeft,
                  ),
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Card(
                    elevation: 0,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24), side: const BorderSide(color: Color(0xFFE8E0F5))),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        children: [
                          _field(_from, 'من — مطار أو فندق أو عنوان', true),
                          const SizedBox(height: 10),
                          _field(_to, 'إلى — الوجهة', false),
                          if (_places.isNotEmpty)
                            ..._places.take(7).map((place) {
                              final id = asText(place['place_id'] ?? place['id']);
                              final label = asText(place['label'] ?? place['name'] ?? place['title'], id);
                              return ListTile(
                                leading: const Icon(Icons.place_outlined, color: LonalizaColors.primary),
                                title: Text(label, style: const TextStyle(fontWeight: FontWeight.w700)),
                                subtitle: Text(asText(place['type'])),
                                onTap: () => setState(() {
                                  if (_editingFrom) {
                                    _from.text = label;
                                    _fromPlaceId = id;
                                  } else {
                                    _to.text = label;
                                    _toPlaceId = id;
                                  }
                                  _places = const [];
                                }),
                              );
                            }),
                          const SizedBox(height: 12),
                          Row(
                            children: [
                              Expanded(
                                child: _chip(Icons.event, _iso(_date), () async {
                                  final next = await showDatePicker(
                                    context: context,
                                    firstDate: DateTime.now(),
                                    lastDate: DateTime.now().add(const Duration(days: 360)),
                                    initialDate: _date,
                                  );
                                  if (next != null) setState(() => _date = next);
                                }),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: _chip(Icons.schedule, _time.format(context), () async {
                                  final next = await showTimePicker(context: context, initialTime: _time);
                                  if (next != null) setState(() => _time = next);
                                }),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Expanded(child: _stepper('ركاب', _pax, (v) => setState(() => _pax = v.clamp(1, 12)))),
                              const SizedBox(width: 8),
                              Expanded(child: _stepper('حقائب', _luggage, (v) => setState(() => _luggage = v.clamp(0, 12)))),
                            ],
                          ),
                          const SizedBox(height: 12),
                          SizedBox(
                            height: 52,
                            width: double.infinity,
                            child: ElevatedButton.icon(
                              onPressed: _searching ? null : _search,
                              icon: _searching
                                  ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                                  : const Icon(Icons.search),
                              label: const Text('اعرض السيارات المتاحة', style: TextStyle(fontWeight: FontWeight.w900)),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  if (_error != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 16),
                      child: Text(_error!, style: const TextStyle(color: Color(0xFFB91C1C), fontWeight: FontWeight.w700)),
                    ),
                  if (!_searching && _offers.isEmpty && _fromPlaceId.isNotEmpty)
                    const Padding(
                      padding: EdgeInsets.only(top: 24),
                      child: Text('لا توجد سيارات لهذه الرحلة حالياً. جرّب وقتاً أو نقطة أخرى.', textAlign: TextAlign.center),
                    ),
                  const SizedBox(height: 16),
                  for (final offer in _offers) _offerCard(offer),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _field(TextEditingController controller, String label, bool from) {
    return TextField(
      controller: controller,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(from ? Icons.flight_takeoff : Icons.flag_outlined, color: LonalizaColors.primary),
        filled: true,
        fillColor: const Color(0xFFF7F4FC),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
      ),
      onChanged: (value) => _suggest(value, from: from),
    );
  }

  Widget _chip(IconData icon, String label, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Ink(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        decoration: BoxDecoration(color: const Color(0xFFF7F4FC), borderRadius: BorderRadius.circular(14)),
        child: Row(
          children: [
            Icon(icon, size: 18, color: LonalizaColors.primary),
            const SizedBox(width: 8),
            Expanded(child: Text(label, style: const TextStyle(fontWeight: FontWeight.w700))),
          ],
        ),
      ),
    );
  }

  Widget _stepper(String label, int value, ValueChanged<int> onChanged) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
      decoration: BoxDecoration(color: const Color(0xFFF7F4FC), borderRadius: BorderRadius.circular(14)),
      child: Row(
        children: [
          Text(label, style: const TextStyle(fontWeight: FontWeight.w700)),
          const Spacer(),
          IconButton(onPressed: () => onChanged(value - 1), icon: const Icon(Icons.remove_circle_outline)),
          Text('$value', style: const TextStyle(fontWeight: FontWeight.w900)),
          IconButton(onPressed: () => onChanged(value + 1), icon: const Icon(Icons.add_circle_outline)),
        ],
      ),
    );
  }

  Widget _offerCard(Map<String, dynamic> offer) {
    final car = offer['car_class'] is Map ? Map<String, dynamic>.from(offer['car_class'] as Map) : offer;
    final title = asText(car['title'] ?? offer['vehicle'] ?? offer['name'], 'سيارة خاصة');
    final image = asText(car['image'] ?? offer['image'] ?? offer['imageUrl']);
    final price = asDouble(offer['price'] ?? offer['clientPrice']);
    final currency = asText(offer['currency'], 'USD');
    final seats = asText(car['capacity'] ?? offer['seats']);
    final bags = asText(car['luggage'] ?? offer['luggage']);
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: InkWell(
        onTap: () async {
          await LiveCheckout.enquiry(
            context,
            ref,
            type: 'transfers',
            title: title,
            destination: _to.text,
            price: price,
            currency: currency,
            metadata: {
              'offerId': offer['offer_id'] ?? offer['id'],
              'fromPlaceId': _fromPlaceId,
              'toPlaceId': _toPlaceId,
            },
          );
        },
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (image.startsWith('http'))
              Image.network(image, height: 150, fit: BoxFit.cover, errorBuilder: (_, _, _) => const SizedBox(height: 8)),
            ListTile(
              title: Text(title, style: const TextStyle(fontWeight: FontWeight.w900, color: LonalizaColors.royalPurple)),
              subtitle: Text([if (seats.isNotEmpty) '$seats مقاعد', if (bags.isNotEmpty) '$bags حقائب'].join(' · ')),
              trailing: Text(
                price == null ? '' : '$currency ${price.toStringAsFixed(0)}',
                style: const TextStyle(fontWeight: FontWeight.w900, color: LonalizaColors.primary, fontSize: 16),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
