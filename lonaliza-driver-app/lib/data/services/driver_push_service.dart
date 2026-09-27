import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../presentation/providers/app_locale_provider.dart';
import 'driver_notifications.dart';
import 'driver_api.dart';

const _pushEnabledKey = 'driver_push_enabled_v1';
const _pushTokenKey = 'driver_push_token_v1';

final FlutterLocalNotificationsPlugin _localNotifications =
    driverLocalNotifications;

Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  debugPrint('FCM background: ${message.messageId}');
}

class DriverPushService {
  DriverPushService(this._prefs, this._api);

  final SharedPreferences _prefs;
  final DriverApi _api;
  bool _initialized = false;

  bool get isEnabled => _prefs.getBool(_pushEnabledKey) ?? false;

  Future<void> initialize() async {
    if (_initialized) return;
    _initialized = true;

    FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

    const androidInit = AndroidInitializationSettings('@mipmap/ic_launcher');
    await _localNotifications.initialize(
      const InitializationSettings(android: androidInit),
    );

    await _localNotifications
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(
          const AndroidNotificationChannel(
            driverDefaultChannelId,
            'Lonaliza Captain',
            description: 'VIP trip offers, payouts and corporate fleet updates',
            importance: Importance.high,
          ),
        );

    FirebaseMessaging.onMessage.listen((message) async {
      final notification = message.notification;
      if (notification == null) return;

      await _localNotifications.show(
        message.hashCode,
        notification.title,
        notification.body,
        const NotificationDetails(
          android: AndroidNotificationDetails(
            driverDefaultChannelId,
            'Lonaliza Captain',
            importance: Importance.high,
            priority: Priority.high,
          ),
        ),
      );
    });
  }

  Future<bool> setEnabled(bool enabled, {String? supplierId}) async {
    await _prefs.setBool(_pushEnabledKey, enabled);

    if (!enabled) {
      try {
        await FirebaseMessaging.instance.deleteToken();
      } catch (_) {}
      await _prefs.remove(_pushTokenKey);
      return true;
    }

    if (supplierId == null) return true;

    final token = await _resolveFcmToken();
    if (token == null || token.isEmpty) {
      throw Exception('Could not obtain FCM token');
    }

    await _api.registerFcmToken(supplierId, token);
    return true;
  }

  Future<void> syncIfEnabled(String? supplierId) async {
    if (!isEnabled || supplierId == null) return;
    final token = await _resolveFcmToken();
    if (token == null || token.isEmpty) return;
    await _api.registerFcmToken(supplierId, token);
  }

  Future<String?> _resolveFcmToken() async {
    final messaging = FirebaseMessaging.instance;
    await messaging.requestPermission();

    final cached = _prefs.getString(_pushTokenKey);
    if (cached != null && cached.isNotEmpty && !cached.startsWith('lonaliza-local-')) {
      return cached;
    }

    final token = await messaging.getToken();
    if (token != null && token.isNotEmpty) {
      await _prefs.setString(_pushTokenKey, token);
    }
    return token;
  }
}

final driverPushServiceProvider = Provider<DriverPushService>((ref) {
  return DriverPushService(
    ref.watch(sharedPreferencesProvider),
    ref.watch(driverApiProvider),
  );
});
