import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';

import '../car_booking_args.dart';
import '../car_booking_theme.dart';
import '../widgets/booking/car_booking_app_bar.dart';
import '../widgets/booking/car_booking_contact_section.dart';
import '../widgets/booking/car_booking_driver_section.dart';
import '../widgets/booking/car_booking_instant_banner.dart';
import '../widgets/booking/car_booking_flight_section.dart';
import '../widgets/booking/car_booking_legal_section.dart';
import '../widgets/booking/car_booking_pay_bottom_bar.dart';
import '../widgets/booking/car_booking_savings_card.dart';
import '../widgets/booking/car_booking_summary_card.dart';

/// **Book** — checkout: summary, driver, contact, flight, savings, legal, Pay.
class CarBookingPage extends StatefulWidget {
  const CarBookingPage({
    super.key,
    required this.args,
  });

  final CarBookingArgs args;

  @override
  State<CarBookingPage> createState() => _CarBookingPageState();
}

class _CarBookingPageState extends State<CarBookingPage> {
  late final TextEditingController _given;
  late final TextEditingController _surname;
  late final TextEditingController _age;
  late final TextEditingController _licenseCountry;
  late final TextEditingController _phone;
  late final TextEditingController _email;
  late final TextEditingController _flight;

  bool _saveDefault = false;

  @override
  void initState() {
    super.initState();
    final a = widget.args;
    _given = TextEditingController(text: a.driverGivenNames);
    _surname = TextEditingController(text: a.driverSurname);
    _age = TextEditingController(text: a.driverAge);
    _licenseCountry = TextEditingController(text: a.licenseCountry);
    _phone = TextEditingController();
    _email = TextEditingController();
    _flight = TextEditingController();
  }

  @override
  void dispose() {
    _given.dispose();
    _surname.dispose();
    _age.dispose();
    _licenseCountry.dispose();
    _phone.dispose();
    _email.dispose();
    _flight.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final a = widget.args;
    return Theme(
      data: Theme.of(context).copyWith(
        textTheme: GoogleFonts.interTextTheme(Theme.of(context).textTheme),
      ),
      child: Scaffold(
      backgroundColor: CarBookingTheme.pageBg,
      appBar: const CarBookingAppBar(),
      body: ListView(
        padding: EdgeInsets.zero,
        children: [
          CarBookingSummaryCard(
            vehicleTitle: a.vehicleTitle,
            calendarLine: a.calendarLine,
            pickupSummaryLine: a.pickupSummaryLine,
            protectionLabel: a.protectionLabel,
            supplierName: a.supplierName,
            cancellationLine: a.cancellationLine,
          ),
          const CarBookingInstantBanner(),
          CarBookingDriverSection(
            givenNamesController: _given,
            surnameController: _surname,
            ageController: _age,
            licenseCountryController: _licenseCountry,
          ),
          CarBookingContactSection(
            phoneController: _phone,
            emailController: _email,
            saveDefault: _saveDefault,
            onSaveDefaultChanged: (v) => setState(() => _saveDefault = v),
          ),
          CarBookingFlightSection(flightController: _flight),
          const CarBookingSavingsCard(),
          const CarBookingLegalSection(),
        ],
      ),
      bottomNavigationBar: CarBookingPayBottomBar(
        totalLabel: a.totalLabel,
        paymentNote: a.paymentNote,
        onPay: () => context.push('/cars/booking/payment', extra: a.totalLabel),
      ),
      ),
    );
  }
}
