import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'core/theme/app_theme.dart';
import 'data/services/driver_api.dart';
import 'data/services/driver_booking_reminder_service.dart';
import 'data/services/driver_push_service.dart';
import 'firebase_options.dart';
import 'l10n/app_localizations.dart';
import 'presentation/providers/app_locale_provider.dart';
import 'presentation/providers/driver_session_provider.dart';
import 'presentation/providers/router_providers.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  FlutterError.onError = (details) {
    FlutterError.presentError(details);
  };

  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  final prefs = await SharedPreferences.getInstance();
  runApp(
    ProviderScope(
      overrides: [sharedPreferencesProvider.overrideWithValue(prefs)],
      child: const MyApp(),
    ),
  );
}

class MyApp extends ConsumerStatefulWidget {
  const MyApp({super.key});

  @override
  ConsumerState<MyApp> createState() => _MyAppState();
}

class _MyAppState extends ConsumerState<MyApp> with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    WidgetsBinding.instance.addPostFrameCallback((_) => _bootstrapPush());
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _syncReminders();
    }
  }

  Future<void> _syncReminders() async {
    final session = ref.read(driverSessionProvider);
    final supplierId = session.supplierId;
    if (supplierId == null) return;
    try {
      final analytics =
          await ref.read(driverApiProvider).fetchAnalytics(supplierId);
      final l10n = AppLocalizations.of(context);
      if (l10n == null) return;
      await ref.read(driverBookingReminderServiceProvider).syncFromAnalytics(
            analytics,
            title: l10n.bookingReminderNotificationTitle,
            bodyFor: (reference, hours) =>
                l10n.bookingReminderNotificationBody(reference, hours),
          );
    } catch (_) {}
  }

  Future<void> _bootstrapPush() async {
    final push = ref.read(driverPushServiceProvider);
    await push.initialize();
    final session = ref.read(driverSessionProvider);
    final supplierId = session.supplierId;
    if (supplierId != null) {
      await ref
          .read(driverSessionProvider.notifier)
          .refreshFromApi(ref.read(driverApiProvider));
    }
    await push.syncIfEnabled(supplierId);
  }

  @override
  Widget build(BuildContext context) {
    final router = ref.watch(goRouterProvider);
    final locale = ref.watch(appLocaleNotifierProvider);
    return MaterialApp.router(
      routerConfig: router,
      locale: locale,
      title: 'Lonaliza Captain',
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: AppLocalizations.supportedLocales,
      theme: AppTheme.light(),
    );
  }
}
