# Fare Rules API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Price/APIRef_FareRules.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Fare Rules API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Fare Rules API&#160;Reference Request Response Example request Example response The base path for all of the following endpoints is the same: Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Fare rules request after Search Get farerule/farerules/fromcatalogproductofferings?catalogProductOfferingsIdentifier= {responseIdentifier} &amp;catalogProductOfferingID= {offerID} &amp;productIDs= {productID} &amp;fareRuleType= {value} For {responseIdentifier} send the Search response identifier in CatalogProductOfferings/Identifier/value. For {offerID} send the offer identifier from the Search response for the offer to request fare rules for. Fare rules request after AirPrice Get farerule/farerules/fromoffer?offerIdentifier= {offerID} &amp;fareRuleType= {value} For {offerID} send the offer identifier from the AirPrice response for the offer to request fare rules for. Fare rules request for existing reservation (after booking) Get farerule/farerules/fromreservation?reservationIdentifier= {LocatorCode} &amp;fareRuleType= {value} For {LocatorCode} &#160;send the locator code of the reservation. Fare rules request after Fare Display GDS only; NDC does not support fare display functionality. Supports only short text and long text fare rules, not structured fare rules Get farerule/farerules/fromfaredisplay?fareRuleIdentifier= {responseIdentifier} &amp;fareID= {sequence} &amp;fareRuleType= {value} For {responseIdentifier} &#160;send the value from FareDisplayResponse/Identifier/value for the Fare Display response. For {sequence} send the value from fareDisplay/fare/sequence for the fare to request fare rules for. Related Content: Fare Rules Guide Fare rules are the conditions and restrictions that apply to any booking based on its fare type. These determine the price of the fare. Generally, less expensive fares have more restrictions and more expensive fares have fewer restrictions. Fare rules can include blackout dates, advanced reservation requirements, minimum and maximum stay requirements, and cancellation and change penalties. See the Fare Rules Guide for details on where in the workflow these requests are supported for NDC&#160;and GDS. Requests As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters for Fare Rules Request after Search Parameter Description Required/Optional catalogProductOfferingsIdentifier Value from Search response in CatalogProductOfferings/Identifier/value.. Required catalogProductOfferingID Value from Search response in CatalogProductOffering/id for the offer to return fare rules for. Required productIDs Value from Search response in CatalogProductOffering/ProductBrandOptions/ProductBrandOffering/Product/productRef for the product to return fare rules for. Fare rules can be requested for one and only one product per request, using the productIDs query parameter. Multiple product IDs are not supported when requested after Search. Required fareRuleType Enumeration for the type of fare rules requested. Supported values: ShortText LongText (GDS&#160;only) Structured (for NDC, structured fare rules are supported only for Penalties; warning message returned if no penalties are applicable to the fare) Required fareRuleCategories Enumeration. Send only if requesting structured fare rules. If fareRuleType=Structured and fareRuleCategories is not sent, all structured fare rules are returned. Supported values: AdvanceReservationTicketing (GDS&#160;only) MinimumStay (GDS&#160;only) MaximumStay (GDS&#160;only) Stopovers (GDS&#160;only) Penalties Optional Query Parameters for Fare Rules Request after AirPrice Parameter Description Required/Optional offerIdentifier Value from AirPrice response for the offer to return fare rules for. Required productIDs Value from AirPrice response for the product to return fare rules for, if fare rules are desired for only one product (aka leg). Optional fareRuleType Enumeration for the type of fare rules requested. Supported values: ShortText LongText (GDS only) Structured (for NDC, structured fare rules are supported only for Penalties; warning message returned if no penalties are applicable to the fare) Required fareRuleCategories Enumeration. Send only if requesting structured fare rules. If fareRuleType=Structured and fareRuleCategories is not sent, all structured fare rules are returned. Supported values: AdvanceReservationTicketing (GDS&#160;only) MinimumStay (GDS&#160;only) MaximumStay (GDS&#160;only) Stopovers (GDS&#160;only) Penalties Optional Query Parameters for Fare Rules Request for existing reservation Parameter Description Required/Optional reservationIdentifier Reservation locator code. Required fareRuleType Enumeration for the type of fare rules requested. Supported values: ShortText LongText (GDS only) Structured (for NDC, structured fare rules are supported only for Penalties; warning message returned if no penalties are applicable to the fare) Required fareRuleCategories Enumeration. Send only if requesting structured fare rules. If fareRuleType=Structured and fareRuleCategories is not sent, all structured fare rules are returned. Supported values: AdvanceReservationTicketing (GDS&#160;only) MinimumStay (GDS&#160;only) MaximumStay (GDS&#160;only) Stopovers (GDS&#160;only) Penalties Optional Query Parameters for Fare Rules Request after Fare Display GDS only; NDC does not support fare display functionality. Supports only short text and long text fare rules, not structured fare rules Parameter Description Required/Optional fareRuleIdentifier Send the value from FareDisplayResponse/Identifier from the Fare Display response. Required FareID Send the value from fareDisplay/fare/sequence from the Fare Display response for the fare to request fare rules for. Required fareRuleType Enumeration for the type of fare rules requested. Supported values: ShortText LongText Required Request Body None. Response Show Response Body Table Object Description FareRuleListResponse Top level object. Key value pairs: transactionId : System-generated unique ID for this response. Can be used for internal tracking and troubleshooting. traceId : Returned if a custom trace ID was sent in the request header. See Transaction and Trace IDs for details. See Identifiers in the JSON &#160;APIs for more about identifiers across all JSON &#160;APIs. Includes FareRule, Result, and Identifier objects. FareRule Array. One instance for each uniquely numbered fare rule. Includes Flight object. For long and short fare rules only, also includes TextFareRule object and the following key value pairs: ruleNumber : String. The rule number assigned to this fare rule. id : String. The id for this fare rule. For structured fare rules only, also includes StructuredFareRules object. Flight The flight to which this fare rule applies. For structured fare rules, returned with @type FlightID. For long and short fare rules, returned with @type Flight. Includes FlightRef. FlightRef String. Returns an internal flight reference id that cross-references to consolidated flight details in ReferenceListFlight/Flight/id. TextFareRule Returned for long and short fare rules. Array. Key value pairs: name : Name of the fare rule. value : Freeform text of the rule itself. StructuredFareRules Returned for structured fare rules. Key value pairs: passengerTypeCodes : List of PTCs this fare rule applies to. fareClassCode : Single-character alphanumeric code of the fare class to which the rule applies, or the generic fare family, including special characters; no set format. oneWayRoundTripRestrictions :&#160;Enum indicating what restrictions apply to; possible values include OneWay, RoundTrip, All. May include the Penalties, MinimumStay, MaximumStay, AdvanceReservation, AdvancePayment, or Stopover objects. For NDC, only Penalties is returned. Penalties Returns change and cancel penalties in the standard Penalties object; see the AirPrice Reference Payload response table for details. For a split ticketing itinerary , ruleNumber, tariffNumber, and farebasiscode are not returned for structured fare rules. MinimumStay, MaximumStay, AdvanceReservation, AdvancePayment, Stopover See the Travelport API schema for details and supported values for these objects. For a split ticketing itinerary , ruleNumber, tariffNumber, and farebasiscode are not returned for structured fare rules. Result Any warning or error messages. Identifier Identifier information for response. Key value pairs: authority : Source of information. value : Unique system-generated identifier. ReferenceList Returns one instance of ReferenceListFlight to consolidate flight information cross-referenced from a fare rule. See ReferenceListFlight table below. ReferenceList/ReferenceListFlight Object Description ReferenceListFlight Returns an array of Flight objects that match to the flights that make up a product. ReferenceListFlight is a common object in the model. Not all objects in this table may be returned in this specific API. Flight One instance for one flight. Key value pairs: distance : Distance covered by the flight. duration : Time of the flight in hours (H) and minutes (M). carrier : Airline carrier. number : Flight number. operatingCarrier : When the carrier has filed a codeshare operating carrier for the flight, the IATA code for that codeshare carrier. operatingCarrierName : Name of the marketing operating carrier. operatingCarrierNumber :&#160;Number of the operating carrier flight. If there is no operating carrier number, then CO2 emission estimates for operating carriers is not supported. GDS only; not returned for NDC. Returned only in Search response. equipment : Equipment model. Note that TRN, TRS, and BUS equipment codes indicate ground transportation. id : id for internal flight reference number, also used in products and offers. For GDS, formatted as the letter ‘s’+ unique numeric value, as in s1 . NDC flight ids include the NDC carrier code, as in QFs1 . subjectToGovernmentApproval : Returned with value of true when an airline has filed in its schedule that availability for a specific flight is subject to government approval. GDS only, not supported for NDC. Returned only in the Search API&#160;response. Includes Departure, Arrival, AvailabilitySourceCode, and IntermediateStop objects. Departure Departure details. Key value pairs are the location , date , time , and terminal of departure. Arrival Arrival details. Key value pairs are the location , date , time , and terminal of arrival. AvailabilitySourceCode Returned to assist in troubleshooting. Returned in the Search, Air Availability, Exchange Search, AirPrice, and Workbench Commit responses. Recommended to send in the AirPrice Full Payload and Add Offer Full Payload requests. Not returned for Ancillary Shop or Fare Rules. GDS&#160;only; not supported for NDC. Supported values and definitions for AvailabilitySourceCode: A:&#160;AVS (availability and schedules) B:&#160;Travelport cache C:&#160;AVS D:&#160;Direct Access E:&#160;Travelport cache F: Travelport cache G: Travelport cache H: Travelport cache I: Travelport cache K: Travelport cache L:&#160;Last seat availability M:&#160;Unknown source O: Travelport cache P: Travelport cache Q:&#160;Travelport cache S:&#160;Seamless T:&#160;Travelport cache U:&#160;Unknown source X:&#160;Customer reusing availability data from customer cache (data originally obtained from Travelport) Y:&#160;Customer reusing data obtained from another system (e.g., another GDS) (data may be fresh or stored in customer cache) Z:&#160;Customer sold from e-streamed data stored in customer cache IntermediateStop Returned if the flight has a technical stop but does not incur a change in flight number. Returned in the Search, AirPrice, Exchange Search responses. In ReservationRetrieve, IntermediateStop is returned in Offer/Product/Flight instead of ReferenceListFlight. Not returned for Ancillary Shop or Fare Rules. Key value pairs: arrivalFlightDuration: Length in hours and minutes of the flight arriving at the intermediate stop. departureFlightDuration: Length in hours and minutes of the flight departing the intermediate stop. duration: Length in hours and minutes between the arrival and departure at the intermediate stop. equipment : Equipment model, if there is a change of equipment during the stop. arrivalDate: Arrival date for stop. departureDate: Departure date of stop. arrivalTime: Arrival time for stop. departurelTime: &#160; sic; note spelling of departurelTime with the letter l between departure and time Departure time for stop. arrivalTerminal: Arrival terminal for stop. departureTerminal: Departure terminal for stop. value: The code for the airport where the intermediate stop occurs. Example Requests Example GET Request for fare rules after Search response This example requests structured fare rules without specifying fare rule categories, so all fare rule categories are returned: https://api.travelport.com/11/air/farerule/farerules/fromcatalogproductofferings?catalogProductOfferingsIdentifier=dbbf8d3e-4a90-4ab1-bdbf-5e89e937cd2b&amp;catalogProductOfferingID=o1&amp;productIDs=p5&amp;fareRuleType=Structured Example GET Request for fare rules after AirPrice response This example requests short text fare rules for an offer after pricing: https://api.travelport.com/11/air/farerule/farerules/fromoffer?offerIdentifier=o0&amp;fareRuleType=ShortText Example GET Request for fare rules for existing reservation (after booking) This example requests long text fare rules for a held booking: https://api.travelport.com/11/air/farerule/farerules/fromreservation?reservationIdentifier=2BPWLP&amp;fareRuleType=LongText Example Responses The response format is the same regardless of where in the workflow the request is sent. Show Example response for GDS&#160;structured fare rules { "FareRuleListResponse": { "@type": "FareRuleListResponse", "transactionId": "bcb69bc5-9452-4e95-ba85-6753d9af182e", "FareRule": [ { "@type": "FareRuleStructured", "Flight": [ { "@type": "FlightID", "FlightRef": "f1" } ], "StructuredFareRules": [ { "@type": "StructuredFareRules", "passengerTypeCodes": [ "ADT" ], "fareClassCode": "&amp;&amp;&amp;YX&amp;&amp;&amp;", "oneWayRoundTripRestrictions": "All", "Penalties": [ { "@type": "Penalties", "ruleNumber": "DO16", "tariffNumber": "060", "Change": [ { "@type": "ChangePermitted", "penaltyTypes": [ "ExchangeRequired", "ExchangeNotRequired" ], "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "INR", "minorUnit": 0, "value": 3000 } } ] } ] }, { "@type": "Penalties", "ruleNumber": "DO16", "tariffNumber": "060", "Cancel": [ { "@type": "CancelPermitted", "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "INR", "minorUnit": 0, "value": 4000 } } ] } ] }, { "@type": "Penalties", "ruleNumber": "DO16", "tariffNumber": "060", "Change": [ { "@type": "ChangeNotPermitted", "NotPermittedInd": "true" } ] }, { "@type": "Penalties", "ruleNumber": "DO16", "tariffNumber": "060", "Cancel": [ { "@type": "CancelNotPermitted", "NotPermittedInd": "true" } ] } ] }, { "@type": "StructuredFareRules", "MinimumStay": [ { "@type": "MinimumStayIndeterminate", "IndeterminateInd": "true" } ] }, { "@type": "StructuredFareRules", "MaximumStay": [ { "@type": "MaximumStayIndeterminate", "IndeterminateInd": "true" } ] }, { "@type": "StructuredFareRules", "passengerTypeCodes": [ "ADT" ], "oneWayRoundTripRestrictions": "All", "Stopover": [ { "@type": "StopoverNotPermitted", "ruleNumber": "DO00", "tariffNumber": "060", "NotPermittedInd": "true" } ] }, { "@type": "StructuredFareRules", "passengerTypeCodes": [ "ADT" ], "oneWayRoundTripRestrictions": "All", "AdvanceReservation": [ { "@type": "AdvanceReservationRequired", "instantPurchase": "No", "ruleNumber": "DO00", "tariffNumber": "060", "WaitlistStandbyCondition": [ { "value": "WaitlistStandbyNotPermitted" } ] } ] }, { "@type": "StructuredFareRules", "passengerTypeCodes": [ "ADT" ], "fareClassCode": "&amp;&amp;&amp;YX&amp;&amp;&amp;", "oneWayRoundTripRestrictions": "All", "Penalties": [ { "@type": "Penalties", "ruleNumber": "DO33", "tariffNumber": "060", "Cancel": [ { "@type": "CancelPermitted", "penaltyTypes": [ "Anytime" ], "PenaltyAppliesTo": "OneWay", "PenaltyAppliesToPricingUnit": "Anytime", "PenaltyAppliesToFareComponent": "Anytime" } ], "PenaltySourceCode": { "codeContext": "ATPCO", "value": "33" } }, { "@type": "Penalties", "ruleNumber": "DO33", "tariffNumber": "060", "Cancel": [ { "@type": "CancelPermitted", "penaltyTypes": [ "Anytime" ], "PenaltyAppliesTo": "OneWay", "PenaltyAppliesToPricingUnit": "Anytime", "PenaltyAppliesToFareComponent": "Anytime" } ], "PenaltySourceCode": { "codeContext": "ATPCO", "value": "33" }, "PassengerTypeCodes": [ "INF" ] }, { "@type": "Penalties", "ruleNumber": "DO33", "tariffNumber": "060", "Cancel": [ { "@type": "CancelPermitted", "penaltyTypes": [ "BeforeDeparture" ], "PenaltyAppliesTo": "OneWay", "PenaltyAppliesToPricingUnit": "Anytime", "PenaltyAppliesToFareComponent": "Anytime", "PenaltyException": { "period": "Hours", "appliesAfterReservationInd": true, "value": 24 } } ], "PenaltySourceCode": { "codeContext": "ATPCO", "value": "33" } }, { "@type": "Penalties", "ruleNumber": "DO33", "tariffNumber": "060", "Cancel": [ { "@type": "CancelPermitted", "penaltyTypes": [ "Anytime", "BeforeDeparture" ], "PenaltyAppliesTo": "OneWay", "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "INR", "minorUnit": 0, "value": 4000 } } ], "PenaltyAppliesToPricingUnit": "Anytime", "PenaltyAppliesToFareComponent": "Anytime", "PeriodBeforeDeparture": { "period": "Hours", "value": 2 } } ], "PenaltySourceCode": { "codeContext": "ATPCO", "value": "33" } }, { "@type": "Penalties", "ruleNumber": "DO33", "tariffNumber": "060", "Cancel": [ { "@type": "CancelNotPermitted", "penaltyTypes": [ "NoShow" ], "NotPermittedInd": "true" } ], "PenaltySourceCode": { "codeContext": "ATPCO", "value": "33" } }, { "@type": "Penalties", "ruleNumber": "DO33", "tariffNumber": "060", "Cancel": [ { "@type": "CancelPermitted", "penaltyTypes": [ "AfterDeparture" ], "PenaltyAppliesTo": "OneWay", "Penalty": [ { "@type": "Penalty", "application": "Full" } ], "PenaltyAppliesToPricingUnit": "Anytime", "PenaltyAppliesToFareComponent": "Anytime" } ], "PenaltySourceCode": { "codeContext": "ATPCO", "value": "33" } } ] }, { "@type": "StructuredFareRules", "passengerTypeCodes": [ "ADT" ], "fareClassCode": "&amp;&amp;&amp;YX&amp;&amp;&amp;", "oneWayRoundTripRestrictions": "All", "Penalties": [ { "@type": "Penalties", "ruleNumber": "DO31", "tariffNumber": "060", "Change": [ { "@type": "ChangePermitted", "penaltyTypes": [ "Anytime" ], "PenaltyAppliesToPricingUnit": "Anytime", "PenaltyAppliesToFareComponent": "Anytime" } ], "PenaltySourceCode": { "codeContext": "ATPCO", "value": "31" } }, { "@type": "Penalties", "ruleNumber": "DO31", "tariffNumber": "060", "Change": [ { "@type": "ChangePermitted", "penaltyTypes": [ "Anytime" ], "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "INR", "minorUnit": 0, "value": 3000 } } ], "PenaltyAppliesToPricingUnit": "Anytime", "PenaltyAppliesToFareComponent": "Anytime" } ], "PenaltySourceCode": { "codeContext": "ATPCO", "value": "31" } }, { "@type": "Penalties", "ruleNumber": "DO31", "tariffNumber": "060", "Change": [ { "@type": "ChangeNotPermitted", "NotPermittedInd": "true" } ], "PenaltySourceCode": { "codeContext": "ATPCO", "value": "31" } } ] } ] } ], "Identifier": { "value": "bcb69bc5-9452-4e95-ba85-6753d9af182e_PC_FR" }, "ReferenceList": [ { "@type": "ReferenceListFlight", "Flight": [ { "@type": "FlightDetail", "distance": 708, "duration": "PT2H10M", "carrier": "AI", "number": "624", "operatingCarrier": "AI", "operatingCarrierName": "Air India", "id": "f1", "Departure": { "@type": "Departure", "location": "DEL", "date": "2024-10-12", "time": "19:10:00" }, "Arrival": { "@type": "Arrival", "location": "BOM", "date": "2024-10-12", "time": "21:20:00" }, "AvailabilitySourceCode": "S" } ] } ] } } The following response returns short text fare rules for a split ticketing itinerary . While there is no difference in the fare rules request, because the itinerary includes two one-way offers, the response is subject to the limitations noted in the Fare Rules Guide . Show Example fare rules for split ticket itinerary { "FareRuleListResponse": { "@type": "FareRuleListResponse", "transactionId": "c333b955-1f78-4461-92c6-d734a42a07b1", "FareRule": [ { "@type": "FareRuleText", "ruleNumber": "AEC4", "tariffNumber": "033", "id": "VAOXAEC4", "Flight": [ { "@type": "Flight", "FlightRef": "f1" }, { "@type": "Flight", "FlightRef": "f2" } ], "TextFareRule": [ { "name": "Eligibility", "value": "CONDITIONS APPLY" }, { "name": "Day/Time", "value": "" }, { "name": "Seasonal", "value": "" }, { "name": "Flight Application", "value": "NOT SV 5000-9999.SV ONLY" }, { "name": "Advance Res/Tkt", "value": "CONDITIONS APPLY" }, { "name": "Minimum Stay", "value": "" }, { "name": "Maximum Stay", "value": "" }, { "name": "Stopovers", "value": "CONDITIONS APPLY" }, { "name": "Transfers/Routing", "value": "CONDITIONS APPLY" }, { "name": "Permitted Combinations", "value": "SOJ/RT/CT" }, { "name": "Blackouts", "value": "" }, { "name": "Surcharges", "value": "CONDITIONS APPLY" }, { "name": "Accompanied", "value": "" }, { "name": "Travel Restrictions", "value": "" }, { "name": "Sales Restrictions", "value": "CONDITIONS APPLY" }, { "name": "Penalties", "value": "CHG BEF DEP-100SAR/CXL BEF DEP-150SAR/CHG CXL AFT DEP-550SAR" }, { "name": "Children's Discounts", "value": "ACC CHD 2-11 75PCT.UNACC CHD 2-11 100PCT" }, { "name": "All other Disc", "value": "" } ] }, { "@type": "FareRuleText", "ruleNumber": "BLAE", "tariffNumber": "033", "id": "ULOWBLAE", "Flight": [ { "@type": "Flight", "FlightRef": "f1" }, { "@type": "Flight", "FlightRef": "f2" } ], "TextFareRule": [ { "name": "Eligibility", "value": "" }, { "name": "Day/Time", "value": "" }, { "name": "Seasonal", "value": "" }, { "name": "Flight Application", "value": "CONDITIONS APPLY" }, { "name": "Advance Res/Tkt", "value": "CONDITIONS APPLY" }, { "name": "Minimum Stay", "value": "" }, { "name": "Maximum Stay", "value": "" }, { "name": "Stopovers", "value": "CONDITIONS APPLY" }, { "name": "Transfers/Routing", "value": "CONDITIONS APPLY" }, { "name": "Blackouts", "value": "" }, { "name": "Surcharges", "value": "CONDITIONS APPLY |" }, { "name": "Accompanied", "value": "" }, { "name": "Travel Restrictions", "value": "" }, { "name": "Sales Restrictions", "value": "CONDITIONS APPLY" }, { "name": "Penalties", "value": "CHG-3000INR/CXL-6000INR/CHG CXL-6000INR" }, { "name": "Children's Discounts", "value": "ACC CHD 2-11 75PCT.UNACC CHD 5-11 100PCT" }, { "name": "All other Disc", "value": "" } ] } ], "Identifier": { "value": "93d2091d-3d04-48ab-8091-6ae1525f02ea_PC_FR" }, "ReferenceList": [ { "@type": "ReferenceListFlight", "Flight": [ { "@type": "FlightDetail", "distance": 284, "duration": "PT1H15M", "carrier": "AI", "number": "516", "operatingCarrier": "AI", "operatingCarrierName": "Air India", "equipment": "321", "id": "f1", "Departure": { "@type": "Departure", "location": "BLR", "date": "2024-10-23", "time": "07:25:00" }, "Arrival": { "@type": "Arrival", "location": "HYD", "date": "2024-10-23", "time": "08:40:00" }, "AvailabilitySourceCode": "S" }, { "@type": "FlightDetail", "distance": 1586, "duration": "PT3H55M", "carrier": "AI", "number": "951", "operatingCarrier": "AI", "operatingCarrierName": "Air India", "equipment": "32N", "id": "f2", "Departure": { "@type": "Departure", "location": "HYD", "date": "2024-10-23", "time": "20:00:00" }, "Arrival": { "@type": "Arrival", "location": "DXB", "date": "2024-10-23", "time": "22:25:00" }, "AvailabilitySourceCode": "S" }, { "@type": "FlightDetail", "distance": 1048, "duration": "PT3H25M", "carrier": "SV", "number": "551", "operatingCarrier": "SV", "operatingCarrierName": "Saudi Arabian Airlines", "equipment": "320", "id": "f1", "Departure": { "@type": "Departure", "location": "DXB", "date": "2024-10-27", "time": "21:00:00" }, "Arrival": { "@type": "Arrival", "location": "JED", "date": "2024-10-27", "time": "23:25:00" }, "AvailabilitySourceCode": "A" }, { "@type": "FlightDetail", "distance": 2597, "duration": "PT5H20M", "carrier": "SV", "number": "866", "operatingCarrier": "SV", "operatingCarrierName": "Saudi Arabian Airlines", "equipment": "333", "id": "f2", "Departure": { "@type": "Departure", "location": "JED", "date": "2024-10-28", "time": "01:25:00" }, "Arrival": { "@type": "Arrival", "location": "BLR", "date": "2024-10-28", "time": "09:15:00" }, "AvailabilitySourceCode": "A" } ] } ] } } For NDC, structured fare rules are supported only for Penalties. Show Example NDC structured fare rules { "FareRuleListResponse": { "@type": "FareRuleListResponse", "transactionId": "427eaa96-0bd4-4d55-b67b-ecfcdc042478", "FareRule": [ { "@type": "FareRuleStructured", "Flight": [ { "@type": "Flight", "FlightRef": "AAs46" }, { "@type": "Flight", "FlightRef": "AAs47" }, { "@type": "Flight", "FlightRef": "AAs9" } ], "StructuredFareRules": [ { "@type": "StructuredFareRules", "Penalties": [ { "@type": "Penalties", "Change": [ { "@type": "ChangePermitted" } ], "Cancel": [ { "@type": "CancelPermitted" } ], "PassengerTypeCodes": [ "ADT" ] } ] } ] } ], "Identifier": { "value": "6f47ba13-8fac-4044-9398-a9c11672b6bd_FR" }, "ReferenceList": [ { "@type": "ReferenceListFlight", "Flight": [ { "@type": "FlightDetail", "distance": 3454, "stops": 0, "duration": "PT8H15M", "carrier": "AA", "number": "6944", "operatingCarrier": "BA", "operatingCarrierName": "British Airways", "equipment": "777", "id": "AAs46", "Departure": { "@type": "DepartureDetail", "terminal": "5", "location": "LHR", "date": "2024-02-29", "time": "10:45:00" }, "Arrival": { "@type": "ArrivalDetail", "terminal": "B", "location": "EWR", "date": "2024-02-29", "time": "14:00:00" } }, { "@type": "FlightDetail", "distance": 528, "stops": 0, "duration": "PT2H6M", "carrier": "AA", "number": "1790", "equipment": "320", "id": "AAs47", "Departure": { "@type": "DepartureDetail", "terminal": "A", "location": "EWR", "date": "2024-02-29", "time": "16:07:00" }, "Arrival": { "@type": "ArrivalDetail", "location": "CLT", "date": "2024-02-29", "time": "18:13:00" } }, { "@type": "FlightDetail", "distance": 226, "stops": 0, "duration": "PT1H13M", "carrier": "AA", "number": "763", "equipment": "319", "id": "AAs9", "Departure": { "@type": "DepartureDetail", "location": "CLT", "date": "2024-02-29", "time": "20:20:00" }, "Arrival": { "@type": "ArrivalDetail", "terminal": "N", "location": "ATL", "date": "2024-02-29", "time": "21:33:00" } } ] } ] } } Show Example response for NDC short fare rules { "FareRuleListResponse": { "transactionId": "b06015b1-6ddb-48a0-8083-5f440eba5a98:p", "FareRule": [ { "@type": "FareRuleText", "ruleNumber": "70J", "id": "NKSOA", "Flight": [ { "@type": "Flight", "FlightRef": "f1" } ], "TextFareRule": [ { "name": "Cancel", "value": "ADT:Allowed" }, { "name": "Change", "value": "ADT:Allowed" } ] } ], "Identifier": { "value": "5e848a34-6ec1-4be3-bcd1-30d41c00e206_PC_FR" }, "ReferenceList": [ { "@type": "ReferenceListFlight", "Flight": [ { "@type": "Flight", "duration": "PT8H40M", "carrier": "QF", "number": "81", "equipment": "333", "id": "f1", "FlightRef": "f1", "Identifier": { "value": "Isgm01004a1a265a6" }, "Departure": { "@type": "DepartureDetail", "terminal": "1", "location": "SYD", "date": "2022-07-09", "time": "10:10:00" }, "Arrival": { "@type": "ArrivalDetail", "terminal": "1", "location": "SIN", "date": "2022-07-09", "time": "16:50:00" } } ] } ] } } Show Example response for GDS long fare rules { "FareRuleListResponse": { "transactionId": "ef0b8a9c-0ff7-4cc1-a250-17755a6c8d22:p", "FareRule": [ { "@type": "FareRuleText", "ruleNumber": "9000", "id": "W0", "Flight": [ { "@type": "Flight", "FlightRef": "s15" } ], "TextFareRule": [ { "name": "0. APPLICATION AND OTHER CONDITIONS", "value": "RULE - 011/9000\nUNLESS OTHERWISE SPECIFIED\nMAIN CABIN FARES\nAPPLICATION\nCLASS OF SERVICE\nTHESE FARES APPLY FOR ECONOMY CLASS SERVICE.\nCAPACITY LIMITATIONS\nSEATS ARE LIMITED" }, { "name": "4. FLIGHT APPLICATION", "value": "UNLESS OTHERWISE SPECIFIED NOTE - RULE FLT1 IN DGR\nAPPLIES\nUNLESS OTHERWISE SPECIFIED\nTHE FARE COMPONENT MUST BE ON\nONE OR MORE OF THE FOLLOWING\nANY DL FLIGHT." }, { "name": "5. ADVANCE RES/TICKETING", "value": "FOR W0 FARES\nRESERVATIONS ARE REQUIRED FOR ALL SECTORS.\nWHEN RESERVATIONS ARE MADE AT LEAST 33 DAYS BEFORE\nDEPARTURE TICKETING MUST BE COMPLETED AT LEAST 30 DAYS\nBEFORE DEPARTURE.\nOR - RESERVATIONS ARE REQUIRED FOR ALL SECTORS.\nWHEN RESERVATIONS ARE MADE AT LEAST 4 DAYS BEFORE\nDEPARTURE TICKETING MUST BE COMPLETED AT LEAST 3 DAYS\nBEFORE DEPARTURE.\nOR - RESERVATIONS ARE REQUIRED FOR ALL SECTORS.\nTICKETING MUST BE COMPLETED BY MIDNIGHT 1 DAY AFTER\nRESERVATIONS ARE MADE." }, { "name": "6. MINIMUM STAY", "value": "NONE FOR ONE WAY FARES" }, { "name": "7. MAXIMUM STAY", "value": "NONE FOR ONE WAY FARES" }, { "name": "8. STOPOVERS", "value": "UNLESS OTHERWISE SPECIFIED NOTE - RULE STOP IN DGR APPLIES\nUNLESS OTHERWISE SPECIFIED\nNO STOPOVERS PERMITTED." }, { "name": "9. TRANSFERS", "value": "UNLESS OTHERWISE SPECIFIED NOTE - RULE CAT9 IN DGR\nAPPLIES\nUNLESS OTHERWISE SPECIFIED\n2 TRANSFERS PERMITTED IN EACH DIRECTION\nONLINE ON THE PRIMARY CARRIER\nFARE BREAK AND EMBEDDED SURFACE SECTORS NOT PERMITTED ON\nTHE FARE COMPONENT." }, { "name": "10. PERMITTED COMBINATIONS", "value": "UNLESS OTHERWISE SPECIFIED\nDOUBLE OPEN JAWS NOT PERMITTED.\nAPPLICABLE ADD-ON CONSTRUCTION IS ADDRESSED IN\nMISCELLANEOUS PROVISIONS - CATEGORY 23.\nEND-ON-END\nEND-ON-END COMBINATIONS PERMITTED. VALIDATE ALL FARE\nCOMPONENTS. SIDE TRIPS PERMITTED.\nPROVIDED -\nCOMBINATIONS ARE FOR CARRIER DL/AF/AZ/KL/VA\nEND-ON-END\nEND-ON-END COMBINATIONS PERMITTED WITH US-CANADA\nTRANSBORDER/DOMESTIC FARES. VALIDATE ALL FARE\nCOMPONENTS. SIDE TRIPS PERMITTED.\nPROVIDED -\nCOMBINATIONS ARE FOR CARRIER DL/UA/AS/WS/KS/HA/9K/7H\nOPEN JAWS/2-COMPONENT CIRCLE TRIPS/MULTI-COMPONENT CIRCLE\nTRIPS\nFARES MAY BE COMBINED ON A HALF ROUND TRIP BASIS WITH DL\nFARES IN ANY RULE AND TARIFF.\n-TO FORM SINGLE OPEN JAWS.\nA MAXIMUM OF 2 FARE COMPONENTS PERMITTED.\nMILEAGE OF THE OPEN SEGMENT MUST BE EQUAL/LESS THAN\nMILEAGE OF THE SHORTEST FLOWN FARE COMPONENT.\n-TO FORM 2-COMPONENT CIRCLE TRIPS\n-TO FORM MULTI-COMPONENT CIRCLE TRIPS\nA MAXIMUM OF 2 FARE BREAK POINTS PERMITTED.\nEND-ON-END\nEND-ON-END COMBINATIONS PERMITTED WITH FARES FROM/TO\nLWB/MEI/MSL/PIB/TUP/GLH/MCN/BIL. VALIDATE ALL FARE\nCOMPONENTS. SIDE TRIPS PERMITTED.\nPROVIDED -\nCOMBINATIONS ARE FOR CARRIER DL/3M\nNOTE - THE CITY PAIRS BELOW ARE CONSIDERED THE SAME POINT-\nBWI-WAS FLL-MIA LAX-ONT LAX-SNA NYC-EWR OAK-SFO\nOAK-SJC SFO-SJC LAX-BUR" }, { "name": "12. SURCHARGES", "value": "FOR W0 FARES NOTE - RULE SCOT IN DGR ALSO APPLIES\nIF INFANT 0-1 WITHOUT A SEAT.\nTHERE IS NO CHARGE FOR TRAVEL PER FARE COMPONENT.\nA SURCHARGE OF USD 46.51 PER FARE COMPONENT WILL BE ADDED\nTO THE APPLICABLE FARE FOR TRAVEL IN BOEING 767-300\nEQUIPMENT.\nAND - A SURCHARGE OF USD 46.51 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL IN AIRBUS\nINDUSTRIE A330-900NEO EQUIPMENT.\nAND - A SURCHARGE OF USD 46.51 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL IN AIRBUS\nINDUSTRIE A350-900 EQUIPMENT.\nAND - A SURCHARGE OF USD 46.51 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL IN BOEING\n767-400 EQUIPMENT.\nFROM/TO FLORIDA\nIF INFANT 0-1 WITHOUT A SEAT.\nTHERE IS NO CHARGE FOR TRAVEL PER FARE COMPONENT.\nTO FLORIDA -\nA SURCHARGE OF USD 18.60 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 18FEB 23.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - FROM FLORIDA -\nA SURCHARGE OF USD 18.60 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL FROM 25FEB 23\nTHROUGH 26FEB 23.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 27.91 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL FROM\n26MAY 22 THROUGH 27MAY 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 32.56 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 30MAY 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 18.60 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON MON/THU\nFROM 04JUN 22 THROUGH 13JUN 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 27.91 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON FRI FROM\n04JUN 22 THROUGH 13JUN 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 23.26 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON SAT FROM\n04JUN 22 THROUGH 13JUN 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 32.56 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON SUN FROM\n04JUN 22 THROUGH 13JUN 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 27.91 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL FROM\n16JUN 22 THROUGH 17JUN 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 18.60 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL FROM\n18JUN 22 THROUGH 19JUN 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 27.91 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 20JUN 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 18.60 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 23JUN 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 27.91 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 24JUN 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 23.26 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 25JUN 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 32.56 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 26JUN 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 18.60 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 27JUN 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 27.91 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 30JUN 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 37.21 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 01JUL 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 27.91 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 02JUL 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 27.91 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 04JUL 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 37.21 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 05JUL 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 18.60 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 06JUL 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 18.60 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON MON/THU\nFROM 07JUL 22 THROUGH 29AUG 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 27.91 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON FRI FROM\n07JUL 22 THROUGH 29AUG 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 23.26 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON SAT FROM\n07JUL 22 THROUGH 29AUG 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 32.56 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON SUN FROM\n07JUL 22 THROUGH 29AUG 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 23.26 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 01SEP 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 27.91 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 02SEP 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 32.56 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 05SEP 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 18.60 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 18NOV 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 27.91 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 19NOV 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 18.60 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 20NOV 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 18.60 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 22NOV 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 27.91 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 23NOV 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 37.21 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 26NOV 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 74.42 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 27NOV 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 37.21 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 28NOV 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 27.91 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 17DEC 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 18.60 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 18DEC 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 18.60 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL FROM\n20DEC 22 THROUGH 21DEC 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 37.21 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 22DEC 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 46.51 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 23DEC 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 18.60 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 24DEC 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 46.51 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 26DEC 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 37.21 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 27DEC 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 18.60 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL FROM\n28DEC 22 THROUGH 31DEC 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 37.21 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 01JAN 23.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 46.51 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 02JAN 23.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 18.60 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 03JAN 23.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 18.60 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 13JAN 23.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 18.60 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 16JAN 23.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 27.91 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL FROM\n16FEB 23 THROUGH 17FEB 23.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 27.91 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 20FEB 23.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS." }, { "name": "15. SALES RESTRICTIONS", "value": "UNLESS OTHERWISE SPECIFIED\nTICKETS MAY NOT BE SOLD IN VENEZUELA/ZIMBABWE/ANGOLA/\nGABON/CAMEROON/CHAD/CONGO (BRAZZAVILLE).\nTICKETS MAY ONLY BE SOLD IN AREA 1/AREA 2/AREA 3." }, { "name": "16. PENALTIES", "value": "UNLESS OTHERWISE SPECIFIED NOTE - RULE RFND IN DGR APPLIES\nUNLESS OTHERWISE SPECIFIED\nCANCELLATIONS\nCANCELLATIONS PERMITTED.\nCHANGES\nCHANGES PERMITTED.\nNOTE -\n----TICKET VALIDITY----\nTICKET IS VALID FOR 1 YEAR FROM THE DATE OF\nISSUE AND ALL TRAVEL MUST BE COMPLETED WITHIN\nVALIDITY PERIOD. IF EXCHANGED WHETHER TRAVEL WAS\nSTARTED OR NOT THE TICKET MUST BE REISSUED AND\nALL TRAVEL COMPLETED WITHIN 1 YEAR FROM THE\nORIGINAL DATE OF ISSUE.\n.\n-FOR INFORMATION ON TICKET REISSUE PROCEDURES\nSEE DELTA/S DOMESTIC CONTRACT OF CARRIAGE RULE\n21 REROUTING" }, { "name": "19. CHILDREN DISCOUNTS", "value": "UNLESS OTHERWISE SPECIFIED\n1ST INFANT UNDER 2 WITHOUT A SEAT - NO CHARGE\nTICKET DESIGNATOR - IN100.\nMUST BE ACCOMPANIED ON ALL FLIGHTS IN SAME COMPARTMENT\nAT THIS RULE BY ADULT\nOR - INFANT UNDER 2 WITH A SEAT - CHARGE 100 PERCENT OF\nTHE FARE.\nMUST BE ACCOMPANIED ON ALL FLIGHTS IN SAME\nCOMPARTMENT BY ADULT\nOR - UNACCOMPANIED CHILD 5-14 - CHARGE 100 PERCENT OF THE\nFARE.\nTICKET DESIGNATOR - CH AND PERCENT OF DISCOUNT.\nNOTE -\nUNACCOMPANIED CHILDREN UNDER 5 YEARS OF AGE WILL\nNOT BE ACCEPTED FOR CARRIAGE UNDER ANY CONDITIONS.\nUNACCOMPANIED CHILDREN AGES 5 THROUGH 7 MAY TRAVEL\nON NON-STOP FLIGHTS ONLY AND MAY NOT CONNECT TO\nOTHER AIRLINES.\nCHILDREN AGES 8 THROUGH 14 MAY TRAVEL\nUNACCOMPANIED ON DELTAS NON-STOP OR CONNECTING\nFLIGHTS - BUT MAY NOT CONNECT TO OTHER AIRLINES\nWITH THE EXCEPTION OF DELTA CONNECTION/KLM AND\nAIR FRANCE." }, { "name": "23. MISCELLANEOUS PROVISIONS", "value": "UNLESS OTHERWISE SPECIFIED\nTHIS FARE MUST NOT BE USED AS THE HIGH OR THE LOW FARE\nWHEN CALCULATING A DIFFERENTIAL. THIS FARE MUST NOT BE\nUSED AS THE THROUGH FARE WHEN PRICING A FARE COMPONENT\nWITH A DIFFERENTIAL." }, { "name": "31. VOLUNTARY CHANGES", "value": "DO A CATEGORY 31 SPECIFIC TEXT ENTRY TO VIEW CONTENTS\nALSO REFERENCE 16 PENALTIES - FOR ADDITIONAL CHANGE INFORMATION" }, { "name": "33. VOLUNTARY REFUNDS", "value": "UNLESS OTHERWISE SPECIFIED NOTE - RULE RFND IN DGR APPLIES\nFOR ONE WAY FARES\nREFUND MUST BE REQUESTED BEFORE DEPARTURE OF FARE\nCOMPONENT.\nNO CHARGE. IF ALL PENALTIES IN PRICING UNIT ARE PER FARE\nCOMPONENT COLLECT EACH. IF MIX OF PER FARE COMPONENT AND\nPER PRICING UNIT CALCULATE EACH AS PER PRICING UNIT AND\nCOLLECT HIGHEST. DISCOUNT APPLIES TO CHILD/INFANT.\nREFUND REQUEST MUST BE LESS THAN ONE YEAR AFTER TRAVEL\nCOMMENCEMENT DATE IF PARTIALLY USED OR ONE YEAR AFTER\nTICKET ISSUANCE IF TICKET UNUSED. FORM OF REFUND -\nORIGINAL FORM OF PAYMENT. ONLY VALIDATING CARRIER MAY\nREFUND TICKET.\nOR -\nAPPLIES FOR FARE COMPONENTS THAT ARE PARTIALLY FLOWN.\nREFUND MUST BE REQUESTED AFTER DEPARTURE OF FARE\nCOMPONENT.\nNO CHARGE. IF ALL PENALTIES IN PRICING UNIT ARE PER FARE\nCOMPONENT COLLECT EACH. IF MIX OF PER FARE COMPONENT AND\nPER PRICING UNIT CALCULATE EACH AS PER PRICING UNIT AND\nCOLLECT HIGHEST. DISCOUNT APPLIES TO CHILD/INFANT.\nREFUND REQUEST MUST BE LESS THAN ONE YEAR AFTER TRAVEL\nCOMMENCEMENT DATE IF PARTIALLY USED OR ONE YEAR AFTER\nTICKET ISSUANCE IF TICKET UNUSED. FORM OF REFUND -\nORIGINAL FORM OF PAYMENT. ONLY VALIDATING CARRIER MAY\nREFUND TICKET.\nREPRICE FLOWN PORTION USING FARES IN EFFECT ON TICKET\nISSUANCE DATE. FOR FULLY FLOWN FARE COMPONENTS FARE BREAK\nPOINTS MAY NOT BE CHANGED. FOR PARTIALLY FLOWN FARE\nCOMPONENTS ONLY DESTINATION FARE BREAK POINTS MAY BE\nCHANGED. REPRICE USING NORMAL/SPECIAL ONE WAY/ROUND TRIP\nFARES/ANY RULE/FARE CLASS/EQUAL OR HIGHER RBD. PUBLIC\nFARES ARE USED IF TICKETED FARE IS IN PUBLIC TARIFF.\nQUALIFIED PRIVATE FARES OR PUBLIC FARES ARE USED IF\nTICKETED FARE IS IN PRIVATE TARIFF. NEW FARE FOR FULLY\nFLOWN FARE COMPONENTS MUST BE EQUAL TO OR HIGHER THAN\nTICKETED FARE.\nOR -\nNO CHARGE. IF ALL PENALTIES IN PRICING UNIT ARE PER FARE\nCOMPONENT COLLECT EACH. IF MIX OF PER FARE COMPONENT AND\nPER PRICING UNIT CALCULATE EACH AS PER PRICING UNIT AND\nCOLLECT HIGHEST. DISCOUNT APPLIES TO CHILD/INFANT.\nREFUND REQUEST MUST BE LESS THAN ONE YEAR AFTER TRAVEL\nCOMMENCEMENT DATE IF PARTIALLY USED OR ONE YEAR AFTER\nTICKET ISSUANCE IF TICKET UNUSED. FORM OF REFUND -\nORIGINAL FORM OF PAYMENT. ONLY VALIDATING CARRIER MAY\nREFUND TICKET.\nREPRICE FLOWN PORTION USING FARES IN EFFECT ON TICKET\nISSUANCE DATE. FOR FULLY FLOWN FARE COMPONENTS FARE BREAK\nPOINTS MAY NOT BE CHANGED. FOR PARTIALLY FLOWN FARE\nCOMPONENTS ONLY DESTINATION FARE BREAK POINTS MAY BE\nCHANGED. REPRICE USING NORMAL/SPECIAL ONE WAY FARES/ANY\nRULE/FARE CLASS/EQUAL OR HIGHER RBD. PUBLIC FARES ARE\nUSED IF TICKETED FARE IS IN PUBLIC TARIFF. QUALIFIED\nPRIVATE FARES OR PUBLIC FARES ARE USED IF TICKETED FARE\nIS IN PRIVATE TARIFF. NEW FARE FOR FULLY FLOWN FARE\nCOMPONENTS MUST BE EQUAL TO OR HIGHER THAN TICKETED FARE." } ] }, { "@type": "FareRuleText", "ruleNumber": "EIK2", "id": "QAA3AKIM", "Flight": [ { "@type": "Flight", "FlightRef": "s14" } ], "TextFareRule": [ { "name": "0. APPLICATION AND OTHER CONDITIONS", "value": "RULE - 011/EIK2\nUNLESS OTHERWISE SPECIFIED\nECONOMY PLUS OW/RT\nAPPLICATION\nCLASS OF SERVICE\nTHESE FARES APPLY FOR ECONOMY CLASS SERVICE.\nTYPES OF TRANSPORTATION\nTHIS RULE GOVERNS ONE-WAY AND ROUND-TRIP FARES.\nFARES GOVERNED BY THIS RULE CAN BE USED TO CREATE\nONE-WAY/ROUND-TRIP/CIRCLE-TRIP/OPEN-JAW JOURNEYS.\nCAPACITY LIMITATIONS\nSEATS ARE LIMITED" }, { "name": "2. DAY/TIME", "value": "UNLESS OTHERWISE SPECIFIED NOTE - RULE 02CT IN DGR APPLIES" }, { "name": "3. SEASONALITY", "value": "FOR &amp;&amp;&amp;&amp;&amp;&amp;&amp;M TYPE FARES NOTE - RULE CAT3 IN DGR APPLIES" }, { "name": "4. FLIGHT APPLICATION", "value": "UNLESS OTHERWISE SPECIFIED NOTE - RULE 4CAT IN DGR APPLIES\nFOR &amp;&amp;&amp;&amp;&amp;&amp;I&amp; TYPE FARES\nTHE FARE COMPONENT MUST NOT BE\nON CANADAIR REGIONAL JET 200 AIRCRAFT.\nAND\nTHE FARE COMPONENT MUST NOT BE\nON CANADAIR REGIONAL JET AIRCRAFT.\nAND\nTHE FARE COMPONENT MUST NOT BE\nON EMBRAER RJ135/RJ140/RJ145 SERIES AIRCRAFT.\nAND\nTHE FARE COMPONENT MUST BE ON\nONE OR MORE OF THE FOLLOWING\nANY UA FLIGHT OPERATED BY UA." }, { "name": "5. ADVANCE RES/TICKETING", "value": "UNLESS OTHERWISE SPECIFIED NOTE - RULE 5CAT IN DGR APPLIES\nFOR &amp;&amp;&amp;&amp;&amp;&amp;I&amp; TYPE FARES\nRESERVATIONS FOR ALL SECTORS ARE REQUIRED AT LEAST 3 DAYS\nBEFORE DEPARTURE OF EACH TRIP.\nTICKETING FOR DEPARTURE OF EACH TRIP MUST BE COMPLETED\nWITHIN 1 DAY AFTER RESERVATIONS ARE MADE OR AT LEAST 3\nDAYS BEFORE DEPARTURE WHICHEVER IS EARLIER.\nNOTE -\nTHE FLIGHT NUMBER AND DATE MUST BE INDICATED\nON THE TICKET." }, { "name": "6. MINIMUM STAY", "value": "UNLESS OTHERWISE SPECIFIED NOTE - RULE 6CAT IN DGR APPLIES\nNONE UNLESS OTHERWISE SPECIFIED" }, { "name": "8. STOPOVERS", "value": "WITHIN CONTIGUOUS U.S.A.\nNO STOPOVERS PERMITTED.\nNO STOPOVER OCCURS IF PASSENGER TAKES NEXT AVAILABLE\nFLIGHT WITHIN 4 HOURS." }, { "name": "9. TRANSFERS", "value": "WITHIN CONTIGUOUS U.S.A. FOR ONE WAY FARES\n2 TRANSFERS PERMITTED IN EACH DIRECTION\nFARE BREAK SURFACE SECTORS NOT PERMITTED AND EMBEDDED\nSURFACE SECTORS PERMITTED ON THE FARE COMPONENT.\nNOTE -\nFARE BREAK SURFACE SECTORS ARE NOT PERMITTED." }, { "name": "10. PERMITTED COMBINATIONS", "value": "FOR ONE WAY FARES\nDOUBLE OPEN JAWS NOT PERMITTED.\nAPPLICABLE ADD-ON CONSTRUCTION IS ADDRESSED IN\nMISCELLANEOUS PROVISIONS - CATEGORY 23.\nEND-ON-END\nEND-ON-END COMBINATIONS NOT PERMITTED WITH DOMESTIC/\nINTERNATIONAL FARES FROM/TO VENEZUELA. VALIDATE ALL FARE\nCOMPONENTS. SIDE TRIPS PERMITTED.\nEND-ON-END\nEND-ON-END COMBINATIONS PERMITTED. VALIDATE ALL FARE\nCOMPONENTS. SIDE TRIPS PERMITTED.\nPROVIDED -\nCOMBINATIONS ARE WITH ANY 4TH LEVEL ECONOMY\nUNRESTRICTED-TYPE FARES FOR CARRIER UA.\nCOMBINATIONS ARE IN ANY RULE IN TARIFF\nCDR - WITHIN CANADA\nCPR - BETWEEN THE UNITED STATES-CANADA\nDFR - WITHIN THE UNITED STATES\nOR RULE ECC2/ECW2/UPP1 IN TARIFF\nDR01 - WITHIN THE UNITED STATES.\nCOMBINATIONS ARE FOR CARRIER UA IN ANY RULE IN TARIFF\nIPRW - BETWEEN THE USA/CANADA-AREA 1\nVPCR - BETWEEN PUERTO RICO/VIRGIN ISLANDS-CANADA\nVPDR - BETWEEN PUERTO RICO/VIRGIN ISLANDS-THE USA.\nCOMBINATIONS ARE FOR CARRIER UA IN ANY RULE IN TARIFF\nFBRINPV - BETWEEN USA/CA-AREA 1/2/3.\nCOMBINATIONS ARE FOR CARRIER UA/AC IN ANY RULE IN\nTARIFF\nFBRNAPV - WITHIN NORTH AMERICA EXCEPT MEXICO.\nCOMBINATIONS ARE FOR CARRIER UA/LH/AC/LX/VO/SN/OS\nPUBLISHED FOR TRAVEL VIA THE ATLANTIC.\nCOMBINATIONS ARE FOR CARRIER UA/NH PUBLISHED FOR TRAVEL\nVIA THE PACIFIC.\nOPEN JAWS\nFARES MAY BE COMBINED ON A HALF ROUND TRIP BASIS\n-TO FORM SINGLE OPEN JAWS.\nA MAXIMUM OF 2 FARE COMPONENTS PERMITTED.\nMILEAGE OF THE OPEN SEGMENT MUST BE EQUAL/LESS THAN\nMILEAGE OF THE SHORTEST FLOWN FARE COMPONENT.\nPROVIDED -\nTHE OPEN SEGMENT MUST BE\n-BETWEEN THE UNITED STATES AND CANADA/BETWEEN THE\nUNITED STATES AND PUERTO RICO/BETWEEN CANADA AND\nPUERTO RICO/BETWEEN THE UNITED STATES AND US VIRGIN\nISLANDS/BETWEEN CANADA AND US VIRGIN ISLANDS/BETWEEN\nPUERTO RICO AND US VIRGIN ISLANDS\n-WITHIN THE UNITED STATES OR WITHIN PUERTO RICO OR\nWITHIN US VIRGIN ISLANDS.\nCOMBINATIONS ARE WITH ANY FARE FOR ANY CARRIER IN ANY\nRULE AND TARIFF.\n2-COMPONENT CIRCLE TRIPS/MULTI-COMPONENT CIRCLE TRIPS\nFARES MAY BE COMBINED ON A HALF ROUND TRIP BASIS\n-TO FORM 2-COMPONENT CIRCLE TRIPS/MULTI-COMPONENT CIRCLE\nTRIPS.\nPROVIDED -\nCOMBINATIONS ARE WITH ANY FARE FOR ANY CARRIER IN ANY\nRULE IN ANY TARIFF.\nNOTE - THE CITY PAIRS BELOW ARE CONSIDERED THE SAME POINT-\nBWI-WAS FLL-MIA FLL-PBI MIA-PBI BUR-LAX BUR-ONT\nBUR-SNA LAX-ONT LAX-SNA ONT-SNA OAK-SFO OAK-SJC\nSFO-SJC EWR-HVN EWR-ISP EWR-NYC EWR-HPN HVN-ISP\nHVN-NYC HVN-HPN ISP-NYC ISP-HPN NYC-HPN EFD-HOU\nEFD-IAH IAD-DCA MDW-ORD LGA-JFK" }, { "name": "12. SURCHARGES", "value": "UNLESS OTHERWISE SPECIFIED NOTE - RULE 12SC IN DGR ALSO\nAPPLIES\nIF INFANT 0-1 WITHOUT A SEAT.\nOR - EMF 0-1.\nOR - PIF 0-1.\nOR - CONTRACT BULK INFANT WITHOUT A SEAT 0-1.\nOR - CBI 0-1.\nOR - INCLUSIVE TOUR INFANT WITHOUT A SEAT 0-1.\nOR - SEAMAN INFANT WITHOUT A SEAT 0-1.\nTHERE IS NO CHARGE FOR TRAVEL PER FARE COMPONENT.\nTHE PROVISIONS BELOW APPLY ONLY AS FOLLOWS -\nTICKETS MUST BE ISSUED ON UA.\nTHERE IS NO CHARGE FOR TRAVEL PER FARE COMPONENT.\nOTHERWISE\nA SURCHARGE OF USD 93.02 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL." }, { "name": "15. SALES RESTRICTIONS", "value": "UNLESS OTHERWISE SPECIFIED NOTE - RULE CT15 IN DGR APPLIES\nUNLESS OTHERWISE SPECIFIED\nTICKETS MAY BE ISSUED BY PTA. PTA CONSTITUTES TICKETING.\nTICKETS MAY NOT BE SOLD IN NIGERIA/VENEZUELA/LEBANON/\nBELARUS/ANGOLA/SOUTH SUDAN/SUDAN/IRAN,ISLAMIC REPUBLIC OF.\nTICKETS MAY ONLY BE SOLD IN AREA 1/AREA 2/AREA 3.\nNOTE -\nFOR ITINERARIES SOLD OUTSIDE OF VE - CREDIT\nCARDS ISSUED IN VE ARE NOT ACCEPTED.\n----------------------\nEXTENSION OF TICKET VALIDITY PERMITTED UNDER\nGUIDELINES SET FORTH BY CARRIER. CONTACT\nCARRIER FOR DETAILS." }, { "name": "16. PENALTIES", "value": "FOR ONE WAY &amp;&amp;&amp;&amp;&amp;&amp;&amp;M TYPE FARES NOTE - RULE REFX IN DGR\nAPPLIES\nUNLESS OTHERWISE SPECIFIED\nCANCELLATIONS\nBEFORE DEPARTURE\nCANCELLATIONS PERMITTED.\nNOTE -\n--\nEXCHANGE - CHANGE TO 1ST TICKETED FLIGHT COUPON\nOR WHOLLY UNUSED TICKET\n--\nRESIDUAL VALUE MAY BE REFUNDED OR APPLIED\nTOWARD MOST DOMESTIC OR INTERNATIONAL\nNEW TICKET PURCHASE AT CURRENT FARE LEVELS.\nANY DIFFERENCE IN FARE / TAX\nCOLLECTED/REFUNDED AT TIME OF TICKET EXCHANGE.\n--\nTICKETS MUST BE REISSUED WHEN ANY VOLUNTARY\nCHANGE IS MADE.\n.\n1. WHOLLY UNUSED TICKETS -\nCHANGE TO ORIGINATING FLIGHT -\n--\nREPRICE USING CURRENT QUALIFYING\nFARES IN EFFECT TODAY\n--\nNO CHARGE OR HIGHEST FEE OF ONLY CHANGED\nFARE COMPONENTS. ONLY CHARGE ONE FEE FOR ONLY\nCHANGED FARE COMPONENTS IF CHANGED FARE COMPONENTS\nHAVE A FEE TO CHARGE.\n--\n1. ANY CARRIER FARE TYPE EXCEPT EOU/ERU ARE USED\n2. ADV RES IS MEASURED FROM REISSUE DATE TO\nDEPARTURE OF PRICING UNIT\n--\nWHEN CHANGE RESULTS IN FARE DIFFERENCE --\n--\nREFUND RESIDUAL VIA ORIGINAL FORM OF PAYMENT //\nADD-COLLECT FARE DIFFERENCE IF ANY // CHARGE\nCHANGE FEE WHEN APPLICABLE\n--\nAFTER DEPARTURE\nCANCELLATIONS PERMITTED.\nNOTE -\n--\nCALCULATE DIFFERENCE BETWEEN FARE PAID AND\nQUALIFYING FARE FOR TRAVEL COMPLETE\nUSING FARES OF ORIGINAL TICKET DATE /\nREFUND RESIDUAL VALUE IF ANY TO ORIGINAL\nFORM OF PAYMENT\n--\nNOTE -\n--\nTICKETS MUST BE REISSUED WHEN ANY VOLUNTARY\nCHANGE IS MADE\n--\nWHEN REFUNDABLE FARES ARE COMBINED ON A HALF\nROUND TRIP BASIS WITH PENALTY OR RESTRICTED FARES\nTO FORM A RT/CT/OJ ITINERARY THE MOST RESTRICTIVE\nPROVISIONS WILL APPLY TO THE PRICING UNIT\n--\nEXCEPTION -\nFARES COMBINED END-ON-END ON THE TICKET//IE\nFARES THAT COULD STAND ALONE IF ISSUED ON A\nSEPARATE TICKET// MAY BE CHANGED SEPARATELY\n--\nCHANGES\nBEFORE DEPARTURE\nCHANGES PERMITTED.\nNOTE -\n--\n-------------------------------\n--\nBEFORE DEPARTURE OF JOURNEY AND WITHIN TICKET\nVALIDITY CERTAIN DOMESTIC REISSUE PROVOSIONS\nMAY BE OVERRIDDEN BY THOSE OF UA INTERNATIONAL\nFARES. -- NO CHARGE -- OR HIGHEST FEE OF\nONLY CHANGED FARE COMPONENT/S/ WITHIN JOURNEY.\n--\nONLY ONE FEE IS CHARGED FOR CHANGED FARE\nCOMPONENT/S/ IF FARE RULE NOTES CHANGE FEE.\n--\nDOWNLINE DATE CHANGE / FLIGHT CHANGE\nSAME BOOKING CODE / KEEP THE FARE\n--\nREPRICE USING CURRENTLY TICKETED/HISTORICAL FARE\n--\nPROVIDED ALL OF THE FOLLOWING CONDITIONS ARE MET -\n--\n1. NO CHANGE TO 1ST FLIGHT COUPON/FARE BREAKS\n2. ALL TRAVEL REMAINS DOMESTIC\n3. SAME UA FARE USED\n4. ALL RULE AND BOOKING CODE PROVISIONS ARE MET\n5. VALIDATE ADVANCE RES/TICKETING FROM ORIGINAL\nTICKET DATE TO DEPARTURE OF PRICING UNIT\n--\nCHARGE CHANGE FEE WHEN APPLICABLE\n--\n--\nFARE BREAK POINT CHANGE PERMITTED\n--\nA. CHANGED FARE COMPONENTS USE FARE IN EFFECT\nTODAY\nB. ALL OTHERS USE CURRENTLY TKTD FARES\n--\nPROVIDED ALL OF THE FOLLOWING CONDITIONS ARE MET -\n1. ANY FARE TYPE EXCEPT EOU/ERU ARE USED\n2. TRAVEL IS DOMESTIC\n3. ALL RULE AND BOOKING CODE PROVISIONS ARE MET\n4. ADVANCE RES IS MEASURED FROM NEW TKT ISSUED\nDATE IF CURRENT FARES/FROM PREVIOUS TKT ISSUE\nDATE IF HISTORICAL FARES TO DEPARTURE OF\nPRICING UNIT\n--\nWHEN CHANGE RESULTS IN FARE DIFFERENCE--\n--\nREFUND RESIDUAL VIA ORIGINAL FORM OF PAYMENT //\nADD-COLLECT FARE DIFFERENCE IF ANY // CHARGE\nCHANGE FEE WHEN APPLICABLE\n--\nAFTER DEPARTURE\nCHANGES PERMITTED.\nNOTE -\n--\nAFTER DEPARTURE OF JOURNEY AND WITHIN TICKET\nVALIDITY CERTAIN DOMESTIC REISSUE PROVISIONS\nMAY BE OVERRIDDEN BY THOSE OF UA INTERNATIONAL\nFARES.\n--\nNO CHARGE -- OR HIGHEST FEE OF ANY CHANGED FARE\nCOMPONENT WITHIN JOURNEY -\n--\nONLY ONE CHANGE FEE CHARGED FOR CHANGED FARE\nCOMPONENT/S/ ONLY IF FARE RULE NOTES A CHANGE FEE\nIS TO BE CHARGED FOR CHANGE\n--\nREPRICE USING CURRENLTY TICKETED/HISTORICAL FARES\nDOWNLINE DATE CHANGE / FLIGHT CHANGE\nSAME BOOKING CODE / KEEP THE FARE\n--\nPROVIDED ALL OF THE FOLLOWING CONDITIONS ARE MET-\n1. NO CHANGE TO FARE BREAKS\n2. ALL TRAVEL REMAINS DOMESTIC\n3. FULLY FLOWN FARE NOT REPRICED TO FURTHER POINT\n4. UA FARES ARE USED\n5. ALL RULE AND BOOKING CODE PROVISIONS ARE MET\n6. ADV RES IS MEASURED FROM ORIGINAL TKT DATE TO\nDEPARTURE OF PRICING UNIT\n--\nFARE BREAK POINT CHANGE PERMITTED\n--\nA. FULLY FLOWN FARE COMPONENTS USE FARES IN\nEFFECT WHEN TKT WAS ISSUED\nB. ALL OTHERS USE FARES IN EFFECT TODAY\n--\nPROVIDED ALL OF THE FOLLOWING CONDITIONS ARE MET-\n1. NO CHANGE TO FARE BREAKS OF FULLY FLOWN\nFARE COMPONENTS\n2. ALL TRAVEL REMAINS DOMESTIC\n4. FULLY FLOWN FARE NOT REPRICED TO FURTHER POINT\n5. ANY FARE TYPE EXCEPT EOU/ERU ARE USED\n6. ALL RULE AND BOOKING CODE PROVISIONS ARE MET\n7. ADV RES IS MEASURED FROM ORIGINAL TKT DATE IF\nCURRENT FARES ARE USED/FROM PREVIOUS TKT DATE\nIF HISTORICAL FARES TO DEPARTURE OF PRICING UNIT\n--\nOR -\n--\nFARE BREAK POINT CHANGE PERMITTED\n--\nA. CHANGED FARE COMPONENETS USE FARE IN EFFECT\nTODAY.\nB. ALL OTHERS USE CURRENTLY TKTD FARE.\nPROVIDED ALL OF THE FOLLOWING CONDITIONS ARE MET-\n1. NO CHANGE TO FARE BREAKS UP TO THE FIRST\nCHANGED FARE COMPONENT\n2. ALL TRAVEL REMAINS DOMESTIC\n3. FULLY FLOWN FARE NOT REPRICED TO FURTHER POINT\n4. ANY UA FARE TYPE EXCEPT EOU/ERU ARE USED\n5. ALL RULE AND BOOKING CODE PROVISIONS ARE MET\n6. ADV RES IS MEASURED FROM NEW TKT ISSUE DATE\nIF CURRENT FARES/FROM PREVIOUS TKT ISSUE DATE\nIF HISTORICAL FARES TO DEPARTURE OF PRICING UNIT\n--\n-- WHEN CHANGE RESULTS IN FARE DIFFERENCE --\n--\nREFUND RESIDUAL VIA ORIGINAL FORM OF PAYMENT //\nADD COLLECT FARE DIFFERENCE IF ANY // CHARGE\nCHANGE FEE WHEN APPLICABLE\n--" }, { "name": "18. TICKET ENDORSEMENT", "value": "FOR ONE WAY &amp;&amp;&amp;&amp;&amp;&amp;&amp;M TYPE FARES NOTE - RULE REFX IN DGR\nAPPLIES\nUNLESS OTHERWISE SPECIFIED\nTHE ORIGINAL TICKET MUST BE ANNOTATED - REFUNDABLE - IN\nTHE ENDORSEMENT BOX." }, { "name": "19. CHILDREN DISCOUNTS", "value": "UNLESS OTHERWISE SPECIFIED\nACCOMPANIED CHILD 2-11 - CHARGE 100 PERCENT OF THE FARE.\nTICKET DESIGNATOR - CH.\nMUST BE ACCOMPANIED ON ALL FLIGHTS IN SAME COMPARTMENT\nBY ADULT 18 OR OLDER\nOR - CBC 2-11 - CHARGE 100 PERCENT OF THE FARE.\nTICKET DESIGNATOR - CH.\nMUST BE ACCOMPANIED ON ALL FLIGHTS IN SAME\nCOMPARTMENT BY PFA 18 OR OLDER\nOR - HNN 2-11 - CHARGE 100 PERCENT OF THE FARE.\nTICKET DESIGNATOR - CH.\nMUST BE ACCOMPANIED ON ALL FLIGHTS IN SAME\nCOMPARTMENT BY PFA 18 OR OLDER\nOR - CONTRACT BULK CHILD 2-11 - CHARGE 100 PERCENT OF THE\nFARE.\nTICKET DESIGNATOR - CH.\nMUST BE ACCOMPANIED ON ALL FLIGHTS IN SAME\nCOMPARTMENT BY CONTRACT BULK ADULT 18 OR OLDER\nOR - 1ST INFANT UNDER 2 WITHOUT A SEAT - NO CHARGE\nTICKET DESIGNATOR - IN.\nMUST BE ACCOMPANIED ON ALL FLIGHTS IN SAME\nCOMPARTMENT BY ADULT 18 OR OLDER\nOR - 1ST CONTRACT BULK INFANT WITHOUT A SEAT UNDER 2 - NO\nCHARGE\nTICKET DESIGNATOR - IN.\nMUST BE ACCOMPANIED ON ALL FLIGHTS IN SAME\nCOMPARTMENT BY CONTRACT BULK ADULT 18 OR OLDER\nOR - 1ST CBI UNDER 2 - NO CHARGE\nTICKET DESIGNATOR - IN.\nMUST BE ACCOMPANIED ON ALL FLIGHTS IN SAME\nCOMPARTMENT BY PFA 18 OR OLDER\nOR - 1ST PIF UNDER 2 - NO CHARGE\nTICKET DESIGNATOR - IN.\nMUST BE ACCOMPANIED ON ALL FLIGHTS IN SAME\nCOMPARTMENT BY PFA 18 OR OLDER\nOR - INFANT UNDER 2 WITH A SEAT - CHARGE 100 PERCENT OF\nTHE FARE.\nTICKET DESIGNATOR - CH.\nMUST BE ACCOMPANIED ON ALL FLIGHTS IN SAME\nCOMPARTMENT BY ADULT 18 OR OLDER\nOR - CONTRACT BULK INFANT WITH A SEAT UNDER 2 - CHARGE 100\nPERCENT OF THE FARE.\nTICKET DESIGNATOR - CH.\nMUST BE ACCOMPANIED ON ALL FLIGHTS IN SAME\nCOMPARTMENT BY CONTRACT BULK ADULT 18 OR OLDER\nOR - UNACCOMPANIED CHILD 5-14 - CHARGE 100 PERCENT OF THE\nFARE." }, { "name": "23. MISCELLANEOUS PROVISIONS", "value": "UNLESS OTHERWISE SPECIFIED\nTHIS FARE MUST NOT BE USED AS THE HIGH OR THE LOW FARE\nWHEN CALCULATING A DIFFERENTIAL. THIS FARE MUST NOT BE\nUSED AS THE THROUGH FARE WHEN PRICING A FARE COMPONENT\nWITH A DIFFERENTIAL." }, { "name": "31. VOLUNTARY CHANGES", "value": "DO A CATEGORY 31 SPECIFIC TEXT ENTRY TO VIEW CONTENTS\nALSO REFERENCE 16 PENALTIES - FOR ADDITIONAL CHANGE INFORMATION" }, { "name": "33. VOLUNTARY REFUNDS", "value": "FOR ONE WAY &amp;&amp;&amp;&amp;&amp;&amp;&amp;M TYPE FARES NOTE - RULE REFX IN DGR\nAPPLIES\nUNLESS OTHERWISE SPECIFIED\nREFUND MUST BE REQUESTED BEFORE DEPARTURE OF JOURNEY.\nNO CHARGE. IF ALL PENALTIES IN PRICING UNIT ARE PER\nPRICING UNIT COLLECT HIGHEST. IF MIX OF PER FARE\nCOMPONENT AND PER PRICING UNIT CALCULATE EACH AS PER\nPRICING UNIT AND COLLECT HIGHEST.\nREFUND REQUEST MUST BE LESS THAN ONE YEAR AFTER TICKET\nISSUANCE. FORM OF REFUND - ORIGINAL FORM OF PAYMENT. ONLY\nVALIDATING CARRIER MAY REFUND TICKET.\nREPRICE USING EQUAL OR HIGHER RBD.\nOR -\nREFUND MUST BE REQUESTED AFTER DEPARTURE OF JOURNEY.\nNO CHARGE. IF ALL PENALTIES IN PRICING UNIT ARE PER\nPRICING UNIT COLLECT HIGHEST. IF MIX OF PER FARE\nCOMPONENT AND PER PRICING UNIT CALCULATE EACH AS PER\nPRICING UNIT AND COLLECT HIGHEST.\nREFUND REQUEST MUST BE LESS THAN ONE YEAR AFTER TRAVEL\nCOMMENCEMENT DATE IF PARTIALLY USED OR ONE YEAR AFTER\nTICKET ISSUANCE IF TICKET UNUSED. FORM OF REFUND -\nORIGINAL FORM OF PAYMENT. ONLY VALIDATING CARRIER MAY\nREFUND TICKET.\nREPRICE FLOWN PORTION USING FARES IN EFFECT ON TICKET\nISSUANCE DATE. FOR FULLY FLOWN FARE COMPONENTS FARE BREAK\nPOINTS MAY NOT BE CHANGED. FOR PARTIALLY FLOWN FARE\nCOMPONENTS ONLY DESTINATION FARE BREAK POINTS MAY BE\nCHANGED. REPRICE USING NORMAL/SPECIAL ONE WAY/ROUND TRIP\nFARES/ANY RULE/FARE CLASS/EQUAL OR HIGHER RBD. PUBLIC\nFARES ARE USED IF TICKETED FARE IS IN PUBLIC TARIFF.\nQUALIFIED PRIVATE FARES OR PUBLIC FARES ARE USED IF\nTICKETED FARE IS IN PRIVATE TARIFF. NEW FARE FOR FULLY\nFLOWN FARE COMPONENTS MUST BE EQUAL TO OR HIGHER THAN\nTICKETED FARE.\nOR -\nAPPLIES FOR FARE COMPONENTS THAT ARE FULLY FLOWN. REFUND\nMUST BE REQUESTED AFTER DEPARTURE OF JOURNEY.\nNO CHARGE. IF ALL PENALTIES IN PRICING UNIT ARE PER\nPRICING UNIT COLLECT HIGHEST. IF MIX OF PER FARE\nCOMPONENT AND PER PRICING UNIT CALCULATE EACH AS PER\nPRICING UNIT AND COLLECT HIGHEST.\nREFUND REQUEST MUST BE LESS THAN ONE YEAR AFTER TRAVEL\nCOMMENCEMENT DATE IF PARTIALLY USED OR ONE YEAR AFTER\nTICKET ISSUANCE IF TICKET UNUSED. FORM OF REFUND -\nORIGINAL FORM OF PAYMENT. ONLY VALIDATING CARRIER MAY\nREFUND TICKET.\nREPRICE FLOWN PORTION USING FARES IN EFFECT ON TICKET\nISSUANCE DATE. FOR FULLY FLOWN FARE COMPONENTS FARE BREAK\nPOINTS MAY NOT BE CHANGED. FOR PARTIALLY FLOWN FARE\nCOMPONENTS ONLY DESTINATION FARE BREAK POINTS MAY BE\nCHANGED. REPRICE USING NORMAL/SPECIAL ONE WAY/ROUND TRIP\nFARES/ANY RULE/FARE CLASS/EQUAL OR HIGHER RBD. PUBLIC\nFARES ARE USED IF TICKETED FARE IS IN PUBLIC TARIFF.\nQUALIFIED PRIVATE FARES OR PUBLIC FARES ARE USED IF\nTICKETED FARE IS IN PRIVATE TARIFF. NEW FARE FOR FULLY\nFLOWN FARE COMPONENTS MUST BE EQUAL TO OR HIGHER THAN" } ] } ], "Identifier": { "value": "o1_FR" }, "ReferenceList": [ { "@type": "ReferenceListFlight", "Flight": [ { "@type": "FlightDetail", "distance": 1709, "duration": "PT4H3M", "carrier": "UA", "number": "2188", "equipment": "739", "id": "s14", "Departure": { "@type": "DepartureDetail", "location": "DEN", "date": "2022-07-06", "time": "10:03:00" }, "Arrival": { "@type": "ArrivalDetail", "terminal": "1", "location": "FLL", "date": "2022-07-06", "time": "16:06:00" }, "AvailabilitySourceCode": "S" }, { "@type": "FlightDetail", "distance": 582, "duration": "PT2H2M", "carrier": "DL", "number": "2516", "equipment": "757", "id": "s15", "Departure": { "@type": "DepartureDetail", "terminal": "2", "location": "FLL", "date": "2022-07-06", "time": "17:11:00" }, "Arrival": { "@type": "ArrivalDetail", "terminal": "S", "location": "ATL", "date": "2022-07-06", "time": "19:13:00" }, "AvailabilitySourceCode": "S" } ] } ] } }

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
 "FareRuleListResponse": {
  "@type": "FareRuleListResponse",
  "transactionId": "bcb69bc5-9452-4e95-ba85-6753d9af182e",
  "FareRule": [
   {
    "@type": "FareRuleStructured",
    "Flight": [
     {
      "@type": "FlightID",
      "FlightRef": "f1"
     }
    ],
    "StructuredFareRules": [
     {
      "@type": "StructuredFareRules",
      "passengerTypeCodes": [
       "ADT"
      ],
      "fareClassCode": "&amp;&amp;&amp;YX&amp;&amp;&amp;",
      "oneWayRoundTripRestrictions": "All",
      "Penalties": [
       {
        "@type": "Penalties",
        "ruleNumber": "DO16",
        "tariffNumber": "060",
        "Change": [
         {
          "@type": "ChangePermitted",
          "penaltyTypes": [
           "ExchangeRequired",
           "ExchangeNotRequired"
          ],
          "Penalty": [
           {
            "@type": "PenaltyAmount",
            "Amount": {
             "code": "INR",
             "minorUnit": 0,
             "value": 3000
            }
           }
          ]
         }
        ]
       },
       {
        "@type": "Penalties",
        "ruleNumber": "DO16",
        "tariffNumber": "060",
        "Cancel": [
         {
          "@type": "CancelPermitted",
          "Penalty": [
           {
            "@type": "PenaltyAmount",
            "Amount": {
             "code": "INR",
             "minorUnit": 0,
             "value": 4000
            }
           }
          ]
         }
        ]
       },
       {
        "@type": "Penalties",
        "ruleNumber": "DO16",
        "tariffNumber": "060",
        "Change": [
         {
          "@type": "ChangeNotPermitted",
          "NotPermittedInd": "true"
         }
        ]
       },
       {
        "@type": "Penalties",
        "ruleNumber": "DO16",
        "tariffNumber": "060",
        "Cancel": [
         {
          "@type": "CancelNotPermitted",
          "NotPermittedInd": "true"
         }
        ]
       }
      ]
     },
     {
      "@type": "StructuredFareRules",
      "MinimumStay": [
       {
        "@type": "MinimumStayIndeterminate",
        "IndeterminateInd": "true"
       }
      ]
     },
     {
      "@type": "StructuredFareRules",
      "MaximumStay": [
       {
        "@type": "MaximumStayIndeterminate",
        "IndeterminateInd": "true"
       }
      ]
     },
     {
      "@type": "StructuredFareRules",
      "passengerTypeCodes": [
       "ADT"
      ],
      "oneWayRoundTripRestrictions": "All",
      "Stopover": [
       {
        "@type": "StopoverNotPermitted",
        "ruleNumber": "DO00",
        "tariffNumber": "060",
        "NotPermittedInd": "true"
       }
      ]
     },
     {
      "@type": "StructuredFareRules",
      "passengerTypeCodes": [
       "ADT"
      ],
      "oneWayRoundTripRestrictions": "All",
      "AdvanceReservation": [
       {
        "@type": "AdvanceReservationRequired",
        "instantPurchase": "No",
        "ruleNumber": "DO00",
        "tariffNumber": "060",
        "WaitlistStandbyCondition": [
         {
          "value": "WaitlistStandbyNotPermitted"
         }
        ]
       }
      ]
     },
     {
      "@type": "StructuredFareRules",
      "passengerTypeCodes": [
       "ADT"
      ],
      "fareClassCode": "&amp;&amp;&amp;YX&amp;&amp;&amp;",
      "oneWayRoundTripRestrictions": "All",
      "Penalties": [
       {
        "@type": "Penalties",
        "ruleNumber": "DO33",
        "tariffNumber": "060",
        "Cancel": [
         {
          "@type": "CancelPermitted",
          "penaltyTypes": [
           "Anytime"
          ],
          "PenaltyAppliesTo": "OneWay",
          "PenaltyAppliesToPricingUnit": "Anytime",
          "PenaltyAppliesToFareComponent": "Anytime"
         }
        ],
        "PenaltySourceCode": {
         "codeContext": "ATPCO",
         "value": "33"
        }
       },
       {
        "@type": "Penalties",
        "ruleNumber": "DO33",
        "tariffNumber": "060",
        "Cancel": [
         {
          "@type": "CancelPermitted",
          "penaltyTypes": [
           "Anytime"
          ],
          "PenaltyAppliesTo": "OneWay",
          "PenaltyAppliesToPricingUnit": "Anytime",
          "PenaltyAppliesToFareComponent": "Anytime"
         }
        ],
        "PenaltySourceCode": {
         "codeContext": "ATPCO",
         "value": "33"
        },
        "PassengerTypeCodes": [
         "INF"
        ]
       },
       {
        "@type": "Penalties",
        "ruleNumber": "DO33",
        "tariffNumber": "060",
        "Cancel": [
         {
          "@type": "CancelPermitted",
          "penaltyTypes": [
           "BeforeDeparture"
          ],
          "PenaltyAppliesTo": "OneWay",
          "PenaltyAppliesToPricingUnit": "Anytime",
          "PenaltyAppliesToFareComponent": "Anytime",
          "PenaltyException": {
           "period": "Hours",
           "appliesAfterReservationInd": true,
           "value": 24
          }
         }
        ],
        "PenaltySourceCode": {
         "codeContext": "ATPCO",
         "value": "33"
        }
       },
       {
        "@type": "Penalties",
        "ruleNumber": "DO33",
        "tariffNumber": "060",
        "Cancel": [
         {
          "@type": "CancelPermitted",
          "penaltyTypes": [
           "Anytime",
           "BeforeDeparture"
          ],
          "PenaltyAppliesTo": "OneWay",
          "Penalty": [
           {
            "@type": "PenaltyAmount",
            "Amount": {
             "code": "INR",
             "minorUnit": 0,
             "value": 4000
            }
           }
          ],
          "PenaltyAppliesToPricingUnit": "Anytime",
          "PenaltyAppliesToFareComponent": "Anytime",
          "PeriodBeforeDeparture": {
           "period": "Hours",
           "value": 2
          }
         }
        ],
        "PenaltySourceCode": {
         "codeContext": "ATPCO",
         "value": "33"
        }
       },
       {
        "@type": "Penalties",
        "ruleNumber": "DO33",
        "tariffNumber": "060",
        "Cancel": [
         {
          "@type": "CancelNotPermitted",
          "penaltyTypes": [
           "NoShow"
          ],
          "NotPermittedInd": "true"
         }
        ],
        "PenaltySourceCode": {
         "codeContext": "ATPCO",
         "value": "33"
        }
       },
       {
        "@type": "Penalties",
        "ruleNumber": "DO33",
        "tariffNumber": "060",
        "Cancel": [
         {
          "@type": "CancelPermitted",
          "penaltyTypes": [
           "AfterDeparture"
          ],
          "PenaltyAppliesTo": "OneWay",
          "Penalty": [
           {
            "@type": "Penalty",
            "application": "Full"
           }
          ],
          "PenaltyAppliesToPricingUnit": "Anytime",
          "PenaltyAppliesToFareComponent": "Anytime"
         }
        ],
        "PenaltySourceCode": {
         "codeContext": "ATPCO",
         "value": "33"
        }
       }
      ]
     },
     {
      "@type": "StructuredFareRules",
      "passengerTypeCodes": [
       "ADT"
      ],
      "fareClassCode": "&amp;&amp;&amp;YX&amp;&amp;&amp;",
      "oneWayRoundTripRestrictions": "All",
      "Penalties": [
       {
        "@type": "Penalties",
        "ruleNumber": "DO31",
        "tariffNumber": "060",
        "Change": [
         {
          "@type": "ChangePermitted",
          "penaltyTypes": [
           "Anytime"
          ],
          "PenaltyAppliesToPricingUnit": "Anytime",
          "PenaltyAppliesToFareComponent": "Anytime"
         }
        ],
        "PenaltySourceCode": {
         "codeContext": "ATPCO",
         "value": "31"
        }
       },
       {
 
…
```

### Block 2

```
{
 "FareRuleListResponse": {
  "@type": "FareRuleListResponse",
  "transactionId": "c333b955-1f78-4461-92c6-d734a42a07b1",
  "FareRule": [
   {
    "@type": "FareRuleText",
    "ruleNumber": "AEC4",
    "tariffNumber": "033",
    "id": "VAOXAEC4",
    "Flight": [
     {
      "@type": "Flight",
      "FlightRef": "f1"
     },
     {
      "@type": "Flight",
      "FlightRef": "f2"
     }
    ],
    "TextFareRule": [
     {
      "name": "Eligibility",
      "value": "CONDITIONS APPLY"
     },
     {
      "name": "Day/Time",
      "value": ""
     },
     {
      "name": "Seasonal",
      "value": ""
     },
     {
      "name": "Flight Application",
      "value": "NOT SV 5000-9999.SV ONLY"
     },
     {
      "name": "Advance Res/Tkt",
      "value": "CONDITIONS APPLY"
     },
     {
      "name": "Minimum Stay",
      "value": ""
     },
     {
      "name": "Maximum Stay",
      "value": ""
     },
     {
      "name": "Stopovers",
      "value": "CONDITIONS APPLY"
     },
     {
      "name": "Transfers/Routing",
      "value": "CONDITIONS APPLY"
     },
     {
      "name": "Permitted Combinations",
      "value": "SOJ/RT/CT"
     },
     {
      "name": "Blackouts",
      "value": ""
     },
     {
      "name": "Surcharges",
      "value": "CONDITIONS APPLY"
     },
     {
      "name": "Accompanied",
      "value": ""
     },
     {
      "name": "Travel Restrictions",
      "value": ""
     },
     {
      "name": "Sales Restrictions",
      "value": "CONDITIONS APPLY"
     },
     {
      "name": "Penalties",
      "value": "CHG BEF DEP-100SAR/CXL BEF DEP-150SAR/CHG CXL AFT DEP-550SAR"
     },
     {
      "name": "Children's Discounts",
      "value": "ACC CHD 2-11 75PCT.UNACC CHD 2-11 100PCT"
     },
     {
      "name": "All other Disc",
      "value": ""
     }
    ]
   },
   {
    "@type": "FareRuleText",
    "ruleNumber": "BLAE",
    "tariffNumber": "033",
    "id": "ULOWBLAE",
    "Flight": [
     {
      "@type": "Flight",
      "FlightRef": "f1"
     },
     {
      "@type": "Flight",
      "FlightRef": "f2"
     }
    ],
    "TextFareRule": [
     {
      "name": "Eligibility",
      "value": ""
     },
     {
      "name": "Day/Time",
      "value": ""
     },
     {
      "name": "Seasonal",
      "value": ""
     },
     {
      "name": "Flight Application",
      "value": "CONDITIONS APPLY"
     },
     {
      "name": "Advance Res/Tkt",
      "value": "CONDITIONS APPLY"
     },
     {
      "name": "Minimum Stay",
      "value": ""
     },
     {
      "name": "Maximum Stay",
      "value": ""
     },
     {
      "name": "Stopovers",
      "value": "CONDITIONS APPLY"
     },
     {
      "name": "Transfers/Routing",
      "value": "CONDITIONS APPLY"
     },
     {
      "name": "Blackouts",
      "value": ""
     },
     {
      "name": "Surcharges",
      "value": "CONDITIONS APPLY |"
     },
     {
      "name": "Accompanied",
      "value": ""
     },
     {
      "name": "Travel Restrictions",
      "value": ""
     },
     {
      "name": "Sales Restrictions",
      "value": "CONDITIONS APPLY"
     },
     {
      "name": "Penalties",
      "value": "CHG-3000INR/CXL-6000INR/CHG CXL-6000INR"
     },
     {
      "name": "Children's Discounts",
      "value": "ACC CHD 2-11 75PCT.UNACC CHD 5-11 100PCT"
     },
     {
      "name": "All other Disc",
      "value": ""
     }
    ]
   }
  ],
  "Identifier": {
   "value": "93d2091d-3d04-48ab-8091-6ae1525f02ea_PC_FR"
  },
  "ReferenceList": [
   {
    "@type": "ReferenceListFlight",
    "Flight": [
     {
      "@type": "FlightDetail",
      "distance": 284,
      "duration": "PT1H15M",
      "carrier": "AI",
      "number": "516",
      "operatingCarrier": "AI",
      "operatingCarrierName": "Air India",
      "equipment": "321",
      "id": "f1",
      "Departure": {
       "@type": "Departure",
       "location": "BLR",
       "date": "2024-10-23",
       "time": "07:25:00"
      },
      "Arrival": {
       "@type": "Arrival",
       "location": "HYD",
       "date": "2024-10-23",
       "time": "08:40:00"
      },
      "AvailabilitySourceCode": "S"
     },
     {
      "@type": "FlightDetail",
      "distance": 1586,
      "duration": "PT3H55M",
      "carrier": "AI",
      "number": "951",
      "operatingCarrier": "AI",
      "operatingCarrierName": "Air India",
      "equipment": "32N",
      "id": "f2",
      "Departure": {
       "@type": "Departure",
       "location": "HYD",
       "date": "2024-10-23",
       "time": "20:00:00"
      },
      "Arrival": {
       "@type": "Arrival",
       "location": "DXB",
       "date": "2024-10-23",
       "time": "22:25:00"
      },
      "AvailabilitySourceCode": "S"
     },
     {
      "@type": "FlightDetail",
      "distance": 1048,
      "duration": "PT3H25M",
      "carrier": "SV",
      "number": "551",
      "operatingCarrier": "SV",
      "operatingCarrierName": "Saudi Arabian Airlines",
      "equipment": "320",
      "id": "f1",
      "Departure": {
       "@type": "Departure",
       "location": "DXB",
       "date": "2024-10-27",
       "time": "21:00:00"
      },
      "Arrival": {
       "@type": "Arrival",
       "location": "JED",
       "date": "2024-10-27",
       "time": "23:25:00"
      },
      "AvailabilitySourceCode": "A"
     },
     {
      "@type": "FlightDetail",
      "distance": 2597,
      "duration": "PT5H20M",
      "carrier": "SV",
      "number": "866",
      "operatingCarrier": "SV",
      "operatingCarrierName": "Saudi Arabian Airlines",
      "equipment": "333",
      "id": "f2",
      "Departure": {
       "@type": "Departure",
       "location": "JED",
       "date": "2024-10-28",
       "time": "01:25:00"
      },
      "Arrival": {
       "@type": "Arrival",
       "location": "BLR",
       "date": "2024-10-28",
       "time": "09:15:00"
      },
      "AvailabilitySourceCode": "A"
     }
    ]
   }
  ]
 }
}
```

### Block 3

```
{
 "FareRuleListResponse": {
  "@type": "FareRuleListResponse",
  "transactionId": "427eaa96-0bd4-4d55-b67b-ecfcdc042478",
  "FareRule": [
   {
    "@type": "FareRuleStructured",
    "Flight": [
     {
      "@type": "Flight",
      "FlightRef": "AAs46"
     },
     {
      "@type": "Flight",
      "FlightRef": "AAs47"
     },
     {
      "@type": "Flight",
      "FlightRef": "AAs9"
     }
    ],
    "StructuredFareRules": [
     {
      "@type": "StructuredFareRules",
      "Penalties": [
       {
        "@type": "Penalties",
        "Change": [
         {
          "@type": "ChangePermitted"
         }
        ],
        "Cancel": [
         {
          "@type": "CancelPermitted"
         }
        ],
        "PassengerTypeCodes": [
         "ADT"
        ]
       }
      ]
     }
    ]
   }
  ],
  "Identifier": {
   "value": "6f47ba13-8fac-4044-9398-a9c11672b6bd_FR"
  },
  "ReferenceList": [
   {
    "@type": "ReferenceListFlight",
    "Flight": [
     {
      "@type": "FlightDetail",
      "distance": 3454,
      "stops": 0,
      "duration": "PT8H15M",
      "carrier": "AA",
      "number": "6944",
      "operatingCarrier": "BA",
      "operatingCarrierName": "British Airways",
      "equipment": "777",
      "id": "AAs46",
      "Departure": {
       "@type": "DepartureDetail",
       "terminal": "5",
       "location": "LHR",
       "date": "2024-02-29",
       "time": "10:45:00"
      },
      "Arrival": {
       "@type": "ArrivalDetail",
       "terminal": "B",
       "location": "EWR",
       "date": "2024-02-29",
       "time": "14:00:00"
      }
     },
     {
      "@type": "FlightDetail",
      "distance": 528,
      "stops": 0,
      "duration": "PT2H6M",
      "carrier": "AA",
      "number": "1790",
      "equipment": "320",
      "id": "AAs47",
      "Departure": {
       "@type": "DepartureDetail",
       "terminal": "A",
       "location": "EWR",
       "date": "2024-02-29",
       "time": "16:07:00"
      },
      "Arrival": {
       "@type": "ArrivalDetail",
       "location": "CLT",
       "date": "2024-02-29",
       "time": "18:13:00"
      }
     },
     {
      "@type": "FlightDetail",
      "distance": 226,
      "stops": 0,
      "duration": "PT1H13M",
      "carrier": "AA",
      "number": "763",
      "equipment": "319",
      "id": "AAs9",
      "Departure": {
       "@type": "DepartureDetail",
       "location": "CLT",
       "date": "2024-02-29",
       "time": "20:20:00"
      },
      "Arrival": {
       "@type": "ArrivalDetail",
       "terminal": "N",
       "location": "ATL",
       "date": "2024-02-29",
       "time": "21:33:00"
      }
     }
    ]
   }
  ]
 }
}
```

### Block 4

```
{
 "FareRuleListResponse": {
  "transactionId": "b06015b1-6ddb-48a0-8083-5f440eba5a98:p",
  "FareRule": [
   {
    "@type": "FareRuleText",
    "ruleNumber": "70J",
    "id": "NKSOA",
    "Flight": [
     {
      "@type": "Flight",
      "FlightRef": "f1"
     }
    ],
    "TextFareRule": [
     {
      "name": "Cancel",
      "value": "ADT:Allowed"
     },
     {
      "name": "Change",
      "value": "ADT:Allowed"
     }
    ]
   }
  ],
  "Identifier": {
   "value": "5e848a34-6ec1-4be3-bcd1-30d41c00e206_PC_FR"
  },
  "ReferenceList": [
   {
    "@type": "ReferenceListFlight",
    "Flight": [
     {
      "@type": "Flight",
      "duration": "PT8H40M",
      "carrier": "QF",
      "number": "81",
      "equipment": "333",
      "id": "f1",
      "FlightRef": "f1",
      "Identifier": {
       "value": "Isgm01004a1a265a6"
      },
      "Departure": {
       "@type": "DepartureDetail",
       "terminal": "1",
       "location": "SYD",
       "date": "2022-07-09",
       "time": "10:10:00"
      },
      "Arrival": {
       "@type": "ArrivalDetail",
       "terminal": "1",
       "location": "SIN",
       "date": "2022-07-09",
       "time": "16:50:00"
      }
     }
    ]
   }
  ]
 }
}
```

### Block 5

```
{
 "FareRuleListResponse": {
  "transactionId": "ef0b8a9c-0ff7-4cc1-a250-17755a6c8d22:p",
  "FareRule": [
   {
    "@type": "FareRuleText",
    "ruleNumber": "9000",
    "id": "W0",
    "Flight": [
     {
      "@type": "Flight",
      "FlightRef": "s15"
     }
    ],
    "TextFareRule": [
     {
      "name": "0.  APPLICATION AND OTHER CONDITIONS",
      "value": "RULE - 011/9000\nUNLESS OTHERWISE SPECIFIED\nMAIN CABIN FARES\nAPPLICATION\nCLASS OF SERVICE\nTHESE FARES APPLY FOR ECONOMY CLASS SERVICE.\nCAPACITY LIMITATIONS\nSEATS ARE LIMITED"
     },
     {
      "name": "4.  FLIGHT APPLICATION",
      "value": "UNLESS OTHERWISE SPECIFIED   NOTE - RULE FLT1 IN DGR\nAPPLIES\nUNLESS OTHERWISE SPECIFIED\nTHE FARE COMPONENT MUST BE ON\nONE OR MORE OF THE FOLLOWING\nANY DL FLIGHT."
     },
     {
      "name": "5.  ADVANCE RES/TICKETING",
      "value": "FOR W0 FARES\nRESERVATIONS ARE REQUIRED FOR ALL SECTORS.\nWHEN RESERVATIONS ARE MADE AT LEAST 33 DAYS BEFORE\nDEPARTURE TICKETING MUST BE COMPLETED AT LEAST 30 DAYS\nBEFORE DEPARTURE.\nOR - RESERVATIONS ARE REQUIRED FOR ALL SECTORS.\nWHEN RESERVATIONS ARE MADE AT LEAST 4 DAYS BEFORE\nDEPARTURE TICKETING MUST BE COMPLETED AT LEAST 3 DAYS\nBEFORE DEPARTURE.\nOR - RESERVATIONS ARE REQUIRED FOR ALL SECTORS.\nTICKETING MUST BE COMPLETED BY MIDNIGHT 1 DAY AFTER\nRESERVATIONS ARE MADE."
     },
     {
      "name": "6.  MINIMUM STAY",
      "value": "NONE FOR ONE WAY FARES"
     },
     {
      "name": "7.  MAXIMUM STAY",
      "value": "NONE FOR ONE WAY FARES"
     },
     {
      "name": "8.  STOPOVERS",
      "value": "UNLESS OTHERWISE SPECIFIED   NOTE - RULE STOP IN DGR APPLIES\nUNLESS OTHERWISE SPECIFIED\nNO STOPOVERS PERMITTED."
     },
     {
      "name": "9.  TRANSFERS",
      "value": "UNLESS OTHERWISE SPECIFIED   NOTE - RULE CAT9 IN DGR\nAPPLIES\nUNLESS OTHERWISE SPECIFIED\n2 TRANSFERS PERMITTED IN EACH DIRECTION\nONLINE ON THE PRIMARY CARRIER\nFARE BREAK AND EMBEDDED SURFACE SECTORS NOT PERMITTED ON\nTHE FARE COMPONENT."
     },
     {
      "name": "10. PERMITTED COMBINATIONS",
      "value": "UNLESS OTHERWISE SPECIFIED\nDOUBLE OPEN JAWS NOT PERMITTED.\nAPPLICABLE ADD-ON CONSTRUCTION IS ADDRESSED IN\nMISCELLANEOUS PROVISIONS - CATEGORY 23.\nEND-ON-END\nEND-ON-END COMBINATIONS PERMITTED. VALIDATE ALL FARE\nCOMPONENTS. SIDE TRIPS PERMITTED.\nPROVIDED -\nCOMBINATIONS ARE FOR CARRIER DL/AF/AZ/KL/VA\nEND-ON-END\nEND-ON-END COMBINATIONS PERMITTED WITH US-CANADA\nTRANSBORDER/DOMESTIC FARES. VALIDATE ALL FARE\nCOMPONENTS. SIDE TRIPS PERMITTED.\nPROVIDED -\nCOMBINATIONS ARE FOR CARRIER DL/UA/AS/WS/KS/HA/9K/7H\nOPEN JAWS/2-COMPONENT CIRCLE TRIPS/MULTI-COMPONENT CIRCLE\nTRIPS\nFARES MAY BE COMBINED ON A HALF ROUND TRIP BASIS WITH DL\nFARES IN ANY RULE AND TARIFF.\n-TO FORM SINGLE OPEN JAWS.\nA MAXIMUM OF 2 FARE COMPONENTS PERMITTED.\nMILEAGE OF THE OPEN SEGMENT MUST BE EQUAL/LESS THAN\nMILEAGE OF THE SHORTEST FLOWN FARE COMPONENT.\n-TO FORM 2-COMPONENT CIRCLE TRIPS\n-TO FORM MULTI-COMPONENT CIRCLE TRIPS\nA MAXIMUM OF 2 FARE BREAK POINTS PERMITTED.\nEND-ON-END\nEND-ON-END COMBINATIONS PERMITTED WITH FARES FROM/TO\nLWB/MEI/MSL/PIB/TUP/GLH/MCN/BIL. VALIDATE ALL FARE\nCOMPONENTS. SIDE TRIPS PERMITTED.\nPROVIDED -\nCOMBINATIONS ARE FOR CARRIER DL/3M\nNOTE - THE CITY PAIRS BELOW ARE CONSIDERED THE SAME POINT-\nBWI-WAS  FLL-MIA  LAX-ONT  LAX-SNA  NYC-EWR  OAK-SFO\nOAK-SJC  SFO-SJC  LAX-BUR"
     },
     {
      "name": "12. SURCHARGES",
      "value": "FOR W0 FARES   NOTE - RULE SCOT IN DGR ALSO APPLIES\nIF INFANT 0-1 WITHOUT A SEAT.\nTHERE IS NO CHARGE FOR TRAVEL PER FARE COMPONENT.\nA SURCHARGE OF USD 46.51 PER FARE COMPONENT WILL BE ADDED\nTO THE APPLICABLE FARE FOR TRAVEL IN BOEING 767-300\nEQUIPMENT.\nAND - A SURCHARGE OF USD 46.51 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL IN AIRBUS\nINDUSTRIE A330-900NEO EQUIPMENT.\nAND - A SURCHARGE OF USD 46.51 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL IN AIRBUS\nINDUSTRIE A350-900 EQUIPMENT.\nAND - A SURCHARGE OF USD 46.51 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL IN BOEING\n767-400 EQUIPMENT.\nFROM/TO FLORIDA\nIF INFANT 0-1 WITHOUT A SEAT.\nTHERE IS NO CHARGE FOR TRAVEL PER FARE COMPONENT.\nTO FLORIDA -\nA SURCHARGE OF USD 18.60 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 18FEB 23.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - FROM FLORIDA -\nA SURCHARGE OF USD 18.60 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL FROM 25FEB 23\nTHROUGH 26FEB 23.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 27.91 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL FROM\n26MAY 22 THROUGH 27MAY 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 32.56 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 30MAY 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 18.60 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON MON/THU\nFROM 04JUN 22 THROUGH 13JUN 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 27.91 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON FRI FROM\n04JUN 22 THROUGH 13JUN 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 23.26 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON SAT FROM\n04JUN 22 THROUGH 13JUN 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 32.56 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON SUN FROM\n04JUN 22 THROUGH 13JUN 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 27.91 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL FROM\n16JUN 22 THROUGH 17JUN 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 18.60 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL FROM\n18JUN 22 THROUGH 19JUN 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 27.91 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 20JUN 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 18.60 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 23JUN 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 27.91 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 24JUN 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 23.26 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 25JUN 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 32.56 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 26JUN 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 18.60 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 27JUN 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 27.91 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 30JUN 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 37.21 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 01JUL 22.\nNOTE -\nTHIS PEAK TRAVEL SURCHARGE IS ASSESSED ON A FARE\nCOMPONENT BASIS.\nAND - A SURCHARGE OF USD 27.91 PER FARE COMPONENT WILL BE\nADDED TO THE APPLICABLE FARE FOR TRAVEL ON 02JUL 22.
…
```

