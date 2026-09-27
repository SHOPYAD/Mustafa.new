import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/extensions/context_l10n.dart';
import '../../../../core/services/location_service.dart';
import '../../../../core/theme/app_theme.dart';
import '../../../../data/services/driver_api.dart';
import '../../../providers/driver_session_provider.dart';

class DriverTripExecutionPage extends ConsumerStatefulWidget {
  const DriverTripExecutionPage({
    super.key,
    required this.serviceType,
    this.bookingId,
  });

  final String serviceType;
  final String? bookingId;

  @override
  ConsumerState<DriverTripExecutionPage> createState() =>
      _DriverTripExecutionPageState();
}

class _DriverTripExecutionPageState
    extends ConsumerState<DriverTripExecutionPage> {
  final _locationService = LocationService();
  bool _tracking = false;
  String _status = 'en_route';
  String? _lastTelemetryError;

  bool get _isTour => widget.serviceType == 'daily_tour';

  @override
  void dispose() {
    _locationService.dispose();
    super.dispose();
  }

  Future<void> _postTelemetry() async {
    final position = _locationService.lastPosition ??
        await _locationService.getCurrentPosition();
    if (position == null) {
      setState(() => _lastTelemetryError = 'Location unavailable');
      return;
    }

    final supplierId = ref.read(driverSessionProvider).supplierId;
    try {
      await ref.read(driverApiProvider).postTelemetry({
        'bookingId': widget.bookingId,
        'serviceType': widget.serviceType,
        'supplierId': supplierId,
        'lat': position.latitude,
        'lng': position.longitude,
        'heading': position.heading,
        'speed': position.speed,
        'accuracy': position.accuracy,
      });
      if (mounted) setState(() => _lastTelemetryError = null);
    } catch (e) {
      if (mounted) setState(() => _lastTelemetryError = e.toString());
    }
  }

  Future<void> _toggleTracking() async {
    if (_tracking) {
      _locationService.stopTracking();
      setState(() => _tracking = false);
      return;
    }

    final granted = await _locationService.requestPermission();
    if (!granted) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(context.l10n.errorGeneric)),
      );
      return;
    }

    setState(() => _tracking = true);
    await _postTelemetry();
    _locationService.startTracking(onPosition: (_) => _postTelemetry());
  }

  Future<void> _updateStatus(String status) async {
    final bookingId = widget.bookingId;
    if (bookingId == null) {
      setState(() => _status = status);
      return;
    }

    try {
      final supplierId = ref.read(driverSessionProvider).supplierId;
      if (status == 'completed') {
        await ref.read(driverApiProvider).completeBooking(
              bookingId,
              supplierId: supplierId,
            );
      } else {
        await ref.read(driverApiProvider).updateBookingStatus(
              bookingId,
              status,
              supplierId: supplierId,
            );
      }
      if (mounted) setState(() => _status = status);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return Scaffold(
      appBar: AppBar(
        title: Text(_isTour ? l10n.toursTab : l10n.activeTrip),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(l10n.tripStatus,
                      style: const TextStyle(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _StatusChip(
                        label: l10n.enRoute,
                        value: 'en_route',
                        current: _status,
                        onTap: _updateStatus,
                      ),
                      _StatusChip(
                        label: l10n.arrived,
                        value: 'arrived',
                        current: _status,
                        onTap: _updateStatus,
                      ),
                      _StatusChip(
                        label: l10n.onboard,
                        value: 'onboard',
                        current: _status,
                        onTap: _updateStatus,
                      ),
                      _StatusChip(
                        label: l10n.completed,
                        value: 'completed',
                        current: _status,
                        onTap: _updateStatus,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          if (_isTour)
            Card(
              child: ListTile(
                title: Text(l10n.toursTab),
                subtitle: const Text('Arrived / departed per itinerary stop'),
              ),
            ),
          const SizedBox(height: 12),
          Card(
            color: _tracking
                ? AppColors.success.withValues(alpha: 0.08)
                : null,
            child: ListTile(
              leading: Icon(
                _tracking ? Icons.gps_fixed : Icons.gps_off,
                color: _tracking ? AppColors.success : AppColors.textMuted,
              ),
              title: Text(_tracking ? l10n.publishLocation : l10n.publishLocation),
              subtitle: _lastTelemetryError != null
                  ? Text(_lastTelemetryError!,
                      style: const TextStyle(color: AppColors.error))
                  : Text(_tracking ? 'GPS active' : 'Tap to start sharing'),
            ),
          ),
          const SizedBox(height: 12),
          FilledButton.icon(
            onPressed: _toggleTracking,
            icon: Icon(_tracking ? Icons.stop : Icons.my_location),
            label: Text(_tracking ? l10n.stopTracking : l10n.publishLocation),
          ),
        ],
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  const _StatusChip({
    required this.label,
    required this.value,
    required this.current,
    required this.onTap,
  });

  final String label;
  final String value;
  final String current;
  final Future<void> Function(String) onTap;

  @override
  Widget build(BuildContext context) {
    final selected = current == value;
    return FilterChip(
      label: Text(label),
      selected: selected,
      onSelected: (_) => onTap(value),
      selectedColor: AppColors.gold.withValues(alpha: 0.25),
      checkmarkColor: AppColors.obsidian,
    );
  }
}
