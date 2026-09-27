import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/extensions/context_l10n.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../data/services/driver_api.dart';
import '../../../providers/driver_session_provider.dart';

class DriverReviewsPage extends ConsumerStatefulWidget {
  const DriverReviewsPage({super.key});

  @override
  ConsumerState<DriverReviewsPage> createState() => _DriverReviewsPageState();
}

class _DriverReviewsPageState extends ConsumerState<DriverReviewsPage> {
  bool _loading = true;
  List<dynamic> _reviews = [];
  double _averageRating = 4.98;

  @override
  void initState() {
    super.initState();
    _loadReviews();
  }

  Future<void> _loadReviews() async {
    final supplierId = ref.read(driverSessionProvider).supplierId;
    if (supplierId == null) return;

    setState(() => _loading = true);
    try {
      final res = await ref.read(driverApiProvider).fetchReviews(supplierId: supplierId);
      if (!mounted) return;
      setState(() {
        _reviews = res['reviews'] as List? ?? [];
        _averageRating = (res['averageRating'] as num?)?.toDouble() ?? 4.98;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loading = false);
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
          'تقييمات وآراء العملاء',
          style: TextStyle(color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.bold),
        ),
        centerTitle: true,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.gold))
          : ListView(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 100),
              children: [
                // Top Rating Summary Card
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: AppTheme.cardShadow,
                  ),
                  child: Row(
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                _averageRating.toStringAsFixed(2),
                                style: const TextStyle(
                                  fontSize: 36,
                                  fontWeight: FontWeight.w900,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                              const SizedBox(width: 6),
                              const Icon(Icons.star_rounded, color: Color(0xFFF59E0B), size: 32),
                            ],
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'تصنيف ممتاز بناءً على ${_reviews.length} تقييم',
                            style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
                          ),
                        ],
                      ),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: AppColors.gold.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.gold.withValues(alpha: 0.4)),
                        ),
                        child: const Column(
                          children: [
                            Icon(Icons.verified_rounded, color: AppColors.purpleDark, size: 24),
                            SizedBox(height: 2),
                            Text('كابتن معتمد', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.purpleDark)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                const Text('أحدث تجارب المسافرين:', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                const SizedBox(height: 10),

                ..._reviews.map((rev) {
                  final rating = rev['rating'] as int? ?? 5;
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: Container(
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
                              CircleAvatar(
                                radius: 18,
                                backgroundColor: AppColors.purple.withValues(alpha: 0.12),
                                child: Text(
                                  (rev['passengerName'] ?? 'V')[0],
                                  style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.purple),
                                ),
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      rev['passengerName'] ?? 'مسافر VIP',
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                                    ),
                                    Text(
                                      '${rev['tripTitle'] ?? 'رحلة خاصة'} · ${rev['date'] ?? 'مؤخراً'}',
                                      style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                                    ),
                                  ],
                                ),
                              ),
                              Row(
                                children: List.generate(
                                  rating,
                                  (_) => const Icon(Icons.star_rounded, color: Color(0xFFF59E0B), size: 16),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          Text(
                            rev['comment'] ?? '',
                            style: const TextStyle(fontSize: 13, color: AppColors.textPrimary, height: 1.4),
                          ),
                        ],
                      ),
                    ),
                  );
                }),
              ],
            ),
    );
  }
}
