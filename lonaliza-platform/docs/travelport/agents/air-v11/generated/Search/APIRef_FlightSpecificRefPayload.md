# Flight Specific Search Reference Payload API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Search/APIRef_FlightSpecificRefPayload.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Flight Specific Search Reference Payload API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Flight Specific Search Reference Payload API&#160;Reference Request Response Example request Example response POST catalog/search/catalogproductofferings/buildoptions Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Air Search Guide , Search Workflow Diagrams The Flight Specific Search API&#160;Reference Payload request returns additional upsells, up to 99, for any product/s returned by Search or Next Leg Search. The reference payload sends an identifier referencing a previous response and the offer and product identifiers. The full payload request does not reference a previous Search response. GDS&#160;only, not supported for NDC. Any CabinPreference in the initial Search request is applied to any subsequent Next Leg Search and reference Flight Specific Search requests. To use the Flight Specific Search reference payload request, your initial Search request must send offersPerPage to invoke caching if that Search was journey-based (leg-based search results are always cached). Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body The Flight Specific Search POST request requires a message payload with identifiers for the transaction, the offer, and the product for which you want to return additional upsells. The following table details the required objects. Show Request Body Table Object Description Required/Optional &#160; CatalogProductOfferingsQueryBuildOptions Top level object for request. Required &#160; BuildOptions Top level object. Required &#160; maxNumberOfUpsellsToReturn Number of upsells to return. Valid values are 0 to 99 inclusive. If the carrier has filed fewer upsells, all filed upsells are returned. Optional &#160; BrandOptions String. Send with the value returnAllBrands to return all brands in a fare family regardless of the brand of the anchoring flight chosen from the initial Search response. GDS only; not supported for NDC. Not supported in the Flight Specific Search full payload request. Optional &#160; BuildFromCatalogProductOfferingsRequest Top level object. Required &#160; CatalogProductOfferingsIdentifier Top level object. Includes Identifier object. Required &#160; CatalogProductOfferingsIdentifier/ Identifier The transaction identifier from the Search or Next Leg Search response. The Search response does not return the CatalogProductOfferings/Identifier object if caching is not invoked with offersPerPage in the Search request. A subsequent reference payload request to those search results cannot be sent without caching and the CatalogProductOfferings/Identifier value. Required &#160; value Value from CatalogProductOfferingsResponse /CatalogProductOfferings/Identifer/value in the Search response. Required &#160; CatalogProductOfferingSelection &#160; Array. Each instance is a set of offer and product identifiers that make up one leg of the itinerary. Repeat for each leg. GDS&#160;only; for NDC you must send identifiers for all legs. Includes CatalogProductOfferingIdentifier and ProductIdentifier. Required &#160; CatalogProductOfferingIdentifier Array. Specifies one offer from the Search or Next Leg Search response. Includes Identifier object for offer. Required &#160; CatalogProductOfferingIdentifier/ Identifier Includes the offer identifier value. Required &#160; value Value from CatalogProductOfferings/CatalogProductOffering/id in the Search or Next Leg Search response for the offer. Required &#160; ProductIdentifier Array. Specifies one product in the offer from the Search or Next Leg Search response. Includes Identifier object for product. Required &#160; ProductIdentifier/ Identifier Includes the product identifier value. Required &#160; value Value from CatalogProductOfferings/CatalogProductOffering/ ProductBrandOptions/ ProductBrandOffering/Product/productRef in the Search or Next Leg Search response for the product to request additional upsells for. Required &#160; Response The Flight Specific Search response uses the same structure and returns the same objects as the Search response . The differences are: One instance of CatalogProductOffering (id o1) is returned for each offer sent in the request. One instance of ReferenceListProduct/Product is returned for each product sent in the request. Example Request For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . The following example request sends offer and product identifiers from each leg (CatalogProductOffering) of the preceding Search request to return all filed upsells for those flights on each leg. Show Example { "CatalogProductOfferingsQueryBuildOptions": { "BuildOptions": { "@type": "BuildOptionsFromCatalogProductOptions", "maxNumberOfUpsellsToReturn": 99, "BuildFromCatalogProductOfferingsRequest": { "@type": "BuildFromCatalogProductOfferingsRequest", "CatalogProductOfferingsIdentifier": { "Identifier": { "value": "d16ea93b-1246-4fd9-900a-8708e81dfe9f" } }, "CatalogProductOfferingSelection": [ { "CatalogProductOfferingIdentifier": { "Identifier": { "value": "o1" } }, "ProductIdentifier": [ { "Identifier": { "value": "p0" } } ] }, { "CatalogProductOfferingIdentifier": { "Identifier": { "value": "o2" } }, "ProductIdentifier": [ { "Identifier": { "value": "p2" } } ] } ] } } } } Example Response The following example excerpt returns the base fare and eight upsells (BrandRef values b0-8) for the outbound leg and the base fare and seven upsells (BrandRef values b0-7) for the inbound leg. The base fare and each upsell are each returned in an instance of ProductBrandOffering. The ReferenceList objects consolidating details were removed for brevity; see the developer toolkits for full examples. Show Example response excerpt { "CatalogProductOfferingsResponse": { "@type": "CatalogProductOfferingsResponse", "transactionId": "c974d270-2c49-477d-9421-4661eb90a41b:ppnd1002", "CatalogProductOfferings": { "@type": "CatalogProductOfferings", "Identifier": { "value": "b749fcb6-4cdf-4285-ae8e-12fd317244a6" }, "CatalogProductOffering": [ { "@type": "CatalogProductOffering", "sequence": 1, "id": "o1", "Departure": "ORD", "Arrival": "ATL", "Brand": [ { "@type": "BrandID", "BrandRef": "b0" }, { "@type": "BrandID", "BrandRef": "b1" }, { "@type": "BrandID", "BrandRef": "b2" }, { "@type": "BrandID", "BrandRef": "b3" }, { "@type": "BrandID", "BrandRef": "b4" }, { "@type": "BrandID", "BrandRef": "b5" }, { "@type": "BrandID", "BrandRef": "b6" }, { "@type": "BrandID", "BrandRef": "b7" }, { "@type": "BrandID", "BrandRef": "b8" } ], "ProductBrandOptions": [ { "@type": "ProductBrandOptions", "ProductBrandOffering": [ { "@type": "ProductBrandOffering", "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 2214, "TotalTaxes": 197.51, "TotalFees": 0, "TotalPrice": 2411.51, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 2214, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 197.51, "Tax": [ { "taxCode": "AY", "value": 7.5 }, { "taxCode": "US", "value": 166.01 }, { "taxCode": "XF", "value": 12 }, { "taxCode": "ZP", "value": 12 } ] }, "Fees": { "@type": "FeesDetail", "TotalFees": 0 }, "Total": 2411.51 } } ] }, "Brand": { "@type": "BrandID", "BrandRef": "b0" }, "Product": [ { "@type": "ProductID", "productRef": "p0" } ], "TermsAndConditions": { "@type": "TermsAndConditionsID", "termsAndConditionsRef": "T0" }, "CombinabilityCode": [ "j1" ], "BestCombinablePrice": { "@type": "BestCombinablePriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 3405, "TotalTaxes": 312.4, "TotalPrice": 3717.4, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 3405, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 312.4, "Tax": [ { "taxCode": "AY", "value": 15 }, { "taxCode": "US", "value": 255.4 }, { "taxCode": "XF", "value": 12 }, { "taxCode": "ZP", "value": 30 } ] }, "Total": 3717.4 } } ] } }, { "@type": "ProductBrandOffering", "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 2462, "TotalTaxes": 216.34, "TotalFees": 0, "TotalPrice": 2678.34, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 2462, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 216.34, "Tax": [ { "taxCode": "AY", "value": 7.5 }, { "taxCode": "US", "value": 184.84 }, { "taxCode": "XF", "value": 12 }, { "taxCode": "ZP", "value": 12 } ] }, "Fees": { "@type": "FeesDetail", "TotalFees": 0 }, "Total": 2678.34 } } ] }, "Brand": { "@type": "BrandID", "BrandRef": "b8" }, "Product": [ { "@type": "ProductID", "productRef": "p1" } ], "TermsAndConditions": { "@type": "TermsAndConditionsID", "termsAndConditionsRef": "T1" }, "CombinabilityCode": [ "j10" ], "BestCombinablePrice": { "@type": "BestCombinablePriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 5839, "TotalTaxes": 495, "TotalPrice": 6334, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 5839, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 495, "Tax": [ { "taxCode": "AY", "value": 15 }, { "taxCode": "US", "value": 438 }, { "taxCode": "XF", "value": 12 }, { "taxCode": "ZP", "value": 30 } ] }, "Total": 6334 } } ] } } ] } ] }, { "@type": "CatalogProductOffering", "sequence": 2, "id": "o2", "Departure": "ATL", "Arrival": "DEN", "Brand": [ { "@type": "BrandID", "BrandRef": "b0" }, { "@type": "BrandID", "BrandRef": "b1" }, { "@type": "BrandID", "BrandRef": "b2" }, { "@type": "BrandID", "BrandRef": "b3" }, { "@type": "BrandID", "BrandRef": "b4" }, { "@type": "BrandID", "BrandRef": "b5" }, { "@type": "BrandID", "BrandRef": "b6" }, { "@type": "BrandID", "BrandRef": "b7" } ], "ProductBrandOptions": [ { "@type": "ProductBrandOptions", "ProductBrandOffering": [ { "@type": "ProductBrandOffering", "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 1191, "TotalTaxes": 114.89, "TotalFees": 0, "TotalPrice": 1305.89, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 1191, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 114.89, "Tax": [ { "taxCode": "AY", "value": 7.5 }, { "taxCode": "US", "value": 89.39 }, { "taxCode": "ZP", "value": 18 } ] }, "Fees": { "@type": "FeesDetail", "TotalFees": 0 }, "Total": 1305.89 }, "Surcharges": { "@type": "SurchargesDetail", "approximateInd": true, "TotalSurcharges": 26, "Surcharge": [ { "currencyCode": "AUD", "purpose": "Other", "decimalPlace": 2, "value": 13 }, { "currencyCode": "AUD", "purpose": "Other", "decimalPlace": 2, "value": 13 } ] } } ] }, "Brand": { "@type": "BrandID", "BrandRef": "b6" }, "Product": [ { "@type": "ProductID", "productRef": "p2" } ], "TermsAndConditions": { "@type": "TermsAndConditionsID", "termsAndConditionsRef": "T2" }, "CombinabilityCode": [ "j1" ], "BestCombinablePrice": { "@type": "BestCombinablePriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 3405, "TotalTaxes": 312.4, "TotalPrice": 3717.4, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 3405, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 312.4, "Tax": [ { "taxCode": "AY", "value": 15 }, { "taxCode": "US", "value": 255.4 }, { "taxCode": "XF", "value": 12 }, { "taxCode": "ZP", "value": 30 } ] }, "Total": 3717.4 } } ] } } ] } ] } ] }, "Result": { "@type": "Result" }, "ReferenceList": [ {...}, {...}, {...}, {...} ] } }

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
 "CatalogProductOfferingsQueryBuildOptions": {
  "BuildOptions": {
   "@type": "BuildOptionsFromCatalogProductOptions",
   "maxNumberOfUpsellsToReturn": 99,
   "BuildFromCatalogProductOfferingsRequest": {
    "@type": "BuildFromCatalogProductOfferingsRequest",
    "CatalogProductOfferingsIdentifier": {
     "Identifier": {
      "value": "d16ea93b-1246-4fd9-900a-8708e81dfe9f"
     }
    },
    "CatalogProductOfferingSelection": [
     {
      "CatalogProductOfferingIdentifier": {
       "Identifier": {
        "value": "o1"
       }
      },
      "ProductIdentifier": [
       {
        "Identifier": {
         "value": "p0"
        }
       }
      ]
     },
     {
      "CatalogProductOfferingIdentifier": {
       "Identifier": {
        "value": "o2"
       }
      },
      "ProductIdentifier": [
       {
        "Identifier": {
         "value": "p2"
        }
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
  "transactionId": "c974d270-2c49-477d-9421-4661eb90a41b:ppnd1002",
  "CatalogProductOfferings": {
   "@type": "CatalogProductOfferings",
   "Identifier": {
    "value": "b749fcb6-4cdf-4285-ae8e-12fd317244a6"
   },
   "CatalogProductOffering": [
    {
     "@type": "CatalogProductOffering",
     "sequence": 1,
     "id": "o1",
     "Departure": "ORD",
     "Arrival": "ATL",
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
      }
     ],
     "ProductBrandOptions": [
      {
       "@type": "ProductBrandOptions",
       "ProductBrandOffering": [
        {
         "@type": "ProductBrandOffering",
         "Price": {
          "@type": "PriceDetail",
          "CurrencyCode": {
           "decimalPlace": 2,
           "value": "AUD"
          },
          "Base": 2214,
          "TotalTaxes": 197.51,
          "TotalFees": 0,
          "TotalPrice": 2411.51,
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
             "Base": 2214,
             "Taxes": {
              "@type": "TaxesDetail",
              "TotalTaxes": 197.51,
              "Tax": [
               {
                "taxCode": "AY",
                "value": 7.5
               },
               {
                "taxCode": "US",
                "value": 166.01
               },
               {
                "taxCode": "XF",
                "value": 12
               },
               {
                "taxCode": "ZP",
                "value": 12
               }
              ]
             },
             "Fees": {
              "@type": "FeesDetail",
              "TotalFees": 0
             },
             "Total": 2411.51
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
           "decimalPlace": 2,
           "value": "AUD"
          },
          "Base": 3405,
          "TotalTaxes": 312.4,
          "TotalPrice": 3717.4,
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
             "Base": 3405,
             "Taxes": {
              "@type": "TaxesDetail",
              "TotalTaxes": 312.4,
              "Tax": [
               {
                "taxCode": "AY",
                "value": 15
               },
               {
                "taxCode": "US",
                "value": 255.4
               },
               {
                "taxCode": "XF",
                "value": 12
               },
               {
                "taxCode": "ZP",
                "value": 30
               }
              ]
             },
             "Total": 3717.4
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
           "decimalPlace": 2,
           "value": "AUD"
          },
          "Base": 2462,
          "TotalTaxes": 216.34,
          "TotalFees": 0,
          "TotalPrice": 2678.34,
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
             "Base": 2462,
             "Taxes": {
              "@type": "TaxesDetail",
              "TotalTaxes": 216.34,
              "Tax": [
               {
                "taxCode": "AY",
                "value": 7.5
               },
               {
                "taxCode": "US",
                "value": 184.84
               },
               {
                "taxCode": "XF",
                "value": 12
               },
               {
                "taxCode": "ZP",
                "value": 12
               }
              ]
             },
             "Fees": {
              "@type": "FeesDetail",
              "TotalFees": 0
             },
             "Total": 2678.34
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
          "j10"
         ],
         "BestCombinablePrice": {
          "@type": "BestCombinablePriceDetail",
          "CurrencyCode": {
           "decimalPlace": 2,
           "value": "AUD"
          },
          "Base": 5839,
          "TotalTaxes": 495,
          "TotalPrice": 6334,
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
             "Base": 5839,
             "Taxes": {
              "@type": "TaxesDetail",
              "TotalTaxes": 495,
              "Tax": [
               {
                "taxCode": "AY",
                "value": 15
               },
               {
                "taxCode": "US",
                "value": 438
               },
               {
                "taxCode": "XF",
                "value": 12
               },
               {
                "taxCode": "ZP",
                "value": 30
               }
              ]
             },
             "Total": 6334
            }
           }
          ]
         }
        }
       ]
      }
     ]
    },
    {
     "@type": "CatalogProductOffering",
     "sequence": 2,
     "id": "o2",
     "Departure": "ATL",
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
       "@type": "Bra
…
```

