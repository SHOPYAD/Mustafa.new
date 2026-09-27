import 'dart:convert';

import 'package:flutter_riverpod/legacy.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../data/services/driver_api.dart';
import '../../presentation/providers/app_locale_provider.dart';

const _supplierIdKey = 'driver_supplier_id';
const _authTokenKey = 'driver_auth_token';
const _profileKey = 'driver_profile_snapshot';

/// Normalizes `/profile` API payload into a flat supplier map for [DriverProfileSnapshot].
Map<String, dynamic> parseSupplierProfileMap(Map<String, dynamic> data) {
  final supplier = data['supplier'] as Map<String, dynamic>?;
  if (supplier != null) {
    final docs =
        data['documents'] as List? ?? supplier['documents'] as List? ?? [];
    return {
      ...supplier,
      'documentsSubmitted': docs.isNotEmpty,
    };
  }
  return data['profile'] as Map<String, dynamic>? ?? data;
}

/// Snapshot of supplier profile returned from API after registration/login.
class DriverProfileSnapshot {
  const DriverProfileSnapshot({
    this.legalName,
    this.tradeName,
    this.status = 'pending',
    this.accountType,
    this.rating,
    this.completedTrips,
    this.photoUrl,
    this.logoUrl,
    this.documentsSubmitted = false,
  });

  static double? _safeDouble(dynamic val) {
    if (val == null) return null;
    if (val is num) return val.toDouble();
    if (val is String) return double.tryParse(val);
    if (val is Map) {
      final avg = val['avg'] ?? val['average'] ?? val['score'] ?? val['rating'];
      if (avg is num) return avg.toDouble();
      if (avg is String) return double.tryParse(avg);
    }
    return null;
  }

  static int? _safeInt(dynamic val) {
    if (val == null) return null;
    if (val is int) return val;
    if (val is num) return val.toInt();
    if (val is String) return int.tryParse(val);
    if (val is Map) {
      final count = val['count'] ?? val['total'];
      if (count is num) return count.toInt();
      if (count is String) return int.tryParse(count);
    }
    return null;
  }

  factory DriverProfileSnapshot.fromJson(Map<String, dynamic> json) {
    final docs = json['documents'] as List?;
    return DriverProfileSnapshot(
      legalName: json['legalName'] as String?,
      tradeName: json['tradeName'] as String?,
      status: (json['status'] as String?)?.toLowerCase() ?? 'pending',
      accountType: json['accountType'] as String?,
      rating: _safeDouble(json['rating']) ?? 5.0,
      completedTrips: _safeInt(json['completedTrips']) ?? 0,
      photoUrl:
          json['photoUrl'] as String? ?? json['profilePhotoUrl'] as String?,
      logoUrl: json['logoUrl'] as String?,
      documentsSubmitted:
          json['documentsSubmitted'] as bool? ?? (docs?.isNotEmpty == true),
    );
  }

  final String? legalName;
  final String? tradeName;
  final String status;
  final String? accountType;
  final double? rating;
  final int? completedTrips;
  final String? photoUrl;
  final String? logoUrl;
  final bool documentsSubmitted;

  bool get isApproved => status == 'approved' || status == 'active';
  bool get isPending => status == 'pending' || status == 'review';
  bool get isCompany => accountType == 'company';

  String get displayName => tradeName?.trim().isNotEmpty == true
      ? tradeName!
      : (legalName ?? '');

  Map<String, dynamic> toJson() => {
        'legalName': legalName,
        'tradeName': tradeName,
        'status': status,
        'accountType': accountType,
        'rating': rating,
        'completedTrips': completedTrips,
        'photoUrl': photoUrl,
        'logoUrl': logoUrl,
        'documentsSubmitted': documentsSubmitted,
      };
}

class DriverSessionState {
  const DriverSessionState({
    this.supplierId,
    this.authToken,
    this.profile,
  });

  final String? supplierId;
  final String? authToken;
  final DriverProfileSnapshot? profile;

  bool get isRegistered =>
      supplierId != null &&
      supplierId!.isNotEmpty &&
      authToken != null &&
      authToken!.isNotEmpty;

  bool get needsOnboarding =>
      isRegistered && (profile == null || !profile!.documentsSubmitted);

  bool get isPendingApproval =>
      isRegistered && profile != null && profile!.isPending;
}

final driverSessionProvider =
    StateNotifierProvider<DriverSessionNotifier, DriverSessionState>(
  (ref) => DriverSessionNotifier(ref.watch(sharedPreferencesProvider)),
);

class DriverSessionNotifier extends StateNotifier<DriverSessionState> {
  DriverSessionNotifier(this._prefs)
      : super(
          DriverSessionState(
            supplierId: _prefs.getString(_supplierIdKey),
            authToken: _prefs.getString(_authTokenKey),
            profile: _loadProfile(_prefs),
          ),
        );

  final SharedPreferences _prefs;

  static DriverProfileSnapshot? _loadProfile(SharedPreferences prefs) {
    final raw = prefs.getString(_profileKey);
    if (raw == null || raw.isEmpty) return null;
    try {
      return DriverProfileSnapshot.fromJson(
        jsonDecode(raw) as Map<String, dynamic>,
      );
    } catch (_) {
      return null;
    }
  }

  Future<void> setSupplierId(String supplierId) async {
    await _prefs.setString(_supplierIdKey, supplierId);
    state = DriverSessionState(
      supplierId: supplierId,
      authToken: state.authToken,
      profile: state.profile,
    );
  }

  Future<void> setAuthToken(String token) async {
    await _prefs.setString(_authTokenKey, token);
    state = DriverSessionState(
      supplierId: state.supplierId,
      authToken: token,
      profile: state.profile,
    );
  }

  Future<void> setAuthSession({
    required String supplierId,
    required String authToken,
    DriverProfileSnapshot? profile,
  }) async {
    await _prefs.setString(_supplierIdKey, supplierId);
    await _prefs.setString(_authTokenKey, authToken);
    if (profile != null) {
      await _prefs.setString(_profileKey, jsonEncode(profile.toJson()));
    }
    state = DriverSessionState(
      supplierId: supplierId,
      authToken: authToken,
      profile: profile ?? state.profile,
    );
  }

  Future<void> setProfile(DriverProfileSnapshot profile) async {
    await _prefs.setString(_profileKey, jsonEncode(profile.toJson()));
    state = DriverSessionState(
      supplierId: state.supplierId,
      authToken: state.authToken,
      profile: profile,
    );
  }

  Future<void> updateProfileFromApi(Map<String, dynamic> data) async {
    await setProfile(
      DriverProfileSnapshot.fromJson(parseSupplierProfileMap(data)),
    );
  }

  Future<void> refreshFromApi(DriverApi api) async {
    final supplierId = state.supplierId;
    if (supplierId == null || supplierId.isEmpty) return;
    try {
      final data = await api.fetchProfile(supplierId);
      await updateProfileFromApi(data);
    } catch (_) {
      // Keep cached profile when offline.
    }
  }

  Future<void> clear() async {
    await _prefs.remove(_supplierIdKey);
    await _prefs.remove(_authTokenKey);
    await _prefs.remove(_profileKey);
    state = const DriverSessionState();
  }
}
