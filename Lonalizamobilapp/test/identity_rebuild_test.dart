import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:liotrip/core/auth/auth_error_mapper.dart';
import 'package:liotrip/core/constants/app_constants.dart';
import 'package:liotrip/core/navigation/native_href.dart';
import 'package:liotrip/data/models/flights/flight_price_confirm_result_model.dart';

void main() {
  test('mobile BFF URLs stay on lonaliza.com and never point at a LAN host', () {
    expect(AppConstants.mobileApiBase, 'https://lonaliza.com');
    expect(AppConstants.communityFeedUrl.contains('/api/mobile/v1/community/feed'), isTrue);
    expect(AppConstants.communityPublishUrl.contains('/community/publish'), isTrue);
    expect(AppConstants.communityCommentsUrl.contains('/community/comments'), isTrue);
    expect(AppConstants.aiSalesChatUrl.contains('/ai/sales-chat'), isTrue);
    expect(AppConstants.aiSearchAgentUrl.contains('/ai/search-agent'), isTrue);
    expect(AppConstants.accountInboxUrl.contains('/account/inbox'), isTrue);
    expect(AppConstants.communityBuddiesUrl.contains('/community/buddies'), isTrue);
    expect(AppConstants.communityCreatorStatsUrl.contains('/creator/stats'), isTrue);
    expect(AppConstants.giftCardsUrl.contains('/gift-cards'), isTrue);
    expect(AppConstants.accountRecentlyViewedUrl.contains('/recently-viewed'), isTrue);
    expect(AppConstants.accountCardsUrl.contains('/account/cards'), isTrue);
    expect(AppConstants.flightExtrasUrl.contains('/flights/extras'), isTrue);
    expect(AppConstants.flightAncillaryUrl.contains('/flights/ancillary'), isTrue);
    expect(AppConstants.homeFeaturedUrl.contains('/home/featured'), isTrue);
    for (final url in [
      AppConstants.communityFeedUrl,
      AppConstants.aiSalesChatUrl,
      AppConstants.accountInboxUrl,
      AppConstants.flightSearchUrl,
    ]) {
      expect(url.contains('192.168.1.7'), isFalse);
      expect(url.contains('lonaliza.com'), isTrue);
    }
  });

  test('auth mapper never returns DioException text', () {
    expect(AuthErrorMapper.map(Exception('DioException [bad response]'), password: '123'), AuthErrorMapper.shortPassword);
    expect(AuthErrorMapper.map(Exception('DioException'), password: '12345678'), isNot(contains('DioException')));
  });

  test('zero verifiedTotal is a failed quote', () {
    final result = FlightPriceConfirmResultModel.fromJson({
      'verifiedTotal': 0,
      'cachedTotal': 80,
      'bookable': true,
      'changed': false,
      'currency': 'USD',
    });
    expect(result.verifiedTotal, 0);
    expect(result.bookable, isFalse);
  });

  test('AI and search hrefs stay on native routes', () {
    expect(nativePathFromHref('/ai-chat'), '/ai');
    expect(nativePathFromHref('/community'), '/community');
    expect(nativePathFromHref('/community/reels'), '/community/reels');
    expect(nativePathFromHref('/flights/search?from=IST'), '/flights/search');
    expect(nativePathFromIntent('hotel'), '/hotels');
  });

  test('router and identity sources drop Trip.com / LioTrip / hardcoded fare / SiteWebView for AI', () {
    final files = [
      'lib/presentation/providers/router_providers.dart',
      'lib/presentation/features/auth/views/auth_page.dart',
      'lib/presentation/features/home/views/home_page.dart',
      'lib/presentation/features/flights/widgets/addons/flight_addons_bottom_bar.dart',
      'lib/presentation/features/flights/views/flight_addons_page.dart',
      'lib/presentation/features/my_trips/views/my_trips_page.dart',
      'lib/presentation/features/flights/widgets/flights_hero_header.dart',
      'test/widget_test.dart',
    ];
    for (final path in files) {
      final source = File(path).readAsStringSync();
      expect(source.contains('Trip.com'), isFalse, reason: path);
      expect(source.contains('Lio' 'Trip'), isFalse, reason: path);
      expect(source.contains('USD619.30'), isFalse, reason: path);
      expect(source.contains(r'$619.30'), isFalse, reason: path);
      expect(source.contains('192.168.1.7'), isFalse, reason: path);
    }
    final router = File('lib/presentation/providers/router_providers.dart').readAsStringSync();
    expect(router.contains('SiteWebViewPage'), isFalse);
    expect(router.contains("path: '/ai'"), isTrue);
    expect(router.contains('InboxPage'), isTrue);
    expect(router.contains('CommunityPage'), isTrue);
    expect(router.contains('AiChatPage'), isTrue);
    final addons = File('lib/presentation/features/flights/views/flight_addons_page.dart').readAsStringSync();
    expect(addons.contains('FlightAirhelpCard'), isFalse);
    expect(addons.contains('AirHelp'), isFalse);
    final plist = File('ios/Runner/Info.plist').readAsStringSync();
    expect(plist.contains('<string>lonaliza</string>'), isTrue);
    expect(plist.contains('CFBundleURLSchemes'), isTrue);
  });
}
