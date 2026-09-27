# Air Booking Guide

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Book/BookingGuide.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Air Booking Guide Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Air Booking Guide The JSON APIs booking workflow uses a workbench session and multiple requests to create a held air reservation for later fulfillment, called a booking . This guide summarizes the steps in the workflow. Endpoints, requests, responses, and examples are in the API&#160;Reference for each step, linked below. Some booking steps are optional, are specific to either GDS&#160;or NDC, or can be sent in the ticketing workflow instead. See All Booking and Ticketing Workflows . Travelport retains a search from any of the search APIs in cache for 12 minutes for GDS content and 34 minutes for NDC content. Subsequent reference payload requests to price any searched offer or add it to the workbench must be completed within that time window. Any workbench is valid for 30 minutes and must be committed within that time window or it expires. Related Content: JSON Air APIs Guide , Reservation Retrieve Guide , Multi-content Booking Guide (Air, Hotel, Car) , Ticketing Guide In this topic: Basic Concepts Workbench Actions Summary Booking Workflow Summary Booking Workflow Diagrams Hold and Pay Workflow NDC&#160;Instant Pay Workflow (book and ticket in same workbench) Book Commit Response Layout Diagram Optional Actions at Workbench Commit Enable Warnings for Price/Schedule Changes, or Connect Time (MCT) (Two-step Commit) Create Retention Segments Confirm Involuntary Schedule Change Update or Delete Ticketing Time Limit Date Add ReceivedFrom for Deem Create Shell Booking in Case of Booking Failure NDC&#160;Flight Disruption Handling (Involuntary Changes) Passive Segments Unpriced Segments and AutoPrice/Manual Fares Remove Offers, Products, Segments, or Filed Fares from a Booking (Cancel&#160;Workbench Items) Multi-offer Bookings Multi-content Bookings (Air, Hotel, Car Content) Expired Bookings Travel Agency Details Custom Booking Rules Basic Concepts The booking process uses a workflow of multiple calls to create a workbench session, add an offer for flight/s to the workbench, add travelers to the workbench, and commit the workbench. Booking also supports several optional actions, such as adding or modifying seats, paid ancillaries, and remarks and special service requests. Once the workbench is successfully committed and the flights confirmed by the carrier, the details added during the booking workflow are referred to as the reservation , or the booking . The terms booking and reservation &#160;are interchangeable. Some agents and airlines may use the term PNR for a reservation . Because PNR is specific to GDS only, this online help uses the more generic terms reservation or booking instead. Committing the workbench at the end of the booking workflow creates a held booking : The booking is confirmed by the airline but not yet ticketed. The booking must still be ticketed in an additional workbench session, and will expire if ticketing doesn't take place within a certain time, usually within 24 hours of booking. Expiration and ticketing time limits are returned in the commit response in TermsAndConditionsFull/ExpiryDate and PaymentTimeLimit. The commit response returns all details added to date about the booking, which generally include the offer (actual air segments booked), traveler details, and reservation confirmation information. A successful booking returns a unique six-digit alphanumeric number called the reservation locator in Receipt/Confirmation/Locator. During the workbench commit, for GDS only, you can send the autoDeleteDate query parameter to ensure that even if the booking fails, a reservation shell is created to retain the traveler details and allow the booking to be completed later. See Create Reservation Shell in Case of Booking Failure below. After booking you can retrieve booking details with a Reservation Retrieve. Note that NDC bookings return two reservation locator codes, one issued by the NDC carrier and another by Travelport, called the passive PNR. See Passive Booking Record in the NDC&#160;Guide for details. While the above is the standard booking workflow, the JSON APIs also support these alternate booking workflows (see below) : Instant Pay workflow : Create the reservation and issue the ticket/s in the same workbench session. NDC&#160;only; not supported for GDS. Ticketless carriers workflow : For ticketless carriers, the booking is issued and completed in the commit step; there is no separate ticketing step. Workbench Action Summary All steps in the booking workflow take place in a workbench session, which is like a container that holds all details as they are added before sending them to the carrier all at once. To start a new booking, create a new workbench . The response returns a workbench identifier that is sent in the HTTP&#160;request of all subsequent transactions in that workbench. When the workbench is committed, the booking details become part of the reservation&#160;record and the workbench is discarded. Once a booking is made and a reservation&#160;issued, any further updates or changes to that reservation, including ticketing, generally also take place in a workbench. Because the initial booking has already been committed, this is called a post-commit workbench and is created using the reservation&#160;locator of the booking to modify. Workbench Requests List The table below lists all available actions and links to the API&#160;reference for each request, which provides endpoints and examples.&#160;These workbench actions are not sequential and would not all take place in the same session. Workbench Action Description and Notes API&#160;Reference Create an initial booking workbench Create new workbench when no booking exists. Returns an identifier for the workbench that must be sent in all subsequent calls in that session. First step in the initial booking workflow. New Workbench API&#160;Reference Create post-commit workbench Initiate a workbench for an existing booking by sending the reservation locator code in the POST&#160;request. First step for any workbench session to modify, update, or ticket an existing reservation. Post-Commit Workbench API&#160;Reference Retrieve workbench Returns all workbench details added up to the time of the retrieve. Retrieve Workbench API&#160;Reference Cancel items from workbench Cancels a reservation, or removes offers, products, etc. from a booking or a workbench.For all supported cancel options, see Cancel Offers, Products, Segments from a Booking below. Cancel Workbench Items API&#160;Reference Delete data from the workbench Deletes selected data from the workbench, such as a remark. Only specific information can be deleted. Several add/delete requests are supported in both initial and post-commit workbench. See Traveler Modify Guide and Remarks and Service&#160;Requests Guide . Commit the workbench Closes the workbench session and finalizes all transactions in workbench. Depending on the workbench, the commit may create a held booking, issue a ticket, update a reservation, or exchange a ticket. Final step in all workbench sessions. Workbench Commit API&#160;Reference Discard workbench Discards the workbench and deletes all data in it. Workbench Discard API&#160;Reference Booking Workflow Summary To create a booking, at a minimum, you must create a workbench session, add an air offer, add at least one traveler, and commit the workbench. Certain optional steps are also supported. The following table summarizes the required and optional steps. The API&#160;reference for each request provides endpoints, payloads, and examples. Step # Booking Workflow Step Description and Notes API&#160;Reference 1 Create the workbench First step in the workflow. Returns a system-generated identifier for the workbench that must be sent in subsequent requests for that workbench. New Workbench API&#160;Reference 2 or 3 Add offer Add the offer (flight details) to the workbench. Supports either a full payload request that sends all required itinerary details, or a reference payload request that references flights returned in a preceding Search response. You can add either the offer or traveler/s first. Returns a system-generated identifier for the offer that is part of the booking record and must be sent in subsequent transactions about that offer. Add multiple offers To combine multiple offers into one reservation (GDS only; not supported for NDC), called a multi-offer booking, repeat the Add Offer step as needed. You can use either the full or reference payload. While there is no specific limit on the number of offers that can be combined, a reservation cannot have more than 16 flight segments. When adding an unpriced segment An air segment without any associated fare or pricing, generally booked for availability versus cost. Shown in the UnpricedSegments object instead of the Offer object. GDS only; NDC does not use unpriced segments. to the workbench, use the Unpriced Segment API &#160;instead of Add Offer. Or, or if adding both an unpriced segment and an offer, send both Unpriced Segment and Add Offer . Add Offer Reference Payload API&#160;Reference &#160; Add Offer Full Payload API&#160;Reference 2 or 3 Add traveler Send traveler details such as name and contact information, and optional comments and service requests. You can add either the offer or traveler/s first. Returns a system-generated identifier for the traveler that is part of the reservation record and sent in subsequent transactions about that traveler, such as seat selection. Optionally, if the traveler has a personal and/or business profile in the Travelport host system, you can send the Host Profile Move request to copy traveler details into the booking instead of sending Add Traveler. GDS only; not supported for NDC. Any traveler sent without a PTC (passenger type code) value is defaulted to ADT. PTC can be sent or omitted for ADT travelers. An INF (infant) cannot be added without an ADT (adult) PTC. Only select traveler information can be modified after a traveler is added. See Traveler Modify Guide . Add Traveler API&#160;Reference Remarks &amp; Service Requests Guide optional after offer and traveler Shop and book seats Requesting seat availability and adding seats is supported in the initial booking workflow as per the Seats Guide after adding an offer and traveler. To add ancillaries or seats to a multi-offer booking , send the Ancillary Shop or Seat Map request, then send one book request for each offer, in any order. Supported in the initial booking workflow only for free seats; supported for an existing booking for ancillaries and free and paid seats. GDS only; multi-offers not supported for NDC. Seats Guide optional after offer and traveler Shop and book ancillaries Certain paid ancillaries are supported in the initial booking workflow as per the Ancillaries Guide after adding an offer and traveler. Ancillaries Guide optional after offer and traveler Add comments and service requests Certain comments/service requests can be added separately from the Add Traveler payload. Remarks &amp; Service Requests Guide optional after offer and traveler Add form of payment (FOP) Store form of payment (FOP) information with the reservation to be used subsequently in ticketing. The response returns a system-generated identifier for the FOP&#160;that is part of the reservation record and sent in subsequent Add Payment request. Adding FOP for GDS in the booking flow is optional. If sent, FOP is stored and retrieved later during ticketing . If not sent at booking, FOP&#160;is required at ticketing. Adding FOP&#160;for NDC is not supported in booking, only at ticketing or in the Instant Pay workflow . If FOP is added but payment and ticketing are not completed, the FOP is not stored and is not available for retrieval during ticketing. Ticketless carriers require FOP. The booking is issued and completed in the commit step; there is no ticketing step. Add Multiple Forms of Payment (GDS only) For GDS only, you can add up to two FOP in either the booking or ticketing workflow by sending a Form of Payment request for each FOP. At ticketing you must send a separate Add Payment request for each FOP. The additional FOP can be any supported form of payment. Multiple FOP&#160;are supported only for bookings with a single passenger. Add Form of Payment API&#160;Reference Final step Commit the workbench and create booking Final step in the booking workflow. Creates a held booking for subsequent ticketing . A successful workbench commit creates a held booking, returns a confirmation from the supplier, and returns a unique six-digit alphanumeric code for that booking, called a locator code . This locator code must be sent in any subsequent transactions for this booking. GDS bookings return a single locator code issued by Travelport. NDC bookings return two locator codes, one issued by&#160;the NDC carrier and another from Travelport. The Travelport code is called the passive locator code . For more details on NDC&#160;locator codes and an example see Passive Booking Records in the NDC Guide. The commit response is largely the same as but not identical to a Reservation Retrieve response. Not all information returned at Reservation Retrieve is part of the commit response. Commit for ticketless carriers creates a booking with the carrier. There is no ticketing step. Notes on workbench commit at end of the initial booking workflow If any pricing modifier sent in the Add Offer full payload or reference payload request does not have any fares associated with it, the commit fails and returns the error message No Fare Found . Pricing happens at the commit, not the Add Offer step. Shell Reservations for Failed Bookings At the commit for the end of the initial booking workflow, you can choose to create a shell booking in the event the booking fails either because the offer cannot be added or the fare cannot be quoted. This shell booking retains the traveler details and allows the booking to be completed later. To do so, send the autoDeleteDate query parameter at the workbench commit. See Create Shell Booking in Case of Booking Failure . Retention Segments By default, reservation details are stored for one month after all travel on the itinerary is completed. You can extend this time by setting a purge date in the autoDeleteDate query parameter at the workbench commit in the initial booking workflow. See Retention Segments . CarrierLocator Code Delay at Booking In some instances, the carrier requires additional time to return the carrier locator code, which can be an issue for agencies that require this code at the time of booking. So, if the carrier locator code is not immediately available, AirReservation makes one attempt to retrieve the reservation from the carrier. If the carrier locator code cannot be retrieved, AirReservation returns the warning : Carrier locator code not returned by carrier/provider. Please try to retrieve later and agencies must retrieve the reservation later. This can happen in any booking scenario upon commit but is most common when the booking contains an ancillary such as a wheelchair. Workbench Commit API&#160;Reference &#160; Booking Workflows Hold and Pay Workflow The following diagram shows all required and some optional steps in the typical JSON API booking workflow. This workflow follows a preceding Search request to find the flight/s to book. Ticketing happens in a subsequent workbench.You can shop for and add seats and ancillaries either during booking or ticketing, or in a separate workbench session, per the support noted in the Seats and Ancillaries guides. Sending form of payment (FOP) in the initial booking workflow is supported only for GDS. If FOP is added for NDC it is not stored and must be sent again at ticketing. The Hold and Pay workflow is also supported when adding unpriced segments, which do not require a Search or AirPrice request prior to creating the workbench. See Unpriced Segments below. Optional steps such as seats an ancillaries are not currently supported. NDC&#160;Instant Pay Workflow (book and ticket in same workbench) The Instant Pay workflow, supported only for NDC, allows you to book and ticket in the same workbench session. Booking ancillaries is not supported in the Instant Pay workflow. Book Commit Response Layout Diagram The following diagram illustrates the general structure of the Workbench Commit response, including most high-level objects. Objects returned depend on the data added in the booking workflow. Optional Actions at Commit Enable Warnings for Price or Schedule Changes, or Minimum Connect Time (MCT) (Two-step Commit) GDS&#160;only; not supported for NDC. At the end of a typical booking workflow, committing the workbench is a single-step process that results in a booking confirmation. However, certain scenarios can product unexpected results if booked immediately, such as if the price or schedule has changed. If you want to receive a warning about these changes before the booking is committed, you can enable two-step commit An optional process to return a warning at Workbench Commit in certain scenarios instead of booking. To enable two-step commit, set indicators in the Workbench Commit request to receive a warning before booking in the event of price or schedule changes, or minimum connect time violations. . When enabled, two-step commit keeps the workbench active and returns a warning in the following scenarios: if the price or schedule has changed since the offer was added if the carrier sends a minimum connect time (MCT) warning If a two-step commit is triggered, you must send an additional commit request if you want to complete the booking. Step 1: Enable two-step commit You must enable two-step commit before the errors occur. To do so, in the Workbench Commit request , you must send enableTwoStepCommitInd=true combined with one or more of the following to specify what should trigger the two-step commit: Schedule changes : To enable two-step commit and return a warning if the schedule has changed since the offer was added to the workbench, send errorWhenScheduleChangesInd=true. Default is false. Price changes : To enable two-step commit and return a warning if the price has changed since the offer was added to the workbench, send errorWhenOfferPriceChangesInd=true. Default is false. If two-step commit is not enabled and a price or schedule changes occurs, the workbench commit creates the booking even if the price or schedule has changed. The response returns a warning message about the change as part of the booking confirmation. MCT warnings : To enable two-step commit and return a warning if a carrier sends a Minimum Connect Time (MCT) warning, meaning the carrier deems there is not sufficient time for passengers to reach their connecting flight, send overrideMCTInd=false. Default is true. Note the Boolean values to trigger two-step commit for MCT are opposite of schedule/price changes. If two-step commit is not enabled and the carrier sends an MCT&#160;warning, the workbench commit overrides the warning, creates the booking, and returns the carrier MCT warning in the response. Step 2:&#160;Accept warning and book, or book with a different offer If a two-step commit is triggered, you can choose to either proceed with the booking and accept the error condition, or book a different offer. To proceed with the booking as-is, send a second Workbench Commit request as follows: Accept a price or schedule change : At second commit, send errorWhenOfferPriceChangesInd=true or errorWhenScheduleChangesInd=true (or send empty or do not send) to accept the price or schedule change and proceed with the booking. The response includes a warning that a change occurred. For price changes, Offer returns the updated price. For schedule changes, Product returns the updated flight details. OfferModify is no longer returned. Do not send errorWhenOfferPriceChangesInd or errorWhenScheduleChangesInd a second time with a value of true. Doing so discards the workbench and returns an error. Send them as false in the second commit or do not send. Override an MCT warning : At second commit, send overrideMCTInd=true (or send empty or do not send) to override the MCT&#160;message and create the booking. If you do not want to proceed with the booking under the warning condition/s, you can take any of the following actions instead: Discard the workbench and start the booking over. Send Cancel Workbench Items to remove the current offer/s from the workbench and then either: Add a different offer to the workbench with the Add Offer full or reference payload, or Commit the workbench without any offers to create a shell booking and retain traveler details. You can then search for a new offer to add to that shell booking. Examples The following example Workbench Commit request payload sends enableTwoStepCommitInd and all optional indicators about error conditions set to true. Note that for MCT, this payload would create the booking in the event of an MCT warning instead of triggering a two-step commit. Show Example first workbench commit request for two-step commit and warnings { "ReservationQueryCommitReservation": { "enableTwoStepCommitInd": true, "overrideMCTInd": true, "errorWhenScheduleChangesInd": true, "errorWhenOfferPriceChangesInd": true, } } In the example workbench commit response below, a price change has occurred since the offer was added to the workbench. The response includes a warning message and indicator for the price change, and the Offer object returns the new price and breaks down the price change: The Offer object is returned with @type&#160;OfferModify and priceUpdatedInd=true . The updated price is returned in Offer/Price/TotalPrice. The previous price is not returned. Offer/ModifyPrice returns a breakdown of the difference between the new price and the previous price. In the Base, TotalTaxes, and/or TotalPrice objects:&#160; Negative amounts indicate the new amount is less than the previous amount . Positive amounts indicate the new amount is more than the previous amount. Zero amounts (0) indicate the new amount is the same as the previous amount. Product details are unchanged, as there was no change to the flights or schedule. In this example, Result/Warning/Message returns "The Total Price has been increased from 725.0 GBP to 740.0 GBP". These and other objects identifying the changes are highlighted in yellow in the example. In this case, not only the schedule but also the carrier and flight numbers changed. Note several objects in this example were truncated [...] for brevity. Show Example first commit response when price has changed { "ReservationResponse" : { "Reservation" : { "@type" : "ReservationDetail", "id" : "reservation_1", "autoDeleteDate" : "2026-01-24", "notificationDate" : "2025-10-04", "Identifier" : { "value" : "A0656EFF-FAF4-456F-B061-0161008D7C4E", "authority" : "Travelport" }, "Offer" : [ { "@type" : "OfferModify", "id" : "offer_1", "priceUpdatedInd" : true, "Identifier" : { "value" : "A0656EFF-FAF4-456F-B061-0161008D7C4E", "authority" : "Travelport" }, "ContentSource" : "GDS", "Product" : [ { "@type" : "ProductAir", "id" : "product_1", "totalDuration" : "PT1H30M", "Identifier" : { "value" : "A0656EFF-FAF4-456F-B061-0161008D7C4E", "authority" : "Travelport" }, "Quantity" : 3, "FlightSegment" : [ { "@type" : "FlightSegment", "id" : "flightSegment_1", "sequence" : 1, "Flight" : { "@type" : "FlightDetail", "id" : "flight_1", "carrier" : "BA", "number" : "123", "equipment" : "777", "Departure" : { "@type" : "Departure", "location" : "LHR", "date" : "2025-11-24", "time" : "09:45:00-06:00" }, "Arrival" : { "@type" : "Arrival", "location" : "SIN", "date" : "2025-11-24", "time" : "14:15:00+06:00" } } } ], "PassengerFlight" : [ { "@type" : "PassengerFlight", "passengerQuantity" : 2, "passengerTypeCode" : "ADT", "FlightProduct" : [ { "@type" : "FlightProduct", "segmentSequence" : [ 2 ], "classOfService" : "Y", "cabin" : "Economy", "fareBasisCode" : "YEE1Y", "fareType" : "PublicFare", "fareTypeCode" : "ERU", "Brand" : { "@type" : "BrandID", "BrandRef" : "b111" } } ] }, { "@type" : "PassengerFlight", "passengerQuantity" : 1, "passengerTypeCode" : "CHD", "FlightProduct" : [ { "@type" : "FlightProduct", "segmentSequence" : [ 2 ], "classOfService" : "Y", "cabin" : "Economy", "fareBasisCode" : "YEE1YCH", "fareType" : "PublicFare", "fareTypeCode" : "ERU", "Brand" : { "@type" : "BrandID", "BrandRef" : "b111" } } ] } ] } ], "Price" : { "@type" : "PriceDetail", "id" : "price_1", "CurrencyCode" : { "value" : "USD", "decimalPlace" : 2 }, "Base" : 625.0, "TotalTaxes" : 115.0, "TotalPrice" : 740.0 , "PriceBreakdown" : [ { "@type" : "PriceBreakdownAir", "quantity" : 2, "requestedPassengerType" : "ADT", "Amount" : { "@type" : "Amount", "CurrencyCode" : { "value" : "GBP", "decimalPlace" : 2 }, "Base" : 250.0, "Taxes" : { "@type" : "TaxesDetail", "TotalTaxes" : 45.0, "Tax" : [ { "value" : 20.0, "taxCode" : "GB" }, { "value" : 30.0, "taxCode" : "YR" } ] } } }, { "@type" : "PriceBreakdownAir", "quantity" : 1, "requestedPassengerType" : "CHD", "Amount" : { "@type" : "Amount", "CurrencyCode" : { "value" : "GBP", "decimalPlace" : 2 }, "Base" : 125.0, "Taxes" : { "@type" : "TaxesDetail", "TotalTaxes" : 25.0, "Tax" : [ { "value" : 20.0, "taxCode" : "GB", "exemptInd" : true }, { "value" : 30.0, "taxCode" : "YR" } ] } } } ] }, "ModifyPrice" : { "@type" : "ModifyPrice", "id" : "modifyPrice_1", "CurrencyCode" : { "value" : "GBP", "decimalPlace" : 2 }, "Base" : 0.0, "TotalTaxes" : 15.0, "TotalPrice" : 15.0 }, "TermsAndConditionsFull" : [...], "Traveler" : [...], "TravelerProduct" : [...], "Receipt" : [ { "@type" : "ReceiptConfirmation", "id" : "receipt_1", "dateTime" : "2011-07-04T14:15:00+06:00", "Identifier" : { "value" : "A0656EFF-FAF4-456F-B061-0161008D7C4E", "authority" : "Travelport" }, "OfferRef" : [ "offer_1" ], "Confirmation" : { "@type" : "ConfirmationHold", "OfferStatus" : { "@type" : "OfferStatusAir", "StatusAir" : [ { "value" : "Confirmed", "flightRefs" : [ "flight_1" ], "code" : "HS" } ] } }, "SegmentSequenceList" : [ 2345, 3456, 4567 ] } ], "ReservationDisplaySequence" : { "@type" : "ReservationDisplaySequence", "DisplaySequence" : [ { "@type" : "DisplaySequence", "displaySequence" : 1, "OfferRef" : "offer_1", "ProductRef" : "product_1", "Sequence" : 1 } ] } }, "transactionId" : "6570ed7b-89fe-4334-9c78-af282a977ba6", "traceId" : "c009a53c-48f6-4084-b7b6-3043fa9fec67", "Result" : { "@type" : "Result", "status" : "Not processed", "Warning" : [ { "@type" : "WarningDetail", "Message" : ""The Total Price has been increased from 725.0 GBP to 740.0 GBP"", } ] } ] }, "Identifier" : { "value" : "A0656EFF-FAF4-456F-B061-0161008D7C4E", "authority" : "Travelport" } } } In the next example, a schedule change has occurred since the offer was added to the workbench. The response includes a warning message and indicator about the schedule change, and returns both original and updated schedule details: The Offer object is returned with @type&#160;OfferModify and scheduleChangeInd=true. The Product object returns previous and updated schedule details in two instances of Product/FlightSegment as follows: The previous flight segment is identified with sequence=1 and Flight/id=flight_1 The updated flight segment is identified with sequence=2 and Flight/id=flight_2 Unless a price change has also occurred, Offer/Price repeats the original price of the offer and Offer/ModifyPrice returns all amounts as zero (0) to indicate there is no price change. In this example, Result/Warning/Message returns "EasyJet flight 123 could not be booked. It is not available for the date requested". These and other objects identifying the changes are highlighted in yellow in the example. In this case, not only the schedule but also the carrier and flight numbers changed. Note several objects in this example were truncated [...] for brevity. Show Example first commit response when schedule has changed { "ReservationResponse": { "Reservation": { "@type": "ReservationDetail", "id": "reservation_1", "autoDeleteDate": "2026-01-24", "notificationDate": "2025-10-04", "Identifier": { "value": "A0656EFF-FAF4-456F-B061-0161008D7C4E", "authority": "Travelport" }, "Offer": [ { "@type": "OfferModify", "id": "offer_1", "scheduleChangeInd": true, "Identifier": { "value": "A0656EFF-FAF4-456F-B061-0161008D7C4E", "authority": "Travelport" }, "ContentSource": "GDS", "Product": [ { "@type": "ProductAir", "id": "product_1", "totalDuration": "PT1H30M", "Identifier": { "value": "A0656EFF-FAF4-456F-B061-0161008D7C4E", "authority": "Travelport" }, "Quantity": 3, "FlightSegment": [ { "@type": "FlightSegment", "id": "flightSegment_1", "sequence": 1, "Flight": { "@type": "FlightDetail", "id": "flight_1", "carrier": "BA", "number": "123", "equipment": "777", "Departure": { "@type": "Departure", "location": "LHR", "date": "2025-11-24", "time": "09:45:00-06:00" }, "Arrival": { "@type": "Arrival", "location": "SIN", "date": "2025-11-24", "time": "14:15:00+06:00" } } }, { "@type": "FlightSegment", "id": "flightSegment_1", "sequence": 2 , "Flight": { "@type": "FlightDetail", "id": "flight_2" , "carrier": "BA", "number": "234", "equipment": "777", "Departure": { "@type": "Departure", "location": "LHR", "date": "2025-11-24", "time": "11:45:00-06:00" }, "Arrival": { "@type": "Arrival", "location": "SIN", "date": "2025-11-24", "time": "16:15:00+06:00" } } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 2, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 2 ], "classOfService": "Y", "cabin": "Economy", "fareBasisCode": "YEE1Y", "fareType": "PublicFare", "fareTypeCode": "ERU", "Brand": { "@type": "BrandID", "BrandRef": "b111" } } ] }, { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "CHD", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 2 ], "classOfService": "Y", "cabin": "Economy", "fareBasisCode": "YEE1YCH", "fareType": "PublicFare", "fareTypeCode": "ERU", "Brand": { "@type": "BrandID", "BrandRef": "b111" } } ] } ] } ], "Price": { "@type": "PriceDetail", "id": "price_1", "CurrencyCode": { "value": "USD", "decimalPlace": 2 }, "Base": 625, "TotalTaxes": 115, "TotalPrice": 740, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 2, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "value": "GBP", "decimalPlace": 2 }, "Base": 250, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 45, "Tax": [ { "value": 20, "taxCode": "GB" }, { "value": 25, "taxCode": "YR" } ] } } }, { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "CHD", "Amount": { "@type": "Amount", "CurrencyCode": { "value": "GBP", "decimalPlace": 2 }, "Base": 125, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 25, "Tax": [ { "value": 20, "taxCode": "GB", "exemptInd": true }, { "value": 25, "taxCode": "YR" } ] } } } ] }, "ModifyPrice": { "@type": "ModifyPrice", "id": "modifyPrice_1", "CurrencyCode": { "value": "GBP", "decimalPlace": 2 }, "Base": 0, "TotalTaxes": 0, "TotalPrice": 0 }, "TermsAndConditionsFull": [...], "Traveler": [...], "TravelerProduct": [...], "Receipt": [ { "@type": "ReceiptConfirmation", "id": "receipt_1", "dateTime": "2011-07-04T14:15:00+06:00", "Identifier": { "value": "A0656EFF-FAF4-456F-B061-0161008D7C4E", "authority": "Travelport" }, "OfferRef": [ "offer_1" ], "Confirmation": { "@type": "ConfirmationHold", "Locator": { "value": "ZXG25P", "sourceContext": "Travelport", "creationDate": "2011-12-05", "lastUpdated": "2011-12-05T06:00:00Z" }, "OfferStatus": { "@type": "OfferStatusAir", "StatusAir": [ { "value": "Rejected", "flightRefs": [ "flight_1" ], "code": "UN" }, { "value": "Confirmed", "flightRefs": [ "flight_2" ], "code": "TK" } ] } } } ], "ReservationDisplaySequence": { "@type": "ReservationDisplaySequence", "DisplaySequence": [ { "@type": "DisplaySequence", "displaySequence": 1, "OfferRef": "offer_1", "ProductRef": "product_1", "Sequence": 1 }, { "@type": "DisplaySequence", "displaySequence": 2, "OfferRef": "offer_1", "ProductRef": "product_1", "Sequence": 2 } ] } }, "transactionId": "6570ed7b-89fe-4334-9c78-af282a977ba6", "traceId": "c009a53c-48f6-4084-b7b6-3043fa9fec67", "Result": { "@type": "Result", "status": "Not processed", "Error": [ { "@type": "Error", "StatusCode": 503, "Message": "EasyJet flight 123 could not be booked. It is not available for the date requested.", "ErrorSummary": [ { "value": "Value", "id": "x0", "name": "Name" } ] } ] }, "Identifier": { "value": "A0656EFF-FAF4-456F-B061-0161008D7C4E", "authority": "Travelport" } } } Create Retention Segments By default, reservation details are stored for one month after all travel on the itinerary is completed. This means you can continue to retrieve the reservation&#160;for one month after travel, at which time the reservation&#160;is purged and no longer available. You can extend this time by sending an optional workbench commit request payload with the autoDeleteDate query parameter at the end of the initial booking workflow . You can set a purge date that is up to 331 days from the date the reservation was created. Adding a purge date creates a retention segment on the reservation. The autoDeleteDate value is returned in the Reservation Retrieve, Workbench Commit, and Post-Commit Workbench responses, as shown in the example excerpt below. To update or delete the autoDeleteDate on an existing booking, send the autoDeleteDate query parameter at the end of a post-commit workbench session . Show Example Reservation Retrieve Excerpt with autoDeleteDate value { "ReservationResponse": { "@type": "ReservationResponse", "Reservation": { "@type": "Reservation", "autoDeleteDate": "2024-12-10", "ReservationDisplaySequence": { "@type": "ReservationDisplaySequence", "autoDeleteDateSequence": 4 } },... Confirm Involuntary Schedule Change When the flight schedule on an existing reservation has changed, the Reservation Retrieve response indicates the change by returning a value of either TK &#160;or UN in OfferStatus/StatusAir/code. You can send the optional workbench commit request payload with scheduleChangeAcceptedInd set to true to confirm a carrier-initiated schedule change. In this case, you do not need to first create a workbench session. For NDC, also see NDC&#160;Flight Disruption Handling below. Update or Delete Ticketing Time Limit Date GDS only; not supported for NDC. AirReservation supports an optional workbench commit request payload that adds or deletes the ticketing time limit for a booking. The ticket time limit is the last day to ticket the booking before the offer expires. Add&#160;ReceivedFrom for Deem GDS only; not supported for NDC. AirReservation supports an optional workbench commit request payload that sends a ReceivedFrom object . This allows online travel agencies (OTAs) and agents using the Deem platform to include an optional receive field at reservation creation or update. Create Shell Booking in Case of Booking Failure GDS only; not supported for NDC. In addition to a shell booking in the event of booking failure per below, a shell booking is also created if all offers are removed from a workbench with Cancel Workbench&#160;Items and the workbench is committed to retain traveler details. In this case, the shell booking is supported for GDS and NDC. You can choose to create a shell booking in the case of bookings that fail due to inability to either add the offer or quote a fare. To do so, send the autoDeleteDate query parameter at Workbench Commit at the end of the initial booking workflow . A shell booking retains traveler details and allows an agency to contact the customer offline through their call center and complete the booking as necessary, or to complete with the JSON API booking workflow. To ticket a failed booking with a reservation shell, use the following workflow: Create a post-commit workbench request, sending the locator code for the failed booking. Send an Add Offer request. If necessary, send an Add Traveler request to complete traveler details. Send an Add Form of Payment request. Send an Add Payment request. Send a Workbench Commit request with the autoDeleteDate query parameter. Optional steps such as seats , ancillaries , or remarks are also supported in the workflow above after adding the offer and traveler/s. Shell bookings support the following remarks for add and delete; use the applicable workflow in the Remarks and Service Requests Guide : Vendor remarks DOCI remarks Itinerary (associated and unassociated) remarks Notepad remarks Historical Notepad remarks Accounting remarks OSI remarks Shell bookings support add, update, and delete for any traveler details supported in the TravelerUpdateableItems request. See the Traveler Modify Guide . The following example reservation retrieve response is for a shell reservation for a failed booking.&#160;The response does not return offer details, and the Result object returns the warning NO FARES FOUND . Show Example Reservation Retrieve for reservation shell { "ReservationResponse": { "@type": "ReservationResponse", "Reservation": { "@type": "Reservation", "Identifier": { "authority": "Travelport", "value": "4459c564-a913-448b-b332-1376bd17d6f9" }, "Traveler": [ { "@type": "Traveler", "birthDate": "1999-02-22", "gender": "Male", "passengerTypeCode": "ADT", "id": "travelerRefId_1", "Identifier": { "authority": "Travelport", "value": "d168b2e9-25c6-44f9-8e15-8fc5c2ce5637" }, "PersonName": { "@type": "PersonName", "Given": "PX ADTONEMDNM MR", "Surname": "SRNMONE ADT" }, "Telephone": [ { "@type": "TelephoneDetail", "countryAccessCode": "1", "areaCityCode": "909", "phoneNumber": "212456121", "extension": "1243", "id": "telephone_1", "cityCode": "ORD", "role": "Office" } ], "Email": [ { "value": "TravelerOneOne@bmail.com" }, { "value": "TravelerTwoOne@bmail.com" } ], "CustomerLoyalty": [ { "supplier": "DL", "value": "DL2071983684" } ], "TravelDocument": [ { "@type": "TravelDocumentDetail", "docNumber": "245968", "docType": "Passport", "expireDate": "2027-02-22", "issueCountry": "IND", "birthDate": "1999-02-22", "Gender": "Male", "PersonName": { "@type": "PersonName", "Given": "PX ONE", "Middle": "MDNMONE", "Surname": "SRNMONE" } } ] }, { "@type": "Traveler", "birthDate": "1999-02-22", "gender": "Male", "passengerTypeCode": "ADT", "id": "travelerRefId_2", "Identifier": { "authority": "Travelport", "value": "ecefbfa9-f05e-4c6e-bb79-bc3c85cd4e6f" }, "PersonName": { "@type": "PersonName", "Given": "PX ADTTWOMDNM MR", "Surname": "SRNMTWO ADT" }, "Telephone": [ { "@type": "TelephoneDetail", "countryAccessCode": "1", "areaCityCode": "909", "phoneNumber": "212456122", "extension": "1243", "id": "telephone_1", "cityCode": "ORD", "role": "Office" } ], "CustomerLoyalty": [ { "supplier": "DL", "value": "DL2071983684" } ], "TravelDocument": [ { "@type": "TravelDocumentDetail", "docNumber": "245968", "docType": "Passport", "expireDate": "2027-02-22", "issueCountry": "IND", "birthDate": "1999-02-22", "Gender": "Male", "PersonName": { "@type": "PersonName", "Given": "PX TWO", "Middle": "MDNMTWO", "Surname": "SRNMTWO" } } ] } ], "Receipt": [ { "@type": "ReceiptConfirmation", "Identifier": { "authority": "Travelport", "value": "d7899efc-866b-44c5-9b78-9ca9668f32f2" }, "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "1G", "value": "2CB56Z" } } } ], "ReservationComment": [ { "@type": "ReservationComment", "commentSource": "Agency", "Comment": [ { "name": "AD", "value": "THANKS FOR BOOKING WITH US" }, { "name": "RD", "value": "Have a Nice Day" } ] } ], "PrimaryContact": [ { "@type": "PrimaryContact", "id": "primaryContact_1", "Email": { "value": "TEST@TRAVELPORT.COM" }, "TravelerIdentifier": { "Identifier": { "authority": "Travelport", "value": "d168b2e9-25c6-44f9-8e15-8fc5c2ce5637" } } }, { "@type": "PrimaryContact", "id": "primaryContact_2", "Telephone": { "@type": "Telephone", "phoneNumber": "5551212", "role": "Mobile" }, "TravelerIdentifier": { "Identifier": { "authority": "Travelport", "value": "d168b2e9-25c6-44f9-8e15-8fc5c2ce5637" } } }, { "@type": "PrimaryContact", "id": "primaryContact_3", "Email": { "value": "TEST@TRAVELPORT.COM" }, "TravelerIdentifier": { "Identifier": { "authority": "Travelport", "value": "ecefbfa9-f05e-4c6e-bb79-bc3c85cd4e6f" } } }, { "@type": "PrimaryContact", "id": "primaryContact_4", "Telephone": { "@type": "Telephone", "phoneNumber": "5551212", "role": "Mobile" }, "TravelerIdentifier": { "Identifier": { "authority": "Travelport", "value": "ecefbfa9-f05e-4c6e-bb79-bc3c85cd4e6f" } } } ] }, "Result": { "@type": "Result", "Warning": [ { "@type": "Warning", "Message": "NO FARES FOUND" } ] } } } NDC&#160;Flight Disruption Handling (Involuntary Changes) NDC only; the following flows are not applicable to GDS. Travelport has implemented a structured approach to managing a variety of flight disruptions for NDC carriers. To summarize, when an airline-initiated flight change occurs, Travelport updates the booking and routes it for processing onto agency back-end queues. The Reservation Retrieve response returns the booking with scheduleChangeInd=true to indicate the change and details of the update. You can then choose to either accept the change, rebook the itinerary, or cancel for a refund per the carrier rules for the type of disruption. With this change, manual traditional status change entries such as @1XK, @HK, and @ALL are restricted for NDC bookings. This prevents manual overrides that could break the structured communication with the airline. Instead, updates must use the JSON APIs or another Travelport+&#160;terminal program to ensure the airline receives the correct XML-based messages. Processing of OCN from NDC&#160;Carrier Behind the scenes, when an NDC airline sends an order change notification OCN, an update sent from an airline to notify Travelport of an airline-initiated change such as a schedule change, flight number change, or flight cancellation. (OCN) for a Travelport booking, Travelport updates the affected segments on the booking and routes the booking to a specific back-end queue Each Travelport PCC has a set of numbered queues. Queues provide the ability to place a booking into an area that allows you to manage, sort, and store booking files, messages from vendors, and manage workflow. Queue management distributes messages from vendors and customers to the specified queues for action. based on the type of OCN received: Q11: schedule change such as flight number change, route change, retimed, partial involuntary cancellation Q23: full involuntary cancellations, TTL (time to ticket limit) expiry, no show, voluntary cancellation, or change outside NDC channel Reservation Retrieve Response for Disrupted Booking In the JSON APIs, the Reservation Retrieve response returns an Offer object with @type OfferModify and scheduleChangeInd=true to indicate a change has occurred. The disrupted and new flight segment details are returned as follows depending on the type of disruption: When the carrier cancels and rebooks flight/s: Offer @typeOfferModify/Product/FlightSegment/Flight/id increments the new flight id by 1 from the impacted segment; e.g., Flight_01 for the impacted segment and Flight_02 for the new segment. Confirmation/OfferStatus/Status Air returns the new flight with status code TK and status value Confirmed .The impacted flight is returned with status code UN and status value Pending . The following example is for a round-trip booking that has been canceled and rebooked on different dates. The previous and rebooked flights for the first leg are returned in the first instance of Product @type ProductAir, followed by an instance with the previous and rebooked flights for the return leg. The impacted segments are Flight/id Flight_01 and Flight_03; the new segments are Flight_02 and Flight_04. Note this example excerpts only the Offer object and has truncated several objects with ellipses (...) for brevity. Show Example Reservation Retrieve response - Offer object for canceled and rebooked itinerary "Offer": [ { "@type": "OfferModify", "scheduleChangeInd": true, "id": "offer_1", "Identifier": { "authority": "QF", "value": "UUYwODFISjM1OVdBNHxQMjg3NkVDQjctNEFFNi00MEY0LUFCQ2Z6amhhcjJnMHp4d3UtMS0xfFAyODc2RUNCNy00QUU2LTQwRjQtQUJDZnpqaGFyMmcwenh3dS0xLTJ8U3RhdHVzOlVTRUQgTlRBQw==" }, "Product": [ { "@type": "ProductAir", "id": "product_1", "Identifier": { "authority": "QF", "value": "f91dd03d-f2b4-4af3-9de7-60055200fe1b" }, "FlightSegment": [ { "@type": "FlightSegment", "id": "FlightSegment_01", "sequence": 1, "Flight": { "@type": "Flight", "duration": "PT1H35M", "carrier": "QF", "number": "403", "id": " Flight_01 ", "Identifier": { "authority": "QF", "value": "7f083ca6-9af0-4003-90e9-e4493d8a2e1e" }, "Departure": { "@type": "Departure", "location": "SYD", "date": "2025-10-01", "time": "06:15:00" }, "Arrival": { "@type": "Arrival", "location": "MEL", "date": "2025-10-01", "time": "07:50:00" } } }, { "@type": "FlightSegment", "id": "FlightSegment_02", "sequence": 2, "connectionDuration": "PT49H35M", "Flight": { "@type": "Flight", "duration": "PT1H35M", "carrier": "QF", "number": "403", "id": " Flight_02 ", "Identifier": { "authority": "QF", "value": "80cd437b-ac37-408a-8084-ae2f1b264082" }, "Departure": { "@type": "Departure", "location": "SYD", "date": "2025-09-29", "time": "06:15:00" }, "Arrival": { "@type": "Arrival", "location": "MEL", "date": "2025-09-29", "time": "07:50:00" } } } ], "PassengerFlight": [ {...}, {...} ] }, { "@type": "ProductAir", "id": "product_2", "Identifier": { "authority": "QF", "value": "46b4cdbc-dae6-4a1c-9e26-4bc08ad1294d" }, "FlightSegment": [ { "@type": "FlightSegment", "id": "FlightSegment_03", "sequence": 3, "connectionDuration": "PT212H55M", "Flight": { "@type": "Flight", "duration": "PT1H25M", "carrier": "QF", "number": "400", "id": " Flight_03 ", "Identifier": { "authority": "QF", "value": "3a258976-3554-4f08-be41-0eb8c70a0675" }, "Departure": { "@type": "Departure", "location": "MEL", "date": "2025-10-08", "time": "05:45:00" }, "Arrival": { "@type": "Arrival", "location": "SYD", "date": "2025-10-08", "time": "07:10:00" } } }, { "@type": "FlightSegment", "id": "FlightSegment_04", "sequence": 4, "connectionDuration": "PT46H35M", "Flight": { "@type": "Flight", "duration": "PT1H25M", "carrier": "QF", "number": "400", "id": " Flight_04 ", "Identifier": { "authority": "QF", "value": "0b679307-a27b-4dde-88fd-01a806eee5ec" }, "Departure": { "@type": "Departure", "location": "MEL", "date": "2025-10-10", "time": "05:45:00" }, "Arrival": { "@type": "Arrival", "location": "SYD", "date": "2025-10-10", "time": "07:10:00" } } } ], "PassengerFlight": [...] } ], "Price": {...}, "TermsAndConditionsFull": [ { "@type": "TermsAndConditionsFullScheduleChange", "id": "termsAndConditions_1", "Identifier": { "authority": "Travelport", "value": "b1995cc5-be45-4c5f-9c39-4b75369bb29b" }, "ScheduleChangeOptions": [ { "@type": "ScheduleChangeOptions", "options": [ "Accept" ] }, { "@type": "ScheduleChangeOptions", "options": [ "Reshop" ], "waiverCodeRequiredInd": true }, { "@type": "ScheduleChangeOptions", "options": [ "Refund" ] } ] }, { "@type": "TermsAndConditionsFullAir", "ExpiryDate": "2025-06-03T23:59:00Z", "TextBlock": [...], "BaggageAllowance": [...], "FareRuleInfo": [...], "Penalties": [...] } ] } ], The following example is an excerpt of the receipt confirmation in the same response, returning the status codes for all four flight segments. Show Example Reservation Retrieve response - Receipt object { "@type": "ReceiptConfirmation", "Identifier": { "authority": "Travelport", "value": "383a3c09-7205-4dd9-8e20-c97be37ba09c" }, "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "1G", "creationDate": "2025-06-03", "value": "BXQLQC" }, "OfferStatus": { "@type": "OfferStatusAir", "StatusAir": [ { "flightRefs": [ "Flight_02", "Flight_04" ], "code": "TK", "value": "Confirmed" }, { "flightRefs": [ "Flight_01", "Flight_03" ], "code": "UN", "value": "Pending" } ] } } } When the carrier changes the time of flight/s: Offer @typeOfferModify/Product/FlightSegment/Flight returns only the updated segment/s. Confirmation/OfferStatus/Status Air returns the updated flight/s with status code TK and status value Confirmed . When the carrier fully cancels flight/s: Offer @typeOfferModify/Product/FlightSegment/Flight/id returns the impacted segment/s. There are no new segments to return. Confirmation/OfferStatus/Status Air returns the impacted segment/s with status code HX and status value Cancelled . In addition, the Result/Warning object returns details or a description of the change in each scenario. The available follow-up actions are returned in the same instance of Offer @typeOfferModify in TermsAndConditionsFull with @type TermsAndConditionsFullStatusChange. One or more instances of ScheduleChangeOptions is returned with one of the following values in the options object: Accept Reshop (also returns waiverCodeRequiredInd=true if a waiver code is required to rebook) Refund For involuntary full cancellation, accept and refund are typically returned. For either a flight time change or cancel and rebook, all three options are typically returned. Follow-up Action Workflows You can choose to either accept the change, rebook the itinerary, or cancel for a refund per the carrier rules for the type of disruption. All follow-up actions below are subject to carrier rules; not all NDC&#160;carriers support all actions. The message returned in Result/Warning typically provides additional details. For detailed NDC&#160;support by carrier, see the Knowledge Base article NDC capabilities by airline through JSON API (see Knowledge Base NDC&#160;Resources if you need login assistance). Accept Changes: To accept the changes shown in the Reservation Retrieve response, send the workbench commit request payload with the scheduleChangeAcceptedInd indicator set to true. In this case, you do not need to first create a workbench session. Rebook: To rebook the itinerary, follow the standard NDC exchange workflow. The following links go to the API&#160;Reference for each step. See NDC Workflow to Exchange Tickets in the Exchange, Refund, and Void Guide if you need details: Post-Commit Workbench Reshop Reprice Form of Payment (may be optional or required depending on carrier rules) Payment (may be optional or required depending on carrier rules) Modify Refund: To cancel the itinerary and receive a refund, follow the standard NDC refund workflow. The following links go to the API&#160;Reference for each step. See Workflow to Refund Ticket in the Exchange, Refund, and Void Guide if you need details: Post-Commit Workbench Refund Quote Cancel Passive Segments AirReservation 25.11.58 and later. Supported only on ODM version 11.22 and higher. Supported for AK, BK, and YK segment statuses. GDS only; not supported for NDC. The JSON APIs support using the booking process to add an air segment booked outside the Travelport GDS, called a passive segment , to a booking. This allows that booking to include complete travel details. That segment can also then be ticketed with the JSON APIs. To book a passive segment, follow the standard booking workflow and send the Add Offer full payload request with the following two objects in ProductCriteriaAir: SpecificFlightCriteria/passiveSegmentStatus SupplierLocator The following examples are for a booking consisting solely of a passive segment. The first example shows the Add Offer full payload request. It sends passiveSegmentStatus set to AK, and the carrier's code and locator in the SupplierLocator object. The next example shows the workbench commit response returning full reservation details. Note the response returns two instances of Receipt @typeReceiptConfirmation; each instance returns a locator code, one for the Travelport locator code (B7RVBF) and another for the passive locator code sent in Add Offer (WTR84G). Show Example Add Offer request for passive segment { "OfferQueryBuildFromProducts": { "lowFareFinderInd": true, "returnBrandedFaresInd": true, "BuildFromProductsRequest": { "@type": "BuildFromProductsRequestAir", "PricingModifiersAir": { "@type": "PricingModifiersAirDetail" }, "PassengerCriteria": [ { "@type": "PassengerCriteria", "number": 1, "passengerTypeCode": "ADT" }, { "@type": "PassengerCriteria", "number": 1, "passengerTypeCode": "CHD" } ], "ProductCriteriaAir": [ { "sequence": 0, "SpecificFlightCriteria": [ { "flightNumber": "1814", "carrier": "KL", "departureDate": "2025-04-26", "departureTime": "07:00:00", "arrivalDate": "2025-04-26", "arrivalTime": "08:05:00", "from": "FRA", "to": "AMS", "classOfService": "T", "cabin": "Economy", "segmentSequence": 1, "passiveSegmentStatus": "AK" } ], "SupplierLocator": { "value": "WTR84G", "supplierCode": "KL" } } ] } } } Show Example commit response for booking with passive segment { "ReservationResponse": { "@type": "ReservationResponse", "Reservation": { "@type": "Reservation", "Offer": [ { "@type": "Offer", "id": "offer_1", "Identifier": { "authority": "Travelport", "value": "aefea4f4-e8a1-465c-96c6-df1a47e53667" }, "ContentSource": "GDS", "Product": [ { "@type": "ProductAir", "id": "product_1", "FlightSegment": [ { "@type": "FlightSegment", "id": "FlightSegment_01", "sequence": 1, "Flight": { "@type": "Flight", "duration": "PT1H5M", "carrier": "KL", "number": "1814", "operatingCarrierName": "KLM CITYHOPPER", "equipment": "E90", "id": "Flight_01", "Departure": { "@type": "Departure", "location": "FRA", "date": "2025-04-26", "time": "07:00:00" }, "Arrival": { "@type": "Arrival", "location": "AMS", "date": "2025-04-26", "time": "08:05:00" } } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 1 ], "classOfService": "T", "cabin": "Economy" } ] }, { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "CHD", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 1 ], "classOfService": "T", "cabin": "Economy" } ] } ] } ], "Price": { "@type": "PriceDetail", "id": "PriceDetail_1", "CurrencyCode": { "value": "AUD" }, "Base": 375, "TotalTaxes": 291.4, "TotalFees": 0, "TotalPrice": 666.4, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "currencySource": "Charged", "approximateInd": true, "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 208, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 145.7, "Tax": [ { "currencyCode": "AUD", "taxCode": "DE", "value": 19.8 }, { "currencyCode": "AUD", "taxCode": "OY", "value": 25.9 }, { "currencyCode": "AUD", "taxCode": "RA", "value": 57.6 }, { "currencyCode": "AUD", "taxCode": "YQ", "value": 39.9 }, { "currencyCode": "AUD", "taxCode": "YR", "value": 2.5 } ] }, "Total": 353.7 }, "FiledAmount": { "currencyCode": "EUR", "decimalPlace": 2, "value": 125 } }, { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "CHD", "Amount": { "@type": "Amount", "currencySource": "Charged", "approximateInd": true, "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 167, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 145.7, "Tax": [ { "currencyCode": "AUD", "taxCode": "DE", "value": 19.8 }, { "currencyCode": "AUD", "taxCode": "OY", "value": 25.9 }, { "currencyCode": "AUD", "taxCode": "RA", "value": 57.6 }, { "currencyCode": "AUD", "taxCode": "YQ", "value": 39.9 }, { "currencyCode": "AUD", "taxCode": "YR", "value": 2.5 } ] }, "Total": 312.7 }, "FiledAmount": { "currencyCode": "EUR", "decimalPlace": 2, "value": 100 } } ] }, "TermsAndConditionsFull": [ { "@type": "TermsAndConditionsFullAir", "Identifier": { "authority": "Travelport", "value": "23ae1cd0-e7f7-4320-8133-ae5896846d23" } }, { "@type": "TermsAndConditionsFullAir", "ExpiryDate": "2025-04-26T23:59:00Z", "PaymentTimeLimit": "2025-04-26T23:59:00Z" } ] } ], "Traveler": [ { "@type": "Traveler", "birthDate": "1997-04-01", "gender": "Male", "passengerTypeCode": "ADT", "id": "travelerRefId_1", "Identifier": { "authority": "Travelport", "value": "bfe1de07-41f0-464d-9dcd-b22500c31add" }, "PersonName": { "@type": "PersonName", "Given": "PX ADTTWO MDNM MR", "Surname": "SRNMONE" }, "Telephone": [ { "@type": "TelephoneDetail", "countryAccessCode": "1", "areaCityCode": "909", "phoneNumber": "212456121", "extension": "1243", "id": "telephone_1", "cityCode": "ORD", "role": "Office" } ], "Email": [ { "emailType": "TO", "value": "ADTTravelerOneOne@notmail.com" }, { "emailType": "TO", "value": "TravelerOneOne@notmail.com" } ], "TravelDocument": [ { "@type": "TravelDocumentDetail", "birthDate": "1997-04-01", "Gender": "Male", "PersonName": { "@type": "PersonName", "Given": "PX ADTTWO MDNM MR", "Surname": "SRNMONE" } }, { "@type": "TravelDocumentDetail", "docNumber": "238419", "docType": "Passport", "expireDate": "2027-02-22", "issueCountry": "US", "birthDate": "1997-04-01", "Gender": "Male", "PersonName": { "@type": "PersonName", "Given": "PX ADTTWO", "Middle": "MDNM ONE", "Surname": "SRNMONE" } } ] }, { "@type": "Traveler", "birthDate": "2014-04-01", "gender": "Male", "passengerTypeCode": "CHD", "id": "travelerRefId_2", "Identifier": { "authority": "Travelport", "value": "65462143-159e-46b8-8ad7-2677a9dddc8f" }, "PersonName": { "@type": "PersonName", "Given": "PX CHDTWO MDNM MR", "Surname": "SRNMONE CHD" }, "Telephone": [ { "@type": "TelephoneDetail", "countryAccessCode": "1", "areaCityCode": "909", "phoneNumber": "212456121", "extension": "1243", "id": "telephone_1", "cityCode": "ORD", "role": "Office" } ], "TravelDocument": [ { "@type": "TravelDocumentDetail", "birthDate": "2014-04-01", "Gender": "Male", "PersonName": { "@type": "PersonName", "Given": "PX CHDTWO MDNM MR", "Surname": "SRNMONE CHD" } }, { "@type": "TravelDocumentDetail", "docNumber": "170272", "docType": "Passport", "expireDate": "2027-02-22", "issueCountry": "US", "birthDate": "2014-04-01", "Gender": "Male", "PersonName": { "@type": "PersonName", "Given": "PX CHDTWO", "Middle": "MDNM ONE", "Surname": "SRNMONE" } } ], "Comments": { "@type": "Comments", "Comment": [ { "id": "comment_1", "value": "P-CHD DOB01APR14" } ] } } ], "Receipt": [ { "@type": "ReceiptConfirmation", "Identifier": { "authority": "Travelport", "value": "8ba18882-d962-432c-86cf-a0cb96881f62" }, "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "1G", "creationDate": "2025-04-01", "value": "B7RVBF" }, "OfferStatus": { "@type": "OfferStatusAir", "StatusAir": [ { "flightRefs": [ "Flight_01" ], "code": "AK", "value": "Confirmed" } ] } } }, { "@type": "ReceiptConfirmation", "Identifier": { "authority": "Travelport", "value": "9382e776-2416-4670-9b8e-855fbf3c970c" }, "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "KL", "value": "WTR84G" } } } ], "PrimaryContact": [ { "@type": "PrimaryContact", "shareWith": "Supplier", "shareWithSupplier": [ "YY" ], "id": "primaryContact_1", "Telephone": { "@type": "Telephone", "countryAccessCode": "1", "areaCityCode": "303", "phoneNumber": "LOWEST FARE CUSTOMER SVCE 800 340 0575 AGENCY CONTACT SHARED WITH THE CARRIER", "extension": "1234", "cityCode": "DEN", "role": "Work" } }, { "@type": "PrimaryContact", "shareWith": "Supplier", "shareWithSupplier": [ "YY" ], "id": "primaryContact_2", "Telephone": { "@type": "Telephone", "countryAccessCode": "1", "areaCityCode": "303", "phoneNumber": "LOWEST FARE CUSTOMER SVCE 800 340 0575 AGENCY CONTACT SHARED WITH THE CARRIER", "extension": "1234", "cityCode": "DEN", "role": "Work" } } ], "ReservationDisplaySequence": { "@type": "ReservationDisplaySequence", "DisplaySequence": [ { "@type": "DisplaySequence", "displaySequence": 1, "OfferRef": "offer_1", "ProductRef": "product_1", "Sequence": 1 } ] } } } Unpriced Segments and AutoPrice/Manual Fares GDS only; NDC does not use unpriced segments, filed fares, or manual fares. An unpriced segment is an air segment without any associated fare or pricing, It is generally booked for availability versus cost. Across the JSON APIs unpriced content is sent and returned in UnpricedSegments object instead of the Offer object, which by definition includes fare and pricing details. An unpriced segment can be added to a workbench and booked, or added to an existing reservation, using the Unpriced Segment API in either the booking or post-booking workflow instead of the Add Offer API. Unpriced Segment is a full payload request that sends all flight details, does not include any pricing information, and does not require a preceding Search or&#160;AirPrice request. Supported for segment statuses NN, BK, AK, YK. Adding seats and/or ancillaries is not currently supported for unpriced segments. To add both an unpriced segment and an offer to the booking, you can send both Unpriced Segment and Add Offer in the same workbench session. An unpriced segment can also be created by removing the filed fare The specific price and all associated rules for a ticket, published by the airline to the ATPCO centralized system and then distributed to GDSs. Once an airline prices a flight and a passenger books it, that specific fare and its rules are stored as a filed fare in the booking system and becomes the contractual basis for the ticket. from an offer using the Cancel Workbench Items API . This removes the pricing details from the offer but leaves the segment details in the booking intact, creating an unpriced segment. Unpriced content can include GDS air segments. Any Arrival Unknown (ARNK) segment is returned as an unpriced segment. The JSON APIs support two options for pricing unpriced segments. Both use the AutoPrice/Manual Fare API , which provides separate payloads to price in either of the following ways:&#160; auto-price one or more unpriced segments build a manual fare A custom or specially negotiated price that isn’t a standard system-generated fare. Travel agents or consolidators use manual fares for unique itineraries such as complex international tickets, group travel, re-routing after disruptions, or when a standard fare isn't found. Agents must manually combine segments and ensure that all rules and conditions are met. for one or more unpriced segments using fare and pricing details from the airline or another source Each scenario uses its own request payload. Both payloads support pricing one or multiple segments for one or multiple passengers on a booking and are supported in the booking workflows as follows: Auto pricing an unpriced segment is supported in either the booking or post-booking workflow. Manual fare build for an unpriced segment is supported only in the post-booking workflow (held booking only). If you add an unpriced segment to the workbench, you must commit that workbench and create a new post-commit workbench before using the Manual Fare request. The following objects are returned for unpriced segment/s in the Reservation Retrieve, Workbench Commit, and Workbench Retrieve responses: Reservation returns UnpricedSegments with details of the unpriced segment. TravelerProduct returns UnpricedFlightSegmentRefs to list unpriced segment/s for that traveler. Receipt/Confirmation returns UnpricedSegmentsStatus with the status of the air segment. ReservationDisplaySequence returns UnpricedSegmentDisplaySequence to indicate the sequence of the unpriced segment. The following functionality is supported for unpriced segments; see the linked JSON APIs for each item: Cancel unpriced segments ( Cancel Workbench Items API ) Cancel a price from an offer (aka, cancel a filed fare), creating an unpriced segment ( Cancel Workbench Items API ) Book one or more unpriced segments or add unpriced segments to an existing reservation ( Unpriced Segments API ) Auto-price multiple or all air segments per passenger ( AutoPrice/Manual Fare API ) Build a manual fare for an unpriced segment ( AutoPrice/Manual Fare API ) Exchanges with unpriced segments are not supported. Remove Offers, Products, Segments, or Filed Fares from a Booking (Cancel Workbench Items) The Cancel Workbench Items API supports several options for canceling GDS and NDC air offers, hotel segments, and car content during either the initial booking workflow or from a held booking. Supported options vary for the initial booking workbench from those supported for a held booking. Cancel Workbench Items cannot be used after a booking is ticketed. In the initial booking workbench (i.e., when creating a booking), Cancel Workbench Items supports canceling the following: Cancel entire reservation, including all GDS and NDC air, hotel, and car offers Cancel all offers In the Search APIs, an offer is a product available at a specific price under a set of terms and conditions. An offer includes the flight or connecting flights for one leg of the itinerary, plus a service level that includes the cabin class and any fare codes that may apply. At booking, the selected offer from the Search response - including the flight/s, service level, price, terms and conditions, and brand if applicable - is converted into a single Offer object that is subsequently returned for that booking. in the workbench from all sources Cancel a specific offer in the workbench (NDC only) In the post-commit workbench (i.e., for a held booking), Cancel Workbench Items does not support changes for NDC bookings. Instead, modify an NDC&#160;held booking with the NDC Modify API . Cancel Workbench Items is supported for the following in the post-commit workbench: Cancel entire booking, including hotel, car, and GDS air content and any unpriced segments, and discard traveler data. Cancel all offers on the booking, including hotel, car, and GDS air offers and any unpriced segments; retains all other information in the booking including passenger details. Cancel one or multiple hotel, car, or GDS air offers or unpriced segments on the booking Cancel one or multiple products In the APIs, a product is the term used in the model for one leg of the itinerary. It includes the flight or connecting flights between one origin and destination pair; e.g., LON &gt; EWR. Product information also includes a service level of the cabin class and any applicable fare codes. within a GDS air offer (hotel and car do not have products) Cancel one or multiple segments A flight or flights under one flight number. One flight equals one segment. A segment could have multiple flights if the flight number remains the same, which happens if a flight makes a stop without changing planes. within a product in a GDS air offer (hotel and car do not have products or segments) Cancel all or only specific unpriced segments An air segment without any associated fare or pricing, generally booked for availability versus cost. Shown in the UnpricedSegments object instead of the Offer object. GDS only; NDC does not use unpriced segments. Cancel any combination of offers and unpriced segments Cancel the filed fare on an offer, which removes the price from the offer and converts it to an unpriced segment. After commit, you can add a fare with the AutoPrice/Manual Fare API . A workbench retrieve before Cancel Workbench is recommended to sync all data. Cancel Workbench Items must always be followed by a Workbench Commit to commit the changes. If all offers were removed, a shell booking A shell booking contains only traveler details and no offers. Created if all offers are removed from a booking with Cancel Workbench Items and the workbench is committed with only traveler details, or if a booking fails at commit and the autoDeleteDate query parameter was included in the commit request (see the Booking Guide). is created to retain traveler details, and you can search for new offers to add to that booking. Multi-offer Bookings GDS only; not supported for NDC. AirReservation supports multiple offers on the same booking. This allows you to, for example, book two one-way offers together instead of a single round-trip offer. To combine multiple offers into one reservation, repeat the Add Offer request in the initial booking workbench as needed (see the Booking Workflow Summary ). You can use either the full or reference payload. While there is no specific limit on the number of offers that can be combined, a reservation cannot have more than 16 flight segments. Multi-offer bookings support seats and ancillaries, and can be exchanged . Multi-Content Bookings (Air, Hotel, Car) Reservation Retrieve and Post-Commit Workbench return air, hotel, and/or car segments for any reservation that includes that content, called a multi-content booking . All segments must have been booked with the JSON Air APIs, JSON Hotel APIs , JSON Car APIs (release pending), or a Travelport+ terminal program. You can add either GDS or&#160;NDC air offers to a hotel and/or car booking, but not both. See the Multi-content Booking Guide (Air, Hotel, Car) for workflows and examples. Expired Bookings An air offer is valid only for a set length of time before it either must be ticketed or will expire. Several APIs, including AirPrice and Reservation Retrieve for a held booking, return TermsAndConditionsFull/ExpiryDate with the date and time the offer will expire. If the offer on a held booking is not ticketed by the ExpiryDate and expires, you can renew that booking with a new offer so that traveler and itinerary details do not have to be re-created: For GDS, use Add Offer to add an offer to a booking when the current offer has expired. Start with a post-commit workbench request, add the new offer with either the full payload or reference payload Add Offer request, and commit the workbench. For NDC, use Standalone Reprice to reprice the itinerary on a booking after the price guarantee expires. It must be followed by a Modify request to commit the workbench and either ticket or hold the itinerary. If you want to ticket at Modify, and the NDC carrier supports ticketing in the same workbench, send Form of Payment and Payment before Modify. Travel Agency Details The JSON Travel Agency APIs allow you to add, modify, and delete the travel agency corporate ID and/or address of a travel agency for the booking in the current workbench, either in the initial booking workbench or for an existing reservation in a post-commit workbench. Use any of the following APIs as needed: Travel Agency Details : Add an agency corporate ID, email address, email, or telephone for the booking in the current workbench. Travel Agency Corporate ID : Add, update, or delete the agency corporate code for the booking. Travel Agency Address : Add, update, or delete the agency address for the booking. Travel Agency Email : Add, update, or delete the agency email address for the booking. Travel Agency Telephone : Add, update, or delete the agency telephone number for the booking. Custom Booking Rules The JSON &#160;Custom Rules APIs allow you to manage and use the custom rules set up for your PCC (pseudo city code, a travel provider's identification code provisioned from Travelport). Custom rules are created in a booking file management tool to validate bookings against specific criteria. They could be organization rules, corporate rules, business rules, personal rules, and so on. For example, a custom rule could provide a check for certain non-mandatory data, such as that every booking must contain a delivery address, or that&#160;an after hours contact number must be sent to the airline as an OSI remark. Or, a rule could check for items needed for back office systems such as a name remark. Custom rules are not created in the JSON APIs but can be applied to bookings in the JSON &#160;APIs. You can add up to three custom rules to a booking. If custom rules are configured for your PCC at Travelport, when the workbench is committed at the end of the booking workflow, the booking is compared to the conditions in any custom rules added to that booking. If any conditions are not met, an error message is returned and the changes in the workbench are not committed. The workbench session is maintained so that the conditions required by the attached rule can be corrected in the booking. Note the following: When adding a rule to a booking, that rule must already have been created and associated with your PCC. Otherwise, the error message&#160; INVALID&#160;-&#160;RULE&#160;{NAME}&#160;DOES&#160;NOT&#160;EXIST&#160;-&#160;CustomRule is returned. The exception is that you can send a rule name created for a PCC with which your PCC has an agreement. If your PCC does not have an agreement with that PCC, the error message NO&#160;AGREEMENT&#160;EXISTS&#160;FOR&#160;PSEUDO&#160;CITY&#160;-&#160;{PCC}&#160;-&#160;CustomRule is returned. You must send a separate request for each rule to add. You can add up to three custom rules to a booking. If additional rules are sent, the error message INVALID&#160;-&#160;THREE&#160;RULES&#160;ALREADY&#160;ATTACHED&#160;-&#160;CustomRule is returned. If you send a rule name that has already been attached to the booking, the error message RULE&#160;{NAME}&#160;ALREADY&#160;ATTACHED&#160;-&#160;CustomRule is returned. The following APIs allow you to use custom rules with bookings made in the JSON &#160;APIs. See the linked API&#160;references for details: Custom Rule : Add or delete a custom rule on a booking. Sent in a workbench session. Custom Rule List :&#160;Return a list of all custom rules associated with a PCC. Standalone request that can be sent as part of a workbench or without a workbench. Custom Rule Details :&#160;Return details of a specific custom rule associated with a PCC. Standalone request that can be sent as part of a workbench or without a workbench. To return the rules associated with a specific booking, send a reservation retrieve with detail view requested.

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
 "ReservationQueryCommitReservation": {
  "enableTwoStepCommitInd": true,
  "overrideMCTInd": true,
  "errorWhenScheduleChangesInd": true,
  "errorWhenOfferPriceChangesInd": true,
 }
}
```

### Block 2

```
{
  "ReservationResponse" : {
    "Reservation" : {
      "@type" : "ReservationDetail",
      "id" : "reservation_1",
      "autoDeleteDate" : "2026-01-24",
      "notificationDate" : "2025-10-04",
      "Identifier" : {
        "value" : "A0656EFF-FAF4-456F-B061-0161008D7C4E",
        "authority" : "Travelport"
      },
      "Offer" : [ {
        "@type" : "OfferModify",
        "id" : "offer_1",
        "priceUpdatedInd" : true,
        "Identifier" : {
          "value" : "A0656EFF-FAF4-456F-B061-0161008D7C4E",
          "authority" : "Travelport"
        },
        "ContentSource" : "GDS",
        "Product" : [ {
          "@type" : "ProductAir",
          "id" : "product_1",
          "totalDuration" : "PT1H30M",
          "Identifier" : {
            "value" : "A0656EFF-FAF4-456F-B061-0161008D7C4E",
            "authority" : "Travelport"
          },
          "Quantity" : 3,
          "FlightSegment" : [ {
            "@type" : "FlightSegment",
            "id" : "flightSegment_1",
            "sequence" : 1,
            "Flight" : {
              "@type" : "FlightDetail",
              "id" : "flight_1",
              "carrier" : "BA",
              "number" : "123",
              "equipment" : "777",
              "Departure" : {
                "@type" : "Departure",
                "location" : "LHR",
                "date" : "2025-11-24",
                "time" : "09:45:00-06:00"
              },
              "Arrival" : {
                "@type" : "Arrival",
                "location" : "SIN",
                "date" : "2025-11-24",
                "time" : "14:15:00+06:00"
              }
            }
          } ],
          "PassengerFlight" : [ {
            "@type" : "PassengerFlight",
            "passengerQuantity" : 2,
            "passengerTypeCode" : "ADT",
            "FlightProduct" : [ {
              "@type" : "FlightProduct",
              "segmentSequence" : [ 2 ],
              "classOfService" : "Y",
              "cabin" : "Economy",
              "fareBasisCode" : "YEE1Y",
              "fareType" : "PublicFare",
              "fareTypeCode" : "ERU",
              "Brand" : {
                "@type" : "BrandID",
                "BrandRef" : "b111"
              }
            } ]
          },
          {
            "@type" : "PassengerFlight",
            "passengerQuantity" : 1,
            "passengerTypeCode" : "CHD",
            "FlightProduct" : [ {
              "@type" : "FlightProduct",
              "segmentSequence" : [ 2 ],
              "classOfService" : "Y",
              "cabin" : "Economy",
              "fareBasisCode" : "YEE1YCH",
              "fareType" : "PublicFare",
              "fareTypeCode" : "ERU",
              "Brand" : {
                "@type" : "BrandID",
                "BrandRef" : "b111"
              }
            } ]
          } ]
        } ],
        "Price" : {
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
              "Taxes" : {
                "@type" : "TaxesDetail",
                "TotalTaxes" : 45.0,
                "Tax" : [ {
                  "value" : 20.0,
                  "taxCode" : "GB"
                }, 
                {
                  "value" : 30.0,
                  "taxCode" : "YR"
                } ]
              }
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
              "Taxes" : {
                "@type" : "TaxesDetail",
                "TotalTaxes" : 25.0,
                "Tax" : [ {
                  "value" : 20.0,
                  "taxCode" : "GB",
                  "exemptInd" : true
                }, 
                {
                  "value" : 30.0,
                  "taxCode" : "YR"
                } ]
              }
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
        },       
        "TermsAndConditionsFull" : [...],
      "Traveler" : [...],
      "TravelerProduct" : [...],
      "Receipt" : [ {
        "@type" : "ReceiptConfirmation",
        "id" : "receipt_1",
        "dateTime" : "2011-07-04T14:15:00+06:00",
        "Identifier" : {
          "value" : "A0656EFF-FAF4-456F-B061-0161008D7C4E",
          "authority" : "Travelport"
        },
        "OfferRef" : [ "offer_1" ],
        "Confirmation" : {
          "@type" : "ConfirmationHold",
          "OfferStatus" : {
            "@type" : "OfferStatusAir",
            "StatusAir" : [ {
              "value" : "Confirmed",
              "flightRefs" : [ "flight_1" ],
              "code" : "HS"
            } ]
          }
        },
        "SegmentSequenceList" : [ 2345, 3456, 4567 ]
      } ],
      "ReservationDisplaySequence" : {
        "@type" : "ReservationDisplaySequence",
        "DisplaySequence" : [ {
          "@type" : "DisplaySequence",
          "displaySequence" : 1,
          "OfferRef" : "offer_1",
          "ProductRef" : "product_1",
          "Sequence" : 1
        } ]
      }
    },
    "transactionId" : "6570ed7b-89fe-4334-9c78-af282a977ba6",
    "traceId" : "c009a53c-48f6-4084-b7b6-3043fa9fec67",
    "Result" : {
      "@type" : "Result",
      "status" : "Not processed",
      "Warning" : [ {
        "@type" : "WarningDetail",
        "Message" : ""The Total Price has been increased from 725.0 GBP to 740.0 GBP"",
        } ]
      } ]
    },
    "Identifier" : {
      "value" : "A0656EFF-FAF4-456F-B061-0161008D7C4E",
      "authority" : "Travelport"
    }
  }
}
```

### Block 3

```
{
 "ReservationResponse": {
  "Reservation": {
   "@type": "ReservationDetail",
   "id": "reservation_1",
   "autoDeleteDate": "2026-01-24",
   "notificationDate": "2025-10-04",
   "Identifier": {
    "value": "A0656EFF-FAF4-456F-B061-0161008D7C4E",
    "authority": "Travelport"
   },
   "Offer": [
    {
     "@type": "OfferModify",
     "id": "offer_1",
     "scheduleChangeInd": true,
     "Identifier": {
      "value": "A0656EFF-FAF4-456F-B061-0161008D7C4E",
      "authority": "Travelport"
     },
     "ContentSource": "GDS",
     "Product": [
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
       "PassengerFlight": [
        {
         "@type": "PassengerFlight",
         "passengerQuantity": 2,
         "passengerTypeCode": "ADT",
         "FlightProduct": [
          {
           "@type": "FlightProduct",
           "segmentSequence": [
            2
           ],
           "classOfService": "Y",
           "cabin": "Economy",
           "fareBasisCode": "YEE1Y",
           "fareType": "PublicFare",
           "fareTypeCode": "ERU",
           "Brand": {
            "@type": "BrandID",
            "BrandRef": "b111"
           }
          }
         ]
        },
        {
         "@type": "PassengerFlight",
         "passengerQuantity": 1,
         "passengerTypeCode": "CHD",
         "FlightProduct": [
          {
           "@type": "FlightProduct",
           "segmentSequence": [
            2
           ],
           "classOfService": "Y",
           "cabin": "Economy",
           "fareBasisCode": "YEE1YCH",
           "fareType": "PublicFare",
           "fareTypeCode": "ERU",
           "Brand": {
            "@type": "BrandID",
            "BrandRef": "b111"
           }
          }
         ]
        }
       ]
      }
     ],
     "Price": {
      "@type": "PriceDetail",
      "id": "price_1",
      "CurrencyCode": {
       "value": "USD",
       "decimalPlace": 2
      },
      "Base": 625,
      "TotalTaxes": 115,
      "TotalPrice": 740,
      "PriceBreakdown": [
       {
        "@type": "PriceBreakdownAir",
        "quantity": 2,
        "requestedPassengerType": "ADT",
        "Amount": {
         "@type": "Amount",
         "CurrencyCode": {
          "value": "GBP",
          "decimalPlace": 2
         },
         "Base": 250,
         "Taxes": {
          "@type": "TaxesDetail",
          "TotalTaxes": 45,
          "Tax": [
           {
            "value": 20,
            "taxCode": "GB"
           },
           {
            "value": 25,
            "taxCode": "YR"
           }
          ]
         }
        }
       },
       {
        "@type": "PriceBreakdownAir",
        "quantity": 1,
        "requestedPassengerType": "CHD",
        "Amount": {
         "@type": "Amount",
         "CurrencyCode": {
          "value": "GBP",
          "decimalPlace": 2
         },
         "Base": 125,
         "Taxes": {
          "@type": "TaxesDetail",
          "TotalTaxes": 25,
          "Tax": [
           {
            "value": 20,
            "taxCode": "GB",
            "exemptInd": true
           },
           {
            "value": 25,
            "taxCode": "YR"
           }
          ]
         }
        }
       }
      ]
     },
     "ModifyPrice": {
      "@type": "ModifyPrice",
      "id": "modifyPrice_1",
      "CurrencyCode": {
       "value": "GBP",
       "decimalPlace": 2
      },
      "Base": 0,
      "TotalTaxes": 0,
      "TotalPrice": 0
     },
     "TermsAndConditionsFull": [...],
   "Traveler": [...],
   "TravelerProduct": [...],
   "Receipt": [
    {
     "@type": "ReceiptConfirmation",
     "id": "receipt_1",
     "dateTime": "2011-07-04T14:15:00+06:00",
     "Identifier": {
      "value": "A0656EFF-FAF4-456F-B061-0161008D7C4E",
      "authority": "Travelport"
     },
     "OfferRef": [
      "offer_1"
     ],
     "Confirmation": {
      "@type": "ConfirmationHold",
      "Locator": {
       "value": "ZXG25P",
       "sourceContext": "Travelport",
       "creationDate": "2011-12-05",
       "lastUpdated": "2011-12-05T06:00:00Z"
      },
      "OfferStatus": {
       "@type": "OfferStatusAir",
       "StatusAir": [
        {
         "value": "Rejected",
         "flightRefs": [
          "flight_1"
         ],
         "code": "UN"
        },
        {
         "value": "Confirmed",
         "flightRefs": [
          "flight_2"
         ],
         "code": "TK"
        }
       ]
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
     },
     {
      "@type": "DisplaySequence",
      "displaySequence": 2,
      "OfferRef": "offer_1",
      "ProductRef": "product_1",
      "Sequence": 2
     }
    ]
   }
  },
  "transactionId": "6570ed7b-89fe-4334-9c78-af282a977ba6",
  "traceId": "c009a53c-48f6-4084-b7b6-3043fa9fec67",
  "Result": {
   "@type": "Result",
   "status": "Not processed",
   "Error": [
    {
     "@type": "Error",
     "StatusCode": 503,
     "Message": "EasyJet flight 123 could not be booked. It is not available for the date requested.",
     "ErrorSummary": [
      {
       "value": "Value",
       "id": "x0",
       "name": "Name"
      }
     ]
    }
   ]
  },
  "Identifier": {
   "value": "A0656EFF-FAF4-456F-B061-0161008D7C4E",
   "authority": "Travelport"
  }
 }
}
```

### Block 4

```
{
              "ReservationResponse": {

                             "@type": "ReservationResponse",
                             "Reservation": {
                                           "@type": "Reservation",
                                           "autoDeleteDate": "2024-12-10",
                                           "ReservationDisplaySequence": {
                                                          "@type": "ReservationDisplaySequence",
                                                          "autoDeleteDateSequence": 4
                                           }
                             },...
```

### Block 5

```
{
 "ReservationResponse": {
  "@type": "ReservationResponse",
  "Reservation": {
   "@type": "Reservation",
   "Identifier": {
    "authority": "Travelport",
    "value": "4459c564-a913-448b-b332-1376bd17d6f9"
   },
   "Traveler": [
    {
     "@type": "Traveler",
     "birthDate": "1999-02-22",
     "gender": "Male",
     "passengerTypeCode": "ADT",
     "id": "travelerRefId_1",
     "Identifier": {
      "authority": "Travelport",
      "value": "d168b2e9-25c6-44f9-8e15-8fc5c2ce5637"
     },
     "PersonName": {
      "@type": "PersonName",
      "Given": "PX ADTONEMDNM MR",
      "Surname": "SRNMONE ADT"
     },
     "Telephone": [
      {
       "@type": "TelephoneDetail",
       "countryAccessCode": "1",
       "areaCityCode": "909",
       "phoneNumber": "212456121",
       "extension": "1243",
       "id": "telephone_1",
       "cityCode": "ORD",
       "role": "Office"
      }
     ],
     "Email": [
      {
       "value": "TravelerOneOne@bmail.com"
      },
      {
       "value": "TravelerTwoOne@bmail.com"
      }
     ],
     "CustomerLoyalty": [
      {
       "supplier": "DL",
       "value": "DL2071983684"
      }
     ],
     "TravelDocument": [
      {
       "@type": "TravelDocumentDetail",
       "docNumber": "245968",
       "docType": "Passport",
       "expireDate": "2027-02-22",
       "issueCountry": "IND",
       "birthDate": "1999-02-22",
       "Gender": "Male",
       "PersonName": {
        "@type": "PersonName",
        "Given": "PX ONE",
        "Middle": "MDNMONE",
        "Surname": "SRNMONE"
       }
      }
     ]
    },
    {
     "@type": "Traveler",
     "birthDate": "1999-02-22",
     "gender": "Male",
     "passengerTypeCode": "ADT",
     "id": "travelerRefId_2",
     "Identifier": {
      "authority": "Travelport",
      "value": "ecefbfa9-f05e-4c6e-bb79-bc3c85cd4e6f"
     },
     "PersonName": {
      "@type": "PersonName",
      "Given": "PX ADTTWOMDNM MR",
      "Surname": "SRNMTWO ADT"
     },
     "Telephone": [
      {
       "@type": "TelephoneDetail",
       "countryAccessCode": "1",
       "areaCityCode": "909",
       "phoneNumber": "212456122",
       "extension": "1243",
       "id": "telephone_1",
       "cityCode": "ORD",
       "role": "Office"
      }
     ],
     "CustomerLoyalty": [
      {
       "supplier": "DL",
       "value": "DL2071983684"
      }
     ],
     "TravelDocument": [
      {
       "@type": "TravelDocumentDetail",
       "docNumber": "245968",
       "docType": "Passport",
       "expireDate": "2027-02-22",
       "issueCountry": "IND",
       "birthDate": "1999-02-22",
       "Gender": "Male",
       "PersonName": {
        "@type": "PersonName",
        "Given": "PX TWO",
        "Middle": "MDNMTWO",
        "Surname": "SRNMTWO"
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
      "value": "d7899efc-866b-44c5-9b78-9ca9668f32f2"
     },
     "Confirmation": {
      "@type": "ConfirmationHold",
      "Locator": {
       "source": "1G",
       "value": "2CB56Z"
      }
     }
    }
   ],
   "ReservationComment": [
    {
     "@type": "ReservationComment",
     "commentSource": "Agency",
     "Comment": [
      {
       "name": "AD",
       "value": "THANKS FOR BOOKING WITH US"
      },
      {
       "name": "RD",
       "value": "Have a Nice Day"
      }
     ]
    }
   ],
   "PrimaryContact": [
    {
     "@type": "PrimaryContact",
     "id": "primaryContact_1",
     "Email": {
      "value": "TEST@TRAVELPORT.COM"
     },
     "TravelerIdentifier": {
      "Identifier": {
       "authority": "Travelport",
       "value": "d168b2e9-25c6-44f9-8e15-8fc5c2ce5637"
      }
     }
    },
    {
     "@type": "PrimaryContact",
     "id": "primaryContact_2",
     "Telephone": {
      "@type": "Telephone",
      "phoneNumber": "5551212",
      "role": "Mobile"
     },
     "TravelerIdentifier": {
      "Identifier": {
       "authority": "Travelport",
       "value": "d168b2e9-25c6-44f9-8e15-8fc5c2ce5637"
      }
     }
    },
    {
     "@type": "PrimaryContact",
     "id": "primaryContact_3",
     "Email": {
      "value": "TEST@TRAVELPORT.COM"
     },
     "TravelerIdentifier": {
      "Identifier": {
       "authority": "Travelport",
       "value": "ecefbfa9-f05e-4c6e-bb79-bc3c85cd4e6f"
      }
     }
    },
    {
     "@type": "PrimaryContact",
     "id": "primaryContact_4",
     "Telephone": {
      "@type": "Telephone",
      "phoneNumber": "5551212",
      "role": "Mobile"
     },
     "TravelerIdentifier": {
      "Identifier": {
       "authority": "Travelport",
       "value": "ecefbfa9-f05e-4c6e-bb79-bc3c85cd4e6f"
      }
     }
    }
   ]
  },
  "Result": {
   "@type": "Result",
   "Warning": [
    {
     "@type": "Warning",
     "Message": "NO FARES FOUND"
    }
   ]
  }
 }
}
```

### Block 6

```
"Offer": [
                {
                    "@type": "OfferModify",
                    "scheduleChangeInd": true,
                    "id": "offer_1",
                    "Identifier": {
                        "authority": "QF",
                        "value": "UUYwODFISjM1OVdBNHxQMjg3NkVDQjctNEFFNi00MEY0LUFCQ2Z6amhhcjJnMHp4d3UtMS0xfFAyODc2RUNCNy00QUU2LTQwRjQtQUJDZnpqaGFyMmcwenh3dS0xLTJ8U3RhdHVzOlVTRUQgTlRBQw=="
                    },
                    "Product": [
                        {
                            "@type": "ProductAir",
                            "id": "product_1",
                            "Identifier": {
                                "authority": "QF",
                                "value": "f91dd03d-f2b4-4af3-9de7-60055200fe1b"
                            },
                            "FlightSegment": [
                                {
                                    "@type": "FlightSegment",
                                    "id": "FlightSegment_01",
                                    "sequence": 1,
                                    "Flight": {
                                        "@type": "Flight",
                                        "duration": "PT1H35M",
                                        "carrier": "QF",
                                        "number": "403",
                                        "id": "Flight_01",
                                        "Identifier": {
                                            "authority": "QF",
                                            "value": "7f083ca6-9af0-4003-90e9-e4493d8a2e1e"
                                        },
                                        "Departure": {
                                            "@type": "Departure",
                                            "location": "SYD",
                                            "date": "2025-10-01",
                                            "time": "06:15:00"
                                        },
                                        "Arrival": {
                                            "@type": "Arrival",
                                            "location": "MEL",
                                            "date": "2025-10-01",
                                            "time": "07:50:00"
                                        }
                                    }
                                },
                                {
                                    "@type": "FlightSegment",
                                    "id": "FlightSegment_02",
                                    "sequence": 2,
                                    "connectionDuration": "PT49H35M",
                                    "Flight": {
                                        "@type": "Flight",
                                        "duration": "PT1H35M",
                                        "carrier": "QF",
                                        "number": "403",
                                        "id": "Flight_02",
                                        "Identifier": {
                                            "authority": "QF",
                                            "value": "80cd437b-ac37-408a-8084-ae2f1b264082"
                                        },
                                        "Departure": {
                                            "@type": "Departure",
                                            "location": "SYD",
                                            "date": "2025-09-29",
                                            "time": "06:15:00"
                                        },
                                        "Arrival": {
                                            "@type": "Arrival",
                                            "location": "MEL",
                                            "date": "2025-09-29",
                                            "time": "07:50:00"
                                        }
                                    }
                                }
                            ],
                            "PassengerFlight": [
                                {...},
                                {...}
                            ]
                        },
                        {
                            "@type": "ProductAir",
                            "id": "product_2",
                            "Identifier": {
                                "authority": "QF",
                                "value": "46b4cdbc-dae6-4a1c-9e26-4bc08ad1294d"
                            },
                            "FlightSegment": [
                                {
                                    "@type": "FlightSegment",
                                    "id": "FlightSegment_03",
                                    "sequence": 3,
                                    "connectionDuration": "PT212H55M",
                                    "Flight": {
                                        "@type": "Flight",
                                        "duration": "PT1H25M",
                                        "carrier": "QF",
                                        "number": "400",
                                        "id": "Flight_03",
                                        "Identifier": {
                                            "authority": "QF",
                                            "value": "3a258976-3554-4f08-be41-0eb8c70a0675"
                                        },
                                        "Departure": {
                                            "@type": "Departure",
                                            "location": "MEL",
                                            "date": "2025-10-08",
                                            "time": "05:45:00"
                                        },
                                        "Arrival": {
                                            "@type": "Arrival",
                                            "location": "SYD",
                                            "date": "2025-10-08",
                                            "time": "07:10:00"
                                        }
                                    }
                                },
                                {
                                    "@type": "FlightSegment",
                                    "id": "FlightSegment_04",
                                    "sequence": 4,
                                    "connectionDuration": "PT46H35M",
                                    "Flight": {
                                        "@type": "Flight",
                                        "duration": "PT1H25M",
                                        "carrier": "QF",
                                        "number": "400",
                                        "id": "Flight_04",
                                        "Identifier": {
                                            "authority": "QF",
                                            "value": "0b679307-a27b-4dde-88fd-01a806eee5ec"
                                        },
                                        "Departure": {
                                            "@type": "Departure",
                                            "location": "MEL",
                                            "date": "2025-10-10",
                                            "time": "05:45:00"
                                        },
                                        "Arrival": {
                                            "@type": "Arrival",
                                            "location": "SYD",
                                            "date": "2025-10-10",
                                 
…
```

### Block 7

```
{
                    "@type": "ReceiptConfirmation",
                    "Identifier": {
                        "authority": "Travelport",
                        "value": "383a3c09-7205-4dd9-8e20-c97be37ba09c"
                    },
                    "Confirmation": {
                        "@type": "ConfirmationHold",
                        "Locator": {
                            "source": "1G",
                            "creationDate": "2025-06-03",
                            "value": "BXQLQC"
                        },
                        "OfferStatus": {
                            "@type": "OfferStatusAir",
                            "StatusAir": [
                                {
                                    "flightRefs": [
                                        "Flight_02",
                                        "Flight_04"
                                    ],
                                    "code": "TK",
                                    "value": "Confirmed"
                                },
                                {
                                    "flightRefs": [
                                        "Flight_01",
                                        "Flight_03"
                                    ],
                                    "code": "UN",
                                    "value": "Pending"
                                }
                            ]
                        }
                    }
                }
```

### Block 8

```
{
 "OfferQueryBuildFromProducts": {
  "lowFareFinderInd": true,
  "returnBrandedFaresInd": true,
  "BuildFromProductsRequest": {
   "@type": "BuildFromProductsRequestAir",
   "PricingModifiersAir": {
    "@type": "PricingModifiersAirDetail"
   },
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
   "ProductCriteriaAir": [
    {
     "sequence": 0,
     "SpecificFlightCriteria": [
      {
       "flightNumber": "1814",
       "carrier": "KL",
       "departureDate": "2025-04-26",
       "departureTime": "07:00:00",
       "arrivalDate": "2025-04-26",
       "arrivalTime": "08:05:00",
       "from": "FRA",
       "to": "AMS",
       "classOfService": "T",
       "cabin": "Economy",
       "segmentSequence": 1,
       "passiveSegmentStatus": "AK"
      }
     ],
     "SupplierLocator": {
      "value": "WTR84G",
      "supplierCode": "KL"
     }
    }
   ]
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
                "Offer": [
                    {
                        "@type": "Offer",
                        "id": "offer_1",
                        "Identifier": {
                            "authority": "Travelport",
                            "value": "aefea4f4-e8a1-465c-96c6-df1a47e53667"
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
                                            "duration": "PT1H5M",
                                            "carrier": "KL",
                                            "number": "1814",
                                            "operatingCarrierName": "KLM CITYHOPPER",
                                            "equipment": "E90",
                                            "id": "Flight_01",
                                            "Departure": {
                                                "@type": "Departure",
                                                "location": "FRA",
                                                "date": "2025-04-26",
                                                "time": "07:00:00"
                                            },
                                            "Arrival": {
                                                "@type": "Arrival",
                                                "location": "AMS",
                                                "date": "2025-04-26",
                                                "time": "08:05:00"
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
                                                "classOfService": "T",
                                                "cabin": "Economy"
                                            }
                                        ]
                                    },
                                    {
                                        "@type": "PassengerFlight",
                                        "passengerQuantity": 1,
                                        "passengerTypeCode": "CHD",
                                        "FlightProduct": [
                                            {
                                                "@type": "FlightProduct",
                                                "segmentSequence": [
                                                    1
                                                ],
                                                "classOfService": "T",
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
                            "Base": 375,
                            "TotalTaxes": 291.4,
                            "TotalFees": 0,
                            "TotalPrice": 666.4,
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
                                        "Base": 208,
                                        "Taxes": {
                                            "@type": "TaxesDetail",
                                            "TotalTaxes": 145.7,
                                            "Tax": [
                                                {
                                                    "currencyCode": "AUD",
                                                    "taxCode": "DE",
                                                    "value": 19.8
                                                },
                                                {
                                                    "currencyCode": "AUD",
                                                    "taxCode": "OY",
                                                    "value": 25.9
                                                },
                                                {
                                                    "currencyCode": "AUD",
                                                    "taxCode": "RA",
                                                    "value": 57.6
                                                },
                                                {
                                                    "currencyCode": "AUD",
                                                    "taxCode": "YQ",
                                                    "value": 39.9
                                                },
                                                {
                                                    "currencyCode": "AUD",
                                                    "taxCode": "YR",
                                                    "value": 2.5
                                                }
                                            ]
                                        },
                                        "Total": 353.7
                                    },
                                    "FiledAmount": {
                                        "currencyCode": "EUR",
                                        "decimalPlace": 2,
                                        "value": 125
                                    }
                                },
                                {
                                    "@type": "PriceBreakdownAir",
                                   
…
```

