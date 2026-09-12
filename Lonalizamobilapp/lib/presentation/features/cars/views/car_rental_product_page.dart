import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../car_booking_args.dart';
import '../car_rental_product_args.dart';
import '../widgets/rental_product/car_rental_coverage_packages_table.dart';
import '../widgets/rental_product/car_rental_credit_card_notice_block.dart';
import '../widgets/rental_product/car_rental_detail_tabs_bar.dart';
import '../widgets/rental_product/car_rental_evoucher_row.dart';
import '../widgets/rental_product/car_rental_extras_section.dart';
import '../widgets/rental_product/car_rental_feedback_prompt_card.dart';
import '../widgets/rental_product/car_rental_map_instructions_tile.dart';
import '../widgets/rental_product/car_rental_overview_card.dart';
import '../widgets/rental_product/car_rental_pickup_dropoff_section.dart';
import '../widgets/rental_product/car_rental_policies_notes_section.dart';
import '../widgets/rental_product/car_rental_product_bottom_bar.dart';
import '../widgets/rental_product/car_rental_product_hero.dart';
import '../widgets/rental_product/car_rental_product_title_block.dart';
import '../widgets/rental_product/car_rental_promo_codes_banner.dart';
import '../widgets/rental_product/car_rental_required_documents_section.dart';
import '../widgets/rental_product/car_rental_supplier_trust_block.dart';
import '../widgets/rental_product/car_rental_terms_preview_row.dart';
import '../widgets/rental_product/car_rental_thick_section_divider.dart';

/// Post-**Select** rental product page: hero → overview → supplier → tabs (Details / Coverage / Documents).
class CarRentalProductPage extends StatefulWidget {
  const CarRentalProductPage({
    super.key,
    required this.args,
  });

  final CarRentalProductArgs args;

  @override
  State<CarRentalProductPage> createState() => _CarRentalProductPageState();
}

class _CarRentalProductPageState extends State<CarRentalProductPage> {
  static const _tabs = ['Details', 'Select coverage package', 'Required documents'];

  int _tabIndex = 0;

  String get _vehiclePrimaryName {
    final t = widget.args.vehicleTitle;
    if (t.contains(' or similar')) {
      return t.replaceFirst(' or similar', '').trim();
    }
    return t;
  }

  @override
  Widget build(BuildContext context) {
    final a = widget.args;
    return Scaffold(
      backgroundColor: Colors.white,
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: EdgeInsets.zero,
              children: [
                const CarRentalProductHero(),
                CarRentalOverviewCard(
                  vehicleName: _vehiclePrimaryName,
                  similarClassLine: a.vehicleSubtitle,
                ),
                const SizedBox(height: 8),
                const CarRentalPromoCodesBanner(),
                CarRentalSupplierTrustBlock(
                  supplierName: a.supplierName,
                  ratingLabel: a.ratingLabel,
                  reviewsLine: a.reviewsLine,
                  chainTag: a.chainTag,
                ),
                CarRentalTermsPreviewRow(
                  heading: a.cancellationHeading,
                  bullets: a.rentalPreviewBullets,
                ),
                const CarRentalThickSectionDivider(),
                ColoredBox(
                  color: Colors.white,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      CarRentalProductTitleBlock(title: a.vehicleTitle, subtitle: a.dateRangeLine),
                      CarRentalDetailTabsBar(
                        tabs: _tabs,
                        selectedIndex: _tabIndex,
                        onChanged: (i) => setState(() => _tabIndex = i),
                      ),
                      if (_tabIndex == 0) ...[
                        const CarRentalEvoucherRow(),
                        CarRentalPickupDropoffSection(
                          dateLine: a.pickupDateLine,
                          branchLine: a.pickupBranchLine,
                          businessHoursLine: a.businessHoursLine,
                        ),
                        const CarRentalMapInstructionsTile(),
                      ],
                      if (_tabIndex == 1) ...[
                        const CarRentalCoveragePackagesTable(),
                        const CarRentalThickSectionDivider(height: 8),
                        const CarRentalExtrasSection(),
                        const CarRentalFeedbackPromptCard(),
                        const CarRentalRequiredDocumentsSection(),
                      ],
                      if (_tabIndex == 2) ...[
                        const CarRentalRequiredDocumentsSection(),
                        const CarRentalCreditCardNoticeBlock(),
                        const CarRentalThickSectionDivider(height: 8),
                        const CarRentalPoliciesNotesSection(),
                      ],
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: CarRentalProductBottomBar(
        totalLabel: a.totalLabel,
        paymentNote: a.paymentNote,
        onContinue: () => context.push('/cars/book', extra: CarBookingArgs.fromProduct(a)),
      ),
    );
  }
}
