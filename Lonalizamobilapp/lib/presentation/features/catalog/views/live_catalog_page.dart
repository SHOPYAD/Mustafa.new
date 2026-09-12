import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/booking/live_checkout.dart';
import '../../../../core/network/mobile_json.dart';
import '../../../../core/theme/lonaliza_theme.dart';
import '../../../providers/dio_provider.dart';
import '../../home/widgets/home_offer_card.dart';

class LiveCatalogPage extends ConsumerStatefulWidget {
  const LiveCatalogPage({
    super.key,
    required this.title,
    required this.url,
    required this.listKey,
    required this.serviceType,
  });

  final String title;
  final String url;
  final String listKey;
  final String serviceType;

  @override
  ConsumerState<LiveCatalogPage> createState() => _LiveCatalogPageState();
}

class _LiveCatalogPageState extends ConsumerState<LiveCatalogPage> {
  final _query = TextEditingController();
  String _destination = '';
  bool _loading = true;
  String? _error;
  List<Map<String, dynamic>> _items = const [];

  static const _destinations = [
    'إسطنبول',
    'طرابزون',
    'أنطاليا',
    'كابادوكيا',
    'بودروم',
    'بورصة',
  ];

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _query.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final res = await ref.read(appDioClientProvider).get<Map<String, dynamic>>(
        widget.url,
        queryParameters: {
          if (_query.text.trim().isNotEmpty) 'q': _query.text.trim(),
          if (_destination.isNotEmpty) 'destination': _destination,
        },
        receiveTimeout: const Duration(seconds: 60),
      );
      if (!mounted) return;
      setState(() {
        _items = mapList(res.data?[widget.listKey]);
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = 'تعذر تحميل ${widget.title} من الكتالوج الحي';
      });
    }
  }

  List<Map<String, dynamic>> get _visible {
    final q = _query.text.trim();
    return _items.where((item) {
      final hay = [
        item['name'],
        item['nameAr'],
        item['title'],
        item['titleAr'],
        item['destination'],
        item['destinationAr'],
        item['city'],
        item['category'],
      ].map((e) => e?.toString().toLowerCase() ?? '').join(' ');
      final destOk = _destination.isEmpty || hay.contains(_destination.toLowerCase());
      final qOk = q.isEmpty || hay.contains(q.toLowerCase());
      return destOk && qOk;
    }).toList();
  }

  Future<void> _book(Map<String, dynamic> item) async {
    final name = asText(item['name'] ?? item['title'] ?? item['titleAr'] ?? item['nameAr'] ?? item['id']);
    final price = _catalogPrice(item);
    final currency = asText(item['currency'], 'USD');
    try {
      await LiveCheckout.enquiry(
        context,
        ref,
        type: widget.serviceType,
        title: name,
        destination: item['destination']?.toString() ?? item['city']?.toString(),
        price: price,
        currency: currency,
        metadata: {'catalogId': item['id'], 'source': 'catalog'},
      );
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('تعذر بدء الحجز')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final items = _visible;
    return Scaffold(
      backgroundColor: LonalizaColors.page,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            expandedHeight: 168,
            backgroundColor: LonalizaColors.royalPurple,
            foregroundColor: Colors.white,
            title: Text(widget.title),
            flexibleSpace: FlexibleSpaceBar(
              background: DecoratedBox(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFF1B0833), Color(0xFF2E1065), Color(0xFF6D28D9)],
                  ),
                ),
                child: SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 56, 16, 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _heroCopy(widget.serviceType),
                          style: const TextStyle(color: Color(0xFFFDE68A), fontWeight: FontWeight.w700),
                        ),
                        const SizedBox(height: 10),
                        TextField(
                          controller: _query,
                          onSubmitted: (_) => setState(() {}),
                          style: const TextStyle(color: Colors.white),
                          decoration: InputDecoration(
                            hintText: 'ابحث بالاسم أو المدينة',
                            hintStyle: const TextStyle(color: Colors.white70),
                            prefixIcon: const Icon(Icons.search, color: Colors.white),
                            filled: true,
                            fillColor: Colors.white.withValues(alpha: 0.12),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide: BorderSide.none,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: SizedBox(
              height: 56,
              child: ListView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                children: [
                  Padding(
                    padding: const EdgeInsetsDirectional.only(end: 8),
                    child: ChoiceChip(
                      label: const Text('كل الوجهات'),
                      selected: _destination.isEmpty,
                      selectedColor: LonalizaColors.royalPurple,
                      labelStyle: TextStyle(
                        color: _destination.isEmpty ? Colors.white : LonalizaColors.ink,
                        fontWeight: FontWeight.w700,
                      ),
                      onSelected: (_) => setState(() => _destination = ''),
                    ),
                  ),
                  for (final dest in _destinations)
                    Padding(
                      padding: const EdgeInsetsDirectional.only(end: 8),
                      child: ChoiceChip(
                        label: Text(dest),
                        selected: _destination == dest,
                        selectedColor: LonalizaColors.royalPurple,
                        labelStyle: TextStyle(
                          color: _destination == dest ? Colors.white : LonalizaColors.ink,
                          fontWeight: FontWeight.w700,
                        ),
                        onSelected: (_) => setState(() => _destination = dest),
                      ),
                    ),
                ],
              ),
            ),
          ),
          if (_loading)
            const SliverFillRemaining(child: Center(child: CircularProgressIndicator()))
          else if (_error != null)
            SliverFillRemaining(child: Center(child: Text(_error!)))
          else if (items.isEmpty)
            const SliverFillRemaining(child: Center(child: Text('لا توجد نتائج مطابقة الآن')))
          else
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 28),
              sliver: SliverGrid(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                  childAspectRatio: 0.72,
                ),
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final item = items[index];
                    return HomeOfferCard(
                      width: double.infinity,
                      height: double.infinity,
                      title: asText(item['name'] ?? item['title'] ?? item['titleAr'] ?? item['nameAr'], widget.title),
                      subtitle: asText(
                        item['destination'] ??
                            item['destinationAr'] ??
                            item['city'] ??
                            item['duration'] ??
                            item['category'],
                      ),
                      image: asText(item['image'] ?? item['imageUrl'] ?? item['cover'] ?? item['photo']),
                      price: _catalogPrice(item),
                      currency: asText(item['currency'], 'USD'),
                      badge: _badge(widget.serviceType),
                      onTap: () => _book(item),
                    );
                  },
                  childCount: items.length,
                ),
              ),
            ),
        ],
      ),
    );
  }

  String _heroCopy(String type) {
    return switch (type) {
      'cars' => 'أسطول تركيا بأسعار يومية واضحة',
      'tours' => 'رحلات يومية وبرامج جاهزة',
      _ => 'باقات سياحية بنفس عروض الموقع',
    };
  }

  String _badge(String type) {
    return switch (type) {
      'cars' => 'يومي',
      'tours' => 'رحلة',
      _ => 'باقة',
    };
  }
}

double? _catalogPrice(Map<String, dynamic> item) {
  return asDouble(item['price'] ?? item['pricePerDay'] ?? item['total'] ?? item['fromPrice'] ?? item['totalStay']);
}
