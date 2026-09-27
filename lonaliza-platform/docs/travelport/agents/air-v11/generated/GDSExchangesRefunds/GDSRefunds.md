# GDS Automated Refunds

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/GDSExchangesRefunds/GDSRefunds.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

GDS Automated Refunds Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search GDS Automated Refunds The Refund Quote and Cancel APIs support GDS automated refunds, which allow you to request a quote for the refund amount and any penalties and then issue the refund. By default the itinerary is canceled; however, you can retain the offer as a held booking for later ticketing. In this topic: Refund Support Refund Workflow Refund Steps Post-Commit Workbench API Endpoint Refund Quote API Endpoint Request Payload Response Payload Example Request Example Response Cancel API&#160;Reference Endpoint Header Parameters Response Payload Example Response Refund Support You must be specifically provisioned for refunds through the JSON &#160;APIs. Contact your account representative with any questions. Refunds are supported as follows: Only voluntary refunds (passenger has requested the refund). Refunds only to original form of payment (FOP). Active reservation with active ticketed filed fare. Public fares only. Conjunction tickets. Tickets with reservations created and ticketed at a United States (US)&#160;or India POS. Wholly unflown domestic itineraries: No travel has taken place and the flight coupons are in OPEN status. Domestic travel here is defined as itineraries with all flights within India, or itineraries with all flights within the US. Not supported for previously exchanged tickets, or tickets with multiple offers. Refund Workflow The GDS refunds process uses the following API&#160;requests. Step # Booking Workflow Step Description and Notes 1 Post-Commit Workbench Initiate a workbench for the existing booking. 2 Refund Quote Determine what if any refund value may be available on the ticket. A refund does not necessarily mean the passenger receives the full amount of the original ticket price. The airline may impose a cancellation penalty, and/or some taxes, fees, or charges may be non-refundable, depending on fare rules. The refundable amount is returned in Refund Quote. Refund Quote price details in the following objects; all objects provide a total amount and a breakdown by base fare, price, and taxes as applicable: Price:&#160;Amount paid for the ticket. ModifyPrice:&#160;Any amount eligible for refund. SupplierRetainedPrice:&#160;Any amount forfeited. 3 Cancel Cancels the ticket and issues a refund. Optionally, you can choose to issue the refund but retain the offer as a held booking.&#160;Retaining the offer allows you to re-ticket that offer in a subsequent session using the regular ticketing workflow . Refund Steps Post-Commit Workbench API&#160;Reference Start the refund process by initiating a post-commit workbench to create a session for the refund. Use the following endpoint. There is no request message payload. The response is the same as Reservation Retrieve response . POST book/session/reservationworkbench/buildfromlocator?Locator= {LocatorCode} For {LocatorCode} &#160;send the locator code returned at booking commit or in Reservation Retrieve in Receipt/Confirmation/Locator/value. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Refund Quote API&#160;Reference The Refund Quote API determines what if any refund value may be available on a ticket. Use the following endpoint. POST book/airoffer/reservationworkbench/{ {workbenchID} /offers/canceloffer For {workbenchID} send the workbench identifier returned in ReservationResponse/Identifer/value in the workbench create response. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Query Parameters None. Request Payload Send the message payload per below. Show Request Body Table Object Description Required/Optional OfferQueryCancelOffer Top level object. Required BuildFromOffer Top level object. Required OfferIdentifier Top level object. Required Identifier Top level object for the offer identifier. Required value Send the offer identifier for the offer to cancel and check refund status for. The offer identifier is returned in the Create Workbench response in Offer/Identifier/value. Required Response Payload The response includes the following objects. Show Response Body Table Object Description OfferListResponse Top level object. Includes OfferID object. OfferID Returns details of potential refund. For GDS&#160;refunds returned with @type OfferModify. Includes Identifier, ContentSource, Product, Price, TermsAndConditionsFull, ModifyPrice, SupplierRetainedPrice, ConsumedPrice. Identifier Offer identifier for the offer sent in request. Key value pairs: authority : Source of information. value : Unique system-generated identifier. ContentSource Identifies type of content, for GDS refunds, this value is GDS . Product Standard Product object with flight details for the offer as ticketed. One instance for each leg of the itinerary. See Reservation Retrieve for details. Price Returns the amounts paid for the ticket. Standard Price object with CurrencyCode, Base, TotalTaxes, TotalFees, TotalPrice (the total amount paid for the ticket), PriceBreakdown objects. See Reservation Retrieve for details. CurrencyCode The currency of the amounts. Key value pairs: value: &#160;String. Currency code. Base Number. The base amount of the price paid not including taxes and fees. TotalTaxes Number. Total of any taxes paid. TotalFees Number. Total of any fees paid. TotalPrice Number. Total amount paid for the ticket including base, taxes and fees. PriceBreakdown Array. Standard PriceBreakdown object to return detailed taxes and fees. See Reservation Retrieve for details. TermsAndConditionsFull TermsAndConditionsFull object with terms and conditions of the refund. Includes ExpiryDate and FareGuaranteePolicy. ExpiryDate The time the refund code expires, generally 30 minutes from workbench creation. If the refund code expires the workflow must be re-initiated. FareGuaranteePolicy Travelport's fare guarantee policy for the offer. EligibleforADMReview String.&#160;Returned with a value of Yes when the refund is eligible for an airline agency debit memo (ADM) review, which is the process where travel agencies dispute or validate financial penalties. Code Key value pair: value : String. Always returns G for guaranteed. ModifyPrice Returns the amounts eligible for refund. Standard Price object with CurrencyCode, Base, TotalTaxes, TotalFees, TotalPrice (the total amount eligible for refund), PriceBreakdown objects. See Reservation Retrieve for details. SupplierRetainedPrice Returns the amounts that are not eligible for refund. Standard Price object with CurrencyCode, Base, TotalTaxes, TotalFees, TotalPrice (the total amount that will not be refunded), PriceBreakdown objects. See Reservation Retrieve for details. ConsumedPrice Reserved for future use. Always returns zero amounts in same format as standard Price object. Example Request Show Example GDS Refund Quote request { "OfferQueryCancelOffer": { "BuildFromOffer": { "@type": "BuildFromOfferAir", "OfferIdentifier": { "Identifier": { "value": "4f38f61f-5e12-4453-8a44-830ea7d545eb" } } } } } Example Response In the response, ModifyPrice/TotalPrice returns the amount of any refund available. Show Example GDS Refund Quote response {"OfferListResponse": { "@type": "OfferListResponse", "transactionId": "ER-DW84WX-191", "traceId": "ER-DW84WX-109", "OfferID": [ { "@type": "OfferModify", "id": "offer_1", "Identifier": { "authority": "Travelport", "value": "4f38f61f-5e12-4453-8a44-830ea7d545eb" }, "ContentSource": "GDS", "Product": [ { "@type": "ProductAir", "id": "product_1", "Identifier": { "authority": "Travelport", "value": "b12e65c9-67e0-40d8-9025-17f38b890bb7" }, "FlightSegment": [ { "@type": "FlightSegment", "id": "FlightSegment_01", "sequence": 1, "Flight": { "@type": "Flight", "duration": "PT2H56M", "carrier": "DL", "number": "302", "equipment": "321", "id": "Flight_01", "Identifier": { "authority": "Travelport", "value": "a90fbf91-e96e-4892-b318-7e46a9264924" }, "Departure": { "@type": "DepartureDetail", "location": "DEN", "date": "2026-03-20", "time": "00:55:00" }, "Arrival": { "@type": "ArrivalDetail", "location": "ATL", "date": "2026-03-20", "time": "05:51:00" } } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 1 ], "classOfService": "W", "cabin": "PremiumEconomy", "fareBasisCode": "UAWQA0CL", "fareType": "PublicFare", "Brand": { "@type": "Brand", "name": "DELTA COMFORT CLASSIC", "tier": 5, "id": "000000000001943602" } } ] } ] }, { "@type": "ProductAir", "id": "product_2", "Identifier": { "authority": "Travelport", "value": "84c9447c-8542-4ded-bc70-2917579b9f2e" }, "FlightSegment": [ { "@type": "FlightSegment", "id": "FlightSegment_02", "sequence": 2, "Flight": { "@type": "Flight", "duration": "PT3H34M", "carrier": "DL", "number": "530", "equipment": "321", "id": "Flight_02", "Identifier": { "authority": "Travelport", "value": "b56f138c-9e97-412d-8346-d67e613c0760" }, "Departure": { "@type": "DepartureDetail", "location": "ATL", "date": "2026-03-30", "time": "10:21:00" }, "Arrival": { "@type": "ArrivalDetail", "location": "DEN", "date": "2026-03-30", "time": "11:55:00" } } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 2 ], "classOfService": "W", "cabin": "PremiumEconomy", "fareBasisCode": "UAWQA0CL", "fareType": "PublicFare", "Brand": { "@type": "Brand", "name": "DELTA COMFORT CLASSIC", "tier": 5, "id": "000000000001943602" } } ] } ] } ], "Price": { "@type": "PriceDetail", "id": "PriceDetail_1", "CurrencyCode": { "value": "USD" }, "Base": 564.06, "TotalTaxes": 73.1, "TotalFees": 0, "TotalPrice": 637.16, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "USD" }, "Base": 564.06, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 73.1, "TaxInfo": [ { "@type": "TaxInfo", "TaxCode": "XF", "Amount": 9, "TaxBreakdown": [ { "@type": "TaxBreakdown", "AirportCode": "DEN", "CurrencyCode": { "value": "USD" }, "Amount": 4.5 }, { "@type": "TaxBreakdown", "AirportCode": "ATL", "CurrencyCode": { "value": "USD" }, "Amount": 4.5 } ] }, { "@type": "TaxInfo", "TaxCode": "ZP", "Amount": 10.6, "TaxBreakdown": [ { "@type": "TaxBreakdown", "AirportCode": "DEN", "CurrencyCode": { "value": "USD" }, "Amount": 5.3 }, { "@type": "TaxBreakdown", "AirportCode": "ATL", "CurrencyCode": { "value": "USD" }, "Amount": 5.3 } ] } ], "Tax": [ { "taxCode": "AY", "value": 11.2 }, { "taxCode": "US", "value": 42.3 }, { "taxCode": "XF", "value": 9 }, { "taxCode": "ZP", "value": 10.6 } ] }, "Total": 637.16 }, "TravelerRefs": [ "travelerRefId_1" ] } ] }, "TermsAndConditionsFull": [ { "@type": "TermsAndConditionsFullAir", "ExpiryDate": "2026-01-27T07:37:38Z", "FareGuaranteePolicy": [ { "@type": "FareGuaranteePolicy", "passengerTypeCodes": [ "ADT" ], "EligibleforADMReview": "Yes", "Code": { "value": "G" } } ] } ], "ModifyPrice": { "@type": "ModifyPriceDetail", "id": "ModifyPriceDetail_1", "CurrencyCode": { "value": "USD" }, "Base": 564.06, "TotalTaxes": 0, "TotalFees": 0, "TotalPrice": 564.06, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "value": "USD" }, "Base": 564.06, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 0 }, "Total": 564.06 } } ] }, "SupplierRetainedPrice": { "@type": "SupplierRetainedPriceDetail", "id": "SupplierRetainedPrice_1", "CurrencyCode": { "value": "USD" }, "Base": 0, "TotalTaxes": 73.1, "TotalPrice": 73.1, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "value": "USD" }, "Base": 0, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 73.1, "Tax": [ {} ] }, "Total": 73.1 } } ] }, "ConsumedPrice": { "@type": "ConsumedPriceDetail", "id": "ConsumedPrice_1", "CurrencyCode": { "value": "USD" }, "Base": 0, "TotalTaxes": 0, "TotalPrice": 0, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "value": "USD" }, "Base": 0, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 0 }, "Total": 0 } } ] } } ] } } Cancel API&#160;Reference The Cancel API is used instead of the standard workbench commit to complete the GDS refund workflow. Use the following endpoint. There is no message request body. POST receipt/reservations/ {workbenchID} /receipts?OfferIdentifier= {OfferID} For {workbenchID} send the workbench identifier returned in ReservationResponse/Identifer/value in the workbench create response. For {OfferID} send the offer identifier from Offer/Identifier/value in the Create Workbench response. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Header Parameters Parameter Description Required/Optional RetainFlag Boolean. Determines the type of cancel operation. Supported values: false : Default. Cancels the offer and issues a refund based on fare rules. true : Retains the offer as a held booking and issues a refund based on fare rules. Required Response Payload Show Response Body Table Object Description ReceiptListResponse Top level object for response. Key value pairs: transactionId : System-generated unique ID for this response. Can be used for internal tracking and troubleshooting. traceId : Returned if a custom trace ID was sent in the request header. See Transaction and Trace IDs for details. See Identifiers in the JSON &#160;APIs for more about identifiers across all JSON &#160;APIs. Includes ReceiptID and ReferenceList objects. ReceiptID Top level object for refund details. Returns ReceiptID with @type ReceiptPayment with cancellation details. If the offer was retained (per the RetainFlag header parameter setting in the request), also returns an instance of ReceiptID with @type ReceiptCancellation with the locator code for the held booking. Includes Identifier, OfferRef, and Document. Identifier Standard identifier object with authority and value. OfferRef String array. Cross-reference number for details of the offer (either canceled or retained) as returned in ReferenceList/Offer/id. Document Array. Returns ticket and cancellation details. The @type value DocumentTicketRefund indicates a refund was issued. Includes Number, TravelerIdentifierRef, Amount, SupplierRetainedPrice, ConsumedPrice, FareGuaranteePolicy. Number String. Ticket number of the canceled ticket. TravelerIdentifierRef Key value pair: passengerTypeCode : String. The PTC of the traveler. Amount Price details for the amount refunded. Includes CurrencyCode, Base, Taxes, Total objects. CurrencyCode Key value pair: value : String. Currency code of the amounts. Base Number. The base amount of the refund. Taxes Tax amounts refunded.&#160;Objects returned may vary; typically includes TotalTaxes. Total Number. Total amount refunded. SupplierRetainedPrice Any amounts that were not refunded. Returns amounts in the CurrencyCode, Base, TotalTaxes, TotalPrice, and PriceBreakdown in the same format per above and in the standard Price object. Any amount in SupplierRetainedPrice/TotalPrice is the total amount that was not refunded. ConsumedPrice Reserved for future use. Always returns zero amounts in the CurrencyCode, Base, TotalTaxes, TotalPrice, and PriceBreakdown in the same format as the standard Price object. FareGuaranteePolicy Travelport's fare guarantee policy for the offer. Key value pair: passengerTypeCodes : String. The PTC/s of the traveler/s. Includes EligibleforADMReview and Code. EligibleforADMReview String.&#160;Returned with a value of Yes when the refund is eligible for an airline agency debit memo (ADM) review, which is the process where travel agencies dispute or validate financial penalties. Code Key value pair: value : String. Always returns G for guaranteed. ReferenceList Top level object. Includes @type ReferenceListOffer/Offer and @type ReferenceListTraveler/Traveler. Offer Details for the refunded offer. Key value pair: id : Internal offer id used for cross-reference. Includes Identifier, Product, Price, and TermsAndConditionsFull objects. Identifier Standard identifier object with authority and value. Product Array. Standard Product object with flight details. One instance returned for each leg of the itinerary. See Reservation Retrieve for details. Price Standard Price object with price details for the offer. See Reservation Retrieve for details. If the number in Price/TotalPrice matches the number returned in ReceiptID/Document/Amount/Total, a full refund was issued. TermsAndConditionsFull Standard TermsAndConditionsFull object with terms and conditions of the offer. See Reservation Retrieve for details. Traveler Traveler details. Specific objects returned vary according to the traveler details on the booking but generally include id, Identifier, PersonName, Telephone, and TravelDocument. See Reservation Retrieve for details. Example Response Show Example Cancel response { "ReceiptListResponse": { "@type": "ReceiptListResponse", "transactionId": "ER-DW84WX-895", "traceId": "ER-DW84WX-907", "ReceiptID": [ { "@type": "ReceiptPayment", "Identifier": { "authority": "Travelport", "value": "4370756d-913a-45ca-ab31-7c12fbe2275c" }, "OfferRef": [ "offer_1" ], "Document": [ { "@type": "DocumentTicketRefund", "Number": "0067395777173", "TravelerIdentifierRef": { "passengerTypeCode": "ADT" }, "Amount": { "@type": "Amount", "CurrencyCode": { "value": "USD" }, "Base": 564.06, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 0 }, "Total": 564.06 }, "SupplierRetainedPrice": { "@type": "SupplierRetainedPriceDetail", "id": "SupplierRetainedPrice_1", "CurrencyCode": { "value": "USD" }, "Base": 0, "TotalTaxes": 73.1, "TotalPrice": 73.1, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "value": "USD" }, "Base": 0, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 73.1, "Tax": [ {} ] }, "Total": 73.1 } } ] }, "ConsumedPrice": { "@type": "ConsumedPriceDetail", "id": "ConsumedPrice_1", "CurrencyCode": { "value": "USD" }, "Base": 0, "TotalTaxes": 0, "TotalPrice": 0, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "value": "USD" }, "Base": 0, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 0 }, "Total": 0 } } ] }, "FareGuaranteePolicy": { "@type": "FareGuaranteePolicy", "passengerTypeCodes": [ "ADT" ], "EligibleforADMReview": "Yes", "Code": { "value": "G" } } } ] } ], "ReferenceList": [ { "@type": "ReferenceListOffer", "Offer": [ { "@type": "Offer", "id": "offer_1", "Identifier": { "authority": "Travelport", "value": "4f38f61f-5e12-4453-8a44-830ea7d545eb" }, "Product": [ { "@type": "ProductAir", "id": "product_1", "Identifier": { "authority": "Travelport", "value": "b12e65c9-67e0-40d8-9025-17f38b890bb7" }, "FlightSegment": [ { "@type": "FlightSegment", "id": "FlightSegment_01", "sequence": 1, "Flight": { "@type": "Flight", "duration": "PT2H56M", "carrier": "DL", "number": "302", "equipment": "321", "id": "Flight_01", "Identifier": { "authority": "Travelport", "value": "a90fbf91-e96e-4892-b318-7e46a9264924" }, "Departure": { "@type": "DepartureDetail", "location": "DEN", "date": "2026-03-20", "time": "00:55:00" }, "Arrival": { "@type": "ArrivalDetail", "location": "ATL", "date": "2026-03-20", "time": "05:51:00" } } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 1 ], "classOfService": "W", "cabin": "PremiumEconomy", "fareBasisCode": "UAWQA0CL", "fareType": "PublicFare", "Brand": { "@type": "Brand", "name": "DELTA COMFORT CLASSIC", "tier": 5, "id": "000000000001943602" } } ] } ] }, { "@type": "ProductAir", "id": "product_2", "Identifier": { "authority": "Travelport", "value": "84c9447c-8542-4ded-bc70-2917579b9f2e" }, "FlightSegment": [ { "@type": "FlightSegment", "id": "FlightSegment_02", "sequence": 2, "Flight": { "@type": "Flight", "duration": "PT3H34M", "carrier": "DL", "number": "530", "equipment": "321", "id": "Flight_02", "Identifier": { "authority": "Travelport", "value": "b56f138c-9e97-412d-8346-d67e613c0760" }, "Departure": { "@type": "DepartureDetail", "location": "ATL", "date": "2026-03-30", "time": "10:21:00" }, "Arrival": { "@type": "ArrivalDetail", "location": "DEN", "date": "2026-03-30", "time": "11:55:00" } } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 2 ], "classOfService": "W", "cabin": "PremiumEconomy", "fareBasisCode": "UAWQA0CL", "fareType": "PublicFare", "Brand": { "@type": "Brand", "name": "DELTA COMFORT CLASSIC", "tier": 5, "id": "000000000001943602" } } ] } ] } ], "Price": { "@type": "PriceDetail", "id": "ModifyPriceDetail_1", "Base": 564.06, "TotalTaxes": 0, "TotalFees": 0, "TotalPrice": 564.06, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "value": "USD" }, "Base": 564.06, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 0 }, "Total": 564.06 } } ] }, "TermsAndConditionsFull": [ { "@type": "TermsAndConditionsFullAir", "secureFlightPassengerDataRequiredInd": true, "Identifier": { "authority": "Travelport", "value": "a0fa20c8-be06-4f10-8ccb-a80f66bc3b54" }, "ExpiryDate": "2026-01-28T23:59:00Z", "BaggageAllowance": [ { "@type": "BaggageAllowanceDetail", "passengerTypeCodes": [ "ADT" ], "SegmentSequenceList": [ 1 ], "Text": [ "0PC" ] }, { "@type": "BaggageAllowanceDetail", "passengerTypeCodes": [ "ADT" ], "SegmentSequenceList": [ 2 ], "Text": [ "0PC" ] } ], "ValidatingAirline": [ { "@type": "ValidatingAirline", "ValidatingAirline": "DL" } ], "TicketingAgency": [ { "@type": "TicketingAgency", "Code": "8K9E" } ], "PaymentTimeLimit": "2026-01-28T23:59:00Z", "PricingAgency": [ { "@type": "PricingAgency", "Code": "8K9E" } ], "FareGuaranteePolicy": [ { "@type": "FareGuaranteePolicy", "passengerTypeCodes": [ "ADT" ], "EligibleforADMReview": "Yes", "Code": { "value": "G" } } ] }, { "@type": "TermsAndConditionsFullAir", "Restriction": [ { "value": "NONREF/CHANGES PERMITTED" } ] } ] } ] }, { "@type": "ReferenceListTraveler", "Traveler": [ { "@type": "Traveler", "birthDate": "2006-07-12", "gender": "Male", "passengerTypeCode": "ADT", "id": "travelerRefId_1", "Identifier": { "authority": "Travelport", "value": "932b9f8d-2e51-4faf-b3a8-f3110c4971f3" }, "PersonName": { "@type": "PersonName", "Given": "JONES", "Surname": "NICK" }, "Telephone": [ { "@type": "TelephoneDetail", "phoneNumber": "NONE", "id": "telephone_1" } ], "TravelDocument": [ { "@type": "TravelDocumentDetail", "birthDate": "2006-07-12", "Gender": "Male", "PersonName": { "@type": "PersonName", "Given": "JONES ", "Surname": "NICK" } } ] } ] } ] } } Show Example Cancel response with offer retained { "ReceiptListResponse": { "@type": "ReceiptListResponse", "transactionId": "ER-DW862F-742", "traceId": "ER-DW862F-353", "ReceiptID": [ { "@type": "ReceiptCancellation", "id": "receipt_1", "Identifier": { "authority": "Travelport", "value": "3bbc5a3a-a2c7-4972-91b3-515430a620b7" }, "Cancellation": { "@type": "CancellationHold", "Locator": { "locatorType": "Locator", "source": "1G", "sourceContext": "Travelport", "value": "DW862F" } } }, { "@type": "ReceiptPayment", "Identifier": { "authority": "Travelport", "value": "c233c4cf-c6db-4405-bdb5-38fd27acad18" }, "OfferRef": [ "offer_1" ], "Document": [ { "@type": "DocumentTicketRefund", "Number": "0067395777190", "TravelerIdentifierRef": { "passengerTypeCode": "ADT" }, "Amount": { "@type": "Amount", "CurrencyCode": { "value": "USD" }, "Base": 545.46, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 0 }, "Total": 545.46 }, "SupplierRetainedPrice": { "@type": "SupplierRetainedPriceDetail", "id": "SupplierRetainedPrice_1", "CurrencyCode": { "value": "USD" }, "Base": 0, "TotalTaxes": 71.71, "TotalPrice": 71.71, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "value": "USD" }, "Base": 0, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 71.71, "Tax": [ {} ] }, "Total": 71.71 } } ] }, "ConsumedPrice": { "@type": "ConsumedPriceDetail", "id": "ConsumedPrice_1", "CurrencyCode": { "value": "USD" }, "Base": 0, "TotalTaxes": 0, "TotalPrice": 0, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "value": "USD" }, "Base": 0, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 0 }, "Total": 0 } } ] }, "FareGuaranteePolicy": { "@type": "FareGuaranteePolicy", "passengerTypeCodes": [ "ADT" ], "EligibleforADMReview": "Yes", "Code": { "value": "G" } } } ] } ], "ReferenceList": [ { "@type": "ReferenceListOffer", "Offer": [ { "@type": "Offer", "id": "offer_1", "Identifier": { "authority": "Travelport", "value": "1f9b2c90-c87b-4595-b5de-a849a3634bdd" }, "Product": [ { "@type": "ProductAir", "id": "product_1", "Identifier": { "authority": "Travelport", "value": "99fd85e5-d68d-4a8c-ab23-077b21f801fa" }, "FlightSegment": [ { "@type": "FlightSegment", "id": "FlightSegment_01", "sequence": 1, "Flight": { "@type": "Flight", "duration": "PT2H49M", "carrier": "DL", "number": "346", "equipment": "321", "id": "Flight_01", "Identifier": { "authority": "Travelport", "value": "3b174219-f639-4853-ab2d-b88eb945b16e" }, "Departure": { "@type": "DepartureDetail", "location": "DEN", "date": "2026-03-23", "time": "10:31:00" }, "Arrival": { "@type": "ArrivalDetail", "location": "ATL", "date": "2026-03-23", "time": "15:20:00" } } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 1 ], "classOfService": "S", "cabin": "PremiumEconomy", "fareBasisCode": "UAWQA0IL", "fareType": "PublicFare", "Brand": { "@type": "Brand", "name": "DELTA COMFORT CLASSIC", "tier": 5, "id": "000000000001943602" } } ] } ] }, { "@type": "ProductAir", "id": "product_2", "Identifier": { "authority": "Travelport", "value": "bf68083e-10e1-4e11-8b7e-b5a472afcce2" }, "FlightSegment": [ { "@type": "FlightSegment", "id": "FlightSegment_02", "sequence": 2, "Flight": { "@type": "Flight", "duration": "PT3H19M", "carrier": "DL", "number": "840", "equipment": "321", "id": "Flight_02", "Identifier": { "authority": "Travelport", "value": "5d6e4cb4-451a-4281-93c9-46df92c1caa6" }, "Departure": { "@type": "DepartureDetail", "location": "ATL", "date": "2026-03-29", "time": "13:53:00" }, "Arrival": { "@type": "ArrivalDetail", "location": "DEN", "date": "2026-03-29", "time": "15:12:00" } } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 2 ], "classOfService": "S", "cabin": "PremiumEconomy", "fareBasisCode": "UAWQA0IL", "fareType": "PublicFare", "Brand": { "@type": "Brand", "name": "DELTA COMFORT CLASSIC", "tier": 5, "id": "000000000001943602" } } ] } ] } ], "Price": { "@type": "PriceDetail", "id": "ModifyPriceDetail_1", "Base": 545.46, "TotalTaxes": 0, "TotalFees": 0, "TotalPrice": 545.46, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "value": "USD" }, "Base": 545.46, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 0 }, "Total": 545.46 } } ] }, "TermsAndConditionsFull": [ { "@type": "TermsAndConditionsFullAir", "secureFlightPassengerDataRequiredInd": true, "Identifier": { "authority": "Travelport", "value": "04193f44-782f-4d10-a7fe-a6bff3697ea0" }, "ExpiryDate": "2026-01-28T23:59:00Z", "BaggageAllowance": [ { "@type": "BaggageAllowanceDetail", "passengerTypeCodes": [ "ADT" ], "SegmentSequenceList": [ 1 ], "Text": [ "0PC" ] }, { "@type": "BaggageAllowanceDetail", "passengerTypeCodes": [ "ADT" ], "SegmentSequenceList": [ 2 ], "Text": [ "0PC" ] } ], "ValidatingAirline": [ { "@type": "ValidatingAirline", "ValidatingAirline": "DL" } ], "TicketingAgency": [ { "@type": "TicketingAgency", "Code": "8K9E" } ], "PaymentTimeLimit": "2026-01-28T23:59:00Z", "PricingAgency": [ { "@type": "PricingAgency", "Code": "8K9E" } ], "FareGuaranteePolicy": [ { "@type": "FareGuaranteePolicy", "passengerTypeCodes": [ "ADT" ], "EligibleforADMReview": "Yes", "Code": { "value": "G" } } ] }, { "@type": "TermsAndConditionsFullAir", "Restriction": [ { "value": "NONREF/CHANGES PERMITTED" } ] } ] } ] }, { "@type": "ReferenceListTraveler", "Traveler": [ { "@type": "Traveler", "birthDate": "2006-07-12", "gender": "Male", "passengerTypeCode": "ADT", "id": "travelerRefId_1", "Identifier": { "authority": "Travelport", "value": "952acc7d-db55-461b-8348-c3ff37d259f0" }, "PersonName": { "@type": "PersonName", "Given": "PEL", "Surname": "SYDNEY" }, "Telephone": [ { "@type": "TelephoneDetail", "phoneNumber": "NONE", "id": "telephone_1" } ], "TravelDocument": [ { "@type": "TravelDocumentDetail", "birthDate": "2006-07-12", "Gender": "Male", "PersonName": { "@type": "PersonName", "Given": "PEL ", "Surname": "SYDNEY" } } ] } ] } ] } } &#160; &#160;

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
 "OfferQueryCancelOffer": {
  "BuildFromOffer": {
   "@type": "BuildFromOfferAir",
   "OfferIdentifier": {
    "Identifier": {
     "value": "4f38f61f-5e12-4453-8a44-830ea7d545eb"
    }
   }
  }
 }
}
```

### Block 2

```
{"OfferListResponse": {
  "@type": "OfferListResponse",
  "transactionId": "ER-DW84WX-191",
  "traceId": "ER-DW84WX-109",
  "OfferID": [
   {
    "@type": "OfferModify",
    "id": "offer_1",
    "Identifier": {
     "authority": "Travelport",
     "value": "4f38f61f-5e12-4453-8a44-830ea7d545eb"
    },
    "ContentSource": "GDS",
    "Product": [
     {
      "@type": "ProductAir",
      "id": "product_1",
      "Identifier": {
       "authority": "Travelport",
       "value": "b12e65c9-67e0-40d8-9025-17f38b890bb7"
      },
      "FlightSegment": [
       {
        "@type": "FlightSegment",
        "id": "FlightSegment_01",
        "sequence": 1,
        "Flight": {
         "@type": "Flight",
         "duration": "PT2H56M",
         "carrier": "DL",
         "number": "302",
         "equipment": "321",
         "id": "Flight_01",
         "Identifier": {
          "authority": "Travelport",
          "value": "a90fbf91-e96e-4892-b318-7e46a9264924"
         },
         "Departure": {
          "@type": "DepartureDetail",
          "location": "DEN",
          "date": "2026-03-20",
          "time": "00:55:00"
         },
         "Arrival": {
          "@type": "ArrivalDetail",
          "location": "ATL",
          "date": "2026-03-20",
          "time": "05:51:00"
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
          "classOfService": "W",
          "cabin": "PremiumEconomy",
          "fareBasisCode": "UAWQA0CL",
          "fareType": "PublicFare",
          "Brand": {
           "@type": "Brand",
           "name": "DELTA COMFORT CLASSIC",
           "tier": 5,
           "id": "000000000001943602"
          }
         }
        ]
       }
      ]
     },
     {
      "@type": "ProductAir",
      "id": "product_2",
      "Identifier": {
       "authority": "Travelport",
       "value": "84c9447c-8542-4ded-bc70-2917579b9f2e"
      },
      "FlightSegment": [
       {
        "@type": "FlightSegment",
        "id": "FlightSegment_02",
        "sequence": 2,
        "Flight": {
         "@type": "Flight",
         "duration": "PT3H34M",
         "carrier": "DL",
         "number": "530",
         "equipment": "321",
         "id": "Flight_02",
         "Identifier": {
          "authority": "Travelport",
          "value": "b56f138c-9e97-412d-8346-d67e613c0760"
         },
         "Departure": {
          "@type": "DepartureDetail",
          "location": "ATL",
          "date": "2026-03-30",
          "time": "10:21:00"
         },
         "Arrival": {
          "@type": "ArrivalDetail",
          "location": "DEN",
          "date": "2026-03-30",
          "time": "11:55:00"
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
           2
          ],
          "classOfService": "W",
          "cabin": "PremiumEconomy",
          "fareBasisCode": "UAWQA0CL",
          "fareType": "PublicFare",
          "Brand": {
           "@type": "Brand",
           "name": "DELTA COMFORT CLASSIC",
           "tier": 5,
           "id": "000000000001943602"
          }
         }
        ]
       }
      ]
     }
    ],
    "Price": {
     "@type": "PriceDetail",
     "id": "PriceDetail_1",
     "CurrencyCode": {
      "value": "USD"
     },
     "Base": 564.06,
     "TotalTaxes": 73.1,
     "TotalFees": 0,
     "TotalPrice": 637.16,
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
        "Base": 564.06,
        "Taxes": {
         "@type": "TaxesDetail",
         "TotalTaxes": 73.1,
         "TaxInfo": [
          {
           "@type": "TaxInfo",
           "TaxCode": "XF",
           "Amount": 9,
           "TaxBreakdown": [
            {
             "@type": "TaxBreakdown",
             "AirportCode": "DEN",
             "CurrencyCode": {
              "value": "USD"
             },
             "Amount": 4.5
            },
            {
             "@type": "TaxBreakdown",
             "AirportCode": "ATL",
             "CurrencyCode": {
              "value": "USD"
             },
             "Amount": 4.5
            }
           ]
          },
          {
           "@type": "TaxInfo",
           "TaxCode": "ZP",
           "Amount": 10.6,
           "TaxBreakdown": [
            {
             "@type": "TaxBreakdown",
             "AirportCode": "DEN",
             "CurrencyCode": {
              "value": "USD"
             },
             "Amount": 5.3
            },
            {
             "@type": "TaxBreakdown",
             "AirportCode": "ATL",
             "CurrencyCode": {
              "value": "USD"
             },
             "Amount": 5.3
            }
           ]
          }
         ],
         "Tax": [
          {
           "taxCode": "AY",
           "value": 11.2
          },
          {
           "taxCode": "US",
           "value": 42.3
          },
          {
           "taxCode": "XF",
           "value": 9
          },
          {
           "taxCode": "ZP",
           "value": 10.6
          }
         ]
        },
        "Total": 637.16
       },
       "TravelerRefs": [
        "travelerRefId_1"
       ]
      }
     ]
    },
    "TermsAndConditionsFull": [
     {
      "@type": "TermsAndConditionsFullAir",
      "ExpiryDate": "2026-01-27T07:37:38Z",
      "FareGuaranteePolicy": [
       {
        "@type": "FareGuaranteePolicy",
        "passengerTypeCodes": [
         "ADT"
        ],
        "EligibleforADMReview": "Yes",
        "Code": {
         "value": "G"
        }
       }
      ]
     }
    ],
    "ModifyPrice": {
     "@type": "ModifyPriceDetail",
     "id": "ModifyPriceDetail_1",
     "CurrencyCode": {
      "value": "USD"
     },
     "Base": 564.06,
     "TotalTaxes": 0,
     "TotalFees": 0,
     "TotalPrice": 564.06,
     "PriceBreakdown": [
      {
       "@type": "PriceBreakdownAir",
       "quantity": 1,
       "requestedPassengerType": "ADT",
       "Amount": {
        "@type": "Amount",
        "CurrencyCode": {
         "value": "USD"
        },
        "Base": 564.06,
        "Taxes": {
         "@type": "TaxesDetail",
         "TotalTaxes": 0
        },
        "Total": 564.06
       }
      }
     ]
    },
    "SupplierRetainedPrice": {
     "@type": "SupplierRetainedPriceDetail",
     "id": "SupplierRetainedPrice_1",
     "CurrencyCode": {
      "value": "USD"
     },
     "Base": 0,
     "TotalTaxes": 73.1,
     "TotalPrice": 73.1,
     "PriceBreakdown": [
      {
       "@type": "PriceBreakdownAir",
       "quantity": 1,
       "requestedPassengerType": "ADT",
       "Amount": {
        "@type": "Amount",
        "CurrencyCode": {
         "value": "USD"
        },
        "Base": 0,
        "Taxes": {
         "@type": "TaxesDetail",
         "TotalTaxes": 73.1,
         "Tax": [
          {}
         ]
        },
        "Total": 73.1
       }
      }
     ]
    },
    "ConsumedPrice": {
     "@type": "ConsumedPriceDetail",
     "id": "ConsumedPrice_1",
     "CurrencyCode": {
      "value": "USD"
     },
     "Base": 0,
     "TotalTaxes": 0,
     "TotalPri
…
```

### Block 3

```
{
 "ReceiptListResponse": {
  "@type": "ReceiptListResponse",
  "transactionId": "ER-DW84WX-895",
  "traceId": "ER-DW84WX-907",
  "ReceiptID": [
   {
    "@type": "ReceiptPayment",
    "Identifier": {
     "authority": "Travelport",
     "value": "4370756d-913a-45ca-ab31-7c12fbe2275c"
    },
    "OfferRef": [
     "offer_1"
    ],
    "Document": [
     {
      "@type": "DocumentTicketRefund",
      "Number": "0067395777173",
      "TravelerIdentifierRef": {
       "passengerTypeCode": "ADT"
      },
      "Amount": {
       "@type": "Amount",
       "CurrencyCode": {
        "value": "USD"
       },
       "Base": 564.06,
       "Taxes": {
        "@type": "TaxesDetail",
        "TotalTaxes": 0
       },
       "Total": 564.06
      },
      "SupplierRetainedPrice": {
       "@type": "SupplierRetainedPriceDetail",
       "id": "SupplierRetainedPrice_1",
       "CurrencyCode": {
        "value": "USD"
       },
       "Base": 0,
       "TotalTaxes": 73.1,
       "TotalPrice": 73.1,
       "PriceBreakdown": [
        {
         "@type": "PriceBreakdownAir",
         "quantity": 1,
         "requestedPassengerType": "ADT",
         "Amount": {
          "@type": "Amount",
          "CurrencyCode": {
           "value": "USD"
          },
          "Base": 0,
          "Taxes": {
           "@type": "TaxesDetail",
           "TotalTaxes": 73.1,
           "Tax": [
            {}
           ]
          },
          "Total": 73.1
         }
        }
       ]
      },
      "ConsumedPrice": {
       "@type": "ConsumedPriceDetail",
       "id": "ConsumedPrice_1",
       "CurrencyCode": {
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
          "CurrencyCode": {
           "value": "USD"
          },
          "Base": 0,
          "Taxes": {
           "@type": "TaxesDetail",
           "TotalTaxes": 0
          },
          "Total": 0
         }
        }
       ]
      },
      "FareGuaranteePolicy": {
       "@type": "FareGuaranteePolicy",
       "passengerTypeCodes": [
        "ADT"
       ],
       "EligibleforADMReview": "Yes",
       "Code": {
        "value": "G"
       }
      }
     }
    ]
   }
  ],
  "ReferenceList": [
   {
    "@type": "ReferenceListOffer",
    "Offer": [
     {
      "@type": "Offer",
      "id": "offer_1",
      "Identifier": {
       "authority": "Travelport",
       "value": "4f38f61f-5e12-4453-8a44-830ea7d545eb"
      },
      "Product": [
       {
        "@type": "ProductAir",
        "id": "product_1",
        "Identifier": {
         "authority": "Travelport",
         "value": "b12e65c9-67e0-40d8-9025-17f38b890bb7"
        },
        "FlightSegment": [
         {
          "@type": "FlightSegment",
          "id": "FlightSegment_01",
          "sequence": 1,
          "Flight": {
           "@type": "Flight",
           "duration": "PT2H56M",
           "carrier": "DL",
           "number": "302",
           "equipment": "321",
           "id": "Flight_01",
           "Identifier": {
            "authority": "Travelport",
            "value": "a90fbf91-e96e-4892-b318-7e46a9264924"
           },
           "Departure": {
            "@type": "DepartureDetail",
            "location": "DEN",
            "date": "2026-03-20",
            "time": "00:55:00"
           },
           "Arrival": {
            "@type": "ArrivalDetail",
            "location": "ATL",
            "date": "2026-03-20",
            "time": "05:51:00"
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
            "classOfService": "W",
            "cabin": "PremiumEconomy",
            "fareBasisCode": "UAWQA0CL",
            "fareType": "PublicFare",
            "Brand": {
             "@type": "Brand",
             "name": "DELTA COMFORT CLASSIC",
             "tier": 5,
             "id": "000000000001943602"
            }
           }
          ]
         }
        ]
       },
       {
        "@type": "ProductAir",
        "id": "product_2",
        "Identifier": {
         "authority": "Travelport",
         "value": "84c9447c-8542-4ded-bc70-2917579b9f2e"
        },
        "FlightSegment": [
         {
          "@type": "FlightSegment",
          "id": "FlightSegment_02",
          "sequence": 2,
          "Flight": {
           "@type": "Flight",
           "duration": "PT3H34M",
           "carrier": "DL",
           "number": "530",
           "equipment": "321",
           "id": "Flight_02",
           "Identifier": {
            "authority": "Travelport",
            "value": "b56f138c-9e97-412d-8346-d67e613c0760"
           },
           "Departure": {
            "@type": "DepartureDetail",
            "location": "ATL",
            "date": "2026-03-30",
            "time": "10:21:00"
           },
           "Arrival": {
            "@type": "ArrivalDetail",
            "location": "DEN",
            "date": "2026-03-30",
            "time": "11:55:00"
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
             2
            ],
            "classOfService": "W",
            "cabin": "PremiumEconomy",
            "fareBasisCode": "UAWQA0CL",
            "fareType": "PublicFare",
            "Brand": {
             "@type": "Brand",
             "name": "DELTA COMFORT CLASSIC",
             "tier": 5,
             "id": "000000000001943602"
            }
           }
          ]
         }
        ]
       }
      ],
      "Price": {
       "@type": "PriceDetail",
       "id": "ModifyPriceDetail_1",
       "Base": 564.06,
       "TotalTaxes": 0,
       "TotalFees": 0,
       "TotalPrice": 564.06,
       "PriceBreakdown": [
        {
         "@type": "PriceBreakdownAir",
         "quantity": 1,
         "requestedPassengerType": "ADT",
         "Amount": {
          "@type": "Amount",
          "CurrencyCode": {
           "value": "USD"
          },
          "Base": 564.06,
          "Taxes": {
           "@type": "TaxesDetail",
           "TotalTaxes": 0
          },
          "Total": 564.06
         }
        }
       ]
      },
      "TermsAndConditionsFull": [
       {
        "@type": "TermsAndConditionsFullAir",
        "secureFlightPassengerDataRequiredInd": true,
        "Identifier": {
         "authority": "Travelport",
         "value": "a0fa20c8-be06-4f10-8ccb-a80f66bc3b54"
        },
        "ExpiryDate": "2026-01-28T23:59:00Z",
        "BaggageAllowance": [
         {
          "@type": "BaggageAllowanceDetail",
          "passengerTypeCodes": [
           "ADT"
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
          "SegmentSequenceList": [
           2
          ],
          "Text": [
           "0PC"
          ]
         }
        ],
        "ValidatingAirline": [
         {
          "@type": "ValidatingAirline",
   
…
```

### Block 4

```
{
 "ReceiptListResponse": {
  "@type": "ReceiptListResponse",
  "transactionId": "ER-DW862F-742",
  "traceId": "ER-DW862F-353",
  "ReceiptID": [
   {
    "@type": "ReceiptCancellation",
    "id": "receipt_1",
    "Identifier": {
     "authority": "Travelport",
     "value": "3bbc5a3a-a2c7-4972-91b3-515430a620b7"
    },
    "Cancellation": {
     "@type": "CancellationHold",
     "Locator": {
      "locatorType": "Locator",
      "source": "1G",
      "sourceContext": "Travelport",
      "value": "DW862F"
     }
    }
   },
   {
    "@type": "ReceiptPayment",
    "Identifier": {
     "authority": "Travelport",
     "value": "c233c4cf-c6db-4405-bdb5-38fd27acad18"
    },
    "OfferRef": [
     "offer_1"
    ],
    "Document": [
     {
      "@type": "DocumentTicketRefund",
      "Number": "0067395777190",
      "TravelerIdentifierRef": {
       "passengerTypeCode": "ADT"
      },
      "Amount": {
       "@type": "Amount",
       "CurrencyCode": {
        "value": "USD"
       },
       "Base": 545.46,
       "Taxes": {
        "@type": "TaxesDetail",
        "TotalTaxes": 0
       },
       "Total": 545.46
      },
      "SupplierRetainedPrice": {
       "@type": "SupplierRetainedPriceDetail",
       "id": "SupplierRetainedPrice_1",
       "CurrencyCode": {
        "value": "USD"
       },
       "Base": 0,
       "TotalTaxes": 71.71,
       "TotalPrice": 71.71,
       "PriceBreakdown": [
        {
         "@type": "PriceBreakdownAir",
         "quantity": 1,
         "requestedPassengerType": "ADT",
         "Amount": {
          "@type": "Amount",
          "CurrencyCode": {
           "value": "USD"
          },
          "Base": 0,
          "Taxes": {
           "@type": "TaxesDetail",
           "TotalTaxes": 71.71,
           "Tax": [
            {}
           ]
          },
          "Total": 71.71
         }
        }
       ]
      },
      "ConsumedPrice": {
       "@type": "ConsumedPriceDetail",
       "id": "ConsumedPrice_1",
       "CurrencyCode": {
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
          "CurrencyCode": {
           "value": "USD"
          },
          "Base": 0,
          "Taxes": {
           "@type": "TaxesDetail",
           "TotalTaxes": 0
          },
          "Total": 0
         }
        }
       ]
      },
      "FareGuaranteePolicy": {
       "@type": "FareGuaranteePolicy",
       "passengerTypeCodes": [
        "ADT"
       ],
       "EligibleforADMReview": "Yes",
       "Code": {
        "value": "G"
       }
      }
     }
    ]
   }
  ],
  "ReferenceList": [
   {
    "@type": "ReferenceListOffer",
    "Offer": [
     {
      "@type": "Offer",
      "id": "offer_1",
      "Identifier": {
       "authority": "Travelport",
       "value": "1f9b2c90-c87b-4595-b5de-a849a3634bdd"
      },
      "Product": [
       {
        "@type": "ProductAir",
        "id": "product_1",
        "Identifier": {
         "authority": "Travelport",
         "value": "99fd85e5-d68d-4a8c-ab23-077b21f801fa"
        },
        "FlightSegment": [
         {
          "@type": "FlightSegment",
          "id": "FlightSegment_01",
          "sequence": 1,
          "Flight": {
           "@type": "Flight",
           "duration": "PT2H49M",
           "carrier": "DL",
           "number": "346",
           "equipment": "321",
           "id": "Flight_01",
           "Identifier": {
            "authority": "Travelport",
            "value": "3b174219-f639-4853-ab2d-b88eb945b16e"
           },
           "Departure": {
            "@type": "DepartureDetail",
            "location": "DEN",
            "date": "2026-03-23",
            "time": "10:31:00"
           },
           "Arrival": {
            "@type": "ArrivalDetail",
            "location": "ATL",
            "date": "2026-03-23",
            "time": "15:20:00"
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
            "classOfService": "S",
            "cabin": "PremiumEconomy",
            "fareBasisCode": "UAWQA0IL",
            "fareType": "PublicFare",
            "Brand": {
             "@type": "Brand",
             "name": "DELTA COMFORT CLASSIC",
             "tier": 5,
             "id": "000000000001943602"
            }
           }
          ]
         }
        ]
       },
       {
        "@type": "ProductAir",
        "id": "product_2",
        "Identifier": {
         "authority": "Travelport",
         "value": "bf68083e-10e1-4e11-8b7e-b5a472afcce2"
        },
        "FlightSegment": [
         {
          "@type": "FlightSegment",
          "id": "FlightSegment_02",
          "sequence": 2,
          "Flight": {
           "@type": "Flight",
           "duration": "PT3H19M",
           "carrier": "DL",
           "number": "840",
           "equipment": "321",
           "id": "Flight_02",
           "Identifier": {
            "authority": "Travelport",
            "value": "5d6e4cb4-451a-4281-93c9-46df92c1caa6"
           },
           "Departure": {
            "@type": "DepartureDetail",
            "location": "ATL",
            "date": "2026-03-29",
            "time": "13:53:00"
           },
           "Arrival": {
            "@type": "ArrivalDetail",
            "location": "DEN",
            "date": "2026-03-29",
            "time": "15:12:00"
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
             2
            ],
            "classOfService": "S",
            "cabin": "PremiumEconomy",
            "fareBasisCode": "UAWQA0IL",
            "fareType": "PublicFare",
            "Brand": {
             "@type": "Brand",
             "name": "DELTA COMFORT CLASSIC",
             "tier": 5,
             "id": "000000000001943602"
            }
           }
          ]
         }
        ]
       }
      ],
      "Price": {
       "@type": "PriceDetail",
       "id": "ModifyPriceDetail_1",
       "Base": 545.46,
       "TotalTaxes": 0,
       "TotalFees": 0,
       "TotalPrice": 545.46,
       "PriceBreakdown": [
        {
         "@type": "PriceBreakdownAir",
         "quantity": 1,
         "requestedPassengerType": "ADT",
         "Amount": {
          "@type": "Amount",
          "CurrencyCode": {
           "value": "USD"
          },
          "Base": 545.46,
          "Taxes": {
           "@type": "TaxesDetail",
           "TotalTaxes": 0
          },
          "Total": 545.46
         }
        }
       ]
      },
      "TermsAndConditionsFull": [
       {
        "@type": "TermsAndConditionsFullAir",
        "secureFlightPassengerDataRequiredInd": true,
        "Identifier": {
         "authority": "Travelport",
         "value": "04193f44-782f-4d10-a7fe-a6bff3697ea0"
        },
        "ExpiryDate": "2026-01-28T23:59:00Z",
        "BaggageAllowance": [
         {
          "@type": "BaggageAllowanceDetail",
          "passengerTypeCodes": [
           "ADT"
          ],
          "SegmentSequenceList": [
           1
          ],
          "Te
…
```

