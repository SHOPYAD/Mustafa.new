import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart' hide TextDirection;

import '../../../../providers/router_providers.dart';
import '../../providers/loyalty_notifier.dart';

import 'package:lonaliza_driver/core/extensions/context_l10n.dart';
import 'package:lonaliza_driver/domain/entities/flights/flight_offer.dart';
import 'package:lonaliza_driver/domain/entities/flights/catalog_airline.dart';
import 'package:lonaliza_driver/core/utils/helper.dart';
import 'package:lonaliza_driver/core/constants/app_constants.dart';

class FlightsSearchResultCard extends ConsumerStatefulWidget {
  const FlightsSearchResultCard({
    super.key,
    required this.offer,
    this.airline,
    this.isCheapestDirect = false,
    this.isBestValued = false,
  });

  final FlightOffer offer;
  final CatalogAirline? airline;
  final bool isCheapestDirect;
  final bool isBestValued;

  @override
  ConsumerState<FlightsSearchResultCard> createState() =>
      _FlightsSearchResultCardState();
}

class _FlightsSearchResultCardState
    extends ConsumerState<FlightsSearchResultCard> {
  bool _isExpanded = false;

  String _formatLayover(Duration? duration) {
    if (duration == null) return '';
    final hours = duration.inHours;
    final minutes = duration.inMinutes % 60;
    if (hours > 0) {
      return '${hours}h ${minutes}m';
    }
    return '${minutes}m';
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final couponOffer = ref
        .watch(loyaltyResultCardBadgeProvider.notifier)
        .firstCoupon;

    // ── Data (pre-computed by the entity) ──────────────────
    final itinerary = widget.offer.itineraries.isNotEmpty
        ? widget.offer.itineraries.first
        : null;
    final segments = itinerary?.segments ?? [];
    final firstSegment = segments.isNotEmpty ? segments.first : null;
    final lastSegment = segments.isNotEmpty ? segments.last : null;

    final isArabic = Localizations.localeOf(context).languageCode == 'ar';

    // Airline name: localized
    final airlineName = widget.airline != null
        ? (isArabic && (widget.airline!.nameAr?.isNotEmpty ?? false)
              ? widget.airline!.nameAr!
              : widget.airline!.name)
        : (firstSegment?.carrierName ?? 'Unknown Airline');

    final airlineCode = firstSegment?.carrierCode ?? 'N/A';
    final flightNumber = firstSegment != null
        ? '${firstSegment.carrierCode}-${firstSegment.flightNumber}'
        : 'N/A';
    final flightClass = firstSegment?.cabinClass ?? 'Economy';

    // Dates
    final departureTime = firstSegment != null
        ? DateFormat('HH:mm').format(firstSegment.departure.dateTime)
        : 'N/A';
    final departureDate = firstSegment != null
        ? DateFormat('dd MMM yyyy').format(firstSegment.departure.dateTime)
        : 'N/A';
    final departureAirport = firstSegment?.departure.airportCode ?? 'N/A';
    final departureCity = firstSegment?.departure.cityName;

    final arrivalTime = lastSegment != null
        ? DateFormat('HH:mm').format(lastSegment.arrival.dateTime)
        : 'N/A';
    final arrivalDate = lastSegment != null
        ? DateFormat('dd MMM yyyy').format(lastSegment.arrival.dateTime)
        : 'N/A';
    final arrivalAirport = lastSegment?.arrival.airportCode ?? 'N/A';
    final arrivalCity = lastSegment?.arrival.cityName;

    // Arrival day offset
    final arrivalDayOffset = (firstSegment != null && lastSegment != null)
        ? lastSegment.arrival.dateTime.toLocal().day -
              firstSegment.departure.dateTime.toLocal().day
        : 0;

    final duration = itinerary?.formattedDuration ?? '';
    final hasStops = segments.length > 1;
    final stopsString = hasStops
        ? l10n.flightStopVia(
            segments.length - 1,
            segments.first.arrival.airportCode,
          )
        : l10n.flightNonstop;

    final price = widget.offer.formattedPrice;
    final defaultVariant = widget.offer.defaultVariant;
    final checkedBagDesc = defaultVariant?.checkedBagDesc;
    final cabinBagDesc = defaultVariant?.cabinBagDesc;
    final optionsCount = widget.offer.fareOptionsCount;

    final logoUrl = Helper.resolveAirlineLogo(
      widget.airline?.logoUrl,
      airlineCode,
    );

    final showRibbon = widget.isCheapestDirect || widget.isBestValued;
    final ribbonColor = widget.isCheapestDirect
        ? const Color(0xFF10B981)
        : const Color(0xFF4F46E5);
    final ribbonIcon = widget.isCheapestDirect
        ? Icons.flash_on_rounded
        : Icons.star_rounded;
    final ribbonText = widget.isCheapestDirect
        ? l10n.cheapestDirectFlight
        : l10n.bestValuedFlight;

    // Split currency and amount safely
    final priceParts = price.split(' ');
    final currencySymbol = priceParts.isNotEmpty ? priceParts.first : '';
    final priceAmount = priceParts.length > 1
        ? priceParts.sublist(1).join(' ')
        : price;

    final rawProvider =
        widget.offer.providerCode ??
        widget.offer.defaultVariant?.bookingProviderCode;
    final providerDisplay = rawProvider != null && rawProvider.isNotEmpty
        ? rawProvider.toUpperCase()
        : 'SEERU-AIR';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 16, right: 16, top: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFFE2E8F0), width: 1),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.business_rounded,
                      size: 12,
                      color: Color(0xFF64748B),
                    ),
                    const SizedBox(width: 5),
                    Text(
                      'المورد: $providerDisplay',
                      style: const TextStyle(
                        color: Color(0xFF475569),
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        Card(
          margin: const EdgeInsets.only(left: 12, right: 12, bottom: 8, top: 4),
          elevation: 3,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: Color(0xFFE2E8F0), width: 1),
          ),
          color: Colors.white,
          clipBehavior: Clip.antiAlias,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 1. Premium Ribbon (optional)
              if (showRibbon)
                Container(
                  color: ribbonColor,
                  padding: const EdgeInsets.symmetric(vertical: 6),
                  alignment: Alignment.center,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(ribbonIcon, color: Colors.white, size: 13),
                      const SizedBox(width: 4),
                      Text(
                        ribbonText,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 9.5,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                ),

              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // 2. Airline Info Row
                    Row(
                      children: [
                        // Airline Logo
                        Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: const Color(0xFFF1F5F9),
                              width: 1.5,
                            ),
                          ),
                          padding: const EdgeInsets.all(3),
                          child: logoUrl != null && logoUrl!.isNotEmpty
                              ? ClipRRect(
                                  borderRadius: BorderRadius.circular(5),
                                  child: Image.network(
                                    logoUrl!,
                                    fit: BoxFit.contain,
                                    errorBuilder: (_, __, ___) => const Icon(
                                      Icons.flight_rounded,
                                      color: Color(0xFF4F46E5),
                                    ),
                                  ),
                                )
                              : const Icon(
                                  Icons.flight_rounded,
                                  color: Color(0xFF4F46E5),
                                  size: 20,
                                ),
                        ),
                        const SizedBox(width: 10),
                        // Airline Name
                        Expanded(
                          child: Text(
                            airlineName,
                            style: const TextStyle(
                              color: Color(0xFF0F172A),
                              fontWeight: FontWeight.w800,
                              fontSize: 13.5,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        // Airline Badges
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 6,
                                vertical: 3,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(0xFFF3E8FF),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                flightNumber,
                                style: const TextStyle(
                                  color: Color(0xFF6B21A8),
                                  fontWeight: FontWeight.bold,
                                  fontSize: 9,
                                ),
                              ),
                            ),
                            const SizedBox(width: 5),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 6,
                                vertical: 3,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(0xFF1E1B4B),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                flightClass.toUpperCase(),
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 9,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    // 3. Flight Path Section (Grey rounded container)
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          // Departure Airport Info
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                departureTime,
                                style: const TextStyle(
                                  color: Color(0xFF0F172A),
                                  fontSize: 18,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                departureAirport,
                                style: const TextStyle(
                                  color: Color(0xFF64748B),
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),

                          // Dotted vertical circles + path label
                          Expanded(
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                // Top circle
                                Container(
                                  width: 3.5,
                                  height: 3.5,
                                  decoration: const BoxDecoration(
                                    color: Color(0xFFD97706),
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                // Middle Pill Badge
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 10,
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                      color: const Color(0xFFE2E8F0),
                                    ),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      const Icon(
                                        Icons.flight_rounded,
                                        color: Color(0xFFD97706),
                                        size: 11,
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        '$duration • $stopsString',
                                        style: const TextStyle(
                                          color: Color(0xFFD97706),
                                          fontSize: 9.5,
                                          fontWeight: FontWeight.w800,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 4),
                                // Bottom circle
                                Container(
                                  width: 3.5,
                                  height: 3.5,
                                  decoration: const BoxDecoration(
                                    color: Color(0xFFD97706),
                                    shape: BoxShape.circle,
                                  ),
                                ),
                              ],
                            ),
                          ),

                          // Arrival Airport Info
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    arrivalTime,
                                    style: const TextStyle(
                                      color: Color(0xFF0F172A),
                                      fontSize: 18,
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                  if (arrivalDayOffset > 0) ...[
                                    const SizedBox(width: 1),
                                    Text(
                                      '+$arrivalDayOffset',
                                      style: const TextStyle(
                                        color: Color(0xFFEF4444),
                                        fontWeight: FontWeight.bold,
                                        fontSize: 9,
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                              const SizedBox(height: 2),
                              Text(
                                arrivalAirport,
                                style: const TextStyle(
                                  color: Color(0xFF64748B),
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),

                    // 4. Fine divider line
                    const Divider(height: 1, color: Color(0xFFE2E8F0)),
                    const SizedBox(height: 12),

                    // 5. Price & Details Row
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // Price
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          textDirection: TextDirection.ltr,
                          children: [
                            Text(
                              currencySymbol,
                              style: const TextStyle(
                                color: Color(0xFFD97706),
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text(
                              priceAmount,
                              style: const TextStyle(
                                color: Color(0xFFD97706),
                                fontSize: 22,
                                fontWeight: FontWeight.w900,
                                height: 1.0,
                              ),
                            ),
                          ],
                        ),

                        // Details Dropdown Button
                        GestureDetector(
                          onTap: () {
                            setState(() {
                              _isExpanded = !_isExpanded;
                            });
                          },
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 10,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              border: Border.all(
                                color: const Color(0xFFE2E8F0),
                              ),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  l10n.details,
                                  style: const TextStyle(
                                    color: Color(0xFF0F172A),
                                    fontSize: 11.5,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(width: 4),
                                Icon(
                                  _isExpanded
                                      ? Icons.keyboard_arrow_up_rounded
                                      : Icons.keyboard_arrow_down_rounded,
                                  color: const Color(0xFF0F172A),
                                  size: 14,
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    // 6. Loyalty/Discount Pill
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      decoration: BoxDecoration(
                        color: const Color(0xFF4F46E5),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      alignment: Alignment.center,
                      child: Text(
                        couponOffer != null
                            ? couponOffer.promoLabel
                            : l10n.tenPercentOff,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),

                    // 7. SELECT FLIGHT Button
                    SizedBox(
                      width: double.infinity,
                      height: 44,
                      child: ElevatedButton(
                        onPressed: () {
                          ref
                              .read(navigationRepositoryProvider)
                              .goFlightDetails(widget.offer);
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(
                            0xFF1E1B4B,
                          ), // Premium indigo-black
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          elevation: 0,
                        ),
                        child: Text(
                          l10n.selectFlight,
                          style: const TextStyle(
                            fontSize: 12.5,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 0.5,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              // 8. Expanded segments timeline
              if (_isExpanded && segments.isNotEmpty) ...[
                const Divider(height: 1, color: Color(0xFFE2E8F0)),
                Container(
                  color: const Color(0xFFF8FAFC),
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      ...List.generate(segments.length, (index) {
                        final segment = segments[index];
                        final segDepTime = DateFormat(
                          'HH:mm',
                        ).format(segment.departure.dateTime);
                        final segArrTime = DateFormat(
                          'HH:mm',
                        ).format(segment.arrival.dateTime);
                        final segDepDate = DateFormat(
                          'EEE, dd MMM',
                        ).format(segment.departure.dateTime);
                        final segArrDate = DateFormat(
                          'EEE, dd MMM',
                        ).format(segment.arrival.dateTime);

                        final segDuration = segment.durationMinutes != null
                            ? Helper.formatDurationMinutes(
                                segment.durationMinutes!,
                              )
                            : '–';

                        // Calculate layover duration to next segment
                        Duration? layoverDuration;
                        if (index < segments.length - 1) {
                          final nextSegment = segments[index + 1];
                          layoverDuration = nextSegment.departure.dateTime
                              .difference(segment.arrival.dateTime);
                        }

                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            // 1. Departure Point Row
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Timeline circle + line Column
                                Column(
                                  children: [
                                    Container(
                                      width: 8,
                                      height: 8,
                                      decoration: const BoxDecoration(
                                        color: Color(0xFF4F46E5),
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                    Container(
                                      width: 2,
                                      height: 35,
                                      color: const Color(0xFFE2E8F0),
                                    ),
                                  ],
                                ),
                                const SizedBox(width: 16),
                                // Departure Title + Date
                                Expanded(
                                  child: Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    crossAxisAlignment:
                                        CrossAxisAlignment.center,
                                    children: [
                                      Expanded(
                                        child: Text(
                                          '$segDepTime - ${segment.departure.cityName} (${segment.departure.airportCode})',
                                          style: const TextStyle(
                                            color: Color(0xFF0F172A),
                                            fontSize: 13,
                                            fontWeight: FontWeight.bold,
                                          ),
                                          maxLines: 2,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Text(
                                        segDepDate,
                                        style: const TextStyle(
                                          color: Color(0xFF64748B),
                                          fontSize: 11,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),

                            // 2. Flight segment details card Row
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Column(
                                  children: [
                                    Container(
                                      width: 2,
                                      height: 55,
                                      color: const Color(0xFFE2E8F0),
                                    ),
                                  ],
                                ),
                                const SizedBox(width: 18),
                                Expanded(
                                  child: Container(
                                    margin: const EdgeInsets.only(bottom: 8),
                                    padding: const EdgeInsets.all(8),
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(6),
                                      border: Border.all(
                                        color: const Color(0xFFF1F5F9),
                                      ),
                                    ),
                                    child: Row(
                                      children: [
                                        const Icon(
                                          Icons.flight_takeoff_rounded,
                                          size: 14,
                                          color: Color(0xFF64748B),
                                        ),
                                        const SizedBox(width: 6),
                                        Expanded(
                                          child: Text(
                                            '${segment.carrierName} • ${segment.carrierCode}-${segment.flightNumber} • $segDuration',
                                            style: const TextStyle(
                                              color: Color(0xFF475569),
                                              fontSize: 11.5,
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),

                            // 3. Arrival Point Row
                            Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Column(
                                  children: [
                                    if (index < segments.length - 1 ||
                                        layoverDuration != null)
                                      Container(
                                        width: 2,
                                        height: 20,
                                        color: const Color(0xFFE2E8F0),
                                      ),
                                    Container(
                                      width: 8,
                                      height: 8,
                                      decoration: const BoxDecoration(
                                        color: Color(0xFFD97706),
                                        shape: BoxShape.circle,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    crossAxisAlignment:
                                        CrossAxisAlignment.center,
                                    children: [
                                      Expanded(
                                        child: Text(
                                          '$segArrTime - ${segment.arrival.cityName} (${segment.arrival.airportCode})',
                                          style: const TextStyle(
                                            color: Color(0xFF0F172A),
                                            fontSize: 13,
                                            fontWeight: FontWeight.bold,
                                          ),
                                          maxLines: 2,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Text(
                                        segArrDate,
                                        style: const TextStyle(
                                          color: Color(0xFF64748B),
                                          fontSize: 11,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),

                            // 4. Layover Row
                            if (layoverDuration != null) ...[
                              Padding(
                                padding: const EdgeInsets.symmetric(
                                  vertical: 8,
                                ),
                                child: Row(
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  children: [
                                    Column(
                                      children: [
                                        Container(
                                          width: 2,
                                          height: 36,
                                          color: const Color(0xFFF59E0B),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(width: 18),
                                    Expanded(
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 10,
                                          vertical: 6,
                                        ),
                                        decoration: BoxDecoration(
                                          color: const Color(0xFFFFFBEB),
                                          borderRadius: BorderRadius.circular(
                                            6,
                                          ),
                                          border: Border.all(
                                            color: const Color(0xFFFEF3C7),
                                          ),
                                        ),
                                        child: Row(
                                          children: [
                                            const Icon(
                                              Icons.access_time_rounded,
                                              size: 13,
                                              color: Color(0xFFB45309),
                                            ),
                                            const SizedBox(width: 6),
                                            Expanded(
                                              child: Text(
                                                l10n.flightLayover(
                                                  _formatLayover(
                                                    layoverDuration,
                                                  ),
                                                  segment.arrival.cityName ??
                                                      segment
                                                          .arrival
                                                          .airportCode,
                                                ),
                                                style: const TextStyle(
                                                  color: Color(0xFFB45309),
                                                  fontSize: 11,
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ],
                        );
                      }),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }
}
