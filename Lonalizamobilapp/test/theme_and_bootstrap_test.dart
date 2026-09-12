import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:liotrip/core/bootstrap/app_bootstrap.dart';
import 'package:liotrip/core/theme/lonaliza_theme.dart';
import 'package:liotrip/l10n/app_localizations_en.dart';

void main() {
  test('flavor display name is Lonaliza and theme is royal purple on white', () {
    expect(LonalizaTheme.displayName, 'Lonaliza');
    expect(LonalizaColors.royalPurple, const Color(0xFF2E1065));
    expect(LonalizaTheme.light().scaffoldBackgroundColor, LonalizaColors.page);
    expect(AppLocalizationsEn().appTitle, 'Lonaliza');
    expect(AppLocalizationsEn().appTitle.contains('LioTrip'), isFalse);
  });

  test('unknown locale from bootstrap falls back without crash', () {
    const bootstrap = AppBootstrap(
      services: ['flight'],
      locales: ['ar', 'en'],
      currencies: ['USD'],
    );
    expect(bootstrap.resolveLocale('xx'), 'ar');
  });

  test('disabling cars in bootstrap omits the cars service', () {
    final bootstrap = AppBootstrap.fromJson({
      'ok': true,
      'services': [
        {'key': 'flight'},
        {'key': 'hotel'},
      ],
      'locales': ['ar', 'en'],
      'currencies': ['USD'],
    });
    expect(bootstrap.isServiceEnabled('cars'), isFalse);
    expect(bootstrap.isServiceEnabled('flight'), isTrue);
  });
}
