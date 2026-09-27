import 'dart:async';

import 'package:flutter/material.dart';

/// Horizontal destination chips + map entry.
class HomeDestinationChips extends StatefulWidget {
  const HomeDestinationChips({super.key});

  @override
  State<HomeDestinationChips> createState() => _HomeDestinationChipsState();
}

class _HomeDestinationChipsState extends State<HomeDestinationChips> {
  static const _cities = [
    'London',
    'Beijing',
    'Shanghai',
    'Kuala Lumpur',
  ];
  static const _scrollCities = [
    ..._cities,
    ..._cities,
  ];

  static const double _slideStep = 96;
  static const Duration _autoSlideInterval = Duration(seconds: 4);
  static const Duration _autoSlideDuration = Duration(milliseconds: 450);
  static const Duration _resumeAfterUserScroll = Duration(seconds: 10);

  late final ScrollController _scrollController;
  Timer? _autoTimer;

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

    final next = position.pixels + _slideStep >= max - 4
        ? 0.0
        : position.pixels + _slideStep;

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
    const blue = Color(0xFF0068E0);
    return SizedBox(
      height: 40,
      child: Row(
        children: [
          Expanded(
            child: NotificationListener<ScrollNotification>(
              onNotification: (notification) {
                if (notification is UserScrollNotification) {
                  _pauseAutoSlideAndResumeLater();
                }
                return false;
              },
              child: ListView(
                controller: _scrollController,
                scrollDirection: Axis.horizontal,
                children: [
                  for (final city in _scrollCities) ...[
                    Padding(
                      padding: const EdgeInsets.only(right: 16),
                      child: Center(
                        child: Text(
                          city,
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: Colors.grey.shade800,
                                fontWeight: FontWeight.w500,
                              ),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
          InkWell(
            onTap: () {},
            borderRadius: BorderRadius.circular(8),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.map_outlined, size: 20, color: blue),
                  const SizedBox(width: 4),
                  Text(
                    'Map',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: blue,
                          fontWeight: FontWeight.w600,
                        ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
