# Seat Book API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Seats/APIRef_SeatBook.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Seat Book API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Seat Book API&#160;Reference Request Response Example request Example response POST book/airoffer/reservationworkbench/ {workbenchId} /offers/buildancillaryoffersfromcatalogofferings For {workbenchID} send the workbench identifier returned in ReservationResponse/Identifer/value in the workbench create response. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Seats Guide , Seat Map API Reference After retrieving available seats with a Seat Map request, you send a Seat Book request to add a selected seat to the workbench. See the Seats Guide for the workflow description. You can include multiple travelers in the same seat book request; however, you must send a separate book request for each flight (aka segment) on the itinerary. To add ancillaries or seats to a multi-offer booking , send the Ancillary Shop or Seat Map request, then send one book request for each offer, in any order. Supported in the initial booking workflow only for free seats; supported for an existing booking for ancillaries and free and paid seats. GDS only; multi-offers not supported for NDC. For GDS only, you can modify an existing seat assignment by sending the Seat Book request without canceling the existing seat. If the new seat book request is successful at workbench commit, the existing seat is replaced. If unsuccessful, the existing seat is retained. In the case of an add collect (the new seats cost more than the modified seats), you must send Add Payment for the price difference in the same workbench. Seat modify is not supported for changing a paid seat to a free seat, for modifying a seat booked in the same workbench session, or for NDC. Seat booking support varies for NDC and GDS, specific carriers, and at places in the booking workflow. See the Seats Guide for support details. You may need to add payment for seats in the same workbench session. See payment and EMD&#160;details in the Ancillary and EMD Guide . Ancillaries 24.11.31 and later. If an infant PTC that by definition doesn't include a seat assignment is sent in a seat book request, such as INF for an infant in the lap of an adult passenger, Seat Book displays the error message "PASSENGER TYPE CODE CANNOT CONTAIN INFANT". GDS only; not supported for NDC. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body Show Seat Book Request Body Table Object Description Required/Optional OfferQueryBuildAncillaryOffersFromCatalogOfferings Top level object. Required BuildAncillaryOffersFromCatalogOfferings Details for one seat on one flight. Send one instance for each traveler on each flight. Includes CatalogOfferingsIdentifier, CatalogOfferingIdentifier, TravelerIdentifierRef, and SeatAssignment objects. Required CatalogOfferingsIdentifier Top level object. Required CatalogOfferingsIdentifier/ Identifier The identifier value for the seat map response. Key value pairs: value : Send the value from CatalogOfferingsAncillaryListResponse/ Identifier in the seat map response. Required CatalogOfferingIdentifier Top level object. Required CatalogOfferingIdentifier/ Identifier The identifier value for the seat map offer in the response. Key value pairs: value : Send the value from CatalogOfferingsAncillaryListResponse/ CatalogOfferingsID/Identifier in the seat map response. Required TravelerIdentifier The traveler for whom to book the seat. Required TravelerIdentifier/ Identifier Traveler ID. Key value pairs: authority : Source of information. value : Unique system-generated identifier. Send the traveler identifier returned in the Add&#160;Traveler response. For the post-reservation workflow the traveler identifier is returned in the response when the post-commit workbench is created. &#160; SeatAssignment Seat number to book. Required Response GDS&#160;Seat Book Response For GDS, the seat book response returns full details for each seat booked. Show GDS Seat Book Response Table Object Description OfferListResponse Top level object for response. Includes OfferID, Identifier, and ReferenceList objects. OfferListResponse/ Identifier Identifier for response. Key value pairs: authority: Returns the value Travelport for GDS. value: &#160;Internal system-generated identifier for the response. OfferID Top level object for booked seat details. One instance returned for each booked seat. Returned with @type Offer when there is no existing seat assignment. Returned with @type OfferAncillaryModify when a flight already has a seat assignment that is being held while modifying seats . This seat replaces the held seat upon successful booking confirmation at workbench commit. Key value pairs: id : Identifier for this booked seat. Includes Identifier, Product, Price, and TermsAndConditionsFull objects. If there is a current seat assignment on this flight, also returns ModifyPrice. OfferID/ Identifier Identifier for booked seat offer. Key value pairs: authority: Returns the value Travelport . value: &#160;Internal system-generated identifier for the offer. ContentSource String.&#160;Identifies the source of the seat offer, either GDS or NDC . Product Top level object for product (one leg of the itinerary; multiple instances are returned if there are multiple legs). Key value pairs: id : Custom identifier for product. Includes Identifier, Ancillary, and SeatAssignment objects. A Quantity object may also be returned to note the number of seats booked. Product/ Identifier Identifier for the product. Key value pairs: authority: Returns the value Travelport . value: &#160;Internal system-generated identifier for the product. Ancillary Top level object. Includes FlightRef and SeatAssignment object. FlightRef Flight reference matching to ReferenceListFlight/Flight/id. SeatAssignment Includes Seat object. Seat String. Row and seat number of assigned seat. Price Top level object for price details; 0 amounts are free seats. Includes CurrencyCode, Base, TotalTaxes, TotalPrice, and PriceBreakdown objects. CurrencyCode The currency in which the price is returned. Currency is the default associated with your provisioned PCC from Travelport. Key value pairs: decimalPlace: &#160;Number of decimal places in the currency. value: &#160;Currency code value. Base Base price before taxes and fees; 0 for free seats. TotalPrice Total price for seat including base price, taxes and fees; 0 for free seats. TermsAndConditionsFull Any terms and conditions applicable to the seat. Includes ApplicationLimit. ApplicationLimit Any restrictions on the number of this seat product that can be purchased. Key value pairs: start :&#160;Minimum quantity that can be purchased. end : Maximum quantity that can be purchased. value : The unit represented by this quantity. Possible values are: PassengerSegment: Ancillary limit applies to each passenger at the segment level. E.g, Itinerary is LON-SIN-LON and the ancillary limit is “n” per segment per passenger. Segment: Ancillary limit applies to all passengers at the segment level (one flight, or flights under the same number). Itinerary: Ancillary limit applies to all passengers for the full itinerary. Passenger: Ancillary limit applies per passenger for the full itinerary. PassengerOD: Ancillary limit applies per passenger for the origin destination. E.g., Itinerary is LON X/SIN SYD X/SIN LON and the ancillary limit is “n” per origin destination (LON XSIN SYD) Other ModifyPrice For GDS only, you can modify an existing seat assignment by sending the Seat Book request without canceling the existing seat. If the new seat book request is successful at workbench commit, the existing seat is replaced. If unsuccessful, the existing seat is retained. In the case of an add collect (the new seats cost more than the modified seats), you must send Add Payment for the price difference in the same workbench. Seat modify is not supported for changing a paid seat to a free seat, for modifying a seat booked in the same workbench session, or for NDC. Returned when the Seat Book request is sent for a flight that already has a seat assignment. Includes the same CurrencyCode, Base, TotalTaxes, TotalFees, and TotalPrice objects as the Price object above. In ModifyPrice, the amounts in these objects indicate price changes from the existing seat assignment: values of 0 indicate no change, positive numbers indicate an additional cost, negative numbers indicate a refund amount. When Seat Book is sent to replace an existing seat assignment, the current seat assignment is held until the new seat book request is successful at workbench commit; the existing seat assignment is canceled at that time. ReferenceList Top level object for flight details. Includes Flight object. Flight One instance per flight. Key value pairs: duration : Time of the flight in hours (H) and minutes (M). carrier : Airline carrier. number : Flight number. operatingCarrier : When the carrier has filed a codeshare operating carrier for the flight, the IATA code for that codeshare carrier. operatingCarrierName : Name of the marketing operating carrier. equipment : Equipment model. Note that TRN, TRS, and BUS equipment codes indicate ground transportation. id : id for internal flight reference number, also used in products and offers. For GDS, the Flight id is formatted as the letter ‘s’+ unique numeric value, as in s1 . Includes Identifier, Departure, Arrival, and Status objects. Flight/ Identifier Internal identifier for the flight. Key value pairs: authority: Returns the value Travelport . value: &#160;Internal system-generated identifier for the flight. Departure Departure details. Key value pairs are the location , date , time , and terminal of departure. Arrival Arrival details. Key value pairs are the location , date , time , and terminal of arrival. Status Returns status of seat booking in the following: providerCode : Provider code. value :&#160;Status of seat booking, such as Pending . NDC Seat Book Response NDC responses return an identifier for each booked seat. You can send a reservation retrieve request to return booked seat details. Show NDC Seat Book Response Table Object Description OfferListResponse Top level object for response. Includes OfferID object. OfferID Top level object for seat confirmation. One instance returned for each seat booked. Includes Identifier. OfferID/ Identifier Internal identifier for seat confirmation: authority: Returns the carrier code. value: &#160;Internal system-generated identifier for the booked seat. Example Request For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . You can include multiple travelers in the same seat book request; however, you must send a separate book request for each flight on the itinerary. The following example sends seat assignments for two travelers on the same flight. This example is for GDS; however, the seat book request is the same for both GDS and NDC, and for both free and paid seats. Show Example seat book request for two travelers { "OfferQueryBuildAncillaryOffersFromCatalogOfferings": { "BuildAncillaryOffersFromCatalogOfferings": [ { "@type": "BuildAncillaryOffersFromCatalogOfferingsAirSeat", "CatalogOfferingsIdentifier": { "Identifier": { "value": "844cf72e-5dcf-4905-959c-ae416ba7a4ea" } }, "CatalogOfferingIdentifier": { "Identifier": { "value": "8a1072cf-f3e1-4f04-9dcf-db55f60dc487" } }, "TravelerIdentifierRef": { "value": "1b74e411-1eb1-483e-a06b-c9333efd02df" }, "SeatAssignment": "3A" }, { "@type": "BuildAncillaryOffersFromCatalogOfferingsAirSeat", "CatalogOfferingsIdentifier": { "Identifier": { "value": "844cf72e-5dcf-4905-959c-ae416ba7a4ea" } }, "CatalogOfferingIdentifier": { "Identifier": { "value": "8a1072cf-f3e1-4f04-9dcf-db55f60dc487" } }, "TravelerIdentifierRef": { "value": "1a1269df-44e5-43b3-ab7b-4d6336b9e68f" }, "SeatAssignment": "3C" } ] } } &gt; Example Response For GDS, the seat book response returns details for all booked seats, including seat assignments and price details for both paid and free seats. Show Example seat book response for two travelers - GDS { "OfferListResponse": { "@type": "OfferListResponse", "transactionId": "951ce15b-a2e9-49db-939f-36eeefe8ac92", "traceId": "7a87fa9f-f21a-4ee8-b1ec-fd65a7d8f51f", "OfferID": [ { "@type": "Offer", "id": "seatOffer_Flight_01_1", "Identifier": { "authority": "Travelport", "value": "e265b566-9ee3-4e0d-aaf7-b9e365503d62" }, "Product": [ { "@type": "ProductAncillary", "id": "product_seat_Flight_01_1", "Identifier": { "authority": "Travelport", "value": "c8b26650-6e12-4d96-b88a-404441828d6d" }, "Ancillary": { "@type": "AncillaryAirSeat", "FlightRef": [ "Flight_01" ], "SeatAssignment": { "@type": "SeatAssignment", "Seat": "003A" } } } ], "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 0, "TotalPrice": 0 }, "TermsAndConditionsFull": [ { "@type": "TermsAndConditionsFullAncillary", "ApplicationLimit": { "start": "1", "end": "1", "value": "PassengerSegment" } } ] }, { "@type": "Offer", "id": "seatOffer_Flight_01_2", "Identifier": { "authority": "Travelport", "value": "247b8ec3-5df7-4688-9d46-a754b3f1c9e5" }, "Product": [ { "@type": "ProductAncillary", "id": "product_seat_Flight_01_2", "Identifier": { "authority": "Travelport", "value": "a08a39d5-9f54-4678-8e8c-6c6c764ba687" }, "Ancillary": { "@type": "AncillaryAirSeat", "FlightRef": [ "Flight_01" ], "SeatAssignment": { "@type": "SeatAssignment", "Seat": "003C" } } } ], "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 0, "TotalPrice": 0 }, "TermsAndConditionsFull": [ { "@type": "TermsAndConditionsFullAncillary", "ApplicationLimit": { "start": "1", "end": "1", "value": "PassengerSegment" } } ] } ], "Identifier": { "authority": "Travelport", "value": "844cf72e-5dcf-4905-959c-ae416ba7a4ea" }, "ReferenceList": [ { "@type": "ReferenceListFlight", "Flight": [ { "@type": "FlightStatus", "carrier": "QF", "number": "0419", "id": "Flight_01", "Identifier": { "authority": "Travelport", "value": "be15852a-963b-491c-85f9-21da034c72eb" }, "Departure": { "@type": "DepartureDetail", "location": "SYD", "date": "2023-12-20", "time": "08:00:00" }, "Arrival": { "@type": "ArrivalDetail", "location": "MEL", "date": "2023-12-20", "time": "09:35:00" }, "Status": { "@type": "StatusDetail", "ProviderStatus": { "providerCode": "HS", "value": "Pending" } } } ] } ] } } The NDC seat book response returns an identifier for each seat selection instead of seat details. You can send a workbench retrieve request to return booked seat details. Show Example seat book response for two travelers - NDC { "OfferListResponse": { "transactionId": "2b41cc5d-46bb-4c52-b39a-693ed955c68c", "OfferID": [ { "@type": "OfferID", "Identifier": { "authority": "SQ", "value": "UFJJQ0U2LVNFRzJ8UEFYMnxTRUcy" } }, { "@type": "OfferID", "Identifier": { "authority": "SQ", "value": "UFJJQ0UzLVNFRzJ8UEFYMXxTRUcy" } } ] } } When Seat Book is sent for a flight that already has seat assignments, OfferID is returned with @type OfferAncillaryModify to indicate the modified seat assignment. The response also includes the ModifyPrice object, which indicates any price changes from the existing seat assignment. ModifyPrice values of 0 indicate no change, positive numbers indicate an additional cost, negative numbers indicate a refund amount. Upon successfully booking the new seats at workbench commit, the previous seats are released. In case of booking failure, the existing seats are retained on the booking. This supports modifying seats by ensuring the current seats remain available in case of a booking failure. Show Example seat book response for seat modify - no additional cost { "OfferListResponse": { "@type": "OfferListResponse", "transactionId": "12af0294-40cf-409a-bf28-4e9e2bbba4a2", "traceId": "ea4bdf5f-5c1b-498c-8833-5478605381e6", "OfferID": [ { "@type": "OfferAncillaryModify", "id": "seatOffer_Flight_01_1", "Identifier": { "authority": "Travelport", "value": "b5ba269b-6f58-4268-b257-f493d61894f0" }, "Product": [ { "@type": "ProductAncillary", "id": "product_seat_Flight_01_1", "Ancillary": { "@type": "AncillaryAirSeat", "Description": [ { "code": "A", "subCode": "0B5", "codeContext": "ATPCO", "value": "PREFERRED SEAT" } ], "FlightRef": [ "Flight_01" ], "SeatAssignment": { "@type": "SeatAssignment", "Seat": "9B" } } } ], "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 17.27, "TotalTaxes": 1.73, "TotalPrice": 19, "PriceBreakdown": [ { "@type": "PriceBreakdownAncillaryAir", "Amount": { "@type": "Amount", "Taxes": { "@type": "TaxesDetail", "Tax": [ { "taxCode": "UO", "value": 1.73 } ] } }, "Description": { "code": "A", "subCode": "0B5", "codeContext": "ATPCO", "value": "PREFERRED SEAT" }, "TravelerIdentifierRef": { "name": "-RAMESH", "passengerTypeCode": "ADT", "id": "travelerRefId_1", "value": "-KK" } } ] }, "TermsAndConditionsFull": [ { "@type": "TermsAndConditionsFullAncillary", "ApplicationLimit": { "start": "1", "end": "1", "value": "PassengerSegment" } } ], "ModifyPrice": { "@type": "ModifyPrice", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 0, "TotalTaxes": 0, "TotalFees": 0, "TotalPrice": 0 } } ], "Identifier": { "authority": "Travelport", "value": "4be2cd8b-2dda-40b0-8ad0-f5045277ec8f" }, "ReferenceList": [ { "@type": "ReferenceListFlight", "Flight": [ { "@type": "Flight", "duration": "PT4H20M", "carrier": "QF", "number": "932", "equipment": "73H", "id": "Flight_01", "Identifier": { "authority": "Travelport", "value": "993380cc-efc3-4f56-bdf9-8d0a1c176599" }, "Departure": { "@type": "Departure", "location": "PER", "date": "2024-09-25", "time": "06:00:00" }, "Arrival": { "@type": "Arrival", "location": "BNE", "date": "2024-09-25", "time": "12:20:00" } } ] } ] } }

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
 "OfferQueryBuildAncillaryOffersFromCatalogOfferings": {
  "BuildAncillaryOffersFromCatalogOfferings": [
   {
    "@type": "BuildAncillaryOffersFromCatalogOfferingsAirSeat",
    "CatalogOfferingsIdentifier": {
     "Identifier": {
      "value": "844cf72e-5dcf-4905-959c-ae416ba7a4ea"
     }
    },
    "CatalogOfferingIdentifier": {
     "Identifier": {
      "value": "8a1072cf-f3e1-4f04-9dcf-db55f60dc487"
     }
    },
    "TravelerIdentifierRef": {
     "value": "1b74e411-1eb1-483e-a06b-c9333efd02df"
    },
    "SeatAssignment": "3A"
   },
   {
    "@type": "BuildAncillaryOffersFromCatalogOfferingsAirSeat",
    "CatalogOfferingsIdentifier": {
     "Identifier": {
      "value": "844cf72e-5dcf-4905-959c-ae416ba7a4ea"
     }
    },
    "CatalogOfferingIdentifier": {
     "Identifier": {
      "value": "8a1072cf-f3e1-4f04-9dcf-db55f60dc487"
     }
    },
    "TravelerIdentifierRef": {
     "value": "1a1269df-44e5-43b3-ab7b-4d6336b9e68f"
    },
    "SeatAssignment": "3C"
   }
  ]
 }
}
```

### Block 2

```
{
 "OfferListResponse": {                    
  "@type": "OfferListResponse",
  "transactionId": "951ce15b-a2e9-49db-939f-36eeefe8ac92",
  "traceId": "7a87fa9f-f21a-4ee8-b1ec-fd65a7d8f51f",
  "OfferID": [
   {
    "@type": "Offer",
    "id": "seatOffer_Flight_01_1",
    "Identifier": {
     "authority": "Travelport",
     "value": "e265b566-9ee3-4e0d-aaf7-b9e365503d62"
    },
    "Product": [
     {
      "@type": "ProductAncillary",
      "id": "product_seat_Flight_01_1",
      "Identifier": {
       "authority": "Travelport",
       "value": "c8b26650-6e12-4d96-b88a-404441828d6d"
      },
      "Ancillary": {
       "@type": "AncillaryAirSeat",
       "FlightRef": [
        "Flight_01"
       ],
       "SeatAssignment": {
        "@type": "SeatAssignment",
        "Seat": "003A"
       }
      }
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
    },
    "TermsAndConditionsFull": [
     {
      "@type": "TermsAndConditionsFullAncillary",
      "ApplicationLimit": {
       "start": "1",
       "end": "1",
       "value": "PassengerSegment"
      }
     }
    ]
   },
   {
    "@type": "Offer",
    "id": "seatOffer_Flight_01_2",
    "Identifier": {
     "authority": "Travelport",
     "value": "247b8ec3-5df7-4688-9d46-a754b3f1c9e5"
    },
    "Product": [
     {
      "@type": "ProductAncillary",
      "id": "product_seat_Flight_01_2",
      "Identifier": {
       "authority": "Travelport",
       "value": "a08a39d5-9f54-4678-8e8c-6c6c764ba687"
      },
      "Ancillary": {
       "@type": "AncillaryAirSeat",
       "FlightRef": [
        "Flight_01"
       ],
       "SeatAssignment": {
        "@type": "SeatAssignment",
        "Seat": "003C"
       }
      }
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
    },
    "TermsAndConditionsFull": [
     {
      "@type": "TermsAndConditionsFullAncillary",
      "ApplicationLimit": {
       "start": "1",
       "end": "1",
       "value": "PassengerSegment"
      }
     }
    ]
   }
  ],
  "Identifier": {
   "authority": "Travelport",
   "value": "844cf72e-5dcf-4905-959c-ae416ba7a4ea"
  },
  "ReferenceList": [
   {
    "@type": "ReferenceListFlight",
    "Flight": [
     {
      "@type": "FlightStatus",
      "carrier": "QF",
      "number": "0419",
      "id": "Flight_01",
      "Identifier": {
       "authority": "Travelport",
       "value": "be15852a-963b-491c-85f9-21da034c72eb"
      },
      "Departure": {
       "@type": "DepartureDetail",
       "location": "SYD",
       "date": "2023-12-20",
       "time": "08:00:00"
      },
      "Arrival": {
       "@type": "ArrivalDetail",
       "location": "MEL",
       "date": "2023-12-20",
       "time": "09:35:00"
      },
      "Status": {
       "@type": "StatusDetail",
       "ProviderStatus": {
        "providerCode": "HS",
        "value": "Pending"
       }
      }
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
 "OfferListResponse": {
  "transactionId": "2b41cc5d-46bb-4c52-b39a-693ed955c68c",
  "OfferID": [
   {
    "@type": "OfferID",
    "Identifier": {
     "authority": "SQ",
     "value": "UFJJQ0U2LVNFRzJ8UEFYMnxTRUcy"
    }
   },
   {
    "@type": "OfferID",
    "Identifier": {
     "authority": "SQ",
     "value": "UFJJQ0UzLVNFRzJ8UEFYMXxTRUcy"
    }
   }
  ]
 }
}
```

### Block 4

```
{
 "OfferListResponse": {
  "@type": "OfferListResponse",
  "transactionId": "12af0294-40cf-409a-bf28-4e9e2bbba4a2",
  "traceId": "ea4bdf5f-5c1b-498c-8833-5478605381e6",
  "OfferID": [
   {
    "@type": "OfferAncillaryModify",
    "id": "seatOffer_Flight_01_1",
    "Identifier": {
     "authority": "Travelport",
     "value": "b5ba269b-6f58-4268-b257-f493d61894f0"
    },
    "Product": [
     {
      "@type": "ProductAncillary",
      "id": "product_seat_Flight_01_1",
      "Ancillary": {
       "@type": "AncillaryAirSeat",
       "Description": [
        {
         "code": "A",
         "subCode": "0B5",
         "codeContext": "ATPCO",
         "value": "PREFERRED SEAT"
        }
       ],
       "FlightRef": [
        "Flight_01"
       ],
       "SeatAssignment": {
        "@type": "SeatAssignment",
        "Seat": "9B"
       }
      }
     }
    ],
    "Price": {
     "@type": "PriceDetail",
     "CurrencyCode": {
      "decimalPlace": 2,
      "value": "AUD"
     },
     "Base": 17.27,
     "TotalTaxes": 1.73,
     "TotalPrice": 19,
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
           "value": 1.73
          }
         ]
        }
       },
       "Description": {
        "code": "A",
        "subCode": "0B5",
        "codeContext": "ATPCO",
        "value": "PREFERRED SEAT"
       },
       "TravelerIdentifierRef": {
        "name": "-RAMESH",
        "passengerTypeCode": "ADT",
        "id": "travelerRefId_1",
        "value": "-KK"
       }
      }
     ]
    },
    "TermsAndConditionsFull": [
     {
      "@type": "TermsAndConditionsFullAncillary",
      "ApplicationLimit": {
       "start": "1",
       "end": "1",
       "value": "PassengerSegment"
      }
     }
    ],
    "ModifyPrice": {
     "@type": "ModifyPrice",
     "CurrencyCode": {
      "decimalPlace": 2,
      "value": "AUD"
     },
     "Base": 0,
     "TotalTaxes": 0,
     "TotalFees": 0,
     "TotalPrice": 0
    }
   }
  ],
  "Identifier": {
   "authority": "Travelport",
   "value": "4be2cd8b-2dda-40b0-8ad0-f5045277ec8f"
  },
  "ReferenceList": [
   {
    "@type": "ReferenceListFlight",
    "Flight": [
     {
      "@type": "Flight",
      "duration": "PT4H20M",
      "carrier": "QF",
      "number": "932",
      "equipment": "73H",
      "id": "Flight_01",
      "Identifier": {
       "authority": "Travelport",
       "value": "993380cc-efc3-4f56-bdf9-8d0a1c176599"
      },
      "Departure": {
       "@type": "Departure",
       "location": "PER",
       "date": "2024-09-25",
       "time": "06:00:00"
      },
      "Arrival": {
       "@type": "Arrival",
       "location": "BNE",
       "date": "2024-09-25",
       "time": "12:20:00"
      }
     }
    ]
   }
  ]
 }
}
```

