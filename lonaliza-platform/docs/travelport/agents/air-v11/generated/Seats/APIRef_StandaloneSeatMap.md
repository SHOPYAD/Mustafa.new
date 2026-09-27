# Standalone Seat Map API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Seats/APIRef_StandaloneSeatMap.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Standalone Seat Map API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Standalone Seat Map API&#160;Reference Request Response Example request Example response POST search/seat/catalogofferingsancillaries/seatavailabilities Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Seats Guide , Seat Book API Reference Standalone Seat Map sends flight criteria including a booking code to return a view-only seat map. Unlike the Seat Map request , Standalone Seat Map does not send any identifiers from a previously searched or priced flight. It is instead a full payload request and can be sent entirely on its own, either within or outside of a workbench session. To subsequently select a seat, you must send a Seat Book request in a workbench session to add the selected seat/s to the workbench. GDS only; not supported for NDC. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body Show Standalone Seat Map Request Body Table Object Description Required/Optional CatalogOfferingsQuerySeatAvailability Top level object. Required SeatAvailabilityOfferings Top level object. Send with @type value SeatAvailabilityOfferingsBuildFromProducts . Required ProductCriteriaAir Top level object for itinerary details. Includes SpecificFlightCriteria. Required SpecificFlightCriteria Array. Each instance sends details for one segment (aka flight) to return seats. Required carrier String. IATA code of airline carrier for flight. Required flightNumber String. Flight number assigned by airline. Required departureDate String. Departure date of flight in YYYY-MM-DD format (e.g., departureDate="2024-12-06") Required departureTime String. Departure time of flight. HH:MM:SS (24-hour) format (e.g., departureTime="18:00"). Required arrivalDate String. Arrival date of flight in YYYY-MM-DD format. Required arrivalTime String. Arrival time of flight in HH:MM:SS (24-hour) format. Required from String. IATA airport code of departure. Required to String. IATA airport code of arrival. Required cabin String. Cabin class to return seats for. If neither cabin, classOfService, or additionalCabins are sent, by default the response returns Economy cabin and Y class of service. Optional classOfService String. Class of service to return seats for. Optional segmentSequence Sequence of this segment on the leg, starting with 0 for the first segment on the leg. A segment is one flight with the same flight number. Required Response The Standalone Seat map response is the same as the reference payload seat map response, with the exception that Result/Warning/Message is returned with the message The seatMap is view only . See the Seat Map API&#160;Reference for response details. Example Request For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . Show Example { "CatalogOfferingsQuerySeatAvailability": { "SeatAvailabilityOfferings": { "@type": "SeatAvailabilityOfferingsBuildFromProducts", "ProductCriteriaAir": { "@type": "ProductCriteriaAir", "sequence": 1, "SpecificFlightCriteria": [ { "@type": "SpecificFlightCriteria", "carrier": "QF", "flightNumber": "940", "departureDate": "2024-06-30", "departureTime": "17:35:00", "arrivalDate": "2024-06-30", "arrivalTime": "23:55:00", "from": "PER", "to": "BNE", "cabin": "Economy", "classOfService": "Q", "brandTier": 2, "segmentSequence": 1, "AvailabilitySourceCode": "Z", "ContentSource": "GDS", "boundFlightsInd": true } ] } } } } Example Response The Standalone Seat map response is the same as the reference payload seat map response, with the exception that a Result/Warning/Message is returned with the message The seatMap is view only . See the Seat Map API&#160;Reference for an example response.

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
 "CatalogOfferingsQuerySeatAvailability": {
  "SeatAvailabilityOfferings": {
   "@type": "SeatAvailabilityOfferingsBuildFromProducts",
   "ProductCriteriaAir": {
    "@type": "ProductCriteriaAir",
    "sequence": 1,
    "SpecificFlightCriteria": [
     {
      "@type": "SpecificFlightCriteria",
      "carrier": "QF",
      "flightNumber": "940",
      "departureDate": "2024-06-30",
      "departureTime": "17:35:00",
      "arrivalDate": "2024-06-30",
      "arrivalTime": "23:55:00",
      "from": "PER",
      "to": "BNE",
      "cabin": "Economy",
      "classOfService": "Q",
      "brandTier": 2,
      "segmentSequence": 1,
      "AvailabilitySourceCode": "Z",
      "ContentSource": "GDS",
      "boundFlightsInd": true
     }
    ]
   }
  }
 }
}
```

