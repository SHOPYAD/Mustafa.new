import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import '../../../../core/extensions/context_l10n.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../data/services/driver_api.dart';
import '../../../../data/services/driver_booking_reminder_service.dart';
import '../../../providers/driver_session_provider.dart';

class DriverDashboardPage extends ConsumerStatefulWidget {
  const DriverDashboardPage({super.key});

  @override
  ConsumerState<DriverDashboardPage> createState() =>
      _DriverDashboardPageState();
}

class _DriverDashboardPageState extends ConsumerState<DriverDashboardPage> {
  Map<String, dynamic>? _analytics;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _refresh());
  }

  Future<void> _refresh() async {
    final supplierId = ref.read(driverSessionProvider).supplierId;
    if (supplierId == null) return;

    await ref
        .read(driverSessionProvider.notifier)
        .refreshFromApi(ref.read(driverApiProvider));

    setState(() => _loading = true);
    try {
      final analytics =
          await ref.read(driverApiProvider).fetchAnalytics(supplierId);
      if (!mounted) return;
      final l10n = context.l10n;
      await ref.read(driverBookingReminderServiceProvider).syncFromAnalytics(
            analytics,
            title: l10n.bookingReminderNotificationTitle,
            bodyFor: (reference, hours) =>
                l10n.bookingReminderNotificationBody(reference, hours),
          );
      if (!mounted) return;
      setState(() {
        _analytics = analytics;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loading = false);
    }
  }

  int? _hoursUntilNext(Map<String, dynamic>? next) {
    final raw = next?['scheduledAt'];
    if (raw == null) return null;
    final scheduled = DateTime.tryParse(raw.toString());
    if (scheduled == null) return null;
    final diff = scheduled.difference(DateTime.now());
    if (diff.isNegative) return null;
    return diff.inHours;
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final session = ref.watch(driverSessionProvider);
    final next = _analytics?['nextBooking'] as Map<String, dynamic>?;
    final hoursUntil = _hoursUntilNext(next);
    final showReminder =
        hoursUntil != null && hoursUntil <= 5 && hoursUntil >= 0;

    final driverName = session.profile?.displayName.isNotEmpty == true
        ? session.profile!.displayName
        : l10n.driverWorkspace;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: RefreshIndicator(
        onRefresh: _refresh,
        color: AppColors.purple,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(18, 12, 18, 32),
          children: [
            // Approval Warning Banner
            if (session.isPendingApproval)
              Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.warning.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.warning.withValues(alpha: 0.3)),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.warning.withValues(alpha: 0.15),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.hourglass_top_rounded, color: AppColors.warning, size: 20),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            l10n.pendingApproval,
                            style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: AppColors.warning),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            l10n.pendingApprovalMsg,
                            style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

            // Live Booking Reminder Banner
            if (showReminder)
              Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.purpleMuted,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.purple.withValues(alpha: 0.3)),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.purple.withValues(alpha: 0.2),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.notifications_active_rounded, color: AppColors.purple, size: 20),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            l10n.bookingReminder(hoursUntil),
                            style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 13, color: AppColors.purple),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            next?['reference']?.toString() ?? l10n.nextBooking,
                            style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

            // Executive Daylight Hero Welcome Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(22),
                border: Border.all(color: AppColors.border),
                boxShadow: AppTheme.cardShadow,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 48,
                            height: 48,
                            decoration: BoxDecoration(
                              gradient: AppTheme.brandGradient,
                              borderRadius: BorderRadius.circular(14),
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.purple.withValues(alpha: 0.2),
                                  blurRadius: 8,
                                  offset: const Offset(0, 3),
                                ),
                              ],
                            ),
                            child: const Icon(Icons.person_rounded, color: Colors.white, size: 26),
                          ),
                          const SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                l10n.driverWelcome,
                                style: const TextStyle(
                                  color: AppColors.textMuted,
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                driverName,
                                style: const TextStyle(
                                  color: AppColors.textPrimary,
                                  fontSize: 18,
                                  fontWeight: FontWeight.w900,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      // Online Active Status Pill
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(
                          color: AppColors.emeraldMuted,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: AppColors.emerald.withValues(alpha: 0.3)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 7,
                              height: 7,
                              decoration: const BoxDecoration(
                                color: AppColors.emerald,
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 6),
                            const Text(
                              'متصل VIP',
                              style: TextStyle(
                                color: AppColors.emerald,
                                fontSize: 11,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceLight,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Row(
                          children: [
                            Icon(Icons.workspace_premium_rounded, color: AppColors.gold, size: 18),
                            SizedBox(width: 6),
                            Text(
                              'تصنيف الأداء والالتزام:',
                              style: TextStyle(fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.w600),
                            ),
                          ],
                        ),
                        Row(
                          children: [
                            const Icon(Icons.star_rounded, color: AppColors.gold, size: 15),
                            const SizedBox(width: 3),
                            const Text(
                              '4.98',
                              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w900, color: AppColors.textPrimary),
                            ),
                            const SizedBox(width: 6),
                            Text(
                              '(ممتاز)',
                              style: TextStyle(fontSize: 11, color: AppColors.emerald, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Live Map Fleet Tracking Hero Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1E1B4B), Color(0xFF312E81)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(22),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF312E81).withValues(alpha: 0.35),
                    blurRadius: 14,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      Container(
                        width: 48,
                        height: 48,
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: Colors.white.withValues(alpha: 0.2)),
                        ),
                        child: const Icon(Icons.satellite_alt_rounded, color: Colors.white, size: 26),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Text(
                                  'الخريطة المباشرة للأسطول',
                                  style: TextStyle(
                                    fontWeight: FontWeight.w900,
                                    fontSize: 15,
                                    color: Colors.white,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppColors.emerald,
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: const Text(
                                    'LIVE',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 9.5,
                                      fontWeight: FontWeight.w900,
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 3),
                            Text(
                              'تتبع حركة سياراتك وسائقيها لحظياً مع تفاصيل المهام والاتصال المباشر.',
                              style: TextStyle(
                                fontSize: 11.5,
                                color: Colors.white.withValues(alpha: 0.8),
                                height: 1.3,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () => context.push('/live-map'),
                          icon: const Icon(Icons.map_rounded, size: 17, color: Colors.white),
                          label: const Text(
                            'فتح الخريطة التفاعلية',
                            style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 12.5),
                          ),
                          style: OutlinedButton.styleFrom(
                            side: BorderSide(color: Colors.white.withValues(alpha: 0.4)),
                            padding: const EdgeInsets.symmetric(vertical: 11),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Quick Operations Grid (Quotes, Airspace Radar, Tours, Reviews)
            Row(
              children: [
                Expanded(
                  child: _QuickActionTile(
                    icon: Icons.radar_rounded,
                    label: 'رادار الأجواء',
                    color: const Color(0xFF7C3AED),
                    onTap: () => context.push('/flight-radar?mode=airspace'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _QuickActionTile(
                    icon: Icons.request_quote_rounded,
                    label: 'عروض الأسعار',
                    color: AppColors.emerald,
                    onTap: () => context.push('/quote-requests'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _QuickActionTile(
                    icon: Icons.explore_rounded,
                    label: 'جولة ذكية AI',
                    color: AppColors.amber,
                    onTap: () => context.push('/tours/create'),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _QuickActionTile(
                    icon: Icons.star_rounded,
                    label: 'التقييمات',
                    color: AppColors.goldDark,
                    onTap: () => context.push('/reviews'),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 18),

            // AI Vehicle Onboarding Callout Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFFAF5FF), Color(0xFFF3E8FF)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFE9D5FF)),
                boxShadow: AppTheme.cardShadow,
              ),
              child: Row(
                children: [
                  Container(
                    width: 46,
                    height: 46,
                    decoration: BoxDecoration(
                      gradient: AppTheme.brandGradient,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Icon(Icons.auto_awesome_rounded, color: Colors.white, size: 24),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'إضافة سيارة جديدة بالذكاء الاصطناعي',
                          style: TextStyle(
                            fontWeight: FontWeight.w900,
                            fontSize: 13.5,
                            color: AppColors.purpleDark,
                          ),
                        ),
                        const SizedBox(height: 2),
                        const Text(
                          'ارفع صور سيارتك وسيستخرج Gemini المواصفات والمزايا تلقائياً ويضيفها لأسطولك.',
                          style: TextStyle(
                            fontSize: 11,
                            color: AppColors.textSecondary,
                            height: 1.3,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  FilledButton(
                    onPressed: () => context.push('/fleet/add'),
                    style: FilledButton.styleFrom(
                      backgroundColor: AppColors.purple,
                      foregroundColor: Colors.white,
                      minimumSize: const Size(64, 38),
                      padding: const EdgeInsets.symmetric(horizontal: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('إضافة +', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800)),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Bento Grid Stats Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'المؤشرات والإحصائيات الحية',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w800,
                    color: AppColors.textPrimary,
                  ),
                ),
                TextButton.icon(
                  onPressed: _refresh,
                  icon: const Icon(Icons.sync_rounded, size: 16, color: AppColors.purple),
                  label: const Text('تحديث', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                ),
              ],
            ),
            const SizedBox(height: 10),

            // Bento Grid: 6 High-Impact Daylight Metric Cards
            if (_loading && _analytics == null)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 40),
                child: Center(child: CircularProgressIndicator(color: AppColors.purple)),
              )
            else ...[
              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: 12,
                crossAxisSpacing: 12,
                childAspectRatio: 1.42,
                children: [
                  _ExecutiveStatCard(
                    icon: Icons.local_taxi_rounded,
                    label: l10n.statActiveTrips,
                    value: '${_analytics?['activeTrips'] ?? 0}',
                    accentColor: AppColors.purple,
                    bgColor: AppColors.purpleMuted,
                    badgeText: 'ميداني',
                    onTap: () => context.push('/trips'),
                  ),
                  _ExecutiveStatCard(
                    icon: Icons.inbox_rounded,
                    label: l10n.statPendingOffers,
                    value: '${_analytics?['pendingOffers'] ?? 0}',
                    accentColor: AppColors.gold,
                    bgColor: AppColors.goldMuted,
                    badgeText: 'مباشر',
                    onTap: () => context.push('/offers'),
                  ),
                  _ExecutiveStatCard(
                    icon: Icons.directions_car_rounded,
                    label: l10n.statFleet,
                    value: '${_analytics?['fleetCount'] ?? 0}',
                    accentColor: AppColors.blue,
                    bgColor: AppColors.blueMuted,
                    badgeText: 'مركبات',
                    onTap: () => context.push('/fleet'),
                  ),
                  _ExecutiveStatCard(
                    icon: Icons.verified_rounded,
                    label: l10n.statCompleted,
                    value: '${_analytics?['completedTrips'] ?? 0}',
                    accentColor: AppColors.emerald,
                    bgColor: AppColors.emeraldMuted,
                    badgeText: 'ناجحة',
                    onTap: () => context.push('/trips'),
                  ),
                  _ExecutiveStatCard(
                    icon: Icons.receipt_long_rounded,
                    label: l10n.statTotalBookings,
                    value: '${_analytics?['totalBookings'] ?? 0}',
                    accentColor: const Color(0xFF4F46E5),
                    bgColor: const Color(0x184F46E5),
                    badgeText: 'إجمالي',
                    onTap: () => context.push('/trips'),
                  ),
                  _ExecutiveStatCard(
                    icon: Icons.account_balance_wallet_rounded,
                    label: l10n.statEarnings,
                    value: '\$${(_analytics?['netEarnings'] as num?)?.toStringAsFixed(0) ?? '0'}',
                    accentColor: AppColors.goldDark,
                    bgColor: AppColors.goldMuted,
                    badgeText: 'صافي',
                    onTap: () => context.push('/earnings'),
                  ),
                ],
              ),

              if (_analytics?['isCompany'] == true) ...[
                const SizedBox(height: 12),
                _ExecutiveStatCard(
                  icon: Icons.groups_rounded,
                  label: l10n.statDrivers,
                  value: '${_analytics?['driversCount'] ?? 0}',
                  accentColor: AppColors.purple,
                  bgColor: AppColors.purpleMuted,
                  wide: true,
                  badgeText: 'فريق السائقين',
                  onTap: () => context.push('/sub-drivers'),
                ),
              ],

              const SizedBox(height: 24),

              // Upcoming Next Booking Section
              const Text(
                'أقرب حجز قادم',
                style: TextStyle(
                  fontWeight: FontWeight.w800,
                  fontSize: 15,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 10),

              if (next == null)
                Container(
                  padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Center(
                    child: Column(
                      children: [
                        Icon(Icons.event_available_rounded, size: 36, color: AppColors.textHint),
                        const SizedBox(height: 8),
                        Text(
                          l10n.noUpcomingBooking,
                          style: const TextStyle(
                            color: AppColors.textMuted,
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                )
              else
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppColors.border),
                    boxShadow: AppTheme.cardShadow,
                  ),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 46,
                            height: 46,
                            decoration: BoxDecoration(
                              color: AppColors.purpleMuted,
                              borderRadius: BorderRadius.circular(14),
                            ),
                            child: const Icon(Icons.flight_land_rounded, color: AppColors.purple, size: 24),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  next['reference']?.toString() ?? '—',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w800,
                                    fontSize: 14,
                                    color: AppColors.textPrimary,
                                  ),
                                ),
                                const SizedBox(height: 3),
                                Text(
                                  _formatDate(next['scheduledAt']),
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: AppColors.textMuted,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          FilledButton(
                            onPressed: () => context.push('/trips'),
                            style: FilledButton.styleFrom(
                              backgroundColor: AppColors.purple,
                              foregroundColor: Colors.white,
                              minimumSize: const Size(70, 36),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                            child: const Text('تفاصيل', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Builder(
                        builder: (context) {
                          final flightNum = next['flightNumber']?.toString() ??
                              next['flightNo']?.toString() ??
                              'TK1984';
                          final name = next['passengerName']?.toString() ??
                              next['customerName']?.toString() ??
                              'VIP GUEST';
                          final dest = next['destination']?.toString() ?? '';
                          return Row(
                            children: [
                              Expanded(
                                child: FilledButton.icon(
                                  onPressed: () {
                                    context.push(
                                      '/flight-radar?flightNumber=${Uri.encodeComponent(flightNum)}&passengerName=${Uri.encodeComponent(name)}&destination=${Uri.encodeComponent(dest)}',
                                    );
                                  },
                                  icon: const Icon(Icons.radar_rounded, size: 16, color: Color(0xFFFBBF24)),
                                  label: Text(
                                    'تعقب الرحلة ($flightNum)',
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
                                final name = next['passengerName']?.toString() ??
                                    next['customerName']?.toString() ??
                                    'VIP GUEST';
                                final flight = next['flightNumber']?.toString() ?? '';
                                final dest = next['destination']?.toString() ?? '';
                                context.push(
                                  '/welcome-sign?passengerName=${Uri.encodeComponent(name)}&flightNumber=${Uri.encodeComponent(flight)}&destination=${Uri.encodeComponent(dest)}',
                                );
                              },
                              icon: const Icon(Icons.badge_outlined, size: 16, color: AppColors.goldDark),
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
                    ],
                  ),
                ),
            ],
          ],
        ),
      ),
    );
  }

  String _formatDate(dynamic raw) {
    final dt = DateTime.tryParse(raw?.toString() ?? '');
    if (dt == null) return '—';
    return DateFormat.yMMMd().add_jm().format(dt.toLocal());
  }
}

class _ExecutiveStatCard extends StatelessWidget {
  const _ExecutiveStatCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.accentColor,
    required this.bgColor,
    this.badgeText,
    this.wide = false,
    this.onTap,
  });

  final IconData icon;
  final String label;
  final String value;
  final Color accentColor;
  final Color bgColor;
  final String? badgeText;
  final bool wide;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(20),
      child: InkWell(
        borderRadius: BorderRadius.circular(20),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: AppColors.border),
            boxShadow: AppTheme.cardShadow,
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: bgColor,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(icon, color: accentColor, size: 20),
                  ),
                  if (badgeText != null)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: bgColor,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        badgeText!,
                        style: TextStyle(
                          fontSize: 9.5,
                          fontWeight: FontWeight.w700,
                          color: accentColor,
                        ),
                      ),
                    ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    value,
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      color: AppColors.textPrimary,
                      height: 1.1,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    label,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textMuted,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _QuickActionTile extends StatelessWidget {
  const _QuickActionTile({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppColors.border),
            boxShadow: AppTheme.cardShadow,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: color, size: 20),
              ),
              const SizedBox(height: 8),
              Text(
                label,
                style: const TextStyle(
                  fontSize: 11.5,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textPrimary,
                ),
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

