import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:webview_flutter/webview_flutter.dart';

import '../../../../core/theme/app_theme.dart';

enum RadarMode { singleFlight, airspace }

class DriverFlightRadarPage extends StatefulWidget {
  const DriverFlightRadarPage({
    super.key,
    this.initialFlightNumber,
    this.initialMode = RadarMode.singleFlight,
    this.passengerName,
    this.destination,
  });

  final String? initialFlightNumber;
  final RadarMode initialMode;
  final String? passengerName;
  final String? destination;

  @override
  State<DriverFlightRadarPage> createState() => _DriverFlightRadarPageState();
}

class _DriverFlightRadarPageState extends State<DriverFlightRadarPage> {
  late RadarMode _mode;
  late TextEditingController _searchController;
  late WebViewController _webViewController;

  bool _isLoading = true;
  bool _hasError = false;
  String _errorText = '';
  String _currentFlightNumber = 'TK1982';

  @override
  void initState() {
    super.initState();
    _mode = widget.initialMode;
    _currentFlightNumber = (widget.initialFlightNumber != null &&
            widget.initialFlightNumber!.trim().isNotEmpty)
        ? widget.initialFlightNumber!.trim().toUpperCase()
        : 'TK1982';

    _searchController = TextEditingController(text: _currentFlightNumber);
    _initWebView();
  }

  void _initWebView() {
    final url = _buildRadarUrl();
    _webViewController = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setUserAgent('Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36 LonalizaDriverApp')
      ..setBackgroundColor(const Color(0xFF060913))
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (String url) {
            if (mounted) {
              setState(() {
                _isLoading = true;
                _hasError = false;
              });
            }
          },
          onPageFinished: (String url) {
            if (mounted) {
              setState(() {
                _isLoading = false;
                _hasError = false;
              });
            }
          },
          onWebResourceError: (WebResourceError error) {
            debugPrint('Radar Map WebView error: ${error.description}');
            if (error.isForMainFrame ?? true) {
              if (mounted) {
                setState(() {
                  _isLoading = false;
                  _hasError = true;
                  _errorText = error.description;
                });
              }
            }
          },
        ),
      )
      ..loadRequest(Uri.parse(url));
  }

  String _buildRadarUrl() {
    final modeParam = _mode == RadarMode.airspace ? 'airspace' : 'mobile';
    return 'https://lonaliza.com/flight-tracker?embed=true&mode=$modeParam&flight=$_currentFlightNumber';
  }

  void _switchMode(RadarMode mode) {
    if (_mode == mode) return;
    setState(() {
      _mode = mode;
      _isLoading = true;
    });
    _webViewController.loadRequest(Uri.parse(_buildRadarUrl()));
  }

  void _trackFlight(String flightCode) {
    final clean = flightCode.trim().toUpperCase();
    if (clean.isEmpty) return;
    setState(() {
      _currentFlightNumber = clean;
      _mode = RadarMode.singleFlight;
      _searchController.text = clean;
      _isLoading = true;
    });
    _webViewController.loadRequest(Uri.parse(_buildRadarUrl()));
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF060913),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0A0F1D),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 20),
          onPressed: () {
            if (context.canPop()) {
              context.pop();
            } else {
              context.go('/dashboard');
            }
          },
        ),
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.gold.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.radar_rounded, color: AppColors.gold, size: 18),
            ),
            const SizedBox(width: 8),
            const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'قمرة رادار الطيران المباشر',
                  style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                ),
                Row(
                  children: [
                    Text(
                      'خريطة تكتيكية حية • بث أقمار صناعية',
                      style: TextStyle(color: Color(0xFF10B981), fontSize: 10, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
        centerTitle: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white70, size: 22),
            tooltip: 'تحديث الرادار',
            onPressed: () => _webViewController.reload(),
          ),
          IconButton(
            icon: const Icon(Icons.open_in_browser_rounded, color: Colors.white70, size: 20),
            tooltip: 'فتح في المتصفح',
            onPressed: () => launchUrl(
              Uri.parse('https://lonaliza.com/flight-tracker?flight=$_currentFlightNumber'),
              mode: LaunchMode.externalApplication,
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // Mode Switcher & Quick Search Header
          Container(
            padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
            decoration: const BoxDecoration(
              color: Color(0xFF0F172A),
              border: Border(bottom: BorderSide(color: Color(0xFF1E293B))),
            ),
            child: Column(
              children: [
                // Single Flight vs Airspace Mode Tabs
                Row(
                  children: [
                    Expanded(
                      child: GestureDetector(
                        onTap: () => _switchMode(RadarMode.singleFlight),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 250),
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          decoration: BoxDecoration(
                            color: _mode == RadarMode.singleFlight
                                ? AppColors.purple
                                : const Color(0xFF1E293B),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: _mode == RadarMode.singleFlight
                                  ? AppColors.purpleLight
                                  : Colors.transparent,
                            ),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.flight_takeoff_rounded,
                                size: 16,
                                color: _mode == RadarMode.singleFlight
                                    ? Colors.white
                                    : Colors.white60,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                'رحلة الحجز ($_currentFlightNumber)',
                                style: TextStyle(
                                  color: _mode == RadarMode.singleFlight
                                      ? Colors.white
                                      : Colors.white70,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: GestureDetector(
                        onTap: () => _switchMode(RadarMode.airspace),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 250),
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          decoration: BoxDecoration(
                            color: _mode == RadarMode.airspace
                                ? AppColors.gold
                                : const Color(0xFF1E293B),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: _mode == RadarMode.airspace
                                  ? AppColors.goldLight
                                  : Colors.transparent,
                            ),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.all_inclusive_rounded,
                                size: 16,
                                color: _mode == RadarMode.airspace
                                    ? const Color(0xFF0F172A)
                                    : Colors.white60,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                'رادار الأجواء المباشر',
                                style: TextStyle(
                                  color: _mode == RadarMode.airspace
                                      ? const Color(0xFF0F172A)
                                      : Colors.white70,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),

                // Flight search bar
                Row(
                  children: [
                    Expanded(
                      child: SizedBox(
                        height: 38,
                        child: TextField(
                          controller: _searchController,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'monospace',
                          ),
                          textCapitalization: TextCapitalization.characters,
                          decoration: InputDecoration(
                            hintText: 'أدخل رقم أي رحلة (مثال: TK1872, PC434, 6H567)...',
                            hintStyle: const TextStyle(color: Colors.white38, fontSize: 11),
                            prefixIcon: const Icon(Icons.search_rounded, color: AppColors.gold, size: 18),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 0),
                            filled: true,
                            fillColor: const Color(0xFF1E293B),
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(10),
                              borderSide: BorderSide.none,
                            ),
                          ),
                          onSubmitted: _trackFlight,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    SizedBox(
                      height: 38,
                      child: FilledButton(
                        onPressed: () => _trackFlight(_searchController.text),
                        style: FilledButton.styleFrom(
                          backgroundColor: AppColors.gold,
                          foregroundColor: const Color(0xFF0F172A),
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        ),
                        child: const Text('تعقب', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Main Map Viewport with real Leaflet tiles
          Expanded(
            child: Stack(
              children: [
                WebViewWidget(controller: _webViewController),

                // Smooth Loading Overlay
                if (_isLoading)
                  Container(
                    color: const Color(0xFF060913),
                    child: Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 60,
                            height: 60,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: AppColors.gold.withValues(alpha: 0.1),
                              border: Border.all(color: AppColors.gold.withValues(alpha: 0.3)),
                            ),
                            child: const Center(
                              child: CircularProgressIndicator(color: AppColors.gold, strokeWidth: 2.5),
                            ),
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'جاري الاتصال برادار الطيران المباشر الحقيقي...',
                            style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'تحميل خريطة الأقمار الصناعية وحركة الطائرات عبر ADS-B',
                            style: TextStyle(color: Colors.white54, fontSize: 11),
                          ),
                        ],
                      ),
                    ),
                  ),

                // Error Fallback Overlay with Retry Action
                if (_hasError)
                  Container(
                    color: const Color(0xFF060913),
                    padding: const EdgeInsets.all(24),
                    child: Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: Colors.redAccent.withValues(alpha: 0.1),
                              border: Border.all(color: Colors.redAccent.withValues(alpha: 0.3)),
                            ),
                            child: const Icon(Icons.wifi_off_rounded, color: Colors.redAccent, size: 36),
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'تعذر تحميل رادار الطيران المباشر مؤقتاً',
                            style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            _errorText.isNotEmpty ? _errorText : 'يرجى التحقق من اتصال الإنترنت أو المحاولة مجدداً',
                            textAlign: TextAlign.center,
                            style: const TextStyle(color: Colors.white54, fontSize: 11),
                          ),
                          const SizedBox(height: 20),
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              FilledButton.icon(
                                onPressed: () {
                                  setState(() {
                                    _hasError = false;
                                    _isLoading = true;
                                  });
                                  _webViewController.loadRequest(Uri.parse(_buildRadarUrl()));
                                },
                                icon: const Icon(Icons.refresh_rounded, size: 16),
                                label: const Text('إعادة المحاولة', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                style: FilledButton.styleFrom(
                                  backgroundColor: AppColors.gold,
                                  foregroundColor: const Color(0xFF0F172A),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                              ),
                              const SizedBox(width: 10),
                              OutlinedButton.icon(
                                onPressed: () => launchUrl(
                                  Uri.parse('https://lonaliza.com/flight-tracker?flight=$_currentFlightNumber'),
                                  mode: LaunchMode.externalApplication,
                                ),
                                icon: const Icon(Icons.open_in_browser_rounded, size: 16, color: Colors.white70),
                                label: const Text('فتح في المتصفح', style: TextStyle(fontSize: 12, color: Colors.white70)),
                                style: OutlinedButton.styleFrom(
                                  side: const BorderSide(color: Colors.white24),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
