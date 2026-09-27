# Air Availability API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Search/APIRef_AirAvailability.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Air Availability API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Air Availability API&#160;Reference Request Response Example request Example response POST search/airAvailability Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Air Search Guide Air Availability returns scheduled flights between a specified city pair on a specified day and time and indicates whether seats are available on those flights. Air Availability is a full payload request that focuses on seat availability by class of service. It does not return pricing information. GDS only; not supported for NDC. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body Show Basic Search Request Body Table The minimum search request detailed below sends itinerary and passenger details. Object Description Required CatalogProductOfferingsQueryRequest Top level object. Required CatalogProductOfferingsRequest Top level object with @type CatalogProductOfferingsRequestAir. Includes PassengerCriteria and SearchCriteriaFlight objects. May contain SearchModifiersAir. Required PassengerCriteria Array. Defines the type of passenger to search for. Optional - sending PTC details does not change the response. Send one PassengerCriteria for each passenger type code (PTC). Availability supports the following: Up to nine total passengers across all PTCs Maximum of six PTCs Maximum of six O&amp;D pairs Optional passengerTypeCode String. The passenger type code for the passengers on the itinerary. Common PTCs are: ADT: adult CHD: child of unknown age CNN:&#160;child when age is known INF:&#160;infant without a seat INS:&#160;infant with a seat UNN:&#160;unaccompanied child See the Downloads page to download a full list of PTCs. Optional number Number. The number of passengers with this PTC. Optional SearchCriteriaFlight &#160; Array. Each instance defines one leg of the itinerary by specifying an origin and destination (O&amp;D) pair, aka departure and arrival location, for that leg. Includes From and To objects. Required departureDate String. Date of departure in YYYY-MM-DD format (e.g., departureDate="2026-12-06"). Required departureTime String. Optional to send a time to search for flights departing close to that specified time. HH:MM:SS format (e.g., departureTime="18:00:00"). Sending "00:00:00" is not supported and causes an error message. Optional arrivalDate String. Local date of arrival in YYYY-MM-DD format (e.g., departureDate="2026-12-06"). Cannot be used with departureDate. If sent with a departureDate, the departureDate is ignored. Best practice when sending an arrival date is to also send an arrival time. Optional arrivalTime String. Optional to send a local time of arrival to search for flights arriving close to that specified time. HH:MM:SS format (e.g., departureTime="18:00:00"). Cannot be used with departureTime. Sending "00:00:00" is not supported and causes an error message. Optional From Object. Required value String. The IATA airport or city code for the departure airport/city for this leg. Required cityOrAirport String. Optional enumeration specifying whether to restrict the search based on the city/airport code sent in value. Supported value: City or Airport cityOrAirport Options Behavior Airport code with no cityOrAirport value Expands the availability selection to the city while giving preference to the requested airport. For example, LGA would return flights for LGA, EWR, and JFK but would target more content from LGA. City code with no cityOrAirport value, or with City or Airport value Returns an unweighted selection of inventory for all airports in the city. For example, NYC would search content equally between LGA, EWR, and JFK. Optional To Object Required value String. The IATA location code for the arrival city/airport for this leg. Required cityOrAirport String. Optional enumeration specifying whether to restrict the search based on the city/airport code sent in value. Supported value: City or Airport See cityOrAirport above for behavior. Optional SearchModifiersAir Optional search modifiers. Can include ConnectionPreferences and/or CarrierPreference. Optional CarrierPreference Array. Specify preference for a permitted airline to limit results to one or more carriers. Optional preferenceType String. The type of carrier preference. Availability supports only the following: Permitted: Returns only results on the specified carrier or carriers. Returns an error if the carrier/s do not have availability within the requested search parameters. Required carriers String. One or more carrier codes to permit. Required ConnectionPreferences Specify whether results must have one or more of the specified connection points (permitted), or if they cannot have one or more of the specified connection points (prohibited). Optional cityOrAirport String. Optional enumeration specifying whether to restrict the search based on the city/airport code sent in value. Supported value: City or Airport See cityOrAirport above for behavior. Optional legSequence Use to apply preference to only specific legs of the itinerary. Do not send if requesting preference at itinerary level. Optional preferenceType String. The type of connection preference. Supported values are: Permitted: Returns only results that connect through one or more of the specified locations in ConnectionPoint. Returns error if there is no availability through the specified connecting location/s. Prohibited: Excludes results that connect through one or more of the specified locations in ConnectionPoint. Only one preference type can be requested for an O&amp;D pair, either Permitted or Prohibited but not both. Required ConnectionPoint String. Three-letter IATA code for the connecting location/s for this preference. For example, if you specify three locations, any flights meeting any one or more of those locations will be permitted or prohibited per the specified preferenceType. Required &#160; Response The Air Availability response shares the basic structure of the Search response but returns a subset of its objects. It does not return any pricing or brand information. The tables in this section break down the Air Availability response into several of its objects&#160;to list all information in each. Show CatalogProductOfferings Table CatalogProductOfferingsResponse Object Description CatalogProductOfferingsResponse Top level object for Air Availability response. Includes CatalogProductOfferings,&#160;Result, ReferenceList. Key value pairs: transactionId : System-generated unique ID for this response. Can be used for internal tracking and troubleshooting. traceId : Returned if a custom trace ID was sent in the request header. See Transaction and Trace IDs for details. See Identifiers in the JSON &#160;APIs for more about identifiers across all JSON &#160;APIs. CatalogProductOfferings See Identifiers in the JSON &#160;APIs for more about identifiers across all JSON &#160;APIs. Object Description CatalogProductOfferings Top level object that groups all offers. Includes Identifier and CatalogProductOffering objects. Identifier Returns identifier for the entire response as a unique system-generated identifier in value . CatalogProductOffering Array. Each instance of CatalogProductOffering returns one offer on one leg of the itinerary. Includes Departure, Arrival, and ProductBrandOptions objects. Departure IATA code for departure airport or city for this leg of the itinerary. Arrival IATA code for arrival airport or city for this leg of the itinerary. ProductBrandOptions Array. Each instance groups the products available on this offer. Includes ProductBrandOffering. ProductBrandOffering Returns one product in this offer and related details about it. Includes Product. Product Array. Each instance returns one product identifier. Includes productRef. productRef Reference id that matches to identifier in ReferenceListFlight/Product. To find flight details for a product, use the ProductRef id to identify the product in ReferenceListProduct/Product, and use the flight numbers (e.g., s3, s4) to match to flight information in ReferenceListFlight/Flight. Show Result Table Result returns any error and warning messages. See Error Messages for a listing. Object Description Result Includes objects for any warning or error message returned. May include Warning and/or Error objects. Error Returns error message details in the StatusCode, Message, and SourceCode objects. Warning Returns warning message details in the Message and SourceCode objects. StatusCode The HTTP standard response code for the message. Message The text of any error message returned. SourceCode The error or warning code returned by the provider or host system. Show ReferenceList Table ReferenceList consolidates all the details about flights, products, brands, and terms and conditions returned in CatalogProductOfferings. Object Description &#160; ReferenceList Top level object for the consolidated flight, product, terms and conditions, and brand information referenced in the offers in CatalogProductOfferings. Returns one instance each of types ReferenceListFlight and ReferenceListProduct. &#160; ReferenceList/ReferenceListFlight Object Description ReferenceListFlight Returns an array of Flight objects that match to the flights that make up a product. Flight Array. One instance for one flight. Key value pairs: distance : Distance covered by the flight. duration : Time of the flight in hours (H) and minutes (M). carrier : Airline carrier. number : Flight number. operatingCarrier : When the carrier has filed a codeshare operating carrier for the flight, the IATA code for that codeshare carrier. operatingCarrierName : Name of the marketing operating carrier. equipment : Equipment model. Note that TRN, TRS, and BUS equipment codes indicate ground transportation. stops : For a direct flight that makes one or more stops between an origin and destination, the number of stops. id : Internal flight reference id, used to match this flight to the flights listed in each offer (CatalogProductOffering). Includes Departure, Arrival, AvailabilitySourceCode objects. Departure Departure details. Key value pairs are the location , date , time , and terminal of departure. Arrival Arrival details. Key value pairs are the location , date , time , and terminal of arrival. AvailabilitySourceCode Returned to assist in troubleshooting. Recommended to be sent in the AirPrice Full Payload and Add Offer Full Payload requests. GDS&#160;only; not supported for NDC. Supported values and definitions for AvailabilitySourceCode: A:&#160;AVS (availability and schedules) B:&#160;Travelport cache C:&#160;AVS D:&#160;Direct Access E:&#160;Travelport cache F: Travelport cache G: Travelport cache H: Travelport cache I: Travelport cache K: Travelport cache L:&#160;Last seat availability M:&#160;Unknown source O: Travelport cache P: Travelport cache Q:&#160;Travelport cache S:&#160;Seamless T:&#160;Travelport cache U:&#160;Unknown source X:&#160;Customer reusing availability data from customer cache (data originally obtained from Travelport) Y:&#160;Customer reusing data obtained from another system (e.g., another GDS) (data may be fresh or stored in customer cache) Z:&#160;Customer sold from e-streamed data stored in customer cache &#160; ReferenceList/ReferenceListProduct Object Description ReferenceListProduct Returns details for the products returned in offers. Includes the Product object. Product Array. One instance for each product id. Key value pairs: totalDuration : Total time length of the segment in hours (H) and minutes (M). id :&#160;Product id. Includes FlightSegment and PassengerFlight objects. FlightSegment Array. One instance for each flight segment in the product. Key value pairs: sequence :&#160;Order of the sequence; e.g. 1 for the first segment on the leg. operationalStatus : Operational status of this flight. Possible values are FlightBoarding, FlightCancelled, FlightDeparted, FlightPastScheduledDeparture, NotAvailableUseSearch (may be returned if no classes of service are returned for a flight, or when the flight status is unknown). Includes Flight object. Flight Array. One instance for each flight in the product. Includes id. id Unique identifier for this flight. Matches to identifier in ReferenceListFlight/Flight. PassengerFlight Returns availability details for each class of service on this flight. Includes the FlightProduct object. FlightProduct Details for this flight. Key value pairs: segmentSequence :&#160;Order of this flight in the sequence. cabin :&#160;Cabin class. ClassOfServiceAvailability Defines the class of service, the number of seats available for the class of service, and the status of the class of service (E.g., Available). Key value pairs: number :&#160;Number of seats available for the class of service. status :&#160;Status of these seats, such as Available. If no seats available for a class of service, possible values are Not Available, Request, Waitlist, Waitlist Closed. value : Class of service code. Example Request For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . The following example request is for a round trip itinerary with the optional ConnectionPreference modifier. Show Example Request for round-trip with optional modifiers { "CatalogProductOfferingsQueryRequest": { "CatalogProductOfferingsRequest": { "@type": "CatalogProductOfferingsRequestAir", "PassengerCriteria": [ { "number": 1, "passengerTypeCode": "ADT" } ], "SearchCriteriaFlight": [ { "departureDate": "2024-05-19", "From": { "value": "LAX" }, "To": { "value": "JNB" } }, { "arrivalDate": "2024-05-29", "From": { "value": "JNB" }, "To": { "value": "LAX" } } ], "SearchModifiersAir": { "ConnectionPreferences": [ { "preferenceType": "Permitted", "legSequence": [ 1 ], "ConnectionPoint": [ "AMS" ] }, { "preferenceType": "Prohibited", "legSequence": [ 2 ], "ConnectionPoint": [ "FRA" ] } ] } } } } Example Response For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . Per the following example, the Air Availability response does not return pricing information. For brevity, the lines for products 3 and 4 have been omitted from this example. Show Example Response { "CatalogProductOfferingsResponse": { "@type": "CatalogProductOfferingsResponse", "transactionId": "SingleSurcharge_False", "traceId": "trace", "CatalogProductOfferings": { "@type": "CatalogProductOfferings", "Identifier": { "value": "1df45270-2337-481e-b1e4-a0050ddae1ab" }, "CatalogProductOffering": [ { "@type": "CatalogProductOffering", "Departure": "LAX", "Arrival": "JNB", "ProductBrandOptions": [ { "@type": "ProductBrandOptions", "ProductBrandOffering": [ { "@type": "ProductBrandOffering", "Product": [ { "@type": "ProductID", "productRef": "p0" } ] } ] }, { "@type": "ProductBrandOptions", "ProductBrandOffering": [ { "@type": "ProductBrandOffering", "Product": [ { "@type": "ProductID", "productRef": "p3" } ] } ] }, { "@type": "ProductBrandOptions", "ProductBrandOffering": [ { "@type": "ProductBrandOffering", "Product": [ { "@type": "ProductID", "productRef": "p4" } ] } ] } ] }, { "@type": "CatalogProductOffering", "Departure": "ONT", "Arrival": "JNB", "ProductBrandOptions": [ { "@type": "ProductBrandOptions", "ProductBrandOffering": [ { "@type": "ProductBrandOffering", "Product": [ { "@type": "ProductID", "productRef": "p1" } ] } ] } ] }, { "@type": "CatalogProductOffering", "Departure": "SNA", "Arrival": "JNB", "ProductBrandOptions": [ { "@type": "ProductBrandOptions", "ProductBrandOffering": [ { "@type": "ProductBrandOffering", "Product": [ { "@type": "ProductID", "productRef": "p2" } ] } ] } ] } ] }, "ReferenceList": [ { "@type": "ReferenceListFlight", "Flight": [ { "@type": "FlightDetail", "duration": "PT10H15M", "carrier": "KL", "number": "602", "equipment": "781", "id": "s1", "Departure": { "@type": "DepartureDetail", "terminal": "B", "location": "LAX", "date": "2024-05-19", "time": "13:50:00" }, "Arrival": { "@type": "ArrivalDetail", "location": "AMS", "date": "2024-05-20", "time": "09:05:00" }, "availabilitySourceCode": "S" }, { "@type": "FlightDetail", "duration": "PT10H45M", "carrier": "KL", "number": "591", "equipment": "789", "id": "s2", "Departure": { "@type": "DepartureDetail", "location": "AMS", "date": "2024-05-20", "time": "10:35:00" }, "Arrival": { "@type": "ArrivalDetail", "terminal": "B", "location": "JNB", "date": "2024-05-20", "time": "21:20:00" }, "availabilitySourceCode": "S" }, { "@type": "FlightDetail", "duration": "PT3H5M", "carrier": "AA", "number": "1820", "equipment": "321", "id": "s3", "Departure": { "@type": "DepartureDetail", "terminal": "4", "location": "ONT", "date": "2024-05-19", "time": "10:50:00" }, "Arrival": { "@type": "ArrivalDetail", "terminal": "0", "location": "DFW", "date": "2024-05-19", "time": "15:55:00" }, "availabilitySourceCode": "S" }, { "@type": "FlightDetail", "duration": "PT9H5M", "carrier": "AA", "number": "220", "equipment": "788", "id": "s4", "Departure": { "@type": "DepartureDetail", "terminal": "0", "location": "DFW", "date": "2024-05-19", "time": "16:35:00" }, "Arrival": { "@type": "ArrivalDetail", "location": "AMS", "date": "2024-05-20", "time": "08:40:00" }, "availabilitySourceCode": "S" }, { "@type": "FlightDetail", "duration": "PT10H45M", "carrier": "KL", "number": "591", "equipment": "789", "id": "s5", "Departure": { "@type": "DepartureDetail", "location": "AMS", "date": "2024-05-20", "time": "10:35:00" }, "Arrival": { "@type": "ArrivalDetail", "terminal": "B", "location": "JNB", "date": "2024-05-20", "time": "21:20:00" }, "availabilitySourceCode": "S" }, { "@type": "FlightDetail", "duration": "PT3H10M", "carrier": "AA", "number": "2114", "equipment": "738", "id": "s6", "Departure": { "@type": "DepartureDetail", "location": "SNA", "date": "2024-05-19", "time": "10:45:00" }, "Arrival": { "@type": "ArrivalDetail", "terminal": "0", "location": "DFW", "date": "2024-05-19", "time": "15:55:00" }, "availabilitySourceCode": "S" }, { "@type": "FlightDetail", "duration": "PT9H5M", "carrier": "AA", "number": "220", "equipment": "788", "id": "s7", "Departure": { "@type": "DepartureDetail", "terminal": "0", "location": "DFW", "date": "2024-05-19", "time": "16:35:00" }, "Arrival": { "@type": "ArrivalDetail", "location": "AMS", "date": "2024-05-20", "time": "08:40:00" }, "availabilitySourceCode": "S" }, { "@type": "FlightDetail", "duration": "PT10H45M", "carrier": "KL", "number": "591", "equipment": "789", "id": "s8", "Departure": { "@type": "DepartureDetail", "location": "AMS", "date": "2024-05-20", "time": "10:35:00" }, "Arrival": { "@type": "ArrivalDetail", "terminal": "B", "location": "JNB", "date": "2024-05-20", "time": "21:20:00" }, "availabilitySourceCode": "S" }, { "@type": "FlightDetail", "duration": "PT3H19M", "carrier": "AA", "number": "1660", "equipment": "321", "id": "s9", "Departure": { "@type": "DepartureDetail", "terminal": "0", "location": "LAX", "date": "2024-05-19", "time": "10:35:00" }, "Arrival": { "@type": "ArrivalDetail", "terminal": "0", "location": "DFW", "date": "2024-05-19", "time": "15:54:00" }, "availabilitySourceCode": "S" }, { "@type": "FlightDetail", "duration": "PT9H5M", "carrier": "AA", "number": "220", "equipment": "788", "id": "s10", "Departure": { "@type": "DepartureDetail", "terminal": "0", "location": "DFW", "date": "2024-05-19", "time": "16:35:00" }, "Arrival": { "@type": "ArrivalDetail", "location": "AMS", "date": "2024-05-20", "time": "08:40:00" }, "availabilitySourceCode": "S" }, { "@type": "FlightDetail", "duration": "PT10H45M", "carrier": "KL", "number": "591", "equipment": "789", "id": "s11", "Departure": { "@type": "DepartureDetail", "location": "AMS", "date": "2024-05-20", "time": "10:35:00" }, "Arrival": { "@type": "ArrivalDetail", "terminal": "B", "location": "JNB", "date": "2024-05-20", "time": "21:20:00" }, "availabilitySourceCode": "S" }, { "@type": "FlightDetail", "duration": "PT1H32M", "carrier": "UA", "number": "447", "equipment": "739", "id": "s12", "Departure": { "@type": "DepartureDetail", "terminal": "7", "location": "LAX", "date": "2024-05-19", "time": "10:30:00" }, "Arrival": { "@type": "ArrivalDetail", "terminal": "3", "location": "SFO", "date": "2024-05-19", "time": "12:02:00" }, "availabilitySourceCode": "S" }, { "@type": "FlightDetail", "duration": "PT10H15M", "carrier": "KL", "number": "606", "equipment": "781", "id": "s13", "Departure": { "@type": "DepartureDetail", "terminal": "I", "location": "SFO", "date": "2024-05-19", "time": "13:50:00" }, "Arrival": { "@type": "ArrivalDetail", "location": "AMS", "date": "2024-05-20", "time": "09:05:00" }, "availabilitySourceCode": "S" }, { "@type": "FlightDetail", "duration": "PT10H45M", "carrier": "KL", "number": "591", "equipment": "789", "id": "s14", "Departure": { "@type": "DepartureDetail", "location": "AMS", "date": "2024-05-20", "time": "10:35:00" }, "Arrival": { "@type": "ArrivalDetail", "terminal": "B", "location": "JNB", "date": "2024-05-20", "time": "21:20:00" }, "availabilitySourceCode": "S" } ] }, { "@type": "ReferenceListProduct", "Product": [ { "@type": "ProductAir", "id": "p0", "FlightSegment": [ { "@type": "FlightSegment", "sequence": 1, "Flight": { "@type": "FlightID", "id": "s1" } }, { "@type": "FlightSegment", "sequence": 2, "Flight": { "@type": "FlightID", "id": "s2" } } ], "totalDuration": "PT22H30M", "PassengerFlight": [ { "@type": "PassengerFlight", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Business", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "J" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Business", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "C" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "PremiumEconomy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "W" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "PremiumEconomy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "S" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "PremiumEconomy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 4, "status": "Available", "value": "A" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "Y" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "B" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "M" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "U" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "K" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "H" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "L" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "Q" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "T" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "E" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "N" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "R" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "V" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Business", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "J" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Business", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "C" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "PremiumEconomy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "W" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "PremiumEconomy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "S" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "Y" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "B" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "M" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "U" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "K" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "H" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "L" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "Q" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "T" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "E" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "N" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "R" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "V" } ] } ] } ] }, { "@type": "ProductAir", "id": "p1", "FlightSegment": [ { "@type": "FlightSegment", "sequence": 1, "Flight": { "@type": "FlightID", "id": "s3" } }, { "@type": "FlightSegment", "sequence": 2, "Flight": { "@type": "FlightID", "id": "s4" } }, { "@type": "FlightSegment", "sequence": 3, "Flight": { "@type": "FlightID", "id": "s5" } } ], "totalDuration": "PT25H30M", "PassengerFlight": [ { "@type": "PassengerFlight", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Business", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "C" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Business", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "J" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Business", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "R" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Business", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "D" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Business", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "I" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "Y" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "B" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "H" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "K" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "M" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "L" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "G" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "V" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "S" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "N" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "Q" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "O" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Business", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "C" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Business", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "J" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Business", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "R" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Business", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "D" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Business", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "I" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "PremiumEconomy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "W" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "PremiumEconomy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "P" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "Y" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "B" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "H" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "K" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "M" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "L" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "G" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "V" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "S" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "N" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "Q" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "O" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 3 ], "cabin": "Business", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "J" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 3 ], "cabin": "Business", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "C" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 3 ], "cabin": "PremiumEconomy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "W" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 3 ], "cabin": "PremiumEconomy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "S" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 3 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "Y" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 3 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "B" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 3 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "M" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 3 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "U" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 3 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "K" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 3 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "H" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 3 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "L" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 3 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "Q" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 3 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "T" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 3 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "E" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 3 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "N" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 3 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "R" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 3 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "V" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 3 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "X" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 3 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "G" } ] } ] } ] }, { "@type": "ProductAir", "id": "p2", "FlightSegment": [ { "@type": "FlightSegment", "sequence": 1, "Flight": { "@type": "FlightID", "id": "s6" } }, { "@type": "FlightSegment", "sequence": 2, "Flight": { "@type": "FlightID", "id": "s7" } }, { "@type": "FlightSegment", "sequence": 3, "Flight": { "@type": "FlightID", "id": "s8" } } ], "totalDuration": "PT25H35M", "PassengerFlight": [ { "@type": "PassengerFlight", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Business", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "C" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Business", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "J" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Business", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "R" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Business", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "D" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Business", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "I" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "Y" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "B" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "H" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "K" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "M" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "L" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "G" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "V" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "S" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "N" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "Q" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 1 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "O" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Business", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "C" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Business", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "J" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Business", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "R" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Business", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "D" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Business", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "I" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "PremiumEconomy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "W" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "PremiumEconomy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "P" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "Y" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "B" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "H" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "K" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "M" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "L" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "G" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "V" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "S" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "N" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "Q" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "O" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 3 ], "cabin": "Business", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "J" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 3 ], "cabin": "Business", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "C" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 3 ], "cabin": "PremiumEconomy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "W" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 3 ], "cabin": "PremiumEconomy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 7, "status": "Available", "value": "S" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 3 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "Y" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 3 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "B" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 3 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "M" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 3 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "U" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 3 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "K" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 3 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "H" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 3 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "L" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 3 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "Q" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 3 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "T" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 3 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "E" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 3 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "N" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 3 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "R" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 3 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "V" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 3 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "X" } ] }, { "@type": "FlightProduct", "segmentSequence": [ 3 ], "cabin": "Economy", "ClassOfServiceAvailability": [ { "@type": "ClassOfServiceAvailability", "number": 9, "status": "Available", "value": "G" } ] } ] } ] }, {ProductAir p3 omitted for brevity}, {ProductAir p4 omitted for brevity} ] } ] } }

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
    "CatalogProductOfferingsQueryRequest": {
        "CatalogProductOfferingsRequest": {
            "@type": "CatalogProductOfferingsRequestAir",
            "PassengerCriteria": [
                {
                    "number": 1,
                    "passengerTypeCode": "ADT"
                }
            ],
            "SearchCriteriaFlight": [
                {
                    "departureDate": "2024-05-19",
                    "From": {
                        "value": "LAX"
                    },
                    "To": {
                        "value": "JNB"
                    }
                },
                {
                    "arrivalDate": "2024-05-29",
                    "From": {
                        "value": "JNB"
                    },
                    "To": {
                        "value": "LAX"
                    }
                }
            ],
            "SearchModifiersAir": {
                "ConnectionPreferences": [
                    {
                        "preferenceType": "Permitted",
                        "legSequence": [
                            1
                        ],
                        "ConnectionPoint": [
                            "AMS"
                        ]
                    },
                    {
                        "preferenceType": "Prohibited",
                        "legSequence": [
                            2
                        ],
                        "ConnectionPoint": [
                            "FRA"
                        ]
                    }
                ]
            }
        }
    }
}
```

### Block 2

```
{
 "CatalogProductOfferingsResponse": {
  "@type": "CatalogProductOfferingsResponse",
  "transactionId": "SingleSurcharge_False",
  "traceId": "trace",
  "CatalogProductOfferings": {
   "@type": "CatalogProductOfferings",
   "Identifier": {
    "value": "1df45270-2337-481e-b1e4-a0050ddae1ab"
   },
   "CatalogProductOffering": [
    {
     "@type": "CatalogProductOffering",
     "Departure": "LAX",
     "Arrival": "JNB",
     "ProductBrandOptions": [
      {
       "@type": "ProductBrandOptions",
       "ProductBrandOffering": [
        {
         "@type": "ProductBrandOffering",
         "Product": [
          {
           "@type": "ProductID",
           "productRef": "p0"
          }
         ]
        }
       ]
      },
      {
       "@type": "ProductBrandOptions",
       "ProductBrandOffering": [
        {
         "@type": "ProductBrandOffering",
         "Product": [
          {
           "@type": "ProductID",
           "productRef": "p3"
          }
         ]
        }
       ]
      },
      {
       "@type": "ProductBrandOptions",
       "ProductBrandOffering": [
        {
         "@type": "ProductBrandOffering",
         "Product": [
          {
           "@type": "ProductID",
           "productRef": "p4"
          }
         ]
        }
       ]
      }
     ]
    },
    {
     "@type": "CatalogProductOffering",
     "Departure": "ONT",
     "Arrival": "JNB",
     "ProductBrandOptions": [
      {
       "@type": "ProductBrandOptions",
       "ProductBrandOffering": [
        {
         "@type": "ProductBrandOffering",
         "Product": [
          {
           "@type": "ProductID",
           "productRef": "p1"
          }
         ]
        }
       ]
      }
     ]
    },
    {
     "@type": "CatalogProductOffering",
     "Departure": "SNA",
     "Arrival": "JNB",
     "ProductBrandOptions": [
      {
       "@type": "ProductBrandOptions",
       "ProductBrandOffering": [
        {
         "@type": "ProductBrandOffering",
         "Product": [
          {
           "@type": "ProductID",
           "productRef": "p2"
          }
         ]
        }
       ]
      }
     ]
    }
   ]
  },
  "ReferenceList": [
   {
    "@type": "ReferenceListFlight",
    "Flight": [
     {
      "@type": "FlightDetail",
      "duration": "PT10H15M",
      "carrier": "KL",
      "number": "602",
      "equipment": "781",
      "id": "s1",
      "Departure": {
       "@type": "DepartureDetail",
       "terminal": "B",
       "location": "LAX",
       "date": "2024-05-19",
       "time": "13:50:00"
      },
      "Arrival": {
       "@type": "ArrivalDetail",
       "location": "AMS",
       "date": "2024-05-20",
       "time": "09:05:00"
      },
      "availabilitySourceCode": "S"
     },
     {
      "@type": "FlightDetail",
      "duration": "PT10H45M",
      "carrier": "KL",
      "number": "591",
      "equipment": "789",
      "id": "s2",
      "Departure": {
       "@type": "DepartureDetail",
       "location": "AMS",
       "date": "2024-05-20",
       "time": "10:35:00"
      },
      "Arrival": {
       "@type": "ArrivalDetail",
       "terminal": "B",
       "location": "JNB",
       "date": "2024-05-20",
       "time": "21:20:00"
      },
      "availabilitySourceCode": "S"
     },
     {
      "@type": "FlightDetail",
      "duration": "PT3H5M",
      "carrier": "AA",
      "number": "1820",
      "equipment": "321",
      "id": "s3",
      "Departure": {
       "@type": "DepartureDetail",
       "terminal": "4",
       "location": "ONT",
       "date": "2024-05-19",
       "time": "10:50:00"
      },
      "Arrival": {
       "@type": "ArrivalDetail",
       "terminal": "0",
       "location": "DFW",
       "date": "2024-05-19",
       "time": "15:55:00"
      },
      "availabilitySourceCode": "S"
     },
     {
      "@type": "FlightDetail",
      "duration": "PT9H5M",
      "carrier": "AA",
      "number": "220",
      "equipment": "788",
      "id": "s4",
      "Departure": {
       "@type": "DepartureDetail",
       "terminal": "0",
       "location": "DFW",
       "date": "2024-05-19",
       "time": "16:35:00"
      },
      "Arrival": {
       "@type": "ArrivalDetail",
       "location": "AMS",
       "date": "2024-05-20",
       "time": "08:40:00"
      },
      "availabilitySourceCode": "S"
     },
     {
      "@type": "FlightDetail",
      "duration": "PT10H45M",
      "carrier": "KL",
      "number": "591",
      "equipment": "789",
      "id": "s5",
      "Departure": {
       "@type": "DepartureDetail",
       "location": "AMS",
       "date": "2024-05-20",
       "time": "10:35:00"
      },
      "Arrival": {
       "@type": "ArrivalDetail",
       "terminal": "B",
       "location": "JNB",
       "date": "2024-05-20",
       "time": "21:20:00"
      },
      "availabilitySourceCode": "S"
     },
     {
      "@type": "FlightDetail",
      "duration": "PT3H10M",
      "carrier": "AA",
      "number": "2114",
      "equipment": "738",
      "id": "s6",
      "Departure": {
       "@type": "DepartureDetail",
       "location": "SNA",
       "date": "2024-05-19",
       "time": "10:45:00"
      },
      "Arrival": {
       "@type": "ArrivalDetail",
       "terminal": "0",
       "location": "DFW",
       "date": "2024-05-19",
       "time": "15:55:00"
      },
      "availabilitySourceCode": "S"
     },
     {
      "@type": "FlightDetail",
      "duration": "PT9H5M",
      "carrier": "AA",
      "number": "220",
      "equipment": "788",
      "id": "s7",
      "Departure": {
       "@type": "DepartureDetail",
       "terminal": "0",
       "location": "DFW",
       "date": "2024-05-19",
       "time": "16:35:00"
      },
      "Arrival": {
       "@type": "ArrivalDetail",
       "location": "AMS",
       "date": "2024-05-20",
       "time": "08:40:00"
      },
      "availabilitySourceCode": "S"
     },
     {
      "@type": "FlightDetail",
      "duration": "PT10H45M",
      "carrier": "KL",
      "number": "591",
      "equipment": "789",
      "id": "s8",
      "Departure": {
       "@type": "DepartureDetail",
       "location": "AMS",
       "date": "2024-05-20",
       "time": "10:35:00"
      },
      "Arrival": {
       "@type": "ArrivalDetail",
       "terminal": "B",
       "location": "JNB",
       "date": "2024-05-20",
       "time": "21:20:00"
      },
      "availabilitySourceCode": "S"
     },
     {
      "@type": "FlightDetail",
      "duration": "PT3H19M",
      "carrier": "AA",
      "number": "1660",
      "equipment": "321",
      "id": "s9",
      "Departure": {
       "@type": "DepartureDetail",
       "terminal": "0",
       "location": "LAX",
       "date": "2024-05-19",
       "time": "10:35:00"
      },
      "Arrival": {
       "@type": "ArrivalDetail",
       "terminal": "0",
       "location": "DFW",
       "date": "2024-05-19",
       "time": "15:54:00"
      },
      "availabilitySourceCode": "S"
     },
     {
      "@type": "FlightDetail",
      "duration": "PT9H5M",
      "carrier": "AA",
      "number": "220",
      "equipment": "788",
      "id": "s10",
      "Departure": {
       "@type": "DepartureDetail",
       "terminal": "0",
       "location": "DFW",
       "date": "2024-05-19",
       "time": "16:35:00"
      },
      "Arrival": {
       "@type": "ArrivalDetail",
       "location": "AMS",
       "date": "2024-05-20",
       "time": "08:40:00"
      },
      "availabilitySourceCode": "S"
     },
     {
      "@type": "FlightDetail",
      "duration": "PT10H45M",
      "carrier": "KL",
      "number": "591",
      "equipment": "789",
      "id": "s11",
      "Departure": {
       "@type": "DepartureDetail",
       "location": "AMS",
       "d
…
```

