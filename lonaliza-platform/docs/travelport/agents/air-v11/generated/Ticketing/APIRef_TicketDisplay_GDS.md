# Ticket Display (GDS, Single Ticket) API&#160;Reference

## Source

- **Local HTML:** `docs/travelport/travelport api guide/travelport-airapi json/support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/Ticketing/APIRef_TicketDisplay_GDS.html` (UTF-8 mirror)
- **Official base:** `https://support.travelport.com/webhelp/JSONAPIs/Airv11/Content/Air11/` + same relative path

## Plaintext extract (lossy)

Ticket Display (GDS, Single Ticket) API&#160;Reference Skip To Main Content Account Settings Logout placeholder Account Settings Logout Filter: All Files Submit Search Filter: All Files Submit Search Ticket Display (GDS, Single Ticket) API&#160;Reference Request Response Example request Example response Get ticket/tickets/ {ticketID} Send the ticket number in {ticketID} . Base path: Pre-production https://api.pp.travelport.net/11/air/ Production https://api.travelport.net/11/air/ Related Content: Ticketing Guide GDS only. To retrieve an NDC&#160;ticket use the Ticket Retrieve API . This API duplicates functionality available in the more recently released Ticket Retrieve API , which for GDS can retrieve a single or multiple tickets. The Ticket Display request returns details for a single ticket for a GDS itinerary. The JSON Air APIs provide the following APIs to retrieve bookings and tickets: To retrieve all booking details, use Reservation Retrieve . Returns all booking, payment, and ticketing information currently on a booking, To retrieve a list of all ticket numbers on a booking, use Ticket List . To retrieve details for all tickets associated with a booking (GDS&#160;only), or for a single ticket for NDC, use Ticket Retrieve . To return a list of documents on a booking, such as tickets, invoices, MCOs, and EMDs, use Document List . To return histories of up to six documents on a booking, such as tickets, invoices, MCOs, and EMDs, use Document History . Request As part of the request requirements, also see Authentication and Common Air API Headers . Ticket Display requires a GET request with the ticket number to the endpoint above. There are no query parameters or message payload. Response The response returns the reservation locator, traveler name, form of payment details, flight departure and arrival information, a price breakdown by PTC, and agency information. Show Response Body Table Object Description TicketListResponse Top level object for response. Includes the TicketID object. TicketID Contains all ticketing details. May include the following: settlementAuthorizationCode : Settlement authorization code from ticket issuance. This number is returned from the carrier and is the payment settlement for the final status code. numberOfTicketsIssued : The number of tickets issued. Multiple ticket numbers are issued for itineraries with more than four segments, or for more than one passenger. Depending on the data available for the ticket, may include the Identifier, PersonName, ReservationLocator, FormOfPayment, TicketSegment, TicketPrice, PassengerTypeCode, ValidatingCarrier, PricingType, AgencyInfo, Restrictions, and FlightProduct objects. Identifier Contains the ticket number in the value attribute. PersonName Traveler name. Key value pairs: Given : Traveler given name. Surname : Traveler surname. ReservationLocator Reservation locator. Key value pairs: supplierCode :&#160;Supplier ID for the supplier issuing the ticket. value :&#160;Reservation locator code. FormOfPayment Top level object for the type of form of payment. Includes&#160;PaymentCard if payment was made by credit card. PaymentCard If payment was made by credit card, card details. Key value pairs: expireDate : Card expiration date. approvalCode : Approval code for the transaction. CardCode : Card code. Contains CardNumber object. CardNumber Returned if payment was made by credit card. Key value pairs: encryptedValue : Card number in encrypted format. TicketSegment Flight details for the flight or connecting flights making up one leg of the itinerary. Multiple instances are returned for itineraries with more than one leg, such as round-trip or multi-city. Key value pairs: sequence : Identifies the order of this leg within the itinerary. connectionInd : Returned if true to indicate the leg includes a connecting flight. ClassOfService : Class of service code. FareBasisCode :&#160;Fare basis code for the flight. Status : Ticket status. Possible values vary with any actions that may have been taken with the ticket and may include Open for Use (ticket can be used), Voided , Refunded , etc. Carrier : Airline carrier code. Number : Flight number. Includes Departure, Arrival, and TicketBaggage objects. Departure Key value pairs: location :&#160;Airport code of departure. date : Date of departure. time : Time of departure. Arrival Key value pairs: location :&#160;Airport code of arrival. date : Date of arrival. time : Time of arrival. TicketBaggage Any baggage that is part of the ticket. Key value pairs: quantity : Number. Returned if baggage is sold or allowed by piece. soldByPieceInd : Boolean. Returned only if true. Indicates baggage allowance is by piece, such as one, two, or three pieces. soldByWeightInd : Boolean. Returned only if true. Indicates the baggage is allowed by weight, either kilograms or pounds, such as 50 pounds or 35 kilograms. If returned, TicketBaggage also includes the Measurement objects. Measurement Returned in TicketBaggage as applicable and available when baggage is allowed or sold by weight or other measurement. Key value pairs: measurementType: Type of measurement specified, such as weight, height, width, etc. unit: Unit in which measurement is specified, such as Kilograms, Inches, Centimeters, etc. value: The number of units allowed for this measurement type. TicketPrice Ticket price details. Key value pairs: fareCalculation :&#160;When available, FareCalculation returns the fare calculation ladder for all public and private fare types filed by an agency or an airline. Returned as a string with unlimited bytes. GDS only, not supported for NDC. fareBreakdown : Text string returned by the carrier providing information such as listed charges and rate of exchanges. Includes CurrencyCode, Base, Taxes, and Total objects. CurrencyCode Indicates in the value attribute the code for the currency in which the amounts in TicketPrice are returned. Base The amount of the base fare. Taxes Top level object for individual Tax objects for each separate tax in the fare. Tax Each instance of Tax provides details on a specific tax: currencyCode : The currency code of the tax. taxCode : The country code imposing the tax. value :&#160;The amount of the tax, in the currency specified in Amount/currencyCode. Total Total of all taxes plus base fare. PassengerTypeCode PTC for the passenger on this ticket. ValidatingCarrier The&#160;IATA code for the validating carrier. PricingType This value is usually Auto Priced but could be Manual if back-end processing was required to issue the ticket. Restrictions Any fare restriction information returned by the carrier. AgencyInfo Details about the ticketing agency. Key value pairs: ticketedDate : Date the itinerary was ticketed in YYYY-DD-MM format. name : Ticketing agency name. ticketingPCC : Agency PCC. code : Agency code. ticketingCountry : Agency country. ticketingCity : Agency city. FlightProduct Class of service and fare code details for each flight in the itinerary. Key value pairs: segmentSequence : Identifies this flight in the sequence, starting with 1 for the first flight in the sequence. Matches the sequence numbers in FlightSegment/sequence. Flight Segment contains the flight details such as departure, arrival, and time. classOfService : The booked class of service. fareBasisCode : The fare basis code, also called the ticket designator. Example Request There is no message payload. Example Response For additional examples, download the developer toolkits and see Using Postman and Developer Toolkits . Show Example Ticket Display response { "TicketListResponse": { "TicketID": [ { "@type": "TicketSummary", "numberOfTicketsIssued": 1, "Identifier": { "value": "0169904503844" }, "PersonName": { "@type": "PersonName", "Given": "TESTFIRST", "Surname": "TESTLAST" }, "ReservationLocator": { "supplierCode": "1G", "value": "1TRBJ4" }, "FormOfPayment": [ { "value": "Cash" } ], "TicketSegment": [ { "@type": "TicketSegment", "sequence": 1, "connectionInd": true, "ClassOfService": "U", "FareBasisCode": "UAA0OKEM", "Status": "OpenForUse", "Carrier": "UA", "Number": "2240", "Departure": { "@type": "Departure", "location": "ONT", "date": "2022-08-29", "time": "06:00:00" }, "Arrival": { "@type": "Arrival", "location": "SFO" }, "TicketBaggage": { "@type": "TicketBaggage", "quantity": 0 } }, { "@type": "TicketSegment", "sequence": 2, "ClassOfService": "U", "FareBasisCode": "UAA0OKEM", "Status": "OpenForUse", "Carrier": "UA", "Number": "520", "Departure": { "@type": "Departure", "location": "SFO", "date": "2022-08-29", "time": "09:00:00" }, "Arrival": { "@type": "Arrival", "location": "JFK" }, "TicketBaggage": { "@type": "TicketBaggage", "quantity": 3 "soldByPieceInd": true } } ], "TicketPrice": { "@type": "TicketPrice", "fareCalculation": "G", "fareBreakdown": "ONT UA X/SFO UA NYC 544.19 USD544.19END ZPONTSFO", "CurrencyCode": { "decimalPlace": 2, "value": "AUD" }, "Base": 756, "Taxes": { "@type": "TaxesDetail", "Tax": [ { "currencyCode": "AUD", "taxCode": "AY", "decimalPlace": 2, "value": 7.8 }, { "currencyCode": "AUD", "taxCode": "US", "decimalPlace": 2, "value": 56.7 }, { "currencyCode": "AUD", "taxCode": "ZP", "decimalPlace": 2, "value": 12.6 }, { "currencyCode": "AUD", "taxCode": "XF", "decimalPlace": 2, "value": 12.6 } ] }, "Total": 845.7, "FiledAmount": { "currencyCode": "USD", "decimalPlace": 2, "value": 544.19 } }, "PassengerTypeCode": "ADT", "ValidatingCarrier": "016", "PricingType": "Auto Priced", "Restrictions": [ "REFUNDABLE" ], "AgencyInfo": { "ticketedDate": "2022-07-30", "name": "TEST CUSTOMER", "ticketingPCC": "TEST", "code": "12345678", "ticketingCountry": "AU", "ticketingCity": "SYD" } } ] } } The following example is for a ticket that has been exchanged; it returns details of the previously exchanged ticket in the PreviousIssue object. Show Example for exchanged ticket { "TicketListResponse": { "@type": "TicketListResponse", "TicketID": [ { "@type": "TicketSummary", "numberOfTicketsIssued": 1, "Identifier": { "value": "0759904836638" }, "PersonName": { "@type": "PersonName", "Given": "LATHA", "Surname": "DEVI" }, "ReservationLocator": { "supplierCode": "1G", "value": "5DGV5P" }, "FormOfPayment": [ { "value": "Cash" } ], "TicketSegment": [ { "@type": "TicketSegment", "sequence": 1, "ClassOfService": "Y", "FareBasisCode": "YDNNEOM2/TNETML", "Status": "OpenForUse", "Carrier": "IB", "Number": "3402", "Departure": { "@type": "Departure", "location": "MAD", "date": "2023-10-24", "time": "07:30:00" }, "Arrival": { "@type": "Arrival", "location": "ORY" }, "TicketBaggage": { "@type": "TicketBaggage", "soldByWeightInd": true, "Measurement": [ { "measurementType": "Weight", "unit": "Kilograms", "value": 30 } ] } } ], "TicketPrice": { "@type": "TicketPrice", "fareCalculation": "A", "fareBreakdown": "[MAD IB PAR Q16.35 M/BT END ROE0.91728", "bTFareInd": true, "CurrencyCode": { "value": "EUR" }, "Base": 0, "Taxes": { "@type": "TaxesDetail", "Tax": [ { "currencyCode": "EUR", "taxCode": "XT", "value": 18.38 }, { "currencyCode": "EUR", "taxCode": "JD", "value": 14.48 }, { "currencyCode": "EUR", "taxCode": "OG", "value": 0.63 }, { "currencyCode": "EUR", "taxCode": "QV", "value": 3.27 } ] }, "Total": 516.38, "PaidTaxes": { "@type": "PaidTaxesDetail", "Tax": [ { "taxCode": "JD", "value": 14.48 }, { "taxCode": "OG", "value": 0.63 }, { "taxCode": "QV", "value": 3.27 } ] } }, "PassengerTypeCode": "ADT", "ValidatingCarrier": "075", "Restrictions": [ "[015118.REF AND CHGS RESTRI/RESTRICTIONS MAY APPLY]" ], "AgencyInfo": { "ticketedDate": "2023-09-19", "name": "GALILEO SPAIN HELPDESK", "ticketingPCC": "DU7", "code": "78299992", "ticketingCountry": "ES", "ticketingCity": "MAD" }, "PreviousIssue": [ { "issuingCity": "PAR", "issueDate": "2023-09-19", "agencyCodeIATA": "20299926", "documentType": "Ticket", "value": "0759904650787" } ] } ] } }

## Literal `<pre>` excerpts from HTML

### Block 1

```
{
 "TicketListResponse": {
  "TicketID": [
   {
    "@type": "TicketSummary",
    "numberOfTicketsIssued": 1,
    "Identifier": {
     "value": "0169904503844"
    },
    "PersonName": {
     "@type": "PersonName",
     "Given": "TESTFIRST",
     "Surname": "TESTLAST"
    },
    "ReservationLocator": {
     "supplierCode": "1G",
     "value": "1TRBJ4"
    },
    "FormOfPayment": [
     {
      "value": "Cash"
     }
    ],
    "TicketSegment": [
     {
      "@type": "TicketSegment",
      "sequence": 1,
      "connectionInd": true,
      "ClassOfService": "U",
      "FareBasisCode": "UAA0OKEM",
      "Status": "OpenForUse",
      "Carrier": "UA",
      "Number": "2240",
      "Departure": {
       "@type": "Departure",
       "location": "ONT",
       "date": "2022-08-29",
       "time": "06:00:00"
      },
      "Arrival": {
       "@type": "Arrival",
       "location": "SFO"
      },
      "TicketBaggage": {
       "@type": "TicketBaggage",
       "quantity": 0
      }
     },
     {
      "@type": "TicketSegment",
      "sequence": 2,
      "ClassOfService": "U",
      "FareBasisCode": "UAA0OKEM",
      "Status": "OpenForUse",
      "Carrier": "UA",
      "Number": "520",
      "Departure": {
       "@type": "Departure",
       "location": "SFO",
       "date": "2022-08-29",
       "time": "09:00:00"
      },
      "Arrival": {
       "@type": "Arrival",
       "location": "JFK"
      },
      "TicketBaggage": {
       "@type": "TicketBaggage",
       "quantity": 3
	"soldByPieceInd": true
      }
     }
    ],
    "TicketPrice": {
     "@type": "TicketPrice",
     "fareCalculation": "G",
     "fareBreakdown": "ONT UA X/SFO UA NYC 544.19 USD544.19END ZPONTSFO",
     "CurrencyCode": {
      "decimalPlace": 2,
      "value": "AUD"
     },
     "Base": 756,
     "Taxes": {
      "@type": "TaxesDetail",
      "Tax": [
       {
        "currencyCode": "AUD",
        "taxCode": "AY",
        "decimalPlace": 2,
        "value": 7.8
       },
       {
        "currencyCode": "AUD",
        "taxCode": "US",
        "decimalPlace": 2,
        "value": 56.7
       },
       {
        "currencyCode": "AUD",
        "taxCode": "ZP",
        "decimalPlace": 2,
        "value": 12.6
       },
       {
        "currencyCode": "AUD",
        "taxCode": "XF",
        "decimalPlace": 2,
        "value": 12.6
       }
      ]
     },
     "Total": 845.7,
     "FiledAmount": {
      "currencyCode": "USD",
      "decimalPlace": 2,
      "value": 544.19
     }
    },
    "PassengerTypeCode": "ADT",
    "ValidatingCarrier": "016",
    "PricingType": "Auto Priced",
    "Restrictions": [
     "REFUNDABLE"
    ],
    "AgencyInfo": {
     "ticketedDate": "2022-07-30",
     "name": "TEST CUSTOMER",
     "ticketingPCC": "TEST",
     "code": "12345678",
     "ticketingCountry": "AU",
     "ticketingCity": "SYD"
    }
   }
  ]
 }
}
```

### Block 2

```
{
 "TicketListResponse": {
  "@type": "TicketListResponse",
  "TicketID": [
   {
    "@type": "TicketSummary",
    "numberOfTicketsIssued": 1,
    "Identifier": {
     "value": "0759904836638"
    },
    "PersonName": {
     "@type": "PersonName",
     "Given": "LATHA",
     "Surname": "DEVI"
    },
    "ReservationLocator": {
     "supplierCode": "1G",
     "value": "5DGV5P"
    },
    "FormOfPayment": [
     {
      "value": "Cash"
     }
    ],
    "TicketSegment": [
     {
      "@type": "TicketSegment",
      "sequence": 1,
      "ClassOfService": "Y",
      "FareBasisCode": "YDNNEOM2/TNETML",
      "Status": "OpenForUse",
      "Carrier": "IB",
      "Number": "3402",
      "Departure": {
       "@type": "Departure",
       "location": "MAD",
       "date": "2023-10-24",
       "time": "07:30:00"
      },
      "Arrival": {
       "@type": "Arrival",
       "location": "ORY"
      },
      "TicketBaggage": {
        "@type": "TicketBaggage",
          "soldByWeightInd": true,
          "Measurement": [
              {
                  "measurementType": "Weight",
                  "unit": "Kilograms",
                  "value": 30
              }
          ]
      }
     }
    ],
    "TicketPrice": {
     "@type": "TicketPrice",
     "fareCalculation": "A",
     "fareBreakdown": "[MAD IB PAR Q16.35 M/BT END ROE0.91728",
     "bTFareInd": true,
     "CurrencyCode": {
      "value": "EUR"
     },
     "Base": 0,
     "Taxes": {
      "@type": "TaxesDetail",
      "Tax": [
       {
        "currencyCode": "EUR",
        "taxCode": "XT",
        "value": 18.38
       },
       {
        "currencyCode": "EUR",
        "taxCode": "JD",
        "value": 14.48
       },
       {
        "currencyCode": "EUR",
        "taxCode": "OG",
        "value": 0.63
       },
       {
        "currencyCode": "EUR",
        "taxCode": "QV",
        "value": 3.27
       }
      ]
     },
     "Total": 516.38,
     "PaidTaxes": {
      "@type": "PaidTaxesDetail",
      "Tax": [
       {
        "taxCode": "JD",
        "value": 14.48
       },
       {
        "taxCode": "OG",
        "value": 0.63
       },
       {
        "taxCode": "QV",
        "value": 3.27
       }
      ]
     }
    },
    "PassengerTypeCode": "ADT",
    "ValidatingCarrier": "075",
    "Restrictions": [
     "[015118.REF AND CHGS RESTRI/RESTRICTIONS MAY APPLY]"
    ],
    "AgencyInfo": {
     "ticketedDate": "2023-09-19",
     "name": "GALILEO SPAIN HELPDESK",
     "ticketingPCC": "DU7",
     "code": "78299992",
     "ticketingCountry": "ES",
     "ticketingCity": "MAD"
    },
    "PreviousIssue": [
     {
      "issuingCity": "PAR",
      "issueDate": "2023-09-19",
      "agencyCodeIATA": "20299926",
      "documentType": "Ticket",
      "value": "0759904650787"
     }
    ]
   }
  ]
 }
}
```

