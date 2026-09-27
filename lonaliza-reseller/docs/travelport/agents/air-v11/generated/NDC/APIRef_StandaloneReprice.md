# Standalone Reprice API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/NDC/APIRef_StandaloneReprice.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Standalone Reprice API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Standalone Reprice API&#160;Reference Request Response Example request Example response POST reprice/reservationworkbench/ {workbenchID} /offers/buildfromoffer For {workbenchID} send the workbench identifier returned in ReservationResponse/Identifer/value in the workbench create response. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: NDC&#160;Guide NDC&#160;only; not supported for GDS. Not supported for all NDC carriers. Use the Standalone Reprice API to reprice an itinerary on a held booking for NDC. Standalone Reprice can be sent before or after the price guarantee expires. This request would typically be used to check if the price has changed before issuing a ticket. You can then either ticket the itinerary or hold the booking again. Standalone Reprice must be sent in a workbench session. It must be followed by a Modify request to commit the workbench and either ticket or hold the itinerary. If you want to ticket at Modify, send Form of Payment and Payment before Modify. For supporting NDC carriers, see "Reprice a Booking" in the Deferred Payment section in NDC capabilities by airline through JSON API in the Travelport Knowledge Base. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body Show Request Body Table Object Description Required/Optional OfferQueryBuildFromOffer Top level object. Required BuildFromOffer Top level object. Required OfferIdentifier Top level object. Required Identifier Identifier details for the offer to reprice. Required authority Send the authority value for the offer to reprice. For NDC this is the IATA carrier code. Required value Send the Identifier value for the offer to reprice. Required Response The Standalone Reprice response is the same as the response for the AirPrice reference payload request, with the following exceptions; see the AirPrice Reference Payload API&#160;Reference for the response table: The initial wrapper object for Standalone Reprice is OfferResponse instead of OfferListResponse . Standalone Reprice returns Offer instead of OfferID . Standalone Reprice returns Offer@type with the value OfferModify instead of OfferID@type with the value Offer . Example Request The request sends the offer identifiers for the itinerary to reprice. Show Example { "OfferQueryBuildFromOffer": { "@type": "OfferQueryBuildFromOffer", "BuildFromOffer": { "@type": "BuildFromOfferAir", "OfferIdentifier": { "Identifier": { "authority": "SQ", "value": "NThLOEMzfFNRXzU4SzhDM19BSVItMXxTUXxTUV81OEs4QzN8cHJvZHVjdDFfczEtU0VHMXxBRFQ6UEFYMg==" } } } } } Example Response For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . The response returns offer details and price details in the Price object. Show Example { "OfferResponse": { "@type": "OfferResponse", "Offer": { "@type": "OfferModify", "id": "o0", "Identifier": { "authority": "SQ", "value": "NThLOEMzfFNRXzU4SzhDM19BSVItMXxTUXxTUV81OEs4QzN8cHJvZHVjdDFfczEtU0VHMXxBRFQ6UEFYMnxPTlJDRDpTUXxPRlJSRVNQSUQ6eyJyZXNwb25zZUlEIjoiU1AyUC0xNjUwNTI2NzE2MTk2NzY1MTQ5MCIsIm9mZmVySUQiOiJTUDJQLTE2NTA1MjY3MTYxOTY3NjUxNDkwLTEiLCJsaXN0T2ZmZXJJdGVtUGF4SUQiOlt7Im9mZmVySXRlbUlEIjoiU1AyUC0xNjUwNTI2NzE2MTk2NzY1MTQ5MC0xLTEifV19" }, "Product": [ { "@type": "ProductAir", "totalDuration": "PT3H45M", "id": "product1", "Identifier": { "authority": "SQ", "value": "1bdb9841-b547-4cd7-bf28-0b4b015c9785" }, "FlightSegment": [ { "@type": "FlightSegment", "id": "s1", "sequence": 1, "Flight": { "@type": "Flight", "carrier": "SQ", "number": "898", "operatingCarrier": "SQ", "operatingCarrierName": "SINGAPORE AIRLINES", "id": "seg1", "Identifier": { "authority": "SQ", "value": "3c207208-31dc-43a0-8c39-d16a6af1c78d" }, "Departure": { "@type": "DepartureDetail", "terminal": "3", "location": "SIN", "date": "2024-07-02", "time": "19:00:00" }, "Arrival": { "@type": "ArrivalDetail", "terminal": "1", "location": "HKG", "date": "2024-07-02", "time": "22:45:00" } } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 1 ], "classOfService": "N", "cabin": "Economy", "fareBasisCode": "N16SGO" } ] } ] } ], "Price": { "@type": "PriceDetail", "CurrencyCode": { "value": "SGD" }, "Base": 234, "TotalTaxes": 65.2, "TotalPrice": 299.2, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "value": "SGD" }, "Base": 234, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 65.2, "Tax": [ { "taxCode": "L7", "value": 10.8 }, { "taxCode": "OP", "value": 8 }, { "taxCode": "SG", "value": 46.4 } ] }, "Fees": { "@type": "FeesDetail" }, "Total": 299.2 } } ] }, "TermsAndConditionsFull": [ { "@type": "TermsAndConditionsFullAir" } ] } } }

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
 "OfferQueryBuildFromOffer": {
  "@type": "OfferQueryBuildFromOffer",
  "BuildFromOffer": {
   "@type": "BuildFromOfferAir",
   "OfferIdentifier": {
    "Identifier": {
     "authority": "SQ",
     "value": "NThLOEMzfFNRXzU4SzhDM19BSVItMXxTUXxTUV81OEs4QzN8cHJvZHVjdDFfczEtU0VHMXxBRFQ6UEFYMg=="
    }
   }
  }
 }
}
```

### Block 2

```
{
 "OfferResponse": {
  "@type": "OfferResponse",
  "Offer": {
   "@type": "OfferModify",
   "id": "o0",
   "Identifier": {
    "authority": "SQ",
    "value": "NThLOEMzfFNRXzU4SzhDM19BSVItMXxTUXxTUV81OEs4QzN8cHJvZHVjdDFfczEtU0VHMXxBRFQ6UEFYMnxPTlJDRDpTUXxPRlJSRVNQSUQ6eyJyZXNwb25zZUlEIjoiU1AyUC0xNjUwNTI2NzE2MTk2NzY1MTQ5MCIsIm9mZmVySUQiOiJTUDJQLTE2NTA1MjY3MTYxOTY3NjUxNDkwLTEiLCJsaXN0T2ZmZXJJdGVtUGF4SUQiOlt7Im9mZmVySXRlbUlEIjoiU1AyUC0xNjUwNTI2NzE2MTk2NzY1MTQ5MC0xLTEifV19"
   },
   "Product": [
    {
     "@type": "ProductAir",
     "totalDuration": "PT3H45M",
     "id": "product1",
     "Identifier": {
      "authority": "SQ",
      "value": "1bdb9841-b547-4cd7-bf28-0b4b015c9785"
     },
     "FlightSegment": [
      {
       "@type": "FlightSegment",
       "id": "s1",
       "sequence": 1,
       "Flight": {
        "@type": "Flight",
        "carrier": "SQ",
        "number": "898",
        "operatingCarrier": "SQ",
        "operatingCarrierName": "SINGAPORE AIRLINES",
        "id": "seg1",
        "Identifier": {
         "authority": "SQ",
         "value": "3c207208-31dc-43a0-8c39-d16a6af1c78d"
        },
        "Departure": {
         "@type": "DepartureDetail",
         "terminal": "3",
         "location": "SIN",
         "date": "2024-07-02",
         "time": "19:00:00"
        },
        "Arrival": {
         "@type": "ArrivalDetail",
         "terminal": "1",
         "location": "HKG",
         "date": "2024-07-02",
         "time": "22:45:00"
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
         "classOfService": "N",
         "cabin": "Economy",
         "fareBasisCode": "N16SGO"
        }
       ]
      }
     ]
    }
   ],
   "Price": {
    "@type": "PriceDetail",
    "CurrencyCode": {
     "value": "SGD"
    },
    "Base": 234,
    "TotalTaxes": 65.2,
    "TotalPrice": 299.2,
    "PriceBreakdown": [
     {
      "@type": "PriceBreakdownAir",
      "quantity": 1,
      "requestedPassengerType": "ADT",
      "Amount": {
       "@type": "Amount",
       "CurrencyCode": {
        "value": "SGD"
       },
       "Base": 234,
       "Taxes": {
        "@type": "TaxesDetail",
        "TotalTaxes": 65.2,
        "Tax": [
         {
          "taxCode": "L7",
          "value": 10.8
         },
         {
          "taxCode": "OP",
          "value": 8
         },
         {
          "taxCode": "SG",
          "value": 46.4
         }
        ]
       },
       "Fees": {
        "@type": "FeesDetail"
       },
       "Total": 299.2
      }
     }
    ]
   },
   "TermsAndConditionsFull": [
    {
     "@type": "TermsAndConditionsFullAir"
    }
   ]
  }
 }
}
```

