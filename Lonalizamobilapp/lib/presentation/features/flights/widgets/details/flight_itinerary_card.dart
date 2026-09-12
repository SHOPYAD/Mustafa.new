import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:liotrip/core/extensions/context_l10n.dart';
import 'package:liotrip/core/utils/helper.dart';
import 'package:liotrip/domain/entities/flights/flight_offer.dart';
import 'package:liotrip/l10n/app_localizations.dart';

class FlightItineraryCard extends StatelessWidget {
  const FlightItineraryCard({super.key, this.offer});

  final FlightOffer? offer;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final locale = Localizations.localeOf(context).toString();

    final itinerary = offer?.itineraries.isNotEmpty == true
        ? offer!.itineraries.first
        : null;
    final segments = itinerary?.segments ?? [];

    final firstSeg = segments.isNotEmpty ? segments.first : null;
    final lastSeg = segments.isNotEmpty ? segments.last : null;

    final originCode = firstSeg?.departure.airportCode ?? 'CZL';
    final destCode = lastSeg?.arrival.airportCode ?? 'IST';
    final durationStr = itinerary?.formattedDuration ?? '3h 10m';

    final String stopSummary;
    if (segments.length > 1) {
      stopSummary = l10n.flightStopVia(
          segments.length - 1, segments.first.arrival.airportCode);
    } else {
      stopSummary = l10n.flightNonstop;
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // 1. Header
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                l10n.flightOutbound,
                style: const TextStyle(
                  color: Color(0xFF111827),
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.5,
                ),
              ),
              Text(
                '$originCode ➔ $destCode • $durationStr • $stopSummary',
                style: const TextStyle(
                  color: Color(0xFF9CA3AF),
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 4),

        // 2. Segment cards + layover badges
        if (segments.isEmpty)
          _buildSegmentCard(
            l10n: l10n,
            locale: locale,
            carrierName: 'Turkish Airlines',
            carrierCode: 'TK',
            flightNumber: '1412',
            depTime: '13:55',
            depCode: 'CZL',
            depCity: 'Constantine',
            depTerminal: null,
            depDateStr: '21 May 2026',
            arrTime: '19:05',
            arrCode: 'IST',
            arrCity: 'Istanbul',
            arrTerminal: null,
            arrDateStr: '21 May 2026',
            aircraftCode: '73H',
            cabinClassStr: l10n.flightEconomy,
            durationStr: '3h 10m',
          )
        else
          ...List.generate(segments.length, (index) {
            final seg = segments[index];

            String fmtDate(DateTime dt) {
              try {
                return DateFormat('dd MMM yyyy', locale).format(dt);
              } catch (_) {
                return DateFormat('dd MMM yyyy').format(dt);
              }
            }

            final segDur = seg.durationMinutes != null
                ? Helper.formatDurationMinutes(seg.durationMinutes!)
                : '–';

            final cardWidget = _buildSegmentCard(
              l10n: l10n,
              locale: locale,
              carrierName: seg.carrierName,
              carrierCode: seg.carrierCode,
              flightNumber: seg.flightNumber,
              depTime: DateFormat('HH:mm').format(seg.departure.dateTime),
              depCode: seg.departure.airportCode,
              depCity:
                  seg.departure.cityName ?? seg.departure.airportCode,
              depTerminal: seg.departure.terminal,
              depDateStr: fmtDate(seg.departure.dateTime),
              arrTime: DateFormat('HH:mm').format(seg.arrival.dateTime),
              arrCode: seg.arrival.airportCode,
              arrCity: seg.arrival.cityName ?? seg.arrival.airportCode,
              arrTerminal: seg.arrival.terminal,
              arrDateStr: fmtDate(seg.arrival.dateTime),
              aircraftCode: seg.aircraftType ?? '–',
              cabinClassStr: seg.cabinClass ?? l10n.flightEconomy,
              durationStr: segDur,
            );

            if (index < segments.length - 1) {
              final nextSeg = segments[index + 1];
              final layoverMinutes = nextSeg.departure.dateTime
                  .difference(seg.arrival.dateTime)
                  .inMinutes;
              final durStr =
                  Helper.formatLayoverDuration(layoverMinutes);
              final layoverCode = seg.arrival.airportCode;

              return Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  cardWidget,
                  Container(
                    margin:
                        const EdgeInsets.symmetric(vertical: 12),
                    alignment: Alignment.center,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF5F3FF),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                            color: const Color(0xFFDDD6FE),
                            width: 0.5),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.schedule_rounded,
                              size: 14,
                              color: Color(0xFF5B21B6)),
                          const SizedBox(width: 6),
                          Text(
                            l10n.flightLayover(
                                durStr, layoverCode),
                            style: const TextStyle(
                              color: Color(0xFF5B21B6),
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              );
            }

            return cardWidget;
          }),
      ],
    );
  }

  Widget _buildSegmentCard({
    required AppLocalizations l10n,
    required String locale,
    required String carrierName,
    required String carrierCode,
    required String flightNumber,
    required String depTime,
    required String depCode,
    required String depCity,
    required String? depTerminal,
    required String depDateStr,
    required String arrTime,
    required String arrCode,
    required String arrCity,
    required String? arrTerminal,
    required String arrDateStr,
    required String aircraftCode,
    required String cabinClassStr,
    required String durationStr,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Airline name + flight badge + dash
                Row(
                  children: [
                    Text(
                      carrierName,
                      style: const TextStyle(
                        color: Color(0xFF1F2937),
                        fontWeight: FontWeight.w700,
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF3F4F6),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                            color: const Color(0xFFE5E7EB),
                            width: 0.5),
                      ),
                      child: Text(
                        '$carrierCode $flightNumber',
                        style: const TextStyle(
                          color: Color(0xFF6B7280),
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    const Spacer(),
                    const Text(
                      '–',
                      style: TextStyle(
                          color: Color(0xFF9CA3AF),
                          fontSize: 14,
                          fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // Departure ✈ Arrival
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(depTime,
                              style: const TextStyle(
                                  color: Color(0xFF111827),
                                  fontSize: 20,
                                  fontWeight: FontWeight.w800)),
                          const SizedBox(height: 2),
                          Text(depCode,
                              style: const TextStyle(
                                  color: Color(0xFF111827),
                                  fontSize: 14,
                                  fontWeight: FontWeight.w800)),
                          const SizedBox(height: 4),
                          Text(depCity,
                              style: const TextStyle(
                                  color: Color(0xFF6B7280),
                                  fontSize: 13,
                                  fontWeight: FontWeight.w500)),
                          if (depTerminal != null &&
                              depTerminal.isNotEmpty) ...[
                            const SizedBox(height: 2),
                            Text(l10n.flightTerminal(depTerminal),
                                style: const TextStyle(
                                    color: Color(0xFF9CA3AF),
                                    fontSize: 11,
                                    fontWeight: FontWeight.w500)),
                          ],
                          const SizedBox(height: 4),
                          Text(depDateStr,
                              style: const TextStyle(
                                  color: Color(0xFF9CA3AF),
                                  fontSize: 11,
                                  fontWeight: FontWeight.w500)),
                        ],
                      ),
                    ),
                    const Padding(
                      padding: EdgeInsets.symmetric(
                          horizontal: 16, vertical: 12),
                      child: Icon(Icons.flight_takeoff_rounded,
                          color: Color(0xFF5B21B6), size: 22),
                    ),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(arrTime,
                              style: const TextStyle(
                                  color: Color(0xFF111827),
                                  fontSize: 20,
                                  fontWeight: FontWeight.w800)),
                          const SizedBox(height: 2),
                          Text(arrCode,
                              style: const TextStyle(
                                  color: Color(0xFF111827),
                                  fontSize: 14,
                                  fontWeight: FontWeight.w800)),
                          const SizedBox(height: 4),
                          Text(arrCity,
                              style: const TextStyle(
                                  color: Color(0xFF6B7280),
                                  fontSize: 13,
                                  fontWeight: FontWeight.w500)),
                          if (arrTerminal != null &&
                              arrTerminal.isNotEmpty) ...[
                            const SizedBox(height: 2),
                            Text(l10n.flightTerminal(arrTerminal),
                                style: const TextStyle(
                                    color: Color(0xFF9CA3AF),
                                    fontSize: 11,
                                    fontWeight: FontWeight.w500)),
                          ],
                          const SizedBox(height: 4),
                          Text(arrDateStr,
                              style: const TextStyle(
                                  color: Color(0xFF9CA3AF),
                                  fontSize: 11,
                                  fontWeight: FontWeight.w500)),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),

          // Dotted divider
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: _DottedDivider(),
          ),

          // Aircraft & cabin
          Padding(
            padding: const EdgeInsets.symmetric(
                horizontal: 16, vertical: 12),
            child: Row(
              children: [
                const Icon(Icons.flight_rounded,
                    size: 16, color: Color(0xFF6B7280)),
                const SizedBox(width: 6),
                Text(aircraftCode,
                    style: const TextStyle(
                        color: Color(0xFF4B5563),
                        fontSize: 13,
                        fontWeight: FontWeight.w600)),
                const SizedBox(width: 16),
                const Icon(Icons.airline_seat_recline_normal_rounded,
                    size: 16, color: Color(0xFF6B7280)),
                const SizedBox(width: 6),
                Text(cabinClassStr,
                    style: const TextStyle(
                        color: Color(0xFF4B5563),
                        fontSize: 13,
                        fontWeight: FontWeight.w600)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _DottedDivider extends StatelessWidget {
  const _DottedDivider();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 1,
      child: LayoutBuilder(
        builder: (context, constraints) {
          final boxWidth = constraints.constrainWidth();
          const dashWidth = 4.0;
          const dashSpace = 4.0;
          final dashCount =
              (boxWidth / (dashWidth + dashSpace)).floor();
          return Flex(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            direction: Axis.horizontal,
            children: List.generate(dashCount, (_) {
              return const SizedBox(
                width: dashWidth,
                height: 1,
                child: DecoratedBox(
                  decoration:
                      BoxDecoration(color: Color(0xFFE5E7EB)),
                ),
              );
            }),
          );
        },
      ),
    );
  }
}
