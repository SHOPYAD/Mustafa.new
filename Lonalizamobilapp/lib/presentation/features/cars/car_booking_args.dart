import 'car_rental_product_args.dart';

/// Checkout **Book** screen (driver, contact, flight, pay).
class CarBookingArgs {
  const CarBookingArgs({
    required this.vehicleTitle,
    required this.calendarLine,
    required this.pickupSummaryLine,
    required this.protectionLabel,
    required this.supplierName,
    required this.cancellationLine,
    required this.totalLabel,
    required this.paymentNote,
    this.driverGivenNames = 'AHMED',
    this.driverSurname = 'KEMOUKH',
    this.driverAge = '30',
    this.licenseCountry = 'United States',
  });

  final String vehicleTitle;
  final String calendarLine;
  final String pickupSummaryLine;
  final String protectionLabel;
  final String supplierName;
  final String cancellationLine;
  final String totalLabel;
  final String paymentNote;
  final String driverGivenNames;
  final String driverSurname;
  final String driverAge;
  final String licenseCountry;

  static const CarBookingArgs fallback = CarBookingArgs(
    vehicleTitle: 'Toyota Camry or similar',
    calendarLine: '10:00 AM, Apr 25 - 10:00 AM, Apr 28',
    pickupSummaryLine: 'Pick-up & drop-off at Los Angeles International Airport branch',
    protectionLabel: 'None Protection',
    supplierName: 'SIXT',
    cancellationLine: 'Cancellation with fee',
    totalLabel: r'$173.1 Total',
    paymentNote: 'Prepay online',
  );

  factory CarBookingArgs.fromProduct(CarRentalProductArgs p) {
    return CarBookingArgs(
      vehicleTitle: p.vehicleTitle,
      calendarLine: p.dateRangeLine,
      pickupSummaryLine: 'Pick-up & drop-off at Los Angeles International Airport branch',
      protectionLabel: 'None Protection',
      supplierName: p.supplierName,
      cancellationLine: p.cancellationHeading,
      totalLabel: p.totalLabel,
      paymentNote: p.paymentNote,
    );
  }
}
