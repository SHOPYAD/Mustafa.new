import 'package:flutter_local_notifications/flutter_local_notifications.dart';

/// Shared local notifications plugin (FCM foreground + booking reminders).
final FlutterLocalNotificationsPlugin driverLocalNotifications =
    FlutterLocalNotificationsPlugin();

const driverDefaultChannelId = 'lonaliza_driver_default';
const driverReminderChannelId = 'lonaliza_driver_reminders';
