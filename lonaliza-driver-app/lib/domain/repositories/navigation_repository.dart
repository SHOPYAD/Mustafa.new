/// Abstraction for navigation actions (no Flutter / router imports here).
abstract class NavigationRepository {
  void goHome();
  void goFlights();
  void goFlightsSearch();
  void goFlightDetails([Object? extra]);
  void goFlightInfo();
  void goFlightAddons();
  void goFlightPayment();
  void goHotels();
  void goCars();
  void goCarsSearch([Object? extra]);
  void goCarDetail([Object? extra]);
  void goCarRentalProduct([Object? extra]);
  void goCarBooking([Object? extra]);
  void goCarBookingPayment([Object? extra]);
  void goHotelsSearch();
  void goHotelDetails();
  void goAuth();
  void goMessages();
  void goMyTrips();
  void goPackage();
  void goAccount();
  void goAccountAllBookings();
  void goAccountUpcoming();
  void goAccountRecentlyViewed();
  void goAccountMyCards();
  void goAccountSettings();
  void goAccountManage();
  void goHotelBookingGuest();
  void goHotelBookingPayment();
}
