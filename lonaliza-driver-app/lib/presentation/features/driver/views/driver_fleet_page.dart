import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/extensions/context_l10n.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../core/utils/catalog_i18n.dart';
import '../../../../data/services/driver_api.dart';
import '../../../providers/driver_session_provider.dart';

class DriverFleetPage extends ConsumerStatefulWidget {
  const DriverFleetPage({super.key});

  @override
  ConsumerState<DriverFleetPage> createState() => _DriverFleetPageState();
}

class _DriverFleetPageState extends ConsumerState<DriverFleetPage> {
  List<dynamic> _fleet = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final supplierId = ref.read(driverSessionProvider).supplierId;
    if (supplierId == null) return;

    setState(() => _loading = true);
    try {
      final list = await ref.read(driverApiProvider).fetchFleet(supplierId);
      if (!mounted) return;
      setState(() {
        _fleet = list;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loading = false);
    }
  }

  double? _readTransferPrice(Map<String, dynamic> vehicle) {
    final pricing = vehicle['catalogPricing'] as Map<String, dynamic>?;
    if (pricing != null) {
      return (pricing['transferBasePrice'] as num?)?.toDouble();
    }
    return (vehicle['customPrice'] as num?)?.toDouble() ??
        (vehicle['basePrice'] as num?)?.toDouble();
  }

  void _openVehiclePricing(Map<String, dynamic> vehicle) {
    // Navigate to comprehensive route pricing with this vehicle filter
    context.push('/route-pricing');
  }

  String _vehicleClassLabel(Map<String, dynamic> v, BuildContext context) {
    final nested = v['vehicleClass'] as Map<String, dynamic>?;
    if (nested != null) {
      return catalogItemTitle(nested, context);
    }
    return v['vehicleClassName'] as String? ??
        v['vehicleClassCode'] as String? ??
        'مركبة VIP';
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppColors.textPrimary),
          onPressed: () => context.pop(),
        ),
        title: Text(
          l10n.fleet,
          style: const TextStyle(
            color: AppColors.textPrimary,
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: AppColors.textPrimary),
            onPressed: _load,
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.gold))
          : _fleet.isEmpty
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 32),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(20),
                          decoration: BoxDecoration(
                            color: AppColors.gold.withValues(alpha: 0.15),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.directions_car_filled_rounded, size: 48, color: AppColors.purpleDark),
                        ),
                        const SizedBox(height: 16),
                        const Text(
                          'أسطولك فارغ حالياً',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          l10n.catalogSub,
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                        ),
                        const SizedBox(height: 20),
                        FilledButton.icon(
                          style: FilledButton.styleFrom(
                            backgroundColor: AppColors.gold,
                            foregroundColor: AppColors.purpleDark,
                            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                          icon: const Icon(Icons.add_rounded),
                          label: Text(l10n.addVehicle, style: const TextStyle(fontWeight: FontWeight.bold)),
                          onPressed: () => context.push('/fleet/add'),
                        ),
                      ],
                    ),
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView.separated(
                    // Generous bottom padding to ensure FAB and phone nav bars NEVER cover cards
                    padding: const EdgeInsets.fromLTRB(16, 16, 16, 120),
                    itemCount: _fleet.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 16),
                    itemBuilder: (context, index) {
                      final v = _fleet[index] as Map<String, dynamic>;
                      return _buildExecutiveVehicleCard(v, context);
                    },
                  ),
                ),
      floatingActionButton: Padding(
        padding: const EdgeInsets.only(bottom: 16),
        child: FloatingActionButton.extended(
          onPressed: () => context.push('/fleet/add'),
          icon: const Icon(Icons.add_rounded),
          label: Text(l10n.addVehicle, style: const TextStyle(fontWeight: FontWeight.bold)),
          backgroundColor: AppColors.gold,
          foregroundColor: AppColors.purpleDark,
          elevation: 4,
        ),
      ),
    );
  }

  Widget _buildExecutiveVehicleCard(Map<String, dynamic> v, BuildContext context) {
    final plate = v['plateNumber'] as String? ?? '34 LONA 01';
    final make = v['make'] as String? ?? 'Mercedes-Benz';
    final model = v['model'] as String? ?? 'Vito VIP';
    final year = v['year'] ?? 2024;
    final vehicleTitle = '$make $model $year';
    final cls = _vehicleClassLabel(v, context);
    final price = _readTransferPrice(v);
    final isActive = v['isActive'] != false;
    final moderation = v['moderationStatus'] as String? ?? 'approved';
    final isApproved = moderation == 'approved' || moderation == 'active';
    final capacity = v['passengerCapacity'] ?? 6;
    final luggage = v['luggageCapacity'] ?? 6;

    // Photos safely extracted from Map or String
    final images = v['ownImages'] as List? ?? v['images'] as List? ?? [];
    String? photoUrl;
    if (v['coverImage'] != null && (v['coverImage'] as String).isNotEmpty) {
      photoUrl = v['coverImage'] as String;
    } else if (images.isNotEmpty) {
      dynamic selected = images.first;
      for (final img in images) {
        if (img is Map && (img['isCover'] == true || img['isCover'] == 'true')) {
          selected = img;
          break;
        }
      }
      if (selected is Map) {
        photoUrl = selected['url']?.toString();
      } else if (selected is String) {
        photoUrl = selected;
      }
    }

    // Amenities
    final amenities = v['amenities'] as List? ?? [
      'واي فاي مجاني',
      'مقاعد مساج VIP',
      'شاشة ترفيه وتلفزيون',
      'ثلاجة وضيافة باردة',
      'سائق يتحدث العربية',
    ];

    var safePhotoUrl = photoUrl;
    if (safePhotoUrl != null && safePhotoUrl.isNotEmpty) {
      if (safePhotoUrl.startsWith('/') && !safePhotoUrl.startsWith('//')) {
        safePhotoUrl = 'https://lonaliza.com$safePhotoUrl';
      }
    }

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: isActive ? AppColors.border : Colors.grey.shade300,
          width: 1,
        ),
        boxShadow: AppTheme.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Top Image + Badges Overlay
          Stack(
            children: [
              ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(21)),
                child: SizedBox(
                  height: 160,
                  width: double.infinity,
                  child: safePhotoUrl != null && safePhotoUrl.isNotEmpty
                      ? Image.network(
                          safePhotoUrl,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => _buildFallbackHero(vehicleTitle, cls),
                        )
                      : _buildFallbackHero(vehicleTitle, cls),
                ),
              ),

              // Gradient shade
              Positioned.fill(
                child: Container(
                  decoration: BoxDecoration(
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(21)),
                    gradient: LinearGradient(
                      colors: [
                        Colors.black.withValues(alpha: 0.6),
                        Colors.transparent,
                        Colors.black.withValues(alpha: 0.7),
                      ],
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                    ),
                  ),
                ),
              ),

              // Top Plate Badge
              Positioned(
                top: 12,
                left: 12,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F172A).withValues(alpha: 0.9),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.gold, width: 1.5),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withValues(alpha: 0.3), blurRadius: 4),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                        decoration: BoxDecoration(color: Colors.blue.shade800, borderRadius: BorderRadius.circular(3)),
                        child: const Text('TR', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        plate,
                        style: const TextStyle(
                          color: Colors.white,
                          fontFamily: 'monospace',
                          fontWeight: FontWeight.w900,
                          fontSize: 12,
                          letterSpacing: 1,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Approval Status Badge
              Positioned(
                top: 12,
                right: 12,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: isApproved
                        ? const Color(0xFF10B981).withValues(alpha: 0.9)
                        : const Color(0xFFF59E0B).withValues(alpha: 0.9),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(isApproved ? Icons.verified_rounded : Icons.hourglass_top_rounded, color: Colors.white, size: 12),
                      const SizedBox(width: 4),
                      Text(
                        isApproved ? 'معتمدة ونشطة VIP' : 'قيد التدقيق والمراجعة',
                        style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              ),

              // Bottom Title inside image
              Positioned(
                bottom: 12,
                right: 14,
                left: 14,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            vehicleTitle,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.w900,
                              shadows: [Shadow(color: Colors.black87, blurRadius: 4)],
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            cls,
                            style: const TextStyle(color: Colors.white70, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                    if (price != null)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.gold,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          '\$$price',
                          style: const TextStyle(
                            color: AppColors.purpleDark,
                            fontWeight: FontWeight.w900,
                            fontSize: 14,
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),

          // Specs Bar: Capacity & Licences
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 0),
            child: Row(
              children: [
                _buildCapsule(Icons.people_rounded, '$capacity ركاب VIP'),
                const SizedBox(width: 8),
                _buildCapsule(Icons.luggage_rounded, '$luggage حقائب'),
                const SizedBox(width: 8),
                _buildCapsule(Icons.shield_rounded, 'ترخيص TÜRSAB / D2'),
              ],
            ),
          ),

          // Amenities Tags
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 10, 14, 0),
            child: Wrap(
              spacing: 6,
              runSpacing: 6,
              children: amenities.take(4).map((am) {
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.background,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.star_rounded, size: 12, color: Color(0xFFD97706)),
                      const SizedBox(width: 4),
                      Text(am.toString(), style: const TextStyle(fontSize: 11, color: AppColors.textPrimary)),
                    ],
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 12),
          const Divider(height: 1),

          // Actions Footer
          Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                // Manage Pricing Button
                Expanded(
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.purple,
                      side: const BorderSide(color: AppColors.purple),
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    icon: const Icon(Icons.price_change_rounded, size: 16),
                    label: const Text('تسعير المسارات والجولات', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                    onPressed: () => _openVehiclePricing(v),
                  ),
                ),
                const SizedBox(width: 8),

                // Edit specs button
                IconButton.filledTonal(
                  style: IconButton.styleFrom(
                    backgroundColor: AppColors.gold.withValues(alpha: 0.15),
                    foregroundColor: AppColors.purpleDark,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  icon: const Icon(Icons.edit_rounded, size: 18),
                  tooltip: 'تعديل المواصفات والصور',
                  onPressed: () => context.push('/fleet/add'),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCapsule(IconData icon, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: AppColors.purple),
          const SizedBox(width: 4),
          Text(text, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
        ],
      ),
    );
  }

  Widget _buildFallbackHero([String? title, String? cls]) {
    final t = '${title ?? ""} ${cls ?? ""}'.toLowerCase();
    String fallbackUrl = 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1200&q=80'; // Mercedes Vito VIP
    if (t.contains('sprinter') || t.contains('سبرينتر') || t.contains('crafter') || t.contains('حافلة')) {
      fallbackUrl = 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1200&q=80'; // Sprinter VIP
    } else if (t.contains('maybach') || t.contains('مايباخ') || t.contains('s-class') || t.contains('s580')) {
      fallbackUrl = 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1200&q=80'; // Maybach Ultra Luxury
    }

    return Image.network(
      fallbackUrl,
      fit: BoxFit.cover,
      errorBuilder: (_, __, ___) => Container(
        color: const Color(0xFF1E1B4B),
        child: const Center(
          child: Icon(Icons.directions_car_filled_rounded, color: AppColors.gold, size: 64),
        ),
      ),
    );
  }
}
