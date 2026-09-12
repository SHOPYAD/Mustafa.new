import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../providers/router_providers.dart';
import 'hotel_details_property_summary.dart';
import 'hotel_details_room_offer_card.dart';

class HotelDetailsRoomsSection extends ConsumerWidget {
  const HotelDetailsRoomsSection({
    super.key,
    this.onDateTap,
    this.onGuestsTap,
  });

  final VoidCallback? onDateTap;
  final VoidCallback? onGuestsTap;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    void onReserve() => ref.read(navigationRepositoryProvider).goHotelBookingGuest();
    // Must not use a scrollable ListView here: this section is placed inside
    // [SliverToBoxAdapter] / [CustomScrollView], which gives the child
    // unbounded height along the scroll axis.
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 0, 12, 18),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Transform.translate(
            offset: const Offset(0, -14),
            child: const HotelDetailsPropertySummary(),
          ),
          const SizedBox(height: 12),
          _ChooseRoomCard(
            onDateTap: onDateTap,
            onGuestsTap: onGuestsTap,
          ),
          const SizedBox(height: 12),
          const _BookingDeadlineCard(),
          HotelDetailsRoomOfferCard(
            title: 'Accessible Room',
            imageAsset: 'assets/images/1.jpg',
            bedLabel: '1 full bed',
            sizeLabel: '226 ft²',
            viewLabel: 'City view',
            smokingLabel: 'Non-smoking',
            price: '\$138',
            strikePrice: '\$146',
            galleryCount: 9,
            onReserve: onReserve,
          ),
          HotelDetailsRoomOfferCard(
            title: 'Standard Room',
            imageAsset: 'assets/images/2.jpg',
            bedLabel: '1 queen bed',
            sizeLabel: '215 ft²',
            viewLabel: 'Courtyard view',
            smokingLabel: 'Non-smoking',
            price: '\$129',
            strikePrice: '\$139',
            galleryCount: 6,
            onReserve: onReserve,
          ),
          HotelDetailsRoomOfferCard(
            title: 'Twin Room',
            imageAsset: 'assets/images/3.jpg',
            bedLabel: '2 twin beds',
            sizeLabel: '248 ft²',
            viewLabel: 'City view',
            smokingLabel: 'Non-smoking',
            price: '\$142',
            strikePrice: '\$152',
            galleryCount: 12,
            onReserve: onReserve,
          ),
        ],
      ),
    );
  }
}

class _ChooseRoomCard extends StatelessWidget {
  const _ChooseRoomCard({
    this.onDateTap,
    this.onGuestsTap,
  });

  final VoidCallback? onDateTap;
  final VoidCallback? onGuestsTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Choose your room',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              fontSize: 22,
              height: 1.2,
              fontWeight: FontWeight.w700,
              color: const Color(0xFF111827),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              const Icon(Icons.verified_rounded, size: 17, color: Color(0xFF14B8A6)),
              const SizedBox(width: 6),
              Text(
                'We price match',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: const Color(0xFF0D9488),
                  fontSize: 14,
                  fontWeight: FontWeight.w400,
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 10),
                child: Text(
                  '|',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: const Color(0xFFD1D5DB),
                    fontWeight: FontWeight.w300,
                  ),
                ),
              ),
              const Icon(Icons.verified_rounded, size: 17, color: Color(0xFF14B8A6)),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  'Change & Cancellation Guarantee',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: const Color(0xFF0D9488),
                    fontSize: 14,
                    fontWeight: FontWeight.w400,
                    height: 1.25,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.fromLTRB(12, 12, 12, 12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFFE5E7EB)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: InkWell(
                    onTap: onDateTap,
                    borderRadius: BorderRadius.circular(8),
                    child: const Padding(
                      padding: EdgeInsets.symmetric(vertical: 2, horizontal: 2),
                      child: _CheckInOutPickerCell(),
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(top: 22),
                  child: Container(width: 1, height: 40, color: const Color(0xFFE5E7EB)),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: InkWell(
                    onTap: onGuestsTap,
                    borderRadius: BorderRadius.circular(8),
                    child: const Padding(
                      padding: EdgeInsets.symmetric(vertical: 2, horizontal: 2),
                      child: _RoomsGuestsPickerCell(),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _CheckInOutPickerCell extends StatelessWidget {
  const _CheckInOutPickerCell();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Check-in & check-out',
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            color: const Color(0xFF6B7280),
            fontSize: 12,
            fontWeight: FontWeight.w400,
          ),
        ),
        const SizedBox(height: 8),
        Row(
          crossAxisAlignment: CrossAxisAlignment.baseline,
          textBaseline: TextBaseline.alphabetic,
          children: [
            Expanded(
              child: Text(
                'Apr 23–Apr 25',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: const Color(0xFF111827),
                  height: 1.2,
                ),
              ),
            ),
            Text(
              '2 nights',
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: const Color(0xFF9CA3AF),
                fontSize: 12,
                fontWeight: FontWeight.w400,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _RoomsGuestsPickerCell extends StatelessWidget {
  const _RoomsGuestsPickerCell();

  static const _iconGrey = Color(0xFF6B7280);

  @override
  Widget build(BuildContext context) {
    final countStyle = Theme.of(context).textTheme.titleMedium?.copyWith(
      fontSize: 15,
          fontWeight: FontWeight.w700,
          color: const Color(0xFF111827),
        );

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Rooms & guests',
          style: Theme.of(context).textTheme.bodySmall?.copyWith(
            color: const Color(0xFF6B7280),
            fontSize: 12,
            fontWeight: FontWeight.w400,
          ),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            const Icon(Icons.door_front_door_outlined, size: 18, color: _iconGrey),
            const SizedBox(width: 4),
            Text('1', style: countStyle),
            const SizedBox(width: 14),
            const Icon(Icons.person_outline_rounded, size: 19, color: _iconGrey),
            const SizedBox(width: 4),
            Text('1', style: countStyle),
            const SizedBox(width: 14),
            const Icon(Icons.child_care_outlined, size: 19, color: _iconGrey),
            const SizedBox(width: 4),
            Text('0', style: countStyle),
          ],
        ),
      ],
    );
  }
}

class _BookingDeadlineCard extends StatelessWidget {
  const _BookingDeadlineCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        children: [
          Container(
            width: 92,
            height: 92,
            decoration: const BoxDecoration(
              color: Color(0xFFE5E7EB),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.manage_search_rounded, size: 44, color: Color(0xFF9CA3AF)),
          ),
          const SizedBox(height: 12),
          Text(
            "Today's booking deadline for this hotel has passed",
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              fontSize: 17,
              color: const Color(0xFF111827),
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () {},
                  style: OutlinedButton.styleFrom(
                    foregroundColor: const Color(0xFF1D4ED8),
                    side: const BorderSide(color: Color(0xFFD1D5DB)),
                    minimumSize: const Size.fromHeight(42),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: const Text('View other hotels'),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: FilledButton(
                  onPressed: () {},
                  style: FilledButton.styleFrom(
                    backgroundColor: const Color(0xFF7C3AED),
                    foregroundColor: Colors.white,
                    minimumSize: const Size.fromHeight(42),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: const Text('Change Date'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
