import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:liotrip/core/extensions/context_l10n.dart';
import '../../providers/flights_booking_draft_notifier.dart';
import '../../providers/flight_repository_provider.dart';
import '../details/flight_itinerary_card.dart';
import 'package:liotrip/domain/entities/flights/flight_offer.dart';
import 'package:liotrip/domain/entities/flights/flight_price_confirm_result.dart';

class FlightInfoSummaryHeader extends ConsumerWidget {
  const FlightInfoSummaryHeader({super.key});

  void _showBaggageAndPoliciesSheet(BuildContext context, dynamic variant) {
    if (variant == null) return;

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Baggage & policies',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1F2937),
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: Color(0xFF4B5563)),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                _buildPolicyRow(
                  icon: Icons.work_outline_rounded,
                  title: 'Cabin baggage',
                  value: variant.cabinBagDesc ?? '1 personal item / carry-on',
                ),
                const Divider(height: 24, color: Color(0xFFF3F4F6)),
                _buildPolicyRow(
                  icon: Icons.luggage_outlined,
                  title: 'Checked baggage',
                  value: variant.checkedBagDesc ?? 'No checked baggage',
                ),
                const Divider(height: 24, color: Color(0xFFF3F4F6)),
                _buildPolicyRow(
                  icon: Icons.block_rounded,
                  title: 'Cancellation policy',
                  value: variant.canRefund == true
                      ? 'Refundable'
                      : 'Non-refundable',
                  valueColor: variant.canRefund == true
                      ? const Color(0xFF0E766E)
                      : const Color(0xFFDC2626),
                ),
                const Divider(height: 24, color: Color(0xFFF3F4F6)),
                _buildPolicyRow(
                  icon: Icons.edit_note_rounded,
                  title: 'Changes policy',
                  value: variant.canExchange == true
                      ? 'Changes permitted'
                      : 'Changes not permitted',
                  valueColor: variant.canExchange == true
                      ? const Color(0xFF0E766E)
                      : const Color(0xFFDC2626),
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildPolicyRow({
    required IconData icon,
    required String title,
    required String value,
    Color? valueColor,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 20, color: const Color(0xFF7C3AED)),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF6B7280),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                value,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: valueColor ?? const Color(0xFF1F2937),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  void _showFlightDetailsSheet(
    BuildContext context,
    FlightOffer? offer,
    WidgetRef ref,
  ) {
    if (offer == null) return;
    final isAr = Localizations.localeOf(context).languageCode == 'ar';

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      isScrollControlled: true,
      useSafeArea: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        return FractionallySizedBox(
          heightFactor: 1.0,
          child: Column(
            children: [
              // Pull handle
              const SizedBox(height: 12),
              Container(
                width: 36,
                height: 4,
                decoration: BoxDecoration(
                  color: const Color(0xFFE5E7EB),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 16),
              // Title header
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      isAr ? 'تفاصيل الرحلة' : 'Flight Details',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF1F2937),
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.pop(context),
                      icon: const Icon(
                        Icons.close_rounded,
                        color: Color(0xFF4B5563),
                      ),
                      style: IconButton.styleFrom(
                        backgroundColor: const Color(0xFFF3F4F6),
                        padding: const EdgeInsets.all(8),
                      ),
                    ),
                  ],
                ),
              ),
              const Divider(height: 24, color: Color(0xFFE5E7EB)),
              // Details content
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  children: [
                    FlightItineraryCard(offer: offer),
                    const SizedBox(height: 20),
                    // Test price verification area
                    StatefulBuilder(
                      builder: (context, setState) {
                        bool isLoading = false;
                        return Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF9FAFB),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: const Color(0xFFE5E7EB)),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              Row(
                                children: [
                                  const Icon(
                                    Icons.science_outlined,
                                    color: Color(0xFF7C3AED),
                                    size: 20,
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    isAr
                                        ? 'تجربة التحقق من السعر'
                                        : 'Test Price Verification',
                                    style: const TextStyle(
                                      fontSize: 14,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF374151),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Text(
                                isAr
                                    ? 'اضغط أدناه لإرسال طلب خفيف للويب هوك وتأكيد السعر المرجّع.'
                                    : 'Tap below to call the webhook and confirm the pricing payload response.',
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: Color(0xFF6B7280),
                                ),
                              ),
                              const SizedBox(height: 16),
                              ElevatedButton.icon(
                                onPressed: isLoading
                                    ? null
                                    : () async {
                                        setState(() {
                                          isLoading = true;
                                        });
                                        try {
                                          final repository = ref.read(
                                            flightRepositoryProvider,
                                          );
                                          final draft = ref.read(
                                            flightsBookingDraftProvider,
                                          );
                                          final variant = draft.selectedVariant;

                                          final result = await repository
                                              .confirmFlightPrice(
                                                offer: offer,
                                                variant: variant,
                                              );

                                          if (context.mounted) {
                                            if (result.verifiedTotal <= 0 || !result.bookable) {
                                              showDialog<dynamic>(
                                                context: context,
                                                builder: (context) => AlertDialog(
                                                  title: Text(isAr ? 'فشل تأكيد السعر' : 'Quote failed'),
                                                  content: Text(
                                                    isAr
                                                        ? 'السعر المعتمد غير صالح. أعد البحث.'
                                                        : 'Verified total is missing. Search again.',
                                                  ),
                                                  actions: [
                                                    TextButton(
                                                      onPressed: () => Navigator.pop(context),
                                                      child: const Text('OK'),
                                                    ),
                                                  ],
                                                ),
                                              );
                                              return;
                                            }
                                            showDialog<dynamic>(
                                              context: context,
                                              builder: (context) => AlertDialog(
                                                title: Row(
                                                  children: [
                                                    const Icon(
                                                      Icons
                                                          .check_circle_outline,
                                                      color: Colors.green,
                                                    ),
                                                    const SizedBox(width: 8),
                                                    Text(
                                                      isAr
                                                          ? 'نجاح الاستجابة ✅'
                                                          : 'Success Response ✅',
                                                    ),
                                                  ],
                                                ),
                                                content: SingleChildScrollView(
                                                  child: ListBody(
                                                    children: [
                                                      Text(
                                                        isAr
                                                            ? 'تمت العملية بنجاح! السعر المستلم من السيرفر:'
                                                            : 'Operation successful! Received price from server:',
                                                      ),
                                                      const SizedBox(
                                                        height: 12,
                                                      ),
                                                      Container(
                                                        padding:
                                                            const EdgeInsets.all(
                                                              12,
                                                            ),
                                                        decoration: BoxDecoration(
                                                          color: const Color(
                                                            0xFFF0FDF4,
                                                          ),
                                                          borderRadius:
                                                              BorderRadius.circular(
                                                                8,
                                                              ),
                                                          border: Border.all(
                                                            color: const Color(
                                                              0xFFBBF7D0,
                                                            ),
                                                          ),
                                                        ),
                                                        child: Column(
                                                          crossAxisAlignment:
                                                              CrossAxisAlignment
                                                                  .start,
                                                          children: [
                                                            Text(
                                                              isAr
                                                                  ? 'السعر المعتمد: ${result.verifiedTotal} ${result.currency}'
                                                                  : 'Verified Price: ${result.verifiedTotal} ${result.currency}',
                                                              style: const TextStyle(
                                                                fontWeight: FontWeight.bold,
                                                                color: Color(0xFF166534),
                                                                fontSize: 15,
                                                              ),
                                                            ),
                                                            const SizedBox(height: 4),
                                                            Text(
                                                              isAr
                                                                  ? 'السعر الأصلي المخزن: ${result.cachedTotal} ${result.currency}'
                                                                  : 'Cached Price: ${result.cachedTotal} ${result.currency}',
                                                              style: const TextStyle(
                                                                color: Color(0xFF166534),
                                                                fontSize: 13,
                                                              ),
                                                            ),
                                                            const SizedBox(height: 4),
                                                            Text(
                                                              isAr
                                                                  ? 'هل تغير السعر؟ ${result.changed ? "نعم ⚠️" : "لا ✅"}'
                                                                  : 'Price Changed? ${result.changed ? "Yes ⚠️" : "No ✅"}',
                                                              style: TextStyle(
                                                                color: result.changed ? Colors.amber[900] : const Color(0xFF166534),
                                                                fontSize: 13,
                                                              ),
                                                            ),
                                                            const SizedBox(height: 4),
                                                            Text(
                                                              isAr
                                                                  ? 'قابل للحجز؟ ${result.bookable ? "نعم ✅" : "لا ❌"}'
                                                                  : 'Bookable? ${result.bookable ? "Yes ✅" : "No ❌"}',
                                                              style: TextStyle(
                                                                color: result.bookable ? const Color(0xFF166534) : Colors.red,
                                                                fontSize: 13,
                                                              ),
                                                            ),
                                                          ],
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                ),
                                                actions: [
                                                  TextButton(
                                                    onPressed: () =>
                                                        Navigator.pop(context),
                                                    child: const Text('OK'),
                                                  ),
                                                ],
                                              ),
                                            );
                                          }
                                        } catch (e) {
                                          if (context.mounted) {
                                            showDialog<dynamic>(
                                              context: context,
                                              builder: (context) => AlertDialog(
                                                title: Row(
                                                  children: [
                                                    const Icon(
                                                      Icons.error_outline,
                                                      color: Colors.red,
                                                    ),
                                                    const SizedBox(width: 8),
                                                    Text(
                                                      isAr
                                                          ? 'فشل الاتصال ❌'
                                                          : 'Connection Failed ❌',
                                                    ),
                                                  ],
                                                ),
                                                content: Text(e.toString()),
                                                actions: [
                                                  TextButton(
                                                    onPressed: () =>
                                                        Navigator.pop(context),
                                                    child: const Text('OK'),
                                                  ),
                                                ],
                                              ),
                                            );
                                          }
                                        } finally {
                                          setState(() {
                                            isLoading = false;
                                          });
                                        }
                                      },
                                icon: isLoading
                                    ? const SizedBox(
                                        width: 16,
                                        height: 16,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                          valueColor: AlwaysStoppedAnimation(
                                            Colors.white,
                                          ),
                                        ),
                                      )
                                    : const Icon(
                                        Icons.play_circle_fill_rounded,
                                      ),
                                label: Text(
                                  isLoading
                                      ? (isAr
                                            ? 'جاري الاتصال...'
                                            : 'Requesting...')
                                      : (isAr
                                            ? 'إرسال طلب تجريبي'
                                            : 'Send Test Request'),
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF7C3AED),
                                  foregroundColor: Colors.white,
                                  elevation: 0,
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 12,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        );
                      },
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final draft = ref.watch(flightsBookingDraftProvider);
    final offer = draft.selectedOffer;
    final variant = draft.selectedVariant;
    final isAr = Localizations.localeOf(context).languageCode == 'ar';
    final locale = Localizations.localeOf(context).toString();
    final l10n = context.l10n;

    // Dynamically retrieve origin and destination
    final itinerary = offer?.itineraries.isNotEmpty == true
        ? offer!.itineraries.first
        : null;
    final firstSeg = itinerary?.segments.isNotEmpty == true
        ? itinerary!.segments.first
        : null;
    final lastSeg = itinerary?.segments.isNotEmpty == true
        ? itinerary!.segments.last
        : null;

    final originCity =
        firstSeg?.departure.cityName ??
        firstSeg?.departure.airportCode ??
        'Algiers';
    final destCity =
        lastSeg?.arrival.cityName ?? lastSeg?.arrival.airportCode ?? 'Tokyo';
    final titleText = '$originCity → $destCity';

    // Format date and time dynamically
    String dateAndTimeStr = 'Fri, Apr 24  |  3:35 PM–7:35 PM+1';
    if (firstSeg != null && lastSeg != null) {
      final depDt = firstSeg.departure.dateTime;
      final arrDt = lastSeg.arrival.dateTime;

      final dateStr = DateFormat('EEE, MMM d', locale).format(depDt);
      final depTime = DateFormat('h:mm a', locale).format(depDt);
      final arrTime = DateFormat('h:mm a', locale).format(arrDt);

      final dayDiff = arrDt.difference(depDt).inDays;
      final nextDaySuffix = dayDiff > 0 ? '+$dayDiff' : '';

      dateAndTimeStr = '$dateStr  |  $depTime–$arrTime$nextDaySuffix';
    }

    return Container(
      color: Colors.white,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Banner 1
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: Row(
              children: [
                const Icon(
                  Icons.check_circle_outline,
                  size: 16,
                  color: Color(0xFF0E766E),
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    isAr
                        ? 'اختيار رائع! طائرة مريحة طوال الرحلة.'
                        : 'Great choice! Large aircraft for entire trip.',
                    style: TextStyle(
                      fontSize: 13,
                      color: const Color(0xFF0E766E).withValues(alpha: 0.9),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Flight Summary
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        titleText,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFF1F2937),
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        dateAndTimeStr,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          color: Color(0xFF4B5563),
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(
                  Icons.keyboard_arrow_down_rounded,
                  size: 24,
                  color: const Color(0xFF6B7280).withValues(alpha: 0.8),
                ),
              ],
            ),
          ),

          const SizedBox(height: 8),

          // Notices & Baggage & policies
          InkWell(
            onTap: () => _showBaggageAndPoliciesSheet(context, variant),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              child: Row(
                children: [
                  RichText(
                    text: TextSpan(
                      style: const TextStyle(
                        fontSize: 14,
                        color: Color(0xFF4B5563),
                      ),
                      children: [
                        TextSpan(
                          text: isAr ? 'تنبيهات ' : 'Notices ',
                          style: const TextStyle(fontWeight: FontWeight.w500),
                        ),
                        const TextSpan(
                          text: '3',
                          style: TextStyle(
                            color: Color(0xFFD97706),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 8),
                    child: Text(
                      '|',
                      style: TextStyle(color: Color(0xFFD1D5DB)),
                    ),
                  ),
                  Expanded(
                    child: Text(
                      isAr ? 'الأمتعة والسياسات' : 'Baggage & policies',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: Color(0xFF4B5563),
                      ),
                    ),
                  ),
                  const Icon(
                    Icons.keyboard_arrow_right_rounded,
                    size: 18,
                    color: Color(0xFF9CA3AF),
                  ),
                ],
              ),
            ),
          ),

          const Divider(height: 1, color: Color(0xFFF3F4F6)),

          // Upgrade banner
          InkWell(
            onTap: () => _showFlightDetailsSheet(context, offer, ref),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
              child: Row(
                children: [
                  const Icon(
                    Icons.flight_takeoff_rounded,
                    size: 18,
                    color: Color(0xFF0E766E),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      l10n.ticketUpgradedViewDetails,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF374151),
                      ),
                    ),
                  ),
                  Icon(
                    Icons.play_arrow_rounded,
                    size: 14,
                    color: const Color(0xFF1F2937).withValues(alpha: 0.8),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
