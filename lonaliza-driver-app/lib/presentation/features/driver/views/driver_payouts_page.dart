import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/extensions/context_l10n.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../data/services/driver_api.dart';
import '../../../providers/driver_session_provider.dart';

class DriverPayoutsPage extends ConsumerStatefulWidget {
  const DriverPayoutsPage({super.key});

  @override
  ConsumerState<DriverPayoutsPage> createState() => _DriverPayoutsPageState();
}

class _DriverPayoutsPageState extends ConsumerState<DriverPayoutsPage> {
  List<dynamic> _payouts = [];
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
      final list = await ref.read(driverApiProvider).fetchPayouts(supplierId);
      if (!mounted) return;
      setState(() {
        _payouts = list;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loading = false);
    }
  }

  Future<void> _openVoucher(String? url) async {
    if (url == null || url.isEmpty) return;
    final uri = Uri.tryParse(url);
    if (uri != null && await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return Scaffold(
      appBar: AppBar(title: Text(l10n.payouts)),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _payouts.isEmpty
              ? Center(
                  child: Text(l10n.noPayouts,
                      style: const TextStyle(color: AppColors.textMuted)),
                )
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView.separated(
                    padding: const EdgeInsets.all(16),
                    itemCount: _payouts.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 8),
                    itemBuilder: (context, index) {
                      final p = _payouts[index] as Map<String, dynamic>;
                      final week = p['weekLabel'] as String? ??
                          p['period'] as String? ??
                          'Week ${index + 1}';
                      final amount = p['amount'];
                      final currency = p['currency'] as String? ?? 'USD';
                      final voucherUrl = p['voucherUrl'] as String? ??
                          p['pdfUrl'] as String?;

                      return Card(
                        child: ListTile(
                          leading: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: AppColors.gold.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(Icons.receipt_long,
                                color: AppColors.purple),
                          ),
                          title: Text(week,
                              style:
                                  const TextStyle(fontWeight: FontWeight.w600)),
                          subtitle: Text('$amount $currency'),
                          trailing: voucherUrl != null
                              ? IconButton(
                                  icon: const Icon(Icons.download_outlined),
                                  onPressed: () => _openVoucher(voucherUrl),
                                  tooltip: l10n.downloadVoucher,
                                )
                              : null,
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
