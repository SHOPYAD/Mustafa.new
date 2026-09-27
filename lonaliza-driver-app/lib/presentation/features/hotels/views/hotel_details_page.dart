import 'package:flutter/material.dart';

import '../widgets/details/hotel_details_bottom_action_bar.dart';
import '../widgets/details/hotel_details_faq_section.dart';
import '../widgets/details/hotel_details_location_section.dart';
import '../widgets/details/hotel_details_policies_section.dart';
import '../widgets/details/hotel_details_rooms_section.dart';
import '../widgets/details/hotel_details_why_book_panel.dart';
import '../widgets/hotels_date_picker_sheet.dart';
import '../widgets/hotels_room_guests_sheet.dart';

class HotelDetailsPage extends StatefulWidget {
  const HotelDetailsPage({super.key});

  @override
  State<HotelDetailsPage> createState() => _HotelDetailsPageState();
}

class _HotelDetailsPageState extends State<HotelDetailsPage> {
  Future<void> _showDatePickerSheet() {
    return showGeneralDialog<void>(
      context: context,
      barrierDismissible: true,
      barrierLabel: 'Date picker',
      barrierColor: Colors.black54,
      transitionDuration: const Duration(milliseconds: 240),
      pageBuilder: (_, _, _) => const HotelsDatePickerSheet(),
      transitionBuilder: (context, animation, secondaryAnimation, child) {
        final offsetTween = Tween<Offset>(
          begin: const Offset(0, 1),
          end: Offset.zero,
        );
        return SlideTransition(
          position: animation.drive(CurveTween(curve: Curves.easeOutCubic)).drive(offsetTween),
          child: child,
        );
      },
    );
  }

  Future<void> _showRoomGuestsSheet() {
    return showGeneralDialog<void>(
      context: context,
      barrierDismissible: true,
      barrierLabel: 'Rooms and guests',
      barrierColor: Colors.black54,
      transitionDuration: const Duration(milliseconds: 240),
      pageBuilder: (_, _, _) => const HotelsRoomGuestsSheet(),
      transitionBuilder: (context, animation, secondaryAnimation, child) {
        final offsetTween = Tween<Offset>(
          begin: const Offset(0, 1),
          end: Offset.zero,
        );
        return SlideTransition(
          position: animation.drive(CurveTween(curve: Curves.easeOutCubic)).drive(offsetTween),
          child: child,
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF3F4F6),
      bottomNavigationBar: const HotelDetailsBottomActionBar(),
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            expandedHeight: 280,
            backgroundColor: Colors.white,
            surfaceTintColor: Colors.transparent,
            title: const _CollapsedAppBarTitle(),
            leading: _CircleHeaderIconButton(
              onPressed: () => Navigator.of(context).maybePop(),
              icon: Icons.arrow_back_ios_new_rounded,
              iconSize: 16,
            ),
            actions: const [
              _TopCircleIcon(icon: Icons.favorite_border_rounded),
              SizedBox(width: 8),
              _TopCircleIcon(icon: Icons.share_outlined),
              SizedBox(width: 10),
            ],
            flexibleSpace: const FlexibleSpaceBar(
              background: _HeroImageHeader(),
            ),
          ),
          SliverToBoxAdapter(
            child: HotelDetailsRoomsSection(
              onDateTap: _showDatePickerSheet,
              onGuestsTap: _showRoomGuestsSheet,
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
              child: DecoratedBox(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: const ClipRRect(
                  borderRadius: BorderRadius.all(Radius.circular(16)),
                  child: HotelDetailsFaqSection(),
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
              child: DecoratedBox(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: const ClipRRect(
                  borderRadius: BorderRadius.all(Radius.circular(16)),
                  child: HotelDetailsLocationSection(),
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
              child: DecoratedBox(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: const ClipRRect(
                  borderRadius: BorderRadius.all(Radius.circular(16)),
                  child: HotelDetailsPoliciesSection(),
                ),
              ),
            ),
          ),
          const SliverToBoxAdapter(
            child: HotelDetailsWhyBookPanel(),
          ),
        ],
      ),
    );
  }
}

class _HeroImageHeader extends StatelessWidget {
  const _HeroImageHeader();

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        Image.asset('assets/images/1.jpg', fit: BoxFit.cover),
        Positioned.fill(
          child: DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.black.withValues(alpha: 0.18),
                  Colors.transparent,
                  Colors.black.withValues(alpha: 0.35),
                ],
              ),
            ),
          ),
        ),
        Positioned(
          right: 12,
          bottom: 16,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.black.withValues(alpha: 0.55),
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.photo_library_outlined, size: 13, color: Colors.white),
                SizedBox(width: 5),
                Text(
                  '1/44',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    height: 1.1,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _TopCircleIcon extends StatelessWidget {
  const _TopCircleIcon({required this.icon});

  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 36,
      height: 36,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha: 0.42),
        shape: BoxShape.circle,
      ),
      child: Icon(icon, color: Colors.white, size: 21),
    );
  }
}

class _CircleHeaderIconButton extends StatelessWidget {
  const _CircleHeaderIconButton({
    required this.onPressed,
    required this.icon,
    this.iconSize = 20,
  });

  final VoidCallback onPressed;
  final IconData icon;
  final double iconSize;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 6),
      child: Center(
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: onPressed,
            customBorder: const CircleBorder(),
            child: Ink(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: 0.42),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: Colors.white, size: iconSize),
            ),
          ),
        ),
      ),
    );
  }
}

class _CollapsedAppBarTitle extends StatelessWidget {
  const _CollapsedAppBarTitle();

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Holiday Inn Express…',
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: const Color(0xFF111827),
          ),
        ),
        Text(
          'Apr 23–Apr 25',
          style: Theme.of(context).textTheme.labelMedium?.copyWith(
            fontSize: 13,
            color: const Color(0xFF2563EB),
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}
