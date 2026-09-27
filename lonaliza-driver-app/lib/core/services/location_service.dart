import 'dart:async';

import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';

/// Handles GPS permission and position streaming for active trips.
class LocationService {
  StreamSubscription<Position>? _subscription;
  Position? _lastPosition;

  Position? get lastPosition => _lastPosition;

  Future<bool> requestPermission() async {
    final serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) return false;

    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }
    if (permission == LocationPermission.deniedForever) {
      await openAppSettings();
      return false;
    }
    return permission == LocationPermission.always ||
        permission == LocationPermission.whileInUse;
  }

  Future<Position?> getCurrentPosition() async {
    final granted = await requestPermission();
    if (!granted) return null;
    _lastPosition = await Geolocator.getCurrentPosition(
      locationSettings: const LocationSettings(
        accuracy: LocationAccuracy.high,
      ),
    );
    return _lastPosition;
  }

  /// Streams position updates every [intervalSeconds] while active.
  void startTracking({
    required void Function(Position position) onPosition,
    int intervalSeconds = 15,
  }) {
    stopTracking();
    _subscription = Geolocator.getPositionStream(
      locationSettings: LocationSettings(
        accuracy: LocationAccuracy.high,
        distanceFilter: 25,
        timeLimit: Duration(seconds: intervalSeconds),
      ),
    ).listen((position) {
      _lastPosition = position;
      onPosition(position);
    });
  }

  void stopTracking() {
    _subscription?.cancel();
    _subscription = null;
  }

  void dispose() => stopTracking();
}
