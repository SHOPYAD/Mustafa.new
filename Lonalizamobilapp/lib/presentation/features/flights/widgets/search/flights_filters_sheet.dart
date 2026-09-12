import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:liotrip/presentation/features/flights/providers/flight_search_results_provider.dart';
import 'package:liotrip/presentation/features/flights/providers/flights_filter_provider.dart';
import 'package:liotrip/domain/entities/flights/flight_offer.dart';

Future<void> showFlightsFiltersSheet(BuildContext context) {
  return showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    backgroundColor: const Color(0xFFF3F4F6),
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
    ),
    builder: (context) => const FlightsFiltersSheet(),
  );
}

class FlightsFiltersSheet extends ConsumerStatefulWidget {
  const FlightsFiltersSheet({super.key});

  @override
  ConsumerState<FlightsFiltersSheet> createState() =>
      _FlightsFiltersSheetState();
}

class _FlightsFiltersSheetState extends ConsumerState<FlightsFiltersSheet> {
  final _scrollController = ScrollController();
  final _tabController = ScrollController();

  final List<String> _tabs = [
    'Popular',
    'Sort',
    'Price',
    'Duration',
    'Layovers',
    'Airlines',
    'Times',
    'Cabin',
    'Airports',
  ];

  late final List<GlobalKey> _keys;
  int _selectedIndex = 0;
  bool _isAutoScrolling = false;

  // Local state initialized in didChangeDependencies or initState
  bool _nonStopOnly = false;
  bool _oneStopMax = false;
  bool _seats5PlusOnly = false;
  bool _checkedBag20kgPlus = false;
  bool _redEyeOnly = false;

  double? _minPrice;
  double? _maxPrice;
  int? _durationMax;
  int? _layoverMaxMinutes;

  Set<String> _selectedAirlines = {};
  Set<String> _departWindows = {};
  Set<String> _arriveWindows = {};
  Set<String> _selectedCabins = {};
  Set<String> _fromAirports = {};
  Set<String> _toAirports = {};
  Set<String> _layoverAirports = {};
  String _sort = 'recommended';

  bool _isInitialized = false;

  @override
  void initState() {
    super.initState();
    _keys = List.generate(_tabs.length, (index) => GlobalKey());
    _scrollController.addListener(_onScroll);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_isInitialized) {
      final activeFilter = ref.read(flightsFilterProvider);
      _nonStopOnly = activeFilter.nonStopOnly;
      _oneStopMax = activeFilter.oneStopMax;
      _seats5PlusOnly = activeFilter.seats5PlusOnly;
      _checkedBag20kgPlus = activeFilter.checkedBag20kgPlus;
      _redEyeOnly = activeFilter.redEyeOnly;

      _minPrice = activeFilter.minPrice;
      _maxPrice = activeFilter.maxPrice;
      _durationMax = activeFilter.durationMax;
      _layoverMaxMinutes = activeFilter.layoverMaxMinutes;

      _selectedAirlines = Set.from(activeFilter.selectedAirlines);
      _departWindows = Set.from(activeFilter.departWindows);
      _arriveWindows = Set.from(activeFilter.arriveWindows);
      _selectedCabins = Set.from(activeFilter.selectedCabins);
      _fromAirports = Set.from(activeFilter.fromAirports);
      _toAirports = Set.from(activeFilter.toAirports);
      _layoverAirports = Set.from(activeFilter.layoverAirports);
      _sort = activeFilter.sort;

      _isInitialized = true;
    }
  }

  @override
  void dispose() {
    _scrollController.removeListener(_onScroll);
    _scrollController.dispose();
    _tabController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_isAutoScrolling || !_scrollController.hasClients) return;

    for (int i = 0; i < _keys.length; i++) {
      final key = _keys[i];
      final context = key.currentContext;
      if (context != null) {
        final box = context.findRenderObject() as RenderBox;
        final position = box.localToGlobal(
          Offset.zero,
          ancestor: this.context.findRenderObject(),
        );
        if (position.dy > 0 && position.dy < 240) {
          if (_selectedIndex != i) {
            setState(() => _selectedIndex = i);
            _scrollToTab(i);
          }
          break;
        }
      }
    }
  }

  void _onTabTapped(int index) {
    setState(() => _selectedIndex = index);
    _scrollToTab(index);

    final context = _keys[index].currentContext;
    if (context != null) {
      _isAutoScrolling = true;
      final renderBox = context.findRenderObject() as RenderBox;
      final offset =
          renderBox.localToGlobal(Offset.zero).dy +
          _scrollController.offset -
          130;

      _scrollController
          .animateTo(
            offset.clamp(0.0, _scrollController.position.maxScrollExtent),
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOutCubic,
          )
          .then((_) {
            _isAutoScrolling = false;
          });
    }
  }

  void _scrollToTab(int index) {
    if (!_tabController.hasClients) return;
    final offset =
        (index * 90.0) - (MediaQuery.of(context).size.width / 2) + 45;
    _tabController.animateTo(
      offset.clamp(0.0, _tabController.position.maxScrollExtent),
      duration: const Duration(milliseconds: 200),
      curve: Curves.easeOut,
    );
  }

  @override
  Widget build(BuildContext context) {
    final searchState = ref.watch(flightSearchStateProvider);
    final isAr = Localizations.localeOf(context).languageCode == 'ar';

    return searchState.when(
      data: (response) => _buildContent(context, response, isAr),
      error: (e, s) => _buildErrorOrLoading(
        context,
        'حدث خطأ في تحميل بيانات التصفية',
        isAr,
      ),
      loading: () => _buildErrorOrLoading(
        context,
        isAr
            ? 'جاري تهيئة خيارات التصفية...'
            : 'Initializing filter options...',
        isAr,
      ),
    );
  }

  Widget _buildErrorOrLoading(BuildContext context, String message, bool isAr) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.7,
      color: Colors.white,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const CircularProgressIndicator(color: Color(0xFF7C3AED)),
            const SizedBox(height: 16),
            Text(
              message,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: Color(0xFF4B5563),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContent(
    BuildContext context,
    FlightSearchResponse response,
    bool isAr,
  ) {
    // ── Precalculate Facets ──
    double defaultMinPrice = 0;
    double defaultMaxPrice = 1000;
    if (response.offers.isNotEmpty) {
      final prices = response.offers.map((o) => o.displayPrice).toList();
      defaultMinPrice = prices.reduce((a, b) => a < b ? a : b);
      defaultMaxPrice = prices.reduce((a, b) => a > b ? a : b);
      if (defaultMinPrice == defaultMaxPrice) {
        defaultMaxPrice = defaultMinPrice + 100;
      }
    }

    int defaultMinDuration = 30;
    int defaultMaxDuration = 360;
    final allDurations = response.offers
        .expand((o) => o.itineraries.map((it) => it.effectiveDurationMinutes))
        .toList();
    if (allDurations.isNotEmpty) {
      final minDur = allDurations.reduce((a, b) => a < b ? a : b);
      final maxDur = allDurations.reduce((a, b) => a > b ? a : b);
      defaultMinDuration = minDur < 30 ? minDur : 30;
      defaultMaxDuration = maxDur > 360 ? maxDur : 360;
    }

    int defaultMaxLayover = 240;
    final allLayovers = response.offers
        .expand((o) => o.itineraries.map((it) => it.maxLayoverMinutes))
        .toList();
    if (allLayovers.isNotEmpty) {
      final maxLay = allLayovers.reduce((a, b) => a > b ? a : b);
      defaultMaxLayover = maxLay > 240 ? maxLay : 240;
    }

    // Unique airlines we start with (first segment of each itinerary)
    final Map<String, int> airlineCounts = {};
    for (final offer in response.offers) {
      final carrierNames = offer.itineraries
          .where((it) => it.segments.isNotEmpty)
          .map((it) => it.segments.first.carrierName)
          .toSet();
      for (final name in carrierNames) {
        airlineCounts[name] = (airlineCounts[name] ?? 0) + 1;
      }
    }

    // Unique cabins
    final cabinOptions = response.offers
        .expand(
          (o) => o.itineraries.expand(
            (it) => it.segments.map((seg) => seg.cabinClass),
          ),
        )
        .whereType<String>()
        .toSet()
        .toList();

    // Unique airports (From/To)
    final fromAirports = response.offers
        .expand(
          (o) => o.itineraries.map(
            (it) => it.segments.first.departure.airportCode,
          ),
        )
        .toSet()
        .toList();

    final toAirports = response.offers
        .expand(
          (o) =>
              o.itineraries.map((it) => it.segments.last.arrival.airportCode),
        )
        .toSet()
        .toList();

    // Unique layover airports
    final layoverAirports = response.offers
        .expand((o) => o.itineraries)
        .where((it) => it.segments.length > 1)
        .expand(
          (it) => it.segments
              .sublist(0, it.segments.length - 1)
              .map((seg) => seg.arrival.airportCode),
        )
        .toSet()
        .toList();

    if (defaultMinDuration >= defaultMaxDuration) {
      defaultMaxDuration = defaultMinDuration + 60;
    }

    if (defaultMaxLayover <= 30) {
      defaultMaxLayover = 240;
    }

    // Default values mapping with safe clamping to prevent Slider assertion failures
    final activeMinPrice = (_minPrice ?? defaultMinPrice).clamp(
      defaultMinPrice,
      defaultMaxPrice,
    );
    final activeMaxPrice = (_maxPrice ?? defaultMaxPrice).clamp(
      defaultMinPrice,
      defaultMaxPrice,
    );
    final activeDuration = (_durationMax ?? defaultMaxDuration)
        .toDouble()
        .clamp(defaultMinDuration.toDouble(), defaultMaxDuration.toDouble());
    final activeLayover = (_layoverMaxMinutes ?? defaultMaxLayover)
        .toDouble()
        .clamp(30.0, defaultMaxLayover.toDouble());

    return Column(
      children: [
        // Sticky Header
        Container(
          color: Colors.white,
          padding: const EdgeInsets.only(top: 12),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                children: [
                  const SizedBox(width: 8),
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.close, color: Color(0xFF1F2937)),
                  ),
                  Expanded(
                    child: Text(
                      isAr ? 'تصفية النتائج' : 'Filters',
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF1F2937),
                      ),
                    ),
                  ),
                  const SizedBox(width: 48),
                ],
              ),
              const SizedBox(height: 12),
              // Tab Bar
              SizedBox(
                height: 40,
                child: ListView.builder(
                  controller: _tabController,
                  scrollDirection: Axis.horizontal,
                  itemCount: _tabs.length,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemBuilder: (context, index) {
                    final isSelected = index == _selectedIndex;
                    return GestureDetector(
                      onTap: () => _onTabTapped(index),
                      child: Container(
                        margin: const EdgeInsets.only(right: 20),
                        decoration: BoxDecoration(
                          border: Border(
                            bottom: BorderSide(
                              color: isSelected
                                  ? const Color(0xFF7C3AED)
                                  : Colors.transparent,
                              width: 3,
                            ),
                          ),
                        ),
                        alignment: Alignment.center,
                        child: Text(
                          _getTabName(index, isAr),
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: isSelected
                                ? FontWeight.w600
                                : FontWeight.w500,
                            color: isSelected
                                ? const Color(0xFF7C3AED)
                                : const Color(0xFF4B5563),
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
              const Divider(height: 1, color: Color(0xFFE5E7EB)),
            ],
          ),
        ),

        // Scrollable Content
        Expanded(
          child: SingleChildScrollView(
            controller: _scrollController,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _buildPopularSection(key: _keys[0], isAr: isAr),
                  const SizedBox(height: 24),
                  _buildSortSection(key: _keys[1], isAr: isAr),
                  const SizedBox(height: 24),
                  _buildPriceSection(
                    key: _keys[2],
                    minVal: activeMinPrice,
                    maxVal: activeMaxPrice,
                    minLimit: defaultMinPrice,
                    maxLimit: defaultMaxPrice,
                    isAr: isAr,
                  ),
                  const SizedBox(height: 24),
                  _buildDurationSection(
                    key: _keys[3],
                    currentMax: activeDuration,
                    minLimit: defaultMinDuration.toDouble(),
                    maxLimit: defaultMaxDuration.toDouble(),
                    isAr: isAr,
                  ),
                  const SizedBox(height: 24),
                  _buildLayoversSection(
                    key: _keys[4],
                    currentMax: activeLayover,
                    maxLimit: defaultMaxLayover.toDouble(),
                    layoverAirports: layoverAirports,
                    isAr: isAr,
                  ),
                  const SizedBox(height: 24),
                  _buildAirlinesSection(
                    key: _keys[5],
                    airlineCounts: airlineCounts,
                    isAr: isAr,
                  ),
                  const SizedBox(height: 24),
                  _buildTimesSection(key: _keys[6], isAr: isAr),
                  const SizedBox(height: 24),
                  _buildCabinSection(
                    key: _keys[7],
                    cabinOptions: cabinOptions,
                    isAr: isAr,
                  ),
                  const SizedBox(height: 24),
                  _buildAirportsSection(
                    key: _keys[8],
                    fromAirports: fromAirports,
                    toAirports: toAirports,
                    isAr: isAr,
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ),
        ),

        // Sticky Bottom Bar
        Container(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
          decoration: const BoxDecoration(
            color: Colors.white,
            border: Border(top: BorderSide(color: Color(0xFFE5E7EB))),
          ),
          child: Row(
            children: [
              Expanded(
                flex: 1,
                child: OutlinedButton(
                  onPressed: () {
                    setState(() {
                      _nonStopOnly = false;
                      _oneStopMax = false;
                      _seats5PlusOnly = false;
                      _checkedBag20kgPlus = false;
                      _redEyeOnly = false;
                      _minPrice = null;
                      _maxPrice = null;
                      _durationMax = null;
                      _layoverMaxMinutes = null;
                      _selectedAirlines.clear();
                      _departWindows.clear();
                      _arriveWindows.clear();
                      _selectedCabins.clear();
                      _fromAirports.clear();
                      _toAirports.clear();
                      _layoverAirports.clear();
                      _sort = 'recommended';
                    });
                  },
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: Color(0xFFE5E7EB)),
                    foregroundColor: const Color(0xFF4B5563),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: Text(
                    isAr ? 'إعادة ضبط' : 'Reset',
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 16,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                flex: 2,
                child: FilledButton(
                  onPressed: () {
                    final newState = FlightsFilterState(
                      nonStopOnly: _nonStopOnly,
                      oneStopMax: _oneStopMax,
                      seats5PlusOnly: _seats5PlusOnly,
                      checkedBag20kgPlus: _checkedBag20kgPlus,
                      redEyeOnly: _redEyeOnly,
                      minPrice: _minPrice,
                      maxPrice: _maxPrice,
                      durationMax: _durationMax,
                      layoverMaxMinutes: _layoverMaxMinutes,
                      selectedAirlines: _selectedAirlines,
                      departWindows: _departWindows,
                      arriveWindows: _arriveWindows,
                      selectedCabins: _selectedCabins,
                      fromAirports: _fromAirports,
                      toAirports: _toAirports,
                      layoverAirports: _layoverAirports,
                      sort: _sort,
                    );
                    ref
                        .read(flightsFilterProvider.notifier)
                        .updateFilter(newState);
                    Navigator.pop(context);
                  },
                  style: FilledButton.styleFrom(
                    backgroundColor: const Color(0xFF7C3AED),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: Text(
                    isAr ? 'عرض الرحلات المصفاة' : 'Show flights',
                    style: const TextStyle(
                      fontWeight: FontWeight.w700,
                      fontSize: 16,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  String _getTabName(int index, bool isAr) {
    if (!isAr) return _tabs[index];
    switch (index) {
      case 0:
        return 'الأكثر شعبية';
      case 1:
        return 'الترتيب';
      case 2:
        return 'السعر';
      case 3:
        return 'المدة';
      case 4:
        return 'التوقف والترانزيت';
      case 5:
        return 'الخطوط الجوية';
      case 6:
        return 'المواعيد';
      case 7:
        return 'الدرجة';
      case 8:
        return 'المطارات';
      default:
        return _tabs[index];
    }
  }

  String _formatDuration(double minutes, bool isAr) {
    final int hours = minutes ~/ 60;
    final int mins = (minutes % 60).round();
    if (isAr) {
      return '$hours ساعة و $mins دقيقة';
    }
    return '${hours}h ${mins}m';
  }

  Widget _buildSectionHeader(String titleAr, String titleEn, bool isAr) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(
        isAr ? titleAr : titleEn,
        style: const TextStyle(
          fontSize: 18,
          fontWeight: FontWeight.bold,
          color: Color(0xFF1F2937),
        ),
      ),
    );
  }

  Widget _buildCard({required Widget child}) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE5E7EB)),
      ),
      child: child,
    );
  }

  // ── 1. Popular Section ──
  Widget _buildPopularSection({required Key key, required bool isAr}) {
    return Column(
      key: key,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader(
          'الأكثر شعبية (خيارات سريعة)',
          'Popular Options',
          isAr,
        ),
        _buildCard(
          child: Column(
            children: [
              _buildSwitchTile(
                title: isAr ? 'رحلات مباشرة فقط' : 'Direct flights only',
                subtitle: isAr ? 'بدون أي توقف' : 'Non-stop flights',
                value: _nonStopOnly,
                onChanged: (val) => setState(() => _nonStopOnly = val),
              ),
              const Divider(height: 1, indent: 16, endIndent: 16),
              _buildSwitchTile(
                title: isAr ? 'محطة توقف واحدة كحد أقصى' : '1 stop max',
                subtitle: isAr
                    ? 'رحلات مباشرة أو بمحطة واحدة'
                    : 'Up to 1 stopover',
                value: _oneStopMax,
                onChanged: (val) => setState(() => _oneStopMax = val),
              ),
              const Divider(height: 1, indent: 16, endIndent: 16),
              _buildSwitchTile(
                title: isAr ? 'توفير 5 مقاعد أو أكثر' : 'Seats 5+ only',
                subtitle: isAr
                    ? 'لتأكيد الحجوزات الجماعية'
                    : 'At least 5 seats remaining',
                value: _seats5PlusOnly,
                onChanged: (val) => setState(() => _seats5PlusOnly = val),
              ),
              const Divider(height: 1, indent: 16, endIndent: 16),
              _buildSwitchTile(
                title: isAr ? 'حقيبة مسجلة 20 كغ+' : 'Checked bag 20kg+',
                subtitle: isAr
                    ? 'رحلات تتضمن أمتعة بوزن 20 كغ كحد أدنى'
                    : 'Includes checked baggage weight ≥ 20kg',
                value: _checkedBag20kgPlus,
                onChanged: (val) => setState(() => _checkedBag20kgPlus = val),
              ),
              const Divider(height: 1, indent: 16, endIndent: 16),
              _buildSwitchTile(
                title: isAr ? 'رحلات ليلية (Red-eye)' : 'Red-eye flights',
                subtitle: isAr
                    ? 'رحلات تقلع ليلاً أو تصل في الصباح الباكر'
                    : 'Departures late night or arrivals early morning',
                value: _redEyeOnly,
                onChanged: (val) => setState(() => _redEyeOnly = val),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildSwitchTile({
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF1F2937),
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontSize: 13,
                    color: Color(0xFF6B7280),
                  ),
                ),
              ],
            ),
          ),
          Switch(
            value: value,
            onChanged: onChanged,
            activeColor: const Color(0xFF7C3AED),
          ),
        ],
      ),
    );
  }

  // ── 2. Sort Section ──
  Widget _buildSortSection({required Key key, required bool isAr}) {
    final sortOptions = [
      {'val': 'recommended', 'ar': 'موصى به (الافتراضي)', 'en': 'Recommended'},
      {
        'val': 'price_asc',
        'ar': 'السعر: من الأقل للأعلى',
        'en': 'Price: Low to High',
      },
      {
        'val': 'price_desc',
        'ar': 'السعر: من الأعلى للأقل',
        'en': 'Price: High to Low',
      },
      {
        'val': 'duration_asc',
        'ar': 'المدة: الأقصر أولاً',
        'en': 'Duration: Shortest',
      },
      {
        'val': 'depart_asc',
        'ar': 'وقت المغادرة: الأبكر أولاً',
        'en': 'Departure: Earliest',
      },
    ];

    return Column(
      key: key,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('ترتيب النتائج', 'Sort Options', isAr),
        _buildCard(
          child: Column(
            children: sortOptions.asMap().entries.map((entry) {
              final isLast = entry.key == sortOptions.length - 1;
              final opt = entry.value;
              final val = opt['val']!;
              final label = isAr ? opt['ar']! : opt['en']!;
              final isSelected = _sort == val;

              return Column(
                children: [
                  RadioListTile<String>(
                    title: Text(
                      label,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    value: val,
                    groupValue: _sort,
                    onChanged: (newVal) {
                      if (newVal != null) setState(() => _sort = newVal);
                    },
                    activeColor: const Color(0xFF7C3AED),
                    controlAffinity: ListTileControlAffinity.trailing,
                  ),
                  if (!isLast)
                    const Divider(height: 1, indent: 16, endIndent: 16),
                ],
              );
            }).toList(),
          ),
        ),
      ],
    );
  }

  // ── 3. Price Section ──
  Widget _buildPriceSection({
    required Key key,
    required double minVal,
    required double maxVal,
    required double minLimit,
    required double maxLimit,
    required bool isAr,
  }) {
    final activeRange = RangeValues(
      minVal.clamp(minLimit, maxLimit),
      maxVal.clamp(minLimit, maxLimit),
    );
    return Column(
      key: key,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('السعر الإجمالي للرحلة', 'Total Price', isAr),
        _buildCard(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      isAr ? 'الحد الأدنى' : 'Min Price',
                      style: const TextStyle(
                        color: Color(0xFF6B7280),
                        fontSize: 13,
                      ),
                    ),
                    Text(
                      isAr ? 'الحد الأقصى' : 'Max Price',
                      style: const TextStyle(
                        color: Color(0xFF6B7280),
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '\$${activeRange.start.toStringAsFixed(0)}',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF1F2937),
                      ),
                    ),
                    Text(
                      '\$${activeRange.end.toStringAsFixed(0)}',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF1F2937),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                RangeSlider(
                  values: activeRange,
                  min: minLimit,
                  max: maxLimit,
                  divisions: 50,
                  activeColor: const Color(0xFF7C3AED),
                  inactiveColor: const Color(0xFFE5E7EB),
                  onChanged: (values) {
                    setState(() {
                      _minPrice = values.start.roundToDouble();
                      _maxPrice = values.end.roundToDouble();
                    });
                  },
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // ── 4. Duration Section ──
  Widget _buildDurationSection({
    required Key key,
    required double currentMax,
    required double minLimit,
    required double maxLimit,
    required bool isAr,
  }) {
    final displayVal = currentMax == maxLimit
        ? (isAr ? 'أي مدة' : 'Any duration')
        : _formatDuration(currentMax, isAr);
    return Column(
      key: key,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('مدة الرحلة القصوى', 'Flight Duration', isAr),
        _buildCard(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      isAr ? 'أقصى وقت سفر:' : 'Max Travel Time:',
                      style: const TextStyle(
                        color: Color(0xFF6B7280),
                        fontSize: 14,
                      ),
                    ),
                    Text(
                      displayVal,
                      style: const TextStyle(
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF7C3AED),
                        fontSize: 16,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Slider(
                  value: currentMax,
                  min: minLimit,
                  max: maxLimit,
                  divisions: ((maxLimit - minLimit) / 30).round().clamp(5, 50),
                  activeColor: const Color(0xFF7C3AED),
                  inactiveColor: const Color(0xFFE5E7EB),
                  onChanged: (val) {
                    setState(() {
                      _durationMax = val.round();
                    });
                  },
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      _formatDuration(minLimit, isAr),
                      style: const TextStyle(
                        color: Color(0xFF9CA3AF),
                        fontSize: 13,
                      ),
                    ),
                    Text(
                      isAr ? 'بدون حد' : 'No limit',
                      style: const TextStyle(
                        color: Color(0xFF9CA3AF),
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // ── 5. Layover / Stopover Rules Section ──
  Widget _buildLayoversSection({
    required Key key,
    required double currentMax,
    required double maxLimit,
    required List<String> layoverAirports,
    required bool isAr,
  }) {
    final displayVal = currentMax == maxLimit
        ? (isAr ? 'أي وقت' : 'Any duration')
        : _formatDuration(currentMax, isAr);
    return Column(
      key: key,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('أوقات ومطارات الترانزيت', 'Layover Rules', isAr),
        _buildCard(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      isAr ? 'أقصى وقت توقف/ترانزيت:' : 'Max Layover duration:',
                      style: const TextStyle(
                        color: Color(0xFF6B7280),
                        fontSize: 14,
                      ),
                    ),
                    Text(
                      displayVal,
                      style: const TextStyle(
                        fontWeight: FontWeight.w800,
                        color: Color(0xFF7C3AED),
                        fontSize: 16,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Slider(
                  value: currentMax,
                  min: 30,
                  max: maxLimit,
                  divisions: ((maxLimit - 30) / 30).round().clamp(5, 50),
                  activeColor: const Color(0xFF7C3AED),
                  inactiveColor: const Color(0xFFE5E7EB),
                  onChanged: (val) {
                    setState(() {
                      _layoverMaxMinutes = val.round();
                    });
                  },
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      _formatDuration(30, isAr),
                      style: const TextStyle(
                        color: Color(0xFF9CA3AF),
                        fontSize: 13,
                      ),
                    ),
                    Text(
                      isAr ? 'بدون حد' : 'No limit',
                      style: const TextStyle(
                        color: Color(0xFF9CA3AF),
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
                if (layoverAirports.isNotEmpty) ...[
                  const SizedBox(height: 24),
                  const Divider(),
                  const SizedBox(height: 12),
                  Text(
                    isAr ? 'مطارات الترانزيت المتاحة:' : 'Stopover Airports:',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                      color: Color(0xFF1F2937),
                    ),
                  ),
                  const SizedBox(height: 8),
                  ...layoverAirports.map((airport) {
                    final isChecked = _layoverAirports.contains(
                      airport.toLowerCase(),
                    );
                    return CheckboxListTile(
                      title: Text(
                        airport.toUpperCase(),
                        style: const TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                        ),
                      ),
                      value: isChecked,
                      onChanged: (checked) {
                        setState(() {
                          if (checked == true) {
                            _layoverAirports.add(airport.toLowerCase());
                          } else {
                            _layoverAirports.remove(airport.toLowerCase());
                          }
                        });
                      },
                      activeColor: const Color(0xFF7C3AED),
                      controlAffinity: ListTileControlAffinity.leading,
                      dense: true,
                    );
                  }).toList(),
                ],
              ],
            ),
          ),
        ),
      ],
    );
  }

  // ── 6. Airlines Section ──
  Widget _buildAirlinesSection({
    required Key key,
    required Map<String, int> airlineCounts,
    required bool isAr,
  }) {
    return Column(
      key: key,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('الخطوط الجوية الناقلة', 'Airlines', isAr),
        _buildCard(
          child: Column(
            children: airlineCounts.entries.map((entry) {
              final name = entry.key;
              final count = entry.value;
              final keyName = name.toLowerCase().replaceAll(' ', '_');
              final isChecked = _selectedAirlines.contains(keyName);

              return CheckboxListTile(
                title: Text(
                  name,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 15,
                  ),
                ),
                value: isChecked,
                onChanged: (checked) {
                  setState(() {
                    if (checked == true) {
                      _selectedAirlines.add(keyName);
                    } else {
                      _selectedAirlines.remove(keyName);
                    }
                  });
                },
                activeColor: const Color(0xFF7C3AED),
                controlAffinity: ListTileControlAffinity.leading,
              );
            }).toList(),
          ),
        ),
      ],
    );
  }

  // ── 7. Times Section ──
  Widget _buildTimesSection({required Key key, required bool isAr}) {
    final times = [
      {
        'val': 'morning',
        'label': isAr ? 'الصباح (06:00 - 11:59)' : 'Morning (06:00 - 11:59)',
        'icon': Icons.light_mode_rounded,
      },
      {
        'val': 'afternoon',
        'label': isAr ? 'الظهيرة (12:00 - 17:59)' : 'Afternoon (12:00 - 17:59)',
        'icon': Icons.wb_sunny_rounded,
      },
      {
        'val': 'evening',
        'label': isAr ? 'المساء (18:00 - 21:59)' : 'Evening (18:00 - 21:59)',
        'icon': Icons.nights_stay_rounded,
      },
      {
        'val': 'night',
        'label': isAr ? 'الليل (22:00 - 05:59)' : 'Night (22:00 - 05:59)',
        'icon': Icons.mode_night_rounded,
      },
    ];

    return Column(
      key: key,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('أوقات السفر المفضلة', 'Flight Times', isAr),
        _buildCard(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  isAr ? 'أوقات المغادرة:' : 'Departure Times:',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                    color: Color(0xFF1F2937),
                  ),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: times.map((t) {
                    final val = t['val'] as String;
                    final label = t['label'] as String;
                    final icon = t['icon'] as IconData;
                    final isChecked = _departWindows.contains(val);
                    return FilterChip(
                      avatar: Icon(
                        icon,
                        size: 16,
                        color: isChecked
                            ? Colors.white
                            : const Color(0xFF4B5563),
                      ),
                      label: Text(label),
                      selected: isChecked,
                      onSelected: (selected) {
                        setState(() {
                          if (selected) {
                            _departWindows.add(val);
                          } else {
                            _departWindows.remove(val);
                          }
                        });
                      },
                      selectedColor: const Color(0xFF7C3AED),
                      checkmarkColor: Colors.white,
                      labelStyle: TextStyle(
                        color: isChecked
                            ? Colors.white
                            : const Color(0xFF1F2937),
                        fontWeight: FontWeight.w600,
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 24),
                const Divider(),
                const SizedBox(height: 12),
                Text(
                  isAr ? 'أوقات الوصول:' : 'Arrival Times:',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                    color: Color(0xFF1F2937),
                  ),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: times.map((t) {
                    final val = t['val'] as String;
                    final label = t['label'] as String;
                    final icon = t['icon'] as IconData;
                    final isChecked = _arriveWindows.contains(val);
                    return FilterChip(
                      avatar: Icon(
                        icon,
                        size: 16,
                        color: isChecked
                            ? Colors.white
                            : const Color(0xFF4B5563),
                      ),
                      label: Text(label),
                      selected: isChecked,
                      onSelected: (selected) {
                        setState(() {
                          if (selected) {
                            _arriveWindows.add(val);
                          } else {
                            _arriveWindows.remove(val);
                          }
                        });
                      },
                      selectedColor: const Color(0xFF7C3AED),
                      checkmarkColor: Colors.white,
                      labelStyle: TextStyle(
                        color: isChecked
                            ? Colors.white
                            : const Color(0xFF1F2937),
                        fontWeight: FontWeight.w600,
                      ),
                    );
                  }).toList(),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // ── 8. Cabin Section ──
  Widget _buildCabinSection({
    required Key key,
    required List<String> cabinOptions,
    required bool isAr,
  }) {
    return Column(
      key: key,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('درجة مقصورة السفر', 'Cabin Class', isAr),
        _buildCard(
          child: Column(
            children: cabinOptions.map((cabin) {
              final isChecked = _selectedCabins.contains(cabin.toLowerCase());
              return CheckboxListTile(
                title: Text(
                  cabin,
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 15,
                  ),
                ),
                value: isChecked,
                onChanged: (checked) {
                  setState(() {
                    if (checked == true) {
                      _selectedCabins.add(cabin.toLowerCase());
                    } else {
                      _selectedCabins.remove(cabin.toLowerCase());
                    }
                  });
                },
                activeColor: const Color(0xFF7C3AED),
                controlAffinity: ListTileControlAffinity.leading,
              );
            }).toList(),
          ),
        ),
      ],
    );
  }

  // ── 9. Airports Section ──
  Widget _buildAirportsSection({
    required Key key,
    required List<String> fromAirports,
    required List<String> toAirports,
    required bool isAr,
  }) {
    return Column(
      key: key,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('مطارات المغادرة والوصول', 'Airports', isAr),
        _buildCard(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  isAr ? 'مطارات المغادرة (الإقلاع):' : 'Departure Airports:',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                    color: Color(0xFF1F2937),
                  ),
                ),
                const SizedBox(height: 8),
                ...fromAirports.map((airport) {
                  final isChecked = _fromAirports.contains(
                    airport.toLowerCase(),
                  );
                  return CheckboxListTile(
                    title: Text(
                      airport.toUpperCase(),
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                      ),
                    ),
                    value: isChecked,
                    onChanged: (checked) {
                      setState(() {
                        if (checked == true) {
                          _fromAirports.add(airport.toLowerCase());
                        } else {
                          _fromAirports.remove(airport.toLowerCase());
                        }
                      });
                    },
                    activeColor: const Color(0xFF7C3AED),
                    controlAffinity: ListTileControlAffinity.leading,
                    dense: true,
                  );
                }).toList(),
                const SizedBox(height: 24),
                const Divider(),
                const SizedBox(height: 12),
                Text(
                  isAr ? 'مطارات الوصول (الهبوط):' : 'Arrival Airports:',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                    color: Color(0xFF1F2937),
                  ),
                ),
                const SizedBox(height: 8),
                ...toAirports.map((airport) {
                  final isChecked = _toAirports.contains(airport.toLowerCase());
                  return CheckboxListTile(
                    title: Text(
                      airport.toUpperCase(),
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 14,
                      ),
                    ),
                    value: isChecked,
                    onChanged: (checked) {
                      setState(() {
                        if (checked == true) {
                          _toAirports.add(airport.toLowerCase());
                        } else {
                          _toAirports.remove(airport.toLowerCase());
                        }
                      });
                    },
                    activeColor: const Color(0xFF7C3AED),
                    controlAffinity: ListTileControlAffinity.leading,
                    dense: true,
                  );
                }).toList(),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
