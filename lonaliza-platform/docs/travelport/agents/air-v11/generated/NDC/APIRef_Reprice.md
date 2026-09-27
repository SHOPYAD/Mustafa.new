# Reprice API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/NDC/APIRef_Reprice.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Reprice API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Reprice API&#160;Reference Request Response Example request Example response POST reprice/reservationworkbench/ {workbenchID} /offers/buildfromcatalogofferings For {workbenchID} send the workbench identifier returned in ReservationResponse/Identifer/value in the workbench create response. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Exchange, Refund, and Void Guide NDC&#160;only; not supported for GDS. See the Exchange, Refund, and Void Guide for GDS options. When modifying a held booking or exchanging a ticket for NDC, the Reprice API confirms pricing on a selected offer from a preceding Reshop response and adds that offer to the workbench. Reprice is part of the NDC&#160;modify/exchange workflow: Create a post-commit workbench , Reshop to shop for the new itinerary, Reprice as detailed here, and Modify to commit the changes. Reprice can also be used to return OB fees based on credit card BIN (bank identification number). For GDS&#160;and NDC differences in the JSON APIs, see the support tables for seats , ancillaries , fare rules , and exchanges/refunds , and the NDC&#160;and GDS Functionality Comparison . For differences within NDC by individual carriers, see NDC capabilities by airline through JSON API in the Travelport Knowledge Base. See Knowledge Base NDC&#160;Resources if you need login assistance. Request As part of the request requirements, also see Authentication and Common Air API Headers . Header Parameters Parameter Description Required/Optional OBFees Send with the value Y only to process the reprice with the credit card BIN. Must be sent with the Reprice with Credit Card BIN payload below. Optional Query Parameters None. Request Body Standard Reprice request Use the following Reprice payload when you do not need to reprice with OB fees. Show Request Body Table - reprice Object Description Required/Optional OfferQueryBuildFromCatalogOfferings Top level object. Required BuildFromCatalogOfferingsRequest Top level object. Required CatalogOfferingIdentifier Top level object. Required Identifier Identifier details for the offer to reprice. Required authority Send the value returned in CatalogOffering/Identifier/authority in the Reshop response for the offer to exchange for. Required value Send the value returned in CatalogOffering/Identifier/value in the Reshop response for the offer to exchange for. Required Reprice with credit card BIN Use the following payload if you want to process the reprice to return any OB fees based on credit card BIN. Show Request Body Table - reprice with BIN Object Description Required/Optional OfferQueryBuildFromCatalogOfferings Top level object. Required PaymentCriteria Send with IssuerIdentificationNumber to return OB&#160;fees. Must also be sent with the header parameter OBFees set to Y. Required IssuerIdentificationNumber String. From 6 to 16 characters inclusive are accepted. Sends the BIN of the credit card to be used for payment and returns OB fees, which are ticketing and form of payment (FOP) fees, including credit card fees. OB&#160;fees are returned in an instance of Price/PriceBreakdown/Fees/Fee with a feeCode of OB . For&#160;NDC&#160;carrier BA, you must send the complete 16-digit credit card number to return the surcharge amount. Required PaymentCardCode String. Code for the credit card type to be used for payment. Required Response The Reprice response uses the same format as the AirPrice Reference Payload API&#160;response , with the following differences: OfferID is returned with @type value of OfferModify instead of Offer . As in the Reshop response, the Price object does not return the price of the new offer but instead for the new offer compared with the existing offer. In Price/TotalPrice: a positive number indicates the additional amount due for the new offer a zero amount indicates an even exchange a negative number indicates the offer costs less than the original itinerary and a partial refund is due Example Request Show Example Reprice request { "OfferQueryBuildFromCatalogOfferings": { "BuildFromCatalogOfferingsRequest": { "@type": "BuildFromCatalogOfferingsRequestAir", "CatalogOfferingIdentifier": { "Identifier": { "authority": "QF", "value": "WDc3NkM5MUJFLTIyOUMtNDM3Qi05N0M3MS0xfFg3NzZDOTFCRS0yMjlDLTQzN0ItOTdDN3wyMDIxLTExLTE5VDE2OjMwOjUxfEFEVDpYNzc2QzkxQkUtMjI5Qy00MzdCLTk3QzcxLTEtMXxRRnxERUFM" } } } } } Show Example Reprice with BIN&#160;request { "OfferQueryBuildFromCatalogOfferings": { "PaymentCriteria": { "IssuerIdentificationNumber": "4273000000005803", "PaymentCardCode": "CC" } } } Example Response For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . The response returns details for the modified itinerary, a total price difference, and a breakdown of the fare difference by PTC for the selected offer. Show Example Reprice Response { "OfferListResponse": { "OfferID": [ { "@type": "OfferModify", "id": "1", "Identifier": { "authority": "QF", "value": "WDc3NkM5MUJFLTIyOUMtNDM3Qi05N0M3MS0xfFg3NzZDOTFCRS0yMjlDLTQzN0ItOTdDN3wyMDIxLTExLTE5VDE2OjMwOjUxfEFEVDpYNzc2QzkxQkUtMjI5Qy00MzdCLTk3QzcxLTEtMXxRRnxERUFMfE9OUkNEOlFGfE9GUlJFU1BJRDp7InJlc3BvbnNlSUQiOiJSOTI0N0FFNkEtOUY0RS00NEMyLUFCQkYiLCJvZmZlcklEIjoiUjkyNDdBRTZBLTlGNEUtNDRDMi1BQkJGLTEiLCJsaXN0T2ZmZXJJdGVtUGF4SUQiOlt7Im9mZmVySXRlbUlEIjoiUjkyNDdBRTZBLTlGNEUtNDRDMi1BQkJGLTEtMSIsInBhc3NlbmdlcklEIjpbIlQxIl19XSwib3JkZXJJdGVtSURQYXhNYXAiOnsiUEQ5QkQyNkJCLTUzQ0MtNDlENy04RDM1bmxqNXJxNXFrdWp6ei0xLTEiOnsiVDEiOiJ0cmF2XzEifX19" }, "Product": [ { "@type": "ProductAir", "id": "product_1", "FlightSegment": [ { "sequence": 1, "Flight": { "@type": "Flight", "distance": 438, "carrier": "QF", "number": "409", "id": "S1", "Departure": { "@type": "DepartureDetail", "location": "SYD", "date": "2021-12-19", "time": "07:00:00" }, "Arrival": { "@type": "ArrivalDetail", "location": "MEL", "date": "2021-12-19", "time": "08:35:00" } } } ], "PassengerFlight": [ { "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "segmentSequence": [ 1 ], "classOfService": "E", "cabin": "Economy", "fareBasisCode": "ESQW1" } ] } ] } ], "Price": { "@type": "PriceDetail", "CurrencyCode": { "value": "AUD" }, "Base": 84.08, "TotalTaxes": 24.92, "TotalPrice": 109, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "CurrencyCode": { "value": "AUD" }, "Base": 84.08, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 24.92, "Tax": [ { "taxCode": "QR", "description": "PASSENGER SERVICE CHARGE DOMESTIC DEPARTURE", "value": 9.42 }, { "taxCode": "QR", "description": "PASSENGER SERVICE CHARGE DOMESTIC ARRIVAL", "value": 5.59 }, { "taxCode": "UO", "description": "GOODS AND SERVICES TAX GST", "value": 8.41 }, { "taxCode": "UO", "description": "GOODS AND SERVICES TAX GST", "value": 1.5 } ] }, "Total": 109 } } ] }, "TermsAndConditionsFull": [ { "@type": "TermsAndConditionsFullAir", "TextBlock": [ { "@type": "TextBlockDetail", "description": "Bag Rule", "title": "Bag Rule", "TextFormatted": [ { "value": "Baggage Disclosure - Not subject to US DOT and CTA Reservation or Disclosure" } ] }, { "@type": "TextBlockDetail", "description": "Ticketing", "title": "Ticketing", "TextFormatted": [ { "value": "NON-REF/NON-END" }, { "value": "SPECIAL FARE CONDITIONS" } ] } ], "BaggageAllowance": [ { "@type": "BaggageAllowanceDetail", "passengerTypeCodes": [ "ADT" ], "baggageType": "CarryOn", "ProductRef": [ "product_1" ], "BaggageItem": [ { "quantity": 2 } ] }, { "@type": "BaggageAllowanceDetail", "passengerTypeCodes": [ "ADT" ], "baggageType": "FirstCheckedBag", "ProductRef": [ "product_1" ], "BaggageItem": [ { "quantity": 1 } ] } ], "FareRuleInfo": [ { "@type": "FareRuleInfo", "flightsRefs": [ "S1" ], "ruleNumber": "70J|NO8EJWN~MpB8PD~MpN8RWC~MqB9KDJ~MDB8DQPU0~MBV9/321~MNA9/1584~MBB87016~MRO8OSAJ~MPM864/.~MDM82X~MPN88786~MP08DPR~MNP9/~MNW8@BS~MQ@948~MCR9/0/43~MRL80580~MAA877~MDC8N@~M?L872/6~MAT8@SC~MQR91/0~MDS82.1~MQP96*sjovYy89RiGg*flxKey" } ], "OrganizationInformation": {}, "PaymentTimeLimit": "2021-11-20T23:59:00Z" } ] } ], "Result": { "Warning": [ { "@type": "Warning", "Message": "QF : OB Fees of 0.40 for CARD FEE FD2 may be applied for traveler 1." }, { "@type": "Warning", "Message": "QF : OB Fees of 0.40 for CARD FEE FD5 may be applied for traveler 1." }, ] } } } In the following example, OB fees are returned in Price/PriceBreakdown/Fee and noted with feeCode OB. Certain other objects have been trunckated [...] for brevity. Show Example Reprice with BIN&#160;response { "OfferListResponse": { "OfferID": [ { "@type": "OfferModify", "id": "1", "Identifier": { "authority": "BA", "value": "WDY4RVpFfFg2OEVaRS1UMi1GUzF8SU5WT0xVTlRBUlktTk98U3RhdHVzOlVTRUQgTlRBQ3xPcmRlcml0ZW1JZDp8QUdHSUQtMDAwMTAxMzU=" }, "Product": [ { "@type": "ProductAir", "totalDuration": "PT1H25M", "id": "product_1", "Identifier": { "authority": "BA", "value": "0066df98-47ff-4e5b-871b-c4c13fa235cf" }, "FlightSegment": [ { "@type": "FlightSegment", "id": "s1", "sequence": 1, "Flight": { "@type": "Flight", "duration": "PT1H25M", "carrier": "BA", "number": "1472", "operatingCarrier": "BA", "operatingCarrierName": "British Airways", "equipment": "319", "id": "Flight_01", "Identifier": { "authority": "BA", "value": "4334f0a9-3282-41d6-a93d-2f3245d389c1" }, "Departure": { "@type": "DepartureDetail", "terminal": "5", "location": "LHR", "date": "2026-03-17", "time": "06:25:00" }, "Arrival": { "@type": "ArrivalDetail", "terminal": "M", "location": "GLA", "date": "2026-03-17", "time": "07:50:00" } } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 1 ], "classOfService": "I", "cabin": "Business", "fareBasisCode": "IV2RO", "fareType": "PublicFare" } ] } ] } ], "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "GBP" }, "Base": 136, "TotalTaxes": 37.55, "TotalFees": 3.47, "TotalPrice": 177.02, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "GBP" }, "Base": 136, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 37.55, "Tax": [ { "taxCode": "YQ", "value": 5 }, { "taxCode": "YR", "value": 3 }, { "taxCode": "GB", "value": 14 }, { "taxCode": "UB", "value": 15.55 } ] }, "Fees": { "@type": "FeesDetail", "TotalFees": 3.47, "Fee": [ { "@type": "Fee", "feeCode": "OB", "description": "OB FEE", "FeeAmountOrPercent": { "@type": "FeeAmountOrPercentAmount", "Amount": { "code": "GBP", "value": 3.47 } } } ] }, "Total": 177.02 } } ] }, "TermsAndConditionsFull": [] } ], "Result": { "@type": "Result", "Warning": [ { "@type": "Warning", "Message": "Allowed forms of payment for this offer - Cash or Card or previously issued valid E-Voucher" } ] }, "Identifier": { "value": "f38a2de1-e7cd-41bc-b171-3824c6a812ff_PC" } } }

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
 "OfferQueryBuildFromCatalogOfferings": {
  "BuildFromCatalogOfferingsRequest": {
   "@type": "BuildFromCatalogOfferingsRequestAir",
   "CatalogOfferingIdentifier": {
    "Identifier": {
     "authority": "QF",
     "value": "WDc3NkM5MUJFLTIyOUMtNDM3Qi05N0M3MS0xfFg3NzZDOTFCRS0yMjlDLTQzN0ItOTdDN3wyMDIxLTExLTE5VDE2OjMwOjUxfEFEVDpYNzc2QzkxQkUtMjI5Qy00MzdCLTk3QzcxLTEtMXxRRnxERUFM"
    }
   }
  }
 }
}
```

### Block 2

```
{
 "OfferQueryBuildFromCatalogOfferings": {
  "PaymentCriteria": {
   "IssuerIdentificationNumber": "4273000000005803",
   "PaymentCardCode": "CC"
  }
 }
}
```

### Block 3

```
{
 "OfferListResponse": {
  "OfferID": [
   {
    "@type": "OfferModify",
    "id": "1",
    "Identifier": {
     "authority": "QF",
     "value": "WDc3NkM5MUJFLTIyOUMtNDM3Qi05N0M3MS0xfFg3NzZDOTFCRS0yMjlDLTQzN0ItOTdDN3wyMDIxLTExLTE5VDE2OjMwOjUxfEFEVDpYNzc2QzkxQkUtMjI5Qy00MzdCLTk3QzcxLTEtMXxRRnxERUFMfE9OUkNEOlFGfE9GUlJFU1BJRDp7InJlc3BvbnNlSUQiOiJSOTI0N0FFNkEtOUY0RS00NEMyLUFCQkYiLCJvZmZlcklEIjoiUjkyNDdBRTZBLTlGNEUtNDRDMi1BQkJGLTEiLCJsaXN0T2ZmZXJJdGVtUGF4SUQiOlt7Im9mZmVySXRlbUlEIjoiUjkyNDdBRTZBLTlGNEUtNDRDMi1BQkJGLTEtMSIsInBhc3NlbmdlcklEIjpbIlQxIl19XSwib3JkZXJJdGVtSURQYXhNYXAiOnsiUEQ5QkQyNkJCLTUzQ0MtNDlENy04RDM1bmxqNXJxNXFrdWp6ei0xLTEiOnsiVDEiOiJ0cmF2XzEifX19"
    },
    "Product": [
     {
      "@type": "ProductAir",
      "id": "product_1",
      "FlightSegment": [
       {
        "sequence": 1,
        "Flight": {
         "@type": "Flight",
         "distance": 438,
         "carrier": "QF",
         "number": "409",
         "id": "S1",
         "Departure": {
          "@type": "DepartureDetail",
          "location": "SYD",
          "date": "2021-12-19",
          "time": "07:00:00"
         },
         "Arrival": {
          "@type": "ArrivalDetail",
          "location": "MEL",
          "date": "2021-12-19",
          "time": "08:35:00"
         }
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
          "fareBasisCode": "ESQW1"
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
     "Base": 84.08,
     "TotalTaxes": 24.92,
     "TotalPrice": 109,
     "PriceBreakdown": [
      {
       "@type": "PriceBreakdownAir",
       "quantity": 1,
       "requestedPassengerType": "ADT",
       "Amount": {
        "CurrencyCode": {
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
        "Total": 109
       }
      }
     ]
    },
    "TermsAndConditionsFull": [
     {
      "@type": "TermsAndConditionsFullAir",
      "TextBlock": [
       {
        "@type": "TextBlockDetail",
        "description": "Bag Rule",
        "title": "Bag Rule",
        "TextFormatted": [
         {
          "value": "Baggage Disclosure - Not subject to US DOT and CTA Reservation or Disclosure"
         }
        ]
       },
       {
        "@type": "TextBlockDetail",
        "description": "Ticketing",
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
        "baggageType": "CarryOn",
        "ProductRef": [
         "product_1"
        ],
        "BaggageItem": [
         {
          "quantity": 2
         }
        ]
       },
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
          "quantity": 1
         }
        ]
       }
      ],
      "FareRuleInfo": [
       {
        "@type": "FareRuleInfo",
        "flightsRefs": [
         "S1"
        ],
        "ruleNumber": "70J|NO8EJWN~MpB8PD~MpN8RWC~MqB9KDJ~MDB8DQPU0~MBV9/321~MNA9/1584~MBB87016~MRO8OSAJ~MPM864/.~MDM82X~MPN88786~MP08DPR~MNP9/~MNW8@BS~MQ@948~MCR9/0/43~MRL80580~MAA877~MDC8N@~M?L872/6~MAT8@SC~MQR91/0~MDS82.1~MQP96*sjovYy89RiGg*flxKey"
       }
      ],
      "OrganizationInformation": {},
      "PaymentTimeLimit": "2021-11-20T23:59:00Z"
     }
    ]
   }
  ],
  "Result": {
   "Warning": [
    {
     "@type": "Warning",
     "Message": "QF : OB Fees of 0.40 for CARD FEE FD2 may be applied for traveler 1."
    },
    {
     "@type": "Warning",
     "Message": "QF : OB Fees of 0.40 for CARD FEE FD5 may be applied for traveler 1."
    },
   ]
  }
 }
}
```

### Block 4

```
{
  "OfferListResponse": {
    "OfferID": [
      {
        "@type": "OfferModify",
        "id": "1",
        "Identifier": {
          "authority": "BA",
          "value": "WDY4RVpFfFg2OEVaRS1UMi1GUzF8SU5WT0xVTlRBUlktTk98U3RhdHVzOlVTRUQgTlRBQ3xPcmRlcml0ZW1JZDp8QUdHSUQtMDAwMTAxMzU="
        },
        "Product": [
          {
            "@type": "ProductAir",
            "totalDuration": "PT1H25M",
            "id": "product_1",
            "Identifier": {
              "authority": "BA",
              "value": "0066df98-47ff-4e5b-871b-c4c13fa235cf"
            },
            "FlightSegment": [
              {
                "@type": "FlightSegment",
                "id": "s1",
                "sequence": 1,
                "Flight": {
                  "@type": "Flight",
                  "duration": "PT1H25M",
                  "carrier": "BA",
                  "number": "1472",
                  "operatingCarrier": "BA",
                  "operatingCarrierName": "British Airways",
                  "equipment": "319",
                  "id": "Flight_01",
                  "Identifier": {
                    "authority": "BA",
                    "value": "4334f0a9-3282-41d6-a93d-2f3245d389c1"
                  },
                  "Departure": {
                    "@type": "DepartureDetail",
                    "terminal": "5",
                    "location": "LHR",
                    "date": "2026-03-17",
                    "time": "06:25:00"
                  },
                  "Arrival": {
                    "@type": "ArrivalDetail",
                    "terminal": "M",
                    "location": "GLA",
                    "date": "2026-03-17",
                    "time": "07:50:00"
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
                    "classOfService": "I",
                    "cabin": "Business",
                    "fareBasisCode": "IV2RO",
                    "fareType": "PublicFare"
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
            "value": "GBP"
          },
          "Base": 136,
          "TotalTaxes": 37.55,
          "TotalFees": 3.47,
          "TotalPrice": 177.02,
          "PriceBreakdown": [
            {
              "@type": "PriceBreakdownAir",
              "quantity": 1,
              "requestedPassengerType": "ADT",
              "Amount": {
                "@type": "Amount",
                "CurrencyCode": {
                  "decimalPlace": 2,
                  "value": "GBP"
                },
                "Base": 136,
                "Taxes": {
                  "@type": "TaxesDetail",
                  "TotalTaxes": 37.55,
                  "Tax": [
                    {
                      "taxCode": "YQ",
                      "value": 5
                    },
                    {
                      "taxCode": "YR",
                      "value": 3
                    },
                    {
                      "taxCode": "GB",
                      "value": 14
                    },
                    {
                      "taxCode": "UB",
                      "value": 15.55
                    }
                  ]
                },
                "Fees": {
                  "@type": "FeesDetail",
                  "TotalFees": 3.47,
                  "Fee": [
                    {
                      "@type": "Fee",
                      "feeCode": "OB",
                      "description": "OB FEE",
                      "FeeAmountOrPercent": {
                        "@type": "FeeAmountOrPercentAmount",
                        "Amount": {
                          "code": "GBP",
                          "value": 3.47
                        }
                      }
                    }
                  ]
                },
                "Total": 177.02
              }
            }
          ]
        },
        "TermsAndConditionsFull": []
      }
    ],
    "Result": {
      "@type": "Result",
      "Warning": [
        {
          "@type": "Warning",
          "Message": "Allowed forms of payment for this offer - Cash or Card or previously issued valid E-Voucher"
        }
      ]
    },
    "Identifier": {
      "value": "f38a2de1-e7cd-41bc-b171-3824c6a812ff_PC"
    }
  }
}
```

