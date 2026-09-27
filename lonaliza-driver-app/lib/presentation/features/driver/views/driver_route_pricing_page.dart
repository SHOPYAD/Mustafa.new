import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../core/utils/catalog_i18n.dart';
import '../../../../data/services/driver_api.dart';
import '../../../providers/driver_session_provider.dart';

class DriverRoutePricingPage extends ConsumerStatefulWidget {
  const DriverRoutePricingPage({super.key});

  @override
  ConsumerState<DriverRoutePricingPage> createState() => _DriverRoutePricingPageState();
}

class _DriverRoutePricingPageState extends ConsumerState<DriverRoutePricingPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  List<dynamic> _routes = [];
  List<dynamic> _routePricing = [];
  List<dynamic> _tourOffers = [];

  bool _loadingRoutes = true;
  bool _loadingTours = true;
  String _selectedFilterCity = 'all';

  static const List<Map<String, String>> _filterCities = [
    {'id': 'all', 'name': 'الكل', 'icon': '🇹🇷'},
    {'id': 'istanbul', 'name': 'إسطنبول ومرمرة', 'icon': '🕌'},
    {'id': 'trabzon', 'name': 'طرابزون والشمال', 'icon': '🌲'},
    {'id': 'antalya', 'name': 'أنطاليا والساحل', 'icon': '🏖️'},
    {'id': 'cappadocia', 'name': 'كابادوكيا', 'icon': '🎈'},
    {'id': 'aegean', 'name': 'بودروم وإيجة', 'icon': '⛵'},
    {'id': 'southeast', 'name': 'الجنوب والتاريخية', 'icon': '🏛️'},
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(() {
      if (mounted) setState(() {});
    });
    _loadAll();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  bool _matchesRouteCity(Map<String, dynamic> route, String cityId) {
    if (cityId == 'all') return true;
    final rCity = (route['city'] ?? '').toString().toLowerCase();
    if (rCity.isNotEmpty) {
      if (cityId == 'aegean' && (rCity == 'aegean' || rCity == 'bodrum' || rCity == 'fethiye' || rCity == 'marmaris' || rCity == 'cesme' || rCity == 'izmir')) return true;
      if (cityId == 'southeast' && (rCity == 'southeast' || rCity == 'gaziantep' || rCity == 'sanliurfa' || rCity == 'mardin' || rCity == 'diyarbakir' || rCity == 'erzurum' || rCity == 'kars' || rCity == 'van')) return true;
      if (rCity == cityId) return true;
    }
    final fromId = (route['fromZoneId'] ?? '').toString().toLowerCase();
    final toId = (route['toZoneId'] ?? '').toString().toLowerCase();
    final combined = '$fromId $toId $rCity';

    switch (cityId) {
      case 'istanbul':
        return combined.contains('ist') || combined.contains('saw') || combined.contains('taksim') ||
               combined.contains('sultanahmet') || combined.contains('sisli') || combined.contains('kadikoy') ||
               combined.contains('bursa') || combined.contains('sapanca') || combined.contains('yalova') ||
               combined.contains('besiktas');
      case 'trabzon':
        return combined.contains('trabzon') || combined.contains('tzx') || combined.contains('uzungol') ||
               combined.contains('ayder') || combined.contains('rize') || combined.contains('sumela');
      case 'antalya':
        return combined.contains('antalya') || combined.contains('ayt') || combined.contains('belek') ||
               combined.contains('kemer') || combined.contains('side') || combined.contains('alanya') ||
               combined.contains('kas');
      case 'cappadocia':
        return combined.contains('cappadocia') || combined.contains('goreme') || combined.contains('nevsehir') ||
               combined.contains('kayseri') || combined.contains('uchisar') || combined.contains('urgup');
      case 'aegean':
        return combined.contains('bodrum') || combined.contains('bjv') || combined.contains('dalaman') ||
               combined.contains('dlm') || combined.contains('fethiye') || combined.contains('marmaris') ||
               combined.contains('izmir') || combined.contains('cesme');
      case 'southeast':
        return combined.contains('mardin') || combined.contains('urfa') || combined.contains('gaziantep') ||
               combined.contains('diyarbakir') || combined.contains('kars') || combined.contains('erzurum') ||
               combined.contains('van');
      default:
        return true;
    }
  }

  bool _matchesTourCity(Map<String, dynamic> item, String cityId) {
    if (cityId == 'all') return true;
    final tour = item['tour'] is Map<String, dynamic> ? (item['tour'] as Map<String, dynamic>) : item;
    final hubCity = (tour['hubCity'] ?? tour['destination'] ?? tour['city'] ?? '').toString().toLowerCase();
    final title = (tour['title'] is Map ? (tour['title']['ar'] ?? tour['title']['en'] ?? '') : tour['title']?.toString() ?? '').toLowerCase();
    final combined = '$hubCity $title';

    if (cityId == 'aegean') {
      return combined.contains('aegean') || combined.contains('bodrum') || combined.contains('fethiye') ||
             combined.contains('marmaris') || combined.contains('cesme') || combined.contains('izmir') ||
             combined.contains('dalaman') || combined.contains('بودروم') || combined.contains('فتحية') || combined.contains('مرمريس');
    }
    if (cityId == 'southeast') {
      return combined.contains('southeast') || combined.contains('mardin') || combined.contains('urfa') ||
             combined.contains('gaziantep') || combined.contains('diyarbakir') || combined.contains('kars') ||
             combined.contains('erzurum') || combined.contains('van') || combined.contains('ماردين') ||
             combined.contains('أورفا') || combined.contains('عنتاب');
    }
    if (cityId == 'istanbul') {
      return combined.contains('istanbul') || combined.contains('sapanca') || combined.contains('bursa') ||
             combined.contains('yalova') || combined.contains('سبانجا') || combined.contains('بورصة') ||
             combined.contains('البسفور') || combined.contains('شيلا') || combined.contains('إسطنبول');
    }
    if (cityId == 'trabzon') {
      return combined.contains('trabzon') || combined.contains('uzungol') || combined.contains('ayder') ||
             combined.contains('rize') || combined.contains('طرابزون') || combined.contains('أوزنجول') ||
             combined.contains('آيدر') || combined.contains('حيدر نبي') || combined.contains('سوميلا');
    }
    if (cityId == 'antalya') {
      return combined.contains('antalya') || combined.contains('belek') || combined.contains('kemer') ||
             combined.contains('alanya') || combined.contains('أنطاليا') || combined.contains('ألانيا') ||
             combined.contains('كيمير') || combined.contains('سيدي');
    }
    if (cityId == 'cappadocia') {
      return combined.contains('cappadocia') || combined.contains('goreme') || combined.contains('كابادوكيا') ||
             combined.contains('المناطيد') || combined.contains('أورغوب');
    }
    return combined.contains(cityId);
  }

  Future<void> _loadAll() async {
    await Future.wait([_loadRoutes(), _loadTours()]);
  }

  Future<void> _loadRoutes() async {
    final supplierId = ref.read(driverSessionProvider).supplierId ?? 'sup-lonaliza-official';
    setState(() => _loadingRoutes = true);
    try {
      final api = ref.read(driverApiProvider);
      final routes = await api.fetchRoutes();
      final pricing = await api.fetchRoutePricing(supplierId);
      if (!mounted) return;
      setState(() {
        _routes = routes;
        _routePricing = pricing;
        _loadingRoutes = false;
      });
    } catch (e) {
      debugPrint('Error loading routes: $e');
      if (!mounted) return;
      setState(() => _loadingRoutes = false);
    }
  }

  Future<void> _loadTours() async {
    final supplierId = ref.read(driverSessionProvider).supplierId ?? 'sup-lonaliza-official';
    setState(() => _loadingTours = true);
    try {
      final api = ref.read(driverApiProvider);
      final offers = await api.fetchTourOffers(supplierId);
      if (!mounted) return;
      setState(() {
        _tourOffers = offers;
        _loadingTours = false;
      });
    } catch (e) {
      debugPrint('Error loading tours: $e');
      if (!mounted) return;
      setState(() => _loadingTours = false);
    }
  }

  double _getEffectiveRoutePrice(Map<String, dynamic> route) {
    final routeId = route['_id']?.toString() ?? route['id']?.toString() ?? '';
    final custom = _routePricing.cast<Map<String, dynamic>>().where(
          (p) => p['routeId']?.toString() == routeId,
        );
    if (custom.isNotEmpty && custom.first['basePrice'] != null) {
      return (custom.first['basePrice'] as num).toDouble();
    }
    return (route['basePrice'] as num?)?.toDouble() ?? 50.0;
  }

  Future<void> _updateRoutePrice(Map<String, dynamic> route, double newPrice) async {
    final supplierId = ref.read(driverSessionProvider).supplierId ?? 'sup-lonaliza-official';
    final routeId = route['_id']?.toString() ?? route['id']?.toString() ?? '';

    // Optimistic UI update
    setState(() {
      final existingIdx = _routePricing.indexWhere((p) => p['routeId']?.toString() == routeId);
      if (existingIdx >= 0) {
        _routePricing[existingIdx]['basePrice'] = newPrice;
      } else {
        _routePricing.add({
          'routeId': routeId,
          'basePrice': newPrice,
          'vehicleClassId': route['vehicleClassId'] ?? 'vc-vito-vip',
          'currency': 'USD',
          'isActive': true,
        });
      }
    });

    try {
      final api = ref.read(driverApiProvider);
      await api.upsertRoutePricing(supplierId, {
        'routeId': routeId,
        'vehicleClassId': route['vehicleClassId'] ?? 'vc-vito-vip',
        'basePrice': newPrice,
        'currency': 'USD',
        'isActive': true,
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('فشل حفظ السعر: $e')),
        );
      }
      _loadRoutes();
    }
  }

  Future<void> _openExactPriceDialog(Map<String, dynamic> route) async {
    final currentPrice = _getEffectiveRoutePrice(route);
    final controller = TextEditingController(text: currentPrice.toInt().toString());

    final saved = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.purple.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.attach_money_rounded, color: AppColors.purple, size: 20),
            ),
            const SizedBox(width: 8),
            const Text('تعديل سعر المسار', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              catalogRouteLabel(route, context),
              style: const TextStyle(fontSize: 13, color: AppColors.textMuted, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 14),
            TextField(
              controller: controller,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              autofocus: true,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
              decoration: InputDecoration(
                labelText: 'السعر النهائي للعميل بالدولار (USD)',
                prefixIcon: const Icon(Icons.monetization_on_outlined, color: AppColors.goldDark),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('إلغاء', style: TextStyle(color: Colors.grey)),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.purple,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: const Text('تثبيت وحفظ فوري'),
          ),
        ],
      ),
    );

    if (saved == true) {
      final parsed = double.tryParse(controller.text.trim());
      if (parsed != null && parsed > 0) {
        _updateRoutePrice(route, parsed);
      }
    }
  }

  // ── AI Conversational Route Generator Modal ──────────────────────────────

  void _openManualRouteDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _ManualRouteSheet(
        onRouteCreated: () {
          _loadRoutes();
        },
      ),
    );
  }

  void _openManualTourDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _ManualTourSheet(
        onTourCreated: () {
          _loadTours();
        },
      ),
    );
  }

  void _openAiRouteCopilotDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _AiRouteCopilotSheet(
        onRoutesGenerated: () {
          _loadRoutes();
        },
      ),
    );
  }

  void _openAiTourCopilotDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _AiTourCopilotSheet(
        onToursGenerated: () {
          _loadTours();
        },
      ),
    );
  }

  void _showTourDetailsDialog(Map<String, dynamic> tourData, Map<String, dynamic>? firstOffer, double price) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _TourProgramDetailsSheet(
        tourData: tourData,
        firstOffer: firstOffer,
        price: price,
        onPriceUpdated: (newPrice) => _updateTourPrice(tourData, firstOffer, newPrice),
      ),
    );
  }

  Future<void> _updateTourPrice(Map<String, dynamic> tourData, Map<String, dynamic>? firstOffer, double newPrice) async {
    final supplierId = ref.read(driverSessionProvider).supplierId ?? 'sup-lonaliza-official';
    final tourId = tourData['id']?.toString() ?? tourData['_id']?.toString() ?? '';
    final vehicleClassId = firstOffer?['vehicleClassId']?.toString() ?? 'vc-vito-vip';

    setState(() {
      final existingIdx = _tourOffers.indexWhere((item) {
        final t = item['tour'] is Map ? item['tour'] : item;
        return (t['id']?.toString() == tourId || t['_id']?.toString() == tourId);
      });
      if (existingIdx >= 0) {
        final item = _tourOffers[existingIdx];
        if (item['offers'] is List && (item['offers'] as List).isNotEmpty) {
          (item['offers'] as List).first['customPrice'] = newPrice;
        } else {
          item['price'] = newPrice;
          item['customPrice'] = newPrice;
        }
      }
    });

    try {
      final api = ref.read(driverApiProvider);
      await api.createTourOffer(supplierId, {
        'tourId': tourId,
        'customPrice': newPrice,
        'price': newPrice,
        'vehicleClassId': vehicleClassId,
        'currency': 'USD',
        'isActive': true,
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('فشل حفظ سعر الجولة: $e')),
        );
      }
      _loadTours();
    }
  }

  Future<void> _openExactTourPriceDialog(Map<String, dynamic> tourData, Map<String, dynamic>? firstOffer, double currentPrice) async {
    final controller = TextEditingController(text: currentPrice.toInt().toString());
    final title = tourData['title'] is Map
        ? (tourData['title']['ar'] ?? tourData['title']['en'] ?? 'جولة VIP')
        : (tourData['title']?.toString() ?? 'جولة VIP');

    final saved = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: Colors.amber.shade100,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.attach_money_rounded, color: Color(0xFFB45309), size: 20),
            ),
            const SizedBox(width: 8),
            const Text('تعديل سعر الجولة VIP', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(fontSize: 13, color: AppColors.textMuted, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 14),
            TextField(
              controller: controller,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              autofocus: true,
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
              decoration: InputDecoration(
                labelText: 'سعر الجولة اليوم الكامل بالدولار (USD)',
                prefixIcon: const Icon(Icons.monetization_on_outlined, color: Color(0xFFB45309)),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('إلغاء', style: TextStyle(color: Colors.grey)),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: FilledButton.styleFrom(
              backgroundColor: const Color(0xFFB45309),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: const Text('تثبيت وحفظ السعر'),
          ),
        ],
      ),
    );

    if (saved == true) {
      final parsed = double.tryParse(controller.text.trim());
      if (parsed != null && parsed > 0) {
        _updateTourPrice(tourData, firstOffer, parsed);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('تسعير المسارات والجولات السياحية'),
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: Container(
            margin: const EdgeInsets.fromLTRB(14, 0, 14, 10),
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F9), // Slate 100
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFFCBD5E1)),
            ),
            child: Row(
              children: [
                // Tab 1: Transfers
                Expanded(
                  child: InkWell(
                    onTap: () {
                      if (_tabController.index != 0) {
                        setState(() => _tabController.index = 0);
                      }
                    },
                    borderRadius: BorderRadius.circular(10),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.symmetric(vertical: 9),
                      decoration: BoxDecoration(
                        color: _tabController.index == 0 ? AppColors.purple : Colors.transparent,
                        borderRadius: BorderRadius.circular(10),
                        boxShadow: _tabController.index == 0
                            ? [
                                BoxShadow(
                                  color: AppColors.purple.withValues(alpha: 0.35),
                                  blurRadius: 6,
                                  offset: const Offset(0, 2),
                                )
                              ]
                            : null,
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.alt_route_rounded,
                            size: 17,
                            color: _tabController.index == 0 ? Colors.white : const Color(0xFF475569),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            'المسارات والترانسفير (${_routes.length})',
                            style: TextStyle(
                              fontSize: 12.5,
                              fontWeight: FontWeight.bold,
                              color: _tabController.index == 0 ? Colors.white : const Color(0xFF1E293B),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                // Tab 2: VIP Tours
                Expanded(
                  child: InkWell(
                    onTap: () {
                      if (_tabController.index != 1) {
                        setState(() => _tabController.index = 1);
                      }
                    },
                    borderRadius: BorderRadius.circular(10),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.symmetric(vertical: 9),
                      decoration: BoxDecoration(
                        color: _tabController.index == 1 ? const Color(0xFFB45309) : Colors.transparent,
                        borderRadius: BorderRadius.circular(10),
                        boxShadow: _tabController.index == 1
                            ? [
                                BoxShadow(
                                  color: const Color(0xFFB45309).withValues(alpha: 0.35),
                                  blurRadius: 6,
                                  offset: const Offset(0, 2),
                                )
                              ]
                            : null,
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.tour_rounded,
                            size: 17,
                            color: _tabController.index == 1 ? Colors.white : const Color(0xFF475569),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            'جولات VIP (${_tourOffers.length})',
                            style: TextStyle(
                              fontSize: 12.5,
                              fontWeight: FontWeight.bold,
                              color: _tabController.index == 1 ? Colors.white : const Color(0xFF1E293B),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildTransfersTab(),
          _buildDailyToursTab(),
        ],
      ),
    );
  }

  Widget _buildCityFilterBar({required Color activeColor}) {
    return Container(
      height: 42,
      margin: const EdgeInsets.fromLTRB(0, 2, 0, 8),
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 14),
        scrollDirection: Axis.horizontal,
        itemCount: _filterCities.length,
        separatorBuilder: (_, _) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final c = _filterCities[index];
          final isSel = _selectedFilterCity == c['id'];
          return FilterChip(
            selected: isSel,
            showCheckmark: false,
            label: Text(
              '${c['icon']} ${c['name']}',
              style: TextStyle(
                fontSize: 12,
                fontWeight: isSel ? FontWeight.bold : FontWeight.w600,
                color: isSel ? Colors.white : const Color(0xFF334155),
              ),
            ),
            backgroundColor: Colors.white,
            selectedColor: activeColor,
            elevation: isSel ? 2 : 0,
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
              side: BorderSide(
                color: isSel ? Colors.transparent : const Color(0xFFCBD5E1),
                width: 1,
              ),
            ),
            onSelected: (_) {
              setState(() => _selectedFilterCity = c['id']!);
            },
          );
        },
      ),
    );
  }

  Widget _buildTransfersTab() {
    if (_loadingRoutes) {
      return const Center(child: CircularProgressIndicator(color: AppColors.gold));
    }

    final filteredRoutes = _routes
        .where((r) => _matchesRouteCity(r as Map<String, dynamic>, _selectedFilterCity))
        .toList();

    return Column(
      children: [
        // Action Card
        Container(
          margin: const EdgeInsets.fromLTRB(14, 10, 14, 6),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.purple.withValues(alpha: 0.2)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.03),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: AppColors.purple.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.alt_route_rounded, color: AppColors.purple, size: 20),
                  ),
                  const SizedBox(width: 10),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'إدارة وتسعير مسارات المطار والترانسفير',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.textPrimary),
                        ),
                        Text(
                          'حدد أسعار مساراتك مباشرة أو استخدم الذكاء الاصطناعي',
                          style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  // Primary: Manual Route
                  Expanded(
                    child: FilledButton.icon(
                      onPressed: _openManualRouteDialog,
                      icon: const Icon(Icons.add_rounded, size: 17),
                      label: const Text('إضافة مسار يدوي', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                      style: FilledButton.styleFrom(
                        backgroundColor: AppColors.purple,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  // Secondary: AI Copilot
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _openAiRouteCopilotDialog,
                      icon: const Icon(Icons.auto_awesome_rounded, size: 15, color: AppColors.goldDark),
                      label: const Text('توليد ذكي AI ✨', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.purpleDark)),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: AppColors.gold, width: 1.2),
                        backgroundColor: const Color(0xFFFFFBEB),
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        // City Filter Bar
        _buildCityFilterBar(activeColor: AppColors.purple),

        // Route Count & Sync Badge
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'المسارات (${filteredRoutes.length} من إجمالي ${_routes.length})',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12.5, color: AppColors.textPrimary),
              ),
              Row(
                children: [
                  Container(
                    width: 7,
                    height: 7,
                    decoration: const BoxDecoration(color: Color(0xFF10B981), shape: BoxShape.circle),
                  ),
                  const SizedBox(width: 5),
                  const Text(
                    'متزامن مع متجر لوناليزا',
                    style: TextStyle(fontSize: 11, color: Color(0xFF059669), fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ],
          ),
        ),

        // Routes List
        Expanded(
          child: filteredRoutes.isEmpty
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.alt_route_rounded, size: 48, color: Colors.grey),
                      const SizedBox(height: 8),
                      Text(
                        _selectedFilterCity == 'all'
                            ? 'لا توجد مسارات مضافة بعد'
                            : 'لا توجد مسارات في هذه المدينة حالياً',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          FilledButton.icon(
                            onPressed: _openManualRouteDialog,
                            icon: const Icon(Icons.add),
                            label: const Text('إضافة مسار'),
                          ),
                          const SizedBox(width: 8),
                          OutlinedButton.icon(
                            onPressed: _openAiRouteCopilotDialog,
                            icon: const Icon(Icons.auto_awesome),
                            label: const Text('توليد بالذكاء الاصطناعي'),
                          ),
                        ],
                      ),
                    ],
                  ),
                )
              : ListView.separated(
                  padding: const EdgeInsets.fromLTRB(14, 4, 14, 20),
                  itemCount: filteredRoutes.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 8),
                  itemBuilder: (context, index) {
                    final route = filteredRoutes[index] as Map<String, dynamic>;
                    final fromLabel = catalogZoneLabel(route['fromZone'] ?? route['fromZoneName'] ?? route['fromZoneId'], context);
                    final toLabel = catalogZoneLabel(route['toZone'] ?? route['toZoneName'] ?? route['toZoneId'], context);
                    final vehicleClass = catalogVehicleClassLabel(route['vehicleClass'], context, vehicleClassId: route['vehicleClassId'] as String?);
                    final price = _getEffectiveRoutePrice(route);
                    final distanceKm = route['estimatedDistanceKm'] ?? route['distanceKm'] ?? 45;
                    final durationMin = route['estimatedDurationMinutes'] ?? route['durationMin'] ?? 50;

                    return Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.02),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Origin ➔ Destination Row
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                padding: const EdgeInsets.all(7),
                                decoration: BoxDecoration(
                                  color: AppColors.purple.withValues(alpha: 0.08),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Icon(Icons.swap_calls_rounded, color: AppColors.purple, size: 18),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    // Origin
                                    Row(
                                      children: [
                                        const Icon(Icons.flight_takeoff_rounded, size: 14, color: AppColors.purple),
                                        const SizedBox(width: 5),
                                        Expanded(
                                          child: Text(
                                            fromLabel,
                                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.textPrimary),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 3),
                                    // Destination
                                    Row(
                                      children: [
                                        const Icon(Icons.location_on_rounded, size: 14, color: Color(0xFFEF4444)),
                                        const SizedBox(width: 5),
                                        Expanded(
                                          child: Text(
                                            toLabel,
                                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.textPrimary),
                                            maxLines: 1,
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          const Divider(height: 1, color: Color(0xFFF1F5F9)),
                          const SizedBox(height: 8),

                          // Badges & Stepper Row
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              // Badges
                              Expanded(
                                child: Wrap(
                                  spacing: 6,
                                  runSpacing: 4,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFF8FAFC),
                                        borderRadius: BorderRadius.circular(6),
                                        border: Border.all(color: const Color(0xFFE2E8F0)),
                                      ),
                                      child: Text(
                                        vehicleClass.isNotEmpty && vehicleClass != '—' ? vehicleClass : 'مرسيدس فيتو VIP',
                                        style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w600, color: Color(0xFF475569)),
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFF8FAFC),
                                        borderRadius: BorderRadius.circular(6),
                                        border: Border.all(color: const Color(0xFFE2E8F0)),
                                      ),
                                      child: Text(
                                        '~$distanceKm كم • ~$durationMin د',
                                        style: const TextStyle(fontSize: 10.5, color: Color(0xFF64748B)),
                                      ),
                                    ),
                                  ],
                                ),
                              ),

                              // Stepper & Price
                              Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  // Minus $5
                                  IconButton(
                                    visualDensity: VisualDensity.compact,
                                    icon: const Icon(Icons.remove_circle_outline, size: 20, color: Color(0xFFEF4444)),
                                    onPressed: price > 10
                                        ? () => _updateRoutePrice(route, (price - 5).clamp(10, 9999))
                                        : null,
                                  ),

                                  // Price Badge
                                  InkWell(
                                    onTap: () => _openExactPriceDialog(route),
                                    borderRadius: BorderRadius.circular(8),
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFFAF5FF),
                                        borderRadius: BorderRadius.circular(8),
                                        border: Border.all(color: const Color(0xFFDDD6FE)),
                                      ),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Text(
                                            '\$${price.toInt()}',
                                            style: const TextStyle(
                                              fontSize: 15,
                                              fontWeight: FontWeight.w900,
                                              fontFamily: 'monospace',
                                              color: AppColors.purpleDark,
                                            ),
                                          ),
                                          const SizedBox(width: 4),
                                          const Icon(Icons.edit, size: 11, color: AppColors.purple),
                                        ],
                                      ),
                                    ),
                                  ),

                                  // Plus $5
                                  IconButton(
                                    visualDensity: VisualDensity.compact,
                                    icon: const Icon(Icons.add_circle_outline, size: 20, color: Color(0xFF10B981)),
                                    onPressed: () => _updateRoutePrice(route, price + 5),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ],
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildDailyToursTab() {
    if (_loadingTours) {
      return const Center(child: CircularProgressIndicator(color: AppColors.gold));
    }

    final filteredTours = _tourOffers
        .where((t) => _matchesTourCity(t as Map<String, dynamic>, _selectedFilterCity))
        .toList();

    return Column(
      children: [
        // Action Header Card for Tours
        Container(
          margin: const EdgeInsets.fromLTRB(14, 10, 14, 6),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.amber.shade200),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.03),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: Colors.amber.shade100,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.tour_rounded, color: Color(0xFFB45309), size: 20),
                  ),
                  const SizedBox(width: 10),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'إدارة وتسعير جولات اليوم الكامل VIP',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.textPrimary),
                        ),
                        Text(
                          'صبنجة، بورصة، البسفور، أوزنجول... برامج يوم كامل فاخرة',
                          style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  // Primary: Manual Tour
                  Expanded(
                    child: FilledButton.icon(
                      onPressed: _openManualTourDialog,
                      icon: const Icon(Icons.add_rounded, size: 17),
                      label: const Text('إضافة جولة يدوية', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                      style: FilledButton.styleFrom(
                        backgroundColor: const Color(0xFFB45309),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  // Secondary: AI Tour Agent
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _openAiTourCopilotDialog,
                      icon: const Icon(Icons.auto_awesome_rounded, size: 15, color: Color(0xFFB45309)),
                      label: const Text('صانع الجولات AI ✨', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF92400E))),
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: Colors.amber.shade400, width: 1.2),
                        backgroundColor: const Color(0xFFFFFBEB),
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        // City Filter Bar for Tours
        _buildCityFilterBar(activeColor: const Color(0xFFB45309)),

        // Tours Count & Status
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'الجولات المتاحة (${filteredTours.length} من إجمالي ${_tourOffers.length})',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12.5, color: AppColors.textPrimary),
              ),
              Row(
                children: [
                  Container(
                    width: 7,
                    height: 7,
                    decoration: const BoxDecoration(color: Color(0xFF10B981), shape: BoxShape.circle),
                  ),
                  const SizedBox(width: 5),
                  const Text(
                    'متزامن ومتاح للحجز المباشر',
                    style: TextStyle(fontSize: 11, color: Color(0xFF059669), fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            ],
          ),
        ),

        // Tours List
        Expanded(
          child: filteredTours.isEmpty
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.tour_rounded, size: 48, color: Colors.grey),
                      const SizedBox(height: 8),
                      Text(
                        _selectedFilterCity == 'all'
                            ? 'لا توجد عروض جولات سياحية بعد'
                            : 'لا توجد جولات في هذه المنطقة حالياً',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 12),
                      Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          FilledButton.icon(
                            onPressed: _openManualTourDialog,
                            icon: const Icon(Icons.add),
                            label: const Text('إضافة جولة يدوية'),
                            style: FilledButton.styleFrom(backgroundColor: const Color(0xFFB45309)),
                          ),
                          const SizedBox(width: 8),
                          OutlinedButton.icon(
                            onPressed: _openAiTourCopilotDialog,
                            icon: const Icon(Icons.auto_awesome),
                            label: const Text('توليد بالذكاء الاصطناعي'),
                          ),
                        ],
                      ),
                    ],
                  ),
                )
              : ListView.separated(
                  padding: const EdgeInsets.fromLTRB(14, 4, 14, 20),
                  itemCount: filteredTours.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 8),
                  itemBuilder: (context, index) {
                    final item = filteredTours[index] as Map<String, dynamic>;
                    final tourData = item['tour'] is Map<String, dynamic> ? (item['tour'] as Map<String, dynamic>) : item;
                    final offersList = item['offers'] is List ? (item['offers'] as List) : [];
                    final firstOffer = offersList.isNotEmpty && offersList.first is Map ? (offersList.first as Map<String, dynamic>) : null;

                    final title = tourData['title'] is Map
                        ? (tourData['title']['ar'] ?? tourData['title']['en'] ?? 'جولة VIP')
                        : (tourData['title']?.toString() ?? 'جولة VIP');

                    final destination = tourData['destination']?.toString() ?? tourData['hubCity']?.toString() ?? 'إسطنبول';
                    final durationHours = tourData['durationHours'] ?? 10;
                    final price = (firstOffer?['customPrice'] as num?)?.toDouble() ??
                                  (firstOffer?['price'] as num?)?.toDouble() ??
                                  (tourData['price'] as num?)?.toDouble() ??
                                  (tourData['basePrice'] as num?)?.toDouble() ?? 180.0;

                    final vehicleClass = firstOffer?['vehicleClass']?['name']?['ar'] ??
                                         firstOffer?['vehicleClassId'] ??
                                         tourData['vehicleClassId'] ??
                                         'مرسيدس فيتو VIP';

                    return Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: Colors.grey.shade200),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.02),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 38,
                                height: 38,
                                decoration: BoxDecoration(
                                  color: AppColors.gold.withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: const Icon(Icons.landscape_rounded, color: AppColors.goldDark, size: 20),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      title.toString(),
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                    const SizedBox(height: 3),
                                    Text(
                                      '$destination • $durationHours ساعات • $vehicleClass',
                                      style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          const Divider(height: 1, color: Color(0xFFF1F5F9)),
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFEF3C7),
                                  borderRadius: BorderRadius.circular(6),
                                  border: Border.all(color: const Color(0xFFFDE68A)),
                                ),
                                child: const Row(
                                  children: [
                                    Icon(Icons.star_rounded, size: 13, color: Color(0xFFB45309)),
                                    SizedBox(width: 3),
                                    Text(
                                      'يوم كامل VIP مع سائق خاص',
                                      style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.bold, color: Color(0xFF78350F)),
                                    ),
                                  ],
                                ),
                              ),
                              // Quick Price Stepper & Direct Tap
                              Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  // Minus $10
                                  IconButton(
                                    visualDensity: VisualDensity.compact,
                                    icon: const Icon(Icons.remove_circle_outline, size: 20, color: Color(0xFFEF4444)),
                                    onPressed: price > 20
                                        ? () => _updateTourPrice(tourData, firstOffer, (price - 10).clamp(20, 9999))
                                        : null,
                                  ),

                                  // Price Badge
                                  InkWell(
                                    onTap: () => _openExactTourPriceDialog(tourData, firstOffer, price),
                                    borderRadius: BorderRadius.circular(8),
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                                      decoration: BoxDecoration(
                                        color: const Color(0xFFFEF3C7),
                                        borderRadius: BorderRadius.circular(8),
                                        border: Border.all(color: const Color(0xFFFDE68A)),
                                      ),
                                      child: Row(
                                        children: [
                                          Text(
                                            '\$${price.toInt()}',
                                            style: const TextStyle(
                                              fontSize: 15,
                                              fontWeight: FontWeight.w900,
                                              fontFamily: 'monospace',
                                              color: Color(0xFF92400E),
                                            ),
                                          ),
                                          const SizedBox(width: 4),
                                          const Icon(Icons.edit, size: 11, color: Color(0xFFB45309)),
                                        ],
                                      ),
                                    ),
                                  ),

                                  // Plus $10
                                  IconButton(
                                    visualDensity: VisualDensity.compact,
                                    icon: const Icon(Icons.add_circle_outline, size: 20, color: Color(0xFF10B981)),
                                    onPressed: () => _updateTourPrice(tourData, firstOffer, price + 10),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          InkWell(
                            onTap: () => _showTourDetailsDialog(tourData, firstOffer, price),
                            borderRadius: BorderRadius.circular(8),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF8FAFC),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: const Color(0xFFE2E8F0)),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.menu_book_rounded, size: 15, color: Color(0xFFB45309)),
                                  const SizedBox(width: 6),
                                  const Expanded(
                                    child: Text(
                                      'برنامج وخط سير الجولة والأنشطة المدفوعة للعميل',
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFF1E293B),
                                      ),
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFFEF3C7),
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: const Text(
                                      'عرض التفاصيل',
                                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFFB45309)),
                                    ),
                                  ),
                                  const SizedBox(width: 4),
                                  Icon(Icons.chevron_left_rounded, size: 16, color: Colors.grey.shade400),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// AI ROUTE COPILOT CONVERSATIONAL BOTTOM SHEET
// ─────────────────────────────────────────────────────────────────────────────

class _AiRouteCopilotSheet extends ConsumerStatefulWidget {
  const _AiRouteCopilotSheet({required this.onRoutesGenerated});
  final VoidCallback onRoutesGenerated;

  @override
  ConsumerState<_AiRouteCopilotSheet> createState() => _AiRouteCopilotSheetState();
}

class _AiRouteCopilotSheetState extends ConsumerState<_AiRouteCopilotSheet> {
  String _selectedCity = 'istanbul';
  String _pricingPreset = 'vip';
  double _basePriceShort = 55.0;
  double _pricePerKm = 1.20;
  int _routeCount = 20;
  bool _generating = false;
  Map<String, dynamic>? _generationResult;

  final TextEditingController _promptController = TextEditingController();

  final List<Map<String, String>> _cities = [
    {'id': 'istanbul', 'name': 'إسطنبول (IST & SAW)'},
    {'id': 'trabzon', 'name': 'طرابزون وريزا وزيغانة'},
    {'id': 'antalya', 'name': 'أنطاليا وألانيا وبيليك'},
    {'id': 'cappadocia', 'name': 'كابادوكيا وقيصري'},
    {'id': 'aegean', 'name': 'بودروم وإيجة (بودروم، فتحية، مرمريس)'},
    {'id': 'southeast', 'name': 'الجنوب والتاريخية (ماردين، عنتاب، أورفا)'},
  ];

  Future<void> _submitAiGeneration() async {
    final supplierId = ref.read(driverSessionProvider).supplierId ?? 'sup-lonaliza-official';
    setState(() => _generating = true);

    try {
      final api = ref.read(driverApiProvider);
      final res = await api.generateAiRoutes(
        supplierId,
        city: _selectedCity,
        basePriceShort: _basePriceShort,
        pricePerKm: _pricePerKm,
        routeCount: _routeCount,
        pricingPreset: _pricingPreset,
        prompt: _promptController.text.trim().isNotEmpty ? _promptController.text.trim() : null,
      );

      if (!mounted) return;
      setState(() {
        _generationResult = res;
        _generating = false;
      });
      widget.onRoutesGenerated();
    } catch (e) {
      if (!mounted) return;
      setState(() => _generating = false);
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('خطأ: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(20, 16, 20, MediaQuery.of(context).viewInsets.bottom + 20),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SafeArea(
        top: false,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Handle
              Center(
                child: Container(
                  width: 36,
                  height: 4,
                  decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2)),
                ),
              ),
              const SizedBox(height: 14),

              // Title
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.purple.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.auto_awesome_rounded, color: AppColors.purple, size: 22),
                  ),
                  const SizedBox(width: 10),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('وكيل الذكاء الاصطناعي للمسارات', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                        Text('تحديد نموذج التسعير وتوليد شبكة مسارات متكاملة', style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
                      ],
                    ),
                  ),
                ],
              ),
              const Divider(height: 24),

              if (_generationResult != null) ...[
                // Success Result View
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFFECFDF5),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFA7F3D0)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.check_circle_rounded, color: Color(0xFF059669), size: 20),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              _generationResult!['message'] ?? 'تم توليد وتثبيت تسعير المسارات بنجاح!',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF065F46)),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text(
                        'تم تسجيل ${_generationResult!['summary']?['totalProcessed'] ?? _routeCount} مساراً حقيقياً لأسطولكم بالمتجر. تظهر الآن للعملاء مع الفرز بالأرخص أولاً.',
                        style: const TextStyle(fontSize: 11.5, color: Color(0xFF047857)),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: () => Navigator.pop(context),
                    style: FilledButton.styleFrom(
                      backgroundColor: AppColors.purple,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('العودة لقائمة المسارات وتعديل الأسعار'),
                  ),
                ),
              ] else ...[
                // 1. City Selection
                const Text('1. اختر المدينة أو المنطقة المستهدفة:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: _cities.map((c) {
                    final isSel = _selectedCity == c['id'];
                    return ChoiceChip(
                      selected: isSel,
                      label: Text(c['name']!, style: TextStyle(fontWeight: isSel ? FontWeight.bold : FontWeight.normal, fontSize: 12)),
                      onSelected: (_) => setState(() => _selectedCity = c['id']!),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 16),

                // 2. Pricing Presets
                const Text('2. نموذج التسعير الوسطي المعتمد:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                const SizedBox(height: 8),
                Row(
                  children: [
                    Expanded(
                      child: _buildPricingPresetChip(
                        title: 'اقتصادي منافس',
                        price: '\$45 وسط',
                        id: 'economy',
                        shortPrice: 45.0,
                        kmPrice: 0.95,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _buildPricingPresetChip(
                        title: 'VIP متوازن',
                        price: '\$55 وسط',
                        id: 'vip',
                        shortPrice: 55.0,
                        kmPrice: 1.20,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _buildPricingPresetChip(
                        title: 'ملكي فاخر',
                        price: '\$75 وسط',
                        id: 'luxury',
                        shortPrice: 75.0,
                        kmPrice: 1.60,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),

                // 3. Number of Routes
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('3. عدد المسارات المراد توليدها:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                    DropdownButton<int>(
                      value: _routeCount,
                      underline: const SizedBox(),
                      items: const [
                        DropdownMenuItem(value: 10, child: Text('10 مسارات الأكثر طلباً')),
                        DropdownMenuItem(value: 20, child: Text('20 مساراً رئيسياً')),
                        DropdownMenuItem(value: 35, child: Text('35 مساراً شاملاً للمدينة')),
                      ],
                      onChanged: (val) => setState(() => _routeCount = val ?? 20),
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                // 4. Optional Prompt
                TextField(
                  controller: _promptController,
                  decoration: InputDecoration(
                    hintText: 'ملاحظة خاصة للوكيل (مثال: زد مسارات صبنجة أو ركز على فنادق شيشلي)...',
                    hintStyle: const TextStyle(fontSize: 11, color: Colors.grey),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  ),
                ),
                const SizedBox(height: 18),

                // Submit Button
                SizedBox(
                  width: double.infinity,
                  child: FilledButton.icon(
                    onPressed: _generating ? null : _submitAiGeneration,
                    style: FilledButton.styleFrom(
                      backgroundColor: AppColors.purple,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    icon: _generating
                        ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : const Icon(Icons.bolt_rounded, color: AppColors.gold),
                    label: Text(
                      _generating ? 'جاري توليد وتسعير المسارات بالذكاء الاصطناعي...' : 'توليد المسارات وتثبيت الأسعار فوراً',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPricingPresetChip({
    required String title,
    required String price,
    required String id,
    required double shortPrice,
    required double kmPrice,
  }) {
    final isSel = _pricingPreset == id;
    return InkWell(
      onTap: () {
        setState(() {
          _pricingPreset = id;
          _basePriceShort = shortPrice;
          _pricePerKm = kmPrice;
        });
      },
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
        decoration: BoxDecoration(
          color: isSel ? AppColors.purple.withValues(alpha: 0.1) : Colors.grey.shade50,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSel ? AppColors.purple : Colors.grey.shade300,
            width: isSel ? 1.5 : 1,
          ),
        ),
        child: Column(
          children: [
            Text(title, style: TextStyle(fontSize: 11, fontWeight: isSel ? FontWeight.bold : FontWeight.normal, color: isSel ? AppColors.purple : AppColors.textPrimary)),
            const SizedBox(height: 2),
            Text(price, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: isSel ? AppColors.purpleDark : AppColors.textMuted)),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TOUR PROGRAM & PAID ACTIVITIES DETAILS BOTTOM SHEET
// ─────────────────────────────────────────────────────────────────────────────

class _TourProgramDetailsSheet extends StatelessWidget {
  const _TourProgramDetailsSheet({
    required this.tourData,
    required this.firstOffer,
    required this.price,
    required this.onPriceUpdated,
  });

  final Map<String, dynamic> tourData;
  final Map<String, dynamic>? firstOffer;
  final double price;
  final ValueChanged<double> onPriceUpdated;

  @override
  Widget build(BuildContext context) {
    final title = tourData['title'] is Map
        ? (tourData['title']['ar'] ?? tourData['title']['en'] ?? 'جولة سياحية VIP')
        : (tourData['title']?.toString() ?? 'جولة سياحية VIP');

    final destination = tourData['destination']?.toString() ??
        tourData['hubCity']?.toString() ??
        'تركيا';
    final durationHours = tourData['durationHours'] ?? 10;
    final vehicleClass = firstOffer?['vehicleClass']?['name']?['ar'] ??
        firstOffer?['vehicleClassId'] ??
        tourData['vehicleClassId'] ??
        'مرسيدس فيتو VIP';

    final summary = tourData['summary'] is Map
        ? (tourData['summary']['ar'] ?? tourData['summary']['en'] ?? '')
        : (tourData['summary']?.toString() ?? '');

    final itineraryList = tourData['itinerary'] is List ? (tourData['itinerary'] as List) : [];
    final inclusionsList = tourData['inclusions'] is List ? (tourData['inclusions'] as List) : [];
    final paidActivitiesList = tourData['paidActivities'] is List ? (tourData['paidActivities'] as List) : [];

    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.90,
      ),
      padding: EdgeInsets.fromLTRB(18, 14, 18, MediaQuery.of(context).viewInsets.bottom + 18),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SafeArea(
        top: false,
        child: Column(
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2)),
              ),
            ),
            const SizedBox(height: 12),

            // Top Header Bar
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEF3C7),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFFDE68A)),
                  ),
                  child: const Icon(Icons.menu_book_rounded, color: Color(0xFFB45309), size: 22),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title.toString(),
                        style: const TextStyle(fontSize: 14.5, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      Text(
                        '$destination • $durationHours ساعات • $vehicleClass',
                        style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEF3C7),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFFFDE68A)),
                  ),
                  child: Column(
                    children: [
                      Text(
                        '\$${price.toInt()}',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900, color: Color(0xFF92400E)),
                      ),
                      const Text('يوم كامل', style: TextStyle(fontSize: 9, color: Color(0xFF78350F), fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ],
            ),
            const Divider(height: 20),

            // Scrollable Content
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Summary if present
                    if (summary.toString().isNotEmpty) ...[
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Text(
                          summary.toString(),
                          style: const TextStyle(fontSize: 12, color: Color(0xFF334155), height: 1.4),
                        ),
                      ),
                      const SizedBox(height: 14),
                    ],

                    // Section 1: Timeline & Stops
                    Row(
                      children: [
                        Container(
                          width: 24,
                          height: 24,
                          decoration: BoxDecoration(
                            color: AppColors.purple.withValues(alpha: 0.12),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.place_rounded, size: 14, color: AppColors.purple),
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          'برنامج ومحطات خط السير (Itinerary)',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5, color: AppColors.textPrimary),
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),

                    if (itineraryList.isNotEmpty)
                      ...List.generate(itineraryList.length, (idx) {
                        final stop = itineraryList[idx];
                        if (stop is! Map) return const SizedBox.shrink();
                        final stopName = stop['name'] is Map
                            ? (stop['name']['ar'] ?? stop['name']['en'] ?? 'محطة سياحية')
                            : (stop['name']?.toString() ?? 'محطة سياحية');
                        final stopDesc = stop['description'] is Map
                            ? (stop['description']['ar'] ?? stop['description']['en'] ?? '')
                            : (stop['description']?.toString() ?? '');
                        final stay = stop['stayMinutes'] != null ? '${stop['stayMinutes']} دقيقة' : null;

                        return Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: Colors.grey.shade200),
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                width: 22,
                                height: 22,
                                decoration: const BoxDecoration(
                                  color: Color(0xFF1E293B),
                                  shape: BoxShape.circle,
                                ),
                                alignment: Alignment.center,
                                child: Text(
                                  '${idx + 1}',
                                  style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Expanded(
                                          child: Text(
                                            stopName,
                                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                                          ),
                                        ),
                                        if (stay != null)
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                            decoration: BoxDecoration(
                                              color: const Color(0xFFF1F5F9),
                                              borderRadius: BorderRadius.circular(4),
                                            ),
                                            child: Text(stay, style: const TextStyle(fontSize: 10, color: Color(0xFF475569))),
                                          ),
                                      ],
                                    ),
                                    if (stopDesc.isNotEmpty) ...[
                                      const SizedBox(height: 3),
                                      Text(
                                        stopDesc,
                                        style: const TextStyle(fontSize: 11, color: AppColors.textMuted, height: 1.3),
                                      ),
                                    ],
                                  ],
                                ),
                              ),
                            ],
                          ),
                        );
                      })
                    else
                      ...[
                        _buildDefaultStop('1', 'الاستقبال والانطلاق من الفندق', 'بدء الجولة بسيارة VIP خاصة مع سائق محترف والانطلاق في الموعد المحدد'),
                        _buildDefaultStop('2', 'زيارة المعالم الطبيعية والتاريخية الرئيسية', 'التوقف عند أبرز النقاط والمطلات السياحية والتقاط الصور التذكارية'),
                        _buildDefaultStop('3', 'استراحة الغداء في مطعم ريفي ذي إطلالة', 'وقت مخصص للوجبة وتذوق الأطباق المحلية التركية الشهيرة'),
                        _buildDefaultStop('4', 'وقت حر للأنشطة والفعاليات والتسوق', 'جولات بالقارب أو التسوق في البازارات والمحلات التذكارية'),
                        _buildDefaultStop('5', 'العودة المريحة إلى مقر الإقامة بالسلامة', 'التوصيل حتى بهو الفندق في نهاية اليوم السياحي'),
                      ],

                    const SizedBox(height: 14),

                    // Section 2: Inclusions
                    Row(
                      children: [
                        Container(
                          width: 24,
                          height: 24,
                          decoration: BoxDecoration(
                            color: const Color(0xFF10B981).withValues(alpha: 0.15),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.check_circle_rounded, size: 14, color: Color(0xFF059669)),
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          'ما تشمله الجولة مع السيارة والسائق',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13.5, color: Color(0xFF059669)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF0FDF4),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFBBF7D0)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (inclusionsList.isNotEmpty)
                            ...inclusionsList.map((inc) => Padding(
                                  padding: const EdgeInsets.only(bottom: 6),
                                  child: Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      const Icon(Icons.check_rounded, size: 14, color: Color(0xFF059669)),
                                      const SizedBox(width: 6),
                                      Expanded(
                                        child: Text(inc.toString(), style: const TextStyle(fontSize: 11.5, color: Color(0xFF14532D))),
                                      ),
                                    ],
                                  ),
                                ))
                          else ...[
                            _buildCheckRow('سيارة مرسيدس فيتو VIP خاصة وفاخرة مجهزة بجميع وسائل الراحة'),
                            _buildCheckRow('سائق خاص محترف يتحدث العربية وخبير بالمسارات السياحية'),
                            _buildCheckRow('شامل مصاريف الوقود بالكامل ورسوم كافة الطرق السريعة والجسور والأنفاق'),
                            _buildCheckRow('مياه ضيافة باردة وإنترنت واي فاي عالي السرعة داخل السيارة'),
                            _buildCheckRow('خدمة يوم كامل لمدة 10 ساعات مع مرونة تامة في التوقف والتصوير'),
                          ],
                        ],
                      ),
                    ),

                    const SizedBox(height: 14),

                    // Section 3: EXPLICIT DISCLAIMER OF PAID ACTIVITIES FOR THE CLIENT
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFFBEB),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFFDE68A), width: 1.5),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(6),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFEF3C7),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: const Icon(Icons.warning_amber_rounded, color: Color(0xFFB45309), size: 18),
                              ),
                              const SizedBox(width: 8),
                              const Expanded(
                                child: Text(
                                  'تنبيه هام: أنشطة وتذاكر اختيارية مدفوعة للعميل',
                                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF92400E)),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'توضيح للشفافية ومنع أي التباس مع العميل: جميع الأنشطة الترفيهية وتذاكر الدخول التالية هي خيارات شخصية اختيارية يدفعها العميل مباشرة في الموقع (On-site)، ولا يشملها سعر استئجار السيارة مع السائق:',
                            style: TextStyle(fontSize: 11, color: Color(0xFF78350F), height: 1.4),
                          ),
                          const SizedBox(height: 10),

                          if (paidActivitiesList.isNotEmpty)
                            ...paidActivitiesList.map((act) {
                              if (act is Map) {
                                final name = act['nameAr'] ??
                                    (act['name'] is Map ? (act['name']['ar'] ?? act['name']['en']) : act['name']?.toString() ?? '');
                                final est = act['estimatedPrice']?.toString() ?? '';
                                final note = act['noteAr'] ?? act['note']?.toString() ?? '';
                                return Padding(
                                  padding: const EdgeInsets.only(bottom: 6),
                                  child: Row(
                                    children: [
                                      const Icon(Icons.arrow_right_rounded, size: 18, color: Color(0xFFB45309)),
                                      Expanded(
                                        child: Text(
                                          '$name ${est.isNotEmpty ? "($est)" : ""} ${note.isNotEmpty ? "— $note" : ""}',
                                          style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600, color: Color(0xFF92400E)),
                                        ),
                                      ),
                                    ],
                                  ),
                                );
                              }
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 6),
                                child: Row(
                                  children: [
                                    const Icon(Icons.arrow_right_rounded, size: 18, color: Color(0xFFB45309)),
                                    Expanded(
                                      child: Text(act.toString(), style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600, color: Color(0xFF92400E))),
                                    ),
                                  ],
                                ),
                              );
                            })
                          else ...[
                            _buildPaidRow('🚠 تذاكر ركوب التلفريك (Teleferik)'),
                            _buildPaidRow('🏍️ تأجير دبابات السفاري الجبلية (ATV Safari)'),
                            _buildPaidRow('🧗 ركوب الزيبلاين والأنشطة المعلقة والمغامرات'),
                            _buildPaidRow('🚤 جولات القوارب واليخوت بالبحيرة أو المضيق'),
                            _buildPaidRow('🏛️ رسوم دخول المتاحف والحدائق الوطنية والقصور'),
                            _buildPaidRow('🍽️ وجبات الغداء والمشروبات الشخصية الإضافية'),
                          ],
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),
                  ],
                ),
              ),
            ),

            // Bottom Action Bar
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: () => Navigator.pop(context),
                style: FilledButton.styleFrom(
                  backgroundColor: AppColors.purple,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
                child: const Text('إغلاق التفاصيل', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  static Widget _buildDefaultStop(String num, String title, String desc) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 22,
            height: 22,
            decoration: const BoxDecoration(color: Color(0xFF1E293B), shape: BoxShape.circle),
            alignment: Alignment.center,
            child: Text(num, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                const SizedBox(height: 2),
                Text(desc, style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  static Widget _buildCheckRow(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.check_rounded, size: 14, color: Color(0xFF059669)),
          const SizedBox(width: 6),
          Expanded(child: Text(text, style: const TextStyle(fontSize: 11.5, color: Color(0xFF14532D)))),
        ],
      ),
    );
  }

  static Widget _buildPaidRow(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 5),
      child: Row(
        children: [
          const Icon(Icons.arrow_right_rounded, size: 18, color: Color(0xFFB45309)),
          Expanded(child: Text(text, style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600, color: Color(0xFF92400E)))),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// AI TOUR COPILOT BOTTOM SHEET (CUSTOM TOUR & BATCH GENERATION)
// ─────────────────────────────────────────────────────────────────────────────

class _AiTourCopilotSheet extends ConsumerStatefulWidget {
  const _AiTourCopilotSheet({required this.onToursGenerated});
  final VoidCallback onToursGenerated;

  @override
  ConsumerState<_AiTourCopilotSheet> createState() => _AiTourCopilotSheetState();
}

class _AiTourCopilotSheetState extends ConsumerState<_AiTourCopilotSheet> {
  int _modeIndex = 0; // 0: Custom VIP Tour with program, 1: Batch Master Tours
  String _selectedCity = 'istanbul';
  int _selectedDuration = 10;
  bool _generating = false;
  Map<String, dynamic>? _result;

  late final TextEditingController _titleController;
  late final TextEditingController _stopsController;
  late final TextEditingController _paidActivitiesController;
  late final TextEditingController _fullDayPriceController;
  late final TextEditingController _extraHourPriceController;

  @override
  void initState() {
    super.initState();
    _titleController = TextEditingController(text: 'جولة سبانجا والمعشوقية VIP مع التلفريك والدبابات');
    _stopsController = TextEditingController(
      text: 'الانطلاق من الفندق - بحيرة سبانجا وشاطئها - شلالات المعشوقية الساحرة - تلفريك جبل كارتبه - قرية ناتوركوي - مجمع فيابورت مارينا',
    );
    _paidActivitiesController = TextEditingController(
      text: 'تذاكر ركوب تلفريك سبانجا، تأجير دبابات السفاري الجبلية ATV، تجربة الزيبلاين، وجبات الغداء والمشروبات الشخصية',
    );
    _fullDayPriceController = TextEditingController(text: '180');
    _extraHourPriceController = TextEditingController(text: '20');
  }

  @override
  void dispose() {
    _titleController.dispose();
    _stopsController.dispose();
    _paidActivitiesController.dispose();
    _fullDayPriceController.dispose();
    _extraHourPriceController.dispose();
    super.dispose();
  }

  void _applyCityTemplate(String city) {
    setState(() {
      _selectedCity = city;
      if (city == 'trabzon') {
        _titleController.text = 'جولة بحيرة أوزنجول ومرتفعات السلطان مراد VIP';
        _stopsController.text = 'الانطلاق من الفندق - مصنع الشاي الطبيعي - بحيرة أوزنجول الخلابة - مرتفعات السلطان مراد - شلالات أوزنجول - مطل كوم كافيه';
        _paidActivitiesController.text = 'تذاكر دخول المزارات الخاصة، ألعاب الملاهي والزيبلاين في أوزنجول، وجبة الغداء والمشروبات';
      } else if (city == 'antalya') {
        _titleController.text = 'جولة شلالات دودان وتلفريك أوليمبوس كيمير VIP';
        _stopsController.text = 'الانطلاق من الفندق - شلالات دودان السفلى والعليا - المدينة القديمة كاليتشي - تلفريك أوليمبوس - شاطئ كونيالتي';
        _paidActivitiesController.text = 'تذاكر تلفريك أوليمبوس، جولة القارب بالمدينة القديمة، وجبة الغداء بالمطعم البحري';
      } else if (city == 'cappadocia') {
        _titleController.text = 'جولة معالم كابادوكيا والمناطيد والوادي الأحمر VIP';
        _stopsController.text = 'مشاهدة إقلاع المناطيد عند الفجر - وادي الرهبان باساباغ - متحف غوريم المفتوح - قلعة أوتش حصار - مدينة تحت الأرض';
        _paidActivitiesController.text = 'تذاكر ركوب المنطاد الهوائي، رسوم دخول المتاحف والمدن تحت الأرض، وجبات الطعام';
      } else if (city == 'aegean') {
        _titleController.text = 'جولة شواطئ وخليج فتحية وأولودينيز VIP';
        _stopsController.text = 'الانطلاق - شاطئ أولودينيز والبحيرة الزرقاء - وادي الفراشات - وادي ساكليكنت - مارينا فتحية';
        _paidActivitiesController.text = 'تذاكر البارشوت (القفز المظلي)، قوارب وادي الفراشات، تذاكر دخول ساكليكنت، وجبات الغداء';
      } else if (city == 'southeast') {
        _titleController.text = 'جولة ماردين القديمة ودير الزعفران ودارا التاريخية VIP';
        _stopsController.text = 'أزقة ماردين الحجرية العتيقة - دير الزعفران السرياني - مدينة دارا الأثرية الرومانية - مدرسة القاسمية';
        _paidActivitiesController.text = 'تذاكر دخول الأماكن الأثرية والأديرة التاريخية، الغداء في المطاعم الماردينية الشعبية';
      } else {
        _titleController.text = 'جولة سبانجا والمعشوقية VIP مع التلفريك والدبابات';
        _stopsController.text = 'الانطلاق من الفندق - بحيرة سبانجا وشاطئها - شلالات المعشوقية الساحرة - تلفريك جبل كارتبه - قرية ناتوركوي - مجمع فيابورت مارينا';
        _paidActivitiesController.text = 'تذاكر ركوب تلفريك سبانجا، تأجير دبابات السفاري الجبلية ATV، تجربة الزيبلاين، وجبات الغداء والمشروبات الشخصية';
      }
    });
  }

  String _thinkingStep = '';

  Future<void> _submitTours() async {
    final supplierId = ref.read(driverSessionProvider).supplierId ?? 'sup-lonaliza-official';
    final fullPrice = double.tryParse(_fullDayPriceController.text.trim()) ?? 180.0;
    final extraPrice = double.tryParse(_extraHourPriceController.text.trim()) ?? 20.0;

    setState(() {
      _generating = true;
      _thinkingStep = '🤖 جاري تحليل الوجهة السياحية والمعالم الجغرافية...';
    });

    try {
      final api = ref.read(driverApiProvider);
      
      final resFuture = api.generateAiTours(
        supplierId,
        city: _selectedCity,
        baseFullDayPrice: fullPrice,
        extraHourPrice: extraPrice,
        title: _modeIndex == 0 ? _titleController.text.trim() : null,
        stopsDetails: _modeIndex == 0 ? _stopsController.text.trim() : null,
        paidActivities: _modeIndex == 0 ? _paidActivitiesController.text.trim() : null,
        durationHours: _modeIndex == 0 ? _selectedDuration : 10,
        isCustomTour: _modeIndex == 0,
        tourCount: 5,
      );

      await Future.delayed(const Duration(milliseconds: 900));
      if (mounted && _generating) {
        setState(() => _thinkingStep = '📍 جاري تخطيط الجدول الزمني للمحطات وتوقيتات التوقف...');
      }

      await Future.delayed(const Duration(milliseconds: 900));
      if (mounted && _generating) {
        setState(() => _thinkingStep = '🎫 جاري تدقيق تصنيف التذاكر والأنشطة المدفوعة للعميل...');
      }

      final res = await resFuture;

      await Future.delayed(const Duration(milliseconds: 500));
      if (mounted && _generating) {
        setState(() => _thinkingStep = '✅ تم اعتماد برنامج الجولة بنجاح!');
      }

      if (!mounted) return;
      setState(() {
        _result = res;
        _generating = false;
        _thinkingStep = '';
      });
      widget.onToursGenerated();
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _generating = false;
        _thinkingStep = '';
      });
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('خطأ: $e')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.92,
      ),
      padding: EdgeInsets.fromLTRB(18, 14, 18, MediaQuery.of(context).viewInsets.bottom + 18),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SafeArea(
        top: false,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 38,
                  height: 4,
                  decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2)),
                ),
              ),
              const SizedBox(height: 12),

              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.gold.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.auto_awesome_rounded, color: AppColors.goldDark, size: 22),
                  ),
                  const SizedBox(width: 10),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('صانع ومولد برامج الجولات السياحية VIP بالذكاء الاصطناعي',
                            style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                        Text('تصميم برامج يوم كامل مع خط السير والمحطات وتفاصيل الأنشطة المدفوعة',
                            style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
                      ],
                    ),
                  ),
                ],
              ),
              const Divider(height: 20),

              if (_result != null) ...[
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEF3C7),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFFDE68A)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.check_circle_rounded, color: Color(0xFFB45309), size: 22),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              _result!['message'] ?? 'تم إنشاء واعتماد الجولة السياحية بنجاح!',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF78350F)),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'أصبحت الجولة متاحة الآن في المتجر وحسابك كشريك، مع جدول المحطات والأنشطة المدفوعة للعميل.',
                        style: TextStyle(fontSize: 11.5, color: Color(0xFF92400E)),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: () => Navigator.pop(context),
                    style: FilledButton.styleFrom(backgroundColor: AppColors.purple),
                    child: const Text('تم وعرض الجولات'),
                  ),
                ),
              ] else ...[
                // Mode Selector Toggle
                Container(
                  padding: const EdgeInsets.all(3),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: InkWell(
                          onTap: () => setState(() => _modeIndex = 0),
                          borderRadius: BorderRadius.circular(10),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            decoration: BoxDecoration(
                              color: _modeIndex == 0 ? Colors.white : Colors.transparent,
                              borderRadius: BorderRadius.circular(10),
                              boxShadow: _modeIndex == 0
                                  ? [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 4, offset: const Offset(0, 1))]
                                  : null,
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              '✨ جولة مخصصة ببرنامج كامل',
                              style: TextStyle(
                                fontSize: 11.5,
                                fontWeight: _modeIndex == 0 ? FontWeight.bold : FontWeight.w500,
                                color: _modeIndex == 0 ? const Color(0xFF92400E) : const Color(0xFF64748B),
                              ),
                            ),
                          ),
                        ),
                      ),
                      Expanded(
                        child: InkWell(
                          onTap: () => setState(() => _modeIndex = 1),
                          borderRadius: BorderRadius.circular(10),
                          child: Container(
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            decoration: BoxDecoration(
                              color: _modeIndex == 1 ? Colors.white : Colors.transparent,
                              borderRadius: BorderRadius.circular(10),
                              boxShadow: _modeIndex == 1
                                  ? [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 4, offset: const Offset(0, 1))]
                                  : null,
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              '⚡ حزمة جولات شاملة للمدينة',
                              style: TextStyle(
                                fontSize: 11.5,
                                fontWeight: _modeIndex == 1 ? FontWeight.bold : FontWeight.w500,
                                color: _modeIndex == 1 ? AppColors.purple : const Color(0xFF64748B),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 14),

                // City Chips
                const Text('المنطقة أو المدينة:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                const SizedBox(height: 6),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: [
                    _buildCityChip('istanbul', 'إسطنبول ومرمرة 🕌'),
                    _buildCityChip('trabzon', 'طرابزون والشمال 🌲'),
                    _buildCityChip('antalya', 'أنطاليا والريفيرا 🏖️'),
                    _buildCityChip('cappadocia', 'كابادوكيا والمناطيد 🎈'),
                    _buildCityChip('aegean', 'فتحية وبودروم ⛵'),
                    _buildCityChip('southeast', 'ماردين والجنوب 🏛️'),
                  ],
                ),
                const SizedBox(height: 12),

                if (_modeIndex == 0) ...[
                  // Tour Title
                  const Text('عنوان واسم الجولة VIP:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                  const SizedBox(height: 4),
                  TextField(
                    controller: _titleController,
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                    decoration: InputDecoration(
                      hintText: 'مثال: جولة سبانجا والمعشوقية VIP مع التلفريك والدبابات',
                      prefixIcon: const Icon(Icons.tour_rounded, color: Color(0xFFB45309), size: 18),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Duration Options
                  const Text('مدة الجولة:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      _buildDurationChip(8, '8 ساعات (نصف يوم ممتد)'),
                      const SizedBox(width: 8),
                      _buildDurationChip(10, '10 ساعات (اليوم الكامل VIP)'),
                      const SizedBox(width: 8),
                      _buildDurationChip(12, '12 ساعة (يوم شامل)'),
                    ],
                  ),
                  const SizedBox(height: 10),

                  // Stops / Itinerary input
                  const Text('محطات وخط سير الجولة (الأماكن التي ستزورها السيارة):',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                  const SizedBox(height: 4),
                  TextField(
                    controller: _stopsController,
                    maxLines: 2,
                    style: const TextStyle(fontSize: 12),
                    decoration: InputDecoration(
                      hintText: 'مثال: الانطلاق من الفندق - شاطئ بحيرة سبانجا - شلالات معشوقية - قمة كارتبه - مول فيابورت',
                      helperText: 'اكتب المحطات مفصولة بشرطة (-) وسيرتبها الذكاء الاصطناعي في جدول زمني أنيق.',
                      helperStyle: const TextStyle(fontSize: 10.5, color: AppColors.textMuted),
                      prefixIcon: const Icon(Icons.alt_route_rounded, color: AppColors.purple, size: 18),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Paid activities disclaimer input
                  Row(
                    children: [
                      const Text('الأنشطة الإضافية والتذاكر المدفوعة للعميل:',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Color(0xFF92400E))),
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(color: const Color(0xFFFEF3C7), borderRadius: BorderRadius.circular(4)),
                        child: const Text('غير مشمولة في السيارة', style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: Color(0xFFB45309))),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  TextField(
                    controller: _paidActivitiesController,
                    maxLines: 2,
                    style: const TextStyle(fontSize: 12),
                    decoration: InputDecoration(
                      hintText: 'مثال: تذاكر تلفريك سبانجا، تأجير دبابات ATV سفاري، تجربة الزيبلاين، وجبات الغداء والمشروبات الشخصية',
                      helperText: 'تُعرض للعميل كأنشطة اختيارية يدفعها بنفسه في الموقع تجنباً لأي خلاف مالي.',
                      helperStyle: const TextStyle(fontSize: 10.5, color: Color(0xFF92400E)),
                      prefixIcon: const Icon(Icons.receipt_long_rounded, color: Color(0xFFB45309), size: 18),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                  const SizedBox(height: 12),
                ],

                // Price Inputs
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('أجرة اليوم الكامل (\$ USD):', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          TextField(
                            controller: _fullDayPriceController,
                            keyboardType: TextInputType.number,
                            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                            decoration: InputDecoration(
                              prefixText: '\$ ',
                              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('الساعة الإضافية (\$ USD):', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 4),
                          TextField(
                            controller: _extraHourPriceController,
                            keyboardType: TextInputType.number,
                            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                            decoration: InputDecoration(
                              prefixText: '\$ ',
                              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                if (_generating) ...[
                  Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF3C7),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFFDE68A)),
                    ),
                    child: Row(
                      children: [
                        const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2.5, color: Color(0xFFB45309)),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            _thinkingStep.isNotEmpty ? _thinkingStep : 'جاري توليد البرنامج السياحي بالذكاء الاصطناعي...',
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF78350F)),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],

                // Submit Button
                SizedBox(
                  width: double.infinity,
                  child: FilledButton.icon(
                    onPressed: _generating ? null : _submitTours,
                    style: FilledButton.styleFrom(
                      backgroundColor: _modeIndex == 0 ? const Color(0xFFB45309) : AppColors.purple,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 13),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    icon: _generating
                        ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : const Icon(Icons.auto_awesome_rounded, size: 18),
                    label: Text(
                      _generating
                          ? 'جاري تصميم واعتماد الجولة بالذكاء الاصطناعي...'
                          : (_modeIndex == 0 ? '✨ توليد برنامج الجولة واعتمادها فوراً' : '⚡ اعتماد حزمة جولات المنطقة بالكامل'),
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCityChip(String cityKey, String label) {
    final isSel = _selectedCity == cityKey;
    return ChoiceChip(
      selected: isSel,
      label: Text(label, style: TextStyle(fontSize: 11, fontWeight: isSel ? FontWeight.bold : FontWeight.normal)),
      selectedColor: const Color(0xFFFEF3C7),
      backgroundColor: const Color(0xFFF8FAFC),
      onSelected: (_) => _applyCityTemplate(cityKey),
    );
  }

  Widget _buildDurationChip(int hours, String label) {
    final isSel = _selectedDuration == hours;
    return Expanded(
      child: InkWell(
        onTap: () => setState(() => _selectedDuration = hours),
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 6),
          decoration: BoxDecoration(
            color: isSel ? const Color(0xFFFEF3C7) : const Color(0xFFF1F5F9),
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: isSel ? const Color(0xFFB45309) : const Color(0xFFE2E8F0)),
          ),
          alignment: Alignment.center,
          child: Text(
            label,
            style: TextStyle(
              fontSize: 10,
              fontWeight: isSel ? FontWeight.bold : FontWeight.normal,
              color: isSel ? const Color(0xFF78350F) : const Color(0xFF475569),
            ),
            textAlign: TextAlign.center,
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MANUAL ROUTE CREATION BOTTOM SHEET
// ─────────────────────────────────────────────────────────────────────────────

class _ManualRouteSheet extends ConsumerStatefulWidget {
  const _ManualRouteSheet({required this.onRouteCreated});
  final VoidCallback onRouteCreated;

  @override
  ConsumerState<_ManualRouteSheet> createState() => _ManualRouteSheetState();
}

class _ManualRouteSheetState extends ConsumerState<_ManualRouteSheet> {
  String _selectedCity = 'istanbul';
  String _fromZone = 'zone-ist-airport';
  String _toZone = 'zone-taksim';
  String _vehicleClassId = 'vito_vip';
  bool _isSaving = false;

  final TextEditingController _customFromController = TextEditingController();
  final TextEditingController _customToController = TextEditingController();
  final TextEditingController _priceController = TextEditingController(text: '65');
  final TextEditingController _distanceController = TextEditingController(text: '45');
  final TextEditingController _durationController = TextEditingController(text: '50');

  static const List<Map<String, String>> _manualCities = [
    {'id': 'istanbul', 'name': 'إسطنبول ومرمرة'},
    {'id': 'trabzon', 'name': 'طرابزون والشمال'},
    {'id': 'antalya', 'name': 'أنطاليا والساحل'},
    {'id': 'cappadocia', 'name': 'كابادوكيا'},
    {'id': 'aegean', 'name': 'بودروم وإيجة'},
    {'id': 'southeast', 'name': 'الجنوب والتاريخية'},
  ];

  static const List<Map<String, String>> _allZones = [
    // Istanbul & Marmara
    {'id': 'zone-ist-airport', 'name': 'مطار إسطنبول الدولي (IST)', 'city': 'istanbul'},
    {'id': 'zone-saw-airport', 'name': 'مطار صبيحة كوكجن (SAW)', 'city': 'istanbul'},
    {'id': 'zone-taksim', 'name': 'تقسيم وبي أوغلو', 'city': 'istanbul'},
    {'id': 'zone-sultanahmet', 'name': 'السلطان أحمد والفاتح', 'city': 'istanbul'},
    {'id': 'zone-sisli', 'name': 'شيشلي ومجدية كوي', 'city': 'istanbul'},
    {'id': 'zone-besiktas', 'name': 'بشكتاش وأورتاكوي', 'city': 'istanbul'},
    {'id': 'zone-kadikoy', 'name': 'كاديكوي والجانب الآسيوي', 'city': 'istanbul'},
    {'id': 'zone-basaksehir', 'name': 'باشاك شهير', 'city': 'istanbul'},
    {'id': 'zone-bursa', 'name': 'مدينة بورصة وجبل أولوداغ', 'city': 'istanbul'},
    {'id': 'zone-sapanca', 'name': 'سبانجا والمعشوقية', 'city': 'istanbul'},
    {'id': 'zone-yalova', 'name': 'يالوفا والترمال', 'city': 'istanbul'},

    // Trabzon & Black Sea
    {'id': 'zone-trabzon-apt', 'name': 'مطار طرابزون (TZX)', 'city': 'trabzon'},
    {'id': 'zone-trabzon_center', 'name': 'وسط طرابزون (الميدان)', 'city': 'trabzon'},
    {'id': 'zone-uzungol', 'name': 'بحيرة أوزنجول', 'city': 'trabzon'},
    {'id': 'zone-ayder', 'name': 'هضبة آيدر (ريزا)', 'city': 'trabzon'},
    {'id': 'zone-sumela', 'name': 'دير سوميلا ومتشكا', 'city': 'trabzon'},

    // Antalya & Riviera
    {'id': 'zone-antalya-apt', 'name': 'مطار أنطاليا الدولي (AYT)', 'city': 'antalya'},
    {'id': 'zone-antalya_center', 'name': 'وسط أنطاليا وكاليتشي', 'city': 'antalya'},
    {'id': 'zone-belek', 'name': 'بيليك ومنتجعات الغولف', 'city': 'antalya'},
    {'id': 'zone-kemer', 'name': 'كيمير ومارينا', 'city': 'antalya'},
    {'id': 'zone-side', 'name': 'سيدي ومانافجات', 'city': 'antalya'},
    {'id': 'zone-alanya', 'name': 'ألانيا وقلعة البحر', 'city': 'antalya'},

    // Cappadocia
    {'id': 'zone-nevsehir_airport', 'name': 'مطار نفسهير كابادوكيا (NAV)', 'city': 'cappadocia'},
    {'id': 'zone-kayseri_airport', 'name': 'مطار قيصري (ASR)', 'city': 'cappadocia'},
    {'id': 'zone-goreme', 'name': 'غوريميه ومداخن العفاريت', 'city': 'cappadocia'},
    {'id': 'zone-uchisar', 'name': 'قلعة أوتش حصار', 'city': 'cappadocia'},
    {'id': 'zone-urgup', 'name': 'أورغوب والكهوف الفاخرة', 'city': 'cappadocia'},

    // Aegean
    {'id': 'zone-bodrum_airport', 'name': 'مطار بودروم ميلاس (BJV)', 'city': 'aegean'},
    {'id': 'zone-bodrum_center', 'name': 'وسط بودروم ومارينا', 'city': 'aegean'},
    {'id': 'zone-yalikavak', 'name': 'يالي كافاك ومارينا اليخوت', 'city': 'aegean'},
    {'id': 'zone-dalaman_airport', 'name': 'مطار دالامان الدولي (DLM)', 'city': 'aegean'},
    {'id': 'zone-fethiye_oludeniz', 'name': 'فتحية وشاطئ أولودينيز', 'city': 'aegean'},
    {'id': 'zone-marmaris', 'name': 'مرمريس والخليج الفيروزي', 'city': 'aegean'},

    // Southeast
    {'id': 'zone-mardin_old_city', 'name': 'ماردين القديمة والبيوت الحجرية', 'city': 'southeast'},
    {'id': 'zone-sanliurfa_center', 'name': 'شانلي أورفا وبركة إبراهيم', 'city': 'southeast'},
    {'id': 'zone-gaziantep_center', 'name': 'وسط غازي عنتاب ومتحف الفسيفساء', 'city': 'southeast'},
    {'id': 'zone-diyarbakir_airport', 'name': 'مطار ديار بكر والأسوار (DIY)', 'city': 'southeast'},

    // Custom
    {'id': 'custom', 'name': '✏️ نقطة مخصصة أخرى (كتابة يدوية)', 'city': 'all'},
  ];

  List<Map<String, String>> get _currentZones {
    return _allZones.where((z) => z['city'] == _selectedCity || z['city'] == 'all').toList();
  }

  final List<Map<String, String>> _vehicleClasses = const [
    {'id': 'vito_vip', 'name': 'مرسيدس فيتو VIP (6 مقاعد)'},
    {'id': 'sprinter_vip', 'name': 'مرسيدس سبرينتر VIP (14 راكب)'},
    {'id': 'maybach_s', 'name': 'مرسيدس مايباخ VIP (3 مقاعد فخامة فائقة)'},
  ];

  @override
  void dispose() {
    _customFromController.dispose();
    _customToController.dispose();
    _priceController.dispose();
    _distanceController.dispose();
    _durationController.dispose();
    super.dispose();
  }

  Future<void> _submitRoute() async {
    final supplierId = ref.read(driverSessionProvider).supplierId ?? 'sup-lonaliza-official';
    final from = _fromZone == 'custom' ? _customFromController.text.trim() : _fromZone;
    final to = _toZone == 'custom' ? _customToController.text.trim() : _toZone;
    final price = double.tryParse(_priceController.text.trim());

    if (from.isEmpty || to.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('يرجى تحديد نقطة الانطلاق والوجهة')),
      );
      return;
    }

    if (from == to) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('نقطة الانطلاق والوجهة لا يمكن أن تكونا متطابقتين')),
      );
      return;
    }

    if (price == null || price <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('يرجى إدخال سعر صحيح بالدولار')),
      );
      return;
    }

    setState(() => _isSaving = true);
    try {
      final api = ref.read(driverApiProvider);
      final dist = double.tryParse(_distanceController.text.trim());
      final dur = int.tryParse(_durationController.text.trim());

      final fromObj = _allZones.firstWhere((z) => z['id'] == from, orElse: () => {'name': from});
      final toObj = _allZones.firstWhere((z) => z['id'] == to, orElse: () => {'name': to});
      final fromName = from == 'custom' ? _customFromController.text.trim() : (fromObj['name'] ?? from);
      final toName = to == 'custom' ? _customToController.text.trim() : (toObj['name'] ?? to);

      final res = await api.createManualRoute(
        supplierId,
        fromZoneId: from,
        toZoneId: to,
        fromZoneName: fromName,
        toZoneName: toName,
        city: _selectedCity,
        basePrice: price,
        estimatedDistanceKm: dist,
        estimatedDurationMinutes: dur,
        vehicleClassId: _vehicleClassId,
        currency: 'USD',
      );

      if (!mounted) return;
      setState(() => _isSaving = false);

      final msg = res['message'] ?? 'تم إضافة المسار وتثبيت تسعيركم بنجاح!';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(backgroundColor: AppColors.emerald, content: Text(msg.toString())),
      );

      widget.onRouteCreated();
      Navigator.pop(context);
    } catch (e) {
      if (!mounted) return;
      setState(() => _isSaving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(backgroundColor: AppColors.rose, content: Text('خطأ أثناء حفظ المسار: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final zones = _currentZones;
    return Container(
      padding: EdgeInsets.fromLTRB(20, 16, 20, MediaQuery.of(context).viewInsets.bottom + 20),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SafeArea(
        top: false,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 36,
                  height: 4,
                  decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2)),
                ),
              ),
              const SizedBox(height: 14),

              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.purple.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.add_road_rounded, color: AppColors.purple, size: 22),
                  ),
                  const SizedBox(width: 10),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'إضافة مسار وتوصيلة يدوية',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.textPrimary),
                        ),
                        Text(
                          'حدد نقطة الانطلاق والوجهة وسعرك الخاص لنشره فوراً في المنصة',
                          style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // City Selector
              const Text('المدينة أو المنطقة:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              const SizedBox(height: 6),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _manualCities.map((c) {
                  final isSel = _selectedCity == c['id'];
                  return ChoiceChip(
                    selected: isSel,
                    label: Text(c['name']!, style: TextStyle(fontSize: 11.5, fontWeight: isSel ? FontWeight.bold : FontWeight.normal)),
                    selectedColor: AppColors.purple,
                    labelStyle: TextStyle(color: isSel ? Colors.white : const Color(0xFF334155)),
                    onSelected: (_) {
                      setState(() {
                        _selectedCity = c['id']!;
                        final newZones = _allZones.where((z) => z['city'] == _selectedCity).toList();
                        if (newZones.isNotEmpty) {
                          _fromZone = newZones.first['id']!;
                          _toZone = newZones.length > 1 ? newZones[1]['id']! : newZones.first['id']!;
                        }
                      });
                    },
                  );
                }).toList(),
              ),
              const SizedBox(height: 14),

              // From Zone Dropdown
              const Text('من (نقطة الانطلاق / المطار):', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              const SizedBox(height: 6),
              DropdownButtonFormField<String>(
                value: zones.any((z) => z['id'] == _fromZone) ? _fromZone : (zones.isNotEmpty ? zones.first['id'] : null),
                decoration: InputDecoration(
                  prefixIcon: const Icon(Icons.flight_takeoff_rounded, color: AppColors.purple),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
                items: zones.map((z) => DropdownMenuItem(value: z['id'], child: Text(z['name']!, style: const TextStyle(fontSize: 12.5)))).toList(),
                onChanged: (val) {
                  if (val != null) setState(() => _fromZone = val);
                },
              ),
              if (_fromZone == 'custom') ...[
                const SizedBox(height: 8),
                TextField(
                  controller: _customFromController,
                  decoration: InputDecoration(
                    hintText: 'اكتب اسم نقطة الانطلاق المخصصة...',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  ),
                ),
              ],

              const SizedBox(height: 12),

              // To Zone Dropdown
              const Text('إلى (الوجهة / المنطقة):', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              const SizedBox(height: 6),
              DropdownButtonFormField<String>(
                value: zones.any((z) => z['id'] == _toZone) ? _toZone : (zones.length > 1 ? zones[1]['id'] : (zones.isNotEmpty ? zones.first['id'] : null)),
                decoration: InputDecoration(
                  prefixIcon: const Icon(Icons.location_on_rounded, color: Color(0xFFEF4444)),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
                items: zones.map((z) => DropdownMenuItem(value: z['id'], child: Text(z['name']!, style: const TextStyle(fontSize: 12.5)))).toList(),
                onChanged: (val) {
                  if (val != null) setState(() => _toZone = val);
                },
              ),
              if (_toZone == 'custom') ...[
                const SizedBox(height: 8),
                TextField(
                  controller: _customToController,
                  decoration: InputDecoration(
                    hintText: 'اكتب اسم الوجهة المخصصة...',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  ),
                ),
              ],

              const SizedBox(height: 12),

              // Vehicle Class
              const Text('فئة المركبة:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              const SizedBox(height: 6),
              DropdownButtonFormField<String>(
                value: _vehicleClassId,
                decoration: InputDecoration(
                  prefixIcon: const Icon(Icons.directions_car_rounded, color: AppColors.purple),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
                items: _vehicleClasses.map((v) => DropdownMenuItem(value: v['id'], child: Text(v['name']!, style: const TextStyle(fontSize: 13)))).toList(),
                onChanged: (val) {
                  if (val != null) setState(() => _vehicleClassId = val);
                },
              ),

              const SizedBox(height: 12),

              // Distance & Duration Row
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('المسافة التقديرية (كم):', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                        const SizedBox(height: 6),
                        TextField(
                          controller: _distanceController,
                          keyboardType: TextInputType.number,
                          decoration: InputDecoration(
                            suffixText: 'كم',
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('الوقت التقديري (دقيقة):', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                        const SizedBox(height: 6),
                        TextField(
                          controller: _durationController,
                          keyboardType: TextInputType.number,
                          decoration: InputDecoration(
                            suffixText: 'دقيقة',
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 14),

              // Price (USD)
              const Text('سعر المسار النهائي للعميل (\$ USD):', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.purpleDark)),
              const SizedBox(height: 6),
              TextField(
                controller: _priceController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, fontFamily: 'monospace', color: AppColors.purpleDark),
                decoration: InputDecoration(
                  prefixIcon: const Icon(Icons.monetization_on_rounded, color: AppColors.goldDark),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                  fillColor: const Color(0xFFFAF5FF),
                  filled: true,
                ),
              ),

              const SizedBox(height: 20),

              SizedBox(
                width: double.infinity,
                height: 48,
                child: FilledButton.icon(
                  onPressed: _isSaving ? null : _submitRoute,
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.purple,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  icon: _isSaving
                      ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Icon(Icons.check_circle_rounded, size: 20),
                  label: Text(
                    _isSaving ? 'جاري حفظ ونشر المسار...' : 'حفظ وتفعيل المسار الآن',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MANUAL TOUR CREATION BOTTOM SHEET
// ─────────────────────────────────────────────────────────────────────────────

class _ManualTourSheet extends ConsumerStatefulWidget {
  const _ManualTourSheet({required this.onTourCreated});
  final VoidCallback onTourCreated;

  @override
  ConsumerState<_ManualTourSheet> createState() => _ManualTourSheetState();
}

class _ManualTourSheetState extends ConsumerState<_ManualTourSheet> {
  final TextEditingController _titleArController = TextEditingController();
  final TextEditingController _titleEnController = TextEditingController();
  final TextEditingController _itineraryController = TextEditingController();
  final TextEditingController _priceController = TextEditingController(text: '180');

  String _city = 'sapanca';
  int _durationHours = 10;
  String _vehicleClassId = 'vito_vip';
  bool _isSaving = false;

  final List<Map<String, String>> _cities = const [
    {'id': 'sapanca', 'name': 'سبانجا والمعشوقية'},
    {'id': 'bursa', 'name': 'بورصة والتلفريك'},
    {'id': 'istanbul', 'name': 'إسطنبول والبسفور'},
    {'id': 'trabzon', 'name': 'طرابزون وأوزنجول'},
    {'id': 'antalya', 'name': 'أنطاليا والساحل'},
    {'id': 'cappadocia', 'name': 'كابادوكيا والمناطيد'},
    {'id': 'bodrum', 'name': 'بودروم ومارينا'},
    {'id': 'fethiye', 'name': 'فتحية وأولودينيز'},
    {'id': 'mardin', 'name': 'ماردين والجنوب'},
  ];

  final List<Map<String, String>> _suggestions = const [
    {'ar': 'جولة سبانجا والمعشوقية VIP', 'city': 'sapanca', 'itin': 'بحيرة سبانجا • شلالات المعشوقية • جبل كارتبه • قرية المحمودية', 'price': '160'},
    {'ar': 'جولة بورصة الخضراء والتلفريك', 'city': 'bursa', 'itin': 'الشجرة التاريخية المعمرة • جبل أولوداغ والتلفريك • الجامع الأخضر • مصنع الحلقوم', 'price': '190'},
    {'ar': 'جولة البسفور والجانب الآسيوي VIP', 'city': 'istanbul', 'itin': 'قصر دولمة بهجة • تل العرائس • برج الفتاة • أورتاكوي والبسفور', 'price': '150'},
    {'ar': 'جولة أوزنجول ومرتفعات السلطان مراد', 'city': 'trabzon', 'itin': 'بحيرة أوزنجول • الشلالات الاصطناعية • مطل البحيرة الزجاجي • معمل الشاي', 'price': '180'},
    {'ar': 'جولة كابادوكيا والمداخن والمناطيد', 'city': 'cappadocia', 'itin': 'وادي الرهبان • المداخن الثلاثة • المدينة تحت الأرض • نقطة انطلاق المناطيد', 'price': '220'},
    {'ar': 'جولة بودروم ومارينا اليخوت VIP', 'city': 'bodrum', 'itin': 'قلعة بودروم • مارينا يالي كافاك • طواحين الهواء • شاطئ جومبيت', 'price': '240'},
  ];

  @override
  void dispose() {
    _titleArController.dispose();
    _titleEnController.dispose();
    _itineraryController.dispose();
    _priceController.dispose();
    super.dispose();
  }

  void _applySuggestion(Map<String, String> s) {
    setState(() {
      _titleArController.text = s['ar']!;
      _city = s['city']!;
      _itineraryController.text = s['itin']!;
      _priceController.text = s['price']!;
    });
  }

  Future<void> _submitTour() async {
    final supplierId = ref.read(driverSessionProvider).supplierId ?? 'sup-lonaliza-official';
    final titleAr = _titleArController.text.trim();
    final price = double.tryParse(_priceController.text.trim());

    if (titleAr.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('يرجى إدخال عنوان الجولة السياحية')),
      );
      return;
    }

    if (price == null || price <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('يرجى إدخال سعر صحيح بالدولار')),
      );
      return;
    }

    setState(() => _isSaving = true);
    try {
      final api = ref.read(driverApiProvider);
      final itineraryList = _itineraryController.text
          .split(RegExp(r'[•,\n]'))
          .map((s) => s.trim())
          .where((s) => s.isNotEmpty)
          .toList();

      final res = await api.createManualTour(
        supplierId,
        titleAr: titleAr,
        titleEn: _titleEnController.text.trim().isNotEmpty ? _titleEnController.text.trim() : null,
        destination: _city,
        price: price,
        durationHours: _durationHours,
        itinerary: itineraryList.isNotEmpty ? itineraryList : null,
        vehicleClassId: _vehicleClassId,
        currency: 'USD',
      );

      if (!mounted) return;
      setState(() => _isSaving = false);

      final msg = res['message'] ?? 'تم إضافة الجولة واعتمادها بنجاح!';
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(backgroundColor: AppColors.emerald, content: Text(msg.toString())),
      );

      widget.onTourCreated();
      Navigator.pop(context);
    } catch (e) {
      if (!mounted) return;
      setState(() => _isSaving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(backgroundColor: AppColors.rose, content: Text('خطأ أثناء حفظ الجولة: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(20, 16, 20, MediaQuery.of(context).viewInsets.bottom + 20),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SafeArea(
        top: false,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 36,
                  height: 4,
                  decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2)),
                ),
              ),
              const SizedBox(height: 14),

              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.amber.shade100,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.tour_rounded, color: Color(0xFFB45309), size: 22),
                  ),
                  const SizedBox(width: 10),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'إضافة جولة سياحية VIP يدوية',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.textPrimary),
                        ),
                        Text(
                          'أنشئ برنامج جولة كاملة لشركتك وحدد سعرك لنشره في التطبيق والمتجر',
                          style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // Suggestion chips
              const Text('نماذج جاهزة للاختيار السريع:', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: AppColors.textMuted)),
              const SizedBox(height: 6),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: _suggestions.map((s) {
                    return Padding(
                      padding: const EdgeInsets.only(left: 6),
                      child: ActionChip(
                        label: Text(s['ar']!, style: const TextStyle(fontSize: 11, color: Color(0xFF78350F))),
                        backgroundColor: const Color(0xFFFEF3C7),
                        side: BorderSide(color: Colors.amber.shade300),
                        onPressed: () => _applySuggestion(s),
                      ),
                    );
                  }).toList(),
                ),
              ),
              const SizedBox(height: 14),

              // Title AR
              const Text('عنوان الجولة بالعربية (مطلوب):', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              const SizedBox(height: 6),
              TextField(
                controller: _titleArController,
                textDirection: TextDirection.rtl,
                decoration: InputDecoration(
                  hintText: 'مثال: جولة سبانجا والمعشوقية VIP اليوم الكامل',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
              ),

              const SizedBox(height: 12),

              // Destination ChoiceChips
              const Text('المدينة أو الوجهة المستهدفة:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12.5)),
              const SizedBox(height: 6),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _cities.map((c) {
                  final isSel = _city == c['id'];
                  return ChoiceChip(
                    selected: isSel,
                    label: Text(c['name']!, style: TextStyle(fontSize: 11.5, fontWeight: isSel ? FontWeight.bold : FontWeight.normal)),
                    selectedColor: const Color(0xFFB45309),
                    labelStyle: TextStyle(color: isSel ? Colors.white : const Color(0xFF334155)),
                    onSelected: (_) => setState(() => _city = c['id']!),
                  );
                }).toList(),
              ),

              const SizedBox(height: 14),

              // Duration ChoiceChips
              const Text('مدة الجولة:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12.5)),
              const SizedBox(height: 6),
              Row(
                children: [
                  ChoiceChip(
                    selected: _durationHours == 8,
                    label: const Text('8 ساعات (نصف يوم+)'),
                    selectedColor: const Color(0xFFB45309),
                    labelStyle: TextStyle(color: _durationHours == 8 ? Colors.white : const Color(0xFF334155)),
                    onSelected: (_) => setState(() => _durationHours = 8),
                  ),
                  const SizedBox(width: 8),
                  ChoiceChip(
                    selected: _durationHours == 10,
                    label: const Text('10 ساعات (يوم كامل VIP) ⭐'),
                    selectedColor: const Color(0xFFB45309),
                    labelStyle: TextStyle(color: _durationHours == 10 ? Colors.white : const Color(0xFF334155)),
                    onSelected: (_) => setState(() => _durationHours = 10),
                  ),
                  const SizedBox(width: 8),
                  ChoiceChip(
                    selected: _durationHours == 12,
                    label: const Text('12 ساعة'),
                    selectedColor: const Color(0xFFB45309),
                    labelStyle: TextStyle(color: _durationHours == 12 ? Colors.white : const Color(0xFF334155)),
                    onSelected: (_) => setState(() => _durationHours = 12),
                  ),
                ],
              ),

              const SizedBox(height: 12),

              // Itinerary Highlights
              const Text('أهم محطات الجولة (افصل بينها بنقطة •):', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              const SizedBox(height: 6),
              TextField(
                controller: _itineraryController,
                textDirection: TextDirection.rtl,
                maxLines: 2,
                decoration: InputDecoration(
                  hintText: 'مثال: بحيرة سبانجا • شلالات المعشوقية • جبل كارتبه • قرية المحمودية',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                ),
              ),

              const SizedBox(height: 14),

              // Price (USD)
              const Text('سعر الجولة الإجمالي بالدولار (\$ USD):', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Color(0xFF78350F))),
              const SizedBox(height: 6),
              TextField(
                controller: _priceController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, fontFamily: 'monospace', color: Color(0xFF78350F)),
                decoration: InputDecoration(
                  prefixIcon: const Icon(Icons.monetization_on_rounded, color: Color(0xFFB45309)),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                  fillColor: const Color(0xFFFEF3C7),
                  filled: true,
                ),
              ),

              const SizedBox(height: 20),

              SizedBox(
                width: double.infinity,
                height: 48,
                child: FilledButton.icon(
                  onPressed: _isSaving ? null : _submitTour,
                  style: FilledButton.styleFrom(
                    backgroundColor: const Color(0xFFB45309),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  icon: _isSaving
                      ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Icon(Icons.check_circle_rounded, size: 20),
                  label: Text(
                    _isSaving ? 'جاري حفظ واعتماد الجولة...' : 'حفظ واعتماد الجولة في الكتالوج',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

