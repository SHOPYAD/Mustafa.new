import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/extensions/context_l10n.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../data/services/driver_api.dart';
import '../../../providers/driver_session_provider.dart';

class DriverEarningsPage extends ConsumerStatefulWidget {
  const DriverEarningsPage({super.key});

  @override
  ConsumerState<DriverEarningsPage> createState() =>
      _DriverEarningsPageState();
}

class _DriverEarningsPageState extends ConsumerState<DriverEarningsPage> {
  Map<String, dynamic>? _earnings;
  Map<String, dynamic>? _commission;
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
      final api = ref.read(driverApiProvider);
      final results = await Future.wait([
        api.fetchEarnings(supplierId),
        api.fetchCommission(),
      ]);
      if (!mounted) return;
      setState(() {
        _earnings = results[0];
        _commission = results[1];
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final currency = _earnings?['currency'] as String? ??
        _commission?['currency'] as String? ??
        'USD';
    final pct =
        (_commission?['platformCommissionPct'] as num?)?.toDouble() ?? 15.0;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(l10n.earnings),
        actions: [
          IconButton(
            icon: const Icon(Icons.receipt_long_outlined),
            tooltip: l10n.payouts,
            onPressed: () => context.push('/payouts'),
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.purple))
          : RefreshIndicator(
              color: AppColors.purple,
              onRefresh: _load,
              child: ListView(
                padding: const EdgeInsets.all(20),
                children: [
                  // Daylight Executive Commission Card
                  Container(
                    padding: const EdgeInsets.all(22),
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
                            Text(
                              l10n.platformCommission,
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: AppColors.textMuted,
                              ),
                            ),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: AppColors.emeraldMuted,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: const Text(
                                'تسوية أسبوعية مباشرة',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.emerald,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.baseline,
                          textBaseline: TextBaseline.alphabetic,
                          children: [
                            Text(
                              '${pct.toStringAsFixed(1)}%',
                              style: const TextStyle(
                                color: AppColors.goldDark,
                                fontSize: 38,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                            const SizedBox(width: 8),
                            const Text(
                              'نسبة المنصة الثابتة',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        const Divider(height: 1),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            const Icon(Icons.check_circle_rounded, color: AppColors.emerald, size: 16),
                            const SizedBox(width: 6),
                            Expanded(
                              child: Text(
                                'تحصل على 85% صافي من قيمة كل حجز فور إتمام الرحلة',
                                style: const TextStyle(
                                  fontSize: 11.5,
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 18),

                  // Period Stat Cards (Daily, Weekly, Monthly)
                  Row(
                    children: [
                      Expanded(
                        child: _PeriodStatCard(
                          label: l10n.dailyEarnings,
                          value: _formatAmount(_earnings?['daily'], currency),
                          icon: Icons.today_rounded,
                          accentColor: AppColors.purple,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _PeriodStatCard(
                          label: l10n.weeklyEarnings,
                          value: _formatAmount(_earnings?['weekly'], currency),
                          icon: Icons.date_range_rounded,
                          accentColor: AppColors.blue,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _PeriodStatCard(
                          label: l10n.monthlyEarnings,
                          value: _formatAmount(_earnings?['monthly'], currency),
                          icon: Icons.calendar_month_rounded,
                          accentColor: AppColors.emerald,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 22),

                  const Text(
                    'تفصيل العمولة والأرباح',
                    style: TextStyle(
                      fontWeight: FontWeight.w800,
                      fontSize: 15,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Breakdown Table Card
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.border),
                      boxShadow: AppTheme.cardShadow,
                    ),
                    child: Column(
                      children: [
                        _BreakdownRow(
                          label: 'إجمالي المبيعات (Gross)',
                          value: _formatAmount(_earnings?['gross'], currency),
                        ),
                        const Divider(height: 1),
                        _BreakdownRow(
                          label: l10n.platformCommission,
                          value: _formatAmount(_earnings?['commission'], currency),
                          negative: true,
                        ),
                        const Divider(height: 1),
                        _BreakdownRow(
                          label: 'صافي مستحقات السائق (Net)',
                          value: _formatAmount(_earnings?['net'], currency),
                          bold: true,
                          highlight: true,
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 22),

                  const Text(
                    'معدل النمو الزمني للأرباح',
                    style: TextStyle(
                      fontWeight: FontWeight.w800,
                      fontSize: 15,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 10),

                  Container(
                    padding: const EdgeInsets.all(18),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.border),
                      boxShadow: AppTheme.cardShadow,
                    ),
                    child: _SimpleBarChart(
                      data: [
                        (_earnings?['daily'] as num?)?.toDouble() ?? 0,
                        (_earnings?['weekly'] as num?)?.toDouble() ?? 0,
                        (_earnings?['monthly'] as num?)?.toDouble() ?? 0,
                      ],
                      labels: [
                        l10n.dailyEarnings,
                        l10n.weeklyEarnings,
                        l10n.monthlyEarnings,
                      ],
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  String _formatAmount(dynamic amount, String currency) {
    if (amount == null) return '—';
    return '\$$amount';
  }
}

class _PeriodStatCard extends StatelessWidget {
  const _PeriodStatCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.accentColor,
  });

  final String label;
  final String value;
  final IconData icon;
  final Color accentColor;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.border),
        boxShadow: AppTheme.cardShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: accentColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, size: 16, color: accentColor),
          ),
          const SizedBox(height: 10),
          Text(
            value,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w900,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: 3),
          Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: AppColors.textMuted,
            ),
          ),
        ],
      ),
    );
  }
}

class _BreakdownRow extends StatelessWidget {
  const _BreakdownRow({
    required this.label,
    required this.value,
    this.bold = false,
    this.negative = false,
    this.highlight = false,
  });

  final String label;
  final String value;
  final bool bold;
  final bool negative;
  final bool highlight;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      color: highlight ? AppColors.emeraldMuted.withValues(alpha: 0.05) : Colors.transparent,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontWeight: bold ? FontWeight.w800 : FontWeight.w600,
              fontSize: bold ? 14 : 13,
              color: highlight ? AppColors.emerald : AppColors.textPrimary,
            ),
          ),
          Text(
            negative ? '- $value' : value,
            style: TextStyle(
              fontWeight: bold ? FontWeight.w900 : FontWeight.w700,
              fontSize: bold ? 16 : 14,
              color: negative
                  ? AppColors.rose
                  : highlight
                      ? AppColors.emerald
                      : AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }
}

class _SimpleBarChart extends StatelessWidget {
  const _SimpleBarChart({
    required this.data,
    required this.labels,
  });

  final List<double> data;
  final List<String> labels;

  @override
  Widget build(BuildContext context) {
    final max = data.isEmpty ? 1.0 : data.reduce((a, b) => a > b ? a : b);
    final safeMax = max <= 0 ? 1.0 : max;

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: List.generate(data.length, (i) {
        final ratio = (data[i] / safeMax).clamp(0.08, 1.0);
        return Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              '\$${data[i].toStringAsFixed(0)}',
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 8),
            Container(
              width: 38,
              height: 110 * ratio,
              decoration: BoxDecoration(
                gradient: i == 2
                    ? AppTheme.brandGradient
                    : LinearGradient(
                        begin: Alignment.bottomCenter,
                        end: Alignment.topCenter,
                        colors: [
                          AppColors.purple.withValues(alpha: 0.4),
                          AppColors.purple.withValues(alpha: 0.8),
                        ],
                      ),
                borderRadius: BorderRadius.circular(10),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              labels[i],
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: AppColors.textMuted,
              ),
            ),
          ],
        );
      }),
    );
  }
}
