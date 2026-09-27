# Add Traveler API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Book/APIRef_TravelerAdd.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Add Traveler API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Add Traveler API&#160;Reference Request Response Example request Example response POST book/traveler/reservationworkbench/ {workbenchID} /travelers (when adding exactly one traveler) book/traveler/reservationworkbench/ {workbenchID} /travelers/list (when adding multiple travelers) For {workbenchID} send the workbench identifier returned in ReservationResponse/Identifer/value in the workbench create response. Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Booking Guide , Booking Session Workflow Send the Add&#160;Traveler request to add traveler/s to the reservation workbench. Traveler information can include traveler name and contact details. You can also use this request to send traveler-specific remarks including certain SSRs and travel documents such as a passport. Request As part of the request requirements, also see Authentication and Common Air API Headers . Query Parameters None. Request Body The data required for a traveler can vary by carrier. Show Request Body Table Traveler object Object Description Required/Optional TravelerListRequest Wrapper object for request. Send with @type value Traveler . AirReservation 25.11.51 added the TravelerListRequest object to support Traveler as an array. You can send up to nine travelers in a single request. Best practice is to send TravelerListRequest for all Add Traveler requests. The previous payload, which sends a single instance of Traveler and supports only one traveler per request, is still supported. Note the different endpoint when adding multiple travelers per the top of this page, appending /list to travelers Required for adding multiple travelers in one request; optional for adding a single traveler Traveler Array when sent with TravelerListRequest per the note in the preceding row. Each instance sends details for one traveler. A single booking can have up to nine travelers. When sent without TravelerListRequest, only one instance of Traveler is supported in a single request. Includes PersonName, Telephone, Email, Address, Comments, TravelDocument, and CustomerLoyalty objects. Any traveler sent without a PTC (passenger type code) value is defaulted to ADT. PTC can be sent or omitted for ADT travelers. An INF (infant) cannot be added without an ADT (adult) PTC. Required (at least one instance is required) passengerTypeCode Passenger type code (PTC) for this traveler. Required for all PTCs other than ADT; if not sent defaults to&#160;ADT birthDate The JSON APIs require this object only for infant and child PTC types (e.g., INF, INS, CHD, UNN). Send in YYYY-MM-DD format, for example, "birthDate":"2020-02-21" When sending minimum secure flight information , which is required by some carriers, this object is required for all PTCs. Required for infant and child PTCs, or as part of minimum secure flight information gender Traveler gender. Supported values: Male Female Unknown When sending minimum secure flight information , which is required by some carriers, this object is required. Optional Required only as part of minimum secure flight information PersonName Top level object. Required Given Traveler first or given name. Required Surname Traveler last name or surname. Required Prefix Title such as Mr, Mrs, Ms. Optional Middle Traveler middle name. Optional Suffix Traveler name suffix such as Jr or Sr. Optional Telephone, Address, Email, CustomerLoyalty, Comments objects The following objects are supported in all instances of Traveler. Some of this data is converted to remarks as applicable. See Remarks &amp; Service Requests Guide for additional information. Required data varies by carrier. Object Description Required/Optional Telephone Top level object. NDC carriers typically require either an email address or phone number for booking. Recommended best practice is to provide both Email and Telephone for NDC. Optional countryAccessCode Country code for phone number. Optional phoneNumber String. Phone number. Optional extension GDS&#160;only; not supported for NDC. Extension for a phone number. Optional id Custom user-assigned identifier to assign to this phone number. Optional cityCode City code for phone number. Optional role Role to assign to this number. Supported values are as follows; case-sensitive: Mobile Home Work Office Fax Other Required if Telephone sent Address Traveler address details. Includes Number, Street, City, StateProv, Country, and PostalCode objects. Sending Address is optional, but when sent it must have the role set to Delivery and include at least one of its objects, such as Number or City per below. Optional role Must be set to Delivery . Traveler address details are sent as a client delivery remark when Address/role is sent with a value of Delivery . See more in the Remarks &amp; Service Requests Guide . Optional Number Top level object for the street number of the address. Optional value Value of street number. &#160; Street The street name of the traveler address. Optional City The city of the traveler address. Optional StateProv Top level object for the street number of the address. Optional name Name of state or province. Optional value Postal abbreviation for state or province. Optional Country Country of the traveler address. Optional PostalCode Postal code of the traveler address. Optional Telephone Traveler phone information. For NDC, carriers usually require either an email address or phone number, although this varies by carrier. Recommended best practice is to send both an email address and phone number for each traveler. Optional countryAccessCode Country access code for phone number. Optional areaCityCode Area code for phone number. Optional phoneNumber Phone number. Optional extension Phone number extension. Optional id Id for phone extension. Optional cityCode City code for phone number. Optional role Freeform text for type of phone number, such as office, cell, home. Optional Email Traveler email information. Array. Send one instance for each email address. NDC carriers typically require either an email address or phone number for booking. Recommended best practice is to provide both Email and Telephone for NDC. Optional comment Any freeform note for the email, such as its purpose, e.g., work email. Optional value Email address. Required if Email is sent CustomerLoyalty Object for frequent traveler details. If CustomerLoyalty is sent in the Search request, it must also be sent in the AirPrice request and the Add Traveler request. Because some carriers validate frequent traveler data through the workflow, failing to send the same CustomerLoyalty details, even if invalid, may cause a booking failure. If an invalid number is sent, the response returns a warning message that the FQTV is invalid, and the invalid number is cached to prevent a potential booking failure. Required if sent in previous Search and AirPrice requests value Frequent flyer/frequent traveler (FQTV) number. Optional supplier Airline or supplier providing loyalty program. Optional cardHolderName Name of person with frequent flyer number. Optional shareWithSupplier Send multiple airline codes for cross accrual mileage programs for each airline participating in the booking; for example, if a flight qualifies for miles on both AF and KL per below. "shareWithSupplier":["AF","KL"] If valid carrier codes are not sent, the response returns the message NO CROSS ACCRUAL AGREEMENT EXISTS. Optional TravelDocument See TravelDocument table below. Optional Comments Use to send traveler name remarks. Includes Comment object. Optional Comment Use to send a custom freeform traveler name remark, such as a unique identifier for that traveler. Not supported for addition/deletion in Traveler Modify. Required if Comments is sent. id Local identifier to use for this remark. Optional value Freeform traveler name remark; up to 33 characters, only spaces and hyphens allowed for special characters. Required if Comments is sent. TravelDocument object TravelDocument is supported in all instances of Traveler. Some of this data is converted to remarks as applicable. See Remarks &amp; Service Requests Guide for additional information. Required data varies by carrier. Object Description Required/Optional TravelDocument Optional details about traveler identification documents such as a passport or drivers license. Includes PersonName object. Optional docNumber Travel document number. Required if TravelDocument sent docType Travel document type. Supported values: Passport PassportCard (GDS only; not supported for NDC.) Visa DriversLicense Redress KnownTravelerNumber NationalIdentityDocument (NDC only; carrier IB only; used for Spanish residency and large family discount fares for NDC) Required if TravelDocument sent expireDate Expiration date of document. Optional Required for a visa issueDate Issue date of document. Optional Required for a visa issueCountry Issuing country of document. Optional birthDate Send in YYYY-MM-DD format, for example, "birthDate":"2020-02-21" Optional Nationality Birth country as noted on document. Optional Gender Supported values: Male Female Unknown Optional PersonName Top level object. Required if TravelDocument sent Given Traveler first or given name. Required if TravelDocument sent Surname Traveler last name or surname. Required if TravelDocument sent Prefix Title such as Mr, Mrs, Ms. Optional Middle Traveler middle name. Optional Suffix Traveler name suffix such as Jr or Sr. Optional IssuedForGeoPoliticalArea Geopolitical area. Optional Response The response returns the system-generated traveler identifier. This identifier must be sent in any subsequent traveler-specific requests, such as ticketing and seat assignment. Show Response Body Table Object Description TravelerResponse Top level object. Traveler Top level object. Identifier Returns the system-generated traveler identifier in the following key value pairs; in this case authority, if returned, is Travelport : authority : Source of information. value : Unique system-generated identifier. Example Request For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . The following example request adds two travelers. For the first traveler it sends TravelDocument with passport details, and for the second traveler sends TravelDocument with visa details. AirReservation 25.11.51 added the TravelerListRequest object to support Traveler as an array. You can send up to nine travelers in a single request. Best practice is to send TravelerListRequest for all Add Traveler requests. The previous payload, which sends a single instance of Traveler and supports only one traveler per request, is still supported. Show Example - multiple travelers with passport and visa details { "TravelerListRequest": { "@type": "TravelerListRequest", "Traveler": [ { "@type": "Traveler", "PersonName": { "@type": "PersonNameDetail", "Given": "JORDAN", "Surname": "LOYTEST" }, "Telephone": [ { "@type": "Telephone", "countryAccessCode": "1", "areaCityCode": "909", "phoneNumber": "2124561", "extension": "123", "id": "1", "cityCode": "DEN", "role": "Home" } ], "TravelDocument": [ { "@type": "TravelDocumentDetail", "docNumber": "88789888", "docType": "Passport", "issueDate": "2019-07-06", "expireDate": "2023-12-07", "issueCountry": "USA", "birthDate": "1997-12-20", "birthPlace": "USA", "Gender": "Male", "PersonName": { "@type": "PersonNameDetail", "Given": "JORDAN", "Surname": "LOYTEST" }, "IssuedForGeoPoliticalArea": { "value": "USA" } } ], "Email": [ { "value": "sgd@webjet.com" } ], "CustomerLoyalty": [ { "value": "1295036", "supplier": "AA" } ] }, { "@type": "Traveler", "PersonName": { "@type": "PersonNameDetail", "Given": "JORDAN", "Surname": "LOYTEST" }, "Telephone": [ { "@type": "Telephone", "countryAccessCode": "1", "areaCityCode": "909", "phoneNumber": "2124561", "extension": "123", "id": "1", "cityCode": "DEN", "role": "Home" } ], "TravelDocument": [ { "@type": "TravelDocumentDetail", "docNumber": "V127", "docType": "Visa", "issueDate": "2019-07-04", "expireDate": "2021-12-05", "issueCountry": "LONDON", "birthDate": "1982-01-24", "birthPlace": "PARIS", "IssuedForGeoPoliticalArea": { "value": "USA" }, "Address": { "@type": "Address", "role": "Destination", "Street": "Travers Street", "City": "Claremont", "StateProv": { "name": "Texas", "value": "CA" }, "Country": { "value": "US" }, "PostalCode": "917113323" } } ], "Email": [ { "value": "carlson.tang@webjet.com.au" } ], "CustomerLoyalty": [ { "value": "1900007921", "supplier": "AA" } ] } ] } } If adding any traveler with the INF, INS, CHD, or UNN&#160;PTCs (infant without a seat, infant in seat, child, unaccompanied child), you must also specify the child's age, per the following example for a child passenger. The following examples send Traveler without the TravelerListRequest object. Only one passenger per request is supported in this format. Show example - single passenger child PTC with age { "Traveler": { "birthDate": "2024-08-20", "id": "trav_1", "passengerTypeCode": "INF", "PersonName": { "@type": "PersonNameDetail", "Given": "TestFirstInf", "Middle": "", "Surname": "TestLastInf", "Suffix": "Jr" }, "Telephone": [ { "@type": "Telephone", "countryAccessCode": "1", "areaCityCode": "305", "phoneNumber": "8675309", "id": "telephone_1", "role": "Home" } ], "TravelDocument": [ { "@type": "TravelDocument", "docNumber": "H294F6", "docType": "Passport", "expireDate": "{{passportExpiration}}", "issueCountry": "US", "birthDate": "{{infantDateOfBirth}}", "Nationality": "US", "Gender": "Female", "PersonName": { "@type": "PersonName", "Given": "TestFirstInf", "Surname": "TestLastInf" } } ] } } The following example request sends the CustomerLoyalty object to send a frequent traveler number. Show Example - single passenger with CustomerLoyalty { "Traveler": { "@type": "Traveler", "birthDate": "1999-02-22", "gender": "Male", "passengerTypeCode": "ADT", "PersonName": { "@type": "PersonNameDetail", "Prefix": "Mr", "Given": "Px ADTOne", "Middle": "MdNm", "Surname": "SrNmOne" }, "Telephone": [ { "@type": "Telephone", "countryAccessCode": "1", "areaCityCode": "909", "phoneNumber": "212456121", "extension": "1243", "id": "4", "cityCode": "ORD", "role": "Office" } ], "Email": [ { "value": "ADTTravelerOneOne@gmail.com" } ], "CustomerLoyalty": [ { "supplier": "QF", "value": "1234" } ], "TravelDocument": [ { "@type": "TravelDocumentDetail", "docNumber": "245968", "docType": "Passport", "issueDate": "2020-12-22", "expireDate": "2027-02-22", "issueCountry": "IND", "birthDate": "1999-02-22", "Nationality": "IN", "Gender": "Male", "PersonName": { "@type": "PersonName", "Given": "Px One", "Middle": "MdNmOne", "Surname": "SrNmOne" }, "IssuedForGeoPoliticalArea": { "value": "IN" } } ] } } The following example includes the optional Comment object. Send a value here to specify a freeform unique customer ID of your choice. Show Example - single passenger with name remark to create custom traveler ID { "Traveler": { "@type": "Traveler", "birthDate": "1999-02-22", "gender": "Male", "passengerTypeCode": "ADT", "PersonName": { "@type": "PersonNameDetail", "Prefix": "Mr", "Given": "Px ADTOne", "Middle": "MdNm", "Surname": "SrNmOne", "Suffix": "ADT" }, "Comments": { "@type": "Comments", "Comment": [ { "id": "comment_1", "value": "ID-12345671" } ] } } } Example Response The response returns a system-generated traveler identifier for each traveler added. Show Example Add&#160;Traveler Response { "TravelerResponse": { "Traveler": { "@type": "TravelerIdentifier", "Identifier": { "value": "1e0940e3-d9cb-4384-8824-4f1c160e7deb" } } } }

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
 "TravelerListRequest": {
  "@type": "TravelerListRequest",
  "Traveler": [
   {
    "@type": "Traveler",
    "PersonName": {
     "@type": "PersonNameDetail",
     "Given": "JORDAN",
     "Surname": "LOYTEST"
    },
    "Telephone": [
     {
      "@type": "Telephone",
      "countryAccessCode": "1",
      "areaCityCode": "909",
      "phoneNumber": "2124561",
      "extension": "123",
      "id": "1",
      "cityCode": "DEN",
      "role": "Home"
     }
    ],
    "TravelDocument": [
     {
      "@type": "TravelDocumentDetail",
      "docNumber": "88789888",
      "docType": "Passport",
      "issueDate": "2019-07-06",
      "expireDate": "2023-12-07",
      "issueCountry": "USA",
      "birthDate": "1997-12-20",
      "birthPlace": "USA",
      "Gender": "Male",
      "PersonName": {
       "@type": "PersonNameDetail",
       "Given": "JORDAN",
       "Surname": "LOYTEST"
      },
      "IssuedForGeoPoliticalArea": {
       "value": "USA"
      }
     }
    ],
    "Email": [
     {
      "value": "sgd@webjet.com"
     }
    ],
    "CustomerLoyalty": [
     {
      "value": "1295036",
      "supplier": "AA"
     }
    ]
   },
   {
    "@type": "Traveler",
    "PersonName": {
     "@type": "PersonNameDetail",
     "Given": "JORDAN",
     "Surname": "LOYTEST"
    },
    "Telephone": [
     {
      "@type": "Telephone",
      "countryAccessCode": "1",
      "areaCityCode": "909",
      "phoneNumber": "2124561",
      "extension": "123",
      "id": "1",
      "cityCode": "DEN",
      "role": "Home"
     }
    ],
    "TravelDocument": [
     {
      "@type": "TravelDocumentDetail",
      "docNumber": "V127",
      "docType": "Visa",
      "issueDate": "2019-07-04",
      "expireDate": "2021-12-05",
      "issueCountry": "LONDON",
      "birthDate": "1982-01-24",
      "birthPlace": "PARIS",
      "IssuedForGeoPoliticalArea": {
       "value": "USA"
      },
      "Address": {
       "@type": "Address",
       "role": "Destination",
       "Street": "Travers Street",
       "City": "Claremont",
       "StateProv": {
        "name": "Texas",
        "value": "CA"
       },
       "Country": {
        "value": "US"
       },
       "PostalCode": "917113323"
      }
     }
    ],
    "Email": [
     {
      "value": "carlson.tang@webjet.com.au"
     }
    ],
    "CustomerLoyalty": [
     {
      "value": "1900007921",
      "supplier": "AA"
     }
    ]
   }
  ]
 }
}
```

### Block 2

```
{
    "Traveler": {
        "birthDate": "2024-08-20",
        "id": "trav_1",
        "passengerTypeCode": "INF",
        "PersonName": {
            "@type": "PersonNameDetail",
            "Given": "TestFirstInf",
            "Middle": "",
            "Surname": "TestLastInf",
            "Suffix": "Jr"
        },
        "Telephone": [
            {
                "@type": "Telephone",
                "countryAccessCode": "1",
                "areaCityCode": "305",
                "phoneNumber": "8675309",
                "id": "telephone_1",
                "role": "Home"
            }
        ],
        "TravelDocument": [
            {
                "@type": "TravelDocument",
                "docNumber": "H294F6",
                "docType": "Passport",
                "expireDate": "{{passportExpiration}}",
                "issueCountry": "US",
                "birthDate": "{{infantDateOfBirth}}",
                "Nationality": "US",
                "Gender": "Female",
                "PersonName": {
                    "@type": "PersonName",
                    "Given": "TestFirstInf",
                    "Surname": "TestLastInf"
                }
            }
        ]
    }
}
```

### Block 3

```
{
  "Traveler": {
    "@type": "Traveler",
    "birthDate": "1999-02-22",
    "gender": "Male",
    "passengerTypeCode": "ADT",
    "PersonName": {
      "@type": "PersonNameDetail",
      "Prefix": "Mr",
      "Given": "Px ADTOne",
      "Middle": "MdNm",
      "Surname": "SrNmOne"
    },
    "Telephone": [
      {
        "@type": "Telephone",
        "countryAccessCode": "1",
        "areaCityCode": "909",
        "phoneNumber": "212456121",
        "extension": "1243",
        "id": "4",
        "cityCode": "ORD",
        "role": "Office"
      }
    ],
    "Email": [
      {
        "value": "ADTTravelerOneOne@gmail.com"
      }
    ],
    "CustomerLoyalty": [
      {
        "supplier": "QF",
        "value": "1234"
      }
    ],
    "TravelDocument": [
      {
        "@type": "TravelDocumentDetail",
        "docNumber": "245968",
        "docType": "Passport",
        "issueDate": "2020-12-22",
        "expireDate": "2027-02-22",
        "issueCountry": "IND",
        "birthDate": "1999-02-22",
        "Nationality": "IN",
        "Gender": "Male",
        "PersonName": {
          "@type": "PersonName",
          "Given": "Px One",
          "Middle": "MdNmOne",
          "Surname": "SrNmOne"
        },
        "IssuedForGeoPoliticalArea": {
          "value": "IN"
        }
      }
    ]
  }
}
```

### Block 4

```
{
 "Traveler": {
  "@type": "Traveler",
  "birthDate": "1999-02-22",
  "gender": "Male",
  "passengerTypeCode": "ADT",
  "PersonName": {
   "@type": "PersonNameDetail",
   "Prefix": "Mr",
   "Given": "Px ADTOne",
   "Middle": "MdNm",
   "Surname": "SrNmOne",
   "Suffix": "ADT"
  },
  "Comments": {
   "@type": "Comments",
   "Comment": [
    {
     "id": "comment_1",
     "value": "ID-12345671"
    }
   ]
  }
 }
						}
```

### Block 5

```
{
 "TravelerResponse": {
  "Traveler": {
   "@type": "TravelerIdentifier",
   "Identifier": {
    "value": "1e0940e3-d9cb-4384-8824-4f1c160e7deb"
   }
  }
 }
}
```

