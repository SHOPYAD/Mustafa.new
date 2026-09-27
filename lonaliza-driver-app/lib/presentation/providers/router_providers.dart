import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'driver_session_provider.dart';
import '../features/auth/views/auth_page.dart';
import '../features/driver/views/driver_active_trips_page.dart';
import '../features/driver/views/driver_add_vehicle_page.dart';
import '../features/driver/views/driver_catalog_page.dart';
import '../features/driver/views/driver_dashboard_page.dart';
import '../features/driver/views/driver_earnings_page.dart';
import '../features/driver/views/driver_fleet_page.dart';
import '../features/driver/views/driver_login_page.dart';
import '../features/driver/views/driver_main_shell.dart';
import '../features/driver/views/driver_offers_page.dart';
import '../features/driver/views/driver_payouts_page.dart';
import '../features/driver/views/driver_profile_page.dart';
import '../features/driver/views/driver_register_page.dart';
import '../features/driver/views/driver_route_pricing_page.dart';
import '../features/driver/views/driver_settings_page.dart';
import '../features/driver/views/driver_create_tour_page.dart';
import '../features/driver/views/driver_live_map_page.dart';
import '../features/driver/views/driver_quote_requests_page.dart';
import '../features/driver/views/driver_reviews_page.dart';
import '../features/driver/views/driver_sub_drivers_page.dart';
import '../features/driver/views/driver_tour_offers_page.dart';
import '../features/driver/views/driver_trip_execution_page.dart';
import '../features/driver/views/driver_welcome_sign_page.dart';
import '../features/driver/views/driver_flight_radar_page.dart';
import '../features/splash/views/splash_page.dart';
import '../../domain/repositories/navigation_repository.dart';
import '../../data/repositories/go_router_navigation_repository.dart';

import 'package:flutter/foundation.dart';

class RouterNotifier extends ChangeNotifier {
  final Ref _ref;

  RouterNotifier(this._ref) {
    _ref.listen<DriverSessionState>(
      driverSessionProvider,
      (previous, next) {
        if (previous?.isRegistered != next.isRegistered) {
          notifyListeners();
        }
      },
    );
  }
}

final routerNotifierProvider = Provider<RouterNotifier>((ref) {
  return RouterNotifier(ref);
});

final goRouterProvider = Provider<GoRouter>((ref) {
  final notifier = ref.watch(routerNotifierProvider);
  final initialSession = ref.read(driverSessionProvider);

  return GoRouter(
    initialLocation: initialSession.isRegistered ? '/' : '/splash',
    refreshListenable: notifier,
    redirect: (context, state) {
      final session = ref.read(driverSessionProvider);
      final loc = state.matchedLocation;
      final onSplash = loc == '/splash';
      final onRegister = loc == '/register';
      final onLogin = loc == '/login';
      final onLegacyAuth = loc == '/legacy-auth';

      final isPublic = onSplash || onRegister || onLogin || onLegacyAuth;

      if (!session.isRegistered && !isPublic) {
        return '/splash';
      }

      if (session.isRegistered && onLogin) {
        return '/';
      }

      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        name: 'splash',
        builder: (context, state) => const SplashPage(),
      ),
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => const DriverLoginPage(),
      ),
      GoRoute(
        path: '/legacy-auth',
        name: 'legacy-auth',
        builder: (context, state) => const AuthPage(),
      ),
      GoRoute(
        path: '/register',
        name: 'register',
        builder: (context, state) => const DriverRegisterPage(),
      ),
      ShellRoute(
        builder: (context, state, child) => DriverMainShell(child: child),
        routes: [
          GoRoute(
            path: '/',
            name: 'home',
            builder: (context, state) => const DriverDashboardPage(),
          ),
          GoRoute(
            path: '/trips',
            name: 'trips',
            builder: (context, state) => const DriverActiveTripsPage(),
          ),
          GoRoute(
            path: '/earnings',
            name: 'earnings',
            builder: (context, state) => const DriverEarningsPage(),
          ),
          GoRoute(
            path: '/profile',
            name: 'profile',
            builder: (context, state) => const DriverProfilePage(),
          ),
        ],
      ),
      GoRoute(
        path: '/offers',
        name: 'offers',
        builder: (context, state) => const DriverOffersPage(),
      ),
      GoRoute(
        path: '/trip',
        name: 'trip',
        builder: (context, state) => DriverTripExecutionPage(
          serviceType: state.uri.queryParameters['serviceType'] ?? 'transfer',
          bookingId: state.uri.queryParameters['bookingId'],
        ),
      ),
      GoRoute(
        path: '/catalog',
        name: 'catalog',
        builder: (context, state) => const DriverCatalogPage(),
      ),
      GoRoute(
        path: '/route-pricing',
        name: 'route-pricing',
        builder: (context, state) => const DriverRoutePricingPage(),
      ),
      GoRoute(
        path: '/tour-offers',
        name: 'tour-offers',
        builder: (context, state) => const DriverTourOffersPage(),
      ),
      GoRoute(
        path: '/fleet',
        name: 'fleet',
        builder: (context, state) => const DriverFleetPage(),
        routes: [
          GoRoute(
            path: 'add',
            name: 'fleet-add',
            builder: (context, state) => const DriverAddVehiclePage(),
          ),
        ],
      ),
      GoRoute(
        path: '/payouts',
        name: 'payouts',
        builder: (context, state) => const DriverPayoutsPage(),
      ),
      GoRoute(
        path: '/sub-drivers',
        name: 'sub-drivers',
        builder: (context, state) => const DriverSubDriversPage(),
      ),
      GoRoute(
        path: '/live-map',
        name: 'live-map',
        builder: (context, state) => const DriverLiveMapPage(),
      ),
      GoRoute(
        path: '/quote-requests',
        name: 'quote-requests',
        builder: (context, state) => const DriverQuoteRequestsPage(),
      ),
      GoRoute(
        path: '/reviews',
        name: 'reviews',
        builder: (context, state) => const DriverReviewsPage(),
      ),
      GoRoute(
        path: '/tours/create',
        name: 'create-tour',
        builder: (context, state) => const DriverCreateTourPage(),
      ),
      GoRoute(
        path: '/welcome-sign',
        name: 'welcome-sign',
        builder: (context, state) => DriverWelcomeSignPage(
          passengerName: state.uri.queryParameters['passengerName'] ?? 'VIP GUEST',
          flightNumber: state.uri.queryParameters['flightNumber'],
          hotelOrDestination: state.uri.queryParameters['destination'],
        ),
      ),
      GoRoute(
        path: '/flight-radar',
        name: 'flight-radar',
        builder: (context, state) {
          final modeParam = state.uri.queryParameters['mode'];
          final initialMode = modeParam == 'airspace' ? RadarMode.airspace : RadarMode.singleFlight;
          return DriverFlightRadarPage(
            initialFlightNumber: state.uri.queryParameters['flightNumber'] ?? state.uri.queryParameters['flight'],
            initialMode: initialMode,
            passengerName: state.uri.queryParameters['passengerName'],
            destination: state.uri.queryParameters['destination'],
          );
        },
      ),
      GoRoute(
        path: '/settings',
        name: 'settings',
        builder: (context, state) => const DriverSettingsPage(),
      ),
    ],
  );
});

final navigationRepositoryProvider = Provider<NavigationRepository>((ref) {
  final router = ref.watch(goRouterProvider);
  return GoRouterNavigationRepository(router);
});
