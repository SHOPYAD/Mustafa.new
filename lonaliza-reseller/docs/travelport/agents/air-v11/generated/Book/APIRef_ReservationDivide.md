# Reservation Divide API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Book/APIRef_ReservationDivide.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Reservation Divide API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Reservation Divide API&#160;Reference Request Response Example request Example response POST book/reservation/reservations/divide Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Booking Guide , Reservation Retrieve Guide You can divide a reservation with multiple travelers into separate itineraries. This avoids having to cancel a multi-traveler booking to cancel or otherwise modify only some of the travelers. Dividing an NDC reservation may affect subsequent support for modifying that reservation. See the Exchange, Refund, and Void Guide for support details by carrier. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body In the request payload, send identifiers for the traveler/s to remove from the existing reservation. Any traveler identifiers that are not sent remain on the original reservation. Show Request Body Table Object Description Required/Optional ReservationQueryDivide Top level object. Includes ReservationIdentifier and TravelerIdentifier. Required ReservationIdentifier Top level object for reservation identifier details. Includes Identifier. Required Identifier Send the system-generated identifier values for the reservation. Key value pairs: authority : Source of information. value : Unique system-generated identifier. Required TravelerIdentifier Top level object for traveler identifier details. id : Custom user-assigned traveler ID sent when traveler was added to booking. Send the identifier values for the traveler to remove from the existing reservation and place on a new reservation.&#160;To remove multiple travelers, send one instance of TravelerIdentifier for each traveler to remove. Required Identifier Send the system-generated identifier values for the traveler. Key value pairs: authority : Source of information. value : Unique system-generated identifier. Required Response The response returns the new child reservation. The previous reservation code can be used to retrieve the parent reservation. Show Response Body Table Object Description ReservationListResponse Top level object for response, which returns the new child reservation. Includes ReservationID. ReservationID Top level object for reservation details. Identifier Identifier details for this transaction. In this case, authority is always Travelport and value provides a system-generated internal identifier for the response. Key value pairs: authority : Source of information. value : Unique system-generated identifier. Offer Offer and itinerary details. See the Reservation Retrieve API&#160;Reference for Offer objects. Traveler Traveler details for the traveler removed from the original reservation. See the Reservation Retrieve API&#160;Reference for Traveler objects. Receipt See the Reservation Retrieve API&#160;Reference for Receipt objects. In addition, the confirmation and any reservation retrieve response for a divided reservation returns an instance of Receipt with @type ReceiptConfirmationDivide, in which: Confirmation/Locator/value returns the reservation locator for the new child reservation. ParentLocator/value returns the reservation locator for the original parent reservation per the following row. ParentLocator Reservation&#160;locator code of original, or parent, reservation. source : Source of reservation&#160;code. value : Reservation&#160;locator for the reservation&#160;the child reservation was divided from. Example Request The following request removes one traveler from the existing reservation. Show Example Reservation&#160;Divide Request { "ReservationQueryDivide": { "ReservationIdentifier": { "Identifier": { "authority": "Travelport", "value": "3f36c9e4-1c0a-4eb9-bff4-f4fa030f18b8" } }, "TravelerIdentifier": [ { "id": "travelerRefId_2", "Identifier": { "authority": "Travelport", "value": "QURUfFQx" } } ] } } Example Response The response returns details for the new reservation. Towards the end of the response, the reservation locator codes for the new (child) and original (parent) reservations are highlighted in yellow. Show Example Reservation&#160;Divide Response { "ReservationListResponse": { "@type": "ReservationListResponse", "Reservation": [ { "@type": "Reservation", "Identifier": { "authority": "Travelport", "value": "b72501ab-fc8c-408b-abc1-9b586cce6018" }, "Offer": [ { "@type": "OfferTvp", "id": "offer_1", "Identifier": { "authority": "Travelport", "value": "5e118116-cb2c-4a74-9e48-be174a2c2763" }, "Product": [ { "@type": "ProductAir", "id": "product_1", "Identifier": { "authority": "Travelport", "value": "05599e5b-1c9c-4f79-9c89-d42fbaf45961" }, "FlightSegment": [ { "@type": "FlightSegment", "id": "FlightSegment_01", "sequence": 1, "Flight": { "@type": "Flight", "duration": "PT1H35M", "carrier": "LH", "number": "921", "equipment": "32N", "id": "Flight_01", "Identifier": { "authority": "Travelport", "value": "dee4d2db-6d37-4fb1-9c0b-6cf3c0f600ae" }, "Departure": { "@type": "Departure", "location": "LHR", "date": "2023-10-22", "time": "06:30:00" }, "Arrival": { "@type": "Arrival", "location": "FRA", "date": "2023-10-22", "time": "09:05:00" } } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 2, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 1 ], "classOfService": "Y", "cabin": "Economy" } ] } ] } ], "TermsAndConditionsFull": [ { "@type": "TermsAndConditionsFullAir", "Identifier": { "authority": "Travelport", "value": "54aa7ece-14c3-46ac-af6d-1e5c0e63bd0a" } } ] } ], "Traveler": [ { "@type": "Traveler", "passengerTypeCode": "ADT", "id": "travelerRefId_1", "Identifier": { "authority": "Travelport", "value": "eae53b77-d34e-4c86-8261-a67b43d9ae5a" }, "PersonName": { "@type": "PersonName", "Given": "ONE", "Surname": "TEST" }, "Telephone": [ { "@type": "TelephoneDetail", "phoneNumber": "NNNN", "id": "telephone_1" } ] } ], "Receipt": [ { "@type": "ReceiptConfirmation", "Identifier": { "authority": "Travelport", "value": "074cfaa0-1773-4041-a761-6e225d1abe3b" }, "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "1G", "value": "2CP2CM" }, "OfferStatus": { "@type": "OfferStatusAir", "StatusAir": [ { "flightRefs": [ "Flight_01" ], "code": "HK", "value": "Confirmed" } ] } } }, { "@type": "ReceiptConfirmation", "Identifier": { "authority": "Travelport", "value": "60b8a228-2c5a-4382-b7c1-708698828969" }, "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "TripContainer", "value": "945B0A4E-1EDE-0D47-8202-210311253226" } } }, { "@type": "ReceiptConfirmation", "Identifier": { "authority": "Travelport", "value": "2762711b-5eb7-4f45-a86d-fc2d66153777" }, "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "1G", "value": "5YVLS9" } } }, { "@type": "ReceiptConfirmationDivide", "Identifier": { "authority": "Travelport", "value": "284cf06d-d17d-4fc3-9187-fb892b3e09cc" }, "Confirmation": { "@type": "ConfirmationHold", "Locator": { "source": "1G", "value": "2CP2CM" } }, "ParentLocator": { "source": "1G", "value": "2CP6ZL" } } ] } ] } }

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
 "ReservationQueryDivide": {
  "ReservationIdentifier": {
   "Identifier": {
    "authority": "Travelport",
    "value": "3f36c9e4-1c0a-4eb9-bff4-f4fa030f18b8"
   }
  },
  "TravelerIdentifier": [
   {
    "id": "travelerRefId_2",
    "Identifier": {
     "authority": "Travelport",
     "value": "QURUfFQx"
    }
   }
  ]
 }
}
```

### Block 2

```
{
 "ReservationListResponse": {
  "@type": "ReservationListResponse",
  "Reservation": [
   {
    "@type": "Reservation",
    "Identifier": {
     "authority": "Travelport",
     "value": "b72501ab-fc8c-408b-abc1-9b586cce6018"
    },
    "Offer": [
     {
      "@type": "OfferTvp",
      "id": "offer_1",
      "Identifier": {
       "authority": "Travelport",
       "value": "5e118116-cb2c-4a74-9e48-be174a2c2763"
      },
      "Product": [
       {
        "@type": "ProductAir",
        "id": "product_1",
        "Identifier": {
         "authority": "Travelport",
         "value": "05599e5b-1c9c-4f79-9c89-d42fbaf45961"
        },
        "FlightSegment": [
         {
          "@type": "FlightSegment",
          "id": "FlightSegment_01",
          "sequence": 1,
          "Flight": {
           "@type": "Flight",
           "duration": "PT1H35M",
           "carrier": "LH",
           "number": "921",
           "equipment": "32N",
           "id": "Flight_01",
           "Identifier": {
            "authority": "Travelport",
            "value": "dee4d2db-6d37-4fb1-9c0b-6cf3c0f600ae"
           },
           "Departure": {
            "@type": "Departure",
            "location": "LHR",
            "date": "2023-10-22",
            "time": "06:30:00"
           },
           "Arrival": {
            "@type": "Arrival",
            "location": "FRA",
            "date": "2023-10-22",
            "time": "09:05:00"
           }
          }
         }
        ],
        "PassengerFlight": [
         {
          "@type": "PassengerFlight",
          "passengerQuantity": 2,
          "passengerTypeCode": "ADT",
          "FlightProduct": [
           {
            "@type": "FlightProduct",
            "segmentSequence": [
             1
            ],
            "classOfService": "Y",
            "cabin": "Economy"
           }
          ]
         }
        ]
       }
      ],
      "TermsAndConditionsFull": [
       {
        "@type": "TermsAndConditionsFullAir",
        "Identifier": {
         "authority": "Travelport",
         "value": "54aa7ece-14c3-46ac-af6d-1e5c0e63bd0a"
        }
       }
      ]
     }
    ],
    "Traveler": [
     {
      "@type": "Traveler",
      "passengerTypeCode": "ADT",
      "id": "travelerRefId_1",
      "Identifier": {
       "authority": "Travelport",
       "value": "eae53b77-d34e-4c86-8261-a67b43d9ae5a"
      },
      "PersonName": {
       "@type": "PersonName",
       "Given": "ONE",
       "Surname": "TEST"
      },
      "Telephone": [
       {
        "@type": "TelephoneDetail",
        "phoneNumber": "NNNN",
        "id": "telephone_1"
       }
      ]
     }
    ],
    "Receipt": [
     {
      "@type": "ReceiptConfirmation",
      "Identifier": {
       "authority": "Travelport",
       "value": "074cfaa0-1773-4041-a761-6e225d1abe3b"
      },
      "Confirmation": {
       "@type": "ConfirmationHold",
       "Locator": {
        "source": "1G",
        "value": "2CP2CM"
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
       "value": "60b8a228-2c5a-4382-b7c1-708698828969"
      },
      "Confirmation": {
       "@type": "ConfirmationHold",
       "Locator": {
        "source": "TripContainer",
        "value": "945B0A4E-1EDE-0D47-8202-210311253226"
       }
      }
     },
     {
      "@type": "ReceiptConfirmation",
      "Identifier": {
       "authority": "Travelport",
       "value": "2762711b-5eb7-4f45-a86d-fc2d66153777"
      },
      "Confirmation": {
       "@type": "ConfirmationHold",
       "Locator": {
        "source": "1G",
        "value": "5YVLS9"
       }
      }
     },
     {
      "@type": "ReceiptConfirmationDivide",
      "Identifier": {
       "authority": "Travelport",
       "value": "284cf06d-d17d-4fc3-9187-fb892b3e09cc"
      },
      "Confirmation": {
       "@type": "ConfirmationHold",
       "Locator": {
        "source": "1G",
        "value": "2CP2CM"
       }
      },
      "ParentLocator": {
       "source": "1G",
       "value": "2CP6ZL"
      }
     }
    ]
   }
  ]
 }

}
```

