import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../presentation/providers/app_locale_provider.dart';

const _catalogCacheKey = 'driver_catalog_cache_v1';
const _catalogCacheTsKey = 'driver_catalog_cache_ts_v1';
const _catalogCacheTtl = Duration(hours: 12);

class DriverCatalogCache {
  DriverCatalogCache(this._prefs);

  final SharedPreferences _prefs;

  Future<void> save(Map<String, dynamic> catalog) async {
    await _prefs.setString(_catalogCacheKey, jsonEncode(catalog));
    await _prefs.setInt(
      _catalogCacheTsKey,
      DateTime.now().millisecondsSinceEpoch,
    );
  }

  Map<String, dynamic>? readIfFresh() {
    final raw = _prefs.getString(_catalogCacheKey);
    final ts = _prefs.getInt(_catalogCacheTsKey);
    if (raw == null || ts == null) return null;

    final age = DateTime.now().millisecondsSinceEpoch - ts;
    if (age > _catalogCacheTtl.inMilliseconds) return null;

    try {
      return jsonDecode(raw) as Map<String, dynamic>;
    } catch (_) {
      return null;
    }
  }

  Future<void> clear() async {
    await _prefs.remove(_catalogCacheKey);
    await _prefs.remove(_catalogCacheTsKey);
  }
}

final driverCatalogCacheProvider = Provider<DriverCatalogCache>((ref) {
  return DriverCatalogCache(ref.watch(sharedPreferencesProvider));
});
