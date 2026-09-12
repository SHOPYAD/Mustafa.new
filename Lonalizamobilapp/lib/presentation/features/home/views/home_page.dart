import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/app_constants.dart';
import '../../../../core/navigation/native_href.dart';
import '../../../../core/network/mobile_json.dart';
import '../../../../core/theme/lonaliza_theme.dart';
import '../../../providers/auth_session_provider.dart';
import '../../../providers/dio_provider.dart';
import '../../../providers/router_providers.dart';
import '../widgets/home_bottom_nav.dart';
import '../widgets/home_destination_chips.dart';
import '../widgets/home_header.dart';
import '../widgets/home_offer_card.dart';
import '../widgets/home_quick_actions_row.dart';
import '../widgets/home_search_bar.dart';
import '../widgets/home_service_grid.dart';
import '../widgets/home_service_tabs.dart';

/// Lonaliza–style home: composed of separate section widgets.
class HomePage extends ConsumerStatefulWidget {
  const HomePage({super.key, required this.title});

  /// Tests set this false so Dio is not started from [initState].
  static bool fetchRemote = true;

  final String title;

  @override
  ConsumerState<HomePage> createState() => _HomePageState();
}

class _HomePageState extends ConsumerState<HomePage> {
  int _navIndex = 0;
  double _headerCollapseProgress = 0;
  final ScrollController _scrollController = ScrollController();
  final GlobalKey _bodySearchKey = GlobalKey();
  final GlobalKey _bodyQuickActionsKey = GlobalKey();
  bool _showHeaderSearch = false;
  bool _showHeaderActions = false;
  bool _showBackToTop = false;
  List<Map<String, dynamic>> _reels = const [];
  List<Map<String, dynamic>> _hotels = const [];
  List<Map<String, dynamic>> _packages = const [];
  List<Map<String, dynamic>> _cars = const [];
  List<Map<String, dynamic>> _flights = const [];
  String _searchTab = 'flight';

  /// How far the white sheet slides up over the blue (Trip card under the bar).
  static const double _sheetOverlap = -6;

  /// Top radius of the **white** sheet only — this is the curved edge (not the blue header).
  static const double _sheetTopRadius = 24;

  static const double _headerTitleOnlyBodyHeight = 44;
  static const double _headerSearchBodyHeight = 56;
  static const double _headerSearchWithActionsBodyHeight = 98;
  static const double _headerCollapseDistance = 180;
  static const double _backToTopRevealOffset = 320;

  bool _handleScroll(ScrollNotification notification) {
    if (notification.metrics.axis != Axis.vertical) return false;

    if (notification.metrics.pixels <= 0) {
      final needsReset =
          _headerCollapseProgress != 0 ||
          _showHeaderSearch ||
          _showHeaderActions ||
          _showBackToTop;
      if (needsReset) {
        setState(() {
          _headerCollapseProgress = 0;
          _showHeaderSearch = false;
          _showHeaderActions = false;
          _showBackToTop = false;
        });
      }
      return false;
    }

    final nextProgress = (notification.metrics.pixels / _headerCollapseDistance)
        .clamp(0.0, 1.0);

    if ((nextProgress - _headerCollapseProgress).abs() > 0.01) {
      setState(() => _headerCollapseProgress = nextProgress);
    }

    final nextShowBackToTop = notification.metrics.pixels >= _backToTopRevealOffset;
    if (nextShowBackToTop != _showBackToTop) {
      setState(() => _showBackToTop = nextShowBackToTop);
    }

    _scheduleHeaderContentSync();

    return false;
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      _syncHeaderContentVisibility();
      if (HomePage.fetchRemote) _loadHome();
    });
  }

  Future<void> _loadHome() async {
    try {
      final client = ref.read(appDioClientProvider);
      final results = await Future.wait([
        client.get<Map<String, dynamic>>(
          AppConstants.communityFeedUrl,
          queryParameters: const {'reels': '1'},
        ),
        client.get<Map<String, dynamic>>(AppConstants.homeFeaturedUrl),
      ]);
      if (!mounted) return;
      final featured = results[1].data ?? const <String, dynamic>{};
      setState(() {
        _reels = mapList(results[0].data?['posts']);
        _hotels = mapList(featured['hotels']);
        _packages = mapList(featured['packages']);
        _cars = mapList(featured['cars']);
        _flights = mapList(featured['flights']);
      });
    } catch (_) {
      try {
        final client = ref.read(appDioClientProvider);
        final results = await Future.wait([
          client.get<Map<String, dynamic>>(AppConstants.packagesCatalogUrl),
          client.get<Map<String, dynamic>>(AppConstants.carsCatalogUrl),
        ]);
        if (!mounted) return;
        setState(() {
          _packages = mapList(results[0].data?['packages']);
          _cars = mapList(results[1].data?['cars']);
        });
      } catch (_) {}
    }
  }

  void _openOffer(Map<String, dynamic> item) {
    final href = asText(item['href']);
    context.push(href.isNotEmpty ? nativePathFromHref(href) : nativePathFromIntent(asText(item['type'])));
  }

  List<Widget> _offerCards(List<Map<String, dynamic>> items, {String? badge}) {
    return items.take(10).map((item) {
      return HomeOfferCard(
        title: asText(item['title'] ?? item['name'] ?? item['titleAr'] ?? item['nameAr'], 'عرض لوناليزا'),
        subtitle: asText(item['subtitle'] ?? item['city'] ?? item['destination'] ?? item['destinationAr']),
        image: asText(item['image'] ?? item['imageUrl'] ?? item['cover']),
        price: asDouble(item['price'] ?? item['pricePerDay'] ?? item['fromPrice']),
        currency: asText(item['currency'], 'USD'),
        badge: badge,
        onTap: () => _openOffer(item),
      );
    }).toList();
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _handleBottomNavTap(int index) {
    if (index == 0 && _showBackToTop) {
      _scrollController.animateTo(
        0,
        duration: const Duration(milliseconds: 420),
        curve: Curves.easeInOutCubic,
      );
      return;
    }
    if (index == 1) {
      ref.read(navigationRepositoryProvider).goMyTrips();
      return;
    }
    if (index == 2) {
      ref.read(navigationRepositoryProvider).goCommunity();
      return;
    }
    if (index == 3) {
      ref.read(navigationRepositoryProvider).goMessages();
      return;
    }
    if (index == 4) {
      ref.read(navigationRepositoryProvider).goAccount();
      return;
    }
    
    setState(() => _navIndex = index);
  }

  void _scheduleHeaderContentSync() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      _syncHeaderContentVisibility();
    });
  }

  void _syncHeaderContentVisibility() {
    final headerBodyHeight = _showHeaderActions
        ? _headerSearchWithActionsBodyHeight
        : _showHeaderSearch
        ? _headerSearchBodyHeight
        : _headerTitleOnlyBodyHeight;
    final headerBottom = MediaQuery.paddingOf(context).top + headerBodyHeight;
    final nextShowSearch = _isBodySectionUnderHeader(
      _bodySearchKey,
      headerBottom,
    );
    final nextShowActions = _isBodySectionUnderHeader(
      _bodyQuickActionsKey,
      headerBottom,
    );

    if (nextShowSearch != _showHeaderSearch ||
        nextShowActions != _showHeaderActions) {
      setState(() {
        _showHeaderSearch = nextShowSearch;
        _showHeaderActions = nextShowActions;
      });
    }
  }

  bool _isBodySectionUnderHeader(GlobalKey key, double headerBottom) {
    final targetContext = key.currentContext;
    if (targetContext == null) return false;

    final renderObject = targetContext.findRenderObject();
    if (renderObject is! RenderBox || !renderObject.hasSize) return false;

    final targetTop = renderObject.localToGlobal(Offset.zero).dy;
    return targetTop <= headerBottom;
  }

  @override
  Widget build(BuildContext context) {
    final topInset = MediaQuery.paddingOf(context).top;
    final headerBodyHeight = _showHeaderActions
        ? _headerSearchWithActionsBodyHeight
        : _showHeaderSearch
        ? _headerSearchBodyHeight
        : _headerTitleOnlyBodyHeight;
    final headerExtent = topInset + headerBodyHeight;
    final isCollapsed = _headerCollapseProgress > 0;
    final pageBackgroundColor = _headerCollapseProgress > 0
        ? Colors.white
        : HomeHeader.brandBlue;

    return Scaffold(
      // The page starts blue, then turns white as the header collapses.
      backgroundColor: pageBackgroundColor,
      body: NotificationListener<ScrollNotification>(
        onNotification: _handleScroll,
        child: CustomScrollView(
          controller: _scrollController,
          // Default [Clip.hardEdge] clips paint shifted by [Transform.translate], which can
          // make the overlap + radius vanish after scroll. Allow overflow in the overlap band.
          clipBehavior: Clip.none,
          slivers: [
            SliverPersistentHeader(
              pinned: true,
              delegate: _PinnedHomeHeaderDelegate(
                extent: headerExtent,
                child: HomeHeader(
                  appName: widget.title,
                  onProfileTap: () {
                    final nav = ref.read(navigationRepositoryProvider);
                    if (ref.read(authSessionProvider) == null) {
                      nav.goAuth();
                    } else {
                      nav.goAccount();
                    }
                  },
                  bottomSheetOverlap: _sheetOverlap,
                  collapseProgress: _headerCollapseProgress,
                  showSearch: _showHeaderSearch,
                  showActions: _showHeaderActions,
                ),
              ),
            ),
            SliverLayoutBuilder(
              builder: (context, constraints) {
                final viewportH = constraints.viewportMainAxisExtent;
                final minSheet = (viewportH - headerExtent + _sheetOverlap)
                    .clamp(0.0, double.infinity);

                return SliverToBoxAdapter(
                  child: Transform.translate(
                    // Not const: ensures hot reload / rebuild always uses [_sheetOverlap].
                    offset: Offset(0, -_sheetOverlap),
                    child: ConstrainedBox(
                      constraints: BoxConstraints(minHeight: minSheet),
                      child: Container(
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.only(
                            topLeft: Radius.circular(_sheetTopRadius),
                            topRight: Radius.circular(_sheetTopRadius),
                          ),
                          // Keep lift only while the page backdrop is blue; on white it reads gray.
                          boxShadow: isCollapsed
                              ? const []
                              : [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.12),
                                    blurRadius: 20,
                                    offset: const Offset(0, 6),
                                  ),
                                ],
                        ),
                        clipBehavior: Clip.antiAlias,
                        padding: const EdgeInsets.fromLTRB(16, 18, 16, 28),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Text(
                              'سافر بذوق لوناليزا',
                              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                color: LonalizaColors.royalPurple,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'طيران، فنادق، باقات، سيارات وترانسفير — نفس عروض الموقع وأسعاره.',
                              style: TextStyle(color: LonalizaColors.muted, height: 1.4),
                            ),
                            const SizedBox(height: 16),
                            HomeServiceTabs(
                              activeKey: _searchTab == 'holiday'
                                  ? 'holiday'
                                  : _searchTab,
                              onChanged: (tab) {
                                setState(() => _searchTab = tab.agentTab);
                              },
                            ),
                            const SizedBox(height: 12),
                            SizedBox(key: _bodySearchKey),
                            AnimatedSwitcher(
                              duration: const Duration(milliseconds: 180),
                              child: _showHeaderSearch
                                  ? const SizedBox.shrink()
                                  : HomeSearchBar(agentTab: _searchTab),
                            ),
                            const SizedBox(height: 10),
                            Align(
                              alignment: AlignmentDirectional.centerStart,
                              child: TextButton(
                                onPressed: () {
                                  final tab = homeSearchTabs.firstWhere(
                                    (item) => item.agentTab == _searchTab,
                                    orElse: () => homeSearchTabs.first,
                                  );
                                  tab.onOpen(context, ref);
                                },
                                child: const Text('فتح محرك البحث الكامل'),
                              ),
                            ),
                            const SizedBox(height: 8),
                            const HomeServiceGrid(),
                            const SizedBox(height: 16),
                            const HomeDestinationChips(),
                            const SizedBox(height: 6),
                            SizedBox(key: _bodyQuickActionsKey),
                            AnimatedSwitcher(
                              duration: const Duration(milliseconds: 180),
                              child: _showHeaderActions
                                  ? const SizedBox.shrink()
                                  : const HomeQuickActionsRow(),
                            ),
                            HomeReelsStrip(
                              posts: _reels,
                              onOpenAll: () => context.push('/community/reels'),
                            ),
                            const SizedBox(height: 20),
                            HomeOfferRail(
                              title: 'عروض الطيران',
                              items: _offerCards(_flights, badge: 'مباشر'),
                              onSeeAll: () => ref.read(navigationRepositoryProvider).goFlights(),
                            ),
                            const SizedBox(height: 20),
                            HomeOfferRail(
                              title: 'فنادق مختارة',
                              items: _offerCards(_hotels, badge: 'مميز'),
                              onSeeAll: () => ref.read(navigationRepositoryProvider).goHotels(),
                            ),
                            const SizedBox(height: 20),
                            HomeOfferRail(
                              title: 'باقات تركيا',
                              items: _offerCards(_packages, badge: 'باقة'),
                              onSeeAll: () => context.push('/catalog/packages'),
                            ),
                            const SizedBox(height: 20),
                            HomeOfferRail(
                              title: 'سيارات للإيجار',
                              items: _offerCards(_cars, badge: 'يومي'),
                              onSeeAll: () => context.push('/catalog/cars'),
                            ),
                            const SizedBox(height: 24),
                          ],
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
      bottomNavigationBar: HomeBottomNav(
        currentIndex: _navIndex,
        onTap: _handleBottomNavTap,
        showBackToTop: _showBackToTop,
      ),
    );
  }
}

class _PinnedHomeHeaderDelegate extends SliverPersistentHeaderDelegate {
  _PinnedHomeHeaderDelegate({required this.extent, required this.child});

  final double extent;
  final Widget child;

  @override
  double get minExtent => extent;

  @override
  double get maxExtent => extent;

  @override
  Widget build(
    BuildContext context,
    double shrinkOffset,
    bool overlapsContent,
  ) {
    return SizedBox(height: extent, width: double.infinity, child: child);
  }

  @override
  bool shouldRebuild(covariant _PinnedHomeHeaderDelegate oldDelegate) {
    return extent != oldDelegate.extent || child != oldDelegate.child;
  }
}
