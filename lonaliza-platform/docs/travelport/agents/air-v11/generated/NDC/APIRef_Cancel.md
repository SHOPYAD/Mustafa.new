# Cancel API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/NDC/APIRef_Cancel.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Cancel API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Cancel API&#160;Reference Request Response Example request Example response POST receipt/reservations/ {workbenchID} /receipts?OfferIdentifier=" {OfferID} " For {workbenchID} send the workbench identifier returned in ReservationResponse/Identifer/value in the workbench create response. For {OfferID} send the offer identifier from Offer/Identifier/value in the Create Workbench response. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Exchange, Refund, and Void Guide NDC&#160;only; not supported for GDS. The Cancel API is used instead of the standard workbench commit to complete the following workflows; see the Exchange, Refund, and Void Guide for workflow details: Issue a refund for an NDC&#160; ticket An air segment without any associated fare or pricing, generally booked for availability versus cost. Shown in the UnpricedSegments object instead of the Offer object. GDS only; NDC does not use unpriced segments. Void an NDC ticket Cancel an NDC held booking A confirmed reservation with the carrier. A held booking is a reservation that has not yet been ticketed. The terms booking and reservation&#160;are interchangeable. Related options: To cancel offers in the initial booking workbench, use the Cancel Workbench Items API . To modify a held NDC booking, use the NDC&#160;modify workflow: Reshop , Reprice , and Modify . Refund Quote is mandatory when canceling a ticket outside the void period and there is any difference between a refund due and the purchase price. If Refund Quote is not sent, and a refund is not available for the exact amount of the purchase price, Cancel returns the error message OFFER CANNOT BE CANCELED WHEN REFUND AMOUNT DOES NOT EQUAL OFFER PRICE. PERFORM A REFUND QUOTE AND TRY AGAIN. For GDS&#160;and NDC differences in the JSON APIs, see the support tables for seats , ancillaries , fare rules , and exchanges/refunds , and the NDC&#160;and GDS Functionality Comparison . For differences within NDC by individual carriers, see NDC capabilities by airline through JSON API in the Travelport Knowledge Base. See Knowledge Base NDC&#160;Resources if you need login assistance. Request As part of the request requirements, also see Authentication and Common Air API Headers . Header Parameters In addition to the Common Air API Headers , in the Cancel API, the RetainFlag header parameter determines the type of cancellation. Parameter Description Required/Optional RetainFlag Determines the type of cancel operation. Supported values: false : Default. Either omit or send with value of false for all of the following scenarios: Void: Void a ticket within the void period (issues a refund if sent within the void period ) Refund : Cancel a ticket outside the void period; in this case Cancel should be preceded by the Refund Quote request. A full or partial refund is issued if the ticket is eligible for a refund per the fare rules. Refund Quote is mandatory when canceling a ticket outside the void period and there is any difference between a refund due and the purchase price. If Refund Quote is not sent, and a refund is not available for the exact amount of the purchase price, Cancel returns the error message OFFER CANNOT BE CANCELED WHEN REFUND AMOUNT DOES NOT EQUAL OFFER PRICE. PERFORM A REFUND QUOTE AND TRY AGAIN. Cancel:&#160;For a held booking (unticketed), cancels the booking. true : For supporting&#160;NDC carriers only, send with true to cancel the ticket and the offer but retain the ticket value instead of issuing a refund. You can then reticket the itinerary by sending a new Form of Payment and Payment . Or, you may be able to apply the value of the ticket to another booking using the Ticket as FOP API . For carrier support for retaining the ticket value and using the retained ticket value as FOP on another booking, see the sections Retain Tickets and Deferred Payment in NDC capabilities by airline through JSON API in the Travelport Knowledge Base. Required Query Parameters Also see section above on header parameters. Parameter Description Required/Optional OfferIdentifier Send the offer identifier for the offer to cancel or void as applicable. Returned in the Create Workbench response in Offer/Identifier/value. Required Request Body No message payload. Be sure to set the HTTP&#160;header parameters per above to indicate the cancel operation. Response The content of the response depends on the offer canceled: When RetainFlag is set to false in the request: For a reservation, the booking is canceled. The response does not return a ticket number because no ticket was issued. For a ticket, if the ticket is inside the void period determined by the airline, the ticket is voided and any available refund credited to the original form of payment. For a ticket, if the ticket is outside the void period or not eligible for a full refund, the ticket is canceled and no refund or a partial refund is issued. When RetainFlag is set to true in the request, the ticket and segments are canceled but the ticket value is retained and can be applied to a subsequent booking. Supported NDC carriers only. Show Response Body Table Object Description ReceiptListResponse Top level object for response. Includes ReceiptID and ReferenceList objects. ReceiptID Top level object for cancellation details. Several instances may be returned, with various @type values. Possible @type values include: ReceiptCancellation : Returned for all canceled reservations and tickets. Includes Identifier, OfferRef, and Cancellation objects. See below. ReceiptPayment : Returned only if booking had been ticketed. Includes Identifier, OfferRef, and Document objects. See below. All instances of ReceiptID include the following: id: &#160;Internal identifier. Identifier : Standard identifier object with authority and value. Information from the carrier is identified with a value of the carrier code in authority ; may not be returned for non-carrier instances such as for the Travelport information applicable to the passive booking ). OfferRef : Cross-reference number for details for the canceled offer in ReferenceList/Offer/id. ReceiptID @type ReceiptCancellation/ Cancellation Returns details specific to the canceled booking. Includes the following: @type: Cancellation status. In all cancel scenarios, a successful cancellation returns a type of CancellationHold . Locator : Details for a specific locator code for the canceled booking; returned for both held and ticketed bookings; multiple instances may be returned when multiple locator codes apply: source:&#160;Provider for this locator code. For NDC, codes returned by the airline are identified with the carrier code. Returned with value 1G or similar for locator codes assigned by Travelport on passive bookings ). sourceContext: Source of information to which cancellation details apply such as VendorLocator for the locator code or OrderId for an NDC internal order number. Not returned with the passive booking locator code. value:&#160;The reservation&#160;locator code. ReceiptID&#160;@type ReceiptPayment/ Document Returned in ReceiptID with @type ReceiptPayment, which is returned only if booking had been ticketed. Document returns the following ticket details: @type : Returns one of the following values: DocumentTicketVoid: Ticket was canceled within the void period and a full refund issued. DocumentTicketRefund: Ticket was canceled after the void period, and either: a full refund was issued (positive value in ModifyPrice/TotalPrice, indicating amount of refund) a partial or no refund was issued (negative value in ModifyPrice/TotalPrice, indicating amount forfeited) DocumentTicketRetained: Segments were canceled but the ticket value was retained. Invoice remarks note the amount retained. NDC only; retained tickets are not supported for GDS or by all NDC carriers. Number : The ticket number of the canceled ticket. VoidInd : Returns true if ticket was successfully voided. ReferenceList Top level object. Includes ReferenceListTraveler and ReferenceListOffer. ReferenceListTraveler Returns traveler details in the Traveler object.&#160; Traveler Specific objects returned vary according to what traveler details were added to the booking but generally include id, Identifier, PersonName, Telephone, Email, and TravelDocument. See Reservation Retrieve for details on Traveler objects. ReferenceListOffer Returns details of canceled offer in the Offer object. Offer Returns details of canceled offer. For all voided, canceled, or modified offers, returned with @type OfferModify. Includes Identifier, Product, Price, TermsAndConditionsFull, and ModifyPrice. Identifier Offer identifier for the canceled offer. In this case, authority is always the NDC carrier code. Key value pairs: authority : Source of information. value : Unique system-generated identifier. Product Standard Product object with flight details for the canceled offer. See Reservation Retrieve for details. Price Standard Price object with price details for the canceled offer. See Reservation Retrieve for details. TermsAndConditionsFull Standard TermsAndConditionsFull object with terms and conditions of the canceled offer. See Reservation Retrieve for details. ModifyPrice For canceled or voided tickets, details about any refund. Not returned for canceled bookings, as no payment was made. Includes CurrencyCode and TotalPrice objects. CurrencyCode The currency of the fare. Key value pairs: decimalPlace: &#160;Number of decimal places in the currency. value: &#160;String. Currency code. TotalPrice Number. A positive number here indicates the amount of the refund for a canceled or voided ticket. A negative value indicates the amount of the ticket value forfeited. Example Request No message body. Example POST request: https://api.pp.travelport.com/11/air/receipt/reservations/reservations/1ace440f-66e9-4898-9802-3fc35b24bfd1/receipts?OfferIdentifier=QUEwMDEzRjZCOTJDNHxQb1BDQzQxOTIxMS1CQ0I3LT Q5NEYtOUFBMy0xLTF8UG9QQ0M0MTkyMTEtQkNCNy00OTRGLTlBQTMtMS0y Example Response In all cancel scenarios, a successful cancellation returns at least one instance of ReceiptID@type ReceiptCancellation/Cancellation@type CancellationHold: "Cancellation": { "@type": "CancellationHold", "Locator": { "source": "SQ", "sourceContext": "VendorLocator", "value": "5EI5CB" } For tickets, cancel and void requests also return an instance of ReceiptID@type ReceiptPayment in which Document@type indicates the void or refund; see the table above for possible values. In the following example, the ticket was voided with the void period (ReceiptID@type ReceiptPayment/Document@type=DocumentTicketVoid and VoidInd=true) and the full ticket value was refunded. The response for a canceled and refunded ticket is similar. The response for a canceled reservation is also similar but does not return an instance of ReceiptID with @type ReceiptPayment because no payment was made. Show Full Example Cancellation Response - voided ticket { "ReceiptListResponse": { "@type": "ReceiptListResponse", "ReceiptID": [ { "@type": "ReceiptCancellation", "id": "receipt_1", "Identifier": { "authority": "SQ", "value": "60392c8f-5a72-453d-bfbe-3953db40d0b9" }, "OfferRef": [ "1" ], "Cancellation": { "@type": "CancellationHold", "Locator": { "source": "SQ", "sourceContext": "VendorLocator", "value": "5EI5CB" } } }, { "@type": "ReceiptCancellation", "id": "receipt_2", "Identifier": { "authority": "SQ", "value": "10814c12-0e54-477c-9c7c-485b9d394b43" }, "OfferRef": [ "1" ], "Cancellation": { "@type": "CancellationHold", "Locator": { "source": "SQ", "sourceContext": "OrderId", "value": "SQ_5EI5CB" } } }, { "@type": "ReceiptPayment", "id": "receipt_3", "ReceiptRef": "receipt_1", "Identifier": { "authority": "SQ", "value": "fa128d62-ba4e-40aa-9a7e-600d6c88daa2" }, "OfferRef": [ "1" ], "Document": [ { "@type": "DocumentTicketVoid", "Number": "6182439894937", "TravelerIdentifierRef": { "value": "trav_1" }, "VoidInd": "true" } ] }, { "@type": "ReceiptCancellation", "id": "receipt_4", "OfferRef": [], "Cancellation": { "@type": "CancellationHold", "Locator": { "source": "1G", "value": "2WSSNH" } } } ], "ReferenceList": [ { "@type": "ReferenceListOffer", "Offer": [ { "@type": "OfferModify", "id": "1", "offerRef": "1", "Identifier": { "authority": "SQ", "value": "NUVJNUNCfFNRXzVFSTVDQl9BSVItMXxTUXxTUV81RUk1Q0J8cHJvZHVjdDFfczEtU0VHMXxBRFQ6UEFYMw==" }, "Product": [ { "@type": "ProductAir", "totalDuration": "PT4H", "id": "product1", "Identifier": { "authority": "SQ", "value": "762fe1dd-d4b5-4458-be4a-af74b79d9e02" }, "FlightSegment": [ { "@type": "FlightSegment", "id": "s1", "sequence": 1, "Flight": { "@type": "Flight", "carrier": "SQ", "number": "895", "id": "seg1", "Identifier": { "authority": "SQ", "value": "c4e81840-f2d5-4a61-80a8-b5b218a6e20f" }, "Departure": { "@type": "DepartureDetail", "terminal": "1", "location": "HKG", "date": "2022-12-22", "time": "18:50:00" }, "Arrival": { "@type": "ArrivalDetail", "terminal": "0", "location": "SIN", "date": "2022-12-22", "time": "22:50:00" } } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 1 ], "classOfService": "W", "fareBasisCode": "W14HKO" } ] } ] } ], "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 0, "value": "HKD" }, "Base": 2670, "TotalTaxes": 265, "TotalFees": 0, "TotalPrice": 2935, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 0, "value": "HKD" }, "Base": 2670, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 265, "Tax": [ { "taxCode": "G3", "value": 90 }, { "taxCode": "HK", "value": 120 }, { "taxCode": "I5", "value": 55 } ] }, "Total": 2935 } } ] }, "TermsAndConditionsFull": [ { "@type": "TermsAndConditionsFullAir", "TextBlock": [ { "@type": "TextBlockDetail", "description": "FARE RULES", "title": "ATC_EXCHANGE_ELIGIBILITY", "TextFormatted": [ { "value": "true" } ] }, { "@type": "TextBlockDetail", "description": "FARE RULES", "title": "ATC_REFUND_ELIGIBILITY", "TextFormatted": [ { "value": "true" } ] }, { "@type": "TextBlockDetail", "description": "FARE RULES", "title": "VOID_ELIGIBILITY", "TextFormatted": [ { "value": "true" } ] } ], "BaggageAllowance": [ { "@type": "BaggageAllowanceDetail", "passengerTypeCodes": [ "ADT" ], "baggageType": "FirstCheckedBag", "ProductRef": [ "product1" ], "BaggageItem": [ { "@type": "BaggageItem", "quantity": 1, "Measurement": [ { "measurementType": "Weight", "unit": "Kilograms", "value": 30 } ] } ] } ], "FareRuleInfo": [ { "@type": "FareRuleInfoText", "flightsRefs": [ "s1" ], "TextFareRule": [ { "name": "Cancel", "value": "Reissue/Refund minimum penalty amount after departure: HKD0" }, { "name": "Cancel", "value": "Reissue/Refund maximum penalty amount for the ticket after departure: HKD0" }, { "name": "Cancel", "value": "Reissue/Refund maximum penalty amount with sale currency: HKD0" }, { "name": "Cancel", "value": "Reissue/Refund minimum penalty amount after departure no show: HKD0" }, { "name": "Cancel", "value": "Reissue/Refund maximum penalty amount for the ticket after departure no show: HKD0" }, { "name": "Cancel", "value": "Reissue/Refund maximum penalty amount after departure no show: HKD0" }, { "name": "Cancel", "value": "Reissue/Refund minimum penalty amount before departure: HKD790" }, { "name": "Cancel", "value": "Reissue/Refund maximum penalty amount for the ticket before departure: HKD790" }, { "name": "Cancel", "value": "Reissue/Refund maximum penalty amount before departure: HKD790" }, { "name": "Cancel", "value": "Reissue/Refund minimum penalty amount before departure no show: HKD1570" }, { "name": "Cancel", "value": "Reissue/Refund maximum penalty amount for the ticket before departure no show: HKD1570" }, { "name": "Cancel", "value": "Reissue/Refund maximum penalty amount before departure no show: HKD1570" }, { "name": "Change", "value": "Revalidation maximum penalty amount for the ticket after departure: HKD0" }, { "name": "Change", "value": "Revalidation minimum penalty amount after departure: HKD0" }, { "name": "Change", "value": "Reissue/Refund minimum penalty amount after departure: HKD0" }, { "name": "Change", "value": "Reissue/Refund maximum penalty amount for the ticket after departure: HKD0" }, { "name": "Change", "value": "Revalidation maximum penalty amount after departure: HKD0" }, { "name": "Change", "value": "Reissue/Refund maximum penalty amount with sale currency: HKD0" }, { "name": "Change", "value": "Revalidation maximum penalty amount for the ticket after departure no show: HKD0" }, { "name": "Change", "value": "Revalidation minimum penalty amount after departure no show: HKD0" }, { "name": "Change", "value": "Reissue/Refund minimum penalty amount after departure no show: HKD0" }, { "name": "Change", "value": "Reissue/Refund maximum penalty amount for the ticket after departure no show: HKD0" }, { "name": "Change", "value": "Revalidation maximum penalty amount after departure no show: HKD0" }, { "name": "Change", "value": "Reissue/Refund maximum penalty amount after departure no show: HKD0" }, { "name": "Change", "value": "Revalidation maximum penalty amount for the ticket before departure: HKD160" }, { "name": "Change", "value": "Revalidation minimum penalty amount before departure: HKD160" }, { "name": "Change", "value": "Reissue/Refund minimum penalty amount before departure: HKD0" }, { "name": "Change", "value": "Reissue/Refund maximum penalty amount for the ticket before departure: HKD160" }, { "name": "Change", "value": "Revalidation maximum penalty amount before departure: HKD160" }, { "name": "Change", "value": "Reissue/Refund maximum penalty amount before departure: HKD160" }, { "name": "Change", "value": "Revalidation maximum penalty amount for the ticket before departure no show: HKD790" }, { "name": "Change", "value": "Revalidation minimum penalty amount before departure no show: HKD790" }, { "name": "Change", "value": "Reissue/Refund minimum penalty amount before departure no show: HKD0" }, { "name": "Change", "value": "Reissue/Refund maximum penalty amount for the ticket before departure no show: HKD790" }, { "name": "Change", "value": "Revalidation maximum penalty amount before departure no show: HKD790" }, { "name": "Change", "value": "Reissue/Refund maximum penalty amount before departure no show: HKD790" } ] } ], "Penalties": [ { "@type": "Penalties", "Change": [ { "@type": "ChangePermitted", "penaltyTypes": [ "AfterDeparture" ], "higherPenatltyAppliesInd": true, "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "HKD", "minorUnit": 2, "value": 0 } } ] }, { "@type": "ChangePermitted", "penaltyTypes": [ "AfterDeparture" ], "higherPenatltyAppliesInd": true, "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "HKD", "minorUnit": 2, "value": 0 } } ] }, { "@type": "ChangePermitted", "penaltyTypes": [ "AfterDeparture" ], "higherPenatltyAppliesInd": true, "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "HKD", "minorUnit": 2, "value": 0 } } ] }, { "@type": "ChangePermitted", "penaltyTypes": [ "AfterDeparture" ], "higherPenatltyAppliesInd": true, "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "HKD", "minorUnit": 2, "value": 0 } } ] }, { "@type": "ChangePermitted", "penaltyTypes": [ "AfterDeparture" ], "higherPenatltyAppliesInd": true, "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "HKD", "minorUnit": 2, "value": 0 } } ] }, { "@type": "ChangePermitted", "penaltyTypes": [ "AfterDeparture" ], "higherPenatltyAppliesInd": true, "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "HKD", "minorUnit": 2, "value": 0 } } ] }, { "@type": "ChangePermitted", "penaltyTypes": [ "AfterDeparture", "NoShow" ], "higherPenatltyAppliesInd": true, "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "HKD", "minorUnit": 2, "value": 0 } } ] }, { "@type": "ChangePermitted", "penaltyTypes": [ "AfterDeparture", "NoShow" ], "higherPenatltyAppliesInd": true, "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "HKD", "minorUnit": 2, "value": 0 } } ] }, { "@type": "ChangePermitted", "penaltyTypes": [ "AfterDeparture", "NoShow" ], "higherPenatltyAppliesInd": true, "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "HKD", "minorUnit": 2, "value": 0 } } ] }, { "@type": "ChangePermitted", "penaltyTypes": [ "AfterDeparture", "NoShow" ], "higherPenatltyAppliesInd": true, "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "HKD", "minorUnit": 2, "value": 0 } } ] }, { "@type": "ChangePermitted", "penaltyTypes": [ "AfterDeparture", "NoShow" ], "higherPenatltyAppliesInd": true, "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "HKD", "minorUnit": 2, "value": 0 } } ] }, { "@type": "ChangePermitted", "penaltyTypes": [ "AfterDeparture", "NoShow" ], "higherPenatltyAppliesInd": true, "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "HKD", "minorUnit": 2, "value": 0 } } ] }, { "@type": "ChangePermitted", "penaltyTypes": [ "BeforeDeparture" ], "higherPenatltyAppliesInd": true, "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "HKD", "minorUnit": 2, "value": 160 } } ] }, { "@type": "ChangePermitted", "penaltyTypes": [ "BeforeDeparture" ], "higherPenatltyAppliesInd": true, "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "HKD", "minorUnit": 2, "value": 160 } } ] }, { "@type": "ChangePermitted", "penaltyTypes": [ "BeforeDeparture" ], "higherPenatltyAppliesInd": true, "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "HKD", "minorUnit": 2, "value": 0 } } ] }, { "@type": "ChangePermitted", "penaltyTypes": [ "BeforeDeparture" ], "higherPenatltyAppliesInd": true, "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "HKD", "minorUnit": 2, "value": 160 } } ] }, { "@type": "ChangePermitted", "penaltyTypes": [ "BeforeDeparture" ], "higherPenatltyAppliesInd": true, "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "HKD", "minorUnit": 2, "value": 160 } } ] }, { "@type": "ChangePermitted", "penaltyTypes": [ "BeforeDeparture" ], "higherPenatltyAppliesInd": true, "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "HKD", "minorUnit": 2, "value": 160 } } ] }, { "@type": "ChangePermitted", "penaltyTypes": [ "BeforeDeparture", "NoShow" ], "higherPenatltyAppliesInd": true, "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "HKD", "minorUnit": 2, "value": 790 } } ] }, { "@type": "ChangePermitted", "penaltyTypes": [ "BeforeDeparture", "NoShow" ], "higherPenatltyAppliesInd": true, "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "HKD", "minorUnit": 2, "value": 790 } } ] }, { "@type": "ChangePermitted", "penaltyTypes": [ "BeforeDeparture", "NoShow" ], "higherPenatltyAppliesInd": true, "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "HKD", "minorUnit": 2, "value": 0 } } ] }, { "@type": "ChangePermitted", "penaltyTypes": [ "BeforeDeparture", "NoShow" ], "higherPenatltyAppliesInd": true, "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "HKD", "minorUnit": 2, "value": 790 } } ] }, { "@type": "ChangePermitted", "penaltyTypes": [ "BeforeDeparture", "NoShow" ], "higherPenatltyAppliesInd": true, "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "HKD", "minorUnit": 2, "value": 790 } } ] }, { "@type": "ChangePermitted", "penaltyTypes": [ "BeforeDeparture", "NoShow" ], "higherPenatltyAppliesInd": true, "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "HKD", "minorUnit": 2, "value": 790 } } ] } ], "Cancel": [ { "@type": "CancelPermitted", "penaltyTypes": [ "AfterDeparture" ], "higherPenatltyAppliesInd": true, "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "HKD", "minorUnit": 2, "value": 0 } } ] }, { "@type": "CancelPermitted", "penaltyTypes": [ "AfterDeparture" ], "higherPenatltyAppliesInd": true, "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "HKD", "minorUnit": 2, "value": 0 } } ] }, { "@type": "CancelPermitted", "penaltyTypes": [ "AfterDeparture" ], "higherPenatltyAppliesInd": true, "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "HKD", "minorUnit": 2, "value": 0 } } ] }, { "@type": "CancelPermitted", "penaltyTypes": [ "AfterDeparture", "NoShow" ], "higherPenatltyAppliesInd": true, "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "HKD", "minorUnit": 2, "value": 0 } } ] }, { "@type": "CancelPermitted", "penaltyTypes": [ "AfterDeparture", "NoShow" ], "higherPenatltyAppliesInd": true, "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "HKD", "minorUnit": 2, "value": 0 } } ] }, { "@type": "CancelPermitted", "penaltyTypes": [ "AfterDeparture", "NoShow" ], "higherPenatltyAppliesInd": true, "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "HKD", "minorUnit": 2, "value": 0 } } ] }, { "@type": "CancelPermitted", "penaltyTypes": [ "BeforeDeparture" ], "higherPenatltyAppliesInd": true, "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "HKD", "minorUnit": 2, "value": 790 } } ] }, { "@type": "CancelPermitted", "penaltyTypes": [ "BeforeDeparture" ], "higherPenatltyAppliesInd": true, "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "HKD", "minorUnit": 2, "value": 790 } } ] }, { "@type": "CancelPermitted", "penaltyTypes": [ "BeforeDeparture" ], "higherPenatltyAppliesInd": true, "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "HKD", "minorUnit": 2, "value": 790 } } ] }, { "@type": "CancelPermitted", "penaltyTypes": [ "BeforeDeparture", "NoShow" ], "higherPenatltyAppliesInd": true, "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "HKD", "minorUnit": 2, "value": 1570 } } ] }, { "@type": "CancelPermitted", "penaltyTypes": [ "BeforeDeparture", "NoShow" ], "higherPenatltyAppliesInd": true, "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "HKD", "minorUnit": 2, "value": 1570 } } ] }, { "@type": "CancelPermitted", "penaltyTypes": [ "BeforeDeparture", "NoShow" ], "higherPenatltyAppliesInd": true, "Penalty": [ { "@type": "PenaltyAmount", "Amount": { "code": "HKD", "minorUnit": 2, "value": 1570 } } ] } ] } ] } ], "ModifyPrice": { "@type": "ModifyPriceDetail", "id": "priceDifference_1", "CurrencyCode": { "value": "HKD" }, "TotalPrice": 2935 } } ] }, { "@type": "ReferenceListTraveler", "Traveler": [ { "@type": "Traveler", "passengerTypeCode": "ADT", "id": "trav_1", "TravelerRef": "trav_1", "Identifier": { "authority": "Travelport", "value": "QURUfFBBWDM=" }, "PersonName": { "@type": "PersonName", "Prefix": "MR", "Given": "TESTFIRSTII", "Surname": "TESTLASTII" }, "Telephone": [ { "@type": "Telephone", "phoneNumber": "212456121", "id": "telephone_1", "role": "Work" } ], "Email": [ { "id": "email_1", "value": "TRAVELERONE@GMAIL.COM" }, { "id": "email_2", "value": "TRAVELERONE@GMAIL.COM" } ], "TravelDocument": [ { "@type": "TravelDocument", "docNumber": "H294F45", "docType": "Passport", "expireDate": "2032-11-22", "issueCountry": "IN", "PersonName": { "@type": "PersonName" } } ] } ] } ] } } &#160;

## Literal `<pre>` excerpts from HTML

### Block 1

```
"Cancellation": {
     "@type": "CancellationHold",
     "Locator": {
      "source": "SQ",
      "sourceContext": "VendorLocator",
      "value": "5EI5CB"
     }
```

### Block 2

```
{
 "ReceiptListResponse": {
  "@type": "ReceiptListResponse",
  "ReceiptID": [
   {
    "@type": "ReceiptCancellation",
    "id": "receipt_1",
    "Identifier": {
     "authority": "SQ",
     "value": "60392c8f-5a72-453d-bfbe-3953db40d0b9"
    },
    "OfferRef": [
     "1"
    ],
    "Cancellation": {
     "@type": "CancellationHold",
     "Locator": {
      "source": "SQ",
      "sourceContext": "VendorLocator",
      "value": "5EI5CB"
     }
    }
   },
   {
    "@type": "ReceiptCancellation",
    "id": "receipt_2",
    "Identifier": {
     "authority": "SQ",
     "value": "10814c12-0e54-477c-9c7c-485b9d394b43"
    },
    "OfferRef": [
     "1"
    ],
    "Cancellation": {
     "@type": "CancellationHold",
     "Locator": {
      "source": "SQ",
      "sourceContext": "OrderId",
      "value": "SQ_5EI5CB"
     }
    }
   },
   {
    "@type": "ReceiptPayment",
    "id": "receipt_3",
    "ReceiptRef": "receipt_1",
    "Identifier": {
     "authority": "SQ",
     "value": "fa128d62-ba4e-40aa-9a7e-600d6c88daa2"
    },
    "OfferRef": [
     "1"
    ],
    "Document": [
     {
      "@type": "DocumentTicketVoid",
      "Number": "6182439894937",
      "TravelerIdentifierRef": {
       "value": "trav_1"
      },
      "VoidInd": "true"
     }
    ]
   },
   {
    "@type": "ReceiptCancellation",
    "id": "receipt_4",
    "OfferRef": [],
    "Cancellation": {
     "@type": "CancellationHold",
     "Locator": {
      "source": "1G",
      "value": "2WSSNH"
     }
    }
   }
  ],
  "ReferenceList": [
   {
    "@type": "ReferenceListOffer",
    "Offer": [
     {
      "@type": "OfferModify",
      "id": "1",
      "offerRef": "1",
      "Identifier": {
       "authority": "SQ",
       "value": "NUVJNUNCfFNRXzVFSTVDQl9BSVItMXxTUXxTUV81RUk1Q0J8cHJvZHVjdDFfczEtU0VHMXxBRFQ6UEFYMw=="
      },
      "Product": [
       {
        "@type": "ProductAir",
        "totalDuration": "PT4H",
        "id": "product1",
        "Identifier": {
         "authority": "SQ",
         "value": "762fe1dd-d4b5-4458-be4a-af74b79d9e02"
        },
        "FlightSegment": [
         {
          "@type": "FlightSegment",
          "id": "s1",
          "sequence": 1,
          "Flight": {
           "@type": "Flight",
           "carrier": "SQ",
           "number": "895",
           "id": "seg1",
           "Identifier": {
            "authority": "SQ",
            "value": "c4e81840-f2d5-4a61-80a8-b5b218a6e20f"
           },
           "Departure": {
            "@type": "DepartureDetail",
            "terminal": "1",
            "location": "HKG",
            "date": "2022-12-22",
            "time": "18:50:00"
           },
           "Arrival": {
            "@type": "ArrivalDetail",
            "terminal": "0",
            "location": "SIN",
            "date": "2022-12-22",
            "time": "22:50:00"
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
            "fareBasisCode": "W14HKO"
           }
          ]
         }
        ]
       }
      ],
      "Price": {
       "@type": "PriceDetail",
       "CurrencyCode": {
        "decimalPlace": 0,
        "value": "HKD"
       },
       "Base": 2670,
       "TotalTaxes": 265,
       "TotalFees": 0,
       "TotalPrice": 2935,
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
          "Base": 2670,
          "Taxes": {
           "@type": "TaxesDetail",
           "TotalTaxes": 265,
           "Tax": [
            {
             "taxCode": "G3",
             "value": 90
            },
            {
             "taxCode": "HK",
             "value": 120
            },
            {
             "taxCode": "I5",
             "value": 55
            }
           ]
          },
          "Total": 2935
         }
        }
       ]
      },
      "TermsAndConditionsFull": [
       {
        "@type": "TermsAndConditionsFullAir",
        "TextBlock": [
         {
          "@type": "TextBlockDetail",
          "description": "FARE RULES",
          "title": "ATC_EXCHANGE_ELIGIBILITY",
          "TextFormatted": [
           {
            "value": "true"
           }
          ]
         },
         {
          "@type": "TextBlockDetail",
          "description": "FARE RULES",
          "title": "ATC_REFUND_ELIGIBILITY",
          "TextFormatted": [
           {
            "value": "true"
           }
          ]
         },
         {
          "@type": "TextBlockDetail",
          "description": "FARE RULES",
          "title": "VOID_ELIGIBILITY",
          "TextFormatted": [
           {
            "value": "true"
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
           "product1"
          ],
          "BaggageItem": [
           {
            "@type": "BaggageItem",
            "quantity": 1,
            "Measurement": [
             {
              "measurementType": "Weight",
              "unit": "Kilograms",
              "value": 30
             }
            ]
           }
          ]
         }
        ],
        "FareRuleInfo": [
         {
          "@type": "FareRuleInfoText",
          "flightsRefs": [
           "s1"
          ],
          "TextFareRule": [
           {
            "name": "Cancel",
            "value": "Reissue/Refund minimum penalty amount after departure: HKD0"
           },
           {
            "name": "Cancel",
            "value": "Reissue/Refund maximum penalty amount for the ticket after departure: HKD0"
           },
           {
            "name": "Cancel",
            "value": "Reissue/Refund maximum penalty amount with sale currency: HKD0"
           },
           {
            "name": "Cancel",
            "value": "Reissue/Refund minimum penalty amount after departure no show: HKD0"
           },
           {
            "name": "Cancel",
            "value": "Reissue/Refund maximum penalty amount for the ticket after departure no show: HKD0"
           },
           {
            "name": "Cancel",
            "value": "Reissue/Refund maximum penalty amount after departure no show: HKD0"
           },
           {
            "name": "Cancel",
            "value": "Reissue/Refund minimum penalty amount before departure: HKD790"
           },
           {
            "name": "Cancel",
            "value": "Reissue/Refund maximum penalty amount for the ticket before departure: HKD790"
           },
           {
            "name": "Cancel",
            "value": "Reissue/Refund maximum penalty amount before departure: HKD790"
           },
           {
            "name": "Cancel",
            "value": "Reissue/Refund minimum penalty amount before departure no show: HKD1570"
           },
           {
            "name": "Cancel",
            "value": "Reissue/Refund maximum penalty amount for the ticket before departure no show: HKD1570"
           },
           {
            "name": "Cancel",
            "value": "Reissue/Refund maximum penalty amount before departure no show: HKD1570"
           },
      
…
```

