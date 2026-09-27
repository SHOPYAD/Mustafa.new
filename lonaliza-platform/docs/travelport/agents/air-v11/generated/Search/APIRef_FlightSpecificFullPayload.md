# Flight Specific Search Full Payload API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Search/APIRef_FlightSpecificFullPayload.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Flight Specific Search Full Payload API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Flight Specific Search Full Payload API&#160;Reference Request Response Example request Example response POST catalog/search/catalogproductofferings/buildoptions When sending a Premium Flex request, use the endpoint catalog/search/catalogproductofferings/buildpremiumflexoptions Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Air Search Guide , Search Workflow Diagrams Use the Flight Specific Search full payload request to return additional upsells for one or more flights. You must send all required flight details; a preceding Search or Next Leg Search is not required. You can request up to 99 upsells. GDS&#160;only, not supported for NDC. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body The Flight Specific Search POST request requires a message payload with itinerary details. The following table details the required objects. If SpecificFlightCriteria/cabin or /classOfService is sent, those are ignored. Show Request Body Table Object Description Required/Optional &#160; CatalogProductOfferingsQueryBuildOptions Top level object for request. Required &#160; BuildOptions Top level object. Required &#160; maxNumberOfUpsellsToReturn Number of upsells to return. Valid values are 0 to 99 inclusive. If the carrier has filed fewer upsells, all filed upsells are returned. Optional &#160; BuildFromProductsRequest Top level object. Includes PassengerCriteria and ProductCriteriaAir. Required &#160; PassengerCriteria Array. Defines the type of passenger to search for. Send one PassengerCriteria for each passenger type code (PTC). Flight Specific Search supports up to 9 total passengers across all PTCs. Required &#160; passengerTypeCode String. The passenger type code for the passengers on the itinerary. Common PTCs are: ADT: adult CHD: child of unknown age (see Notes on PTC and age below) CNN:&#160;child when age is known INF:&#160;infant without a seat INS:&#160;infant with a seat UNN:&#160;unaccompanied child See the Downloads page to download a full list of PTCs. Required &#160; number Number. The number of passengers with this PTC. Required &#160; age Number. The age of the passenger. Notes on PTC and age Travelport recommends sending age only with PTCs that require age for pricing. For child passengers, Travelport recommends sending the age of the child in the age attribute plus the PTC CNN. Travelport recommends against sending CNN without age, or the CHD PTC. Many fares cannot be quoted for CHD. The age for CNN&#160;is generally between 2 and 11 inclusive, with ADT fares returned for ages 12 and up; however, this can vary by airline and country. The age for INF&#160;must be either 0 or 1. During booking, date of birth is required for all child and infant PTCs ( Add Traveler payload in Traveler/birthDate). Optional &#160; ProductCriteriaAir Includes SpecificFlightCriteria. Required &#160; SpecificFlightCriteria &#160; Array. Provides details for one flight to search for upsells for. Required &#160; carrier IATA code for the airline carrier for this flight. Required &#160; flightNumber String. Flight number. Required &#160; departureDate String. Date of departure in YYYY-MM-DD format (e.g., departureDate="2022-12-06"). Required &#160; departureTime String. Time of departure in HH:MM:SS format (e.g., departureTime="18:00:00"). Required &#160; arrivalDate String. Date of arrival in YYYY-MM-DD format (e.g., arrivalDate="2022-12-06"). Required &#160; arrivalTime String. Time of arrival in HH:MM:SS format (e.g., arrivalTime="22:30:00"). Required &#160; from String. The IATA location code for the departure airport/city for this flight. Required &#160; to String. The IATA location code for the arrival airport/city for this flight. Required &#160; segmentSequence Number. Order of this flight in the sequence; e.g., 1 for the departure flight and 2 for the return flight. The segmentSequence value for connecting flights should be the same. For example, for two connecting flights on the outbound leg of the itinerary, send both flights with the segmentSequence=1 The segmentSequence value for stopover flights should be sequential, e.g., values 1 and 2 . Example segmentSequence scenario On an example itinerary DEL&gt;LON&gt;JFK&gt;PAR&gt;DEL, in which LON is a connecting city and PAR is a stopover city, send segmentSequence values as follows: For Leg 1, from origin DEL to destination JFK, send both the segments DEL&gt;LON&#160;and LON&gt;JFK with segmentSequence=1 For Leg 2, from origin JFK to destination PAR, send the segment JFK&gt;PAR with segmentSequence=2 For Leg 3, from origin PAR to destination DEL, send the segment PAR&gt;DEL with segmentSequence=3 Required for round-trip and multi-leg Optional for one-way &#160; MultiPricingAgency String array. Invokes Premium Flex Search POS feature. Send up to three PCCs to return offers for those point of sale agencies in addition to your provisioned PCC. GDS&#160;only; not supported for NDC. Must append /buildpremiumflexoptions to the endpoint. See Premium Flex Search in the Air Search&#160;Guide for usage and examples, and usage of the Accept header value to specify returning aggregated or streamed content. Optional &#160; Response The Flight Specific Search response uses the same structure and returns the same objects as the Search response . The differences are: Only one instance of CatalogProductOffering (id o1) is returned, as this includes all upsells for the one product sent in the request. Only one instance of ReferenceListProduct/Product is returned, as one product was sent in the request. Example Request The following example request sends full flight details to request all upsells on a one-way GDS itinerary with connecting flights. Show Example request { "CatalogProductOfferingsQueryBuildOptions": { "BuildOptions": { "@type": "BuildOptionsFromProducts", "maxNumberOfUpsellsToReturn": 99, "BuildFromProductsRequest": { "@type": "BuildFromProductsRequestAir", "PassengerCriteria": [ { "@type": "PassengerCriteria", "number": 1, "passengerTypeCode": "ADT" } ], "ProductCriteriaAir": [ { "SpecificFlightCriteria": [ { "flightNumber": "481", "carrier": "AA", "departureDate": "2024-01-07", "departureTime": "10:06:00", "arrivalDate": "2024-01-07", "arrivalTime": "12:45:00", "from": "ORD", "to": "DFW", "classOfService": "L", "cabin": "Economy", "segmentSequence": 1, "brandTier": "7", "boundFlightsInd": true, "AvailabilitySourceCode": "S", "ContentSource": "GDS" }, { "flightNumber": "1832", "carrier": "AA", "departureDate": "2024-01-07", "departureTime": "14:45:00", "arrivalDate": "2024-01-07", "arrivalTime": "15:50:00", "from": "DFW", "to": "DEN", "classOfService": "L", "cabin": "Economy", "segmentSequence": 2, "brandTier": "7", "AvailabilitySourceCode": "S", "ContentSource": "GDS" } ] } ] } } } } Example Response The following example response excerpt returns the base fare (b0) and 11upsell fares (b1-11), each in an instance of ProductBrandOffering. The Result and ReferenceList objects have been edited out for brevity; see the developer toolkits for full examples. Show Example { "CatalogProductOfferingsResponse": { "@type": "CatalogProductOfferingsResponse", "transactionId": "4a3c23fa-b2e9-413e-9573-a2f4b49785db:ppnd1003", "CatalogProductOfferings": { "@type": "CatalogProductOfferings", "Identifier": { "value": "19c6b779-8fae-40ff-a2f0-7a10d592a7fd" }, "CatalogProductOffering": [ { "@type": "CatalogProductOffering", "sequence": 1, "id": "o1", "Departure": "ORD", "Arrival": "DEN", "Brand": [ { "@type": "BrandID", "BrandRef": "b0" }, { "@type": "BrandID", "BrandRef": "b1" }, { "@type": "BrandID", "BrandRef": "b2" }, { "@type": "BrandID", "BrandRef": "b3" }, { "@type": "BrandID", "BrandRef": "b4" }, { "@type": "BrandID", "BrandRef": "b5" }, { "@type": "BrandID", "BrandRef": "b6" }, { "@type": "BrandID", "BrandRef": "b7" }, { "@type": "BrandID", "BrandRef": "b8" }, { "@type": "BrandID", "BrandRef": "b9" }, { "@type": "BrandID", "BrandRef": "b10" }, { "@type": "BrandID", "BrandRef": "b11" } ], "ProductBrandOptions": [ { "@type": "ProductBrandOptions", "flightRefs": [ "s1", "s2" ], "ProductBrandOffering": [ { "@type": "ProductBrandOffering", "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 0, "value": "HKD" }, "Base": 1610, "TotalTaxes": 313, "TotalFees": 0, "TotalPrice": 1923, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 0, "value": "HKD" }, "Base": 1610, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 313, "Tax": [ { "taxCode": "AY", "value": 44 }, { "taxCode": "US", "value": 121 }, { "taxCode": "XF", "value": 72 }, { "taxCode": "ZP", "value": 76 } ] }, "Fees": { "@type": "FeesDetail", "TotalFees": 0 }, "Total": 1923 }, "Surcharges": { "@type": "SurchargesDetail", "approximateInd": true, "TotalSurcharges": 80, "Surcharge": [ { "currencyCode": "HKD", "purpose": "Other", "decimalPlace": 0, "value": 80 } ] } } ] }, "Brand": { "@type": "BrandID", "BrandRef": "b0" }, "Product": [ { "@type": "ProductID", "productRef": "p0" } ], "TermsAndConditions": { "@type": "TermsAndConditionsID", "termsAndConditionsRef": "T0" }, "CombinabilityCode": [ "j1" ], "BestCombinablePrice": { "@type": "BestCombinablePriceDetail", "CurrencyCode": { "decimalPlace": 0, "value": "HKD" }, "Base": 1610, "TotalTaxes": 313, "TotalPrice": 1923, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 0, "value": "HKD" }, "Base": 1610, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 313, "Tax": [ { "taxCode": "AY", "value": 44 }, { "taxCode": "US", "value": 121 }, { "taxCode": "XF", "value": 72 }, { "taxCode": "ZP", "value": 76 } ] }, "Total": 1923 } } ] } }, { "@type": "ProductBrandOffering", "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 0, "value": "HKD" }, "Base": 3420, "TotalTaxes": 449, "TotalFees": 0, "TotalPrice": 3869, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 0, "value": "HKD" }, "Base": 3420, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 449, "Tax": [ { "taxCode": "AY", "value": 44 }, { "taxCode": "US", "value": 257 }, { "taxCode": "XF", "value": 72 }, { "taxCode": "ZP", "value": 76 } ] }, "Fees": { "@type": "FeesDetail", "TotalFees": 0 }, "Total": 3869 }, "Surcharges": { "@type": "SurchargesDetail", "approximateInd": true, "TotalSurcharges": 80, "Surcharge": [ { "currencyCode": "HKD", "purpose": "Other", "decimalPlace": 0, "value": 80 } ] } } ] }, "Brand": { "@type": "BrandID", "BrandRef": "b8" }, "Product": [ { "@type": "ProductID", "productRef": "p1" } ], "TermsAndConditions": { "@type": "TermsAndConditionsID", "termsAndConditionsRef": "T1" }, "CombinabilityCode": [ "j2" ], "BestCombinablePrice": { "@type": "BestCombinablePriceDetail", "CurrencyCode": { "decimalPlace": 0, "value": "HKD" }, "Base": 3420, "TotalTaxes": 449, "TotalPrice": 3869, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 0, "value": "HKD" }, "Base": 3420, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 449, "Tax": [ { "taxCode": "AY", "value": 44 }, { "taxCode": "US", "value": 257 }, { "taxCode": "XF", "value": 72 }, { "taxCode": "ZP", "value": 76 } ] }, "Total": 3869 } } ] } }, { "@type": "ProductBrandOffering", "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 0, "value": "HKD" }, "Base": 3380, "TotalTaxes": 446, "TotalFees": 0, "TotalPrice": 3826, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 0, "value": "HKD" }, "Base": 3380, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 446, "Tax": [ { "taxCode": "AY", "value": 44 }, { "taxCode": "US", "value": 254 }, { "taxCode": "XF", "value": 72 }, { "taxCode": "ZP", "value": 76 } ] }, "Fees": { "@type": "FeesDetail", "TotalFees": 0 }, "Total": 3826 }, "Surcharges": { "@type": "SurchargesDetail", "approximateInd": true, "TotalSurcharges": 80, "Surcharge": [ { "currencyCode": "HKD", "purpose": "Other", "decimalPlace": 0, "value": 80 } ] } } ] }, "Brand": { "@type": "BrandID", "BrandRef": "b9" }, "Product": [ { "@type": "ProductID", "productRef": "p2" } ], "TermsAndConditions": { "@type": "TermsAndConditionsID", "termsAndConditionsRef": "T2" }, "CombinabilityCode": [ "j3" ], "BestCombinablePrice": { "@type": "BestCombinablePriceDetail", "CurrencyCode": { "decimalPlace": 0, "value": "HKD" }, "Base": 3380, "TotalTaxes": 446, "TotalPrice": 3826, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 0, "value": "HKD" }, "Base": 3380, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 446, "Tax": [ { "taxCode": "AY", "value": 44 }, { "taxCode": "US", "value": 254 }, { "taxCode": "XF", "value": 72 }, { "taxCode": "ZP", "value": 76 } ] }, "Total": 3826 } } ] } }, { "@type": "ProductBrandOffering", "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 0, "value": "HKD" }, "Base": 4470, "TotalTaxes": 528, "TotalFees": 0, "TotalPrice": 4998, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 0, "value": "HKD" }, "Base": 4470, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 528, "Tax": [ { "taxCode": "AY", "value": 44 }, { "taxCode": "US", "value": 336 }, { "taxCode": "XF", "value": 72 }, { "taxCode": "ZP", "value": 76 } ] }, "Fees": { "@type": "FeesDetail", "TotalFees": 0 }, "Total": 4998 }, "Surcharges": { "@type": "SurchargesDetail", "approximateInd": true, "TotalSurcharges": 80, "Surcharge": [ { "currencyCode": "HKD", "purpose": "Other", "decimalPlace": 0, "value": 80 } ] } } ] }, "Brand": { "@type": "BrandID", "BrandRef": "b10" }, "Product": [ { "@type": "ProductID", "productRef": "p3" } ], "TermsAndConditions": { "@type": "TermsAndConditionsID", "termsAndConditionsRef": "T3" }, "CombinabilityCode": [ "j4" ], "BestCombinablePrice": { "@type": "BestCombinablePriceDetail", "CurrencyCode": { "decimalPlace": 0, "value": "HKD" }, "Base": 4470, "TotalTaxes": 528, "TotalPrice": 4998, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 0, "value": "HKD" }, "Base": 4470, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 528, "Tax": [ { "taxCode": "AY", "value": 44 }, { "taxCode": "US", "value": 336 }, { "taxCode": "XF", "value": 72 }, { "taxCode": "ZP", "value": 76 } ] }, "Total": 4998 } } ] } }, { "@type": "ProductBrandOffering", "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 0, "value": "HKD" }, "Base": 48280, "TotalTaxes": 3813, "TotalFees": 0, "TotalPrice": 52093, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 0, "value": "HKD" }, "Base": 48280, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 3813, "Tax": [ { "taxCode": "AY", "value": 44 }, { "taxCode": "US", "value": 3621 }, { "taxCode": "XF", "value": 72 }, { "taxCode": "ZP", "value": 76 } ] }, "Fees": { "@type": "FeesDetail", "TotalFees": 0 }, "Total": 52093 } } ] }, "Brand": { "@type": "BrandID", "BrandRef": "b11" }, "Product": [ { "@type": "ProductID", "productRef": "p4" } ], "TermsAndConditions": { "@type": "TermsAndConditionsID", "termsAndConditionsRef": "T4" }, "CombinabilityCode": [ "j5" ], "BestCombinablePrice": { "@type": "BestCombinablePriceDetail", "CurrencyCode": { "decimalPlace": 0, "value": "HKD" }, "Base": 48280, "TotalTaxes": 3813, "TotalPrice": 52093, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 0, "value": "HKD" }, "Base": 48280, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 3813, "Tax": [ { "taxCode": "AY", "value": 44 }, { "taxCode": "US", "value": 3621 }, { "taxCode": "XF", "value": 72 }, { "taxCode": "ZP", "value": 76 } ] }, "Total": 52093 } } ] } } ] } ] } ] }, "Result": {...}, "ReferenceList": [...] } }

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
 "CatalogProductOfferingsQueryBuildOptions": {
  "BuildOptions": {
   "@type": "BuildOptionsFromProducts",
   "maxNumberOfUpsellsToReturn": 99,
   "BuildFromProductsRequest": {
    "@type": "BuildFromProductsRequestAir",
    "PassengerCriteria": [
     {
      "@type": "PassengerCriteria",
      "number": 1,
      "passengerTypeCode": "ADT"
     }
    ],
    "ProductCriteriaAir": [
     {
      "SpecificFlightCriteria": [
       {
        "flightNumber": "481",
        "carrier": "AA",
        "departureDate": "2024-01-07",
        "departureTime": "10:06:00",
        "arrivalDate": "2024-01-07",
        "arrivalTime": "12:45:00",
        "from": "ORD",
        "to": "DFW",
        "classOfService": "L",
        "cabin": "Economy",
        "segmentSequence": 1,
        "brandTier": "7",
        "boundFlightsInd": true,
        "AvailabilitySourceCode": "S",
        "ContentSource": "GDS"
       },
       {
        "flightNumber": "1832",
        "carrier": "AA",
        "departureDate": "2024-01-07",
        "departureTime": "14:45:00",
        "arrivalDate": "2024-01-07",
        "arrivalTime": "15:50:00",
        "from": "DFW",
        "to": "DEN",
        "classOfService": "L",
        "cabin": "Economy",
        "segmentSequence": 2,
        "brandTier": "7",
        "AvailabilitySourceCode": "S",
        "ContentSource": "GDS"
       }
      ]
     }
    ]
   }
  }
 }
}
```

### Block 2

```
{
 "CatalogProductOfferingsResponse": {
  "@type": "CatalogProductOfferingsResponse",
  "transactionId": "4a3c23fa-b2e9-413e-9573-a2f4b49785db:ppnd1003",
  "CatalogProductOfferings": {
   "@type": "CatalogProductOfferings",
   "Identifier": {
    "value": "19c6b779-8fae-40ff-a2f0-7a10d592a7fd"
   },
   "CatalogProductOffering": [
    {
     "@type": "CatalogProductOffering",
     "sequence": 1,
     "id": "o1",
     "Departure": "ORD",
     "Arrival": "DEN",
     "Brand": [
      {
       "@type": "BrandID",
       "BrandRef": "b0"
      },
      {
       "@type": "BrandID",
       "BrandRef": "b1"
      },
      {
       "@type": "BrandID",
       "BrandRef": "b2"
      },
      {
       "@type": "BrandID",
       "BrandRef": "b3"
      },
      {
       "@type": "BrandID",
       "BrandRef": "b4"
      },
      {
       "@type": "BrandID",
       "BrandRef": "b5"
      },
      {
       "@type": "BrandID",
       "BrandRef": "b6"
      },
      {
       "@type": "BrandID",
       "BrandRef": "b7"
      },
      {
       "@type": "BrandID",
       "BrandRef": "b8"
      },
      {
       "@type": "BrandID",
       "BrandRef": "b9"
      },
      {
       "@type": "BrandID",
       "BrandRef": "b10"
      },
      {
       "@type": "BrandID",
       "BrandRef": "b11"
      }
     ],
     "ProductBrandOptions": [
      {
       "@type": "ProductBrandOptions",
       "flightRefs": [
        "s1",
        "s2"
       ],
       "ProductBrandOffering": [
        {
         "@type": "ProductBrandOffering",
         "Price": {
          "@type": "PriceDetail",
          "CurrencyCode": {
           "decimalPlace": 0,
           "value": "HKD"
          },
          "Base": 1610,
          "TotalTaxes": 313,
          "TotalFees": 0,
          "TotalPrice": 1923,
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
             "Base": 1610,
             "Taxes": {
              "@type": "TaxesDetail",
              "TotalTaxes": 313,
              "Tax": [
               {
                "taxCode": "AY",
                "value": 44
               },
               {
                "taxCode": "US",
                "value": 121
               },
               {
                "taxCode": "XF",
                "value": 72
               },
               {
                "taxCode": "ZP",
                "value": 76
               }
              ]
             },
             "Fees": {
              "@type": "FeesDetail",
              "TotalFees": 0
             },
             "Total": 1923
            },
            "Surcharges": {
             "@type": "SurchargesDetail",
             "approximateInd": true,
             "TotalSurcharges": 80,
             "Surcharge": [
              {
               "currencyCode": "HKD",
               "purpose": "Other",
               "decimalPlace": 0,
               "value": 80
              }
             ]
            }
           }
          ]
         },
         "Brand": {
          "@type": "BrandID",
          "BrandRef": "b0"
         },
         "Product": [
          {
           "@type": "ProductID",
           "productRef": "p0"
          }
         ],
         "TermsAndConditions": {
          "@type": "TermsAndConditionsID",
          "termsAndConditionsRef": "T0"
         },
         "CombinabilityCode": [
          "j1"
         ],
         "BestCombinablePrice": {
          "@type": "BestCombinablePriceDetail",
          "CurrencyCode": {
           "decimalPlace": 0,
           "value": "HKD"
          },
          "Base": 1610,
          "TotalTaxes": 313,
          "TotalPrice": 1923,
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
             "Base": 1610,
             "Taxes": {
              "@type": "TaxesDetail",
              "TotalTaxes": 313,
              "Tax": [
               {
                "taxCode": "AY",
                "value": 44
               },
               {
                "taxCode": "US",
                "value": 121
               },
               {
                "taxCode": "XF",
                "value": 72
               },
               {
                "taxCode": "ZP",
                "value": 76
               }
              ]
             },
             "Total": 1923
            }
           }
          ]
         }
        },
        {
         "@type": "ProductBrandOffering",
         "Price": {
          "@type": "PriceDetail",
          "CurrencyCode": {
           "decimalPlace": 0,
           "value": "HKD"
          },
          "Base": 3420,
          "TotalTaxes": 449,
          "TotalFees": 0,
          "TotalPrice": 3869,
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
             "Base": 3420,
             "Taxes": {
              "@type": "TaxesDetail",
              "TotalTaxes": 449,
              "Tax": [
               {
                "taxCode": "AY",
                "value": 44
               },
               {
                "taxCode": "US",
                "value": 257
               },
               {
                "taxCode": "XF",
                "value": 72
               },
               {
                "taxCode": "ZP",
                "value": 76
               }
              ]
             },
             "Fees": {
              "@type": "FeesDetail",
              "TotalFees": 0
             },
             "Total": 3869
            },
            "Surcharges": {
             "@type": "SurchargesDetail",
             "approximateInd": true,
             "TotalSurcharges": 80,
             "Surcharge": [
              {
               "currencyCode": "HKD",
               "purpose": "Other",
               "decimalPlace": 0,
               "value": 80
              }
             ]
            }
           }
          ]
         },
         "Brand": {
          "@type": "BrandID",
          "BrandRef": "b8"
         },
         "Product": [
          {
           "@type": "ProductID",
           "productRef": "p1"
          }
         ],
         "TermsAndConditions": {
          "@type": "TermsAndConditionsID",
          "termsAndConditionsRef": "T1"
         },
         "CombinabilityCode": [
          "j2"
         ],
         "BestCombinablePrice": {
          "@type": "BestCombinablePriceDetail",
          "CurrencyCode": {
           "decimalPlace": 0,
           "value": "HKD"
          },
          "Base": 3420,
          "TotalTaxes": 449,
          "TotalPrice": 3869,
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
             "Base": 3420,
             "Taxes": {
              "@type": "TaxesDetail",
              "Total
…
```

