# Workbench Commit API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Workbench/APIRef_WorkbenchCommit.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Workbench Commit API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Workbench Commit API&#160;Reference Request Response Example request Example response POST book/reservation/reservations/ {workbenchID} For {workbenchID} send the workbench identifier returned in ReservationResponse/Identifer/value in the workbench create response. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Booking Guide , Ticketing Guide The Workbench Commit request ends a workbench session and commits all requests made in that session. Depending on the requests sent in the workbench session, the workbench commit could result in any of the following: Create a booking at the end of the initial booking workflow Issue a ticket or EMD, after sending payment for that ticket or EMD in the workbench with the Payment request Modify or cancel a booking (you can cancel a booking or add or remove offers, products, or segments with Cancel Workbench Items ) Modify traveler data, after sending the Traveler Updatable Items and Traveler Update requests in the workbench Exchange a ticket using the GDS Exchange APIs (note that NDC&#160;exchanges use Modify to end the exchange instead of Workbench Commit) The workbench commit supports several optional query parameters and payloads to carry out certain actions at commit. Some are supported only in specific flows, such as the initial booking flow, a ticketing commit, or an exchange commit, as specified. In the initial booking workflow, if any pricing modifier sent in the Add Offer full payload or reference payload request does not have any fares associated with it, the commit will fail and return the error message No Fare Found . Pricing happens at the commit, not the Add Offer step. NDC carrier British Airways (BA) does not guarantee the price of a held booking. When ticketing a held booking, the workbench commit returns an error message if the price has changed. In this case, you must use the Reprice and Modify APIs (see the Exchange,&#160;Refund, and Void Guide ) and send payment to complete ticketing. Carrier code delay at booking: In some instances, the carrier requires additional time to return the carrier locator code. Because this can be an issue for agencies that require this code at the time of booking, AirReservation makes one additional attempt to retrieve the reservation from the carrier. If the carrier locator code cannot be retrieved, and agencies must retrieve the reservation later. This can happen in any booking scenario upon commit but is most common when the booking contains an ancillary such as a wheelchair. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters Parameter Description Required/Optional autoDeleteDate Optional. Use to create, update, or delete retention segments, and to create a shell booking for booking failures caused by specific scenarios. Retention Segments By default, reservation details are stored for one month after all travel on the itinerary is completed. This means you can continue to retrieve the reservation&#160;for one month after travel, at which time the reservation&#160;is purged and no longer available. You can extend this time by setting a purge date that is up to 331 days from the date the reservation was created: In the commit of the initial booking workbench session , send autoDeleteDate with a date in YYYY-MM-DD format, as in ?autoDeleteDate=2024-08-12 . Adding a purge date creates a retention segment on the host reservation. The autoDeleteDate value is returned in the Reservation Retrieve, Workbench Commit, and Post-Commit Workbench responses. To update or delete the autoDeleteDate, at the end of a post-commit workbench session , send autoDeleteDate with one of the following: To update the purge date for an existing retention segment, send the new date; e.g., ?autoDeleteDate=2023-08-12 To delete the existing retention segment, send with the value 1000-01-01 Create Reservation Shell (Shell Booking) Sending autoDeleteDate with any date value in the commit of the initial booking workbench session creates a reservation shell if the booking fails either because the offer cannot be added or the fare cannot be quoted. This reservation shell contains traveler details and allows the booking to be completed later. See Create Shell Booking in Case of Booking Failure . Optional Issuance Optional. Send with a value of BACKOFFICE to update any back office accounting systems. You can send Issuance in the workbench commit at the end of a booking session, or at ticketing. The response includes an interface control number. Optional payLaterInd For use only when exchanging GDS tickets; see the Exchanges, Refunds, and Void Guide for details. Sets whether to issue the new ticket/s now, or create a held booking for later fulfillment. Supported values: true: Holds changes for later fulfillment and ticketing. false: Issues ticket and any other documents such as EMDs on commit. Required for a ticket exchange only DocumentValue For use only when exchanging GDS tickets; see the Exchanges, Refunds, and Void Guide for details. If sent, send with a value of REFUND , which refunds an EMD that has a refundable balance to the original FOP and is the only supported value. Refunds are indicated in the Exchange Search response by a negative amount in ModifyPrice/TotalPrice, and a value of either EMD or MCO in TermsAndConditions/FulfillmentMethod/RefundMethod. Alternately, you can refund or forfeit any EMD&#160;value using the EMD&#160;Void request . If the new itinerary is ticketed at the time of reservation (pay now flow), and there is a residual balance to an MCO&#160;(miscellaneous change order), the MCO is issued along with the ticket at workbench commit. If the new itinerary is booked but not ticketed (pay later flow), any MCO is created but not issued yet. This allows customers to display, modify, and issue their own MCO outside of the JSON APIs if desired. If the reservation is subsequently ticketed using Exchange Ticketing, the MCO&#160;is issued at commit as usual. Optional for a ticket exchange If not sent any value remains on the EMD. Request Body Although a workbench commit does not require any message payload, it supports several optional actions that can be specified in an optional payload. The following table includes all objects that are supported for the optional workbench commit payload. See the following links in the Air Booking Guide for a full description of these optional actions supported at commit: Enable Two-Step Commit and Warnings for Price Change, Schedule Change, or Minimum Connect Time (MCT) Accept involuntary schedule change Specify a queue at ticketing (Ticketing Guide) Update or delete ticketing time limit date Add ReceivedFrom for Deem Show Table for optional workbench commit request payload Object Description Required/Optional ReservationQueryCommitReservation Top-level object. May include Notification and ReceivedFrom objects. Required scheduleChangeAcceptedInd Indicator to update the booking with an involuntary flight schedule change, which occurs when an airline has modified a flight schedule. Used when a schedule change has occurred after the booking has been made. If you are only accepting a schedule change, you can but are not required to create a workbench session before this commit. Boolean. Supported values: true:&#160;Accepts the schedule change. false: Does not update the booking with the schedule change. Default. To check whether a flight schedule has been modified, send a Reservation Retrieve request. In the response: For GDS, a value in OfferStatus/StatusAir/code of either TK &#160;or UN indicates the flight has schedule change information. For NDC, the response returns NDC&#160;CONTENT&#160;HAS&#160;CHANGED in ReservationComment when a schedule change has occurred. See NDC&#160;Flight Disruption Handling in the Booking Guide for details. Optional enableTwoStepCommitInd GDS&#160;only; not supported for NDC. In the initial booking workflow, or when adding an offer to an existing reservation, enables a two-step commit process that, when combined with errorWhenPriceChangesInd, errorWhenScheduleChangesInd, and/or overrideMCTInd, returns a warning if the error for that indicator occurs. If so, AirReservation keeps the workbench active and returns a warning message and additional details. Boolean. Supported values: true :&#160;Enables a two-step commit that returns a warning message in selected scenarios instead of proceeding with the booking. false or not sent (default): Does not enable two-step commit. In the case of a price or schedule change, or MCT violation, creates the booking and returns a warning message about the change. If a two-step commit is triggered, you must send an additional commit request if you want to complete the booking. See the Air Booking Guide for a full description, examples, and alternative actions to proceeding with the booking. Optional errorWhenPriceChangesInd GDS&#160;only; not supported for NDC. Boolean. Supported values and behavior at initial workbench commit : true :&#160;When sent with enableTwoStepCommitInd=true, triggers a two-step commit if the price has changed since the offer was added to the workbench. The response includes the warning, and an Offer @type OfferModify object that returns priceUpdatedInd=true to note the updated price, returns the new price, and breaks down the price change. false (default) or not sent: In the case of a price change, creates the booking and returns a warning message about the change. If no price change occurs, AirReservation creates the booking at initial commit as usual. If a two-step commit is triggered and you want to proceed with the booking, for the second workbench commit , send with false or do not send. Do not send with true , which returns an error and discards the workbench. Optional errorWhenScheduleChangesInd GDS&#160;only; not supported for NDC. Boolean. Supported values and behavior at initial workbench commit : true :&#160;When sent with enableTwoStepCommitInd=true, triggers a two-step commit if the schedule has changed since the offer was added to the workbench. The response includes a warning, an Offer @type OfferModify object that returns scheduleChangeInd=true to note the schedule change, and updated flight details in Product. false (default)&#160;or not sent: In the case of a schedule change, creates the booking and returns a warning message about the change. If no schedule change occurs, AirReservation creates the booking at initial commit as usual. If a two-step commit is triggered and you want to proceed with the booking, for the second workbench commit , send with false or do not send. Do not send with true , which returns an error and discards the workbench. Optional overrideMCTInd GDS&#160;only; not supported for NDC. A Minimum Connect Time (MCT) violation occurs when an airline deems there is not sufficient time for passengers to reach their connecting flight. MCT thresholds are set by individual carriers. Boolean. Supported values and behavior at initial workbench commit true:&#160;In the case of MCT violation, AirReservation overrides the warning, creates the booking (if successful), and returns the warning in the response. Default. false: When sent with enableTwoStepCommitInd=true, triggers a two-step commit if the carrier returns an MCT&#160;violation, returning a response with a message that the connection duration cannot be less than the minimum connecting time. Note that if sent with false and enableTwoStepCommitInd=false or is not sent, an error occurs and the booking workbench is discarded. If no MCT violation occurs, AirReservation creates the booking at initial commit as usual. If a two-step commit is triggered and you want to proceed with the booking, for the second workbench commit , send overrideMCTInd as true , or send empty or do not send, to override the MCT&#160;message from the carrier and create the booking. Do not send again with false , which discards the workbench. Optional ReceivedFrom GDS&#160;only; not supported for NDC. Supported for both ticketing and exchanges. ReceivedFrom is used on the Deem platform to add name details for the person a backoffice comment was received from. After sending, receivedFrom details are viewable only in a terminal program, not in the JSON Reservation Retrieve API. String. Value to note received from. Optional Notification Top-level object. May include QueueNumber and Date objects. Optional; required for QueueNumber or Date objects QueueNumber After booking and either with or prior to ticketing, you can place a booking on a queue. (See Queues in the Ticketing Guide for details.) If sending, send with Notification; at a minimum must send queue number in value below. This is one of two ways to specify a queue. Alternately, you can send the standalone Queue Placement request anytime after booking and before ticketing. Optional category String. Queue category. Optional subcategory String. Queue subcategory. Optional overridePCC Send only if overriding the default PCC. Optional value Send&#160;the queue number. Required with QueueNumber Date Send to update or delete the ticketing time limit on a booking. This is the last day to ticket the booking before the offer expires. If sending, send with Notification, Send one of the following in YYYY-MM-DD format: To update or add a date: Send the new date in the local time. To delete the existing date: Send with a value of 1000-01-01 . Optional Response The Workbench Commit response uses the same structure as the Reservation Retrieve response; see Reservation Retrieve response for full documentation. However, the Workbench Commit request does not support the query parameters available in&#160;Reservation Retrieve and so information such as fare rules and certain remarks are not returned. See the intro to the Reservation Retrieve response for a full list. Response for first workbench commit at two-step commit See Enable Two-Step Commit and Warnings in the Booking Guide for usage details and examples for two-step commit. In the initial booking workflow, or when adding an offer to an existing reservation, you can send enableTwoStepCommitInd=true to enable a two-step commit process that returns a warning if specific error scenarios occur. If a two-step commit is triggered, the booking is not created and this first commit response differs from the typical commit response. The following table lists the top-level objects returned in the first commit of the two-step commit response and details all objects that are returned only in that response. For objects that are the same as in the typical Workbench Commit response, see full descriptions in the Reservation Retrieve API&#160;Reference . The response to a second commit that creates a booking uses the same structure as a Reservation Retrieve response, as outlined above. Show Response Body Table for first commit when two-step commit is triggered Object Description ReservationResponse Top level object for response. Result Returns the error or warning message about the warning condition that triggered the two-step commit. Because the booking was not committed, Result/status is Not Processed . A descriptive error or warning is returned in Result/Error/Message or Result/Warning/Message, such as this example for a price increase: "The Total Price has been increased from 725.0 GBP to 740.0 GBP". See Error Messaging for additional details about errors. Identifier &#160; Standard Identifier object for the response. Reservation Top-level object for reservation details. Generally includes the Identifier, Offer, Traveler, Receipt, and ReservationDisplaySequence objects. May include additional objects if seats or other ancillaries were added to the workbench, or if two-step commit is triggered when adding an offer to an existing reservation. Offer In the two-step commit, several objects in Offer vary from the standard response. The following differences apply in the event of a price change : Offer is returned with @type&#160;OfferModify Offer returns the indicator priceUpdatedInd as true The response does not return the previous price. The updated price of the offer is returned in Offer/Price/TotalPrice. Offer includes a ModifyPrice object that returns a breakdown of the difference between the new price and the price when the offer was added to the workbench:&#160; Negative amounts in the Base, TotalTaxes, and/or TotalPrice objects indicate the new amount is less than the previous amount . Positive amounts in these objects indicate the new amount is more than the previous amount. Zero amounts (0) in these objects indicate the new amount is the same as the previous amount. Show Example Price and ModifyPrice objects for a price change In this excerpt, the Taxes object has been truncated for brevity. In this example, per ModifyPrice, the price of the base fare (Base) did not change, but the tax amount (TotalTaxes) and thus the TotalPrice both increased by 15. ... "Price" : { "@type" : "PriceDetail", "id" : "price_1", "CurrencyCode" : { "value" : "USD", "decimalPlace" : 2 }, "Base" : 625.0, "TotalTaxes" : 115.0, "TotalPrice" : 740.0, "PriceBreakdown" : [ { "@type" : "PriceBreakdownAir", "quantity" : 2, "requestedPassengerType" : "ADT", "Amount" : { "@type" : "Amount", "CurrencyCode" : { "value" : "GBP", "decimalPlace" : 2 }, "Base" : 250.0, "Taxes" : {...} } }, { "@type" : "PriceBreakdownAir", "quantity" : 1, "requestedPassengerType" : "CHD", "Amount" : { "@type" : "Amount", "CurrencyCode" : { "value" : "GBP", "decimalPlace" : 2 }, "Base" : 125.0, "Taxes" : {...} } } ] }, "ModifyPrice" : { "@type" : "ModifyPrice", "id" : "modifyPrice_1", "CurrencyCode" : { "value" : "GBP", "decimalPlace" : 2 }, "Base" : 0.0, "TotalTaxes" : 15.0, "TotalPrice" : 15.0 }, ... The following differences apply in the event of a schedule change : Offer is returned with @type&#160;OfferModify Offer returns the indicator scheduleChangeInd as true The Product object returns previous and updated schedule details in two instances of Product/FlightSegment as follows: The previous flight segment is identified with sequence=1 and Flight/id=flight_1 The updated flight segment is identified with sequence=2 and Flight/id=flight_2 Offer includes a ModifyPrice object; however, unless a price change has also occurred, Offer/Price repeats the original price of the offer and Offer/ModifyPrice returns all amounts as zero (0) to indicate there is no price change. Show Example Product object for a schedule change In this excerpt, the PassengerFlight object has been truncated for brevity. In this case, the flight number (Flight/number) and the departure and arrival times (Flight/Departure/time and Flight/Arrival/time) have changed. ... "Product": [ { "@type": "ProductAir", "id": "product_1", "totalDuration": "PT1H30M", "Identifier": { "value": "A0656EFF-FAF4-456F-B061-0161008D7C4E", "authority": "Travelport" }, "Quantity": 3, "FlightSegment": [ { "@type": "FlightSegment", "id": "flightSegment_1", "sequence": 1, "Flight": { "@type": "FlightDetail", "id": "flight_1", "carrier": "BA", "number": "123", "equipment": "777", "Departure": { "@type": "Departure", "location": "LHR", "date": "2025-11-24", "time": "09:45:00-06:00" }, "Arrival": { "@type": "Arrival", "location": "SIN", "date": "2025-11-24", "time": "14:15:00+06:00" } } }, { "@type": "FlightSegment", "id": "flightSegment_1", "sequence": 2, "Flight": { "@type": "FlightDetail", "id": "flight_2", "carrier": "BA", "number": "234", "equipment": "777", "Departure": { "@type": "Departure", "location": "LHR", "date": "2025-11-24", "time": "11:45:00-06:00" }, "Arrival": { "@type": "Arrival", "location": "SIN", "date": "2025-11-24", "time": "16:15:00+06:00" } } } ], "PassengerFlight": [...] } ],... &#160; TermsAndConditionsFull Standard object, no changes for two-step commit. Traveler Standard object; no changes for two-step commit. Receipt In the event of a two-step commit for any reason, Receipt/Confirmation/OfferStatus/StatusAir/value is returned as Rejected , as the booking has not been committed. ReservationDisplaySequence Returns the chronological (by date) order of all offers on the booking. Includes DisplaySequence. DisplaySequence Array. One instance for each offer. In the event of a price change, no change from standard format. In the event of a schedule change, note that one instance is returned for the previous flight segment, and a second instance is returned for the updated flight segment. Both instances have the same OfferRef and ProductRef values; however, the Sequence values are different. To identify the Sequence value for each flight segment, check the values in Offer/Product/FlightSegment/sequence, as described above for the Offer object. Example Request For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . No message payload is required for a workbench commit. The following examples show some of the optional payloads supported. The following optional payload triggers a two-step commit in the case of warnings about a schedule change, price change, and/or MCT warning. Show Example first workbench commit request for two-step commit and warnings { "ReservationQueryCommitReservation": { "enableTwoStepCommitInd": true, "overrideMCTInd": false, "errorWhenScheduleChangesInd": true, "errorWhenOfferPriceChangesInd": true, } } The following optional payload accepts an involuntary schedule change from the carrier. This is not related to schedule changes at initial commit in the preceding example. Show Example Workbench Commit payload to accept involuntary schedule change { "ReservationQueryCommitReservation": { "@type": "ReservationQueryCommitReservation", "scheduleChangeAcceptedInd": true } } The following optional payload adds the booking to an agency queue (QueueNumber) and updates the ticketing time limit (Date object). Show Example Workbench Commit payload to place booking on queue and update ticketing time limit { "ReservationQueryCommitReservation": { "@type": "ReservationQueryCommitReservation", "Notification": [ { "@type": "Notification", "QueueNumber": [ { "category": "DM", "overridePCC": "39RA", "value": 5 } ], "Date": "2026-10-16" } ] } } The following optional payload sends a ReceivedFrom object that allows online travel agencies (OTAs) and agents using the Deem platform to send a receive field at reservation creation or update. This object is not returned in the reservation retrieve. Show Example to add ReceivedFrom { "ReservationQueryCommitReservation": { "ReceivedFrom": "BHarper" } } Example Response The following examples show workbench commit responses for both GDS and NDC content. Because a workbench commit is used to conclude multiple scenarios - including but not limited to creating a reservation, updating an existing reservation, adding seats or ancillaries, exchanging a ticket - any workbench commit response may vary from the examples shown here. For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . See the Air Booking Guide for a full description and examples of the two-step commit process, including examples of the responses returned for the price and schedule change warning scenarios. GDS&#160;booking and ticketing examples The first example below is the response to a workbench commit at the end of the initial booking workflow. It creates a GDS booking with record locator BXPJVM. This is a one-way itinerary with one traveler. For comparison purposes, this same example booking (locator code BXPJVM) is also shown in the following example response for the ticketing commit, in the Post-Commit Workbench Create API&#160;Reference example response, and in the Reservation Retrieve API&#160;Reference example for the ticketed one-way GDS Itinerary. Show Example commit response for GDS at end of initial booking workflow { "ReservationResponse": { "@type": "ReservationResponse", "Reservation": { "@type": "Reservation", "Offer": [ { "@type": "Offer", "id": "offer_1", "Identifier": { "authority": "Travelport", "value": "c1f71f98-58d4-44cf-b9cb-0c22357b9aae" }, "ContentSource": "GDS", "Product": [ { "@type": "ProductAir", "id": "product_1", "FlightSegment": [ { "@type": "FlightSegment", "id": "FlightSegment_01", "sequence": 1, "Flight": { "@type": "Flight", "duration": "PT2H34M", "carrier": "AA", "number": "2755", "equipment": "319", "id": "Flight_01", "Departure": { "@type": "Departure", "location": "ORD", "date": "2025-06-28", "time": "07:00:00" }, "Arrival": { "@type": "Arrival", "location": "DEN", "date": "2025-06-28", "time": "08:39:00" } } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 1 ], "classOfService": "Y", "cabin": "Economy" } ] } ] } ], "Price": { "@type": "PriceDetail", "id": "PriceDetail_1", "CurrencyCode": { "value": "AUD" }, "Base": 854, "TotalTaxes": 89.6, "TotalFees": 0, "TotalPrice": 943.6, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "currencySource": "Charged", "approximateInd": true, "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 854, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 89.6, "Tax": [ { "currencyCode": "AUD", "taxCode": "AY", "value": 9.3 }, { "currencyCode": "AUD", "taxCode": "US", "value": 64.1 }, { "currencyCode": "AUD", "taxCode": "XF", "value": 7.5 }, { "currencyCode": "AUD", "taxCode": "ZP", "value": 8.7 } ] }, "Total": 943.6 }, "FiledAmount": { "currencyCode": "USD", "decimalPlace": 2, "value": 514.59 } } ] }, "TermsAndConditionsFull": [ { "@type": "TermsAndConditionsFullAir", "Identifier": { "authority": "Travelport", "value": "515849d1-5a35-43d1-abd3-a59df70247ed" } }, { "@type": "TermsAndConditionsFullAir", "ExpiryDate": "2025-05-30T23:59:00Z", "PaymentTimeLimit": "2025-05-30T23:59:00Z" } ] } ], "Traveler": [ { "@type": "Traveler", "birthDate": "1986-11-11", "gender": "Male", "passengerTypeCode": "ADT", "id": "travelerRefId_1", "Identifier": { "authority": "Travelport", "value": "cf222445-50ac-414e-a9b0-ee2f729406a9" }, "PersonName": { "@type": "PersonName", "Given": "TESTFIRST", "Surname": "TESTLAST" }, "Telephone": [ { "@type": "TelephoneDetail", "countryAccessCode": "1", "phoneNumber": "212456121", "id": "telephone_1", "cityCode": "ORD", "role": "Home" } ], "Email": [ { "emailType": "TO", "value": "TravelerOne@notmail.com" } ], "TravelDocument": [ { "@type": "TravelDocumentDetail", "birthDate": "1986-11-11", "Gender": "Male", "PersonName": { "@type": "PersonName", "Given": "TESTFIRST", "Surname": "TESTLAST" } }, { "@type": "TravelDocumentDetail", "docNumber": "A123123", "docType": "Passport", "expireDate": "2035-05-28", "issueCountry": "US", "birthDate": "1986-11-11", "Gender": "Male", "PersonName": { "@type": "PersonName", "Given": "TESTFIRST", "Surname": "TESTLAST" } } ] } ], "Receipt": [ { "@type": "ReceiptConfirmation", "Identifier": { "authority": "Travelport", "value": "599f068a-8956-4c92-a997-3f28f394b21d" }, "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "1G", "creationDate": "2025-05-28", "value": "BXPJVM" }, "OfferStatus": { "@type": "OfferStatusAir", "StatusAir": [ { "flightRefs": [ "Flight_01" ], "code": "HK", "value": "Confirmed" } ] } } }, { "@type": "ReceiptConfirmation", "Identifier": { "authority": "Travelport", "value": "981d43eb-70fe-49ed-a4ff-46564705354d" }, "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "AA", "value": "IUSHNW" } } } ], "ReservationDisplaySequence": { "@type": "ReservationDisplaySequence", "DisplaySequence": [ { "@type": "DisplaySequence", "displaySequence": 1, "OfferRef": "offer_1", "ProductRef": "product_1", "Sequence": 1 } ] } } } } The example below is the response to a workbench commit at the end of the ticketing workflow. It tickets the same booking in the previous example, with record locator BXPJVM. The FormOfPayment and Payment objects here were not returned in the first commit. In addition, Receipt includes an instance with @type ReceiptPayment that includes the Document object, which returns the ticket number in Number. Show Example workbench commit for ticketing the GDS&#160;booking from preceding example { "ReservationResponse": { "@type": "ReservationResponse", "Reservation": { "@type": "Reservation", "Offer": [ { "@type": "Offer", "id": "offer_1", "Identifier": { "authority": "Travelport", "value": "10b0ef3b-0797-447b-9b82-0cb59e1494c1" }, "ContentSource": "GDS", "Product": [ { "@type": "ProductAir", "id": "product_1", "FlightSegment": [ { "@type": "FlightSegment", "id": "FlightSegment_01", "sequence": 1, "Flight": { "@type": "Flight", "duration": "PT2H34M", "carrier": "AA", "number": "2755", "equipment": "319", "id": "Flight_01", "Departure": { "@type": "Departure", "location": "ORD", "date": "2025-06-28", "time": "07:00:00" }, "Arrival": { "@type": "Arrival", "location": "DEN", "date": "2025-06-28", "time": "08:39:00" } } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 1 ], "classOfService": "Y", "cabin": "Economy" } ] } ] } ], "Price": { "@type": "PriceDetail", "id": "PriceDetail_1", "CurrencyCode": { "value": "AUD" }, "Base": 854, "TotalTaxes": 89.6, "TotalFees": 0, "TotalPrice": 943.6, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "USD" }, "Base": 514.59 }, "TravelerRefs": [ "travelerRefId_1" ] }, { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "currencySource": "Charged", "approximateInd": true, "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 854, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 89.6, "Tax": [ { "currencyCode": "AUD", "taxCode": "AY", "value": 9.3 }, { "currencyCode": "AUD", "taxCode": "US", "value": 64.1 }, { "currencyCode": "AUD", "taxCode": "XF", "value": 7.5 }, { "currencyCode": "AUD", "taxCode": "ZP", "value": 8.7 } ] }, "Total": 943.6 }, "FiledAmount": { "currencyCode": "USD", "decimalPlace": 2, "value": 514.59 }, "TravelerRefs": [ "travelerRefId_1" ], "FareCalculation": "CHI AA DEN Q0.17 514.42B0AIZNN1 USD514.59END" } ] }, "TermsAndConditionsFull": [ { "@type": "TermsAndConditionsFullAir", "Identifier": { "authority": "Travelport", "value": "b4cf6d38-0a8c-4080-a524-fcffe6bd3633" }, "ExpiryDate": "2025-05-29T23:59:00Z", "PaymentTimeLimit": "2025-05-30T23:59:00Z" } ] } ], "Traveler": [ { "@type": "Traveler", "birthDate": "1986-11-11", "gender": "Male", "passengerTypeCode": "ADT", "id": "travelerRefId_1", "Identifier": { "authority": "Travelport", "value": "a493cb07-cae0-42fe-b80e-6278ce21c0d7" }, "PersonName": { "@type": "PersonName", "Given": "TESTFIRST", "Surname": "TESTLAST" }, "Telephone": [ { "@type": "TelephoneDetail", "countryAccessCode": "1", "phoneNumber": "212456121", "id": "telephone_1", "cityCode": "ORD", "role": "Home" } ], "Email": [ { "emailType": "TO", "value": "TravelerOne@gmail.com" } ], "TravelDocument": [ { "@type": "TravelDocumentDetail", "birthDate": "1986-11-11", "Gender": "Male", "PersonName": { "@type": "PersonName", "Given": "TESTFIRST", "Surname": "TESTLAST" } }, { "@type": "TravelDocumentDetail", "docNumber": "A123123", "docType": "Passport", "expireDate": "2035-05-28", "issueCountry": "US", "birthDate": "1986-11-11", "Gender": "Male", "PersonName": { "@type": "PersonName", "Given": "TESTFIRST", "Surname": "TESTLAST" } } ] } ], "FormOfPayment": [ { "@type": "FormOfPaymentCash", "id": "formOfPayment_1", "FormOfPaymentRef": "formOfPayment_1", "Identifier": { "authority": "Travelport", "value": "8bd8e02c-7a1d-4979-b563-4811095cbe42" } } ], "Payment": [ { "@type": "Payment", "id": "payment_1", "Identifier": { "authority": "Travelport", "value": "d95e702e-671f-4a3e-835f-4bdc78f6ec65" }, "Amount": { "code": "USD", "minorUnit": 2, "currencySource": "Charged", "value": 943.6 }, "FormOfPaymentIdentifier": { "FormOfPaymentRef": "formOfPayment_1", "Identifier": { "authority": "Travelport", "value": "1546cc57-c5c3-4670-b555-fed35dd69ddf" } }, "OfferIdentifier": [ { "id": "offer_1", "offerRef": "offer_1", "Identifier": { "authority": "Travelport", "value": "9829d223-66dc-4590-8a8e-66a1669f8b00" } } ] } ], "Receipt": [ { "@type": "ReceiptConfirmation", "Identifier": { "authority": "Travelport", "value": "17653ad8-eeae-4e88-a537-9a8b55323bba" }, "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "1G", "creationDate": "2025-05-28", "value": "BXPJVM" }, "OfferStatus": { "@type": "OfferStatusAir", "StatusAir": [ { "flightRefs": [ "Flight_01" ], "code": "HK", "value": "Confirmed" } ] } } }, { "@type": "ReceiptConfirmation", "Identifier": { "authority": "Travelport", "value": "dfa0a8de-2e33-4f88-aed7-7afc197e9d30" }, "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "AA", "value": "IUSHNW" } } }, { "@type": "ReceiptPayment", "Document": [ { "@type": "DocumentTicket", "Number": "0019905292727", "TravelerIdentifierRef": { "id": "travelerRefId_1", "value": "a493cb07-cae0-42fe-b80e-6278ce21c0d7" }, "Amount": { "@type": "Amount", "Total": 943.6 } } ] } ], "ReservationDisplaySequence": { "@type": "ReservationDisplaySequence", "DisplaySequence": [ { "@type": "DisplaySequence", "displaySequence": 1, "OfferRef": "offer_1", "ProductRef": "product_1", "Sequence": 1 } ] } } } } The next example shows the commit when exchanging a GDS ticket with the GDS Exchange APIs. While the commit response returns both the previous offer and the newly issued offer, subsequent Reservation Retrieve responses return only the new offer, which has several indicators that the offer has been exchanged. See the Exchange, Refund, and Void Guide for details on exchanges. Show Example commit response when exchanging GDS ticket { "ReservationResponse": { "@type": "ReservationResponse", "Reservation": { "@type": "Reservation", "Identifier": { "authority": "Travelport", "value": "0ac7cfce-6192-4f32-b6b7-6dede455c17b" }, "Offer": [ { "@type": "Offer", "id": "offer_1", "Identifier": { "authority": "AA", "value": "MTVhM2E4ZjQtM2Y2Mi00MzlmLTgyMzctYWVlYzMwZTA4ODY5fFA1QjQyQTU3My1CMTIxLTRGODMtODY3OHN4aHRiMTR5MjNydmMtMS0x" }, "Product": [ { "@type": "ProductAir", "totalDuration": "PT2H29M", "id": "product_1", "Identifier": { "authority": "AA", "value": "3e08fb8b-b5ed-42e6-be7f-f0e628307d26" }, "FlightSegment": [ { "@type": "FlightSegment", "sequence": 1, "Flight": { "@type": "Flight", "duration": "PT2H29M", "carrier": "AA", "number": "6221", "equipment": "E75", "id": "seg_1", "Identifier": { "authority": "AA", "value": "6bc12b59-3387-4509-8975-64cd37e28d7d" }, "Departure": { "@type": "DepartureDetail", "terminal": "0", "location": "LAX", "date": "2025-03-21", "time": "09:22:00" }, "Arrival": { "@type": "ArrivalDetail", "location": "DEN", "date": "2025-03-21", "time": "12:51:00" } } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 1 ], "classOfService": "L", "cabin": "Economy", "fareBasisCode": "LUAIYSN1", "fareType": "PublicFare", "Brand": { "@type": "Brand", "name": "Main Cabin" } } ] } ] } ], "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 370, "TotalTaxes": 51.8, "TotalPrice": 421.8, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 370, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 51.8, "Tax": [ { "taxCode": "US", "description": "U.S.A Transportation Tax", "value": 27.7 }, { "taxCode": "XF", "description": "U.S Passenger Facility Charge", "value": 7.1 }, { "taxCode": "ZP", "description": "U.S. Flight Segment Tax", "value": 8.2 }, { "taxCode": "AY", "description": "Passenger Civil Aviation Security Service Fee", "value": 8.8 } ] }, "Total": 421.8 } } ] }, "TermsAndConditionsFull": [ { "@type": "TermsAndConditionsFullAir", "ExpiryDate": "2025-02-23T23:59:00Z", "TextBlock": [ { "@type": "TextBlockDetail", "description": "FARE RULES", "title": "Ticketing", "TextFormatted": [ { "value": "NONREF/FAREDIF/" }, { "value": "CXL BY FLT TIME OR NOVALUE" } ] } ], "BaggageAllowance": [ { "@type": "BaggageAllowanceDetail", "passengerTypeCodes": [ "ADT" ], "baggageType": "FirstCheckedBag", "ProductRef": [ "product_1" ], "BaggageItem": [ { "@type": "BaggageItem", "quantity": 0 } ], "SegmentSequenceList": [ 1 ], "Text": [ "0PC" ] }, { "@type": "BaggageAllowanceDetail", "passengerTypeCodes": [ "ADT" ], "baggageType": "CarryOn", "ProductRef": [ "product_1" ], "BaggageItem": [ { "@type": "BaggageItem", "quantity": 2 } ], "SegmentSequenceList": [ 1 ], "Text": [ "2PC" ] } ], "FareRuleInfo": [ { "@type": "FareRuleInfoText", "flightsRefs": [ "seg_1" ], "TextFareRule": [ { "name": "Cancel", "value": "Not Allowed" } ] } ], "PaymentTimeLimit": "2025-02-23T23:59:00Z", "Penalties": [ { "@type": "Penalties", "Change": [ { "@type": "ChangePermitted", "ProductRefs": [ "product_1" ] } ], "Cancel": [ { "@type": "CancelNotPermitted", "ProductRefs": [ "product_1" ], "NotPermittedInd": "true" } ], "PassengerTypeCodes": [ "ADT" ] } ] } ] } ], "Traveler": [ { "@type": "Traveler", "birthDate": "1986-11-11", "gender": "Male", "passengerTypeCode": "ADT", "id": "trav_1", "TravelerRef": "trav_1", "Identifier": { "authority": "Travelport", "value": "QURUfFQx" }, "PersonName": { "@type": "PersonName", "Given": "TESTFIRST", "Surname": "TESTLAST" }, "Telephone": [ { "@type": "Telephone", "countryAccessCode": "1", "phoneNumber": "212456121", "id": "4", "cityCode": "ORD", "role": "Home" } ], "Email": [ { "id": "email_1", "validInd": true, "value": "TRAVELERONE@GMAIL.COM" } ], "TravelDocument": [ { "@type": "TravelDocumentDetail", "docNumber": "A123123", "docType": "Passport", "expireDate": "2035-02-21", "issueCountry": "US", "birthDate": "1986-11-11", "Gender": "Male", "PersonName": { "@type": "PersonName", "Given": "TestFirst", "Surname": "TestLast" } } ] } ], "Receipt": [ { "@type": "ReceiptConfirmation", "id": "receipt_1", "Identifier": { "authority": "AA", "value": "4afd7900-bcf6-4473-9109-44bd60d14ffb" }, "OfferRef": [ "offer_1" ], "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "AA", "sourceContext": "OrderId", "value": "AA001HGO3HWA4" } } }, { "@type": "ReceiptConfirmation", "id": "receipt_2", "Identifier": { "authority": "AA", "value": "ba4391ec-e0da-4290-98ca-f17d5b7b1060" }, "OfferRef": [ "offer_1" ], "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "AA", "sourceContext": "VendorLocator", "value": "IKRWES" }, "OfferStatus": { "@type": "OfferStatusAir", "StatusAir": [ { "flightRefs": [ "seg_1" ], "code": "HK", "value": "Confirmed" } ] } } }, { "@type": "ReceiptConfirmation", "Identifier": { "authority": "Travelport", "value": "9acfe47e-c903-491b-b3d1-c8bb80970815" }, "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "1G", "creationDate": "2025-02-22", "value": "B7KT1S" } } } ], "ReservationComment": [ { "@type": "ReservationComment", "id": "reservationComment_1", "Comment": [ { "id": "comment_1", "name": "SWITT1G/XB7/99999992/SYD/1G/T/AU/AUD/001TEST", "language": "EN", "value": "SWITT1G/XB7/99999992/SYD/1G/T/AU/AUD/001TEST" } ] } ], "ReservationDisplaySequence": { "@type": "ReservationDisplaySequence", "DisplaySequence": [ { "@type": "DisplaySequence", "displaySequence": 1, "OfferRef": "offer_1", "ProductRef": "product_1", "Sequence": 1 } ] } } } } NDC booking and ticketing examples The next three commit response examples are for NDC&#160;bookings. The first example is the commit response to hold an NDC&#160;booking, one-way with one traveler. This commit response shows the Travelport locator code B7KT1S. Show Example commit response for NDC at end of initial booking workflow { "ReservationResponse": { "@type": "ReservationResponse", "Reservation": { "@type": "Reservation", "Identifier": { "authority": "Travelport", "value": "0ac7cfce-6192-4f32-b6b7-6dede455c17b" }, "Offer": [ { "@type": "Offer", "id": "offer_1", "Identifier": { "authority": "AA", "value": "MTVhM2E4ZjQtM2Y2Mi00MzlmLTgyMzctYWVlYzMwZTA4ODY5fFA1QjQyQTU3My1CMTIxLTRGODMtODY3OHN4aHRiMTR5MjNydmMtMS0x" }, "Product": [ { "@type": "ProductAir", "totalDuration": "PT2H29M", "id": "product_1", "Identifier": { "authority": "AA", "value": "3e08fb8b-b5ed-42e6-be7f-f0e628307d26" }, "FlightSegment": [ { "@type": "FlightSegment", "sequence": 1, "Flight": { "@type": "Flight", "duration": "PT2H29M", "carrier": "AA", "number": "6221", "equipment": "E75", "id": "seg_1", "Identifier": { "authority": "AA", "value": "6bc12b59-3387-4509-8975-64cd37e28d7d" }, "Departure": { "@type": "DepartureDetail", "terminal": "0", "location": "LAX", "date": "2025-03-21", "time": "09:22:00" }, "Arrival": { "@type": "ArrivalDetail", "location": "DEN", "date": "2025-03-21", "time": "12:51:00" } } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 1 ], "classOfService": "L", "cabin": "Economy", "fareBasisCode": "LUAIYSN1", "fareType": "PublicFare", "Brand": { "@type": "Brand", "name": "Main Cabin" } } ] } ] } ], "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 370, "TotalTaxes": 51.8, "TotalPrice": 421.8, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 370, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 51.8, "Tax": [ { "taxCode": "US", "description": "U.S.A Transportation Tax", "value": 27.7 }, { "taxCode": "XF", "description": "U.S Passenger Facility Charge", "value": 7.1 }, { "taxCode": "ZP", "description": "U.S. Flight Segment Tax", "value": 8.2 }, { "taxCode": "AY", "description": "Passenger Civil Aviation Security Service Fee", "value": 8.8 } ] }, "Total": 421.8 } } ] }, "TermsAndConditionsFull": [ { "@type": "TermsAndConditionsFullAir", "ExpiryDate": "2025-02-23T23:59:00Z", "TextBlock": [ { "@type": "TextBlockDetail", "description": "FARE RULES", "title": "Ticketing", "TextFormatted": [ { "value": "NONREF/FAREDIF/" }, { "value": "CXL BY FLT TIME OR NOVALUE" } ] } ], "BaggageAllowance": [ { "@type": "BaggageAllowanceDetail", "passengerTypeCodes": [ "ADT" ], "baggageType": "FirstCheckedBag", "ProductRef": [ "product_1" ], "BaggageItem": [ { "@type": "BaggageItem", "quantity": 0 } ], "SegmentSequenceList": [ 1 ], "Text": [ "0PC" ] }, { "@type": "BaggageAllowanceDetail", "passengerTypeCodes": [ "ADT" ], "baggageType": "CarryOn", "ProductRef": [ "product_1" ], "BaggageItem": [ { "@type": "BaggageItem", "quantity": 2 } ], "SegmentSequenceList": [ 1 ], "Text": [ "2PC" ] } ], "FareRuleInfo": [ { "@type": "FareRuleInfoText", "flightsRefs": [ "seg_1" ], "TextFareRule": [ { "name": "Cancel", "value": "Not Allowed" } ] } ], "PaymentTimeLimit": "2025-02-23T23:59:00Z", "Penalties": [ { "@type": "Penalties", "Change": [ { "@type": "ChangePermitted", "ProductRefs": [ "product_1" ] } ], "Cancel": [ { "@type": "CancelNotPermitted", "ProductRefs": [ "product_1" ], "NotPermittedInd": "true" } ], "PassengerTypeCodes": [ "ADT" ] } ] } ] } ], "Traveler": [ { "@type": "Traveler", "birthDate": "1986-11-11", "gender": "Male", "passengerTypeCode": "ADT", "id": "trav_1", "TravelerRef": "trav_1", "Identifier": { "authority": "Travelport", "value": "QURUfFQx" }, "PersonName": { "@type": "PersonName", "Given": "TESTFIRST", "Surname": "TESTLAST" }, "Telephone": [ { "@type": "Telephone", "countryAccessCode": "1", "phoneNumber": "212456121", "id": "4", "cityCode": "ORD", "role": "Home" } ], "Email": [ { "id": "email_1", "validInd": true, "value": "TRAVELERONE@GMAIL.COM" } ], "TravelDocument": [ { "@type": "TravelDocumentDetail", "docNumber": "A123123", "docType": "Passport", "expireDate": "2035-02-21", "issueCountry": "US", "birthDate": "1986-11-11", "Gender": "Male", "PersonName": { "@type": "PersonName", "Given": "TestFirst", "Surname": "TestLast" } } ] } ], "Receipt": [ { "@type": "ReceiptConfirmation", "id": "receipt_1", "Identifier": { "authority": "AA", "value": "4afd7900-bcf6-4473-9109-44bd60d14ffb" }, "OfferRef": [ "offer_1" ], "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "AA", "sourceContext": "OrderId", "value": "AA001HGO3HWA4" } } }, { "@type": "ReceiptConfirmation", "id": "receipt_2", "Identifier": { "authority": "AA", "value": "ba4391ec-e0da-4290-98ca-f17d5b7b1060" }, "OfferRef": [ "offer_1" ], "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "AA", "sourceContext": "VendorLocator", "value": "IKRWES" }, "OfferStatus": { "@type": "OfferStatusAir", "StatusAir": [ { "flightRefs": [ "seg_1" ], "code": "HK", "value": "Confirmed" } ] } } }, { "@type": "ReceiptConfirmation", "Identifier": { "authority": "Travelport", "value": "9acfe47e-c903-491b-b3d1-c8bb80970815" }, "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "1G", "creationDate": "2025-02-22", "value": "B7KT1S" } } } ], "ReservationComment": [ { "@type": "ReservationComment", "id": "reservationComment_1", "Comment": [ { "id": "comment_1", "name": "SWITT1G/XB7/99999992/SYD/1G/T/AU/AUD/001TEST", "language": "EN", "value": "SWITT1G/XB7/99999992/SYD/1G/T/AU/AUD/001TEST" } ] } ], "ReservationDisplaySequence": { "@type": "ReservationDisplaySequence", "DisplaySequence": [ { "@type": "DisplaySequence", "displaySequence": 1, "OfferRef": "offer_1", "ProductRef": "product_1", "Sequence": 1 } ] } } } } The example below shows the commit response when ticketing the same NDC&#160;booking in the preceding example, with the Travelport locator code B7KT1S. Show Example ticketing commit response for NDC booking { "ReservationResponse": { "@type": "ReservationResponse", "Reservation": { "@type": "Reservation", "Identifier": { "authority": "Travelport", "value": "5dad819f-f6cf-4a62-9670-12e1e9b89cd3" }, "Offer": [ { "@type": "Offer", "id": "offer_1", "Identifier": { "authority": "AA", "value": "QUEwMDFIR08zSFdBNHxQNUI0MkE1NzMtQjEyMS00RjgzLTg2NzhzeGh0YjE0eTIzcnZjLTEtMXxTdGF0dXM6VVNFRCBOVEFD" }, "Product": [ { "@type": "ProductAir", "totalDuration": "PT2H29M", "id": "product_1", "Identifier": { "authority": "AA", "value": "2d30cc3f-bdff-4abf-ad3d-90a155905c6a" }, "FlightSegment": [ { "@type": "FlightSegment", "id": "s1", "sequence": 1, "Flight": { "@type": "Flight", "distance": 860, "duration": "PT2H29M", "carrier": "AA", "number": "6221", "operatingCarrierName": "SKYWEST AIRLINES AS AMERICAN EAGLE", "equipment": "E75", "id": "Flight_01", "Identifier": { "authority": "AA", "value": "2442a99c-51e3-471f-8357-4283a0f37853" }, "Departure": { "@type": "DepartureDetail", "terminal": "0", "location": "LAX", "date": "2025-03-21", "time": "09:22:00" }, "Arrival": { "@type": "ArrivalDetail", "location": "DEN", "date": "2025-03-21", "time": "12:51:00" } } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 1 ], "classOfService": "L", "cabin": "Economy", "fareBasisCode": "LUAIYSN1", "fareType": "PublicFare", "Brand": { "@type": "Brand", "name": "Main Cabin" } } ] } ] } ], "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 370, "TotalTaxes": 51.8, "TotalPrice": 421.8, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 370, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 51.8, "Tax": [ { "taxCode": "US", "description": "U.S.A Transportation Tax", "value": 27.7 }, { "taxCode": "XF", "description": "U.S Passenger Facility Charge", "value": 7.1 }, { "taxCode": "ZP", "description": "U.S. Flight Segment Tax", "value": 8.2 }, { "taxCode": "AY", "description": "Passenger Civil Aviation Security Service Fee", "value": 8.8 } ] }, "Total": 421.8 } } ] }, "TermsAndConditionsFull": [ { "@type": "TermsAndConditionsFullAir", "ExpiryDate": "2025-02-23T23:59:00Z", "BaggageAllowance": [ { "@type": "BaggageAllowanceDetail", "passengerTypeCodes": [ "ADT" ], "baggageType": "FirstCheckedBag", "ProductRef": [ "product_1" ], "BaggageItem": [ { "@type": "BaggageItem", "quantity": 0 } ], "SegmentSequenceList": [ 1 ], "Text": [ "0PC" ] }, { "@type": "BaggageAllowanceDetail", "passengerTypeCodes": [ "ADT" ], "baggageType": "CarryOn", "ProductRef": [ "product_1" ], "BaggageItem": [ { "@type": "BaggageItem", "quantity": 2 } ], "SegmentSequenceList": [ 1 ], "Text": [ "2PC" ] } ], "FareRuleInfo": [ { "@type": "FareRuleInfoText", "flightsRefs": [ "s1" ], "TextFareRule": [ { "name": "Ticketing", "value": "NONREF/FAREDIF/" }, { "name": "Ticketing", "value": "CXL BY FLT TIME OR NOVALUE" }, { "name": "Change", "value": "Allowed" }, { "name": "Cancel", "value": "Not Allowed" }, { "name": "AdvanceStay", "value": "AdvancePurchase:P14D" } ] } ], "PaymentTimeLimit": "2025-02-23T23:59:00Z", "Penalties": [ { "@type": "Penalties", "Cancel": [ { "@type": "CancelNotPermitted", "ProductRefs": [ "product_1" ], "NotPermittedInd": "true" } ], "PassengerTypeCodes": [ "ADT" ] } ] } ] } ], "Traveler": [ { "@type": "Traveler", "birthDate": "1986-11-11", "gender": "Male", "passengerTypeCode": "ADT", "id": "trav_1", "TravelerRef": "trav_1", "Identifier": { "authority": "Travelport", "value": "QURUfFQx" }, "PersonName": { "@type": "PersonName", "Given": "TESTFIRST", "Surname": "TESTLAST" }, "Telephone": [ { "@type": "TelephoneDetail", "countryAccessCode": "1", "phoneNumber": "212456121", "id": "telephone_1", "cityCode": "ORD", "role": "Home" } ], "Email": [ { "id": "email_1", "emailType": "TO", "validInd": true, "value": "TRAVELERONE@GMAIL.COM" } ], "TravelDocument": [ { "@type": "TravelDocumentDetail", "docNumber": "A123123", "docType": "Passport", "expireDate": "2035-02-21", "issueCountry": "US", "birthDate": "1986-11-11", "birthCountry": "US", "Gender": "Male", "PersonName": { "@type": "PersonName", "Given": "TESTFIRST", "Surname": "TESTLAST" } } ] } ], "FormOfPayment": [ { "@type": "FormOfPaymentPaymentCard", "id": "formOfPayment_1", "FormOfPaymentRef": "formOfPayment_1", "Identifier": { "authority": "Travelport", "value": "A0656EFF-FAF4-456F-B061-0161008D6FOP" }, "PaymentCard": { "@type": "PaymentCardDetail", "id": "paymentCard_4", "expireDate": "0139", "CardType": "Credit", "CardCode": "VI", "CardHolderName": "JANE DOE", "CardNumber": { "@type": "CardNumber", "PlainText": "XXXXXXXXXXXX8769" }, "SeriesCode": { "@type": "SeriesCode", "PlainText": "123" } } } ], "Payment": [ { "@type": "Payment", "id": "payment_1", "Identifier": { "authority": "Travelport", "value": "57f3d29b-aca0-483d-913f-1d11f86cfe30" }, "Amount": { "code": "AUD", "minorUnit": 2, "currencySource": "Charged", "approximateInd": true, "value": 421.8 }, "FormOfPaymentIdentifier": { "FormOfPaymentRef": "formOfPayment_1", "Identifier": { "authority": "Travelport", "value": "A0656EFF-FAF4-456F-B061-0161008D6FOP" } }, "OfferIdentifier": [ { "offerRef": "offer_1", "Identifier": { "authority": "AA", "value": "QUEwMDFIR08zSFdBNHxQNUI0MkE1NzMtQjEyMS00RjgzLTg2NzhzeGh0YjE0eTIzcnZjLTEtMXxTdGF0dXM6VVNFRCBOVEFD" } } ] } ], "Receipt": [ { "@type": "ReceiptConfirmation", "id": "receipt_1", "OfferRef": [ "offer_1" ], "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "AA", "sourceContext": "VendorLocator", "value": "IKRWES" }, "OfferStatus": { "@type": "OfferStatusAir", "StatusAir": [ { "flightRefs": [ "Flight_01" ], "code": "HK", "value": "Confirmed" } ] } } }, { "@type": "ReceiptConfirmation", "id": "receipt_2", "OfferRef": [ "offer_1" ], "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "AA", "sourceContext": "OrderId", "value": "AA001HGO3HWA4" } } }, { "@type": "ReceiptConfirmation", "id": "receipt_3", "Identifier": { "authority": "Travelport", "value": "11e196fb-9e04-4268-9330-e2e93ff19762" }, "OfferRef": [], "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "1G", "creationDate": "2025-02-22", "value": "B7KT1S" }, "OfferStatus": { "@type": "OfferStatusAir", "StatusAir": [ { "flightRefs": [ "Flight_01" ], "code": "ZK", "value": "Pending" } ] } } }, { "@type": "ReceiptPayment", "dateTime": "2025-02-22T11:13:00Z", "id": "receipt_4", "ReceiptRef": "receipt_1", "Identifier": { "authority": "AA", "value": "OWM1MzQwMmUtMTk1NS00NzFjLWE3ZTUtNzJiZjI5ODI3YmI0" }, "OfferRef": [ "offer_1" ], "Document": [ { "@type": "DocumentTicket", "Number": "0015756496641", "TravelerIdentifierRef": { "value": "trav_1" }, "Amount": { "@type": "Amount", "CurrencyCode": { "value": "AUD" }, "Total": 421.8 } } ], "PaymentIdentifier": { "id": "payment_1", "PaymentRef": "payment_1", "Identifier": { "authority": "Travelport", "value": "57f3d29b-aca0-483d-913f-1d11f86cfe30" } } } ], "ReservationComment": [ { "@type": "ReservationComment", "id": "reservationComment_1", "Comment": [ { "id": "comment_1", "name": "SWITT1G/XB7/99999992/SYD/1G/T/AU/AUD/001TEST", "language": "EN", "value": "SWITT1G/XB7/99999992/SYD/1G/T/AU/AUD/001TEST" } ] }, { "@type": "ReservationComment", "shareWith": "Agency", "id": "RSRVComment_1", "Comment": [ { "value": "* PNR CONTAINS NDC AIR SEGMENTS-SERVICE VIA SMARTPOINT NDC APP *" } ] } ], "ReservationDisplaySequence": { "@type": "ReservationDisplaySequence", "DisplaySequence": [ { "@type": "DisplaySequence", "displaySequence": 1, "OfferRef": "offer_1", "ProductRef": "product_1", "Sequence": 1 } ] } }, "SupplementalInformation": [ { "@type": "SupplementalInformation", "NameValuePair": [ { "name": "AgreementPCC", "value": "PCC" }, { "name": "EMDIndicator", "value": "N" } ] } ] } } The next example shows the response for the NDC&#160; Instant Pay flow , which books and issues the ticket in the same, initial booking workbench (NDC&#160;only; carrier support varies). Receipt/Document/Number returns the ticket number while Receipt/Document/contentSource returns NDC , indicating the ticket was issued on NDC. This is a round-trip itinerary with one traveler. Show Example NDC&#160;Instant Pay commit response { "ReservationResponse": { "@type": "ReservationResponse", "Reservation": { "@type": "Reservation", "Identifier": { "authority": "Travelport", "value": "647583df-8d6f-4f8b-bcc5-e961100cb09f" }, "Offer": [ { "@type": "Offer", "id": "1", "Identifier": { "authority": "SQ", "value": "NUZLTjRLfFNRXzVGS040S19BSVItMS0yfFNRfFNRXzVGS040S3xwcm9kdWN0Ml9zMi1TRUcyOnByb2R1Y3QxX3MxLVNFRzF8QURUOlBBWDE=" }, "Product": [ { "@type": "ProductAir", "totalDuration": "PT4H", "id": "product1", "Identifier": { "authority": "SQ", "value": "ad94565e-5b81-497f-876b-f6723038ba98" }, "FlightSegment": [ { "@type": "FlightSegment", "id": "s1", "sequence": 1, "Flight": { "@type": "Flight", "duration": "PT4H", "carrier": "SQ", "number": "899", "operatingCarrier": "SQ", "operatingCarrierName": "SINGAPORE AIRLINES", "id": "seg1", "Identifier": { "authority": "SQ", "value": "d350d71c-c1af-4518-a231-99ea00a3918a" }, "Departure": { "@type": "DepartureDetail", "terminal": "1", "location": "HKG", "date": "2025-03-21", "time": "09:05:00" }, "Arrival": { "@type": "ArrivalDetail", "terminal": "0", "location": "SIN", "date": "2025-03-21", "time": "13:05:00" } } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 1 ], "classOfService": "K", "cabin": "Economy", "fareBasisCode": "K16HKRPO/DP" } ] } ] }, { "@type": "ProductAir", "totalDuration": "PT3H45M", "id": "product2", "Identifier": { "authority": "SQ", "value": "21f11ea0-8388-447c-a7c1-e2b07c8307c3" }, "FlightSegment": [ { "@type": "FlightSegment", "id": "s2", "sequence": 2, "Flight": { "@type": "Flight", "duration": "PT3H45M", "carrier": "SQ", "number": "874", "operatingCarrier": "SQ", "operatingCarrierName": "SINGAPORE AIRLINES", "id": "seg2", "Identifier": { "authority": "SQ", "value": "9c4e962f-b80c-49bf-aeb2-4fd518cf0539" }, "Departure": { "@type": "DepartureDetail", "terminal": "3", "location": "SIN", "date": "2025-03-24", "time": "07:35:00" }, "Arrival": { "@type": "ArrivalDetail", "terminal": "1", "location": "HKG", "date": "2025-03-24", "time": "11:20:00" } } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 2 ], "classOfService": "K", "cabin": "Economy", "fareBasisCode": "K16HKRPO/DP" } ] } ] } ], "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 378, "TotalTaxes": 133.3, "TotalFees": 0, "TotalPrice": 511.3, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 378, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 133.3, "Tax": [ { "taxCode": "G3", "value": 18.4 }, { "taxCode": "HK", "value": 24.5 }, { "taxCode": "I5", "value": 13.3 }, { "taxCode": "L7", "value": 12.8 }, { "taxCode": "OP", "value": 9.5 }, { "taxCode": "SG", "value": 54.8 } ] }, "Total": 511.3 } } ] }, "TermsAndConditionsFull": [ { "@type": "TermsAndConditionsFullAir", "BaggageAllowance": [ { "@type": "BaggageAllowanceDetail", "passengerTypeCodes": [ "ADT" ], "baggageType": "FirstCheckedBag", "ProductRef": [ "product1" ], "BaggageItem": [ { "@type": "BaggageItem", "Measurement": [ { "measurementType": "Weight", "unit": "Kilograms", "value": 25 } ] } ], "SegmentSequenceList": [ 1 ], "Text": [ "25K" ] }, { "@type": "BaggageAllowanceDetail", "passengerTypeCodes": [ "ADT" ], "baggageType": "FirstCheckedBag", "ProductRef": [ "product2" ], "BaggageItem": [ { "@type": "BaggageItem", "Measurement": [ { "measurementType": "Weight", "unit": "Kilograms", "value": 25 } ] } ], "SegmentSequenceList": [ 2 ], "Text": [ "25K" ] } ], "ValidatingAirline": [ { "@type": "ValidatingAirline", "ValidatingAirline": "SQ" } ] } ] } ], "Traveler": [ { "@type": "Traveler", "birthDate": "1986-11-11", "gender": "Male", "passengerTypeCode": "ADT", "id": "trav_1", "TravelerRef": "trav_1", "Identifier": { "authority": "Travelport", "value": "QURUfFBBWDE=" }, "PersonName": { "@type": "PersonName", "Given": "TESTFIRST", "Surname": "TESTLAST" }, "Telephone": [ { "@type": "Telephone", "countryAccessCode": "1", "phoneNumber": "212456121", "id": "4", "cityCode": "ORD", "role": "Home" } ], "Email": [ { "id": "email_1", "value": "TRAVELERONE@GMAIL.COM" } ], "TravelDocument": [ { "@type": "TravelDocumentDetail", "docNumber": "A123123", "docType": "Passport", "expireDate": "2035-02-21", "issueCountry": "US", "birthDate": "1986-11-11", "Gender": "Male", "PersonName": { "@type": "PersonName", "Given": "TestFirst", "Surname": "TestLast" } } ] } ], "FormOfPayment": [ { "@type": "FormOfPaymentCash", "id": "formOfPayment_1", "Identifier": { "authority": "SQ", "value": "c2a72cc6-779d-4f72-b76c-87f9c78a4d5f" } } ], "Payment": [ { "@type": "Payment", "id": "payment_1", "Identifier": { "authority": "SQ", "value": "NGI2NDExYmItZjk0ZS00N2UwLWEzZDEtMjg0ODI0NjNiMWVhfDpJTlY=" }, "Amount": { "code": "AUD", "value": 511.3 }, "FormOfPaymentIdentifier": { "FormOfPaymentRef": "formOfPayment_1", "Identifier": { "authority": "SQ", "value": "c2a72cc6-779d-4f72-b76c-87f9c78a4d5f" } }, "OfferIdentifier": [ { "offerRef": "1", "Identifier": { "authority": "SQ", "value": "NUZLTjRLfFNRXzVGS040S19BSVItMS0yfFNRfFNRXzVGS040S3xwcm9kdWN0Ml9zMi1TRUcyOnByb2R1Y3QxX3MxLVNFRzF8QURUOlBBWDE=" } } ] } ], "Receipt": [ { "@type": "ReceiptConfirmation", "id": "receipt_1", "OfferRef": [ "1" ], "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "SQ", "sourceContext": "VendorLocator", "value": "5FKN4K" }, "OfferStatus": { "@type": "OfferStatusAir", "StatusAir": [ { "flightRefs": [ "seg1", "seg2" ], "code": "HK", "value": "Confirmed" } ] } } }, { "@type": "ReceiptConfirmation", "id": "receipt_2", "OfferRef": [ "1" ], "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "SQ", "sourceContext": "OrderId", "value": "SQ_5FKN4K" } } }, { "@type": "ReceiptPayment", "dateTime": "2025-02-22T01:05:52Z", "id": "receipt_3", "Identifier": { "authority": "SQ", "value": "OTRkYzljNDEtMTYwNy00YmM2LWFhMzEtYjBjMTA5OGQ1MzMz" }, "OfferRef": [ "1" ], "Document": [ { "@type": "DocumentTicket", "contentSource": "NDC", "Number": "6182461381138", "TravelerIdentifierRef": { "value": "trav_1" }, "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Total": 511.3 } } ], "PaymentIdentifier": { "id": "paymentIdentifier_1", "PaymentRef": "payment_1" } }, { "@type": "ReceiptConfirmation", "Identifier": { "authority": "Travelport", "value": "3e4c843c-859f-4901-80b7-6438afc96ef4" }, "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "1G", "creationDate": "2025-02-22", "value": "B7KT35" } } } ], "ReservationDisplaySequence": { "@type": "ReservationDisplaySequence", "DisplaySequence": [ { "@type": "DisplaySequence", "displaySequence": 1, "OfferRef": "offer_1", "ProductRef": "product_1", "Sequence": 1 }, { "@type": "DisplaySequence", "displaySequence": 2, "OfferRef": "offer_1", "ProductRef": "product_2", "Sequence": 2 } ] } } } } GDS&#160;exchanged ticket example In the following example workbench commit response for an exchanged ticket, the previous itinerary is returned in the Offer object and the new itinerary is returned in OfferModify. For brevity, the text of TermsAndConditionsFull has been omitted and is shown as ... . Show Example commit for GDS ticket exchange { "ReservationResponse": { "@type": "ReservationResponse", "transactionId": "Katalon_07032025133341", "traceId": "b1744f10-6434-43d8-aec4-a93d72873172", "Reservation": { "@type": "Reservation", "Identifier": { "authority": "Travelport", "value": "3f82e98f-3f5d-4507-84ae-b6cf9ce5b218" }, "Offer": [ { "@type": "Offer", "id": "offer_1", "Identifier": { "authority": "Travelport", "value": "00b23c24-3047-4a24-9d5f-f99f3062f905" }, "ContentSource": "GDS", "Product": [ { "@type": "ProductAir", "id": "product_1", "Identifier": { "authority": "Travelport", "value": "fe5f3bac-5bbd-4054-b68b-7022dfc3c746" }, "FlightSegment": [ { "@type": "FlightSegment", "id": "FlightSegment_01", "sequence": 1, "Flight": { "@type": "Flight", "duration": "PT2H45M", "carrier": "TP", "number": "1356", "equipment": "32N", "id": "Flight_01", "Identifier": { "authority": "Travelport", "value": "268ba647-c23b-43ad-b3a4-286d34d6a7cc" }, "Departure": { "@type": "Departure", "location": "LIS", "date": "2025-07-18", "time": "08:15:00" }, "Arrival": { "@type": "Arrival", "location": "LHR", "date": "2025-07-18", "time": "11:00:00" } } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 1 ], "classOfService": "L", "cabin": "Economy", "fareBasisCode": "LF0CLC00", "fareType": "AirlinePrivateFare" } ] } ] }, { "@type": "ProductAir", "id": "product_2", "Identifier": { "authority": "Travelport", "value": "4abf7840-464b-4f7c-9d64-9acfec557374" }, "FlightSegment": [ { "@type": "FlightSegment", "id": "FlightSegment_02", "sequence": 2, "Flight": { "@type": "Flight", "duration": "PT2H45M", "carrier": "TP", "number": "1363", "equipment": "32Q", "id": "Flight_02", "Identifier": { "authority": "Travelport", "value": "d90c6b83-2e0a-44d8-a642-d633129fb579" }, "Departure": { "@type": "Departure", "location": "LHR", "date": "2025-07-28", "time": "06:00:00" }, "Arrival": { "@type": "Arrival", "location": "LIS", "date": "2025-07-28", "time": "08:45:00" } } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 2 ], "classOfService": "K", "cabin": "Economy", "fareBasisCode": "KF0CLC00", "fareType": "AirlinePrivateFare" } ] } ] } ], "Price": { "@type": "PriceDetail", "id": "PriceDetail_1", "CurrencyCode": { "value": "EUR" }, "Base": 188, "TotalTaxes": 153.77, "TotalFees": 0, "TotalPrice": 341.77, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "EUR" }, "Base": 188, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 153.77, "Tax": [ { "currencyCode": "EUR", "taxCode": "J9", "value": 2 }, { "currencyCode": "EUR", "taxCode": "PT", "value": 8.93 }, { "currencyCode": "EUR", "taxCode": "YP", "value": 28.41 }, { "currencyCode": "EUR", "taxCode": "GB", "value": 15.19 }, { "currencyCode": "EUR", "taxCode": "UB", "value": 27.24 }, { "currencyCode": "EUR", "taxCode": "YQ", "value": 72 } ] }, "Total": 341.77 }, "Commission": { "@type": "CommissionPercent", "Percent": 0 }, "TravelerRefs": [ "travelerRefId_1" ], "NetBaseAmount": { "currencyCode": "EUR", "decimalPlace": 2, "value": 188 }, "FareCalculation": "LIS TP LON Q16.97 84.86LF0CLC00 TP LIS Q16.97 93.92KF0CLC00 NUC212.72END ROE0.883723" } ] }, "TermsAndConditionsFull": [...] }, { "@type": "OfferModify", "isNetted": "Some", "id": "offerModify_1", "Identifier": { "authority": "Travelport", "value": "9500e793-c0d5-48f6-9298-2321dad83172" }, "ContentSource": "GDS", "Product": [ { "@type": "ProductAir", "id": "p1", "Identifier": { "authority": "Travelport", "value": "03215229-3834-4c3d-ab7c-f1f8bb14acee" }, "FlightSegment": [ { "@type": "FlightSegment", "sequence": 1, "Flight": { "@type": "FlightDetail", "duration": "PT2H45M", "carrier": "TP", "number": "834", "equipment": "321", "id": "s4", "Departure": { "@type": "Departure", "location": "LIS", "date": "2025-07-18", "time": "13:00:00" }, "Arrival": { "@type": "ArrivalDetail", "terminal": "1", "location": "FCO", "date": "2025-07-18", "time": "16:45:00" }, "AvailabilitySourceCode": "A" } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 1 ], "classOfService": "K", "cabin": "Economy", "fareBasisCode": "KF0CLC00", "fareType": "PublicFare", "Brand": { "@type": "BrandID" } } ] } ] }, { "@type": "ProductAir", "id": "p2", "Identifier": { "authority": "Travelport", "value": "1d7cba68-7c38-4ad5-95bf-ee4900be5fd5" }, "FlightSegment": [ { "@type": "FlightSegment", "sequence": 2, "Flight": { "@type": "FlightDetail", "duration": "PT3H10M", "carrier": "TP", "number": "831", "equipment": "32N", "id": "s5", "Departure": { "@type": "Departure", "location": "FCO", "date": "2025-07-28", "time": "11:10:00" }, "Arrival": { "@type": "ArrivalDetail", "terminal": "1", "location": "LIS", "date": "2025-07-28", "time": "13:20:00" }, "AvailabilitySourceCode": "A" } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 2 ], "classOfService": "K", "cabin": "Economy", "fareBasisCode": "KF0CLC00", "fareType": "PublicFare", "Brand": { "@type": "BrandID" } } ] } ] } ], "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "EUR" }, "Base": 190, "TotalTaxes": 132.49, "TotalFees": 40, "TotalPrice": 362.49, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "EUR" }, "Base": 190, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 137.86, "Tax": [ { "taxCode": "EX", "value": 2.09 }, { "taxCode": "HB", "value": 7.5 }, { "taxCode": "IT", "value": 17.52 }, { "taxCode": "J9", "value": 2 }, { "taxCode": "MJ", "value": 1.21 }, { "taxCode": "PT", "value": 8.93 }, { "taxCode": "VT", "value": 3.35 }, { "taxCode": "YP", "value": 17.26 }, { "taxCode": "YQ", "value": 78 } ] }, "Fees": { "@type": "FeesDetail", "TotalFees": 40, "Fee": [ { "@type": "Fee", "description": "Change Fee", "FeeAmountOrPercent": { "@type": "FeeAmountOrPercentAmount", "Amount": { "code": "EUR", "minorUnit": 2, "value": 40 } } } ] }, "Total": 362.49 }, "FiledAmount": { "currencyCode": "EUR", "decimalPlace": 2, "value": 190 } } ] }, "TermsAndConditionsFull": [...], "ModifyPrice": { "@type": "ModifyPriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "EUR" }, "Base": 2, "TotalTaxes": -21.28, "TotalFees": 40, "TotalPrice": 20.72, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "EUR" }, "Base": 2, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": -21.28, "Tax": [ { "taxCode": "EX", "value": 2.09 }, { "taxCode": "GB", "value": -15.19 }, { "taxCode": "HB", "value": 7.5 }, { "taxCode": "IT", "value": 17.52 }, { "taxCode": "MJ", "value": 1.21 }, { "taxCode": "PT", "value": -5.37 }, { "taxCode": "UB", "value": -27.24 }, { "taxCode": "VT", "value": 3.35 }, { "taxCode": "YP", "value": -11.15 }, { "taxCode": "YQ", "value": 6 } ] }, "Fees": { "@type": "FeesDetail", "TotalFees": 40, "Fee": [ { "@type": "Fee", "description": "Change Fee", "FeeAmountOrPercent": { "@type": "FeeAmountOrPercentAmount", "Amount": { "code": "EUR", "minorUnit": 2, "value": 40 } } } ] }, "Total": 20.72 }, "FareCalculation": "LIS TP ROM Q16.97 90.52TP LIS Q16.97 90.53NUC214.99END ROE.883723 TP" } ] }, "ResidualPrice": { "@type": "ResidualPriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "EUR" }, "Base": 2, "TotalTaxes": -58.95, "TotalFees": 0, "TotalPrice": -56.95, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "EUR" }, "Base": 2, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": -58.95, "Tax": [ { "taxCode": "GB", "value": -15.19 }, { "taxCode": "PT", "value": -5.37 }, { "taxCode": "UB", "value": -27.24 }, { "taxCode": "YP", "value": -11.15 } ] }, "Fees": { "@type": "FeesDetail", "TotalFees": 0, "Fee": [ { "@type": "Fee", "description": "Change Fee", "FeeAmountOrPercent": { "@type": "FeeAmountOrPercentAmount", "Amount": { "code": "EUR", "minorUnit": 2, "value": 0 } } } ] }, "Total": -56.95 }, "FareCalculation": "LIS TP ROM Q16.97 90.52TP LIS Q16.97 90.53NUC214.99END ROE.883723 TP" } ] }, "AdditionalCollectionPrice": { "@type": "AdditionalCollectionPriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "EUR" }, "Base": 0, "TotalTaxes": 37.67, "TotalFees": 40, "TotalPrice": 77.67, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "EUR" }, "Base": 0, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 37.67, "Tax": [ { "taxCode": "EX", "value": 2.09 }, { "taxCode": "HB", "value": 7.5 }, { "taxCode": "IT", "value": 17.52 }, { "taxCode": "MJ", "value": 1.21 }, { "taxCode": "VT", "value": 3.35 }, { "taxCode": "YQ", "value": 6 } ] }, "Fees": { "@type": "FeesDetail", "TotalFees": 40, "Fee": [ { "@type": "Fee", "description": "Change Fee", "FeeAmountOrPercent": { "@type": "FeeAmountOrPercentAmount", "Amount": { "code": "EUR", "minorUnit": 2, "value": 40 } } } ] }, "Total": 77.67 }, "FareCalculation": "LIS TP ROM Q16.97 90.52TP LIS Q16.97 90.53NUC214.99END ROE.883723 TP" } ] } } ], "Traveler": [ { "@type": "Traveler", "birthDate": "2004-06-03", "gender": "Male", "passengerTypeCode": "ADT", "id": "travelerRefId_1", "Identifier": { "authority": "Travelport", "value": "da1aec58-baae-4115-8136-9db2ccb87b23" }, "PersonName": { "@type": "PersonName", "Given": "PAXONE", "Surname": "KATALON" }, "Telephone": [ { "@type": "TelephoneDetail", "phoneNumber": "NNNN", "id": "telephone_1" } ], "TravelDocument": [ { "@type": "TravelDocumentDetail", "birthDate": "2004-06-03", "Gender": "Male", "PersonName": { "@type": "PersonName", "Given": "PAXONE ", "Surname": "KATALON" } } ], "Comments": { "@type": "Comments", "Comment": [ { "id": "comment_1", "value": "P-ADT" } ] } } ], "FormOfPayment": [ { "@type": "FormOfPaymentCash", "id": "formOfPayment_1", "Identifier": { "authority": "Travelport", "value": "91ec0250-6578-4fa4-9485-97387f18b650" } }, { "@type": "FormOfPaymentPaymentCard", "id": "KatalonFoP_CreditCard1", "FormOfPaymentRef": "KatalonFoP_CreditCard1", "Identifier": { "authority": "Travelport", "value": "3f82e98f-3f5d-4507-84ae-b6cf9ce5b218" }, "PaymentCard": { "@type": "PaymentCard", "id": "paymentCard_KatalonFoP_CreditCard1", "expireDate": "0726", "CardType": "Credit", "CardCode": "VI", "CardHolderName": "SMITH JOHN", "CardNumber": { "@type": "CardNumber", "PlainText": "XXXXXXXXXXXX5550" } } } ], "Payment": [ { "@type": "Payment", "id": "payment_1", "PaymentRef": "payment_1", "Identifier": { "authority": "Travelport", "value": "c11abc7a-606d-4758-a729-26254e429a71" }, "Amount": { "minorUnit": 2, "value": 341.77 }, "FormOfPaymentIdentifier": { "FormOfPaymentRef": "formOfPayment_1" } }, { "@type": "Payment", "id": "KatalonPayment_1", "Identifier": { "authority": "Travelport", "value": "3890b546-ad60-41ba-96fa-baf91de12aad" }, "FormOfPaymentIdentifier": { "FormOfPaymentRef": "KatalonFoP_CreditCard1" }, "OfferIdentifier": [ { "id": "offer_1", "offerRef": "offer_1" } ], "BaseAmount": { "code": "EUR", "value": 0 } }, { "@type": "Payment", "id": "KatalonPayment_2", "Identifier": { "authority": "Travelport", "value": "64970996-229f-465d-b43b-338a7fce6db4" }, "FormOfPaymentIdentifier": { "FormOfPaymentRef": "KatalonFoP_CreditCard1" }, "OfferIdentifier": [ { "id": "offer_1", "offerRef": "offer_1" } ], "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 37.67 } }, { "@type": "Payment", "id": "KatalonPayment_3", "Identifier": { "authority": "Travelport", "value": "45696c24-39fa-4f13-8618-b35465c8e253" }, "FormOfPaymentIdentifier": { "FormOfPaymentRef": "KatalonFoP_CreditCard1" }, "OfferIdentifier": [ { "id": "offer_1", "offerRef": "offer_1" } ], "Fees": { "@type": "FeesDetail", "TotalFees": 40 } } ], "Receipt": [ { "@type": "ReceiptConfirmation", "Identifier": { "authority": "Travelport", "value": "892ac6a1-4e86-4769-940c-ad36c8f46652" }, "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "1G", "creationDate": "2025-07-03", "value": "CMR3T2" }, "OfferStatus": { "@type": "OfferStatusAir", "StatusAir": [ { "flightRefs": [ "Flight_01", "Flight_02" ], "code": "HK", "value": "Confirmed" } ] } } }, { "@type": "ReceiptConfirmation", "Identifier": { "authority": "Travelport", "value": "213b1b06-d5b1-4426-9e4c-2afa64d5d4a8" }, "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "TripContainer", "creationDate": "2025-07-03", "value": "69F21338-2A3C-0E00-0202-507031933580" } } }, { "@type": "ReceiptConfirmation", "Identifier": { "authority": "Travelport", "value": "1712a23d-88dc-4cee-977a-e298ab2c16b1" }, "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "1A", "value": "XY5ROV" } } }, { "@type": "ReceiptPayment", "dateTime": "2025-07-03T19:34:00Z", "id": "receipt_1", "ReceiptRef": "receipt_1", "Identifier": { "authority": "Travelport", "value": "454730b6-2000-4a12-b891-932e3147fe1b" }, "OfferRef": [ "offer_1" ], "Document": [ { "@type": "DocumentTicketExchange", "exchangeInd": true, "Number": "0479905344241", "TravelerIdentifierRef": { "passengerTypeCode": "ADT", "id": "travelerRefId_1", "value": "99b73dd2-ac4a-4fff-aed3-431603faccf6" }, "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "EUR" }, "Base": 188, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 153.77, "Tax": [ { "taxCode": "J9", "value": 2 }, { "taxCode": "PT", "value": 8.93 }, { "taxCode": "YP", "value": 28.41 }, { "taxCode": "GB", "value": 15.19 }, { "taxCode": "UB", "value": 27.24 }, { "taxCode": "YQ", "value": 72 } ] }, "Total": 341.77 } } ], "PaymentIdentifier": { "id": "payment_1", "PaymentRef": "payment_1", "Identifier": { "authority": "Travelport", "value": "c11abc7a-606d-4758-a729-26254e429a71" } } }, { "@type": "ReceiptPayment", "OfferRef": [ "offer_1" ], "Document": [ { "@type": "DocumentEMD", "Number": "0479999059653", "TravelerIdentifierRef": { "name": "KATALON PAXONE", "passengerTypeCode": "ADT", "id": "travelerRefId_1", "value": "da1aec58-baae-4115-8136-9db2ccb87b23" }, "Amount": { "@type": "Amount", "Total": 56.95 } } ] }, { "@type": "ReceiptPayment", "OfferRef": [ "offer_1" ], "Document": [ { "@type": "DocumentTicket", "Number": "0479905344242", "TravelerIdentifierRef": { "name": "KATALON PAXONE", "passengerTypeCode": "ADT", "id": "travelerRefId_1", "value": "da1aec58-baae-4115-8136-9db2ccb87b23" }, "Amount": { "@type": "Amount", "Total": 267.67 } } ] } ], "ReservationDisplaySequence": { "@type": "ReservationDisplaySequence", "DisplaySequence": [ { "@type": "DisplaySequence", "displaySequence": 1, "OfferRef": "offer_1", "ProductRef": "product_1", "Sequence": 1 }, { "@type": "DisplaySequence", "displaySequence": 2, "OfferRef": "offer_1", "ProductRef": "product_2", "Sequence": 2 } ] } } } }

## Literal `<pre>` excerpts from HTML

### Block 1

```
...    "Price" : {
          "@type" : "PriceDetail",
          "id" : "price_1",
          "CurrencyCode" : {
            "value" : "USD",
            "decimalPlace" : 2
          },
          "Base" : 625.0,
          "TotalTaxes" : 115.0,
          "TotalPrice" : 740.0,
          "PriceBreakdown" : [ {
            "@type" : "PriceBreakdownAir",
            "quantity" : 2,
            "requestedPassengerType" : "ADT",            
            "Amount" : {
              "@type" : "Amount",
              "CurrencyCode" : {
                "value" : "GBP",
                "decimalPlace" : 2
              },
              "Base" : 250.0,
              "Taxes" : {...}
            }
          },
          {
            "@type" : "PriceBreakdownAir",
            "quantity" : 1,
            "requestedPassengerType" : "CHD",            
            "Amount" : {
              "@type" : "Amount",
              "CurrencyCode" : {
                "value" : "GBP",
                "decimalPlace" : 2
              },
              "Base" : 125.0,
              "Taxes" : {...}
            }
          } ]
        },
        "ModifyPrice" : {
         "@type" : "ModifyPrice",
         "id" : "modifyPrice_1",
         "CurrencyCode" : {
           "value" : "GBP",
           "decimalPlace" : 2
         },
         "Base" : 0.0,
         "TotalTaxes" : 15.0,
         "TotalPrice" : 15.0
        },   ...
```

### Block 2

```
... "Product": [
      {
       "@type": "ProductAir",
       "id": "product_1",
       "totalDuration": "PT1H30M",
       "Identifier": {
        "value": "A0656EFF-FAF4-456F-B061-0161008D7C4E",
        "authority": "Travelport"
       },
       "Quantity": 3,
       "FlightSegment": [
        {
         "@type": "FlightSegment",
         "id": "flightSegment_1",
         "sequence": 1,
         "Flight": {
          "@type": "FlightDetail",
          "id": "flight_1",
          "carrier": "BA",
          "number": "123",
          "equipment": "777",
          "Departure": {
           "@type": "Departure",
           "location": "LHR",
           "date": "2025-11-24",
           "time": "09:45:00-06:00"
          },
          "Arrival": {
           "@type": "Arrival",
           "location": "SIN",
           "date": "2025-11-24",
           "time": "14:15:00+06:00"
          }
         }
        },
        {
         "@type": "FlightSegment",
         "id": "flightSegment_1",
         "sequence": 2,
         "Flight": {
          "@type": "FlightDetail",
          "id": "flight_2",
          "carrier": "BA",
          "number": "234",
          "equipment": "777",
          "Departure": {
           "@type": "Departure",
           "location": "LHR",
           "date": "2025-11-24",
           "time": "11:45:00-06:00"
          },
          "Arrival": {
           "@type": "Arrival",
           "location": "SIN",
           "date": "2025-11-24",
           "time": "16:15:00+06:00"
          }
         }
        }
       ],
       "PassengerFlight": [...]
      }
     ],...
```

### Block 3

```
{
 "ReservationQueryCommitReservation": {
  "enableTwoStepCommitInd": true,
  "overrideMCTInd": false,
  "errorWhenScheduleChangesInd": true,
  "errorWhenOfferPriceChangesInd": true,
 }
}
```

### Block 4

```
{
 "ReservationQueryCommitReservation": {
  "@type": "ReservationQueryCommitReservation",
  "scheduleChangeAcceptedInd": true
 }
}
```

### Block 5

```
{
 "ReservationQueryCommitReservation": {
  "@type": "ReservationQueryCommitReservation",
  "Notification": [
   {
    "@type": "Notification",
    "QueueNumber": [
     {
      "category": "DM",
      "overridePCC": "39RA",
      "value": 5
     }
    ],
    "Date": "2026-10-16"
   }
  ]
 }
}
```

### Block 6

```
{
 "ReservationQueryCommitReservation": {
  "ReceivedFrom": "BHarper"
 }
}
```

### Block 7

```
{
 "ReservationResponse": {
  "@type": "ReservationResponse",
  "Reservation": {
   "@type": "Reservation",
   "Offer": [
    {
     "@type": "Offer",
     "id": "offer_1",
     "Identifier": {
      "authority": "Travelport",
      "value": "c1f71f98-58d4-44cf-b9cb-0c22357b9aae"
     },
     "ContentSource": "GDS",
     "Product": [
      {
       "@type": "ProductAir",
       "id": "product_1",
       "FlightSegment": [
        {
         "@type": "FlightSegment",
         "id": "FlightSegment_01",
         "sequence": 1,
         "Flight": {
          "@type": "Flight",
          "duration": "PT2H34M",
          "carrier": "AA",
          "number": "2755",
          "equipment": "319",
          "id": "Flight_01",
          "Departure": {
           "@type": "Departure",
           "location": "ORD",
           "date": "2025-06-28",
           "time": "07:00:00"
          },
          "Arrival": {
           "@type": "Arrival",
           "location": "DEN",
           "date": "2025-06-28",
           "time": "08:39:00"
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
           "classOfService": "Y",
           "cabin": "Economy"
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
       "value": "AUD"
      },
      "Base": 854,
      "TotalTaxes": 89.6,
      "TotalFees": 0,
      "TotalPrice": 943.6,
      "PriceBreakdown": [
       {
        "@type": "PriceBreakdownAir",
        "quantity": 1,
        "requestedPassengerType": "ADT",
        "Amount": {
         "@type": "Amount",
         "currencySource": "Charged",
         "approximateInd": true,
         "CurrencyCode": {
          "decimalPlace": 2,
          "value": "AUD"
         },
         "Base": 854,
         "Taxes": {
          "@type": "TaxesDetail",
          "TotalTaxes": 89.6,
          "Tax": [
           {
            "currencyCode": "AUD",
            "taxCode": "AY",
            "value": 9.3
           },
           {
            "currencyCode": "AUD",
            "taxCode": "US",
            "value": 64.1
           },
           {
            "currencyCode": "AUD",
            "taxCode": "XF",
            "value": 7.5
           },
           {
            "currencyCode": "AUD",
            "taxCode": "ZP",
            "value": 8.7
           }
          ]
         },
         "Total": 943.6
        },
        "FiledAmount": {
         "currencyCode": "USD",
         "decimalPlace": 2,
         "value": 514.59
        }
       }
      ]
     },
     "TermsAndConditionsFull": [
      {
       "@type": "TermsAndConditionsFullAir",
       "Identifier": {
        "authority": "Travelport",
        "value": "515849d1-5a35-43d1-abd3-a59df70247ed"
       }
      },
      {
       "@type": "TermsAndConditionsFullAir",
       "ExpiryDate": "2025-05-30T23:59:00Z",
       "PaymentTimeLimit": "2025-05-30T23:59:00Z"
      }
     ]
    }
   ],
   "Traveler": [
    {
     "@type": "Traveler",
     "birthDate": "1986-11-11",
     "gender": "Male",
     "passengerTypeCode": "ADT",
     "id": "travelerRefId_1",
     "Identifier": {
      "authority": "Travelport",
      "value": "cf222445-50ac-414e-a9b0-ee2f729406a9"
     },
     "PersonName": {
      "@type": "PersonName",
      "Given": "TESTFIRST",
      "Surname": "TESTLAST"
     },
     "Telephone": [
      {
       "@type": "TelephoneDetail",
       "countryAccessCode": "1",
       "phoneNumber": "212456121",
       "id": "telephone_1",
       "cityCode": "ORD",
       "role": "Home"
      }
     ],
     "Email": [
      {
       "emailType": "TO",
       "value": "TravelerOne@notmail.com"
      }
     ],
     "TravelDocument": [
      {
       "@type": "TravelDocumentDetail",
       "birthDate": "1986-11-11",
       "Gender": "Male",
       "PersonName": {
        "@type": "PersonName",
        "Given": "TESTFIRST",
        "Surname": "TESTLAST"
       }
      },
      {
       "@type": "TravelDocumentDetail",
       "docNumber": "A123123",
       "docType": "Passport",
       "expireDate": "2035-05-28",
       "issueCountry": "US",
       "birthDate": "1986-11-11",
       "Gender": "Male",
       "PersonName": {
        "@type": "PersonName",
        "Given": "TESTFIRST",
        "Surname": "TESTLAST"
       }
      }
     ]
    }
   ],
   "Receipt": [
    {
     "@type": "ReceiptConfirmation",
     "Identifier": {
      "authority": "Travelport",
      "value": "599f068a-8956-4c92-a997-3f28f394b21d"
     },
     "Confirmation": {
      "@type": "ConfirmationHold",
      "Locator": {
       "source": "1G",
       "creationDate": "2025-05-28",
       "value": "BXPJVM"
      },
      "OfferStatus": {
       "@type": "OfferStatusAir",
       "StatusAir": [
        {
         "flightRefs": [
          "Flight_01"
         ],
         "code": "HK",
         "value": "Confirmed"
        }
       ]
      }
     }
    },
    {
     "@type": "ReceiptConfirmation",
     "Identifier": {
      "authority": "Travelport",
      "value": "981d43eb-70fe-49ed-a4ff-46564705354d"
     },
     "Confirmation": {
      "@type": "ConfirmationHold",
      "Locator": {
       "source": "AA",
       "value": "IUSHNW"
      }
     }
    }
   ],
   "ReservationDisplaySequence": {
    "@type": "ReservationDisplaySequence",
    "DisplaySequence": [
     {
      "@type": "DisplaySequence",
      "displaySequence": 1,
      "OfferRef": "offer_1",
      "ProductRef": "product_1",
      "Sequence": 1
     }
    ]
   }
  }
 }
}
```

### Block 8

```
{
 "ReservationResponse": {
  "@type": "ReservationResponse",
  "Reservation": {
   "@type": "Reservation",
   "Offer": [
    {
     "@type": "Offer",
     "id": "offer_1",
     "Identifier": {
      "authority": "Travelport",
      "value": "10b0ef3b-0797-447b-9b82-0cb59e1494c1"
     },
     "ContentSource": "GDS",
     "Product": [
      {
       "@type": "ProductAir",
       "id": "product_1",
       "FlightSegment": [
        {
         "@type": "FlightSegment",
         "id": "FlightSegment_01",
         "sequence": 1,
         "Flight": {
          "@type": "Flight",
          "duration": "PT2H34M",
          "carrier": "AA",
          "number": "2755",
          "equipment": "319",
          "id": "Flight_01",
          "Departure": {
           "@type": "Departure",
           "location": "ORD",
           "date": "2025-06-28",
           "time": "07:00:00"
          },
          "Arrival": {
           "@type": "Arrival",
           "location": "DEN",
           "date": "2025-06-28",
           "time": "08:39:00"
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
           "classOfService": "Y",
           "cabin": "Economy"
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
       "value": "AUD"
      },
      "Base": 854,
      "TotalTaxes": 89.6,
      "TotalFees": 0,
      "TotalPrice": 943.6,
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
         "Base": 514.59
        },
        "TravelerRefs": [
         "travelerRefId_1"
        ]
       },
       {
        "@type": "PriceBreakdownAir",
        "quantity": 1,
        "requestedPassengerType": "ADT",
        "Amount": {
         "@type": "Amount",
         "currencySource": "Charged",
         "approximateInd": true,
         "CurrencyCode": {
          "decimalPlace": 2,
          "value": "AUD"
         },
         "Base": 854,
         "Taxes": {
          "@type": "TaxesDetail",
          "TotalTaxes": 89.6,
          "Tax": [
           {
            "currencyCode": "AUD",
            "taxCode": "AY",
            "value": 9.3
           },
           {
            "currencyCode": "AUD",
            "taxCode": "US",
            "value": 64.1
           },
           {
            "currencyCode": "AUD",
            "taxCode": "XF",
            "value": 7.5
           },
           {
            "currencyCode": "AUD",
            "taxCode": "ZP",
            "value": 8.7
           }
          ]
         },
         "Total": 943.6
        },
        "FiledAmount": {
         "currencyCode": "USD",
         "decimalPlace": 2,
         "value": 514.59
        },
        "TravelerRefs": [
         "travelerRefId_1"
        ],
        "FareCalculation": "CHI AA DEN Q0.17 514.42B0AIZNN1 USD514.59END"
       }
      ]
     },
     "TermsAndConditionsFull": [
      {
       "@type": "TermsAndConditionsFullAir",
       "Identifier": {
        "authority": "Travelport",
        "value": "b4cf6d38-0a8c-4080-a524-fcffe6bd3633"
       },
       "ExpiryDate": "2025-05-29T23:59:00Z",
       "PaymentTimeLimit": "2025-05-30T23:59:00Z"
      }
     ]
    }
   ],
   "Traveler": [
    {
     "@type": "Traveler",
     "birthDate": "1986-11-11",
     "gender": "Male",
     "passengerTypeCode": "ADT",
     "id": "travelerRefId_1",
     "Identifier": {
      "authority": "Travelport",
      "value": "a493cb07-cae0-42fe-b80e-6278ce21c0d7"
     },
     "PersonName": {
      "@type": "PersonName",
      "Given": "TESTFIRST",
      "Surname": "TESTLAST"
     },
     "Telephone": [
      {
       "@type": "TelephoneDetail",
       "countryAccessCode": "1",
       "phoneNumber": "212456121",
       "id": "telephone_1",
       "cityCode": "ORD",
       "role": "Home"
      }
     ],
     "Email": [
      {
       "emailType": "TO",
       "value": "TravelerOne@gmail.com"
      }
     ],
     "TravelDocument": [
      {
       "@type": "TravelDocumentDetail",
       "birthDate": "1986-11-11",
       "Gender": "Male",
       "PersonName": {
        "@type": "PersonName",
        "Given": "TESTFIRST",
        "Surname": "TESTLAST"
       }
      },
      {
       "@type": "TravelDocumentDetail",
       "docNumber": "A123123",
       "docType": "Passport",
       "expireDate": "2035-05-28",
       "issueCountry": "US",
       "birthDate": "1986-11-11",
       "Gender": "Male",
       "PersonName": {
        "@type": "PersonName",
        "Given": "TESTFIRST",
        "Surname": "TESTLAST"
       }
      }
     ]
    }
   ],
   "FormOfPayment": [
    {
     "@type": "FormOfPaymentCash",
     "id": "formOfPayment_1",
     "FormOfPaymentRef": "formOfPayment_1",
     "Identifier": {
      "authority": "Travelport",
      "value": "8bd8e02c-7a1d-4979-b563-4811095cbe42"
     }
    }
   ],
   "Payment": [
    {
     "@type": "Payment",
     "id": "payment_1",
     "Identifier": {
      "authority": "Travelport",
      "value": "d95e702e-671f-4a3e-835f-4bdc78f6ec65"
     },
     "Amount": {
      "code": "USD",
      "minorUnit": 2,
      "currencySource": "Charged",
      "value": 943.6
     },
     "FormOfPaymentIdentifier": {
      "FormOfPaymentRef": "formOfPayment_1",
      "Identifier": {
       "authority": "Travelport",
       "value": "1546cc57-c5c3-4670-b555-fed35dd69ddf"
      }
     },
     "OfferIdentifier": [
      {
       "id": "offer_1",
       "offerRef": "offer_1",
       "Identifier": {
        "authority": "Travelport",
        "value": "9829d223-66dc-4590-8a8e-66a1669f8b00"
       }
      }
     ]
    }
   ],
   "Receipt": [
    {
     "@type": "ReceiptConfirmation",
     "Identifier": {
      "authority": "Travelport",
      "value": "17653ad8-eeae-4e88-a537-9a8b55323bba"
     },
     "Confirmation": {
      "@type": "ConfirmationHold",
      "Locator": {
       "source": "1G",
       "creationDate": "2025-05-28",
       "value": "BXPJVM"
      },
      "OfferStatus": {
       "@type": "OfferStatusAir",
       "StatusAir": [
        {
         "flightRefs": [
          "Flight_01"
         ],
         "code": "HK",
         "value": "Confirmed"
        }
       ]
      }
     }
    },
    {
     "@type": "ReceiptConfirmation",
     "Identifier": {
      "authority": "Travelport",
      "value": "dfa0a8de-2e33-4f88-aed7-7afc197e9d30"
     },
     "Confirmation": {
      "@type": "ConfirmationHold",
      "Locator": {
       "source": "AA",
       "value": "IUSHNW"
      }
     }
    },
    {
     "@type": "ReceiptPayment",
     "Document": [
      {
       "@type": "DocumentTicket",
       "Number": "0019905292727",
       "TravelerIdentifierRef": {
        "id": "travelerRefId_1",
        "value": "a493cb07-cae0-42fe-b80e-6278ce21c0d7"
       },
       "Amount": {
        "@type": "Amount",
        "Total": 943.6
       }
      }
     ]
    }
   ],
   "ReservationDisplaySequence": {
    "@type": "ReservationDisplaySequence",
    "DisplaySequence": [
     {
      "@type": "DisplaySequence",
      "displaySequence": 1,
      "OfferRef": "offer_1",
      "ProductRef": "product_1",
      "Sequence": 1
     }
    ]
   }
  }
 }
}
```

### Block 9

```
{
 "ReservationResponse": {
  "@type": "ReservationResponse",
  "Reservation": {
   "@type": "Reservation",
   "Identifier": {
    "authority": "Travelport",
    "value": "0ac7cfce-6192-4f32-b6b7-6dede455c17b"
   },
   "Offer": [
    {
     "@type": "Offer",
     "id": "offer_1",
     "Identifier": {
      "authority": "AA",
      "value": "MTVhM2E4ZjQtM2Y2Mi00MzlmLTgyMzctYWVlYzMwZTA4ODY5fFA1QjQyQTU3My1CMTIxLTRGODMtODY3OHN4aHRiMTR5MjNydmMtMS0x"
     },
     "Product": [
      {
       "@type": "ProductAir",
       "totalDuration": "PT2H29M",
       "id": "product_1",
       "Identifier": {
        "authority": "AA",
        "value": "3e08fb8b-b5ed-42e6-be7f-f0e628307d26"
       },
       "FlightSegment": [
        {
         "@type": "FlightSegment",
         "sequence": 1,
         "Flight": {
          "@type": "Flight",
          "duration": "PT2H29M",
          "carrier": "AA",
          "number": "6221",
          "equipment": "E75",
          "id": "seg_1",
          "Identifier": {
           "authority": "AA",
           "value": "6bc12b59-3387-4509-8975-64cd37e28d7d"
          },
          "Departure": {
           "@type": "DepartureDetail",
           "terminal": "0",
           "location": "LAX",
           "date": "2025-03-21",
           "time": "09:22:00"
          },
          "Arrival": {
           "@type": "ArrivalDetail",
           "location": "DEN",
           "date": "2025-03-21",
           "time": "12:51:00"
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
           "classOfService": "L",
           "cabin": "Economy",
           "fareBasisCode": "LUAIYSN1",
           "fareType": "PublicFare",
           "Brand": {
            "@type": "Brand",
            "name": "Main Cabin"
           }
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
       "value": "AUD"
      },
      "Base": 370,
      "TotalTaxes": 51.8,
      "TotalPrice": 421.8,
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
         "Base": 370,
         "Taxes": {
          "@type": "TaxesDetail",
          "TotalTaxes": 51.8,
          "Tax": [
           {
            "taxCode": "US",
            "description": "U.S.A Transportation Tax",
            "value": 27.7
           },
           {
            "taxCode": "XF",
            "description": "U.S Passenger Facility Charge",
            "value": 7.1
           },
           {
            "taxCode": "ZP",
            "description": "U.S. Flight Segment Tax",
            "value": 8.2
           },
           {
            "taxCode": "AY",
            "description": "Passenger Civil Aviation Security Service Fee",
            "value": 8.8
           }
          ]
         },
         "Total": 421.8
        }
       }
      ]
     },
     "TermsAndConditionsFull": [
      {
       "@type": "TermsAndConditionsFullAir",
       "ExpiryDate": "2025-02-23T23:59:00Z",
       "TextBlock": [
        {
         "@type": "TextBlockDetail",
         "description": "FARE RULES",
         "title": "Ticketing",
         "TextFormatted": [
          {
           "value": "NONREF/FAREDIF/"
          },
          {
           "value": "CXL BY FLT TIME OR NOVALUE"
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
          "product_1"
         ],
         "BaggageItem": [
          {
           "@type": "BaggageItem",
           "quantity": 0
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
          "product_1"
         ],
         "BaggageItem": [
          {
           "@type": "BaggageItem",
           "quantity": 2
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
       "FareRuleInfo": [
        {
         "@type": "FareRuleInfoText",
         "flightsRefs": [
          "seg_1"
         ],
         "TextFareRule": [
          {
           "name": "Cancel",
           "value": "Not Allowed"
          }
         ]
        }
       ],
       "PaymentTimeLimit": "2025-02-23T23:59:00Z",
       "Penalties": [
        {
         "@type": "Penalties",
         "Change": [
          {
           "@type": "ChangePermitted",
           "ProductRefs": [
            "product_1"
           ]
          }
         ],
         "Cancel": [
          {
           "@type": "CancelNotPermitted",
           "ProductRefs": [
            "product_1"
           ],
           "NotPermittedInd": "true"
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
   "Traveler": [
    {
     "@type": "Traveler",
     "birthDate": "1986-11-11",
     "gender": "Male",
     "passengerTypeCode": "ADT",
     "id": "trav_1",
     "TravelerRef": "trav_1",
     "Identifier": {
      "authority": "Travelport",
      "value": "QURUfFQx"
     },
     "PersonName": {
      "@type": "PersonName",
      "Given": "TESTFIRST",
      "Surname": "TESTLAST"
     },
     "Telephone": [
      {
       "@type": "Telephone",
       "countryAccessCode": "1",
       "phoneNumber": "212456121",
       "id": "4",
       "cityCode": "ORD",
       "role": "Home"
      }
     ],
     "Email": [
      {
       "id": "email_1",
       "validInd": true,
       "value": "TRAVELERONE@GMAIL.COM"
      }
     ],
     "TravelDocument": [
      {
       "@type": "TravelDocumentDetail",
       "docNumber": "A123123",
       "docType": "Passport",
       "expireDate": "2035-02-21",
       "issueCountry": "US",
       "birthDate": "1986-11-11",
       "Gender": "Male",
       "PersonName": {
        "@type": "PersonName",
        "Given": "TestFirst",
        "Surname": "TestLast"
       }
      }
     ]
    }
   ],
   "Receipt": [
    {
     "@type": "ReceiptConfirmation",
     "id": "receipt_1",
     "Identifier": {
      "authority": "AA",
      "value": "4afd7900-bcf6-4473-9109-44bd60d14ffb"
     },
     "OfferRef": [
      "offer_1"
     ],
     "Confirmation": {
      "@type": "ConfirmationHold",
      "Locator": {
       "source": "AA",
       "sourceContext": "OrderId",
       "value": "AA001HGO3HWA4"
      }
     }
    },
    {
     "@type": "ReceiptConfirmation",
     "id": "receipt_2",
     "Identifier": {
      "authority": "AA",
      "value": "ba4391ec-e0da-4290-98ca-f17d5b7b1060"
     },
     "OfferRef": [
      "offer_1"
     ],
     "Confirmation": {
      "@type": "ConfirmationHold",
      "Locator": {
       "source": "AA",
       "sourceContext": "VendorLocator",
       "value": "IKRWES"
      },
      "OfferStatus": {
       "@type": "OfferStatusAir",
       "StatusAir": [
        {
         "flightRefs": [
       
…
```

### Block 10

```
{
 "ReservationResponse": {
  "@type": "ReservationResponse",
  "Reservation": {
   "@type": "Reservation",
   "Identifier": {
    "authority": "Travelport",
    "value": "0ac7cfce-6192-4f32-b6b7-6dede455c17b"
   },
   "Offer": [
    {
     "@type": "Offer",
     "id": "offer_1",
     "Identifier": {
      "authority": "AA",
      "value": "MTVhM2E4ZjQtM2Y2Mi00MzlmLTgyMzctYWVlYzMwZTA4ODY5fFA1QjQyQTU3My1CMTIxLTRGODMtODY3OHN4aHRiMTR5MjNydmMtMS0x"
     },
     "Product": [
      {
       "@type": "ProductAir",
       "totalDuration": "PT2H29M",
       "id": "product_1",
       "Identifier": {
        "authority": "AA",
        "value": "3e08fb8b-b5ed-42e6-be7f-f0e628307d26"
       },
       "FlightSegment": [
        {
         "@type": "FlightSegment",
         "sequence": 1,
         "Flight": {
          "@type": "Flight",
          "duration": "PT2H29M",
          "carrier": "AA",
          "number": "6221",
          "equipment": "E75",
          "id": "seg_1",
          "Identifier": {
           "authority": "AA",
           "value": "6bc12b59-3387-4509-8975-64cd37e28d7d"
          },
          "Departure": {
           "@type": "DepartureDetail",
           "terminal": "0",
           "location": "LAX",
           "date": "2025-03-21",
           "time": "09:22:00"
          },
          "Arrival": {
           "@type": "ArrivalDetail",
           "location": "DEN",
           "date": "2025-03-21",
           "time": "12:51:00"
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
           "classOfService": "L",
           "cabin": "Economy",
           "fareBasisCode": "LUAIYSN1",
           "fareType": "PublicFare",
           "Brand": {
            "@type": "Brand",
            "name": "Main Cabin"
           }
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
       "value": "AUD"
      },
      "Base": 370,
      "TotalTaxes": 51.8,
      "TotalPrice": 421.8,
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
         "Base": 370,
         "Taxes": {
          "@type": "TaxesDetail",
          "TotalTaxes": 51.8,
          "Tax": [
           {
            "taxCode": "US",
            "description": "U.S.A Transportation Tax",
            "value": 27.7
           },
           {
            "taxCode": "XF",
            "description": "U.S Passenger Facility Charge",
            "value": 7.1
           },
           {
            "taxCode": "ZP",
            "description": "U.S. Flight Segment Tax",
            "value": 8.2
           },
           {
            "taxCode": "AY",
            "description": "Passenger Civil Aviation Security Service Fee",
            "value": 8.8
           }
          ]
         },
         "Total": 421.8
        }
       }
      ]
     },
     "TermsAndConditionsFull": [
      {
       "@type": "TermsAndConditionsFullAir",
       "ExpiryDate": "2025-02-23T23:59:00Z",
       "TextBlock": [
        {
         "@type": "TextBlockDetail",
         "description": "FARE RULES",
         "title": "Ticketing",
         "TextFormatted": [
          {
           "value": "NONREF/FAREDIF/"
          },
          {
           "value": "CXL BY FLT TIME OR NOVALUE"
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
          "product_1"
         ],
         "BaggageItem": [
          {
           "@type": "BaggageItem",
           "quantity": 0
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
          "product_1"
         ],
         "BaggageItem": [
          {
           "@type": "BaggageItem",
           "quantity": 2
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
       "FareRuleInfo": [
        {
         "@type": "FareRuleInfoText",
         "flightsRefs": [
          "seg_1"
         ],
         "TextFareRule": [
          {
           "name": "Cancel",
           "value": "Not Allowed"
          }
         ]
        }
       ],
       "PaymentTimeLimit": "2025-02-23T23:59:00Z",
       "Penalties": [
        {
         "@type": "Penalties",
         "Change": [
          {
           "@type": "ChangePermitted",
           "ProductRefs": [
            "product_1"
           ]
          }
         ],
         "Cancel": [
          {
           "@type": "CancelNotPermitted",
           "ProductRefs": [
            "product_1"
           ],
           "NotPermittedInd": "true"
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
   "Traveler": [
    {
     "@type": "Traveler",
     "birthDate": "1986-11-11",
     "gender": "Male",
     "passengerTypeCode": "ADT",
     "id": "trav_1",
     "TravelerRef": "trav_1",
     "Identifier": {
      "authority": "Travelport",
      "value": "QURUfFQx"
     },
     "PersonName": {
      "@type": "PersonName",
      "Given": "TESTFIRST",
      "Surname": "TESTLAST"
     },
     "Telephone": [
      {
       "@type": "Telephone",
       "countryAccessCode": "1",
       "phoneNumber": "212456121",
       "id": "4",
       "cityCode": "ORD",
       "role": "Home"
      }
     ],
     "Email": [
      {
       "id": "email_1",
       "validInd": true,
       "value": "TRAVELERONE@GMAIL.COM"
      }
     ],
     "TravelDocument": [
      {
       "@type": "TravelDocumentDetail",
       "docNumber": "A123123",
       "docType": "Passport",
       "expireDate": "2035-02-21",
       "issueCountry": "US",
       "birthDate": "1986-11-11",
       "Gender": "Male",
       "PersonName": {
        "@type": "PersonName",
        "Given": "TestFirst",
        "Surname": "TestLast"
       }
      }
     ]
    }
   ],
   "Receipt": [
    {
     "@type": "ReceiptConfirmation",
     "id": "receipt_1",
     "Identifier": {
      "authority": "AA",
      "value": "4afd7900-bcf6-4473-9109-44bd60d14ffb"
     },
     "OfferRef": [
      "offer_1"
     ],
     "Confirmation": {
      "@type": "ConfirmationHold",
      "Locator": {
       "source": "AA",
       "sourceContext": "OrderId",
       "value": "AA001HGO3HWA4"
      }
     }
    },
    {
     "@type": "ReceiptConfirmation",
     "id": "receipt_2",
     "Identifier": {
      "authority": "AA",
      "value": "ba4391ec-e0da-4290-98ca-f17d5b7b1060"
     },
     "OfferRef": [
      "offer_1"
     ],
     "Confirmation": {
      "@type": "ConfirmationHold",
      "Locator": {
       "source": "AA",
       "sourceContext": "VendorLocator",
       "value": "IKRWES"
      },
      "OfferStatus": {
       "@type": "OfferStatusAir",
       "StatusAir": [
        {
         "flightRefs": [
       
…
```

### Block 11

```
{
 "ReservationResponse": {
  "@type": "ReservationResponse",
  "Reservation": {
   "@type": "Reservation",
   "Identifier": {
    "authority": "Travelport",
    "value": "5dad819f-f6cf-4a62-9670-12e1e9b89cd3"
   },
   "Offer": [
    {
     "@type": "Offer",
     "id": "offer_1",
     "Identifier": {
      "authority": "AA",
      "value": "QUEwMDFIR08zSFdBNHxQNUI0MkE1NzMtQjEyMS00RjgzLTg2NzhzeGh0YjE0eTIzcnZjLTEtMXxTdGF0dXM6VVNFRCBOVEFD"
     },
     "Product": [
      {
       "@type": "ProductAir",
       "totalDuration": "PT2H29M",
       "id": "product_1",
       "Identifier": {
        "authority": "AA",
        "value": "2d30cc3f-bdff-4abf-ad3d-90a155905c6a"
       },
       "FlightSegment": [
        {
         "@type": "FlightSegment",
         "id": "s1",
         "sequence": 1,
         "Flight": {
          "@type": "Flight",
          "distance": 860,
          "duration": "PT2H29M",
          "carrier": "AA",
          "number": "6221",
          "operatingCarrierName": "SKYWEST AIRLINES AS AMERICAN EAGLE",
          "equipment": "E75",
          "id": "Flight_01",
          "Identifier": {
           "authority": "AA",
           "value": "2442a99c-51e3-471f-8357-4283a0f37853"
          },
          "Departure": {
           "@type": "DepartureDetail",
           "terminal": "0",
           "location": "LAX",
           "date": "2025-03-21",
           "time": "09:22:00"
          },
          "Arrival": {
           "@type": "ArrivalDetail",
           "location": "DEN",
           "date": "2025-03-21",
           "time": "12:51:00"
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
           "classOfService": "L",
           "cabin": "Economy",
           "fareBasisCode": "LUAIYSN1",
           "fareType": "PublicFare",
           "Brand": {
            "@type": "Brand",
            "name": "Main Cabin"
           }
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
       "value": "AUD"
      },
      "Base": 370,
      "TotalTaxes": 51.8,
      "TotalPrice": 421.8,
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
         "Base": 370,
         "Taxes": {
          "@type": "TaxesDetail",
          "TotalTaxes": 51.8,
          "Tax": [
           {
            "taxCode": "US",
            "description": "U.S.A Transportation Tax",
            "value": 27.7
           },
           {
            "taxCode": "XF",
            "description": "U.S Passenger Facility Charge",
            "value": 7.1
           },
           {
            "taxCode": "ZP",
            "description": "U.S. Flight Segment Tax",
            "value": 8.2
           },
           {
            "taxCode": "AY",
            "description": "Passenger Civil Aviation Security Service Fee",
            "value": 8.8
           }
          ]
         },
         "Total": 421.8
        }
       }
      ]
     },
     "TermsAndConditionsFull": [
      {
       "@type": "TermsAndConditionsFullAir",
       "ExpiryDate": "2025-02-23T23:59:00Z",
       "BaggageAllowance": [
        {
         "@type": "BaggageAllowanceDetail",
         "passengerTypeCodes": [
          "ADT"
         ],
         "baggageType": "FirstCheckedBag",
         "ProductRef": [
          "product_1"
         ],
         "BaggageItem": [
          {
           "@type": "BaggageItem",
           "quantity": 0
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
          "product_1"
         ],
         "BaggageItem": [
          {
           "@type": "BaggageItem",
           "quantity": 2
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
       "FareRuleInfo": [
        {
         "@type": "FareRuleInfoText",
         "flightsRefs": [
          "s1"
         ],
         "TextFareRule": [
          {
           "name": "Ticketing",
           "value": "NONREF/FAREDIF/"
          },
          {
           "name": "Ticketing",
           "value": "CXL BY FLT TIME OR NOVALUE"
          },
          {
           "name": "Change",
           "value": "Allowed"
          },
          {
           "name": "Cancel",
           "value": "Not Allowed"
          },
          {
           "name": "AdvanceStay",
           "value": "AdvancePurchase:P14D"
          }
         ]
        }
       ],
       "PaymentTimeLimit": "2025-02-23T23:59:00Z",
       "Penalties": [
        {
         "@type": "Penalties",
         "Cancel": [
          {
           "@type": "CancelNotPermitted",
           "ProductRefs": [
            "product_1"
           ],
           "NotPermittedInd": "true"
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
   "Traveler": [
    {
     "@type": "Traveler",
     "birthDate": "1986-11-11",
     "gender": "Male",
     "passengerTypeCode": "ADT",
     "id": "trav_1",
     "TravelerRef": "trav_1",
     "Identifier": {
      "authority": "Travelport",
      "value": "QURUfFQx"
     },
     "PersonName": {
      "@type": "PersonName",
      "Given": "TESTFIRST",
      "Surname": "TESTLAST"
     },
     "Telephone": [
      {
       "@type": "TelephoneDetail",
       "countryAccessCode": "1",
       "phoneNumber": "212456121",
       "id": "telephone_1",
       "cityCode": "ORD",
       "role": "Home"
      }
     ],
     "Email": [
      {
       "id": "email_1",
       "emailType": "TO",
       "validInd": true,
       "value": "TRAVELERONE@GMAIL.COM"
      }
     ],
     "TravelDocument": [
      {
       "@type": "TravelDocumentDetail",
       "docNumber": "A123123",
       "docType": "Passport",
       "expireDate": "2035-02-21",
       "issueCountry": "US",
       "birthDate": "1986-11-11",
       "birthCountry": "US",
       "Gender": "Male",
       "PersonName": {
        "@type": "PersonName",
        "Given": "TESTFIRST",
        "Surname": "TESTLAST"
       }
      }
     ]
    }
   ],
   "FormOfPayment": [
    {
     "@type": "FormOfPaymentPaymentCard",
     "id": "formOfPayment_1",
     "FormOfPaymentRef": "formOfPayment_1",
     "Identifier": {
      "authority": "Travelport",
      "value": "A0656EFF-FAF4-456F-B061-0161008D6FOP"
     },
     "PaymentCard": {
      "@type": "PaymentCardDetail",
      "id": "paymentCard_4",
      "expireDate": "0139",
      "CardType": "Credit",
      "CardCode": "VI",
      "CardHolderName": "JANE DOE",
      "CardNumber": {
       "@type": "CardNumber",
       "PlainText": "XXXXXXXXXXXX8769"
      },
      "SeriesCode": {
       "@type": "SeriesCode",
       "PlainText": "123"
      }
     }
    }
   ],
   "Payment": [
    {
     "@type": "Payment",
     "id": "payment_1",
     "Identifier": {
      "authority": "Travelport",
      "value": "57f3d29b-aca0-483d-913f-1d11f86cfe30"
     },
     "Amount":
…
```

### Block 12

```
{
 "ReservationResponse": {
  "@type": "ReservationResponse",
  "Reservation": {
   "@type": "Reservation",
   "Identifier": {
    "authority": "Travelport",
    "value": "647583df-8d6f-4f8b-bcc5-e961100cb09f"
   },
   "Offer": [
    {
     "@type": "Offer",
     "id": "1",
     "Identifier": {
      "authority": "SQ",
      "value": "NUZLTjRLfFNRXzVGS040S19BSVItMS0yfFNRfFNRXzVGS040S3xwcm9kdWN0Ml9zMi1TRUcyOnByb2R1Y3QxX3MxLVNFRzF8QURUOlBBWDE="
     },
     "Product": [
      {
       "@type": "ProductAir",
       "totalDuration": "PT4H",
       "id": "product1",
       "Identifier": {
        "authority": "SQ",
        "value": "ad94565e-5b81-497f-876b-f6723038ba98"
       },
       "FlightSegment": [
        {
         "@type": "FlightSegment",
         "id": "s1",
         "sequence": 1,
         "Flight": {
          "@type": "Flight",
          "duration": "PT4H",
          "carrier": "SQ",
          "number": "899",
          "operatingCarrier": "SQ",
          "operatingCarrierName": "SINGAPORE AIRLINES",
          "id": "seg1",
          "Identifier": {
           "authority": "SQ",
           "value": "d350d71c-c1af-4518-a231-99ea00a3918a"
          },
          "Departure": {
           "@type": "DepartureDetail",
           "terminal": "1",
           "location": "HKG",
           "date": "2025-03-21",
           "time": "09:05:00"
          },
          "Arrival": {
           "@type": "ArrivalDetail",
           "terminal": "0",
           "location": "SIN",
           "date": "2025-03-21",
           "time": "13:05:00"
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
           "classOfService": "K",
           "cabin": "Economy",
           "fareBasisCode": "K16HKRPO/DP"
          }
         ]
        }
       ]
      },
      {
       "@type": "ProductAir",
       "totalDuration": "PT3H45M",
       "id": "product2",
       "Identifier": {
        "authority": "SQ",
        "value": "21f11ea0-8388-447c-a7c1-e2b07c8307c3"
       },
       "FlightSegment": [
        {
         "@type": "FlightSegment",
         "id": "s2",
         "sequence": 2,
         "Flight": {
          "@type": "Flight",
          "duration": "PT3H45M",
          "carrier": "SQ",
          "number": "874",
          "operatingCarrier": "SQ",
          "operatingCarrierName": "SINGAPORE AIRLINES",
          "id": "seg2",
          "Identifier": {
           "authority": "SQ",
           "value": "9c4e962f-b80c-49bf-aeb2-4fd518cf0539"
          },
          "Departure": {
           "@type": "DepartureDetail",
           "terminal": "3",
           "location": "SIN",
           "date": "2025-03-24",
           "time": "07:35:00"
          },
          "Arrival": {
           "@type": "ArrivalDetail",
           "terminal": "1",
           "location": "HKG",
           "date": "2025-03-24",
           "time": "11:20:00"
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
           "classOfService": "K",
           "cabin": "Economy",
           "fareBasisCode": "K16HKRPO/DP"
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
       "value": "AUD"
      },
      "Base": 378,
      "TotalTaxes": 133.3,
      "TotalFees": 0,
      "TotalPrice": 511.3,
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
         "Base": 378,
         "Taxes": {
          "@type": "TaxesDetail",
          "TotalTaxes": 133.3,
          "Tax": [
           {
            "taxCode": "G3",
            "value": 18.4
           },
           {
            "taxCode": "HK",
            "value": 24.5
           },
           {
            "taxCode": "I5",
            "value": 13.3
           },
           {
            "taxCode": "L7",
            "value": 12.8
           },
           {
            "taxCode": "OP",
            "value": 9.5
           },
           {
            "taxCode": "SG",
            "value": 54.8
           }
          ]
         },
         "Total": 511.3
        }
       }
      ]
     },
     "TermsAndConditionsFull": [
      {
       "@type": "TermsAndConditionsFullAir",
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
           "Measurement": [
            {
             "measurementType": "Weight",
             "unit": "Kilograms",
             "value": 25
            }
           ]
          }
         ],
         "SegmentSequenceList": [
          1
         ],
         "Text": [
          "25K"
         ]
        },
        {
         "@type": "BaggageAllowanceDetail",
         "passengerTypeCodes": [
          "ADT"
         ],
         "baggageType": "FirstCheckedBag",
         "ProductRef": [
          "product2"
         ],
         "BaggageItem": [
          {
           "@type": "BaggageItem",
           "Measurement": [
            {
             "measurementType": "Weight",
             "unit": "Kilograms",
             "value": 25
            }
           ]
          }
         ],
         "SegmentSequenceList": [
          2
         ],
         "Text": [
          "25K"
         ]
        }
       ],
       "ValidatingAirline": [
        {
         "@type": "ValidatingAirline",
         "ValidatingAirline": "SQ"
        }
       ]
      }
     ]
    }
   ],
   "Traveler": [
    {
     "@type": "Traveler",
     "birthDate": "1986-11-11",
     "gender": "Male",
     "passengerTypeCode": "ADT",
     "id": "trav_1",
     "TravelerRef": "trav_1",
     "Identifier": {
      "authority": "Travelport",
      "value": "QURUfFBBWDE="
     },
     "PersonName": {
      "@type": "PersonName",
      "Given": "TESTFIRST",
      "Surname": "TESTLAST"
     },
     "Telephone": [
      {
       "@type": "Telephone",
       "countryAccessCode": "1",
       "phoneNumber": "212456121",
       "id": "4",
       "cityCode": "ORD",
       "role": "Home"
      }
     ],
     "Email": [
      {
       "id": "email_1",
       "value": "TRAVELERONE@GMAIL.COM"
      }
     ],
     "TravelDocument": [
      {
       "@type": "TravelDocumentDetail",
       "docNumber": "A123123",
       "docType": "Passport",
       "expireDate": "2035-02-21",
       "issueCountry": "US",
       "birthDate": "1986-11-11",
       "Gender": "Male",
       "PersonName": {
        "@type": "PersonName",
        "Given": "TestFirst",
        "Surname": "TestLast"
       }
      }
     ]
    }
   ],
   "FormOfPayment": [
    {
     "@type": "FormOfPaymentCash",
     "id": "formOfPayment_1",
     "Identifier": {
      "authority": "SQ",
      "value": "c2a72cc6-779d-4f72-b76c-87f9c78a4d5f"
     }
    }
   ],
   "Payment": [
    {
     "@type": "Payment"
…
```

### Block 13

```
{
 "ReservationResponse": {
  "@type": "ReservationResponse",
  "transactionId": "Katalon_07032025133341",
  "traceId": "b1744f10-6434-43d8-aec4-a93d72873172",
  "Reservation": {
   "@type": "Reservation",
   "Identifier": {
    "authority": "Travelport",
    "value": "3f82e98f-3f5d-4507-84ae-b6cf9ce5b218"
   },
   "Offer": [
    {
     "@type": "Offer",
     "id": "offer_1",
     "Identifier": {
      "authority": "Travelport",
      "value": "00b23c24-3047-4a24-9d5f-f99f3062f905"
     },
     "ContentSource": "GDS",
     "Product": [
      {
       "@type": "ProductAir",
       "id": "product_1",
       "Identifier": {
        "authority": "Travelport",
        "value": "fe5f3bac-5bbd-4054-b68b-7022dfc3c746"
       },
       "FlightSegment": [
        {
         "@type": "FlightSegment",
         "id": "FlightSegment_01",
         "sequence": 1,
         "Flight": {
          "@type": "Flight",
          "duration": "PT2H45M",
          "carrier": "TP",
          "number": "1356",
          "equipment": "32N",
          "id": "Flight_01",
          "Identifier": {
           "authority": "Travelport",
           "value": "268ba647-c23b-43ad-b3a4-286d34d6a7cc"
          },
          "Departure": {
           "@type": "Departure",
           "location": "LIS",
           "date": "2025-07-18",
           "time": "08:15:00"
          },
          "Arrival": {
           "@type": "Arrival",
           "location": "LHR",
           "date": "2025-07-18",
           "time": "11:00:00"
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
           "classOfService": "L",
           "cabin": "Economy",
           "fareBasisCode": "LF0CLC00",
           "fareType": "AirlinePrivateFare"
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
        "value": "4abf7840-464b-4f7c-9d64-9acfec557374"
       },
       "FlightSegment": [
        {
         "@type": "FlightSegment",
         "id": "FlightSegment_02",
         "sequence": 2,
         "Flight": {
          "@type": "Flight",
          "duration": "PT2H45M",
          "carrier": "TP",
          "number": "1363",
          "equipment": "32Q",
          "id": "Flight_02",
          "Identifier": {
           "authority": "Travelport",
           "value": "d90c6b83-2e0a-44d8-a642-d633129fb579"
          },
          "Departure": {
           "@type": "Departure",
           "location": "LHR",
           "date": "2025-07-28",
           "time": "06:00:00"
          },
          "Arrival": {
           "@type": "Arrival",
           "location": "LIS",
           "date": "2025-07-28",
           "time": "08:45:00"
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
           "classOfService": "K",
           "cabin": "Economy",
           "fareBasisCode": "KF0CLC00",
           "fareType": "AirlinePrivateFare"
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
       "value": "EUR"
      },
      "Base": 188,
      "TotalTaxes": 153.77,
      "TotalFees": 0,
      "TotalPrice": 341.77,
      "PriceBreakdown": [
       {
        "@type": "PriceBreakdownAir",
        "quantity": 1,
        "requestedPassengerType": "ADT",
        "Amount": {
         "@type": "Amount",
         "CurrencyCode": {
          "decimalPlace": 2,
          "value": "EUR"
         },
         "Base": 188,
         "Taxes": {
          "@type": "TaxesDetail",
          "TotalTaxes": 153.77,
          "Tax": [
           {
            "currencyCode": "EUR",
            "taxCode": "J9",
            "value": 2
           },
           {
            "currencyCode": "EUR",
            "taxCode": "PT",
            "value": 8.93
           },
           {
            "currencyCode": "EUR",
            "taxCode": "YP",
            "value": 28.41
           },
           {
            "currencyCode": "EUR",
            "taxCode": "GB",
            "value": 15.19
           },
           {
            "currencyCode": "EUR",
            "taxCode": "UB",
            "value": 27.24
           },
           {
            "currencyCode": "EUR",
            "taxCode": "YQ",
            "value": 72
           }
          ]
         },
         "Total": 341.77
        },
        "Commission": {
         "@type": "CommissionPercent",
         "Percent": 0
        },
        "TravelerRefs": [
         "travelerRefId_1"
        ],
        "NetBaseAmount": {
         "currencyCode": "EUR",
         "decimalPlace": 2,
         "value": 188
        },
        "FareCalculation": "LIS TP LON Q16.97 84.86LF0CLC00 TP LIS Q16.97 93.92KF0CLC00 NUC212.72END ROE0.883723"
       }
      ]
     },
     "TermsAndConditionsFull": [...]
    },
    {
     "@type": "OfferModify",
     "isNetted": "Some",
     "id": "offerModify_1",
     "Identifier": {
      "authority": "Travelport",
      "value": "9500e793-c0d5-48f6-9298-2321dad83172"
     },
     "ContentSource": "GDS",
     "Product": [
      {
       "@type": "ProductAir",
       "id": "p1",
       "Identifier": {
        "authority": "Travelport",
        "value": "03215229-3834-4c3d-ab7c-f1f8bb14acee"
       },
       "FlightSegment": [
        {
         "@type": "FlightSegment",
         "sequence": 1,
         "Flight": {
          "@type": "FlightDetail",
          "duration": "PT2H45M",
          "carrier": "TP",
          "number": "834",
          "equipment": "321",
          "id": "s4",
          "Departure": {
           "@type": "Departure",
           "location": "LIS",
           "date": "2025-07-18",
           "time": "13:00:00"
          },
          "Arrival": {
           "@type": "ArrivalDetail",
           "terminal": "1",
           "location": "FCO",
           "date": "2025-07-18",
           "time": "16:45:00"
          },
          "AvailabilitySourceCode": "A"
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
           "classOfService": "K",
           "cabin": "Economy",
           "fareBasisCode": "KF0CLC00",
           "fareType": "PublicFare",
           "Brand": {
            "@type": "BrandID"
           }
          }
         ]
        }
       ]
      },
      {
       "@type": "ProductAir",
       "id": "p2",
       "Identifier": {
        "authority": "Travelport",
        "value": "1d7cba68-7c38-4ad5-95bf-ee4900be5fd5"
       },
       "FlightSegment": [
        {
         "@type": "FlightSegment",
         "sequence": 2,
         "Flight": {
          "@type": "FlightDetail",
          "duration": "PT3H10M",
          "carrier": "TP",
          "number": "831",
          "equipment": "32N",
          "id": "s5",
          "Departure": {
           "@type": "Departure",
           "location": "FCO",
           "date": "2025-07-28",
           "time": "11:10:00"
  
…
```

