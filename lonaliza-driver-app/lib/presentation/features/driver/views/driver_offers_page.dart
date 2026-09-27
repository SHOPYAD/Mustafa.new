import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/extensions/context_l10n.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../data/services/driver_api.dart';
import '../../../providers/driver_session_provider.dart';

class DriverOffersPage extends ConsumerWidget {
  const DriverOffersPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = context.l10n;
    final isAr = Localizations.localeOf(context).languageCode == 'ar';
    final supplierId = ref.watch(driverSessionProvider).supplierId;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(l10n.incomingOffers),
      ),
      body: supplierId == null
          ? Center(
              child: Text(
                isAr ? 'يرجى إكمال تسجيل واعتماد الحساب أولاً' : 'Please complete registration first',
                style: const TextStyle(color: AppColors.textMuted),
              ),
            )
          : FutureBuilder<List<dynamic>>(
              future: ref.read(driverApiProvider).fetchAssignments(supplierId),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                final list = snapshot.data ?? [];
                if (list.isEmpty) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(32),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 72,
                            height: 72,
                            decoration: BoxDecoration(
                              color: AppColors.purpleMuted,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.inbox_rounded,
                              size: 36,
                              color: AppColors.purple,
                            ),
                          ),
                          const SizedBox(height: 18),
                          Text(
                            isAr ? 'لا توجد عروض واردة حالياً' : 'No incoming offers right now',
                            style: const TextStyle(
                              fontSize: 17,
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            l10n.incomingOffersSub,
                            style: const TextStyle(
                              fontSize: 13,
                              color: AppColors.textMuted,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ],
                      ),
                    ),
                  );
                }
                return ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: list.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 12),
                  itemBuilder: (context, index) {
                    final item = list[index] as Map<String, dynamic>;
                    return Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.border),
                        boxShadow: AppTheme.cardShadow,
                      ),
                      padding: const EdgeInsets.all(16),
                      child: ListTile(
                        contentPadding: EdgeInsets.zero,
                        leading: Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: AppColors.purpleMuted,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.receipt_long_rounded, color: AppColors.purple),
                        ),
                        title: Text(
                          '${isAr ? "رقم الحجز" : "Booking"}: ${item['bookingId'] ?? '—'}',
                          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
                        ),
                        subtitle: Text(
                          '${item['serviceType'] ?? 'VIP Transfer'} · ${item['status'] ?? 'pending'}',
                          style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                        ),
                      ),
                    );
                  },
                );
              },
            ),
    );
  }
}
