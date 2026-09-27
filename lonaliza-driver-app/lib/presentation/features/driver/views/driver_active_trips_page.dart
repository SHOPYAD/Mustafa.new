import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/theme/app_theme.dart';
import '../../../../data/services/driver_api.dart';
import '../../../providers/driver_session_provider.dart';

class DriverActiveTripsPage extends ConsumerStatefulWidget {
  const DriverActiveTripsPage({super.key});

  @override
  ConsumerState<DriverActiveTripsPage> createState() =>
      _DriverActiveTripsPageState();
}

class _DriverActiveTripsPageState extends ConsumerState<DriverActiveTripsPage> {
  List<dynamic> _bookings = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final supplierId = ref.read(driverSessionProvider).supplierId;
    if (supplierId == null) {
      setState(() => _loading = false);
      return;
    }

    setState(() => _loading = true);
    try {
      final list =
          await ref.read(driverApiProvider).fetchActiveBookings(supplierId);
      if (!mounted) return;
      setState(() {
        _bookings = list;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loading = false);
    }
  }

  Widget _buildPaymentChip(String mode, dynamic total, dynamic remaining) {
    if (mode == 'online_full') {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: AppColors.emeraldMuted,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppColors.emerald.withValues(alpha: 0.3)),
        ),
        child: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.check_circle_rounded, size: 13, color: AppColors.emerald),
            SizedBox(width: 5),
            Text(
              'مدفوع أونلاين بالكامل (لا تحصّل)',
              style: TextStyle(
                color: AppColors.emerald,
                fontSize: 11,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
      );
    } else if (mode == 'deposit_half') {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: AppColors.goldMuted,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppColors.gold.withValues(alpha: 0.3)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.info_outline_rounded, size: 13, color: AppColors.goldDark),
            const SizedBox(width: 5),
            Text(
              'حصّل 50% نقداً: \$$remaining',
              style: const TextStyle(
                color: AppColors.goldDark,
                fontSize: 11,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
      );
    } else {
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: AppColors.blueMuted,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: AppColors.blue.withValues(alpha: 0.3)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.payments_outlined, size: 13, color: AppColors.blue),
            const SizedBox(width: 5),
            Text(
              'دفع نقدي للسائق: \$$total',
              style: const TextStyle(
                color: AppColors.blue,
                fontSize: 11,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('الرحلات المسندة والنشطة VIP'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: _load,
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.purple))
          : _bookings.isEmpty
              ? Center(
                  child: Padding(
                    padding: const EdgeInsets.all(32),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            color: AppColors.purpleMuted,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.directions_car_rounded,
                            size: 40,
                            color: AppColors.purple,
                          ),
                        ),
                        const SizedBox(height: 20),
                        const Text(
                          'لا توجد رحلات نشطة حالياً',
                          style: TextStyle(
                            color: AppColors.textPrimary,
                            fontSize: 17,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'ستظهر هنا الرحلات المسندة إليك تلقائياً بمجرد تأكيد الحجز أو قبول عرض جديد من شاشة العروض.',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: AppColors.textMuted,
                            fontSize: 13,
                            height: 1.4,
                          ),
                        ),
                        const SizedBox(height: 24),
                        FilledButton.icon(
                          onPressed: () => context.push('/offers'),
                          icon: const Icon(Icons.inbox_rounded, size: 18),
                          label: const Text(
                            'استعراض العروض الواردة',
                            style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
                          ),
                          style: FilledButton.styleFrom(
                            backgroundColor: AppColors.purple,
                            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                          ),
                        ),
                      ],
                    ),
                  ),
                )
              : RefreshIndicator(
                  color: AppColors.purple,
                  onRefresh: _load,
                  child: ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: _bookings.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 14),
                    itemBuilder: (context, index) {
                      final b = _bookings[index] as Map<String, dynamic>;
                      final bookingNumber = b['bookingNumber'] as String? ??
                          b['reference'] as String? ??
                          '#${index + 1}';
                      final serviceType =
                          b['serviceType'] as String? ?? 'transfer';
                      final contact = b['contact'] as Map<String, dynamic>? ?? {};
                      final customerName = contact['name'] as String? ?? 'عميل VIP';
                      final customerPhone = contact['phone'] as String? ?? '';

                      // Route / Legs
                      final legs = b['legs'] as List<dynamic>?;
                      String from = '—';
                      String to = '—';
                      if (legs != null && legs.isNotEmpty) {
                        final first = legs[0] as Map<String, dynamic>;
                        from = first['pickupLocation']?.toString() ??
                            first['fromZoneId']?.toString() ??
                            '—';
                        to = first['dropoffLocation']?.toString() ??
                            first['toZoneId']?.toString() ??
                            '—';
                      }

                      // Financials & Payment
                      final fin = b['financials'] as Map<String, dynamic>? ?? {};
                      final total = fin['total'] ?? b['totalPrice'] ?? 0;
                      final driverEarn = fin['driverPayout'] ??
                          fin['supplierPayout'] ??
                          (total is num ? (total * 0.85).round() : total);
                      final paymentMode =
                          b['paymentMode'] as String? ?? 'online_full';
                      final remaining = fin['remainingCash'] ?? (total is num ? (total * 0.5).round() : 0);

                      return Container(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(22),
                          border: Border.all(color: AppColors.border),
                          boxShadow: AppTheme.cardShadow,
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(18),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Top Header Row
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: AppColors.purpleMuted,
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: Text(
                                          serviceType == 'daily_tour' ? 'جولة سياحية VIP' : 'نقل خاص VIP',
                                          style: const TextStyle(
                                            color: AppColors.purple,
                                            fontSize: 11,
                                            fontWeight: FontWeight.w800,
                                          ),
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Text(
                                        bookingNumber,
                                        style: const TextStyle(
                                          fontWeight: FontWeight.w800,
                                          fontSize: 13,
                                          color: AppColors.textSecondary,
                                        ),
                                      ),
                                    ],
                                  ),
                                  Text(
                                    '\$$driverEarn',
                                    style: const TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.w900,
                                      color: AppColors.emerald,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 14),

                              // Customer Details
                              Row(
                                children: [
                                  Container(
                                    width: 36,
                                    height: 36,
                                    decoration: BoxDecoration(
                                      color: AppColors.surfaceLight,
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(Icons.person_rounded, size: 20, color: AppColors.textSecondary),
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          customerName,
                                          style: const TextStyle(
                                            fontWeight: FontWeight.w800,
                                            fontSize: 14,
                                            color: AppColors.textPrimary,
                                          ),
                                        ),
                                        if (customerPhone.isNotEmpty)
                                          Text(
                                            customerPhone,
                                            style: const TextStyle(
                                              fontSize: 12,
                                              color: AppColors.textMuted,
                                            ),
                                          ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 14),

                              // Route Box
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: AppColors.surfaceLight,
                                  borderRadius: BorderRadius.circular(14),
                                ),
                                child: Column(
                                  children: [
                                    Row(
                                      children: [
                                        const Icon(Icons.trip_origin_rounded, color: AppColors.purple, size: 16),
                                        const SizedBox(width: 8),
                                        Expanded(
                                          child: Text(
                                            from,
                                            style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                                          ),
                                        ),
                                      ],
                                    ),
                                    const Padding(
                                      padding: EdgeInsets.only(right: 7),
                                      child: Align(
                                        alignment: Alignment.centerRight,
                                        child: SizedBox(
                                          height: 14,
                                          child: VerticalDivider(color: AppColors.border, thickness: 1.5),
                                        ),
                                      ),
                                    ),
                                    Row(
                                      children: [
                                        const Icon(Icons.location_on_rounded, color: AppColors.rose, size: 16),
                                        const SizedBox(width: 8),
                                        Expanded(
                                          child: Text(
                                            to,
                                            style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 12),

                              // Payment Chip
                              _buildPaymentChip(paymentMode, total, remaining),

                              const SizedBox(height: 12),

                              // Quick Flight Radar & Welcome Sign Action Row
                              Builder(
                                builder: (context) {
                                  final flightNo = b['flightNumber']?.toString() ??
                                      b['flightNo']?.toString() ??
                                      'TK1984';
                                  return Row(
                                    children: [
                                      Expanded(
                                        child: FilledButton.icon(
                                          onPressed: () {
                                            final name = customerName;
                                            final dest = to;
                                            context.push(
                                              '/flight-radar?flightNumber=${Uri.encodeComponent(flightNo)}&passengerName=${Uri.encodeComponent(name)}&destination=${Uri.encodeComponent(dest)}',
                                            );
                                          },
                                          icon: const Icon(Icons.radar_rounded, size: 15, color: Color(0xFFFBBF24)),
                                          label: Text(
                                            'تعقب الرحلة ($flightNo)',
                                            style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w800, color: Colors.white),
                                          ),
                                      style: FilledButton.styleFrom(
                                        backgroundColor: const Color(0xFF581C87),
                                        foregroundColor: Colors.white,
                                        padding: const EdgeInsets.symmetric(vertical: 8),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: OutlinedButton.icon(
                                      onPressed: () {
                                        final name = customerName;
                                        final flight = b['flightNumber']?.toString() ?? '';
                                        final dest = to;
                                        context.push(
                                          '/welcome-sign?passengerName=${Uri.encodeComponent(name)}&flightNumber=${Uri.encodeComponent(flight)}&destination=${Uri.encodeComponent(dest)}',
                                        );
                                      },
                                      icon: const Icon(Icons.badge_outlined, size: 15, color: AppColors.goldDark),
                                      label: const Text(
                                        'لوحة الاستقبال VIP',
                                        style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700, color: AppColors.goldDark),
                                      ),
                                      style: OutlinedButton.styleFrom(
                                        side: const BorderSide(color: Color(0xFFFDE68A)),
                                        padding: const EdgeInsets.symmetric(vertical: 8),
                                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                      ),
                                    ),
                                  ),
                                ],
                              );
                            },
                          ),

                              const SizedBox(height: 12),
                              const Divider(height: 1),
                              const SizedBox(height: 12),

                              // Execution Action Button
                              SizedBox(
                                width: double.infinity,
                                height: 44,
                                child: FilledButton.icon(
                                  onPressed: () {
                                    final id = b['id']?.toString() ?? b['_id']?.toString();
                                    context.push('/trip?serviceType=$serviceType&bookingId=$id');
                                  },
                                  icon: const Icon(Icons.navigation_rounded, size: 18),
                                  label: const Text(
                                    'بدء وتتبع تنفيذ الرحلة',
                                    style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13),
                                  ),
                                  style: FilledButton.styleFrom(
                                    backgroundColor: AppColors.purple,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
