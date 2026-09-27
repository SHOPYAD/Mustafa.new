import re
import sys

def main():
    path = r'e:\flutterfly\liotrip\lib\presentation\features\flights\widgets\search\flights_search_result_card.dart'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove FlightsSearchResult class entirely
    content = re.sub(r'class FlightsSearchResult \{.*?\n\}\n\n', '', content, flags=re.DOTALL)

    # 2. Update FlightsSearchResultCard
    header_old = """class FlightsSearchResultCard extends ConsumerWidget {
  const FlightsSearchResultCard({super.key, required this.result});

  final FlightsSearchResult result;

  @override
  Widget build(BuildContext context, WidgetRef ref) {"""

    header_new = """import '../../../../domain/entities/flights/flight_offer.dart';
import '../../../../domain/entities/flights/catalog_airline.dart';

class FlightsSearchResultCard extends ConsumerWidget {
  const FlightsSearchResultCard({super.key, required this.offer, this.airline});

  final FlightOffer offer;
  final CatalogAirline? airline;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final itinerary = offer.itineraries.isNotEmpty ? offer.itineraries.first : null;
    final segments = itinerary?.segments ?? [];
    final firstSegment = segments.isNotEmpty ? segments.first : null;
    final lastSegment = segments.isNotEmpty ? segments.last : null;

    final diff = firstSegment != null && lastSegment != null
        ? lastSegment.arrival.dateTime.difference(firstSegment.departure.dateTime)
        : const Duration();
    
    String duration = '';
    if (diff.inHours > 0) {
      duration = '${diff.inHours}h ${diff.inMinutes.remainder(60)}m';
    } else {
      duration = '${diff.inMinutes}m';
    }

    final isArabic = Localizations.localeOf(context).languageCode == 'ar';
    final airlineName = airline != null
        ? (isArabic && airline!.nameAr != null && airline!.nameAr!.isNotEmpty
            ? airline!.nameAr!
            : airline!.name)
        : (firstSegment?.carrierName ?? 'Unknown Airline');

    final departureTime = firstSegment != null ? DateFormat('HH:mm').format(firstSegment.departure.dateTime) : 'N/A';
    final departureDate = firstSegment != null ? DateFormat('dd MMM yyyy').format(firstSegment.departure.dateTime) : 'N/A';
    final departureAirport = firstSegment?.departure.airportCode ?? 'N/A';
    final departureCity = firstSegment?.departure.cityName;

    final arrivalTime = lastSegment != null ? DateFormat('HH:mm').format(lastSegment.arrival.dateTime) : 'N/A';
    final arrivalDate = lastSegment != null ? DateFormat('dd MMM yyyy').format(lastSegment.arrival.dateTime) : 'N/A';
    final arrivalAirport = lastSegment?.arrival.airportCode ?? 'N/A';
    final arrivalCity = lastSegment?.arrival.cityName;
    final arrivalDayOffset = 0;

    final stops = itinerary?.stops ?? (segments.isNotEmpty ? segments.length - 1 : 0);
    final price = '${offer.pricing.currency} ${offer.pricing.total.toStringAsFixed(2)}';
    final originalPrice = price;
    
    final airlineCode = firstSegment?.carrierCode ?? 'N/A';
    final flightNumber = firstSegment != null ? '${firstSegment.carrierCode}-${firstSegment.flightNumber}' : 'N/A';
    final flightClass = firstSegment?.cabinClass ?? 'Economy';
    
    final logoUrl = airline?.logoUrl;
    final airlineIcon = Icons.flight_rounded;
    final airlineIconColor = const Color(0xFF2F60F5);
    
    String? tagLabel;
    Color? tagColor;
    String? baggageLabel;
    String? carryOnLabel;
    bool departingSoon = false;
    String? co2Badge;
"""
    if header_old not in content:
        print("Error: header_old not found!")
        # Try to find exactly what it is
        return

    content = content.replace(header_old, header_new)

    # 3. Replace result. with empty (except for result.airline which becomes airlineName)
    content = content.replace('result.airline,', 'airlineName,')
    content = content.replace('result.airlineCode', 'airlineCode')
    content = content.replace('result.airlineIcon', 'airlineIcon')
    content = content.replace('result.airline\n', 'airlineName\n')
    content = content.replace('result.', '')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == "__main__":
    main()
