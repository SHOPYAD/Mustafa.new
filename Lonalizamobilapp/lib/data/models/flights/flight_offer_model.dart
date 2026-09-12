import 'package:flutter/foundation.dart';
import '../../../domain/entities/flights/flight_offer.dart';
import 'catalog_airline_model.dart';
import 'flight_search_loyalty_model.dart';
class FlightEndpointModel extends FlightEndpoint {
  const FlightEndpointModel({
    required super.airportCode,
    required super.dateTime,
    super.airportName,
    super.cityName,
    super.terminal,
  });

  factory FlightEndpointModel.fromJson(Map<String, dynamic> json) {
    return FlightEndpointModel(
      airportCode: json['airportCode'] as String? ?? '',
      dateTime: _parseDateTime(json['dateTime'] as String?),
      airportName: json['airportName'] as String?,
      cityName: json['cityName'] as String?,
      terminal: json['terminal'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
        'airportCode': airportCode,
        'dateTime': dateTime.toIso8601String(),
        if (airportName != null) 'airportName': airportName,
        if (cityName != null) 'cityName': cityName,
        if (terminal != null) 'terminal': terminal,
      };

  static DateTime _parseDateTime(String? dtString) {
    if (dtString == null || dtString.isEmpty) return DateTime.now();
    
    // Check if it starts with an epoch timestamp (10 to 13 digits)
    final match = RegExp(r'^(\d{10,13})').firstMatch(dtString);
    if (match != null) {
      final tsStr = match.group(1)!;
      final parsed = int.tryParse(tsStr);
      if (parsed != null) {
        if (tsStr.length == 10) {
          return DateTime.fromMillisecondsSinceEpoch(parsed * 1000);
        } else {
          return DateTime.fromMillisecondsSinceEpoch(parsed);
        }
      }
    }

    String normalized = dtString.replaceAll(' ', 'T');
    if (normalized.split(':').length == 2) {
      normalized += ':00';
    }
    return DateTime.tryParse(normalized) ?? DateTime.now();
  }
}

class BaggageAllowanceModel extends BaggageAllowance {
  const BaggageAllowanceModel({
    required super.checkedBags,
    super.weightKg,
    super.dimensions,
  });

  factory BaggageAllowanceModel.fromJson(Map<String, dynamic> json) {
    return BaggageAllowanceModel(
      checkedBags: json['checkedBags'] as int? ?? 0,
      weightKg: json['weightKg'] as int?,
      dimensions: json['dimensions'] as String?,
    );
  }
  
  Map<String, dynamic> toJson() => {
        'checkedBags': checkedBags,
        if (weightKg != null) 'weightKg': weightKg,
        if (dimensions != null) 'dimensions': dimensions,
      };
}

class FlightSegmentModel extends FlightSegment {
  const FlightSegmentModel({
    super.segmentId,
    required super.carrierCode,
    required super.carrierName,
    required super.flightNumber,
    super.aircraftType,
    super.cabinClass,
    super.bookingClass,
    super.durationMinutes,
    required super.departure,
    required super.arrival,
    super.baggageAllowance,
    super.airline,
  });

  factory FlightSegmentModel.fromJson(Map<String, dynamic> json) {
    final baggageJson = json['baggageAllowance'];
    return FlightSegmentModel(
      segmentId: json['segmentId'] as String?,
      carrierCode: json['carrierCode'] as String? ?? '',
      carrierName: json['carrierName'] as String? ?? '',
      flightNumber: json['flightNumber'] as String? ?? '',
      aircraftType: json['aircraftType'] as String?,
      cabinClass: json['cabinClass'] as String?,
      bookingClass: json['bookingClass'] as String?,
      durationMinutes: json['durationMinutes'] as int?,
      departure: FlightEndpointModel.fromJson(
        json['departure'] is Map
            ? Map<String, dynamic>.from(json['departure'] as Map)
            : {},
      ),
      arrival: FlightEndpointModel.fromJson(
        json['arrival'] is Map
            ? Map<String, dynamic>.from(json['arrival'] as Map)
            : {},
      ),
      baggageAllowance: baggageJson is Map
          ? BaggageAllowanceModel.fromJson(
              Map<String, dynamic>.from(baggageJson),
            )
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        if (segmentId != null) 'segmentId': segmentId,
        'carrierCode': carrierCode,
        'carrierName': carrierName,
        'flightNumber': flightNumber,
        if (aircraftType != null) 'aircraftType': aircraftType,
        if (cabinClass != null) 'cabinClass': cabinClass,
        if (bookingClass != null) 'bookingClass': bookingClass,
        if (durationMinutes != null) 'durationMinutes': durationMinutes,
        'departure': (departure as FlightEndpointModel).toJson(),
        'arrival': (arrival as FlightEndpointModel).toJson(),
        if (baggageAllowance != null) 'baggageAllowance': (baggageAllowance as BaggageAllowanceModel).toJson(),
      };
}

class FlightItineraryModel extends FlightItinerary {
  FlightItineraryModel({
    super.direction,
    super.durationMinutes,
    super.stops,
    required super.segments,
  });

  factory FlightItineraryModel.fromJson(Map<String, dynamic> json) {
    final segmentsList = json['segments'] as List<dynamic>? ?? [];
    return FlightItineraryModel(
      direction: json['direction'] as String?,
      durationMinutes: json['durationMinutes'] as int?,
      stops: json['stops'] as int?,
      segments: segmentsList
          .map(
            (e) => FlightSegmentModel.fromJson(
              e is Map ? Map<String, dynamic>.from(e as Map) : {},
            ),
          )
          .toList(),
    );
  }

  Map<String, dynamic> toJson() => {
        if (direction != null) 'direction': direction,
        if (durationMinutes != null) 'durationMinutes': durationMinutes,
        if (stops != null) 'stops': stops,
        'segments': segments.map((e) => (e as FlightSegmentModel).toJson()).toList(),
      };
}

class FlightPricingModel extends FlightPricing {
  const FlightPricingModel({
    super.raw,
    super.baseFare,
    super.taxes,
    super.markup,
    super.markupPercentage,
    required super.total,
    required super.currency,
  });

  factory FlightPricingModel.fromJson(Map<String, dynamic> json) {
    return FlightPricingModel(
      raw: (json['raw'] as num?)?.toDouble(),
      baseFare: (json['baseFare'] as num?)?.toDouble(),
      taxes: (json['taxes'] as num?)?.toDouble(),
      markup: (json['markup'] as num?)?.toDouble(),
      markupPercentage: (json['markupPercentage'] as num?)?.toDouble(),
      total: (json['total'] as num?)?.toDouble() ?? 0.0,
      currency: json['currency'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
        if (raw != null) 'raw': raw,
        if (baseFare != null) 'baseFare': baseFare,
        if (taxes != null) 'taxes': taxes,
        if (markup != null) 'markup': markup,
        if (markupPercentage != null) 'markupPercentage': markupPercentage,
        'total': total,
        'currency': currency,
      };
}

class FlightProviderBrandMetaModel extends FlightProviderBrandMeta {
  const FlightProviderBrandMetaModel({
    super.accentColor,
    super.iconUrl,
    super.shortLabel,
  });

  factory FlightProviderBrandMetaModel.fromJson(Map<String, dynamic> json) {
    return FlightProviderBrandMetaModel(
      accentColor: json['accentColor'] as String?,
      iconUrl: json['iconUrl'] as String?,
      shortLabel: json['shortLabel'] as String?,
    );
  }
  
  Map<String, dynamic> toJson() => {
    if (accentColor != null) 'accentColor': accentColor,
    if (iconUrl != null) 'iconUrl': iconUrl,
    if (shortLabel != null) 'shortLabel': shortLabel,
  };
}

class FlightBookingCapabilitiesModel extends FlightBookingCapabilities {
  const FlightBookingCapabilitiesModel({
    super.supportsInteractiveSeatMap,
    super.supportsPaidSeatSelections,
    super.supportsProviderAncillaryCatalog,
    super.supportsCommercialTravelAddons,
    super.supportsProviderPaidBaggageUpsell,
    super.contentSource,
    super.seatCapabilityCode,
  });

  factory FlightBookingCapabilitiesModel.fromJson(Map<String, dynamic> json) {
    return FlightBookingCapabilitiesModel(
      supportsInteractiveSeatMap: json['supportsInteractiveSeatMap'] as bool?,
      supportsPaidSeatSelections: json['supportsPaidSeatSelections'] as bool?,
      supportsProviderAncillaryCatalog: json['supportsProviderAncillaryCatalog'] as bool?,
      supportsCommercialTravelAddons: json['supportsCommercialTravelAddons'] as bool?,
      supportsProviderPaidBaggageUpsell: json['supportsProviderPaidBaggageUpsell'] as bool?,
      contentSource: json['contentSource'] as String?,
      seatCapabilityCode: json['seatCapabilityCode'] as String?,
    );
  }
  
  Map<String, dynamic> toJson() => {
    if (supportsInteractiveSeatMap != null) 'supportsInteractiveSeatMap': supportsInteractiveSeatMap,
    if (supportsPaidSeatSelections != null) 'supportsPaidSeatSelections': supportsPaidSeatSelections,
    if (supportsProviderAncillaryCatalog != null) 'supportsProviderAncillaryCatalog': supportsProviderAncillaryCatalog,
    if (supportsCommercialTravelAddons != null) 'supportsCommercialTravelAddons': supportsCommercialTravelAddons,
    if (supportsProviderPaidBaggageUpsell != null) 'supportsProviderPaidBaggageUpsell': supportsProviderPaidBaggageUpsell,
    if (contentSource != null) 'contentSource': contentSource,
    if (seatCapabilityCode != null) 'seatCapabilityCode': seatCapabilityCode,
  };
}

class FlightFareVariantModel extends FlightFareVariant {
  const FlightFareVariantModel({
    required super.fareKey,
    super.fareBrand,
    super.refundableInfo,
    super.canRefund,
    super.canExchange,
    super.cabinBagDesc,
    super.checkedBagDesc,
    super.personalItemDesc,
    super.cancelPenaltyAmount,
    super.changePenaltyAmount,
    super.penaltyCurrency,
    super.seatSelectionIncluded,
    super.mealIncluded,
    super.isBestPrice,
    super.bookingOfferCacheId,
    super.bookingProviderCode,
    super.bookingProviderOfferId,
    required super.pricing,
  });

  factory FlightFareVariantModel.fromJson(Map<String, dynamic> json) {
    return FlightFareVariantModel(
      fareKey: json['fareKey'] as String? ?? '',
      fareBrand: json['fareBrand'] as String?,
      refundableInfo: json['refundableInfo'] as String?,
      canRefund: json['canRefund'] as bool?,
      canExchange: json['canExchange'] as bool?,
      cabinBagDesc: json['cabinBagDesc'] as String?,
      checkedBagDesc: json['checkedBagDesc'] as String?,
      personalItemDesc: json['personalItemDesc'] as String?,
      cancelPenaltyAmount: (json['cancelPenaltyAmount'] as num?)?.toDouble(),
      changePenaltyAmount: (json['changePenaltyAmount'] as num?)?.toDouble(),
      penaltyCurrency: json['penaltyCurrency'] as String?,
      seatSelectionIncluded: json['seatSelectionIncluded'] as bool?,
      mealIncluded: json['mealIncluded'] as bool?,
      isBestPrice: json['isBestPrice'] as bool?,
      bookingOfferCacheId: json['bookingOfferCacheId'] as String?,
      bookingProviderCode: json['bookingProviderCode'] as String?,
      bookingProviderOfferId: json['bookingProviderOfferId'] as String?,
      pricing: FlightPricingModel.fromJson(
        json['pricing'] is Map ? Map<String, dynamic>.from(json['pricing'] as Map) : {},
      ),
    );
  }
  
  Map<String, dynamic> toJson() => {
    'fareKey': fareKey,
    if (fareBrand != null) 'fareBrand': fareBrand,
    if (refundableInfo != null) 'refundableInfo': refundableInfo,
    if (canRefund != null) 'canRefund': canRefund,
    if (canExchange != null) 'canExchange': canExchange,
    if (cabinBagDesc != null) 'cabinBagDesc': cabinBagDesc,
    if (checkedBagDesc != null) 'checkedBagDesc': checkedBagDesc,
    if (personalItemDesc != null) 'personalItemDesc': personalItemDesc,
    if (cancelPenaltyAmount != null) 'cancelPenaltyAmount': cancelPenaltyAmount,
    if (changePenaltyAmount != null) 'changePenaltyAmount': changePenaltyAmount,
    if (penaltyCurrency != null) 'penaltyCurrency': penaltyCurrency,
    if (seatSelectionIncluded != null) 'seatSelectionIncluded': seatSelectionIncluded,
    if (mealIncluded != null) 'mealIncluded': mealIncluded,
    if (isBestPrice != null) 'isBestPrice': isBestPrice,
    if (bookingOfferCacheId != null) 'bookingOfferCacheId': bookingOfferCacheId,
    if (bookingProviderCode != null) 'bookingProviderCode': bookingProviderCode,
    if (bookingProviderOfferId != null) 'bookingProviderOfferId': bookingProviderOfferId,
    'pricing': (pricing as FlightPricingModel).toJson(),
  };
}

class FlightOfferModel extends FlightOffer {
  FlightOfferModel({
    required super.id,
    super.providerCode,
    super.providerBrand,
    super.providerOfferId,
    super.bookable = true,
    super.refundable = false,
    super.modifiable = false,
    super.ticketingDeadline,
    super.loyaltyProductId,
    super.seatsRemaining,
    super.bookingCapabilities,
    required super.pricing,
    required super.itineraries,
    super.firstSegment,
    super.fareVariants = const [],
  });

  factory FlightOfferModel.fromJson(Map<String, dynamic> json) {
    final itinerariesList = json['itineraries'] as List<dynamic>? ?? [];
    final fareVariantsList = json['fareVariants'] as List<dynamic>? ?? [];
    
    final pBrand = json['providerBrand'];
    final bCaps = json['bookingCapabilities'];
    final fSeg = json['firstSegment'];
    
    return FlightOfferModel(
      id: json['id'] as String? ?? '',
      providerCode: json['providerCode'] as String?,
      providerBrand: pBrand is Map ? FlightProviderBrandMetaModel.fromJson(Map<String, dynamic>.from(pBrand)) : null,
      providerOfferId: json['providerOfferId'] as String?,
      bookable: json['bookable'] as bool? ?? true,
      refundable: json['refundable'] as bool? ?? false,
      modifiable: json['modifiable'] as bool? ?? false,
      ticketingDeadline: json['ticketingDeadline'] != null ? DateTime.tryParse(json['ticketingDeadline'].toString()) : null,
      loyaltyProductId: json['loyaltyProductId'] as String?,
      seatsRemaining: json['seatsRemaining'] as int?,
      bookingCapabilities: bCaps is Map ? FlightBookingCapabilitiesModel.fromJson(Map<String, dynamic>.from(bCaps)) : null,
      pricing: FlightPricingModel.fromJson(
        json['pricing'] is Map
            ? Map<String, dynamic>.from(json['pricing'] as Map)
            : {},
      ),
      itineraries: itinerariesList
          .map(
            (e) => FlightItineraryModel.fromJson(
              e is Map ? Map<String, dynamic>.from(e as Map) : {},
            ),
          )
          .toList(),
      firstSegment: fSeg is Map ? FlightSegmentModel.fromJson(Map<String, dynamic>.from(fSeg)) : null,
      fareVariants: fareVariantsList
          .map(
            (e) => FlightFareVariantModel.fromJson(
              e is Map ? Map<String, dynamic>.from(e as Map) : {},
            ),
          )
          .toList(),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        if (providerCode != null) 'providerCode': providerCode,
        if (providerBrand != null) 'providerBrand': (providerBrand as FlightProviderBrandMetaModel).toJson(),
        if (providerOfferId != null) 'providerOfferId': providerOfferId,
        'bookable': bookable,
        'refundable': refundable,
        'modifiable': modifiable,
        if (ticketingDeadline != null) 'ticketingDeadline': ticketingDeadline!.toIso8601String(),
        if (loyaltyProductId != null) 'loyaltyProductId': loyaltyProductId,
        if (seatsRemaining != null) 'seatsRemaining': seatsRemaining,
        if (bookingCapabilities != null) 'bookingCapabilities': (bookingCapabilities as FlightBookingCapabilitiesModel).toJson(),
        'pricing': (pricing as FlightPricingModel).toJson(),
        'itineraries': itineraries.map((e) => (e as FlightItineraryModel).toJson()).toList(),
        if (firstSegment != null) 'firstSegment': (firstSegment as FlightSegmentModel).toJson(),
        if (fareVariants.isNotEmpty) 'fareVariants': fareVariants.map((e) => (e as FlightFareVariantModel).toJson()).toList(),
      };
}

class FlightSearchMetaModel extends FlightSearchMeta {
  const FlightSearchMetaModel({
    required super.totalResults,
    required super.searchDurationMs,
    required super.traceId,
    super.rawOffersBeforeDedupe,
  });

  factory FlightSearchMetaModel.fromJson(Map<String, dynamic> json) {
    return FlightSearchMetaModel(
      totalResults: json['totalResults'] as int? ?? 0,
      searchDurationMs: json['searchDurationMs'] as int? ?? 0,
      traceId: json['traceId'] as String? ?? '',
      rawOffersBeforeDedupe: json['rawOffersBeforeDedupe'] as int?,
    );
  }

  Map<String, dynamic> toJson() => {
        'totalResults': totalResults,
        'searchDurationMs': searchDurationMs,
        'traceId': traceId,
        if (rawOffersBeforeDedupe != null) 'rawOffersBeforeDedupe': rawOffersBeforeDedupe,
      };
}

class FlightSearchResponseModel extends FlightSearchResponse {
  const FlightSearchResponseModel({
    required super.source,
    required super.meta,
    required super.offers,
    required super.airlines,
    required super.loyalty,
  });

  factory FlightSearchResponseModel.fromJson(Map<String, dynamic> json) {

    return FlightSearchResponseModel(
      source: json['source'] as String? ?? '',
      meta: FlightSearchMetaModel.fromJson(
        json['meta'] is Map ? Map<String, dynamic>.from(json['meta'] as Map) : {},
      ),
      offers: (json['offers'] as List<dynamic>? ?? [])
          .map(
            (e) => FlightOfferModel.fromJson(
              e is Map ? Map<String, dynamic>.from(e as Map) : {},
            ),
          )
          .toList(),
      airlines: (json['airlines'] as List<dynamic>? ?? [])
          .map(
            (e) => CatalogAirlineModel.fromJson(
              e is Map ? Map<String, dynamic>.from(e as Map) : {},
            ),
          )
          .toList(),
      loyalty: FlightSearchLoyaltyModel.fromJson(
        json['loyalty'] is Map
            ? Map<String, dynamic>.from(json['loyalty'] as Map)
            : {},
      ),
    );
  }

  Map<String, dynamic> toJson() => {
        'source': source,
        'meta': (meta as FlightSearchMetaModel).toJson(),
        'offers': offers.map((e) => (e as FlightOfferModel).toJson()).toList(),
        'airlines': airlines.map((e) => (e as CatalogAirlineModel).toJson()).toList(),
        'loyalty': (loyalty as FlightSearchLoyaltyModel).toJson(),
      };
}
