import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../car_rentals_theme.dart';
import '../widgets/car_hero_header.dart';
import '../widgets/car_rentals_nav_bar.dart';
import '../widgets/car_my_bookings_row.dart';
import '../widgets/car_promo_codes_card.dart';
import '../widgets/car_search_form_card.dart';
import '../widgets/car_top_brands_card.dart';
import '../widgets/car_why_book_section.dart';

/// Car rentals landing (hero + search card + promos + brands + why book).
class CarRentalsPage extends StatelessWidget {
  const CarRentalsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: Scaffold(
        extendBodyBehindAppBar: true,
        backgroundColor: CarRentalsTheme.pageBg,
        appBar: const CarRentalsNavBar(),
        body: SingleChildScrollView(
          clipBehavior: Clip.none,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const CarHeroHeader(),
              Transform.translate(
                offset: const Offset(0, -40),
                child: const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 16),
                  child: CarSearchFormCard(),
                ),
              ),
              const SizedBox(height: 4),
              const Padding(
                padding: EdgeInsets.fromLTRB(16, 0, 16, 12),
                child: CarPromoCodesCard(),
              ),
              const Padding(
                padding: EdgeInsets.fromLTRB(16, 0, 16, 12),
                child: CarMyBookingsRow(),
              ),
              const Padding(
                padding: EdgeInsets.fromLTRB(16, 0, 16, 12),
                child: CarTopBrandsCard(),
              ),
              const Padding(
                padding: EdgeInsets.fromLTRB(16, 0, 16, 24),
                child: CarWhyBookSection(),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
