# Reshop API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/NDC/APIRef_Reshop.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Reshop API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Reshop API&#160;Reference Request Response Example request Example response POST change/catalogofferingsairchange Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Exchange, Refund, and Void Guide NDC&#160;only; not supported for GDS. See the Exchange, Refund, and Void Guide for GDS options. The Reshop API searches for a new itinerary when modifying a held booking or exchanging a ticket for NDC. Reshop is part of the NDC&#160;modify/exchange workflow: Create a post-commit workbench , Reshop as detailed here, Reprice to confirm pricing, and Modify to commit the changes. For GDS&#160;and NDC differences in the JSON APIs, see the support tables for seats , ancillaries , fare rules , and exchanges/refunds , and the NDC&#160;and GDS Functionality Comparison . For differences within NDC by individual carriers, see NDC capabilities by airline through JSON API in the Travelport Knowledge Base. See Knowledge Base NDC&#160;Resources if you need login assistance. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body The message payload requires several identifiers: the workbench identifier returned when the workbench is created, the offer identifier, and the identifiers for all products (a product is one leg of the itinerary).&#160;If you want to change only specific segments, you must reshop the entire itinerary, not just the products to modify. Show Reshop Request Body Table Object Description Required CatalogOfferingsQueryAirChange Top level object. Required CatalogOfferingsAirChangeRequestReservation Top level object. Optional returnBrandedFaresInd Boolean. By default branded fares are not returned. Set to true to return branded fares or false to disable the return of branded fares. If not sent the default value is false . Required PassengerCriteria Array. Defines the type of passenger to search for. Send one instance of PassengerCriteria for each passenger type code (PTC) on the itinerary. Required passengerTypeCode String. The passenger type code for the passengers on the itinerary. Required number Number. The number of passengers with this PTC. Required age Number. The age of the passenger. Optional SearchCriteriaFlight &#160; Array. Defines one origin and destination (O&amp;D) pair. Send one SearchCriteriaFlight for each O&amp;D pair, or leg, to search for. Includes From and To objects. Required departureDate String. Date of departure in YYYY-MM-DD format (e.g., departureDate="2022-12-06"). Required departureTime String. Time of departure in HH:MM:SS format (e.g., departureTime="18:00:00"). departureTime is required on a same-day flight, i.e., when searching for multiple legs on the same day. Optional From Object. Required type Optional enumeration specifying whether to restrict search based on the city/airport code sent in value. Supported values are City Only Airport Only City or Airport Optional value String. The IATA location code for the departure airport/city for this leg. Required To Object Required type Optional enumeration specifying whether to restrict search based on the city/airport code sent in value. Supported values are City Only Airport Only City or Airport Optional value String. The IATA location code for the arrival city/airport for this leg. Required SearchModifiersAir Top level object for optional journey modifiers. Only CabinPreference is supported in the Reshop request. Optional CabinPreference Array. Requests a fare based on the cabin class. Only one cabin preferenceType (Permitted, Preferred, PreferredWithUpgrade) is allowed per request, but there is no limit to the number of cabins that can be sent. Support for cabin class preferences varies by NDC carrier; see NDC capabilities by airline through JSON API in the Travelport Knowledge Base. If you need login assistance, see Knowledge Base NDC&#160;Resources . Optional cabins String. A space-delimited list of cabins. Supported values are (no default): Economy PremiumEconomy Business First PremiumFirst Optional preferenceType Supported values: Permitted: Searches for ONLY the specified cabin class or classes. If that class is not available, the response does not return any offers. Preferred: Searches for the specified cabin class or classes, but will return lower classes if the specified class is not available. PreferredWithUpgrade: Searches for the specified cabin class or classes, and will return higher classes if the specified class is not available. Sending a mix of preferenceType values is not supported. For example, you cannot send an instance of CabinPreference with a preferenceType of Permitted and another instance with preferenceType of Prohibited. In this case the results default to the Preferred preference. Optional PricingModifiersAir Top level object for optional pricing modifiers. Only FareSelection/fareType is supported in the Reshop request. May include WaiverCode and FareSelection objects. Optional WaiverCode Include to send a waiver code, such as if required for rebooking after a carrier-initiated change : value: String. Any waiver code. Optional FareSelection Optional fare type preferences. Key value pair: fareType: Requests the return of specified fare types including private fares (negotiated), public fares (published), or net fares (consolidator fares, or any negotiated wholesale price that is further marked up for sale to customers). Supported values: PublicFaresOnly PrivateFaresOnly PublicAndPrivateFares (default value) AllFares:&#160;Returns both public and private fare offers. The response identifies the type of fare returned for each Product in PassengerFlight/FlightProduct @fareType. Possible values in the response are AirlinePrivateFare, AgencyPrivateFare, or PublicFare. Support for fare type preferences varies by NDC carrier; see NDC capabilities by airline through JSON API in the Travelport Knowledge Base. If you need login assistance, see Knowledge Base NDC&#160;Resources . Optional BuildFromReservationWorkbench Top level object for current reservation details. Includes ReservationIdentifier, OfferIdentifier, and ProductIdentifier. Each of these includes the standard Identifier object per below. Required ReservationIdentifier Top level object. &#160; ReservationIdentifier/Identifier Top level object for workbench identifier. Required authority Send the value returned in ReservationResponse/Identifier/authority for the workbench when it was created. Required value Send the value returned in ReservationResponse/Identifier/value for the workbench when it was created. Required OfferIdentifier Top level object. Required OfferIdentifier/Identifier Identifier details for the current offer in the reservation. Includes Identifier object per below. Required authority Send the value returned in ReservationResponse/Reservation/Offer/Identifier/authority in the workbench create step. For NDC this is the code for the carrier on which the ticket or reservation is issued. Required value Send the value returned in ReservationResponseReservation/Offer/Identifier/value in the workbench create step. Required ProductIdentifier Top level object. Required ProductIdentifier/Identifier Identifier details for the current product in the reservation. Includes Identifier object per below. Send one instance for each product currently in the reservation. A product is one leg of the itinerary. Required authority Send the value returned in ReservationResponse/Reservation/Offer/Product/Identifier/authority in the workbench create step. For NDC this is the code for the carrier on which the ticket or reservation is issued. Required value Send the value returned in ReservationResponse/Reservation/Offer/Product/Identifier/value in the workbench create step. Required Response The Reshop response uses the same general structure as the Search API response . The table below notes differences in the Reshop response and references the Search API&#160;Reference for common objects. The number of offers returned depends on availability for the search criteria. Each offer is returned in an instance of CatalogOffering. For each offer, CatalogOffering/Price/TotalPrice does not return the price of the new offer but instead for the new offer compared with the existing offer: a positive number indicates the additional amount due for that offer a zero amount indicates an even exchange a negative number indicates the offer costs less than the original itinerary and a partial refund is due Show Response Body Table Object Description CatalogOfferingsAirChangeResponse Top level object for response. Includes CatalogOfferings, Result, and ReferenceList objects. CatalogOfferings Top level object for the offers returned for the search. Same as the CatalogProductOfferings object in the Search API&#160;response. Includes CatalogOffering object. CatalogOffering Each instance returns an offer for one leg of the itinerary to be exchanged. Includes Identifier, ProductOptions, Price, and TermsAndConditions objects. Identifier Standard identifier object returned across the JSON APIs. For NDC content authority is the carrier code for the issuing carrier. Key value pairs. authority : Source of information. value : Unique system-generated identifier. ProductOptions Each instance returns a flight option/s for one leg of the itinerary. Key value pair: sequence : Sequence of this leg of the itinerary; i.e., a value of 1 indicates the first leg on the itinerary, 2 the second leg, and so on. Includes Product object. Product Flight, fare, and brand details for this product on this offer. Includes the following: id :&#160;Internal id for this product. FlightSegment : Standard FlightSegment object with a cross-reference to the flights in ReferenceListFlight that are part of this offer. See the Search API Reference for details as needed. PassengerFlight : Standard PassengerFlight object to return fare class and brand details. See the Search API Reference for details as needed. Price Standard Price object except that the amounts do not return the price of the fare for this offer but instead the price difference between the original itinerary and this specific offer. In Price/TotalPrice: a positive number indicates the additional amount due for this offer a zero amount indicates an even exchange a negative number indicates this offer costs less than the original itinerary and a partial refund is due See the Search API Reference for details on other objects as needed. TermsAndConditions Standard TermsAndConditions object to return terms and conditions for this offer. See the Search API Reference for details as needed. Result Includes objects for any warning or error message returned. May include Warning and/or Error objects. Error Returned for error messages; text of the message returned in the Message object. Warning Returned for warning messages; text of the message returned in the Message object. Message The text of any error message returned. ReferenceList ReferenceList consolidates all the details about flights, products, brands, and terms and conditions returned in CatalogOfferings. Same as the Search API&#160;response ReferenceList objects . Example Request For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . Show Example Reshop Request { "CatalogOfferingsQueryAirChange": { "CatalogOfferingsAirChangeRequestReservation": { "returnBrandedFaresInd":"true", "SearchCriteriaFlight": [ { "departureDate": "2021-12-19", "From": { "type": "Airport Only", "value": "SYD" }, "To": { "type": "Airport Only", "value": "MEL" } } ], "PassengerCriteria": [ { "number": 1, "passengerTypeCode": "ADT" } ], "BuildFromReservationWorkbench": { "ReservationIdentifier": { "Identifier": { "authority": "Travelport", "value": "1a967a6c-66e6-4edb-a24f-20bd6d8a5ee4" } }, "OfferIdentifier": { "Identifier": { "authority": "QF", "value": "UUYwODExQjY4MkE2NHxQRDlCRDI2QkItNTNDQy00OUQ3LThEMzVubGo1cnE1cWt1anp6LTEtMQ==" } }, "ProductIdentifier": [ { "Identifier": { "authority": "QF", "value": "29b5ec43-609c-4d3a-a4d9-996856bb29ca" } } ] } } } } Example Response For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . The response is structured similarly to the Search response . The price difference between the original itinerary and each offer is returned in CatalogOffering/Price/TotalPrice: a positive number indicates the additional amount due for that offer a zero amount indicates an even exchange a negative number indicates the offer costs less than the original itinerary and a partial refund is due Show Example Reshop Response The following excerpt has been truncated for brevity and includes only the first offer returned in the response. Depending on availability, multiple offers are usually returned. { "CatalogOfferingsAirChangeResponse": { "CatalogOfferings": { "@type": "CatalogOfferings", "CatalogOffering": [ { "@type": "CatalogOffering", "id": "QF1", "Identifier": { "authority": "QF", "value": "WDc3NkM5MUJFLTIyOUMtNDM3Qi05N0M3MS0xfFg3NzZDOTFCRS0yMjlDLTQzN0ItOTdDN3wyMDIxLTExLTE5VDE2OjMwOjUxfEFEVDpYNzc2QzkxQkUtMjI5Qy00MzdCLTk3QzcxLTEtMXxRRnxERUFM" }, "ProductOptions": [ { "@type": "ProductOptions", "sequence": 1, "Product": [ { "@type": "ProductAir", "totalDuration": "PT1H35M", "id": "QFp0", "FlightSegment": [ { "id": "1", "sequence": 1, "Flight": { "@type": "FlightID", "FlightRef": "QFs1" } } ], "PassengerFlight": [ { "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "segmentSequence": [ 1 ], "classOfService": "E", "cabin": "Economy", "fareBasisCode": "ESQW1", "fareType": "PublicFare", "Brand": { "@type": "Brand", "name": "RED eDeal", "Identifier": { "authority": "Travelport", "value": "1012447" } } } ] } ] } ] } ], "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 84.08, "TotalTaxes": 24.92, "TotalFees": 0, "TotalPrice": 109, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 84.08, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 24.92, "Tax": [ { "taxCode": "QR", "description": "PASSENGER SERVICE CHARGE DOMESTIC DEPARTURE", "value": 9.42 }, { "taxCode": "QR", "description": "PASSENGER SERVICE CHARGE DOMESTIC ARRIVAL", "value": 5.59 }, { "taxCode": "UO", "description": "GOODS AND SERVICES TAX GST", "value": 8.41 }, { "taxCode": "UO", "description": "GOODS AND SERVICES TAX GST", "value": 1.5 } ] }, "Fees": { "@type": "FeesDetail", "TotalFees": 0 }, "Total": 109 } } ] }, "TermsAndConditions": { "@type": "TermsAndConditionsAir", "FareRuleInfo": [ { "@type": "FareRuleInfo", "flightsRefs": [ "QFs1" ], "ruleNumber": "70J" } ], "ValidatingAirline": [ { "ValidatingAirline": "QF" } ], "PaymentTimeLimit": "2021-11-20T23:59:00Z" } }, ...

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
    "CatalogOfferingsQueryAirChange": {
        "CatalogOfferingsAirChangeRequestReservation": {
		"returnBrandedFaresInd":"true",
            "SearchCriteriaFlight": [
                {
                    "departureDate": "2021-12-19",
                    "From": {
                        "type": "Airport Only",
                        "value": "SYD"
                    },
                    "To": {
                        "type": "Airport Only",
                        "value": "MEL"
                    }
                }
            ],
            "PassengerCriteria": [
                {
                    "number": 1,
                    "passengerTypeCode": "ADT"
                }
            ],
            "BuildFromReservationWorkbench": {
                "ReservationIdentifier": {
                    "Identifier": {
                        "authority": "Travelport",
                        "value": "1a967a6c-66e6-4edb-a24f-20bd6d8a5ee4"
                    }
                },
                "OfferIdentifier": {
                    "Identifier": {
                        "authority": "QF",
                        "value": "UUYwODExQjY4MkE2NHxQRDlCRDI2QkItNTNDQy00OUQ3LThEMzVubGo1cnE1cWt1anp6LTEtMQ=="
                    }
                },
                "ProductIdentifier": [
                    {
                        "Identifier": {
                            "authority": "QF",
                            "value": "29b5ec43-609c-4d3a-a4d9-996856bb29ca"
                        }
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
 "CatalogOfferingsAirChangeResponse": {
  "CatalogOfferings": {
   "@type": "CatalogOfferings",
   "CatalogOffering": [
    {
     "@type": "CatalogOffering",
     "id": "QF1",
     "Identifier": {
      "authority": "QF",
      "value": "WDc3NkM5MUJFLTIyOUMtNDM3Qi05N0M3MS0xfFg3NzZDOTFCRS0yMjlDLTQzN0ItOTdDN3wyMDIxLTExLTE5VDE2OjMwOjUxfEFEVDpYNzc2QzkxQkUtMjI5Qy00MzdCLTk3QzcxLTEtMXxRRnxERUFM"
     },
     "ProductOptions": [
      {
       "@type": "ProductOptions",
       "sequence": 1,
       "Product": [
        {
         "@type": "ProductAir",
         "totalDuration": "PT1H35M",
         "id": "QFp0",
         "FlightSegment": [
          {
           "id": "1",
           "sequence": 1,
           "Flight": {
            "@type": "FlightID",
            "FlightRef": "QFs1"
           }
          }
         ],
         "PassengerFlight": [
          {
           "passengerQuantity": 1,
           "passengerTypeCode": "ADT",
           "FlightProduct": [
            {
             "segmentSequence": [
              1
             ],
             "classOfService": "E",
             "cabin": "Economy",
             "fareBasisCode": "ESQW1",
             "fareType": "PublicFare",
             "Brand": {
              "@type": "Brand",
              "name": "RED eDeal",
              "Identifier": {
               "authority": "Travelport",
               "value": "1012447"
              }
             }
            }
           ]
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
      "Base": 84.08,
      "TotalTaxes": 24.92,
      "TotalFees": 0,
      "TotalPrice": 109,
      "PriceBreakdown": [
       {
        "@type": "PriceBreakdownAir",
        "quantity": 1,
        "requestedPassengerType": "ADT",
        "Amount": {
         "CurrencyCode": {
          "decimalPlace": 2,
          "value": "AUD"
         },
         "Base": 84.08,
         "Taxes": {
          "@type": "TaxesDetail",
          "TotalTaxes": 24.92,
          "Tax": [
           {
            "taxCode": "QR",
            "description": "PASSENGER SERVICE CHARGE DOMESTIC DEPARTURE",
            "value": 9.42
           },
           {
            "taxCode": "QR",
            "description": "PASSENGER SERVICE CHARGE DOMESTIC ARRIVAL",
            "value": 5.59
           },
           {
            "taxCode": "UO",
            "description": "GOODS AND SERVICES TAX  GST",
            "value": 8.41
           },
           {
            "taxCode": "UO",
            "description": "GOODS AND SERVICES TAX  GST",
            "value": 1.5
           }
          ]
         },
         "Fees": {
          "@type": "FeesDetail",
          "TotalFees": 0
         },
         "Total": 109
        }
       }
      ]
     },
     "TermsAndConditions": {
      "@type": "TermsAndConditionsAir",
      "FareRuleInfo": [
       {
        "@type": "FareRuleInfo",
        "flightsRefs": [
         "QFs1"
        ],
        "ruleNumber": "70J"
       }
      ],
      "ValidatingAirline": [
       {
        "ValidatingAirline": "QF"
       }
      ],
      "PaymentTimeLimit": "2021-11-20T23:59:00Z"
     }
    },
...
```

