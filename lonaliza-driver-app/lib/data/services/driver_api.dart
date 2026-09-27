import 'dart:convert';
import 'dart:io';

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/constants/driver_platform_constants.dart';
import '../../presentation/providers/dio_provider.dart';
import '../../presentation/providers/driver_session_provider.dart';

const _driverApiPrefix = '/api/transfers/driver';

final driverApiProvider = Provider<DriverApi>((ref) {
  return DriverApi.authenticated(
    ref.watch(dioProvider),
    authToken: ref.watch(driverSessionProvider).authToken,
  );
});

class DriverApi {
  DriverApi([
    Dio? dio,
  ])  : _dio = dio ?? Dio(BaseOptions(baseUrl: DriverPlatformConstants.apiBaseUrl)),
        authToken = null;

  DriverApi.authenticated(
    this._dio, {
    this.authToken,
  });

  final Dio _dio;
  final String? authToken;

  Map<String, String> get _headers {
    final headers = <String, String>{
      'x-subdomain': DriverPlatformConstants.platformSubdomain,
    };
    final token = authToken;
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  Options get _options => Options(headers: _headers);

  Future<Map<String, dynamic>> _unwrap(
    Response<Map<String, dynamic>> response,
  ) async {
    return response.data ?? {};
  }

  List<dynamic> _extractList(Map<String, dynamic> data, List<String> keys) {
    if (data['ok'] != true) return [];
    for (final key in keys) {
      final value = data[key];
      if (value is List) return value;
    }
    return [];
  }

  // ── Auth (official Lonaliza Captain platform) ────────────────────────────

  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '$_driverApiPrefix/auth/login',
      data: {
        'email': email,
        'password': password,
      },
      options: _options,
    );
    return _unwrap(response);
  }

  Future<Map<String, dynamic>> registerAuth(
    Map<String, dynamic> body,
  ) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '$_driverApiPrefix/auth/register',
      data: body,
      options: _options,
    );
    return _unwrap(response);
  }

  Future<Map<String, dynamic>> registerFcmToken(
    String supplierId,
    String token,
  ) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '$_driverApiPrefix/fcm-token',
        data: {'supplierId': supplierId, 'fcmToken': token},
        options: _options,
      );
      return _unwrap(response);
    } catch (_) {
      return {'ok': false};
    }
  }

  // ── Commission & profile ────────────────────────────────────────────────────

  Future<Map<String, dynamic>> fetchCommission() async {
    final response = await _dio.get<Map<String, dynamic>>(
      '$_driverApiPrefix/commission',
      options: _options,
    );
    return _unwrap(response);
  }

  Future<Map<String, dynamic>> registerSupplier(
    Map<String, dynamic> body,
  ) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '$_driverApiPrefix/register',
      data: body,
      options: _options,
    );
    return _unwrap(response);
  }

  Future<Map<String, dynamic>> fetchProfile(String supplierId) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '$_driverApiPrefix/profile',
      queryParameters: {'supplierId': supplierId},
      options: _options,
    );
    return _unwrap(response);
  }

  // ── Catalog & routes ────────────────────────────────────────────────────────

  Future<Map<String, dynamic>> fetchCatalog() async {
    final response = await _dio.get<Map<String, dynamic>>(
      '$_driverApiPrefix/catalog',
      options: _options,
    );
    return _unwrap(response);
  }

  Future<Map<String, dynamic>> fetchEnrichedCatalog({String? supplierId}) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '$_driverApiPrefix/catalog/enriched',
      queryParameters: {
        if (supplierId != null) 'supplierId': supplierId,
      },
      options: _options,
    );
    return _unwrap(response);
  }

  Future<List<dynamic>> fetchRoutes() async {
    final data = await _unwrap(
      await _dio.get<Map<String, dynamic>>(
        '$_driverApiPrefix/routes',
        options: _options,
      ),
    );
    return _extractList(data, ['routes', 'list']);
  }

  Future<List<dynamic>> fetchRoutePricing(
    String supplierId, {
    String? routeId,
  }) async {
    final data = await _unwrap(
      await _dio.get<Map<String, dynamic>>(
        '$_driverApiPrefix/route-pricing',
        queryParameters: {
          'supplierId': supplierId,
          if (routeId != null) 'routeId': routeId,
        },
        options: _options,
      ),
    );
    return _extractList(data, ['pricing', 'list']);
  }

  Future<Map<String, dynamic>> upsertRoutePricing(
    String supplierId,
    Map<String, dynamic> body,
  ) async {
    final response = await _dio.put<Map<String, dynamic>>(
      '$_driverApiPrefix/route-pricing',
      data: {'supplierId': supplierId, ...body},
      options: _options,
    );
    return _unwrap(response);
  }

  Future<Map<String, dynamic>> createManualRoute(
    String supplierId, {
    required String fromZoneId,
    required String toZoneId,
    required double basePrice,
    String? fromZoneName,
    String? toZoneName,
    String? city,
    double? estimatedDistanceKm,
    int? estimatedDurationMinutes,
    String? vehicleClassId,
    String? currency,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '$_driverApiPrefix/routes',
      data: {
        'supplierId': supplierId,
        'fromZoneId': fromZoneId,
        'toZoneId': toZoneId,
        'basePrice': basePrice,
        if (fromZoneName != null) 'fromZoneName': fromZoneName,
        if (toZoneName != null) 'toZoneName': toZoneName,
        if (city != null) 'city': city,
        if (estimatedDistanceKm != null) 'estimatedDistanceKm': estimatedDistanceKm,
        if (estimatedDurationMinutes != null) 'estimatedDurationMinutes': estimatedDurationMinutes,
        if (vehicleClassId != null) 'vehicleClassId': vehicleClassId,
        if (currency != null) 'currency': currency,
      },
      options: _options,
    );
    return _unwrap(response);
  }


  Future<Map<String, dynamic>> generateAiRoutes(
    String supplierId, {
    required String city,
    double? basePriceShort,
    double? pricePerKm,
    int? routeCount,
    String? pricingPreset,
    String? prompt,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '$_driverApiPrefix/ai-route-agent',
      data: {
        'supplierId': supplierId,
        'city': city,
        if (basePriceShort != null) 'basePriceShort': basePriceShort,
        if (pricePerKm != null) 'pricePerKm': pricePerKm,
        if (routeCount != null) 'routeCount': routeCount,
        if (pricingPreset != null) 'pricingPreset': pricingPreset,
        if (prompt != null) 'prompt': prompt,
      },
      options: _options,
    );
    return _unwrap(response);
  }

  Future<Map<String, dynamic>> generateAiTours(
    String supplierId, {
    required String city,
    double? baseFullDayPrice,
    double? extraHourPrice,
    int? tourCount,
    String? prompt,
    String? title,
    String? stopsDetails,
    String? paidActivities,
    int? durationHours,
    bool? isCustomTour,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '$_driverApiPrefix/ai-tour-agent',
      data: {
        'supplierId': supplierId,
        'city': city,
        if (baseFullDayPrice != null) 'baseFullDayPrice': baseFullDayPrice,
        if (extraHourPrice != null) 'extraHourPrice': extraHourPrice,
        if (tourCount != null) 'tourCount': tourCount,
        if (prompt != null) 'prompt': prompt,
        if (title != null) 'title': title,
        if (stopsDetails != null) 'stopsDetails': stopsDetails,
        if (paidActivities != null) 'paidActivities': paidActivities,
        if (durationHours != null) 'durationHours': durationHours,
        if (isCustomTour != null) 'isCustomTour': isCustomTour,
      },
      options: _options,
    );
    return _unwrap(response);
  }

  // ── Fleet ───────────────────────────────────────────────────────────────────

  Future<List<dynamic>> fetchFleet(String supplierId) async {
    final data = await _unwrap(
      await _dio.get<Map<String, dynamic>>(
        '$_driverApiPrefix/fleet',
        queryParameters: {'supplierId': supplierId},
        options: _options,
      ),
    );
    return _extractList(data, ['vehicles', 'fleet', 'list']);
  }

  Future<Map<String, dynamic>> addFleetVehicle(
    String supplierId,
    Map<String, dynamic> body,
  ) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '$_driverApiPrefix/fleet',
      data: {'supplierId': supplierId, ...body},
      options: _options,
    );
    return _unwrap(response);
  }

  Future<Map<String, dynamic>> submitNewVehicleClass(
    String supplierId,
    Map<String, dynamic> body,
  ) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '$_driverApiPrefix/fleet/new-class',
      data: {'supplierId': supplierId, ...body},
      options: _options,
    );
    return _unwrap(response);
  }

  Future<Map<String, dynamic>> updateFleetPricing(
    String supplierId,
    String vehicleId,
    Map<String, dynamic> catalogPricing,
  ) async {
    final response = await _dio.patch<Map<String, dynamic>>(
      '$_driverApiPrefix/fleet/$vehicleId/pricing',
      data: {
        'supplierId': supplierId,
        'catalogPricing': catalogPricing,
      },
      options: _options,
    );
    return _unwrap(response);
  }

  Future<Map<String, dynamic>> patchFleetVehicle(
    String supplierId,
    String vehicleId,
    Map<String, dynamic> body,
  ) async {
    final response = await _dio.patch<Map<String, dynamic>>(
      '$_driverApiPrefix/fleet/$vehicleId',
      data: {'supplierId': supplierId, ...body},
      options: _options,
    );
    return _unwrap(response);
  }

  // ── Tour offers ─────────────────────────────────────────────────────────────

  Future<List<dynamic>> fetchTourOffers(String supplierId) async {
    final data = await _unwrap(
      await _dio.get<Map<String, dynamic>>(
        '$_driverApiPrefix/tour-offers',
        queryParameters: {'supplierId': supplierId},
        options: _options,
      ),
    );
    return _extractList(data, ['offers', 'list']);
  }

  Future<Map<String, dynamic>> createTourOffer(
    String supplierId,
    Map<String, dynamic> body,
  ) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '$_driverApiPrefix/tour-offers',
      data: {'supplierId': supplierId, ...body},
      options: _options,
    );
    return _unwrap(response);
  }

  Future<Map<String, dynamic>> createManualTour(
    String supplierId, {
    required String titleAr,
    String? titleEn,
    String? destination,
    required double price,
    int? durationHours,
    List<String>? itinerary,
    String? vehicleClassId,
    String? currency,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '$_driverApiPrefix/tour-offers',
      data: {
        'supplierId': supplierId,
        'isNewTour': true,
        'titleAr': titleAr,
        if (titleEn != null) 'titleEn': titleEn,
        if (destination != null) 'destination': destination,
        'price': price,
        if (durationHours != null) 'durationHours': durationHours,
        if (itinerary != null) 'itinerary': itinerary,
        if (vehicleClassId != null) 'vehicleClassId': vehicleClassId,
        if (currency != null) 'currency': currency,
      },
      options: _options,
    );
    return _unwrap(response);
  }


  // ── Bookings ────────────────────────────────────────────────────────────────

  Future<List<dynamic>> fetchAssignments(String supplierId) async {
    final data = await _unwrap(
      await _dio.get<Map<String, dynamic>>(
        '$_driverApiPrefix/assignments',
        queryParameters: {'supplierId': supplierId},
        options: _options,
      ),
    );
    return _extractList(data, ['list']);
  }

  Future<List<dynamic>> fetchActiveBookings(String supplierId) async {
    final data = await _unwrap(
      await _dio.get<Map<String, dynamic>>(
        '$_driverApiPrefix/bookings/active',
        queryParameters: {'supplierId': supplierId},
        options: _options,
      ),
    );
    return _extractList(data, ['list']);
  }

  Future<List<dynamic>> fetchBookingHistory(String supplierId) async {
    final data = await _unwrap(
      await _dio.get<Map<String, dynamic>>(
        '$_driverApiPrefix/bookings/history',
        queryParameters: {'supplierId': supplierId},
        options: _options,
      ),
    );
    return _extractList(data, ['list', 'history']);
  }

  Future<Map<String, dynamic>> updateBookingStatus(
    String bookingId,
    String status, {
    String? supplierId,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '$_driverApiPrefix/bookings/$bookingId/status',
      data: {
        'to': status,
        if (supplierId != null) 'supplierId': supplierId,
      },
      options: _options,
    );
    return _unwrap(response);
  }

  Future<Map<String, dynamic>> completeBooking(
    String bookingId, {
    String? supplierId,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '$_driverApiPrefix/bookings/$bookingId/complete',
      data: {if (supplierId != null) 'supplierId': supplierId},
      options: _options,
    );
    return _unwrap(response);
  }

  // ── Earnings & payouts ────────────────────────────────────────────────────

  Future<Map<String, dynamic>> fetchAnalytics(String supplierId) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '$_driverApiPrefix/analytics',
      queryParameters: {'supplierId': supplierId},
      options: _options,
    );
    final data = await _unwrap(response);
    return data['analytics'] as Map<String, dynamic>? ?? data;
  }

  Future<Map<String, dynamic>> fetchEarnings(String supplierId) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '$_driverApiPrefix/earnings',
      queryParameters: {'supplierId': supplierId},
      options: _options,
    );
    return _unwrap(response);
  }

  Future<Map<String, dynamic>> updatePayout(
    String supplierId,
    Map<String, String> payoutDetails,
  ) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '$_driverApiPrefix/payout',
      data: {'supplierId': supplierId, 'payoutDetails': payoutDetails},
      options: _options,
    );
    return _unwrap(response);
  }

  Future<List<dynamic>> fetchPayouts(String supplierId) async {
    final data = await _unwrap(
      await _dio.get<Map<String, dynamic>>(
        '$_driverApiPrefix/payouts',
        queryParameters: {'supplierId': supplierId},
        options: _options,
      ),
    );
    return _extractList(data, ['payouts', 'list']);
  }

  // ── Drivers (company accounts) ──────────────────────────────────────────────

  Future<List<dynamic>> fetchDrivers(String supplierId) async {
    final data = await _unwrap(
      await _dio.get<Map<String, dynamic>>(
        '$_driverApiPrefix/drivers',
        queryParameters: {'supplierId': supplierId},
        options: _options,
      ),
    );
    return _extractList(data, ['drivers', 'list']);
  }

  Future<Map<String, dynamic>> addDriver(
    String supplierId,
    Map<String, dynamic> body,
  ) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '$_driverApiPrefix/drivers',
      data: {'supplierId': supplierId, ...body},
      options: _options,
    );
    return _unwrap(response);
  }

  // ── Documents & upload ──────────────────────────────────────────────────────

  Future<Map<String, dynamic>> uploadDocuments(
    String supplierId,
    List<Map<String, dynamic>> docs,
  ) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '$_driverApiPrefix/documents',
      data: {'supplierId': supplierId, 'docs': docs},
      options: _options,
    );
    return _unwrap(response);
  }

  Future<Map<String, dynamic>> uploadFile(File file) async {
    final bytes = await file.readAsBytes();
    final filename = file.path.split('/').last;
    final response = await _dio.post<Map<String, dynamic>>(
      '$_driverApiPrefix/upload',
      data: {
        'filename': filename,
        'dataBase64': base64Encode(bytes),
        'mimeType': _mimeForFilename(filename),
      },
      options: _options,
    );
    return _unwrap(response);
  }

  String _mimeForFilename(String filename) {
    final lower = filename.toLowerCase();
    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.webp')) return 'image/webp';
    if (lower.endsWith('.pdf')) return 'application/pdf';
    return 'image/jpeg';
  }

  // ── Telemetry ───────────────────────────────────────────────────────────────

  Future<Map<String, dynamic>> postTelemetry(Map<String, dynamic> body) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '$_driverApiPrefix/telemetry',
      data: body,
      options: _options,
    );
    return _unwrap(response);
  }

  Future<Map<String, dynamic>> generateAiVehicleSpecs({
    String? promptText,
    String? voiceTranscript,
    List<String>? imageUrls,
    String? videoUrl,
    String? supplierId,
    String? driverName,
    String? driverPhone,
    String? plateNumber,
    bool autoSave = false,
    bool publishToCatalog = false,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '$_driverApiPrefix/ai-fleet-agent',
      data: {
        if (promptText != null) 'promptText': promptText,
        if (voiceTranscript != null) 'voiceTranscript': voiceTranscript,
        if (imageUrls != null) 'images': imageUrls.map((u) => {'url': u}).toList(),
        if (videoUrl != null) 'videoUrl': videoUrl,
        if (supplierId != null) 'supplierId': supplierId,
        if (driverName != null) 'driverName': driverName,
        if (driverPhone != null) 'driverPhone': driverPhone,
        if (plateNumber != null) 'plateNumber': plateNumber,
        'autoSave': autoSave,
        'publishToCatalog': publishToCatalog,
      },
      options: _options,
    );
    return _unwrap(response);
  }

  // ── Live Map & Telemetry ──────────────────────────────────────────────────

  Future<Map<String, dynamic>> fetchLiveMap({String? supplierId}) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '$_driverApiPrefix/live-map',
      queryParameters: {
        if (supplierId != null) 'supplierId': supplierId,
      },
      options: _options,
    );
    return _unwrap(response);
  }

  // ── Live Flight Tracker ───────────────────────────────────────────────────

  Future<Map<String, dynamic>> trackFlight({
    required String flightNumber,
    String? airline,
  }) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '/api/transfers/flight-tracker',
      queryParameters: {
        'flightNumber': flightNumber,
        if (airline != null && airline.isNotEmpty) 'airline': airline,
      },
      options: _options,
    );
    return _unwrap(response);
  }

  // ── Quote Requests & Bidding ──────────────────────────────────────────────

  Future<List<dynamic>> fetchQuoteRequests({String? supplierId}) async {
    final data = await _unwrap(
      await _dio.get<Map<String, dynamic>>(
        '$_driverApiPrefix/quote-requests',
        queryParameters: {
          if (supplierId != null) 'supplierId': supplierId,
        },
        options: _options,
      ),
    );
    return _extractList(data, ['requests', 'list']);
  }

  Future<Map<String, dynamic>> submitQuoteBid({
    required String requestId,
    required String supplierId,
    required double price,
    required String currency,
    String? vehicleId,
    String? notes,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '$_driverApiPrefix/quote-requests',
      data: {
        'requestId': requestId,
        'supplierId': supplierId,
        'price': price,
        'currency': currency,
        if (vehicleId != null) 'vehicleId': vehicleId,
        if (notes != null) 'notes': notes,
      },
      options: _options,
    );
    return _unwrap(response);
  }

  // ── Reviews & Ratings ─────────────────────────────────────────────────────

  Future<Map<String, dynamic>> fetchReviews({String? supplierId}) async {
    final response = await _dio.get<Map<String, dynamic>>(
      '$_driverApiPrefix/reviews',
      queryParameters: {
        if (supplierId != null) 'supplierId': supplierId,
      },
      options: _options,
    );
    return _unwrap(response);
  }

  // ── Sub-driver & Vehicle Booking Dispatch ────────────────────────────────

  Future<Map<String, dynamic>> assignBooking({
    required String bookingId,
    required String supplierId,
    String? driverId,
    String? driverName,
    String? driverPhone,
    String? vehicleId,
    String? vehiclePlate,
    String? vehicleModel,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '$_driverApiPrefix/bookings/$bookingId/assign',
      data: {
        'supplierId': supplierId,
        if (driverId != null) 'driverId': driverId,
        if (driverName != null) 'driverName': driverName,
        if (driverPhone != null) 'driverPhone': driverPhone,
        if (vehicleId != null) 'vehicleId': vehicleId,
        if (vehiclePlate != null) 'vehiclePlate': vehiclePlate,
        if (vehicleModel != null) 'vehicleModel': vehicleModel,
      },
      options: _options,
    );
    return _unwrap(response);
  }

  // ── AI Tour Generation ────────────────────────────────────────────────────

  Future<Map<String, dynamic>> generateAiTour({
    required String title,
    required String city,
    required int durationDays,
    String? theme,
    String? language,
    String? supplierId,
    bool publishToCatalog = true,
    String? stopsDetails,
    String? paidActivities,
    int? durationHours,
    bool? isCustomTour,
    double? baseFullDayPrice,
  }) async {
    final response = await _dio.post<Map<String, dynamic>>(
      '$_driverApiPrefix/ai-tour-agent',
      data: {
        'title': title,
        'city': city,
        'durationDays': durationDays,
        if (theme != null) 'theme': theme,
        if (language != null) 'language': language,
        if (supplierId != null) 'supplierId': supplierId,
        'publishToCatalog': publishToCatalog,
        if (stopsDetails != null) 'stopsDetails': stopsDetails,
        if (paidActivities != null) 'paidActivities': paidActivities,
        if (durationHours != null) 'durationHours': durationHours,
        if (isCustomTour != null) 'isCustomTour': isCustomTour,
        if (baseFullDayPrice != null) 'baseFullDayPrice': baseFullDayPrice,
      },
      options: _options,
    );
    return _unwrap(response);
  }
}
