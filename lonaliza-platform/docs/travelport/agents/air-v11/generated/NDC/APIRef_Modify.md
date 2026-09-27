# Modify API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/NDC/APIRef_Modify.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Modify API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Modify API&#160;Reference Request Response Example request Example response POST modify/reservations/ {workbenchID} For {workbenchID} send the workbench identifier returned in ReservationResponse/Identifer/value in the workbench create response. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Exchange, Refund, and Void Guide NDC&#160;only; not supported for GDS. See the Exchange, Refund, and Void Guide for GDS options. The Modify API is the last step in modifying a held booking or exchanging a ticket for NDC. It commits the changes in the workbench and may issue tickets. It is part of the NDC&#160;modify/exchange workflow: Create a post-commit workbench , Reshop to shop for the new itinerary, Reprice to confirm pricing, and Modify as detailed here to commit the changes. When exchanging a ticket, in the case of either an even exchange or add collect (price of new itinerary is greater than existing itinerary), payment is required prior to ticketing. Some NDC carriers require tickets to be issued at commit while others support booking now and sending payment later. See the Support Table and Workflow Summary in the Exchanges Guide for details. Some NDC carriers do not support held bookings for a ticket exchange and require that payment is sent and tickets issued at Modify. For carrier support details, see NDC capabilities by airline through JSON API in the Travelport Knowledge Base. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body No message payload. Response The Modify response uses the same format as the Workbench Commit response . OfferID is returned with @type value of OfferModify instead of Offer . As in the Reshop request, the amounts in the Price object are not the amounts for the new offer but rather the new offer compared with the existing offer. In Price/TotalPrice: a positive number indicates the additional amount due for the new offer a zero amount indicates an even exchange a negative number indicates the offer costs less than the original itinerary and a partial refund is due Example Request No message body. Example Response For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . You can use the Reshop/Reprice/Modify workflow to modify the air itinerary on a held booking, or to exchange a ticketed itinerary. The example below is the response for updating the itinerary on a held booking. When exchanging a ticketed itinerary, the response is similar except that the new ticket numbers are also returned. Show Example Modify response for exchange of held booking, no tickets issued { "ReservationResponse": { "@type": "ReservationResponse", "Reservation": { "@type": "Reservation", "Identifier": { "authority": "Travelport", "value": "b4525579-c49c-4b6f-b45e-9ca985907ea0" }, "Offer": [ { "@type": "Offer", "id": "offer_1", "Identifier": { "authority": "QF", "value": "151ab4a8-3f68-4852-9c90-696796363365" }, "Product": [ { "@type": "ProductAir", "totalDuration": "PT1H35M", "id": "product_1", "Identifier": { "authority": "QF", "value": "08557436-e4a6-4f99-8a2a-ec4c0bb01786" }, "FlightSegment": [ { "@type": "FlightSegment", "sequence": 1, "Flight": { "@type": "Flight", "duration": "PT1H35M", "carrier": "QF", "number": "409", "equipment": "73H", "id": "seg_1", "Identifier": { "authority": "QF", "value": "e8fd1713-230c-402b-9af0-393b6e9f202a" }, "Departure": { "@type": "DepartureDetail", "terminal": "3", "location": "SYD", "date": "2022-06-10", "time": "07:00:00" }, "Arrival": { "@type": "ArrivalDetail", "terminal": "1", "location": "MEL", "date": "2022-06-10", "time": "08:35:00" } } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 1 ], "classOfService": "Q", "cabin": "Economy", "fareBasisCode": "QDQW", "fareType": "PublicFare", "Brand": { "@type": "Brand", "name": "RED eDeal" } } ] } ] } ], "Price": { "@type": "PriceDetail", "CurrencyCode": { "value": "AUD" }, "Base": 169.63, "TotalTaxes": 40.62, "TotalPrice": 210.25, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "value": "AUD" }, "Base": 169.63, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 40.62, "Tax": [ { "taxCode": "QR", "description": "PASSENGER SERVICE CHARGE DOMESTIC DEPARTURE", "value": 9.42 }, { "taxCode": "QR", "description": "PASSENGER SERVICE CHARGE DOMESTIC ARRIVAL", "value": 5.59 }, { "taxCode": "UO", "description": "GOODS AND SERVICES TAX GST", "value": 16.96 }, { "taxCode": "UO", "description": "GOODS AND SERVICES TAX GST", "value": 2.15 }, { "taxCode": "WG", "description": "SAFETY AND SECURITY CHARGE DEPARTURE", "value": 6.5 } ] }, "Total": 210.25 } } ] }, "TermsAndConditionsFull": [ { "@type": "TermsAndConditionsFullAir", "ExpiryDate": "2022-05-11T23:59:00Z", "TextBlock": [ { "@type": "TextBlock", "TextFormatted": [ { "value": "Baggage Disclosure - Not subject to US DOT and CTA Reservation or Disclosure" } ] }, { "@type": "TextBlockDetail", "description": "FARE RULES", "title": "Ticketing", "TextFormatted": [ { "value": "NON-REF/NON-END" }, { "value": "SPECIAL FARE CONDITIONS" } ] } ], "BaggageAllowance": [ { "@type": "BaggageAllowanceDetail", "passengerTypeCodes": [ "ADT" ], "baggageType": "FirstCheckedBag", "ProductRef": [ "product_1" ], "BaggageItem": [ { "@type": "BaggageItem", "quantity": 1, "Measurement": [ { "measurementType": "OverallDimension", "unit": "Centimeters", "value": 158 }, { "measurementType": "OverallDimension", "unit": "Inches", "value": 62 } ] } ], "Text": [ "CHECKED ALLOWANCE" ] }, { "@type": "BaggageAllowanceDetail", "passengerTypeCodes": [ "ADT" ], "baggageType": "CarryOn", "ProductRef": [ "product_1" ], "BaggageItem": [ { "@type": "BaggageItem", "quantity": 2 } ], "Text": [ "CARRYON HAND BAGGAGE ALLOWANCE" ] } ], "FareRuleInfo": [ { "@type": "FareRuleInfo", "flightsRefs": [ "seg_1" ] } ], "PaymentTimeLimit": "2022-05-11T23:59:00Z" } ] } ], "Traveler": [ { "@type": "Traveler", "birthDate": "1986-11-11", "gender": "Male", "passengerTypeCode": "ADT", "id": "trav_1", "TravelerRef": "trav_1", "Identifier": { "authority": "Travelport", "value": "QURUfFQx" }, "PersonName": { "@type": "PersonName", "Given": "TESTFIRST", "Surname": "TESTLAST" }, "Telephone": [ { "@type": "Telephone", "phoneNumber": "1212456121", "id": "telephone_1" } ], "Email": [ { "id": "email_1", "emailType": "Operational", "validInd": true, "value": "TRAVELERONE@GMAIL.COM" } ], "TravelDocument": [ { "@type": "TravelDocumentDetail", "docNumber": "A123123", "docType": "Passport", "expireDate": "2022-10-20", "issueCountry": "US", "birthDate": "1986-11-11", "Gender": "Male", "PersonName": { "@type": "PersonName", "Given": "TESTFIRST", "Surname": "TESTLAST" } } ] } ], "Receipt": [ { "@type": "ReceiptConfirmation", "id": "receipt_1", "Identifier": { "authority": "QF", "value": "430d83b6-9567-457f-a109-a7bd07967139" }, "OfferRef": [ "offer_1" ], "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "QF", "sourceContext": "OrderId", "value": "QF081H8EM8TA7" }, "OfferStatus": { "@type": "OfferStatusAir", "StatusAir": [ { "value": "Pending" } ] } } }, { "@type": "ReceiptConfirmation", "id": "receipt_2", "Identifier": { "authority": "QF", "value": "14b3e032-a794-4579-8786-2b5ca4c46dc7" }, "OfferRef": [ "offer_1" ], "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "QF", "sourceContext": "VendorLocator", "value": "5JLMQL" }, "OfferStatus": { "@type": "OfferStatusAir", "StatusAir": [ { "value": "Pending" } ] } } }, { "@type": "ReceiptConfirmation", "id": "receipt_3", "Identifier": { "authority": "Travelport", "value": "a034a9b0-688f-4588-b231-a89e9b299254" }, "OfferRef": [ "offer_1" ], "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "1G", "value": "1BD2YS" }, "OfferStatus": { "@type": "OfferStatusAir", "StatusAir": [ { "value": "Pending" } ] } } } ] } } }

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
    "value": "b4525579-c49c-4b6f-b45e-9ca985907ea0"
   },
   "Offer": [
    {
     "@type": "Offer",
     "id": "offer_1",
     "Identifier": {
      "authority": "QF",
      "value": "151ab4a8-3f68-4852-9c90-696796363365"
     },
     "Product": [
      {
       "@type": "ProductAir",
       "totalDuration": "PT1H35M",
       "id": "product_1",
       "Identifier": {
        "authority": "QF",
        "value": "08557436-e4a6-4f99-8a2a-ec4c0bb01786"
       },
       "FlightSegment": [
        {
         "@type": "FlightSegment",
         "sequence": 1,
         "Flight": {
          "@type": "Flight",
          "duration": "PT1H35M",
          "carrier": "QF",
          "number": "409",
          "equipment": "73H",
          "id": "seg_1",
          "Identifier": {
           "authority": "QF",
           "value": "e8fd1713-230c-402b-9af0-393b6e9f202a"
          },
          "Departure": {
           "@type": "DepartureDetail",
           "terminal": "3",
           "location": "SYD",
           "date": "2022-06-10",
           "time": "07:00:00"
          },
          "Arrival": {
           "@type": "ArrivalDetail",
           "terminal": "1",
           "location": "MEL",
           "date": "2022-06-10",
           "time": "08:35:00"
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
           "classOfService": "Q",
           "cabin": "Economy",
           "fareBasisCode": "QDQW",
           "fareType": "PublicFare",
           "Brand": {
            "@type": "Brand",
            "name": "RED eDeal"
           }
          }
         ]
        }
       ]
      }
     ],
     "Price": {
      "@type": "PriceDetail",
      "CurrencyCode": {
       "value": "AUD"
      },
      "Base": 169.63,
      "TotalTaxes": 40.62,
      "TotalPrice": 210.25,
      "PriceBreakdown": [
       {
        "@type": "PriceBreakdownAir",
        "quantity": 1,
        "requestedPassengerType": "ADT",
        "Amount": {
         "@type": "Amount",
         "CurrencyCode": {
          "value": "AUD"
         },
         "Base": 169.63,
         "Taxes": {
          "@type": "TaxesDetail",
          "TotalTaxes": 40.62,
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
            "value": 16.96
           },
           {
            "taxCode": "UO",
            "description": "GOODS AND SERVICES TAX  GST",
            "value": 2.15
           },
           {
            "taxCode": "WG",
            "description": "SAFETY AND SECURITY CHARGE  DEPARTURE",
            "value": 6.5
           }
          ]
         },
         "Total": 210.25
        }
       }
      ]
     },
     "TermsAndConditionsFull": [
      {
       "@type": "TermsAndConditionsFullAir",
       "ExpiryDate": "2022-05-11T23:59:00Z",
       "TextBlock": [
        {
         "@type": "TextBlock",
         "TextFormatted": [
          {
           "value": "Baggage Disclosure - Not subject to US DOT and CTA Reservation or Disclosure"
          }
         ]
        },
        {
         "@type": "TextBlockDetail",
         "description": "FARE RULES",
         "title": "Ticketing",
         "TextFormatted": [
          {
           "value": "NON-REF/NON-END"
          },
          {
           "value": "SPECIAL FARE CONDITIONS"
          }
         ]
        }
       ],
       "BaggageAllowance": [
        {
         "@type": "BaggageAllowanceDetail",
         "passengerTypeCodes": [
          "ADT"
         ],
         "baggageType": "FirstCheckedBag",
         "ProductRef": [
          "product_1"
         ],
         "BaggageItem": [
          {
           "@type": "BaggageItem",
           "quantity": 1,
           "Measurement": [
            {
             "measurementType": "OverallDimension",
             "unit": "Centimeters",
             "value": 158
            },
            {
             "measurementType": "OverallDimension",
             "unit": "Inches",
             "value": 62
            }
           ]
          }
         ],
         "Text": [
          "CHECKED ALLOWANCE"
         ]
        },
        {
         "@type": "BaggageAllowanceDetail",
         "passengerTypeCodes": [
          "ADT"
         ],
         "baggageType": "CarryOn",
         "ProductRef": [
          "product_1"
         ],
         "BaggageItem": [
          {
           "@type": "BaggageItem",
           "quantity": 2
          }
         ],
         "Text": [
          "CARRYON HAND BAGGAGE ALLOWANCE"
         ]
        }
       ],
       "FareRuleInfo": [
        {
         "@type": "FareRuleInfo",
         "flightsRefs": [
          "seg_1"
         ]
        }
       ],
       "PaymentTimeLimit": "2022-05-11T23:59:00Z"
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
     "id": "trav_1",
     "TravelerRef": "trav_1",
     "Identifier": {
      "authority": "Travelport",
      "value": "QURUfFQx"
     },
     "PersonName": {
      "@type": "PersonName",
      "Given": "TESTFIRST",
      "Surname": "TESTLAST"
     },
     "Telephone": [
      {
       "@type": "Telephone",
       "phoneNumber": "1212456121",
       "id": "telephone_1"
      }
     ],
     "Email": [
      {
       "id": "email_1",
       "emailType": "Operational",
       "validInd": true,
       "value": "TRAVELERONE@GMAIL.COM"
      }
     ],
     "TravelDocument": [
      {
       "@type": "TravelDocumentDetail",
       "docNumber": "A123123",
       "docType": "Passport",
       "expireDate": "2022-10-20",
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
     "id": "receipt_1",
     "Identifier": {
      "authority": "QF",
      "value": "430d83b6-9567-457f-a109-a7bd07967139"
     },
     "OfferRef": [
      "offer_1"
     ],
     "Confirmation": {
      "@type": "ConfirmationHold",
      "Locator": {
       "source": "QF",
       "sourceContext": "OrderId",
       "value": "QF081H8EM8TA7"
      },
      "OfferStatus": {
       "@type": "OfferStatusAir",
       "StatusAir": [
        {
         "value": "Pending"
        }
       ]
      }
     }
    },
    {
     "@type": "ReceiptConfirmation",
     "id": "receipt_2",
     "Identifier": {
      "authority": "QF",
      "value": "14b3e032-a794-4579-8786-2b5ca4c46dc7"
     },
     "OfferRef": [
      "offer_1"
     ],
     "Confirmation": {
      "@type": "ConfirmationHold",
      "Locator": {
       "source": "QF",
       "sourceContext": "VendorLocator",
       "value": "5JLMQL"
      },
      "OfferStatus": {
       "@type": "OfferStatusAir",
       "StatusAir": [
        {
         "value": "Pending"
  
…
```

