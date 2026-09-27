import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../../core/extensions/context_l10n.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../data/services/driver_api.dart';
import '../../../providers/driver_session_provider.dart';

class DriverLiveMapPage extends ConsumerStatefulWidget {
  const DriverLiveMapPage({super.key});

  @override
  ConsumerState<DriverLiveMapPage> createState() => _DriverLiveMapPageState();
}

class _DriverLiveMapPageState extends ConsumerState<DriverLiveMapPage> {
  bool _loading = true;
  bool _isFullscreen = false;
  List<dynamic> _vehicles = [];
  Map<String, dynamic>? _selectedVehicle;

  // Map state
  double _centerLat = 41.0082;
  double _centerLng = 28.9784;
  int _zoom = 13;
  Offset _panOffset = Offset.zero;

  @override
  void initState() {
    super.initState();
    _fetchLiveMap();
  }

  @override
  void dispose() {
    if (_isFullscreen) {
      SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
      SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
    }
    super.dispose();
  }

  void _toggleFullscreen() {
    setState(() {
      _isFullscreen = !_isFullscreen;
    });
    if (_isFullscreen) {
      SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
      SystemChrome.setPreferredOrientations([
        DeviceOrientation.landscapeLeft,
        DeviceOrientation.landscapeRight,
        DeviceOrientation.portraitUp,
      ]);
    } else {
      SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
      SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
    }
  }

  Future<void> _fetchLiveMap() async {
    final supplierId = ref.read(driverSessionProvider).supplierId;
    if (supplierId == null) return;

    setState(() => _loading = true);
    try {
      final res = await ref.read(driverApiProvider).fetchLiveMap(supplierId: supplierId);
      if (!mounted) return;
      final list = res['vehicles'] as List? ?? [];
      final center = res['center'] as Map<String, dynamic>?;

      setState(() {
        _vehicles = list;
        if (center != null) {
          _centerLat = (center['lat'] as num?)?.toDouble() ?? _centerLat;
          _centerLng = (center['lng'] as num?)?.toDouble() ?? _centerLng;
        } else if (list.isNotEmpty) {
          final first = list.first as Map<String, dynamic>;
          _centerLat = (first['lat'] as num?)?.toDouble() ?? _centerLat;
          _centerLng = (first['lng'] as num?)?.toDouble() ?? _centerLng;
        }
        if (_vehicles.isNotEmpty && _selectedVehicle == null) {
          _selectedVehicle = _vehicles.first as Map<String, dynamic>;
        }
        _loading = false;
        _panOffset = Offset.zero;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loading = false);
    }
  }

  Future<void> _launchWhatsApp(String phone) async {
    final clean = phone.replaceAll(RegExp(r'[^\d+]'), '');
    final uri = Uri.parse('https://wa.me/$clean');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  Future<void> _launchPhone(String phone) async {
    final uri = Uri.parse('tel:$phone');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  // Convert lat/lng to OpenStreetMap slippy tile coordinate
  math.Point<int> _latLngToTile(double lat, double lng, int zoom) {
    final n = math.pow(2.0, zoom);
    final x = ((lng + 180.0) / 360.0 * n).floor();
    final latRad = lat * math.pi / 180.0;
    final y = ((1.0 - math.log(math.tan(latRad) + (1.0 / math.cos(latRad))) / math.pi) / 2.0 * n).floor();
    return math.Point(x, y);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final isLandscape = MediaQuery.of(context).orientation == Orientation.landscape;

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: _isFullscreen
          ? null
          : AppBar(
              backgroundColor: Colors.white,
              elevation: 0,
              leading: IconButton(
                icon: const Icon(Icons.arrow_back_ios_new_rounded, color: AppColors.textPrimary),
                onPressed: () => Navigator.of(context).pop(),
              ),
              title: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: AppColors.emerald.withValues(alpha: 0.12),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.radar_rounded, color: AppColors.emerald, size: 18),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    l10n.liveMap,
                    style: const TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              centerTitle: true,
              actions: [
                IconButton(
                  icon: const Icon(Icons.fullscreen_rounded, color: AppColors.textPrimary),
                  tooltip: 'ملء الشاشة',
                  onPressed: _toggleFullscreen,
                ),
                IconButton(
                  icon: const Icon(Icons.refresh_rounded, color: AppColors.textPrimary),
                  onPressed: _fetchLiveMap,
                ),
              ],
            ),
      body: SafeArea(
        top: !_isFullscreen,
        bottom: !_isFullscreen,
        child: Stack(
          children: [
            // Map Canvas with interactive gesture drag & zoom
            Positioned.fill(
              child: GestureDetector(
                onScaleUpdate: (details) {
                  setState(() {
                    _panOffset += details.focalPointDelta;
                  });
                },
                child: Container(
                  color: const Color(0xFF0F172A),
                  child: ClipRect(
                    child: _buildMapCanvas(),
                  ),
                ),
              ),
            ),

            // Top Status Bar Overlay (Dark Floating Pill)
            if (!_isFullscreen)
              Positioned(
                top: 16,
                left: 16,
                right: 16,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Active Fleet Badge
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A).withValues(alpha: 0.85),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.amber.shade500.withValues(alpha: 0.4)),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.3),
                            blurRadius: 8,
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              color: Color(0xFF10B981),
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'مركبات نشطة: ${_vehicles.length}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Map Floating Controls
                    Row(
                      children: [
                        _buildFloatingButton(
                        icon: Icons.add_rounded,
                        onTap: () {
                          if (_zoom < 18) setState(() => _zoom++);
                        },
                      ),
                      const SizedBox(width: 8),
                      _buildFloatingButton(
                        icon: Icons.remove_rounded,
                        onTap: () {
                          if (_zoom > 8) setState(() => _zoom--);
                        },
                      ),
                      const SizedBox(width: 8),
                      _buildFloatingButton(
                        icon: _isFullscreen
                            ? Icons.fullscreen_exit_rounded
                            : Icons.fullscreen_rounded,
                        onTap: _toggleFullscreen,
                        color: AppColors.gold,
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // ── Bottom Selected Vehicle VIP Card ──
            if (_selectedVehicle != null)
              Positioned(
                left: 16,
                right: 16,
                bottom: 16,
                child: _buildVehicleDetailCard(_selectedVehicle!, isLandscape),
              ),

            if (_loading)
              const Positioned.fill(
                child: Center(
                  child: CircularProgressIndicator(color: AppColors.gold),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildFloatingButton({
    required IconData icon,
    required VoidCallback onTap,
    Color? color,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A).withValues(alpha: 0.85),
        shape: BoxShape.circle,
        border: Border.all(color: Colors.white.withValues(alpha: 0.15)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.3),
            blurRadius: 6,
          ),
        ],
      ),
      child: IconButton(
        icon: Icon(icon, color: color ?? Colors.white, size: 20),
        onPressed: onTap,
        constraints: const BoxConstraints(minWidth: 40, minHeight: 40),
        padding: EdgeInsets.zero,
      ),
    );
  }

  Widget _buildMapCanvas() {
    final centerTile = _latLngToTile(_centerLat, _centerLng, _zoom);

    return LayoutBuilder(
      builder: (context, constraints) {
        final screenWidth = constraints.maxWidth;
        final screenHeight = constraints.maxHeight;
        final tileSize = 256.0;

        return ClipRect(
          child: Stack(
            children: [
              // ── 9 OpenStreetMap Tiles Grid (3x3) ──
              for (int dx = -2; dx <= 2; dx++)
                for (int dy = -2; dy <= 2; dy++)
                  Positioned(
                    left: screenWidth / 2 + (dx * tileSize) + _panOffset.dx - (tileSize / 2),
                    top: screenHeight / 2 + (dy * tileSize) + _panOffset.dy - (tileSize / 2),
                    width: tileSize,
                    height: tileSize,
                    child: Image.network(
                      'https://tile.openstreetmap.org/$_zoom/${centerTile.x + dx}/${centerTile.y + dy}.png',
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(
                        color: const Color(0xFF1E293B),
                        child: const Center(
                          child: Icon(Icons.map_outlined, color: Colors.white24),
                        ),
                      ),
                    ),
                  ),

              // ── Live Vehicle Markers ──
              for (int i = 0; i < _vehicles.length; i++)
                _buildVehicleMarker(
                  _vehicles[i] as Map<String, dynamic>,
                  i,
                  screenWidth,
                  screenHeight,
                ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildVehicleMarker(
    Map<String, dynamic> veh,
    int index,
    double screenWidth,
    double screenHeight,
  ) {
    final lat = (veh['lat'] as num?)?.toDouble() ?? _centerLat;
    final lng = (veh['lng'] as num?)?.toDouble() ?? _centerLng;
    final plate = veh['plateNumber']?.toString() ?? 'VIP';
    final speed = (veh['speed'] as num?)?.toInt() ?? 0;
    final status = veh['status']?.toString() ?? 'available';
    final isSelected = _selectedVehicle?['vehicleId'] == veh['vehicleId'];

    // Map offset calculation
    final latDiff = (lat - _centerLat) * 3800 * math.pow(1.5, _zoom - 13);
    final lngDiff = (lng - _centerLng) * 3800 * math.pow(1.5, _zoom - 13);

    final posX = screenWidth / 2 + lngDiff + _panOffset.dx;
    final posY = screenHeight / 2 - latDiff + _panOffset.dy;

    final statusColor = status == 'in_progress'
        ? const Color(0xFF10B981) // Emerald
        : status == 'on_the_way'
            ? const Color(0xFFF59E0B) // Amber
            : const Color(0xFF8B5CF6); // Purple

    return Positioned(
      left: posX - 45,
      top: posY - 45,
      child: GestureDetector(
        onTap: () {
          setState(() {
            _selectedVehicle = veh;
          });
        },
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Vehicle Badge
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: isSelected ? Colors.amber.shade500 : const Color(0xFF0F172A),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: isSelected ? Colors.white : Colors.amber.shade500,
                  width: 1.5,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.4),
                    blurRadius: 6,
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.directions_car_rounded,
                    size: 13,
                    color: isSelected ? Colors.black : Colors.amber.shade400,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    plate,
                    style: TextStyle(
                      fontFamily: 'monospace',
                      fontSize: 10,
                      fontWeight: FontWeight.w900,
                      color: isSelected ? Colors.black : Colors.white,
                    ),
                  ),
                  if (speed > 0) ...[
                    const SizedBox(width: 4),
                    Text(
                      '$speed km/h',
                      style: TextStyle(
                        fontSize: 9,
                        color: isSelected ? Colors.black87 : Colors.white70,
                      ),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 2),

            // Pulsing Marker Pin
            Container(
              width: 26,
              height: 26,
              decoration: BoxDecoration(
                color: statusColor,
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white, width: 2),
                boxShadow: [
                  BoxShadow(
                    color: statusColor.withValues(alpha: 0.6),
                    blurRadius: 10,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: const Icon(Icons.navigation_rounded, color: Colors.white, size: 14),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildVehicleDetailCard(Map<String, dynamic> veh, bool isLandscape) {
    final l10n = context.l10n;
    final plate = veh['plateNumber']?.toString() ?? 'VIP';
    final model = veh['vehicleModel']?.toString() ?? 'Mercedes Vito VIP';
    final driverName = veh['driverName']?.toString() ?? 'VIP Driver';
    final driverPhone = veh['driverPhone']?.toString() ?? '+90 555 000 0000';
    final mission = veh['currentMission']?.toString() ?? 'متاح للرحلات';
    final price = veh['tripPrice']?.toString() ?? '\$120';
    final speed = (veh['speed'] as num?)?.toInt() ?? 0;
    final battery = (veh['batteryPct'] as num?)?.toInt() ?? 85;
    final photoUrl = veh['photoUrl']?.toString();

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.25),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: Car model, plate, and close
          Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: photoUrl != null && photoUrl.isNotEmpty
                    ? Image.network(
                        photoUrl,
                        width: 50,
                        height: 38,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => _buildFallbackCarAvatar(),
                      )
                    : _buildFallbackCarAvatar(),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      model,
                      style: const TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 14,
                        color: AppColors.textPrimary,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                          decoration: BoxDecoration(
                            color: AppColors.gold.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            plate,
                            style: const TextStyle(
                              fontFamily: 'monospace',
                              fontWeight: FontWeight.bold,
                              fontSize: 11,
                              color: AppColors.purpleDark,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          '$speed km/h · $battery% 🔋',
                          style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close_rounded, size: 20, color: AppColors.textMuted),
                onPressed: () => setState(() => _selectedVehicle = null),
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
              ),
            ],
          ),
          const Divider(height: 16),

          // Mission & Revenue
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Row(
                    children: [
                      const Icon(Icons.route_rounded, size: 16, color: AppColors.purple),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          mission,
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimary,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.emerald.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    price,
                    style: const TextStyle(
                      fontWeight: FontWeight.w900,
                      fontSize: 12,
                      color: AppColors.emerald,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 10),

          // Driver Contact Shortcuts
          Row(
            children: [
              Expanded(
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 14,
                      backgroundColor: AppColors.purple.withValues(alpha: 0.15),
                      child: const Icon(Icons.person, size: 16, color: AppColors.purple),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        driverName,
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),

              // WhatsApp button
              IconButton.filled(
                style: IconButton.styleFrom(
                  backgroundColor: const Color(0xFF25D366),
                  foregroundColor: Colors.white,
                  minimumSize: const Size(36, 36),
                  padding: EdgeInsets.zero,
                ),
                icon: const Icon(Icons.chat_bubble_outline_rounded, size: 18),
                tooltip: 'واتساب',
                onPressed: () => _launchWhatsApp(driverPhone),
              ),
              const SizedBox(width: 8),

              // Phone call button
              IconButton.filled(
                style: IconButton.styleFrom(
                  backgroundColor: AppColors.purple,
                  foregroundColor: Colors.white,
                  minimumSize: const Size(36, 36),
                  padding: EdgeInsets.zero,
                ),
                icon: const Icon(Icons.phone_rounded, size: 18),
                tooltip: 'اتصال',
                onPressed: () => _launchPhone(driverPhone),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFallbackCarAvatar() {
    return Container(
      width: 50,
      height: 38,
      color: AppColors.gold.withValues(alpha: 0.15),
      child: const Icon(Icons.directions_car_rounded, color: AppColors.purpleDark, size: 24),
    );
  }
}
