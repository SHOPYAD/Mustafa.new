import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/extensions/context_l10n.dart';
import '../../data/repositories/go_router_navigation_repository.dart';
import '../../domain/repositories/navigation_repository.dart';
import '../features/flights/views/flights_page.dart';
import '../features/flights/views/flights_search_results_page.dart';
import '../../domain/entities/flights/flight_offer.dart';
import '../features/flights/views/flight_details_page.dart';
import '../features/flights/views/flight_info_page.dart';
import '../features/flights/views/flight_addons_page.dart';
import '../features/flights/views/flight_payment_page.dart';
import '../features/account/all_bookings/views/all_bookings_page.dart';
import '../features/account/views/account_remote_page.dart';
import '../features/account/views/account_coupon_page.dart';
import '../features/catalog/views/live_catalog_page.dart';
import '../../core/constants/app_constants.dart';
import '../features/account/my_cards/views/my_cards_page.dart';
import '../features/account/manage_account/views/manage_account_page.dart';
import '../features/account/settings/views/settings_page.dart';
import '../features/account/recently_viewed/views/recently_viewed_page.dart';
import '../features/account/upcoming/views/upcoming_page.dart';
import '../features/account/views/account_page.dart';
import '../features/auth/views/auth_page.dart';
import '../features/my_trips/views/my_trips_page.dart';
import '../features/packages/views/package_page.dart';
import '../features/packages/views/package_search_results_page.dart';
import '../features/packages/views/package_tour_details_page.dart';
import '../features/packages/views/package_confirm_options_page.dart';
import '../features/packages/views/package_confirm_booking_page.dart';
import '../features/home/views/home_page.dart';
import '../features/hotels/views/hotels_page.dart';
import '../features/hotels/views/hotels_search_results_page.dart';
import '../features/cars/car_detail_args.dart';
import '../features/cars/car_booking_args.dart';
import '../features/cars/car_rental_product_args.dart';
import '../features/cars/car_search_results_args.dart';
import '../features/cars/views/car_detail_page.dart';
import '../features/cars/views/car_booking_page.dart';
import '../features/cars/views/car_rental_product_page.dart';
import '../features/cars/views/car_rentals_page.dart';
import '../features/cars/views/car_search_results_page.dart';
import '../features/hotels/views/hotel_booking_guest_page.dart';
import '../features/hotels/views/live_hotel_details_page.dart';
import '../features/splash/views/onboarding_page.dart';
import '../features/splash/views/splash_page.dart';
import '../features/transfers/views/transfers_page.dart';
import '../features/pay/iyzico_checkout_args.dart';
import '../features/pay/iyzico_checkout_page.dart';
import '../features/community/views/community_page.dart';
import '../features/community/views/reels_page.dart';
import '../features/ai/views/ai_chat_page.dart';
import '../features/inbox/views/inbox_page.dart';
import '../features/gifts/views/gift_cards_page.dart';

final goRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/splash',
    routes: [
      GoRoute(
        path: '/splash',
        name: 'splash',
        builder: (context, state) => const SplashPage(),
      ),
      GoRoute(
        path: '/onboarding',
        name: 'onboarding',
        builder: (context, state) => const OnboardingPage(),
      ),
      GoRoute(
        path: '/',
        name: 'home',
        builder: (context, state) =>
            HomePage(title: context.l10n.appTitle),
      ),
      GoRoute(
        path: '/transfers',
        name: 'transfers',
        builder: (context, state) => const TransfersPage(),
      ),
      GoRoute(
        path: '/flights',
        name: 'flights',
        builder: (context, state) => const FlightsPage(),
      ),
      GoRoute(
        path: '/flights/search',
        name: 'flights-search',
        pageBuilder: (context, state) => CustomTransitionPage(
          key: state.pageKey,
          child: const FlightsSearchResultsPage(),
          transitionDuration: const Duration(milliseconds: 220),
          reverseTransitionDuration: const Duration(milliseconds: 180),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return SlideTransition(
              position: Tween<Offset>(
                begin: const Offset(0, 0.06),
                end: Offset.zero,
              ).animate(CurvedAnimation(
                parent: animation,
                curve: Curves.easeOut,
              )),
              child: FadeTransition(opacity: animation, child: child),
            );
          },
        ),
      ),
      GoRoute(
        path: '/flights/details',
        name: 'flight-details',
        builder: (context, state) {
          final offer = state.extra as FlightOffer?;
          return FlightDetailsPage(offer: offer);
        },
      ),
      GoRoute(
        path: '/flights/info',
        name: 'flight-info',
        builder: (context, state) => const FlightInfoPage(),
      ),
      GoRoute(
        path: '/flights/addons',
        name: 'flight-addons',
        builder: (context, state) => const FlightAddonsPage(),
      ),
      GoRoute(
        path: '/flights/payment',
        name: 'flight-payment',
        builder: (context, state) {
          final extra = state.extra;
          if (extra is IyzicoCheckoutArgs) {
            return IyzicoCheckoutPage(args: extra);
          }
          return const FlightPaymentPage();
        },
      ),
      GoRoute(
        path: '/pay/iyzico',
        name: 'iyzico-checkout',
        builder: (context, state) {
          final extra = state.extra;
          final args = extra is IyzicoCheckoutArgs
              ? extra
              : const IyzicoCheckoutArgs(bookingId: '');
          return IyzicoCheckoutPage(args: args);
        },
      ),
      GoRoute(
        path: '/auth',
        name: 'auth',
        builder: (context, state) => const AuthPage(),
      ),
      GoRoute(
        path: '/messages',
        name: 'messages',
        builder: (context, state) => const InboxPage(),
      ),
      GoRoute(
        path: '/community',
        name: 'community',
        builder: (context, state) => const CommunityPage(),
      ),
      GoRoute(
        path: '/community/reels',
        name: 'community-reels',
        builder: (context, state) => const ReelsPage(),
      ),
      GoRoute(
        path: '/ai',
        name: 'ai',
        builder: (context, state) => const AiChatPage(),
      ),
      GoRoute(
        path: '/gift-cards',
        name: 'gift-cards',
        builder: (context, state) => const GiftCardsPage(),
      ),
      GoRoute(
        path: '/my-trips',
        name: 'my-trips',
        builder: (context, state) => const MyTripsPage(),
      ),
      GoRoute(
        path: '/packages',
        name: 'packages',
        builder: (context, state) => const PackagePage(),
      ),
      GoRoute(
        path: '/packages/search',
        name: 'packages-search',
        builder: (context, state) {
          final q = state.uri.queryParameters['q'] ?? '';
          return PackageSearchResultsPage(query: q);
        },
      ),
      GoRoute(
        path: '/packages/details',
        name: 'packages-details',
        builder: (context, state) => const PackageTourDetailsPage(),
      ),
      GoRoute(
        path: '/packages/confirm',
        name: 'packages-confirm',
        builder: (context, state) => const PackageConfirmOptionsPage(),
      ),
      GoRoute(
        path: '/packages/booking',
        name: 'packages-booking',
        builder: (context, state) => const PackageConfirmBookingPage(),
      ),
      GoRoute(
        path: '/checkout-payment',
        name: 'checkout-payment',
        builder: (context, state) {
          final extra = state.extra;
          if (extra is IyzicoCheckoutArgs) {
            return IyzicoCheckoutPage(args: extra);
          }
          return const _LivePayRequiredPage();
        },
      ),
      GoRoute(
        path: '/account',
        name: 'account',
        builder: (context, state) => const AccountPage(),
      ),
      GoRoute(
        path: '/account/bookings',
        name: 'account-all-bookings',
        builder: (context, state) => const AllBookingsPage(),
      ),
      GoRoute(
        path: '/account/wallet',
        name: 'account-wallet',
        builder: (context, state) => const AccountRemotePage(
          title: 'Wallet',
          path: AppConstants.accountWalletUrl,
        ),
      ),
      GoRoute(
        path: '/account/payments',
        name: 'account-payments',
        builder: (context, state) => const AccountRemotePage(
          title: 'Payments',
          path: AppConstants.accountPaymentsUrl,
          listKey: 'payments',
        ),
      ),
      GoRoute(
        path: '/account/affiliate',
        name: 'account-affiliate',
        builder: (context, state) => const AccountRemotePage(
          title: 'Affiliate',
          path: AppConstants.accountAffiliateUrl,
        ),
      ),
      GoRoute(
        path: '/account/coupons',
        name: 'account-coupons',
        builder: (context, state) => const AccountCouponPage(),
      ),
      GoRoute(
        path: '/catalog/cars',
        name: 'catalog-cars',
        builder: (context, state) => const LiveCatalogPage(
          title: 'سيارات للإيجار',
          url: AppConstants.carsCatalogUrl,
          listKey: 'cars',
          serviceType: 'cars',
        ),
      ),
      GoRoute(
        path: '/catalog/packages',
        name: 'catalog-packages',
        builder: (context, state) => const LiveCatalogPage(
          title: 'الباقات السياحية',
          url: AppConstants.packagesCatalogUrl,
          listKey: 'packages',
          serviceType: 'packages',
        ),
      ),
      GoRoute(
        path: '/catalog/tours',
        name: 'catalog-tours',
        builder: (context, state) => const LiveCatalogPage(
          title: 'الرحلات والبرامج',
          url: AppConstants.toursCatalogUrl,
          listKey: 'tours',
          serviceType: 'tours',
        ),
      ),
      GoRoute(
        path: '/account/upcoming',
        name: 'account-upcoming',
        builder: (context, state) => const UpcomingPage(),
      ),
      GoRoute(
        path: '/account/recently-viewed',
        name: 'account-recently-viewed',
        builder: (context, state) => const RecentlyViewedPage(),
      ),
      GoRoute(
        path: '/account/my-cards',
        name: 'account-my-cards',
        builder: (context, state) => const MyCardsPage(),
      ),
      GoRoute(
        path: '/account/settings',
        name: 'account-settings',
        builder: (context, state) => const SettingsPage(),
      ),
      GoRoute(
        path: '/account/manage',
        name: 'account-manage',
        builder: (context, state) => const ManageAccountPage(),
      ),
      GoRoute(
        path: '/hotels',
        name: 'hotels',
        builder: (context, state) => const HotelsPage(),
      ),
      GoRoute(
        path: '/cars',
        name: 'cars',
        builder: (context, state) => const CarRentalsPage(),
      ),
      GoRoute(
        path: '/cars/search',
        name: 'cars-search',
        builder: (context, state) {
          final extra = state.extra;
          final args = extra is CarSearchResultsArgs ? extra : CarSearchResultsArgs.fallback();
          return CarSearchResultsPage(args: args);
        },
      ),
      GoRoute(
        path: '/cars/detail',
        name: 'cars-detail',
        builder: (context, state) {
          final extra = state.extra;
          final args = extra is CarDetailArgs ? extra : CarDetailArgs.fallback;
          return CarDetailPage(args: args);
        },
      ),
      GoRoute(
        path: '/cars/rental',
        name: 'cars-rental',
        builder: (context, state) {
          final extra = state.extra;
          final args = extra is CarRentalProductArgs ? extra : CarRentalProductArgs.fallback;
          return CarRentalProductPage(args: args);
        },
      ),
      GoRoute(
        path: '/cars/book',
        name: 'cars-book',
        builder: (context, state) {
          final extra = state.extra;
          final args = extra is CarBookingArgs ? extra : CarBookingArgs.fallback;
          return CarBookingPage(args: args);
        },
      ),
      GoRoute(
        path: '/cars/booking/payment',
        name: 'cars-booking-payment',
        builder: (context, state) {
          final extra = state.extra;
          if (extra is IyzicoCheckoutArgs) {
            return IyzicoCheckoutPage(args: extra);
          }
          return const _LivePayRequiredPage();
        },
      ),
      GoRoute(
        path: '/hotels/search',
        name: 'hotels-search',
        builder: (context, state) => const HotelsSearchResultsPage(),
      ),
      GoRoute(
        path: '/hotels/details',
        name: 'hotel-details',
        builder: (context, state) {
          final extra = state.extra;
          return LiveHotelDetailsPage(
            hotel: extra is Map ? Map<String, dynamic>.from(extra) : null,
          );
        },
      ),
      GoRoute(
        path: '/hotels/booking/guest',
        name: 'hotel-booking-guest',
        builder: (context, state) => const HotelBookingGuestPage(),
      ),
      GoRoute(
        path: '/hotels/booking/payment',
        name: 'hotel-booking-payment',
        builder: (context, state) {
          final extra = state.extra;
          if (extra is IyzicoCheckoutArgs) {
            return IyzicoCheckoutPage(args: extra);
          }
          return const _LivePayRequiredPage();
        },
      ),
    ],
  );
});

final navigationRepositoryProvider = Provider<NavigationRepository>((ref) {
  final router = ref.watch(goRouterProvider);
  return GoRouterNavigationRepository(router);
});

class _LivePayRequiredPage extends StatelessWidget {
  const _LivePayRequiredPage();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Text(
            'ابدأ الحجز من نتائج البحث الحية. الدفع يتم عبر iyzico بعد إنشاء الحجز على الخادم.',
            textAlign: TextAlign.center,
          ),
        ),
      ),
    );
  }
}
