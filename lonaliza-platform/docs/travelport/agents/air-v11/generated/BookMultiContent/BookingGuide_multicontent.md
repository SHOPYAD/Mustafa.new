# Multi-Content Booking Guide (Air, Hotel, Car)

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/BookMultiContent/BookingGuide_multicontent.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Multi-Content Booking Guide (Air, Hotel, Car) Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Multi-Content Booking Guide (Air, Hotel, Car) The JSON APIs support creating, retrieving, and managing multi-content bookings, which include air, hotel, and/or car segments on a single reservation. Related Content: Air Booking Guide , Reservation Retrieve Guide , Reservation Retrieve API&#160;Reference In this topic: Basic Concepts Adding Air to Hotel and Car Bookings Air, Hotel, and Car Content in Responses Response Structure Supported Content Combinations for Reservation Retrieve ReservationDisplaySequence Values to Indicate Sequence Car Details in Responses Hotel Details in Responses Example Responses NDC Air with Passive Hotel and Car GDS&#160;Air with Active Hotel and Car Basic Concepts Multi-content bookings include a mix of air and/or hotel and/or car segments on a single reservation. By default, the Reservation Retrieve and Post-Commit Workbench responses return all air, hotel, or car segments for any booking that includes this content. All segments must have been booked with the JSON Air , Hotel , or Car APIs (full release pending), or from another Travelport+ product. You can add either GDS or NDC air segments to a booking that already has hotel and/or car content, but not both GDS and NDC. The JSON Air Reservation Retrieve API can retrieve non-air bookings that have been made with the JSON APIs or a terminal program. If you retrieve a booking that has no air content, you cannot use the JSON Air APIs to modify or otherwise interact with that booking except to cancel it. Instead, use the JSON Hotel APIs to modify hotel segments or another application as appropriate. Adding Air to Hotel and Car Bookings Use the following workflows for GDS&#160;and NDC to add an air itinerary to a reservation that has an air and/or car booking. Remarks and optional services are not supported in the flows below. You cannot add form of payment or send payment when adding an air offer to an existing hotel and/or car booking. After adding the offer and holding the booking, you can then ticket all offers or only specific offers as needed. In the ticketing workbench, be sure to specify all applicable offer identifiers in both the Add Form of Payment and Add Payment requests. Add GDS Air to Hotel and/or Car Booking Use this workflow to add a GDS air offer to an existing hotel and/or car booking: Create a post-commit workbench using the record locator for a booking that already has a hotel and/or car booking. Search for flights for the outbound/departure leg of the itinerary. Optionally, confirm pricing for a selected air offer for the first leg. Add offer to workbench. Search for flights for the inbound/return leg of the itinerary. Optionally, confirm pricing for a selected air offer. Add offer to workbench. Add optional form of payment details, seats, and/or ancillaries. Workbench Commit . Add NDC Air to Hotel and/or Car Booking Use this workflow to add an NDC air offer to an existing hotel and/or car booking: Create a post-commit workbench using the record locator for a booking that already has a hotel and/or car booking. Add any required traveler details to the booking using the TravelerUpdateableItems and Traveler Update requests. Although requirements vary by carrier, typically you must at a minimum add the following traveler details in TravelerUpdatableItemTravelDocument: traveler name, birthdate, and gender (supported values are Male , Female , and Unknown ). Workbench Commit . Create a post-commit workbench using the same record locator. Add the NDC air offer to the workbench. Workbench Commit . Air, Hotel, and Car Content in Responses Response Structure The Reservation Retrieve and Post-Commit Workbench responses return multiple offers as applicable, one each for air, car, and hotel. Air offers are returned as multiple offers if they were booked from multiple offers. Content is returned in separate instances of Offer as follows: Air segments are returned with an Offer/Product type of ProductAir . Hotel segments are returned with an Offer/Product type of ProductHospitality . Car segments are returned with an Offer/Product type of ProductVehicle . The Offer object for each content type returns details in the Product, Price, and TermsAndConditions objects. Additional booking details may be returned in these objects: Traveler: Traveler details. FormOfPayment and Payment: Applicable only to air segments; not returned for Hotel and Car. Receipt: Confirmation statuses and numbers are returned in individual instances of Receipt with OfferStatus type OfferStatusHospitality for hotel, OfferStatusVehicle for car, and OfferStatusAir for air; see the example excerpt below. ReservationComment: Any comments on the booking. ReservationDisplaySequence identifies the sequence of each segment. Show Example Receipt Excerpt The following example shows the Receipt object, which includes confirmation numbers and statuses for air, hotel, and car segments. See Examples for the full response. "Receipt": [ { "@type": "ReceiptConfirmation", "OfferRef": [ "Offer_1" ], "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "QF", "sourceContext": "VendorLocator", "value": "57CZUC" } } }, { "@type": "ReceiptConfirmation", "OfferRef": [ "Offer_1" ], "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "QF", "sourceContext": "OrderId", "value": "QF081HLDSTTA7" } } }, { "@type": "ReceiptPayment", "dateTime": "2023-06-02T21:13:00Z", "OfferRef": [ "Offer_1" ], "PaymentIdentifier": { "PaymentRef": "payment_1" }, "Document": [ { "@type": "DocumentTicket", "Number": "08157451145222", "TravelerIdentifierRef": { "value": "trav_1" }, "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Total": 1147.2 } } ] }, { "@type": "ReceiptConfirmation", "Identifier": { "authority": "Travelport", "value": "84953ee8-5081-4904-9968-764342d284cf" }, "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "1G", "value": "4411L5" }, "OfferStatus": { "@type": "OfferStatusAir", "StatusAir": [ { "flightRefs": [ "Flight_01", "Flight_03" ], "code": "ZK", "value": "Pending" } ] } } }, { "@type": "ReceiptConfirmation", "OfferRef": [ "offer_2" ], "Confirmation": { "@type": "ConfirmationHold", "Locator": { "locatorType": "CONFIRMATION_NUMBER", "source": "RT", "sourceContext": "SUPPLIER", "value": "HOTEL1234" }, "OfferStatus": { "@type": "OfferStatusHospitality", "Status": "Confirmed" } } }, { "@type": "ReceiptConfirmation", "OfferRef": [ "offer_3" ], "Confirmation": { "@type": "ConfirmationHold", "Locator": { "locatorType": "Confirmation Number", "source": "ZI", "sourceContext": "Supplier", "value": "CAR12345" }, "OfferStatus": { "@type": "OfferStatusVehicle", "Status": "Confirmed" } } } ], Supported Content Combinations for Reservation Retrieve Reservation Retrieve can retrieve reservations that have any of the following combination of products: GDS Air NDC Air Car Hotel GDS Air + Car GDS Air + Hotel GDS Air + Car + Hotel NDC Air + Car NDC Air + Hotel NDC Air + Car + Hotel Car + Hotel ReservationDisplaySequence Values to Indicate Sequence The Reservation Retrieve and Post-Commit Workbench responses return segments in the order of air, hotel, and then car regardless of the actual dates of these segments. To ensure accurately representing a traveler itinerary, refer to the following values in the ReservationDisplaySequence/DisplaySequence object. Each individual product is returned in its own instance of DisplaySequence. Each instance of DisplaySequence includes the following objects and details: displaySequence: A unique segment number. OfferRef: The offer id assigned to that segment. ProductRef: The product number. Note that each leg of an air itinerary is returned as a separate product under the same offer while car and hotel segments are each returned as a single product. In addition, air segments return Sequence, which is the flight sequence number in the itinerary. In the following example excerpt, the instances of DisplaySequence with displaySequence values 1 and 3 are the air segments, displaySequence 2 is the hotel segment, and displaySequence 4 is the car segment.&#160;However, you would need to refer to the full response to discern which instances are air, hotel, and car; see the examples later in this topic for the full response. Show Example DisplaySequence excerpt ... "ReservationDisplaySequence": { "@type": "ReservationDisplaySequence", "DisplaySequence": [ { "@type": "DisplaySequence", "displaySequence": 1, "OfferRef": "Offer_1", "ProductRef": "product_1", "Sequence": 1 }, { "@type": "DisplaySequence", "displaySequence": 2, "OfferRef": "offer_2", "ProductRef": "product_1" }, { "@type": "DisplaySequence", "displaySequence": 3, "OfferRef": "Offer_1", "ProductRef": "product_2", "Sequence": 3 }, { "@type": "DisplaySequence", "displaySequence": 4, "OfferRef": "offer_3", "ProductRef": "product_1" } ] }... Car Content in the Response A car reservation can include either active or passive car segments: Active segments are booked directly in the JSON APIs or a terminal program and have segment status HK Passive segments are bookings created through consolidators and have a segment status BK or MK All Car Segments The following details are returned in the Reservation Retrieve and Post-Commit Workbench responses for all car segments, both active and passive: Identifier with system-generated value and authority Travelport Quantity (number of cars booked) Vehicle detail with code ECAR and Code Context (ACRISS) and explanation for each letter of that code, per the current Car Support page Vehicle date and location details: Rental pick-up date, time, location number, location name, and code (city/airport) Rental return (drop-off) date, time, location number, location name, and code (city/airport) Product Ancillary Vehicle having Equipment Type Code Value Price details: Currency code (codeAuthority always returns the currency of the hotel location country, which may be different than the PCC currency) Decimal place (e.g., when decimal place is 2, an amount is returned in the format 85.55) Price breakdown: Vehicle Price: Rate Guarantee Indicator Rate Distance – allowance (value), distance units (Kilometers/Miles/Unlimited), rate period (day/weekly/weekend/month) Approximate Rate: Base rate code (currency where the vehicle is booked, which might be different than the PCC currency) Base rate value Drop off charge if applicable Extra Mileage Charge if applicable Extra Hour Charge if applicable Extra Day Charge if applicable Estimated Total Amount Rate Qualifier: Guarantee/Prepay as applicable, no payment details (card/cash, etc.) Vehicle charges such as mandatory charges along with currency and value Terms and conditions with rate code information Traveler details Receipt 1G Locator Receipt confirmation: Locator type; also used as confirmation number Source as vendor code Source context as Supplier Value as the car/supplier confirmation number Offer Status as Confirmed/Pending/Rejected as applicable If no filed fare is present for air in the reservation, the warning "NO FARES FOUND" is displayed Note the following for all car segments: Responses return the offer number for car after any hotel and air segments. For example, if car is booked for 11 Jun, air is booked for 15 Jun, and hotel is booked for 11-14 Jun, the car offer number is returned last. Refer to the ReservationDisplaySequence value to ensure accuracy. Currently a defect exists that returns duplicate itinerary comments in the retrieve response when a booking has NDC air segments along with hotel and/or car segments. Active Car Segments The following additional information is returned only for active car segments: Product Ancillary Vehicle having Equipment Type Code Value Price details: Currency code (codeAuthority always returns the currency of the hotel location country, which may be different than the PCC currency) Decimal place (e.g., when decimal place is 2, an amount is returned in the format 85.55) Price breakdown: Vehicle Price: Rate Guarantee Indicator Drop off charge if applicable Extra Mileage Charge if applicable Extra Hour Charge if applicable Extra Day Charge if applicable Estimated Total Amount Rate Qualifier: Guarantee/Prepay as applicable, no payment details (card/cash, etc.) Vehicle charges such as mandatory charges along with currency and value Terms and conditions with rate code information Passive Car Segments The following additional information is returned only for passive car segments: Any reservation comments added at booking Note the following for passive car segments: Trailing zeros are truncated; e.g., 85.50 is returned as 85.5 Offer status does not return status code; e.g., HK/MK/BK is not returned Approximate Total Amount, extra charges, and terms and conditions are not returned Hotel Details in Responses A hotel reservation can include either active or passive segments: Active segments are booked directly in the JSON APIs or a terminal program and have segment status HK Passive segments are bookings created through consolidators and have a segment status BK or MK All Hotel Segments The following details are returned in the the Reservation Retrieve and Post-Commit Workbench responses for all hotel segments, both active and passive: Booking code (reference code number) Number of guests (default is 1) Property Name Identifier with system-generated value and authority identifying the source of the content Quantity (number of rooms booked) Chain code Property code Date range: Start/Check-in date End/Check-out date Price details: Currency code (returns the currency of the hotel location country, which may be different than the PCC currency) Decimal place (e.g., decimal place of 2 returns amounts in format 85.55 ) Total Price (approx. total rate for the booking) Price Breakdown Approximate Indicator ("approximateInd": true) Nights (number of nights for the booking) Traveler details ReceiptConfirmation under Receipt, including: 1G locator/PNR Locator type, serves as confirmation number Source with chain code Source context as SUPPLIER Value with the hotel/supplier confirmation number Offer Status - returns status as Confirmed/Pending but not the segment confirmation code Reservation comment if any If any air segments on the booking do not have a filed fare, the warning NO FARES FOUND is returned Note the following for all hotel segments: Trailing zeros are truncated; for example, an amount of 85.50 is returned as 85.5 Offer status does not return the status code (e.g,, HK/MK/BK) Guest number is always returned as 1 Responses return the offer number for hotel segments after any air segments. For example, if car is booked for 11 Jun, air is booked for 15 Jun, and hotel is booked for 11-14 Jun, the hotel offer number is returned second. Refer to the ReservationDisplaySequence value to ensure accuracy. Any deposit or guarantee is not returned Payment details are not returned Active Hotel Segments The following additional details are returned for active hotel segments: Booking code (reference code number) Property Name Quantity (number of rooms booked) Price details: Base (approx. nightly rate) Passive Hotel Segments The following additional details are returned for passive hotel segments; some of this data duplicates data returned in the Price object: Price Breakdown Room pricing type: Per stay (default) Currency code (returns the currency of the hotel location country, which may be different than the PCC currency) Decimal place Total: (approximate rate quoted per night) Note the following for passive hotel segments: Because terminal bookings do not support nightly rate or approximate total price, price details return the rate quoted per night even though room pricing type is returned as per stay . Example Responses In the following examples: Active segments are booked directly in the JSON APIs or a terminal program and have segment status HK Passive segments are bookings created through consolidators and have segment status BK or MK NDC Air with Passive Hotel and Car The following is a Reservation Retrieve response for a booking with an NDC round-trip flight and passive hotel and car reservations. For brevity, the air TermsAndConditions text and several instances of ReservationComment have been deleted. Show Example Response for NDC&#160;flight with hotel and car content { "ReservationResponse": { "@type": "ReservationResponse", "Reservation": { "@type": "Reservation", "Identifier": { "authority": "Travelport", "value": "877ceaa9-3742-40f0-aadd-f8325b1fc904" }, "Offer": [ { "@type": "Offer", "id": "Offer_1", "Identifier": { "authority": "QF", "value": "UUYwODFITERTVFRBN3xQRTJBNEE0NjUtMjA2Qi00MEMzLTkzNjRzcXJxbTJ0dG40aTViLTEtMQ==" }, "Product": [ { "@type": "ProductAir", "totalDuration": "PT1H35M", "id": "product_1", "Identifier": { "authority": "QF", "value": "5cfe8aa3-db35-4994-8385-80f5ff534346" }, "FlightSegment": [ { "@type": "FlightSegment", "id": "s1", "sequence": 1, "Flight": { "@type": "Flight", "distance": 438, "stops": 0, "duration": "PT1H35M", "carrier": "QF", "number": "409", "equipment": "73H", "id": "Flight_01", "Identifier": { "authority": "QF", "value": "3320bb55-d8fb-4eb5-a3d7-ba4ca4c5edd3" }, "Departure": { "@type": "DepartureDetail", "terminal": "3", "location": "SYD", "date": "2023-08-19", "time": "07:00:00" }, "Arrival": { "@type": "ArrivalDetail", "terminal": "1", "location": "MEL", "date": "2023-08-19", "time": "08:35:00" } } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 1 ], "classOfService": "H", "cabin": "Economy", "fareBasisCode": "HFQA", "fareType": "PublicFare", "Brand": { "@type": "Brand", "name": "Economy Flex" } } ] } ] }, { "@type": "ProductAir", "totalDuration": "PT1H25M", "id": "product_2", "Identifier": { "authority": "QF", "value": "f8365ff0-7149-444c-8222-54e8afdc7e5b" }, "FlightSegment": [ { "@type": "FlightSegment", "id": "s2", "sequence": 3, "Flight": { "@type": "Flight", "distance": 438, "stops": 0, "duration": "PT1H25M", "carrier": "QF", "number": "402", "equipment": "73H", "id": "Flight_02", "Identifier": { "authority": "QF", "value": "0afd730c-d589-4010-ad57-6d250bffd6e3" }, "Departure": { "@type": "DepartureDetail", "terminal": "1", "location": "MEL", "date": "2023-08-24", "time": "06:00:00" }, "Arrival": { "@type": "ArrivalDetail", "terminal": "3", "location": "SYD", "date": "2023-08-24", "time": "07:25:00" } } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 3 ], "classOfService": "L", "cabin": "Economy", "fareBasisCode": "LDQA", "fareType": "PublicFare", "Brand": { "@type": "Brand", "name": "Economy Flex" } } ] } ] } ], "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 999.53, "TotalTaxes": 147.67, "TotalPrice": 1147.2, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 999.53, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 147.67, "Tax": [ { "taxCode": "QR", "description": "PASSENGER SERVICE CHARGE DOMESTIC DEPARTURE", "value": 15.19 }, { "taxCode": "QR", "description": "PASSENGER SERVICE CHARGE DOMESTIC ARRIVAL", "value": 15.19 }, { "taxCode": "UO", "description": "GOODS AND SERVICES TAX GST", "value": 38.6 }, { "taxCode": "UO", "description": "GOODS AND SERVICES TAX GST", "value": 61.35 }, { "taxCode": "UO", "description": "GOODS AND SERVICES TAX GST", "value": 4.34 }, { "taxCode": "WG", "description": "SAFETY AND SECURITY CHARGE DEPARTURE", "value": 13 } ] }, "Total": 1147.2 } } ] }, "TermsAndConditionsFull": [ {...omitted for brevity...}, { "@type": "Offer", "id": "offer_2", "Identifier": { "authority": "Travelport", "value": "21981655-8966-4c6e-8218-58fac8d0f53f" }, "Product": [ { "@type": "ProductHospitality", "guests": 1, "id": "product_1", "Identifier": { "authority": "Travelport", "value": "5ad3fbf0-b93e-4147-8144-9d58627da813" }, "PropertyKey": { "@type": "PropertyKey", "chainCode": "RT" }, "DateRange": { "start": "2023-08-19", "end": "2023-08-23" } } ], "Price": { "@type": "PriceDetail", "CurrencyCode": { "codeAuthority": "AUD", "decimalPlace": 2 }, "TotalPrice": 187.2, "PriceBreakdown": [ { "@type": "PriceBreakdownHospitality", "roomPricingType": "Per stay", "Amount": { "@type": "Amount", "approximateInd": true, "CurrencyCode": { "codeAuthority": "AUD", "decimalPlace": 2 }, "Total": 187.2 }, "NightlyRate": [ { "@type": "NightlyRate", "nights": 4 } ] } ] } }, { "@type": "Offer", "id": "offer_3", "Identifier": { "authority": "Travelport", "value": "fb5d0fd1-e356-4b96-ace0-3f98cdc767b6" }, "Product": [ { "@type": "ProductVehicle", "id": "product_1", "Identifier": { "authority": "Travelport", "value": "8dc1ebff-3cc7-4e34-8aa4-f1328e1072d6" }, "Quantity": 1, "Vehicle": { "@type": "VehicleDetail", "doorCount": "2-door or 4-door", "airConditioningInd": true, "VehicleMakeModel": { "code": "ECAR", "vendorCode": "ZI" }, "TransmissionTypeCode": { "codeContext": "ACRISS", "value": "A" }, "VehicleCategoryCode": { "codeContext": "ACRISS", "value": "C" }, "FuelTypeCode": { "codeContext": "ACRISS", "value": "R" }, "VehicleSizeCode": { "codeContext": "ACRISS", "value": "E" }, "VehicleDateLocation": { "@type": "VehicleDateLocation", "RentalPickup": { "@type": "RentalPickup", "date": "2023-08-24", "time": "11:00:00", "VendorLocation": { "@type": "VendorLocation", "code": "SYD" } }, "RentalReturn": { "@type": "RentalReturn", "date": "2023-08-24", "time": "16:54:00", "VendorLocation": { "@type": "VendorLocation", "code": "SYD" } } } } } ], "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "PriceBreakdown": [ { "@type": "PriceBreakdownVehiclePrice", "VehiclePrice": { "@type": "VehiclePrice", "RateDistance": { "allowance": 200, "distanceUnits": "Kilometers", "ratePeriod": "Day" }, "ApproximateRate": { "@type": "ApproximateRate", "BaseRate": { "code": "AUD", "value": 1245.5 } } } } ] } } ], "Traveler": [ { "@type": "Traveler", "birthDate": "1999-02-22", "gender": "Male", "passengerTypeCode": "ADT", "id": "trav_1", "TravelerRef": "trav_1", "Identifier": { "authority": "Travelport", "value": "QURUfFQx" }, "PersonName": { "@type": "PersonName", "Prefix": "MR", "Given": "PX ADTONE", "Surname": "SRNMONE" }, ], "FormOfPayment": [ { "@type": "FormOfPaymentCash", "id": "formOfPayment_1", "Identifier": { "authority": "QF", "value": "8ba99322-16bb-4d63-aa64-329e18a1ecb9" } } ], "Payment": [ { "@type": "Payment", "id": "payment_1", "Identifier": { "authority": "QF", "value": "2842dacd-bf6d-4353-a617-c98fce45af47" }, "Amount": { "code": "AUD", "minorUnit": 2, "value": 1147.2 }, "FormOfPaymentIdentifier": { "FormOfPaymentRef": "formOfPayment_1", "Identifier": { "authority": "QF", "value": "8ba99322-16bb-4d63-aa64-329e18a1ecb9" } }, "OfferIdentifier": [ { "offerRef": "Offer_1", "Identifier": { "authority": "QF", "value": "db339486-f709-4337-8611-6999ac099c11" } } ] } ], "Receipt": [ { "@type": "ReceiptConfirmation", "OfferRef": [ "Offer_1" ], "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "QF", "sourceContext": "VendorLocator", "value": "57CZUC" } } }, { "@type": "ReceiptConfirmation", "OfferRef": [ "Offer_1" ], "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "QF", "sourceContext": "OrderId", "value": "QF081HLDSTTA7" } } }, { "@type": "ReceiptPayment", "dateTime": "2023-06-02T21:13:00Z", "OfferRef": [ "Offer_1" ], "PaymentIdentifier": { "PaymentRef": "payment_1" }, "Document": [ { "@type": "DocumentTicket", "Number": "08157451145222", "TravelerIdentifierRef": { "value": "trav_1" }, "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Total": 1147.2 } } ] }, { "@type": "ReceiptConfirmation", "Identifier": { "authority": "Travelport", "value": "84953ee8-5081-4904-9968-764342d284cf" }, "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "1G", "value": "4411L5" }, "OfferStatus": { "@type": "OfferStatusAir", "StatusAir": [ { "flightRefs": [ "Flight_01", "Flight_03" ], "code": "ZK", "value": "Pending" } ] } } }, { "@type": "ReceiptConfirmation", "OfferRef": [ "offer_2" ], "Confirmation": { "@type": "ConfirmationHold", "Locator": { "locatorType": "CONFIRMATION_NUMBER", "source": "RT", "sourceContext": "SUPPLIER", "value": "HOTEL1234" }, "OfferStatus": { "@type": "OfferStatusHospitality", "Status": "Confirmed" } } }, { "@type": "ReceiptConfirmation", "OfferRef": [ "offer_3" ], "Confirmation": { "@type": "ConfirmationHold", "Locator": { "locatorType": "Confirmation Number", "source": "ZI", "sourceContext": "Supplier", "value": "CAR12345" }, "OfferStatus": { "@type": "OfferStatusVehicle", "Status": "Confirmed" } } } ], "ReservationComment": [ { "@type": "ReservationComment", "id": "reservationComment_1", "Comment": [ { "id": "comment_1", "name": "CTCP SYD 1212456121", "language": "EN", "value": "CTCP SYD 1212456121" } ] }, ], "ReservationDisplaySequence": { "@type": "ReservationDisplaySequence", "DisplaySequence": [ { "@type": "DisplaySequence", "displaySequence": 1, "OfferRef": "Offer_1", "ProductRef": "product_1", "Sequence": 1 }, { "@type": "DisplaySequence", "displaySequence": 2, "OfferRef": "offer_2", "ProductRef": "product_1" }, { "@type": "DisplaySequence", "displaySequence": 3, "OfferRef": "Offer_1", "ProductRef": "product_2", "Sequence": 3 }, { "@type": "DisplaySequence", "displaySequence": 4, "OfferRef": "offer_3", "ProductRef": "product_1" } ] } }, "Identifier": { "authority": "Travelport", "value": "877ceaa9-3742-40f0-aadd-f8325b1fc904" } } } GDS with Active Hotel and Car Content The following is a Reservation Retrieve response for a booking with a GDS round-trip flight (Offer/id= offer_1 ) and active hotel (Offer/id= offer_2 ) and car (Offer/id= offer_3 ) reservations. For brevity, the air TermsAndConditions text and several instances of ReservationComment have been deleted. This example includes the additional hotel content in ProductHospitality and TermsAndConditionsFull that was added to the Reservation Retrieve with AirReservation 24.11.48. Show Example for GDS flight with active hotel and car content { "ReservationResponse": { "@type": "ReservationResponse", "Reservation": { "@type": "Reservation", "Identifier": { "authority": "Travelport", "value": "4a55d4e4-92fd-4511-b619-d22811f44c83" }, "Offer": [ { "@type": "Offer", "id": "offer_1", "Identifier": { "authority": "Travelport", "value": "4f65fa28-59ad-436e-b8a8-6400877a98c2" }, "Product": [ { "@type": "ProductAir", "id": "product_1", "Identifier": { "authority": "Travelport", "value": "9c82bd3d-ae6d-4b41-acd7-e4cd9fc83169" }, "FlightSegment": [ { "@type": "FlightSegment", "id": "FlightSegment_02", "sequence": 2, "Flight": { "@type": "Flight", "duration": "PT1H35M", "carrier": "QF", "number": "419", "equipment": "73H", "id": "Flight_02", "Identifier": { "authority": "Travelport", "value": "4900d0ef-7e5d-4011-9a25-35e5b9f57635" }, "Departure": { "@type": "Departure", "location": "SYD", "date": "2023-08-19", "time": "08:00:00" }, "Arrival": { "@type": "Arrival", "location": "MEL", "date": "2023-08-19", "time": "09:35:00" } } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 2 ], "classOfService": "Q", "cabin": "Economy", "fareBasisCode": "QDQW", "fareType": "PublicFare", "Brand": { "@type": "Brand", "name": "RED EDEAL", "tier": 1, "id": "1125969" } } ] }, { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "CHD", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 2 ], "classOfService": "Q", "cabin": "Economy", "fareBasisCode": "QDQWCH", "fareType": "PublicFare", "Brand": { "@type": "Brand", "name": "RED EDEAL", "tier": 1, "id": "1125969" } } ] } ] }, { "@type": "ProductAir", "id": "product_2", "Identifier": { "authority": "Travelport", "value": "816244bd-7c7b-4f63-b630-eabc672cff4b" }, "FlightSegment": [ { "@type": "FlightSegment", "id": "FlightSegment_04", "sequence": 4, "Flight": { "@type": "Flight", "duration": "PT1H25M", "carrier": "QF", "number": "404", "equipment": "73H", "id": "Flight_04", "Identifier": { "authority": "Travelport", "value": "76414416-943c-49f3-a04e-71aed3082840" }, "Departure": { "@type": "Departure", "location": "MEL", "date": "2023-09-29", "time": "06:15:00" }, "Arrival": { "@type": "Arrival", "location": "SYD", "date": "2023-09-29", "time": "07:40:00" } } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 4 ], "classOfService": "Q", "cabin": "Economy", "fareBasisCode": "QDQW", "fareType": "PublicFare", "Brand": { "@type": "Brand", "name": "RED EDEAL", "tier": 1, "id": "1125969" } } ] }, { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "CHD", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 4 ], "classOfService": "Q", "cabin": "Economy", "fareBasisCode": "QDQWCH", "fareType": "PublicFare", "Brand": { "@type": "Brand", "name": "RED EDEAL", "tier": 1, "id": "1125969" } } ] } ] } ], "Price": { "@type": "PriceDetail", "id": "PriceDetail_1", "CurrencyCode": { "value": "AUD" }, "Base": 809.76, "TotalTaxes": 181.2, "TotalFees": 0, "TotalPrice": 990.96, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 404.88, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 90.6, "Tax": [ { "currencyCode": "AUD", "taxCode": "QR", "value": 32.56 }, { "currencyCode": "AUD", "taxCode": "WG", "value": 13 }, { "currencyCode": "AUD", "taxCode": "UO", "value": 45.04 } ] }, "Total": 495.48 }, "FareCalculation": "SYD QF MEL 202.44QDQW QF SYD 202.44QDQW AUD404.88END" }, { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "CHD", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 404.88, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 90.6, "Tax": [ { "currencyCode": "AUD", "taxCode": "QR", "value": 32.56 }, { "currencyCode": "AUD", "taxCode": "WG", "value": 13 }, { "currencyCode": "AUD", "taxCode": "UO", "value": 45.04 } ] }, "Total": 495.48 }, "FareCalculation": "SYD QF MEL 202.44QDQWCH QF SYD 202.44QDQWCH AUD404.88END" } ] }, "TermsAndConditionsFull": [ {omitted for brevity...}, { "@type": "Offer", "id": "offer_2", "Identifier": { "authority": "Travelport", "value": "0a4d2c04-83b1-4ec5-8712-c9d4e938c466" }, "Product": [ { "@type": "ProductHospitality", "bookingCode": "A01BQ1", "guests": 2, "adaCompliant": "No", "propertyName": "HILTON GARDEN INN HALIFAX AIRPORT", "id": "product_1", "Identifier": { "authority": "Travelport", "value": "150705a4-c116-4b39-8dd4-9ed699fbdde6" }, "Quantity": 1, "PropertyKey": { "@type": "PropertyKey", "chainCode": "GI", "propertyCode": "75407" }, "RoomType": { "@type": "RoomTypeDetail", "RoomCharacteristics": { "@type": "RoomCharacteristics", "typeCode": "82", "smokingAllowed": "No", "wifiIncluded": "Yes", "BedConfiguration": [ { "quantity": 1, "bedType": "King Bed(s)", "size": "180 cm X 200 cm" } ] }, "Description": { "value": "1 King Bed Complimentary WiFi- Hdtvs With Hidef Channels Refrigerator-Microwave-MP3 Clock-Pod Coffee B" } }, "Email": { "value": "mark.hosking@hilton.com" }, "DateRange": { "start": "2024-10-20", "end": "2024-10-21" }, "TravelerContact": { "@type": "TravelerContact", "Email": { "value": "aaa@travelport.com" }, "Telephone": { "@type": "Telephone", "countryAccessCode": "1", "areaCityCode": "909", "phoneNumber": "1231234", "cityCode": "DEN" } }, "PropertyAddress": { "@type": "PropertyAddress", "AddressLine": [ "200 Pratt Whitney Drive" ], "City": "HALIFAX", "StateProv": { "name": "NS", "value": "NS" }, "Country": { "name": "CA" }, "PostalCode": "B2T 0A2" }, "Telephone": { "@type": "Telephone", "phoneNumber": "1-902-8731400", "cityCode": "YHZ" } } ], "Price": { "@type": "PriceDetail", "CurrencyCode": { "codeAuthority": "AUD", "decimalPlace": 2 }, "Base": 189, "TotalPrice": 7560, "PriceBreakdown": [ { "@type": "PriceBreakdownHospitality", "Amount": { "@type": "Amount", "approximateInd": true }, "NightlyRate": [ { "@type": "NightlyRate", "nights": 40 } ] } ] } }, { "@type": "Offer", "id": "offer_3", "Identifier": { "authority": "Travelport", "value": "6af0aada-ce22-4907-aff6-c1f1f5f86a50" }, "Product": [ { "@type": "ProductVehicle", "id": "product_1", "Identifier": { "authority": "Travelport", "value": "9d4920ba-2ae2-48be-b0f5-96063ea8cfa5" }, "Quantity": 1, "Vehicle": { "@type": "VehicleDetail", "doorCount": "2-door or 4-door", "airConditioningInd": true, "VehicleMakeModel": { "code": "CCMR", "vendorCode": "ZI" }, "TransmissionTypeCode": { "codeContext": "ACRISS", "value": "M" }, "VehicleCategoryCode": { "codeContext": "ACRISS", "value": "C" }, "FuelTypeCode": { "codeContext": "ACRISS", "value": "R" }, "VehicleSizeCode": { "codeContext": "ACRISS", "value": "C" }, "VehicleDateLocation": { "@type": "VehicleDateLocation", "RentalPickup": { "@type": "RentalPickup", "date": "2023-08-18", "time": "20:00:00", "VendorLocation": { "@type": "VendorLocation", "rentalLocationNumber": "01", "rentalLocationName": "T", "code": "SYD" } }, "RentalReturn": { "@type": "RentalReturn", "date": "2023-08-19", "time": "05:00:00", "VendorLocation": { "@type": "VendorLocation", "code": "SYD" } } } } } ], "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "PriceBreakdown": [ { "@type": "PriceBreakdownVehiclePrice", "VehiclePrice": { "@type": "VehiclePrice", "rateGuaranteedInd": "true", "RateDistance": { "unlimitedDistanceInd": "true", "distanceUnits": "Miles", "ratePeriod": "Day" }, "ApproximateRate": { "@type": "ApproximateRate", "BaseRate": { "code": "AUD", "value": 73.74 }, "EstimatedTotalAmount": { "code": "AUD", "approximateInd": true, "value": 121.51 } }, "RateQualifier": "Guarantee" } }, { "@type": "PriceBreakdownVehiclePrice", "VehiclePrice": { "@type": "VehiclePrice", "RateDistance": { "unlimitedDistanceInd": "true", "distanceUnits": "Miles", "ratePeriod": "ExtraHour" }, "ApproximateRate": { "@type": "ApproximateRate", "BaseRate": { "code": "AUD", "approximateInd": true, "value": 24.58 } } } }, { "@type": "PriceBreakdownVehicleCharges", "VehicleCharges": { "@type": "VehicleCharges", "Calculation": [ { "@type": "Calculation", "TotalAmount": { "code": "AUD", "value": 47.77 } } ], "VehicleChargePurposeCode": { "value": "MANDATORY" } } } ] }, "TermsAndConditionsFull": [ { "@type": "TermsAndConditionsFullVehicle", "ProductRateCodeInfo": [ { "@type": "ProductRateCodeInfo", "RateCodeInfo": { "value": "41I" } } ] } ] } ], "Traveler": [ { "@type": "Traveler", "birthDate": "1991-12-12", "gender": "Male", "passengerTypeCode": "ADT", "id": "travelerRefId_1", "Identifier": { "authority": "Travelport", "value": "952b1cb9-3ec4-4790-b6ed-68d51138421b" }, "PersonName": { "@type": "PersonName", "Given": "SABBYANUJ", "Surname": "MAJI" }, "Telephone": [ { "@type": "TelephoneDetail", "countryAccessCode": "1", "areaCityCode": "719", "phoneNumber": "6401108", "extension": "123", "id": "telephone_1", "cityCode": "DEN", "role": "Mobile" } ], "Email": [ { "value": "indranil.ghosh@travelport.com" }, { "comment": "One email Id", "value": "TravelerOneOne@gmail.com" } ], "TravelDocument": [ { "@type": "TravelDocumentDetail", "docNumber": "88989889", "docType": "Passport", "expireDate": "2025-12-05", "issueCountry": "US", "birthDate": "1991-12-12", "Gender": "Male", "PersonName": { "@type": "PersonName", "Given": "SABBYANUJ", "Surname": "MAJI" } } ] }, { "@type": "Traveler", "birthDate": "2020-02-02", "gender": "Male", "passengerTypeCode": "CHD", "id": "travelerRefId_2", "Identifier": { "authority": "Travelport", "value": "56e1ca62-25f5-42bf-92b1-82b1a6a7bdf9" }, "PersonName": { "@type": "PersonName", "Given": "PX CHDONEMDNM MR", "Surname": "SRNMONE CNN" }, "Telephone": [ { "@type": "TelephoneDetail", "countryAccessCode": "1", "areaCityCode": "909", "phoneNumber": "212456121", "extension": "1243", "id": "telephone_1", "cityCode": "ORD", "role": "Office" } ], "TravelDocument": [ { "@type": "TravelDocumentDetail", "docNumber": "245968", "docType": "Passport", "expireDate": "2027-02-22", "issueCountry": "IND", "birthDate": "2020-02-02", "Gender": "Male", "PersonName": { "@type": "PersonName", "Given": "PX ONE", "Middle": "MDNMONE", "Surname": "SRNMONE" } } ] } ], "FormOfPayment": [ { "@type": "FormOfPaymentCash", "id": "formOfPayment_1", "Identifier": { "authority": "Travelport", "value": "7571dd5b-51e8-49f5-a7ae-92257b759e9d" } } ], "Payment": [ { "@type": "Payment", "id": "payment_1", "PaymentRef": "payment_1", "Identifier": { "authority": "Travelport", "value": "c4f53d19-07c8-4a68-bd12-ab607067e2ee" }, "Amount": { "minorUnit": 2, "value": 990.96 }, "FormOfPaymentIdentifier": { "FormOfPaymentRef": "formOfPayment_1" } } ], "Receipt": [ { "@type": "ReceiptConfirmation", "Identifier": { "authority": "Travelport", "value": "ffff1b99-db6c-4159-a601-f2afc82e85dd" }, "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "1G", "value": "4417BK" }, "OfferStatus": { "@type": "OfferStatusAir", "StatusAir": [ { "flightRefs": [ "Flight_02", "Flight_04" ], "code": "HK", "value": "Confirmed" } ] } } }, { "@type": "ReceiptConfirmation", "OfferRef": [ "offer_2" ], "Confirmation": { "@type": "ConfirmationHold", "Locator": { "locatorType": "CONFIRMATION_NUMBER", "source": "RT", "sourceContext": "SUPPLIER", "value": "6764XHI500" }, "OfferStatus": { "@type": "OfferStatusHospitality", "Status": "Confirmed" } } }, { "@type": "ReceiptConfirmation", "OfferRef": [ "offer_3" ], "Confirmation": { "@type": "ConfirmationHold", "Locator": { "locatorType": "Confirmation Number", "source": "ZI", "sourceContext": "Supplier", "value": "25432390AU4" }, "OfferStatus": { "@type": "OfferStatusVehicle", "Status": "Confirmed" } } }, { "@type": "ReceiptConfirmation", "Identifier": { "authority": "Travelport", "value": "03ab4950-ce1d-4adf-95de-bc4aaf794f86" }, "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "1A", "value": "5O8ZI7" } } }, { "@type": "ReceiptPayment", "dateTime": "2023-06-05T12:27:00Z", "id": "receipt_1", "ReceiptRef": "receipt_1", "Identifier": { "authority": "Travelport", "value": "690541fd-1d17-437b-bb49-0e65dd9a1a81" }, "OfferRef": [ "offer_1" ], "PaymentIdentifier": { "PaymentRef": "payment_1" }, "Document": [ { "@type": "DocumentTicket", "Number": "0819249231539", "TravelerIdentifierRef": { "passengerTypeCode": "ADT", "id": "travelerRefId_1", "value": "46bf0b13-b405-4ee4-8ca3-531803ef7411" }, "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 404.88, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 90.6, "Tax": [ { "taxCode": "QR", "value": 32.56 }, { "taxCode": "WG", "value": 13 }, { "taxCode": "UO", "value": 45.04 } ] }, "Total": 495.48 }, "IssuingPCC": "79JP", "FiledAmount": { "currencyCode": "AUD", "decimalPlace": 2, "value": 404.88 } } ] }, { "@type": "ReceiptPayment", "dateTime": "2023-06-05T12:27:00Z", "id": "receipt_2", "ReceiptRef": "receipt_2", "Identifier": { "authority": "Travelport", "value": "57d48f77-8072-4803-a885-1d1d8a74daf6" }, "OfferRef": [ "offer_1" ], "PaymentIdentifier": { "PaymentRef": "payment_1" }, "Document": [ { "@type": "DocumentTicket", "Number": "0819249231540", "TravelerIdentifierRef": { "passengerTypeCode": "CHD", "id": "travelerRefId_2", "value": "546351ac-73d6-4c56-afe4-5a35fa1e8b9a" }, "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 404.88, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 90.6, "Tax": [ { "taxCode": "QR", "value": 32.56 }, { "taxCode": "WG", "value": 13 }, { "taxCode": "UO", "value": 45.04 } ] }, "Total": 495.48 }, "IssuingPCC": "79JP", "FiledAmount": { "currencyCode": "AUD", "decimalPlace": 2, "value": 404.88 } } ] } ], "ReservationComment": [ { "@type": "ReservationComment", "commentSource": "Supplier", "shareWith": "Agency", "shareWithSupplier": [ "QF" ], "Comment": [ { "name": "Vendor Remarks", "value": "MISSING SSR CTCM MOBILE OR SSR CTCE EMAIL OR SSR CTCR NON-CONSENT FOR QF" } ] } ], "ReservationDisplaySequence": { "@type": "ReservationDisplaySequence", "DisplaySequence": [ { "@type": "DisplaySequence", "displaySequence": 1, "OfferRef": "offer_3", "ProductRef": "product_1" }, { "@type": "DisplaySequence", "displaySequence": 2, "OfferRef": "offer_1", "ProductRef": "product_1", "Sequence": 2 }, { "@type": "DisplaySequence", "displaySequence": 3, "OfferRef": "offer_2", "ProductRef": "product_1" }, { "@type": "DisplaySequence", "displaySequence": 4, "OfferRef": "offer_1", "ProductRef": "product_2", "Sequence": 4 } ] } }, "Identifier": { "authority": "Travelport", "value": "4a55d4e4-92fd-4511-b619-d22811f44c83" } } }

## Literal `<pre>` excerpts from HTML

### Block 1

```
"Receipt": [
    {
     "@type": "ReceiptConfirmation",
     "OfferRef": [
      "Offer_1"
     ],
     "Confirmation": {
      "@type": "ConfirmationHold",
      "Locator": {
       "source": "QF",
       "sourceContext": "VendorLocator",
       "value": "57CZUC"
      }
     }
    },
    {
     "@type": "ReceiptConfirmation",
     "OfferRef": [
      "Offer_1"
     ],
     "Confirmation": {
      "@type": "ConfirmationHold",
      "Locator": {
       "source": "QF",
       "sourceContext": "OrderId",
       "value": "QF081HLDSTTA7"
      }
     }
    },
    {
     "@type": "ReceiptPayment",
     "dateTime": "2023-06-02T21:13:00Z",
     "OfferRef": [
      "Offer_1"
     ],
     "PaymentIdentifier": {
      "PaymentRef": "payment_1"
     },
     "Document": [
      {
       "@type": "DocumentTicket",
       "Number": "08157451145222",
       "TravelerIdentifierRef": {
        "value": "trav_1"
       },
       "Amount": {
        "@type": "Amount",
        "CurrencyCode": {
         "decimalPlace": 2,
         "value": "AUD"
        },
        "Total": 1147.2
       }
      }
     ]
    },
    {
     "@type": "ReceiptConfirmation",
     "Identifier": {
      "authority": "Travelport",
      "value": "84953ee8-5081-4904-9968-764342d284cf"
     },
     "Confirmation": {
      "@type": "ConfirmationHold",
      "Locator": {
       "source": "1G",
       "value": "4411L5"
      },
      "OfferStatus": {
       "@type": "OfferStatusAir",
       "StatusAir": [
        {
         "flightRefs": [
          "Flight_01",
          "Flight_03"
         ],
         "code": "ZK",
         "value": "Pending"
        }
       ]
      }
     }
    },
    {
     "@type": "ReceiptConfirmation",
     "OfferRef": [
      "offer_2"
     ],
     "Confirmation": {
      "@type": "ConfirmationHold",
      "Locator": {
       "locatorType": "CONFIRMATION_NUMBER",
       "source": "RT",
       "sourceContext": "SUPPLIER",
       "value": "HOTEL1234"
      },
      "OfferStatus": {
       "@type": "OfferStatusHospitality",
       "Status": "Confirmed"
      }
     }
    },
    {
     "@type": "ReceiptConfirmation",
     "OfferRef": [
      "offer_3"
     ],
     "Confirmation": {
      "@type": "ConfirmationHold",
      "Locator": {
       "locatorType": "Confirmation Number",
       "source": "ZI",
       "sourceContext": "Supplier",
       "value": "CAR12345"
      },
      "OfferStatus": {
       "@type": "OfferStatusVehicle",
       "Status": "Confirmed"
      }
     }
    }
   ],
```

### Block 2

```
...
  "ReservationDisplaySequence": {
    "@type": "ReservationDisplaySequence",
    "DisplaySequence": [
     {
      "@type": "DisplaySequence",
      "displaySequence": 1,
      "OfferRef": "Offer_1",
      "ProductRef": "product_1",
      "Sequence": 1
     },
     {
      "@type": "DisplaySequence",
      "displaySequence": 2,
      "OfferRef": "offer_2",
      "ProductRef": "product_1"
     },
     {
      "@type": "DisplaySequence",
      "displaySequence": 3,
      "OfferRef": "Offer_1",
      "ProductRef": "product_2",
      "Sequence": 3
     },
     {
      "@type": "DisplaySequence",
      "displaySequence": 4,
      "OfferRef": "offer_3",
      "ProductRef": "product_1"
     }
    ]
   }...
```

### Block 3

```
{
 "ReservationResponse": {
  "@type": "ReservationResponse",
  "Reservation": {
   "@type": "Reservation",
   "Identifier": {
    "authority": "Travelport",
    "value": "877ceaa9-3742-40f0-aadd-f8325b1fc904"
   },
   "Offer": [
    {
     "@type": "Offer",
     "id": "Offer_1",
     "Identifier": {
      "authority": "QF",
      "value": "UUYwODFITERTVFRBN3xQRTJBNEE0NjUtMjA2Qi00MEMzLTkzNjRzcXJxbTJ0dG40aTViLTEtMQ=="
     },
     "Product": [
      {
       "@type": "ProductAir",
       "totalDuration": "PT1H35M",
       "id": "product_1",
       "Identifier": {
        "authority": "QF",
        "value": "5cfe8aa3-db35-4994-8385-80f5ff534346"
       },
       "FlightSegment": [
        {
         "@type": "FlightSegment",
         "id": "s1",
         "sequence": 1,
         "Flight": {
          "@type": "Flight",
          "distance": 438,
          "stops": 0,
          "duration": "PT1H35M",
          "carrier": "QF",
          "number": "409",
          "equipment": "73H",
          "id": "Flight_01",
          "Identifier": {
           "authority": "QF",
           "value": "3320bb55-d8fb-4eb5-a3d7-ba4ca4c5edd3"
          },
          "Departure": {
           "@type": "DepartureDetail",
           "terminal": "3",
           "location": "SYD",
           "date": "2023-08-19",
           "time": "07:00:00"
          },
          "Arrival": {
           "@type": "ArrivalDetail",
           "terminal": "1",
           "location": "MEL",
           "date": "2023-08-19",
           "time": "08:35:00"
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
           "classOfService": "H",
           "cabin": "Economy",
           "fareBasisCode": "HFQA",
           "fareType": "PublicFare",
           "Brand": {
            "@type": "Brand",
            "name": "Economy Flex"
           }
          }
         ]
        }
       ]
      },
      {
       "@type": "ProductAir",
       "totalDuration": "PT1H25M",
       "id": "product_2",
       "Identifier": {
        "authority": "QF",
        "value": "f8365ff0-7149-444c-8222-54e8afdc7e5b"
       },
       "FlightSegment": [
        {
         "@type": "FlightSegment",
         "id": "s2",
         "sequence": 3,
         "Flight": {
          "@type": "Flight",
          "distance": 438,
          "stops": 0,
          "duration": "PT1H25M",
          "carrier": "QF",
          "number": "402",
          "equipment": "73H",
          "id": "Flight_02",
          "Identifier": {
           "authority": "QF",
           "value": "0afd730c-d589-4010-ad57-6d250bffd6e3"
          },
          "Departure": {
           "@type": "DepartureDetail",
           "terminal": "1",
           "location": "MEL",
           "date": "2023-08-24",
           "time": "06:00:00"
          },
          "Arrival": {
           "@type": "ArrivalDetail",
           "terminal": "3",
           "location": "SYD",
           "date": "2023-08-24",
           "time": "07:25:00"
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
            3
           ],
           "classOfService": "L",
           "cabin": "Economy",
           "fareBasisCode": "LDQA",
           "fareType": "PublicFare",
           "Brand": {
            "@type": "Brand",
            "name": "Economy Flex"
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
      "Base": 999.53,
      "TotalTaxes": 147.67,
      "TotalPrice": 1147.2,
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
         "Base": 999.53,
         "Taxes": {
          "@type": "TaxesDetail",
          "TotalTaxes": 147.67,
          "Tax": [
           {
            "taxCode": "QR",
            "description": "PASSENGER SERVICE CHARGE DOMESTIC DEPARTURE",
            "value": 15.19
           },
           {
            "taxCode": "QR",
            "description": "PASSENGER SERVICE CHARGE DOMESTIC ARRIVAL",
            "value": 15.19
           },
           {
            "taxCode": "UO",
            "description": "GOODS AND SERVICES TAX  GST",
            "value": 38.6
           },
           {
            "taxCode": "UO",
            "description": "GOODS AND SERVICES TAX  GST",
            "value": 61.35
           },
           {
            "taxCode": "UO",
            "description": "GOODS AND SERVICES TAX  GST",
            "value": 4.34
           },
           {
            "taxCode": "WG",
            "description": "SAFETY AND SECURITY CHARGE  DEPARTURE",
            "value": 13
           }
          ]
         },
         "Total": 1147.2
        }
       }
      ]
     },
     "TermsAndConditionsFull": [
      {...omitted for brevity...},
    {
     "@type": "Offer",
     "id": "offer_2",
     "Identifier": {
      "authority": "Travelport",
      "value": "21981655-8966-4c6e-8218-58fac8d0f53f"
     },
     "Product": [
      {
       "@type": "ProductHospitality",
       "guests": 1,
       "id": "product_1",
       "Identifier": {
        "authority": "Travelport",
        "value": "5ad3fbf0-b93e-4147-8144-9d58627da813"
       },
       "PropertyKey": {
        "@type": "PropertyKey",
        "chainCode": "RT"
       },
       "DateRange": {
        "start": "2023-08-19",
        "end": "2023-08-23"
       }
      }
     ],
     "Price": {
      "@type": "PriceDetail",
      "CurrencyCode": {
       "codeAuthority": "AUD",
       "decimalPlace": 2
      },
      "TotalPrice": 187.2,
      "PriceBreakdown": [
       {
        "@type": "PriceBreakdownHospitality",
        "roomPricingType": "Per stay",
        "Amount": {
         "@type": "Amount",
         "approximateInd": true,
         "CurrencyCode": {
          "codeAuthority": "AUD",
          "decimalPlace": 2
         },
         "Total": 187.2
        },
        "NightlyRate": [
         {
          "@type": "NightlyRate",
          "nights": 4
         }
        ]
       }
      ]
     }
    },
    {
     "@type": "Offer",
     "id": "offer_3",
     "Identifier": {
      "authority": "Travelport",
      "value": "fb5d0fd1-e356-4b96-ace0-3f98cdc767b6"
     },
     "Product": [
      {
       "@type": "ProductVehicle",
       "id": "product_1",
       "Identifier": {
        "authority": "Travelport",
        "value": "8dc1ebff-3cc7-4e34-8aa4-f1328e1072d6"
       },
       "Quantity": 1,
       "Vehicle": {
        "@type": "VehicleDetail",
        "doorCount": "2-door or 4-door",
        "airConditioningInd": true,
        "VehicleMakeModel": {
         "code": "ECAR",
         "vendorCode": "ZI"
        },
        "TransmissionTypeCode": {
         "codeContext": "ACRISS",
         "value": "A"
        },
        "VehicleCategoryCode": {
         "codeContext": "ACRISS",
         "value": "C"
        },
        "FuelTypeCode": {
         "codeContext": "ACRISS",
         "value": "R"
        },
        "VehicleSizeCode": {
        
…
```

### Block 4

```
{
 "ReservationResponse": {
  "@type": "ReservationResponse",
  "Reservation": {
   "@type": "Reservation",
   "Identifier": {
    "authority": "Travelport",
    "value": "4a55d4e4-92fd-4511-b619-d22811f44c83"
   },
   "Offer": [
    {
     "@type": "Offer",
     "id": "offer_1",
     "Identifier": {
      "authority": "Travelport",
      "value": "4f65fa28-59ad-436e-b8a8-6400877a98c2"
     },
     "Product": [
      {
       "@type": "ProductAir",
       "id": "product_1",
       "Identifier": {
        "authority": "Travelport",
        "value": "9c82bd3d-ae6d-4b41-acd7-e4cd9fc83169"
       },
       "FlightSegment": [
        {
         "@type": "FlightSegment",
         "id": "FlightSegment_02",
         "sequence": 2,
         "Flight": {
          "@type": "Flight",
          "duration": "PT1H35M",
          "carrier": "QF",
          "number": "419",
          "equipment": "73H",
          "id": "Flight_02",
          "Identifier": {
           "authority": "Travelport",
           "value": "4900d0ef-7e5d-4011-9a25-35e5b9f57635"
          },
          "Departure": {
           "@type": "Departure",
           "location": "SYD",
           "date": "2023-08-19",
           "time": "08:00:00"
          },
          "Arrival": {
           "@type": "Arrival",
           "location": "MEL",
           "date": "2023-08-19",
           "time": "09:35:00"
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
           "classOfService": "Q",
           "cabin": "Economy",
           "fareBasisCode": "QDQW",
           "fareType": "PublicFare",
           "Brand": {
            "@type": "Brand",
            "name": "RED EDEAL",
            "tier": 1,
            "id": "1125969"
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
           "classOfService": "Q",
           "cabin": "Economy",
           "fareBasisCode": "QDQWCH",
           "fareType": "PublicFare",
           "Brand": {
            "@type": "Brand",
            "name": "RED EDEAL",
            "tier": 1,
            "id": "1125969"
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
        "value": "816244bd-7c7b-4f63-b630-eabc672cff4b"
       },
       "FlightSegment": [
        {
         "@type": "FlightSegment",
         "id": "FlightSegment_04",
         "sequence": 4,
         "Flight": {
          "@type": "Flight",
          "duration": "PT1H25M",
          "carrier": "QF",
          "number": "404",
          "equipment": "73H",
          "id": "Flight_04",
          "Identifier": {
           "authority": "Travelport",
           "value": "76414416-943c-49f3-a04e-71aed3082840"
          },
          "Departure": {
           "@type": "Departure",
           "location": "MEL",
           "date": "2023-09-29",
           "time": "06:15:00"
          },
          "Arrival": {
           "@type": "Arrival",
           "location": "SYD",
           "date": "2023-09-29",
           "time": "07:40:00"
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
            4
           ],
           "classOfService": "Q",
           "cabin": "Economy",
           "fareBasisCode": "QDQW",
           "fareType": "PublicFare",
           "Brand": {
            "@type": "Brand",
            "name": "RED EDEAL",
            "tier": 1,
            "id": "1125969"
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
            4
           ],
           "classOfService": "Q",
           "cabin": "Economy",
           "fareBasisCode": "QDQWCH",
           "fareType": "PublicFare",
           "Brand": {
            "@type": "Brand",
            "name": "RED EDEAL",
            "tier": 1,
            "id": "1125969"
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
       "value": "AUD"
      },
      "Base": 809.76,
      "TotalTaxes": 181.2,
      "TotalFees": 0,
      "TotalPrice": 990.96,
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
         "Base": 404.88,
         "Taxes": {
          "@type": "TaxesDetail",
          "TotalTaxes": 90.6,
          "Tax": [
           {
            "currencyCode": "AUD",
            "taxCode": "QR",
            "value": 32.56
           },
           {
            "currencyCode": "AUD",
            "taxCode": "WG",
            "value": 13
           },
           {
            "currencyCode": "AUD",
            "taxCode": "UO",
            "value": 45.04
           }
          ]
         },
         "Total": 495.48
        },
        "FareCalculation": "SYD QF MEL 202.44QDQW QF SYD 202.44QDQW AUD404.88END"
       },
       {
        "@type": "PriceBreakdownAir",
        "quantity": 1,
        "requestedPassengerType": "CHD",
        "Amount": {
         "@type": "Amount",
         "CurrencyCode": {
          "decimalPlace": 2,
          "value": "AUD"
         },
         "Base": 404.88,
         "Taxes": {
          "@type": "TaxesDetail",
          "TotalTaxes": 90.6,
          "Tax": [
           {
            "currencyCode": "AUD",
            "taxCode": "QR",
            "value": 32.56
           },
           {
            "currencyCode": "AUD",
            "taxCode": "WG",
            "value": 13
           },
           {
            "currencyCode": "AUD",
            "taxCode": "UO",
            "value": 45.04
           }
          ]
         },
         "Total": 495.48
        },
        "FareCalculation": "SYD QF MEL 202.44QDQWCH QF SYD 202.44QDQWCH AUD404.88END"
       }
      ]
     },
     "TermsAndConditionsFull": [
      {omitted for brevity...},
    {
     "@type": "Offer",
     "id": "offer_2",
     "Identifier": {
      "authority": "Travelport",
      "value": "0a4d2c04-83b1-4ec5-8712-c9d4e938c466"
     },
     "Product": [
      {
       "@type": "ProductHospitality",
       "bookingCode": "A01BQ1",
       "guests": 2,
       "adaCompliant": "No",
       "propertyName": "HILTON GARDEN INN HALIFAX AIRPORT",
       "id": "product_1",
       "Identifier": {
        "authority": "Travelport",
        "value": "150705a4-c116-4b39-8dd4-9ed699fbdde6"
       },
       "Quantity": 1,
       "PropertyKey": {
        "@type": "PropertyKey",
        "chainCode": "GI",
        "propertyCode": "75407"
       },
       "RoomType": {
        "@type": "RoomTypeDetail",
        "RoomCharacteristics": {
       
…
```

