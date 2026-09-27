# Ancillary Cancel API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Seats/APIRef_AncillaryCancel.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Ancillary Cancel API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Ancillary Cancel API&#160;Reference Request Response Example request Example response POST book/airoffer/reservationworkbench/ {workbenchID} /offers/canceloffer For {workbenchID} send the workbench identifier returned in ReservationResponse/Identifer/value in the workbench create response. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Seats Guide , Ancillary Guide The Ancillary Cancel API supports canceling baggage and/or paid seats for both GDS and NDC, and canceling non-baggage ancillaries for NDC. Canceling non-baggage ancillaries for GDS is not supported. Ancillary Cancel must be sent in a workbench session: Create a workbench, send Ancillary Cancel, and commit the workbench. You can cancel ancillaries booked in the same or a previous session. Seat and ancillary cancel support varies in the booking workflow. See the Seats Guide and Ancillary Guide for support details. Only one paid seat per workbench session can be canceled. To cancel multiple seats, send one cancel request, commit the workbench, and start a new workbench to cancel the next seat. For paid bags , you can send multiple cancel requests in a post-commit workbench session. You cannot cancel ancillaries or seats from a ticketed itinerary. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body Show Request Body Table Object Description Required/Optional OfferQueryCancelOffer Top level object. Required BuildFromOffer Top level object. Required OfferIdentifier Top level object to send seats offer identifier. Required Identifier Identifier for the seats offer to cancel; this was returned in the response either when the seats offer was added to the workbench (for a new booking) or when the workbench was created (for an existing reservation). Required Response GDS&#160;responses return the ReferenceList object with flight details while NDC&#160;responses do not return ReferenceList. Object Description OfferListResponse Top level object for response. Includes OfferID object. GDS responses also return the ReferenceList object. OfferID Top level object for seat offer details. Includes Identifier, Product, Price, and TermsAndConditionsFull. Identifier Identifier for seat offer. Key value pairs: authority: Returns the value Travelport for GDS or the carrier name for NDC. value: &#160;Internal system-generated identifier for the offer. Product Top level object for product (product is the flight or connecting flights for one leg of the itinerary). Multiple instances returned for flights with multiple legs. Key value pairs: id : Custom identifier for product. productRef : Reference for product. Includes Identifier and Ancillary objects. May return Quantity. Product/ Identifier Identifier for the product. Key value pairs: authority: Returns the value Travelport for GDS or the carrier name for NDC. value: &#160;Internal system-generated identifier for the product. Quantity Returned when multiple travelers are on the itinerary; number of seats in this product. Ancillary Includes SeatAssignment. SeatAssignment Includes Seat object. Seat Row and seat number of assigned seat that was canceled. Price Top level object for price details; amounts are 0 for free seats. Includes CurrencyCode, Base, TotalTaxes, and TotalPrice objects. May include PriceBreakdown CurrencyCode The currency in which the price is returned. Currency is the default associated with your provisioned PCC from Travelport. Key value pairs: decimalPlace: &#160;Number of decimal places in the currency. value: &#160;Currency code value. Base Base price before taxes and fees. TotalPrice Total price for a paid seat; 0 for free seats. TermsAndConditionsFull Any terms and conditions applicable to the seat. Includes ApplicationLimit. ApplicationLimit Any restrictions on the number of this seat product that can be purchased. Key value pairs: start :&#160;Minimum quantity that can be purchased. end : Maximum quantity that can be purchased. value : The unit represented by this quantity. Possible values are: PassengerSegment: Ancillary limit applies to each passenger at the segment level. E.g, Itinerary is LON-SIN-LON and the ancillary limit is “n” per segment per passenger. Segment: Ancillary limit applies to all passengers at the segment level (one flight, or flights under the same number). Itinerary: Ancillary limit applies to all passengers for the full itinerary. Passenger: Ancillary limit applies per passenger for the full itinerary. PassengerOD: Ancillary limit applies per passenger for the origin destination. E.g., Itinerary is LON X/SIN SYD X/SIN LON and the ancillary limit is “n” per origin destination (LON XSIN SYD) Other ReferenceList Top level object for flight details. Includes Flight object. Not returned for NDC seat cancel responses. Flight One instance per flight. Key value pairs: duration : Time of the flight in hours (H) and minutes (M). carrier : Airline carrier. number : Flight number. operatingCarrier : When the carrier has filed a codeshare operating carrier for the flight, the IATA code for that codeshare carrier. operatingCarrierName : Name of the marketing operating carrier. equipment : Equipment model. Note that TRN, TRS, and BUS equipment codes indicate ground transportation. id : id for internal flight reference number, also used in products and offers. For GDS, the Flight id is formatted as the letter ‘s’+ unique numeric value, as in s1 . Includes Identifier, Departure, and Arrival objects. Flight/ Identifier Internal identifier for the flight. Key value pairs: authority: Returns the value Travelport . value: &#160;Internal system-generated identifier for the flight. Departure Departure details. Key value pairs are the location , date , time , and terminal of departure. Arrival Arrival details. Key value pairs are the location , date , time , and terminal of arrival. Example Request For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . Show Example The following example seat cancel request sends the offer identifier for the seats offer to cancel. { "OfferQueryCancelOffer": { "BuildFromOffer": { "@type": "BuildFromOfferAir", "OfferIdentifier": { "Identifier": { "authority": "Travelport", "value": "41af2ea3-de07-4931-98bd-400b983a0221" } } } } } Example Response The seat cancel response for both NDC and GDS returns an identifier and details of the canceled seat offer per the examples below. For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . GDS&#160;responses return the ReferenceList object with flight details while NDC&#160;responses do not return ReferenceList. Show Example Response for GDS seat cancel { "OfferListResponse": { "@type": "OfferListResponse", "transactionId": "32e4e607-bdd9-4b59-9c11-4562c71463fb", "traceId": "947aa1fc-a50e-46f9-a53c-bf9af33988fd", "OfferID": [ { "@type": "Offer", "id": "seatOffer_Flight_01_2", "Identifier": { "authority": "Travelport", "value": "91e81a76-a5f5-4bc6-a6e5-59f03de70b60" }, "Product": [ { "@type": "ProductAncillary", "id": "product_seat_Flight_01_2", "Identifier": { "authority": "Travelport", "value": "ed32e859-8e1e-4595-a5ea-847a4bc72c17" }, "Ancillary": { "@type": "AncillaryAirSeat", "FlightRef": [ "Flight_01" ], "SeatAssignment": { "@type": "SeatAssignment", "Seat": "030E" } } } ], "Price": { "@type": "PriceDetail", "CurrencyCode": { "value": "AUD" }, "Base": 0, "TotalPrice": 0 }, "TermsAndConditionsFull": [ { "@type": "TermsAndConditionsFullAncillary", "ApplicationLimit": { "start": "1", "end": "1", "value": "PassengerSegment" } } ] } ], "ReferenceList": [ { "@type": "ReferenceListFlight", "Flight": [ { "@type": "Flight", "duration": "PT1H25M", "carrier": "QF", "number": "414", "equipment": "332", "id": "Flight_01", "Identifier": { "authority": "Travelport", "value": "22d1bb70-b405-4853-82b9-f5dbb634a9ac" }, "Departure": { "@type": "Departure", "location": "MEL", "date": "2023-08-07", "time": "07:30:00" }, "Arrival": { "@type": "Arrival", "location": "SYD", "date": "2023-08-07", "time": "08:55:00" } } ] } ] } } The NDC seat cancel response below does not return the ReferenceList object. Show Example Response for NDC seat cancel { "OfferListResponse": { "OfferID": [ { "@type": "Offer", "id": "Offer_2", "Identifier": { "authority": "QF", "value": "UUYwODFISkVBN1RBN3xXM0M4MEJCQTYtMUJFNC00NjM0LUI1RUItMS0z" }, "Product": [ { "@type": "ProductAncillary", "id": "product_anc_1", "productRef": "product_anc_1", "Identifier": { "authority": "Travelport", "value": "dcc44d91-5fd6-403b-8665-e7c98cea4273" }, "Quantity": 1, "Ancillary": { "@type": "AncillaryAirSeat", "quantity": 1, "FlightRef": [], "SeatAssignment": { "@type": "SeatAssignment", "Seat": "9F" } } } ], "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 9.09, "TotalTaxes": 0.91, "TotalPrice": 10, "PriceBreakdown": [ { "@type": "PriceBreakdownAncillaryAir", "Amount": { "@type": "Amount", "Taxes": { "@type": "TaxesDetail", "Tax": [ { "taxCode": "UO", "value": 0.91 } ] } } } ] }, "TermsAndConditionsFull": [ { "@type": "TermsAndConditionsFullSummary", "id": "termsAndConditionsFull_1", "Identifier": { "authority": "Travelport", "value": "71e0d5b1-d349-4898-a90b-642b27a45af3" } } ] } ] } }

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
 "OfferQueryCancelOffer": {
  "BuildFromOffer": {
   "@type": "BuildFromOfferAir",
   "OfferIdentifier": {
    "Identifier": {
     "authority": "Travelport",
     "value": "41af2ea3-de07-4931-98bd-400b983a0221"
    }
   }
  }
 }
}
```

### Block 2

```
{
 "OfferListResponse": {
  "@type": "OfferListResponse",
  "transactionId": "32e4e607-bdd9-4b59-9c11-4562c71463fb",
  "traceId": "947aa1fc-a50e-46f9-a53c-bf9af33988fd",
  "OfferID": [
   {
    "@type": "Offer",
    "id": "seatOffer_Flight_01_2",
    "Identifier": {
     "authority": "Travelport",
     "value": "91e81a76-a5f5-4bc6-a6e5-59f03de70b60"
    },
    "Product": [
     {
      "@type": "ProductAncillary",
      "id": "product_seat_Flight_01_2",
      "Identifier": {
       "authority": "Travelport",
       "value": "ed32e859-8e1e-4595-a5ea-847a4bc72c17"
      },
      "Ancillary": {
       "@type": "AncillaryAirSeat",
       "FlightRef": [
        "Flight_01"
       ],
       "SeatAssignment": {
        "@type": "SeatAssignment",
        "Seat": "030E"
       }
      }
     }
    ],
    "Price": {
     "@type": "PriceDetail",
     "CurrencyCode": {
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
  "ReferenceList": [
   {
    "@type": "ReferenceListFlight",
    "Flight": [
     {
      "@type": "Flight",
      "duration": "PT1H25M",
      "carrier": "QF",
      "number": "414",
      "equipment": "332",
      "id": "Flight_01",
      "Identifier": {
       "authority": "Travelport",
       "value": "22d1bb70-b405-4853-82b9-f5dbb634a9ac"
      },
      "Departure": {
       "@type": "Departure",
       "location": "MEL",
       "date": "2023-08-07",
       "time": "07:30:00"
      },
      "Arrival": {
       "@type": "Arrival",
       "location": "SYD",
       "date": "2023-08-07",
       "time": "08:55:00"
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
  "OfferID": [
   {
    "@type": "Offer",
    "id": "Offer_2",
    "Identifier": {
     "authority": "QF",
     "value": "UUYwODFISkVBN1RBN3xXM0M4MEJCQTYtMUJFNC00NjM0LUI1RUItMS0z"
    },
    "Product": [
     {
      "@type": "ProductAncillary",
      "id": "product_anc_1",
      "productRef": "product_anc_1",
      "Identifier": {
       "authority": "Travelport",
       "value": "dcc44d91-5fd6-403b-8665-e7c98cea4273"
      },
      "Quantity": 1,
      "Ancillary": {
       "@type": "AncillaryAirSeat",
       "quantity": 1,
       "FlightRef": [],
       "SeatAssignment": {
        "@type": "SeatAssignment",
        "Seat": "9F"
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
     "Base": 9.09,
     "TotalTaxes": 0.91,
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
           "taxCode": "UO",
           "value": 0.91
          }
         ]
        }
       }
      }
     ]
    },
    "TermsAndConditionsFull": [
     {
      "@type": "TermsAndConditionsFullSummary",
      "id": "termsAndConditionsFull_1",
      "Identifier": {
       "authority": "Travelport",
       "value": "71e0d5b1-d349-4898-a90b-642b27a45af3"
      }
     }
    ]
   }
  ]
 }
}
```

