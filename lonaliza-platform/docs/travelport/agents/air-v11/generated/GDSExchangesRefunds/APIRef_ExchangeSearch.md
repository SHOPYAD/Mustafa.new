# Exchange Search API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/GDSExchangesRefunds/APIRef_ExchangeSearch.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Exchange Search API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Exchange Search API&#160;Reference Request Response Example request Example response POST exchangesearch/catalogofferingsairchange Base path: The base path for this API varies from that for other JSON &#160; Air APIs and does not include air at the end. Pre-production https://api.pp.travelport.net/11/ Production https://api.travelport.net/11/ Related Content: Exchange, Refund, and Void Guide GDS&#160;only. For NDC&#160;exchange functionality, see the Exchange, Refund, and Void Guide . Exchange Search is part of the GDS exchange workflow and can be sent after establishing a workbench . It can be preceded by the optional Eligibility step. Exchange Search sends criteria to search for an alternate itinerary to exchange for a ticketed GDS itinerary. The response details any differences in base fare, taxes, fees, and total price between the currently ticketed itinerary and the possible new itinerary. To proceed with the exchange, follow Exchange Search with the Add/Modify Offer request that sends identifiers returned in the Exchange Search response. When exchanging multi-offer tickets, you must exchange each offer in its own workbench session. See Multi-offer Exchanges . Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body See the Exchange, Refund, and Void Guide for important information about requirements for exchanges. Show Exchange Search Basic Request Body Table See the Optional Modifiers table next for optional search modifiers that can be added to this basic request. Object Description Required/Optional CatalogOfferingsQueryAirChange Top level object for request. Includes CatalogOfferingsAirChangeRequest. Required CatalogOfferingsAirChangeRequest Top level object. Includes SearchCriteriaFlight, PassengerCriteria, and BuildFromReservationWorkbench. Includes PricingModifiersAirChange and SearchModifiersAir if any optional search modifiers detailed in the table below are sent. Send with "@type": "CatalogOfferingsAirChangeRequestReservation", Required returnBrandedFaresInd Exchange Search returns branded fares by default . Set to false to disable the return of branded fares. Send with true or do not send to return branded fares. Optional detailViewInd Returns a detailed response. Set to true to return a tax breakdown. Set to false to disable the return of a tax breakdown. In a detailed response, both Price and ModifyPrice include a PriceBreakdown object to list taxes and fees separately if applicable. Optional SearchCriteriaFlight Array. Defines one origin and destination (O&amp;D) pair. Send one SearchCriteriaFlight for each O&amp;D pair, or leg. Includes From and To objects. Required departureDate String. Date of departure in YYYY-MM-DD format (e.g., departureDate="2022-12-06"). Required departureTime String. Time of departure in HH:MM:SS format (e.g., departureTime="18:00:00"). departureTime is required on a same-day flight, i.e., when searching for multiple legs on the same day. Optional From Object. Required cityOrAirport String. Optional enumeration specifying whether to restrict the search based on the city/airport code sent in value. Supported values: City Only Airport Only City or Airport Optional value String. The IATA location code for the departure airport/city for this leg. Required To Object Required cityOrAirport String. Optional enumeration specifying whether to restrict the search based on the city/airport code sent in value. Supported values: City Only Airport Only City or Airport Optional value String. The IATA location code for the arrival city/airport for this leg. Required DepartureTimeRange Optional object to specify a start time and end time for the flight search. Only results within the specified window are returned. If both DepartureTimeRange and SearchCriteriaFlightChange @departureTime above are sent, Exchange Search uses the DepartureTimeRange for the search, not the departureTime. Key value pairs: value : Currently not used. start :&#160;Start time for the specified departure window. end : End time for the specified departure window. Optional PassengerCriteria Array. Defines each passenger to search for. Send one instance of PassengerCriteria for each passenger. Send with @type PassengerCriteriaAirChange . Includes TravelerIdentiferRef object. Note that although the JSON &#160;Search API sends an instance of PassengerCriteria for each PTC , Exchange Search sends an instance of PassengerCriteria for each passenger . Required passengerTypeCode String. The passenger type code (PTC) for this specific passenger. Common PTCs are: ADT: adult CHD: child of unknown age (see Notes on PTC and age below) CNN:&#160;child when age is known INF:&#160;infant without a seat INS:&#160;infant with a seat UNN:&#160;unaccompanied child Required number Number. The number of passengers with this PTC. Should always be 1 , as Passenger Criteria here is for an individual passenger. Required age Number. The age of the passenger. Notes on PTC and age Travelport recommends sending age only with PTCs that require age for pricing. For child passengers, Travelport recommends sending the age of the child in the age attribute plus the PTC CNN. Travelport recommends against sending CNN without age, or the CHD PTC. Many fares cannot be quoted for CHD. The age for CNN&#160;is generally between 2 and 11 inclusive, with ADT fares returned for ages 12 and up; however, this can vary by airline and country. The age for INF&#160;must be either 0 or 1. During booking, date of birth is required for all child and infant PTCs ( Add Traveler payload in Traveler/birthDate). Optional specifiedPassengerTypeCodeOnlyInd &#160; Boolean. Send with true to return only offers for the specified PTC. Exchange Search generally returns the lowest fares available for any PTC. Sending specifiedPassengerTypeCodeOnlyInd set to true limits the fares returned to the specified PTC, which may return a higher priced fare that has better rules or commission. Note that if no fares are available for the specified PTC then no fares are returned and the error message "UNABLE TO PRICE AS SPECIFIED" is returned. Optional Default is false TravelerIdentiferRef Top level object for traveler identifier. Required id The traveler identifier from the reservation. Required BuildFromReservationWorkbench Includes ReservationIdentifier and OfferIdentifier; may include ProductIdentifier object. Required ReservationIdentifier Includes Identifier object. Required Identifier Workbench identifier information. Key value pairs: authority : Always send the value Travelport . value : The workbench ID returned when the workbench is created. Required OfferIdentifier The ID of the offer to change. *Exchange Search supports sending requests to search with an empty reservation, which can result when air segments and stored fares are canceled but the reservation&#160;is kept open to retain traveler and ticket information. Do not send OfferIdentifier or ProductIdentifier when searching with an empty reservation. *Required id Send the offer ID of the offer to change (returned as part of the Reservation Retrieve when the workbench is created). Required ProductIdentifier Array. Send an instance for each product/leg you want to exchange. (In the JSON APIs, a product is one leg of an itinerary; a leg is all flight or flights between one origin and destination pair.) To exchange a single product, send only the product identifier for that product. To exchange all products, send all product identifiers. Do not send ProductIdentifier for any leg you do not want to change. For example, if you send only the first product identifier for a round-trip itinerary, all offers include new options for the first leg and return the same flight/s that are already on the existing itinerary for the second leg. For an empty reservation, see the note in OfferIdentifier. Optional id The product ID of the product to change. Optional Show Exchange Search Request Optional Modifiers Table Object Description Required/Optional SearchModifiersAir Optional modifiers related to the journey, such as connections. May include CabinPreference, PricingModifiersAirChange, OrganizationInformation, and/or CalculatedFareAdjustment objects. Optional CabinPreference Array. Requests a fare based on the cabin class. Only one cabin preferenceType (Permitted, Preferred, or PreferredWithUpgrade) is allowed per request, but there is no limit to the number of cabins that can be sent. Optional cabins String. A space-delimited list of cabins. Supported values are (no default): Economy PremiumEconomy Business First PremiumFirst Required if CabinPreference sent preferenceType Supported values: Permitted: Searches for ONLY the specified cabin class or classes. If that class is not available, the response does not return any offers. Preferred: Searches for the specified cabin class or classes, but will return lower classes if the specified class is not available. PreferredWithUpgrade: Searches for the specified cabin class or classes, and will return higher classes if the specified class is not available. Sending a mix of preferenceType values is not supported. For example, you cannot send an instance of CabinPreference with a preferenceType of Permitted and another instance with preferenceType of Prohibited. In this case the results default to the Preferred preference. Required if CabinPreference sent legSequence Send legSequence to specify the sequence of the leg that the cabin preference applies to. You can apply the preference to only some legs of the itinerary, or different preferences to different legs. The following example excerpt shows one instance of CabinPreference applied to legs 1 and 4, and another instance that applies to legs 2 and 3. To apply a preference to the entire itinerary, send legSequence for each leg of the itinerary. Show Example CabinPreference at leg level - single cabin preference on two legs ...{ "SearchModifiersAir": { "@type": "SearchModifiersAir", "CabinPreference": [ { "@type": "CabinPreference", "preferenceType": "PreferredWithUpgrade", "cabins": [ "PremiumFirst", "First", "Business" ], "legSequence": [ 1, 3 ] } ] } }... Show Example CabinPreference at leg level - different cabin preference for different legs ...{ "SearchModifiersAir" : { "@type": "SearchModifiersAir", "CabinPreference" : [ { "@type" : "CabinPreference", "preferenceType" : "Permitted", "cabins" : [ "First", "Business" ], "legSequence" : [ 1, 4 ] }, { "@type" : "CabinPreference", "preferenceType" : "Permitted", "cabins" : [ "PremiumEconomy", "Economy",], "legSequence" : [2, 3 ] } ] }... Required if CabinPreference sent FlightType Optional search preferences about connections and stops. Optional connectionType The connection type to limit the search. The specified type and all higher types can be returned. Supported values (no default): NonStopDirect: Direct flight from the origin to the destination without a stop. StopDirect: Direct flight from origin to destination with a stop that does not have a change in flight number. SingleConnection: Flight options requiring one change of planes. DoubleConnection: Flight options requiring two changes of planes. Required if FlightType sent &#160; PricingModifiersAirChange Optional modifiers related to pricing, such as brands and account codes. May include OrganizationInformation (account codes), FareSelection (fare types), CalculatedFareAdjustment (increase/decrease fare modifiers) or BrandPreference (brand tiers). Optional currencyCode String. Send the currency type to return if you want to override the default currency specified with your PCC. For a list of currency codes, see the Universal API&#160;Reference Data file linked from Downloads . Optional keepToBrandInd &#160; Boolean. true: Returns only flight options available in the same brand as the original ticket. false: Default. Returns the lowest available brand regardless of the original brand on the ticket. The functionality works only for scenarios where the date and/or time is changed on a flight. It is not supported for more complex scenarios such as changing routing, adding segments, connection changes, or for itineraries with more than one brand. Optional PricingPCC String, 2-10 characters supported. Use to send a faring PCC for which a selective access or code group agreement exists between that PCC and the PCC associated with your account. (PCC is the pseudo city code; a travel provider's identification code for the JSON APIs, provisioned from Travelport.) The following combinations of PricingPCC and FareSelection/fareType=PrivateFaresOnly (see below) return results as follows: PricingPCC sent and PrivateFaresOnly not requested: If a selective access or group agreement exists, both public and private fares (if available) are returned for the requesting and providing PCC. PricingPCC sent and PrivateFaresOnly not requested: If no selective access or group agreement exists, only public fares are returned. PricingPCC sent and PrivateFaresOnly is requested: If a selective access or group agreement exists that allows private fare access, private fares (if available) are returned for the requesting and providing PCC. PricingPCC sent and PrivateFaresOnly is requested: If a selective access or group agreement exists but does not allow private fares access, or if no agreement exists, an error is returned. Optional BrandPreference Array. Send one or more brand tiers to specify for the search. Optional brandTier String. Specifies the brand tier to search for fares in. Required if BrandPreference is sent legSequence The sequence of the leg for the brand tier. Optional OrganizationInformation Top level object for OrganizationIdentifier. Optional OrganizationIdentifier Send up to five account or contract codes, if they are required for an airline or agency private fare. Required if OrganizationInformation sent organizationCodeType String. Always send with the string Account . Required if OrganizationInformation sent value String. The account code to apply. If an account code for a private fare is sent, any tour code filed through a supplier as a private fare CAT 35 is shown in the response in TermsAndConditionsFull/OrganizationInformation/OrganizationIdentifier, with an organizationCodeType value of Tour and the tour code returned in OrganizationIdentifier/value. Required if OrganizationInformation sent supplier String. The IATA&#160;code for the airline on which the account code is applicable. Required if OrganizationInformation sent accountCodeFaresOnlyInd Boolean. Optional indicator to limit the fares returned to only fares filed for that account code. Send set to true , along with one or more account codes in OrganizationIdentifier/value per above. If sending multiple account codes, send each instance with accountCodeFaresOnlyInd set to true. If not sent the default is false. If an account code is sent without accountCodeFaresOnlyInd set to true , the response includes any fares filed for that account code plus fares that are not specific to the account code. If accountCodeFaresOnlyInd is sent with true and no account code, the indicator is ignored and the response returns all fares and the following warning: accountCodeFaresOnlyInd set to true requires an account code to be specified in the request . Optional CalculatedFareAdjustment Optional pricing modifier allowing customers who have airline calculated fares to increase or decrease those fares before taxes during exchanges. The @type value specifies whether to increase or decrease the fare: @type CalculatedFareAdjustmentDiscount discounts the fare, either by amount or percentage. @type CalculatedFareAdjustmentIncrease increases the fare; supported for amount only, not percentage; see AmountPercent. Show Example excerpt - CalculatedFareAdjustment to discount fare by an amount "CalculatedFareAdjustment": { "@type": "CalculatedFareAdjustmentDiscount", "AmountPercent": { "@type": "AmountPercentAmount", "Amount": { "value": 20 } } } } Show Example excerpt - CalculatedFareAdjustment to discount fare by a percent "CalculatedFareAdjustment": { "@type": "CalculatedFareAdjustmentDiscount", "AmountPercent": { "@type": "AmountPercentPercent", "Percent": 11 } } } Show Example excerpt - CalculatedFareAdjustment to increase fares by flat amount "CalculatedFareAdjustment": { "@type": "CalculatedFareAdjustmentIncrease", "AmountPercent": { "@type": "AmountPercentAmount", "Amount": { "value": 5 } } } } Optional AmountPercent Use with CalculatedFareAdjustment. Includes either Percent or Amount objects. The @type value specifies adjustment by amount or percentage: @type AmountPercentAmount adjusts the fare by an amount; send with Amount per below @type AmountPercentPercent adjusts the fare by a percentage; send with Percent per below Required if CalculatedFareAdjustment sent AmountPercent/ Percent Send with AmountPercent @type AmountPercentPercent to specify a percentage to decrease the fare by. Whole numbers only; decimals not supported. Increase by percentage is not supported. Optional AmountPercent/ Amount Send with AmountPercent @type AmountPercentAmount to specify an amount to increase or decrease the fare by. Optional FareSelection Optional object to send fare type values. Optional prohibitUnbundledFaresInd Set to true to prevent unbundled fares. Default is false . When sent, FareSelection must be sent with @type FareSelectionDetail. Optional fareType Specifies the fare types to return. Supported values: PublicFaresOnly PrivateFaresOnly AgencyPrivateFaresOnly AirlinePrivateFaresOnly NetFaresOnly: Only net fares. If no net fares are available, the response returns an error and does not return any fares. PublicAndPrivateFares (default):&#160;Lowest of all public and private fares. AllFares:&#160;Not supported. Optional Response The Exchange&#160;Search response is similar to the Search response.&#160;The table below refers to the response table in the Search API&#160;Reference for several common objects that are returned in the Exchange&#160;Search response with the same type of data. Show Response Body Table Object Description CatalogOfferingsAirChangeResponse Top level object for the full response. Include CatalogOfferings and ReferenceList objects. Key value pairs: transactionId : System-generated unique ID for this response. Can be used for internal tracking and troubleshooting. traceId : Returned if a custom trace ID was sent in the request header. See Transaction and Trace IDs for details. See Identifiers in the JSON &#160;APIs for more about identifiers across all JSON &#160;APIs. CatalogOfferings Top level object for all offers. Includes Identifier and CatalogOffering. CatalogOfferings/ Identifier Identifier information for the response. Key value pair: value: Transaction identifier. CatalogOffering Array. Each instance returns an individual offer. Includes ProductOptions,&#160;Price, TermsAndConditions, ModifyPrice objects; returns PastDate if any segments have already been flown. Up to 25 instances of CatalogOffering may be returned. All instances of CatalogOffering have @type CatalogOfferingModify . Key value pair: id : Internal short reference for offer. Must be sent in any subsequent request to book this specific offer. ContentSource Identifies type of content. For GDS exchanges, always returned with value GDS . ProductOptions Flight options for one leg of the itinerary. Key value pair: sequence : Sequence of this leg of the itinerary for this product. For example, on a round-trip itinerary, the outbound/departure leg has sequence value 1 , and the inbound/return leg has sequence value 2 . Includes Product object. Product Array. Lists the flight or connecting flights for one leg of the itinerary. Repeats for additional legs. Key value pairs: totalDuration : Total time length of the segment in hours (H) and minutes (M). id :&#160;Internal product id. Includes FlightSegment and PassengerFlight objects. FlightSegment Array. One instance for each flight in the product. For example, a leg (aka product) with no connecting flights would return one instance while a leg with connecting flights would return two instances. Key value pair: sequence :&#160;Order of the sequence; e.g. 1 for the first segment on the leg. Includes Flight object. Flight Array. One instance for each flight in the FlightSegment. A leg with a direct flight option has one Flight object, while a leg with connecting flights has one Flight object for each connecting flight on the leg. Includes FlightRef. FlightRef Internal cross-reference to full flight details returned in ReferenceList/ReferenceListFlight. PassengerFlight Array. Returns PTC and class/fare information for each PTC&#160;requested. One instance for each PTC requested. Key value pairs: passengerQuantity : Number of passengers in that PTC. passengerTypeCode : The PTC code. Includes FlightProduct. FlightProduct Key value pairs: segmentSequence :&#160;Order of the corresponding flight in the sequence. Note that the segmentSequence value for connecting flights is the same; for example, for two connecting flights on the outbound or first leg of the itinerary, both flights have the segmentSequence value 1 . classOfService : Class of service code. cabin :&#160;Cabin class. fareBasisCode :&#160;Fare basis code for the flight. fareType :&#160;Indicates the fare type. Possible values are AirlinePrivateFare, AgencyPrivateFare, PublicFare, or NetFare (net fares are not supported for NDC). If branded fares are returned, includes the Brand object. Brand Returned for branded fares. Includes BrandRef object. Brand/ BrandRef Cross-reference to the brand identifier (e.g., b1) in ReferenceListBrand. Price The Price object returns price information for this offer. It includes the following: exchangeInd :&#160; true indicates the currently ticketed itinerary can be exchanged for this itinerary. Because the price information applies to an exchange, this value is always returned as true . Price includes the objects Base, TotalTaxes, TotalFees, TotalPrice, and PriceBreakdown if a detail response was requested The amounts in Base, TotalTaxes, TotalFees, and TotalPrice are inclusive of all travelers across all PTCs. The amounts in PriceBreakdown apply to one traveler with the PTC returned in that instance. In Price/Fees and ModifyPrice/Fees, a Tax object is returned if applicable to provide the VAT information for the change fee, including the currency code, tax code, and amount. Base Number. Base price for all passengers before taxes and fees. TotalTaxes Number. Sum of all taxes for all passengers. TotalFees Sum of all fees for all passengers. TotalPrice Total price for all passengers including base cost, taxes, and fees. PriceBreakdown Returned only if a detail response was requested. Array. One instance per PTC. Key value pairs: quantity :&#160;Number of passengers in this PTC. requestedPassengerType : The PTC. Includes the Commission (if filed) and Amount objects. May include FiledAmount. For any fare that has a private fare component, PriceBreakdown includes the objects Commission (either a percent or amount) and NetBaseAmount, which is the base fare filed by the airline. PriceBreakdown/ Amount Includes the standard CurrencyCode, Base, Taxes, Fees, and Total objects to return the base fare, taxes, fees, and total fare for this PTC. PriceBreakdown/ Commission Any commission filed by an airline in a CAT35 fare is returned in PriceBreakdownAir/Commission. The amount is either a percent of the fare component (@type CommissionPercent and the Percent object) or an amount (@type CommissionAmount with Amount @value). Commission is not returned if no commission is filed, or if the commission is a mix of amount and percent. Show Commission examples - percent and amount Commission as a percent: "Commission": { "@type": "CommissionPercent", "Percent": 0 }, Commission as an amount: "Commission": { "@type": "CommissionAmount", "Amount": { "code": "GBP", "minorUnit": 2, "value": 0.0 } }, Amount Specifies commission when commission is a set amount. Key value pairs: code : Currency code for this amount. minorUnit : The smallest unit of currency for the currency in code . For example; the smallest denomination in USD is the cent, which is 1/100 of a USD, and the minor unit value is 2 . Not all currencies have a minor unit. value : The amount of the commission. Percent Number. Specifies commission percent when commission is a percent. PriceBreakdown/FiledAmount Returned if there is an equivalent amount on the fare. PriceBreakdown/NetBaseAmount The base fare filed by the airline exclusive of any commission or additional markup. Returned only for fares with a private fare component. See Net Ticket Data in the Exchange, Refund, and Void Guide for details. FiledAmount Any filed fare amounts. Key value pairs: currencyCode : Currency code of the filed fare. decimalPlace :&#160;Decimal places in the filed fare currency. value : Value of the filed amount. TermsAndConditions The terms and conditions that apply to the offer. For full details see the Search API&#160;Reference . TermsAndConditions/ FulfillmentMethod If there is a refundable balance, TermsAndConditions includes the FulfillmentMethod object. Includes RefundMethod and ChangeFeeCollectionMethod. RefundMethod Determines how the refundable balance will be handled. Key value pair: value : Possible values are RefundOriginalFOP, EMD, MCO, Unknown. ChangeFeeCollectionMethod Notes how the ChangeFee should be collected. Key value pair: value : Possible values are EMD, TAX, MCO, Unknown. changeFeeIssuedSeparatelyInd Indicator returned set to true when a refund will be returned along with a change fee. Key value pair: value : Supported value is EMD . When a non-refundable fare component exists, the refund amount after adjustment with the change fee is not returned, which will cause a discrepancy in the TotalPrice value. FareCalculation For each PTC, when available, FareCalculation returns the fare calculation ladder for all public and private fare types filed by an agency or an airline. Returned as a string with unlimited bytes. CurrencyRateConversion Returned when the POS country and country of the originating flight are different. Includes SourceCurrency, TargetCurrency, and ConversionRate objects. SourceCurrency Currency of the country of originating flight. Key value pair: value : Code for currency of country of originating flight. TargetCurrency Currency of the country of the POS. Key value pair: value : Code for currency of POS country. ConversionRate Key value pair: rateAsOf : Date and time of conversion rate used. value : Conversion rate from SourceCurrency to Target Currency. ModifyPrice ModifyPrice returns details about any fare difference between the currently ticketed itinerary and the offer in the CatalogOffering. Returns amounts in the CurrencyCode, Base, TotalTaxes, TotalPrice, and PriceBreakdown in the same format as the standard Price object . For all amounts in the following objects below, if there is no difference between the current ticket and the new amount, the value is 0 . A negative number indicates the repriced amount is less than the ticket's current amount for that base, tax, fee, etc. A positive number indicates the repriced amount is higher. For example, A negative number in TotalPrice indicates an amount left after exchange. ResidualPrice Returned if any residual value remains at exchange for this offer. Returns amounts in the CurrencyCode, Base, TotalTaxes, TotalPrice, and PriceBreakdown in the same format as the standard Price object . AdditionalCollectionPrice Returned if any additional amount (add collect) is due for this offer at exchange. Returns amounts in the CurrencyCode, Base, TotalTaxes, TotalPrice, and PriceBreakdown in the same format as the standard Price object . SupplierRetainedPrice Returned when an offer includes a system-ignored amount to show the carrier-forfeited residual value. Returns amounts in the CurrencyCode, Base, TotalTaxes, TotalPrice, and PriceBreakdown in the same format as the standard Price object . Note the following about forfeited residual values: When&#160;SupplierRetainedPrice is returned, the terminal record includes an EP$ modifier that indicates the system-ignored residual amount as follows. No change to the response payload; this entry is available only via a terminal program. T P1/S1/CDL/ET/FEX0067232556649/EP$61.39 When a residual value is forfeited because of a Category 31 filing by the airline, an entry about the forfeit is made in the historical notepad record. No change to the response payload. The historical notepad is accessible only via a terminal program with the *HNP entry, and available only to specifically provisioned customers. Contact your Travelport representative for any questions about your access. Show Example SupplierRetainedPrice object "SupplierRetainedPrice": { "@type": "SupplierRetainedPriceDetail", "id": "SupplierRetainedPrice_1", "CurrencyCode": { "decimalPlace": 2, "value": "USD" }, "Base": 0, "TotalTaxes": 0, "TotalPrice": 0, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "Base": 0, "Taxes": { "@type": "Taxes", "TotalTaxes": 0 } } }, { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "SRC", "Amount": { "@type": "Amount", "Base": 0, "Taxes": { "@type": "Taxes", "TotalTaxes": 0 } } } ] } PastDate Returned if an exchange is requested for a ticket on which some flight segments have already been flown. Lists the flown flight segments by flight segment number. Show Example PastDate object for flown segments "PastDate": [ "s1", "s2" ] CurrencyCode Specifies the currency in which prices are returned. Key value pairs: value : IATA code for currency. decimalPlace : Indicates the number of decimal places returned. ReferenceList/ ReferenceListFlight Flight details for the flights returned in the offers. For details see the ReferenceList section of the Search API&#160;Reference. ReferenceList/ ReferenceListBrand Brand details for the brands returned in the offers. For details see the ReferenceList section of the Search API&#160;Reference. ReferenceList/ ReferenceListExchangedPrice Returns the original price of the exchanged ticket. Returns amounts in the CurrencyCode, Base, TotalTaxes, TotalPrice, and PriceBreakdown in the same format as the standard Price object . Example Request For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . The example below requests an Exchange Search for multiple passengers. Show Example Exchange Search for multiple passengers { "CatalogOfferingsQueryAirChange": { "CatalogOfferingsAirChangeRequest": { "@type": "CatalogOfferingsAirChangeRequestReservation", "returnBrandedFaresInd": true, "detailViewInd": true, "SearchCriteriaFlight": [{ "departureDate": "2021-05-14", "departureTime": "07:30:00", "From": { "cityOrAirport": "Airport Only", "value": "LHR" }, "To": { "cityOrAirport": "City or Airport", "value": "FRA" } }, { "departureDate": "2021-05-30", "departureTime": "08:00:00", "From": { "cityOrAirport": "Airport Only", "value": "FRA" }, "To": { "cityOrAirport": "City or Airport", "value": "LHR" } } ], "PassengerCriteria": [{ "@type": "PassengerCriteriaAirChange", "number": 1, "age": 20, "passengerTypeCode": "ADT", "TravelerIdentifierRef": { "id": "travelerRefId_1" } }, { "@type": "PassengerCriteriaAirChange", "number": 1, "age": 22, "passengerTypeCode": "ADT", "TravelerIdentifierRef": { "id": "travelerRefId_2" } }, { "@type": "PassengerCriteriaAirChange", "number": 1, "age": 6, "passengerTypeCode": "C06", "TravelerIdentifierRef": { "id": "travelerRefId_3" } }, { "@type": "PassengerCriteriaAirChange", "number": 1, "age": 8, "passengerTypeCode": "C08", "TravelerIdentifierRef": { "id": "travelerRefId_4" } }, { "@type": "PassengerCriteriaAirChange", "number": 1, "age": 60, "passengerTypeCode": "ADT", "TravelerIdentifierRef": { "id": "travelerRefId_5" } }, { "@type": "PassengerCriteriaAirChange", "number": 1, "age": 60, "passengerTypeCode": "ADT", "TravelerIdentifierRef": { "id": "travelerRefId_6" } } ], "PricingModifiersAirChange": {}, "BuildFromReservationWorkbench": { "ReservationIdentifier": { "Identifier": { "authority": "Travelport", "value": "723f8a67-a1b2-4f41-b52b-71c5026db23e" } }, "OfferIdentifier": { "id": "offer_1" }, "ProductIdentifier": [{ "id": "product_1" }, { "id": "product_2" } ] } } } } Example Response For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . For brevity, the following example has been edited to truncate TermsAndConditions/BaggageAllowance. Exchange Search returns the same BaggageAllowance information as the Search API; see examples in the Search API&#160;Reference . Show Example Search response { "CatalogOfferingsAirChangeResponse": { "@type": "CatalogOfferingsAirChangeResponse", "transactionId": "Katalon_07172025151732", "traceId": "adc91efa-9c59-4131-9ece-4b315ea84d5f", "CatalogOfferings": { "@type": "CatalogOfferings", "Identifier": { "value": "1fabef43-ac45-4403-a924-f39f5f6ba510" }, "CatalogOffering": [ { "@type": "CatalogOfferingModify", "id": "o0.0", "ContentSource": "GDS", "ProductOptions": [ { "@type": "ProductOptions", "sequence": 1, "Product": [ { "@type": "ProductAir", "totalDuration": "PT1H35M", "id": "p1", "FlightSegment": [ { "@type": "FlightSegment", "sequence": 1, "Flight": { "@type": "FlightID", "FlightRef": "s1" } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 1 ], "classOfService": "Y", "cabin": "Economy", "fareBasisCode": "YEUCLSP0", "fareType": "PublicFare" } ] }, { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "C08", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 1 ], "classOfService": "Y", "cabin": "Economy", "fareBasisCode": "YEUCLSP0/CH25", "fareType": "PublicFare" } ] }, { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "SRC", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 1 ], "classOfService": "Y", "cabin": "Economy", "fareBasisCode": "YEUCLSP0", "fareType": "PublicFare" } ] } ] } ] }, { "@type": "ProductOptions", "sequence": 2, "Product": [ { "@type": "ProductAir", "totalDuration": "PT1H40M", "id": "p2", "FlightSegment": [ { "@type": "FlightSegment", "sequence": 2, "Flight": { "@type": "FlightID", "FlightRef": "s2" } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 2 ], "classOfService": "Y", "cabin": "Economy", "fareBasisCode": "YEUCLSP0", "fareType": "PublicFare" } ] }, { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "C08", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 2 ], "classOfService": "Y", "cabin": "Economy", "fareBasisCode": "YEUCLSP0/CH25", "fareType": "PublicFare" } ] }, { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "SRC", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 2 ], "classOfService": "Y", "cabin": "Economy", "fareBasisCode": "YEUCLSP0", "fareType": "PublicFare" } ] } ] } ] } ], "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "GBP" }, "Base": 2453, "TotalTaxes": 571.76, "TotalFees": 180, "TotalPrice": 3204.76, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "GBP" }, "Base": 892, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 194.92, "Tax": [ { "taxCode": "DE", "value": 10.2 }, { "taxCode": "GB", "value": 13 }, { "taxCode": "OY", "value": 13.3 }, { "taxCode": "RA", "value": 34.9 }, { "taxCode": "UB", "value": 23.32 }, { "taxCode": "YQ", "value": 81.2 }, { "taxCode": "YR", "value": 19 } ] }, "Fees": { "@type": "FeesDetail", "TotalFees": 60, "Fee": [ { "@type": "Fee", "description": "Change Fee", "FeeAmountOrPercent": { "@type": "FeeAmountOrPercentAmount", "Amount": { "code": "GBP", "minorUnit": 2, "value": 60 } } } ] }, "Total": 1146.92 }, "FiledAmount": { "currencyCode": "GBP", "decimalPlace": 2, "value": 892 } }, { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "C08", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "GBP" }, "Base": 669, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 181.92, "Tax": [ { "taxCode": "DE", "value": 10.2 }, { "taxCode": "OY", "value": 13.3 }, { "taxCode": "RA", "value": 34.9 }, { "taxCode": "UB", "value": 23.32 }, { "taxCode": "YQ", "value": 81.2 }, { "taxCode": "YR", "value": 19 } ] }, "Fees": { "@type": "FeesDetail", "TotalFees": 60, "Fee": [ { "@type": "Fee", "description": "Change Fee", "FeeAmountOrPercent": { "@type": "FeeAmountOrPercentAmount", "Amount": { "code": "GBP", "minorUnit": 2, "value": 60 } } } ] }, "Total": 910.92 }, "FiledAmount": { "currencyCode": "GBP", "decimalPlace": 2, "value": 669 } }, { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "SRC", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "GBP" }, "Base": 892, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 194.92, "Tax": [ { "taxCode": "DE", "value": 10.2 }, { "taxCode": "GB", "value": 13 }, { "taxCode": "OY", "value": 13.3 }, { "taxCode": "RA", "value": 34.9 }, { "taxCode": "UB", "value": 23.32 }, { "taxCode": "YQ", "value": 81.2 }, { "taxCode": "YR", "value": 19 } ] }, "Fees": { "@type": "FeesDetail", "TotalFees": 60, "Fee": [ { "@type": "Fee", "description": "Change Fee", "FeeAmountOrPercent": { "@type": "FeeAmountOrPercentAmount", "Amount": { "code": "GBP", "minorUnit": 2, "value": 60 } } } ] }, "Total": 1146.92 }, "FiledAmount": { "currencyCode": "GBP", "decimalPlace": 2, "value": 892 } } ] }, "TermsAndConditions": { "@type": "TermsAndConditionsAirChange", "BaggageAllowance": [...], "Restriction": [ { "value": "* NONREF 892.00 GBP/FARE RESTRICTION MAY APPLY" } ], "ValidatingAirline": [ { "@type": "ValidatingAirline", "ValidatingAirline": "LH" } ], "PaymentTimeLimit": "2025-08-18T23:59:00Z", "FareGuaranteePolicy": [ { "@type": "FareGuaranteePolicy", "EligibleforADMReview": "Yes", "Code": { "codeContext": "Travelport", "value": "G" } } ], "FulfillmentMethod": [ { "@type": "FulfillmentMethod", "ChangeFeeCollectionMethod": { "value": "EMD" } } ] }, "ModifyPrice": { "@type": "ModifyPriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "GBP" }, "Base": 0, "TotalTaxes": 0, "TotalFees": 180, "TotalPrice": 180, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "GBP" }, "Base": 0, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 0 }, "Fees": { "@type": "FeesDetail", "TotalFees": 60, "Fee": [ { "@type": "Fee", "description": "Change Fee", "FeeAmountOrPercent": { "@type": "FeeAmountOrPercentAmount", "Amount": { "code": "GBP", "minorUnit": 2, "value": 60 } } } ] }, "Total": 60 }, "FareCalculation": "LON LH FRA593.36LH LON593.37NUC1186.73END ROE.751639 LH" }, { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "C08", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "GBP" }, "Base": 0, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 0 }, "Fees": { "@type": "FeesDetail", "TotalFees": 60, "Fee": [ { "@type": "Fee", "description": "Change Fee", "FeeAmountOrPercent": { "@type": "FeeAmountOrPercentAmount", "Amount": { "code": "GBP", "minorUnit": 2, "value": 60 } } } ] }, "Total": 60 }, "FareCalculation": "LON LH FRA445.02LH LON445.03NUC890.05END ROE.751639 LH" }, { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "SRC", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "GBP" }, "Base": 0, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 0 }, "Fees": { "@type": "FeesDetail", "TotalFees": 60, "Fee": [ { "@type": "Fee", "description": "Change Fee", "FeeAmountOrPercent": { "@type": "FeeAmountOrPercentAmount", "Amount": { "code": "GBP", "minorUnit": 2, "value": 60 } } } ] }, "Total": 60 }, "FareCalculation": "LON LH FRA593.36LH LON593.37NUC1186.73END ROE.751639 LH" } ] }, "ResidualPrice": { "@type": "ResidualPriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "GBP" }, "Base": 0, "TotalTaxes": 0, "TotalFees": 0, "TotalPrice": 0, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "GBP" }, "Base": 0, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 0 }, "Fees": { "@type": "FeesDetail", "TotalFees": 0, "Fee": [ { "@type": "Fee", "description": "Change Fee", "FeeAmountOrPercent": { "@type": "FeeAmountOrPercentAmount", "Amount": { "code": "GBP", "minorUnit": 2, "value": 0 } } } ] }, "Total": 0 }, "FareCalculation": "LON LH FRA593.36LH LON593.37NUC1186.73END ROE.751639 LH" }, { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "C08", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "GBP" }, "Base": 0, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 0 }, "Fees": { "@type": "FeesDetail", "TotalFees": 0, "Fee": [ { "@type": "Fee", "description": "Change Fee", "FeeAmountOrPercent": { "@type": "FeeAmountOrPercentAmount", "Amount": { "code": "GBP", "minorUnit": 2, "value": 0 } } } ] }, "Total": 0 }, "FareCalculation": "LON LH FRA445.02LH LON445.03NUC890.05END ROE.751639 LH" }, { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "SRC", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "GBP" }, "Base": 0, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 0 }, "Fees": { "@type": "FeesDetail", "TotalFees": 0, "Fee": [ { "@type": "Fee", "description": "Change Fee", "FeeAmountOrPercent": { "@type": "FeeAmountOrPercentAmount", "Amount": { "code": "GBP", "minorUnit": 2, "value": 0 } } } ] }, "Total": 0 }, "FareCalculation": "LON LH FRA593.36LH LON593.37NUC1186.73END ROE.751639 LH" } ] }, "AdditionalCollectionPrice": { "@type": "AdditionalCollectionPriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "GBP" }, "Base": 0, "TotalTaxes": 0, "TotalFees": 180, "TotalPrice": 180, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "GBP" }, "Base": 0, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 0 }, "Fees": { "@type": "FeesDetail", "TotalFees": 60, "Fee": [ { "@type": "Fee", "description": "Change Fee", "FeeAmountOrPercent": { "@type": "FeeAmountOrPercentAmount", "Amount": { "code": "GBP", "minorUnit": 2, "value": 60 } } } ] }, "Total": 60 }, "FareCalculation": "LON LH FRA593.36LH LON593.37NUC1186.73END ROE.751639 LH" }, { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "C08", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "GBP" }, "Base": 0, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 0 }, "Fees": { "@type": "FeesDetail", "TotalFees": 60, "Fee": [ { "@type": "Fee", "description": "Change Fee", "FeeAmountOrPercent": { "@type": "FeeAmountOrPercentAmount", "Amount": { "code": "GBP", "minorUnit": 2, "value": 60 } } } ] }, "Total": 60 }, "FareCalculation": "LON LH FRA445.02LH LON445.03NUC890.05END ROE.751639 LH" }, { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "SRC", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "GBP" }, "Base": 0, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 0 }, "Fees": { "@type": "FeesDetail", "TotalFees": 60, "Fee": [ { "@type": "Fee", "description": "Change Fee", "FeeAmountOrPercent": { "@type": "FeeAmountOrPercentAmount", "Amount": { "code": "GBP", "minorUnit": 2, "value": 60 } } } ] }, "Total": 60 }, "FareCalculation": "LON LH FRA593.36LH LON593.37NUC1186.73END ROE.751639 LH" } ] } } ] }, "ReferenceList": [ { "@type": "ReferenceListFlight", "Flight": [ { "@type": "FlightDetail", "duration": "PT1H35M", "carrier": "LH", "number": "921", "equipment": "32N", "id": "s1", "Departure": { "@type": "Departure", "location": "LHR", "date": "2025-08-18", "time": "06:30:00" }, "Arrival": { "@type": "ArrivalDetail", "terminal": "1", "location": "FRA", "date": "2025-08-18", "time": "09:05:00" }, "AvailabilitySourceCode": "Q" }, { "@type": "FlightDetail", "duration": "PT1H40M", "carrier": "LH", "number": "900", "equipment": "32N", "id": "s2", "Departure": { "@type": "Departure", "location": "FRA", "date": "2025-08-21", "time": "08:00:00" }, "Arrival": { "@type": "ArrivalDetail", "terminal": "1", "location": "LHR", "date": "2025-08-21", "time": "08:40:00" }, "AvailabilitySourceCode": "Q" } ] }, { "@type": "ReferenceListExchangedPrice", "Price": [ { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "GBP" }, "Base": 2453, "TotalTaxes": 571.76, "TotalPrice": 3024.76, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "GBP" }, "Base": 892, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 194.92, "Tax": [ { "taxCode": "GB", "value": 13 }, { "taxCode": "UB", "value": 23.32 }, { "taxCode": "DE", "value": 10.2 }, { "taxCode": "OY", "value": 13.3 }, { "taxCode": "RA", "value": 34.9 }, { "taxCode": "YQ", "value": 81.2 }, { "taxCode": "YR", "value": 19 } ] }, "Total": 1086.92 } }, { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "C08", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "GBP" }, "Base": 669, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 181.92, "Tax": [ { "taxCode": "UB", "value": 23.32 }, { "taxCode": "DE", "value": 10.2 }, { "taxCode": "OY", "value": 13.3 }, { "taxCode": "RA", "value": 34.9 }, { "taxCode": "YQ", "value": 81.2 }, { "taxCode": "YR", "value": 19 } ] }, "Total": 850.92 } }, { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "SRC", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "GBP" }, "Base": 892, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 194.92, "Tax": [ { "taxCode": "GB", "value": 13 }, { "taxCode": "UB", "value": 23.32 }, { "taxCode": "DE", "value": 10.2 }, { "taxCode": "OY", "value": 13.3 }, { "taxCode": "RA", "value": 34.9 }, { "taxCode": "YQ", "value": 81.2 }, { "taxCode": "YR", "value": 19 } ] }, "Total": 1086.92 } } ] } ] } ] } }

## Literal `<pre>` excerpts from HTML

### Block 1

```
...{
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
}...
```

### Block 2

```
...{
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
}...
```

### Block 3

```
"CalculatedFareAdjustment": {

          "@type": "CalculatedFareAdjustmentDiscount",
          "AmountPercent": {
            "@type": "AmountPercentAmount",
            "Amount": {
              "value": 20
            }
          }
        }												}
```

### Block 4

```
"CalculatedFareAdjustment": {
          "@type": "CalculatedFareAdjustmentDiscount",
          "AmountPercent": {
            "@type": "AmountPercentPercent",
            "Percent": 11
          }
        }													}
```

### Block 5

```
"CalculatedFareAdjustment": {
          "@type": "CalculatedFareAdjustmentIncrease",
          "AmountPercent": {
            "@type": "AmountPercentAmount",
            "Amount": {
              "value": 5
            }
          }
        }													}
```

### Block 6

```
"Commission": {
	"@type": "CommissionPercent",
	"Percent": 0
	},
```

### Block 7

```
"Commission": {
	"@type": "CommissionAmount",
       "Amount": {
          "code": "GBP",
          "minorUnit": 2,
          "value": 0.0
        }
      },
```

### Block 8

```
"SupplierRetainedPrice": {
      "@type": "SupplierRetainedPriceDetail",
      "id": "SupplierRetainedPrice_1",
      "CurrencyCode": {
       "decimalPlace": 2,
       "value": "USD"
      },
      "Base": 0,
      "TotalTaxes": 0,
      "TotalPrice": 0,
      "PriceBreakdown": [
       {
        "@type": "PriceBreakdownAir",
        "quantity": 1,
        "requestedPassengerType": "ADT",
        "Amount": {
         "@type": "Amount",
         "Base": 0,
         "Taxes": {
          "@type": "Taxes",
          "TotalTaxes": 0
         }
        }
       },
       {
        "@type": "PriceBreakdownAir",
        "quantity": 1,
        "requestedPassengerType": "SRC",
        "Amount": {
         "@type": "Amount",
         "Base": 0,
         "Taxes": {
          "@type": "Taxes",
          "TotalTaxes": 0
         }
        }
       }
      ]
     }
```

### Block 9

```
"PastDate": [
      "s1",
      "s2"
     ]
```

### Block 10

```
{
    "CatalogOfferingsQueryAirChange": {
        "CatalogOfferingsAirChangeRequest": {
            "@type": "CatalogOfferingsAirChangeRequestReservation",
            "returnBrandedFaresInd": true,
            "detailViewInd": true,
            "SearchCriteriaFlight": [{
                    "departureDate": "2021-05-14",
                    "departureTime": "07:30:00",
                    "From": {
                        "cityOrAirport": "Airport Only",
                        "value": "LHR"
                    },
                    "To": {
                        "cityOrAirport": "City or Airport",
                        "value": "FRA"
                    }
                }, {
                    "departureDate": "2021-05-30",
                    "departureTime": "08:00:00",
                    "From": {
                        "cityOrAirport": "Airport Only",
                        "value": "FRA"
                    },
                    "To": {
                        "cityOrAirport": "City or Airport",
                        "value": "LHR"
                    }
                }
            ],
            "PassengerCriteria": [{
                    "@type": "PassengerCriteriaAirChange",
                    "number": 1,
                    "age": 20,
                    "passengerTypeCode": "ADT",
                    "TravelerIdentifierRef": {
                        "id": "travelerRefId_1"
                    }
                }, {
                    "@type": "PassengerCriteriaAirChange",
                    "number": 1,
                    "age": 22,
                    "passengerTypeCode": "ADT",
                    "TravelerIdentifierRef": {
                        "id": "travelerRefId_2"
                    }
                }, {
                    "@type": "PassengerCriteriaAirChange",
                    "number": 1,
                    "age": 6,
                    "passengerTypeCode": "C06",
                    "TravelerIdentifierRef": {
                        "id": "travelerRefId_3"
                    }
                }, {
                    "@type": "PassengerCriteriaAirChange",
                    "number": 1,
                    "age": 8,
                    "passengerTypeCode": "C08",
                    "TravelerIdentifierRef": {
                        "id": "travelerRefId_4"
                    }
                }, {
                    "@type": "PassengerCriteriaAirChange",
                    "number": 1,
                    "age": 60,
                    "passengerTypeCode": "ADT",
                    "TravelerIdentifierRef": {
                        "id": "travelerRefId_5"
                    }
                }, {
                    "@type": "PassengerCriteriaAirChange",
                    "number": 1,
                    "age": 60,
                    "passengerTypeCode": "ADT",
                    "TravelerIdentifierRef": {
                        "id": "travelerRefId_6"
                    }
                }
            ],
            "PricingModifiersAirChange": {},
            "BuildFromReservationWorkbench": {
                "ReservationIdentifier": {
                    "Identifier": {
                        "authority": "Travelport",
                        "value": "723f8a67-a1b2-4f41-b52b-71c5026db23e"
                    }
                },
                "OfferIdentifier": {
                    "id": "offer_1"
                },
                "ProductIdentifier": [{
                        "id": "product_1"
                    }, {
                        "id": "product_2"
                    }
                ]
            }
        }
    }
}
```

### Block 11

```
{
 "CatalogOfferingsAirChangeResponse": {
  "@type": "CatalogOfferingsAirChangeResponse",
  "transactionId": "Katalon_07172025151732",
  "traceId": "adc91efa-9c59-4131-9ece-4b315ea84d5f",
  "CatalogOfferings": {
   "@type": "CatalogOfferings",
   "Identifier": {
    "value": "1fabef43-ac45-4403-a924-f39f5f6ba510"
   },
   "CatalogOffering": [
    {
     "@type": "CatalogOfferingModify",
     "id": "o0.0",
     "ContentSource": "GDS",
     "ProductOptions": [
      {
       "@type": "ProductOptions",
       "sequence": 1,
       "Product": [
        {
         "@type": "ProductAir",
         "totalDuration": "PT1H35M",
         "id": "p1",
         "FlightSegment": [
          {
           "@type": "FlightSegment",
           "sequence": 1,
           "Flight": {
            "@type": "FlightID",
            "FlightRef": "s1"
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
             "classOfService": "Y",
             "cabin": "Economy",
             "fareBasisCode": "YEUCLSP0",
             "fareType": "PublicFare"
            }
           ]
          },
          {
           "@type": "PassengerFlight",
           "passengerQuantity": 1,
           "passengerTypeCode": "C08",
           "FlightProduct": [
            {
             "@type": "FlightProduct",
             "segmentSequence": [
              1
             ],
             "classOfService": "Y",
             "cabin": "Economy",
             "fareBasisCode": "YEUCLSP0/CH25",
             "fareType": "PublicFare"
            }
           ]
          },
          {
           "@type": "PassengerFlight",
           "passengerQuantity": 1,
           "passengerTypeCode": "SRC",
           "FlightProduct": [
            {
             "@type": "FlightProduct",
             "segmentSequence": [
              1
             ],
             "classOfService": "Y",
             "cabin": "Economy",
             "fareBasisCode": "YEUCLSP0",
             "fareType": "PublicFare"
            }
           ]
          }
         ]
        }
       ]
      },
      {
       "@type": "ProductOptions",
       "sequence": 2,
       "Product": [
        {
         "@type": "ProductAir",
         "totalDuration": "PT1H40M",
         "id": "p2",
         "FlightSegment": [
          {
           "@type": "FlightSegment",
           "sequence": 2,
           "Flight": {
            "@type": "FlightID",
            "FlightRef": "s2"
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
              2
             ],
             "classOfService": "Y",
             "cabin": "Economy",
             "fareBasisCode": "YEUCLSP0",
             "fareType": "PublicFare"
            }
           ]
          },
          {
           "@type": "PassengerFlight",
           "passengerQuantity": 1,
           "passengerTypeCode": "C08",
           "FlightProduct": [
            {
             "@type": "FlightProduct",
             "segmentSequence": [
              2
             ],
             "classOfService": "Y",
             "cabin": "Economy",
             "fareBasisCode": "YEUCLSP0/CH25",
             "fareType": "PublicFare"
            }
           ]
          },
          {
           "@type": "PassengerFlight",
           "passengerQuantity": 1,
           "passengerTypeCode": "SRC",
           "FlightProduct": [
            {
             "@type": "FlightProduct",
             "segmentSequence": [
              2
             ],
             "classOfService": "Y",
             "cabin": "Economy",
             "fareBasisCode": "YEUCLSP0",
             "fareType": "PublicFare"
            }
           ]
          }
         ]
        }
       ]
      }
     ],
     "Price": {
      "@type": "PriceDetail",
      "CurrencyCode": {
       "decimalPlace": 2,
       "value": "GBP"
      },
      "Base": 2453,
      "TotalTaxes": 571.76,
      "TotalFees": 180,
      "TotalPrice": 3204.76,
      "PriceBreakdown": [
       {
        "@type": "PriceBreakdownAir",
        "quantity": 1,
        "requestedPassengerType": "ADT",
        "Amount": {
         "@type": "Amount",
         "CurrencyCode": {
          "decimalPlace": 2,
          "value": "GBP"
         },
         "Base": 892,
         "Taxes": {
          "@type": "TaxesDetail",
          "TotalTaxes": 194.92,
          "Tax": [
           {
            "taxCode": "DE",
            "value": 10.2
           },
           {
            "taxCode": "GB",
            "value": 13
           },
           {
            "taxCode": "OY",
            "value": 13.3
           },
           {
            "taxCode": "RA",
            "value": 34.9
           },
           {
            "taxCode": "UB",
            "value": 23.32
           },
           {
            "taxCode": "YQ",
            "value": 81.2
           },
           {
            "taxCode": "YR",
            "value": 19
           }
          ]
         },
         "Fees": {
          "@type": "FeesDetail",
          "TotalFees": 60,
          "Fee": [
           {
            "@type": "Fee",
            "description": "Change Fee",
            "FeeAmountOrPercent": {
             "@type": "FeeAmountOrPercentAmount",
             "Amount": {
              "code": "GBP",
              "minorUnit": 2,
              "value": 60
             }
            }
           }
          ]
         },
         "Total": 1146.92
        },
        "FiledAmount": {
         "currencyCode": "GBP",
         "decimalPlace": 2,
         "value": 892
        }
       },
       {
        "@type": "PriceBreakdownAir",
        "quantity": 1,
        "requestedPassengerType": "C08",
        "Amount": {
         "@type": "Amount",
         "CurrencyCode": {
          "decimalPlace": 2,
          "value": "GBP"
         },
         "Base": 669,
         "Taxes": {
          "@type": "TaxesDetail",
          "TotalTaxes": 181.92,
          "Tax": [
           {
            "taxCode": "DE",
            "value": 10.2
           },
           {
            "taxCode": "OY",
            "value": 13.3
           },
           {
            "taxCode": "RA",
            "value": 34.9
           },
           {
            "taxCode": "UB",
            "value": 23.32
           },
           {
            "taxCode": "YQ",
            "value": 81.2
           },
           {
            "taxCode": "YR",
            "value": 19
           }
          ]
         },
         "Fees": {
          "@type": "FeesDetail",
          "TotalFees": 60,
          "Fee": [
           {
            "@type": "Fee",
            "description": "Change Fee",
            "FeeAmountOrPercent": {
             "@type": "FeeAmountOrPercentAmount",
             "Amount": {
              "code": "GBP",
              "minorUnit": 2,
              "value": 60
             }
            }
           }
          ]
         },
         "Total": 910.92
        },
        "FiledAmount": {
         "currencyCode": "GBP",
         "decimalPlace": 2,
         "value": 669
        }
       },
       {
        "@type": "PriceBreakdownAir",
        "quantity": 1,
        "requestedPassengerType": "SRC",
        "Amount": {
     
…
```

