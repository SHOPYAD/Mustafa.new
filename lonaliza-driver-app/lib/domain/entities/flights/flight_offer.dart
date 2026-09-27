import 'package:lonaliza_driver/core/utils/helper.dart';
import 'catalog_airline.dart';
import 'flight_search_loyalty.dart';

/// Represents the endpoint of a flight segment (Departure or Arrival)
class FlightEndpoint {
  const FlightEndpoint({
    required this.airportCode,
    required this.dateTime,
    this.airportName,
    this.cityName,
    this.terminal,
  });

  final String airportCode;
  final DateTime dateTime;
  final String? airportName;
  final String? cityName;
  final String? terminal;
}

/// Baggage allowance for a segment
class BaggageAllowance {
  const BaggageAllowance({
    required this.checkedBags,
    this.weightKg,
    this.dimensions,
  });

  final int checkedBags;
  final int? weightKg;
  final String? dimensions;
}

/// Represents a single flight segment
class FlightSegment {
  const FlightSegment({
    this.segmentId,
    required this.carrierCode,
    required this.carrierName,
    required this.flightNumber,
    this.aircraftType,
    this.cabinClass,
    this.bookingClass,
    this.durationMinutes,
    required this.departure,
    required this.arrival,
    this.baggageAllowance,
    this.airline, // Injected by repository
  });

  final String? segmentId;
  final String carrierCode;
  final String carrierName;
  final String flightNumber;
  final String? aircraftType;
  final String? cabinClass;
  final String? bookingClass;
  final int? durationMinutes;
  final FlightEndpoint departure;
  final FlightEndpoint arrival;
  final BaggageAllowance? baggageAllowance;
  final CatalogAirline? airline;
}

/// Represents an itinerary (outbound or inbound trip)
class FlightItinerary {
  FlightItinerary({
    this.direction,
    this.durationMinutes,
    this.stops,
    required this.segments,
  });

  final String? direction;
  final int? durationMinutes;
  final int? stops;
  final List<FlightSegment> segments;

  // ── Computed once, cached forever ────────────────────────────────────────
  late final String formattedDuration = Helper.calcItineraryDuration(
    durationMinutes,
    segments.isNotEmpty ? segments.first : null,
    segments.isNotEmpty ? segments.last : null,
  );

  late final int effectiveDurationMinutes = () {
    final dur = durationMinutes ?? 0;
    if (dur > 0) return dur;
    if (segments.isNotEmpty) {
      final first = segments.first.departure.dateTime;
      final last = segments.last.arrival.dateTime;
      return last.difference(first).inMinutes;
    }
    return 0;
  }();

  late final int stopsCount =
      stops ?? (segments.isNotEmpty ? segments.length - 1 : 0);

  late final String stopsString = Helper.calcStopsString(stopsCount, segments);

  late final int maxLayoverMinutes = Helper.calcMaxLayoverMinutes(segments);

  late final String? layoverString = maxLayoverMinutes > 0
      ? Helper.formatLayover(maxLayoverMinutes)
      : null;
}

/// Pricing information for an offer or fare variant
class FlightPricing {
  const FlightPricing({
    this.raw,
    this.baseFare,
    this.taxes,
    this.markup,
    this.markupPercentage,
    required this.total,
    required this.currency,
  });

  final double? raw;
  final double? baseFare;
  final double? taxes;
  final double? markup;
  final double? markupPercentage;
  final double total;
  final String currency;
}

/// Brand meta information for a provider
class FlightProviderBrandMeta {
  const FlightProviderBrandMeta({
    this.accentColor,
    this.iconUrl,
    this.shortLabel,
  });

  final String? accentColor;
  final String? iconUrl;
  final String? shortLabel;
}

/// Booking capabilities for an offer
class FlightBookingCapabilities {
  const FlightBookingCapabilities({
    this.supportsInteractiveSeatMap,
    this.supportsPaidSeatSelections,
    this.supportsProviderAncillaryCatalog,
    this.supportsCommercialTravelAddons,
    this.supportsProviderPaidBaggageUpsell,
    this.contentSource,
    this.seatCapabilityCode,
  });

  final bool? supportsInteractiveSeatMap;
  final bool? supportsPaidSeatSelections;
  final bool? supportsProviderAncillaryCatalog;
  final bool? supportsCommercialTravelAddons;
  final bool? supportsProviderPaidBaggageUpsell;
  final String? contentSource;
  final String? seatCapabilityCode;
}

/// Fare variant for an offer
class FlightFareVariant {
  const FlightFareVariant({
    required this.fareKey,
    this.fareBrand,
    this.refundableInfo,
    this.canRefund,
    this.canExchange,
    this.cabinBagDesc,
    this.checkedBagDesc,
    this.personalItemDesc,
    this.cancelPenaltyAmount,
    this.changePenaltyAmount,
    this.penaltyCurrency,
    this.seatSelectionIncluded,
    this.mealIncluded,
    this.isBestPrice,
    this.bookingOfferCacheId,
    this.bookingProviderCode,
    this.bookingProviderOfferId,
    required this.pricing,
  });

  final String fareKey;
  final String? fareBrand;
  final String? refundableInfo;
  final bool? canRefund;
  final bool? canExchange;
  final String? cabinBagDesc;
  final String? checkedBagDesc;
  final String? personalItemDesc;
  final double? cancelPenaltyAmount;
  final double? changePenaltyAmount;
  final String? penaltyCurrency;
  final bool? seatSelectionIncluded;
  final bool? mealIncluded;
  final bool? isBestPrice;
  final String? bookingOfferCacheId;
  final String? bookingProviderCode;
  final String? bookingProviderOfferId;
  final FlightPricing pricing;
}

/// A complete flight offer returned by the search
class FlightOffer {
  FlightOffer({
    required this.id,
    this.providerCode,
    this.providerBrand,
    this.providerOfferId,
    this.bookable = true,
    this.refundable = false,
    this.modifiable = false,
    this.ticketingDeadline,
    this.loyaltyProductId,
    this.seatsRemaining,
    this.bookingCapabilities,
    required this.pricing,
    required this.itineraries,
    this.firstSegment,
    this.fareVariants = const [],
  });

  final String id;
  final String? providerCode;
  final FlightProviderBrandMeta? providerBrand;
  final String? providerOfferId;
  final bool bookable;
  final bool refundable;
  final bool modifiable;
  final DateTime? ticketingDeadline;
  final String? loyaltyProductId;
  final int? seatsRemaining;
  final FlightBookingCapabilities? bookingCapabilities;
  final FlightPricing pricing;
  final List<FlightItinerary> itineraries;
  final FlightSegment? firstSegment;
  final List<FlightFareVariant> fareVariants;

  // ── Computed once, cached forever ────────────────────────────────────────
  late final double displayPrice = Helper.calcBestPrice(
    fareVariants,
    pricing.total,
  );

  late final String formattedPrice =
      '${pricing.currency} ${displayPrice.toStringAsFixed(2)}';

  late final FlightFareVariant? defaultVariant = Helper.calcDefaultVariant(
    fareVariants,
  );

  late final int fareOptionsCount = fareVariants
      .map((v) => v.fareKey)
      .toSet()
      .length;
}

/// Meta information about the search
class FlightSearchMeta {
  const FlightSearchMeta({
    required this.totalResults,
    required this.searchDurationMs,
    required this.traceId,
    this.rawOffersBeforeDedupe,
  });

  final int totalResults;
  final int searchDurationMs;
  final String traceId;
  final int? rawOffersBeforeDedupe;
}

/// The main response containing all offers
class FlightSearchResponse {
  const FlightSearchResponse({
    required this.source,
    required this.meta,
    required this.offers,
    required this.airlines,
    required this.loyalty,
  });

  final String source;
  final FlightSearchMeta meta;
  final List<FlightOffer> offers;
  final List<CatalogAirline> airlines;
  final FlightSearchLoyalty loyalty;
}
