import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:lonaliza_driver/core/extensions/context_l10n.dart';
import 'package:lonaliza_driver/domain/entities/flights/flights_booking_draft.dart';
import 'package:lonaliza_driver/domain/entities/flights/catalog_location_suggestion.dart';
import 'package:lonaliza_driver/l10n/app_localizations.dart';
import '../../../widgets/place_search_sheet.dart';
import '../../../widgets/flights_place_search_sheet.dart';
import '../providers/flights_booking_draft_notifier.dart';
import 'package:lonaliza_driver/core/extensions/context_alert.dart';
import '../providers/flight_search_results_provider.dart';
import 'package:lonaliza_driver/core/validators/flight/flight_booking_validator.dart';
import 'flights_class_sheet.dart';
import 'flights_date_picker_sheet.dart';
import 'flights_passengers_sheet.dart';

class FlightsSearchCard extends ConsumerStatefulWidget {
  const FlightsSearchCard({super.key, this.onSearch});

  static const _brandBlue = Color(0xFF2F60F5);

  final VoidCallback? onSearch;

  @override
  ConsumerState<FlightsSearchCard> createState() => _FlightsSearchCardState();
}

class _FlightsSearchCardState extends ConsumerState<FlightsSearchCard> {
  static final DateFormat _singleDateFormat = DateFormat('EEE, MMM d');

  @override
  Widget build(BuildContext context) {
    final draft = ref.watch(flightsBookingDraftProvider);
    final notifier = ref.read(flightsBookingDraftProvider.notifier);
    final l10n = context.l10n;
    final isAr = Localizations.localeOf(context).languageCode == 'ar';

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 18,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(14, 10, 14, 14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _TripTypeTabs(
              selectedTripType: draft.tripType,
              onChanged: (tripType) {
                notifier.setTripType(tripType);
              },
            ),
            const SizedBox(height: 10),
            ...switch (draft.tripType) {
              FlightTripType.oneWay => [
                _RouteFields(
                  fromLabel:
                      draft.origin?.getDisplayLabel(isAr: isAr) ??
                      l10n.whereFrom,
                  toLabel:
                      draft.destination?.getDisplayLabel(isAr: isAr) ??
                      l10n.whereTo,
                  onSwapTap: notifier.swapOriginDestination,
                  onFromTap: () => _pickPlace(context, notifier.setOrigin),
                  onToTap: () => _pickPlace(context, notifier.setDestination),
                ),
                const SizedBox(height: 2),
                const _SectionDivider(),
                _DateRow(
                  label: draft.departureDate != null
                      ? _formatSingleDate(draft.departureDate!)
                      : l10n.selectDate,
                  onTap: () => _pickSingleDate(
                    initialDate: draft.departureDate ?? DateTime.now(),
                    onSelected: notifier.setDepartureDate,
                  ),
                ),
              ],
              FlightTripType.roundTrip => [
                _RouteFields(
                  fromLabel:
                      draft.origin?.getDisplayLabel(isAr: isAr) ??
                      l10n.whereFrom,
                  toLabel:
                      draft.destination?.getDisplayLabel(isAr: isAr) ??
                      l10n.whereTo,
                  onSwapTap: notifier.swapOriginDestination,
                  onFromTap: () => _pickPlace(context, notifier.setOrigin),
                  onToTap: () => _pickPlace(context, notifier.setDestination),
                ),
                const SizedBox(height: 2),
                const _SectionDivider(),
                _DateRow(
                  label:
                      (draft.departureDate != null && draft.returnDate != null)
                      ? _formatRange(
                          DateTimeRange(
                            start: draft.departureDate!,
                            end: draft.returnDate!,
                          ),
                        )
                      : l10n.selectDate,
                  onTap: () => _pickRangeDate(
                    draft.departureDate,
                    draft.returnDate,
                    notifier,
                  ),
                ),
              ],
              FlightTripType.multiCity => [
                _MultiCityFields(
                  segments: draft.segments,
                  onDateTap: (i) => _pickMultiCityDate(i, draft, notifier),
                  onFromTap: (i) => _pickMultiCityOrigin(i, draft, notifier),
                  onToTap: (i) => _pickMultiCityDestination(i, draft, notifier),
                  onAddSegment: notifier.addMultiCitySegment,
                  onRemove: notifier.removeMultiCitySegment,
                ),
              ],
            },
            const _SectionDivider(),
            _PassengerClassRow(
              adults: draft.adultCount,
              children: draft.childCount,
              infantsOnLap: draft.infantCount,
              travelClass: _getLocalizedCabinClass(draft.cabinClass, l10n),
              onPassengersTap: () => _pickPassengers(draft, notifier),
              onClassTap: () => _pickClass(draft, notifier),
            ),

            const SizedBox(height: 14),
            _SearchButton(
              onPressed: () {
                final draft = ref.read(flightsBookingDraftProvider);
                final l10n = context.l10n;

                // Use the centralized validator
                final error = FlightBookingValidator.validate(draft, l10n);

                if (error != null) {
                  context.showWarningAlert(error);
                  return;
                }

                // Clear stale results so the results page starts with a skeleton
                // instantly instead of rendering old offers (prevents nav lag).
                ref.read(flightSearchStateProvider.notifier).resetToLoading();

                // If all good, proceed
                context.pushNamed('flights-search');
              },
            ),
          ],
        ),
      ),
    );
  }

  String _getLocalizedCabinClass(
    FlightCabinClass cabin,
    AppLocalizations l10n,
  ) {
    return switch (cabin) {
      FlightCabinClass.economy => l10n.cabinEconomy,
      FlightCabinClass.premiumEconomy => l10n.cabinPremiumEconomy,
      FlightCabinClass.business => l10n.cabinBusiness,
      FlightCabinClass.first => l10n.cabinFirst,
    };
  }

  Future<void> _pickPlace(
    BuildContext context,
    void Function(CatalogAirportSuggestion) onSelected,
  ) async {
    final result = await showGeneralDialog<CatalogAirportSuggestion?>(
      context: context,
      barrierLabel: 'Search Destination',
      barrierDismissible: true,
      barrierColor: Colors.black.withValues(alpha: 0.22),
      transitionDuration: const Duration(milliseconds: 220),
      pageBuilder: (context, animation, secondaryAnimation) =>
          const FlightsPlaceSearchSheet(),
      transitionBuilder: (context, animation, secondaryAnimation, child) {
        final offsetAnimation =
            Tween<Offset>(begin: const Offset(0, 1), end: Offset.zero).animate(
              CurvedAnimation(parent: animation, curve: Curves.easeOutCubic),
            );
        return SlideTransition(
          position: offsetAnimation,
          child: FadeTransition(opacity: animation, child: child),
        );
      },
    );
    if (result != null && mounted) {
      onSelected(result);
    }
  }

  void _pickMultiCityOrigin(
    int index,
    FlightsBookingDraft draft,
    FlightsBookingDraftNotifier notifier,
  ) {
    _pickPlace(context, (place) {
      notifier.updateMultiCitySegment(index, origin: place);
    });
  }

  void _pickMultiCityDestination(
    int index,
    FlightsBookingDraft draft,
    FlightsBookingDraftNotifier notifier,
  ) {
    _pickPlace(context, (place) {
      notifier.updateMultiCitySegment(index, destination: place);
    });
  }

  String _formatSingleDate(DateTime date) {
    return _singleDateFormat.format(date);
  }

  String _formatRange(DateTimeRange range) {
    return '${_singleDateFormat.format(range.start)} - ${_singleDateFormat.format(range.end)}';
  }

  Future<void> _pickSingleDate({
    required DateTime initialDate,
    required ValueChanged<DateTime> onSelected,
  }) async {
    final result = await showFlightsDatePickerSheet(
      context,
      selectionMode: FlightsDateSelectionMode.single,
      initialDate: initialDate,
    );
    if (!mounted || result == null) return;
    onSelected(result.start);
  }

  Future<void> _pickRangeDate(
    DateTime? start,
    DateTime? end,
    FlightsBookingDraftNotifier notifier,
  ) async {
    final result = await showFlightsDatePickerSheet(
      context,
      selectionMode: FlightsDateSelectionMode.range,
      initialRange: (start != null && end != null)
          ? DateTimeRange(start: start, end: end)
          : null,
    );
    if (!mounted || result == null || result.end == null) return;
    notifier.setDepartureDate(result.start);
    notifier.setReturnDate(result.end!);
  }

  Future<void> _pickMultiCityDate(
    int index,
    FlightsBookingDraft draft,
    FlightsBookingDraftNotifier notifier,
  ) async {
    final initialDate = (draft.segments.length > index)
        ? draft.segments[index].departureDate ?? DateTime.now()
        : DateTime.now();

    await _pickSingleDate(
      initialDate: initialDate,
      onSelected: (date) {
        notifier.updateMultiCitySegment(index, departureDate: date);
      },
    );
  }

  Future<void> _pickPassengers(
    FlightsBookingDraft draft,
    FlightsBookingDraftNotifier notifier,
  ) async {
    final result = await showFlightsPassengersSheet(
      context,
      initialValue: FlightsPassengersResult(
        adults: draft.adultCount,
        children: draft.childCount,
        infantsOnLap: draft.infantCount,
      ),
    );
    if (!mounted || result == null) return;
    notifier.setPassengers(
      adults: result.adults,
      children: result.children,
      infants: result.infantsOnLap,
    );
  }

  Future<void> _pickClass(
    FlightsBookingDraft draft,
    FlightsBookingDraftNotifier notifier,
  ) async {
    // For now we map string back to enum manually, this will need a proper mapper later
    final result = await showFlightsClassSheet(
      context,
      initialValue: draft.cabinClass.name,
    );
    if (!mounted || result == null) return;
    FlightCabinClass? selected;
    if (result.toLowerCase().contains('premium')) {
      selected = FlightCabinClass.premiumEconomy;
    } else if (result.toLowerCase().contains('business')) {
      selected = FlightCabinClass.business;
    } else if (result.toLowerCase().contains('first')) {
      selected = FlightCabinClass.first;
    } else {
      selected = FlightCabinClass.economy;
    }
    notifier.setCabinClass(selected);
  }
}

class _TripTypeTabs extends StatelessWidget {
  const _TripTypeTabs({
    required this.selectedTripType,
    required this.onChanged,
  });

  final FlightTripType selectedTripType;
  final ValueChanged<FlightTripType> onChanged;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final tabs = [
      (FlightTripType.oneWay, l10n.oneWay),
      (FlightTripType.roundTrip, l10n.roundTrip),
      (FlightTripType.multiCity, l10n.multiCity),
    ];

    return Row(
      children: [
        for (final tab in tabs)
          Expanded(
            child: Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: () => onChanged(tab.$1),
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  height: 40,
                  alignment: Alignment.bottomCenter,
                  padding: const EdgeInsets.only(bottom: 10),
                  decoration: BoxDecoration(
                    border: Border(
                      bottom: BorderSide(
                        color: selectedTripType == tab.$1
                            ? FlightsSearchCard._brandBlue
                            : Colors.transparent,
                        width: 3,
                      ),
                    ),
                  ),
                  child: Text(
                    tab.$2,
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      color: selectedTripType == tab.$1
                          ? FlightsSearchCard._brandBlue
                          : const Color(0xFF4B5563),
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }
}

class _RouteFields extends StatelessWidget {
  const _RouteFields({
    this.fromLabel = 'Los Angeles',
    this.toLabel = 'Tokyo',
    this.toPlaceholder = false,
    this.onSwapTap,
    this.onFromTap,
    this.onToTap,
  });

  final String fromLabel;
  final String toLabel;
  final bool toPlaceholder;
  final VoidCallback? onSwapTap;
  final VoidCallback? onFromTap;
  final VoidCallback? onToTap;

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.centerRight,
      children: [
        Padding(
          padding: const EdgeInsets.only(right: 44),
          child: Column(
            children: [
              _RouteFieldRow(
                icon: Icons.flight_takeoff_rounded,
                label: fromLabel,
                onTap: onFromTap,
              ),
              _RouteFieldRow(
                icon: Icons.flight_land_rounded,
                label: toLabel,
                isPlaceholder: toPlaceholder,
                onTap: onToTap,
              ),
            ],
          ),
        ),
        Positioned(
          right: 0,
          child: Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: onSwapTap,
              borderRadius: BorderRadius.circular(10),
              child: Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFFE5E7EB)),
                ),
                child: const Icon(
                  Icons.swap_vert_rounded,
                  color: Color(0xFF374151),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _RouteFieldRow extends StatelessWidget {
  const _RouteFieldRow({
    required this.icon,
    required this.label,
    this.isPlaceholder = false,
    this.onTap,
  });

  final IconData icon;
  final String label;
  final bool isPlaceholder;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final labelStyle = Theme.of(context).textTheme.bodyLarge?.copyWith(
      fontSize: 16,
      color: isPlaceholder ? const Color(0xFF9CA3AF) : const Color(0xFF202833),
      fontWeight: FontWeight.w600,
      letterSpacing: -0.1,
    );

    return InkWell(
      onTap: onTap,
      child: SizedBox(
        height: 48,
        child: Row(
          children: [
            Icon(icon, size: 17, color: const Color(0xFF6B7280)),
            const SizedBox(width: 10),
            Expanded(child: Text(label, style: labelStyle)),
          ],
        ),
      ),
    );
  }
}

class _DateRow extends StatelessWidget {
  const _DateRow({required this.label, this.onTap});

  final String label;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final dateStyle = Theme.of(context).textTheme.bodyLarge?.copyWith(
      fontSize: 16,
      color: const Color(0xFF202833),
      fontWeight: FontWeight.w600,
      letterSpacing: -0.1,
    );

    return InkWell(
      onTap: onTap,
      child: SizedBox(
        height: 48,
        child: Row(
          children: [
            const Icon(
              Icons.calendar_month_outlined,
              size: 18,
              color: Color(0xFF6B7280),
            ),
            const SizedBox(width: 10),
            Expanded(child: Text(label, style: dateStyle)),
          ],
        ),
      ),
    );
  }
}

class _MultiCityFields extends StatelessWidget {
  const _MultiCityFields({
    required this.segments,
    required this.onDateTap,
    required this.onFromTap,
    required this.onToTap,
    required this.onAddSegment,
    required this.onRemove,
  });

  final List<FlightRouteSegment> segments;
  final void Function(int index) onDateTap;
  final void Function(int index) onFromTap;
  final void Function(int index) onToTap;
  final void Function(int index) onRemove;
  final VoidCallback onAddSegment;

  @override
  Widget build(BuildContext context) {
    final isAr = Localizations.localeOf(context).languageCode == 'ar';
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        for (int i = 0; i < segments.length; i++) ...[
          _MultiCityFlightSection(
            title: context.l10n.flightNumber(i + 1),
            fromLabel:
                segments[i].origin?.getDisplayLabel(isAr: isAr) ??
                context.l10n.whereFrom,
            toLabel:
                segments[i].destination?.getDisplayLabel(isAr: isAr) ??
                context.l10n.whereTo,
            dateLabel: segments[i].departureDate != null
                ? _FlightsSearchCardState._singleDateFormat.format(
                    segments[i].departureDate!,
                  )
                : context.l10n.selectDate,
            destinationPlaceholder: segments[i].destination == null,
            showRemove: segments.length > 1,
            onRemove: () => onRemove(i),
            onDateTap: () => onDateTap(i),
            onFromTap: () => onFromTap(i),
            onToTap: () => onToTap(i),
          ),
          const SizedBox(height: 12),
        ],
        _AddAnotherFlightButton(onTap: onAddSegment),
        const SizedBox(height: 12),
      ],
    );
  }
}

class _MultiCityFlightSection extends StatelessWidget {
  const _MultiCityFlightSection({
    required this.title,
    required this.fromLabel,
    required this.toLabel,
    required this.dateLabel,
    required this.onDateTap,
    this.destinationPlaceholder = false,
    this.showRemove = false,
    this.onRemove,
    this.onFromTap,
    this.onToTap,
  });

  final String title;
  final String fromLabel;
  final String toLabel;
  final String dateLabel;
  final VoidCallback onDateTap;
  final bool destinationPlaceholder;
  final bool showRemove;
  final VoidCallback? onRemove;
  final VoidCallback? onFromTap;
  final VoidCallback? onToTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE8EBF1)),
      ),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(12, 12, 12, 6),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    title,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: const Color(0xFF1F2937),
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                if (showRemove)
                  IconButton(
                    onPressed: onRemove,
                    icon: const Icon(
                      Icons.close_rounded,
                      size: 20,
                      color: Color(0xFF9CA3AF),
                    ),
                    visualDensity: VisualDensity.compact,
                  ),
              ],
            ),
            const SizedBox(height: 8),
            _RouteFields(
              fromLabel: fromLabel,
              toLabel: toLabel,
              toPlaceholder: destinationPlaceholder,
              onFromTap: onFromTap,
              onToTap: onToTap,
            ),
            const SizedBox(height: 2),
            const _SectionDivider(),
            _DateRow(label: dateLabel, onTap: onDateTap),
          ],
        ),
      ),
    );
  }
}

class _AddAnotherFlightButton extends StatelessWidget {
  const _AddAnotherFlightButton({required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        height: 46,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border.all(color: const Color(0xFFE5E7EB)),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Text(
          '+ ${context.l10n.addAnotherFlight}',
          style: Theme.of(context).textTheme.titleSmall?.copyWith(
            color: FlightsSearchCard._brandBlue,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}

class _PassengerClassRow extends StatelessWidget {
  const _PassengerClassRow({
    required this.adults,
    required this.children,
    required this.infantsOnLap,
    required this.travelClass,
    this.onPassengersTap,
    this.onClassTap,
  });

  final int adults;
  final int children;
  final int infantsOnLap;
  final String travelClass;
  final VoidCallback? onPassengersTap;
  final VoidCallback? onClassTap;

  @override
  Widget build(BuildContext context) {
    final itemStyle = Theme.of(context).textTheme.titleSmall?.copyWith(
      color: const Color(0xFF1F2937),
      fontWeight: FontWeight.w700,
    );

    return SizedBox(
      height: 52,
      child: Row(
        children: [
          InkWell(
            onTap: onPassengersTap,
            child: Row(
              children: [
                const Icon(Icons.person_outline_rounded, size: 18),
                const SizedBox(width: 6),
                Text('$adults', style: itemStyle),
                const SizedBox(width: 14),
                const Icon(Icons.assistant_outlined, size: 18),
                const SizedBox(width: 6),
                Text('$children', style: itemStyle),
                const SizedBox(width: 14),
                const Icon(Icons.change_history_outlined, size: 18),
                const SizedBox(width: 6),
                Text('$infantsOnLap', style: itemStyle),
              ],
            ),
          ),
          Container(
            width: 1,
            height: 18,
            margin: const EdgeInsets.symmetric(horizontal: 14),
            color: const Color(0xFFE5E7EB),
          ),
          Expanded(
            child: InkWell(
              onTap: onClassTap,
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      travelClass,
                      overflow: TextOverflow.ellipsis,
                      style: itemStyle,
                    ),
                  ),
                  const SizedBox(width: 6),
                  const Icon(
                    Icons.keyboard_arrow_down_rounded,
                    color: Color(0xFF6B7280),
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

class _SectionDivider extends StatelessWidget {
  const _SectionDivider();

  @override
  Widget build(BuildContext context) {
    return const Divider(height: 1, color: Color(0xFFEAECEF));
  }
}

class _SearchButton extends StatelessWidget {
  const _SearchButton({this.onPressed});

  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return FilledButton(
      onPressed: onPressed,
      style: FilledButton.styleFrom(
        backgroundColor: FlightsSearchCard._brandBlue,
        foregroundColor: Colors.white,
        minimumSize: const Size.fromHeight(56),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
      child: Text(
        context.l10n.search,
        style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 18),
      ),
    );
  }
}
