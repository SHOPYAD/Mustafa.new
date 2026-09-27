# AutoPrice / Manual Fare API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Book/APIRef_AutoPrice-ManualFare.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

AutoPrice / Manual Fare API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search AutoPrice / Manual Fare API&#160;Reference Request Response Example request Example response POST book/airoffer/reservationworkbench/ {workbenchID} /offers/buildfromunpricedsegments For {workbenchID} send the workbench identifier returned in ReservationResponse/Identifer/value in the workbench create response. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Booking Guide GDS only; NDC does not support unpriced segments. Use the AutoPrice/Manual Fare API&#160;to price unpriced segments An air segment without any associated fare or pricing, generally booked for availability versus cost. Shown in the UnpricedSegments object instead of the Offer object. GDS only; NDC does not use unpriced segments. . Unpriced segments can be booked or added to an existing booking with the Unpriced Segment API . Unpriced segments are also created when the filed fare is removed from an offer with the Cancel Workbench Items API . The AutoPrice/Manual Fare API provides two options for pricing unpriced segments. You can use it to either: auto-price one or more unpriced segments build a manual fare A custom or specially negotiated price that isn’t a standard system-generated fare. Travel agents or consolidators use manual fares for unique itineraries such as complex international tickets, group travel, re-routing after disruptions, or when a standard fare isn't found. Agents must manually combine segments and ensure that all rules and conditions are met. for one or more unpriced segments using fare and pricing details from the airline or another source Each scenario uses a separate request payload. See Unpriced Segments and AutoPrice/Manual Fares in the Booking Guide for workflow and support details on both options. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body to Auto-price Unpriced Segment Use the following payload to auto-price unpriced segments. Show Request Body Table Object Description Required/Optional OfferQueryBuildFromUnpricedSegments Top level object. Required BuildfromUnpricedSegments Send with @type BuildFromUnpricedSegmentsAutoPrice. See the AirPrice Reference Payload API&#160;Reference &#160;for details on the following optional indicators: inhibitBrandContentInd lowFareFinderInd validateInventoryInd lowFareFindAndRebookInd Required UnpricedFlightSegmentCriteria Top level object. Required Sequence Number. Send the sequence of this segment in the itinerary. Required TravelerRefs Array. Send the traveler reference IDs for this segment. Required PricingModifiersAir Send currency details. Required currencyCode Send the currency code of the currency for pricing. Required CustomReponseModifiersAir Send empty object with @type CustomResponseModifiersAir. Required PaymentCriteria Send empty object with @type PaymentCriteria. Required CabinPreference Send standard CabinPreference object. Optional type String. The type of cabin preference. Supported values are (no default): Permitted: ONLY the specified class or classes. Preferred: Specified class or classes; lower classes if the specified class is not available. PreferredWithUpgrade: Specified class or classes; will return higher classes if the specified class is not available. Required if CabinPreference sent cabins String. A space-delimited list of cabins. Supported values are (no default): Economy PremiumEconomy Business First PremiumFirst Required if CabinPreference sent legSequence Number. The sequence number of the leg to which this preference applies. Required if CabinPreference sent Request Body to Build Manual Fare Use the following payload to build a manual fare for unpriced segments. Object Description Required/Optional OfferQueryBuildFromUnpricedSegments Top level object. Required BuildfromUnpricedSegments Top level object. Send with @type OfferQueryBuildFromUnpricedSegments. Includes UnpricedFlightSegmentCriteria and ManualPrice. Required UnpricedFlightSegmentCriteria Top level object identifying the flight to build manual fare for. Required UnpricedFlightSegmentRefs String array. Send the segment reference for the flight this fare applies to. Required Sequence Number. Send segment sequence number of the flight this fare applies to. Required TravelerRefs Standard TravelerRefs object. Array. Send traveler ref ids for all travelers on this fare. Required ManualPrice Top level object to build the manual fare. Required id String.&#160;Custom id for this manual fare. Required ContentSource String. Identifies content source. Send with value GDS . Required PassengerFlight Array. Send PTC and class/fare information. See the AirPrice Reference Payload API&#160;Reference response section for details, and refer to schema for full details. Data and objects included here vary depending on the fare built; see note above for required and optional data. Required PriceDetail Send price details for the manual fare in the standard Price objects. See the AirPrice Reference Payload API&#160;Reference Price object table for details, and refer to schema for full details. Data and objects included here vary depending on the fare built; at a minimum, all of the following is required: fare basis code currency and fare IATA ROE taxes total price including base price and taxes fare calculation line Optional data can include the following: ticket designator not valid after/not valid before equivalent fare stopover tax exempt endorsement (note that returning endorsements in the Reservation Retrieve requires requesting the detailed view) baggage allowance Required Response Show Response Body Table Object Description OfferListResponse Top level object for response. Result Messages about the operation status. Key value pairs: status: &#160;String. Status of request. Example Request For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . Show Example Request for auto-pricing { "OfferQueryBuildFromUnpricedSegments": { "@type": "OfferQueryBuildFromUnpricedSegments", "BuildFromUnpricedSegments": [ { "@type": "BuildFromUnpricedSegmentsAutoPrice", "inhibitBrandContentInd": true, "lowFareFinderInd": true, "validateInventoryInd": true, "lowFareFindAndRebookInd": true, "UnpricedFlightSegmentCriteria": [ { "@type": "UnpricedFlightSegmentCriteria", "UnpricedFlightSegmentRefs": [ "unPricedFlightSegment_1" ], "Sequence": 1, "TravelerRefs": [ "travelerRefId_1" ] } ], "PricingModifiersAir": { "@type": "PricingModifiersAir", "currencyCode": "AUD" }, "CustomResponseModifiersAir": { "@type": "CustomResponseModifiersAir" }, "PaymentCriteria": { "@type": "PaymentCriteria" }, "CabinPreference": [ { "@type": "CabinPreference", "preferenceType": "Preferred", "cabins": [ "Business" ], "legSequence": [ 1 ] } ], } ] } } Show Example request for manual fare build { "OfferQueryBuildFromUnpricedSegments": { "@type": "OfferQueryBuildFromUnpricedSegments", "BuildFromUnpricedSegments": [ { "@type": "BuildFromUnpricedSegmentsManualPrice", "UnpricedFlightSegmentCriteria": [ { "@type": "UnpricedFlightSegmentCriteria", "UnpricedFlightSegmentRefs": [ "unPricedFlightSegment_1" ], "Sequence": 1, "TravelerRefs": [ "travelerRefId_1" ] } ], "ManualPrice": { "@type": "ManualPrice", "id": "manualoffer_1", "ContentSource": "GDS", "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 1 ], "classOfService": "Y", "cabin": "Economy", "fareBasisCode": "YEE1Y" }, { "@type": "FlightProduct", "segmentSequence": [ 2 ], "classOfService": "B", "cabin": "Economy", "fareBasisCode": "BEE1Y" } ] } ], "PriceDetail": { "@type": "PriceDetail", "id": "price_1", "CurrencyCode": { "value": "AUD", "decimalPlace": 2 }, "Base": 650, "TotalTaxes": 70, "TotalPrice": 720, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "value": "AUD", "decimalPlace": 2 }, "Base": 250, "Total": 280, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 30, "Tax": [ { "value": 20, "currencyCode": "AUD", "taxCode": "GB" } ] } }, "TravelerRefs": [ "travelerRefId_1" ], "FareCalculation": "LON BA AMS R125.00YEE1Y BA LHR R125.00BEE1Y NUC250.00END ROE0.787855" } ] } } } ] } } Example Response For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . Show Example Response { "OfferListResponse": { "Result": { "@type": "Result", "status": "Complete" } } }

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
    "OfferQueryBuildFromUnpricedSegments": {
        "@type": "OfferQueryBuildFromUnpricedSegments",
        "BuildFromUnpricedSegments": [
            {
                "@type": "BuildFromUnpricedSegmentsAutoPrice",
                "inhibitBrandContentInd": true,
                "lowFareFinderInd": true,
                "validateInventoryInd": true,
                "lowFareFindAndRebookInd": true,
                "UnpricedFlightSegmentCriteria": [
                    {
                        "@type": "UnpricedFlightSegmentCriteria",
                        "UnpricedFlightSegmentRefs": [
                            "unPricedFlightSegment_1"
                        ],
                        "Sequence": 1,
                        "TravelerRefs": [
                            "travelerRefId_1"
                        ]
                    }
                ],
                "PricingModifiersAir": {
                    "@type": "PricingModifiersAir",
                    "currencyCode": "AUD"
                },
                "CustomResponseModifiersAir": {
                    "@type": "CustomResponseModifiersAir"
                },
                "PaymentCriteria": {
                    "@type": "PaymentCriteria"
                },
                "CabinPreference": [
                    {
                        "@type": "CabinPreference",
                        "preferenceType": "Preferred",
                        "cabins": [
                            "Business"
                        ],
                        "legSequence": [
                            1
                        ]
                    }
                ],
            }
        ]
    }
}
```

### Block 2

```
{
 "OfferQueryBuildFromUnpricedSegments": {
  "@type": "OfferQueryBuildFromUnpricedSegments",
  "BuildFromUnpricedSegments": [
   {
    "@type": "BuildFromUnpricedSegmentsManualPrice",
    "UnpricedFlightSegmentCriteria": [
     {
      "@type": "UnpricedFlightSegmentCriteria",
      "UnpricedFlightSegmentRefs": [
       "unPricedFlightSegment_1"
      ],
      "Sequence": 1,
      "TravelerRefs": [
       "travelerRefId_1"
      ]
     }
    ],
    "ManualPrice": {
     "@type": "ManualPrice",
     "id": "manualoffer_1",
     "ContentSource": "GDS",
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
         "cabin": "Economy",
         "fareBasisCode": "YEE1Y"
        },
        {
         "@type": "FlightProduct",
         "segmentSequence": [
          2
         ],
         "classOfService": "B",
         "cabin": "Economy",
         "fareBasisCode": "BEE1Y"
        }
       ]
      }
     ],
     "PriceDetail": {
      "@type": "PriceDetail",
      "id": "price_1",
      "CurrencyCode": {
       "value": "AUD",
       "decimalPlace": 2
      },
      "Base": 650,
      "TotalTaxes": 70,
      "TotalPrice": 720,
      "PriceBreakdown": [
       {
        "@type": "PriceBreakdownAir",
        "quantity": 1,
        "requestedPassengerType": "ADT",
        "Amount": {
         "@type": "Amount",
         "CurrencyCode": {
          "value": "AUD",
          "decimalPlace": 2
         },
         "Base": 250,
         "Total": 280,
         "Taxes": {
          "@type": "TaxesDetail",
          "TotalTaxes": 30,
          "Tax": [
           {
            "value": 20,
            "currencyCode": "AUD",
            "taxCode": "GB"
           }
          ]
         }
        },
        "TravelerRefs": [
         "travelerRefId_1"
        ],
        "FareCalculation": "LON BA AMS R125.00YEE1Y BA LHR R125.00BEE1Y NUC250.00END ROE0.787855"
       }
      ]
     }
    }
   }
  ]
 }
}
```

### Block 3

```
{
    "OfferListResponse": {
        "Result": {
            "@type": "Result",
            "status": "Complete"
        }
    }
}
```

