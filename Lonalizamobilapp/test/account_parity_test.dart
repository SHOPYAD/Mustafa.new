import 'package:flutter_test/flutter_test.dart';
import 'package:liotrip/core/bootstrap/app_bootstrap.dart';
import 'package:liotrip/core/constants/app_constants.dart';

void main() {
  test('account and catalog URLs stay on the mobile BFF', () {
    expect(AppConstants.accountWalletUrl.contains('/api/mobile/v1/account/wallet'), isTrue);
    expect(AppConstants.loyaltyApplyUrl.contains('/api/mobile/v1/account/loyalty/apply'), isTrue);
    expect(AppConstants.toursCatalogUrl.contains('/api/mobile/v1/catalog/tours'), isTrue);
    expect(AppConstants.accountWalletUrl.contains('192.168.1.7'), isFalse);
  });

  test('bootstrap surfaces include website pages the home grid can open', () {
    final bootstrap = AppBootstrap.fromJson({
      'ok': true,
      'services': [
        {'key': 'hotel'},
      ],
      'surfaces': [
        {'key': 'hotel', 'mode': 'native'},
        {'key': 'visa', 'mode': 'webview', 'path': '/visa'},
        {'key': 'ai-chat', 'mode': 'webview', 'path': '/ai-chat'},
      ],
      'locales': ['ar'],
      'currencies': ['USD'],
    });
    expect(bootstrap.surfaces.map((s) => s.key), containsAll(['hotel', 'visa', 'ai-chat']));
  });
}
