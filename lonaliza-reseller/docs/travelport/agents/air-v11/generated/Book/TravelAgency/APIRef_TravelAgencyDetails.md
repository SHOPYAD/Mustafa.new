# Travel Agency Details API&#160;Reference (Single Payload)

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Book/TravelAgency/APIRef_TravelAgencyDetails.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Travel Agency Details API&#160;Reference (Single Payload) Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Travel Agency Details API&#160;Reference (Single Payload) Request Response Example request Example response POST ticket/travelagency/reservationworkbench/ {workbenchID} /travelagency For {workbenchID} send the workbench identifier returned in ReservationResponse/Identifer/value in the workbench create response. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Booking Guide Use Travel Agency Details to add a travel agency corporate ID and details including address, telephone, and email to a booking. Must be sent as part of a workbench session, either during the initial booking workflow or a post-commit workbench for an existing booking, and followed by a workbench commit . The reservation retrieve for a booking returns any travel agency details associated with that booking. To update and delete this information, use the Travel Agency Corporate ID , Travel Agency Address , Travel Agency Email , and Travel Agency Telephone APIs. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body Show Request Body Table Object Description Required/Optional TravelAgencyQueryTravelAgencyWrapper Top-level object. Includes TravelAgencyQueryTravelAgency object. Although all objects here are listed as optional, at least one object must be populated or an error message is returned. Only one address, email and/or corporate ID is allowed; multiple telephone numbers can be sent. Required TravelAgencyQueryTravelAgency Top-level object. Includes Address and CorporateCode objects. No objects are specifically required to be sent, but either Address or CorporateCode must be populated to avoid an error. Required Address Agency address details. Includes AddressLine, City, StateProv, Country, PostalCode, and Addressee objects. Optional AddressLine String. Max length 128. Agency street number and address. Optional City String. Max length 128. Agency city. Optional StateProv Top level object for state/province. Optional name String. Max length 512. Name of state or province. Optional value String. Minimum length 2. Max length 8. Postal abbreviation for state or province. Optional Country Agency country. Optional name String. Max length 128. Name of country. Optional PostalCode String. Max length 128. Agency postal code. Optional Addressee String. Max length 37. Contact name at agency. Optional CorporateCode String. Max length 32. User-assigned corporate code. Optional Telephone Array. Agency phone information. Optional countryAccessCode String. Country access code for phone number. Optional areaCityCode String. Area code for phone number. Optional phoneNumber String. Max length 32. Phone number. Optional extension String. Phone number extension. Optional cityCode String. Max length 10. City code for Country access code for phone number. Optional Email Array. Agency email address. Optional id String. User-assigned short id for this email address. If not assigned, a system-assigned id is returned. Optional value String. Max length 128. Email address value. Optional Response The response returns the details sent in the request. Objects returned vary per the request. Show Response Body Table Object Description TravelAgencyResponse Top level object. Includes TravelAgency object. TravelAgency Top level object for travel agency ID and response identifier. Any corporate code is not returned in the response but is returned in any subsequent Reservation Retrieve. Key value pair: id : System-generated id for this travel agency. Must be sent in any subsequent requests to modify or delete any travel agency details. Includes Identifier object. Identifier System-generated identifier for the response. Key value pairs: authority : Source of information. value : Unique system-generated identifier. Telephone Array. One instance for each telephone number for the agency. Telephone details are not returned in the response but are returned in any subsequent Reservation Retrieve. id : System-assigned travel agency telephone id. Must be sent in any subsequent telephone update or delete request . Address Identifier for the travel agency address, if address was sent in the request. Address details are not returned in the response but are returned in any subsequent Reservation Retrieve. id : System-assigned travel agency address id. Must be sent in any subsequent address update or delete request . Email Id for the email sent in details request. Email details are not returned in the response but are returned in any subsequent Reservation Retrieve. Key value pair: id : Travel agency email id. Must be sent in any subsequent email update or delete request . Example Request The following example Travel Agency Details request sends an agency address, corporate code, telephone, and email to add to the booking in the workbench. Show Example Travel Agency Details request { "TravelAgencyQueryTravelAgencyWrapper": { "TravelAgencyQueryTravelAgency": { "Address": { "AddressLine": "28 BROAD STREET", "City": "ENGLEWOOD", "StateProv": { "name": "COLORADO" }, "Country": { "name": "US" }, "PostalCode": "80111", "Addressee": "NAME" }, "CorporateCode": "TEST01USCWT", "Telephone": [ { "countryAccessCode": "1", "areaCityCode": "719", "phoneNumber": "7901741", "extension": "123", "cityCode": "DEN" }, { "countryAccessCode": "1", "areaCityCode": "719", "phoneNumber": "33333", "extension": "123", "cityCode": "DEN" } ], "Email": { "value": "kamal.kamal@travelportnone.com" } } } } Example Response The following response is returned for the Travel Agency Details request when telephone, address, email, and a corporate code are sent. Show Example Travel Agency Details response { "TravelAgencyResponse": { "TravelAgency": { "@type": "TravelAgencyDetail", "id": "travelagency_1", "Identifier": { "value": "9d1097fa-da38-418e-8610-8f8dfdebfa69", "authority": "Travelport" }, "Telephone": [ { "@type": "Telephone", "id": "telephone_1" }, { "@type": "Telephone", "id": "telephone_2" } ], "Address": [ { "@type": "AddressDetail", "id": "address_1" } ], "Email": [ { "id": "email_1" } ] } } } The following example is a Reservation Retrieve response for a booking with all supported travel agency details, returned in the TravelAgency object. Show Example Reservation Retrieve response for booking with travel agency details { "ReservationResponse": { "@type": "ReservationResponse", "Reservation": { "@type": "Reservation", "Identifier": { "authority": "Travelport", "value": "cea79792-abef-4c55-a4bf-12f2b1a53d94" }, "Offer": [ { "@type": "Offer", "id": "offer_1", "Identifier": { "authority": "Travelport", "value": "a7c821e8-ae98-4965-ab9f-08ac852bdb83" }, "Product": [ { "@type": "ProductAir", "id": "p0", "Identifier": { "authority": "Travelport", "value": "9f9120d8-df83-4b32-8d2c-cad731865d20" }, "FlightSegment": [ { "@type": "FlightSegment", "id": "FlightSegment_01", "sequence": 1, "Flight": { "@type": "FlightDetail", "duration": "PT2H5M", "carrier": "AA", "number": "1322", "equipment": "321", "id": "f1", "Identifier": { "authority": "Travelport", "value": "cedbb8b5-4e84-4ae7-9b01-a7f743684401" }, "Departure": { "@type": "Departure", "location": "DFW", "date": "2024-12-08", "time": "16:35:00" }, "Arrival": { "@type": "Arrival", "location": "DEN", "date": "2024-12-08", "time": "17:44:00" }, "AvailabilitySourceCode": "S" } } ], "PassengerFlight": [ { "@type": "PassengerFlight", "passengerQuantity": 1, "passengerTypeCode": "ADT", "FlightProduct": [ { "@type": "FlightProduct", "segmentSequence": [ 1 ], "classOfService": "O", "cabin": "Economy" } ] } ] } ], "TermsAndConditionsFull": [ { "@type": "TermsAndConditionsFullAir", "secureFlightPassengerDataRequiredInd": true, "Identifier": { "authority": "Travelport", "value": "15939c37-fa99-4c37-9e99-a8a2a283b8e1" } } ] } ], "Traveler": [ { "@type": "Traveler", "gender": "Male", "passengerTypeCode": "ADT", "id": "trav_1", "Identifier": { "value": "226ab004-cde4-433f-aa6a-069a8548852e" }, "PersonName": { "@type": "PersonNameDetail", "Given": "Sam", "Surname": "Houston" }, "Telephone": [ { "@type": "Telephone", "countryAccessCode": "1", "areaCityCode": "111", "phoneNumber": "1111111", "extension": "121", "id": "1", "cityCode": "DEN", "role": "Mobile" } ], "Email": [ { "id": "email_1", "emailType": "TO", "validInd": true, "value": "indranil.ghosh.first@gmail.com" }, { "id": "email_1", "emailType": "TO", "validInd": true, "value": "indranil.ghosh.another@gmail.com" } ], "TravelDocument": [ { "@type": "TravelDocumentDetail", "docNumber": "88989889", "docType": "Passport", "issueDate": "2019-07-04", "expireDate": "2024-12-05", "issueCountry": "US", "birthDate": "1991-12-12", "birthPlace": "US", "Gender": "Male", "PersonName": { "@type": "PersonNameDetail", "Prefix": "", "Given": "Sabbyanuj", "Surname": "Maji", "Suffix": "" }, "IssuedForGeoPoliticalArea": { "value": "US" } } ] } ], "Receipt": [ { "@type": "ReceiptConfirmation", "Identifier": { "authority": "Travelport", "value": "52cd4146-9855-4f95-8c20-87a8de583cea" }, "Confirmation": { "@type": "ConfirmationHold", "OfferStatus": { "@type": "OfferStatusAir", "StatusAir": [ { "flightRefs": [ "f1" ], "code": "HS", "value": "Pending" } ] } } } ], "TravelAgency": { "@type": "TravelAgencyDetail", "id": "travelAgency_1", "Identifier": { "authority": "Travelport", "value": "1d9376f9-3c65-4d63-a88a-a263dc6e3cd5" }, "CorporateCode": "TEST01USCWT", "Telephone": [ { "@type": "TelephoneDetail", "countryAccessCode": "1", "areaCityCode": "719", "phoneNumber": "7901741", "extension": "123", "id": "telephone_1", "cityCode": "DEN" }, { "@type": "TelephoneDetail", "countryAccessCode": "1", "areaCityCode": "719", "phoneNumber": "33333", "extension": "123", "id": "telephone_2", "cityCode": "DEN" } ], "Address": [ { "@type": "Address", "id": "address_1", "role": "Business", "AddressLine": [ "28 BROAD STREET" ], "City": "ENGLEWOOD", "StateProv": { "name": "COLORADO" }, "Country": { "name": "US" }, "PostalCode": "80111" } ], "Email": [ { "id": "email_1", "value": "shyam.kumar@travelport.com" } ] }, "ReservationDisplaySequence": { "@type": "ReservationDisplaySequence", "DisplaySequence": [ { "@type": "DisplaySequence", "displaySequence": 1, "OfferRef": "offer_1", "ProductRef": "p0", "Sequence": 1 } ] } } } } &#160;

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
 "TravelAgencyQueryTravelAgencyWrapper": {
  "TravelAgencyQueryTravelAgency": {
   "Address": {
    "AddressLine": "28 BROAD STREET",
    "City": "ENGLEWOOD",
    "StateProv": {
     "name": "COLORADO"
    },
    "Country": {
     "name": "US"
    },
    "PostalCode": "80111",
    "Addressee": "NAME"
   },
   "CorporateCode": "TEST01USCWT",
   "Telephone": [
    {
     "countryAccessCode": "1",
     "areaCityCode": "719",
     "phoneNumber": "7901741",
     "extension": "123",
     "cityCode": "DEN"
    },
    {
     "countryAccessCode": "1",
     "areaCityCode": "719",
     "phoneNumber": "33333",
     "extension": "123",
     "cityCode": "DEN"
    }
   ],
   "Email": {
    "value": "kamal.kamal@travelportnone.com"
   }
  }
 }
}
```

### Block 2

```
{
 "TravelAgencyResponse": {
  "TravelAgency": {
   "@type": "TravelAgencyDetail",
   "id": "travelagency_1",
   "Identifier": {
    "value": "9d1097fa-da38-418e-8610-8f8dfdebfa69",
    "authority": "Travelport"
   },
   "Telephone": [
    {
     "@type": "Telephone",
     "id": "telephone_1"
    },
    {
     "@type": "Telephone",
     "id": "telephone_2"
    }
   ],
   "Address": [
    {
     "@type": "AddressDetail",
     "id": "address_1"
    }
   ],
   "Email": [
    {
     "id": "email_1"
    }
   ]
  }
 }
}
```

### Block 3

```
{
 "ReservationResponse": {
  "@type": "ReservationResponse",
  "Reservation": {
   "@type": "Reservation",
   "Identifier": {
    "authority": "Travelport",
    "value": "cea79792-abef-4c55-a4bf-12f2b1a53d94"
   },
   "Offer": [
    {
     "@type": "Offer",
     "id": "offer_1",
     "Identifier": {
      "authority": "Travelport",
      "value": "a7c821e8-ae98-4965-ab9f-08ac852bdb83"
     },
     "Product": [
      {
       "@type": "ProductAir",
       "id": "p0",
       "Identifier": {
        "authority": "Travelport",
        "value": "9f9120d8-df83-4b32-8d2c-cad731865d20"
       },
       "FlightSegment": [
        {
         "@type": "FlightSegment",
         "id": "FlightSegment_01",
         "sequence": 1,
         "Flight": {
          "@type": "FlightDetail",
          "duration": "PT2H5M",
          "carrier": "AA",
          "number": "1322",
          "equipment": "321",
          "id": "f1",
          "Identifier": {
           "authority": "Travelport",
           "value": "cedbb8b5-4e84-4ae7-9b01-a7f743684401"
          },
          "Departure": {
           "@type": "Departure",
           "location": "DFW",
           "date": "2024-12-08",
           "time": "16:35:00"
          },
          "Arrival": {
           "@type": "Arrival",
           "location": "DEN",
           "date": "2024-12-08",
           "time": "17:44:00"
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
            1
           ],
           "classOfService": "O",
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
       "secureFlightPassengerDataRequiredInd": true,
       "Identifier": {
        "authority": "Travelport",
        "value": "15939c37-fa99-4c37-9e99-a8a2a283b8e1"
       }
      }
     ]
    }
   ],
   "Traveler": [
    {
     "@type": "Traveler",
     "gender": "Male",
     "passengerTypeCode": "ADT",
     "id": "trav_1",
     "Identifier": {
      "value": "226ab004-cde4-433f-aa6a-069a8548852e"
     },
     "PersonName": {
      "@type": "PersonNameDetail",
      "Given": "Sam",
      "Surname": "Houston"
     },
     "Telephone": [
      {
       "@type": "Telephone",
       "countryAccessCode": "1",
       "areaCityCode": "111",
       "phoneNumber": "1111111",
       "extension": "121",
       "id": "1",
       "cityCode": "DEN",
       "role": "Mobile"
      }
     ],
     "Email": [
      {
       "id": "email_1",
       "emailType": "TO",
       "validInd": true,
       "value": "indranil.ghosh.first@gmail.com"
      },
      {
       "id": "email_1",
       "emailType": "TO",
       "validInd": true,
       "value": "indranil.ghosh.another@gmail.com"
      }
     ],
     "TravelDocument": [
      {
       "@type": "TravelDocumentDetail",
       "docNumber": "88989889",
       "docType": "Passport",
       "issueDate": "2019-07-04",
       "expireDate": "2024-12-05",
       "issueCountry": "US",
       "birthDate": "1991-12-12",
       "birthPlace": "US",
       "Gender": "Male",
       "PersonName": {
        "@type": "PersonNameDetail",
        "Prefix": "",
        "Given": "Sabbyanuj",
        "Surname": "Maji",
        "Suffix": ""
       },
       "IssuedForGeoPoliticalArea": {
        "value": "US"
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
      "value": "52cd4146-9855-4f95-8c20-87a8de583cea"
     },
     "Confirmation": {
      "@type": "ConfirmationHold",
      "OfferStatus": {
       "@type": "OfferStatusAir",
       "StatusAir": [
        {
         "flightRefs": [
          "f1"
         ],
         "code": "HS",
         "value": "Pending"
        }
       ]
      }
     }
    }
   ],
   "TravelAgency": {
    "@type": "TravelAgencyDetail",
    "id": "travelAgency_1",
    "Identifier": {
     "authority": "Travelport",
     "value": "1d9376f9-3c65-4d63-a88a-a263dc6e3cd5"
    },
    "CorporateCode": "TEST01USCWT",
    "Telephone": [
     {
      "@type": "TelephoneDetail",
      "countryAccessCode": "1",
      "areaCityCode": "719",
      "phoneNumber": "7901741",
      "extension": "123",
      "id": "telephone_1",
      "cityCode": "DEN"
     },
     {
      "@type": "TelephoneDetail",
      "countryAccessCode": "1",
      "areaCityCode": "719",
      "phoneNumber": "33333",
      "extension": "123",
      "id": "telephone_2",
      "cityCode": "DEN"
     }
    ],
    "Address": [
     {
      "@type": "Address",
      "id": "address_1",
      "role": "Business",
      "AddressLine": [
       "28 BROAD STREET"
      ],
      "City": "ENGLEWOOD",
      "StateProv": {
       "name": "COLORADO"
      },
      "Country": {
       "name": "US"
      },
      "PostalCode": "80111"
     }
    ],
    "Email": [
     {
      "id": "email_1",
      "value": "shyam.kumar@travelport.com"
     }
    ]
   },
   "ReservationDisplaySequence": {
    "@type": "ReservationDisplaySequence",
    "DisplaySequence": [
     {
      "@type": "DisplaySequence",
      "displaySequence": 1,
      "OfferRef": "offer_1",
      "ProductRef": "p0",
      "Sequence": 1
     }
    ]
   }
  }
 }
}
```

