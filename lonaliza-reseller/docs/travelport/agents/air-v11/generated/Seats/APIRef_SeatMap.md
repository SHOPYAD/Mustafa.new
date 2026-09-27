# Seat Map API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Seats/APIRef_SeatMap.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Seat Map API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Seat Map API&#160;Reference Request Response Example request Example response POST search/seat/catalogofferingsancillaries/seatavailabilities Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Seats Guide , Seat Book API Reference The Seat Map request returns seat availability for both free and paid seats. It is a reference payload that sends identifiers from a previous transaction or a booking. You can send the Seat Map request at several places in the JSON &#160;APIs workflow - after searching, after pricing, during booking, and after booking. The Seat Map request uses the same endpoint but a different message payload depending on where in the workflow it is sent. See the supported workflow options in the Seats Guide . All Seat Map requests allow you to request seat maps for any of the following: all flights within an offer (all flights on the itinerary) all flights within a product (all flights on one leg of an itinerary) one or more individual flights To book a seat, you next send a Seat Book request as part of a workbench session. To add ancillaries or seats to a multi-offer booking , send the Ancillary Shop or Seat Map request, then send one book request for each offer, in any order. Supported in the initial booking workflow only for free seats; supported for an existing booking for ancillaries and free and paid seats. GDS only; multi-offers not supported for NDC. For GDS&#160;and NDC differences in the JSON APIs, see the support tables for seats , ancillaries , fare rules , and exchanges/refunds , and the NDC&#160;and GDS Functionality Comparison . For differences within NDC by individual carriers, see NDC capabilities by airline through JSON API in the Travelport Knowledge Base. See Knowledge Base NDC&#160;Resources if you need login assistance. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body – Seat Map after Search request GDS only; not supported for NDC. When sent after a Search request and prior to pricing or a workbench session, the Seat Map request sends identifiers from the Search response. You can request seat maps for a flight, product, or segment returned in any preceding Search , Next Leg Search , or Flight Specific Search response. Show Seat Map Request Body Table – after Search request Object Description Required/Optional CatalogOfferingsQuerySeatAvailability Top level object. Required SeatAvailabilityOfferings Top level object. Send with @type SeatAvailabilityOfferingsBuildFromCatalogProductOfferings Required BuildFromCatalogProductOfferingsRequest Top level object. Send with @type BuildFromCatalogProductOfferingsRequest Includes CatalogProductOfferingsIdentifier. Required CatalogProductOfferingsIdentifier Top level object for identifiers from the preceding search response. Key value pairs: id : String. Optional. Can be sent with any value; the API does not validate this value. Includes Identifier and. Required Identifier Transaction identifier from the preceding search response. Key value pairs: value : From the preceding Search, Next Leg Search, or Flight Specific Search response, send the value in CatalogProductOfferings/Identifier/value for the offer to request seat maps for. authority : Send with the value Travelport . Required CatalogProductOfferingSelection Top level object. Send with @type CatalogProductOfferingSelection Includes CatalogProductOfferingIdentifier. Optional to include ProductIdentifier and SegmentSequence. Required CatalogProductOfferingIdentifier The identifier value for the product. Key value pairs: id : Short offer ID. From the preceding search response, for the offer to return seat maps for, send the value in CatalogProductOffering/id from the preceding search response. If only the offer ID is sent (no ProductIdentifier per below), the response returns seat maps for all flights one the offer. An offer is the entire itinerary. &#160; ProductIdentifier The ID of the product to return seat maps for. Key value pairs: id : Short product ID. From the preceding search response, for the product to return seat maps for, send the value in ProductBrandOptions/ProductBrandOffering/Product/productRef. Optional. If sent, response returns seat maps for all flight/s for only this product. A product is one leg of the itinerary. &#160; SegmentSequence Array. The segment sequence of the flight/s to return seat maps for. If sent, ProductIdentifier must also be sent. From the preceding search response, for the flight to request seat maps for, send the value in ReferenceListProduct/Product/FlightSegment/sequence. Optional. If sent, response returns seat maps for only the flight/s on that segment. Optional Request Body – Seat Map after AirPrice request When sent after an AirPrice request and prior to initiating a workbench session, the Seat Map request sends identifiers from the AirPrice response. Show Seat Map Request Body Table – after AirPrice request Object Description Required/Optional CatalogOfferingsQuerySeatAvailability Top level object. Required SeatAvailabilityOfferings Top level object. Send with @type SeatAvailabilityOfferingsBuildFromOfferList Includes BuildFromOfferList. Required BuildFromOfferList Top level object. Includes OfferListIdentifier, OfferIdentifier, ProductIdentifier, SegmentSequence. Required OfferListIdentifier String. Transaction identifier. From the preceding AirPrice response, send the value in OfferListResponse/Identifier/value. Required OfferIdentifier Offer identifier. Key value pairs: id : String. From the preceding AirPrice response, send the short offer id from OfferID/id. If only OfferIdentifier is sent (no ProductIdentifier per below), the response returns seat maps for all flights in the offer. Required ProductIdentifier The ID of the product to return seat maps for. Key value pairs: id : Short product ID. From the preceding AirPrice response, for the product to return seat maps for, send the value in OfferID/Product/id. Optional. If sent, response returns seat maps for all flight/s for only this product. A product is one leg of the itinerary. Optional SegmentSequence Number. The segment sequence of the flight to return seat maps for. If sent, ProductIdentifier must also be sent. From the preceding AirPrice response, for the flight to return seat maps for, send the value in OfferID/Product/FlightSegment/sequence. Optional. If sent, response returns seat maps for only the flight/s on that segment. Optional Request Body – Seat Map during workbench session When sent during a workbench session, the Seat Map request sends identifiers from the responses in the booking flow or, for a post-commit workbench, from the Workbench Create or Reservation Retrieve responses. Show Seat Map Request Body Table – during workbench session Object Description Required/Optional CatalogOfferingsQuerySeatAvailability Top level object. Required SeatAvailabilityOfferings Top level object. Required BuildFromReservationWorkbench Top level object. Required ReservationIdentifier Top level object for the workbench identifier. Includes Identifier. Required ReservationIdentifier /Identifier The reservation workbench identifier. Key value pairs: authority: Send the authority value returned in the create workbench response in Reservation/Identifier/authority. value: &#160;Send the internal system-generated identifier for the workbench returned in the create workbench response in Reservation/Identifier/value. Required OfferIdentifier Top level object for the offer identifier. Includes Identifier. Required OfferIdentifier /Identifier Offer identifier details. Key value pairs: authority: Send the authority value for the offer. value: &#160;Send the internal system-generated identifier for the offer. Source the offer, product, and segment identifiers as follows for either the booking or post-booking workflow: When requesting seats during initial booking (no reservation&#160;yet), send the identifiers returned after the Add Offer step of the AirReservation workflow, or locate them by retrieving workbench details . For an existing reservation, send the identifiers returned in the workbench create response, or locate them by sending a Reservation Retrieve. If you send only OfferIdentifier (no ProductIdentifier per below), the response returns seat maps for all flight/s in the offer. The offer is the entire itinerary. Required ProductIdentifier Top level object for the product ID. Includes Identifier. Optional. If sent, response returns seat maps for the flight/s in that product. A product is a leg of the itinerary. Optional ProductIdentifier /Identifier The identifier value for the product. Send the product details sourced as per note above in OfferIdentifier. Key value pairs: authority: Send the authority value for the product. value: &#160;Send the internal system-generated identifier value for the product. Optional SegmentSequenceList String array. The sequence number of the flight/s to retrieve the seat map for. If sent, ProductIdentifier must also be sent. Optional. If sent, response returns seat maps for only this segment. Optional Response The seat map response is similar for all Seat Map requests, regardless of where sent in the workflow. Exceptions: When sent before creating the booking, TravelerIdentifierRef returns only the PTC, as there are no traveler details at this point in the workflow. HeldAncillary is returned only in a workbench session and only when seat/s have already been assigned. It returns the current seat assignment/s for all travelers on the booking. These will be held while modifying seats until the new seat book request is confirmed at commit. Show Seat Map Response Body Table Object Description CatalogOfferingsAncillaryListResponse Top level object for response. Key value pairs: transactionId : System-generated unique ID for this response. Can be used for internal tracking and troubleshooting. traceId : Returned if a custom trace ID was sent in the request header. See Transaction and Trace IDs for details. See Identifiers in the JSON &#160;APIs for more about identifiers across all JSON &#160;APIs. Includes CatalogOfferingsID, Result, Identifier, and ReferenceList objects. CatalogOfferingsAncillaryListResponse/ Identifier Includes the following attribute: value: Internal identifier for the response. This value must be sent in any subsequent seat book request in CatalogOfferingsIdentifier/Identifier (note the s in CatalogOfferingsIdentifier). CatalogOfferingsID Each instance of CatalogOfferingsID returns seat details for one requested flight. Contains the following attribute: id :&#160;Identifier for that CatalogOfferingsID. Contains Identifier, ContenSource, AncillaryOffering, Traveler, and Flight objects. CatalogOfferingsID/ Identifier Includes the following attribute: value : Internal identifier for the CatalogOfferingsID. Send this value in any subsequent seat book request in CatalogOfferingIdentifier/Identifier (note no s in CatalogOfferingIdentifier). ContentSource String.&#160;Identifies the source of the seat offer, either GDS or NDC . CatalogOffering Top level object. One instance returned for each price point of seats on this flight, including free seats. Includes the following attribute: id : Internal ID for the object. Contains ProductOptions and Price objects. ProductOptions Top level object. Contains Product object. Product Includes the following: id : ID for the product seat object. Contains SeatAvailability, Brand, and SeatingChartRef objects. SeatAvailability Array. Each instance has a different seatAvailabilityStatus. Includes the following key value pairs seatAvailabilityStatus : The status of all seats in this instance of SeatAvailability.&#160;Possible values are: Available:&#160;Seats are available to book. NoSeat : Seats are not available. Blocked : Seats are blocked and unavailable to book. Reserved: Seats are reserved and unavailable to book. value : A list of all seat numbers on that flight with that seatAvailabilityStatus. Brand Any brand information for seats in this Product. Includes the following: name : Brand name. SeatingChartRef A reference identifier for the seating chart for this Product. Maps to corresponding information in ReferenceList per below. Price Price details for the seats in this CatalogOffering. All seats in this instance have the same Price details. Includes CurrencyCode, Base, and TotalPrice. CurrencyCode The currency in which the price is returned. Unless changed in the request, the currency is the default associated with your provisioned PCC from Travelport. Key value pairs: decimalPlace: &#160;Number of decimal places in the currency. value: &#160;Currency code value. Base Base price for the seat. TotalPrice Total price for the seat; value of 0 indicates a free seat. TravelerIdentierRef Traveler details. If seat maps are requested in a workbench session, returns one instance for each traveler on the booking. If requested outside a workbench, returns one instance per PTC, and only passengerTypeCode is returned because there are no other traveler details at this point. Key value pairs: name: &#160;Traveler name. passengerTypeCode: &#160;Traveler PTC. id: Custom identifier for the traveler sent as part of the Add Traveler request. value: System-assigned identifier for the traveler assigned after the Add Traveler request. HeldAncillary Ancillaries 24.11.32 and later. GDS only; not supported for NDC. Returned when the Seat Map request is sent for flight/s that already have seat assignments. Returns an instance for each existing seat assignment. These will be held while modifying seats until the new seat book request is confirmed at commit. Includes the Ancillary object. Ancillary Top-level object for current seat assignment on a specific flight. Includes FlightRef and Seat Assignment. FlightRef String. Returns the internal reference ID for the flight with a current seat assignment. SeatAssignment Top-level object for current seat assignment. Includes Seat. Seat String. Current seat assignment value including row and seat number. Flight One instance per flight. Key value pairs: duration : Time of the flight in hours (H) and minutes (M). carrier : Airline carrier. number : Flight number. operatingCarrier : When the carrier has filed a codeshare operating carrier for the flight, the IATA code for that codeshare carrier. operatingCarrierName : Name of the marketing operating carrier. equipment : Equipment model. Note that TRN, TRS, and BUS equipment codes indicate ground transportation. id : id for internal flight reference number, also used in products and offers. For GDS, the Flight id is formatted as the letter ‘s’+ unique numeric value, as in s1 . Includes Identifier, Departure, and Arrival objects. Flight/ Identifier Internal identifier for the flight. Key value pairs: authority: Returns the value Travelport . value: &#160;Internal system-generated identifier for the flight. Departure Departure details. Key value pairs are the location , date , time , and terminal of departure. Arrival Arrival details. Key value pairs are the location , date , time , and terminal of arrival. Result Returns any errors or warnings. ReferenceList Top level object with @typeReferenceListSeatingChart to consolidate seating chart information. SeatingChart One instance of SeatingChart is returned for each flight requested. Key value pair: id :Internal reference to this seating chart. Includes the Cabin object. Cabin Array. One instance per cabin class. Includes: name :Cabin class name, such as ECONOMY . Includes Layout and Row objects. Layout Defines the general layout for this cabin class in the following key value pairs: startRow and endRow: One paired instance with beginning and ending row numbers for this cabin class. position and value: Paired instances define the layout for this cabin class: position indicates the location of the seat in the row or another defining characteristic; position values include the following: W: Window seat C: Center seat A: Aisle seat WA: Window and aisle together U: Seat suitable for unaccompanied minors L: Leg space seat M: Middle seat value returns the seat column; possible values vary depending on aircraft layout; could include A, B, C, D, E, F, etc. In the following example Layout object, startRow and endRow indicate that this cabin class begins with row 4, and the last row in this class is row 30. It returns six paired instances of position and value, indicating that this cabin class has seat columns A through F (each of six values in value), in which A and F are window seats (position=W), B and E are center seats (position=C), and C and D are aisle seats (position=A). Show Example Layout object "Layout": [ { "startRow": 4, "endRow": 30 }, { "position": [ "W" ], "value": "A" }, { "position": [ "C" ], "value": "B" }, { "position": [ "A" ], "value": "C" }, { "position": [ "A" ], "value": "D" }, { "position": [ "C" ], "value": "E" }, { "position": [ "W" ], "value": "F" } ], Row One instance for each row in this cabin class; returns details for each seat in that row. Key value pair: label : String. The row number. Includes Space object. Space One instance for each seat in the row. Includes the following: location : Seat number; such as A, B, C, D, E, F.&#160;Possible values vary by aircraft and flight. The Layout object above provides the general configuration for this cabin class. For example, per the example Layout object above, all seats in this cabin class with location value A are window seats while all seats with location E are center seats. Includes the Characteristic object. Characteristic Array. String. A list of Characteristic values for that seat. Codes are set by IATA; for a list of codes and values see IATA PADIS 9825 for EDIFACT Standards for Seat Characteristics. Example Request For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . You can request seat maps after any Search , Next Leg Search , or Flight Specific Search response. You can request seat maps for the entire itinerary (the offer), all flights on one leg (the product), or a single flight (the segment). The following example requests seat maps for all flights on product p0. Show Example - Seat Map after Search by product (one leg) { "CatalogOfferingsQuerySeatAvailability": { "SeatAvailabilityOfferings": { "@type": "SeatAvailabilityOfferingsBuildFromCatalogProductOfferings", "BuildFromCatalogProductOfferingsRequest": { "@type": "BuildFromCatalogProductOfferingsRequest", "CatalogProductOfferingsIdentifier": { "id": "catalogProductOfferings_1", "Identifier": { "value": "49b89a59-b5f3-459a-ab75-633c50b86c0b", "authority": "Travelport" } }, "CatalogProductOfferingSelection": [ { "@type": "CatalogProductOfferingSelection", "CatalogProductOfferingIdentifier": { "id": "o1" }, "ProductIdentifier": [ { "id": "p0" } ] } ] } } } } After pricing, you can request seat maps for all flights in either the entire itinerary (the offer), only one leg (the product), or one or more flights (segments). The following example requests a seat map for only segment 1 on two products. Show Example Seat Map request after AirPrice (no workbench) { "CatalogOfferingsQuerySeatAvailability": { "SeatAvailabilityOfferings": { "@type": "SeatAvailabilityOfferingsBuildFromOfferList", "BuildFromOfferList": { "OfferListIdentifier": "d10083bd-9dd1-4337-86b7-f12403550fa6_PC", "OfferIdentifier": [ { "id": "o0" } ], "ProductIdentifier": [ { "id": "p0" }, { "id": "p1" } ], "SegmentSequence": 1 } } } } When sent during either an initial or post-commit workbench session, the Seat Map request can return flights for either the entire itinerary (the offer), only one leg (the product), or one or more flights (segments). The following example sends only the offer identifier. This example returns seat maps for all flights in the itinerary. Show Example Seat Map Request in workbench by offer (all flights on itinerary) { "CatalogOfferingsQuerySeatAvailability": { "SeatAvailabilityOfferings": { "@type": "SeatAvailabilityOfferingsBuildFromReservationWorkbench", "BuildFromReservationWorkbench": { "ReservationIdentifier": { "Identifier": { "value": "bc3df585-1194-4e39-83a6-e9c721c175a5" } }, "OfferIdentifier": { "Identifier": { "authority": "Travelport", "value": "5f476fac-f5a8-439f-9c54-61249cd311dc" } } } } } } The following example requests a seat map for two products. This returns seat maps for all flights on those products. In the JSON APIs, a product is one leg of an itinerary. Show Example Seat Map Request in workbench by product (one leg) { "CatalogOfferingsQuerySeatAvailability": { "SeatAvailabilityOfferings": { "@type": "SeatAvailabilityOfferingsBuildFromReservationWorkbench", "BuildFromReservationWorkbench": { "ReservationIdentifier": { "Identifier": { "value": "363cddbf-cb91-4864-b3f2-757e71a23a3e" } }, "OfferIdentifier": { "Identifier": { "authority": "Travelport", "value": "73c39631-7208-4f74-abb2-1d4c7dd65a59" } }, "ProductIdentifier": [ { "Identifier": { "authority": "Travelport", "value": "2bcb6bc7-656b-4dbc-bacf-b0d80748d314" } }, { "Identifier": { "authority": "Travelport", "value": "9835b084-0b18-4d1c-bc61-062842cb73b7" } } ] } } } } The following example requests a seat map for the first segment in the requested product. This returns seat maps for the first flight on the leg specified by that product ID. Show Example Request in workbench by segment (flight) { "SeatAvailabilityOfferings": { "@type": "SeatAvailabilityOfferingsBuildFromReservationWorkbench", "BuildFromReservationWorkbench": { "ReservationIdentifier": { "Identifier": { "authority": "Travelport", "value": "8acc7923-1a3c-4817-865c-694e98437b17" } }, "OfferIdentifier": { "Identifier": { "authority": "Travelport", "value": "QUEwMDFIRDFZWVRBN3xQb0lQMzI5REJBMUMtQzI1QS00NDFBLTg4OS0xLTE=" } }, "ProductIdentifier": [ { "Identifier": { "value": "328cbcfe-ed66-4402-94ea-d0df1760d120" } } ], "SegmentSequence": [ "1" ] } } } Example Response For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . The seat map response is nearly identical whether the request was sent after Search, after AirPrice, or in a workbench session. The only difference is that outside a workbench session, TravelerIdentifierRef returns only passengerTypeCode, as there are no traveler details at this point in the workflow. For brevity, all instances of Row after the first two rows have been edited out. Show Example seat map response - after Search, no workbench { "CatalogOfferingsAncillaryListResponse": { "@type": "CatalogOfferingsAncillaryListResponse", "transactionId": "72e79c69-f55d-564a-c2f8-0e8a2d16ac35", "CatalogOfferingsID": [ { "@type": "CatalogOfferingsTravelerFlight", "id": "travflight_1_0", "Identifier": { "value": "43b4fda6-5b3c-4f5d-981b-c43121f27978" }, "CatalogOffering": [ { "@type": "CatalogOffering", "id": "ancillaryID_1_0_1", "Identifier": { "authority": "Travelport", "value": "6fd4aa88-94c5-4375-b05a-a9d992216b55" }, "ProductOptions": [ { "@type": "ProductOptions", "Product": [ { "@type": "ProductSeatAvailability", "id": "productSeatID_1", "SeatAvailability": [ { "seatAvailabilityStatus": "Available", "value": [ "15A", "15B", "15C", "15D", "15E", "15F", "16A", "16B", "16C", "16D", "16E", "16F", "17A", "17B", "17C", "17D", "17E", "17F", "18C", "18D", "18E", "18F", "19A", "19B", "19C", "19D", "19E", "19F", "20C", "20D", "20E", "20F", "22A", "22B", "22C", "25A", "25B", "25C", "25D", "25E", "25F", "26A", "26B", "26C", "26D", "26E", "26F", "27A", "27B", "27C", "27D", "27E", "27F" ] }, { "seatAvailabilityStatus": "Reserved", "value": [ "4A", "4B", "4C", "4D", "4E", "4F", "5A", "5B", "5C", "5D", "5E", "5F", "6A", "6B", "6C", "6D", "6E", "6F", "7A", "7B", "7C", "7D", "7E", "7F", "8A", "8B", "8C", "8D", "8E", "8F", "10A", "10B", "10C", "10D", "10E", "10F", "11A", "11B", "11C", "11D", "11E", "11F", "12A", "12B", "12C", "12D", "12E", "12F", "18A", "18B", "20A", "20B", "21A", "21B", "21C", "21D", "21E", "21F", "22D", "22E", "22F", "23A", "23B", "23C", "23D", "23E", "23F", "24A", "24B", "24C", "24D", "24E", "24F", "29A", "29B", "29C", "29D", "29E", "29F", "30A", "30B", "30C", "30D", "30E", "30F" ] } ], "Brand": { "@type": "Brand", "name": "SEAT ASSIGNMENT" }, "SeatingChartRef": "seatingChart_1" } ] } ], "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 0, "TotalPrice": 0 } }, { "@type": "CatalogOffering", "id": "ancillaryID_1_0_2", "Identifier": { "authority": "Travelport", "value": "7cabe058-1c65-4011-ab16-221adef7fdb9" }, "ProductOptions": [ { "@type": "ProductOptions", "Product": [ { "@type": "ProductSeatAvailability", "id": "productSeatID_2", "SeatAvailability": [ { "seatAvailabilityStatus": "Available", "value": [ "9A", "9B", "9C", "9E", "9F" ] } ], "Brand": { "@type": "Brand", "name": "PREFERRED SEAT" }, "SeatingChartRef": "seatingChart_1" } ] } ], "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 8.18, "TotalTaxes": 0.82, "TotalPrice": 9, "PriceBreakdown": [ { "@type": "PriceBreakdownAncillaryAir", "Amount": { "@type": "Amount", "Taxes": { "@type": "TaxesDetail", "Tax": [ { "taxCode": "UO", "value": 0.82 } ] } } } ] } } ], "TravelerIdentifierRef": [ { "passengerTypeCode": "ADT" } ], "Flight": [ { "@type": "Flight", "distance": 456, "duration": "PT1H35M", "carrier": "QF", "number": "0409", "equipment": "73H", "id": "s1", "Departure": { "@type": "DepartureDetail", "terminal": "3", "location": "SYD", "date": "2024-09-01", "time": "07:00:00" }, "Arrival": { "@type": "ArrivalDetail", "terminal": "1", "location": "MEL", "date": "2024-09-01", "time": "08:35:00" } } ] } ], "Result": { "@type": "Result" }, "Identifier": { "value": "05bf30d6-6394-4679-9566-fa0ccd448373" }, "ReferenceList": [ { "@type": "ReferenceListSeatingChart", "SeatingChart": [ { "@type": "SeatingChart", "id": "seatingChart_1", "Cabin": [ { "@type": "Cabin", "name": "ECONOMY", "Layout": [ { "startRow": 4, "endRow": 30 }, { "position": [ "W" ], "value": "A" }, { "position": [ "C" ], "value": "B" }, { "position": [ "A" ], "value": "C" }, { "position": [ "A" ], "value": "D" }, { "position": [ "C" ], "value": "E" }, { "position": [ "W" ], "value": "F" } ], "Row": [ { "@type": "Row", "label": "4", "Space": [ { "@type": "Space", "location": "A", "Characteristic": [ "BK" ] }, { "@type": "Space", "location": "B", "Characteristic": [ "BK" ] }, { "@type": "Space", "location": "C", "Characteristic": [ "BK" ] }, { "@type": "Space", "location": "D", "Characteristic": [ "BK" ] }, { "@type": "Space", "location": "E", "Characteristic": [ "BK" ] }, { "@type": "Space", "location": "F", "Characteristic": [ "BK" ] } ] }, { "@type": "Row", "label": "5", "Space": [ { "@type": "Space", "location": "A", "Characteristic": [ "BK" ] }, { "@type": "Space", "location": "B", "Characteristic": [ "BK" ] }, { "@type": "Space", "location": "C", "Characteristic": [ "BK" ] }, { "@type": "Space", "location": "D", "Characteristic": [ "BK" ] }, { "@type": "Space", "location": "E", "Characteristic": [ "BK" ] }, { "@type": "Space", "location": "F", "Characteristic": [ "BK" ] } ] } ] } ] } ] } ] } } The following example returns the seat map for a single flight, which offers only free seats, indicated by the single instance of CatalogOffering with a Price/TotalPrice value of 0 . For brevity, all instances of Row after the first two rows have been edited out. Show Example seat map response - GDS, free seats only { "CatalogOfferingsAncillaryListResponse": { "transactionId": "775bac8c-e9f4-2d0a-6322-3cd191d52a77", "CatalogOfferingsID": [ { "@type": "CatalogOfferingsTravelerFlight", "Identifier": { "value": "6832ba78-cb06-4b80-866d-c44ebba780bb" }, "CatalogOffering": [ { "@type": "CatalogOffering", "id": "ancillaryID_1", "ProductOptions": [ { "@type": "ProductOptions", "Product": [ { "@type": "ProductSeatAvailability", "id": "productSeatID_1", "SeatAvailability": [ { "seatAvailabilityStatus": "Available", "value": [ "8A", "8B", "8C", "8D", "9A", "9B", "9C", "9D", "10A", "10B", "10C", "10D", "20A", "20B", "20C", "20D", "21A", "21B", "21C", "21D", "22B", "22C", "22D", "24D" ] }, { "seatAvailabilityStatus": "Reserved", "value": [ "7C", "7D", "19C", "19D" ] }, { "seatAvailabilityStatus": "Blocked", "value": [ "7B", "11A", "11B", "11C", "11D", "12A", "12B", "12C", "12D", "15A", "15B", "15C", "15D", "16A", "16B", "16C", "16D", "17A", "17B", "17C", "17D", "18A", "18B", "18C", "18D" ] } ], "Brand": { "@type": "Brand", "name": "SEAT ASSIGNMENT" }, "SeatingChartRef": "seatingChart_1" } ] } ], "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 0, "TotalPrice": 0 } } ], "TravelerIdentifierRef": [ { "name": "TestFirst TestLast", "passengerTypeCode": "ADT", "id": "trav_1", "value": "b6cf8a88-53c7-4f97-8ebf-e1541fc16e77" } ], "Flight": [ { "@type": "Flight", "distance": 327, "duration": "PT1H29M", "carrier": "UA", "number": "4795", "equipment": "E7W", "id": "f1", "Identifier": { "authority": "Travelport", "value": "8d13fdd8-092e-4310-a2c3-db5f89c7eb58" }, "Departure": { "@type": "DepartureDetail", "location": "BUR", "date": "2022-09-09", "time": "07:24:00" }, "Arrival": { "@type": "ArrivalDetail", "location": "SFO", "date": "2022-09-09", "time": "08:53:00" } } ] } ], "Result": { "@type": "Result" }, "Identifier": { "value": "9ea0dd41-aed7-4cbf-b2c1-283a81a1cbb1" }, "ReferenceList": [ { "@type": "ReferenceListSeatingChart", "SeatingChart": [ { "@type": "SeatingChart", "id": "seatingChart_1", "Cabin": [ { "@type": "Cabin", "name": "ECONOMY", "Layout": [ { "startRow": 7, "endRow": 24 }, { "position": [ "W" ], "value": "A" }, { "position": [ "A" ], "value": "B" }, { "position": [ "A" ], "value": "C" }, { "position": [ "W" ], "value": "D" } ], "Row": [ { "@type": "Row", "label": "7", "Space": [ { "@type": "Space", "location": "B", "Characteristic": [ "A", "N", "CH" ] }, { "@type": "Space", "location": "C", "Characteristic": [ "BK" ] }, { "@type": "Space", "location": "D", "Characteristic": [ "BK" ] } ] }, { "@type": "Row", "label": "8", "Space": [ { "@type": "Space", "location": "A", "Characteristic": [ "N", "W", "O" ] }, { "@type": "Space", "location": "B", "Characteristic": [ "A", "N", "O" ] }, { "@type": "Space", "location": "C", "Characteristic": [ "A", "N", "O" ] }, { "@type": "Space", "location": "D", "Characteristic": [ "N", "W", "O" ] } ] ] } ] } ] } ] } } The following seat map response for NDC (CatalogOffering/Identifier/authority returns a carrier code instead of the value Travelport ) returns both free seats (price of 0) and paid seats (price of 60), each in a separate instance of CatalogOffering. For brevity, all instances of Row after the first two rows have been edited out. Show Example seat map response - NDC, free and paid seats { "CatalogOfferingsAncillaryListResponse": { "@type": "CatalogOfferingsAncillaryListResponse", "CatalogOfferingsID": [ { "@type": "CatalogOfferingsTravelerFlight", "Identifier": { "authority": "Travelport", "value": "0aa46b7b-1f05-42e1-8cd8-6d2796e3fb71" }, "CatalogOffering": [ { "@type": "CatalogOffering", "Identifier": { "authority": "SQ", "value": "UFJJQ0UyLVNFRzR8UEFYMXxTRUc0fHRyYXZfMQ==" }, "ProductOptions": [ { "@type": "ProductOptions", "Product": [ { "@type": "ProductSeatAvailability", "SeatAvailability": [ { "seatAvailabilityStatus": "Available", "value": [ "32C", "32H", "32K", "33A", "33C", "33E", "33F", "33H", "33K", "34A", "34C", "34D", "34E", "34F", "34G", "34H", "34K", "35A", "35C", "35D", "35E", "35F", "35G", "35H", "35K", "36A", "36C", "36D", "36E", "36F", "36G", "36H", "36K", "37A", "37C", "37H", "37K" ] }, { "seatAvailabilityStatus": "Unavailable", "value": [ "32A", "33D", "33G" ] } ], "Brand": { "@type": "Brand", "name": "FREE SEAT", "id": "brand_2" }, "SeatingChartRef": "seatingChart_p0s1108" } ] } ], "Price": { "@type": "PriceDetail", "id": "UFJJQ0UyLVNFRzQ=", "CurrencyCode": { "value": "USD" }, "Base": 0, "TotalPrice": 0 } }, { "@type": "CatalogOffering", "Identifier": { "authority": "SQ", "value": "UFJJQ0UxLVNFRzR8UEFYMXxTRUc0fHRyYXZfMQ==" }, "ProductOptions": [ { "@type": "ProductOptions", "Product": [ { "@type": "ProductSeatAvailability", "SeatAvailability": [ { "seatAvailabilityStatus": "Available", "value": [ "31A", "31C", "31H", "31K" ] } ], "Brand": { "@type": "Brand", "name": "PREMIUM SEAT", "id": "brand_1" }, "SeatingChartRef": "seatingChart_p0s1108" } ] } ], "Price": { "@type": "PriceDetail", "id": "UFJJQ0UxLVNFRzQ=", "CurrencyCode": { "value": "USD" }, "Base": 60, "TotalPrice": 60 } } ], "TravelerIdentifierRef": [ { "name": " TestFirst TestLast", "passengerTypeCode": "ADT", "id": "trav_1", "value": "231b07de-5c98-4656-a9e1-0072697fbcca" } ], "Flight": [ { "@type": "Flight", "stops": 0, "duration": "PT4H", "carrier": "SQ", "number": "893", "operatingCarrier": "SQ", "operatingCarrierName": "SINGAPORE AIRLINES", "equipment": "388", "id": "s1108", "Identifier": { "value": "SEG4" }, "Departure": { "@type": "DepartureDetail", "terminal": "1", "location": "HKG", "date": "2024-01-21", "time": "15:45:00" }, "Arrival": { "@type": "ArrivalDetail", "terminal": "0", "location": "SIN", "date": "2024-01-21", "time": "19:45:00" } } ] } ], "Identifier": { "authority": "Travelport", "value": "16f35ce4-9b14-4c34-af3e-9979116cca1a" }, "ReferenceList": [ { "@type": "ReferenceListSeatingChart", "SeatingChart": [ { "@type": "SeatingChart", "id": "seatingChart_p0s1108", "Cabin": [ { "@type": "Cabin", "name": "S", "Layout": [ { "position": [ "W" ], "value": "A" }, { "position": [ "A" ], "value": "C" }, { "position": [ "A" ], "value": "H" }, { "position": [ "W" ], "value": "K" }, { "position": [ "A" ], "value": "D" }, { "position": [ "C" ], "value": "E" }, { "position": [ "C" ], "value": "F" }, { "position": [ "A" ], "value": "G" }, { "startRow": 31, "endRow": 37 } ], "Row": [ { "@type": "Row", "label": "31", "Space": [ { "@type": "Space", "location": "A", "Characteristic": [ "CH", "L", "W" ] }, { "@type": "Space", "location": "C", "Characteristic": [ "A", "CH", "I", "L" ] }, { "@type": "Space", "location": "H", "Characteristic": [ "A", "CH", "I", "L" ] }, { "@type": "Space", "location": "K", "Characteristic": [ "CH", "L", "W" ] } ] }, { "@type": "Row", "label": "32", "Space": [ { "@type": "Space", "location": "A", "Characteristic": [ "W" ] }, { "@type": "Space", "location": "C", "Characteristic": [ "A", "H" ] }, { "@type": "Space", "location": "H", "Characteristic": [ "A", "H" ] }, { "@type": "Space", "location": "K", "Characteristic": [ "W" ] } ] }, { "@type": "Row", "label": "33", "Space": [ { "@type": "Space", "location": "A", "Characteristic": [ "W" ] }, { "@type": "Space", "location": "C", "Characteristic": [ "A", "H", "I" ] }, { "@type": "Space", "location": "D", "Characteristic": [ "1", "A", "B", "I" ] }, { "@type": "Space", "location": "E", "Characteristic": [ "9" ] }, { "@type": "Space", "location": "F", "Characteristic": [ "9", "I" ] }, { "@type": "Space", "location": "G", "Characteristic": [ "1", "A", "B", "I" ] }, { "@type": "Space", "location": "H", "Characteristic": [ "A", "H", "I" ] }, { "@type": "Space", "location": "K", "Characteristic": [ "W" ] } ] } ] } ] } ] } ] } } When Seat Map is sent for flight/s in a booking that already have seat assignments, the response inlcudes HeldAncillary to list the current SeatAssignment for each traveler on the flight/s. This supports modifying seats by holding the current seats until the new seats are successfully booked at workbench commit, ensuring those seats remain available in case of a booking failure. For brevity, the objects in Cabin/Layout and Cabin/Row have been removed from this example. Show Example seat map response for booking with existing seat assignments The current seat assignments are returned in HeldAncillary starting on line 328. { "CatalogOfferingsAncillaryListResponse": { "@type": "CatalogOfferingsAncillaryListResponse", "transactionId": "7a8308c5-3341-4066-ab0a-61aab0b09321", "traceId": "f5a9dc78-3a77-4b0b-8fa9-4a49d489df76", "CatalogOfferingsID": [ { "@type": "CatalogOfferingsTravelerFlight", "id": "travflight_1_0", "Identifier": { "value": "ac32d92c-64fd-4820-83b7-7fe86ba5e7a0" }, "CatalogOffering": [ { "@type": "CatalogOffering", "id": "ancillaryID_1_0_1", "Identifier": { "authority": "Travelport", "value": "07d250e7-f015-447d-989e-d47e455ee335" }, "ProductOptions": [ { "@type": "ProductOptions", "Product": [ { "@type": "ProductSeatAvailability", "id": "productSeatID_1", "SeatAvailability": [ { "seatAvailabilityStatus": "Available", "value": [ "5A", "5B", "5C", "5E", "5F", "6A", "6B", "6C", "6E", "6F", "7A", "7B", "7C", "7E", "7F", "8A", "8B", "8C", "8E", "8F", "15A", "15B", "15C", "15D", "15E", "15F", "16A", "16B", "16C", "16D", "16E", "16F", "17A", "17B", "17C", "17D", "17E", "17F", "18A", "18B", "18C", "18D", "18E", "18F", "19A", "19B", "19C", "19D", "19E", "19F", "20A", "20B", "20C", "20D", "20E", "20F", "21A", "21B", "21C", "21D", "21E", "21F", "22A", "22B", "22C", "22D", "22E", "22F", "23A", "23B", "23C", "23D", "23E", "23F", "24A", "24B", "24C", "24D", "24E", "24F", "25A", "25B", "25C", "25D", "25E", "25F", "26A", "26B", "26D", "26E", "26F", "27A", "27B", "27C", "27D", "27E", "27F" ] }, { "seatAvailabilityStatus": "Reserved", "value": [ "9A", "9F", "10A", "10B", "10C", "10D", "10E", "10F", "11A", "11B", "11C", "11D", "11E", "11F", "12A", "12B", "12C", "12D", "12E", "12F", "13D", "26C", "29A", "29B", "29C", "29D", "29E", "29F", "30A", "30B", "30C", "30D", "30E", "30F" ] } ], "Brand": { "@type": "Brand", "name": "SEAT ASSIGNMENT" }, "SeatingChartRef": "seatingChart_1" } ] } ], "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "GBP" }, "Base": 0, "TotalPrice": 0 } }, { "@type": "CatalogOffering", "id": "ancillaryID_1_0_2", "Identifier": { "authority": "Travelport", "value": "b9e0100a-a5e4-4134-be87-e4e4dbb48953" }, "ProductOptions": [ { "@type": "ProductOptions", "Product": [ { "@type": "ProductSeatAvailability", "id": "productSeatID_2", "SeatAvailability": [ { "seatAvailabilityStatus": "Reserved", "value": [ "4A", "4B", "4C", "4D", "4E", "4F" ] } ], "Brand": { "@type": "Brand", "name": "EXTRA LEGROOM" }, "SeatingChartRef": "seatingChart_1" } ] } ], "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "GBP" }, "Base": 45, "TotalTaxes": 0, "TotalPrice": 45, "PriceBreakdown": [ { "@type": "PriceBreakdownAncillaryAir", "Amount": { "@type": "Amount", "Taxes": { "@type": "TaxesDetail", "Tax": [ { "value": 0 } ] } } } ] } }, { "@type": "CatalogOffering", "id": "ancillaryID_1_0_3", "Identifier": { "authority": "Travelport", "value": "cce684c1-a193-47b7-ac38-413c20a44d40" }, "ProductOptions": [ { "@type": "ProductOptions", "Product": [ { "@type": "ProductSeatAvailability", "id": "productSeatID_3", "SeatAvailability": [ { "seatAvailabilityStatus": "Available", "value": [ "9B", "9C", "9E" ] } ], "Brand": { "@type": "Brand", "name": "PREFERRED SEAT" }, "SeatingChartRef": "seatingChart_1" } ] } ], "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "GBP" }, "Base": 10, "TotalTaxes": 0, "TotalPrice": 10, "PriceBreakdown": [ { "@type": "PriceBreakdownAncillaryAir", "Amount": { "@type": "Amount", "Taxes": { "@type": "TaxesDetail", "Tax": [ { "value": 0 } ] } } } ] } } ], "TravelerIdentifierRef": [ { "name": "RAMESH KK", "passengerTypeCode": "ADT", "id": "travelerRefId_1", "value": "70243488-bcfa-458c-9c3f-604a9d769c57" }, { "name": "SARAN KUMAR", "passengerTypeCode": "CHD", "id": "travelerRefId_2", "value": "c89cdd15-0410-4dfe-b85b-df95fbb6b099" } ], "HeldAncillary": [ { "@type": "HeldAncillary", "travelerRef": "travelerRefId_1", "Ancillary": { "@type": "AncillaryAirSeat", "FlightRef": [ "Flight_01" ], "SeatAssignment": { "@type": "SeatAssignment", "Seat": "009A" } } }, { "@type": "HeldAncillary", "travelerRef": "travelerRefId_2", "Ancillary": { "@type": "AncillaryAirSeat", "FlightRef": [ "Flight_01" ], "SeatAssignment": { "@type": "SeatAssignment", "Seat": "009F" } } } ], "Flight": [ { "@type": "Flight", "duration": "PT4H30M", "carrier": "QF", "number": "0932", "equipment": "73H", "id": "Flight_01", "Identifier": { "authority": "Travelport", "value": "42612123-43e4-4452-91e5-ee2dea0dc5eb" }, "Departure": { "@type": "DepartureDetail", "location": "PER", "date": "2024-11-23", "time": "06:00:00" }, "Arrival": { "@type": "ArrivalDetail", "location": "BNE", "date": "2024-11-23", "time": "12:30:00" } } ] } ], "Result": { "@type": "Result" }, "Identifier": { "value": "a53cf939-9491-4128-8790-af963dc8d505" }, "ReferenceList": [ { "@type": "ReferenceListSeatingChart", "SeatingChart": [ { "@type": "SeatingChart", "id": "seatingChart_1", "Cabin": [ { "@type": "Cabin", "name": "ECONOMY", "Layout": [...], "Row": [...] } ] } ] } ] } }

## Literal `<pre>` excerpts from HTML

### Block 1

```
"Layout": [
                                    {
                                        "startRow": 4,
                                        "endRow": 30
                                    },
                                    {
                                        "position": [
                                            "W"
                                        ],
                                        "value": "A"
                                    },
                                    {
                                        "position": [
                                            "C"
                                        ],
                                        "value": "B"
                                    },
                                    {
                                        "position": [
                                            "A"
                                        ],
                                        "value": "C"
                                    },
                                    {
                                        "position": [
                                            "A"
                                        ],
                                        "value": "D"
                                    },
                                    {
                                        "position": [
                                            "C"
                                        ],
                                        "value": "E"
                                    },
                                    {
                                        "position": [
                                            "W"
                                        ],
                                        "value": "F"
                                    }
                                ],
```

### Block 2

```
{
 "CatalogOfferingsQuerySeatAvailability": {
  "SeatAvailabilityOfferings": {
   "@type": "SeatAvailabilityOfferingsBuildFromCatalogProductOfferings",
   "BuildFromCatalogProductOfferingsRequest": {
    "@type": "BuildFromCatalogProductOfferingsRequest",
    "CatalogProductOfferingsIdentifier": {
     "id": "catalogProductOfferings_1",
     "Identifier": {
      "value": "49b89a59-b5f3-459a-ab75-633c50b86c0b",
      "authority": "Travelport"
     }
    },
    "CatalogProductOfferingSelection": [
     {
      "@type": "CatalogProductOfferingSelection",
      "CatalogProductOfferingIdentifier": {
       "id": "o1"
      },
      "ProductIdentifier": [
       {
        "id": "p0"
       }
      ]
     }
    ]
   }
  }
 }
}
```

### Block 3

```
{
 "CatalogOfferingsQuerySeatAvailability": {
  "SeatAvailabilityOfferings": {
   "@type": "SeatAvailabilityOfferingsBuildFromOfferList",
   "BuildFromOfferList": {
    "OfferListIdentifier": "d10083bd-9dd1-4337-86b7-f12403550fa6_PC",
    "OfferIdentifier": [
     {
      "id": "o0"
     }
    ],
    "ProductIdentifier": [
     {
      "id": "p0"
     },
     {
      "id": "p1"
     }
    ],
    "SegmentSequence": 1
   }
  }
 }
}
```

### Block 4

```
{
  "CatalogOfferingsQuerySeatAvailability": {
    "SeatAvailabilityOfferings": {
      "@type": "SeatAvailabilityOfferingsBuildFromReservationWorkbench",
      "BuildFromReservationWorkbench": {
        "ReservationIdentifier": {
          "Identifier": {
            "value": "bc3df585-1194-4e39-83a6-e9c721c175a5"
          }
        },
        "OfferIdentifier": {
          "Identifier": {
            "authority": "Travelport",
            "value": "5f476fac-f5a8-439f-9c54-61249cd311dc"
          }
        }
      }
    }
  }
}
```

### Block 5

```
{
  "CatalogOfferingsQuerySeatAvailability": {
    "SeatAvailabilityOfferings": {
      "@type": "SeatAvailabilityOfferingsBuildFromReservationWorkbench",
      "BuildFromReservationWorkbench": {
        "ReservationIdentifier": {
          "Identifier": {
            "value": "363cddbf-cb91-4864-b3f2-757e71a23a3e"
          }
        },
        "OfferIdentifier": {
          "Identifier": {
            "authority": "Travelport",
            "value": "73c39631-7208-4f74-abb2-1d4c7dd65a59"
          }
        },
        "ProductIdentifier": [
          {
            "Identifier": {
              "authority": "Travelport",
              "value": "2bcb6bc7-656b-4dbc-bacf-b0d80748d314"
            }
          },
          {
            "Identifier": {
              "authority": "Travelport",
              "value": "9835b084-0b18-4d1c-bc61-062842cb73b7"
            }
          }
        ]
      }
    }
  }
}
```

### Block 6

```
{
    "SeatAvailabilityOfferings": {
        "@type": "SeatAvailabilityOfferingsBuildFromReservationWorkbench",
        "BuildFromReservationWorkbench": {
            "ReservationIdentifier": {
                "Identifier": {
                    "authority": "Travelport",
                    "value": "8acc7923-1a3c-4817-865c-694e98437b17"
                }
            },
            "OfferIdentifier": {
                "Identifier": {
                    "authority": "Travelport",
                    "value": "QUEwMDFIRDFZWVRBN3xQb0lQMzI5REJBMUMtQzI1QS00NDFBLTg4OS0xLTE="
                }
            },
            "ProductIdentifier": [
                {
                    "Identifier": {
                        "value": "328cbcfe-ed66-4402-94ea-d0df1760d120"
                    }
                }
            ],
            "SegmentSequence": [
                "1"
            ]
        }
    }
}
```

### Block 7

```
{
 "CatalogOfferingsAncillaryListResponse": {
  "@type": "CatalogOfferingsAncillaryListResponse",
  "transactionId": "72e79c69-f55d-564a-c2f8-0e8a2d16ac35",
  "CatalogOfferingsID": [
   {
    "@type": "CatalogOfferingsTravelerFlight",
    "id": "travflight_1_0",
    "Identifier": {
     "value": "43b4fda6-5b3c-4f5d-981b-c43121f27978"
    },
    "CatalogOffering": [
     {
      "@type": "CatalogOffering",
      "id": "ancillaryID_1_0_1",
      "Identifier": {
       "authority": "Travelport",
       "value": "6fd4aa88-94c5-4375-b05a-a9d992216b55"
      },
      "ProductOptions": [
       {
        "@type": "ProductOptions",
        "Product": [
         {
          "@type": "ProductSeatAvailability",
          "id": "productSeatID_1",
          "SeatAvailability": [
           {
            "seatAvailabilityStatus": "Available",
            "value": [
             "15A",
             "15B",
             "15C",
             "15D",
             "15E",
             "15F",
             "16A",
             "16B",
             "16C",
             "16D",
             "16E",
             "16F",
             "17A",
             "17B",
             "17C",
             "17D",
             "17E",
             "17F",
             "18C",
             "18D",
             "18E",
             "18F",
             "19A",
             "19B",
             "19C",
             "19D",
             "19E",
             "19F",
             "20C",
             "20D",
             "20E",
             "20F",
             "22A",
             "22B",
             "22C",
             "25A",
             "25B",
             "25C",
             "25D",
             "25E",
             "25F",
             "26A",
             "26B",
             "26C",
             "26D",
             "26E",
             "26F",
             "27A",
             "27B",
             "27C",
             "27D",
             "27E",
             "27F"
            ]
           },
           {
            "seatAvailabilityStatus": "Reserved",
            "value": [
             "4A",
             "4B",
             "4C",
             "4D",
             "4E",
             "4F",
             "5A",
             "5B",
             "5C",
             "5D",
             "5E",
             "5F",
             "6A",
             "6B",
             "6C",
             "6D",
             "6E",
             "6F",
             "7A",
             "7B",
             "7C",
             "7D",
             "7E",
             "7F",
             "8A",
             "8B",
             "8C",
             "8D",
             "8E",
             "8F",
             "10A",
             "10B",
             "10C",
             "10D",
             "10E",
             "10F",
             "11A",
             "11B",
             "11C",
             "11D",
             "11E",
             "11F",
             "12A",
             "12B",
             "12C",
             "12D",
             "12E",
             "12F",
             "18A",
             "18B",
             "20A",
             "20B",
             "21A",
             "21B",
             "21C",
             "21D",
             "21E",
             "21F",
             "22D",
             "22E",
             "22F",
             "23A",
             "23B",
             "23C",
             "23D",
             "23E",
             "23F",
             "24A",
             "24B",
             "24C",
             "24D",
             "24E",
             "24F",
             "29A",
             "29B",
             "29C",
             "29D",
             "29E",
             "29F",
             "30A",
             "30B",
             "30C",
             "30D",
             "30E",
             "30F"
            ]
           }
          ],
          "Brand": {
           "@type": "Brand",
           "name": "SEAT ASSIGNMENT"
          },
          "SeatingChartRef": "seatingChart_1"
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
       "Base": 0,
       "TotalPrice": 0
      }
     },
     {
      "@type": "CatalogOffering",
      "id": "ancillaryID_1_0_2",
      "Identifier": {
       "authority": "Travelport",
       "value": "7cabe058-1c65-4011-ab16-221adef7fdb9"
      },
      "ProductOptions": [
       {
        "@type": "ProductOptions",
        "Product": [
         {
          "@type": "ProductSeatAvailability",
          "id": "productSeatID_2",
          "SeatAvailability": [
           {
            "seatAvailabilityStatus": "Available",
            "value": [
             "9A",
             "9B",
             "9C",
             "9E",
             "9F"
            ]
           }
          ],
          "Brand": {
           "@type": "Brand",
           "name": "PREFERRED SEAT"
          },
          "SeatingChartRef": "seatingChart_1"
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
       "Base": 8.18,
       "TotalTaxes": 0.82,
       "TotalPrice": 9,
       "PriceBreakdown": [
        {
         "@type": "PriceBreakdownAncillaryAir",
         "Amount": {
          "@type": "Amount",
          "Taxes": {
           "@type": "TaxesDetail",
           "Tax": [
            {
             "taxCode": "UO",
             "value": 0.82
            }
           ]
          }
         }
        }
       ]
      }
     }
    ],
    "TravelerIdentifierRef": [
     {
      "passengerTypeCode": "ADT"
     }
    ],
    "Flight": [
     {
      "@type": "Flight",
      "distance": 456,
      "duration": "PT1H35M",
      "carrier": "QF",
      "number": "0409",
      "equipment": "73H",
      "id": "s1",
      "Departure": {
       "@type": "DepartureDetail",
       "terminal": "3",
       "location": "SYD",
       "date": "2024-09-01",
       "time": "07:00:00"
      },
      "Arrival": {
       "@type": "ArrivalDetail",
       "terminal": "1",
       "location": "MEL",
       "date": "2024-09-01",
       "time": "08:35:00"
      }
     }
    ]
   }
  ],
  "Result": {
   "@type": "Result"
  },
  "Identifier": {
   "value": "05bf30d6-6394-4679-9566-fa0ccd448373"
  },
  "ReferenceList": [
   {
    "@type": "ReferenceListSeatingChart",
    "SeatingChart": [
     {
      "@type": "SeatingChart",
      "id": "seatingChart_1",
      "Cabin": [
       {
        "@type": "Cabin",
        "name": "ECONOMY",
        "Layout": [
         {
          "startRow": 4,
          "endRow": 30
         },
         {
          "position": [
           "W"
          ],
          "value": "A"
         },
         {
          "position": [
           "C"
          ],
          "value": "B"
         },
         {
          "position": [
           "A"
          ],
          "value": "C"
         },
         {
          "position": [
           "A"
          ],
          "value": "D"
         },
         {
          "position": [
           "C"
          ],
          "value": "E"
         },
         {
          "position": [
           "W"
          ],
          "value": "F"
         }
        ],
        "Row": [
         {
          "@type": "Row",
          "label": "4",
          "Space": [
           {
            "@type": "Space",
            "location": "A",
            "Characteristic": [
             "BK"
            ]
           },
           {
            "@type": "Space",
            "location": "B",
            "Characteristic": [
             "BK"
            ]
           },
           {
            "@type": "Space",

…
```

### Block 8

```
{
 "CatalogOfferingsAncillaryListResponse": {
  "transactionId": "775bac8c-e9f4-2d0a-6322-3cd191d52a77",
  "CatalogOfferingsID": [
   {
    "@type": "CatalogOfferingsTravelerFlight",
    "Identifier": {
     "value": "6832ba78-cb06-4b80-866d-c44ebba780bb"
    },
    "CatalogOffering": [
     {
      "@type": "CatalogOffering",
      "id": "ancillaryID_1",
      "ProductOptions": [
       {
        "@type": "ProductOptions",
        "Product": [
         {
          "@type": "ProductSeatAvailability",
          "id": "productSeatID_1",
          "SeatAvailability": [
           {
            "seatAvailabilityStatus": "Available",
            "value": [
             "8A",
             "8B",
             "8C",
             "8D",
             "9A",
             "9B",
             "9C",
             "9D",
             "10A",
             "10B",
             "10C",
             "10D",
             "20A",
             "20B",
             "20C",
             "20D",
             "21A",
             "21B",
             "21C",
             "21D",
             "22B",
             "22C",
             "22D",
             "24D"
            ]
           },
           {
            "seatAvailabilityStatus": "Reserved",
            "value": [
             "7C",
             "7D",
             "19C",
             "19D"
            ]
           },
           {
            "seatAvailabilityStatus": "Blocked",
            "value": [
             "7B",
             "11A",
             "11B",
             "11C",
             "11D",
             "12A",
             "12B",
             "12C",
             "12D",
             "15A",
             "15B",
             "15C",
             "15D",
             "16A",
             "16B",
             "16C",
             "16D",
             "17A",
             "17B",
             "17C",
             "17D",
             "18A",
             "18B",
             "18C",
             "18D"
            ]
           }
          ],
          "Brand": {
           "@type": "Brand",
           "name": "SEAT ASSIGNMENT"
          },
          "SeatingChartRef": "seatingChart_1"
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
       "Base": 0,
       "TotalPrice": 0
      }
     }
    ],
    "TravelerIdentifierRef": [
     {
      "name": "TestFirst TestLast",
      "passengerTypeCode": "ADT",
      "id": "trav_1",
      "value": "b6cf8a88-53c7-4f97-8ebf-e1541fc16e77"
     }
    ],
    "Flight": [
     {
      "@type": "Flight",
      "distance": 327,
      "duration": "PT1H29M",
      "carrier": "UA",
      "number": "4795",
      "equipment": "E7W",
      "id": "f1",
      "Identifier": {
       "authority": "Travelport",
       "value": "8d13fdd8-092e-4310-a2c3-db5f89c7eb58"
      },
      "Departure": {
       "@type": "DepartureDetail",
       "location": "BUR",
       "date": "2022-09-09",
       "time": "07:24:00"
      },
      "Arrival": {
       "@type": "ArrivalDetail",
       "location": "SFO",
       "date": "2022-09-09",
       "time": "08:53:00"
      }
     }
    ]
   }
  ],
  "Result": {
   "@type": "Result"
  },
  "Identifier": {
   "value": "9ea0dd41-aed7-4cbf-b2c1-283a81a1cbb1"
  },
  "ReferenceList": [
   {
    "@type": "ReferenceListSeatingChart",
    "SeatingChart": [
     {
      "@type": "SeatingChart",
      "id": "seatingChart_1",
      "Cabin": [
       {
        "@type": "Cabin",
        "name": "ECONOMY",
        "Layout": [
         {
          "startRow": 7,
          "endRow": 24
         },
         {
          "position": [
           "W"
          ],
          "value": "A"
         },
         {
          "position": [
           "A"
          ],
          "value": "B"
         },
         {
          "position": [
           "A"
          ],
          "value": "C"
         },
         {
          "position": [
           "W"
          ],
          "value": "D"
         }
        ],
        "Row": [
         {
          "@type": "Row",
          "label": "7",
          "Space": [
           {
            "@type": "Space",
            "location": "B",
            "Characteristic": [
             "A",
             "N",
             "CH"
            ]
           },
           {
            "@type": "Space",
            "location": "C",
            "Characteristic": [
             "BK"
            ]
           },
           {
            "@type": "Space",
            "location": "D",
            "Characteristic": [
             "BK"
            ]
           }
          ]
         },
         {
          "@type": "Row",
          "label": "8",
          "Space": [
           {
            "@type": "Space",
            "location": "A",
            "Characteristic": [
             "N",
             "W",
             "O"
            ]
           },
           {
            "@type": "Space",
            "location": "B",
            "Characteristic": [
             "A",
             "N",
             "O"
            ]
           },
           {
            "@type": "Space",
            "location": "C",
            "Characteristic": [
             "A",
             "N",
             "O"
            ]
           },
           {
            "@type": "Space",
            "location": "D",
            "Characteristic": [
             "N",
             "W",
             "O"
            ]
           }
          ]
        ]
       }
      ]
     }
    ]
   }
  ]
 }
}
```

### Block 9

```
{
 "CatalogOfferingsAncillaryListResponse": {
  "@type": "CatalogOfferingsAncillaryListResponse",
  "CatalogOfferingsID": [
   {
    "@type": "CatalogOfferingsTravelerFlight",
    "Identifier": {
     "authority": "Travelport",
     "value": "0aa46b7b-1f05-42e1-8cd8-6d2796e3fb71"
    },
    "CatalogOffering": [
     {
      "@type": "CatalogOffering",
      "Identifier": {
       "authority": "SQ",
       "value": "UFJJQ0UyLVNFRzR8UEFYMXxTRUc0fHRyYXZfMQ=="
      },
      "ProductOptions": [
       {
        "@type": "ProductOptions",
        "Product": [
         {
          "@type": "ProductSeatAvailability",
          "SeatAvailability": [
           {
            "seatAvailabilityStatus": "Available",
            "value": [
             "32C",
             "32H",
             "32K",
             "33A",
             "33C",
             "33E",
             "33F",
             "33H",
             "33K",
             "34A",
             "34C",
             "34D",
             "34E",
             "34F",
             "34G",
             "34H",
             "34K",
             "35A",
             "35C",
             "35D",
             "35E",
             "35F",
             "35G",
             "35H",
             "35K",
             "36A",
             "36C",
             "36D",
             "36E",
             "36F",
             "36G",
             "36H",
             "36K",
             "37A",
             "37C",
             "37H",
             "37K"
            ]
           },
           {
            "seatAvailabilityStatus": "Unavailable",
            "value": [
             "32A",
             "33D",
             "33G"
            ]
           }
          ],
          "Brand": {
           "@type": "Brand",
           "name": "FREE SEAT",
           "id": "brand_2"
          },
          "SeatingChartRef": "seatingChart_p0s1108"
         }
        ]
       }
      ],
      "Price": {
       "@type": "PriceDetail",
       "id": "UFJJQ0UyLVNFRzQ=",
       "CurrencyCode": {
        "value": "USD"
       },
       "Base": 0,
       "TotalPrice": 0
      }
     },
     {
      "@type": "CatalogOffering",
      "Identifier": {
       "authority": "SQ",
       "value": "UFJJQ0UxLVNFRzR8UEFYMXxTRUc0fHRyYXZfMQ=="
      },
      "ProductOptions": [
       {
        "@type": "ProductOptions",
        "Product": [
         {
          "@type": "ProductSeatAvailability",
          "SeatAvailability": [
           {
            "seatAvailabilityStatus": "Available",
            "value": [
             "31A",
             "31C",
             "31H",
             "31K"
            ]
           }
          ],
          "Brand": {
           "@type": "Brand",
           "name": "PREMIUM SEAT",
           "id": "brand_1"
          },
          "SeatingChartRef": "seatingChart_p0s1108"
         }
        ]
       }
      ],
      "Price": {
       "@type": "PriceDetail",
       "id": "UFJJQ0UxLVNFRzQ=",
       "CurrencyCode": {
        "value": "USD"
       },
       "Base": 60,
       "TotalPrice": 60
      }
     }
    ],
    "TravelerIdentifierRef": [
     {
      "name": " TestFirst TestLast",
      "passengerTypeCode": "ADT",
      "id": "trav_1",
      "value": "231b07de-5c98-4656-a9e1-0072697fbcca"
     }
    ],
    "Flight": [
     {
      "@type": "Flight",
      "stops": 0,
      "duration": "PT4H",
      "carrier": "SQ",
      "number": "893",
      "operatingCarrier": "SQ",
      "operatingCarrierName": "SINGAPORE AIRLINES",
      "equipment": "388",
      "id": "s1108",
      "Identifier": {
       "value": "SEG4"
      },
      "Departure": {
       "@type": "DepartureDetail",
       "terminal": "1",
       "location": "HKG",
       "date": "2024-01-21",
       "time": "15:45:00"
      },
      "Arrival": {
       "@type": "ArrivalDetail",
       "terminal": "0",
       "location": "SIN",
       "date": "2024-01-21",
       "time": "19:45:00"
      }
     }
    ]
   }
  ],
  "Identifier": {
   "authority": "Travelport",
   "value": "16f35ce4-9b14-4c34-af3e-9979116cca1a"
  },
  "ReferenceList": [
   {
    "@type": "ReferenceListSeatingChart",
    "SeatingChart": [
     {
      "@type": "SeatingChart",
      "id": "seatingChart_p0s1108",
      "Cabin": [
       {
        "@type": "Cabin",
        "name": "S",
        "Layout": [
         {
          "position": [
           "W"
          ],
          "value": "A"
         },
         {
          "position": [
           "A"
          ],
          "value": "C"
         },
         {
          "position": [
           "A"
          ],
          "value": "H"
         },
         {
          "position": [
           "W"
          ],
          "value": "K"
         },
         {
          "position": [
           "A"
          ],
          "value": "D"
         },
         {
          "position": [
           "C"
          ],
          "value": "E"
         },
         {
          "position": [
           "C"
          ],
          "value": "F"
         },
         {
          "position": [
           "A"
          ],
          "value": "G"
         },
         {
          "startRow": 31,
          "endRow": 37
         }
        ],
        "Row": [
         {
          "@type": "Row",
          "label": "31",
          "Space": [
           {
            "@type": "Space",
            "location": "A",
            "Characteristic": [
             "CH",
             "L",
             "W"
            ]
           },
           {
            "@type": "Space",
            "location": "C",
            "Characteristic": [
             "A",
             "CH",
             "I",
             "L"
            ]
           },
           {
            "@type": "Space",
            "location": "H",
            "Characteristic": [
             "A",
             "CH",
             "I",
             "L"
            ]
           },
           {
            "@type": "Space",
            "location": "K",
            "Characteristic": [
             "CH",
             "L",
             "W"
            ]
           }
          ]
         },
         {
          "@type": "Row",
          "label": "32",
          "Space": [
           {
            "@type": "Space",
            "location": "A",
            "Characteristic": [
             "W"
            ]
           },
           {
            "@type": "Space",
            "location": "C",
            "Characteristic": [
             "A",
             "H"
            ]
           },
           {
            "@type": "Space",
            "location": "H",
            "Characteristic": [
             "A",
             "H"
            ]
           },
           {
            "@type": "Space",
            "location": "K",
            "Characteristic": [
             "W"
            ]
           }
          ]
         },
         {
          "@type": "Row",
          "label": "33",
          "Space": [
           {
            "@type": "Space",
            "location": "A",
            "Characteristic": [
             "W"
            ]
           },
           {
            "@type": "Space",
            "location": "C",
            "Characteristic": [
             "A",
             "H",
             "I"
            ]
           },
           {
            "@type": "Space",
            "location": "D",
            "Characteristic": [
             "1",
             "A",
             "B",
             "I"
            ]
           },
           {
            "@type": "Space",
            "location": "E",
            "Characteristic": [
             "9"
            ]
           },
           {
            "@type": "Space",
        
…
```

### Block 10

```
{
 "CatalogOfferingsAncillaryListResponse": {
  "@type": "CatalogOfferingsAncillaryListResponse",
  "transactionId": "7a8308c5-3341-4066-ab0a-61aab0b09321",
  "traceId": "f5a9dc78-3a77-4b0b-8fa9-4a49d489df76",
  "CatalogOfferingsID": [
   {
    "@type": "CatalogOfferingsTravelerFlight",
    "id": "travflight_1_0",
    "Identifier": {
     "value": "ac32d92c-64fd-4820-83b7-7fe86ba5e7a0"
    },
    "CatalogOffering": [
     {
      "@type": "CatalogOffering",
      "id": "ancillaryID_1_0_1",
      "Identifier": {
       "authority": "Travelport",
       "value": "07d250e7-f015-447d-989e-d47e455ee335"
      },
      "ProductOptions": [
       {
        "@type": "ProductOptions",
        "Product": [
         {
          "@type": "ProductSeatAvailability",
          "id": "productSeatID_1",
          "SeatAvailability": [
           {
            "seatAvailabilityStatus": "Available",
            "value": [
             "5A",
             "5B",
             "5C",
             "5E",
             "5F",
             "6A",
             "6B",
             "6C",
             "6E",
             "6F",
             "7A",
             "7B",
             "7C",
             "7E",
             "7F",
             "8A",
             "8B",
             "8C",
             "8E",
             "8F",
             "15A",
             "15B",
             "15C",
             "15D",
             "15E",
             "15F",
             "16A",
             "16B",
             "16C",
             "16D",
             "16E",
             "16F",
             "17A",
             "17B",
             "17C",
             "17D",
             "17E",
             "17F",
             "18A",
             "18B",
             "18C",
             "18D",
             "18E",
             "18F",
             "19A",
             "19B",
             "19C",
             "19D",
             "19E",
             "19F",
             "20A",
             "20B",
             "20C",
             "20D",
             "20E",
             "20F",
             "21A",
             "21B",
             "21C",
             "21D",
             "21E",
             "21F",
             "22A",
             "22B",
             "22C",
             "22D",
             "22E",
             "22F",
             "23A",
             "23B",
             "23C",
             "23D",
             "23E",
             "23F",
             "24A",
             "24B",
             "24C",
             "24D",
             "24E",
             "24F",
             "25A",
             "25B",
             "25C",
             "25D",
             "25E",
             "25F",
             "26A",
             "26B",
             "26D",
             "26E",
             "26F",
             "27A",
             "27B",
             "27C",
             "27D",
             "27E",
             "27F"
            ]
           },
           {
            "seatAvailabilityStatus": "Reserved",
            "value": [
             "9A",
             "9F",
             "10A",
             "10B",
             "10C",
             "10D",
             "10E",
             "10F",
             "11A",
             "11B",
             "11C",
             "11D",
             "11E",
             "11F",
             "12A",
             "12B",
             "12C",
             "12D",
             "12E",
             "12F",
             "13D",
             "26C",
             "29A",
             "29B",
             "29C",
             "29D",
             "29E",
             "29F",
             "30A",
             "30B",
             "30C",
             "30D",
             "30E",
             "30F"
            ]
           }
          ],
          "Brand": {
           "@type": "Brand",
           "name": "SEAT ASSIGNMENT"
          },
          "SeatingChartRef": "seatingChart_1"
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
       "Base": 0,
       "TotalPrice": 0
      }
     },
     {
      "@type": "CatalogOffering",
      "id": "ancillaryID_1_0_2",
      "Identifier": {
       "authority": "Travelport",
       "value": "b9e0100a-a5e4-4134-be87-e4e4dbb48953"
      },
      "ProductOptions": [
       {
        "@type": "ProductOptions",
        "Product": [
         {
          "@type": "ProductSeatAvailability",
          "id": "productSeatID_2",
          "SeatAvailability": [
           {
            "seatAvailabilityStatus": "Reserved",
            "value": [
             "4A",
             "4B",
             "4C",
             "4D",
             "4E",
             "4F"
            ]
           }
          ],
          "Brand": {
           "@type": "Brand",
           "name": "EXTRA LEGROOM"
          },
          "SeatingChartRef": "seatingChart_1"
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
       "Base": 45,
       "TotalTaxes": 0,
       "TotalPrice": 45,
       "PriceBreakdown": [
        {
         "@type": "PriceBreakdownAncillaryAir",
         "Amount": {
          "@type": "Amount",
          "Taxes": {
           "@type": "TaxesDetail",
           "Tax": [
            {
             "value": 0
            }
           ]
          }
         }
        }
       ]
      }
     },
     {
      "@type": "CatalogOffering",
      "id": "ancillaryID_1_0_3",
      "Identifier": {
       "authority": "Travelport",
       "value": "cce684c1-a193-47b7-ac38-413c20a44d40"
      },
      "ProductOptions": [
       {
        "@type": "ProductOptions",
        "Product": [
         {
          "@type": "ProductSeatAvailability",
          "id": "productSeatID_3",
          "SeatAvailability": [
           {
            "seatAvailabilityStatus": "Available",
            "value": [
             "9B",
             "9C",
             "9E"
            ]
           }
          ],
          "Brand": {
           "@type": "Brand",
           "name": "PREFERRED SEAT"
          },
          "SeatingChartRef": "seatingChart_1"
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
       "Base": 10,
       "TotalTaxes": 0,
       "TotalPrice": 10,
       "PriceBreakdown": [
        {
         "@type": "PriceBreakdownAncillaryAir",
         "Amount": {
          "@type": "Amount",
          "Taxes": {
           "@type": "TaxesDetail",
           "Tax": [
            {
             "value": 0
            }
           ]
          }
         }
        }
       ]
      }
     }
    ],
    "TravelerIdentifierRef": [
     {
      "name": "RAMESH KK",
      "passengerTypeCode": "ADT",
      "id": "travelerRefId_1",
      "value": "70243488-bcfa-458c-9c3f-604a9d769c57"
     },
     {
      "name": "SARAN KUMAR",
      "passengerTypeCode": "CHD",
      "id": "travelerRefId_2",
      "value": "c89cdd15-0410-4dfe-b85b-df95fbb6b099"
     }
    ],
    "HeldAncillary": [
     {
      "@type": "HeldAncillary",
      "travelerRef": "travelerRefId_1",
      "Ancillary": {
       "@type": "AncillaryAirSeat",
       "FlightRef": [
        "Flight_01"
       ],
       "SeatAssignment": {
        "@type": "SeatAssignment",
        "Seat": "009A"
       }
      }
     },
     {
      "@type": "HeldAncillary",
      "travelerRef": "travelerRefId_2",
      "Ancillary": {
       "@type": "AncillaryAirSeat",
       "FlightRef": [
        "Flight_01"
       ],
       "SeatAssignment": {
        "@type": "SeatAssig
…
```

