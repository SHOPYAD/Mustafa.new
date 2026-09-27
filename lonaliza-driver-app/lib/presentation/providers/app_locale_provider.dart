import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../l10n/app_localizations.dart';

/// Must be overridden in [main] after [SharedPreferences.getInstance].
final sharedPreferencesProvider = Provider<SharedPreferences>((ref) {
  throw StateError(
    'sharedPreferencesProvider is unset. Override it in main() '
        'with SharedPreferences.getInstance().',
  );
});

const _kLanguageCode = 'app_locale_language_code';
const _kCountryCode = 'app_locale_country_code';

/// Resolves [locale] to one of [AppLocalizations.supportedLocales] (language match).
Locale resolveSupportedLocale(Locale locale) {
  for (final supported in AppLocalizations.supportedLocales) {
    if (supported.languageCode == locale.languageCode) {
      return supported;
    }
  }
  return const Locale('en');
}

Locale _deviceLocaleOrEnglish() {
  final device = WidgetsBinding.instance.platformDispatcher.locale;
  return resolveSupportedLocale(device);
}

Locale? _localeFromPrefs(SharedPreferences prefs) {
  final lang = prefs.getString(_kLanguageCode);
  if (lang == null || lang.isEmpty) return null;
  final country = prefs.getString(_kCountryCode);
  final candidate = country != null && country.isNotEmpty
      ? Locale(lang, country)
      : Locale(lang);
  return resolveSupportedLocale(candidate);
}

/// BCP 47 tag + English fallback for HTTP (e.g. Nominatim).
String acceptLanguageTagForLocale(Locale locale) {
  var tag = locale.toLanguageTag();
  if (tag.isEmpty || tag == 'und') {
    tag = 'en';
  }
  return '$tag,en;q=0.5';
}

/// App UI + HTTP [Accept-Language]: persisted language, else device (mapped to supported).
final appLocaleNotifierProvider = NotifierProvider<AppLocaleNotifier, Locale>(
  AppLocaleNotifier.new,
);

final class AppLocaleNotifier extends Notifier<Locale> {
  @override
  Locale build() {
    final prefs = ref.watch(sharedPreferencesProvider);
    return _localeFromPrefs(prefs) ?? _deviceLocaleOrEnglish();
  }

  /// Persists and applies [locale] (mapped to [AppLocalizations.supportedLocales]).
  Future<void> setLocale(Locale locale) async {
    final resolved = resolveSupportedLocale(locale);
    final prefs = ref.read(sharedPreferencesProvider);
    await prefs.setString(_kLanguageCode, resolved.languageCode);
    if (resolved.countryCode != null && resolved.countryCode!.isNotEmpty) {
      await prefs.setString(_kCountryCode, resolved.countryCode!);
    } else {
      await prefs.remove(_kCountryCode);
    }
    state = resolved;
  }

  /// Clears storage and follows the device locale (still mapped to supported).
  Future<void> clearToDeviceLocale() async {
    final prefs = ref.read(sharedPreferencesProvider);
    await prefs.remove(_kLanguageCode);
    await prefs.remove(_kCountryCode);
    state = _deviceLocaleOrEnglish();
  }
}
