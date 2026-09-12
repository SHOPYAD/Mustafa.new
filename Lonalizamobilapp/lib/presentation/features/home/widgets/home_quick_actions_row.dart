import 'dart:async';

import 'package:flutter/material.dart';

import 'home_service_category_tile.dart';

/// Thin icon row: Deals, Events, Planner, etc. Horizontally scrollable with optional auto-slide.
class HomeQuickActionsRow extends StatefulWidget {
  const HomeQuickActionsRow({
    super.key,
    this.compactChipStyle = false,
  });

  final bool? compactChipStyle;

  @override
  State<HomeQuickActionsRow> createState() => _HomeQuickActionsRowState();
}

class _HomeQuickActionsRowState extends State<HomeQuickActionsRow> {
  static const _items = [
    (Icons.local_offer_outlined, 'Deals'),
    (Icons.event_outlined, 'Events'),
    (Icons.route_outlined, 'مخطط الرحلة'),
    (Icons.trending_up_rounded, 'Trending'),
    (Icons.star_outline_rounded, 'عروض لوناليزا'),
  ];

  static const double _itemWidth = 80;
  static const double _compactSlideStep = 108;
  static const double _separator = 12;

  /// Auto-advance every [autoSlideInterval] when content overflows horizontally.
  static const Duration _autoSlideInterval = Duration(seconds: 4);
  static const Duration _autoSlideDuration = Duration(milliseconds: 450);
  static const Duration _resumeAfterUserScroll = Duration(seconds: 10);

  late final ScrollController _scrollController;
  Timer? _autoTimer;

  bool get _compactChipStyle => widget.compactChipStyle ?? false;

  @override
  void initState() {
    super.initState();
    _scrollController = ScrollController();
    _startAutoSlide();
  }

  void _startAutoSlide() {
    _autoTimer?.cancel();
    _autoTimer = Timer.periodic(_autoSlideInterval, _onAutoSlideTick);
  }

  void _pauseAutoSlideAndResumeLater() {
    _autoTimer?.cancel();
    _autoTimer = Timer(_resumeAfterUserScroll, () {
      if (mounted) _startAutoSlide();
    });
  }

  void _onAutoSlideTick(Timer timer) {
    if (!mounted || !_scrollController.hasClients) return;
    final position = _scrollController.position;
    final max = position.maxScrollExtent;
    if (max < 8) return;

    final step = (_compactChipStyle ? _compactSlideStep : _itemWidth) + _separator;
    final next = position.pixels + step >= max - 4 ? 0.0 : position.pixels + step;

    _scrollController.animateTo(
      next,
      duration: _autoSlideDuration,
      curve: Curves.easeInOutCubic,
    );
  }

  @override
  void dispose() {
    _autoTimer?.cancel();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return NotificationListener<ScrollNotification>(
      onNotification: (notification) {
        if (notification is UserScrollNotification) {
          _pauseAutoSlideAndResumeLater();
        }
        return false;
      },
      child: SizedBox(
        height: _compactChipStyle ? 40 : 96,
        child: ListView.separated(
          controller: _scrollController,
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          padding: EdgeInsets.zero,
          itemCount: _items.length,
          separatorBuilder: (_, itemIndex) => const SizedBox(width: _separator),
          itemBuilder: (context, index) {
            final item = _items[index];
            final tile = HomeServiceCategoryTile(
              icon: item.$1,
              label: item.$2,
              isFeatured: false,
              showCircularIconBackdrop: _compactChipStyle ? false : true,
              compactChipStyle: _compactChipStyle,
              onTap: () {},
            );

            if (_compactChipStyle) {
              return tile;
            }

            return SizedBox(width: _itemWidth, child: tile);
          },
        ),
      ),
    );
  }
}
