import 'package:go_router/go_router.dart';

import '../../domain/repositories/navigation_repository.dart';

class GoRouterNavigationRepository implements NavigationRepository {
  GoRouterNavigationRepository(this._router);

  final GoRouter _router;

  @override
  void goHome() => _router.go('/');

  @override
  void goFlights() => _router.go('/flights');

  @override
  void goFlightsSearch() => _router.push('/flights/search');

  @override
  void goFlightDetails([Object? extra]) => _router.push('/flights/details', extra: extra);

  @override
  void goFlightInfo() => _router.push('/flights/info');

  @override
  void goFlightAddons() => _router.push('/flights/addons');

  @override
  void goFlightPayment() => _router.push('/flights/payment');

  @override
  void goHotels() => _router.go('/hotels');

  @override
  void goCars() => _router.push('/cars');

  @override
  void goCarsSearch([Object? extra]) => _router.push('/cars/search', extra: extra);

  @override
  void goCarDetail([Object? extra]) => _router.push('/cars/detail', extra: extra);

  @override
  void goCarRentalProduct([Object? extra]) => _router.push('/cars/rental', extra: extra);

  @override
  void goCarBooking([Object? extra]) => _router.push('/cars/book', extra: extra);

  @override
  void goCarBookingPayment([Object? extra]) => _router.push('/cars/booking/payment', extra: extra);

  @override
  void goHotelsSearch() => _router.push('/hotels/search');

  @override
  void goHotelDetails() => _router.push('/hotels/details');

  @override
  void goAuth() => _router.push('/auth');

  @override
  void goMessages() => _router.go('/messages');

  @override
  void goMyTrips() => _router.go('/my-trips');

  @override
  void goPackage() => _router.push('/packages');

  @override
  void goAccount() => _router.push('/account');

  @override
  void goAccountAllBookings() => _router.push('/account/bookings');

  @override
  void goAccountUpcoming() => _router.push('/account/upcoming');

  @override
  void goAccountRecentlyViewed() => _router.push('/account/recently-viewed');

  @override
  void goAccountMyCards() => _router.push('/account/my-cards');

  @override
  void goAccountSettings() => _router.push('/account/settings');

  @override
  void goAccountManage() => _router.push('/account/manage');

  @override
  void goHotelBookingGuest() => _router.push('/hotels/booking/guest');

  @override
  void goHotelBookingPayment() => _router.push('/hotels/booking/payment', extra: 'USD105.12');
}
