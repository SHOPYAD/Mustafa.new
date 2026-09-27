import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:lonaliza/shell/branded_loading_overlay.dart';
import 'package:lonaliza/shell/branded_maintenance_overlay.dart';
import 'package:lonaliza/shell/external_url_handoff.dart';
import 'package:lonaliza/shell/shell_failure.dart';
import 'package:lonaliza/shell/shell_loader_gate.dart';
import 'package:lonaliza/shell/spa_navigation.dart';
import 'package:lonaliza/shell/webview_cache.dart';
import 'package:lonaliza/shell/webview_intercept.dart';
import 'package:webview_flutter/webview_flutter.dart';

void main() {
  group('ShellFailure gateway statuses', () {
    test('intercepts 502 503 504 and related outages', () {
      expect(ShellFailure.isGatewayStatus(502), isTrue);
      expect(ShellFailure.isGatewayStatus(503), isTrue);
      expect(ShellFailure.isGatewayStatus(504), isTrue);
      expect(ShellFailure.isGatewayStatus(500), isTrue);
      expect(ShellFailure.isGatewayStatus(521), isTrue);
    });

    test('does not intercept normal or client errors', () {
      expect(ShellFailure.isGatewayStatus(200), isFalse);
      expect(ShellFailure.isGatewayStatus(301), isFalse);
      expect(ShellFailure.isGatewayStatus(404), isFalse);
      expect(ShellFailure.isGatewayStatus(401), isFalse);
      expect(ShellFailure.isGatewayStatus(null), isFalse);
    });

    test('treats 2xx-4xx as server available except 408', () {
      expect(ShellFailure.isServerAvailableStatus(200), isTrue);
      expect(ShellFailure.isServerAvailableStatus(304), isTrue);
      expect(ShellFailure.isServerAvailableStatus(404), isTrue);
      expect(ShellFailure.isServerAvailableStatus(408), isFalse);
      expect(ShellFailure.isServerAvailableStatus(502), isFalse);
    });
  });

  group('nginx HTML detection', () {
    test('catches raw nginx gateway pages', () {
      expect(
        ShellFailure.looksLikeNginxErrorPage('502 Bad Gateway', 'nginx'),
        isTrue,
      );
      expect(
        ShellFailure.looksLikeNginxErrorPage(
          '503 Service Temporarily Unavailable',
          'nginx',
        ),
        isTrue,
      );
      expect(
        ShellFailure.looksLikeNginxErrorPage('504 Gateway Time-out', 'nginx/1.24'),
        isTrue,
      );
    });

    test('does not flag healthy Lonaliza pages', () {
      expect(
        ShellFailure.looksLikeNginxErrorPage(
          'لوناليزا للسياحة',
          'بطاقات الهدايا المحفظة',
        ),
        isFalse,
      );
    });
  });

  group('main-frame vs asset filtering', () {
    test('ignores Next static and API assets', () {
      expect(
        ShellFailure.isLikelyStaticAsset(Uri.parse('https://lonaliza.com/_next/static/chunk.js')),
        isTrue,
      );
      expect(
        ShellFailure.isLikelyStaticAsset(Uri.parse('https://lonaliza.com/api/mobile/v1/app-config')),
        isTrue,
      );
      expect(
        ShellFailure.isLikelyStaticAsset(Uri.parse('https://lonaliza.com/account?app=1')),
        isFalse,
      );
    });

    test('sameDocument normalizes trailing slashes', () {
      expect(
        ShellFailure.sameDocument(
          Uri.parse('https://lonaliza.com/account'),
          Uri.parse('https://lonaliza.com/account/'),
        ),
        isTrue,
      );
      expect(
        ShellFailure.sameDocument(
          Uri.parse('https://lonaliza.com/'),
          Uri.parse('https://lonaliza.com/community'),
        ),
        isFalse,
      );
    });
  });

  group('resource error classification', () {
    test('maps host/connect to offline', () {
      final failure = ShellFailure.fromWebResourceError(
        const WebResourceError(
          errorCode: -2,
          description: 'net::ERR_INTERNET_DISCONNECTED',
          errorType: WebResourceErrorType.hostLookup,
          isForMainFrame: true,
        ),
      );
      expect(failure.kind, ShellFailureKind.offline);
    });

    test('maps timeout and ssl types', () {
      expect(
        ShellFailure.fromWebResourceError(
          const WebResourceError(
            errorCode: -8,
            description: 'timed out',
            errorType: WebResourceErrorType.timeout,
            isForMainFrame: true,
          ),
        ).kind,
        ShellFailureKind.timeout,
      );
      expect(
        ShellFailure.fromWebResourceError(
          const WebResourceError(
            errorCode: -11,
            description: 'ssl handshake',
            errorType: WebResourceErrorType.failedSslHandshake,
            isForMainFrame: true,
          ),
        ).kind,
        ShellFailureKind.ssl,
      );
    });

    test('unknown URL scheme is ignorable, not a 502 overlay', () {
      const schemeError = WebResourceError(
        errorCode: -10,
        description: 'net::ERR_UNKNOWN_URL_SCHEME',
        errorType: WebResourceErrorType.unsupportedScheme,
        isForMainFrame: true,
        url: 'whatsapp://send?phone=905015709201',
      );
      expect(ExternalUrlHandoff.isIgnorableResourceError(schemeError), isTrue);
      expect(
        ExternalUrlHandoff.isIgnorableResourceError(
          const WebResourceError(
            errorCode: -2,
            description: 'net::ERR_INTERNET_DISCONNECTED',
            errorType: WebResourceErrorType.hostLookup,
            isForMainFrame: true,
          ),
        ),
        isFalse,
      );
    });
  });

  group('loader dismissal contract', () {
    test('hides on the first of finished, pageReady, paint, or timeout', () {
      final finished = ShellLoaderGate();
      finished.documentLoadStarted();
      finished.onPageFinished();
      expect(finished.visible, isFalse);
      expect(finished.interactive, isTrue);
      expect(finished.lastReason, ShellLoaderDismissReason.pageFinished);

      final ready = ShellLoaderGate();
      ready.documentLoadStarted();
      ready.onBridgeReady();
      expect(ready.visible, isFalse);
      expect(ready.lastReason, ShellLoaderDismissReason.pageReady);

      final paint = ShellLoaderGate();
      paint.documentLoadStarted();
      paint.onBridgePaint();
      expect(paint.visible, isFalse);
      expect(paint.lastReason, ShellLoaderDismissReason.paint);

      final timeout = ShellLoaderGate();
      timeout.documentLoadStarted();
      timeout.onSafetyTimeout();
      expect(timeout.visible, isFalse);
      expect(timeout.lastReason, ShellLoaderDismissReason.timeout);
    });

    test('safety timeout is 4-8 seconds, not 14', () {
      expect(ShellLoaderGate.safetyTimeout.inSeconds, inInclusiveRange(4, 8));
      expect(ShellLoaderGate.safetyTimeout.inSeconds, isNot(14));
    });

    test('SPA navStart does not pin a sticky overlay', () {
      final gate = ShellLoaderGate(initiallyVisible: false)..dismiss(
        ShellLoaderDismissReason.pageFinished,
      );
      expect(gate.showOverlayOnSpaNav, isFalse);
      gate.onSpaNavStart();
      expect(gate.visible, isFalse);
      expect(gate.interactive, isTrue);
    });

    test('Android back dismisses a visible loader immediately', () {
      final gate = ShellLoaderGate();
      gate.documentLoadStarted();
      expect(gate.visible, isTrue);
      gate.onBackWhileVisible();
      expect(gate.visible, isFalse);
      expect(gate.interactive, isTrue);
      expect(gate.lastReason, ShellLoaderDismissReason.back);
    });

    test('later signals are no-ops after the first dismiss', () {
      final gate = ShellLoaderGate();
      gate.documentLoadStarted();
      expect(gate.dismiss(ShellLoaderDismissReason.pageFinished), isTrue);
      expect(gate.dismiss(ShellLoaderDismissReason.pageReady), isFalse);
      expect(gate.lastReason, ShellLoaderDismissReason.pageFinished);
    });
  });

  group('injected shell JS', () {
    test('SPA hooks emit paint after nav so the overlay cannot stick', () {
      expect(WebViewIntercept.spaNavHooks, contains("notify('navStart')"));
      expect(WebViewIntercept.spaNavHooks, contains("notify('paint')"));
      expect(WebViewIntercept.nginxAndReadyProbe, contains("'pageReady'"));
      expect(WebViewIntercept.nginxAndReadyProbe, contains("'paint'"));
      expect(WebViewIntercept.nginxAndReadyProbe, contains('502 bad gateway'));
      expect(WebViewIntercept.externalSchemeHandoff, contains("type: 'openExternal'"));
      expect(WebViewIntercept.externalSchemeHandoff, contains('wa.me'));
      expect(WebViewIntercept.externalSchemeHandoff, contains('window.open'));
      expect(WebViewIntercept.clientRouterInstall, contains("href.indexOf('whatsapp:')"));
    });

    test('does not force html touch-action pan-y (breaks horizontal carousels)', () {
      expect(WebViewIntercept.scrollAndShellCss.contains('touch-action: pan-y'), isFalse);
      expect(WebViewIntercept.scrollAndShellCss, contains('overscroll-behavior-y: contain'));
    });

    test('installs goHome / navigate client-router bridge without location.href', () {
      expect(WebViewIntercept.clientRouterInstall, contains('window.__lonalizaGoHome'));
      expect(WebViewIntercept.clientRouterInstall, contains('window.__lonalizaNavigate'));
      expect(WebViewIntercept.clientRouterInstall, contains('__lonalizaNavQueue'));
      expect(WebViewIntercept.clientRouterInstall, contains('ev.preventDefault()'));
      expect(WebViewIntercept.clientRouterInstall.contains('location.href ='), isFalse);
      expect(WebViewIntercept.navigateScript('/account?app=1', 'https://lonaliza.com/account?app=1'),
          contains('__lonalizaNavigate'));
      expect(
        WebViewIntercept.navigateScript('/account?app=1', 'https://lonaliza.com/account?app=1')
            .contains('window.location.href'),
        isFalse,
      );
      expect(WebViewIntercept.goHomeScript(), contains('__lonalizaGoHome'));
    });

    test('keeps WhatsApp scheme clicks on the native handoff path', () {
      expect(WebViewIntercept.clientRouterInstall, contains("href.indexOf('whatsapp:')"));
      expect(WebViewIntercept.externalSchemeHandoff, contains('whatsapp:'));
      expect(WebViewIntercept.externalSchemeHandoff, contains("type: 'openExternal'"));
    });

    test('prefetches menu and ai-chat without cache-busting HTML', () {
      expect(WebViewCachePolicy.androidDocumentMode, 'LOAD_DEFAULT');
      expect(WebViewCachePolicy.passHeadersOnLoadRequest, isFalse);
      expect(WebViewCachePolicy.spaPrefetchPaths, contains('/ai-chat?app=1'));
      expect(WebViewCachePolicy.spaPrefetchPaths, contains('/menu?app=1'));
      expect(WebViewCachePolicy.prefetchScript(), contains('router.prefetch'));
      expect(WebViewCachePolicy.prefetchScript().contains('Date.now'), isFalse);
      expect(WebViewCachePolicy.prefetchScript().contains('cache-bust'), isFalse);
      expect(WebViewCachePolicy.prefetchScript().contains('as = \'document\''), isFalse);
    });

    test('keeps branded canvas on SPA so the WebView never flashes white', () {
      expect(WebViewIntercept.scrollAndShellCss, contains('background-color: #140522'));
    });
  });

  group('SPA navigation policy', () {
    final home = Uri.parse('https://lonaliza.com/?app=1');

    test('same-origin service pages reuse the client router after first paint', () {
      expect(
        SpaNavigation.shouldClientRoute(
          current: home,
          target: Uri.parse('https://lonaliza.com/hotels'),
          pageInteractive: true,
          isMainFrame: true,
        ),
        isTrue,
      );
      expect(
        SpaNavigation.shouldClientRoute(
          current: home,
          target: Uri.parse('https://lonaliza.com/account?tab=wallet&app=1'),
          pageInteractive: true,
          isMainFrame: true,
        ),
        isTrue,
      );
    });

    test('does not intercept iyzico, oauth, API, or cold first load', () {
      expect(
        SpaNavigation.shouldClientRoute(
          current: home,
          target: Uri.parse('https://lonaliza.com/hotels'),
          pageInteractive: false,
          isMainFrame: true,
        ),
        isFalse,
      );
      expect(
        SpaNavigation.mustFullDocument(
          Uri.parse('https://api.iyzipay.com/checkout'),
        ),
        isTrue,
      );
      expect(
        SpaNavigation.mustFullDocument(
          Uri.parse('https://lonaliza.com/api/payments/iyzico/callback'),
        ),
        isTrue,
      );
      expect(
        SpaNavigation.mustFullDocument(
          Uri.parse('https://accounts.google.com/o/oauth2'),
        ),
        isTrue,
      );
    });

    test('withAppParam and home path helpers', () {
      expect(SpaNavigation.withAppParam('/'), '/?app=1');
      expect(SpaNavigation.withAppParam('/account?tab=wallet'), '/account?tab=wallet&app=1');
      expect(SpaNavigation.withAppParam('/?app=1'), '/?app=1');
      expect(SpaNavigation.isHomePath('/'), isTrue);
      expect(SpaNavigation.isHomePath('/?app=1'), isTrue);
      expect(SpaNavigation.isHomePath('/hotels'), isFalse);
    });
  });

  group('external URL scheme handoff', () {
    test('intercepts WhatsApp, tel, mailto, sms, intent, market', () {
      expect(
        ExternalUrlHandoff.shouldHandoff('whatsapp://send?phone=905015709201'),
        isTrue,
      );
      expect(
        ExternalUrlHandoff.shouldHandoff('https://wa.me/905015709201?text=hi'),
        isTrue,
      );
      expect(
        ExternalUrlHandoff.shouldHandoff(
          'https://api.whatsapp.com/send?phone=905015709201',
        ),
        isTrue,
      );
      expect(ExternalUrlHandoff.shouldHandoff('tel:+905015709201'), isTrue);
      expect(ExternalUrlHandoff.shouldHandoff('mailto:info@lonaliza.com'), isTrue);
      expect(ExternalUrlHandoff.shouldHandoff('sms:+905015709201'), isTrue);
      expect(ExternalUrlHandoff.shouldHandoff('market://details?id=com.whatsapp'), isTrue);
      expect(
        ExternalUrlHandoff.shouldHandoff('https://lonaliza.com/hotels?app=1'),
        isFalse,
      );
      expect(
        ExternalUrlHandoff.shouldHandoff('https://web.whatsapp.com/'),
        isFalse,
      );
    });

    test('rewrites Android intent:// WhatsApp links', () {
      expect(
        ExternalUrlHandoff.resolveLaunchUrl(
          'intent://send?phone=905015709201&text=Hello#Intent;scheme=whatsapp;package=com.whatsapp;end',
        ),
        'whatsapp://send?phone=905015709201&text=Hello',
      );
      expect(
        ExternalUrlHandoff.resolveLaunchUrl(
          'intent://send/#Intent;scheme=whatsapp;package=com.whatsapp;S.browser_fallback_url=https%3A%2F%2Fwa.me%2F905015709201;end',
        ),
        'https://wa.me/905015709201',
      );
    });

    test('chrome-error documents are ignored by the shell', () {
      expect(
        ExternalUrlHandoff.isChromeErrorUrl('chrome-error://chromewebdata/'),
        isTrue,
      );
      expect(
        ExternalUrlHandoff.shouldIgnoreWebViewLoad('whatsapp://send?phone=1'),
        isTrue,
      );
      expect(
        ExternalUrlHandoff.shouldIgnoreWebViewLoad('https://lonaliza.com/?app=1'),
        isFalse,
      );
    });

    test('whatsapp:// falls back to wa.me when the app is missing', () {
      expect(
        ExternalUrlHandoff.httpsFallback(
          Uri.parse('whatsapp://send?phone=905015709201&text=Hi'),
        ),
        Uri.parse('https://wa.me/905015709201?text=Hi'),
      );
    });
  });

  testWidgets('loading overlay is branded shimmer, not a circular hostage', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(home: Scaffold(body: BrandedLoadingOverlay())),
    );
    expect(find.text('LONALIZA'), findsOneWidget);
    expect(find.byType(CircularProgressIndicator), findsNothing);
    expect(find.byType(LinearProgressIndicator), findsNothing);
    expect(
      find.descendant(
        of: find.byType(BrandedLoadingOverlay),
        matching: find.byWidgetPredicate(
          (widget) => widget is AbsorbPointer && widget.absorbing,
        ),
      ),
      findsNothing,
    );
    await tester.pump(const Duration(milliseconds: 200));
  });

  testWidgets('maintenance overlay shows branded retry CTA', (tester) async {
    var tapped = false;
    await tester.pumpWidget(
      MaterialApp(
        home: BrandedMaintenanceOverlay(
          failure: ShellFailure.fromHttpStatus(502),
          retrying: false,
          onRetry: () => tapped = true,
        ),
      ),
    );

    expect(find.textContaining('تحديث مجدول'), findsOneWidget);
    expect(find.text('LONALIZA'), findsOneWidget);
    await tester.tap(find.text('إعادة التحميل'));
    expect(tapped, isTrue);
  });
}
