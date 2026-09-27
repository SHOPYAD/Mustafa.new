import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';

import 'shell/bottom_nav_sync.dart';
import 'shell/branded_loading_overlay.dart';
import 'shell/branded_maintenance_overlay.dart';
import 'shell/external_url_handoff.dart';
import 'shell/server_availability.dart';
import 'shell/shell_brand.dart';
import 'shell/shell_failure.dart';
import 'shell/shell_loader_gate.dart';
import 'shell/spa_navigation.dart';
import 'shell/webview_cache.dart';
import 'shell/webview_file_selector.dart';
import 'shell/webview_intercept.dart';

/// Lonaliza Pure Native Shell — 120 FPS, Ultra-Lightweight, Zero-Legacy
class LonalizaShellPage extends StatefulWidget {
  const LonalizaShellPage({super.key});

  @override
  State<LonalizaShellPage> createState() => _LonalizaShellPageState();
}

class _LonalizaShellPageState extends State<LonalizaShellPage>
    with SingleTickerProviderStateMixin, WidgetsBindingObserver {
  late final WebViewController _controller;
  final ShellLoaderGate _loader = ShellLoaderGate();
  ShellFailure? _failure;
  bool _showLoading = true;
  bool _loaderFading = false;
  bool _retrying = false;
  bool _pageInteractive = false;
  bool _filePickerOpen = false;
  bool _showSplash = true;
  int _activeTab = 0;
  int _activeSlideIndex = 0;
  int? _lockedTab;
  DateTime? _tabLockUntil;
  DateTime? _lastTabPointerAt;
  int? _lastTabPointerIndex;
  String _currentUrl = '';
  String _restoreUrl = '';
  Timer? _loadingSafetyTimer;
  Timer? _loaderFadeTimer;
  String? _nativeNoticeTitle;
  Timer? _nativeNoticeTimer;
  String? _lastExternalUrl;
  DateTime? _lastExternalAt;
  String _shellLocale = 'ar';
  Map<String, String> _bridgeTitles = const {
    'home': 'الرئيسية',
    'wallet': 'المحفظة',
    'reels': 'الريلز',
    'me': 'حسابي',
    'more': 'المزيد',
  };
  Map<String, String> _bridgeChrome = const {
    'messageFrom': 'رسالة من {0}',
    'newMessage': 'رسالة جديدة',
  };

  static const String _apiBase = String.fromEnvironment(
    'MOBILE_API_BASE',
    defaultValue: 'https://lonaliza.com',
  );

  static const Color _royalPurple = Color(0xFF2E1065);
  static const Color _royalPurpleDeep = Color(0xFF140522);
  static const Color _amberGold = Color(0xFFF59E0B);
  static const Color _amberGoldLight = Color(0xFFFBBF24);

  Color _bottomNavBg = Colors.white;
  Color _bottomNavActiveColor = _royalPurple;
  Color _bottomNavInactiveColor = const Color(0xFF64748B);

  late AnimationController _splashAnimController;
  late Animation<double> _logoScaleAnim;
  late final PageController _splashPageController;

  // Default Luxury Tabs
  List<Map<String, dynamic>> _tabs = [
    {
      'id': 'tab_home',
      'title': 'الرئيسية',
      'path': '/',
      'icon': Icons.home_outlined,
      'activeIcon': Icons.home_rounded,
    },
    {
      'id': 'tab_wallet',
      'title': 'المحفظة',
      'path': '/account?tab=wallet',
      'icon': Icons.account_balance_wallet_outlined,
      'activeIcon': Icons.account_balance_wallet_rounded,
    },
    {
      'id': 'tab_reels',
      'title': 'الريلز',
      'path': '/community',
      'icon': Icons.play_circle_outline_rounded,
      'activeIcon': Icons.play_circle_fill_rounded,
    },
    {
      'id': 'tab_account',
      'title': 'حسابي',
      'path': '/account',
      'icon': Icons.person_outline_rounded,
      'activeIcon': Icons.person_rounded,
    },
    {
      'id': 'tab_more',
      'title': 'المزيد',
      'path': '/menu',
      'icon': Icons.grid_view_outlined,
      'activeIcon': Icons.grid_view_rounded,
    },
  ];

  // Default Cinematic Splash Slides
  List<Map<String, dynamic>> _slides = [
    {
      'icon': Icons.flight_takeoff_rounded,
      'title': 'رحلات وخدمات سياحية فاخرة في تركيا والعالم',
      'desc': 'طيران، فنادق راقية، سيارات خاصة مع سائق VIP، وباقات متكاملة.',
      'tag': 'Lonaliza VIP Travel',
      'imageUrl': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1000&q=80',
      'animationType': 'cinematic',
      'badgeColor': _amberGold,
    },
    {
      'icon': Icons.account_balance_wallet_rounded,
      'title': 'استرداد نقدي فوري على كل حجز سفر',
      'desc': 'كاش باك حقيقي يدخل محفظتك فوراً عند إتمام أي حجز.',
      'tag': 'Smart Wallet & Cashback',
      'imageUrl': 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1000&q=80',
      'animationType': 'zoom-fade',
      'badgeColor': _amberGold,
    },
    {
      'icon': Icons.auto_awesome_rounded,
      'title': 'مستشارك السياحي الذكي 24/7',
      'desc': 'مساعد ذكاء اصطناعي لتخطيط جدول الرحلة وحجز التذاكر بضغطة زر.',
      'tag': 'Gemini AI Concierge',
      'imageUrl': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&q=80',
      'animationType': 'shimmer-glow',
      'badgeColor': _amberGold,
    },
  ];

  @override
  void initState() {
    super.initState();

    _splashPageController = PageController();

    // Splash logo pulsing animation
    _splashAnimController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..repeat(reverse: true);

    _logoScaleAnim = Tween<double>(begin: 0.96, end: 1.04).animate(
      CurvedAnimation(parent: _splashAnimController, curve: Curves.easeInOutSine),
    );

    WidgetsBinding.instance.addObserver(this);
    _restoreUrl = '$_apiBase/?app=1';
    _currentUrl = _restoreUrl;

    // Fetch dynamic configs live from server
    _fetchLiveStudioConfig();

    // Init WebView, then probe before the first document load.
    _initWebView();
    _bootstrapSession();
  }

  void _initWebView() {
    final controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setUserAgent(
        'Mozilla/5.0 (Linux; Android 14; Mobile; LonalizaApp/2.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36',
      )
      ..setBackgroundColor(ShellBrand.royalPurpleDeep)
      ..addJavaScriptChannel(
        'LonalizaNativeBridge',
        onMessageReceived: (msg) => _handleBridgeMessage(msg.message),
      )
      ..setNavigationDelegate(
        NavigationDelegate(
          onNavigationRequest: _onNavigationRequest,
          onPageStarted: (url) {
            if (_filePickerOpen) return;
            if (ExternalUrlHandoff.shouldIgnoreWebViewLoad(url)) {
              _popChromeErrorIfNeeded(url);
              return;
            }
            _currentUrl = url;
            _syncTabFromUrl(url);
            _loader.documentLoadStarted();
            _pageInteractive = false;
            if (!mounted) return;
            setState(() {
              _failure = null;
              _showLoading = true;
              _loaderFading = false;
            });
            _armLoadingSafety();
          },
          onPageFinished: (url) {
            if (ExternalUrlHandoff.shouldIgnoreWebViewLoad(url)) {
              _popChromeErrorIfNeeded(url);
              return;
            }
            _currentUrl = url;
            _syncTabFromUrl(url);
            _controller.runJavaScript(WebViewIntercept.scrollAndShellCss);
            _controller.runJavaScript(WebViewIntercept.spaNavHooks);
            _controller.runJavaScript(WebViewIntercept.externalSchemeHandoff);
            _controller.runJavaScript(WebViewIntercept.clientRouterInstall);
            _controller.runJavaScript(WebViewIntercept.nginxAndReadyProbe);
            _controller.runJavaScript(WebViewCachePolicy.prefetchScript());
            // First of the dismissal contract: main-frame finish.
            _markInteractive(ShellLoaderDismissReason.pageFinished);
          },
          onUrlChange: (change) {
            final url = change.url ?? '';
            if (ExternalUrlHandoff.shouldIgnoreWebViewLoad(url)) {
              _popChromeErrorIfNeeded(url);
              return;
            }
            if (url.isNotEmpty) {
              _currentUrl = url;
              if (!url.contains('shell-maintenance') && !url.contains('/maintenance')) {
                _restoreUrl = url;
              }
            }
            _syncTabFromUrl(url);
          },
          onHttpError: _handleHttpError,
          onWebResourceError: _handleResourceError,
          onSslAuthError: (error) {
            error.cancel();
            _presentFailure(const ShellFailure(kind: ShellFailureKind.ssl));
          },
        ),
      );

    controller.enableZoom(false);
    controller.setOverScrollMode(WebViewOverScrollMode.ifContentScrolls);

    if (controller.platform is AndroidWebViewController) {
      final androidController = controller.platform as AndroidWebViewController;
      androidController.setVerticalScrollBarEnabled(false);
      androidController.setHorizontalScrollBarEnabled(false);
      androidController.setMediaPlaybackRequiresUserGesture(false);
      androidController.setAllowFileAccess(true);
      androidController.setAllowContentAccess(true);
      androidController.setGeolocationEnabled(true);
      androidController.setUseWideViewPort(true);
      androidController.setOnPlatformPermissionRequest((req) => req.grant());
      // Cache stays LOAD_DEFAULT (plugin has no setCacheMode). Hashed
      // /_next/static assets cache via HTTP; SPA HTML is not cache-busted
      // and must not use LOAD_CACHE_ELSE_NETWORK. Do not pass extra headers
      // on loadRequest — that bypasses HTTP cache. DOM storage stays on.
      // Without this, <input type="file"> taps are silently dropped in Android WebView.
      attachAndroidWebViewFileSelector(
        androidController,
        onPicking: () {
          _filePickerOpen = true;
          _loadingSafetyTimer?.cancel();
          _markInteractive(ShellLoaderDismissReason.back);
        },
        onSettled: () {
          _filePickerOpen = false;
        },
        onError: (msg) {
          controller.runJavaScript(fileSelectorErrorJs(msg));
        },
      );
    }

    try {
      final host = Uri.parse(_apiBase).host;
      WebViewCookieManager().setCookie(
        WebViewCookie(
          name: 'lonaliza_app_shell',
          value: '1',
          domain: host,
          path: '/',
        ),
      );
    } catch (_) {}

    _controller = controller;
  }

  Future<void> _bootstrapSession() async {
    final probe = await ServerAvailability.probe(_apiBase);
    if (!mounted) return;
    if (!probe.ok) {
      _presentFailure(probe.failure!);
      return;
    }
    await _loadSession(_restoreUrl);
  }

  Future<void> _loadSession(String url) async {
    _currentUrl = url;
    _restoreUrl = url;
    _loader.documentLoadStarted();
    _pageInteractive = false;
    if (mounted) {
      setState(() {
        _failure = null;
        _showLoading = true;
        _loaderFading = false;
      });
    }
    _armLoadingSafety();
    // No extra headers: Android WebView skips HTTP cache when loadUrl
    // is given a header map. App mode is already in the UA + cookie.
    // LOAD_DEFAULT + hashed static assets; never cache-bust HTML here.
    assert(!WebViewCachePolicy.passHeadersOnLoadRequest);
    await _controller.loadRequest(Uri.parse(url));
  }

  NavigationDecision _onNavigationRequest(NavigationRequest request) {
    if (ExternalUrlHandoff.shouldHandoff(request.url)) {
      unawaited(_openExternalUrl(request.url));
      return NavigationDecision.prevent;
    }
    final target = Uri.tryParse(request.url);
    if (target == null) return NavigationDecision.navigate;
    final current = Uri.tryParse(
      _currentUrl.isNotEmpty ? _currentUrl : _restoreUrl,
    );
    if (!SpaNavigation.shouldClientRoute(
      current: current ?? Uri.parse(_apiBase),
      target: target,
      pageInteractive: _pageInteractive && _failure == null,
      isMainFrame: request.isMainFrame,
    )) {
      return NavigationDecision.navigate;
    }
    _spaNavigate(SpaNavigation.pathWithQuery(target), replace: false);
    return NavigationDecision.prevent;
  }

  Future<void> _openExternalUrl(String url) async {
    final now = DateTime.now();
    if (_lastExternalUrl == url &&
        _lastExternalAt != null &&
        now.difference(_lastExternalAt!) < const Duration(milliseconds: 800)) {
      return;
    }
    _lastExternalUrl = url;
    _lastExternalAt = now;
    await ExternalUrlHandoff.launchExternal(url);
  }

  void _popChromeErrorIfNeeded(String url) {
    if (!ExternalUrlHandoff.isChromeErrorUrl(url)) return;
    _controller.canGoBack().then((can) {
      if (can) _controller.goBack();
    });
  }

  void _armLoadingSafety() {
    _loadingSafetyTimer?.cancel();
    _loadingSafetyTimer = Timer(ShellLoaderGate.safetyTimeout, () {
      if (!mounted || _failure != null) return;
      // Hard timeout hides the overlay. Never wait on a follow-up probe.
      _markInteractive(ShellLoaderDismissReason.timeout);
    });
  }

  void _markInteractive(ShellLoaderDismissReason reason) {
    if (_failure != null && reason != ShellLoaderDismissReason.failure) return;
    final changed = _loader.dismiss(reason);
    if (!changed && !_showLoading) return;
    _pageInteractive = _loader.interactive;
    _loadingSafetyTimer?.cancel();
    if (!mounted) return;
    if (!_showLoading) return;
    setState(() {
      _showLoading = false;
      _loaderFading = true;
    });
    _loaderFadeTimer?.cancel();
    _loaderFadeTimer = Timer(ShellLoaderGate.fadeDuration, () {
      if (!mounted) return;
      setState(() => _loaderFading = false);
    });
  }

  void _presentFailure(ShellFailure failure) {
    _loaderFadeTimer?.cancel();
    _loadingSafetyTimer?.cancel();
    _loader.dismiss(ShellLoaderDismissReason.failure);
    if (!mounted) return;
    setState(() {
      _failure = failure;
      _showLoading = false;
      _loaderFading = false;
      _retrying = false;
      _pageInteractive = false;
    });
  }

  void _handleHttpError(HttpResponseError error) {
    final status = error.response?.statusCode;
    if (!ShellFailure.isGatewayStatus(status)) return;
    final errorUri = error.response?.uri ?? error.request?.uri;
    if (ShellFailure.isLikelyStaticAsset(errorUri)) return;
    final current = Uri.tryParse(_currentUrl);
    final restore = Uri.tryParse(_restoreUrl);
    if (errorUri != null &&
        current != null &&
        !ShellFailure.sameDocument(errorUri, current) &&
        !ShellFailure.sameDocument(errorUri, restore)) {
      return;
    }
    _presentFailure(ShellFailure.fromHttpStatus(status!));
  }

  void _handleResourceError(WebResourceError error) {
    if (ExternalUrlHandoff.isIgnorableResourceError(error)) return;
    if (!(error.isForMainFrame ?? true)) return;
    _presentFailure(ShellFailure.fromWebResourceError(error));
  }

  Future<void> _retrySession() async {
    if (_retrying) return;
    setState(() => _retrying = true);
    final probe = await ServerAvailability.probe(_apiBase);
    if (!mounted) return;
    if (!probe.ok) {
      setState(() {
        _retrying = false;
        _failure = probe.failure;
      });
      return;
    }
    final target = _restoreUrl.isEmpty ? '$_apiBase/?app=1' : _restoreUrl;
    setState(() => _retrying = false);
    await _loadSession(target);
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state != AppLifecycleState.resumed || _showSplash || _failure != null) {
      return;
    }
    _verifyWarmEntry();
  }

  Future<void> _verifyWarmEntry() async {
    try {
      final raw = await _controller.runJavaScriptReturningResult(
        WebViewIntercept.pageAliveProbe,
      );
      final blob = raw.toString();
      if (ShellFailure.looksLikeNginxErrorPage(blob, blob)) {
        _presentFailure(ShellFailure.fromHttpStatus(502));
        return;
      }
    } catch (_) {
      final probe = await ServerAvailability.probe(_apiBase);
      if (!mounted) return;
      if (!probe.ok) _presentFailure(probe.failure!);
    }
  }

  void _dismissSplash() {
    if (!_showSplash || !mounted) return;
    setState(() {
      _showSplash = false;
      if (_failure == null && !_pageInteractive) {
        _showLoading = true;
        _loaderFading = false;
      }
    });
    _splashAnimController.stop();
  }

  void _syncTabFromUrl(String url) {
    if (url.isEmpty) return;
    final paths = _tabs.map((tab) => tab['path'] as String).toList();
    final next = activeTabIndex(url, paths);
    if (!shouldAcceptUrlTabSync(
      now: DateTime.now(),
      lockUntil: _tabLockUntil,
      lockedTab: _lockedTab,
      urlTab: next,
    )) {
      return;
    }
    if (next != _activeTab && mounted) {
      setState(() => _activeTab = next);
    }
  }

  void _commitTab(int index, String targetUrl) {
    _lockedTab = index;
    _tabLockUntil = DateTime.now().add(const Duration(milliseconds: 1800));
    _currentUrl = targetUrl;
    _restoreUrl = targetUrl;
    if (mounted) setState(() => _activeTab = index);
  }

  String _studioTabTitle(dynamic tab) {
    final ar = tab is Map ? tab['titleAr']?.toString() : null;
    final en = tab is Map ? tab['titleEn']?.toString() : null;
    if (_shellLocale == 'ar') return (ar?.isNotEmpty == true ? ar : en) ?? 'تبويب';
    return (en?.isNotEmpty == true ? en : ar) ?? 'Tab';
  }

  Map<String, dynamic> _localizeTab(Map<String, dynamic> tab) {
    final role = roleForTabPath((tab['path'] ?? '').toString());
    final title = titleForNavRole(role, _bridgeTitles);
    if (title == null || title.isEmpty) return tab;
    return {...tab, 'title': title};
  }

  String _localizedNotice(String sender) {
    if (sender.isNotEmpty) {
      final template = _bridgeChrome['messageFrom'] ?? 'رسالة من {0}';
      return interpolateChrome(template, sender);
    }
    return _bridgeChrome['newMessage'] ?? 'رسالة جديدة';
  }

  void _applyWebLocale(Map data) {
    final next = data['locale']?.toString() ?? '';
    if (next == 'ar' || next == 'en' || next == 'tr' || next == 'fr') {
      _shellLocale = next;
    }
    final titles = parseBridgeStringMap(data['titles']);
    if (titles.isNotEmpty) {
      _bridgeTitles = {..._bridgeTitles, ...titles};
    }
    final chrome = parseBridgeStringMap(data['chrome']);
    if (chrome.isNotEmpty) {
      _bridgeChrome = {..._bridgeChrome, ...chrome};
    }
    if (!mounted) return;
    setState(() {
      _tabs = _tabs.map(_localizeTab).toList();
    });
  }

  Future<void> _fetchLiveStudioConfig() async {
    try {
      final url = Uri.parse('$_apiBase/api/mobile/v1/app-config');
      final client = HttpClient()..badCertificateCallback = ((_, _, _) => true);
      client.connectionTimeout = const Duration(seconds: 4);
      final request = await client.getUrl(url);
      request.headers.set('User-Agent', 'LonalizaMobileApp/2.0 NativeShell');
      final response = await request.close();
      if (response.statusCode == 200) {
        final body = await response.transform(utf8.decoder).join();
        final data = jsonDecode(body) as Map<String, dynamic>;
        if (data['ok'] == true) {
          final dynamicTabs = data['bottomNavTabs'] as List<dynamic>?;
          final dynamicSlides = data['splashSlides'] as List<dynamic>?;
          final navBgStr = data['bottomNavBg']?.toString();
          final navActiveStr = data['bottomNavActiveColor']?.toString();
          final navInactiveStr = data['bottomNavInactiveColor']?.toString();

          Color? nextNavBg = _parseHexColor(navBgStr);
          Color? nextActiveColor = _parseHexColor(navActiveStr);
          Color? nextInactiveColor = _parseHexColor(navInactiveStr);

          List<Map<String, dynamic>>? nextTabs;
          if (dynamicTabs != null && dynamicTabs.isNotEmpty) {
            nextTabs = dynamicTabs.where((t) => t['enabled'] != false).map((t) {
              final iconStr = (t['icon'] ?? 'compass').toString().toLowerCase();
              final path = (t['path'] ?? '/').toString();
              return _localizeTab({
                'id': (t['id'] ?? '').toString(),
                'title': _studioTabTitle(t),
                'path': path,
                'icon': _mapIconOutlined(iconStr),
                'activeIcon': _mapIconFilled(iconStr),
              });
            }).toList();
            final hasMore = nextTabs.any(
              (tab) => tabPathLooksLikeMore((tab['path'] ?? '').toString()),
            );
            if (!hasMore) {
              nextTabs = [
                ...nextTabs,
                _localizeTab({
                  'id': 'tab_more',
                  'title': _bridgeTitles['more'] ?? 'المزيد',
                  'path': '/menu',
                  'icon': Icons.grid_view_outlined,
                  'activeIcon': Icons.grid_view_rounded,
                }),
              ];
            }
          }

          List<Map<String, dynamic>>? nextSlides;
          if (dynamicSlides != null && dynamicSlides.isNotEmpty) {
            nextSlides = dynamicSlides.where((s) => s['enabled'] != false).map((s) {
              final iconStr = (s['icon'] ?? 'sparkles').toString().toLowerCase();
              return {
                'icon': _mapIconFilled(iconStr),
                'title': s['titleAr'] ?? 'ميزة حصرية',
                'desc': s['descAr'] ?? '',
                'tag': s['tagAr'] ?? 'VIP',
                'imageUrl': (s['imageUrl'] ?? '').toString(),
                'animationType': (s['animationType'] ?? 'cinematic').toString(),
                'badgeColor': _parseHexColor(s['badgeColor']) ?? _amberGold,
              };
            }).toList();
          }

          if (mounted) {
            setState(() {
              if (nextNavBg != null) _bottomNavBg = nextNavBg;
              if (nextActiveColor != null) _bottomNavActiveColor = nextActiveColor;
              if (nextInactiveColor != null) _bottomNavInactiveColor = nextInactiveColor;
              if (nextTabs != null && nextTabs.isNotEmpty) {
                _tabs = nextTabs;
                _syncTabFromUrl(_currentUrl);
              }
              if (nextSlides != null && nextSlides.isNotEmpty) {
                _slides = nextSlides;
                _activeSlideIndex = _activeSlideIndex.clamp(0, _slides.length - 1);
              }
            });
          }
        }
      }
      client.close();
    } catch (_) {}
  }

  Color? _parseHexColor(dynamic hex) {
    if (hex == null) return null;
    try {
      final clean = hex.toString().replaceAll('#', '').trim();
      if (clean.length == 6) {
        return Color(int.parse('FF$clean', radix: 16));
      } else if (clean.length == 8) {
        return Color(int.parse(clean, radix: 16));
      }
    } catch (_) {}
    return null;
  }

  IconData _mapIconOutlined(String name) {
    switch (name) {
      case 'home':
        return Icons.home_outlined;
      case 'wallet':
        return Icons.account_balance_wallet_outlined;
      case 'play':
      case 'video':
      case 'reels':
        return Icons.play_circle_outline_rounded;
      case 'user':
      case 'account':
        return Icons.person_outline_rounded;
      case 'plane':
      case 'flight':
        return Icons.flight_takeoff_rounded;
      case 'hotel':
      case 'building':
        return Icons.hotel_outlined;
      case 'menu':
      case 'more':
      case 'grid':
        return Icons.grid_view_outlined;
      case 'sparkles':
        return Icons.auto_awesome_outlined;
      default:
        return Icons.explore_outlined;
    }
  }

  IconData _mapIconFilled(String name) {
    switch (name) {
      case 'home':
        return Icons.home_rounded;
      case 'wallet':
        return Icons.account_balance_wallet_rounded;
      case 'play':
      case 'video':
      case 'reels':
        return Icons.play_circle_fill_rounded;
      case 'user':
      case 'account':
        return Icons.person_rounded;
      case 'plane':
      case 'flight':
        return Icons.flight_takeoff_rounded;
      case 'hotel':
      case 'building':
        return Icons.hotel_rounded;
      case 'menu':
      case 'more':
      case 'grid':
        return Icons.grid_view_rounded;
      case 'sparkles':
        return Icons.auto_awesome_rounded;
      default:
        return Icons.explore_rounded;
    }
  }

  void _handleBridgeMessage(String msg) {
    try {
      if (msg.contains('haptic') && !msg.contains('{')) {
        HapticFeedback.lightImpact();
        return;
      }
      if (msg.contains('tab:') && !msg.contains('{')) {
        final target = int.tryParse(msg.split(':').last);
        if (target != null && target >= 0 && target < _tabs.length) {
          _onTabSelected(target);
        }
        return;
      }
      final data = jsonDecode(msg);
      if (data is! Map) return;
      final type = data['type']?.toString();
      if (type == 'openExternal') {
        final href = data['href']?.toString() ?? '';
        if (href.isNotEmpty && ExternalUrlHandoff.shouldHandoff(href)) {
          unawaited(_openExternalUrl(href));
        }
      } else if (type == 'httpError') {
        final status = int.tryParse('${data['status']}') ?? 502;
        _presentFailure(ShellFailure.fromHttpStatus(status));
      } else if (type == 'pageReady' || type == 'paint') {
        final href = data['href']?.toString();
        if (href != null && ExternalUrlHandoff.shouldIgnoreWebViewLoad(href)) {
          return;
        }
        if (href != null &&
            href.isNotEmpty &&
            !href.contains('shell-maintenance') &&
            !href.contains('/maintenance')) {
          _currentUrl = href;
          _restoreUrl = href;
        }
        if (href != null && href.isNotEmpty) _syncTabFromUrl(href);
        _markInteractive(
          type == 'paint'
              ? ShellLoaderDismissReason.paint
              : ShellLoaderDismissReason.pageReady,
        );
      } else if (type == 'navStart') {
        // SPA tab/history changes must not pin a sticky overlay.
        _loader.onSpaNavStart();
        final href = data['href']?.toString();
        if (href != null && href.isNotEmpty) {
          // Never let a stale "still on previous page" ping revert the tab.
          if (shouldAcceptUrlTabSync(
            now: DateTime.now(),
            lockUntil: _tabLockUntil,
            lockedTab: _lockedTab,
            urlTab: activeTabIndex(
              href,
              _tabs.map((tab) => tab['path'] as String).toList(),
            ),
          )) {
            _currentUrl = href;
            _syncTabFromUrl(href);
          }
        }
      } else if (type == 'notification') {
        final title = data['title']?.toString() ?? '';
        final sender = data['senderName']?.toString() ?? '';
        final body = data['body']?.toString() ?? '';
        _showNativeNotice(
          title.isNotEmpty
              ? title
              : _localizedNotice(sender),
        );
        if (body.isNotEmpty || title.isNotEmpty) {
          HapticFeedback.mediumImpact();
        }
      } else if (type == 'tab') {
        final target = int.tryParse('${data['index']}');
        if (target != null && target >= 0 && target < _tabs.length) {
          _onTabSelected(target);
        }
      } else if (type == 'goHome') {
        goHome();
      } else if (type == 'navigate') {
        final path = data['path']?.toString() ?? data['href']?.toString() ?? '';
        if (path.isNotEmpty) {
          _spaNavigate(path, replace: data['replace'] == true);
        }
      } else if (type == 'locale') {
        _applyWebLocale(data);
      } else if (type == 'fullReload') {
        final href = data['href']?.toString() ?? '';
        if (href.isEmpty || !_pageInteractive) return;
        final absolute = href.startsWith('http') ? href : '$_apiBase$href';
        _loadSession(absolute);
      }
    } catch (_) {}
  }

  /// JS bridge the Navigation agent can call: `window.__lonalizaGoHome()`.
  void goHome() {
    if (isHomeRoot(_currentUrl)) {
      _controller.runJavaScript('window.scrollTo({top: 0, behavior: "smooth"});');
      return;
    }
    final homeIdx = _tabs.indexWhere(
      (tab) => roleForTabPath(tab['path'] as String) == BottomNavRole.home,
    );
    if (mounted) {
      setState(() => _activeTab = homeIdx < 0 ? 0 : homeIdx);
    }
    _spaNavigate('/', replace: true);
  }

  /// JS bridge: `window.__lonalizaNavigate(path)`.
  void navigate(String path) => _spaNavigate(path, replace: true);

  bool get _canSpaNavigate {
    if (_failure != null) return false;
    final current = Uri.tryParse(
      _currentUrl.isNotEmpty ? _currentUrl : _restoreUrl,
    );
    if (current == null || current.host.isEmpty) return false;
    final origin = Uri.tryParse(_apiBase);
    if (origin == null) return false;
    return SpaNavigation.sameOrigin(current, origin);
  }

  void _spaNavigate(String path, {bool replace = true}) {
    var normalized = path;
    if (normalized.startsWith('http')) {
      final parsed = Uri.tryParse(normalized);
      if (parsed != null) normalized = SpaNavigation.pathWithQuery(parsed);
    }
    normalized = SpaNavigation.withAppParam(normalized);
    final targetUrl = '$_apiBase$normalized';
    _currentUrl = targetUrl;
    _restoreUrl = targetUrl;
    _syncTabFromUrl(targetUrl);

    if (_failure != null) {
      _retrySession();
      return;
    }

    if (!_canSpaNavigate) {
      _loadSession(targetUrl);
      return;
    }

    if (SpaNavigation.isHomePath(normalized)) {
      _controller.runJavaScript(WebViewIntercept.goHomeScript());
      return;
    }
    _controller.runJavaScript(
      WebViewIntercept.navigateScript(normalized, targetUrl, replace: replace),
    );
  }

  void _onTabSelected(int index) {
    if (index < 0 || index >= _tabs.length) return;
    final now = DateTime.now();
    if (_lastTabPointerIndex == index &&
        _lastTabPointerAt != null &&
        now.difference(_lastTabPointerAt!) < const Duration(milliseconds: 220)) {
      return;
    }
    _lastTabPointerIndex = index;
    _lastTabPointerAt = now;
    HapticFeedback.selectionClick();

    final path = (_tabs[index]['path'] as String?) ?? '/';
    final role = roleForTabPath(path);
    final previousUrl = _currentUrl;
    final currentRole = roleForUrl(previousUrl);
    final alreadyHome = isHomeRoot(previousUrl);
    final alreadyMenu = isMenuPath(previousUrl);
    final targetPath = role == BottomNavRole.home
        ? '/'
        : role == BottomNavRole.more
        ? '/menu'
        : path;
    final normalized = SpaNavigation.withAppParam(
      targetPath.startsWith('http')
          ? (Uri.tryParse(targetPath) != null
                ? SpaNavigation.pathWithQuery(Uri.parse(targetPath))
                : targetPath)
          : targetPath,
    );
    _commitTab(index, '$_apiBase$normalized');

    if (role == BottomNavRole.home) {
      if (alreadyHome) {
        _controller.runJavaScript('window.scrollTo({top: 0, behavior: "smooth"});');
        return;
      }
      _spaNavigate('/', replace: true);
      return;
    }

    if (role == BottomNavRole.more) {
      if (alreadyMenu) {
        _controller.runJavaScript('window.scrollTo({top: 0, behavior: "smooth"});');
        return;
      }
      _spaNavigate('/menu', replace: true);
      return;
    }

    if (currentRole == role) {
      _controller.runJavaScript('window.scrollTo({top: 0, behavior: "smooth"});');
      return;
    }

    _spaNavigate(path, replace: true);
  }

  Future<bool> _handleBackPress() async {
    if (_showSplash) return false;
    if (_failure != null) return false;
    if (_showLoading) {
      _markInteractive(ShellLoaderDismissReason.back);
      return false;
    }

    if (await _controller.canGoBack()) {
      await _controller.goBack();
      return false;
    }

    if (!isHomeRoot(_currentUrl)) {
      final homeIdx = _tabs.indexWhere(
        (tab) => roleForTabPath(tab['path'] as String) == BottomNavRole.home,
      );
      _onTabSelected(homeIdx < 0 ? 0 : homeIdx);
      return false;
    }

    if (!mounted) return false;

    final shouldExit = await showModalBottomSheet<bool>(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              height: 4,
              width: 40,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              'هل ترغب بالخروج من التطبيق؟',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: _royalPurple,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'نتمنى لك رحلة ممتعة دائماً مع لوناليزا!',
              style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.of(ctx).pop(false),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      side: BorderSide(color: Colors.grey.shade300),
                    ),
                    child: const Text('إلغاء', style: TextStyle(color: Colors.black87, fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () => Navigator.of(ctx).pop(true),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _royalPurple,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      elevation: 0,
                    ),
                    child: const Text('خروج', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );

    return shouldExit ?? false;
  }

  void _showNativeNotice(String title) {
    if (!mounted || title.trim().isEmpty) return;
    setState(() => _nativeNoticeTitle = title.trim());
    _nativeNoticeTimer?.cancel();
    _nativeNoticeTimer = Timer(const Duration(seconds: 4), () {
      if (!mounted) return;
      setState(() => _nativeNoticeTitle = null);
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _loadingSafetyTimer?.cancel();
    _loaderFadeTimer?.cancel();
    _nativeNoticeTimer?.cancel();
    _splashPageController.dispose();
    _splashAnimController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) async {
        if (didPop) return;
        final shouldExit = await _handleBackPress();
        if (shouldExit && context.mounted) {
          SystemNavigator.pop();
        }
      },
      child: Scaffold(
        resizeToAvoidBottomInset: true,
        backgroundColor: ShellBrand.royalPurpleDeep,
        body: Stack(
          children: [
            Positioned.fill(child: _buildWebView()),
            if ((_showLoading || _loaderFading) && _failure == null && !_showSplash)
              Positioned.fill(
                child: IgnorePointer(
                  child: AnimatedOpacity(
                    opacity: _showLoading ? 1 : 0,
                    duration: ShellLoaderGate.fadeDuration,
                    curve: Curves.easeOutCubic,
                    child: const BrandedLoadingOverlay(),
                  ),
                ),
              ),
            if (_showSplash && _failure == null)
              Positioned.fill(
                child: AnimatedOpacity(
                  opacity: _showSplash ? 1.0 : 0.0,
                  duration: const Duration(milliseconds: 300),
                  curve: Curves.easeOutCubic,
                  child: _buildCinematicSplash(),
                ),
              ),
            if (_failure != null)
              Positioned.fill(
                child: BrandedMaintenanceOverlay(
                  failure: _failure!,
                  retrying: _retrying,
                  onRetry: _retrySession,
                ),
              ),
            if (_nativeNoticeTitle != null)
              Positioned(
                top: MediaQuery.of(context).padding.top + 12,
                left: 16,
                right: 16,
                child: Material(
                  color: Colors.transparent,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      color: _royalPurple,
                      borderRadius: BorderRadius.circular(18),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.25),
                          blurRadius: 18,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: Text(
                      _nativeNoticeTitle!,
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),

        // 3. Dynamic Native Bottom Navigation Bar
        bottomNavigationBar: _buildBottomNav(),
      ),
    );
  }

  Widget _buildWebView() {
    final direction = Directionality.of(context);
    // Empty recognizers: the platform WebView owns touch. EagerGestureRecognizer
    // was fighting inner HTML scroll and locking mid-fling.
    const recognizers = <Factory<OneSequenceGestureRecognizer>>{};
    if (!kIsWeb && Platform.isAndroid) {
      return WebViewWidget.fromPlatformCreationParams(
        params: AndroidWebViewWidgetCreationParams(
          controller: _controller.platform,
          layoutDirection: direction,
          gestureRecognizers: recognizers,
          displayWithHybridComposition: true,
        ),
      );
    }
    return WebViewWidget(
      controller: _controller,
      layoutDirection: direction,
      gestureRecognizers: recognizers,
    );
  }

  Widget _buildBottomNav() {
    return Container(
      decoration: BoxDecoration(
        color: _bottomNavBg,
        boxShadow: [
          BoxShadow(
            color: _royalPurple.withValues(alpha: 0.08),
            blurRadius: 16,
            offset: const Offset(0, -4),
          ),
        ],
        border: Border(
          top: BorderSide(color: Colors.grey.shade100, width: 1),
        ),
      ),
      child: SafeArea(
        top: false,
        bottom: true,
        child: SizedBox(
          height: 56,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 6),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: List.generate(_tabs.length, (i) {
                final tab = _tabs[i];
                final active = _activeTab == i;
                return Expanded(
                  child: Material(
                    color: Colors.transparent,
                    child: Listener(
                      behavior: HitTestBehavior.opaque,
                      onPointerDown: (_) => _onTabSelected(i),
                      child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 2),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          AnimatedContainer(
                            duration: const Duration(milliseconds: 180),
                            curve: Curves.easeOutCubic,
                            padding: EdgeInsets.symmetric(
                              horizontal: active ? 14 : 6,
                              vertical: 3,
                            ),
                            decoration: BoxDecoration(
                              color: active
                                  ? _bottomNavActiveColor
                                  : Colors.transparent,
                              borderRadius: BorderRadius.circular(14),
                            ),
                            child: Icon(
                              (active ? tab['activeIcon'] : tab['icon']) as IconData,
                              size: 19,
                              color: active ? _amberGoldLight : _bottomNavInactiveColor,
                            ),
                          ),
                          const SizedBox(height: 1.5),
                          Text(
                            tab['title'] as String,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: active ? FontWeight.w800 : FontWeight.w500,
                              color: active ? _bottomNavActiveColor : _bottomNavInactiveColor,
                            ),
                          ),
                        ],
                      ),
                    ),
                    ),
                  ),
                );
              }),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCinematicSplash() {
    return Container(
      color: _royalPurpleDeep,
      child: Stack(
        children: [
          // 1. Swipeable PageView with Photography & Details
          PageView.builder(
            controller: _splashPageController,
            itemCount: _slides.length,
            onPageChanged: (index) {
              setState(() => _activeSlideIndex = index);
            },
            itemBuilder: (context, index) {
              final slide = _slides[index];
              final imageUrl = (slide['imageUrl'] ?? '').toString();
              final badgeColor = (slide['badgeColor'] as Color?) ?? _amberGold;

              return Stack(
                fit: StackFit.expand,
                children: [
                  // Background Travel Image
                  if (imageUrl.isNotEmpty)
                    Image.network(
                      imageUrl,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) => const SizedBox.shrink(),
                    ),

                  // Vignette Overlay
                  DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          _royalPurpleDeep.withValues(alpha: 0.84),
                          _royalPurpleDeep.withValues(alpha: 0.70),
                          _royalPurpleDeep.withValues(alpha: 0.95),
                        ],
                      ),
                    ),
                  ),

                  // Slide Content
                  SafeArea(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 24),
                      child: Column(
                        children: [
                          const SizedBox(height: 52),
                          const Spacer(flex: 2),

                          // Animated Brand Logo
                          ScaleTransition(
                            scale: _logoScaleAnim,
                            child: Container(
                              padding: const EdgeInsets.all(18),
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: Colors.white.withValues(alpha: 0.12),
                                border: Border.all(color: _amberGold.withValues(alpha: 0.5), width: 2),
                                boxShadow: [
                                  BoxShadow(
                                    color: _royalPurple.withValues(alpha: 0.6),
                                    blurRadius: 40,
                                    spreadRadius: 10,
                                  ),
                                ],
                              ),
                              child: Image.asset(
                                'assets/logo/logo.png',
                                width: 85,
                                height: 85,
                                errorBuilder: (context, error, stackTrace) => const Icon(
                                  Icons.travel_explore_rounded,
                                  size: 65,
                                  color: _amberGold,
                                ),
                              ),
                            ),
                          ),

                          const SizedBox(height: 22),

                          // Pill Tag
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 5),
                            decoration: BoxDecoration(
                              color: badgeColor.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: badgeColor.withValues(alpha: 0.6), width: 1),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(slide['icon'] as IconData? ?? Icons.auto_awesome_rounded, size: 14, color: badgeColor),
                                const SizedBox(width: 6),
                                Text(
                                  slide['tag'] as String? ?? 'لوناليزا للسياحة',
                                  style: TextStyle(color: badgeColor, fontSize: 11, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                          ),

                          const SizedBox(height: 16),

                          // Headline
                          Text(
                            slide['title'] as String? ?? '',
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 20,
                              fontWeight: FontWeight.w900,
                              height: 1.35,
                            ),
                          ),

                          const SizedBox(height: 10),

                          // Subtext
                          Text(
                            slide['desc'] as String? ?? '',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: Colors.purple.shade100,
                              fontSize: 13,
                              height: 1.45,
                            ),
                          ),

                          const Spacer(flex: 3),
                          const SizedBox(height: 90),
                        ],
                      ),
                    ),
                  ),
                ],
              );
            },
          ),

          // 2. Fixed Top Controls: Skip Button and Slide Counter
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: SafeArea(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    TextButton(
                      onPressed: _dismissSplash,
                      style: TextButton.styleFrom(
                        backgroundColor: Colors.white.withValues(alpha: 0.16),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      child: const Text('تخطي', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w800)),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.black.withValues(alpha: 0.35),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        '${_activeSlideIndex + 1} / ${_slides.length}',
                        style: const TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // 3. Fixed Bottom Controls: Dots Indicator & Primary Action Button
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: SafeArea(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Dots indicator
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(_slides.length, (idx) {
                        final isCurrent = idx == _activeSlideIndex;
                        return AnimatedContainer(
                          duration: const Duration(milliseconds: 250),
                          margin: const EdgeInsets.symmetric(horizontal: 3),
                          height: 5,
                          width: isCurrent ? 28 : 7,
                          decoration: BoxDecoration(
                            color: isCurrent ? _amberGold : Colors.white.withValues(alpha: 0.35),
                            borderRadius: BorderRadius.circular(3),
                          ),
                        );
                      }),
                    ),

                    const SizedBox(height: 16),

                    // Action Button: Next or Get Started
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () {
                          if (_activeSlideIndex < _slides.length - 1) {
                            _splashPageController.nextPage(
                              duration: const Duration(milliseconds: 350),
                              curve: Curves.easeInOutCubic,
                            );
                          } else {
                            _dismissSplash();
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _activeSlideIndex == _slides.length - 1 ? _amberGold : Colors.white,
                          foregroundColor: _royalPurpleDeep,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          elevation: 4,
                        ),
                        child: Text(
                          _activeSlideIndex == _slides.length - 1 ? 'ابدأ الآن واستكشف التطبيق' : 'التالي',
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

}
