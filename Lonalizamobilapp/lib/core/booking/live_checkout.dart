import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../presentation/features/pay/iyzico_checkout_args.dart';
import '../../presentation/providers/auth_session_provider.dart';
import '../../presentation/providers/dio_provider.dart';
import '../constants/app_constants.dart';

/// Starts the website booking writers, then isolated iyzico 3DS. Never trusts a client amount.
class LiveCheckout {
  static Future<void> requireLogin(BuildContext context, WidgetRef ref) async {
    if (ref.read(authSessionProvider) != null) return;
    await context.push('/auth');
  }

  static Future<void> flight(BuildContext context, WidgetRef ref, {
    required String itineraryId,
    String? sessionId,
    String? fareId,
    int adults = 1,
    int children = 0,
    int infants = 0,
    double? quotedPrice,
    String? currency,
  }) async {
    await requireLogin(context, ref);
    if (ref.read(authSessionProvider) == null) return;
    final res = await ref.read(appDioClientProvider).post<Map<String, dynamic>>(
      AppConstants.flightBookUrl,
      data: {
        'itineraryId': itineraryId,
        if (sessionId != null) 'sessionId': sessionId,
        if (fareId != null) 'fareId': fareId,
        'adults': adults,
        'children': children,
        'infants': infants,
        if (quotedPrice != null) 'quotedPrice': quotedPrice,
        if (currency != null) 'currency': currency,
      },
      includeAuth: true,
      receiveTimeout: const Duration(seconds: 90),
    );
    final bookingId = res.data?['bookingId']?.toString() ?? '';
    if (!context.mounted || bookingId.isEmpty) {
      throw Exception(res.data?['errorCode'] ?? 'flight_book_failed');
    }
    await context.push('/pay/iyzico', extra: IyzicoCheckoutArgs(bookingId: bookingId, title: 'Flight payment'));
  }

  static Future<void> hotel(BuildContext context, WidgetRef ref, {
    required String hotelId,
    String? rateId,
    String? supplierToken,
    String? sessionId,
    String? checkIn,
    String? checkOut,
    int adults = 2,
    String? currency,
  }) async {
    await requireLogin(context, ref);
    if (ref.read(authSessionProvider) == null) return;
    final client = ref.read(appDioClientProvider);
    final quote = await client.post<Map<String, dynamic>>(
      AppConstants.hotelQuoteUrl,
      data: {
        'hotelId': hotelId,
        if (rateId != null) 'rateId': rateId,
        if (supplierToken != null) 'supplierToken': supplierToken,
        if (sessionId != null) 'sessionId': sessionId,
        if (checkIn != null) 'checkIn': checkIn,
        if (checkOut != null) 'checkOut': checkOut,
        'adults': adults,
        if (currency != null) 'currency': currency,
      },
      includeAuth: true,
      receiveTimeout: const Duration(seconds: 90),
    );
    final quoteId = (quote.data?['quote'] is Map ? (quote.data?['quote'] as Map)['id'] : quote.data?['quoteId'])?.toString() ?? '';
    if (quoteId.isEmpty) throw Exception(quote.data?['error'] ?? 'quote_failed');
    final booked = await client.post<Map<String, dynamic>>(
      AppConstants.hotelBookUrl,
      data: {'quoteId': quoteId},
      includeAuth: true,
    );
    final bookingId = booked.data?['bookingId']?.toString() ?? '';
    if (!context.mounted || bookingId.isEmpty) throw Exception(booked.data?['error'] ?? 'hotel_book_failed');
    await context.push('/pay/iyzico', extra: IyzicoCheckoutArgs(bookingId: bookingId, title: 'Hotel payment'));
  }

  static Future<void> enquiry(BuildContext context, WidgetRef ref, {
    required String type,
    required String title,
    String? destination,
    double? price,
    String? currency,
    Map<String, dynamic>? metadata,
  }) async {
    await requireLogin(context, ref);
    if (ref.read(authSessionProvider) == null) return;
    final res = await ref.read(appDioClientProvider).post<Map<String, dynamic>>(
      AppConstants.catalogEnquireUrl,
      data: {
        'type': type,
        'service_name': title,
        if (destination != null) 'destination': destination,
        if (price != null) 'price': price,
        if (currency != null) 'currency': currency,
        'metadata': {
          if (price != null) 'quotedPrice': price,
          if (currency != null) 'currency': currency,
          ...?metadata,
        },
      },
      includeAuth: true,
    );
    final bookingId = res.data?['bookingId']?.toString() ?? '';
    if (!context.mounted || bookingId.isEmpty) throw Exception(res.data?['error'] ?? 'enquire_failed');
    await context.push('/pay/iyzico', extra: IyzicoCheckoutArgs(bookingId: bookingId, title: title));
  }
}
