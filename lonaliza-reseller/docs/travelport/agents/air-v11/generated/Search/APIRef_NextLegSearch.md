# Next Leg Search API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Search/APIRef_NextLegSearch.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Next Leg Search API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Next Leg Search API&#160;Reference Request Response Example request Example response POST catalog/search/catalogproductofferings/buildnext Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Air Search Guide , Search Workflow Diagrams The Next Leg Search API&#160;returns offers for the next leg of an itinerary after a leg-based round-trip Search . The leg-based Search response returns offers for the outbound leg of the itinerary, and Next Leg Search is then required to return offers for the next leg of the trip. For a multi-city itinerary, send an additional Next Leg Search request for each remaining leg. GDS supports searching for up to six O&amp;D&#160;pairs (legs of the itinerary) while NDC supports three O&amp;D pairs. Next Leg Search is supported only after a leg-based Search. If sent after a journey-based Search, an error message is returned. Any modifiers or indicators sent in the Search request carry over to the Next Leg Search request and are not re-sent. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body The Next Leg Search request payload sends identifiers for the preceding search response and the offer and product to select for the first leg. Show Request Body Table Object Description Required CatalogProductOfferingsQueryBuildNext Top level object. Required BuildFromCatalogProductOfferingsRequest Top level object. Required CatalogProductOfferingsIdentifier Includes Identifier object for Search response transaction. Required CatalogProductOfferingsIdentifier/ Identifier Sends the transaction identifier from the Search response. The Search response does not return the CatalogProductOfferings/Identifier object if caching is not invoked with offersPerPage in the Search request. A subsequent reference payload request to those search results cannot be sent without caching and the CatalogProductOfferings/Identifier value. Required value Send the Value from CatalogProductOfferings/Identifier/value in the Search response. Required CatalogProductOfferingSelection &#160; Top level object. Includes CatalogProductOfferingIdentifier and ProductIdentifier. Required CatalogProductOfferingIdentifier Includes Identifier object for offer to select for the first leg of the itinerary. Required CatalogProductOfferingIdentifier/ Identifier Sends the offer identifier from the Search response. Includes value. Required &#160; value String. Value from CatalogProductOffering/id in the Search response for the offer to select for the first leg of the itinerary. When sending a second Next Leg Search request in a multi-city search, this value is for the selected offer for the second leg of the itinerary, and so on for additional O&amp;D pairs. Required ProductIdentifier Includes Identifier object for product to select for the first leg of the itinerary. Required ProductIdentifier/ Identifier Sends the product identifier from the Search response. Required &#160; value String. Value from CatalogProductOffering/ProductBrandOptions/ProductBrandOffering/Product/productRef in the Search response for the product to select for the first leg of the itinerary. When sending a second Next Leg Search request in a multi-city search, this value should be the offer for the second leg of the itinerary, and so on for additional O&amp;D pairs. Required Response The Next Leg Search response uses the same structure and returns the same objects as the Search response . The only differences are: The first instance of CatalogProductOffering is the offer and product sent in the Next&#160;Leg Search request. This is the selected offer and product for the first leg. Subsequent instances of CatalogProductOffering are offers for the second leg. Example Request For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . The Next Leg Search example request below is a follow-on request to a preceding round-trip leg-based Search request; see the Search API&#160;Reference for the example request that would be sent before this request. This request sends the transaction identifier from the response to that request (CatalogProductOfferingsIdentifier/Identifier)&#160;and sends identifiers for the offer and product from that response to select for the first leg of the itinerary (CatalogProductOfferingIdentifier for the offer and ProductIdentifier for the product). Show Example Next Leg Search request to follow a leg-based Search request { "CatalogProductOfferingsQueryBuildNext": { "BuildFromCatalogProductOfferingsRequest": { "@type": "BuildFromCatalogProductOfferingsRequest", "CatalogProductOfferingsIdentifier": { "Identifier": { "value": "29db38d6-0a86-45de-be4d-5310ab0bbffa" } }, "CatalogProductOfferingSelection": [ { "CatalogProductOfferingIdentifier": { "Identifier": { "value": "o1" } }, "ProductIdentifier": [ { "Identifier": { "value": "p10" } } ] } ] } } } Example Response The Next Leg Search example request below is an excerpt from the response to the above request. It is an excerpt through the end of the offers in CatalogProductOfferings and does not include ReferenceList data for brevity. This example returns two instances of CatalogProductOffering: The first instance, with id o1 and sequence 1, is the outbound leg selection sent in the request. It does not return upsells, as the fare for this leg has already been selected by sending a product identifier. The second instance of CatalogProductOffering, with id o2 and sequence 2, returns the options for the second leg of the itinerary. For brevity, the ReferenceList object and all but two instances of ProductBrandOptions for the second CatalogProductOffering have been edited out of the excerpt. Show Example Next Leg Search response excerpt { "CatalogProductOfferingsResponse": { "@type": "CatalogProductOfferingsResponse", "transactionId": "04c97c33-82d6-4cf4-9423-7d1ccda145a2:ppnd1003", "CatalogProductOfferings": { "@type": "CatalogProductOfferings", "Identifier": { "value": "29db38d6-0a86-45de-be4d-5310ab0bbffa" }, "CatalogProductOffering": [ { "@type": "CatalogProductOffering", "sequence": 1, "id": "o1", "Departure": "SYD", "Arrival": "MEL", "Brand": [ { "@type": "BrandID", "BrandRef": "b0" } ], "ProductBrandOptions": [ { "@type": "ProductBrandOptions", "ProductBrandOffering": [ { "@type": "ProductBrandOffering", "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 310.33, "TotalTaxes": 55.57, "TotalFees": 0, "TotalPrice": 365.9, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 310.33, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 55.57, "Tax": [ { "taxCode": "QR", "value": 15.4 }, { "taxCode": "WG", "value": 6.5 }, { "taxCode": "UO", "value": 33.67 } ] }, "Fees": { "@type": "FeesDetail", "TotalFees": 0 }, "Total": 365.9 } } ] }, "Brand": { "@type": "BrandID", "BrandRef": "b0" }, "Product": [ { "@type": "ProductID", "productRef": "p0" } ], "TermsAndConditions": { "@type": "TermsAndConditionsID", "termsAndConditionsRef": "T0" } } ] } ] }, { "@type": "CatalogProductOffering", "sequence": 2, "id": "o2", "Departure": "MEL", "Arrival": "SYD", "Brand": [ { "@type": "BrandID", "BrandRef": "b0" }, { "@type": "BrandID", "BrandRef": "b1" }, { "@type": "BrandID", "BrandRef": "b2" }, { "@type": "BrandID", "BrandRef": "b3" }, { "@type": "BrandID", "BrandRef": "b4" }, { "@type": "BrandID", "BrandRef": "b5" } ], "ProductBrandOptions": [ { "@type": "ProductBrandOptions", "ProductBrandOffering": [ { "@type": "ProductBrandOffering", "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 202.44, "TotalTaxes": 43.89, "TotalFees": 0, "TotalPrice": 246.33, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 202.44, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 43.89, "Tax": [ { "taxCode": "QR", "value": 15.4 }, { "taxCode": "WG", "value": 6.5 }, { "taxCode": "UO", "value": 21.99 } ] }, "Fees": { "@type": "FeesDetail", "TotalFees": 0 }, "Total": 246.33 } } ] }, "Brand": { "@type": "BrandID", "BrandRef": "b0" }, "Product": [ { "@type": "ProductID", "productRef": "p1" } ], "TermsAndConditions": { "@type": "TermsAndConditionsID", "termsAndConditionsRef": "T1" }, "BestCombinablePrice": { "@type": "BestCombinablePriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 512.77, "TotalTaxes": 99.46, "TotalPrice": 612.23, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 512.77, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 99.46, "Tax": [ { "taxCode": "QR", "value": 30.8 }, { "taxCode": "WG", "value": 13 }, { "taxCode": "UO", "value": 55.66 } ] }, "Total": 612.23 } } ] } }, { "@type": "ProductBrandOffering", "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 551.77, "TotalTaxes": 78.81, "TotalFees": 0, "TotalPrice": 630.58, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 551.77, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 78.81, "Tax": [ { "taxCode": "QR", "value": 15.4 }, { "taxCode": "WG", "value": 6.5 }, { "taxCode": "UO", "value": 56.91 } ] }, "Fees": { "@type": "FeesDetail", "TotalFees": 0 }, "Total": 630.58 } } ] }, "Brand": { "@type": "BrandID", "BrandRef": "b3" }, "Product": [ { "@type": "ProductID", "productRef": "p21" } ], "TermsAndConditions": { "@type": "TermsAndConditionsID", "termsAndConditionsRef": "T2" }, "BestCombinablePrice": { "@type": "BestCombinablePriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 1404.2, "TotalTaxes": 188.6, "TotalPrice": 1592.8, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 1404.2, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 188.6, "Tax": [ { "taxCode": "QR", "value": 30.8 }, { "taxCode": "WG", "value": 13 }, { "taxCode": "UO", "value": 144.8 } ] }, "Total": 1592.8 } } ] } }, { "@type": "ProductBrandOffering", "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 684.21, "TotalTaxes": 92.08, "TotalFees": 0, "TotalPrice": 776.29, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 684.21, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 92.08, "Tax": [ { "taxCode": "QR", "value": 15.4 }, { "taxCode": "WG", "value": 6.5 }, { "taxCode": "UO", "value": 70.18 } ] }, "Fees": { "@type": "FeesDetail", "TotalFees": 0 }, "Total": 776.29 } } ] }, "Brand": { "@type": "BrandID", "BrandRef": "b4" }, "Product": [ { "@type": "ProductID", "productRef": "p41" } ], "TermsAndConditions": { "@type": "TermsAndConditionsID", "termsAndConditionsRef": "T3" }, "BestCombinablePrice": { "@type": "BestCombinablePriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 1647.43, "TotalTaxes": 212.92, "TotalPrice": 1860.35, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 1647.43, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 212.92, "Tax": [ { "taxCode": "QR", "value": 30.8 }, { "taxCode": "WG", "value": 13 }, { "taxCode": "UO", "value": 169.12 } ] }, "Total": 1860.35 } } ] } }, { "@type": "ProductBrandOffering", "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 1101.97, "TotalTaxes": 134.27, "TotalFees": 0, "TotalPrice": 1236.24, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 1101.97, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 134.27, "Tax": [ { "taxCode": "QR", "value": 15.4 }, { "taxCode": "WG", "value": 6.5 }, { "taxCode": "UO", "value": 112.37 } ] }, "Fees": { "@type": "FeesDetail", "TotalFees": 0 }, "Total": 1236.24 } } ] }, "Brand": { "@type": "BrandID", "BrandRef": "b5" }, "Product": [ { "@type": "ProductID", "productRef": "p61" } ], "TermsAndConditions": { "@type": "TermsAndConditionsID", "termsAndConditionsRef": "T4" }, "BestCombinablePrice": { "@type": "BestCombinablePriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 2230.75, "TotalTaxes": 271.26, "TotalPrice": 2502.01, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 2230.75, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 271.26, "Tax": [ { "taxCode": "QR", "value": 30.8 }, { "taxCode": "WG", "value": 13 }, { "taxCode": "UO", "value": 227.46 } ] }, "Total": 2502.01 } } ] } } ] }, { "@type": "ProductBrandOptions", "ProductBrandOffering": [ { "@type": "ProductBrandOffering", "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 202.44, "TotalTaxes": 43.89, "TotalFees": 0, "TotalPrice": 246.33, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 202.44, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 43.89, "Tax": [ { "taxCode": "QR", "value": 15.4 }, { "taxCode": "WG", "value": 6.5 }, { "taxCode": "UO", "value": 21.99 } ] }, "Fees": { "@type": "FeesDetail", "TotalFees": 0 }, "Total": 246.33 } } ] }, "Brand": { "@type": "BrandID", "BrandRef": "b0" }, "Product": [ { "@type": "ProductID", "productRef": "p2" } ], "TermsAndConditions": { "@type": "TermsAndConditionsID", "termsAndConditionsRef": "T1" }, "BestCombinablePrice": { "@type": "BestCombinablePriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 512.77, "TotalTaxes": 99.46, "TotalPrice": 612.23, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 512.77, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 99.46, "Tax": [ { "taxCode": "QR", "value": 30.8 }, { "taxCode": "WG", "value": 13 }, { "taxCode": "UO", "value": 55.66 } ] }, "Total": 612.23 } } ] } }, { "@type": "ProductBrandOffering", "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 551.77, "TotalTaxes": 78.81, "TotalFees": 0, "TotalPrice": 630.58, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 551.77, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 78.81, "Tax": [ { "taxCode": "QR", "value": 15.4 }, { "taxCode": "WG", "value": 6.5 }, { "taxCode": "UO", "value": 56.91 } ] }, "Fees": { "@type": "FeesDetail", "TotalFees": 0 }, "Total": 630.58 } } ] }, "Brand": { "@type": "BrandID", "BrandRef": "b3" }, "Product": [ { "@type": "ProductID", "productRef": "p22" } ], "TermsAndConditions": { "@type": "TermsAndConditionsID", "termsAndConditionsRef": "T2" }, "BestCombinablePrice": { "@type": "BestCombinablePriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 1404.2, "TotalTaxes": 188.6, "TotalPrice": 1592.8, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 1404.2, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 188.6, "Tax": [ { "taxCode": "QR", "value": 30.8 }, { "taxCode": "WG", "value": 13 }, { "taxCode": "UO", "value": 144.8 } ] }, "Total": 1592.8 } } ] } }, { "@type": "ProductBrandOffering", "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 684.21, "TotalTaxes": 92.08, "TotalFees": 0, "TotalPrice": 776.29, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 684.21, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 92.08, "Tax": [ { "taxCode": "QR", "value": 15.4 }, { "taxCode": "WG", "value": 6.5 }, { "taxCode": "UO", "value": 70.18 } ] }, "Fees": { "@type": "FeesDetail", "TotalFees": 0 }, "Total": 776.29 } } ] }, "Brand": { "@type": "BrandID", "BrandRef": "b4" }, "Product": [ { "@type": "ProductID", "productRef": "p42" } ], "TermsAndConditions": { "@type": "TermsAndConditionsID", "termsAndConditionsRef": "T3" }, "BestCombinablePrice": { "@type": "BestCombinablePriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 1647.43, "TotalTaxes": 212.92, "TotalPrice": 1860.35, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 1647.43, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 212.92, "Tax": [ { "taxCode": "QR", "value": 30.8 }, { "taxCode": "WG", "value": 13 }, { "taxCode": "UO", "value": 169.12 } ] }, "Total": 1860.35 } } ] } }, { "@type": "ProductBrandOffering", "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 1101.97, "TotalTaxes": 134.27, "TotalFees": 0, "TotalPrice": 1236.24, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 1101.97, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 134.27, "Tax": [ { "taxCode": "QR", "value": 15.4 }, { "taxCode": "WG", "value": 6.5 }, { "taxCode": "UO", "value": 112.37 } ] }, "Fees": { "@type": "FeesDetail", "TotalFees": 0 }, "Total": 1236.24 } } ] }, "Brand": { "@type": "BrandID", "BrandRef": "b5" }, "Product": [ { "@type": "ProductID", "productRef": "p62" } ], "TermsAndConditions": { "@type": "TermsAndConditionsID", "termsAndConditionsRef": "T4" }, "BestCombinablePrice": { "@type": "BestCombinablePriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 2230.75, "TotalTaxes": 271.26, "TotalPrice": 2502.01, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 2230.75, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 271.26, "Tax": [ { "taxCode": "QR", "value": 30.8 }, { "taxCode": "WG", "value": 13 }, { "taxCode": "UO", "value": 227.46 } ] }, "Total": 2502.01 } } ] } } ] }, ....

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
 "CatalogProductOfferingsQueryBuildNext": {
  "BuildFromCatalogProductOfferingsRequest": {
   "@type": "BuildFromCatalogProductOfferingsRequest",
   "CatalogProductOfferingsIdentifier": {
    "Identifier": {
     "value": "29db38d6-0a86-45de-be4d-5310ab0bbffa"
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
        "value": "p10"
       }
      }
     ]
    }
   ]
  }
 }
}
```

### Block 2

```
{
 "CatalogProductOfferingsResponse": {
  "@type": "CatalogProductOfferingsResponse",
  "transactionId": "04c97c33-82d6-4cf4-9423-7d1ccda145a2:ppnd1003",
  "CatalogProductOfferings": {
   "@type": "CatalogProductOfferings",
   "Identifier": {
    "value": "29db38d6-0a86-45de-be4d-5310ab0bbffa"
   },
   "CatalogProductOffering": [
    {
     "@type": "CatalogProductOffering",
     "sequence": 1,
     "id": "o1",
     "Departure": "SYD",
     "Arrival": "MEL",
     "Brand": [
      {
       "@type": "BrandID",
       "BrandRef": "b0"
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
          "Base": 310.33,
          "TotalTaxes": 55.57,
          "TotalFees": 0,
          "TotalPrice": 365.9,
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
             "Base": 310.33,
             "Taxes": {
              "@type": "TaxesDetail",
              "TotalTaxes": 55.57,
              "Tax": [
               {
                "taxCode": "QR",
                "value": 15.4
               },
               {
                "taxCode": "WG",
                "value": 6.5
               },
               {
                "taxCode": "UO",
                "value": 33.67
               }
              ]
             },
             "Fees": {
              "@type": "FeesDetail",
              "TotalFees": 0
             },
             "Total": 365.9
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
     "Departure": "MEL",
     "Arrival": "SYD",
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
          "Base": 202.44,
          "TotalTaxes": 43.89,
          "TotalFees": 0,
          "TotalPrice": 246.33,
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
             "Base": 202.44,
             "Taxes": {
              "@type": "TaxesDetail",
              "TotalTaxes": 43.89,
              "Tax": [
               {
                "taxCode": "QR",
                "value": 15.4
               },
               {
                "taxCode": "WG",
                "value": 6.5
               },
               {
                "taxCode": "UO",
                "value": 21.99
               }
              ]
             },
             "Fees": {
              "@type": "FeesDetail",
              "TotalFees": 0
             },
             "Total": 246.33
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
           "productRef": "p1"
          }
         ],
         "TermsAndConditions": {
          "@type": "TermsAndConditionsID",
          "termsAndConditionsRef": "T1"
         },
         "BestCombinablePrice": {
          "@type": "BestCombinablePriceDetail",
          "CurrencyCode": {
           "decimalPlace": 2,
           "value": "AUD"
          },
          "Base": 512.77,
          "TotalTaxes": 99.46,
          "TotalPrice": 612.23,
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
             "Base": 512.77,
             "Taxes": {
              "@type": "TaxesDetail",
              "TotalTaxes": 99.46,
              "Tax": [
               {
                "taxCode": "QR",
                "value": 30.8
               },
               {
                "taxCode": "WG",
                "value": 13
               },
               {
                "taxCode": "UO",
                "value": 55.66
               }
              ]
             },
             "Total": 612.23
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
          "Base": 551.77,
          "TotalTaxes": 78.81,
          "TotalFees": 0,
          "TotalPrice": 630.58,
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
             "Base": 551.77,
             "Taxes": {
              "@type": "TaxesDetail",
              "TotalTaxes": 78.81,
              "Tax": [
               {
                "taxCode": "QR",
                "value": 15.4
               },
               {
                "taxCode": "WG",
                "value": 6.5
               },
               {
                "taxCode": "UO",
                "value": 56.91
               }
              ]
             },
             "Fees": {
              "@type": "FeesDetail",
              "TotalFees": 0
             },
             "Total": 630.58
            }
           }
          ]
         },
         "Brand": {
          "@type": "BrandID",
          "BrandRef": "b3"
         },
         "Product": [
          {
           "@type": "ProductID",
           "productRef": "p21"
          }
         ],
         "TermsAndConditions": {
          "@type": "TermsAndConditionsID",
          "termsAndConditionsRef": "T2"
         },
         "BestCombinablePrice": {
          "@type": "BestCombinablePriceDetail",
          "CurrencyCode": {
           "decimalPlace": 2,
           "value": "AUD"
          },
          "Base": 1404.2,
          "TotalTaxes": 188.6,
          
…
```

