# Air Search Guide

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Search/AirShoppingGuide.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Air Search Guide Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Air Search Guide Use the following Travelport JSON &#160;Search APIs to shop for flights:&#160; Search Next&#160;Leg Search Flight Specific Search Air Availability This guide details the terms and concepts for using these APIs and their workflow. For technical references, see the API&#160;references for each API, linked next. See the JSON Air APIs Guide for the basic travel terms you need to know to develop your applications, how the JSON APIs represent those terms in code, and a workflow summary. Related Content: JSON Air APIs Guide , Search API Reference , Next Leg Search API Reference , Flight Specific Search Reference Payload and Full Payload API references In this guide: Basic Concepts Journey-based and Leg-based Searches Branded Fares and Upsells Search API Journey/Leg-Based Searches and Caching (SearchRepresentation and offersPerPage) NDC and GDS Content (contentSourceList) Upsell Fares (maxNumberOfUpsellsToReturn) Search and Pricing Modifiers Split Ticketing Premium Flex Search (Date and PCC Flexibility) Next Leg Search API Flight Specific Search API Search Responses (all Search APIs) CombinabilityCode and BestCombinablePrice Multi-city Offers with Stopovers (Price details in BestCombinablePrice ) Consolidated Product, Flight, Brand, and Terms (ReferenceList) Brand Attributes Merged GDS and NDC Offers (Content Curation Layer) Search Workflows Request and Response Layout Diagrams Search Request Diagram Next Leg Search Request Diagram Flight Specific Search Request Diagram Search Responses Diagram Air Availability API Basic Concepts Be sure to see the detailed discussion of Offers in the JSON APIs to understand the structure of the Search APIs. In addition to the travel terms and corresponding JSON code details in the JSON Air APIs Guide , this section covers terms specific to the Search APIs. The JSON APIs provide three APIs for searching for flights: Search API : Search for flights for either the entire itinerary (journey-based search) or only the first leg (leg-based search). Supports one-way, round-trip, and open-jaw itineraries. Next Leg Search API : Return flights on the subsequent leg following a leg-based search with the Search API. Flight Specific Search API : Return additional upsells for a flight/s, up to a maximum of 99 upsells. (Search and Next Leg Search return a maximum of 4 upsells per offer .) Journey-based and Leg-based Searches You can use the Search API&#160;alone for all air shopping, or combine it with the Next Leg Search and/or Flight Specific Search APIs. You can set your initial search request to return flight results for either the entire itinerary. or leg by leg: Journey-based searches :&#160;Returns offers for all legs on the itinerary in the same request. A journey-based request is a standalone search - no additional search requests are required. Leg-based searches :&#160;Returns offers for only the first leg of the itinerary. You must then send a Next Leg Search request that sends the selected offer for the first leg and returns offers to combine with that leg. A multi-city itinerary requires a second Next Leg Search for the third leg. See Journey/Leg-Based Searches and Caching (SearchRepresentation and offersPerPage) below for details and the settings to use. For multi-city itineraries, you can search for up to six O&amp;D&#160;pairs (legs of the itinerary) for GDS, and up to three for NDC. If your workflow subsequently references a journey-based A search that returns offers for all legs on the itinerary. A journey-based Search request is a standalone search.&#160;No additional search requests are required. search result, the Search request must send offersPerPage set&#160;to any positive number. This setting invokes caching to allow subsequent requests to refer to these search results. If a journey-based Search request does not send offersPerPage, any subsequent reference payload requests fail , including the Flight Specific Search, AirPrice, and Add Offer reference payloads. Branded Fares and Upsells A key search feature is support for branded fares and upsells. A branded fare is an airfare that is bundled with certain features included in the price. For example, a branded fare might include free seat selection and a carry-on bag. All Search APIs return branded fares by default when available. Brand attributes list whether features such as wifi, assigned seats, baggage, and refunds are available and either included in the fare, available at an extra charge, or not available. In the search API response, an offer might include the following brand options, for example: A base fare (usually identified with Brand/BrandRef value b0) that includes only the fare itself; customers must purchase any extras separately. Brand 1 (e.g., b1) that includes seat selection and a free carry-on. Brand 2 (e.g., b2) that includes the features above plus in-flight wifi and a free checked bag. Details for brands across all offers are consolidated in ReferenceList/ReferenceListBrand . This section returns the brand name, tier, id (the internal reference number matching to Brand/BrandRef in an offer), the airline brand identifier, and brand attributes , which describe what is included in the brand. See Brand Attributes below for a full list of attributes. An upsell is an offer to upgrade to a more expensive option, and may also be a branded fare. To return upsells in the Search and Next Leg Search APIs, you must request them by sending maxNumberOfUpsellsToReturn and specify how many: Itineraries with one or two O&amp;D pairs (one-way and round-trip) can return up to four upsells. Itineraries with three O&amp;D pairs can return up to two upsells. Itineraries with four to six O&amp;D pairs are limited to one upsell. To see more upsell options, you can send a Flight Specific Search request for any flight returned by the Search or Next Leg Search API. Flight Specific Search can return up to 99 upsells, or the maximum available for the flight if less than 99. Search API Search sends details about the number and type of passengers, the location and date for departure and arrival for each leg of the itinerary, and optional search and pricing modifiers. The responses for Search, Next Leg Search, and Flight Specific Search share the same structure, diagrammed and described in Search Responses . Journey/Leg-Based Searches and Caching (SearchRepresentation and offersPerPage) Among other criteria, the Search request must send the O&amp;D&#160;pair (departure and arrival location) for each leg of the itinerary. You can set whether the response should include offers for all legs ( journey-based search ) or only the first leg ( leg-based search ). To specify, send SearchRepresentation (see the Search API Reference ) with either Journey or Leg . If SearchRepresentation is not sent, the response defaults to journey-based and returns offers for all legs. Every Search request must specify all O&amp;D pairs for all legs of the itinerary, even for a leg-based search. This setting does not affect one-way itineraries. With any search request, especially a journey-based search, you may also need to send offersPerPage (see the Search API Reference ) with any positive number. offersPerPage has two functions:. Caching: Sets whether to invoke caching so that journey-based search results can be referenced by subsequent reference payload requests. To invoke caching, send with any number equal to or greater than 1 . No maximum value. Maximum offers returned: Also sets the maximum number of offers returned. If sent with 0 or not sent, Search returns all offers. If the response is not returning an adequate selection of offers, try increasing the value in offersPerPage. If your workflow subsequently references a journey-based A search that returns offers for all legs on the itinerary. A journey-based Search request is a standalone search.&#160;No additional search requests are required. search result, the Search request must send offersPerPage set&#160;to any positive number. This setting invokes caching to allow subsequent requests to refer to these search results. If a journey-based Search request does not send offersPerPage, any subsequent reference payload requests fail , including the Flight Specific Search, AirPrice, and Add Offer reference payloads. NDC and GDS Content (contentSourceList) Request the return of both NDC and GDS&#160;content with the optional contentSourceList indicator as follows: GDS to return only GDS content NDC to return only NDC&#160;content both GDS &#160;and NDC to return both If contentSourceList is not sent, only&#160;GDS content is returned. You must be provisioned for NDC with both the NDC carrier/s and Travelport to receive NDC&#160;content. For more about NDC, and basic differences between GDS&#160;and NDC in the JSON APIs, see the NDC Guide . Upsell Fares (maxNumberOfUpsellsToReturn) To return upsell fares, send maxNumberOfUpsellsToReturn with a value from 1-4 inclusive. Sending maxNumberOfUpsellsToReturn also returns upsells in any subsequent Next&#160;Leg Search request. Although maxNumberOfUpsellsToReturn accepts values from 0-99, Search and Next Leg Search return a maximum of four upsells. You can use Flight Specific Search to return all upsells filed by the carrier, up to 99. Note the following differences between NDC&#160;and GDS for maxNumberOfUpsellsToReturn: For GDS, if maxNumberOfUpsellsToReturn is either not provided or is sent as 0 , the lowest priced offer is returned (i.e., the base fare). For NDC: If maxNumberOfUpsellsToReturn is not sent, the response returns the lowest priced offer of each available brand or cabin. If maxNumberOfUpsellsToReturn is sent as 0 , the response returns the lowest priced offer (i.e., the base fare). Search and Pricing Modifiers The Search API supports optional journey and pricing modifiers that allow you to set conditions on the itineraries to search for. You can send multiple modifiers in the same request. See the Search API&#160;Reference for details and supported values and formats. Pricing modifiers refine the basic search based on fare and ticketing options and are sent in the PricingModifiersAir object: Fare type: Request specific fare types including private fares (negotiated), public fares (published), or net fares (consolidator fares, or any negotiated wholesale price that is further marked up for sale to customers). Fare restrictions: Include or exclude fares that require an advance purchase, min/max stay, or that are non-refundable. Account codes: Send your account code/corporate ID for each airline to return negotiated fares for those airlines. Currency override: Change the default currency of results, which is set in your PCC provided upon provisioning with Travelport. Sale and ticketing location: Return fares based on the sell and/or ticket location. Journey modifiers refine the search based on elements of the air travel itself, such as carriers, cabin classes, and/or connection times. Journey modifiers are sent in the SearchModifiersAir object: Carrier preferences: Permit only, prohibit, or prefer (weight towards) one or more airlines. Cabin Preferences: Permit only, prohibit, or prefer (weight towards) a cabin class. Flight type: Preferences around connections and stops. Class of service:&#160;Preferences around class of service to return. Exclude ground transportation:&#160;Do not return ground transportation options. Max connection duration: Do not return options that exceed a specified length of time between flights on the same leg. Max overnight duration: Limit duration of any overnight connection. Prohibit change of airport:&#160;Do not return options that change airport. Return only fares with specified brand key value pairs Limit the fares returned to only fares that include the specified brand attributes in the price. Configure brand attributes returned: Return only information about the specified brand attributes and not return any other brand attributes for those fares. Exclude CAT16 penalties: Whether to return CAT16 change and cancel penalties. Split Ticketing GDS only; not supported for NDC. Split ticketing is available only for customers specifically provisioned for split ticketing. Split ticketing returns one-way outbound and one-way inbound fares in addition to round-trip offers. Split ticket offers are identified with CombinabilityCode j0. If your account is not configured for split ticketing, sending includeSplitPaymentInd returns a response without split ticket offers and a warning message. GDS only, not supported for NDC . The Search Split Ticketing feature returns one-way outbound and one-way inbound fares in addition to round-trip options. This may result in lower fares than the same or similar round-trip itinerary. Note that the Split Ticketing Search response may return only the one-way outbound and one-way inbound fares, or only the round-trip fares. This can happen when there is no flight availability or available fares for one-ways or round trips. To request split ticketing, send PricingModifiersAir/ includeSplitPaymentInd =true . By default, Search divides the response into 34% round-trip offerings and the remainder as outbound and inbound one-way fares. To change this percentage, send PricingModifiersAir/SplitPaymentOfferings with the requested percentage. The Search response returns offers in the following order: Outbound one-way offers Inbound one-way offers Round trip offers The response identifies the one-way outbound and inbound offers with the CombinabilityCode value j0 . The round-trip offers are identified with CombinabilityCode values starting with j1 and incremented by one. The following are in scope for split ticketing: Search requests GDS content Round trip journey-based offerings (CustomResponseModifiersAir/SearchRepresentation is not sent or is sent with value Journey ) Upsells The following are not supported for split ticketing: Next Leg Search and Flight Specific Search One way, circle trip, open jaw, and multiple origin/destination search Round trip leg-based offerings Virtual interlining NDC content Premium Flex Search For any search requests for the above scenarios that also send includeSplitPaymentInd set to true , Search ignores the split ticketing indicator, returns a normal Search response, and returns in the Result object the warning message Split Ticketing is not supported and has been ignored. Premium&#160;Flex Search GDS only; not supported for NDC. Available only to specifically provisioned customers; contact your account representative for more information. Premium Flex Search provides flexibility around search dates and PCCs as follows: Premium Flex Search point of sale (POS): In the Search request, send PricingModifiersAir/MultiPricingAgency with up to three PCCs to search in addition to the provisioned PCC. PCCs must be a branch agency provisioned with access for the requested PCC. The flex search options sent in Search carry over to any subsequent Next Leg Search request. Premium Flex Search dates: In the Search request, send SearchCriteriaFlight/daysBeforeDeparture and/or /daysAfterDeparture with the value/s 1, 2, or 3 to search up to that number of days before and/or after the departure date. The flex search options sent in Search carry over to any subsequent Next Leg Search and Flight Specific Search reference payload request. When sending flex search requests, append /premiumflex to the existing Search API endpoint. Scope and support: GDS only; not supported for NDC. Not supported for split ticketing or sorting. Only one flex search capability can be sent in a request (either dates or PCC but not both). Supported in the Search API for journey- and leg-based searches for one and two O&amp;Ds; three or more O&amp;Ds are out of scope. Any flex options sent in the Search request carry over to any subsequent Next Leg Search and Flight Specific Search reference payload requests. Flight Specific Search supports Flex Search POS for both the reference and full payload. Neither payload supports Flex Search Dates. Aggregated and Streamed Responses The Accept header value controls the format of the response; see Common Headers for details: for aggregated content (all offers are combined into a single CatalogProductOfferingsResponse object), send with the value application/json for streamed content (multiple CatalogProductOfferingsResponse objects are returned consecutively) send with the value application/stream+json Numbering Formats in References for Aggregated Content For aggregated content for both flex POS and dates, a single CatalogProductOfferingsResponse object contains offers departing on different dates or offers for different PCCs. To identify offers by dates or POS, the internal IDs in flex search responses have been updated with the letter f and a number: offer ids: f1o1, f1o2, and so on in the first offer, f2o1, f2o2 and so on in the second offer, etc. Do not assume that CatalogProductOffering/id values follow a sequential pattern (e.g., f1, f2, f3) in aggregated flex search responses. Implementations must not rely on this ordering when consuming the data. CombinabilityCode: f1j0, f1j1 and so on in the first offer, f2j0, f2j1, and so on in the second offer. ProductRef: f1p0, f1p1, and so on in the first offer, f2p0, f2p1, and so on in the second offer. BrandRef: f1b0, f1b1, and so on in the first offer, f2b0, f2b1 and so on in the second offer. flightRef: f1s1, f1s2, and so on in the first offer, f2s1, f2s2, and so on in the second offer. TermsAndConditionsRef: f1T0, f1T1, and so on in the first offer, f2T0, f2T1,and so on in for the second offer. For streamed content for both flex POS and dates, offers are separated into individual CatalogProductOfferingsResponse objects. Each CatalogProductOfferingsResponse contains offers for only one PCC&#160;or one date, so the f x numbering format is not used in streamed content. Flex Search Point of Sale (POS) Flex Search Point of Sale (POS)&#160;allows you to expand your offer options for customers based on the point of sale of your branch agencies. The response returns offers in geographic locations for up to three PCCs Pseudo city code. A travel provider's identification code for the APIs, provisioned from Travelport. Used to determine access and other settings in the APIs for your company. sent in PricingModifiersAir/MultiPricingAgency. In the response, each offer returns its corresponding PCC in ReferenceListTermsAndConditions/TermsAndConditions @TermsAndConditionsAir/Pricing Agency. Show Example Flex Search Point of Sale (PCC) request { "CatalogProductOfferingsQueryRequest": { "CatalogProductOfferingsRequest": { "@type": "CatalogProductOfferingsRequestAir", "contentSourceList": [ "GDS" ], "maxNumberOfUpsellsToReturn": 0, "PassengerCriteria": [ { "@type": "PassengerCriteria", "number": 1, "passengerTypeCode": "ADT" }, { "@type": "PassengerCriteria", "number": 1, "passengerTypeCode": "CHD" } ], "SearchCriteriaFlight": [ { "@type": "SearchCriteriaFlight", "departureDate": "2026-04-15", "From": { "value": "MOW" }, "To": { "value": "DXB" } } ], "PricingModifiersAir": { "@type": "PricingModifiersAir", "fareSelection": { "@type": "FareSelectionDetail", "fareType": "PrivateFaresOnly" }, "MultiPricingAgency": [ "DU7", "EA9" ] }, "CustomResponseModifiersAir": { "SearchRepresentation": "Journey", "includeFareCalculationInd": false } } } } The following example shows the high-level structure of a streamed response to a flex POS request. All major objects except for instance of CatalogProductOffering have been replaced with ... to emphasize the overall structure of returning multiple CatalogProductOfferingsResponse objects. For the one offer shown below, the corresponding ReferenceListTermsAndConditions returns PricingAgency with the PCC for that offer. Show Example flex POS response - streamed { "CatalogProductOfferingsResponse": { "@type": "CatalogProductOfferingsResponse", "transactionId": "flex01_ef8610048c354e250dcc911d46c5e80f", "traceId": "TraceID|dl*", "CatalogProductOfferings": { "@type": "CatalogProductOfferings", "CatalogProductOffering": [ {...}, {...} ] }, "Result": {...}, "ReferenceList": [...] } }{ "CatalogProductOfferingsResponse": { "@type": "CatalogProductOfferingsResponse", "transactionId": "flex00_ef8610048c354e250dcc911d46c5e80f", "traceId": "TraceID|dl*", "CatalogProductOfferings": { "@type": "CatalogProductOfferings", "CatalogProductOffering": [ {...}, { "@type": "CatalogProductOffering", "sequence": 1, "id": "o2", "Departure": "DME", "Arrival": "DXB", "Brand": [ { "@type": "BrandID", "BrandRef": "b0" } ], "ProductBrandOptions": [ { "@type": "ProductBrandOptions", "flightRefs": [ "s1", "s2" ], "ProductBrandOffering": [ { "@type": "ProductBrandOffering", "Brand": { "@type": "BrandID", "BrandRef": "b0" }, "Product": [ { "@type": "ProductID", "productRef": "p1" } ], "TermsAndConditions": { "@type": "TermsAndConditionsID", "termsAndConditionsRef": "T1" }, "CombinabilityCode": [ "j2" ], "BestCombinablePrice": {...}, "ContentSource": "GDS" } ] }, {...} ] } ] }, "Result": { "@type": "Result" }, "ReferenceList": [ { "@type": "ReferenceListFlight", "Flight": [...] }, { "@type": "ReferenceListProduct", "Product": [...] }, { "@type": "ReferenceListBrand", "Brand": [...] }, { "@type": "ReferenceListTermsAndConditions", "TermsAndConditions": [ { "@type": "TermsAndConditionsAir", "id": "T1", "BaggageAllowance": [...], "ValidatingAirline": [...], "TicketingAgency": [...], "PaymentTimeLimit": "2026-04-15T23:59:00Z", "Penalties": [...], "TourCodes": [...], "PricingAgency": [ { "@type": "PricingAgency", "Code": "DU7" } ] }, {...} ] } ] } } Flex Search Dates Flex Search Dates&#160;allows you to return offers for a range of dates around the specified departure date. In the request, in either or both daysBeforeDeparture and/or daysAfterDeparture in each instance of SearchCriteriaFlight, send the value 1, 2, or 3 to specify that many days to search before and/or after the date in departureDate. Show Example Flex Search Dates request { "CatalogProductOfferingsQueryRequest": { "CatalogProductOfferingsRequest": { "@type": "CatalogProductOfferingsRequestAir", "contentSourceList": [ "GDS" ], "maxNumberOfUpsellsToReturn": 4, "PassengerCriteria": [ { "number": 1, "passengerTypeCode": "ADT" } ], "SearchCriteriaFlight": [ { "departureDate": "2026-02-09", "daysBeforeDeparture": 1, "daysAfterDeparture": 2, "From": { "value": "PEN" }, "To": { "value": "MEL" } }, { "departureDate": "2026-02-18", "daysBeforeDeparture": 2, "daysAfterDeparture": 1, "From": { "value": "MEL" }, "To": { "value": "PEN" } } ] } } } The following example shows an aggregated response to a flex search dates request. For brevity, only two offers are shown, and the Result and ReferenceList objects have been replaced with ... to show the overall structure. For aggregated content for a leg-based search, per below, each offer returns FlexNextLeg to identify the return date of the product (the next leg) that is combinable with the outbound product at the price and terms and conditions in that offer. Show Example flex dates response - aggregated { "CatalogProductOfferingsResponse": { "@type": "CatalogProductOfferingsResponse", "transactionId": "d35b3ec7-37ae-412c-aef3-023900cff67b", "CatalogProductOfferings": { "@type": "CatalogProductOfferings", "Identifier": { "value": "20586926-b2da-4cfa-9672-877a05378d8b" }, "CatalogProductOffering": [ { "@type": "CatalogProductOffering", "sequence": 1, "id": "f1o1", "Departure": "NRT", "Arrival": "BKK", "FlexNextLeg": [ { "@type": "FlexNextLeg", "departureDate": "2026-03-27" } ], "Brand": [ { "@type": "BrandID", "BrandRef": "f1b0" }, { "@type": "BrandID", "BrandRef": "f1b1" } ], "ProductBrandOptions": [ { "@type": "ProductBrandOptions", "flightRefs": [ "f1s18" ], "ProductBrandOffering": [ { "@type": "ProductBrandOffering", "Brand": { "@type": "BrandID", "BrandRef": "f1b0" }, "Product": [ { "@type": "ProductID", "productRef": "f1p0" } ], "TermsAndConditions": { "@type": "TermsAndConditionsID", "termsAndConditionsRef": "f1T0" }, "CombinabilityCode": [ "f1j1" ], "BestCombinablePrice": { "@type": "BestCombinablePriceDetail", "CurrencyCode": { "decimalPlace": 0, "value": "RUB" }, "Base": 20450, "TotalTaxes": 8978, "TotalFees": 0, "TotalPrice": 29428, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 0, "value": "RUB" }, "Base": 20450, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 8978, "Tax": [...] }, "Fees": { "@type": "FeesDetail", "TotalFees": 0 }, "Total": 29428 } } ] }, "ContentSource": "GDS" }, { "@type": "ProductBrandOffering", "Brand": { "@type": "BrandID", "BrandRef": "f1b1" }, "Product": [ { "@type": "ProductID", "productRef": "f1p1" } ], "TermsAndConditions": { "@type": "TermsAndConditionsID", "termsAndConditionsRef": "f1T1" }, "CombinabilityCode": [ "f1j2" ], "BestCombinablePrice": { "@type": "BestCombinablePriceDetail", "CurrencyCode": { "decimalPlace": 0, "value": "RUB" }, "Base": 132865, "TotalTaxes": 8978, "TotalFees": 0, "TotalPrice": 141843, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 0, "value": "RUB" }, "Base": 132865, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 8978, "Tax": [...] }, "Fees": { "@type": "FeesDetail", "TotalFees": 0 }, "Total": 141843 } } ] }, "ContentSource": "GDS" } ] } ] }, { "@type": "CatalogProductOffering", "sequence": 1, "id": "f1o3", "Departure": "NRT", "Arrival": "BKK", "FlexNextLeg": [ { "@type": "FlexNextLeg", "departureDate": "2026-03-27" } ], "Brand": [ { "@type": "BrandID", "BrandRef": "f1b2" }, { "@type": "BrandID", "BrandRef": "f1b3" }, { "@type": "BrandID", "BrandRef": "f1b4" }, { "@type": "BrandID", "BrandRef": "f1b5" }, { "@type": "BrandID", "BrandRef": "f1b6" }, { "@type": "BrandID", "BrandRef": "f1b7" }, { "@type": "BrandID", "BrandRef": "f1b8" }, { "@type": "BrandID", "BrandRef": "f1b9" }, { "@type": "BrandID", "BrandRef": "f1b10" }, { "@type": "BrandID", "BrandRef": "f1b11" }, { "@type": "BrandID", "BrandRef": "f1b12" }, { "@type": "BrandID", "BrandRef": "f1b13" }, { "@type": "BrandID", "BrandRef": "f1b14" }, { "@type": "BrandID", "BrandRef": "f1b15" }, { "@type": "BrandID", "BrandRef": "f1b16" }, { "@type": "BrandID", "BrandRef": "f1b17" }, { "@type": "BrandID", "BrandRef": "f1b18" }, { "@type": "BrandID", "BrandRef": "f1b19" }, { "@type": "BrandID", "BrandRef": "f1b20" }, { "@type": "BrandID", "BrandRef": "f1b21" }, { "@type": "BrandID", "BrandRef": "f1b22" } ], "ProductBrandOptions": [ { "@type": "ProductBrandOptions", "flightRefs": [ "f1s19" ], "ProductBrandOffering": [ { "@type": "ProductBrandOffering", "Brand": { "@type": "BrandID", "BrandRef": "f1b2" }, "Product": [ { "@type": "ProductID", "productRef": "f1p4" } ], "TermsAndConditions": { "@type": "TermsAndConditionsID", "termsAndConditionsRef": "f1T4" }, "CombinabilityCode": [ "f1j3" ], "BestCombinablePrice": { "@type": "BestCombinablePriceDetail", "CurrencyCode": { "decimalPlace": 0, "value": "RUB" }, "Base": 23040, "TotalTaxes": 8338, "TotalFees": 0, "TotalPrice": 31378, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 0, "value": "RUB" }, "Base": 23040, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 8338, "Tax": [...] }, "Fees": { "@type": "FeesDetail", "TotalFees": 0 }, "Total": 31378 } } ] }, "ContentSource": "GDS" } ] } ] }] }, "Result": {...}, "ReferenceList": [...] } } Next Leg Search API If you request a leg-based search , the Search response returns offers for only the outbound leg of the itinerary. You must then use the Next Leg Search API to return offers for the next leg of the trip. Note that any applicable modifiers or indicators sent in the Search request carry over to the Next Leg Search request and are not re-sent. Next Leg Search Request The Next Leg Search request sends a payload with several identifiers from the preceding Search response:&#160;an identifier for the search response as a whole, plus identifiers for the offer and product you want to select from that search result for the first leg of the trip. Next Leg Search uses the itinerary details and any modifiers sent in the initial Search request to return offers for the next leg of the itinerary. Multi-city Itineraries For a multi-city itinerary, send a Search request for the first leg, a Next Leg Search for the second leg, and another Next Leg Search request for the third leg. In this case, for the second Next Leg Search request, send identifiers from the preceding Next Leg Search request instead of the Search request. GDS supports searching for up to six O&amp;D&#160;pairs (legs of the itinerary) while three are supported for NDC. For example, a search for an itinerary from DEN &gt;&#160;LAX, LAX &gt; ATL, and ATL &gt; DEN would use this workflow: Leg-based Search request with one instance of SearchCriteriaFlight for DEN &gt;&#160;LAX. Next Leg Search request for LAX &gt; ATL that sends identifiers for the response, selected offer, and selected product from the Search response from step 1. Next Leg Search request for ATL &gt; DEN that sends identifiers for the response, selected offer, and selected product from the Next Leg Search response from step 2. Next Leg Search Response The Next Leg Search response returns offers that can be combined with the offer and product selected for the preceding leg of the itinerary and sent in the Next Leg Search request. The responses for Search, Next Leg Search, and Flight Specific Search share the same structure per Search Responses below. In the Next Leg Search response, the first instance of CatalogProductOffering is the offer and product sent in the Next&#160;Leg Search request. This is the selected offer and product for the first leg. This first instance of CatalogProductOffering does not return upsells, as the leg and fare have already been selected. Each instance of CatalogProductOffering with ids o2 and higher may return multiple brands, if upsells were requested in the Search request. Usually the first instance is the lowest fare and additional instances are the available upsell fares. The Next Leg Search response includes combinability codes , which should be ignored. The selected offer and product for the first leg is combinable with each instance of CatalogProductOffering with ids o2 and higher. After all instances of CatalogProductOffering, a ReferenceList object consolidates details across all itineraries using the same structure as in the Search response. Flight Specific Search API GDS&#160;only, not supported for NDC. The Flight Specific Search API retrieves additional filed fares for any selected offer and product in a preceding Search or Next Leg Search response. (Search and Next Leg Search return a maximum of 4 upsells for an offer.) Flight Specific Search Request The Flight Specific Search request can be sent as either: a reference payload request that sends an identifier for a preceding response, plus identifiers for the offer and the product/s to return additional upsells for. a full payload request , which sends all itinerary details without a reference to a preceding search response. In the request, set maximumNumberOfUpsellsToReturn up to the maximum allowable value of 99 (effectively, all upsells filed) to return additional filed fares for that product. Flight Specific Search Response The responses for Search, Next Leg Search, and Flight Specific Search share the same structure per Search Responses below. Search Responses (all Search APIs) The Search, Next Leg Search, and Flight Specific Search responses use the same structure and return the following primary objects: CatalogProductOfferings: Information about the offers available for each leg. Each offer includes a price, and reference numbers for the product, brand, and terms and conditions in that offer available at that price. ReferenceList : Details about the flights, products, brands, and terms and conditions that make up each offer. Result : Any error or warning messages (not represented in the diagram below). Key points for all search API responses: Responses consolidate common details into the ReferenceList object to reduce response time: Multiple offers are likely to include the same flights, products, terms and conditions, and brands in various combinations. Instead of repeating all details in every offer, the offer instead returns a price at which a specific product is available for a specific brand at a set of terms and conditions. A product is a flight or connecting flights and an associated service level. Each offer returns cross references to the product, brand, and terms and conditions that make up that offer. Products return cross-reference to the flights included that product. These references match to the flights, products, terms and conditions, and brands in ReferenceList. For more about offers and the Search response structure, see Offers in the JSON APIs in the JSON Air APIs Guide. Responses always return details about branded fares , if filed by the airline. Responses include combinability details for the product combinations create the lowest fare possible for that combination. Responses return upsells if requested with maxNumberOfUpsellsToReturn . NDC&#160;content is returned only if requested with contentSourceList . CombinabilityCode and BestCombinablePrice To assist in combining products for round-trip and multi-city itineraries (a product is one leg of the itinerary), the Search response returns for each product a CombinabilityCode that identifies which products combine for the lowest price available. This lowest price is returned in BestCombinablePrice. For example, on a round-trip search, if product p6 on the outbound leg and product p24 on the inbound leg both have a CombinabilityCode value of j2, you can select these two products for the price returned in BestCombinablePrice, which lists the base fare, taxes, and total price for the combined itinerary. If more than two products have the same CombinabilityCode value, then any outbound/inbound combination of those products are available at the same price. CombinabilityCode formats start with the letter j and a number, as in j1 , j2 , and so on.&#160;Exceptions are as follows: Per Multi-city Offers with Stopovers below, the letter c is added to CombinabilityCode formats to identify multi-city offers with a stopover, as in jc1 , jc2 , and so on. In the response for any type of Premium Flex Search , CombinabilityCode values start with the letter f and a number, as in f1j0 , f1j1 , and so on. One-way responses return CombinabilityCode for consistency but this data has no use and should be ignored. The price in BestCombinablePrice applies to the one-way itinerary. Show Example Response excerpt with combinability details In this example excerpt, product p5 can be combined with any other product that has a CombinabilityCode of j2 for the lowest available price of 1344 HKD. "Brand": { "@type": "Brand", "BrandRef": "b0" }, "Product": [ { "@type": "Product", "productRef": "p5" } ], "TermsAndConditions": { "@type": "TermsAndConditionsAir", "termsAndConditionsRef": "T3" }, "CombinabilityCode": [ "j2" ], "BestCombinablePrice": { "@type": "BestCombinablePriceDetail", "CurrencyCode": { "decimalPlace": 0, "value": "HKD" }, "Base": 1040, "TotalTaxes": 304, "TotalPrice": 1344, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "CurrencyCode": { "decimalPlace": 0, "value": "HKD" }, "Base": 1040, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 304, "Tax": [ { "taxCode": "AY", "value": 88 }, { "taxCode": "US", "value": 78 }, { "taxCode": "XF", "value": 70 }, { "taxCode": "ZP", "value": 68 } ] }, "Total": 1344 } } ] } } ] ... Multi-city Offers with Stopovers (price details in BestCombinablePrice only) For both GDS and NDC content in all search responses, ProductBrandOffering no longer returns the Price object. All customers must update their code to validate pricing in ProductBrandOffering/BestCombinablePrice, not Price. You can opt out of this change by contacting your Travelport representative. If so, multi-city offers with stopovers will not be returned for your PCC, and all offers will continue to return both Price and BestCombinablePrice. With Air Offer 25.11.51.3 and later, for GDS&#160;only, all search responses support returning multi-city offers with stopovers when available. This enables the return of lower fares and additional itinerary options. Such multi-city offers are identified by CombinabilityCode values using the new format jc instead of j , as in jc1, jc2, and so on. For example, if a traveler wants to fly from BRU &gt; NYC &gt; SFO &gt; BRU, the request has three legs: BRU &gt; NYC, followed by NYC &gt; SFO, and ending with SFO &gt; BRU. An example multi-city with a stopover would be a round trip fare BRU &gt; SFO &gt; BRU with a stopover in NYC. As part of this change, all offers in all search responses no longer return price details in both ProductBrandOffering/Price and ProductBrandOffering/BestCombinablePrice. Instead, ProductBrandOffering returns pricing only in BestCombinablePrice, and no longer returns the Price object. This applies to all Search, Next Leg Search, and Flight Specific Search responses. Although multi-city offers are not returned for split ticketing, ProductBrandOffering/Price has also been removed from split ticketing offers. Although multi-city offers with stopovers are not supported for NDC, ProductBrandOffering/Price has also been removed from NDC offers. To summarize, for all offers in all search responses: The Price object is no longer returned (ProductBrandOffering/ Price ). The BestCombinablePrice object continues to return pricing information for the offer (ProductBrandOffering/ BestCombinablePrice ). The structure of BestCombinablePrice is unchanged. For GDS only, multi-city offers with stopovers are returned when available. BestCombinablePrice returns surcharges and commission amounts when applicable in the Surcharges and Commission objects; these are for the entire journey. For all other offers, the surcharges and commission amounts are for each leg (origin and destination pair) of the journey. A multi-city offer can be identified by the jc in its CombinabilityCode: jc1 , jc2 , and so on. The CombinabilityCode for other offers starts with only j , as in j1 , j2 , and so on. Show Example ProductBrandOffering format All search responses return offers in the following format with Air Offer 25.11.51.3 and later. ...{ "@type": "ProductBrandOffering", "Brand": { "@type": "BrandID", "BrandRef": "b0" }, "Product": [ { "@type": "ProductID", "productRef": "p0" } ], "TermsAndConditions": { "@type": "TermsAndConditionsID", "termsAndConditionsRef": "T0" }, "CombinabilityCode": [ "jc1" ], "BestCombinablePrice": { "@type": "BestCombinablePriceDetail", "CurrencyCode": { "decimalPlace": 0, "value": "HKD" }, "Base": 12920, "TotalTaxes": 720, "TotalFees": 0, "TotalPrice": 13640, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 0, "value": "HKD" }, "Base": 12920, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 720, "Tax": [ { "taxCode": "JD", "value": 178 }, { "taxCode": "OG", "value": 6 }, { "taxCode": "QV", "value": 31 }, { "taxCode": "DY", "value": 117 }, { "taxCode": "HW", "value": 388 } ] }, "Fees": { "@type": "FeesDetail", "TotalFees": 0 }, "Total": 13640 }, "FareCalculation": "MAD LA LIM LA AQP M808.51LLEKM00R /-CUZ LA X/LIM LA MAD M808.51LLEKM00R NUC1617.02END ROE0.915261" } ] } }... Consolidated Details for Products, Flights, Brands, and Terms (ReferenceList) The ReferenceList object consolidates common information across the offers in CatalogProductOffering. ReferenceList is an array that returns one instance each of four types: ReferenceListFlight includes the Flight array. Each instance returns one flight with a&#160;unique internal ID (FlightRef, numbered as in s1 or QFs1 ) and the flight number, carrier, equipment, etc. ReferenceListProduct includes the Product array. Each instance returns one product: A product is the flight/s that make up one leg of an itinerary. Product does not include flight details but does list a FlightRef IDs for each flight in that product. Each Product has a unique internal ID (ProductRef, e.g., p12 or QFp12 ). For each PTC type requested, Product returns the class of service, cabin, fare basis code, and fare type information as well as the brand identifier if it is a branded fare. ReferenceListTermsAndConditions includes the TermsAndConditions array. Each instance returns one set of terms and conditions (T&amp;C): T&amp;C include fare rules, baggage allowance, last date/time to book and ticket, etc. Each has a unique internal ID (TermsAndConditionsRef, e.g., t8 or SQt8. Each set of terms and conditions applies to one or more products. Includes a list of ProductRef ids to which that set of T&amp;C applies. ReferenceListBrand includes the Brand array. Each instance returns details for one brand: Details include brand name, tier (tier not supported for NDC), and brand attributes (such as carry-on baggage, checked baggage, wifi)&#160;and whether each attribute is included in the fare. Unique internal brand identifier (e.g., b44 or AAb44 ). Brand Attributes The Search APIs return brand attributes that describe what is included in the brand. The BrandAttribute object is an array of the classification and inclusion key value pairs. Classification tells you what the feature is, and inclusion tells you whether that feature is available: classification: CarryOn Refund Meals Rebooking CheckedBag SeatAssignment WiFi PremiumSeat LieFlatSeat PersonalItem inclusion: Included: Attribute included at no additional charge. Chargeable: Attribute can be purchased at an additional cost. NotOffered:&#160;Attribute is not available for a flight. See Example Response excerpt for ReferenceListBrand/Brand In this example excerpt for brand id b0, several features are included while rebooking and refunds are available at charge per the terms and conditions. "Brand": [ { "@type": "Brand", "name": "Red eDeal", "tier": 1, "shelfNumbers": [], "id": "b0", "Identifier": { "value": "1125969" }, "BrandAttribute": [ { "@type": "BrandAttribute", "classification": "CarryOn", "inclusion": "Included" }, { "@type": "BrandAttribute", "classification": "Meals", "inclusion": "Included" }, { "@type": "BrandAttribute", "classification": "LieFlatSeat", "inclusion": "Included" }, { "@type": "BrandAttribute", "classification": "PremiumSeat", "inclusion": "Included" }, { "@type": "BrandAttribute", "classification": "SeatAssignment", "inclusion": "Included" }, { "@type": "BrandAttribute", "classification": "Rebooking", "inclusion": "Chargeable" }, { "@type": "BrandAttribute", "classification": "Refund", "inclusion": "Chargeable" } ], In addition to the standard brand attributes above, the following additional brand attributes are returned in Brand/AdditionalBrandAttribute for any brand that has them: ChauffeurTransfer ExtraLegroom InFlightEntertainment LoungeAccess PriorityBaggage PriorityBoarding PriorityCheckIn PrioritySecurity PriorityServices MileageAccrual Upgrades USB The Search API provides modifiers that affect how brands are returned: ProductInclusionPreference: Limits the offerings returned to only fares that include the specified brand attributes. The response also returns information about other brand attributes, which may be included, chargeable, or not offered. GDS&#160;only; not supported for NDC. BrandAttributeInclusion: Returns information about only the specified brand attributes and does not return any other brand attributes for those fares. The specified brand attributes returned may be included, chargeable, or not offered. AdditionalClassification:&#160;Filters out specified additional brand attributes from the response. Show Example Request excerpt for ProductInclusionPreference The following SearchModifiersAir excerpt uses ProductInclusionPreference to request only fares that include a checked bag, seat assignment, and carry-on bag. The response still returns other brand attributes for that fare, which may be included, chargeable, or not offered. ... "SearchModifiersAir": { "@type": "SearchModifiersAir", "ProductInclusionPreference": [ { "Classification": [ "CheckedBag", "SeatAssignment", "CarryOn" ] } ... Merged GDS and NDC Offers (Content Curation Layer) If the response includes offers for the same itinerary at the same price from GDS and NDC sources, Search combines those offers into a single merged offer to avoid duplication. CCL merges offers by comparing flights based on the following: Carrier/airline Flight number/s Fare brand/s Total price including taxes, fees, and surcharges where known A merged offer returns a CatalogProductOffering/id value that combines the standard GDS and NDC id numbers. For example, if a GDS offer that has id 03 is merged with an NDC offer that has id UA_CPO0 , the merged id is 03-UA_CPO0 . Customers must request both GDS and NDC&#160;content with CatalogProductOfferingsRequest/contentSourceList in the request to receive merged offers. Search continues to provide content unique to NDC or GDS as it currently does. Future releases will expand on the above list to include more detailed assessment of attributes and additional business rules to determine what offers should be returned and under what conditions. All search responses for all customers merge duplicate GDS and NDC offers and remove the duplicated offers. If you would like to opt out of this duplication removal feature, in which case your Search responses may contain duplicate GDS and NDC content, contact your Travelport representative. Search Workflows You can combine the Search APIs into various workflows, determined by whether you want more upsells, and whether you want the initial Search to return offers for all legs of the itinerary ( a journey-based search) or only the first leg (a leg-based search). A leg-based search must be followed by a Next&#160;Leg Search to return offers on the subsequent leg of the itinerary. For a leg-based, multi-city itinerary you would send Next Leg Search again for the third leg, and so on for additional legs (not shown below). To set whether the search is journey- or leg-based, send SearchRepresentation with the value Leg for a leg-based search or Journey for a journey-based search. If SearchRepresentation is not sent, the default is a journey-based response. This setting does not apply to one-way searches and is ignored if sent for one-way. To request upsells in the initial Search response, send maxNumberOfUpsellsToReturn to return up to 4 upsells. For more, you can add the Flight&#160;Specific Search API to the workflow. Flight Specific Search is an optional request to return up to 99 upsells (up to as many as the carrier has filed), for any leg The flight or connecting flights between one origin and destination pair. For example, on a round-trip flight, LAX &gt; MSP could be the first leg (aka outbound leg) and MSP &gt; DEN &gt; LAX could be the second leg (aka inbound leg). The APIs use the term product for one leg of the itinerary. or offer In the Search APIs, an offer is a product available at a specific price under a set of terms and conditions. An offer includes the flight or connecting flights for one leg of the itinerary, plus a service level that includes the cabin class and any fare codes that may apply. At booking, the selected offer from the Search response - including the flight/s, service level, price, terms and conditions, and brand if applicable - is converted into a single Offer object that is subsequently returned for that booking. returned in a preceding Search or Next Leg Search. Note that you can send Flight Specific Search any time in the workflow after the initial search, and you can send it multiple times. For example, in the last diagram below, you could send Flight Specific Search after Search, either in addition to or instead of sending it after Next Leg Search. Sending Flight Specific Search after the first search allows you consider upsells before requesting options in your Next Leg Search. Each box in the diagram represents one API call in the workflow. Search Request and Response Layout Diagrams The following overview diagrams illustrates the basic structure of the requests and responses for the search APIs. These diagrams don't include every object that might be returned, and diagrams may not reflect minor updates. For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . For each leg, the search responses combine a flight or connecting flights into a product available at a specific price and terms and conditions - this is called an offer . Be sure to see the detailed discussion of Offers in the JSON APIs to understand the structure of the Search API responses. Search Request Diagram The following diagram shows the high-level objects in the Search request. Next Leg Search Request Diagram The following diagram shows the high-level objects in the Next Leg Search request. Flight Specific Search Request Diagram The following diagram shows the high-level objects in the Flight Specific Search request. Search Response Diagram The following overview diagrams illustrates the basic structure used in all search responses. Differences are noted above in the individual sections for each API. Air Availability API The JSON Air Availability API returns scheduled flights between a specified city pair on a specified day and time and indicates whether seats are available on those flights. This offers corporate accounts a single source of air availability data for GDS content and reduces sell failures at book. The response does not include pricing information. An Air Availability request can be followed by either pricing or booking: To price an itinerary from the Air Availability response before booking, send an AirPrice full payload request. To book an itinerary from the Air Availability response, start a workbench session and use the Add Offer full payload request to add an offer to the workbench. Optionally, you can price or build a manual fare during booking with the AutoPrice/Manual Fares API . The Air Availability request at a minimum requires SearchCriteriaFlight. SearchCriteriaFlight specifies availability details such as departure date and time or arrival date and time, and location of departure and arrival. Best practice when sending an arrival date is to also send the arrival time. Sending both departure date and arrival date is not supported; if an arrival date is sent, the departure date is ignored. Air Availability supports the following optional search modifiers; no other search modifiers and no pricing modifiers are supported: Carrier preferences: Permit only one or more airlines. Preferred and prohibited carrier preferences are not supported. Connection preferences: Permit only or prohibit one or more cities or airports. Sending both permitted and prohibited connection preferences for one Origin and Destination is not supported. Preferred connection preference is not supported. The Air Availability response includes the following information. CatalogProductOfferings: One instance for each leg, including an array of the products available on that leg. ReferenceListFlight: Details for each flight including arrival and departure times, flight number, duration, etc. When applicable, includes the OperationalStatus of the flight (Flight Cancelled, FlightDeparted, FlightPastScheduledDeparture, FlightBoarding, NotAvailableUseSearch). ReferenceListProduct: Details for each product. Includes ClassOfServiceAvailability, which defines the class of service, the number of seats available for the class of service, and the status of the class of service (e.g., Available). If there are no seats available for a class of service, the status can be Not Available, Request, Waitlist, Waitlist Closed. Additional information: Not supported for NDC content. Not supported for low cost carriers such as 6E (IndiGo) and FR (Ryan Air). When availability for a direct flight making one or more stops between the origin and destination is returned, the Air Availability response returns FlightDetail/stops with the number of stops. Air Availability does not return IntermediateStop as does Search. Caching is not supported. All subsequent requests for offers returned in Air Availability must be full payload requests. When no classes of service are returned for a flight, or the flight status is unknown, the response returns OperationalStatus with the value NotAvailableUseSearch . Sending departureTime or arrivalTime with "00:00:00" is not supported. An error is returned. &#160;

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
 "CatalogProductOfferingsQueryRequest": {
  "CatalogProductOfferingsRequest": {
   "@type": "CatalogProductOfferingsRequestAir",
   "contentSourceList": [
    "GDS"
   ],
   "maxNumberOfUpsellsToReturn": 0,
   "PassengerCriteria": [
    {
     "@type": "PassengerCriteria",
     "number": 1,
     "passengerTypeCode": "ADT"
    },
    {
     "@type": "PassengerCriteria",
     "number": 1,
     "passengerTypeCode": "CHD"
    }
   ],
   "SearchCriteriaFlight": [
    {
     "@type": "SearchCriteriaFlight",
     "departureDate": "2026-04-15",
     "From": {
      "value": "MOW"
     },
     "To": {
      "value": "DXB"
     }
    }
   ],
   "PricingModifiersAir": {
    "@type": "PricingModifiersAir",
    "fareSelection": {
     "@type": "FareSelectionDetail",
     "fareType": "PrivateFaresOnly"
    },
    "MultiPricingAgency": [
     "DU7",
     "EA9"
    ]
   },
   "CustomResponseModifiersAir": {
    "SearchRepresentation": "Journey",
    "includeFareCalculationInd": false
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
        "transactionId": "flex01_ef8610048c354e250dcc911d46c5e80f",
        "traceId": "TraceID|dl*",
        "CatalogProductOfferings": {
            "@type": "CatalogProductOfferings",
            "CatalogProductOffering": [
                {...},
                {...}
            ]
        },
        "Result": {...},
        "ReferenceList": [...]
    }
}{
    "CatalogProductOfferingsResponse": {
        "@type": "CatalogProductOfferingsResponse",
        "transactionId": "flex00_ef8610048c354e250dcc911d46c5e80f",
        "traceId": "TraceID|dl*",
        "CatalogProductOfferings": {
            "@type": "CatalogProductOfferings",
            "CatalogProductOffering": [
                {...},
                {
                    "@type": "CatalogProductOffering",
                    "sequence": 1,
                    "id": "o2",
                    "Departure": "DME",
                    "Arrival": "DXB",
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
                                "s1",
                                "s2"
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
                                            "productRef": "p1"
                                        }
                                    ],
                                    "TermsAndConditions": {
                                        "@type": "TermsAndConditionsID",
                                        "termsAndConditionsRef": "T1"
                                    },
                                    "CombinabilityCode": [
                                        "j2"
                                    ],
                                    "BestCombinablePrice": {...},
                                    "ContentSource": "GDS"
                                }
                            ]
                        },
                        {...}
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
                "Flight": [...]
            },
            {
                "@type": "ReferenceListProduct",
                "Product": [...]
            },
            {
                "@type": "ReferenceListBrand",
                "Brand": [...]
            },
            {
                "@type": "ReferenceListTermsAndConditions",
                "TermsAndConditions": [
                    {
                        "@type": "TermsAndConditionsAir",
                        "id": "T1",
                        "BaggageAllowance": [...],
                        "ValidatingAirline": [...],
                        "TicketingAgency": [...],
                        "PaymentTimeLimit": "2026-04-15T23:59:00Z",
                        "Penalties": [...],
                        "TourCodes": [...],
                        "PricingAgency": [
                            {
                                "@type": "PricingAgency",
                                "Code": "DU7"
                            }
                        ]
                    },
                    {...}
                ]
            }
        ]
    }
}
```

### Block 3

```
{
 "CatalogProductOfferingsQueryRequest": {
  "CatalogProductOfferingsRequest": {
   "@type": "CatalogProductOfferingsRequestAir",
   "contentSourceList": [
    "GDS"
   ],
   "maxNumberOfUpsellsToReturn": 4,
   "PassengerCriteria": [
    {
     "number": 1,
     "passengerTypeCode": "ADT"
    }
   ],
   "SearchCriteriaFlight": [
    {
     "departureDate": "2026-02-09",
     "daysBeforeDeparture": 1,
     "daysAfterDeparture": 2,
     "From": {
      "value": "PEN"
     },
     "To": {
      "value": "MEL"
     }
    },
    {
     "departureDate": "2026-02-18",
     "daysBeforeDeparture": 2,
     "daysAfterDeparture": 1,
     "From": {
      "value": "MEL"
     },
     "To": {
      "value": "PEN"
     }
    }
   ]
  }
 }
}
```

### Block 4

```
{
 "CatalogProductOfferingsResponse": {
  "@type": "CatalogProductOfferingsResponse",
  "transactionId": "d35b3ec7-37ae-412c-aef3-023900cff67b",
  "CatalogProductOfferings": {
   "@type": "CatalogProductOfferings",
   "Identifier": {
    "value": "20586926-b2da-4cfa-9672-877a05378d8b"
   },
   "CatalogProductOffering": [
    {
     "@type": "CatalogProductOffering",
     "sequence": 1,
     "id": "f1o1",
     "Departure": "NRT",
     "Arrival": "BKK",
     "FlexNextLeg": [
      {
       "@type": "FlexNextLeg",
       "departureDate": "2026-03-27"
      }
     ],
     "Brand": [
      {
       "@type": "BrandID",
       "BrandRef": "f1b0"
      },
      {
       "@type": "BrandID",
       "BrandRef": "f1b1"
      }
     ],
     "ProductBrandOptions": [
      {
       "@type": "ProductBrandOptions",
       "flightRefs": [
        "f1s18"
       ],
       "ProductBrandOffering": [
        {
         "@type": "ProductBrandOffering",
         "Brand": {
          "@type": "BrandID",
          "BrandRef": "f1b0"
         },
         "Product": [
          {
           "@type": "ProductID",
           "productRef": "f1p0"
          }
         ],
         "TermsAndConditions": {
          "@type": "TermsAndConditionsID",
          "termsAndConditionsRef": "f1T0"
         },
         "CombinabilityCode": [
          "f1j1"
         ],
         "BestCombinablePrice": {
          "@type": "BestCombinablePriceDetail",
          "CurrencyCode": {
           "decimalPlace": 0,
           "value": "RUB"
          },
          "Base": 20450,
          "TotalTaxes": 8978,
          "TotalFees": 0,
          "TotalPrice": 29428,
          "PriceBreakdown": [
           {
            "@type": "PriceBreakdownAir",
            "quantity": 1,
            "requestedPassengerType": "ADT",
            "Amount": {
             "@type": "Amount",
             "CurrencyCode": {
              "decimalPlace": 0,
              "value": "RUB"
             },
             "Base": 20450,
             "Taxes": {
              "@type": "TaxesDetail",
              "TotalTaxes": 8978,
              "Tax": [...]
             },
             "Fees": {
              "@type": "FeesDetail",
              "TotalFees": 0
             },
             "Total": 29428
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
          "BrandRef": "f1b1"
         },
         "Product": [
          {
           "@type": "ProductID",
           "productRef": "f1p1"
          }
         ],
         "TermsAndConditions": {
          "@type": "TermsAndConditionsID",
          "termsAndConditionsRef": "f1T1"
         },
         "CombinabilityCode": [
          "f1j2"
         ],
         "BestCombinablePrice": {
          "@type": "BestCombinablePriceDetail",
          "CurrencyCode": {
           "decimalPlace": 0,
           "value": "RUB"
          },
          "Base": 132865,
          "TotalTaxes": 8978,
          "TotalFees": 0,
          "TotalPrice": 141843,
          "PriceBreakdown": [
           {
            "@type": "PriceBreakdownAir",
            "quantity": 1,
            "requestedPassengerType": "ADT",
            "Amount": {
             "@type": "Amount",
             "CurrencyCode": {
              "decimalPlace": 0,
              "value": "RUB"
             },
             "Base": 132865,
             "Taxes": {
              "@type": "TaxesDetail",
              "TotalTaxes": 8978,
              "Tax": [...]
             },
             "Fees": {
              "@type": "FeesDetail",
              "TotalFees": 0
             },
             "Total": 141843
            }
           }
          ]
         },
         "ContentSource": "GDS"
        }
       ]
      }
     ]
    },
    {
     "@type": "CatalogProductOffering",
     "sequence": 1,
     "id": "f1o3",
     "Departure": "NRT",
     "Arrival": "BKK",
     "FlexNextLeg": [
      {
       "@type": "FlexNextLeg",
       "departureDate": "2026-03-27"
      }
     ],
     "Brand": [
      {
       "@type": "BrandID",
       "BrandRef": "f1b2"
      },
      {
       "@type": "BrandID",
       "BrandRef": "f1b3"
      },
      {
       "@type": "BrandID",
       "BrandRef": "f1b4"
      },
      {
       "@type": "BrandID",
       "BrandRef": "f1b5"
      },
      {
       "@type": "BrandID",
       "BrandRef": "f1b6"
      },
      {
       "@type": "BrandID",
       "BrandRef": "f1b7"
      },
      {
       "@type": "BrandID",
       "BrandRef": "f1b8"
      },
      {
       "@type": "BrandID",
       "BrandRef": "f1b9"
      },
      {
       "@type": "BrandID",
       "BrandRef": "f1b10"
      },
      {
       "@type": "BrandID",
       "BrandRef": "f1b11"
      },
      {
       "@type": "BrandID",
       "BrandRef": "f1b12"
      },
      {
       "@type": "BrandID",
       "BrandRef": "f1b13"
      },
      {
       "@type": "BrandID",
       "BrandRef": "f1b14"
      },
      {
       "@type": "BrandID",
       "BrandRef": "f1b15"
      },
      {
       "@type": "BrandID",
       "BrandRef": "f1b16"
      },
      {
       "@type": "BrandID",
       "BrandRef": "f1b17"
      },
      {
       "@type": "BrandID",
       "BrandRef": "f1b18"
      },
      {
       "@type": "BrandID",
       "BrandRef": "f1b19"
      },
      {
       "@type": "BrandID",
       "BrandRef": "f1b20"
      },
      {
       "@type": "BrandID",
       "BrandRef": "f1b21"
      },
      {
       "@type": "BrandID",
       "BrandRef": "f1b22"
      }
     ],
     "ProductBrandOptions": [
      {
       "@type": "ProductBrandOptions",
       "flightRefs": [
        "f1s19"
       ],
       "ProductBrandOffering": [
        {
         "@type": "ProductBrandOffering",
         "Brand": {
          "@type": "BrandID",
          "BrandRef": "f1b2"
         },
         "Product": [
          {
           "@type": "ProductID",
           "productRef": "f1p4"
          }
         ],
         "TermsAndConditions": {
          "@type": "TermsAndConditionsID",
          "termsAndConditionsRef": "f1T4"
         },
         "CombinabilityCode": [
          "f1j3"
         ],
         "BestCombinablePrice": {
          "@type": "BestCombinablePriceDetail",
          "CurrencyCode": {
           "decimalPlace": 0,
           "value": "RUB"
          },
          "Base": 23040,
          "TotalTaxes": 8338,
          "TotalFees": 0,
          "TotalPrice": 31378,
          "PriceBreakdown": [
           {
            "@type": "PriceBreakdownAir",
            "quantity": 1,
            "requestedPassengerType": "ADT",
            "Amount": {
             "@type": "Amount",
             "CurrencyCode": {
              "decimalPlace": 0,
              "value": "RUB"
             },
             "Base": 23040,
             "Taxes": {
              "@type": "TaxesDetail",
              "TotalTaxes": 8338,
              "Tax": [...]
             },
             "Fees": {
              "@type": "FeesDetail",
              "TotalFees": 0
             },
             "Total": 31378
            }
           }
          ]
         },
         "ContentSource": "GDS"
        }
       ]
      }
     ]
    }]
  },
  "Result": {...},
  "ReferenceList": [...]
 }
}
```

### Block 5

```
"Brand": {
                    "@type": "Brand",
                    "BrandRef": "b0"
                  },
                  "Product": [
                    {
                      "@type": "Product",
                      "productRef": "p5"
                    }
                  ],
                  "TermsAndConditions": {
                    "@type": "TermsAndConditionsAir",
                    "termsAndConditionsRef": "T3"
                  },
                  "CombinabilityCode": [
                    "j2"
                  ],
                  "BestCombinablePrice": {
                    "@type": "BestCombinablePriceDetail",
                    "CurrencyCode": {
                      "decimalPlace": 0,
                      "value": "HKD"
                    },
                    "Base": 1040,
                    "TotalTaxes": 304,
                    "TotalPrice": 1344,
                    "PriceBreakdown": [
                      {
                        "@type": "PriceBreakdownAir",
                        "quantity": 1,
                        "requestedPassengerType": "ADT",
                        "Amount": {
                          "CurrencyCode": {
                            "decimalPlace": 0,
                            "value": "HKD"
                          },
                          "Base": 1040,
                          "Taxes": {
                            "@type": "TaxesDetail",
                            "TotalTaxes": 304,
                            "Tax": [
                              {
                                "taxCode": "AY",
                                "value": 88
                              },
                              {
                                "taxCode": "US",
                                "value": 78
                              },
                              {
                                "taxCode": "XF",
                                "value": 70
                              },
                              {
                                "taxCode": "ZP",
                                "value": 68
                              }
                            ]
                          },
                          "Total": 1344
                        }
                      }
                    ]
                  }
                }
              ]
 ...
```

### Block 6

```
...{
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
  "jc1"
 ],
 "BestCombinablePrice": {
  "@type": "BestCombinablePriceDetail",
  "CurrencyCode": {
   "decimalPlace": 0,
   "value": "HKD"
  },
  "Base": 12920,
  "TotalTaxes": 720,
  "TotalFees": 0,
  "TotalPrice": 13640,
  "PriceBreakdown": [
   {
    "@type": "PriceBreakdownAir",
    "quantity": 1,
    "requestedPassengerType": "ADT",
    "Amount": {
     "@type": "Amount",
     "CurrencyCode": {
      "decimalPlace": 0,
      "value": "HKD"
     },
     "Base": 12920,
     "Taxes": {
      "@type": "TaxesDetail",
      "TotalTaxes": 720,
      "Tax": [
       {
        "taxCode": "JD",
        "value": 178
       },
       {
        "taxCode": "OG",
        "value": 6
       },
       {
        "taxCode": "QV",
        "value": 31
       },
       {
        "taxCode": "DY",
        "value": 117
       },
       {
        "taxCode": "HW",
        "value": 388
       }
      ]
     },
     "Fees": {
      "@type": "FeesDetail",
      "TotalFees": 0
     },
     "Total": 13640
    },
    "FareCalculation": "MAD LA LIM LA AQP M808.51LLEKM00R /-CUZ LA X/LIM LA MAD M808.51LLEKM00R NUC1617.02END ROE0.915261"
   }
  ]
 }
}...
```

### Block 7

```
"Brand": [
          {
            "@type": "Brand",
            "name": "Red eDeal",
            "tier": 1,
            "shelfNumbers": [],
            "id": "b0",
            "Identifier": {
              "value": "1125969"
            },
            "BrandAttribute": [
              {
                "@type": "BrandAttribute",
                "classification": "CarryOn",
                "inclusion": "Included"
              },
              {
                "@type": "BrandAttribute",
                "classification": "Meals",
                "inclusion": "Included"
              },
              {
                "@type": "BrandAttribute",
                "classification": "LieFlatSeat",
                "inclusion": "Included"
              },
              {
                "@type": "BrandAttribute",
                "classification": "PremiumSeat",
                "inclusion": "Included"
              },
              {
                "@type": "BrandAttribute",
                "classification": "SeatAssignment",
                "inclusion": "Included"
              },
              {
                "@type": "BrandAttribute",
                "classification": "Rebooking",
                "inclusion": "Chargeable"
              },
              {
                "@type": "BrandAttribute",
                "classification": "Refund",
                "inclusion": "Chargeable"
              }
            ],
```

### Block 8

```
...
   "SearchModifiersAir": {
      "@type": "SearchModifiersAir",
      "ProductInclusionPreference": [
         {
            "Classification": [
               "CheckedBag",
               "SeatAssignment",
               "CarryOn"
            ]
         }
  ...
```

