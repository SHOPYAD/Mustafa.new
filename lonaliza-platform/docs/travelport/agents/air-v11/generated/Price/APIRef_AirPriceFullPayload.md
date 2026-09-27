# AirPrice Full Payload API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Price/APIRef_AirPriceFullPayload.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

AirPrice Full Payload API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search AirPrice Full Payload API&#160;Reference Request Response Example request Example response POST price/offers/buildfromproducts Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Air Pricing Guide , AirPrice Reference Payload API Reference The AirPrice API confirms pricing on air search results. While air pricing is generally an optional but recommended step, it is required for low cost carriers and some NDC carriers. The full payload request In the APIs, a request that sends all details of the offer or flight/s to be shopped, priced, added to the workbench. The alternative is to send a reference payload request, which sends a reference to an offer in a previous API response instead of full details. sends full itinerary details without a reference to any previous search. It can be used to price an itinerary returned from the Search API or from a non-Travelport source. For NDC, only &#160; specific NDC carriers support the AirPrice full payload request. For GDS&#160;and NDC differences in the JSON APIs, see the support tables for seats , ancillaries , fare rules , and exchanges/refunds , and the NDC&#160;and GDS Functionality Comparison . For differences within NDC by individual carriers, see NDC capabilities by airline through JSON API in the Travelport Knowledge Base. See Knowledge Base NDC&#160;Resources if you need login assistance. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body Basic AirPrice Request - Full Payload Show Request Body Table Object Description Required/Optional OfferQueryBuildFromProducts Top level object. Includes BuildFromProductsRequest and FareRuleType. Required MaxNumberOfUpsellsToReturn NDC&#160;only; not supported for GDS. Number. Supports values from 0 to 99 inclusive. Send to request upsell offers along with pricing for the requested class of service or cabin, returned in ascending price order. An upsell is the next highest fare in a different brand or cabin than requested. NDC only; not supported for GDS. Upsells are returned as follows: Upsells not requested:&#160;Only the requested offer is returned. One upsell requested: The lowest priced offer in the requested class of service or cabin plus one upsell offer are returned. Two upsells requested (and so on for x upsells requested): The lowest priced offer in the requested class of service or cabin plus two upsell offers are returned. Optional lowFareFinderInd &#160; Boolean. Provides pricing flexibility around class of service. If not sent, or sent with false , the response returns fares only in the requested class of service. Supported values: true: Returns the lowest fares available in any class of service available, which may not be the same as the requested class. Note that if lowFareFinderInd=true and CabinPreference is sent, the only supported value for CabinPreference/type is Permitted. false: Provides fares for only the specified class of service. Default. Note that when requesting branded fares with lowFareFindInd=true, AirPrice uses only the brand tier (and any other pricing modifiers) to find the lowest fare within a brand tier regardless of class of service. Optional returnBrandedFaresInd &#160; Boolean. Use to request the return of branded fares, which by default are not returned for the AirPrice Full Payload request. See Branded Fares and Attributes in the Air Pricing Guide. Supported values: true: Returns branded fares. false: Does not return branded fares. Default. Supported only in the full payload request. Optional validateInventoryInd Boolean. Sets whether to validate inventory in the requested class of service. Supported values: true: Checks for availability for the requested number of passengers in the requested class of service at the time of the price request. If there are fewer seats than requested passengers available in that class of service, AirPrice does not return any offers and instead returns an error message that the booking class or preference is not available. This reduces failures at the Add Offer and Workbench Commit steps. false: Checks only for general seat availability on the flight, not a specific class of service. AirPrice may return upsell offers with no availability in the requested class of service. Default. GDS&#160;only; not supported for NDC, as NDC&#160;carriers already validate inventory at pricing. Optional; default is false reCheckInventoryInd Boolean. Sets whether to validate inventory on the first flight in the itinerary in the requested class of service by booking and then releasing seats. Supported values: true: Checks for availability by booking and then releasing seats for the requested number of passengers in the requested class of service. If any or all segments are not bookable, AirPrice returns a message that the air segment/s are not bookable along with the dates and city pairs of the segments that are not bookable, per the following example. This indicator can help reduce sell failures at booking by alerting of insufficient availability. false: Checks only for general seat availability on the flight, not a specific class of service. Default. Because this indicator temporarily affects seat availability, recommended best practice is to use validateInventoryInd above instead. Some airlines have revenue management applications that monitor for high volumes of ‘sell/ignore’ transactions for inventory. Regardless of pricing results, air fares and inventory are only guaranteed by airlines when ticketed and paid for. To cause AirPrice to perform the same check for connecting flights, you can send both reCheckInventory=true and SpecificFlightCriteria/boundFlightsInd=true for each connecting flight per below . Show Example error response for non-bookable segments { "OfferListResponse": { "@type": "OfferListResponse", "transactionId": "04ec9290-06da-4eb6-bb3c-b09563cabd96", "Result": { "@type": "Result", "Error": [ { "@type": "ErrorDetail", "StatusCode": 200, "Message": "BOOKING CLASS/PREFERENCE NOT AVAIL CHECK AVAILABILITY" } ] }, "Identifier": { "value": "04ec9290-06da-4eb6-bb3c-b09563cabd96_PC" } } } Optional; default is false FareRuleType Returns fare rules in the price response. Use not recommended; send the Fare Rules request instead. Optional; use not recommended BuildFromProductsRequest Top level object. Includes PricingModifiersAir, PassengerCriteria, and ProductCriteriaAir. Send with @type BuildFromProductsRequestAir to price all PTCs and segments. To price a specific PTC and/or air segment, send with @type BuildFromProductsRequestOfferConstruction; see OfferConstruction. Required OfferConstruction GDS only; not supported for NDC. AirPrice full payload request only. Send to request pricing for specific passenger/s and/or air segment/s. Must also send PassengerCriteria/id, SpecificFlightCriteria/id, BuildFromProductsRequest with @type BuildFromProductsRequestOfferConstruction, and PricingModifiersAir/OrganizationInformation with the value Account. No other pricing modifiers are supported with OfferConstruction. Optional specificFlightCriteriaRefs Array. String. Send to request pricing for one or more specific segments. Must match a custom flight identifier value such as f1, f2, and so on sent in SpecificFlightCriteria/id. GDS only; not supported for NDC. Optional passengerCriteriaRefs Array. String. Send to request pricing for one or more specific passengers. Must match a custom passenger identifier value sent in PassengerCriteria/id. GDS only; not supported for NDC. Optional PricingModifiersAir Optional pricing modifiers. See the PricingModifiersAir table below. Optional PassengerCriteria Array. Defines the type of passenger/s on the itinerary. Send one PassengerCriteria for each passenger type code (PTC). AirPrice supports up to nine total passengers across all PTCs. May include optional CustomerLoyalty. Required id For GDS, in the full payload request only, use id to send a custom passenger id only when requesting pricing for one or more specific passengers with OfferConstruction. If not sent, pricing for all passengers is returned. GDS only; not supported for this use for NDC. For NDC, use id in the AirPrice full and reference payloads to assign a custom passenger id to be returned in the response, which supports matching that specific passenger to the PriceBreakdown in the response. Optional passengerTypeCode String. The passenger type code for the passengers on the itinerary. Common PTCs are: ADT: adult CHD: child of unknown age (see Notes on PTC and age below) CNN:&#160;child when age is known INF:&#160;infant without a seat INS:&#160;infant with a seat UNN:&#160;unaccompanied child See Downloads to download a full list of PTCs. When running a multiple passenger request for NDC on Qantas, Qantas supports only these PTCs: ADT, CHD, CNN, INF. Sending any other PTC may result in an error at ticketing. Required number Number. The number of passengers with this PTC. Default is 1. Required age Number. The age of the passenger. Notes on PTC and age Travelport recommends sending age only with PTCs that require age for pricing. For child passengers, Travelport recommends sending the age of the child in the age attribute plus the PTC CNN. Travelport recommends against sending CNN without age, or the CHD PTC. Many fares cannot be quoted for CHD. The age for CNN&#160;is generally between 2 and 11 inclusive, with ADT fares returned for ages 12 and up; however, this can vary by airline and country. The age for INF&#160;must be either 0 or 1. During booking, date of birth is required for all child and infant PTCs ( Add Traveler payload in Traveler/birthDate). Optional specifiedPassengerTypeCodeOnlyInd &#160; Boolean. AirPrice returns pricing only for the specified PTC. This indicator sets behavior if no offers for that PTC&#160;are available: true: If no fares are available for the specified PTC, returns an error message that there is no valid fare. false: If no fares are available for the specified PTC, returns fares for the default ADT (adult) PTC instead. GDS only; not supported for NDC . Optional Default is false CustomerLoyalty Optional object for sending customer loyalty information, such as for a frequent flyer program. If CustomerLoyalty is sent in the Search request, it must also be sent in the AirPrice request and the Add Traveler request. Because some carriers validate frequent traveler data through the workflow, failing to send the same CustomerLoyalty details, even if invalid, may cause a booking failure. If an invalid number is sent, the response returns a warning message that the FQTV is invalid, and the invalid number is cached to prevent a potential booking failure. NDC only; not supported for GDS. Optional TravelerGeographicLocation Optional object for requesting local citizen/local resident fares for Spain and associated islands. You must also send a PTC relevant to the local resident fares; e.g., ADR for adult resident, CHR for child resident. GDS only; not supported for NDC. Optional value String. IATA code specifying the location relevant to the local citizen//local resident fare. Optional travelerGeographicLocationType String. The type of location where the local fare is valid. Supported values are&#160; Country City State/Province Optional PaymentCriteria Send with IssuerIdentificationNumber to return OB&#160;fees. Optional IssuerIdentificationNumber String. From 6 to 16 characters inclusive are accepted. Sends the BIN of the credit card to be used for payment and returns OB fees, which are ticketing and form of payment (FOP) fees, including credit card fees. OB&#160;fees are returned in an instance of Price/PriceBreakdown/Fees/Fee with a feeCode of OB . For&#160;NDC&#160;carrier BA, you must send the complete 16-digit credit card number to return the surcharge amount. Required if PaymentCriteria sent ProductCriteriaAir Top level object for itinerary details. Includes SpecificFlightCriteria and CabinPreference. Required SpecificFlightCriteria Array. Each instance sends details for each flight (aka segment) on the itinerary to price. Required id Use to send a custom flight identifier value such as f1, f2, and so on only when requesting pricing for one or more specific segments with OfferConstruction. If not sent, pricing for all segments is returned. GDS only; not supported for NDC. Optional carrier String. IATA code of airline carrier for flight. Required flightNumber String. Flight number assigned by airline. Required departureDate String. Departure date of flight in YYYY-MM-DD format (e.g., departureDate="2026-12-06") Required departureTime String. Departure time of flight. HH:MM:SS (24-hour) format (e.g., departureTime="18:00"). Required arrivalDate String. Arrival date of flight in YYYY-MM-DD format. Required arrivalTime String. Arrival time of flight in HH:MM:SS (24-hour) format. Required from String. IATA airport code of departure. Required to String. IATA airport code of arrival. Required cabin String. Cabin class to price. Required classOfService String. Class of service to price. Required brandTier String. The brand tier to price, if brand tier pricing is desired. Supported only in the full payload request. Optional segmentSequence Sequence of this segment on the leg, starting with 0 for the first segment on the leg. A segment is one flight with the same flight number. Optional ContentSource String. Send with either GDS for GDS content or NDC for NDC content. Optional AvailabilitySourceCode Recommended to send in the full payload request. GDS&#160;only; not supported for NDC. Supported values and definitions for AvailabilitySourceCode: A:&#160;AVS (availability and schedules) B:&#160;Travelport cache C:&#160;AVS D:&#160;Direct Access E:&#160;Travelport cache F: Travelport cache G: Travelport cache H: Travelport cache I: Travelport cache K: Travelport cache L:&#160;Last seat availability M:&#160;Unknown source O: Travelport cache P: Travelport cache Q:&#160;Travelport cache S:&#160;Seamless T:&#160;Travelport cache U:&#160;Unknown source X:&#160;Customer reusing availability data from customer cache (data originally obtained from Travelport) Y:&#160;Customer reusing data obtained from another system (e.g., another GDS) (data may be fresh or stored in customer cache) Z:&#160;Customer sold from e-streamed data stored in customer cache Optional but recommended boundFlightsInd Boolean. Sets whether to validate inventory on a connecting flight in the requested class of service by booking and then releasing seats. Supported values: true: Send for the leading segment/s on a leg with connecting flight/s to also check availability on the connecting flight/s by booking and releasing seats in the requested class of service on those flight/s. For example, if a leg has two connections, send boundFlightsInd for the first two of the three flights. Must also send reCheckInventoryInd=true per above . If any or all segments are not bookable, AirPrice returns a message that the air segment/s are not bookable and the dates and city pairs of the segments that are not bookable. false: Checks only for general seat availability on any connecting flight, not a specific class of service. Default. Because this indicator temporarily affects seat availability, recommended best practice is to use validateInventoryInd instead of reCheckInventoryInd and boundFlightsInd. Some airlines have revenue management applications that monitor for high volumes of ‘sell/ignore’ transactions for inventory. Regardless of pricing results, air fares and inventory are guaranteed by airlines only when ticketed and paid for. GDS only; not supported for NDC. Supported only in the full payload request. Show Example with boundFlightsInd The following example request is for a round trip itinerary with connecting flights both ways. It sends the following: reCheckInventoryInd=true boundFlightsInd=true for the first flight segment (segmentSequence=0) on both the outbound/departure leg and the inbound/return leg { "OfferQueryBuildFromProducts": { "lowFareFinderInd": "false", "returnBrandedFaresInd": "false", "reCheckInventoryInd": true, "validateInventoryInd": "true", "BuildFromProductsRequest": { "@type": "BuildFromProductsRequestAir", "PassengerCriteria": [ { "passengerTypeCode": "ADT", "number": 1, "age": 24 } ], "ProductCriteriaAir": [ { "SpecificFlightCriteria": [ { "@type": "SpecificFlightCriteria", "carrier": "FJ", "flightNumber": "910", "departureDate": "2023-10-16", "departureTime": "13:45:00", "arrivalDate": "2023-10-16", "arrivalTime": "19:25:00", "from": "SYD", "to": "NAN", "cabin": "Economy", "classOfService": "V", "segmentSequence": "0", "boundFlightsInd": true }, { "@type": "SpecificFlightCriteria", "carrier": "FJ", "flightNumber": "810", "departureDate": "2023-10-16", "departureTime": "21:40:00", "arrivalDate": "2023-10-16", "arrivalTime": "12:55:00", "from": "NAN", "to": "LAX", "cabin": "Economy", "classOfService": "V", "segmentSequence": "1" } ] }, { "SpecificFlightCriteria": [ { "@type": "SpecificFlightCriteria", "carrier": "FJ", "flightNumber": "811", "departureDate": "2023-10-21", "departureTime": "23:55:00", "arrivalDate": "2023-10-23", "arrivalTime": "05:45:00", "from": "LAX", "to": "NAN", "cabin": "Economy", "classOfService": "T", "segmentSequence": "0", "boundFlightsInd": true }, { "@type": "SpecificFlightCriteria", "carrier": "FJ", "flightNumber": "911", "departureDate": "2023-10-26", "departureTime": "09:00:00", "arrivalDate": "2023-10-26", "arrivalTime": "11:45:00", "from": "NAN", "to": "SYD", "cabin": "Economy", "classOfService": "T", "segmentSequence": "1" } ] } ] }, "FareRuleType": "null" } } Optional CabinPreference Array. Requests a fare based on cabin class. Only one cabin preference type is allowed per request, but there is no limit to the number of cabins that can be sent. Optional type String. The type of cabin preference. Supported values are (no default): Permitted: Searches for ONLY the specified class or classes, and returns no offers if that class is not available. Preferred: Searches for the specified class or classes, and returns lower classes if the specified class is not available. PreferredWithUpgrade: Searches for the specified class or classes, and returns higher classes if the specified class is not available. Required if CabinPreference sent cabins String. A space-delimited list of cabins. Supported values are (no default): Economy PremiumEconomy Business First PremiumFirst Required if CabinPreference sent CustomResponseModifiersAir Sends additional modifiers. May include BrandAttributeInclusion. Optional excludeUnbundledFaresInd &#160; Boolean. Sets whether to return unbundled fares: true: Does not return unbundled fares. false: Returns unbundled and bundled fares as available. Default. GDS only; not supported for NDC. Optional Default is false includeFlightAmenitiesInd Boolean. Indicator to return flight amenities from ATPCO RouteHappy data: true: Returns flight amenities from ATPCO RouteHappy if available. false:&#160;Does not return ATPCO RouteHappy amenities. If requested, amenities are returned in ReferenceListAmenity . Optional excludePenaltiesInd Boolean. Indicator to set whether to return change and cancel penalties: true: Does not return penalties in the response. false or not sent:&#160;Returns penalties in the response. Default. If requested, change and cancel penalties are returned in TermsAndConditionsFullAir. GDS only; not supported for NDC. Optional Default if not sent is false BrandAttributeInclusion Object.&#160;Supports returning only information about the brand attributes specified in Classification below and does not return any other brand attributes for those fares. Optional Classification String. Send one or more of the following values to return information about only the specified attributes. Fares may include other attributes but information about them is not returned. Supported values: CarryOn Refund Meals Rebooking CheckedBag SeatAssignment WiFi May include AdditionalClassification. Required if BrandAttributeInclusion sent AdditionalClassification String. Send one or more of the following values to return information about only the specified additional attributes. Supported values: ChauffeurTransfer ExtraLegroom InFlightEntertainment LoungeAccess PriorityBaggage PriorityBoarding PriorityCheckIn PrioritySecurity PriorityServices MileageAccrual Upgrades USB Optional PricingModifiersAir (optional pricing modifiers) Show PricingModifiersAir Table Add one or more optional pricing modifiers. All pricing modifiers are in OfferQueryBuildFromCatalogProductOfferings/BuildFromCatalogProductOfferingsRequestAir/PricingModifiersAir. Object Description Required PricingModifiersAir Object for optional journey modifiers. Optional currencyCode String. Send the currency type to return if you want to override the default currency of your PCC Pseudo city code. A travel provider's identification code for the APIs, provisioned from Travelport. Used to determine access and other settings in the APIs for your company. . For a list of currency codes, see the Universal API&#160;Reference Data file linked from Downloads . Optional SellCity GDS only, not supported for NDC. String. The IATA location code for the city. Overrides the sell city of the requester to specify an alternate sale location and return pricing based on that location. The response returns pricing in the local currency for the specified sell city instead of your PCC's default currency. Optional TicketCity GDS only, not supported for NDC. String. The IATA location code for the city. Overrides the ticketing city of the requester to specify an alternate ticket location and return pricing based on that location. The response returns pricing in the local currency for the specified ticket city instead of your PCC's default currency. Optional TicketingPCC GDS only, not supported for NDC. String, 2-10 characters supported. Overrides the ticketing PCC&#160;associated with your account to specify an alternate PCC and return pricing based on that PCC. Optional PricingPCC GDS only, not supported for NDC. String, 2-10 characters supported. Use to send a faring PCC for which a selective access or code group agreement exists between that PCC and the PCC associated with your account. The following combinations of PricingPCC and FareSelection/fareType=PrivateFaresOnly (see below) return results as follows: PricingPCC sent and PrivateFaresOnly not requested: If a selective access or group agreement exists, both public and any available private fares are returned for the requesting and providing PCC. If no selective access or group agreement exists, only public fares are returned. PricingPCC sent and PrivateFaresOnly is requested: If a selective access or group agreement exists that allows private fare access, only available private fares are returned for the requesting and providing PCC. If no agreement exists, or if an agreement exists but does not allow private fares access, an error is returned. Optional ManualFareAdjustment GDS only, not supported for NDC. Not supported for Standalone Price. Send to manually adjust the base fare amount on all fares for a specific PTC. You can increase or decrease the base fare per these @type values by either an amount or a percentage: Send with @type value ManualFareAdjustmentDiscount to decrease the base fare. Send with @type value ManualFareAdjustmentIncrease to increase the fare. If the PCC currency and the country of origin currency are different, then the amount or percentage is applied to the filed amount base fare that is converted into the PCC currency. Show Example excerpt The following PricingModifiersAir excerpt sends one instance of ManualFareAdjustment that discounts the ADT fare by 20%, and another instance that increases the CHD fare by the amount of 50. ... "PricingModifiersAir": { "@type": "PricingModifiersAir", "SellCity": "NYC", "TicketCity": "SFO", "ManualFareAdjustment": [ { "@type": "ManualFareAdjustmentDiscount", "passengerTypeCodes": [ "ADT" ], "AmountPercent": { "@type": "AmountPercentPercent", "Percent": 20 } }, { "@type": "ManualFareAdjustmentIncrease", "passengerTypeCodes": [ "CHD" ], "AmountPercent": { "@type": "AmountPercentAmount", "Amount": { "value": 50 } } } ] }, ... Optional passengerTypeCodes Send the PTC/s to be increased or decreased. This increases or decreases the fare for all passengers with that PTC/s. Required if ManualFareAdjustment is sent AmountPercentPercent Send to adjust the base fare for the specified PTC/s by the percentage sent in Percent as follows: Percent :&#160;Send percentage of the base fare to be decreased or increased, up to two decimal places. For example, the value 20.5 would increase the base fare by 20.5% when sent in @type ManualFareAdjustmentIncrease, or decrease the base fare by 20.5% when sent in @type ManualFareAdjustmentDiscount . Either AmountPercentPercent or AmountPercentAmount is required if ManualFareAdjustment is sent AmountPercentAmount Send to adjust the base fare for the specified PTC/s by the amount sent in Amount as follows: Amount : Send amount value to either increase or decrease the base fare, up to two decimal places. For example, the value 14.75 for a base fare in&#160;the currency USD would increase the base fare by $14.75 when sent in @type ManualFareAdjustmentIncrease, or decrease the base fare by $14.75 when sent in @type ManualFareAdjustmentDiscount. Either AmountPercentPercent or AmountPercentAmount is required if ManualFareAdjustment is sent FareSelection Requests the return of fare types including private fares (negotiated), public fares (published), or net fares (consolidator fares, or any negotiated wholesale price that is further marked up for sale to customers). Optional fareType String. Supported values: PublicFaresOnly PrivateFaresOnly PublicAndPrivateFares (default) NetFaresOnly (Net fares are returned for GDS if available even if not requested. NDC does not support net fares.) AllFares:&#160;Returns public and private fare offers and net fare offers. The response identifies the type of fare returned for each Product in PassengerFlight/FlightProduct @fareType. Possible values in the response are AirlinePrivateFare, AgencyPrivateFare, NetFare, or PublicFare. Includes FareSelectionDetail. Optional validatingCarrier IATA code for a carrier to override any default validating carrier. Optional FareSelectionDetail Request fares with specific restrictions. The response does not return any indicators about these conditions. GSD only; not supported for NDC. No NDC&#160;content is returned if any of the following are sent with true. Optional prohibitAdvancePurchaseFaresInd Boolean. true prevents the return of fares that require advance purchase. Default is false . Optional prohibitMaxStayFaresInd Boolean. true prevents the return of fares that require a maximum stay. Default is false . Optional prohibitMinStayFaresInd Boolean. true prevents the return of fares that require a minimum stay. Default is false . Optional refundableOnlyInd Boolean. true prevents the return of fares that are not fully refundable. Default is false . Optional OrganizationInformation &#160; Use to send account codes for negotiated fares. Includes OrganizationIdentifier. Optional OrganizationIdentifier &#160; Array of account codes to return negotiated fares. The response returns an instance of TermsAndConditions/OrganizationInformation/OrganizationIdentifier for each account code sent. When FareSelection/fareType=PrivateFaresOnly and an account code is sent in OrganizationIdentifier, AirPrice ignores the account code. Instead, AirPrice returns any private fares available for that market and a booking code for your PCC. This prevents the return of an error message when no specific fare has been filed for that account code. Show Example excerpt to send multiple account codes "OrganizationIdentifier" : [{ "value" : "XYZ123", "supplier" : "UA", "type" : "Account" }, { "value" : "ABC123", "supplier" : "LH", "type" : "Account" }] Optional organizationCodeType String. Always send with a value of Account . Required with OrganizationIdentifier value String. The account code to apply. Required with OrganizationIdentifier supplier String. The IATA&#160;code for the airline on which the account code is applicable. Required with OrganizationIdentifier accountCodeFaresOnlyInd GDS&#160;only; not supported for NDC. Not supported in Standalone Price. Boolean. Sets whether to limit fares returned to only fares filed for an account code. true: Limits the fares returned to only fares filed for that account code; must send with one or more account codes in OrganizationIdentifier/value. If sending multiple account codes, send each instance with accountCodeFaresOnlyInd set to true. false: Does not limit fares returned to any account code sent. Default. If accountCodeFaresOnlyInd=true and an account code is sent, the response includes any fares filed for that account code plus fares that are not specific to the account code. If accountCodeFaresOnlyInd=true is sent and no account code is sent, accountCodeFaresOnlyInd is ignored; the response returns all fares and a warning message that the request must include an account code. Note the following when also requesting private fares only: FareSelection/fareType=PrivateFaresOnly and account code: Private fares are returned. FareSelection/fareType=PrivateFaresOnly, accountCodeFaresOnlyInd=true, and account code: Any private fares specific to that account code are returned if available. If no private fares exist for that account code, an error message is returned. Note the following when also requesting net fares: FareSelection/fareType=NetFaresOnly and account code: Net fares are returned. FareSelection/fareType=NetFaresOnly, accountCodeFaresOnlyInd=true, and account code: Any net fares specific to that account code are returned if available. If no net fares exist for that account code, an error message is returned. Optional TaxExemption GDS only, not supported for NDC. Use to exempt some or all taxes. Must include either allTaxesExemptInd or both countries and taxCodes per below. If sent, the response returns any exempt taxes with exemptInd=true and value=0. Optional countries Array. One or more codes for the countries in which the paired taxCodes sent are tax exempt. Must also send taxCodes object. Up to nine values total supported for countries, or for taxCodes, or for countries and taxCodes combined. Optional taxCodes Array. One or tax codes to mark as exempt in the paired country. Must also send countries object. Optional allTaxesExemptInd Boolean. Use to set all taxes as exempt. true: Marks all taxes as exempt. false: Do not send with false; instead, use countries and taxCodes per above to specify which taxes to exempt. Optional Response The AirPrice response structure is the same for both reference and full payload requests. See the AirPrice Reference Payload API&#160;Reference for the response table. See the Air Pricing Guide for response layout diagrams and description. Example Request For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . The following round-trip full payload request includes the optional CustomerLoyalty object (NDC&#160;only) for sending frequent traveler details. Show Example NDC round-trip request with CustomerLoyalty { "OfferQueryBuildFromProducts": { "lowFareFinderInd": "", "returnBrandedFaresInd": "true", "reCheckInventoryInd": "", "validateInventoryInd": "", "BuildFromProductsRequest": { "@type": "BuildFromProductsRequestAir", "PassengerCriteria": [ { "passengerTypeCode": "ADT", "number": 1, "age": 24, "CustomerLoyalty": [ { "supplier": "1925825570", "cardHolderName": "MEMBER LOYTEST" } ] } ], "ProductCriteriaAir": [ { "SpecificFlightCriteria": [ { "@type": "SpecificFlightCriteria", "carrier": "UA", "flightNumber": "532", "departureDate": "2024-03-12", "departureTime": "06:00:00", "arrivalDate": "2024-03-12", "arrivalTime": "09:30:00", "from": "DEN", "to": "ORD", "classOfService": "P", "segmentSequence": "0", "ContentSource": "NDC" } ] }, { "SpecificFlightCriteria": [ { "@type": "SpecificFlightCriteria", "carrier": "UA", "flightNumber": "532", "departureDate": "2024-03-26", "departureTime": "06:00:00", "arrivalDate": "2024-03-26", "arrivalTime": "09:30:00", "from": "DEN", "to": "ORD", "classOfService": "P", "segmentSequence": "0", "ContentSource": "NDC" } ] } ] }, "FareRuleType": "" } } The following one-way request includes the SellCity pricing modifier, supported only for GDS. Show Example one-way request with SellCity pricing modifier { "OfferQueryBuildFromProducts": { "BuildFromProductsRequest": { "@type": "BuildFromProductsRequestAir", "PricingModifiersAir": { "@type": "PricingModifiersAir", "SellCity": "SYD" }, "PassengerCriteria": [ { "@type": "PassengerCriteria", "number": 1, "passengerTypeCode": "ADT" } ], "ProductCriteriaAir": [ { "SpecificFlightCriteria": [ { "flightNumber": "1974", "carrier": "UA", "departureDate": "2023-01-13", "departureTime": "07:46:00", "arrivalDate": "2023-01-13", "arrivalTime": "12:41:00", "from": "DEN", "to": "ATL", "classOfService": "K", "cabin": "Economy", "segmentSequence": 1, "brandTier": "4", "ContentSource": "GDS" } ] } ] } } } The following request sends MaxNumberOfUpsellsToReturn with a value of 2 to request two upsells in addition to pricing specific to the requested class of booking. Supported only for NDC in the AirPrice full payload. Show Example request for upsells along with pricing (NDC only) { "OfferQueryBuildFromProducts": { "MaxNumberOfUpsellsToReturn": 2, "BuildFromProductsRequest": { "@type": "BuildFromProductsRequestAir", "PassengerCriteria": [ { "number": 1, "passengerTypeCode": "ADT" } ], "ProductCriteriaAir": [ { "SpecificFlightCriteria": [ { "flightNumber": "403", "carrier": "IB", "departureDate": "2025-06-06", "departureTime": "07:10:00", "arrivalDate": "2025-06-06", "arrivalTime": "08:25:00", "from": "MAD", "to": "BCN", "classOfService": "O", "cabin": "Economy", "segmentSequence": 1, "ContentSource": "NDC" } ] } ] } } } Example Response The AirPrice response is the same for both reference and full payload requests. See the AirPrice Reference Payload API&#160;Reference for an example response without upsells. The exception is that upsells can be returned for NDC if requested, per below. NDC&#160;AirPrice response with upsells example Generally, both the full and reference payload AirPrice responses return pricing specific only to the class of booking in the request; i.e., pricing of one single offer. For NDC only, and only in the full payload request, you can request upsells by sending MaxNumberOfUpsellsToReturn set to the number of upsells to return. The example response below returns pricing on the requested offer plus two upsells for a total of three priced offers. Show Example response with upsells (NDC&#160;only) { "OfferListResponse": { "@type": "OfferListResponse", "OfferID": [ { "@type": "Offer", "id": "o0", "Identifier": { "authority": "IB", "value": "SUI1YmUsYzFlZmE1NTQ0ZjhmYTk3MTFkZjYwMjc1ZmRkZk9QfFFtOXZhMmx1WjBCSFZ5MHhOelEyTWpNeE5UUTBOek16TFV0M2JFVnF8MjAyNS0wNS0wM1QwMDo0OTowNXxBRFQ6SUI1YmUsYzFlZmE1NTQ0ZjhmYTk3MTFkZjYwMjc1ZmRkZk9QXzAxfElC" }, "ContentSource": "NDC", "Product": [ { "@type": "ProductAir", "totalDuration": "PT1H15M", "id": "p0", "FlightSegment": [ { "@type": "FlightSegment", "id": "s1", "sequence": 1, "universalProductAttributeRefs": [], "Flight": { "@type": "FlightDetail", "duration": "PT1H15M", "carrier": "IB", "number": "403", "operatingCarrier": "IB", "operatingCarrierName": "Iberia", "equipment": "320", "id": "f1", "Identifier": { "value": "IB040320250606" }, "Departure": { "@type": "DepartureDetail", "terminal": "4", "location": "MAD", "date": "2025-06-06", "time": "07:10:00" }, "Arrival": { "@type": "ArrivalDetail", "terminal": "1", "location": "BCN", "date": "2025-06-06", "time": "08:25:00" } } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 1 ], "classOfService": "O", "cabin": "Economy", "fareBasisCode": "OZNOB4", "fareType": "PublicFare", "Brand": { "@type": "Brand", "name": "BASIC", "Identifier": { "authority": "Travelport", "value": "1739115" } } } ] } ] } ], "Price": { "@type": "PriceDetail", "id": "price0", "CurrencyCode": { "value": "EUR" }, "Base": 22, "TotalTaxes": 20.37, "TotalFees": 0, "TotalPrice": 42.37, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "value": "EUR" }, "Base": 22, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 20.37, "Tax": [ { "taxCode": "JD", "description": "Spain Departure Charge", "value": 15.59 }, { "taxCode": "OG", "description": "Spain Aviation Safety And Security Fee", "value": 0.69 }, { "taxCode": "QV", "description": "Spain Security Tax", "value": 4.09 } ] }, "Fees": { "@type": "FeesDetail", "TotalFees": 0 }, "Total": 42.37 } } ] }, "TermsAndConditionsFull": [ { "@type": "TermsAndConditionsFullAir", "ExpiryDate": "2025-05-03T00:49:05Z", "TextBlock": [ { "@type": "TextBlock", "TextFormatted": [ { "value": "TICKET IS NON-REFUNDABLE IN CASE OF CANCEL/REFUND." } ] } ], "BaggageAllowance": [ { "@type": "BaggageAllowanceDetail", "passengerTypeCodes": [ "ADT" ], "baggageType": "FirstCheckedBag", "ProductRef": [ "p0" ], "BaggageItem": [ { "@type": "BaggageItem", "quantity": 0, "includedInOfferPrice": "No", "soldByPieceInd": true, "Text": "Up to 50 lb/23 kg,Up to 62 li/158 lcm" } ], "SegmentSequenceList": [ 1 ], "Text": [ "0PC" ] }, { "@type": "BaggageAllowanceDetail", "passengerTypeCodes": [ "ADT" ], "baggageType": "CarryOn", "ProductRef": [ "p0" ], "BaggageItem": [ { "@type": "BaggageItem", "quantity": 2, "includedInOfferPrice": "Yes", "soldByPieceInd": true } ], "SegmentSequenceList": [ 1 ], "Text": [ "2PC" ] } ], "ValidatingAirline": [ { "@type": "ValidatingAirline", "ValidatingAirline": "IB" } ], "PaymentTimeLimit": "2025-05-04T21:59:59Z", "Penalties": [ { "@type": "Penalties", "Cancel": [ { "@type": "CancelPermitted", "penaltyTypes": [ "AfterDeparture", "NoShow", "BeforeDeparture" ], "ProductRefs": [ "p0" ], "SegmentSequence": [ 1 ] } ], "PassengerTypeCodes": [ "ADT" ] }, { "@type": "Penalties", "Change": [ { "@type": "ChangePermitted", "penaltyTypes": [ "AfterDeparture", "BeforeDeparture" ], "higherPenatltyAppliesInd": true, "ProductRefs": [ "p0" ], "SegmentSequence": [ 1 ], "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "EUR", "minorUnit": 2, "value": 65 } } ] } ], "PassengerTypeCodes": [ "ADT" ] } ] } ] }, { "@type": "Offer", "id": "o1", "Identifier": { "authority": "IB", "value": "SUJlZjJjODhkZGQzYzk0ZGI5ODc5MmM5ZTdkMDQ1YTRmMU9QfFFtOXZhMmx1WjBCSFZ5MHhOelEyTWpNeE5UUTBOek16TFV0M2JFVnF8MjAyNS0wNS0wM1QwMDo0OTowNXxBRFQ6SUJlZjJjODhkZGQzYzk0ZGI5ODc5MmM5ZTdkMDQ1YTRmMU9QXzAxfElC" }, "ContentSource": "NDC", "Product": [ { "@type": "ProductAir", "totalDuration": "PT1H15M", "id": "p0", "FlightSegment": [ { "@type": "FlightSegment", "id": "s1", "sequence": 1, "universalProductAttributeRefs": [], "Flight": { "@type": "FlightDetail", "duration": "PT1H15M", "carrier": "IB", "number": "403", "operatingCarrier": "IB", "operatingCarrierName": "Iberia", "equipment": "320", "id": "f1", "Identifier": { "value": "IB040320250606" }, "Departure": { "@type": "DepartureDetail", "terminal": "4", "location": "MAD", "date": "2025-06-06", "time": "07:10:00" }, "Arrival": { "@type": "ArrivalDetail", "terminal": "1", "location": "BCN", "date": "2025-06-06", "time": "08:25:00" } } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 1 ], "classOfService": "O", "cabin": "Economy", "fareBasisCode": "OZNOM4", "fareType": "PublicFare", "Brand": { "@type": "Brand", "name": "OPTIMA", "Identifier": { "authority": "Travelport" } } } ] } ] } ], "Price": { "@type": "PriceDetail", "id": "price0", "CurrencyCode": { "value": "EUR" }, "Base": 43, "TotalTaxes": 20.37, "TotalFees": 0, "TotalPrice": 63.37, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "value": "EUR" }, "Base": 43, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 20.37, "Tax": [ { "taxCode": "JD", "description": "Spain Departure Charge", "value": 15.59 }, { "taxCode": "OG", "description": "Spain Aviation Safety And Security Fee", "value": 0.69 }, { "taxCode": "QV", "description": "Spain Security Tax", "value": 4.09 } ] }, "Fees": { "@type": "FeesDetail", "TotalFees": 0 }, "Total": 63.37 } } ] }, "TermsAndConditionsFull": [ { "@type": "TermsAndConditionsFullAir", "ExpiryDate": "2025-05-03T00:49:05Z", "BaggageAllowance": [ { "@type": "BaggageAllowanceDetail", "passengerTypeCodes": [ "ADT" ], "baggageType": "FirstCheckedBag", "ProductRef": [ "p0" ], "BaggageItem": [ { "@type": "BaggageItem", "quantity": 1, "includedInOfferPrice": "Yes", "soldByPieceInd": true, "Text": "Up to 50 lb/23 kg,Up to 62 li/158 lcm" } ], "SegmentSequenceList": [ 1 ], "Text": [ "1PC" ] }, { "@type": "BaggageAllowanceDetail", "passengerTypeCodes": [ "ADT" ], "baggageType": "CarryOn", "ProductRef": [ "p0" ], "BaggageItem": [ { "@type": "BaggageItem", "quantity": 2, "includedInOfferPrice": "Yes", "soldByPieceInd": true } ], "SegmentSequenceList": [ 1 ], "Text": [ "2PC" ] } ], "ValidatingAirline": [ { "@type": "ValidatingAirline", "ValidatingAirline": "IB" } ], "PaymentTimeLimit": "2025-05-04T21:59:59Z", "Penalties": [ { "@type": "Penalties", "Cancel": [ { "@type": "CancelPermitted", "penaltyTypes": [ "AfterDeparture", "NoShow", "BeforeDeparture" ], "ProductRefs": [ "p0" ], "SegmentSequence": [ 1 ] } ], "PassengerTypeCodes": [ "ADT" ] }, { "@type": "Penalties", "Change": [ { "@type": "ChangePermitted", "penaltyTypes": [ "BeforeDeparture", "AfterDeparture" ], "higherPenatltyAppliesInd": true, "ProductRefs": [ "p0" ], "SegmentSequence": [ 1 ], "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "EUR", "minorUnit": 2, "value": 45 } } ] } ], "PassengerTypeCodes": [ "ADT" ] } ] } ] }, { "@type": "Offer", "id": "o2", "Identifier": { "authority": "IB", "value": "SUJlYWJjMzIyN2ViYWE0ZmEyOWRhMGE4ZTEyNTFmZTRiZE9QfFFtOXZhMmx1WjBCSFZ5MHhOelEyTWpNeE5UUTBOek16TFV0M2JFVnF8MjAyNS0wNS0wM1QwMDo0OTowNXxBRFQ6SUJlYWJjMzIyN2ViYWE0ZmEyOWRhMGE4ZTEyNTFmZTRiZE9QXzAxfElC" }, "ContentSource": "NDC", "Product": [ { "@type": "ProductAir", "totalDuration": "PT1H15M", "id": "p0", "FlightSegment": [ { "@type": "FlightSegment", "id": "s1", "sequence": 1, "universalProductAttributeRefs": [], "Flight": { "@type": "FlightDetail", "duration": "PT1H15M", "carrier": "IB", "number": "403", "operatingCarrier": "IB", "operatingCarrierName": "Iberia", "equipment": "320", "id": "f1", "Identifier": { "value": "IB040320250606" }, "Departure": { "@type": "DepartureDetail", "terminal": "4", "location": "MAD", "date": "2025-06-06", "time": "07:10:00" }, "Arrival": { "@type": "ArrivalDetail", "terminal": "1", "location": "BCN", "date": "2025-06-06", "time": "08:25:00" } } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 1 ], "classOfService": "L", "cabin": "Economy", "fareBasisCode": "LDNOFB", "fareType": "PublicFare", "Brand": { "@type": "Brand", "name": "PUENTE AEREO COMFORT", "Identifier": { "authority": "Travelport" } } } ] } ] } ], "Price": { "@type": "PriceDetail", "id": "price0", "CurrencyCode": { "value": "EUR" }, "Base": 138, "TotalTaxes": 20.37, "TotalFees": 0, "TotalPrice": 158.37, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "value": "EUR" }, "Base": 138, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 20.37, "Tax": [ { "taxCode": "JD", "description": "Spain Departure Charge", "value": 15.59 }, { "taxCode": "OG", "description": "Spain Aviation Safety And Security Fee", "value": 0.69 }, { "taxCode": "QV", "description": "Spain Security Tax", "value": 4.09 } ] }, "Fees": { "@type": "FeesDetail", "TotalFees": 0 }, "Total": 158.37 } } ] }, "TermsAndConditionsFull": [ { "@type": "TermsAndConditionsFullAir", "ExpiryDate": "2025-05-03T00:49:05Z", "BaggageAllowance": [ { "@type": "BaggageAllowanceDetail", "passengerTypeCodes": [ "ADT" ], "baggageType": "FirstCheckedBag", "ProductRef": [ "p0" ], "BaggageItem": [ { "@type": "BaggageItem", "quantity": 0, "includedInOfferPrice": "No", "soldByPieceInd": true, "Text": "Up to 50 lb/23 kg,Up to 62 li/158 lcm" } ], "SegmentSequenceList": [ 1 ], "Text": [ "0PC" ] }, { "@type": "BaggageAllowanceDetail", "passengerTypeCodes": [ "ADT" ], "baggageType": "CarryOn", "ProductRef": [ "p0" ], "BaggageItem": [ { "@type": "BaggageItem", "quantity": 2, "includedInOfferPrice": "Yes", "soldByPieceInd": true } ], "SegmentSequenceList": [ 1 ], "Text": [ "2PC" ] } ], "ValidatingAirline": [ { "@type": "ValidatingAirline", "ValidatingAirline": "IB" } ], "PaymentTimeLimit": "2025-05-04T21:59:59Z", "Penalties": [ { "@type": "Penalties", "Cancel": [ { "@type": "CancelPermitted", "penaltyTypes": [ "NoShow" ], "higherPenatltyAppliesInd": true, "ProductRefs": [ "p0" ], "SegmentSequence": [ 1 ] }, { "@type": "CancelPermitted", "penaltyTypes": [ "AfterDeparture", "BeforeDeparture" ], "higherPenatltyAppliesInd": true, "ProductRefs": [ "p0" ], "SegmentSequence": [ 1 ], "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "EUR", "minorUnit": 2, "value": 45 } } ] } ], "PassengerTypeCodes": [ "ADT" ] }, { "@type": "Penalties", "Change": [ { "@type": "ChangePermitted", "penaltyTypes": [ "BeforeDeparture", "AfterDeparture" ], "ProductRefs": [ "p0" ], "SegmentSequence": [ 1 ], "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "USD", "minorUnit": 2, "value": 0 } } ] } ], "PassengerTypeCodes": [ "ADT" ] } ] } ] } ], "Identifier": { "value": "holajose_PC" } } } &#160;

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
 "OfferListResponse": {
  "@type": "OfferListResponse",
  "transactionId": "04ec9290-06da-4eb6-bb3c-b09563cabd96",
  "Result": {
   "@type": "Result",
   "Error": [
    {
     "@type": "ErrorDetail",
     "StatusCode": 200,
     "Message": "BOOKING CLASS/PREFERENCE NOT AVAIL CHECK AVAILABILITY"
    }
   ]
  },
  "Identifier": {
   "value": "04ec9290-06da-4eb6-bb3c-b09563cabd96_PC"
  }
 }
}
```

### Block 2

```
{
 "OfferQueryBuildFromProducts": {
  "lowFareFinderInd": "false",
  "returnBrandedFaresInd": "false",
  "reCheckInventoryInd": true,
  "validateInventoryInd": "true",
  "BuildFromProductsRequest": {
   "@type": "BuildFromProductsRequestAir",
   "PassengerCriteria": [
    {
     "passengerTypeCode": "ADT",
     "number": 1,
     "age": 24
    }
   ],
   "ProductCriteriaAir": [
    {
     "SpecificFlightCriteria": [
      {
       "@type": "SpecificFlightCriteria",
       "carrier": "FJ",
       "flightNumber": "910",
       "departureDate": "2023-10-16",
       "departureTime": "13:45:00",
       "arrivalDate": "2023-10-16",
       "arrivalTime": "19:25:00",
       "from": "SYD",
       "to": "NAN",
       "cabin": "Economy",
       "classOfService": "V",
       "segmentSequence": "0",
       "boundFlightsInd": true
      },
      {
       "@type": "SpecificFlightCriteria",
       "carrier": "FJ",
       "flightNumber": "810",
       "departureDate": "2023-10-16",
       "departureTime": "21:40:00",
       "arrivalDate": "2023-10-16",
       "arrivalTime": "12:55:00",
       "from": "NAN",
       "to": "LAX",
       "cabin": "Economy",
       "classOfService": "V",
       "segmentSequence": "1"
      }
     ]
    },
    {
     "SpecificFlightCriteria": [
      {
       "@type": "SpecificFlightCriteria",
       "carrier": "FJ",
       "flightNumber": "811",
       "departureDate": "2023-10-21",
       "departureTime": "23:55:00",
       "arrivalDate": "2023-10-23",
       "arrivalTime": "05:45:00",
       "from": "LAX",
       "to": "NAN",
       "cabin": "Economy",
       "classOfService": "T",
       "segmentSequence": "0",
       "boundFlightsInd": true
      },
      {
       "@type": "SpecificFlightCriteria",
       "carrier": "FJ",
       "flightNumber": "911",
       "departureDate": "2023-10-26",
       "departureTime": "09:00:00",
       "arrivalDate": "2023-10-26",
       "arrivalTime": "11:45:00",
       "from": "NAN",
       "to": "SYD",
       "cabin": "Economy",
       "classOfService": "T",
       "segmentSequence": "1"
      }
     ]
    }
   ]
  },
  "FareRuleType": "null"
 }
}
```

### Block 3

```
...
  "PricingModifiersAir": {
    "@type": "PricingModifiersAir",
    "SellCity": "NYC",
    "TicketCity": "SFO",
    "ManualFareAdjustment": [
     {
      "@type": "ManualFareAdjustmentDiscount",
      "passengerTypeCodes": [
       "ADT"
      ],
      "AmountPercent": {
       "@type": "AmountPercentPercent",
       "Percent": 20
      }
     },
     {
      "@type": "ManualFareAdjustmentIncrease",
      "passengerTypeCodes": [
       "CHD"
      ],
      "AmountPercent": {
       "@type": "AmountPercentAmount",
       "Amount": {
        "value": 50
       }
      }
     }
    ]
   },
...
```

### Block 4

```
"OrganizationIdentifier" : [{
      "value" : "XYZ123",
      "supplier" : "UA",
      "type" : "Account"
    },
    {
      "value" : "ABC123",
      "supplier" : "LH",
      "type" : "Account"
    }]
```

### Block 5

```
{
 "OfferQueryBuildFromProducts": {
  "lowFareFinderInd": "",
  "returnBrandedFaresInd": "true",
  "reCheckInventoryInd": "",
  "validateInventoryInd": "",
  "BuildFromProductsRequest": {
   "@type": "BuildFromProductsRequestAir",
   "PassengerCriteria": [
    {
     "passengerTypeCode": "ADT",
     "number": 1,
     "age": 24,
     "CustomerLoyalty": [
      {
       "supplier": "1925825570",
       "cardHolderName": "MEMBER LOYTEST"
      }
     ]
    }
   ],
   "ProductCriteriaAir": [
    {
     "SpecificFlightCriteria": [
      {
       "@type": "SpecificFlightCriteria",
       "carrier": "UA",
       "flightNumber": "532",
       "departureDate": "2024-03-12",
       "departureTime": "06:00:00",
       "arrivalDate": "2024-03-12",
       "arrivalTime": "09:30:00",
       "from": "DEN",
       "to": "ORD",
       "classOfService": "P",
       "segmentSequence": "0",
       "ContentSource": "NDC"
      }
     ]
    },
    {
     "SpecificFlightCriteria": [
      {
       "@type": "SpecificFlightCriteria",
       "carrier": "UA",
       "flightNumber": "532",
       "departureDate": "2024-03-26",
       "departureTime": "06:00:00",
       "arrivalDate": "2024-03-26",
       "arrivalTime": "09:30:00",
       "from": "DEN",
       "to": "ORD",
       "classOfService": "P",
       "segmentSequence": "0",
       "ContentSource": "NDC"
      }
     ]
    }
   ]
  },
  "FareRuleType": ""
 }
}
```

### Block 6

```
{
 "OfferQueryBuildFromProducts": {
  "BuildFromProductsRequest": {
   "@type": "BuildFromProductsRequestAir",
   "PricingModifiersAir": {
    "@type": "PricingModifiersAir",
    "SellCity": "SYD"
   },
   "PassengerCriteria": [
    {
     "@type": "PassengerCriteria",
     "number": 1,
     "passengerTypeCode": "ADT"
    }
   ],
   "ProductCriteriaAir": [
    {
     "SpecificFlightCriteria": [
      {
       "flightNumber": "1974",
       "carrier": "UA",
       "departureDate": "2023-01-13",
       "departureTime": "07:46:00",
       "arrivalDate": "2023-01-13",
       "arrivalTime": "12:41:00",
       "from": "DEN",
       "to": "ATL",
       "classOfService": "K",
       "cabin": "Economy",
       "segmentSequence": 1,
       "brandTier": "4",
       "ContentSource": "GDS"
      }
     ]
    }
   ]
  }
 }
}
```

### Block 7

```
{
 "OfferQueryBuildFromProducts": {
  "MaxNumberOfUpsellsToReturn": 2,
  "BuildFromProductsRequest": {
   "@type": "BuildFromProductsRequestAir",
   "PassengerCriteria": [
    {
     "number": 1,
     "passengerTypeCode": "ADT"
    }
   ],
   "ProductCriteriaAir": [
    {
     "SpecificFlightCriteria": [
      {
       "flightNumber": "403",
       "carrier": "IB",
       "departureDate": "2025-06-06",
       "departureTime": "07:10:00",
       "arrivalDate": "2025-06-06",
       "arrivalTime": "08:25:00",
       "from": "MAD",
       "to": "BCN",
       "classOfService": "O",
       "cabin": "Economy",
       "segmentSequence": 1,
       "ContentSource": "NDC"
      }
     ]
    }
   ]
  }
 }
}
```

### Block 8

```
{
 "OfferListResponse": {
  "@type": "OfferListResponse",
  "OfferID": [
   {
    "@type": "Offer",
    "id": "o0",
    "Identifier": {
     "authority": "IB",
     "value": "SUI1YmUsYzFlZmE1NTQ0ZjhmYTk3MTFkZjYwMjc1ZmRkZk9QfFFtOXZhMmx1WjBCSFZ5MHhOelEyTWpNeE5UUTBOek16TFV0M2JFVnF8MjAyNS0wNS0wM1QwMDo0OTowNXxBRFQ6SUI1YmUsYzFlZmE1NTQ0ZjhmYTk3MTFkZjYwMjc1ZmRkZk9QXzAxfElC"
    },
    "ContentSource": "NDC",
    "Product": [
     {
      "@type": "ProductAir",
      "totalDuration": "PT1H15M",
      "id": "p0",
      "FlightSegment": [
       {
        "@type": "FlightSegment",
        "id": "s1",
        "sequence": 1,
        "universalProductAttributeRefs": [],
        "Flight": {
         "@type": "FlightDetail",
         "duration": "PT1H15M",
         "carrier": "IB",
         "number": "403",
         "operatingCarrier": "IB",
         "operatingCarrierName": "Iberia",
         "equipment": "320",
         "id": "f1",
         "Identifier": {
          "value": "IB040320250606"
         },
         "Departure": {
          "@type": "DepartureDetail",
          "terminal": "4",
          "location": "MAD",
          "date": "2025-06-06",
          "time": "07:10:00"
         },
         "Arrival": {
          "@type": "ArrivalDetail",
          "terminal": "1",
          "location": "BCN",
          "date": "2025-06-06",
          "time": "08:25:00"
         }
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
           1
          ],
          "classOfService": "O",
          "cabin": "Economy",
          "fareBasisCode": "OZNOB4",
          "fareType": "PublicFare",
          "Brand": {
           "@type": "Brand",
           "name": "BASIC",
           "Identifier": {
            "authority": "Travelport",
            "value": "1739115"
           }
          }
         }
        ]
       }
      ]
     }
    ],
    "Price": {
     "@type": "PriceDetail",
     "id": "price0",
     "CurrencyCode": {
      "value": "EUR"
     },
     "Base": 22,
     "TotalTaxes": 20.37,
     "TotalFees": 0,
     "TotalPrice": 42.37,
     "PriceBreakdown": [
      {
       "@type": "PriceBreakdownAir",
       "quantity": 1,
       "requestedPassengerType": "ADT",
       "Amount": {
        "@type": "Amount",
        "CurrencyCode": {
         "value": "EUR"
        },
        "Base": 22,
        "Taxes": {
         "@type": "TaxesDetail",
         "TotalTaxes": 20.37,
         "Tax": [
          {
           "taxCode": "JD",
           "description": "Spain Departure Charge",
           "value": 15.59
          },
          {
           "taxCode": "OG",
           "description": "Spain Aviation Safety And Security Fee",
           "value": 0.69
          },
          {
           "taxCode": "QV",
           "description": "Spain Security Tax",
           "value": 4.09
          }
         ]
        },
        "Fees": {
         "@type": "FeesDetail",
         "TotalFees": 0
        },
        "Total": 42.37
       }
      }
     ]
    },
    "TermsAndConditionsFull": [
     {
      "@type": "TermsAndConditionsFullAir",
      "ExpiryDate": "2025-05-03T00:49:05Z",
      "TextBlock": [
       {
        "@type": "TextBlock",
        "TextFormatted": [
         {
          "value": "TICKET IS NON-REFUNDABLE IN CASE OF CANCEL/REFUND."
         }
        ]
       }
      ],
      "BaggageAllowance": [
       {
        "@type": "BaggageAllowanceDetail",
        "passengerTypeCodes": [
         "ADT"
        ],
        "baggageType": "FirstCheckedBag",
        "ProductRef": [
         "p0"
        ],
        "BaggageItem": [
         {
          "@type": "BaggageItem",
          "quantity": 0,
          "includedInOfferPrice": "No",
          "soldByPieceInd": true,
          "Text": "Up to 50 lb/23 kg,Up to 62 li/158 lcm"
         }
        ],
        "SegmentSequenceList": [
         1
        ],
        "Text": [
         "0PC"
        ]
       },
       {
        "@type": "BaggageAllowanceDetail",
        "passengerTypeCodes": [
         "ADT"
        ],
        "baggageType": "CarryOn",
        "ProductRef": [
         "p0"
        ],
        "BaggageItem": [
         {
          "@type": "BaggageItem",
          "quantity": 2,
          "includedInOfferPrice": "Yes",
          "soldByPieceInd": true
         }
        ],
        "SegmentSequenceList": [
         1
        ],
        "Text": [
         "2PC"
        ]
       }
      ],
      "ValidatingAirline": [
       {
        "@type": "ValidatingAirline",
        "ValidatingAirline": "IB"
       }
      ],
      "PaymentTimeLimit": "2025-05-04T21:59:59Z",
      "Penalties": [
       {
        "@type": "Penalties",
        "Cancel": [
         {
          "@type": "CancelPermitted",
          "penaltyTypes": [
           "AfterDeparture",
           "NoShow",
           "BeforeDeparture"
          ],
          "ProductRefs": [
           "p0"
          ],
          "SegmentSequence": [
           1
          ]
         }
        ],
        "PassengerTypeCodes": [
         "ADT"
        ]
       },
       {
        "@type": "Penalties",
        "Change": [
         {
          "@type": "ChangePermitted",
          "penaltyTypes": [
           "AfterDeparture",
           "BeforeDeparture"
          ],
          "higherPenatltyAppliesInd": true,
          "ProductRefs": [
           "p0"
          ],
          "SegmentSequence": [
           1
          ],
          "Penalty": [
           {
            "@type": "PenaltyAmount",
            "Amount": {
             "code": "EUR",
             "minorUnit": 2,
             "value": 65
            }
           }
          ]
         }
        ],
        "PassengerTypeCodes": [
         "ADT"
        ]
       }
      ]
     }
    ]
   },
   {
    "@type": "Offer",
    "id": "o1",
    "Identifier": {
     "authority": "IB",
     "value": "SUJlZjJjODhkZGQzYzk0ZGI5ODc5MmM5ZTdkMDQ1YTRmMU9QfFFtOXZhMmx1WjBCSFZ5MHhOelEyTWpNeE5UUTBOek16TFV0M2JFVnF8MjAyNS0wNS0wM1QwMDo0OTowNXxBRFQ6SUJlZjJjODhkZGQzYzk0ZGI5ODc5MmM5ZTdkMDQ1YTRmMU9QXzAxfElC"
    },
    "ContentSource": "NDC",
    "Product": [
     {
      "@type": "ProductAir",
      "totalDuration": "PT1H15M",
      "id": "p0",
      "FlightSegment": [
       {
        "@type": "FlightSegment",
        "id": "s1",
        "sequence": 1,
        "universalProductAttributeRefs": [],
        "Flight": {
         "@type": "FlightDetail",
         "duration": "PT1H15M",
         "carrier": "IB",
         "number": "403",
         "operatingCarrier": "IB",
         "operatingCarrierName": "Iberia",
         "equipment": "320",
         "id": "f1",
         "Identifier": {
          "value": "IB040320250606"
         },
         "Departure": {
          "@type": "DepartureDetail",
          "terminal": "4",
          "location": "MAD",
          "date": "2025-06-06",
          "time": "07:10:00"
         },
         "Arrival": {
          "@type": "ArrivalDetail",
          "terminal": "1",
          "location": "BCN",
          "date": "2025-06-06",
          "time": "08:25:00"
         }
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
           1
          ],
          "classOfService": "O",
          "cabin": "Economy",
          "fareBasisCode": "OZNOM4",
          "fareType": "
…
```

