import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/extensions/context_l10n.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../data/services/driver_api.dart';
import '../../../providers/driver_session_provider.dart';

class DriverQuoteRequestsPage extends ConsumerStatefulWidget {
  const DriverQuoteRequestsPage({super.key});

  @override
  ConsumerState<DriverQuoteRequestsPage> createState() => _DriverQuoteRequestsPageState();
}

class _DriverQuoteRequestsPageState extends ConsumerState<DriverQuoteRequestsPage> {
  bool _loading = true;
  List<dynamic> _requests = [];

  @override
  void initState() {
    super.initState();
    _loadRequests();
  }

  Future<void> _loadRequests() async {
    final supplierId = ref.read(driverSessionProvider).supplierId;
    if (supplierId == null) return;

    setState(() => _loading = true);
    try {
      final res = await ref.read(driverApiProvider).fetchQuoteRequests(supplierId: supplierId);
      if (!mounted) return;
      setState(() {
        _requests = res;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loading = false);
    }
  }

  Future<void> _submitBid(Map<String, dynamic> request) async {
    final supplierId = ref.read(driverSessionProvider).supplierId;
    if (supplierId == null) return;

    final priceController = TextEditingController(text: '${request['budgetMax'] ?? 350}');
    final notesController = TextEditingController(text: 'مركبة مرسيدس فيتو VIP حديثة وسائق محترف يتحدث العربية');

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Row(
          children: [
            Icon(Icons.gavel_rounded, color: AppColors.purple),
            SizedBox(width: 8),
            Text('تقديم عرض سعر مخصص', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('المسار: ${request['pickupLocation']} ➔ ${request['dropoffLocation']}', style: const TextStyle(fontSize: 12, color: AppColors.textMuted)),
            const SizedBox(height: 14),
            TextField(
              controller: priceController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'سعرك المقترح بالدولار (\$)',
                prefixIcon: Icon(Icons.attach_money_rounded),
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: notesController,
              maxLines: 2,
              decoration: const InputDecoration(
                labelText: 'ملاحظات العرض للعميل',
                border: OutlineInputBorder(),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('إلغاء'),
          ),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: AppColors.gold, foregroundColor: AppColors.purpleDark),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('إرسال العرض المالي', style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    try {
      final res = await ref.read(driverApiProvider).submitQuoteBid(
        requestId: request['id']?.toString() ?? '',
        supplierId: supplierId,
        price: double.tryParse(priceController.text.trim()) ?? 350.0,
        currency: 'USD',
        notes: notesController.text.trim(),
      );

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(res['message'] ?? 'تم تقديم عرض السعر بنجاح!'),
          backgroundColor: AppColors.emerald,
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('فشل تقديم العرض: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppColors.textPrimary),
          onPressed: () => context.pop(),
        ),
        title: const Text(
          'طلبات عروض الأسعار الخاصة',
          style: TextStyle(color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.gold))
          : _requests.isEmpty
              ? const Center(child: Text('لا توجد طلبات عروض أسعار مفتوحة حالياً', style: TextStyle(color: AppColors.textMuted)))
              : RefreshIndicator(
                  onRefresh: _loadRequests,
                  child: ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
                    itemCount: _requests.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final req = _requests[index] as Map<String, dynamic>;
                      return Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: AppTheme.cardShadow,
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: AppColors.gold.withValues(alpha: 0.15),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: const Text('طلب خاص VIP', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.purpleDark)),
                                ),
                                const Spacer(),
                                Text(
                                  'الميزانية: \$${req['budgetMax'] ?? 350}',
                                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: AppColors.emerald),
                                ),
                              ],
                            ),
                            const SizedBox(height: 10),
                            Text(
                              req['passengerName'] ?? 'عميل VIP',
                              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                            ),
                            const SizedBox(height: 6),
                            Row(
                              children: [
                                const Icon(Icons.route_rounded, size: 16, color: AppColors.purple),
                                const SizedBox(width: 6),
                                Expanded(
                                  child: Text(
                                    '${req['pickupLocation']} ➔ ${req['dropoffLocation']}',
                                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                                  ),
                                ),
                              ],
                            ),
                            if (req['notes'] != null) ...[
                              const SizedBox(height: 6),
                              Text(
                                req['notes'],
                                style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                              ),
                            ],
                            const Divider(height: 20),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  '${req['passengers'] ?? 6} ركاب · ${req['luggage'] ?? 6} حقائب',
                                  style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                                ),
                                FilledButton.icon(
                                  style: FilledButton.styleFrom(
                                    backgroundColor: AppColors.purple,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                                  ),
                                  icon: const Icon(Icons.send_rounded, size: 16),
                                  label: const Text('تقديم عرض سعر', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                                  onPressed: () => _submitBid(req),
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
