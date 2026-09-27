# Search API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Search/APIRef_Search.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Search API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Search API&#160;Reference Request Response Example request Example response POST catalog/search/catalogproductofferings When sending a Premium Flex search request, append /premiumflex to this endpoint (catalog/search/catalogproductofferings/premiumflex) Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Air Search Guide , Search Workflow Diagrams , Next Leg Search API Reference The Search API returns offers for flights between specific origin and destination (O&amp;D) pairs. You can set the Search request to return offers for the full itinerary (a journey-based search), or for only the first leg (a leg-based search) and follow it with a Next Leg Search. Any modifiers or indicators sent in the Search request carry over to the Next Leg Search request and are not re-sent. Request As part of the request requirements, also see Authentication and Common Air API Headers . Headers None. Query Parameters None. Request Body Basic Search Request Show Basic Search Request Body Table The minimum search request detailed below sends itinerary and passenger details. Object Description Required CatalogProductOfferingsQueryRequest Top level object. Required CustomResponseModifiersAir Includes SearchRepresentation and optional indicators. Any modifiers or indicators sent in this request carry over to the Next Leg Search request and are not re-sent. Optional SearchRepresentation Specifies either a journey- or leg-based response. Supported values: Journey: Returns offers for all legs of the itinerary. Default. Leg: Returns offers for only the first leg of the itinerary. Must be followed with a Next Leg Search to select an offer for the first leg and return offers on the subsequent leg to combine with it. This setting does not affect one-way itineraries, which have one leg and are always journey-based. Next Leg Search requests, and Flight Specific Search requests for less than the full itinerary, are supported only after a leg-based Search, not a journey-based Search. If these requests follow a journey-based Search request, an error message is returned. Optional includeFlightAmenitiesInd Boolean. Indicator to return flight amenities from ATPCO RouteHappy data: true: Includes amenities in the response if available. false:&#160;Amenities not returned in response. Default. Optional includeUniversalProductAttributesInd Boolean. Indicator to return universal product attributes (UPAs), which include images, icons, and URLs as provided by ATPCO. Must also send includeFlightAmenitiesInd=true. true: Returns universal product attributes if available. false:&#160;Universal product attributes not returned. Default. UPAs are not returned for direct flights with intermediate stops, non-flight segments such as trains, or for Premium Business class. Optional excludeBaggageFeesInd Boolean. Indicator to exclude baggage details. true: Excludes baggage fees, carry on fees, and embargo information from the response. Baggage quantity or weight is returned instead. false:&#160; Baggage details returned in response. Default. GDS&#160;only; not supported for NDC. Optional excludeSurchargesInd Boolean. Indicator to exclude a surcharge breakdown. true: Excludes a surcharge breakdown from the response. Baggage quantity or kilos is returned instead. false:&#160;Surcharge breakdown returned in response. Default. GDS&#160;only; not supported for NDC. Optional includeFareCalculationInd Boolean. Indicator to request the return of the fare calculation ladder. true: Returns the fare calculation ladder in BestCombinablePrice/PriceBreakdown/FareCalculation. false:&#160;Default. Fare calculation ladder not returned. GDS&#160;only; not supported for NDC or in the Flight Specific Search full payload request. Optional includeBundledAncillariesInd Boolean. Send with true to request NDC&#160;offers that include an ancillary service bundled with the cost of the air fare. This could be a discounted paid seat, or any other ancillary service offered by the carrier. NDC only; not supported for GDS. Optional includeCo2EmissionsDataInd Boolean. Indicator to return CO2 emission data in the Search and Next Leg Search responses. true: Returns CO2 emission data. false:&#160;CO2 emission data not returned. Default. Optional CatalogProductOfferingsRequest Object for setting response-wide options. Includes PassengerCriteria and SearchCriteriaFlight objects. Required maxNumberOfOffersToReturn This object is not in use and is ignored if sent. Not used offersPerPage Number. Has two functions: Maximum offers returned: Sets the maximum number of offers returned. If sent with 0 or not sent, Search returns all offers. If fewer offers than specified in offersPerPage are available, all offers are returned. Caching: Sets whether to invoke caching so that journey-based search results can be referenced by subsequent reference payload requests. Send with any number equal to or greater than 1 . No maximum value. If offersPerPage is not sent for a journey-based search, the results are not cached and the response does not return a transaction identifier. Does not affect leg-based search results, which are cached by default. If your workflow subsequently references a journey-based A search that returns offers for all legs on the itinerary. A journey-based Search request is a standalone search.&#160;No additional search requests are required. search result, the Search request must send offersPerPage set&#160;to any positive number. This setting invokes caching to allow subsequent requests to refer to these search results. If a journey-based Search request does not send offersPerPage, any subsequent reference payload requests fail , including the Flight Specific Search, AirPrice, and Add Offer reference payloads. Optional If not sent caching is not invoked for journey-based search results contentSourceList String. Supports requesting both or either GDS or NDC content. If not sent only&#160;GDS content is returned. Supported values are: GDS:&#160;Returns only&#160;GDS content. NDC:&#160;Returns only&#160;NDC content. Send both values to return aggregated GDS&#160;and NDC&#160;content: "contentSourceList" : [ "GDS", "NDC"], Optional sortBy Enum. Sorts offers in order by the value in BestCombinablePrice/TotalPrice. Supported value: Price-LowToHigh:&#160;Sorts the offers returned from lowest to highest price. Supported for GDS,&#160;NDC, and combined GDS and NDC content. If sent, offers this sorting also applies to any following Next Leg Search. Upsell offers are not sorted. Travelport recommends as best practice that when sending sortBy and requesting NDC content, do not also send offersPerPage . If sent together some offers may be incomplete. This issue will be addressed in an upcoming release. Note the following when requesting NDC content: NDC-only content when multiple NDC carriers return offers: Without sorting: Search returns NDC offers consecutively by carrier; for example, all NDC AA offers, followed by all NDC UA offers. With sorting: Search returns all offers in ascending price order regardless of carrier. GDS and NDC combined content: Without sorting: Search returns offers by carrier. first for GDS and then for NDC; for example, GDS AA offers, NDC AA offers, GDS UA offers, NDC UA offers. With sorting: Search returns all offers in ascending price order regardless of carrier or content source. Optional maxNumberOfUpsellsToReturn Number. Returns the specified number of upsell fares for each base fare, up to 4 for GDS, 99 for NDC, or as many filed by the airline if fewer than the value sent are available. Values greater than these supported values do not return an error message, but instead max out at the supported upsells per base fare. Upsells are not returned in a specific object but rather are presented along with the base fare as a higher level of service, usually a branded fare. This value carries over to any follow-on Next Leg Search request. Note the following differences for GDS and NDC: For GDS, when maxNumberOfUpsellsToReturn is either not sent or sent as 0, the lowest priced offer is returned. For NDC: When maxNumberOfUpsellsToReturn is not sent, the response returns the lowest priced offer of each available brand or cabin. When maxNumberOfUpsellsToReturn=0, the response returns the lowest priced offer. The number of upsells that can be requested are limited for multi-city itineraries: four to six O&amp;Ds&#160;are limited to one upsell; three O&amp;Ds are limited to two upsells; and one or two O&amp;Ds (one-way or round-trip itineraries) can have up to four upsells for GSD or 99 for NDC. Optional PassengerCriteria Array. Defines the type of passenger traveling. Send one instance of PassengerCriteria for each passenger type code (PTC). Search supports up to 9 total passengers. A maximum of 6 PTCs are supported for GDS. NDC does not have a PTC limitation. May include the optional CustomerLoyalty and TravelerGeographicLocation objects. Required id NDC&#160;only; not supported for GDS. For NDC, use id to assign a custom passenger id to be returned in the response, which supports matching that specific passenger to the PriceBreakdown in the response. Optional passengerTypeCode String. The passenger type code for the passengers on the itinerary. Common PTCs are: ADT: adult CHD: child of unknown age (see Notes on PTC and age below) CNN:&#160;child when age is known INF:&#160;infant without a seat INS:&#160;infant with a seat UNN:&#160;unaccompanied child See the Downloads page to download a full list of PTCs. NDC&#160;carriers BA, SQ, AV, AA, and AF/KLM offer teen/young adult tax exemptions from the UK&#160;Air Passenger Duty (GB tax). Send PTC with the value YTH and send the passenger's age per below. The PTC may be returned as ADT, or C xx in which xx is the age, but the tax exemption is applied in the pricing on these NDC carriers. For marine fares, send the PTC&#160;value SEA. You must also send OSI&#160;remarks at Add Traveler with the vessel name and location. Marine fares are private fares for travelers going to or from a vessel. NDC&#160;only; not supported for GDS. When running a multiple passenger search for NDC on Qantas, Qantas supports only these PTCs: ADT, CHD, CNN, INF. Sending any other PTC may result in an error at ticketing. Required number Number. The number of passengers with this PTC. Required age Number. The age of the passenger. Notes on PTC and age Travelport recommends sending age only with PTCs that require age for pricing. For child passengers, Travelport recommends sending the age of the child in the age attribute plus the PTC CNN. Travelport recommends against sending CNN without age, or the CHD PTC. Many fares cannot be quoted for CHD. The age for CNN&#160;is generally between 2 and 11 inclusive, with ADT fares returned for ages 12 and up; however, this can vary by airline and country. The age for INF&#160;must be either 0 or 1. During booking, date of birth is required for all child and infant PTCs ( Add Traveler payload in Traveler/birthDate). Optional specifiedPassengerTypeCodeOnlyInd &#160; Boolean. true returns only offers for the specified PTC. If no offers for that PTC are available, an error message that offers were found is returned. GDS only; not supported for NDC. Optional Default is false CustomerLoyalty Optional object for sending customer loyalty information, such as for a frequent flyer program. If CustomerLoyalty is sent in the Search request, it must also be sent in the AirPrice request and the Add Traveler request. Because some carriers validate frequent traveler data through the workflow, failing to send the same CustomerLoyalty details, even if invalid, may cause a booking failure. If an invalid number is sent, the response returns a warning message that the FQTV is invalid, and the invalid number is cached to prevent a potential booking failure. NDC only; not supported for GDS. Optional value String. Customer loyalty number. Required if CustomerLoyalty sent supplier String. Customer loyalty program carrier code. Required if CustomerLoyalty sent cardHolderName String. Customer loyalty member name; up to 128 characters are supported. While supported, best practice is to send the individual name fields per below instead. Either cardHolderName or the individual name fields are required. For discounted offers to be returned, the name must be sent as LAST FIRST; e.g.,if SMITH is the last name and JORDAN the first name, send as SMITH JORDAN Optional prefix Prefix for cardholder name. Optional given Cardholder given name. Optional middle Cardholder middle name. Optional surname Cardholder surname. Optional TravelerGeographicLocation Optional object for requesting local citizen/local resident fares for Spain and associated islands. You must also send a PTC relevant to the local resident fares; e.g., ADR for adult resident, CHR for child resident. Any discount applied through TravelerGeographicLocation applies to all travelers, not only to the traveler in this instance of PassengerCriteria. If the discount must apply only to an individual traveler, that traveler requires a separate search and book workflow. Optional value String. IATA code for the city, country, or state/province relevant to the local citizen//local resident fare. Optional travelerGeographicLocationType String. The type of location. Supported values:&#160; City Country State/Province Optional residentGeographicCode String. Resident code for Spanish residency fares for NDC. Any discount will apply to all travelers, not only to the traveler in this instance of PassengerCriteria. Supported/validated only for NDC&#160;to support local citizen fares. Required for NDC specialLargeFamilyResidentDiscountInd Boolean. Send only if true and request qualifies for special large family resident discount, defined as special large families (four or more children) from Spain, from the EU/EEA, or of any other nationality whose residency in Spain is recognized and who are in possession of a large-family certificate issued by the autonomous community in which they live. Supported/validated only for NDC&#160;to support local citizen fares. Optional generalLargeFamilyResidentDiscountInd &#160; Boolean. Send only if true and if request qualifies for general large family resident discount, defined as general large families (up to three children) from Spain, from the EU/EEA, or of any other nationality whose residency in Spain is recognized and who are in possession of a large-family certificate issued by the autonomous community in which they live. Supported/validated only for NDC&#160;to support local citizen fares. Optional PaymentCriteria Optional object to send the BIN of the credit card to be used for payment. Sending the BIN returns OB fees in the response, which are ticketing and form of payment (FOP) fees, including credit card fees. Returned in an instance of Price/PriceBreakdown/Fees/Fee with a feeCode of OB . Includes IssuerIdentificationNumber. Optional IssuerIdentificationNumber String, 6 to 11 digit number. The BIN&#160;of the credit card to be used for payment. Required if PaymentCriteria sent SearchCriteriaFlight &#160; Array. Each instance defines one leg of the itinerary by specifying an origin and destination (O&amp;D) pair, aka departure and arrival location, for that leg. Send one instance of SearchCriteriaFlight for each leg of the itinerary. You must specify all O&amp;D pairs for all legs of the itinerary, even for a leg-based search . Search, Next Leg Search, and Flight Specific Search support a maximum of six O&amp;D pairs for both GDS and NDC. Includes From and To objects. Required departureDate String. Preferred local departure date in YYYY-MM-DD format (e.g., departureDate="2025-12-06"). For GDS, send either departureDate or arrivalDate. If both departureDate and arrivalDate are sent, departureDate is ignored. For NDC, departureDate is required. Optional for GDS Required for NDC daysBeforeDeparture Invokes Premium Flex Search Dates feature. Send to specify a number of days to search before the date in departureDate, up to three days.&#160;Supported values: 1 2 3 GDS&#160;only; not supported for NDC. Must append /premiumflex to the endpoint. See Premium Flex Search in the Air Search&#160;Guide for usage and examples. Optional daysAfterDeparture Invokes Premium Flex Search Dates feature. Send to specify a number of days to search after the date in departureDate, up to three days.&#160;Supported values: 1 2 3 GDS&#160;only; not supported for NDC. Must append /premiumflex to the endpoint. See Premium Flex Search in the Air Search&#160;Guide for usage and examples. Optional legSequence Number. Recommended to send when requesting cabin, class of service, and/or connection preferences at the leg level. See legSequence below in the SearchModifiersAir table. Do not send if requesting preferences at itinerary level. Show Example SearchCriteriaFlight/legSequence with CarrierPreference at leg level { "CatalogProductOfferingsQueryRequest": { "CatalogProductOfferingsRequest": { "@type": "CatalogProductOfferingsRequestAir", "maxNumberOfUpsellsToReturn": 4, "contentSourceList": [ "GDS" ], "PassengerCriteria": [ { "@type": "PassengerCriteria", "number": 1, "passengerTypeCode": "ADT" } ], "SearchCriteriaFlight": [ { "@type": "SearchCriteriaFlight", "departureDate": "2025-12-15", "legSequence": 1, "From": { "value": "DEN" }, "To": { "value": "FRA" } }, { "@type": "SearchCriteriaFlight", "departureDate": "2025-12-25", "legSequence": 2, "From": { "value": "FRA" }, "To": { "value": "DEN" } } ], "SearchModifiersAir": { "@type": "SearchModifiersAir", "CarrierPreference": [ { "@type": "CarrierPreference", "preferenceType": "Preferred", "carriers": [ "UA" ], "legSequence": [ 1 ] }, { "@type": "CarrierPreference", "preferenceType": "Preferred", "carriers": [ "LH" ], "legSequence": [ 2 ] } ] } } } } Optional departureTime String. Returns NDC&#160;offers with flights between two hours before and two hours after the departure time; for example, for departureTime of 10:00:00, Search returns available flights between 8:00 and 12:00. Do not use for GDS; instead, use DepartureTimeRange. For NDC content, if multiple time options are sent in the same instance of SearchCriteriaFlight, they are applied in the order DepartureTimeRange, departureTime, and arrivalTime. Optional arrivalDate String. Date of arrival in YYYY-MM-DD format (e.g., arrivalDate="2025-12-06"). For GDS, send either arrivalDate or departureDate. If both departureDate and arrivalDate are sent, departureDate is ignored. For NDC, arrivalDate is optional and departureDate is always required; if sent, offers returned are filtered by both arrivalDate and departureDate. Optional arrivalTime String. Returns NDC&#160;offers with flights between two hours before and two hours after the arrival time; for example, for arrivalTime of 10:00:00, Search returns available flights between 8:00 and 12:00. Do not use for GDS; instead, use ArrivalTimeRange. Supported only by specific NDC carriers. For detailed NDC&#160;support by carrier, see the Knowledge Base article NDC capabilities by airline through JSON API (see Knowledge Base NDC&#160;Resources if you need login assistance). Optional From Object. Required value String. The IATA airport or city code for the departure airport/city for this leg. Required cityOrAirport String. Optional enumeration specifying whether to restrict the search based on the city/airport code sent in From/value. Supported values: City Only Airport Only City or Airport Possible options and behavior are as follows. These behaviors are for availability selection only. Actual content may vary based on calculated price and diversity. Not all NDC carriers may support all options. cityOrAirport Options Behavior Airport code with no cityOrAirport value Expands the availability selection to the city while giving preference to the requested airport. For example, LGA would return flights for LGA, EWR, and JFK but would target more content from LGA. City code with no cityOrAirport value Returns an unweighted selection of inventory for all airports in the city. For example, NYC would search content equally between LGA, EWR, and JFK. This behavior also applies to: City code with Airport Only Note: &#160;For NDC, do not use the Airport Only value, as any flight segment that does not match the search criteria are removed. City code with City Only City or airport code with City or Airport Note: &#160;Use this value when sending metro codes, such as PAR, LON, and NYC. Airport code with cityOrAirport value Airport Only Returns content only from the specified airport. For example, LGA will return content from only LGA. Airport code with cityOrAirport value City Expands the availability selection to the city without giving preference to the requested airport. This behavior is equivalent to searching with the airport's city code. For example, LGA would instead be treated as NYC and would return flights for LGA, EWR, and JFK with no preference. Optional To Specifies destination. Required value String. The IATA location code for the arrival city/airport for this leg. Required cityOrAirport String. Optional enumeration specifying whether to restrict the search based on the city/airport code sent in value. Supported values: City Only Airport Only City or Airport See the table in From/cityOrAirport above for options and behavior. Optional DepartureTimeRange Object. Supports searching by a departure time window for any leg of the itinerary. Optional start String in HH-MM format. The start time of the departure time window to search. Either start or end is required. Optional end String in HH-MM format. The end time of the departure time window to search. Either start or end is required. Optional ArrivalTimeRange Object. Supports searching by an arrival time window at the destination. For NDC, supported only by specific NDC carriers. For detailed NDC&#160;support by carrier, see the Knowledge Base article NDC capabilities by airline through JSON API (see Knowledge Base NDC&#160;Resources if you need login assistance). Optional start String in HH-MM format. The start time of the arrival time window to search. Optional end String in HH-MM format. The end time of the arrival time window to search. Optional SearchModifiersAir (optional journey modifiers) Show SearchModifiersAir Table Add one or more optional modifiers to filter search results by criteria related to the journey itself. All journey modifiers are in CatalogProductOfferingsQueryRequest/CatalogProductOfferingsRequest/SearchModifiersAir. Any modifiers sent in the initial Search request are applied to any subsequent Next Leg Search request. Object Description Required SearchModifiersAir Object for optional modifiers based on journey criteria. All modifiers apply to the entire itinerary, not at the leg level, unless otherwise specified with legSequence per below. Any modifiers or indicators sent in this request carry over to the Next Leg Search request and are not re-sent. Optional excludeGround Excludes certain ground transportation from the response. By default, the response may return ground transportation options such as trains and buses, depending on the routing. Supported values: All: Excludes all ground transportation. Train: Excludes train travel but not other types of ground transportation. In the response, ground transportation options are identified in ReferenceList/Flight by the TRN, TRS, or BUS equipment codes. Optional prohibitChangeOfAirportInd Boolean. Suppresses return of offers that require a change of airport at connection. true: Excludes itineraries that require changing airports during connections. false: May return itineraries that require change of airport. Default. Optional ConnectionPreferences Top level object to search by connection preferences. When sending ConnectionPreferences for NDC, the request must include SearchCriteriaFlight/From/cityOrAirport with a value of either City Only or Airport Only; sending the City or Airport value is not supported. Show Example ConnectionPreference This example excludes the return of flights that connect through LON, MIL, or ROM on the first leg of the itinerary. "SearchModifiersAir": { "ConnectionPreferences": [ { "@type": "ConnectionPreferences", "legSequence": [ 1 ], "preferenceType": "Prohibited", "ConnectionPoint": [ "LON", "MIL", "ROM" ] } ] } Optional maxConnectionDuration String. Limits results to itineraries that do not exceed a set length of time between flights on the same leg. Applies to all connections on the itinerary. Use the format PT {x} H, in which P is the duration designator, T is the time designator, and {x} H is the number of hours the connection should not exceed (e.g., "maxConnectionDuration" : "PT3H"). For minutes use {x} H {x} M (e.g., "maxConnectionDuration" : "PT3H45M"). GDS only, not supported for NDC . Optional maxOvernightDuration String. Limits results to itineraries that do not exceed a set length of time for any overnight connection. If the first flight in the connection arrives on one calendar date and the connecting flight arrives on another calendar date, this constitutes an overnight connection. See maxConnectionDuration above for supported format. GDS only, not supported for NDC . Optional legSequence Applies preference to only specific leg/s of the itinerary; see legSequence below. Do not send for preference at itinerary level. Optional preferenceType String. The type of connection preference. Supported values are: Permitted: Returns only results that connect through one or more of the specified locations in ConnectionPoint. An error is returned if there is no availability through the specified connecting location/s. Prohibited: Excludes results that connect through one or more of the specified locations in ConnectionPoint. Preferred: Weights results that connect through one or more of the specified locations in ConnectionPoint. Only one preference type can be requested for an O&amp;D pair. Required ConnectionPoint String. IATA code for the connecting location/s for this preference. For example, if you specify three locations, for GDS, any flights connecting in any one of those locations will be permitted/preferred/prohibited per the specified preferenceType. For NDC, only itineraries that match all connection location/s are returned. Required CarrierPreference Array. Preference for specific airline/s, allowing you to limit, exclude, or weight toward one or more carriers. Only one carrier preference type is allowed per request, but there is no limit to the number of carriers that can be permitted, prohibited, or preferred. Any preferences sent in the initial Search request are applied to any subsequent Next Leg Search request. Optional preferenceType String. The type of carrier preference. Supported values are: Permitted: Returns only results on the specified carrier/s. Returns error if carrier/s do not have availability within the requested search parameters. Prohibited: Excludes results from the specified carrier/s. Preferred: Weight results toward preferred carrier/s and interline connections with other carriers. Notes: If carrier has no service on the requested route, no offers are returned. Preferred alliances are supported for GDS only, not NDC. Send the alliance code instead of the carrier code. Required carriers String. One or more carrier codes to permit, prohibit, or prefer. Preferred alliances are also supported; send the alliance code (e.g., /*A) instead of the carrier code. Required legSequence Applies the carrier/alliance preference to only specific legs of the itinerary; see legSequence below. Do not send if requesting preference at itinerary level. GDS only, not supported for NDC . Optional CabinPreference Array. Requests a fare based on the cabin class. Only one cabin preferenceType (Permitted, Preferred, PreferredWithUpgrade) is allowed per request, but there is no limit to the number of cabins that can be sent. Any CabinPreference in the initial Search request is applied to any subsequent Next Leg Search and reference Flight Specific Search requests. Optional cabins String. A space-delimited list of cabins. Supported values are (no default): Economy PremiumEconomy Business First PremiumFirst Required preferenceType Supported values: Permitted: Searches for ONLY the specified cabin class or classes. Returns error if class is not available. Preferred: Searches for the specified cabin class/es, and will return lower classes if not available. PreferredWithUpgrade: Searches for the specified cabin class/es and higher classes. Sending a mix of preferenceType values is not supported. For example, you cannot send an instance of CabinPreference with a preferenceType of Permitted and another instance with preferenceType of Prohibited. In this case the results default to the Preferred preference. Required legSequence Limits preference to the specified leg. You can apply the preference to only some legs of the itinerary, or different preferences to different legs. Best practice is to also send legSequence in SearchCriteriaFlight. To apply preference to the entire itinerary, do not send legSequence. Leg level preference is supported only for CarrierPreference, CabinPreference, and ClassOfServicePreference. GDS only, not supported for NDC . Show Example CabinPreference applied to itinerary { "SearchModifiersAir" : { "CabinPreference" : [ { "@type" : "CabinPreference", "preferenceType" : "Preferred", "cabins" : [ "PremiumFirst", "First", "Business" ], }] } Show Example CabinPreference at leg level - single cabin preference on two legs { "SearchModifiersAir": { "@type": "SearchModifiersAir", "CabinPreference": [ { "@type": "CabinPreference", "preferenceType": "PreferredWithUpgrade", "cabins": [ "PremiumFirst", "First", "Business" ], "legSequence": [ 1, 3 ] } ] } } Show Example CabinPreference at leg level - different cabin preference for different legs "SearchModifiersAir" : { "@type": "SearchModifiersAir", "CabinPreference" : [ { "@type" : "CabinPreference", "preferenceType" : "Permitted", "cabins" : [ "First", "Business" ], "legSequence" : [ 1, 4 ] }, { "@type" : "CabinPreference", "preferenceType" : "Permitted", "cabins" : [ "PremiumEconomy", "Economy",], "legSequence" : [2, 3 ] } ] } Optional ClassOfServicePreference &#160; Array. Specifies preference around a class of service. Includes PreferenceType. GDS only, not supported for NDC . Optional legSequence Applies preference to specified leg/s of the itinerary; see legSequence above. Do not send if requesting preference at itinerary level. Best practice is to also send legSequence in SearchCriteriaFlight. Optional ClassesOfService One or more classes of service to permit or prohibit. Required PreferenceType Supported values: Permitted: Searches for ONLY the specified class of service. No offers returned if not available. Prohibited: Excludes class of service from offers returned. Optional ConnectionPreferences Top level object for connection preferences. Must send with @type “ConnectionPreferencesAir” when sending FlightType. If the @type value is not sent, FlightType is ignored for GDS; for NDC, a time out error is returned. Optional FlightType Object. Specifies search preferences about connections and stops. Optional connectionType String. Limits the connection type returned. Supported values (no default): NonStopDirect:&#160;Direct flight from the origin to the destination without a stop. StopDirect:&#160;Direct flight from origin to destination with a stop that does not have a change in flight number. SingleConnection:&#160;Flight options requiring one change of planes. DoubleConnection: Flight options requiring two changes of planes. Each value returns the specified type and all higher types. For example, StopDirect could return both flights that stop without a change of planes (StopDirect) and non-stop direct flights (NonStopDirect). SingleConnection or DoubleConnection will not exclude StopDirect flights from the journey. For example, SingleConnection could return an itinerary with two flight numbers, and either of these flights could have intermediate stops. Optional excludeInterlineConnectionsInd Boolean. Excludes interline connections Connecting flights from multiple carriers handled by one carrier per an agreement between those carriers. from results. true: Does not return offers with interline connections. false: May return interline connections in results. Default. GDS only, not supported for NDC . When a product contains multiple interline air segments, brand details return only the brand of the significant carrier, not the validating/plating carrier brand information. The IATA rules for determining the significant carrier on an itinerary are based on the areas in which the transportation takes place. Optional ProductInclusionPreference Object to limit offers returned to fares that include in the price the brand attributes specified in Classification. The response also returns information about other brand attributes, which may be included, chargeable, or not offered. Optional Classification String. Send one or more of the following values to return only fares that include those attributes in the price. For example, sending CarryOn returns only fares that include a carry-on bag in the price. CarryOn Refund Meals Rebooking CheckedBag SeatAssignment WiFi LieFlatSeat PremiumSeat PersonalItem If any brand attributes are sent other than the supported attributes listed above, ProductInclusionPreference is ignored and the lowest fares are returned regardless of associated brand attributes. See Branded Fares and Upsells for details. Required if ProductInclusionPreference sent CustomResponseModifiersAir Object. Sends additional modifiers. May include BrandAttributeInclusion. Optional excludePenaltiesInd Boolean. Indicator to omit change and cancel penalties. true: Omits all penalty information from the response. false:&#160;Returns any change and penalty details provided by carrier for each offer in TermsAndConditionsFullAir/Penalties. Default. GDS only; not supported for NDC. excludePenaltiesInd can also be sent in the AirPrice request . If sent in Search but not in AirPrice, the value sent in Search is cached and applied to the AirPrice results. However, you can override the value sent in Search by sending excludePenaltiesInd in the AirPrice request with the opposite value. For example, if the Search request sends excludePenaltiesInd=true and the AirPrice request sends excludePenaltiesInd=false, the Search response does not return penalties and the AirPrice response does return penalties. Optional excludeUnbundledFaresInd &#160; Boolean. Sets whether to return unbundled fares: true: Does not return unbundled fares. false: Returns unbundled and bundled fares as available. Default. GDS only, not supported for NDC . Optional BrandAttributeInclusion Object.&#160;Supports returning only information about the brand attributes specified in Classification below and does not return any other brand attributes for those fares. Optional Classification String. Send one or more of the following values to return information about only the specified attributes. Fares may include other attributes but information about them is not returned. Supported values: CarryOn Refund Meals Rebooking CheckedBag SeatAssignment WiFi May include AdditionalClassification. Required if BrandAttributeInclusion sent AdditionalClassification String. Send one or more of the following values to return information about only the specified additional attributes. Supported values: ChauffeurTransfer ExtraLegroom InFlightEntertainment LoungeAccess PriorityBaggage PriorityBoarding PriorityCheckIn PrioritySecurity PriorityServices MileageAccrual Upgrades USB Optional PricingModifiersAir (optional pricing modifiers) Show PricingModifiersAir Table Add one or more optional modifiers to filter search results by pricing criteria. All pricing modifiers are in CatalogProductOfferingsQueryRequest/CatalogProductOfferingsRequest/PricingModifiersAir. Object Description Required PricingModifiersAir Object for modifiers to filter search results by price criteria. May include FareSelection, FareSelectionDetail, OrganizationInformation, and PricingAgency. Any modifiers or indicators sent in this request carry over to the Next Leg Search request and are not re-sent. Optional currencyCode String. Send the currency type to return if you want to override the default currency specified with your PCC. For a list of currency codes, see the Universal API&#160;Reference Data file linked from Downloads . Optional sellCity String. The IATA location code for the city. Overrides the sell city of the requester to specify an alternate sale location and return fares based on that location. GDS only, not supported for NDC. Optional ticketCity String. The IATA location code for the city. Overrides the ticketing city of the requester to specify an alternate ticket location and return fares based on that location. GDS only, not supported for NDC. Optional TicketingPCC String, 2-10 characters supported. Overrides the ticketing PCC&#160;associated with your account to specify an alternate PCC and return fares based on that PCC. GDS only, not supported for NDC. Optional PricingPCC String, 2-10 characters supported. Use to send a faring PCC for which a selective access or code group agreement exists between that PCC and the PCC associated with your account. The following combinations of PricingPCC and FareSelection/fareType=PrivateFaresOnly return results as follows: PricingPCC sent and PrivateFaresOnly not requested: If a selective access or group agreement exists, both public and private fares (if available) are returned for the requesting and providing PCC. PricingPCC sent and PrivateFaresOnly not requested: If no selective access or group agreement exists, only public fares are returned. PricingPCC sent and PrivateFaresOnly is requested: If a selective access or group agreement exists that allows private fare access, private fares (if available) are returned for the requesting and providing PCC. PricingPCC sent and PrivateFaresOnly is requested: If a selective access or group agreement exists but does not allow private fares access, or if no agreement exists, an error is returned. GDS only, not supported for NDC. Optional includeSplitPaymentInd Boolean. Requests request split ticketing , which returns outbound and inbound one-way fares in addition to round trip options. This may result in lower fares than the same or similar round-trip itinerary. true: Requests split ticketing. false: Split ticketing options are not returned. Default. GDS only, not supported for NDC. See Split Ticketing in the Air Search&#160;Guide for usage and examples. When split ticketing is requested, the Search response returns offers in the following order: Outbound one-way offers Inbound one-way offers Round trip offers The response identifies all one-way outbound and inbound offers with CombinabilityCode j0. CombinabilityCode values for round trip offers start at j1 and increment by one for each offer. Split ticketing is not supported for round-trip leg-based searches, virtual interlining, NDC, in the Next Leg Search or Flight Specific Search APIs, for round-trip journey-based offers, or for upsells. Split ticketing is available only for customers specifically provisioned for split ticketing. Split ticketing returns one-way outbound and one-way inbound fares in addition to round-trip offers. Split ticket offers are identified with CombinabilityCode j0. If your account is not configured for split ticketing, sending includeSplitPaymentInd returns a response without split ticket offers and a warning message. GDS only, not supported for NDC . Optional SplitPaymentOfferings Number between 0 and 99. Send with includeSplitPaymentInd to configure the percentage of round trip offers to return in a split ticketing response. By default, Search divides the split ticketing response into 34% round-trip offerings and the remainder as split ticketing offers, which are combined outbound and inbound one-way fares. To change this percentage, send SplitPaymentOfferings with the percentage value of round trip offers to return. Optional returnMostRestrictiveBrandInd Boolean. When there are different brands on a connecting flight, return information for either the most restrictive brand or the brand on the most significant segment on the itinerary. Supported values: true:&#160;Return the offer brand of the most restrictive brand. false: Return the offer brand of the most significant segment of the itinerary. GDS only, not supported for NDC. Optional If not sent default is false FareSelection Object. May include FareSelectionDetail, RefundOptions, ChangeOptions objects. Optional fareType String. Requests the return of specified fare types including private fares (negotiated), public fares (published), or net fares (consolidator fares, or any negotiated wholesale price that is further marked up for sale to customers). Supported values: PublicFaresOnly PrivateFaresOnly PublicAndPrivateFares (default value) NetFaresOnly (Net fares are returned if available even if not requested. Not supported for NDC .) AllFares:&#160;Returns public and private fare offers and net fare offers in one request. The response identifies the type of fare returned for each Product in PassengerFlight/FlightProduct @fareType. Possible values in the response are AirlinePrivateFare, AgencyPrivateFare, NetFare, or PublicFare. Optional validatingCarrier String. Send a carrier code to override the default plating carrier. GDS only, not supported for NDC. Optional FareQualiferString (sic, note spelling of Qualifer with no i; object name is NOT FareQualifierString) String. Request specific private leisure fares. Supported values vary by NDC carrier. For detailed NDC&#160;support by carrier, see the Knowledge Base article NDC capabilities by airline through JSON API (see Knowledge Base NDC&#160;Resources if you need login assistance). NDC only; not supported for GDS. Show Example excerpt "PricingModifiersAir": { "@type": "PricingModifiersAir", "FareSelection": { "@type": "FareSelectionDetail", "fareType": "PrivateFaresOnly", "FareQualiferString": [ "VistFriendsAndRelatives" ] } }, Optional FareQualifier Do not use FareQualifier; instead send FareQualiferString above. If both are sent, the value in FareQualiferString is applied and any value in FareQualifier is ignored. NDC only; not supported for GDS. Optional FareSelectionDetail Object to request fares with specific restrictions. GDS only; not supported for NDC. No NDC&#160;content is returned if any of the following are sent with true . The following Boolean indicators are supported; the default value for all is false : prohibitAdvancePurchaseFaresInd: true returns only fares that do not require advance purchase. prohibitMaxStayFaresInd: true returns only fares that do not require a maximum stay. prohibitMinStayFaresInd: true returns only fares that do not require a minimum stay. refundableOnlyInd: true returns only fares that are fully refundable. The response does not return any indicators about these conditions. Optional ChangeOptions String array. Supports requesting only fares that meet certain change criteria. Key value pair: changeTypes :&#160;String. Returns only fares with the specified change type: Changeable: Changeable fares. NonChangeable: Nonchangeable fares. PenaltyToChange:&#160;Changeable with a penalty. GDS&#160;only; not supported for NDC. Also see note below for RefundOptions. Optional RefundOptions Supports requesting only fares that meet certain refund criteria. Key value pair: refundTypes :&#160;String. Returns only fares with the specified refund criteria: Refundable: Fully refundable fares. NonRefundable: Nonrefundable fares. PartialRefund:&#160;Fares that allow for a partial refund, defined as a refund penalty that is 98 percent or less of the fare component amount. GDS&#160;only; not supported for NDC. Search supports sending up to 12 refundability and changeability options. The following combinations are mutually exclusive; if sent, Search ignores them and returns a warning message: NonRefundable cannot also be sent with PartialRefund Refundable cannot also be sent with ChangeOptions/changeTypes=PenaltyToChange Optional OrganizationInformation &#160; Object. Sends account code/s to request negotiated fares. Includes OrganizationIdentifier. Optional OrganizationIdentifier &#160; Array. Account code/s to return negotiated fares. The response returns an instance of TermsAndConditions/OrganizationInformation/OrganizationIdentifier for each account code sent. Qantas supports only one account code. If multiple codes are sent, only the first code is processed. For NDC&#160;only, if the account code/corporate ID number is sent as a pricing modifier in OrganizationIdentifier in the Search request, that number is retained and sent at workbench commit without having to enter it in any additional step after Search. The account code/corporate ID number is returned in the workbench commit and reservation retrieve responses. NDC&#160;only; not supported for GDS. Show Example excerpt to send multiple account codes "OrganizationIdentifier" : [{ "value" : "XYD123", "supplier" : "UA", "type" : "Account" }, { "value" : "ABC123", "supplier" : "LH", "type" : "Account" }] Optional organizationCodeType String. Sends a description for the OrganizationIdentifer value. Supported values: Account: Use to send an account code. The following values are supported only for NDC: OrganizationLoyaltyProgram:&#160;NDC&#160;corporate ID. Tour: NDC tour code. TicketDesignator: NDC ticket designator. Optional value String. The account code to apply. For GDS, up to 15 account codes are supported. For NDC, 1 account code per carrier is supported. Required supplier String. The IATA&#160;code for the airline on which the account code is applicable. Optional accountCodeFaresOnlyInd Boolean. Indicator to limit the fares returned to only fares filed for that account code. true: Returns only fares filed for the account code/s in OrganizationIdentifier/value. If sending multiple account codes, send with each instance of OrganizationIdentifier. false: Returns account fares and other fares. Default. If an account code is sent without accountCodeFaresOnlyInd=true, the response includes any fares filed for that account code plus fares that are not specific to the account code. If accountCodeFaresOnlyInd=true and no account code is sent, the indicator is ignored and the response returns all fares and a warning message that the request must include an account code. GDS&#160;only; not supported for NDC. Optional PromotionalCode Any promotional code. NDC&#160;only; not supported for GDS. Optional value String. The promotional code to apply. Required supplier String. The IATA&#160;code for the airline on which the promotional code is applicable. Required ManualFareAdjustment Number up to two decimal places. Send to manually adjust the base fare amount on all fares. You can adjust the base fare for all PTCs or only specified PTCs. You can increase or decrease the base fare by either an amount or a percentage. Send with @type value ManualFareAdjustmentDiscount to decrease the base fare. Send with @type value ManualFareAdjustmentIncrease to increase the fare. GDS only, not supported for NDC. If the PCC currency and the country of origin currency are different, then the amount or percentage of the filed amount base fare is converted into the PCC currency. Show Example excerpt The following excerpted PricingModifiersAir object increases the base fare by an amount of 10.5 for ADT passengers, and discounts the base fare by 5% for CHD passengers. "PricingModifiersAir": { "@type": "PricingModifiersAir", "ManualFareAdjustment": { "@type": "ManualFareAdjustmentIncrease", "passengerTypeCodes": [ "ADT" ], "AmountPercent": { "@type": "AmountPercentAmount", "Amount": { "value": 10.5 } } }, { "@type": "ManualFareAdjustmentDiscount", "passengerTypeCodes": [ "CHD" ], " AmountPercent ": { "@type": "AmountPercentPercent", "Percent": 5 } } ] Optional passengerTypeCodes Send the PTC/s to be increased or decreased. This increases or decreases the fare for all passengers with the PTC/s. If not sent, ManualFareAdjustment applies to all PTCs. Optional AmountPercentPercent Send to adjust the base fare by a percentage. Either AmountPercentPercent or AmountPercentAmount is required if ManualFareAdjustment is sent AmountPercentPercent/Percent Send percentage of the base fare to be decreased or increased, up to two decimal places. For example, the value 20.5 would either increase (when sent in @type ManualFareAdjustmentIncrease) or decrease (when sent in @type ManualFareAdjustmentDiscount) the base fare by 20.5%. Optional AmountPercentAmount Send to adjust the base fare by an amount. &#160; Either AmountPercentPercent or AmountPercentAmount is required if ManualFareAdjustment is sent AmountPercentAmount/Amount Send the amount value to either increase or decrease the base fare, up to two decimal places. For example, the value 14.75 for a base fare in&#160;the currency USD would either increase (when sent in @type ManualFareAdjustmentIncrease) or decrease (when sent in @type ManualFareAdjustmentDiscount) the base fare by $14.75. Optional TaxExemption GDS only, not supported for NDC. Marks as tax exempt either all taxes, only specific tax codes, or all taxes in specific countries. Send either allTaxesExemptInd OR countries and taxCodes per below. TaxExemption supports up to nine values for countries, for taxCodes, or for countries and taxCodes combined. The response returns any exempt taxes with exemptInd=true and a zero value. Optional countries Array. One or more two-letter alphanumeric codes for the countries in which the taxCodes sent are tax exempt. Optional taxCodes Array. One or more two-letter alphanumeric tax codes to mark as exempt. Optional allTaxesExemptInd Boolean. Marks all taxes as exempt. true: Marks all taxes in the response as exempt. false: Do not send if false; instead, use countries and taxCodes to specify which taxes to exempt. Optional MultiPricingAgency String array. Invokes Premium Flex Search POS feature. Send up to three PCCs to return offers for those point of sale agencies in addition to your provisioned PCC. GDS&#160;only; not supported for NDC. Must append /premiumflex to the endpoint. See Premium Flex Search in the Air Search&#160;Guide for usage and examples, and usage of the Accept header value to specify returning aggregated or streamed content. Optional SearchControlConsoleChannelID The Search API supports the Travelport Content Optimizer (formerly known as Search Control Console (SCC)). Travel agency administrators use Content Optimizer to create business rules for filtering certain air shopping results. If your application does not use Content Optimizer, do not use these objects. Contact your Travelport representative if you would like additional information. Show SearchControlConsoleChannelID Table Object Description Required SearchControlConsoleChannelID Object for Content Optimizer/SCC attributes. Do not send if you do not use Content Optimizer. Optional value String for the Content Optimizer channel ID. Optional sccType String for the Content Optimizer type. GDS only; not supported for NDC. Optional Response The tables in this section break down the Search response into several of its objects,&#160;using a table for each. The Next Leg Search and Flight Specific Search responses share this structure. See the Air Search Guide for a response diagram and description. Object Description CatalogProductOfferingsResponse Top level object for Search response. Includes CatalogProductOfferings,&#160;Result, and ReferenceList. Key value pairs: transactionId : System-generated unique ID for this response. Can be used for internal tracking and troubleshooting. traceId : Returned if a custom trace ID was sent in the request header. See Transaction and Trace IDs for details. See Identifiers in the JSON &#160;APIs for more about identifiers across all JSON &#160;APIs. If the request invoked streaming content for Premium Flex Search , multiple instances of CatalogProductOfferingsResponse are returned. GDS&#160;only; not supported for NDC. See Premium Flex Search in the Air Search&#160;Guide for usage and examples. CatalogProductOfferings CatalogProductOfferings is the top level object that groups all the offers in the response. Each instance of CatalogProductOffering is one offer. Show CatalogProductOfferings Table CatalogProductOfferings Object Description CatalogProductOfferings Top level object that groups all offers. Includes Identifier and CatalogProductOffering objects. Identifier Returns identifier for the entire response. Key value pairs: authority : Source of information. value : Unique system-generated identifier. These identifiers must be sent in any subsequent Next Leg Search request as well as other steps in any reference payload workflow. If your workflow subsequently references a journey-based A search that returns offers for all legs on the itinerary. A journey-based Search request is a standalone search.&#160;No additional search requests are required. search result, the Search request must send offersPerPage set&#160;to any positive number. This setting invokes caching to allow subsequent requests to refer to these search results. If a journey-based Search request does not send offersPerPage, any subsequent reference payload requests fail , including the Flight Specific Search, AirPrice, and Add Offer reference payloads. CatalogProductOffering Array. Each instance of CatalogProductOffering returns one offer on one leg of the itinerary. In the JSON Search APIs, an offer In the Search APIs, an offer is a product available at a specific price under a set of terms and conditions. An offer includes the flight or connecting flights for one leg of the itinerary, plus a service level that includes the cabin class and any fare codes that may apply. At booking, the selected offer from the Search response - including the flight/s, service level, price, terms and conditions, and brand if applicable - is converted into a single Offer object that is subsequently returned for that booking. is a product available at a specific price under a set of terms and conditions. A product In the APIs, a product is the term used in the model for one leg of the itinerary. It includes the flight or connecting flights between one origin and destination pair; e.g., LON &gt; EWR. Product information also includes a service level of the cabin class and any applicable fare codes. is the flight or connecting flights for one leg of the itinerary, plus a service level that includes the cabin class and any fare codes that may apply. At booking, the selected offer from the Search response - including the flight/s, service level, price, terms and conditions, and brand if applicable - is converted into a single Offer object that is subsequently returned for that booking. A leg-based Search response returns instance/s of CatalogProductOffering on only the first leg, indicated by sequence value 1 . It must be followed by a Next Leg Search request. A journey-based Search response returns instance/s for all legs, each indicated with sequence values 1 or 2 , or 3 for the third leg of multi-city itineraries. In a Next Leg Search response, the first instance of CatalogProductOffering is the offer chosen for the first leg (sequence 1 ). Subsequent instance/s are offers on the second leg (sequence value 2 ). Includes Departure, Arrival, Brand, and ProductBrandOptions objects. May include UpsellOffering for NDC. Key value pairs: sequence : Indicates the order of this leg in the itinerary: 1 for the first leg, 2 for the second leg, 3 for the third leg of multi-city itineraries. (Search supports up to three legs.) id : The internal id for the offers in this instance: for GDS, o1, o2, and so on. NDC identifiers incorporate the carrier code into these types of IDs:&#160;QF_COPO0, SQb5, AAt5, etc. If the request invoked aggregated content for Premium Flex Search , the internal IDs in flex search responses start with with the letter f and a number, as in as in f1o1 for offer ids, f1j0 for CombinabilityCode, f1p0 for ProductRef, f1b0 for BrandRef, f1s1 for FlightRef, and f1T0 for TermsAndConditionsRef. GDS&#160;only. Search merges offers for offers for the same itinerary at the same price from GDS and NDC sources. A merged offer returns a CatalogProductOffering/id value that combines the standard GDS and NDC id numbers. For example, if a GDS offer that has id 03 is merged with an NDC offer that has id UA_CPO0 , the merged id is 03-UA_CPO0 . See Merged GDS and NDC Offers (Content Curation Layer) in the Air Search Guide for details. Departure IATA code for departure airport or city for this leg of the itinerary. Arrival IATA code for arrival airport or city for this leg of the itinerary. FlexNextLeg Returned for each offer only when the request invokes Premium Flex Search Dates for aggregated content for a leg-based search. Key value pair: departureDate : The return date of the product (the next leg) that is combinable with the outbound product at the price and terms and conditions in that offer. Brand Lists reference numbers for brands returned. Only one instance of Brand is returned if no upsells are returned for that offer. UpsellOffering NDC only; not supported for GDS. The UpsellOffering object is returned for NDC offers on United Airlines (UA) only when dynamic bundle fares (DBF) are available. UA DBFs are returned by default when available and NDC content has been requested. Not returned for GDS or other NDC carriers. The UpsellOffering object is returned in Search for NDC only, and only for DBFs. It does not return upsells in general. Upsells are returned for all carriers, both GDS and NDC, if requested with maxNumberOfUpsellsToReturn and if filed by the carrier. Upsells are not returned in a specific object but instead are presented along with the base fare as a higher level of service, usually a branded fare. Booking DBFs is under development; DBFs cannot be booked in the JSON APIs. Show Example UpsellOffering instance { "@type": "UpsellOffering", "productRefs": [ "UAp18", "UAp3" ], "id": "upsellOffering_1", "ProductBrandOptions": [ { "@type": "ProductBrandOptions", "ProductBrandOffering": [ { "@type": "ProductBrandOfferingHost", "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 0, "TotalPrice": 85, "PriceBreakdown": [ { "@type": "PriceBreakdownAncillary", "quantity": 1, "Description": { "code": "B01", "subCode": "B01", "value": "Economy Plus" } } ] } } ] } ] }, ProductBrandOptions Array. Each instance groups the products available on this offer. Includes ProductBrandOffering. ProductBrandOffering Object Description ProductBrandOffering Returns one product in this offer and related details about it. Search returns the indicator bestMatchInd=true when all brand attributes requested in ProductInclusionPreference\Classification are available for a fare. Not returned if false. If no upsells are available or requested, each ProductBrandOptions returns one instance of ProductBrandOffering - one per product . This instance is the base fare and usually is identified with the brandRef value b0 . In this case, every product in one offer shares the same price, brand, and terms and conditions. If upsells are returned, each ProductBrandOptions returns multiple instances of ProductBrandOffering - one per brand . In this case, each brand in one offer shares the same price but not necessarily products or terms and conditions. See Offers with and without Upsells in the Air &#160;Search Guide for layout diagrams. Includes Brand, Product, TermsAndConditions, CombinabilityCode, BestCombinablePrice, ContentSource, and CO2EmissionsData if requested. Price The Search APIs do not return the Price object unless your PCC is specifically provisioned to return it. ProductBrandOffering/Price has been removed from all offers and is not returned unless your PCC is provisioned to return it. See Multi-city offers with stopovers (price details in BestCombinablePrice only) for details and examples. Pricing must be validated instead in ProductBrandOffering/BestCombinablePrice. You can opt out of this change by contacting your Travelport representative. If so, multi-city offers with stopovers are not returned for your PCC, and all offers return both Price and BestCombinablePrice. ProductBrandOffering/ Identifier A standard Identifier object returned only for leg-based search responses when both GDS and NDC content is requested. Not returned for journey-based search responses or when only NDC or only GDS content is requested.&#160;Key value pairs: bestMatchInd : Returned as true if brand attributes were requested with ProductInclusionPreference\Classification and all attributes sent are available for this offer. Not returned if false. MatchedAttributes If ProductInclusionPreference\Classification was sent in the request, returns the number of those attributes requested there that are available for this fare. Brand Top level object for brand in this instance of ProductBrandOffering. Includes BrandRef. BrandRef Reference id that matches to brand in ReferenceListBrand/Brand. If the request invoked aggregated content for Premium Flex Search , the internal IDs in flex search responses start with with the letter f and a number, as in as in f1o1 for offer ids, f1j0 for CombinabilityCode, f1p0 for ProductRef, f1b0 for BrandRef, f1s1 for FlightRef, and f1T0 for TermsAndConditionsRef. GDS&#160;only. Product Array. Search returns one instance of Product. Includes productRef. productRef Reference id that matches this product to the identifier in ReferenceListFlight/Product. To find flight details for a product, use the ProductRef id to identify the product in ReferenceListProduct/Product, and use the flight numbers (e.g., s3, s4) to match to flight information in ReferenceListFlight/Flight. If the request invoked aggregated content for Premium Flex Search , the internal IDs in flex search responses start with with the letter f and a number, as in as in f1o1 for offer ids, f1j0 for CombinabilityCode, f1p0 for ProductRef, f1b0 for BrandRef, f1s1 for FlightRef, and f1T0 for TermsAndConditionsRef. GDS&#160;only. TermsAndConditions Terms and conditions applicable to this instance of ProductBrandOffering. termsAndConditionsRef Reference id that matches to identifier in ReferenceListFlightTermsAndConditions/TermsAndConditions. CombinabilityCode Code/s for the product/s on the other leg of the itinerary that can be combined with this product for the lowest available fare. See Combinable Codes and Best Combinable Price for details. A multi-city offer has jc in its CombinabilityCode, as in jc1 , jc2 . See multi-city offers with stopovers for details; GDS&#160;only. BestCombinablePrice Price details for the full itinerary when this product is combined with any other product sharing a CombinabilityCode. For example, if p6 on the outbound and p24 on the inbound both have a CombinabilityCode value of j2, both products return the same BestCombinablePrice when combined for the itinerary. For a one-way itinerary, CombinabilityCode is returned for consistency but the value has no use and can be ignored. The pricing in BestCombinablePrice applies to the one-way itinerary. Includes CurrencyCode, Base, TotalTaxes, TotalFees, TotalPrice, and PriceBreakdown objects. For NDC leg-based responses on carrier AA , the PriceBreakdown amount is approximate. Because AA returns only a journey-based response, Search must convert the response to a leg-based response. If the TotatlTaxes amount isn't divisible by the number of segments, the PriceBreakdown may not be accurate. However, accurate pricing will be returned in the AirPrice response. CurrencyCode The currency in which the price is returned. Unless changed in the request, the currency is the default associated with your provisioned PCC from Travelport. Key value pairs: decimalPlace: &#160;Number of decimal places in the currency. value: &#160;Currency code value. Base Number. Base price for all passengers with this PTC before taxes and fees. TotalTaxes Number. Sum of all taxes for this price. TotalFees Sum of all fees in this price. TotalPrice Total price for all passengers with this PTC including base cost, taxes, and fees. PriceBreakdown @type PriceBreakdownAir Array. Price breakdown by PTC, one instance returned for each PTC type. Amounts returned apply to one passenger with the PTC in this instance. Key value pairs: quantity :&#160;Number of passengers in that PTC. requestedPassengerType The PTC to which the PriceBreakdown applies. Includes the Amount object. For GDS may return FiledAmount, FareCalculation, and/or Commission per below. For NDC may return Discount, PassengerCriteriaRefs, TravelerIdentifierRef per below. Each instance of PriceBreakdown returns pricing for one passenger of a single PTC. On multi-passenger itineraries, refer to TotalPrice for a total price for the itinerary. PriceBreakdown @type PriceBreakdownAncillaryAir If NDC&#160;bundled offers were requested in the Search request by sending includeBundledAncillariesInd, for any NDC bundled offers, PriceBreakdown returns an instance with the @type PriceBreakdownAncillaryAir to define the included ancillary and pricing. NDC only; bundled offers not supported for GDS. Show Example Request "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "Amount": { "@type": "Amount", "Base": 97, "CurrencyCode": { "value": "EUR" }, "Fees": { "@type": "FeesDetail", "Fee": [ { "@type": "Fee", "description": "AggregatorFee", "FeeAmountOrPercent": { "@type": "FeeAmountOrPercentAmount", "Amount": { "code": "EUR", "value": 1.33 } } } ], "TotalFees": 1.33 }, "Taxes": { "@type": "TaxesDetail", "Tax": [ { "taxCode": "YR", "value": 1.5 }, { "taxCode": "CJ", "value": 22.28 }, { "taxCode": "RN", "value": 32.05 }, { "taxCode": "VV", "value": 30.25 } ], "TotalTaxes": 86.08 }, "Total": 184.41 }, "quantity": 1, "requestedPassengerType": "ADT" }, { "@type": "PriceBreakdownAncillaryAir", "Amount": { "@type": "Amount", "Base": 14, "CurrencyCode": { "decimalPlace": 2, "value": "EUR" }, "Fees": { "@type": "FeesDetail", "TotalFees": 0 }, "Total": 14 }, "Description": { "code": "A", "ssrCode": "SEAT", "subCode": "0B5", "value": "Bundled_SEAT" }, "PassengerTypeCode": "ADT", "quantity": 1 } ], Amount Includes CurrencyCode (same as above), Base, Taxes, Fees, and Total objects. Base Base cost for one passenger of this PTC type. Taxes Includes TotalTaxes (sum of all individual taxes) and an array of Tax objects for individual taxes. TotalTaxes Sum total of all taxes for one passenger of this PTC type. Tax Array of Tax objects for individual taxes. Key value pairs: currencyCode : Currency code in which the value is returned. taxCode : Code for the tax. exemptInd : Returned if a tax was marked exempt in the Search request with the TaxExemption pricing modifer. GDS only; not supported for NDC. value :&#160;Amount of the tax. Returned as 0 if a tax was marked as exempt with TaxExemption per above. description : Short summary of the tax. Returned only for NDC. Fees or FeesDetail Provides breakdown of fees, if applicable. Includes TotalFees object to return sum of any fees for that PTC. May include array of Fee objects to break down individual fees. Fee Array for individual fees, if applicable. Key value pairs: feeCode : The code for the fee, such as OB for OB fees. description : Any description for that fee code. text : The amount of the fee. If OB-T fees are part of the price, those are detailed here. OB-T fees are ticketing fees independent of the form of payment. They are defined by the carrier and can be based on any of multiple criteria. Total Total of base cost and all fees and taxes for one passenger of this PTC type. Surcharges GDS only. Not supported for NDC, which does not return surcharges. Returned if surcharges apply to this offer. Includes the following: approximateInd : Surcharge amounts are approximate if true. TotalSurcharges : Monetary amount of surcharge total, up to 4 decimal places. Includes Surcharge object. For GDS only, for a multi-city offer with stopovers (see multi-city offers with stopovers for details), surcharges and commission amounts are for the entire journey. For all other offers, the surcharges and commission amounts are for each leg (origin and destination pair). A multi-city offer can be identified by the jc in its CombinabilityCode: jc1 , jc2. Surcharges can be omitted from the Search response with excludeSurchargesInd. Surcharge Returned in Surcharges. Key value pairs: currencyCode : Currency code surcharges are returned in. purpose : Possible values: Weekend Surcharge Stopover Charge Multiple Stopover Charges Other (default value that covers all other surcharges such as fuel surcharges) decimalPlace : Number of decimal places in currency. value : Amount of surcharge. Commission GDS only; not supported for NDC. Any commission filed by an airline in a CAT35 fare is returned in PriceBreakdownAir/Commission. The amount is either a percent of the fare component (@type CommissionPercent and the Percent object) or an amount (@type CommissionAmount and the Amount object). Discount NDC&#160;only; not supported for GDS. Returned for a fare discounted off the published price, such as a promotional discount. Not returned for privately negotiated discounts such as private fares. Key value pairs: description : Text description of this discount. currencyCode : Currency code discount is returned in. decimalPlace :&#160;Number of decimal places in the currency the discount is returned in. value : Actual amount of the discount. PassengerCriteriaRefs NDC&#160;only; not supported for GDS. Returned for NDC if a traveler identifier was sent for this traveler in the Search request. See example for TravelerIdentifierRef below. TravelerIdentifierRef NDC&#160;only; not supported for GDS. Returned for NDC if age was sent for this traveler in the Search request. See example below. Show Example excerpt "PassengerCriteriaRefs": [ "x02" ], "TravelerIdentifierRef": { "ages": [ 11 ] } ContentSource String. Indicates whether the offer is from GDS or NDC . Supported values: GDS: The offer is from the Travelport GDS. NDC:&#160;The offer is from the NDC&#160;carrier. CO2EmissionsData Returns CO2 emissions data for the Search and Next Leg Search responses. Includes Actual, Typical, and Variance objects. If CO2 data is not available for a flight or route, only available data is returned and these objects may be returned blank. CO2 data is not returned for non-flight segments (equipment codes BUS, HOV, LCH, LMO, TRN, TRS). Show Example CO2EmissionsData "CO2EmissionsData": { "@type": "CO2EmissionsData", "Actual": { "measurementType": "Weight", "unit": "Kilograms", "value": 1099 }, "Typical": { "measurementType": "Weight", "unit": "Kilograms", "value": 1055 }, "Variance": 4 } }, Actual Actual carbon emissions for the flight/s in this product (one leg of the itinerary). Key value pairs: measurementType : Type of measurement; for CO2 emissions this is Weight . unit : Unit of measure; CO2 emissions are measured in Kilograms . value : CO2 emissions for this product. Typical Typical carbon emissions for the flight/s in this product (one leg of the itinerary). Key value pairs: measurementType : Type of measurement; for CO2 emissions this is Weight . unit : Unit of measure; CO2 emissions are measured in Kilograms . value : CO2 emissions for the flight/s in this product. Variance The variance of CO2 emission from the typical emission value represented as a percent. If positive, the CO2 emission is higher than the industry average. If negative, it is lower than the industry average. &#160; Result Result returns any error and warning messages. See Error Messages for a listing. Show Result Table Object Description Result Includes objects for any warning or error message returned. May include Warning and/or Error objects. Error Returns error message details in the StatusCode, Message, and SourceCode objects. Warning Returns warning message details in the Message and SourceCode objects. StatusCode The HTTP standard response code for the message. Message The text of any error message returned. SourceCode The error or warning code returned by the provider or host system. ReferenceList ReferenceList consolidates all the details about flights, products, brands, and terms and conditions returned in CatalogProductOfferings. Object Description &#160; ReferenceList Top level object for the consolidated flight, product, terms and conditions, and brand information referenced in the offers in CatalogProductOfferings. Returns one instance each of types ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, ReferenceListBrand, and, if RouteHappy flight amenities were requested, ReferenceListAmenity. If the request invoked aggregated content for Premium Flex Search , the internal IDs in flex search responses start with with the letter f and a number, as in as in f1o1 for offer ids, f1j0 for CombinabilityCode, f1p0 for ProductRef, f1b0 for BrandRef, f1s1 for FlightRef, and f1T0 for TermsAndConditionsRef. GDS&#160;only. &#160; Show ReferenceListFlight table ReferenceList/ReferenceListFlight Object Description ReferenceListFlight Returns an array of Flight objects that match to the flights that make up a product. ReferenceListFlight is a common object in the model. Not all objects in this table may be returned in this specific API. Flight One instance for one flight. Key value pairs: distance : Distance covered by the flight. duration : Time of the flight in hours (H) and minutes (M). carrier : Airline carrier. number : Flight number. operatingCarrier : When the carrier has filed a codeshare operating carrier for the flight, the IATA code for that codeshare carrier. operatingCarrierName : Name of the marketing operating carrier. operatingCarrierNumber :&#160;Number of the operating carrier flight. If there is no operating carrier number, then CO2 emission estimates for operating carriers is not supported. GDS only; not returned for NDC. Returned only in Search response. equipment : Equipment model. Note that TRN, TRS, and BUS equipment codes indicate ground transportation. id : id for internal flight reference number, also used in products and offers. For GDS, formatted as the letter ‘s’+ unique numeric value, as in s1 . NDC flight ids include the NDC carrier code, as in QFs1 . subjectToGovernmentApproval : Returned with value of true when an airline has filed in its schedule that availability for a specific flight is subject to government approval. GDS only, not supported for NDC. Returned only in the Search API&#160;response. Includes Departure, Arrival, AvailabilitySourceCode, and IntermediateStop objects. Departure Departure details. Key value pairs are the location , date , time , and terminal of departure. Arrival Arrival details. Key value pairs are the location , date , time , and terminal of arrival. AvailabilitySourceCode Returned to assist in troubleshooting. Returned in the Search, Air Availability, Exchange Search, AirPrice, and Workbench Commit responses. Recommended to send in the AirPrice Full Payload and Add Offer Full Payload requests. Not returned for Ancillary Shop or Fare Rules. GDS&#160;only; not supported for NDC. Supported values and definitions for AvailabilitySourceCode: A:&#160;AVS (availability and schedules) B:&#160;Travelport cache C:&#160;AVS D:&#160;Direct Access E:&#160;Travelport cache F: Travelport cache G: Travelport cache H: Travelport cache I: Travelport cache K: Travelport cache L:&#160;Last seat availability M:&#160;Unknown source O: Travelport cache P: Travelport cache Q:&#160;Travelport cache S:&#160;Seamless T:&#160;Travelport cache U:&#160;Unknown source X:&#160;Customer reusing availability data from customer cache (data originally obtained from Travelport) Y:&#160;Customer reusing data obtained from another system (e.g., another GDS) (data may be fresh or stored in customer cache) Z:&#160;Customer sold from e-streamed data stored in customer cache IntermediateStop Returned if the flight has a technical stop but does not incur a change in flight number. Returned in the Search, AirPrice, Exchange Search responses. In ReservationRetrieve, IntermediateStop is returned in Offer/Product/Flight instead of ReferenceListFlight. Not returned for Ancillary Shop or Fare Rules. Key value pairs: arrivalFlightDuration: Length in hours and minutes of the flight arriving at the intermediate stop. departureFlightDuration: Length in hours and minutes of the flight departing the intermediate stop. duration: Length in hours and minutes between the arrival and departure at the intermediate stop. equipment : Equipment model, if there is a change of equipment during the stop. arrivalDate: Arrival date for stop. departureDate: Departure date of stop. arrivalTime: Arrival time for stop. departurelTime: &#160; sic; note spelling of departurelTime with the letter l between departure and time Departure time for stop. arrivalTerminal: Arrival terminal for stop. departureTerminal: Departure terminal for stop. value: The code for the airport where the intermediate stop occurs. Show ReferenceListProduct table Object Description ReferenceListProduct Returns details for the products returned in offers. Includes the Product object. Product Array. One instance for each product id. Key value pairs: totalDuration : Total time length of the segment in hours (H) and minutes (M). id :&#160;Product id. Quantity : Number of seats available for that Product. If the Product has connecting flights, Quantity returns the lowest number available. For example, if the first flight has 9 seats in Y class and the connecting flight has 4 seats in Y class, Quantity returns a value of 4 . Includes FlightSegment and PassengerFlight objects. FlightSegment Array. One instance for each flight segment in the product. Key value pairs: sequence :&#160;Order of the sequence; e.g. 1 for the first segment on the leg. amenityRefs : Array. If RouteHappy flight amenities were requested (includeFlightAmenitiesInd=true), amenityRefs is returned to cross-reference the amenities available on this flight and listed in ReferenceListAmenity in the format a{x} . For example, in "amenityRefs": [ "a0", "a4" ] , see ReferenceListAmenity for a0 and a4. universalProductAttributeRefs : Array. If universal product attributes (UPAs) for RouteHappy data were requested (includeUniversalProductAttributesInd=true) along with RouteHappy flight amenities, universalProductAttributeRefs is returned to cross-reference the UPAs for this flight and listed in ReferenceListUniversalProductAttribute in the format u{x} . For example, in "universalProductAttributeRefs": [ "u0", "u2" ] , see ReferenceListUniversalProductAttribute for u0 and u2. UPAs provide images, icons, and URLs as provided by ATPCO. RouteHappy data must have also been requested per amenityRefs above. boundFlightsInd : Boolean variable indicating segments are married/bound. When returned true , indicates the flight segments in a single or double connection must be sold together. When true, the indicator is returned for all leading segments on one leg of the flight, and not returned for the last segment of the bound flight leg journey, indicating where the bound flights end. For example, if an O&amp;D&#160;pair has 3 flight segments, boundFlightsInd is returned for the first two segments on that leg. If the segments are not bound, boundFlightsInd is false and not returned. GDS only; not supported for NDC. Includes Flight and Co2Actual. Flight Array. One instance for each flight in the product. Includes FlightRef. FlightRef Unique identifier for this flight. Matches to identifier in ReferenceListFlight/Flight. If the request invoked aggregated content for Premium Flex Search , the internal IDs in flex search responses start with with the letter f and a number, as in as in f1o1 for offer ids, f1j0 for CombinabilityCode, f1p0 for ProductRef, f1b0 for BrandRef, f1s1 for FlightRef, and f1T0 for TermsAndConditionsRef. GDS&#160;only. Co2Actual Actual carbon emissions for this specific flight. Key value pairs: value : CO2 emissions for this flight. measurementType : Type of measurement; for CO2 emissions this is Weight . unit : Unit of measure; CO2 emissions are measured in Kilograms . PassengerFlight Returns PTC and class/fare information for each PTC&#160;requested. One instance of Passenger Flight is returned for each PTC requested. Key value pairs: passengerQuantity : Number of passengers in that PTC from the request. passengerTypeCode : The PTC code. Includes the FlightProduct object. FlightProduct Product details for this flight. Key value pairs: segmentSequence :&#160;Order of the corresponding flight in the sequence. classOfService : Class of service code. cabin :&#160;Cabin class. fareBasisCode :&#160;Fare basis code for the flight. For NDC, also returns the ticket designator after a slash (/) following the fare basis code. GDS ticket designators are returned in ticketDesignator per below. fareType :&#160;Indicates the fare type. Possible values are AirlinePrivateFare, AgencyPrivateFare, PublicFare, or NetFare (net fares are not supported for NDC). ticketDesignator : Returns the ticket designator for GDS. The ticket designator is a code used by airlines to indicate the type of discount applied to a fare. An airline may have a specific ticket designator used to differentiate its fares, which may also signify anything from private fares, wholesale, promotion, or discounted fares. GDS only; not supported for NDC. (NDC ticket designators are returned in fareBasisCode per above.) fareTypeCode : Provides a type for unbundled fares when the Search response includes unbundled fares. The following list of ATPCO unbundled industry fare types is not all-inclusive and other values may at times be returned: EOU: Economy One-way Unbundled ERU: Economy Round-Trip Unbundled PFD: Economy Class Frequent Flyer Unbundled EOW: Economy One Way - Unbundled Level 2 EOX: Economy One Way - Unbundled Level 3 EOY: Economy One Way - Unbundled Level 4 ERH: Economy Round Trip - Unbundled Level 2 ERX: Economy Round Trip - Unbundled Level 3 ERY: Economy Round Trip - Unbundled Level 4 PSU: Student Fare Unbundled PIU: Individual Inclusive Tour Fare Unbundled PGU: Group Inclusive Tour Fare Unbundled PRU: Economy Promotional Unbundled BRU: Business Class Unbundled ZRU: Premium Economy Unbundled Brand The brand reference id for the fare. Show ReferenceListTermsAndConditions table Object Description ReferenceListTermsAndConditions Returns terms and conditions details for sets of terms and conditions referenced in offers. TermsAndConditions Array. Each instance is one set of terms and conditions applicable to any ProductBrandOffering with this id. Key value pairs: id: &#160;Identifier for this set of terms and conditions. Matches to value in ProductBrandOffering/TermsAndConditions/termsAndConditionsRef in instances of ProductBrandOptions. secureFlightPassengerDataRequiredInd: Returned only when true to indicate the airline requires additional passenger data for one or more travelers to complete the reservation per Secure&#160;Flight Passenger Data requirements . May include CustomerLoyaltyCredit, BaggageAllowance, ValidatingAirline, PaymentTimeLimit, Penalties objects. CustomerLoyaltyCredit Returned only if CustomerLoyalty sent in the request. Returns information sent in the request and other details including the miles earned for this flight. Includes the ProductRef, CustomerLoyalty, Earned, and Status objects. NDC&#160;only; not supported for GDS. Show CustomerLoyaltyCredit excerpt "CustomerLoyaltyCredit": [ { "ProductRef": "QFp0", "CustomerLoyalty": { "supplier": "QF", "tier": "Bronze", "cardHolderName": "JORDAN LOYTEST", "value": "1295036" }, "Earned": "10400", "Status": "180" } ] } }, BaggageAllowance &#160; Baggage-related data including measurements and baggageType may not always be returned for every offer depending on the information sent by the carrier. If provided by the carrier, any baggage information. Key value pairs: passengerTypeCodes :&#160;All PTCs to which this allowance applies. baggageType : Type of baggage to which this allowance applies. Possible values are FirstCheckedBag , SecondCheckedBag , AdditionalBags , CarryOn , BaggageEmbargo . Includes ProductRef, BaggageItem, SegmentSequenceList, and Text objects. Baggage fees and embargo information can be excluded from the Search response with the excludeBaggageFeesInd indicator (GDS only). BaggageAllowance/ ProductRef The Product id/s to which this baggage allowance applies. BaggageItem Baggage-related data including measurements and baggageType may not always be returned for every offer depending on the information sent by the carrier. As returned by the carrier, baggage allowance details. Key value pairs: quantity: The number of FirstCheckedBag, SecondCheckedBag, AdditionalBags, and CarryOn items allowed. May be free or at a charge. Not returned for baggage allowances by weight. includedInOfferPrice : String. Possible values: Yes: Baggage is included in the price. No: Baggage is not included in the price; available for an additional charge. Unknown: Unknown if baggage is included in the price. soldByPieceInd : Boolean. Returned only if true. Indicates baggage allowance is by piece, such as one, two, or three pieces. soldByWeightInd : Boolean. Returned only if true. Indicates the baggage is allowed by weight, either kilograms or pounds, such as 50 pounds or 35 kilograms. May include Measurement, BaggageFee, Text objects. BaggageFee For paid baggage, cost for this item of baggage: code : Currency code for cost. approximateInd : Boolean; true indicates the charge is approximate, false indicates the charge is an exact price. value : Cost of baggage in currency code above. Text Baggage-related data including measurements and baggageType may not always be returned for every offer depending on the information sent by the carrier. String. Any free text provided by carrier for baggage terms. Examples: UPTO15LB/7KG AND UPTO45LI/115LCM CHGS MAY APPLY IF BAGS EXCEED TTL WT ALLOWANCE BAGGAGE ALLOWANCE DATA NOT AVAILABLE When the baggage allowance is based on pieces, Text returns 0P , 1P , 2P , or 3P , defined as follows, for FirstCheckedBag, SecondCheckedBag, AdditionalBags, and/or CarryOn (see BaggageAllowance row above for examples): 0P: No free bags. 1P: The FirstCheckedBag is free; the SecondCheckedBag has a fee. 2P: Both the FirstCheckedBag and SecondCheckedBag are free. 3P: Both the FirstCheckedBag and SecondCheckedBag are free, plus an additional checked bag (AdditionalBags) is free. Measurement Baggage-related data including measurements and baggageType may not always be returned for every offer depending on the information sent by the carrier. Measurement details for BaggageItem as applicable. Key value pairs: measurementType: Type of measurement specified, such as weight, height, width, etc. unit: Unit in which measurement is specified, such as Kilograms, Inches, Centimeters, etc. value: The number of units allowed for this measurement type. NDC returns quantity and Measurement info for FirstCheckedBag, SecondCheckedBag, AdditionalBags, and CarryOn when returned by the NDC carrier. NDC returns measurements in structured format in the Search response when the NDC carrier returns them this way. Otherwise, the measurements are returned in Text. For GDS, baggage measurements are returned in Text. SegmentSequenceList Segment sequence values to which this baggage allowance applies. OrganizationInformation Includes OrganizationIdentifier. OrganizationIdentifier &#160; Array of one or more account codes and type identifying negotiated fares. Key value pairs: organizationCodeType : The type of account code, either Account (organization code) or OrganizationLoyaltyProgram (NDC&#160;corporate ID. NDC&#160;only, not returned for GDS). value : The account code applied for this fare. ValidatingAirline Array. Each instance lists the carrier on which the ticket is issued. PaymentTimeLimit String. The local (per the point of sale) date and time by which the offer must be ticketed in YYY-MM-DDTHH:MM:SS format. Penalties Returns change and cancel penalties for this set of terms and conditions. For GDS, Penalties returns the most restrictive CAT16 penalty details; NDC penalty rules are not necessarily filed in a specific category (CAT). Returned by default. Not returned if the optional indicator excludePenaltiesInd =true (GDS&#160;only), which omits penalty information from the response. Includes the PassengerTypeCodes object and either or both the Change and Cancel objects. Not all NDC carriers return penalty details. Some NDC carriers may not return Penalty/amount when a change is permitted, which means there is no charge for the change. Show Example Response excerpt with penalties The example excerpt below shows a Penalties object returning both Change and Cancel objects. ... "Penalties": [ { "Change": [ { "@type": "ChangePermitted", "penaltyTypes": [ "Anytime" ], "PenaltyAppliesTo": "PerTicket", "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "value": 0 } } ] } ], "Cancel": [ { "@type": "CancelPermitted", "penaltyTypes": [ "Anytime" ], "PenaltyAppliesTo": "PerTicket", "Penalty": [ { "@type": "PenaltyPercent", "Percent": 100 } ] }, { "@type": "CancelPermitted", "penaltyTypes": [ "NoShow" ], "PenaltyAppliesTo": "PerTicket", "Penalty": [ { "@type": "PenaltyPercent", "Percent": 100 } ] } ], "PassengerTypeCodes": [ "ADT" ] } ] Change Returned in Penalties object with @type ChangePermitted if a change is permitted after booking. Key value pairs: penaltyTypes: Type of penalty that applies to any change after booking. Supported values: BeforeDeparture AfterDeparture Anytime NoShow Minimum Maximum ExchangeRequired ExchangeNotRequired Includes PenaltyAppliesTo and Penalty objects. Cancel Returned in Penalties object with @type CancelPermitted if a cancellation is permitted after booking. Key value pairs: penaltyTypes: Type of penalty that applies to cancellation. Supported values: BeforeDeparture AfterDeparture Anytime NoShow Minimum Maximum ExchangeRequired ExchangeNotRequired Includes PenaltyAppliesTo and Penalty objects. PenaltyAppliesTo Returned in Change and Cancel objects to specify what the change or cancel penalty applies to. Supported values: OneWay RoundTrip PerTicket PerCoupon PerDirectionOfTravel Returns ProductRefs, PenaltyAppliesTo, Penalty objects. ProductRefs List of product reference numbers to which these penalties apply, if applicable only to specific products. SegmentSequence List of segment sequence numbers to which these penalties apply, if applicable only to specific segments. Penalty Returned in Change and Cancel objects to specify either a percentage or amount for a change or cancel penalty. Penalty @type PenaltyPercent returns the following: Percent :&#160;Percent of fare charged for the penalty. Penalty @type PenaltyAmount returns the following: Amount :&#160;Amount of penalty fee: code : Currency code for the penalty. minorUnit : Minor unit places of currency. value . Amount of penalty in the currency code above. Some NDC carriers may not return Penalty/Amount when a change is permitted, which means there is no charge for the change. PassengerTypeCodes PTCs to which the penalties returned apply. TourCodes GDS only; not supported for NDC. Any tour code applicable to this fare, per PTC. Includes TravelerIdentifierRef and TourCode objects. A tour code is a carrier specified and agreed code for a negotiated fare. It is used by the BSP or ARC data processing center to perform a series of calculations that may be based on the itinerary, agency code, dates, and other transaction attributes. The tour code can help identify airline-specific incentive payments such as commissions for fares that offer the most revenue. Show Example excerpt for tour codes for multiple PTCs In the following example, a different tour code is returned for each of two PTCs. ... "TourCodes": { "@type": "TourCodes", "TravelerIdentifierRef": [ { "passengerTypeCode": "ADT" } ], "TourCode": { "value": "TOURADT" }, "@type": "TourCodes", "TravelerIdentifierRef": [ { "passengerTypeCode": "CHD" } ], "TourCode": { "value": "TOURCNN" } } ... TravelerIdentifierRef Traveler PTCs to which this tour code applies. Key value pairs: passengerTypeCode: One or more PTCs to which this tour code applies. TourCode Tour code value. Key value pairs: value: The tour code itself. Up to 10 tour codes per PTC may be returned. TicketingAgency If TicketingPCC was sent in the request to override the default ticketing agency, TicketingAgency returns the PCC of the overriding agency. If no override request was made, TicketingAgency returns the default PCC. Includes Code and ProductRef objects. GDS only; not supported for NDC. Code PCC of the overriding or default ticket agency. ProductRef Product references to which this ticketing agency PCC applies. PricingAgency If PricingPCC was sent in the request to override the default pricing agency, PricingAgency returns the PCC of the overriding agency. Not returned if no override request was made. Includes Code object. GDS only; not supported for NDC. Code PCC of any overriding pricing agency. Show ReferenceListBrand table Object Description ReferenceListBrand Returns an array of ReferenceListBrand objects that match to brand ids returned in other places in the response. Search returns branded fares by default when available. For more about brands see Branded Fares and Upsells in the Air &#160;Search Guide. ReferenceListBrand/ Brand Array. Each instance provides details for one BrandRef id. Key value pairs: name: Brand name provided by the carrier. id: Internal brand reference identifier used throughout the response. tier: Brand tier (not returned for NDC). shelfNumbers: If the carrier has provided it for this brand, the shelf number is the number for a grouping of comparable brands that share similar ticket and flight attributes. code: &#160;ATPCO&#160;brand code. Includes Identifier and BrandAttribute objects. May include ImageURL. ReferenceListBrand/Brand// Identifier Brand identifier information. Key value pairs: value: &#160;Brand identifier used by the carrier. BrandAttribute Array of features that are included, chargeable, or not offered for this brand. Contains one or more instances of the two paired key value pairs classification and inclusion : classification : The brand attribute classification. Possible values are: CarryOn CheckedBag Meals SeatAssignment Rebooking Refund WiFi PersonalItem PremiumSeat LieFlatSeat inclusion : Possible values are: Included: Attribute is included in the brand at no additional charge. Chargeable: Attribute is available for the brand at a cost. Not Offered: Attribute is not available for this brand. The following subattributes are returned if filed by the carrier: groupCode : Carrier group code. subGroupCode : Carrier sub-group code. subCode : Carrier sub-code. May return the following: matchedAttributeInd : Returned only if true for any attribute requested in ProductInclusionPreference\Classification. See the example responses . AdditionalBrandAttribute Array of additional features that are included or chargeable for this brand. An additional brand attribute is returned only for brands that have that attribute associated with it. Contains one or more instances of the two paired key value pairs classification and inclusion : classification : The additional brand attribute classification. Possible values are: ChauffeurTransfer ExtraLegroom InFlightEntertainment LoungeAccess PriorityBaggage PriorityBoarding PriorityCheckIn PrioritySecurity PriorityServices MileageAccrual Upgrades USB inclusion : Possible values are as follows; because additional brand attributes are returned only when a brand offers them, the value Not Offered is not returned as it may be for BrandAttribute: Included: Attribute is included in the brand at no additional charge. Chargeable: Attribute is available for the brand at a cost. The following Brand subattributes are returned if filed by the carrier: groupCode : Carrier group code. subGroupCode : Carrier sub-group code. subCode : Carrier sub-code. ImageURL URL for an image for the brand, when available. Show ReferenceListAmenity table If RouteHappy flight amenities were requested in the Search, Next Leg Search, or Flight SpecificSearch requests with includeFlightAmenitiesInd, the response includes ReferenceListAmenity to list RouteHappy amenities across all flights in all offers. Flights cross-reference these amenities in FlightSegment/amenityRefs. Object Description ReferenceListAmenity If flight amenities were requested with includeFlightAmenitiesInd=true, the response returns ReferenceLIstAmenity to list all available amenities across all flights. Flight amenities are provided by ATPCO as RouteHappy data. ATPCO&#160;flight amenities do not support the Premium Business cabin. If the fare is in Premium Business, Travelport's system does not look for flight amenities. All other cabins are supported. If flight amenity data is requested but not available, the Result object returns a warning message that flight amenity data is unavailable. This could be due to a time out or some other issue while accessing the flight amenities data. Amenity Array. One instance for each specific amenity. Key value pairs: id: Travelport-assigned amenity id used for cross-referencing by each flight with this amenity. Includes Category and Text objects. Category String. The flight amenity category. Flight amenity categories are as follows and may include the following data as provided by ATPCO: Aircraft: cabin pressure, model and type Beverage: alcoholic and non-alcoholic beverages and whether available for a fee or free; highlights premium beverages in business/first Entertainment: passenger entertainment options Flight: airline flight schedules and equipment types with the associated amenities ID for each carrier Food: food per flight and flight cabin and whether available for a fee or free; food is classified as breakfast, lunch, dinner, snacks, and light meals, and as premium when available in business/first Layout: seating layout such as classic layouts to premium cabin configurations Power: availability of AC power outlets, USB ports, or both Seat: physical seat type for every sub fleet in every cabin of the aircraft, including legroom, pitch, width, flatness and type. Note that seat metrics are returned in centimeters because the default language is English. WiFi: availability, type, coverage, rollout, performance, and whether available free or for a fee Text A description of the amenity in the following key value pairs: language : Code for the language returned in value. value : String. A short text description of this amenity. Show ReferenceListUniversalProductAttributes table If universal product attributes (UPAs) for RouteHappy data were requested (includeUniversalProductAttributesInd=true) along with RouteHappy flight amenities, the response returns ReferenceListUniversalProductAttribute to list the available UPAs on flights. Flights cross-reference these amenities in FlightSegment/universalProductAttributeRefs. Object Description ReferenceListUniversalProductAttribute If RouteHappy flight amenities and universal product attributes for those amenities were requested (with includeFlightAmenitiesInd=true and includeUniversalProductAttributesInd=true), the response returns ReferenceListUniversalProductAttribute to return images, icons, and URLs as provided by ATPCO. Flights cross-reference these attributes in FlightSegment/universalProductAttributeRefs. Show Example ReferenceListUniversalProductAttribute excerpt { "@type": "ReferenceListUniversalProductAttribute", "UniversalProductAttribute": [ { "@type": "UniversalProductAttribute", "id": "u0", "headline": "Fuel efficient, quieter Jetstar A321LR", "description": "Featuring extra-large overhead bins with 40% more space and colour LED lighting that adjusts to the different stages of flight.", "IconURL": [ { "value": "https://upamedia.atpco.net/icons/df557b62-4b46-4f78-b349-cce49e3b3e5c/small/aircraft.png", "urlType": "smallURL" } ], "UPAMedia": [ { "@type": "UPAMedia", "mediaType": "Photo", "caption": "Featuring extra-large overhead bins with 40% more space", "URL": [ { "value": "https://upamedia.atpco.net/photos/9db2c6c1-98fc-4fe5-a0ac-cd764d1cacd3/neo-interior1.jpg", "urlType": "URL" }, { "value": "https://upamedia.atpco.net/photos/9db2c6c1-98fc-4fe5-a0ac-cd764d1cacd3/square_thumb/neo-interior1.jpg", "urlType": "thumbURL" } ] }, UniversalProductAttribute Array. One instance for each UPA. Key value pairs: id: Travelport-assigned UPA id used for cross-referencing by each flight with this amenity. For each flight with UPA/s available, FlightSegment/universalProductAttributeRefs returns a cross-reference to this id, such as u0, u1, u2, etc. headline : Headline text for this UPA. description : Short description of UPA. Includes IconURL and Media objects. IconURL Array. One instance for each icon for this UPA. Key value pairs: value : String. URL&#160;linking to the icon. urlType: The type of URL&#160;that links to the image: smallURL mediumURL, largeURL, thumbURL, or URL. UPAMedia Array. Other media provided for this UPA. Key value pairs: mediaType: The type of media: Photo, Tour, or Video. caption : Supplier caption to present along with the media. Includes URL&#160;object. URL Array. One instance for each URL for this UPA. Key value pairs: value : String. The actual URL. urlType: The type of URL. Example Request For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . If your workflow subsequently references a journey-based A search that returns offers for all legs on the itinerary. A journey-based Search request is a standalone search.&#160;No additional search requests are required. search result, the Search request must send offersPerPage set&#160;to any positive number. This setting invokes caching to allow subsequent requests to refer to these search results. If a journey-based Search request does not send offersPerPage, any subsequent reference payload requests fail , including the Flight Specific Search, AirPrice, and Add Offer reference payloads. The following example requests a GDS round-trip journey-based search, which will return flight options for both legs of the itinerary. No additional search requests are required. It also sends a carrier preference of Preferred for carrier UA, and requests a maximum of one upsell to return. As required for any journey-based round-trip search that will be referenced later in the workflow, this request sends offersPerPage set to a positive number, which invokes caching to support subsequent reference-based requests. Show Example request for GDS round-trip journey-based search with carrier preference { "CatalogProductOfferingsQueryRequest": { "CatalogProductOfferingsRequest": { "@type": "CatalogProductOfferingsRequestAir", "maxNumberOfUpsellsToReturn": 1, "offersPerPage": 15, "contentSourceList": [ "GDS" ], "PassengerCriteria": [ { "@type": "PassengerCriteria", "number": 1, "age": 25, "passengerTypeCode": "ADT" } ], "SearchCriteriaFlight": [ { "@type": "SearchCriteriaFlight", "departureDate": "2024-01-20", "From": { "value": "DEN" }, "To": { "value": "ORD" } }, { "@type": "SearchCriteriaFlight", "departureDate": "2024-01-27", "From": { "value": "ORD" }, "To": { "value": "DEN" } } ], "SearchModifiersAir": { "@type": "SearchModifiersAir", "CarrierPreference": [ { "@type": "CarrierPreference", "preferenceType": "Preferred", "carriers": [ "UA" ] } ] } } } } The following example sends a request for a one-way NDC search with a carrier preference of Permitted for SQ. Show Example request for NDC one-way search with one permitted carrier { "CatalogProductOfferingsQueryRequest": { "CatalogProductOfferingsRequest": { "@type": "CatalogProductOfferingsRequestAir", "maxNumberOfUpsellsToReturn": 4, "offersPerPage": 10, "contentSourceList": [ "NDC" ], "PassengerCriteria": [ { "number": 1, "passengerTypeCode": "ADT" } ], "SearchCriteriaFlight": [ { "departureDate": "2024-01-21", "From": { "value": "HKG" }, "To": { "value": "SIN" } } ], "SearchModifiersAir": { "CarrierPreference": [ { "preferenceType": "Permitted", "carriers": [ "SQ" ] } ] } } } } The following example sends PTCs for a one-way GDS search for one adult and one child, plus modifiers requesting a search by departure time range and preferences for business class, refundable, and nonstop fares, No upsells are requested. Show Example request for GDS one-way search with multiple modifiers and no upsells { "CatalogProductOfferingsQueryRequest": { "CatalogProductOfferingsRequest": { "@type": "CatalogProductOfferingsRequestAir", "maxNumberOfUpsellsToReturn": 0, "contentSourceList": [ "GDS" ], "PassengerCriteria": [ { "@type": "PassengerCriteria", "number": 1, "passengerTypeCode": "ADT", "TravelerGeographicLocation": { "travelerGeographicLocationType": "City", "value": "LON" } }, { "@type": "PassengerCriteria", "number": 1, "passengerTypeCode": "CNN", "age": 8 } ], "SearchCriteriaFlight": [ { "@type": "SearchCriteriaFlight", "departureDate": "2024-12-13", "DepartureTimeRange": { "start": "10:00:00", "end": "13:00:00" }, "From": { "value": "LGW" }, "To": { "value": "SIN" } }, { "@type": "SearchCriteriaFlight", "departureDate": "2024-12-20", "DepartureTimeRange": { "start": "07:00:00", "end": "11:00:00" }, "From": { "value": "SIN" }, "To": { "value": "LGW" } } ], "SearchModifiersAir": { "@type": "SearchModifiersAir", "CabinPreference": [ { "@type": "CabinPreference", "preferenceType": "Permitted", "cabins": [ "Business" ] } ], "ConnectionPreferences": [ { "@type": "ConnectionPreferencesAir", "FlightType": { "connectionType": "NonStopDirect" } } ] }, "PricingModifiersAir": { "@type": "PricingModifiersAir", "currencyCode": "USD", "FareSelection": { "refundableOnlyInd": true } } } } } The following example requests a GDS round-trip leg-based A search that returns offers for only the first leg of the itinerary. Must be followed by a Next Leg Search request that selects an offer for the first leg and returns offers to combine with that leg. A multi-city itinerary requires another Next Leg Search for the third leg. search, which will return flight options for only the first leg of the itinerary, as requested with SearchRepresentation=Leg. This request must be followed by a Next Leg Search request, see Next Leg Search API&#160;Reference for an example of the follow-on request payload. It also sends a carrier preference of Permitted for carrier UA, and requests up to four upsells. Unlike journey-based searches, it does not need to send offersPerPage to invoke caching because leg-based search results are cached by default. Show Example GDS round-trip leg-based search { "CatalogProductOfferingsQueryRequest": { "CatalogProductOfferingsRequest": { "@type": "CatalogProductOfferingsRequestAir", "maxNumberOfUpsellsToReturn": 4, "contentSourceList": [ "GDS" ], "PassengerCriteria": [ { "@type": "PassengerCriteria", "number": 1, "age": 25, "passengerTypeCode": "ADT" } ], "SearchCriteriaFlight": [ { "@type": "SearchCriteriaFlight", "departureDate": "2024-12-21", "From": { "value": "SYD" }, "To": { "value": "MEL" } }, { "@type": "SearchCriteriaFlight", "departureDate": "2024-12-28", "From": { "value": "MEL" }, "To": { "value": "SYD" } } ], "SearchModifiersAir": { "@type": "SearchModifiersAir", "CarrierPreference": [ { "@type": "CarrierPreference", "preferenceType": "Permitted", "carriers": [ "QF" ] } ] }, "CustomResponseModifiersAir": { "@type": "CustomResponseModifiersAir", "SearchRepresentation": "Leg" } } } } The following example sends the includeSplitPaymentInd indicator to request split ticketing . Show Example split ticketing request { "CatalogProductOfferingsQueryRequest": { "CatalogProductOfferingsRequest": { "@type": "CatalogProductOfferingsRequestAir", "offersPerPage": 999, "contentSourceList": [ "GDS" ], "maxNumberOfUpsellsToReturn": 0, "PassengerCriteria": [ { "number": 1, "passengerTypeCode": "ADT" }, { "number": 1, "passengerTypeCode": "INF" } ], "SearchCriteriaFlight": [ { "departureDate": "2024-10-23", "From": { "value": "SYD" }, "To": { "value": "CHC" } }, { "departureDate": "2024-10-27", "From": { "value": "CHC" }, "To": { "value": "SYD" } } ], "PricingModifiersAir": { "includeSplitPaymentInd": true } } } } Example Response For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . Note that not all examples include all recently released features. Round-trip journey-based response with carrier preference The following example is an excerpt from the response for the request above for a round-trip journey-based search. For brevity, this excerpt was edited to remove the ReferenceList object, and all but two instances of ProductBrandOffering in CatalogProductOffering, which returns one instance for the outbound/departure leg and another for the inbound/return leg. See the developer toolkits for full examples. The base fare and each upsell are each returned in an instance of ProductBrandOffering, usually with BrandRef b0 for the base fare and BrandRef b1+ for upsells. Show Example response excerpt for round-trip journey-based search with carrier preference { "CatalogProductOfferingsResponse": { "@type": "CatalogProductOfferingsResponse", "transactionId": "c7bcdc50-8eb5-4918-8ff2-f30b2a0abec2:ppnd1003", "CatalogProductOfferings": { "@type": "CatalogProductOfferings", "Identifier": { "value": "c344ad1f-df72-4ac9-be52-c5fff60e7f67" }, "CatalogProductOffering": [ { "@type": "CatalogProductOffering", "sequence": 1, "id": "o1", "Departure": "DEN", "Arrival": "ORD", "Brand": [ { "@type": "BrandID", "BrandRef": "b0" }, { "@type": "BrandID", "BrandRef": "b1" }, { "@type": "BrandID", "BrandRef": "b2" } ], "ProductBrandOptions": [ { "@type": "ProductBrandOptions", "flightRefs": [ "s1" ], "ProductBrandOffering": [ { "@type": "ProductBrandOffering", "Brand": { "@type": "BrandID", "BrandRef": "b0" }, "Product": [ { "@type": "ProductID", "productRef": "p0" } ], "TermsAndConditions": { "@type": "TermsAndConditionsID", "termsAndConditionsRef": "T0" }, "CombinabilityCode": [ "j1" ], "BestCombinablePrice": { "@type": "BestCombinablePriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 306, "TotalTaxes": 70.2, "TotalPrice": 376.2, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 306, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 70.2, "Tax": [ { "taxCode": "AY", "value": 17.8 }, { "taxCode": "US", "value": 23 }, { "taxCode": "XF", "value": 14.2 }, { "taxCode": "ZP", "value": 15.2 } ] }, "Total": 376.2 }, } ] }, "ContentSource": "GDS" }, { "@type": "ProductBrandOffering", "Brand": { "@type": "BrandID", "BrandRef": "b1" }, "Product": [ { "@type": "ProductID", "productRef": "p8" } ], "TermsAndConditions": { "@type": "TermsAndConditionsID", "termsAndConditionsRef": "T1" }, "CombinabilityCode": [ "j2" ], "BestCombinablePrice": { "@type": "BestCombinablePriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 541, "TotalTaxes": 87.8, "TotalPrice": 628.8, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 541, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 87.8, "Tax": [ { "taxCode": "AY", "value": 17.8 }, { "taxCode": "US", "value": 40.6 }, { "taxCode": "XF", "value": 14.2 }, { "taxCode": "ZP", "value": 15.2 } ] }, "Total": 628.8 } } ] } } ] }, { "@type": "ProductBrandOptions", "flightRefs": [ "s39", "s40" ], "ProductBrandOffering": [ { "@type": "ProductBrandOffering", "Brand": { "@type": "BrandID", "BrandRef": "b0" }, "Product": [ { "@type": "ProductID", "productRef": "p204" } ], "TermsAndConditions": { "@type": "TermsAndConditionsID", "termsAndConditionsRef": "T44" }, "CombinabilityCode": [ "j23" ], "BestCombinablePrice": { "@type": "BestCombinablePriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 495, "TotalTaxes": 99.1, "TotalPrice": 594.1, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 495, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 99.1, "Tax": [ { "taxCode": "AY", "value": 17.8 }, { "taxCode": "US", "value": 37.2 }, { "taxCode": "XF", "value": 21.3 }, { "taxCode": "ZP", "value": 22.8 } ] }, "Total": 594.1 } } ] }, "ContentSource": "GDS" }, { "@type": "ProductBrandOffering", "Brand": { "@type": "BrandID", "BrandRef": "b1" }, "Product": [ { "@type": "ProductID", "productRef": "p205" } ], "TermsAndConditions": { "@type": "TermsAndConditionsID", "termsAndConditionsRef": "T45" }, "CombinabilityCode": [ "j24" ], "BestCombinablePrice": { "@type": "BestCombinablePriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 710, "TotalTaxes": 115.2, "TotalPrice": 825.2, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 710, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 115.2, "Tax": [ { "taxCode": "AY", "value": 17.8 }, { "taxCode": "US", "value": 53.3 }, { "taxCode": "XF", "value": 21.3 }, { "taxCode": "ZP", "value": 22.8 } ] }, "Total": 825.2 } } ] } } ] } ] }, { "@type": "CatalogProductOffering", "sequence": 2, "id": "o2", "Departure": "ORD", "Arrival": "DEN", "Brand": [ { "@type": "BrandID", "BrandRef": "b0" }, { "@type": "BrandID", "BrandRef": "b1" }, { "@type": "BrandID", "BrandRef": "b2" } ], "ProductBrandOptions": [ { "@type": "ProductBrandOptions", "flightRefs": [ "s41" ], "ProductBrandOffering": [ { "@type": "ProductBrandOffering", "Brand": { "@type": "BrandID", "BrandRef": "b0" }, "Product": [ { "@type": "ProductID", "productRef": "p16" } ], "TermsAndConditions": { "@type": "TermsAndConditionsID", "termsAndConditionsRef": "T2" }, "CombinabilityCode": [ "j1" ], "BestCombinablePrice": { "@type": "BestCombinablePriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 306, "TotalTaxes": 70.2, "TotalPrice": 376.2, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 306, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 70.2, "Tax": [ { "taxCode": "AY", "value": 17.8 }, { "taxCode": "US", "value": 23 }, { "taxCode": "XF", "value": 14.2 }, { "taxCode": "ZP", "value": 15.2 } ] }, "Total": 376.2 } } ] }, "ContentSource": "GDS" }, { "@type": "ProductBrandOffering", "Brand": { "@type": "BrandID", "BrandRef": "b1" }, "Product": [ { "@type": "ProductID", "productRef": "p23" } ], "TermsAndConditions": { "@type": "TermsAndConditionsID", "termsAndConditionsRef": "T3" }, "CombinabilityCode": [ "j2" ], "BestCombinablePrice": { "@type": "BestCombinablePriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 541, "TotalTaxes": 87.8, "TotalPrice": 628.8, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 541, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 87.8, "Tax": [ { "taxCode": "AY", "value": 17.8 }, { "taxCode": "US", "value": 40.6 }, { "taxCode": "XF", "value": 14.2 }, { "taxCode": "ZP", "value": 15.2 } ] }, "Total": 628.8 } } ] } } ] }, { "@type": "ProductBrandOptions", "flightRefs": [ "s43" ], "ProductBrandOffering": [ { "@type": "ProductBrandOffering", "Brand": { "@type": "BrandID", "BrandRef": "b0" }, "Product": [ { "@type": "ProductID", "productRef": "p208" } ], "TermsAndConditions": { "@type": "TermsAndConditionsID", "termsAndConditionsRef": "T46" }, "CombinabilityCode": [ "j23" ], "BestCombinablePrice": { "@type": "BestCombinablePriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 495, "TotalTaxes": 99.1, "TotalPrice": 594.1, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 495, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 99.1, "Tax": [ { "taxCode": "AY", "value": 17.8 }, { "taxCode": "US", "value": 37.2 }, { "taxCode": "XF", "value": 21.3 }, { "taxCode": "ZP", "value": 22.8 } ] }, "Total": 594.1 } } ] }, "ContentSource": "GDS" }, { "@type": "ProductBrandOffering", "Brand": { "@type": "BrandID", "BrandRef": "b1" }, "Product": [ { "@type": "ProductID", "productRef": "p210" } ], "TermsAndConditions": { "@type": "TermsAndConditionsID", "termsAndConditionsRef": "T47" }, "CombinabilityCode": [ "j24" ], "BestCombinablePrice": { "@type": "BestCombinablePriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 710, "TotalTaxes": 115.2, "TotalPrice": 825.2, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 710, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 115.2, "Tax": [ { "taxCode": "AY", "value": 17.8 }, { "taxCode": "US", "value": 53.3 }, { "taxCode": "XF", "value": 21.3 }, { "taxCode": "ZP", "value": 22.8 } ] }, "Total": 825.2 } } ] } } ] } ] } ] }, ... } One-way NDC search response with carrier preference The following example response is for a one-way NDC search with a carrier preference of Permitted for SQ. For brevity, this excerpt was edited to remove the ReferenceList object, and all but two instances of ProductBrandOffering in CatalogProductOffering. See the developer toolkits for full examples. Show Example response excerpt for one-way NDC search for carrier SQ { "CatalogProductOfferingsResponse": { "@type": "CatalogProductOfferingsResponse", "transactionId": "7f868951-3008-4302-8964-3a5b3c0af21b:ppnd1003", "CatalogProductOfferings": { "@type": "CatalogProductOfferings", "Identifier": { "value": "756765be-3659-4d4f-9d6a-87979d5b3c3d" }, "CatalogProductOffering": [ { "@type": "CatalogProductOffering", "sequence": 1, "id": "SQ_CPO0", "Identifier": { "authority": "SQ", "value": "U1AyRi0xNTU1NTUzMjY3MjIyMzk3MTk4N3xTUV9DUE8w" }, "Departure": "HKG", "Arrival": "SIN", "Brand": [ { "@type": "BrandID", "BrandRef": "SQb1" } ], "ProductBrandOptions": [ { "@type": "ProductBrandOptions", "ProductBrandOffering": [ { "@type": "ProductBrandOffering", "Identifier": { "authority": "SQ", "value": "U1AyRi0xNTU1NTUzMjY3MjIyMzk3MTk4Ny0xfFNQMkYtMTU1NTU1MzI2NzIyMjM5NzE5ODd8MjAyMy0xMi0yMVQxNDoyODowMHxBRFQ6U1AyRi0xNTU1NTUzMjY3MjIyMzk3MTk4Ny0xLTF8U1F8QVBJSm91cm5leVR5cGU6Sm91cm5leQ==" }, "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "USD" }, "Base": 252, "TotalTaxes": 33.9, "TotalFees": 0, "TotalPrice": 285.9, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amo

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
    "CatalogProductOfferingsQueryRequest": {
        "CatalogProductOfferingsRequest": {
            "@type": "CatalogProductOfferingsRequestAir",
            "maxNumberOfUpsellsToReturn": 4,
            "contentSourceList": [
                "GDS"
            ],
            "PassengerCriteria": [
                {
                    "@type": "PassengerCriteria",
                    "number": 1,
                    "passengerTypeCode": "ADT"
                }
            ],
            "SearchCriteriaFlight": [
                {
                    "@type": "SearchCriteriaFlight",
                    "departureDate": "2025-12-15",
                    "legSequence": 1,
                    "From": {
                        "value": "DEN"
                    },
                    "To": {
                        "value": "FRA"
                    }
                },
                {
                    "@type": "SearchCriteriaFlight",
                    "departureDate": "2025-12-25",
                    "legSequence": 2,
                    "From": {
                        "value": "FRA"
                    },
                    "To": {
                        "value": "DEN"
                    }
                }
            ],
            "SearchModifiersAir": {
                "@type": "SearchModifiersAir",
                "CarrierPreference": [
                    {
                        "@type": "CarrierPreference",
                        "preferenceType": "Preferred",
                        "carriers": [
                            "UA"
                        ],
                        "legSequence": [
                            1
                        ]
                    },
                    {
                        "@type": "CarrierPreference",
                        "preferenceType": "Preferred",
                        "carriers": [
                            "LH"
                        ],
                        "legSequence": [
                            2
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
"SearchModifiersAir": {
    "ConnectionPreferences": [
        {
            "@type": "ConnectionPreferences",
            "legSequence": [
                1
            ],
            "preferenceType": "Prohibited",
            "ConnectionPoint": [
                "LON",
                "MIL",
                "ROM"
            ]
        }
    ]
}
```

### Block 3

```
{
  "SearchModifiersAir" : {
    "CabinPreference" : [ {
      "@type" : "CabinPreference",
      "preferenceType" : "Preferred",
      "cabins" : [ "PremiumFirst", "First", "Business" ], 
    }]
  }
```

### Block 4

```
{
 "SearchModifiersAir": {
  "@type": "SearchModifiersAir",
  "CabinPreference": [
   {
    "@type": "CabinPreference",
    "preferenceType": "PreferredWithUpgrade",
    "cabins": [
     "PremiumFirst",
     "First",
     "Business"
    ],
    "legSequence": [
     1,
     3
    ]
   }
  ]
 }
}
```

### Block 5

```
"SearchModifiersAir" : {
	"@type": "SearchModifiersAir",	  
    "CabinPreference" : [ 
	{
      "@type" : "CabinPreference",
      "preferenceType" : "Permitted",
      "cabins" : [ "First", "Business" ],
      "legSequence" : [ 1, 4 ]
    },
	{
      "@type" : "CabinPreference",
      "preferenceType" : "Permitted",
      "cabins" : [ "PremiumEconomy", "Economy",],
      "legSequence" : [2, 3 ]
    }
	]
  }
```

### Block 6

```
"PricingModifiersAir": {
                "@type": "PricingModifiersAir",
                "FareSelection": {
                    "@type": "FareSelectionDetail",
                    "fareType": "PrivateFaresOnly",
                    "FareQualiferString": [
                             "VistFriendsAndRelatives"
                    ]
                }
            },
```

### Block 7

```
"OrganizationIdentifier" : [{
      "value" : "XYD123",
      "supplier" : "UA",
      "type" : "Account"
    },
    {
      "value" : "ABC123",
      "supplier" : "LH",
      "type" : "Account"
    }]
```

### Block 8

```
"PricingModifiersAir": {
	 "@type": "PricingModifiersAir",
	 "ManualFareAdjustment":     {
        "@type": "ManualFareAdjustmentIncrease",
        "passengerTypeCodes": [
            "ADT"
        ],
        "AmountPercent": {
            "@type": "AmountPercentAmount",
            "Amount": {
                "value": 10.5
            }
        }
    },
    {
        "@type": "ManualFareAdjustmentDiscount",
        "passengerTypeCodes": [
            "CHD"
        ],
        " AmountPercent ": {
            "@type": "AmountPercentPercent",
            "Percent": 5
        }
    }
]
```

### Block 9

```
{
     "@type": "UpsellOffering",
     "productRefs": [
      "UAp18",
      "UAp3"
     ],
     "id": "upsellOffering_1",
     "ProductBrandOptions": [
      {
       "@type": "ProductBrandOptions",
       "ProductBrandOffering": [
        {
         "@type": "ProductBrandOfferingHost",
         "Price": {
          "@type": "PriceDetail",
          "CurrencyCode": {
           "decimalPlace": 2,
           "value": "AUD"
          },
          "Base": 0,
          "TotalPrice": 85,
          "PriceBreakdown": [
           {
            "@type": "PriceBreakdownAncillary",
            "quantity": 1,
            "Description": {
             "code": "B01",
             "subCode": "B01",
             "value": "Economy Plus"
            }
           }
          ]
         }
        }
       ]
      }
     ]
    },
```

### Block 10

```
"PriceBreakdown": [
       {
        "@type": "PriceBreakdownAir",
        "Amount": {
         "@type": "Amount",
         "Base": 97,
         "CurrencyCode": {
          "value": "EUR"
         },
         "Fees": {
          "@type": "FeesDetail",
          "Fee": [
           {
            "@type": "Fee",
            "description": "AggregatorFee",
            "FeeAmountOrPercent": {
             "@type": "FeeAmountOrPercentAmount",
             "Amount": {
              "code": "EUR",
              "value": 1.33
             }
            }
           }
          ],
          "TotalFees": 1.33
         },
         "Taxes": {
          "@type": "TaxesDetail",
          "Tax": [
           {
            "taxCode": "YR",
            "value": 1.5
           },
           {
            "taxCode": "CJ",
            "value": 22.28
           },
           {
            "taxCode": "RN",
            "value": 32.05
           },
           {
            "taxCode": "VV",
            "value": 30.25
           }
          ],
          "TotalTaxes": 86.08
         },
         "Total": 184.41
        },
        "quantity": 1,
        "requestedPassengerType": "ADT"
       },
       {
        "@type": "PriceBreakdownAncillaryAir",
        "Amount": {
         "@type": "Amount",
         "Base": 14,
         "CurrencyCode": {
          "decimalPlace": 2,
          "value": "EUR"
         },
         "Fees": {
          "@type": "FeesDetail",
          "TotalFees": 0
         },
         "Total": 14
        },
        "Description": {
         "code": "A",
         "ssrCode": "SEAT",
         "subCode": "0B5",
         "value": "Bundled_SEAT"
        },
        "PassengerTypeCode": "ADT",
        "quantity": 1
       }
      ],
```

### Block 11

```
"PassengerCriteriaRefs": [
                  "x02"
                ],
                "TravelerIdentifierRef": {
                  "ages": [
                    11
                  ]
                }
```

### Block 12

```
"CO2EmissionsData": {
          "@type": "CO2EmissionsData",
          "Actual": {
           "measurementType": "Weight",
           "unit": "Kilograms",
           "value": 1099
          },
          "Typical": {
           "measurementType": "Weight",
           "unit": "Kilograms",
           "value": 1055
          },
          "Variance": 4
       }											},
```

### Block 13

```
"CustomerLoyaltyCredit": [
        {
           "ProductRef": "QFp0",
           "CustomerLoyalty": {
                 "supplier": "QF",
                 "tier": "Bronze",
                 "cardHolderName": "JORDAN LOYTEST",
                 "value": "1295036"
            },
             "Earned": "10400",
             "Status": "180"
       }
      ]
     }
    },
```

### Block 14

```
...
            "Penalties": [
              {
                "Change": [
                  {
                    "@type": "ChangePermitted",
                    "penaltyTypes": [
                      "Anytime"
                    ],
                    "PenaltyAppliesTo": "PerTicket",
                    "Penalty": [
                      {
                        "@type": "PenaltyAmount",
                        "Amount": {
                          "value": 0
                        }
                      }
                    ]
                  }
                ],
                "Cancel": [
                  {
                    "@type": "CancelPermitted",
                    "penaltyTypes": [
                      "Anytime"
                    ],
                    "PenaltyAppliesTo": "PerTicket",
                    "Penalty": [
                      {
                        "@type": "PenaltyPercent",
                        "Percent": 100
                      }
                    ]
                  },
                  {
                    "@type": "CancelPermitted",
                    "penaltyTypes": [
                      "NoShow"
                    ],
                    "PenaltyAppliesTo": "PerTicket",
                    "Penalty": [
                      {
                        "@type": "PenaltyPercent",
                        "Percent": 100
                      }
                    ]
                  }
                ],
                "PassengerTypeCodes": [
                  "ADT"
                ]
              }
            ]
```

### Block 15

```
... "TourCodes": {
    "@type": "TourCodes",
    "TravelerIdentifierRef": [
        {
            "passengerTypeCode": "ADT"
        }
    ],
    "TourCode": {
        "value": "TOURADT"
    },
    "@type": "TourCodes",
    "TravelerIdentifierRef": [
        {
            "passengerTypeCode": "CHD"
        }
    ],
    "TourCode": {
        "value": "TOURCNN"
    }
} ...
```

### Block 16

```
{
         "@type": "ReferenceListUniversalProductAttribute",
         "UniversalProductAttribute": [
             {
                 "@type": "UniversalProductAttribute",
                 "id": "u0",
                 "headline": "Fuel efficient, quieter Jetstar A321LR",
                 "description": "Featuring extra-large overhead bins with 40% more space and colour LED lighting that adjusts to the different stages of flight.",
                 "IconURL": [
                     {
                         "value": "https://upamedia.atpco.net/icons/df557b62-4b46-4f78-b349-cce49e3b3e5c/small/aircraft.png",
                         "urlType": "smallURL"
                     }
                 ],
                 "UPAMedia": [
                     {
                         "@type": "UPAMedia",
                         "mediaType": "Photo",
                         "caption": "Featuring extra-large overhead bins with 40% more space",
                         "URL": [
                             {
                                 "value": "https://upamedia.atpco.net/photos/9db2c6c1-98fc-4fe5-a0ac-cd764d1cacd3/neo-interior1.jpg",
                                 "urlType": "URL"
                             },
                            {
                                 "value": "https://upamedia.atpco.net/photos/9db2c6c1-98fc-4fe5-a0ac-cd764d1cacd3/square_thumb/neo-interior1.jpg",
                                 "urlType": "thumbURL"
                             }
                         ]
                     },
```

### Block 17

```
{
 "CatalogProductOfferingsQueryRequest": {
  "CatalogProductOfferingsRequest": {
   "@type": "CatalogProductOfferingsRequestAir",
   "maxNumberOfUpsellsToReturn": 1,
   "offersPerPage": 15,
   "contentSourceList": [
    "GDS"
   ],
   "PassengerCriteria": [
    {
     "@type": "PassengerCriteria",
     "number": 1,
     "age": 25,
     "passengerTypeCode": "ADT"
    }
   ],
   "SearchCriteriaFlight": [
    {
     "@type": "SearchCriteriaFlight",
     "departureDate": "2024-01-20",
     "From": {
      "value": "DEN"
     },
     "To": {
      "value": "ORD"
     }
    },
    {
     "@type": "SearchCriteriaFlight",
     "departureDate": "2024-01-27",
     "From": {
      "value": "ORD"
     },
     "To": {
      "value": "DEN"
     }
    }
   ],
   "SearchModifiersAir": {
    "@type": "SearchModifiersAir",
    "CarrierPreference": [
     {
      "@type": "CarrierPreference",
      "preferenceType": "Preferred",
      "carriers": [
       "UA"
      ]
     }
    ]
   }
  }
 }
}
```

### Block 18

```
{
 "CatalogProductOfferingsQueryRequest": {
  "CatalogProductOfferingsRequest": {
   "@type": "CatalogProductOfferingsRequestAir",
   "maxNumberOfUpsellsToReturn": 4,
   "offersPerPage": 10,
   "contentSourceList": [
    "NDC"
   ],
   "PassengerCriteria": [
    {
     "number": 1,
     "passengerTypeCode": "ADT"
    }
   ],
   "SearchCriteriaFlight": [
    {
     "departureDate": "2024-01-21",
     "From": {
      "value": "HKG"
     },
     "To": {
      "value": "SIN"
     }
    }
   ],
   "SearchModifiersAir": {
    "CarrierPreference": [
     {
      "preferenceType": "Permitted",
      "carriers": [
       "SQ"
      ]
     }
    ]
   }
  }
 }
}
```

### Block 19

```
{
 "CatalogProductOfferingsQueryRequest": {
  "CatalogProductOfferingsRequest": {
   "@type": "CatalogProductOfferingsRequestAir",
   "maxNumberOfUpsellsToReturn": 0,
   "contentSourceList": [
    "GDS"
   ],
   "PassengerCriteria": [
    {
     "@type": "PassengerCriteria",
     "number": 1,
     "passengerTypeCode": "ADT",
     "TravelerGeographicLocation": {
      "travelerGeographicLocationType": "City",
      "value": "LON"
     }
    },
    {
     "@type": "PassengerCriteria",
     "number": 1,
     "passengerTypeCode": "CNN",
     "age": 8
    }
   ],
   "SearchCriteriaFlight": [
    {
     "@type": "SearchCriteriaFlight",
     "departureDate": "2024-12-13",
     "DepartureTimeRange": {
      "start": "10:00:00",
      "end": "13:00:00"
     },
     "From": {
      "value": "LGW"
     },
     "To": {
      "value": "SIN"
     }
    },
    {
     "@type": "SearchCriteriaFlight",
     "departureDate": "2024-12-20",
     "DepartureTimeRange": {
      "start": "07:00:00",
      "end": "11:00:00"
     },
     "From": {
      "value": "SIN"
     },
     "To": {
      "value": "LGW"
     }
    }
   ],
   "SearchModifiersAir": {
    "@type": "SearchModifiersAir",
    "CabinPreference": [
     {
      "@type": "CabinPreference",
      "preferenceType": "Permitted",
      "cabins": [
       "Business"
      ]
     }
    ],
    "ConnectionPreferences": [
     {
      "@type": "ConnectionPreferencesAir",
      "FlightType": {
       "connectionType": "NonStopDirect"
      }
     }
    ]
   },
   "PricingModifiersAir": {
    "@type": "PricingModifiersAir",
    "currencyCode": "USD",
    "FareSelection": {
     "refundableOnlyInd": true
    }
   }
  }
 }
}
```

### Block 20

```
{
 "CatalogProductOfferingsQueryRequest": {
  "CatalogProductOfferingsRequest": {
   "@type": "CatalogProductOfferingsRequestAir",
   "maxNumberOfUpsellsToReturn": 4,
   "contentSourceList": [
    "GDS"
   ],
   "PassengerCriteria": [
    {
     "@type": "PassengerCriteria",
     "number": 1,
     "age": 25,
     "passengerTypeCode": "ADT"
    }
   ],
   "SearchCriteriaFlight": [
    {
     "@type": "SearchCriteriaFlight",
     "departureDate": "2024-12-21",
     "From": {
      "value": "SYD"
     },
     "To": {
      "value": "MEL"
     }
    },
    {
     "@type": "SearchCriteriaFlight",
     "departureDate": "2024-12-28",
     "From": {
      "value": "MEL"
     },
     "To": {
      "value": "SYD"
     }
    }
   ],
   "SearchModifiersAir": {
    "@type": "SearchModifiersAir",
    "CarrierPreference": [
     {
      "@type": "CarrierPreference",
      "preferenceType": "Permitted",
      "carriers": [
       "QF"
      ]
     }
    ]
   },
   "CustomResponseModifiersAir": {
    "@type": "CustomResponseModifiersAir",
    "SearchRepresentation": "Leg"
   }
  }
 }
}
```

### Block 21

```
{
 "CatalogProductOfferingsQueryRequest": {
  "CatalogProductOfferingsRequest": {
   "@type": "CatalogProductOfferingsRequestAir",
   "offersPerPage": 999,
   "contentSourceList": [
    "GDS"
   ],
   "maxNumberOfUpsellsToReturn": 0,
   "PassengerCriteria": [
    {
     "number": 1,
     "passengerTypeCode": "ADT"
    },
    {
     "number": 1,
     "passengerTypeCode": "INF"
    }
   ],
   "SearchCriteriaFlight": [
    {
     "departureDate": "2024-10-23",
     "From": {
      "value": "SYD"
     },
     "To": {
      "value": "CHC"
     }
    },
    {
     "departureDate": "2024-10-27",
     "From": {
      "value": "CHC"
     },
     "To": {
      "value": "SYD"
     }
    }
   ],
   "PricingModifiersAir": {
    "includeSplitPaymentInd": true
   }
  }
 }
}
```

### Block 22

```
{
 "CatalogProductOfferingsResponse": {
  "@type": "CatalogProductOfferingsResponse",
  "transactionId": "c7bcdc50-8eb5-4918-8ff2-f30b2a0abec2:ppnd1003",
  "CatalogProductOfferings": {
   "@type": "CatalogProductOfferings",
   "Identifier": {
    "value": "c344ad1f-df72-4ac9-be52-c5fff60e7f67"
   },
   "CatalogProductOffering": [
    {
     "@type": "CatalogProductOffering",
     "sequence": 1,
     "id": "o1",
     "Departure": "DEN",
     "Arrival": "ORD",
     "Brand": [
      {
       "@type": "BrandID",
       "BrandRef": "b0"
      },
      {
       "@type": "BrandID",
       "BrandRef": "b1"
      },
      {
       "@type": "BrandID",
       "BrandRef": "b2"
      }
     ],
     "ProductBrandOptions": [
      {
       "@type": "ProductBrandOptions",
       "flightRefs": [
        "s1"
       ],
       "ProductBrandOffering": [
        {
         "@type": "ProductBrandOffering",
         "Brand": {
          "@type": "BrandID",
          "BrandRef": "b0"
         },
         "Product": [
          {
           "@type": "ProductID",
           "productRef": "p0"
          }
         ],
         "TermsAndConditions": {
          "@type": "TermsAndConditionsID",
          "termsAndConditionsRef": "T0"
         },
         "CombinabilityCode": [
          "j1"
         ],
         "BestCombinablePrice": {
          "@type": "BestCombinablePriceDetail",
          "CurrencyCode": {
           "decimalPlace": 2,
           "value": "AUD"
          },
          "Base": 306,
          "TotalTaxes": 70.2,
          "TotalPrice": 376.2,
          "PriceBreakdown": [
           {
            "@type": "PriceBreakdownAir",
            "quantity": 1,
            "requestedPassengerType": "ADT",
            "Amount": {
             "@type": "Amount",
             "CurrencyCode": {
              "decimalPlace": 2,
              "value": "AUD"
             },
             "Base": 306,
             "Taxes": {
              "@type": "TaxesDetail",
              "TotalTaxes": 70.2,
              "Tax": [
               {
                "taxCode": "AY",
                "value": 17.8
               },
               {
                "taxCode": "US",
                "value": 23
               },
               {
                "taxCode": "XF",
                "value": 14.2
               },
               {
                "taxCode": "ZP",
                "value": 15.2
               }
              ]
             },
             "Total": 376.2
            },
           }
          ]
         },
        "ContentSource": "GDS"
        },
        {
         "@type": "ProductBrandOffering",
          "Brand": {
          "@type": "BrandID",
          "BrandRef": "b1"
         },
         "Product": [
          {
           "@type": "ProductID",
           "productRef": "p8"
          }
         ],
         "TermsAndConditions": {
          "@type": "TermsAndConditionsID",
          "termsAndConditionsRef": "T1"
         },
         "CombinabilityCode": [
          "j2"
         ],
         "BestCombinablePrice": {
          "@type": "BestCombinablePriceDetail",
          "CurrencyCode": {
           "decimalPlace": 2,
           "value": "AUD"
          },
          "Base": 541,
          "TotalTaxes": 87.8,
          "TotalPrice": 628.8,
          "PriceBreakdown": [
           {
            "@type": "PriceBreakdownAir",
            "quantity": 1,
            "requestedPassengerType": "ADT",
            "Amount": {
             "@type": "Amount",
             "CurrencyCode": {
              "decimalPlace": 2,
              "value": "AUD"
             },
             "Base": 541,
             "Taxes": {
              "@type": "TaxesDetail",
              "TotalTaxes": 87.8,
              "Tax": [
               {
                "taxCode": "AY",
                "value": 17.8
               },
               {
                "taxCode": "US",
                "value": 40.6
               },
               {
                "taxCode": "XF",
                "value": 14.2
               },
               {
                "taxCode": "ZP",
                "value": 15.2
               }
              ]
             },
             "Total": 628.8
            }
           }
          ]
         }
        }
       ]
      },
      {
       "@type": "ProductBrandOptions",
       "flightRefs": [
        "s39",
        "s40"
       ],
       "ProductBrandOffering": [
        {
         "@type": "ProductBrandOffering",
         "Brand": {
          "@type": "BrandID",
          "BrandRef": "b0"
         },
         "Product": [
          {
           "@type": "ProductID",
           "productRef": "p204"
          }
         ],
         "TermsAndConditions": {
          "@type": "TermsAndConditionsID",
          "termsAndConditionsRef": "T44"
         },
         "CombinabilityCode": [
          "j23"
         ],
         "BestCombinablePrice": {
          "@type": "BestCombinablePriceDetail",
          "CurrencyCode": {
           "decimalPlace": 2,
           "value": "AUD"
          },
          "Base": 495,
          "TotalTaxes": 99.1,
          "TotalPrice": 594.1,
          "PriceBreakdown": [
           {
            "@type": "PriceBreakdownAir",
            "quantity": 1,
            "requestedPassengerType": "ADT",
            "Amount": {
             "@type": "Amount",
             "CurrencyCode": {
              "decimalPlace": 2,
              "value": "AUD"
             },
             "Base": 495,
             "Taxes": {
              "@type": "TaxesDetail",
              "TotalTaxes": 99.1,
              "Tax": [
               {
                "taxCode": "AY",
                "value": 17.8
               },
               {
                "taxCode": "US",
                "value": 37.2
               },
               {
                "taxCode": "XF",
                "value": 21.3
               },
               {
                "taxCode": "ZP",
                "value": 22.8
               }
              ]
             },
             "Total": 594.1
            }
           }
          ]
         },
         "ContentSource": "GDS"
        },
        {
         "@type": "ProductBrandOffering",
         "Brand": {
          "@type": "BrandID",
          "BrandRef": "b1"
         },
         "Product": [
          {
           "@type": "ProductID",
           "productRef": "p205"
          }
         ],
         "TermsAndConditions": {
          "@type": "TermsAndConditionsID",
          "termsAndConditionsRef": "T45"
         },
         "CombinabilityCode": [
          "j24"
         ],
         "BestCombinablePrice": {
          "@type": "BestCombinablePriceDetail",
          "CurrencyCode": {
           "decimalPlace": 2,
           "value": "AUD"
          },
          "Base": 710,
          "TotalTaxes": 115.2,
          "TotalPrice": 825.2,
          "PriceBreakdown": [
           {
            "@type": "PriceBreakdownAir",
            "quantity": 1,
            "requestedPassengerType": "ADT",
            "Amount": {
             "@type": "Amount",
             "CurrencyCode": {
              "decimalPlace": 2,
              "value": "AUD"
             },
             "Base": 710,
             "Taxes": {
              "@type": "TaxesDetail",
              "TotalTaxes": 115.2,
              "Tax": [
               {
                "taxCode": "AY",
                "value": 17.8
               },
               {
                "taxCode": "US",
                "value": 53.3
               },
               {
                "taxCode": "XF",
                "value": 21.3
               },
               {
                "taxCode": "ZP",
              
…
```

### Block 23

```
{
 "CatalogProductOfferingsResponse": {
  "@type": "CatalogProductOfferingsResponse",
  "transactionId": "7f868951-3008-4302-8964-3a5b3c0af21b:ppnd1003",
  "CatalogProductOfferings": {
   "@type": "CatalogProductOfferings",
   "Identifier": {
    "value": "756765be-3659-4d4f-9d6a-87979d5b3c3d"
   },
   "CatalogProductOffering": [
    {
     "@type": "CatalogProductOffering",
     "sequence": 1,
     "id": "SQ_CPO0",
     "Identifier": {
      "authority": "SQ",
      "value": "U1AyRi0xNTU1NTUzMjY3MjIyMzk3MTk4N3xTUV9DUE8w"
     },
     "Departure": "HKG",
     "Arrival": "SIN",
     "Brand": [
      {
       "@type": "BrandID",
       "BrandRef": "SQb1"
      }
     ],
     "ProductBrandOptions": [
      {
       "@type": "ProductBrandOptions",
       "ProductBrandOffering": [
        {
         "@type": "ProductBrandOffering",
         "Identifier": {
          "authority": "SQ",
          "value": "U1AyRi0xNTU1NTUzMjY3MjIyMzk3MTk4Ny0xfFNQMkYtMTU1NTU1MzI2NzIyMjM5NzE5ODd8MjAyMy0xMi0yMVQxNDoyODowMHxBRFQ6U1AyRi0xNTU1NTUzMjY3MjIyMzk3MTk4Ny0xLTF8U1F8QVBJSm91cm5leVR5cGU6Sm91cm5leQ=="
         },
         "Price": {
          "@type": "PriceDetail",
          "CurrencyCode": {
           "decimalPlace": 2,
           "value": "USD"
          },
          "Base": 252,
          "TotalTaxes": 33.9,
          "TotalFees": 0,
          "TotalPrice": 285.9,
          "PriceBreakdown": [
           {
            "@type": "PriceBreakdownAir",
            "quantity": 1,
            "requestedPassengerType": "ADT",
            "Amount": {
             "@type": "Amount",
             "CurrencyCode": {
              "decimalPlace": 2,
              "value": "USD"
             },
             "Base": 252,
             "Taxes": {
              "@type": "TaxesDetail",
              "TotalTaxes": 33.9
             },
             "Fees": {
              "@type": "FeesDetail",
              "TotalFees": 0
             },
             "Total": 285.9
            }
           }
          ]
         },
         "Brand": {
          "@type": "BrandID",
          "BrandRef": "SQb1"
         },
         "Product": [
          {
           "@type": "ProductID",
           "productRef": "SQp0"
          }
         ],
         "TermsAndConditions": {
          "@type": "TermsAndConditionsID",
          "termsAndConditionsRef": "SQt0"
         },
         "CombinabilityCode": [
          "SQ__CC01"
         ],
         "BestCombinablePrice": {
          "@type": "BestCombinablePriceDetail",
          "CurrencyCode": {
           "decimalPlace": 2,
           "value": "USD"
          },
          "Base": 252,
          "TotalTaxes": 33.9,
          "TotalPrice": 285.9,
          "PriceBreakdown": [
           {
            "@type": "PriceBreakdownAir",
            "quantity": 1,
            "requestedPassengerType": "ADT",
            "Amount": {
             "@type": "Amount",
             "Base": 252,
             "Taxes": {
              "@type": "TaxesDetail",
              "TotalTaxes": 33.9
             },
             "Fees": {
              "@type": "FeesDetail",
              "TotalFees": 0
             },
             "Total": 285.9
            },
           }
          ]
         },
         "ContentSource": "NDC"
        },
        {
         "@type": "ProductBrandOffering",
         "Identifier": {
          "authority": "SQ",
          "value": "U1AyRi0xNTU1NTUzMjY3MjIyMzk3MTk4Ny01fFNQMkYtMTU1NTU1MzI2NzIyMjM5NzE5ODd8MjAyMy0xMi0yMVQxNDoyODowMHxBRFQ6U1AyRi0xNTU1NTUzMjY3MjIyMzk3MTk4Ny01LTF8U1F8QVBJSm91cm5leVR5cGU6Sm91cm5leQ=="
         },
         "Price": {
          "@type": "PriceDetail",
          "CurrencyCode": {
           "decimalPlace": 2,
           "value": "USD"
          },
          "Base": 334,
          "TotalTaxes": 33.9,
          "TotalFees": 0,
          "TotalPrice": 367.9,
          "PriceBreakdown": [
           {
            "@type": "PriceBreakdownAir",
            "quantity": 1,
            "requestedPassengerType": "ADT",
            "Amount": {
             "@type": "Amount",
             "CurrencyCode": {
              "decimalPlace": 2,
              "value": "USD"
             },
             "Base": 334,
             "Taxes": {
              "@type": "TaxesDetail",
              "TotalTaxes": 33.9
             },
             "Fees": {
              "@type": "FeesDetail",
              "TotalFees": 0
             },
             "Total": 367.9
            }
           }
          ]
         },
         "Brand": {
          "@type": "BrandID",
          "BrandRef": "SQb2"
         },
         "Product": [
          {
           "@type": "ProductID",
           "productRef": "SQp4"
          }
         ],
         "TermsAndConditions": {
          "@type": "TermsAndConditionsID",
          "termsAndConditionsRef": "SQt1"
         },
         "CombinabilityCode": [
          "SQ__CC05"
         ],
         "BestCombinablePrice": {
          "@type": "BestCombinablePriceDetail",
          "CurrencyCode": {
           "decimalPlace": 2,
           "value": "USD"
          },
          "Base": 334,
          "TotalTaxes": 33.9,
          "TotalPrice": 367.9,
          "PriceBreakdown": [
           {
            "@type": "PriceBreakdownAir",
            "quantity": 1,
            "requestedPassengerType": "ADT",
            "Amount": {
             "@type": "Amount",
             "Base": 334,
             "Taxes": {
              "@type": "TaxesDetail",
              "TotalTaxes": 33.9
             },
             "Fees": {
              "@type": "FeesDetail",
              "TotalFees": 0
             },
             "Total": 367.9
            },
           }
          ]
         },
         "ContentSource": "NDC"
        },
        {
         "@type": "ProductBrandOffering",
         "Identifier": {
          "authority": "SQ",
          "value": "U1AyRi0xNTU1NTUzMjY3MjIyMzk3MTk4Ny0xMXxTUDJGLTE1NTU1NTMyNjcyMjIzOTcxOTg3fDIwMjMtMTItMjFUMTQ6Mjg6MDB8QURUOlNQMkYtMTU1NTU1MzI2NzIyMjM5NzE5ODctMTEtMXxTUXxBUElKb3VybmV5VHlwZTpKb3VybmV5"
         },
         "Price": {
          "@type": "PriceDetail",
          "CurrencyCode": {
           "decimalPlace": 2,
           "value": "USD"
          },
          "Base": 579,
          "TotalTaxes": 33.9,
          "TotalFees": 0,
          "TotalPrice": 612.9,
          "PriceBreakdown": [
           {
            "@type": "PriceBreakdownAir",
            "quantity": 1,
            "requestedPassengerType": "ADT",
            "Amount": {
             "@type": "Amount",
             "CurrencyCode": {
              "decimalPlace": 2,
              "value": "USD"
             },
             "Base": 579,
             "Taxes": {
              "@type": "TaxesDetail",
              "TotalTaxes": 33.9
             },
             "Fees": {
              "@type": "FeesDetail",
              "TotalFees": 0
             },
             "Total": 612.9
            }
           }
          ]
         },
         "Brand": {
          "@type": "BrandID",
          "BrandRef": "SQb4"
         },
         "Product": [
          {
           "@type": "ProductID",
           "productRef": "SQp8"
          }
         ],
         "TermsAndConditions": {
          "@type": "TermsAndConditionsID",
          "termsAndConditionsRef": "SQt2"
         },
         "CombinabilityCode": [
          "SQ__CC09"
         ],
         "BestCombinablePrice": {
          "@type": "BestCombinablePriceDetail",
          "CurrencyCode": {
           "decimalPlace": 2,
           "value": "USD"
          },
          "Base": 579,
          "TotalTaxes": 33.9,
          "TotalPrice": 612.9,
          "PriceBreakdown": [
           {
            "@type": "PriceBreakdownAir",
    
…
```

### Block 24

```
{
 "CatalogProductOfferingsResponse": {
  "@type": "CatalogProductOfferingsResponse",
  "transactionId": "dc159446-e309-4b5f-a5f9-b4776c2f6d34:ppnd1001",
  "CatalogProductOfferings": {
   "@type": "CatalogProductOfferings",
   "CatalogProductOffering": [
    {
     "@type": "CatalogProductOffering",
     "sequence": 1,
     "id": "o1",
     "Departure": "LHR",
     "Arrival": "SIN",
     "Brand": [
      {
       "@type": "BrandID",
       "BrandRef": "b0"
      }
     ],
     "ProductBrandOptions": [
      {
       "@type": "ProductBrandOptions",
       "flightRefs": [
        "s1"
       ],
       "ProductBrandOffering": [
        {
         "@type": "ProductBrandOffering",
          "Brand": {
          "@type": "BrandID",
          "BrandRef": "b0"
         },
         "Product": [
          {
           "@type": "ProductID",
           "productRef": "p0"
          }
         ],
         "TermsAndConditions": {
          "@type": "TermsAndConditionsID",
          "termsAndConditionsRef": "T0"
         },
         "CombinabilityCode": [
          "j1"
         ],
         "BestCombinablePrice": {
          "@type": "BestCombinablePriceDetail",
          "CurrencyCode": {
           "decimalPlace": 2,
           "value": "USD"
          },
          "Base": 14401,
          "TotalTaxes": 751.4,
          "TotalPrice": 15152.4,
          "PriceBreakdown": [
           {
            "@type": "PriceBreakdownAir",
            "quantity": 1,
            "requestedPassengerType": "ADT",
            "Amount": {
             "@type": "Amount",
             "CurrencyCode": {
              "decimalPlace": 2,
              "value": "USD"
             },
             "Base": 8229,
             "Taxes": {
              "@type": "TaxesDetail",
              "TotalTaxes": 375.7
             },
             "Total": 8604.7
            }
           },
           {
            "@type": "PriceBreakdownAir",
            "quantity": 1,
            "requestedPassengerType": "CNN",
            "Amount": {
             "@type": "Amount",
             "CurrencyCode": {
              "decimalPlace": 2,
              "value": "USD"
             },
             "Base": 6172,
             "Taxes": {
              "@type": "TaxesDetail",
              "TotalTaxes": 375.7
             },
             "Total": 6547.7
            }
           }
          ]
         }
        }
       ]
      }
     ]
    },

    {
     "@type": "CatalogProductOffering",
     "sequence": 2,
     "id": "o2",
     "Departure": "SIN",
     "Arrival": "LHR",
     "Brand": [
      {
       "@type": "BrandID",
       "BrandRef": "b0"
      }
     ],
     "ProductBrandOptions": [
      {
       "@type": "ProductBrandOptions",
       "flightRefs": [
        "s2"
       ],
       "ProductBrandOffering": [
        {
         "@type": "ProductBrandOffering",
         "Price": {
          "@type": "PriceDetail",
          "CurrencyCode": {
           "decimalPlace": 2,
           "value": "USD"
          },
          "Base": 7200.87,
          "TotalTaxes": 90.8,
          "TotalFees": 0,
          "TotalPrice": 7291.67,
          "PriceBreakdown": [
           {
            "@type": "PriceBreakdownAir",
            "quantity": 1,
            "requestedPassengerType": "ADT",
            "Amount": {
             "@type": "Amount",
             "CurrencyCode": {
              "decimalPlace": 2,
              "value": "USD"
             },
             "Base": 4114.64,
             "Taxes": {
              "@type": "TaxesDetail",
              "TotalTaxes": 45.4
             },
             "Fees": {
              "@type": "FeesDetail",
              "TotalFees": 0
             },
             "Total": 4160.04
            }
           },
           {
            "@type": "PriceBreakdownAir",
            "quantity": 1,
            "requestedPassengerType": "CNN",
            "Amount": {
             "@type": "Amount",
             "CurrencyCode": {
              "decimalPlace": 2,
              "value": "USD"
             },
             "Base": 3086.23,
             "Taxes": {
              "@type": "TaxesDetail",
              "TotalTaxes": 45.4
             },
             "Fees": {
              "@type": "FeesDetail",
              "TotalFees": 0
             },
             "Total": 3131.63
            }
           }
          ]
         },
         "Brand": {
          "@type": "BrandID",
          "BrandRef": "b0"
         },
         "Product": [
          {
           "@type": "ProductID",
           "productRef": "p1"
          }
         ],
         "TermsAndConditions": {
          "@type": "TermsAndConditionsID",
          "termsAndConditionsRef": "T1"
         },
         "CombinabilityCode": [
          "j1"
         ],
         "BestCombinablePrice": {
          "@type": "BestCombinablePriceDetail",
          "CurrencyCode": {
           "decimalPlace": 2,
           "value": "USD"
          },
          "Base": 14401,
          "TotalTaxes": 751.4,
          "TotalPrice": 15152.4,
          "PriceBreakdown": [
           {
            "@type": "PriceBreakdownAir",
            "quantity": 1,
            "requestedPassengerType": "ADT",
            "Amount": {
             "@type": "Amount",
             "CurrencyCode": {
              "decimalPlace": 2,
              "value": "USD"
             },
             "Base": 8229,
             "Taxes": {
              "@type": "TaxesDetail",
              "TotalTaxes": 375.7
             },
             "Total": 8604.7
            }
           },
           {
            "@type": "PriceBreakdownAir",
            "quantity": 1,
            "requestedPassengerType": "CNN",
            "Amount": {
             "@type": "Amount",
             "CurrencyCode": {
              "decimalPlace": 2,
              "value": "USD"
             },
             "Base": 6172,
             "Taxes": {
              "@type": "TaxesDetail",
              "TotalTaxes": 375.7
             },
             "Total": 6547.7
            }
           }
          ]
         }
        }
       ]
      }
     ]
    }
   ]
  },
  "Result": {
   "@type": "Result"
  },
  "ReferenceList": [
   {
    "@type": "ReferenceListFlight",
    "Flight": [
     {
      "@type": "FlightDetail",
      "distance": 6748,
      "duration": "PT12H55M",
      "carrier": "SQ",
      "number": "317",
      "equipment": "388",
      "id": "s1",
      "Departure": {
       "@type": "DepartureDetail",
       "terminal": "2",
       "location": "LHR",
       "date": "2024-12-13",
       "time": "10:55:00"
      },
      "Arrival": {
       "@type": "ArrivalDetail",
       "terminal": "0",
       "location": "SIN",
       "date": "2024-12-14",
       "time": "07:50:00"
      },
      "AvailabilitySourceCode": "S"
     },
     {
      "@type": "FlightDetail",
      "distance": 6748,
      "duration": "PT14H20M",
      "carrier": "SQ",
      "number": "308",
      "equipment": "388",
      "id": "s2",
      "Departure": {
       "@type": "DepartureDetail",
       "terminal": "3",
       "location": "SIN",
       "date": "2024-12-20",
       "time": "09:00:00"
      },
      "Arrival": {
       "@type": "ArrivalDetail",
       "terminal": "2",
       "location": "LHR",
       "date": "2024-12-20",
       "time": "15:20:00"
      },
      "AvailabilitySourceCode": "S"
     }
    ]
   },
   {
    "@type": "ReferenceListProduct",
    "Product": [
     {
      "@type": "ProductAir",
      "totalDuration": "PT12H55M",
      "id": "p0",
      "Quantity": 9,
      "FlightSegment": [
       {
        "@type": "FlightSegment",
        "sequence": 1,
        "Flight": {
         "@type": "FlightID",
         "F
…
```

### Block 25

```
...     {
         "@type": "ProductBrandOffering",
         "Price": {
          "@type": "PriceDetail",
          "CurrencyCode": {
           "decimalPlace": 2,
           "value": "AUD"
          },
          "Base": 209,
          "TotalTaxes": 143.06,
          "TotalFees": 0,
          "TotalPrice": 352.06,
          "PriceBreakdown": [
           {
            "@type": "PriceBreakdownAir",
            "quantity": 1,
            "requestedPassengerType": "ADT",
            "Amount": {
             "@type": "Amount",
             "CurrencyCode": {
              "decimalPlace": 2,
              "value": "AUD"
             },
             "Base": 190,
             "Taxes": {
              "@type": "TaxesDetail",
              "TotalTaxes": 143.06,
              "Tax": [
               {
                "taxCode": "AU",
                "value": 60
               },
               {
                "taxCode": "WY",
                "value": 32.16
               },
               {
                "taxCode": "F1",
                "value": 35.7
               },
               {
                "taxCode": "KK",
                "value": 15.2
               }
              ]
             },
             "Fees": {
              "@type": "FeesDetail",
              "TotalFees": 0
             },
             "Total": 333.06
            }
           },
           {
            "@type": "PriceBreakdownAir",
            "quantity": 1,
            "requestedPassengerType": "INF",
            "Amount": {
             "@type": "Amount",
             "CurrencyCode": {
              "decimalPlace": 2,
              "value": "AUD"
             },
             "Base": 19,
             "Taxes": {
              "@type": "TaxesDetail",
              "TotalTaxes": 0
             },
             "Fees": {
              "@type": "FeesDetail",
              "TotalFees": 0
             },
             "Total": 19
            }
           }
          ]
         },
         "Brand": {
          "@type": "BrandID",
          "BrandRef": "b0"
         },
         "Product": [
          {
           "@type": "ProductID",
           "productRef": "p0"
          }
         ],
         "TermsAndConditions": {
          "@type": "TermsAndConditionsID",
          "termsAndConditionsRef": "T0"
         },
         "CombinabilityCode": [
          "j0"
         ],
         "BestCombinablePrice": {
          "@type": "BestCombinablePriceDetail",
          "CurrencyCode": {
           "decimalPlace": 2,
           "value": "AUD"
          },
          "Base": 209,
          "TotalTaxes": 143.06,
          "TotalPrice": 352.06,
          "PriceBreakdown": [
           {
            "@type": "PriceBreakdownAir",
            "quantity": 1,
            "requestedPassengerType": "ADT",
            "Amount": {
             "@type": "Amount",
             "CurrencyCode": {
              "decimalPlace": 2,
              "value": "AUD"
             },
             "Base": 190,
             "Taxes": {
              "@type": "TaxesDetail",
              "TotalTaxes": 143.06,
              "Tax": [
               {
                "taxCode": "AU",
                "value": 60
               },
               {
                "taxCode": "WY",
                "value": 32.16
               },
               {
                "taxCode": "F1",
                "value": 35.7
               },
               {
                "taxCode": "KK",
                "value": 15.2
               }
              ]
             },
             "Total": 333.06
            }
           },
           {
            "@type": "PriceBreakdownAir",
            "quantity": 1,
            "requestedPassengerType": "INF",
            "Amount": {
             "@type": "Amount",
             "CurrencyCode": {
              "decimalPlace": 2,
              "value": "AUD"
             },
             "Base": 19,
             "Taxes": {
              "@type": "TaxesDetail",
              "TotalTaxes": 0
             },
             "Total": 19
            }
           }
          ]
         },
         "CO2EmissionsData": {
          "@type": "CO2EmissionsData",
          "Actual": {
           "measurementType": "Weight",
           "unit": "Kilograms",
           "value": 145
          },
          "Typical": {
           "measurementType": "Weight",
           "unit": "Kilograms",
           "value": 165
          },
          "Variance": -12
         }
        }
```

### Block 26

```
{
 "CatalogProductOfferingsResponse": {
  "@type": "CatalogProductOfferingsResponse",
  "transactionId": "chintanTest",
  "CatalogProductOfferings": {
   "@type": "CatalogProductOfferings",
   "Identifier": {
    "value": "4ee825d5-75a6-4964-bd1d-a245197f4333"
   },
   "CatalogProductOffering": [...]
  },
  "Result": {
   "@type": "Result"
  },
  "ReferenceList": [
   {
    "@type": "ReferenceListFlight",
    "Flight": [...]
   },
   {
    "@type": "ReferenceListProduct",
    "Product": [
     {
      "@type": "ProductAir",
      "totalDuration": "PT14H7M",
      "id": "p0",
      "Quantity": 1,
      "FlightSegment": [
       {
        "@type": "FlightSegment",
        "sequence": 1,
        "connectionDuration": "PT2H14M",
        "amenityRefs": [
         "a6",
         "a7",
         "a8",
         "a9",
         "a13",
         "a18",
         "a20",
         "a21"
        ],
        "boundFlightsInd": true,
        "Flight": {
         "@type": "FlightID",
         "FlightRef": "s4"
        }
       },
       {
        "@type": "FlightSegment",
        "sequence": 2,
        "connectionDuration": "PT1H",
        "amenityRefs": [
         "a6",
         "a8",
         "a9",
         "a13",
         "a14",
         "a19",
         "a20",
         "a21"
        ],
        "boundFlightsInd": true,
        "Flight": {
         "@type": "FlightID",
         "FlightRef": "s5"
        }
       },
       {
        "@type": "FlightSegment",
        "sequence": 3,
        "amenityRefs": [
         "a0",
         "a15",
         "a17",
        ],
        "Flight": {
         "@type": "FlightID",
         "FlightRef": "s6"
        }
       }
      ],
      "PassengerFlight": [
       {
        "@type": "PassengerFlight",
        "passengerQuantity": 1,
        "passengerTypeCode": "ADT",
        "FlightProduct": [
         {
          "@type": "FlightProduct",
          "segmentSequence": [
           1,
           2
          ],
          "classOfService": "J",
          "cabin": "First",
          "fareBasisCode": "FNN09RFP",
          "fareType": "PublicFare",
          "fareTypeCode": "FCF",
          "Brand": {
           "@type": "BrandID",
           "BrandRef": "b0"
          }
         },
         {
          "@type": "FlightProduct",
          "segmentSequence": [
           3
          ],
          "classOfService": "F",
          "cabin": "First",
          "fareBasisCode": "FNN09RFP",
          "fareType": "PublicFare",
          "fareTypeCode": "FCF",
          "Brand": {
           "@type": "BrandID",
           "BrandRef": "b0"
          }
         }
        ]
       }
      ]
     },
     {
      "@type": "ProductAir",
      "totalDuration": "PT19H5M",
      "id": "p1",
      "Quantity": 3,
      "FlightSegment": [
       {
        "@type": "FlightSegment",
        "sequence": 1,
        "connectionDuration": "PT2H49M",
        "amenityRefs": [
         "a6",
         "a7",
         "a8",
         "a9",
         "a13",
         "a18",
         "a20",
         "a21"
        ],
        "boundFlightsInd": true,
        "Flight": {
         "@type": "FlightID",
         "FlightRef": "s10"
        }
       },
       {
        "@type": "FlightSegment",
        "sequence": 2,
        "connectionDuration": "PT5H42M",
        "amenityRefs": [
         "a4",
         "a6",
         "a8",
         "a9",
         "a13",
         "a14",
         "a19",
        ],
        "boundFlightsInd": true,
        "Flight": {
         "@type": "FlightID",
         "FlightRef": "s11"
        }
       },
       {
        "@type": "FlightSegment",
        "sequence": 3,
        "amenityRefs": [
         "a0",
         "a15",
         "a17",
         "a22",
         "a25",
         "a27",
         "a28",
        ],
        "Flight": {
         "@type": "FlightID",
         "FlightRef": "s12"
        }
       }
      ],
      "PassengerFlight": [
       {
        "@type": "PassengerFlight",
        "passengerQuantity": 1,
        "passengerTypeCode": "ADT",
        "FlightProduct": [
         {
          "@type": "FlightProduct",
          "segmentSequence": [
           1,
           2
          ],
          "classOfService": "J",
          "cabin": "First",
          "fareBasisCode": "FNN09RFP",
          "fareType": "PublicFare",
          "fareTypeCode": "FCF",
          "Brand": {
           "@type": "BrandID",
           "BrandRef": "b0"
          }
         },
         {
          "@type": "FlightProduct",
          "segmentSequence": [
           3
          ],
          "classOfService": "F",
          "cabin": "First",
          "fareBasisCode": "FNN09RFP",
          "fareType": "PublicFare",
          "fareTypeCode": "FCF",
          "Brand": {
           "@type": "BrandID",
           "BrandRef": "b0"
          }
         }
        ]
       }
      ]
     },
     {
      "@type": "ProductAir",
      "totalDuration": "PT14H7M",
      "id": "p2",
      "Quantity": 3,
      "FlightSegment": [
       {
        "@type": "FlightSegment",
        "sequence": 1,
        "connectionDuration": "PT2H14M",
        "amenityRefs": [
         "a6",
         "a7",
         "a8",
         "a9",
         "a13",
         "a18",
         "a20",
         "a21"
        ],
        "boundFlightsInd": true,
        "Flight": {
         "@type": "FlightID",
         "FlightRef": "s1"
        }
       },
       {
        "@type": "FlightSegment",
        "sequence": 2,
        "connectionDuration": "PT1H",
        "amenityRefs": [
         "a6",
         "a8",
         "a9",
         "a13",
         "a14",
         "a19",
         "a20",
         "a21"
        ],
        "boundFlightsInd": true,
        "Flight": {
         "@type": "FlightID",
         "FlightRef": "s2"
        }
       },
       {
        "@type": "FlightSegment",
        "sequence": 3,
        "amenityRefs": [
         "a0",
         "a15",
         "a17",
        ],
        "Flight": {
         "@type": "FlightID",
         "FlightRef": "s3"
        }
       }
      ],
      "PassengerFlight": [
       {
        "@type": "PassengerFlight",
        "passengerQuantity": 1,
        "passengerTypeCode": "ADT",
        "FlightProduct": [
         {
          "@type": "FlightProduct",
          "segmentSequence": [
           1,
           2
          ],
          "classOfService": "J",
          "cabin": "First",
          "fareBasisCode": "FNN09RFP",
          "fareType": "PublicFare",
          "fareTypeCode": "FCF",
          "Brand": {
           "@type": "BrandID",
           "BrandRef": "b1"
          }
         },
         {
          "@type": "FlightProduct",
          "segmentSequence": [
           3
          ],
          "classOfService": "F",
          "cabin": "First",
          "fareBasisCode": "FNN09RFP",
          "fareType": "PublicFare",
          "fareTypeCode": "FCF",
          "Brand": {
           "@type": "BrandID",
           "BrandRef": "b1"
          }
         }
        ]
       }
      ]
     },
    ]
   },
   {
    "@type": "ReferenceListTermsAndConditions",
    "TermsAndConditions": [...]
   },
   {
    "@type": "ReferenceListBrand",
    "Brand": [...]
   },
   {
    "@type": "ReferenceListAmenity",
    "Amenity": [
     {
      "@type": "Amenity",
      "id": "a0",
      "Category": "Beverage",
      "Text": {
       "language": "en",
       "value": "Premium alcohol &amp; beverages provided"
      }
     },
     {
      "@type": "Amenity",
      "id": "a1",
      "Category": "Aircraft",
      "Text": {
       "language": "en",
       "value": "A320 (narrowbody)"
      }
     },
     {
      "@type": "Amenity",
      "id": "a2",

…
```

### Block 27

```
...  {
    "@type": "ReferenceListUniversalProductAttribute",
    "UniversalProductAttribute": [
     {
      "@type": "UniversalProductAttribute",
      "id": "u0",
      "headline": "Your SWISS First experience",
      "description": "There is a separate check-in desk at the terminal just for you, so your trip gets off to a pleasant start without long waiting periods.",
      "IconURL": [
       {
        "urlType": "smallURL",
        "value": "https://upamedia.atpco.net/icons/1ee3970f-f4e0-42b4-946a-c280814c950d/small/departure-terminal.png"
       },
       {
        "urlType": "largeURL",
        "value": "https://upamedia.atpco.net/icons/1ee3970f-f4e0-42b4-946a-c280814c950d/large/departure-terminal.png"
       }
      ],
      "UPAMedia": [
       {
        "@type": "UPAMedia",
        "mediaType": "Photo",
        "caption": "There is a separate check-in desk at the terminal just for you, so your trip gets off to a pleasant start without long waiting periods.",
        "URL": [
         {
          "urlType": "URL",
          "value": "https://upamedia.atpco.net/photos/9afadd1a-e5a5-4a69-bb1d-39a88abb4998/loungea-f-39.png"
         },
         {
          "urlType": "largeURL",
          "value": "https://upamedia.atpco.net/photos/9afadd1a-e5a5-4a69-bb1d-39a88abb4998/large/loungea-f-39.png"
         },
         {
          "urlType": "mediumURL",
          "value": "https://upamedia.atpco.net/photos/9afadd1a-e5a5-4a69-bb1d-39a88abb4998/large_square_thumb/loungea-f-39.png"
         },
         {
          "urlType": "thumbURL",
          "value": "https://upamedia.atpco.net/photos/9afadd1a-e5a5-4a69-bb1d-39a88abb4998/square_thumb/loungea-f-39.png"
         }
        ]
       }
      ]
     }, ...
```

