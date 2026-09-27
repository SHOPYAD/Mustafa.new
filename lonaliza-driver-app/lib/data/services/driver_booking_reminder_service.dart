import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:timezone/data/latest_all.dart' as tz_data;
import 'package:timezone/timezone.dart' as tz;

import '../../presentation/providers/app_locale_provider.dart';
import 'driver_notifications.dart';

const _reminderHours = [5, 4, 3];
const _scheduledIdsKey = 'driver_booking_reminder_ids_v1';

class DriverBookingReminderService {
  DriverBookingReminderService(this._prefs);

  final SharedPreferences _prefs;
  bool _tzReady = false;

  Future<void> ensureInitialized() async {
    if (_tzReady) return;
    tz_data.initializeTimeZones();
    tz.setLocalLocation(tz.local);
    _tzReady = true;

    await driverLocalNotifications
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(
          const AndroidNotificationChannel(
            driverReminderChannelId,
            'Booking reminders',
            description: 'Reminders 5, 4 and 3 hours before your trip',
            importance: Importance.high,
          ),
        );
  }

  Future<void> syncFromAnalytics(
    Map<String, dynamic>? analytics, {
    required String title,
    required String Function(String reference, int hours) bodyFor,
  }) async {
    await ensureInitialized();
    await _cancelPrevious();

    if (analytics == null) return;

    final granted = await _ensureNotificationPermission();
    if (!granted) return;

    final upcoming = <Map<String, dynamic>>[
      ...((analytics['upcomingBookings'] as List?)
              ?.cast<Map<String, dynamic>>() ??
          []),
    ];
    if (upcoming.isEmpty) {
      final next = analytics['nextBooking'] as Map<String, dynamic>?;
      if (next != null) upcoming.add(next);
    }

    final scheduledIds = <int>[];

    for (final booking in upcoming) {
      final bookingId = booking['_id']?.toString() ?? '';
      final reference = booking['reference']?.toString() ?? bookingId;
      final scheduledAt = DateTime.tryParse(
        booking['scheduledAt']?.toString() ?? '',
      );
      if (bookingId.isEmpty || scheduledAt == null) continue;

      final localTime = scheduledAt.toLocal();

      for (final hours in _reminderHours) {
        final notifyAt = localTime.subtract(Duration(hours: hours));
        if (!notifyAt.isAfter(DateTime.now())) continue;

        final notificationId = _notificationId(bookingId, hours);
        scheduledIds.add(notificationId);

        try {
          await driverLocalNotifications.zonedSchedule(
            notificationId,
            title,
            bodyFor(reference, hours),
            tz.TZDateTime.from(notifyAt, tz.local),
            const NotificationDetails(
              android: AndroidNotificationDetails(
                driverReminderChannelId,
                'Booking reminders',
                importance: Importance.high,
                priority: Priority.high,
              ),
            ),
            androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
            uiLocalNotificationDateInterpretation:
                UILocalNotificationDateInterpretation.absoluteTime,
          );
        } catch (e) {
          debugPrint('Booking reminder schedule failed: $e');
        }
      }
    }

    await _prefs.setStringList(
      _scheduledIdsKey,
      scheduledIds.map((id) => id.toString()).toList(),
    );
  }

  Future<void> _cancelPrevious() async {
    final raw = _prefs.getStringList(_scheduledIdsKey) ?? [];
    for (final idStr in raw) {
      final id = int.tryParse(idStr);
      if (id != null) {
        await driverLocalNotifications.cancel(id);
      }
    }
    await _prefs.remove(_scheduledIdsKey);
  }

  Future<bool> _ensureNotificationPermission() async {
    if (defaultTargetPlatform != TargetPlatform.android) return true;
    final status = await Permission.notification.status;
    if (status.isGranted) return true;
    final result = await Permission.notification.request();
    return result.isGranted;
  }

  int _notificationId(String bookingId, int hours) {
    return Object.hash(bookingId, hours).abs() % 2147483647;
  }
}

final driverBookingReminderServiceProvider =
    Provider<DriverBookingReminderService>((ref) {
  return DriverBookingReminderService(ref.watch(sharedPreferencesProvider));
});
