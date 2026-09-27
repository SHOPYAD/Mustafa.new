# Retrieve Workbench API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Workbench/APIRef_WorkbenchRetrieve.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Retrieve Workbench API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Retrieve Workbench API&#160;Reference Request Response Example request Example response Get book/session/reservationworkbench/ {workbenchID} For {workbenchID} send the workbench identifier returned in ReservationResponse/Identifer/value in the workbench create response. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Booking Guide , Booking Session Workflow At any point in a workbench session, you can retrieve the workbench. The response contents vary based on what has been added to the workbench at the time of the retrieve. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body None. Response The reponse returns all information that has been added to the reservation workbench at this point. For example, if you have added an offer but not travelers, the request returns offer details but no traveler information. Retrieve Workbench returns price details for NDC offers, and for GDS offers that were added with the Add Offer reference payload. Price details are not returned for segments added outside the JSON APIs or if the offer was added with the Add Offer full payload, as pricing information is not available in these scenarios. The Workbench Retrieve response uses the same structure as the Reservation Retrieve response, plus a workbench ID in an additional Identifier object at the end of the response; see Reservation Retrieve response for documentation. However, the Workbench&#160;Retrieve request does not support the query parameters available in&#160;Reservation Retrieve and so information such as fare rules and certain remarks are not returned. See the intro to the Reservation Retrieve response for a full list. Example Request This request has no message payload. Example Response The following example Workbench Retrieve response returns details for the offer and travelers added to the workbench in a reference payload initial booking workflow. Because the booking has not yet been confirmed with a Workbench Commit, Receipt/Confirmation/OfferStatus/StatusAir/value is returned as Pending . Show Example workbench retrieve prior to commit in initial booking workflow { "ReservationResponse": { "@type": "ReservationResponse", "Reservation": { "@type": "Reservation", "Identifier": { "authority": "Travelport", "value": "2cf2edd2-5f94-4310-9332-9b55538d2bde" }, "Offer": [ { "@type": "Offer", "id": "offer_1", "Identifier": { "authority": "Travelport", "value": "325a3d30-420a-4a88-9d3b-412a3e21111b" }, "ContentSource": "GDS", "Product": [ { "@type": "ProductAir", "id": "p16", "Identifier": { "authority": "Travelport", "value": "9f055d37-3acc-496a-9d84-6b970c0fdf6b" }, "FlightSegment": [ { "@type": "FlightSegment", "id": "FlightSegment_01", "sequence": 1, "connectionDuration": "PT16H25M", "boundFlightsInd": true, "Flight": { "@type": "FlightDetail", "duration": "PT1H20M", "carrier": "AF", "number": "1181", "equipment": "223", "id": "s31", "Identifier": { "authority": "Travelport", "value": "ccbe2e1b-594c-4535-8607-b5ca2a355178" }, "Departure": { "@type": "Departure", "location": "LHR", "date": "2025-11-13", "time": "19:35:00" }, "Arrival": { "@type": "Arrival", "location": "CDG", "date": "2025-11-13", "time": "21:55:00" }, "AvailabilitySourceCode": "S" } }, { "@type": "FlightSegment", "id": "FlightSegment_02", "sequence": 2, "Flight": { "@type": "FlightDetail", "duration": "PT1H20M", "carrier": "AF", "number": "1840", "equipment": "223", "id": "s32", "Identifier": { "authority": "Travelport", "value": "37a59129-7ad3-4b5d-8d87-8a88528c0804" }, "Departure": { "@type": "Departure", "location": "CDG", "date": "2025-11-14", "time": "14:20:00" }, "Arrival": { "@type": "Arrival", "location": "AMS", "date": "2025-11-14", "time": "15:40:00" }, "AvailabilitySourceCode": "S" } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 1, 2 ], "classOfService": "T", "cabin": "Economy" } ] }, { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "CHD", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 1, 2 ], "classOfService": "T", "cabin": "Economy" } ] }, { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "INF", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 1, 2 ], "classOfService": "T", "cabin": "Economy" } ] } ] }, { "@type": "ProductAir", "id": "p17", "Identifier": { "authority": "Travelport", "value": "7acfd0b6-7895-42f1-9739-2e6b53f7c3dd" }, "FlightSegment": [ { "@type": "FlightSegment", "id": "FlightSegment_03", "sequence": 3, "connectionDuration": "PT11H", "boundFlightsInd": true, "Flight": { "@type": "FlightDetail", "duration": "PT1H20M", "carrier": "AF", "number": "1141", "equipment": "223", "id": "s33", "Identifier": { "authority": "Travelport", "value": "1ee9b00b-46d0-4c4f-80a9-ff7219795db2" }, "Departure": { "@type": "Departure", "location": "AMS", "date": "2025-11-30", "time": "19:15:00" }, "Arrival": { "@type": "Arrival", "location": "CDG", "date": "2025-11-30", "time": "20:35:00" }, "AvailabilitySourceCode": "S" } }, { "@type": "FlightSegment", "id": "FlightSegment_04", "sequence": 4, "Flight": { "@type": "FlightDetail", "duration": "PT1H25M", "carrier": "AF", "number": "1680", "equipment": "223", "id": "s34", "Identifier": { "authority": "Travelport", "value": "f112d696-26e1-4639-8c91-99cec69ea7d0" }, "Departure": { "@type": "Departure", "location": "CDG", "date": "2025-12-01", "time": "07:35:00" }, "Arrival": { "@type": "Arrival", "location": "LHR", "date": "2025-12-01", "time": "08:00:00" }, "AvailabilitySourceCode": "S" } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 3, 4 ], "classOfService": "R", "cabin": "Economy" } ] }, { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "CHD", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 3, 4 ], "classOfService": "R", "cabin": "Economy" } ] }, { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "INF", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 3, 4 ], "classOfService": "R", "cabin": "Economy" } ] } ] } ], "Price": { "@type": "PriceDetail", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 586, "TotalTaxes": 773.5, "TotalFees": 0, "TotalPrice": 1359.5, "PriceBreakdown": [ { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "ADT", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 307, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 376, "Tax": [ { "taxCode": "GB", "value": 27.2 }, { "taxCode": "UB", "value": 48.7 }, { "taxCode": "FR", "value": 11.8 }, { "taxCode": "QX", "value": 49.8 }, { "taxCode": "CJ", "value": 39.8 }, { "taxCode": "RN", "value": 57.3 }, { "taxCode": "VV", "value": 52.6 }, { "taxCode": "YQ", "value": 83.6 }, { "taxCode": "YR", "value": 5.2 } ] }, "Fees": { "@type": "FeesDetail", "TotalFees": 0 }, "Total": 683 } }, { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "CHD", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 247, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 348.8, "Tax": [ { "taxCode": "UB", "value": 48.7 }, { "taxCode": "FR", "value": 11.8 }, { "taxCode": "QX", "value": 49.8 }, { "taxCode": "CJ", "value": 39.8 }, { "taxCode": "RN", "value": 57.3 }, { "taxCode": "VV", "value": 52.6 }, { "taxCode": "YQ", "value": 83.6 }, { "taxCode": "YR", "value": 5.2 } ] }, "Fees": { "@type": "FeesDetail", "TotalFees": 0 }, "Total": 595.8 } }, { "@type": "PriceBreakdownAir", "quantity": 1, "requestedPassengerType": "INF", "Amount": { "@type": "Amount", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 32, "Taxes": { "@type": "TaxesDetail", "TotalTaxes": 48.7, "Tax": [ { "taxCode": "UB", "value": 48.7 } ] }, "Fees": { "@type": "FeesDetail", "TotalFees": 0 }, "Total": 80.7 } } ] }, "TermsAndConditionsFull": [ { "@type": "TermsAndConditionsFullAir", "Identifier": { "authority": "Travelport", "value": "ea363fa8-f5fb-438e-927f-db5034dff238" } } ] } ], "Traveler": [ { "@type": "Traveler", "birthDate": "1999-09-07", "gender": "Male", "passengerTypeCode": "ADT", "id": "travelerRefId_1", "Identifier": { "value": "597dbb7a-edb3-4274-a888-c091d9147637" }, "PersonName": { "@type": "PersonNameDetail", "Prefix": "Mr", "Given": "Ajit", "Middle": "Dattatraya", "Surname": "Kadam", "Suffix": "ADT" }, "Telephone": [ { "@type": "Telephone", "countryAccessCode": "1", "areaCityCode": "909", "phoneNumber": "212456122", "extension": "1243", "id": "4", "cityCode": "ORD", "role": "Office" } ], "Email": [ { "emailType": "TO", "value": "adk7@gmail.com" } ], "TravelDocument": [ { "@type": "TravelDocumentDetail", "docNumber": "88989889", "docType": "Passport", "issueDate": "2019-07-04", "expireDate": "2029-12-05", "issueCountry": "USA", "birthDate": "1999-09-07", "birthPlace": "IND", "Gender": "Male", "Nationality": "IND", "PersonName": { "@type": "PersonNameDetail", "Given": "Ajit", "Middle": "Dattatraya", "Surname": "Kadam" }, "IssuedForGeoPoliticalArea": { "value": "AUS" } } ] }, { "@type": "Traveler", "birthDate": "2015-12-10", "gender": "Male", "passengerTypeCode": "CHD", "id": "travelerRefId_2", "Identifier": { "value": "b301f971-34c8-44aa-9f80-ac0d473323ce" }, "PersonName": { "@type": "PersonNameDetail", "Prefix": "Master", "Given": "Deep", "Surname": "Das" } }, { "@type": "Traveler", "birthDate": "2023-01-10", "gender": "Male", "passengerTypeCode": "INF", "id": "travelerRefId_3", "Identifier": { "value": "cbaa8eba-3b43-45f7-82d1-f2f3cd482033" }, "PersonName": { "@type": "PersonNameDetail", "Given": "Ravi", "Middle": "Kumar", "Surname": "Sinha" } } ], "Receipt": [ { "@type": "ReceiptConfirmation", "Identifier": { "authority": "Travelport", "value": "6e41e89c-2f31-48c9-97a9-680b5d0f6635" }, "Confirmation": { "@type": "ConfirmationHold", "OfferStatus": { "@type": "OfferStatusAir", "StatusAir": [ { "flightRefs": [ "s31", "s32", "s33", "s34" ], "code": "HS", "value": "Pending" } ] } } } ], "ReservationDisplaySequence": { "@type": "ReservationDisplaySequence", "DisplaySequence": [ { "@type": "DisplaySequence", "displaySequence": 1, "OfferRef": "offer_1", "ProductRef": "p16", "Sequence": 1 }, { "@type": "DisplaySequence", "displaySequence": 2, "OfferRef": "offer_1", "ProductRef": "p16", "Sequence": 2 }, { "@type": "DisplaySequence", "displaySequence": 3, "OfferRef": "offer_1", "ProductRef": "p17", "Sequence": 3 }, { "@type": "DisplaySequence", "displaySequence": 4, "OfferRef": "offer_1", "ProductRef": "p17", "Sequence": 4 } ] } } } }

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
    "value": "2cf2edd2-5f94-4310-9332-9b55538d2bde"
   },
   "Offer": [
    {
     "@type": "Offer",
     "id": "offer_1",
     "Identifier": {
      "authority": "Travelport",
      "value": "325a3d30-420a-4a88-9d3b-412a3e21111b"
     },
     "ContentSource": "GDS",
     "Product": [
      {
       "@type": "ProductAir",
       "id": "p16",
       "Identifier": {
        "authority": "Travelport",
        "value": "9f055d37-3acc-496a-9d84-6b970c0fdf6b"
       },
       "FlightSegment": [
        {
         "@type": "FlightSegment",
         "id": "FlightSegment_01",
         "sequence": 1,
         "connectionDuration": "PT16H25M",
         "boundFlightsInd": true,
         "Flight": {
          "@type": "FlightDetail",
          "duration": "PT1H20M",
          "carrier": "AF",
          "number": "1181",
          "equipment": "223",
          "id": "s31",
          "Identifier": {
           "authority": "Travelport",
           "value": "ccbe2e1b-594c-4535-8607-b5ca2a355178"
          },
          "Departure": {
           "@type": "Departure",
           "location": "LHR",
           "date": "2025-11-13",
           "time": "19:35:00"
          },
          "Arrival": {
           "@type": "Arrival",
           "location": "CDG",
           "date": "2025-11-13",
           "time": "21:55:00"
          },
          "AvailabilitySourceCode": "S"
         }
        },
        {
         "@type": "FlightSegment",
         "id": "FlightSegment_02",
         "sequence": 2,
         "Flight": {
          "@type": "FlightDetail",
          "duration": "PT1H20M",
          "carrier": "AF",
          "number": "1840",
          "equipment": "223",
          "id": "s32",
          "Identifier": {
           "authority": "Travelport",
           "value": "37a59129-7ad3-4b5d-8d87-8a88528c0804"
          },
          "Departure": {
           "@type": "Departure",
           "location": "CDG",
           "date": "2025-11-14",
           "time": "14:20:00"
          },
          "Arrival": {
           "@type": "Arrival",
           "location": "AMS",
           "date": "2025-11-14",
           "time": "15:40:00"
          },
          "AvailabilitySourceCode": "S"
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
            1,
            2
           ],
           "classOfService": "T",
           "cabin": "Economy"
          }
         ]
        },
        {
         "@type": "PassengerFlight",
         "passengerQuantity": 1,
         "passengerTypeCode": "CHD",
         "FlightProduct": [
          {
           "@type": "FlightProduct",
           "segmentSequence": [
            1,
            2
           ],
           "classOfService": "T",
           "cabin": "Economy"
          }
         ]
        },
        {
         "@type": "PassengerFlight",
         "passengerQuantity": 1,
         "passengerTypeCode": "INF",
         "FlightProduct": [
          {
           "@type": "FlightProduct",
           "segmentSequence": [
            1,
            2
           ],
           "classOfService": "T",
           "cabin": "Economy"
          }
         ]
        }
       ]
      },
      {
       "@type": "ProductAir",
       "id": "p17",
       "Identifier": {
        "authority": "Travelport",
        "value": "7acfd0b6-7895-42f1-9739-2e6b53f7c3dd"
       },
       "FlightSegment": [
        {
         "@type": "FlightSegment",
         "id": "FlightSegment_03",
         "sequence": 3,
         "connectionDuration": "PT11H",
         "boundFlightsInd": true,
         "Flight": {
          "@type": "FlightDetail",
          "duration": "PT1H20M",
          "carrier": "AF",
          "number": "1141",
          "equipment": "223",
          "id": "s33",
          "Identifier": {
           "authority": "Travelport",
           "value": "1ee9b00b-46d0-4c4f-80a9-ff7219795db2"
          },
          "Departure": {
           "@type": "Departure",
           "location": "AMS",
           "date": "2025-11-30",
           "time": "19:15:00"
          },
          "Arrival": {
           "@type": "Arrival",
           "location": "CDG",
           "date": "2025-11-30",
           "time": "20:35:00"
          },
          "AvailabilitySourceCode": "S"
         }
        },
        {
         "@type": "FlightSegment",
         "id": "FlightSegment_04",
         "sequence": 4,
         "Flight": {
          "@type": "FlightDetail",
          "duration": "PT1H25M",
          "carrier": "AF",
          "number": "1680",
          "equipment": "223",
          "id": "s34",
          "Identifier": {
           "authority": "Travelport",
           "value": "f112d696-26e1-4639-8c91-99cec69ea7d0"
          },
          "Departure": {
           "@type": "Departure",
           "location": "CDG",
           "date": "2025-12-01",
           "time": "07:35:00"
          },
          "Arrival": {
           "@type": "Arrival",
           "location": "LHR",
           "date": "2025-12-01",
           "time": "08:00:00"
          },
          "AvailabilitySourceCode": "S"
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
            3,
            4
           ],
           "classOfService": "R",
           "cabin": "Economy"
          }
         ]
        },
        {
         "@type": "PassengerFlight",
         "passengerQuantity": 1,
         "passengerTypeCode": "CHD",
         "FlightProduct": [
          {
           "@type": "FlightProduct",
           "segmentSequence": [
            3,
            4
           ],
           "classOfService": "R",
           "cabin": "Economy"
          }
         ]
        },
        {
         "@type": "PassengerFlight",
         "passengerQuantity": 1,
         "passengerTypeCode": "INF",
         "FlightProduct": [
          {
           "@type": "FlightProduct",
           "segmentSequence": [
            3,
            4
           ],
           "classOfService": "R",
           "cabin": "Economy"
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
      "Base": 586,
      "TotalTaxes": 773.5,
      "TotalFees": 0,
      "TotalPrice": 1359.5,
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
         "Base": 307,
         "Taxes": {
          "@type": "TaxesDetail",
          "TotalTaxes": 376,
          "Tax": [
           {
            "taxCode": "GB",
            "value": 27.2
           },
           {
            "taxCode": "UB",
            "value": 48.7
           },
           {
            "taxCode": "FR",
            "value": 11.8
           },
           {
            "taxCode": "QX",
            "value": 49.8
           },
           {
            "taxCode": "CJ",
            "value": 39.8
           },
           {
            "taxCode"
…
```

