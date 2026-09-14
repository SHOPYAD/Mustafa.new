import 'package:flutter_test/flutter_test.dart';
import 'package:lonaliza/shell/bottom_nav_sync.dart';
import 'package:lonaliza/shell/webview_intercept.dart';

void main() {
  const tabs = <String>[
    '/',
    '/account?tab=wallet',
    '/community',
    '/account',
    '/menu',
  ];

  group('home root', () {
    test('is only the site root', () {
      expect(isHomeRoot('https://lonaliza.com/'), isTrue);
      expect(isHomeRoot('https://lonaliza.com/?app=1'), isTrue);
      expect(isHomeRoot('/?app=1&locale=ar'), isTrue);
      expect(isHomeRoot('https://lonaliza.com/flights?app=1'), isFalse);
      expect(isHomeRoot('/hotels/'), isFalse);
      expect(roleForUrl('/'), BottomNavRole.home);
      expect(activeTabIndex('https://lonaliza.com/?app=1', tabs), 0);
    });
  });

  group('deep routes', () {
    test('do not keep home highlighted', () {
      expect(roleForUrl('/flights'), BottomNavRole.more);
      expect(roleForUrl('/flights/search?from=IST'), BottomNavRole.more);
      expect(roleForUrl('/flights/booking?id=abc'), BottomNavRole.more);
      expect(roleForUrl('/hotels/book?app=1'), BottomNavRole.more);
      expect(roleForUrl('/cars'), BottomNavRole.more);
      expect(roleForUrl('/visa?type=schengen'), BottomNavRole.more);
      expect(activeTabIndex('https://lonaliza.com/flights?app=1', tabs), 4);
      expect(activeTabIndex('https://lonaliza.com/flights?app=1', tabs), isNot(0));
    });

    test('map wallet community and account including subpages', () {
      expect(roleForUrl('/account?tab=wallet&app=1'), BottomNavRole.wallet);
      expect(roleForUrl('/community/reels'), BottomNavRole.community);
      expect(roleForUrl('/account/bookings/xyz'), BottomNavRole.account);
      expect(roleForUrl('/account/chat/1'), BottomNavRole.account);
      expect(activeTabIndex('/account?tab=wallet', tabs), 1);
      expect(activeTabIndex('/community/reels?app=1', tabs), 2);
      expect(activeTabIndex('/account/companions/u1', tabs), 3);
    });

    test('highlights more for menu and legal', () {
      expect(isMenuPath('/menu?app=1'), isTrue);
      expect(roleForUrl('/terms'), BottomNavRole.more);
      expect(roleForUrl('/privacy'), BottomNavRole.more);
      expect(roleForUrl('/gdpr'), BottomNavRole.more);
      expect(activeTabIndex('/menu?app=1', tabs), 4);
    });

    test('unmatched deep routes highlight no root tab', () {
      expect(roleForUrl('/r/ABC'), BottomNavRole.none);
      expect(activeTabIndex('https://lonaliza.com/unknown-surface', tabs), -1);
    });
  });

  group('home tap JS', () {
    test('prefers goHome then client replace, not a full reload first', () {
      final js = WebViewIntercept.goHomeScript();
      expect(js, contains('__lonalizaGoHome'));
      expect(js, contains('__lonalizaNavigate'));
      expect(js, contains("replace: true"));
    });
  });
}
