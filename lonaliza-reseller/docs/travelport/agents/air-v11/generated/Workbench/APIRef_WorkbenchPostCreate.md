# Post-Commit Workbench API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Workbench/APIRef_WorkbenchPostCreate.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Post-Commit Workbench API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Post-Commit Workbench API&#160;Reference Request Response Example request Example response POST book/session/reservationworkbench/buildfromlocator?Locator= {LocatorCode} For {LocatorCode} &#160;send the locator code returned at booking commit or in Reservation Retrieve in Receipt/Confirmation/Locator/value. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Booking Guide , Ticketing Guide Initiate a post-commit workbench to create a session for ticketing or updating an existing reservation. This is a prerequisite step for any workbench session to modify, update, or ticket a reservation. Reservation Retrieve and Post-Commit Workbench return air, hotel, and/or car segments for any reservation that includes that content, called a multi-content booking . All segments must have been booked with the JSON Air APIs, JSON Hotel APIs , JSON Car APIs (release pending), or a Travelport+ terminal program. You can add either GDS or&#160;NDC air offers to a hotel and/or car booking, but not both. See the Multi-content Booking Guide (Air, Hotel, Car) for workflows and examples. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters Parameter Description Required/Optional Locator Send the reservation locator code in the Locator parameter. Required Request Body None. Response The Post-Commit Workbench response uses the same structure as the Reservation Retrieve response, plus a workbench ID in an additional Identifier object at the end of the response; see Reservation Retrieve for documentation. However, the Post-Commit Workbench request does not support the query parameters available in&#160;Reservation Retrieve and so information such as fare rules and certain remarks are not returned. See the intro to the Reservation Retrieve response for a full list. Example Request This request does not use a message payload. Example Response The response returns the existing details in the booking, plus a workbench identifier at the end of the response in Identifier/value. This value must be sent in subsequent transactions to refer to this workbench. For comparison purposes, note that the example booking shown here, with Travelport locator code BXPJVM, is also shown in the Workbench Commit API&#160;Reference example responses for both the booking and ticketing workbench commits, and in the Reservation Retrieve API&#160;Reference example for the ticketed one-way GDS Itinerary. Show Example response for workbench create for an existing reservation { "ReservationResponse": { "@type": "ReservationResponse", "Reservation": { "@type": "Reservation", "Identifier": { "authority": "Travelport", "value": "1546cc57-c5c3-4670-b555-fed35dd69ddf" }, "Offer": [ { "@type": "Offer", "id": "offer_1", "Identifier": { "authority": "Travelport", "value": "9829d223-66dc-4590-8a8e-66a1669f8b00" }, "ContentSource": "GDS", "Product": [ { "@type": "ProductAir", "id": "product_1", "Identifier": { "authority": "Travelport", "value": "a9ddb86f-ec1a-42ba-8e78-3dafa208ab70" }, "FlightSegment": [ { "@type": "FlightSegment", "id": "FlightSegment_01", "sequence": 1, "Flight": { "@type": "Flight", "duration": "PT2H34M", "carrier": "AA", "number": "2755", "equipment": "319", "id": "Flight_01", "Identifier": { "authority": "Travelport", "value": "95fa78b6-da7d-4bcc-88f0-b76d39b82bcd" }, "Departure": { "@type": "Departure", "location": "ORD", "date": "2025-06-28", "time": "07:00:00" }, "Arrival": { "@type": "Arrival", "location": "DEN", "date": "2025-06-28", "time": "08:39:00" } } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 1 ], "classOfService": "Y", "cabin": "Economy", "fareBasisCode": "B0AIZNN1", "fareType": "PublicFare", "Brand": { "@type": "Brand", "name": "MAIN CABIN", "tier": 4, "id": "1752032" } } ] } ] } ], "Price": { "@type": "PriceDetail", "id": "PriceDetail_1", "CurrencyCode": { "value": "AUD" }, "Base": 854, "TotalTaxes": 89.6, "TotalFees": 0, "TotalPrice": 943.6, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "USD" }, "Base": 514.59 }, "TravelerRefs": [ "travelerRefId_1" ] }, { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "currencySource": "Charged", "approximateInd": true, "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 854, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 89.6, "Tax": [ { "currencyCode": "AUD", "taxCode": "AY", "value": 9.3 }, { "currencyCode": "AUD", "taxCode": "US", "value": 64.1 }, { "currencyCode": "AUD", "taxCode": "XF", "value": 7.5 }, { "currencyCode": "AUD", "taxCode": "ZP", "value": 8.7 } ] }, "Total": 943.6 }, "FiledAmount": { "currencyCode": "USD", "decimalPlace": 2, "value": 514.59 }, "TravelerRefs": [ "travelerRefId_1" ], "FareCalculation": "CHI AA DEN Q0.17 514.42B0AIZNN1 USD514.59END" } ] }, "TermsAndConditionsFull": [ { "@type": "TermsAndConditionsFullAir", "secureFlightPassengerDataRequiredInd": true, "Identifier": { "authority": "Travelport", "value": "e2a6584f-8593-43e2-a96a-aab11c526678" }, "ExpiryDate": "2025-05-29T23:59:00Z", "BaggageAllowance": [ { "@type": "BaggageAllowanceDetail", "passengerTypeCodes": [ "ADT" ], "SegmentSequenceList": [ 1 ], "Text": [ "0PC" ] } ], "ValidatingAirline": [ { "@type": "ValidatingAirline", "ValidatingAirline": "AA" } ], "TicketingAgency": [ { "@type": "TicketingAgency", "Code": "XB7" } ], "PaymentTimeLimit": "2025-05-30T23:59:00Z", "PricingAgency": [ { "@type": "PricingAgency", "Code": "XB7" } ], "FareGuaranteePolicy": [ { "@type": "FareGuaranteePolicy", "passengerTypeCodes": [ "ADT" ], "Code": { "value": "G" } } ] }, { "@type": "TermsAndConditionsFullAir", "Restriction": [ { "value": "NONREF/FAREDIF/" }, { "value": "CXL BY FLT TIME OR NOVALUE" } ] } ] } ], "Traveler": [ { "@type": "Traveler", "birthDate": "1986-11-11", "gender": "Male", "passengerTypeCode": "ADT", "id": "travelerRefId_1", "Identifier": { "authority": "Travelport", "value": "598e0e62-dfc9-424f-a250-25a136d2b786" }, "PersonName": { "@type": "PersonName", "Given": "TESTFIRST", "Surname": "TESTLAST" }, "Telephone": [ { "@type": "TelephoneDetail", "countryAccessCode": "1", "phoneNumber": "212456121", "id": "telephone_1", "cityCode": "ORD", "role": "Home" } ], "Email": [ { "emailType": "TO", "value": "TravelerOne@notmail.com" } ], "TravelDocument": [ { "@type": "TravelDocumentDetail", "birthDate": "1986-11-11", "Gender": "Male", "PersonName": { "@type": "PersonName", "Given": "TESTFIRST", "Surname": "TESTLAST" } }, { "@type": "TravelDocumentDetail", "docNumber": "A123123", "docType": "Passport", "expireDate": "2035-05-28", "issueCountry": "US", "birthDate": "1986-11-11", "Gender": "Male", "PersonName": { "@type": "PersonName", "Given": "TESTFIRST", "Surname": "TESTLAST" } } ] } ], "Receipt": [ { "@type": "ReceiptConfirmation", "Identifier": { "authority": "Travelport", "value": "3bd5237e-25b7-4e8d-b8ea-f7a04f936f4b" }, "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "1G", "creationDate": "2025-05-28", "value": "BXPJVM" }, "OfferStatus": { "@type": "OfferStatusAir", "StatusAir": [ { "flightRefs": [ "Flight_01" ], "code": "HK", "value": "Confirmed" } ] } } }, { "@type": "ReceiptConfirmation", "Identifier": { "authority": "Travelport", "value": "dfa0a8de-2e33-4f88-aed7-7afc197e9d30" }, "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "AA", "value": "IUSHNW" } } } ], "ReservationDisplaySequence": { "@type": "ReservationDisplaySequence", "DisplaySequence": [ { "@type": "DisplaySequence", "displaySequence": 1, "OfferRef": "offer_1", "ProductRef": "product_1", "Sequence": 1 } ] } }, "Identifier": { "authority": "Travelport", "value": "1546cc57-c5c3-4670-b555-fed35dd69ddf" } } }

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
 "ReservationResponse": {
  "@type": "ReservationResponse",
  "Reservation": {
   "@type": "Reservation",
   "Identifier": {
    "authority": "Travelport",
    "value": "1546cc57-c5c3-4670-b555-fed35dd69ddf"
   },
   "Offer": [
    {
     "@type": "Offer",
     "id": "offer_1",
     "Identifier": {
      "authority": "Travelport",
      "value": "9829d223-66dc-4590-8a8e-66a1669f8b00"
     },
     "ContentSource": "GDS",
     "Product": [
      {
       "@type": "ProductAir",
       "id": "product_1",
       "Identifier": {
        "authority": "Travelport",
        "value": "a9ddb86f-ec1a-42ba-8e78-3dafa208ab70"
       },
       "FlightSegment": [
        {
         "@type": "FlightSegment",
         "id": "FlightSegment_01",
         "sequence": 1,
         "Flight": {
          "@type": "Flight",
          "duration": "PT2H34M",
          "carrier": "AA",
          "number": "2755",
          "equipment": "319",
          "id": "Flight_01",
          "Identifier": {
           "authority": "Travelport",
           "value": "95fa78b6-da7d-4bcc-88f0-b76d39b82bcd"
          },
          "Departure": {
           "@type": "Departure",
           "location": "ORD",
           "date": "2025-06-28",
           "time": "07:00:00"
          },
          "Arrival": {
           "@type": "Arrival",
           "location": "DEN",
           "date": "2025-06-28",
           "time": "08:39:00"
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
           "classOfService": "Y",
           "cabin": "Economy",
           "fareBasisCode": "B0AIZNN1",
           "fareType": "PublicFare",
           "Brand": {
            "@type": "Brand",
            "name": "MAIN CABIN",
            "tier": 4,
            "id": "1752032"
           }
          }
         ]
        }
       ]
      }
     ],
     "Price": {
      "@type": "PriceDetail",
      "id": "PriceDetail_1",
      "CurrencyCode": {
       "value": "AUD"
      },
      "Base": 854,
      "TotalTaxes": 89.6,
      "TotalFees": 0,
      "TotalPrice": 943.6,
      "PriceBreakdown": [
       {
        "@type": "PriceBreakdownAir",
        "quantity": 1,
        "requestedPassengerType": "ADT",
        "Amount": {
         "@type": "Amount",
         "CurrencyCode": {
          "decimalPlace": 2,
          "value": "USD"
         },
         "Base": 514.59
        },
        "TravelerRefs": [
         "travelerRefId_1"
        ]
       },
       {
        "@type": "PriceBreakdownAir",
        "quantity": 1,
        "requestedPassengerType": "ADT",
        "Amount": {
         "@type": "Amount",
         "currencySource": "Charged",
         "approximateInd": true,
         "CurrencyCode": {
          "decimalPlace": 2,
          "value": "AUD"
         },
         "Base": 854,
         "Taxes": {
          "@type": "TaxesDetail",
          "TotalTaxes": 89.6,
          "Tax": [
           {
            "currencyCode": "AUD",
            "taxCode": "AY",
            "value": 9.3
           },
           {
            "currencyCode": "AUD",
            "taxCode": "US",
            "value": 64.1
           },
           {
            "currencyCode": "AUD",
            "taxCode": "XF",
            "value": 7.5
           },
           {
            "currencyCode": "AUD",
            "taxCode": "ZP",
            "value": 8.7
           }
          ]
         },
         "Total": 943.6
        },
        "FiledAmount": {
         "currencyCode": "USD",
         "decimalPlace": 2,
         "value": 514.59
        },
        "TravelerRefs": [
         "travelerRefId_1"
        ],
        "FareCalculation": "CHI AA DEN Q0.17 514.42B0AIZNN1 USD514.59END"
       }
      ]
     },
     "TermsAndConditionsFull": [
      {
       "@type": "TermsAndConditionsFullAir",
       "secureFlightPassengerDataRequiredInd": true,
       "Identifier": {
        "authority": "Travelport",
        "value": "e2a6584f-8593-43e2-a96a-aab11c526678"
       },
       "ExpiryDate": "2025-05-29T23:59:00Z",
       "BaggageAllowance": [
        {
         "@type": "BaggageAllowanceDetail",
         "passengerTypeCodes": [
          "ADT"
         ],
         "SegmentSequenceList": [
          1
         ],
         "Text": [
          "0PC"
         ]
        }
       ],
       "ValidatingAirline": [
        {
         "@type": "ValidatingAirline",
         "ValidatingAirline": "AA"
        }
       ],
       "TicketingAgency": [
        {
         "@type": "TicketingAgency",
         "Code": "XB7"
        }
       ],
       "PaymentTimeLimit": "2025-05-30T23:59:00Z",
       "PricingAgency": [
        {
         "@type": "PricingAgency",
         "Code": "XB7"
        }
       ],
       "FareGuaranteePolicy": [
        {
         "@type": "FareGuaranteePolicy",
         "passengerTypeCodes": [
          "ADT"
         ],
         "Code": {
          "value": "G"
         }
        }
       ]
      },
      {
       "@type": "TermsAndConditionsFullAir",
       "Restriction": [
        {
         "value": "NONREF/FAREDIF/"
        },
        {
         "value": "CXL BY FLT TIME OR NOVALUE"
        }
       ]
      }
     ]
    }
   ],
   "Traveler": [
    {
     "@type": "Traveler",
     "birthDate": "1986-11-11",
     "gender": "Male",
     "passengerTypeCode": "ADT",
     "id": "travelerRefId_1",
     "Identifier": {
      "authority": "Travelport",
      "value": "598e0e62-dfc9-424f-a250-25a136d2b786"
     },
     "PersonName": {
      "@type": "PersonName",
      "Given": "TESTFIRST",
      "Surname": "TESTLAST"
     },
     "Telephone": [
      {
       "@type": "TelephoneDetail",
       "countryAccessCode": "1",
       "phoneNumber": "212456121",
       "id": "telephone_1",
       "cityCode": "ORD",
       "role": "Home"
      }
     ],
     "Email": [
      {
       "emailType": "TO",
       "value": "TravelerOne@notmail.com"
      }
     ],
     "TravelDocument": [
      {
       "@type": "TravelDocumentDetail",
       "birthDate": "1986-11-11",
       "Gender": "Male",
       "PersonName": {
        "@type": "PersonName",
        "Given": "TESTFIRST",
        "Surname": "TESTLAST"
       }
      },
      {
       "@type": "TravelDocumentDetail",
       "docNumber": "A123123",
       "docType": "Passport",
       "expireDate": "2035-05-28",
       "issueCountry": "US",
       "birthDate": "1986-11-11",
       "Gender": "Male",
       "PersonName": {
        "@type": "PersonName",
        "Given": "TESTFIRST",
        "Surname": "TESTLAST"
       }
      }
     ]
    }
   ],
   "Receipt": [
    {
     "@type": "ReceiptConfirmation",
     "Identifier": {
      "authority": "Travelport",
      "value": "3bd5237e-25b7-4e8d-b8ea-f7a04f936f4b"
     },
     "Confirmation": {
      "@type": "ConfirmationHold",
      "Locator": {
       "source": "1G",
       "creationDate": "2025-05-28",
       "value": "BXPJVM"
      },
      "OfferStatus": {
       "@type": "OfferStatusAir",
       "StatusAir": [
        {
         "flightRefs": [
          "Flight_01"
         ],
         "code": "HK",
         "value": "Confirmed"
        }
       ]
      }
     }
    },
    {
     "@type": "ReceiptConfirmation",
     "Identifier": {
      "authority": "Travelport",
      "value": "dfa0a8de-2e33-4f88-aed7-7afc197e9d30"
     },
     "Confirmation": {
      "@type": "ConfirmationHold",
      "Locator": {
       "source": "AA",
       "value": "IUSHNW"
      }
     }
    }
…
```

