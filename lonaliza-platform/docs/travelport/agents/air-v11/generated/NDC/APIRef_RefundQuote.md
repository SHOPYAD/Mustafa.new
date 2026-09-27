# Refund Quote API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/NDC/APIRef_RefundQuote.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Refund Quote API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Refund Quote API&#160;Reference Request Response Example request Example response POST book/airoffer/reservationworkbench/{ {workbenchID} /offers/canceloffer For {workbenchID} send the workbench identifier returned in ReservationResponse/Identifer/value in the workbench create response. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Exchange, Refund, and Void Guide NDC&#160;only; not supported for GDS. The Refund Quote API determines what if any refund value may be available on a ticket. It is part of the NDC cancel workflow: Create a workbench session , send Refund Quote as detailed here, and send Cancel to cancel the ticket and issue any refund. For supporting NDC carriers only, you can cancel only specified segments in Refund Quote instead of the entire itinerary. In this case, the ticket value is retained at Cancel. Refund Quote is mandatory when canceling a ticket outside the void period and there is any difference between a refund due and the purchase price. If Refund Quote is not sent, and a refund is not available for the exact amount of the purchase price, Cancel returns the error message OFFER CANNOT BE CANCELED WHEN REFUND AMOUNT DOES NOT EQUAL OFFER PRICE. PERFORM A REFUND QUOTE AND TRY AGAIN. For GDS&#160;and NDC differences in the JSON APIs, see the support tables for seats , ancillaries , fare rules , and exchanges/refunds , and the NDC&#160;and GDS Functionality Comparison . For differences within NDC by individual carriers, see NDC capabilities by airline through JSON API in the Travelport Knowledge Base. See Knowledge Base NDC&#160;Resources if you need login assistance. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body Send the message payload per below. Show Request Body Table Object Description Required/Optional OfferQueryCancelOffer Top level object. Required BuildFromOffer Top level object. Required OfferIdentifier Top level object. Required Identifier Top level object for the offer identifier. Required value Send the offer identifier for the offer to cancel and check refund status for. The offer identifier is returned in the Create Workbench response in Offer/Identifier/value. Required ProductIdentifier For supporting&#160;NDC carriers only, either within or after the void period for the ticket, to cancel segments on only one leg of the itinerary, send the product identifier for the leg to cancel. In the subsequent Cancel request, segments on products not sent in ProductIdentifier are not canceled, and the ticket value is retained. Includes Identifier object. For carrier support, see Retain Segments in NDC capabilities by airline through JSON API in the Travelport Knowledge Base. Optional; supported only for select NDC&#160;carriers Identifier Top level object. Optional; supported only for select NDC&#160;carriers value String. Send the product identifier for the leg to cancel, returned in the Create Workbench response in Offer/Product/Identifier/value. Optional; supported only for select NDC&#160;carriers Response Show Response Body Table Object Description OfferListResponse Top level object. Includes OfferID object. OfferID Returns details of any possible refund. Includes Identifier, ContentSource, Product, Price, and ModifyPrice objects. Identifier Offer identifier for the offer sent in request. In this case, authority is always the NDC carrier code. Key value pairs: authority : Source of information. value : Unique system-generated identifier. ContentSource Identifies type of content, for NDC refunds, this value is NDC .&#160; Product Standard Product object with flight details for the offer as ticketed. See Reservation Retrieve for details. Price Standard Price object with price details for the offer as ticketed. See Reservation Retrieve for details. ModifyPrice Details about any refund. Includes CurrencyCode and TotalPrice objects. CurrencyCode The currency of the fare. Key value pairs: decimalPlace: &#160;Number of decimal places in the currency. value: &#160;String. Currency code. TotalPrice Number. A positive number indicates the amount of the refund if the ticket is canceled within the void period. A negative value indicates the amount of the ticket value that would be refunded to the customer if the ticket is canceled outside the void period. Example Request The following example sends an offer identifier. All segments on the itinerary will be canceled in a subsequent Cancel request. Show Request Refund Quote Example Request { "OfferQueryCancelOffer": { "BuildFromOffer": { "@type": "BuildFromOfferAir", "OfferIdentifier": { "Identifier": { "value": "NUVJNUNCfFNRXzVFSTVDQl9BSVItMXxTUXxTUV81RUk1Q0J8cHJvZHVjdDFfczEtU0VHMXxBRFQ6UEFYMw==" } } } } } Example Response For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . In the response, ModifyPrice/TotalPrice returns the amount of any refund available. A positive number indicates the amount of the refund if the ticket is canceled within the void period. A negative value indicates the amount of the ticket value that would be refunded to the customer if the ticket is canceled outside the void period. Show Example Request Refund Quote response In the following example response, ModifyPrice indicates that if this ticket is canceled an amount of 2,935 HKD will be refunded. { "OfferListResponse": { "@type": "OfferListResponse", "OfferID": [ { "@type": "OfferModify", "scheduleChangeInd": true, "Identifier": { "authority": "SQ", "value": "NUVJNUNCfFNRXzVFSTVDQl9BSVItMXxTUXxTUV81RUk1Q0J8cHJvZHVjdDFfczEtU0VHMXxBRFQ6UEFYMw==" }, "Product": [ { "@type": "ProductAir", "totalDuration": "PT4H", "id": "product1", "Identifier": { "authority": "SQ", "value": "762fe1dd-d4b5-4458-be4a-af74b79d9e02" }, "FlightSegment": [ { "@type": "FlightSegment", "id": "s1", "sequence": 1, "Flight": { "@type": "Flight", "carrier": "SQ", "number": "895", "id": "seg1", "Identifier": { "authority": "SQ", "value": "c4e81840-f2d5-4a61-80a8-b5b218a6e20f" }, "Departure": { "@type": "DepartureDetail", "terminal": "1", "location": "HKG", "date": "2022-12-22", "time": "18:50:00" }, "Arrival": { "@type": "ArrivalDetail", "terminal": "0", "location": "SIN", "date": "2022-12-22", "time": "22:50:00" } } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 1 ], "classOfService": "W", "fareBasisCode": "W14HKO" } ] } ] } ], "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 0, "value": "HKD" }, "Base": 2670, "TotalTaxes": 265, "TotalFees": 0, "TotalPrice": 2935, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 0, "value": "HKD" }, "Base": 2670, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 265, "Tax": [ { "taxCode": "G3", "value": 90 }, { "taxCode": "HK", "value": 120 }, { "taxCode": "I5", "value": 55 } ] }, "Total": 2935 } } ] }, "ModifyPrice": { "@type": "ModifyPriceDetail", "CurrencyCode": { "value": "HKD" }, "TotalPrice": 2935 } } ] } }

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
 "OfferQueryCancelOffer": {
  "BuildFromOffer": {
   "@type": "BuildFromOfferAir",
   "OfferIdentifier": {
    "Identifier": {
     "value": "NUVJNUNCfFNRXzVFSTVDQl9BSVItMXxTUXxTUV81RUk1Q0J8cHJvZHVjdDFfczEtU0VHMXxBRFQ6UEFYMw=="
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
  "OfferID": [
   {
    "@type": "OfferModify",
    "scheduleChangeInd": true,
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
    "ModifyPrice": {
     "@type": "ModifyPriceDetail",
     "CurrencyCode": {
      "value": "HKD"
     },
     "TotalPrice": 2935
    }
   }
  ]
 }
}
```

