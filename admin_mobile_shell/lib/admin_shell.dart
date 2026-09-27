import 'dart:async';
import 'dart:io';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;
import 'package:local_auth/local_auth.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';

/// Independent native wrapper around the existing admin web app.
/// Does not duplicate APIs, auth, or inventory logic.
class AdminShellPage extends StatefulWidget {
  const AdminShellPage({super.key});

  @override
  State<AdminShellPage> createState() => _AdminShellPageState();
}

class _AdminShellPageState extends State<AdminShellPage>
    with WidgetsBindingObserver {
  static const Color _royal = Color(0xFF2E1065);
  static const Color _royalDeep = Color(0xFF140522);
  static const Color _gold = Color(0xFFF59E0B);
  static const String _adminUrl = String.fromEnvironment(
    'ADMIN_URL',
    defaultValue: 'https://lonaliza.com/admin',
  );

  late final WebViewController _controller;
  final LocalAuthentication _auth = LocalAuthentication();

  bool _showSplash = true;
  bool _locked = true;
  bool _offline = false;
  bool _loading = true;
  bool _authBusy = false;
  String? _lockError;

  StreamSubscription<List<ConnectivityResult>>? _netSub;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(_royalDeep)
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (_) {
            if (mounted) setState(() => _loading = true);
          },
          onPageFinished: (_) {
            if (mounted) setState(() => _loading = false);
          },
          onWebResourceError: (error) {
            if (!mounted) return;
            if (error.errorType == WebResourceErrorType.hostLookup ||
                error.errorType == WebResourceErrorType.timeout) {
              setState(() => _offline = true);
            }
          },
          onNavigationRequest: (request) {
            final uri = Uri.tryParse(request.url);
            if (uri == null) return NavigationDecision.prevent;
            if (_isPdf(uri)) {
              unawaited(_downloadAndShare(uri));
              return NavigationDecision.prevent;
            }
            if (_isExternal(uri)) {
              unawaited(launchUrl(uri, mode: LaunchMode.externalApplication));
              return NavigationDecision.prevent;
            }
            return NavigationDecision.navigate;
          },
        ),
      );

    final platform = _controller.platform;
    if (platform is AndroidWebViewController) {
      AndroidWebViewController.enableDebugging(false);
      unawaited(
        platform.setOnShowFileSelector((params) async {
          final allowMultiple = params.mode == FileSelectorMode.openMultiple;
          try {
            final result = await FilePicker.platform.pickFiles(
              allowMultiple: allowMultiple,
              withData: false,
            );
            if (result == null) return <String>[];
            return result.files
                .where((f) => f.path != null)
                .map((f) => Uri.file(f.path!).toString())
                .toList();
          } catch (e) {
            debugPrint('admin file picker: $e');
            return <String>[];
          }
        }),
      );
    }

    _netSub = Connectivity().onConnectivityChanged.listen((results) {
      final offline = results.every((r) => r == ConnectivityResult.none);
      if (!mounted) return;
      setState(() => _offline = offline);
      if (!offline && !_locked) {
        unawaited(_controller.reload());
      }
    });

    unawaited(_bootstrap());
  }

  Future<void> _bootstrap() async {
    await Future<void>.delayed(const Duration(milliseconds: 1400));
    if (mounted) setState(() => _showSplash = false);
    final net = await Connectivity().checkConnectivity();
    if (net.every((r) => r == ConnectivityResult.none)) {
      if (mounted) setState(() => _offline = true);
    }
    await _unlock();
  }

  Future<void> _unlock() async {
    if (_authBusy) return;
    setState(() {
      _authBusy = true;
      _lockError = null;
    });
    try {
      final supported = await _auth.isDeviceSupported();
      final canCheck = await _auth.canCheckBiometrics;
      if (!supported || !canCheck) {
        setState(() => _locked = false);
        await _loadAdmin();
        return;
      }
      final ok = await _auth.authenticate(
        localizedReason: 'أكد هويتك لفتح لوحة إدارة لوناليزا',
        options: const AuthenticationOptions(
          biometricOnly: false,
          stickyAuth: true,
          useErrorDialogs: true,
        ),
      );
      if (!ok) {
        setState(() => _lockError = 'لم يتم التحقق. حاول مرة أخرى.');
        return;
      }
      setState(() => _locked = false);
      await _loadAdmin();
    } on PlatformException catch (e) {
      setState(() {
        _lockError = e.message ?? 'تعذر فتح القفل البيومتري.';
        _locked = false;
      });
      await _loadAdmin();
    } finally {
      if (mounted) setState(() => _authBusy = false);
    }
  }

  Future<void> _loadAdmin() async {
    if (_offline) return;
    await _controller.loadRequest(Uri.parse(_adminUrl));
  }

  bool _isPdf(Uri uri) {
    final path = uri.path.toLowerCase();
    return path.endsWith('.pdf') ||
        uri.queryParameters['format'] == 'pdf' ||
        uri.queryParameters['download'] == 'pdf';
  }

  bool _isExternal(Uri uri) {
    if (uri.scheme == 'mailto' || uri.scheme == 'tel' || uri.scheme == 'whatsapp') {
      return true;
    }
    final host = uri.host.toLowerCase();
    if (host.isEmpty) return false;
    return host != 'lonaliza.com' &&
        host != 'www.lonaliza.com' &&
        !host.endsWith('.lonaliza.com');
  }

  Future<void> _downloadAndShare(Uri uri) async {
    try {
      final res = await http.get(uri);
      if (res.statusCode < 200 || res.statusCode >= 300) return;
      final dir = await getTemporaryDirectory();
      final name = uri.pathSegments.isEmpty
          ? 'lonaliza-admin.pdf'
          : uri.pathSegments.last.replaceAll(RegExp(r'[^A-Za-z0-9._-]'), '_');
      final file = File('${dir.path}/$name');
      await file.writeAsBytes(res.bodyBytes);
      await Share.shareXFiles(
        [XFile(file.path, mimeType: 'application/pdf')],
        text: 'مستند من إدارة لوناليزا',
      );
    } catch (e) {
      debugPrint('admin pdf share: $e');
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.paused ||
        state == AppLifecycleState.inactive) {
      if (!_locked) setState(() => _locked = true);
    }
    if (state == AppLifecycleState.resumed && _locked && !_showSplash) {
      unawaited(_unlock());
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _netSub?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light,
      ),
      child: Scaffold(
        backgroundColor: _royalDeep,
        body: Stack(
          children: [
            if (!_locked && !_showSplash)
              SafeArea(
                child: WebViewWidget(controller: _controller),
              ),
            if (_loading && !_locked && !_showSplash && !_offline)
              const Align(
                alignment: Alignment.topCenter,
                child: LinearProgressIndicator(
                  minHeight: 2,
                  color: _gold,
                  backgroundColor: _royal,
                ),
              ),
            if (_offline) _OfflineScreen(onRetry: () async {
              final net = await Connectivity().checkConnectivity();
              final offline = net.every((r) => r == ConnectivityResult.none);
              if (!mounted) return;
              setState(() => _offline = offline);
              if (!offline) await _loadAdmin();
            }),
            if (_locked && !_showSplash) _LockScreen(
              busy: _authBusy,
              error: _lockError,
              onUnlock: _unlock,
            ),
            if (_showSplash) const _SplashScreen(),
          ],
        ),
      ),
    );
  }
}

class _SplashScreen extends StatelessWidget {
  const _SplashScreen();

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF140522),
      alignment: Alignment.center,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Image.asset(
            'assets/brand/logo.png',
            height: 88,
            errorBuilder: (_, error, stack) => Icon(
              Icons.admin_panel_settings_rounded,
              size: 72,
              color: _AdminShellPageState._gold,
            ),
          ),
          const SizedBox(height: 18),
          const Text(
            'لوحة إدارة لوناليزا',
            style: TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'غلاف آمن لتطبيق الإدارة الحالي',
            style: TextStyle(color: Colors.white.withValues(alpha: 0.55), fontSize: 13),
          ),
        ],
      ),
    );
  }
}

class _LockScreen extends StatelessWidget {
  const _LockScreen({
    required this.busy,
    required this.error,
    required this.onUnlock,
  });

  final bool busy;
  final String? error;
  final VoidCallback onUnlock;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF140522),
      alignment: Alignment.center,
      padding: const EdgeInsets.symmetric(horizontal: 28),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.fingerprint_rounded, size: 72, color: Color(0xFFF59E0B)),
          const SizedBox(height: 16),
          const Text(
            'قفل حيوي',
            style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 8),
          Text(
            'استخدم البصمة أو قفل الجهاز قبل فتح لوحة الإدارة.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.white.withValues(alpha: 0.6), height: 1.5),
          ),
          if (error != null) ...[
            const SizedBox(height: 12),
            Text(error!, style: const TextStyle(color: Color(0xFFFCA5A5))),
          ],
          const SizedBox(height: 22),
          FilledButton(
            onPressed: busy ? null : onUnlock,
            style: FilledButton.styleFrom(
              backgroundColor: const Color(0xFF2E1065),
              foregroundColor: Colors.white,
              minimumSize: const Size(220, 48),
            ),
            child: busy
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                  )
                : const Text('فتح اللوحة'),
          ),
        ],
      ),
    );
  }
}

class _OfflineScreen extends StatelessWidget {
  const _OfflineScreen({required this.onRetry});

  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF140522),
      alignment: Alignment.center,
      padding: const EdgeInsets.symmetric(horizontal: 28),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.wifi_off_rounded, size: 64, color: Color(0xFFF59E0B)),
          const SizedBox(height: 14),
          const Text(
            'لا يوجد اتصال',
            style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 8),
          Text(
            'غلاف الإدارة يعرض لوحة الويب الحالية فقط. تحقق من الشبكة ثم أعد المحاولة.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.white.withValues(alpha: 0.6), height: 1.5),
          ),
          const SizedBox(height: 22),
          FilledButton(
            onPressed: onRetry,
            style: FilledButton.styleFrom(
              backgroundColor: const Color(0xFFF59E0B),
              foregroundColor: const Color(0xFF140522),
              minimumSize: const Size(200, 48),
            ),
            child: const Text('إعادة المحاولة'),
          ),
        ],
      ),
    );
  }
}
