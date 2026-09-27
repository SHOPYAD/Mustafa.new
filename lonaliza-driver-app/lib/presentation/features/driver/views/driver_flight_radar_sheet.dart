import 'dart:async';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/extensions/context_l10n.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../data/services/driver_api.dart';

class DriverFlightRadarSheet extends StatefulWidget {
  const DriverFlightRadarSheet({
    super.key,
    required this.flightNumber,
    this.initialData,
  });

  final String flightNumber;
  final Map<String, dynamic>? initialData;

  static Future<void> show(
    BuildContext context, {
    required String flightNumber,
    Map<String, dynamic>? initialData,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => DriverFlightRadarSheet(
        flightNumber: flightNumber,
        initialData: initialData,
      ),
    );
  }

  @override
  State<DriverFlightRadarSheet> createState() => _DriverFlightRadarSheetState();
}

class _DriverFlightRadarSheetState extends State<DriverFlightRadarSheet> {
  bool _loading = false;
  Map<String, dynamic>? _flight;
  Timer? _refreshTimer;

  @override
  void initState() {
    super.initState();
    _flight = widget.initialData;
    _loadFlight();
    // Auto-refresh telemetry every 15 seconds while sheet is open
    _refreshTimer = Timer.periodic(const Duration(seconds: 15), (_) {
      if (mounted) _loadFlight(silent: true);
    });
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  Future<void> _loadFlight({bool silent = false}) async {
    if (!silent) setState(() => _loading = true);
    try {
      final res = await DriverApi().trackFlight(flightNumber: widget.flightNumber);
      if (!mounted) return;
      if (res['flight'] is Map<String, dynamic>) {
        setState(() {
          _flight = res['flight'] as Map<String, dynamic>;
          _loading = false;
        });
      } else if (res['flight'] != null) {
        setState(() {
          _flight = Map<String, dynamic>.from(res['flight'] as Map);
          _loading = false;
        });
      } else {
        setState(() {
          _flight = res;
          _loading = false;
        });
      }
    } catch (e) {
      debugPrint('Flight tracking fetch error: $e');
      if (!mounted) return;
      if (!silent) setState(() => _loading = false);
    }
  }

  Future<void> _openFlightradar() async {
    final url = 'https://lonaliza.com/flight-tracker?flight=${widget.flightNumber.toUpperCase()}';
    final uri = Uri.parse(url);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final airlineIata = (_flight?['airlineCode'] ?? (widget.flightNumber.length >= 2 ? widget.flightNumber.substring(0, 2) : 'TK')).toString().toUpperCase();
    final logoUrl = 'https://images.kiwi.com/airlines/64x64/$airlineIata.png';

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Handle Bar
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Header with Official Airline Brand Logo
            Row(
              children: [
                Container(
                  width: 46,
                  height: 46,
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: Colors.grey.shade200),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.05),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: Image.network(
                      logoUrl,
                      fit: BoxFit.contain,
                      errorBuilder: (_, __, ___) => Container(
                        color: AppColors.gold.withValues(alpha: 0.15),
                        child: const Icon(Icons.flight_takeoff_rounded, color: AppColors.purpleDark, size: 24),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            widget.flightNumber.toUpperCase(),
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w900,
                              fontFamily: 'monospace',
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.emerald.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(width: 6, height: 6, decoration: const BoxDecoration(color: AppColors.emerald, shape: BoxShape.circle)),
                                const SizedBox(width: 4),
                                Text(
                                  _flight?['statusLabelAr'] ?? 'في الجو',
                                  style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.emerald),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      Text(
                        _flight?['airline'] ?? 'شركة طيران دولية',
                        style: const TextStyle(fontSize: 12, color: AppColors.textMuted, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
            const Divider(height: 24),

            if (_loading)
              const Center(
                child: Padding(
                  padding: EdgeInsets.symmetric(vertical: 32),
                  child: CircularProgressIndicator(color: AppColors.gold),
                ),
              )
            else if (_flight != null) ...[
              // Route Box
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: AppColors.background,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Text('الإقلاع', style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
                            if (_flight!['originCode'] != null) ...[
                              const SizedBox(width: 4),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                                decoration: BoxDecoration(
                                  color: Colors.blue.shade50,
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  _flight!['originCode'].toString(),
                                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, fontFamily: 'monospace', color: Colors.blue.shade700),
                                ),
                              ),
                            ],
                          ],
                        ),
                        const SizedBox(height: 2),
                        Text(
                          _flight!['originCity'] ?? 'مطار الإقلاع',
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                        ),
                      ],
                    ),
                    const Icon(Icons.flight_takeoff_rounded, color: AppColors.purple, size: 22),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            if (_flight!['destinationCode'] != null) ...[
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                                decoration: BoxDecoration(
                                  color: AppColors.gold.withValues(alpha: 0.15),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  _flight!['destinationCode'].toString(),
                                  style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, fontFamily: 'monospace', color: AppColors.goldDark),
                                ),
                              ),
                              const SizedBox(width: 4),
                            ],
                            const Text('الوصول المتوقع', style: TextStyle(fontSize: 11, color: AppColors.textMuted)),
                          ],
                        ),
                        const SizedBox(height: 2),
                        Text(
                          _flight!['destinationCity'] ?? 'مطار الوصول',
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Progress Bar
              Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('انقضى: ${_flight!['elapsedMinutes']} دقيقة', style: const TextStyle(fontSize: 11, color: AppColors.textMuted)),
                      Text(
                        'متبقي للهبوط ${_flight!['remainingMinutes']} دقيقة',
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.purple),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: LinearProgressIndicator(
                      value: ((_flight!['progressPct'] as num?)?.toDouble() ?? 75) / 100,
                      backgroundColor: Colors.grey.shade200,
                      color: AppColors.gold,
                      minHeight: 8,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Metrics: Terminal, Altitude, Speed, Heading
              Row(
                children: [
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppColors.background,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('صالة الوصول', style: TextStyle(fontSize: 10, color: AppColors.textMuted)),
                          const SizedBox(height: 2),
                          Text(
                            _flight!['terminal']?.toString().split('—').last.trim() ?? 'Terminal 1',
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppColors.background,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('الارتفاع', style: TextStyle(fontSize: 10, color: AppColors.textMuted)),
                          const SizedBox(height: 2),
                          Text(
                            '${_flight!['altitudeFeet']} ft',
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.purpleDark),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AppColors.background,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('السرعة', style: TextStyle(fontSize: 10, color: AppColors.textMuted)),
                          const SizedBox(height: 2),
                          Text(
                            '${_flight!['groundSpeedKmH']} km/h',
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.goldDark),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              // Tactical Telemetry Strip: Coordinates + Heading + Model
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.navigation_rounded, color: AppColors.emerald, size: 14),
                        const SizedBox(width: 4),
                        Text(
                          _flight!['coordinates'] != null
                              ? '${_flight!['coordinates']['lat']}° N, ${_flight!['coordinates']['lng']}° E'
                              : 'بث رادار حي',
                          style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11, fontFamily: 'monospace', fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        const Icon(Icons.explore_rounded, color: AppColors.gold, size: 14),
                        const SizedBox(width: 4),
                        Text(
                          '${_flight!['heading'] ?? 0}°',
                          style: const TextStyle(color: Colors.white, fontSize: 11, fontFamily: 'monospace', fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          _flight!['aircraftModel']?.toString() ?? 'A321',
                          style: const TextStyle(color: Color(0xFF38BDF8), fontSize: 11, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Open in Web Tracker / Full Map
              SizedBox(
                width: double.infinity,
                child: FilledButton.icon(
                  style: FilledButton.styleFrom(
                    backgroundColor: AppColors.purpleDark,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  icon: const Icon(Icons.radar_rounded, color: AppColors.gold, size: 20),
                  label: const Text('فتح رادار الطيران المباشر في المتصفح', style: TextStyle(fontWeight: FontWeight.bold)),
                  onPressed: _openFlightradar,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
