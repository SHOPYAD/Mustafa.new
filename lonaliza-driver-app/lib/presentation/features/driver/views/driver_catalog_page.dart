import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/extensions/context_l10n.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/utils/catalog_i18n.dart';
import '../../../../data/services/driver_api.dart';
import '../../../../data/services/driver_catalog_cache.dart';
import '../../../providers/driver_session_provider.dart';

class DriverCatalogPage extends ConsumerStatefulWidget {
  const DriverCatalogPage({super.key});

  @override
  ConsumerState<DriverCatalogPage> createState() => _DriverCatalogPageState();
}

class _DriverCatalogPageState extends ConsumerState<DriverCatalogPage>
    with SingleTickerProviderStateMixin {
  late final TabController _tabs;
  Map<String, dynamic>? _catalog;
  List<dynamic> _routes = [];
  bool _loading = true;
  bool _fromCache = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 3, vsync: this);
    _load();
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    final cache = ref.read(driverCatalogCacheProvider);
    final cached = cache.readIfFresh();
    if (cached != null && mounted) {
      setState(() {
        _catalog = cached;
        _fromCache = true;
        _loading = false;
      });
    } else {
      setState(() {
        _loading = true;
        _error = null;
      });
    }

    try {
      final api = ref.read(driverApiProvider);
      final supplierId = ref.read(driverSessionProvider).supplierId;
      final catalog = supplierId != null
          ? await api.fetchEnrichedCatalog(supplierId: supplierId)
          : await api.fetchCatalog();
      final routes = await api.fetchRoutes();
      await cache.save(catalog);
      if (!mounted) return;
      setState(() {
        _catalog = catalog;
        _routes = routes;
        _loading = false;
        _fromCache = false;
        _error = null;
      });
    } catch (e) {
      if (!mounted) return;
      if (_catalog != null) {
        setState(() {
          _fromCache = true;
          _loading = false;
        });
        return;
      }
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  Future<void> _addVehicleClassToFleet(Map<String, dynamic> item) async {
    final supplierId = ref.read(driverSessionProvider).supplierId;
    if (supplierId == null) return;

    final classId = item['_id']?.toString() ?? item['id']?.toString();
    if (classId == null || classId.isEmpty) return;

    final plateController = TextEditingController();
    final l10n = context.l10n;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.purpleMuted,
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.directions_car_rounded, color: AppColors.purple),
            ),
            const SizedBox(width: 10),
            Text(l10n.addToFleet, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${catalogItemTitle(item, context)} (${item['code'] ?? ''})',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.textPrimary),
            ),
            const SizedBox(height: 14),
            TextField(
              controller: plateController,
              textCapitalization: TextCapitalization.characters,
              decoration: InputDecoration(
                labelText: l10n.plateNumber,
                hintText: '34 VIP 123',
                prefixIcon: const Icon(Icons.badge_outlined, color: AppColors.purple),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('إلغاء', style: TextStyle(color: AppColors.textMuted)),
          ),
          FilledButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            style: FilledButton.styleFrom(backgroundColor: AppColors.purple),
            child: const Text('إضافة', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      final plate = plateController.text.trim();
      if (plate.isEmpty) return;
      try {
        await ref.read(driverApiProvider).addFleetVehicle(supplierId, {
          'vehicleClassId': classId,
          'plateNumber': plate,
        });
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            backgroundColor: AppColors.emerald,
            content: Text('تمت إضافة المركبة إلى أسطولك بنجاح!'),
          ),
        );
        _load();
      } catch (e) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString())),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final vehicleClasses =
        (_catalog?['vehicleClasses'] as List?)?.cast<Map<String, dynamic>>() ??
            [];
    final tours =
        (_catalog?['tours'] as List?)?.cast<Map<String, dynamic>>() ?? [];

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(l10n.catalog),
        bottom: TabBar(
          controller: _tabs,
          tabs: [
            Tab(text: l10n.vehiclesTab),
            Tab(text: l10n.transfersTab),
            Tab(text: l10n.toursTab),
          ],
        ),
      ),
      body: _loading && _catalog == null
          ? const Center(child: CircularProgressIndicator(color: AppColors.purple))
          : _error != null && _catalog == null
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 64,
                          height: 64,
                          decoration: BoxDecoration(
                            color: AppColors.errorMuted,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.cloud_off_rounded, color: AppColors.error, size: 32),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'تعذر الاتصال بالخادم لتحميل الدليل',
                          style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: AppColors.textPrimary),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'جاري ربط واسترداد بيانات أسطول لوناليزا والمسارات المعتمدة.',
                          textAlign: TextAlign.center,
                          style: const TextStyle(fontSize: 13, color: AppColors.textMuted),
                        ),
                        const SizedBox(height: 20),
                        FilledButton.icon(
                          onPressed: _load,
                          icon: const Icon(Icons.refresh_rounded),
                          label: Text(l10n.retry),
                          style: FilledButton.styleFrom(
                            backgroundColor: AppColors.purple,
                            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                          ),
                        ),
                      ],
                    ),
                  ),
                )
              : Column(
                  children: [
                    if (_fromCache)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        color: AppColors.amber.withValues(alpha: 0.1),
                        child: Row(
                          children: [
                            const Icon(Icons.offline_bolt_rounded, color: AppColors.amber, size: 18),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                l10n.offlineCatalogCache,
                                style: const TextStyle(fontSize: 12, color: AppColors.goldDark, fontWeight: FontWeight.w600),
                              ),
                            ),
                            TextButton(
                              onPressed: _load,
                              child: Text(l10n.retry, style: const TextStyle(color: AppColors.purple)),
                            ),
                          ],
                        ),
                      ),
                    Expanded(
                      child: TabBarView(
                        controller: _tabs,
                        children: [
                          _VehicleClassList(
                            items: vehicleClasses,
                            onAdd: _addVehicleClassToFleet,
                          ),
                          _RouteList(routes: _routes),
                          _TourList(
                            items: tours,
                            onInfo: (_) {},
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
      floatingActionButton: Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: FloatingActionButton(
          onPressed: () => context.push('/fleet/add'),
          backgroundColor: AppColors.purple,
          foregroundColor: Colors.white,
          elevation: 4,
          tooltip: 'إضافة سيارة بالذكاء الاصطناعي',
          child: Stack(
            alignment: Alignment.center,
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.gold.withValues(alpha: 0.25),
                ),
              ),
              const Icon(Icons.auto_awesome_rounded, color: AppColors.gold, size: 24),
            ],
          ),
        ),
      ),
    );
  }
}

class _VehicleClassList extends StatelessWidget {
  const _VehicleClassList({required this.items, required this.onAdd});

  final List<Map<String, dynamic>> items;
  final Future<void> Function(Map<String, dynamic>) onAdd;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    if (items.isEmpty) {
      return Center(
        child: Text(l10n.errorNotFound,
            style: const TextStyle(color: AppColors.textMuted)),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 120),
      itemCount: items.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        final item = items[index];
        final name = catalogItemTitle(item, context);
        final subtitle = catalogItemDescription(item, context);
        final inFleet = item['inFleet'] == true;
        final capacity = item['capacity'] is Map ? item['capacity'] as Map : null;
        final passengers = capacity?['passengers'] ?? 6;
        final luggage = capacity?['luggageLarge'] ?? 6;
        final images = item['images'] is List ? item['images'] as List : [];
        final coverImage = images.isNotEmpty ? (images[0] is Map ? images[0]['url'] : images[0])?.toString() : null;

        final code = (item['code'] ?? '').toString().toLowerCase();
        final tier = (item['tier'] ?? 'vip').toString().toLowerCase();
        final safeImageUrl = _normalizeCatalogImageUrl(coverImage, code: code, tier: tier);

        return Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: inFleet ? AppColors.emerald.withValues(alpha: 0.5) : Colors.grey.shade200,
              width: inFleet ? 1.8 : 1,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.04),
                blurRadius: 10,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          clipBehavior: Clip.antiAlias,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Executive Vehicle Banner Photo (Height 150px)
              Stack(
                children: [
                  SizedBox(
                    height: 150,
                    width: double.infinity,
                    child: Image.network(
                      safeImageUrl,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Image.network(
                        _getCuratedFallbackImage(code, tier),
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),

                  // Elegant gradient overlay for text readability
                  Positioned.fill(
                    child: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            Colors.black.withValues(alpha: 0.5),
                            Colors.transparent,
                            Colors.black.withValues(alpha: 0.6),
                          ],
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                        ),
                      ),
                    ),
                  ),

                  // Top Status Chips: Tier & Fleet status
                  Positioned(
                    top: 10,
                    right: 12,
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (inFleet)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0xFF059669),
                              borderRadius: BorderRadius.circular(20),
                              boxShadow: [
                                BoxShadow(color: Colors.black.withValues(alpha: 0.2), blurRadius: 4),
                              ],
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.check_circle_rounded, color: Colors.white, size: 13),
                                SizedBox(width: 4),
                                Text(
                                  'مضافة بأسطولك',
                                  style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.white),
                                ),
                              ],
                            ),
                          )
                        else
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: Colors.black.withValues(alpha: 0.6),
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                            ),
                            child: Text(
                              tier.toUpperCase(),
                              style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: AppColors.gold, letterSpacing: 0.5),
                            ),
                          ),
                      ],
                    ),
                  ),

                  // Rating Badge (Top Left)
                  Positioned(
                    top: 10,
                    left: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.6),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.star_rounded, color: AppColors.gold, size: 14),
                          SizedBox(width: 3),
                          Text('4.98', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),

              // 2. Card Body Details
              Padding(
                padding: const EdgeInsets.all(14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      name,
                      style: const TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 15,
                        color: AppColors.textPrimary,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      subtitle.isNotEmpty ? subtitle : (item['code']?.toString() ?? ''),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.3),
                    ),
                    const SizedBox(height: 12),
                    const Divider(height: 1),
                    const SizedBox(height: 10),

                    // Specs & Action Row
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppColors.surfaceLight,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.person_outline, size: 14, color: AppColors.textSecondary),
                                  const SizedBox(width: 4),
                                  Text('$passengers ركاب', style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                                ],
                              ),
                            ),
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppColors.surfaceLight,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.luggage_outlined, size: 14, color: AppColors.textSecondary),
                                  const SizedBox(width: 4),
                                  Text('$luggage حقائب', style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
                                ],
                              ),
                            ),
                          ],
                        ),
                        if (!inFleet)
                          FilledButton.icon(
                            onPressed: () => onAdd(item),
                            icon: const Icon(Icons.add_rounded, size: 16),
                            label: Text(l10n.addToFleet, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800)),
                            style: FilledButton.styleFrom(
                              backgroundColor: AppColors.purple,
                              foregroundColor: Colors.white,
                              minimumSize: const Size(80, 36),
                              padding: const EdgeInsets.symmetric(horizontal: 12),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _RouteList extends StatelessWidget {
  const _RouteList({required this.routes});

  final List<dynamic> routes;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    if (routes.isEmpty) {
      return Center(
        child: Text(l10n.errorNotFound,
            style: const TextStyle(color: AppColors.textMuted)),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 120),
      itemCount: routes.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (context, index) {
        final rawRoute = routes[index];
        final route = rawRoute is Map ? Map<String, dynamic>.from(rawRoute) : <String, dynamic>{};
        final label = catalogRouteLabel(route, context);

        return Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: AppColors.border),
            boxShadow: AppTheme.cardShadow,
          ),
          child: ListTile(
            leading: Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: AppColors.purpleMuted,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.alt_route_rounded, color: AppColors.purple, size: 22),
            ),
            title: Text(
              label,
              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: AppColors.textPrimary),
            ),
            subtitle: Text(
              l10n.routePricingHint,
              style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
            ),
            trailing: IconButton(
              icon: const Icon(Icons.arrow_forward_ios_rounded, size: 16, color: AppColors.textHint),
              onPressed: () => context.push('/route-pricing'),
            ),
          ),
        );
      },
    );
  }
}

class _TourList extends StatelessWidget {
  const _TourList({required this.items, required this.onInfo});

  final List<Map<String, dynamic>> items;
  final void Function(Map<String, dynamic>) onInfo;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    if (items.isEmpty) {
      return Center(
        child: Text(l10n.errorNotFound,
            style: const TextStyle(color: AppColors.textMuted)),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: items.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (context, index) {
        final item = items[index];
        final name = catalogItemTitle(item, context);
        final city = item['hubCity'] ?? '';

        return Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: AppColors.border),
            boxShadow: AppTheme.cardShadow,
          ),
          child: ListTile(
            leading: Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: AppColors.amber.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.tour_rounded, color: AppColors.goldDark, size: 22),
            ),
            title: Text(
              name,
              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 14, color: AppColors.textPrimary),
            ),
            subtitle: Text(
              city.isNotEmpty ? 'المدينة: $city' : 'جولة سياحية معتمدة',
              style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
            ),
            trailing: IconButton(
              icon: const Icon(Icons.arrow_forward_ios_rounded, size: 16, color: AppColors.textHint),
              onPressed: () => context.push('/tour-offers'),
            ),
          ),
        );
      },
    );
  }
}

String _normalizeCatalogImageUrl(dynamic rawUrl, {String? code, String? tier}) {
  if (rawUrl != null && rawUrl is String && rawUrl.trim().isNotEmpty) {
    var u = rawUrl.trim();
    if (u.startsWith('/') && !u.startsWith('//')) {
      return 'https://lonaliza.com$u';
    }
    if (u.startsWith('http://') || u.startsWith('https://')) {
      return u;
    }
  }
  return _getCuratedFallbackImage(code, tier);
}

String _getCuratedFallbackImage(String? code, String? tier) {
  final c = (code ?? '').toLowerCase();
  final t = (tier ?? '').toLowerCase();

  if (t == 'group' || c.contains('sprinter') || c.contains('crafter') || c.contains('bus')) {
    return 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&q=80';
  }
  if (t == 'maybach' || c.contains('maybach') || c.contains('s_class')) {
    return 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1200&q=80';
  }
  if (t == 'suv' || c.contains('escalade') || c.contains('prado') || c.contains('suv')) {
    return 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&q=80';
  }
  if (c.contains('ford') || c.contains('tourneo') || c.contains('transit')) {
    return 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1200&q=80';
  }
  if (c.contains('hyundai') || c.contains('staria')) {
    return 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&q=80';
  }
  // Default: Mercedes-Benz Vito VIP Luxury Chauffeur
  return 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1200&q=80';
}
