import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/booking/live_checkout.dart';
import '../providers/flights_booking_draft_notifier.dart';

class FlightPaymentPage extends ConsumerStatefulWidget {
  const FlightPaymentPage({super.key});

  @override
  ConsumerState<FlightPaymentPage> createState() => _FlightPaymentPageState();
}

class _FlightPaymentPageState extends ConsumerState<FlightPaymentPage> {
  String? _error;
  bool _started = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _pay());
  }

  Future<void> _pay() async {
    if (_started) return;
    _started = true;
    final draft = ref.read(flightsBookingDraftProvider);
    final offer = draft.selectedOffer;
    if (offer == null) {
      setState(() => _error = 'اختر عرض الرحلة من نتائج البحث أولاً');
      return;
    }
    try {
      await LiveCheckout.flight(
        context,
        ref,
        itineraryId: offer.id,
        fareId: draft.selectedVariant?.fareKey,
        adults: draft.adultCount,
        children: draft.childCount,
        infants: draft.infantCount,
        quotedPrice: offer.pricing.total,
        currency: offer.pricing.currency,
      );
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Flight payment')),
      body: Center(
        child: _error != null
            ? Padding(
                padding: const EdgeInsets.all(24),
                child: Text(_error!, textAlign: TextAlign.center),
              )
            : const CircularProgressIndicator(),
      ),
    );
  }
}
